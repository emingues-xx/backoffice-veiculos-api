import { Request, Response } from 'express';
import Vehicle from '@/models/Vehicle';
import { AuthRequest } from '@/middleware/auth';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { ApiResponse, PaginationQuery } from '@/types/api.types';
import { VehicleFilters } from '@/types/vehicle.types';

export const createVehicle = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const vehicleData = {
    ...req.body,
    seller: {
      ...req.body.seller,
      id: req.user?.id || req.body.seller.id
    }
  };

  const vehicle = new Vehicle(vehicleData);
  await vehicle.save();

  res.status(201).json({
    success: true,
    data: vehicle,
    message: 'Vehicle created successfully'
  });
});

export const getVehicles = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    ...filters
  } = req.query as VehicleFilters & PaginationQuery;

  const query: any = {};

  // Apply filters
  if (filters.brand) query.brand = new RegExp(filters.brand, 'i');
  if (filters.vehicleModel) query.vehicleModel = new RegExp(filters.vehicleModel, 'i');
  if (filters.yearMin || filters.yearMax) {
    query.year = {};
    if (filters.yearMin) query.year.$gte = filters.yearMin;
    if (filters.yearMax) query.year.$lte = filters.yearMax;
  }
  if (filters.priceMin || filters.priceMax) {
    query.price = {};
    if (filters.priceMin) query.price.$gte = filters.priceMin;
    if (filters.priceMax) query.price.$lte = filters.priceMax;
  }
  if (filters.fuelType) query.fuelType = filters.fuelType;
  if (filters.transmission) query.transmission = filters.transmission;
  if (filters.category) query.category = filters.category;
  if (filters.condition) query.condition = filters.condition;
  if (filters.city) query['location.city'] = new RegExp(filters.city, 'i');
  if (filters.state) query['location.state'] = new RegExp(filters.state, 'i');
  if (filters.status) query.status = filters.status;
  if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;

  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);

  const [vehicles, total] = await Promise.all([
    Vehicle.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Vehicle.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: vehicles,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

export const getVehicleById = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const vehicle = await Vehicle.findById(req.params.id);
  
  if (!vehicle) {
    throw createError('Vehicle not found', 404);
  }

  // Increment view count
  vehicle.views += 1;
  await vehicle.save();

  res.json({
    success: true,
    data: vehicle
  });
});

export const updateVehicle = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const vehicle = await Vehicle.findById(req.params.id);
  
  if (!vehicle) {
    throw createError('Vehicle not found', 404);
  }

  // Check if user has permission to update this vehicle
  if (req.user?.role !== 'admin' && vehicle.seller.id !== req.user?.id) {
    throw createError('Not authorized to update this vehicle', 403);
  }

  const updatedVehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedVehicle,
    message: 'Vehicle updated successfully'
  });
});

export const deleteVehicle = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const vehicle = await Vehicle.findById(req.params.id);
  
  if (!vehicle) {
    throw createError('Vehicle not found', 404);
  }

  // Check if user has permission to delete this vehicle
  if (req.user?.role !== 'admin' && vehicle.seller.id !== req.user?.id) {
    throw createError('Not authorized to delete this vehicle', 403);
  }

  await Vehicle.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Vehicle deleted successfully'
  });
});

export const getVehicleStats = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const [
    totalVehicles,
    activeVehicles,
    soldVehicles,
    inactiveVehicles,
    totalViews,
    averagePrice,
    topBrands,
    topCities
  ] = await Promise.all([
    Vehicle.countDocuments(),
    Vehicle.countDocuments({ status: 'active' }),
    Vehicle.countDocuments({ status: 'sold' }),
    Vehicle.countDocuments({ status: 'inactive' }),
    Vehicle.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
    Vehicle.aggregate([{ $group: { _id: null, average: { $avg: '$price' } } }]),
    Vehicle.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    Vehicle.aggregate([
      { $group: { _id: '$location.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])
  ]);

  const stats = {
    totalVehicles,
    activeVehicles,
    soldVehicles,
    inactiveVehicles,
    totalViews: totalViews[0]?.total || 0,
    averagePrice: Math.round(averagePrice[0]?.average || 0),
    topBrands: topBrands.map(item => ({ brand: item._id, count: item.count })),
    topCities: topCities.map(item => ({ city: item._id, count: item.count }))
  };

  res.json({
    success: true,
    data: stats
  });
});

export const toggleFeatured = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const vehicle = await Vehicle.findById(req.params.id);
  
  if (!vehicle) {
    throw createError('Vehicle not found', 404);
  }

  // Only admins can toggle featured status
  if (req.user?.role !== 'admin') {
    throw createError('Not authorized to toggle featured status', 403);
  }

  vehicle.isFeatured = !vehicle.isFeatured;
  await vehicle.save();

  res.json({
    success: true,
    data: vehicle,
    message: `Vehicle ${vehicle.isFeatured ? 'featured' : 'unfeatured'} successfully`
  });
});
