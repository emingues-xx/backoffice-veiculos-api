import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/config';
import User from '@/models/User';
import { ApiResponse } from '@/types/api.types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    console.log('=== AUTH DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Authorization header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token extracted:', token ? token.substring(0, 50) + '...' : 'null');
    
    if (!token) {
      console.log('No token provided');
      res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.',
        message: 'Authentication required'
      });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Invalid token or user not found.',
        message: 'Authentication failed'
      });
      return;
    }

    req.user = {
      id: (user._id as any).toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token.',
      message: 'Authentication failed'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Access denied. User not authenticated.',
        message: 'Authentication required'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Access denied. Insufficient permissions.',
        message: `Required roles: ${roles.join(', ')}`
      });
      return;
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response<ApiResponse>, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = {
          id: (user._id as any).toString(),
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};
