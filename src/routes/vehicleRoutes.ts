import { Router } from 'express';
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
  toggleFeatured
} from '@/controllers/vehicleController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateQuery, validateParams } from '@/middleware/validation';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleFiltersSchema,
  mongoIdSchema
} from '@/utils/validationSchemas';

const router = Router();

// Public routes
router.get('/', validateQuery(vehicleFiltersSchema), getVehicles);
router.get('/stats', getVehicleStats);
router.get('/:id', validateParams(mongoIdSchema), getVehicleById);

// Protected routes
router.use(authenticate);

// Vehicle CRUD operations
router.post('/', authorize('admin', 'manager', 'seller'), validate(createVehicleSchema), createVehicle);
router.put('/:id', validateParams(mongoIdSchema), validate(updateVehicleSchema), updateVehicle);
router.delete('/:id', validateParams(mongoIdSchema), deleteVehicle);

// Admin only routes
router.patch('/:id/featured', authorize('admin'), validateParams(mongoIdSchema), toggleFeatured);

export default router;
