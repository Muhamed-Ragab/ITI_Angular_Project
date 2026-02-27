/**
 * DTO for register request
 */
export interface RegisterRequestDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
}
