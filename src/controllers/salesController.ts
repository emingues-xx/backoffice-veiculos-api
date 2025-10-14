import { Response } from 'express';
import Sale from '@/models/Sale';
import Vehicle from '@/models/Vehicle';
import User from '@/models/User';
import { AuthRequest } from '@/middleware/auth';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types/api.types';

export const createSale = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  console.log('=== CREATE SALE ===');
  console.log('Body:', req.body);
  console.log('User:', req.user);
  
  const { vehicleId, buyer, salePrice, paymentMethod, notes, commission } = req.body;

  // Verify vehicle exists and is available
  console.log('Looking for vehicle:', vehicleId);
  const vehicle = await Vehicle.findById(vehicleId);
  console.log('Vehicle found:', vehicle);
  if (!vehicle) {
    throw createError('Vehicle not found', 404);
  }

  if (vehicle.status === 'sold') {
    throw createError('Vehicle is already sold', 400);
  }

  // Get seller information
  console.log('Looking for seller:', req.user?.id);
  const seller = await User.findById(req.user?.id);
  console.log('Seller found:', seller);
  if (!seller) {
    throw createError('Seller not found', 404);
  }

  // Create sale record
  console.log('Creating sale object...');
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
    commission: 0, // Will be calculated by the pre-save middleware
    paymentMethod,
    notes
  });

  console.log('Sale object created:', sale);
  console.log('Saving sale...');
  try {
    await sale.save();
    console.log('Sale saved successfully!');
  } catch (error) {
    console.error('Error saving sale:', error);
    throw error;
  }

  // Update vehicle status to sold
  vehicle.status = 'sold';
  await vehicle.save();

  res.status(201).json({
    success: true,
    data: sale,
    message: 'Sale created successfully'
  });
});

export const getSales = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const {
    sellerId,
    status,
    paymentMethod,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10,
    sortBy = 'saleDate',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter: any = {};
  
  if (sellerId) filter['seller.id'] = sellerId;
  if (status) filter.status = status;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  
  if (dateFrom || dateTo) {
    filter.saleDate = {};
    if (dateFrom) filter.saleDate.$gte = new Date(dateFrom as string);
    if (dateTo) filter.saleDate.$lte = new Date(dateTo as string);
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const [sales, total] = await Promise.all([
    Sale.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('vehicleId', 'brand vehicleModel year price images'),
    Sale.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: {
      sales,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    },
    message: 'Sales retrieved successfully'
  });
});

export const getSaleById = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { id } = req.params;

  const sale = await Sale.findById(id).populate('vehicleId', 'brand vehicleModel year price images');
  
  if (!sale) {
    throw createError('Sale not found', 404);
  }

  res.json({
    success: true,
    data: sale,
    message: 'Sale retrieved successfully'
  });
});

export const updateSale = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { id } = req.params;
  const { status, salePrice, notes } = req.body;

  const sale = await Sale.findById(id);
  if (!sale) {
    throw createError('Sale not found', 404);
  }

  // Check if user has permission to update this sale
  if (req.user?.role !== 'admin' && sale.seller.id !== req.user?.id) {
    throw createError('Unauthorized to update this sale', 403);
  }

  // Update fields
  if (status !== undefined) sale.status = status;
  if (salePrice !== undefined) sale.salePrice = salePrice;
  if (notes !== undefined) sale.notes = notes;

  await sale.save();

  res.json({
    success: true,
    data: sale,
    message: 'Sale updated successfully'
  });
});

export const deleteSale = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { id } = req.params;

  const sale = await Sale.findById(id);
  if (!sale) {
    throw createError('Sale not found', 404);
  }

  // If sale is completed, also update vehicle status back to active
  if (sale.status === 'completed') {
    await Vehicle.findByIdAndUpdate(sale.vehicleId, { status: 'active' });
  }

  await Sale.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Sale deleted successfully'
  });
});

export const getSalesStats = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { sellerId, dateFrom, dateTo } = req.query;

  // Build filter object
  const filter: any = {};
  if (sellerId) filter['seller.id'] = sellerId;
  
  if (dateFrom || dateTo) {
    filter.saleDate = {};
    if (dateFrom) filter.saleDate.$gte = new Date(dateFrom as string);
    if (dateTo) filter.saleDate.$lte = new Date(dateTo as string);
  }

  // Get statistics
  const [
    totalSales,
    completedSales,
    pendingSales,
    cancelledSales,
    totalRevenue,
    averageSalePrice
  ] = await Promise.all([
    Sale.countDocuments(filter),
    Sale.countDocuments({ ...filter, status: 'completed' }),
    Sale.countDocuments({ ...filter, status: 'pending' }),
    Sale.countDocuments({ ...filter, status: 'cancelled' }),
    Sale.aggregate([
      { $match: { ...filter, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$salePrice' } } }
    ]),
    Sale.aggregate([
      { $match: { ...filter, status: 'completed' } },
      { $group: { _id: null, average: { $avg: '$salePrice' } } }
    ])
  ]);

  const stats = {
    totalSales,
    completedSales,
    pendingSales,
    cancelledSales,
    totalRevenue: totalRevenue[0]?.total || 0,
    averageSalePrice: averageSalePrice[0]?.average || 0
  };

  res.json({
    success: true,
    data: stats,
    message: 'Sales statistics retrieved successfully'
  });
});

export const getSellerSales = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const { page = 1, limit = 10 } = req.query;
  const sellerId = req.user?.id;

  if (!sellerId) {
    throw createError('User not authenticated', 401);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [sales, total] = await Promise.all([
    Sale.find({ 'seller.id': sellerId })
      .sort({ saleDate: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('vehicleId', 'brand vehicleModel year price images'),
    Sale.countDocuments({ 'seller.id': sellerId })
  ]);

  res.json({
    success: true,
    data: {
      sales,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    },
    message: 'Seller sales retrieved successfully'
  });
});