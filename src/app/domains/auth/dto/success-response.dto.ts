/**
 * DTO for simple success response
 */
export interface SuccessResponseDto<T = unknown> {
  success: true;
  data: T;
  message: string;
}
