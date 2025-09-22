import mongoose, { Document, Schema } from 'mongoose';
import { Sale } from '@/types/sales.types';

export interface SaleDocument extends Document {
  vehicleId: string;
  vehicle: {
    brand: string;
    vehicleModel: string;
    year: number;
    price: number;
  };
  buyer: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
  };
  salePrice: number;
  commission: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'financing' | 'trade-in';
  notes?: string;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<SaleDocument>({
  vehicleId: {
    type: String,
    required: true,
    ref: 'Vehicle',
    index: true
  },
    vehicle: {
      brand: {
        type: String,
        required: true
      },
      vehicleModel: {
        type: String,
        required: true
      },
    year: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  buyer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    document: {
      type: String,
      required: true,
      trim: true
    }
  },
  seller: {
    id: {
      type: String,
      required: true,
      ref: 'User',
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0
  },
  commission: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'financing', 'trade-in']
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  saleDate: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
SaleSchema.index({ vehicleId: 1 });
SaleSchema.index({ 'seller.id': 1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ saleDate: -1 });
SaleSchema.index({ createdAt: -1 });

// Virtual for profit margin
SaleSchema.virtual('profitMargin').get(function() {
  return this.salePrice - this.vehicle.price;
});

// Pre-save middleware to calculate commission
SaleSchema.pre('save', function(next) {
  if (this.isModified('salePrice') && !this.commission) {
    // Commission is 5% of sale price
    this.commission = this.salePrice * 0.05;
  }
  next();
});

export default mongoose.model<SaleDocument>('Sale', SaleSchema);
