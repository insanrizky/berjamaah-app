export interface User {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: string;
  status: 'scheduled' | 'pending' | 'active';
  createdAt: string; // Serialized date from tRPC
  updatedAt: string; // Serialized date from tRPC
  totalDonations?: number;
  totalAmount?: number;
}

export interface UserFilters extends Record<string, unknown> {
  search: string;
  status: 'all' | 'scheduled' | 'pending' | 'active';
  role: 'all' | 'admin' | 'user';
}

export interface CreateUserData {
  fullName: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  phone?: string;
}

// Note: UsersResponse type is now automatically inferred from tRPC router
// No need to manually define it since tRPC provides full type safety
