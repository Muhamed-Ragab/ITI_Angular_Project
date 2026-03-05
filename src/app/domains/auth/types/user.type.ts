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
  // Note: Address fields are NOT returned by GET /users/profile currently
  // They may be added in the future, or accessed via separate endpoints:
  // - POST /users/address (add)
  // - PUT /users/address/:id (update)
  // - DELETE /users/address/:id (delete)
  // - GET /users/address (not currently available - needs to be added)
  addresses?: UserAddress[];
}

/**
 * User address type for shipping addresses
 */
export interface UserAddress {
  _id: string;
  street: string;
  city: string;
  state?: string;
  country: string;
  zip: string;
  isDefault?: boolean;
}

/**
 * User role enumeration
 */
export type UserRole = 'customer' | 'seller' | 'admin';
