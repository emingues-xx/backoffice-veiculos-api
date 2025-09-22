import { Request, Response } from 'express';
import Sale from '@/models/Sale';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';
import { AuthRequest } from '@/middleware/auth';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { ApiResponse, PaginationQuery } from '@/types/api.types';
import { SalesFilters } from '@/types/sales.types';

export const createSale = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { vehicleId, buyer, salePrice, paymentMethod, notes } = req.body;

  // Verify vehicle exists and is available
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw createError('Vehicle not found', 404);
  }

  if (vehicle.status === 'sold') {
    throw createError('Vehicle is already sold', 400);
  }

  // Get seller information
  const seller = await User.findById(req.user?.id);
  if (!seller) {
    throw createError('Seller not found', 404);
  }

  // Create sale record
  const sale = new Sale({
    vehicleId,
    vehicle: {
      brand: vehicle.brand,
      vehicleModel: vehicle.vehicleModel,
      year: vehicle.year,
      price: vehicle.price
    },
    buyer,
    seller: {
      id: (seller._id as any).toString(),
      name: seller.name,
      email: seller.email
    },
    salePrice,
    paymentMethod,
    notes
  });

  await sale.save();

  // Update vehicle status to sold
  vehicle.status = 'sold';
  await vehicle.save();

  res.status(201).json({
    success: true,
    data: sale,
    message: 'Sale created successfully'
  });
});

export const getSales = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'saleDate',
    sortOrder = 'desc',
    ...filters
  } = req.query as SalesFilters & PaginationQuery;

  const query: any = {};

  // Apply filters
  if (filters.sellerId) query['seller.id'] = filters.sellerId;
  if (filters.status) query.status = filters.status;
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
  if (filters.dateFrom || filters.dateTo) {
    query.saleDate = {};
    if (filters.dateFrom) query.saleDate.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.saleDate.$lte = new Date(filters.dateTo);
  }

  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);

  const [sales, total] = await Promise.all([
    Sale.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Sale.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: sales,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

export const getSaleById = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const sale = await Sale.findById(req.params.id);
  
  if (!sale) {
    throw createError('Sale not found', 404);
  }

  res.json({
    success: true,
    data: sale
  });
});

export const updateSale = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const sale = await Sale.findById(req.params.id);
  
  if (!sale) {
    throw createError('Sale not found', 404);
  }

  // Check if user has permission to update this sale
  if (req.user?.role !== 'admin' && sale.seller.id !== req.user?.id) {
    throw createError('Not authorized to update this sale', 403);
  }

  const updatedSale = await Sale.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedSale,
    message: 'Sale updated successfully'
  });
});

export const deleteSale = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const sale = await Sale.findById(req.params.id);
  
  if (!sale) {
    throw createError('Sale not found', 404);
  }

  // Only admins can delete sales
  if (req.user?.role !== 'admin') {
    throw createError('Not authorized to delete sales', 403);
  }

  // If sale is completed, update vehicle status back to active
  if (sale.status === 'completed') {
    await Vehicle.findByIdAndUpdate(sale.vehicleId, { status: 'active' });
  }

  await Sale.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Sale deleted successfully'
  });
});

export const getSalesStats = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const [
    totalSales,
    totalRevenue,
    totalCommission,
    averageSalePrice,
    salesByMonth,
    topSellers,
    salesByPaymentMethod
  ] = await Promise.all([
    Sale.countDocuments({ status: 'completed' }),
    Sale.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$salePrice' } } }
    ]),
    Sale.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$commission' } } }
    ]),
    Sale.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, average: { $avg: '$salePrice' } } }
    ]),
    Sale.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' }
          },
          sales: { $sum: 1 },
          revenue: { $sum: '$salePrice' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]),
    Sale.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$seller.id',
          sellerName: { $first: '$seller.name' },
          sales: { $sum: 1 },
          revenue: { $sum: '$salePrice' }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: 10 }
    ]),
    Sale.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$salePrice' }
        }
      }
    ])
  ]);

  const stats = {
    totalSales,
    totalRevenue: totalRevenue[0]?.total || 0,
    totalCommission: totalCommission[0]?.total || 0,
    averageSalePrice: Math.round(averageSalePrice[0]?.average || 0),
    salesByMonth: salesByMonth.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      sales: item.sales,
      revenue: item.revenue
    })),
    topSellers: topSellers.map(item => ({
      sellerId: item._id,
      sellerName: item.sellerName,
      sales: item.sales,
      revenue: item.revenue
    })),
    salesByPaymentMethod: salesByPaymentMethod.map(item => ({
      method: item._id,
      count: item.count,
      revenue: item.revenue
    }))
  };

  res.json({
    success: true,
    data: stats
  });
});

export const getSellerSales = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { page = 1, limit = 10, sortBy = 'saleDate', sortOrder = 'desc' } = req.query as PaginationQuery;

  const query = { 'seller.id': req.user?.id };

  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);

  const [sales, total] = await Promise.all([
    Sale.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Sale.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: sales,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});
