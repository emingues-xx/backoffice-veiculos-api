import { Router } from 'express';
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  getSalesStats,
  getSellerSales
} from '@/controllers/salesController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateQuery, validateParams } from '@/middleware/validation';
import {
  createSaleSchema,
  updateSaleSchema,
  salesFiltersSchema,
  mongoIdSchema
} from '@/utils/validationSchemas';

const router = Router();

// All sales routes require authentication
router.use(authenticate);

// Sales CRUD operations
router.post('/', authorize('admin', 'manager', 'seller'), validate(createSaleSchema), createSale);
router.get('/', validateQuery(salesFiltersSchema), getSales);
router.get('/stats', getSalesStats);
router.get('/my-sales', getSellerSales);
router.get('/:id', validateParams(mongoIdSchema), getSaleById);
router.put('/:id', validateParams(mongoIdSchema), validate(updateSaleSchema), updateSale);

// Admin only routes
router.delete('/:id', authorize('admin'), validateParams(mongoIdSchema), deleteSale);

export default router;
