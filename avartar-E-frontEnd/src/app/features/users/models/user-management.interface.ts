import { User } from "../../auth/models/auth-interface";
import { OrderDetail } from '../../reports/models/report.interface';

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
  verifiedUsers: number;
  inactiveUsers: number;
  totalLogins: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'ROLE_USER' | 'ROLE_ADMIN' | 'all';
  status?: 'active' | 'inactive' | 'all';
  sortBy?: 'name' | 'email' | 'createdAt' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

export interface UsersResponse {
  users: AdminUser[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
}

export interface BulkActionRequest {
  userIds: number[];
  action: 'activate' | 'deactivate' | 'delete' | 'makeAdmin' | 'removeAdmin';
}

export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  timestamp: Date;
  ipAddress?: string;
  details?: string
}

// Extender la interfaz User existente con propiedades administrativas
export interface AdminUser extends User {
  loginCount: number;
  lastLogin?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}



