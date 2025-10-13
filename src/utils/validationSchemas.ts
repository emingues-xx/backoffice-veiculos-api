import Joi from 'joi';

// Common validation schemas
export const mongoIdSchema = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required();
export const mongoIdParamSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// User validation schemas
export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(50).required(),
  role: Joi.string().valid('admin', 'manager', 'seller').required()
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  name: Joi.string().min(2).max(50),
  role: Joi.string().valid('admin', 'manager', 'seller'),
  isActive: Joi.boolean()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Vehicle validation schemas
export const createVehicleSchema = Joi.object({
  brand: Joi.string().min(2).max(50).required(),
  vehicleModel: Joi.string().min(2).max(50).required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
  mileage: Joi.number().integer().min(0).required(),
  price: Joi.number().min(0).required(),
  fuelType: Joi.string().valid('gasoline', 'ethanol', 'diesel', 'electric', 'hybrid').required(),
  transmission: Joi.string().valid('manual', 'automatic').required(),
  color: Joi.string().min(2).max(30).required(),
  doors: Joi.number().integer().min(2).max(6).required(),
  category: Joi.string().valid('car', 'motorcycle', 'truck', 'van').required(),
  condition: Joi.string().valid('new', 'used').required(),
  description: Joi.string().min(10).max(2000).required(),
  images: Joi.array().items(Joi.string().uri()).min(1).max(10).required(),
  features: Joi.array().items(Joi.string().max(100)).max(20),
  location: Joi.object({
    city: Joi.string().min(2).max(50).required(),
    state: Joi.string().min(2).max(50).required(),
    zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/).required()
  }).required(),
  seller: Joi.object({
    id: Joi.string().required(),
    name: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required(),
    email: Joi.string().email().required()
  }).required(),
  isFeatured: Joi.boolean().default(false)
});

export const updateVehicleSchema = Joi.object({
  brand: Joi.string().min(2).max(50),
  vehicleModel: Joi.string().min(2).max(50),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
  mileage: Joi.number().integer().min(0),
  price: Joi.number().min(0),
  fuelType: Joi.string().valid('gasoline', 'ethanol', 'diesel', 'electric', 'hybrid'),
  transmission: Joi.string().valid('manual', 'automatic'),
  color: Joi.string().min(2).max(30),
  doors: Joi.number().integer().min(2).max(6),
  category: Joi.string().valid('car', 'motorcycle', 'truck', 'van'),
  condition: Joi.string().valid('new', 'used'),
  description: Joi.string().min(10).max(2000),
  images: Joi.array().items(Joi.string().uri()).min(1).max(10),
  features: Joi.array().items(Joi.string().max(100)).max(20),
  location: Joi.object({
    city: Joi.string().min(2).max(50),
    state: Joi.string().min(2).max(50),
    zipCode: Joi.string().pattern(/^\d{5}-?\d{3}$/)
  }),
  seller: Joi.object({
    id: Joi.string(),
    name: Joi.string().min(2).max(50),
    phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/),
    email: Joi.string().email()
  }),
  status: Joi.string().valid('active', 'sold', 'inactive', 'pending'),
  isFeatured: Joi.boolean()
});

export const vehicleFiltersSchema = Joi.object({
  brand: Joi.string(),
  vehicleModel: Joi.string(),
  yearMin: Joi.number().integer().min(1900),
  yearMax: Joi.number().integer().max(new Date().getFullYear() + 1),
  priceMin: Joi.number().min(0),
  priceMax: Joi.number().min(0),
  fuelType: Joi.string().valid('gasoline', 'ethanol', 'diesel', 'electric', 'hybrid'),
  transmission: Joi.string().valid('manual', 'automatic'),
  category: Joi.string().valid('car', 'motorcycle', 'truck', 'van'),
  condition: Joi.string().valid('new', 'used'),
  city: Joi.string(),
  state: Joi.string(),
  status: Joi.string().valid('active', 'sold', 'inactive', 'pending'),
  isFeatured: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Sale validation schemas
export const createSaleSchema = Joi.object({
  vehicleId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  buyer: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/).required(),
    document: Joi.string().pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/).required()
  }).required(),
  salePrice: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('cash', 'financing', 'trade-in').required(),
  notes: Joi.string().max(1000)
});

export const updateSaleSchema = Joi.object({
  status: Joi.string().valid('pending', 'completed', 'cancelled'),
  salePrice: Joi.number().min(0),
  notes: Joi.string().max(1000)
});

export const salesFiltersSchema = Joi.object({
  sellerId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
  status: Joi.string().valid('pending', 'completed', 'cancelled'),
  paymentMethod: Joi.string().valid('cash', 'financing', 'trade-in'),
  dateFrom: Joi.date(),
  dateTo: Joi.date(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().default('saleDate'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});
