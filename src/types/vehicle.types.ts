export interface Vehicle {
  _id?: string;
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

export interface CreateVehicleRequest {
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
  isFeatured?: boolean;
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  status?: 'active' | 'sold' | 'inactive' | 'pending';
}

export interface VehicleFilters {
  brand?: string;
  vehicleModel?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  fuelType?: string;
  transmission?: string;
  category?: string;
  condition?: string;
  city?: string;
  state?: string;
  status?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VehicleStats {
  totalVehicles: number;
  activeVehicles: number;
  soldVehicles: number;
  inactiveVehicles: number;
  totalViews: number;
  averagePrice: number;
  topBrands: Array<{
    brand: string;
    count: number;
  }>;
  topCities: Array<{
    city: string;
    count: number;
  }>;
}
