export interface Sale {
  _id?: string;
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

export interface CreateSaleRequest {
  vehicleId: string;
  buyer: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
  salePrice: number;
  paymentMethod: 'cash' | 'financing' | 'trade-in';
  notes?: string;
}

export interface UpdateSaleRequest {
  status?: 'pending' | 'completed' | 'cancelled';
  salePrice?: number;
  notes?: string;
}

export interface SalesFilters {
  sellerId?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  averageSalePrice: number;
  salesByMonth: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
  topSellers: Array<{
    sellerId: string;
    sellerName: string;
    sales: number;
    revenue: number;
  }>;
  salesByPaymentMethod: Array<{
    method: string;
    count: number;
    revenue: number;
  }>;
}
