import { User } from '../types/user.type';

/**
 * DTO for authentication response
 * Backend returns: { success: true, data: { user, token }, message }
 */
export interface AuthResponseDto {
  success: true;
  message: string;
  data: {
    user: User;
    token: string;
  };
}
