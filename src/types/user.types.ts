export interface User {
  _id?: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'seller';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'seller';
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: 'admin' | 'manager' | 'seller';
  isActive?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
