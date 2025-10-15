export interface SalesMetrics {
  _id?: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  averageTicket: number;
  conversionRate: number;
  averageTime: number; // em horas
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

export interface MetricsQuery {
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  sellerId?: string;
}

export interface DailyMetrics {
  date: Date;
  totalSales: number;
  totalRevenue: number;
  averageTicket: number;
  conversionRate: number;
}

export interface SellerMetrics {
  sellerId: string;
  sellerName: string;
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  averageTicket: number;
  conversionRate: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface MetricsAggregation {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  averageTicket: number;
  conversionRate: number;
  averageTime: number;
  periodComparison?: {
    salesGrowth: number; // %
    revenueGrowth: number; // %
    previousPeriod: {
      totalSales: number;
      totalRevenue: number;
    };
  };
}
