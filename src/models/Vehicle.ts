import mongoose, { Document, Schema } from 'mongoose';
import { Vehicle } from '@/types/vehicle.types';

export interface VehicleDocument extends Document {
  brand: string;
  vehicleModel: string;
  year: number;
  mileage: number;
  price: number;
  fuelType: 'gasoline' | 'ethanol' | 'diesel' | 'electric' | 'hybrid';
  transmission: 'manual' | 'automatic';
  color: string;
  doors: number;
  category: 'car' | 'motorcycle' | 'truck' | 'van';
  condition: 'new' | 'used';
  description: string;
  images: string[];
  features: string[];
  location: {
    city: string;
    state: string;
    zipCode: string;
  };
  seller: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  status: 'active' | 'sold' | 'inactive' | 'pending';
  isFeatured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<VehicleDocument>({
  brand: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  vehicleModel: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['gasoline', 'ethanol', 'diesel', 'electric', 'hybrid']
  },
  transmission: {
    type: String,
    required: true,
    enum: ['manual', 'automatic']
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  doors: {
    type: Number,
    required: true,
    min: 2,
    max: 6
  },
  category: {
    type: String,
    required: true,
    enum: ['car', 'motorcycle', 'truck', 'van']
  },
  condition: {
    type: String,
    required: true,
    enum: ['new', 'used']
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  images: [{
    type: String,
    required: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  location: {
    city: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    }
  },
  seller: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
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
  status: {
    type: String,
    required: true,
    enum: ['active', 'sold', 'inactive', 'pending'],
    default: 'active',
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
VehicleSchema.index({ brand: 1, vehicleModel: 1 });
VehicleSchema.index({ price: 1 });
VehicleSchema.index({ year: 1 });
VehicleSchema.index({ 'location.city': 1, 'location.state': 1 });
VehicleSchema.index({ status: 1, isFeatured: 1 });
VehicleSchema.index({ createdAt: -1 });

// Virtual for full location
VehicleSchema.virtual('fullLocation').get(function() {
  return `${this.location.city}, ${this.location.state}`;
});

// Virtual for age
VehicleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Pre-save middleware
VehicleSchema.pre('save', function(next) {
  if (this.isModified('price') && this.price < 0) {
    return next(new Error('Price cannot be negative'));
  }
  next();
});

export default mongoose.model<VehicleDocument>('Vehicle', VehicleSchema);
