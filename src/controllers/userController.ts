import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { AuthRequest } from '@/middleware/auth';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { config } from '@/config/config';
import { ApiResponse, PaginationQuery } from '@/types/api.types';
import { CreateUserRequest, UpdateUserRequest, LoginRequest, AuthResponse } from '@/types/user.types';

export const register = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { email, password, name, role }: CreateUserRequest = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError('User already exists with this email', 400);
  }

  const user = new User({ email, password, name, role });
  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { id: (user._id as any).toString(), email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as any
  );

  const response: AuthResponse = {
    token,
    user: {
      id: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      role: user.role
    }
  };

  res.status(201).json({
    success: true,
    data: response,
    message: 'User registered successfully'
  });
});

export const login = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { email, password }: LoginRequest = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw createError('Account is deactivated', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { id: (user._id as any).toString(), email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as any
  );

  const response: AuthResponse = {
    token,
    user: {
      id: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      role: user.role
    }
  };

  res.json({
    success: true,
    data: response,
    message: 'Login successful'
  });
});

export const getUsers = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as PaginationQuery;

  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find()
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .select('-password'),
    User.countDocuments()
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages
    }
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.params.id;
  const updateData: UpdateUserRequest = req.body;

  // Check if user is updating their own profile or is admin
  if (req.user?.id !== userId && req.user?.role !== 'admin') {
    throw createError('Not authorized to update this user', 403);
  }

  // Non-admin users can't change role or active status
  if (req.user?.role !== 'admin') {
    delete updateData.role;
    delete updateData.isActive;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
    message: 'User updated successfully'
  });
});

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const userId = req.params.id;

  // Only admins can delete users
  if (req.user?.role !== 'admin') {
    throw createError('Not authorized to delete users', 403);
  }

  // Prevent self-deletion
  if (req.user?.id === userId) {
    throw createError('Cannot delete your own account', 400);
  }

  const user = await User.findByIdAndDelete(userId);
  
  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const user = await User.findById(req.user?.id).select('-password');
  
  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response<ApiResponse>) => {
  const updateData: UpdateUserRequest = req.body;

  // Remove fields that shouldn't be updated via profile update
  delete updateData.role;
  delete updateData.isActive;

  const user = await User.findByIdAndUpdate(
    req.user?.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  res.json({
    success: true,
    data: user,
    message: 'Profile updated successfully'
  });
});
