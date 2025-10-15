import mongoose, { Document, Schema } from 'mongoose';

export interface IJobExecution extends Document {
  jobName: string;
  jobType: 'daily_metrics' | 'health_check' | 'data_validation' | 'cleanup' | 'custom';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number; // em milissegundos
  heartbeat?: Date;
  lastHeartbeat?: Date;
  progress?: number; // 0-100
  metadata?: {
    [key: string]: any;
  };
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
  result?: {
    [key: string]: any;
  };
  retryCount: number;
  maxRetries: number;
  nextExecution?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobExecutionSchema = new Schema<IJobExecution>({
  jobName: {
    type: String,
    required: true,
    index: true
  },
  jobType: {
    type: String,
    enum: ['daily_metrics', 'health_check', 'data_validation', 'cleanup', 'custom'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'timeout', 'cancelled'],
    required: true,
    default: 'pending',
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    index: true
  },
  duration: {
    type: Number,
    min: 0
  },
  heartbeat: {
    type: Date,
    index: true
  },
  lastHeartbeat: {
    type: Date,
    index: true
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  error: {
    message: String,
    stack: String,
    code: String
  },
  result: {
    type: Schema.Types.Mixed,
    default: {}
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: 0
  },
  nextExecution: {
    type: Date,
    index: true
  }
}, {
  timestamps: true,
  collection: 'job_executions'
});

// Índices compostos para consultas eficientes
JobExecutionSchema.index({ jobName: 1, startTime: -1 });
JobExecutionSchema.index({ status: 1, startTime: -1 });
JobExecutionSchema.index({ jobType: 1, status: 1 });
JobExecutionSchema.index({ heartbeat: 1 }, { expireAfterSeconds: 86400 }); // TTL de 24 horas para heartbeats

// Middleware para calcular duração automaticamente
JobExecutionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime) {
    this.duration = this.endTime.getTime() - this.startTime.getTime();
  }
  next();
});

// Métodos de instância
JobExecutionSchema.methods.updateHeartbeat = function(): void {
  this.heartbeat = new Date();
  this.lastHeartbeat = new Date();
  this.save().catch(console.error);
};

JobExecutionSchema.methods.updateProgress = function(progress: number): void {
  this.progress = Math.min(100, Math.max(0, progress));
  this.updateHeartbeat();
};

JobExecutionSchema.methods.complete = function(result?: any): void {
  this.status = 'completed';
  this.endTime = new Date();
  this.progress = 100;
  if (result) {
    this.result = result;
  }
};

JobExecutionSchema.methods.fail = function(error: Error | string): void {
  this.status = 'failed';
  this.endTime = new Date();
  
  if (typeof error === 'string') {
    this.error = { message: error };
  } else {
    this.error = {
      message: error.message,
      stack: error.stack,
      code: (error as any).code
    };
  }
};

JobExecutionSchema.methods.timeout = function(): void {
  this.status = 'timeout';
  this.endTime = new Date();
  this.error = {
    message: 'Job execution timeout',
    code: 'TIMEOUT'
  };
};

// Métodos estáticos
JobExecutionSchema.statics.findRunningJobs = function() {
  return this.find({ status: 'running' });
};

JobExecutionSchema.statics.findStuckJobs = function(timeoutMinutes: number = 30) {
  const timeoutDate = new Date(Date.now() - (timeoutMinutes * 60 * 1000));
  return this.find({
    status: 'running',
    $or: [
      { heartbeat: { $lt: timeoutDate } },
      { heartbeat: { $exists: false } }
    ]
  });
};

JobExecutionSchema.statics.getJobStatistics = function(jobName?: string, days: number = 30) {
  const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  const matchQuery: any = { startTime: { $gte: startDate } };
  
  if (jobName) {
    matchQuery.jobName = jobName;
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          jobName: '$jobName',
          status: '$status'
        },
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
        maxDuration: { $max: '$duration' },
        minDuration: { $min: '$duration' }
      }
    },
    {
      $group: {
        _id: '$_id.jobName',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            avgDuration: '$avgDuration',
            maxDuration: '$maxDuration',
            minDuration: '$minDuration'
          }
        }
      }
    }
  ]);
};

JobExecutionSchema.statics.getRecentExecutions = function(jobName?: string, limit: number = 50) {
  const query: any = {};
  if (jobName) {
    query.jobName = jobName;
  }

  return this.find(query)
    .sort({ startTime: -1 })
    .limit(limit)
    .select('-error.stack'); // Exclui stack trace para economizar espaço
};

export const JobExecution = mongoose.model<IJobExecution>('JobExecution', JobExecutionSchema);
