import { Router } from 'express';
import {
  register,
  login,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile
} from '@/controllers/userController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateParams } from '@/middleware/validation';
import {
  createUserSchema,
  updateUserSchema,
  loginSchema,
  mongoIdSchema
} from '@/utils/validationSchemas';

const router = Router();

// Public routes
router.post('/register', validate(createUserSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.use(authenticate);

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', validate(updateUserSchema), updateProfile);

// User management routes (admin only)
router.get('/', authorize('admin'), getUsers);
router.get('/:id', authorize('admin'), validateParams(mongoIdSchema), getUserById);
router.put('/:id', authorize('admin'), validateParams(mongoIdSchema), validate(updateUserSchema), updateUser);
router.delete('/:id', authorize('admin'), validateParams(mongoIdSchema), deleteUser);

export default router;
