/**
 * User entity type representing authenticated user data
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  emailVerified?: boolean;
}

/**
 * User role enumeration
 */
export type UserRole = 'customer' | 'seller' | 'admin';
