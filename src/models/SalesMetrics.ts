import mongoose, { Document, Schema } from 'mongoose';
import { SalesMetrics } from '@/types/metrics.types';

export interface SalesMetricsDocument extends Document {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  averageTicket: number;
  conversionRate: number;
  averageTime: number;
  salesByDay: Array<{
    date: Date;
    count: number;
    revenue: number;
  }>;
  salesByPaymentMethod: Array<{
    method: 'cash' | 'financing' | 'trade-in';
    count: number;
    revenue: number;
  }>;
  topSellers: Array<{
    sellerId: string;
    sellerName: string;
    salesCount: number;
    revenue: number;
    commission: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SalesMetricsSchema = new Schema<SalesMetricsDocument>({
  period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    index: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date,
    required: true,
    index: true
  },
  totalSales: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalRevenue: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalCommission: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  averageTicket: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  conversionRate: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100
  },
  averageTime: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  salesByDay: [{
    date: {
      type: Date,
      required: true
    },
    count: {
      type: Number,
      required: true,
      min: 0
    },
    revenue: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  salesByPaymentMethod: [{
    method: {
      type: String,
      required: true,
      enum: ['cash', 'financing', 'trade-in']
    },
    count: {
      type: Number,
      required: true,
      min: 0
    },
    revenue: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  topSellers: [{
    sellerId: {
      type: String,
      required: true,
      ref: 'User'
    },
    sellerName: {
      type: String,
      required: true
    },
    salesCount: {
      type: Number,
      required: true,
      min: 0
    },
    revenue: {
      type: Number,
      required: true,
      min: 0
    },
    commission: {
      type: Number,
      required: true,
      min: 0
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compostos otimizados para queries de período
SalesMetricsSchema.index({ period: 1, startDate: 1, endDate: 1 });
SalesMetricsSchema.index({ startDate: 1, endDate: 1 });
SalesMetricsSchema.index({ period: 1, startDate: -1 });
SalesMetricsSchema.index({ createdAt: -1 });

// Índice único para evitar duplicação de métricas do mesmo período
SalesMetricsSchema.index({ period: 1, startDate: 1 }, { unique: true });

// Virtual para calcular ticket médio real
SalesMetricsSchema.virtual('calculatedAverageTicket').get(function() {
  return this.totalSales > 0 ? this.totalRevenue / this.totalSales : 0;
});

// Virtual para calcular margem de comissão
SalesMetricsSchema.virtual('commissionRate').get(function() {
  return this.totalRevenue > 0 ? (this.totalCommission / this.totalRevenue) * 100 : 0;
});

// Pre-save middleware para validar datas
SalesMetricsSchema.pre('save', function(next) {
  if (this.startDate > this.endDate) {
    next(new Error('startDate deve ser anterior a endDate'));
  }
  next();
});

export default mongoose.model<SalesMetricsDocument>('SalesMetrics', SalesMetricsSchema);
