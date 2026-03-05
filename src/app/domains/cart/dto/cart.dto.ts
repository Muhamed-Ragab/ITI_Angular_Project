/**
 * Cart Domain DTOs
 * Data Transfer Objects for cart operations
 */

// Cart Item - FLAT structure (matches actual API response)
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
}

// Cart Response
export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export interface CartResponse {
  success: boolean;
  data: Cart;
}

// Update Cart Item Request
export interface UpdateCartItemRequest {
  product_id: string;
  quantity: number;
}

export interface AddToCartRequest {
  product: string;
  quantity: number;
}

// Cart API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
