import { User } from '../types/user.type';

/**
 * DTO for registration response
 * Backend returns full user object with registration
 */
export interface RegisterResponseDto {
  success: true;
  message: string;
  data: {
    user: Partial<User> & {
      _id: string;
      isEmailVerified?: boolean;
      emailVerificationTokenHash?: string;
      emailVerificationTokenExpiresAt?: string;
    };
    requiresEmailVerification: boolean;
  };
}
