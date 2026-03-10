import { describe, expect, it } from 'vitest';
import {
  AddToCartRequest,
  ApiResponse,
  Cart,
  CartItem,
  CartResponse,
  UpdateCartItemRequest,
} from '../cart.dto';

describe('Cart DTOs - Comprehensive Unit Tests', () => {
  // ============================================
  // CartItem Interface Tests
  // ============================================

  describe('CartItem Interface', () => {
    it('should create valid CartItem with required fields', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: 'Test Product',
        price: 99.99,
        quantity: 2,
        subtotal: 199.98,
      };

      expect(item.productId).toBe('prod-123');
      expect(item.name).toBe('Test Product');
      expect(item.price).toBe(99.99);
      expect(item.quantity).toBe(2);
      expect(item.subtotal).toBe(199.98);
    });

    it('should create CartItem with optional image field', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: 'Test Product',
        price: 50,
        quantity: 1,
        subtotal: 50,
        image: 'https://example.com/image.jpg',
      };

      expect(item.image).toBe('https://example.com/image.jpg');
    });

    it('should allow CartItem without image', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: 'Test Product',
        price: 50,
        quantity: 1,
        subtotal: 50,
      };

      expect(item.image).toBeUndefined();
    });

    it('should handle zero quantity CartItem', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: 'Test Product',
        price: 50,
        quantity: 0,
        subtotal: 0,
      };

      expect(item.quantity).toBe(0);
      expect(item.subtotal).toBe(0);
    });

    it('should handle negative price (edge case)', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: 'Test Product',
        price: -10,
        quantity: 1,
        subtotal: -10,
      };

      expect(item.price).toBeLessThan(0);
    });

    it('should handle very large quantity', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: 'Test Product',
        price: 1,
        quantity: 999999,
        subtotal: 999999,
      };

      expect(item.quantity).toBe(999999);
      expect(item.subtotal).toBe(999999);
    });

    it('should calculate subtotal correctly from price and quantity', () => {
      const price = 25.5;
      const quantity = 4;
      const expectedSubtotal = price * quantity;

      const item: CartItem = {
        productId: 'prod-123',
        name: 'Test Product',
        price: price,
        quantity: quantity,
        subtotal: expectedSubtotal,
      };

      expect(item.subtotal).toBe(102);
    });
  });

  // ============================================
  // Cart Interface Tests
  // ============================================

  describe('Cart Interface', () => {
    it('should create valid Cart with required fields', () => {
      const cart: Cart = {
        items: [],
        subtotal: 100,
        tax: 10,
        shipping: 5,
        total: 115,
      };

      expect(cart.items).toEqual([]);
      expect(cart.subtotal).toBe(100);
      expect(cart.tax).toBe(10);
      expect(cart.shipping).toBe(5);
      expect(cart.total).toBe(115);
    });

    it('should create Cart with multiple items', () => {
      const items: CartItem[] = [
        { productId: 'prod-1', name: 'Product 1', price: 50, quantity: 2, subtotal: 100 },
        { productId: 'prod-2', name: 'Product 2', price: 25, quantity: 1, subtotal: 25 },
      ];

      const cart: Cart = {
        items: items,
        subtotal: 125,
        tax: 12.5,
        shipping: 10,
        total: 147.5,
      };

      expect(cart.items).toHaveLength(2);
      expect(cart.items[0].productId).toBe('prod-1');
      expect(cart.items[1].productId).toBe('prod-2');
    });

    it('should handle empty items array', () => {
      const cart: Cart = {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      };

      expect(cart.items).toHaveLength(0);
      expect(cart.total).toBe(0);
    });

    it('should validate cart total calculation', () => {
      const subtotal = 100;
      const tax = 10;
      const shipping = 5;
      const expectedTotal = subtotal + tax + shipping;

      const cart: Cart = {
        items: [],
        subtotal: subtotal,
        tax: tax,
        shipping: shipping,
        total: expectedTotal,
      };

      expect(cart.total).toBe(115);
    });

    it('should handle zero values', () => {
      const cart: Cart = {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      };

      expect(cart.subtotal).toBe(0);
      expect(cart.tax).toBe(0);
      expect(cart.shipping).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should handle negative tax (discount scenario)', () => {
      const cart: Cart = {
        items: [],
        subtotal: 100,
        tax: -10,
        shipping: 5,
        total: 95,
      };

      expect(cart.tax).toBeLessThan(0);
      expect(cart.total).toBe(95);
    });
  });

  // ============================================
  // AddToCartRequest Interface Tests
  // ============================================

  describe('AddToCartRequest Interface', () => {
    it('should create valid AddToCartRequest with required fields', () => {
      const request: AddToCartRequest = {
        product: 'prod-123',
        quantity: 3,
      };

      expect(request.product).toBe('prod-123');
      expect(request.quantity).toBe(3);
    });

    it('should create AddToCartRequest with default quantity', () => {
      const request: AddToCartRequest = {
        product: 'prod-123',
        quantity: 1,
      };

      expect(request.quantity).toBe(1);
    });

    it('should handle zero quantity', () => {
      const request: AddToCartRequest = {
        product: 'prod-123',
        quantity: 0,
      };

      expect(request.quantity).toBe(0);
    });

    it('should handle very large quantity', () => {
      const request: AddToCartRequest = {
        product: 'prod-123',
        quantity: 10000,
      };

      expect(request.quantity).toBe(10000);
    });

    it('should handle negative quantity', () => {
      const request: AddToCartRequest = {
        product: 'prod-123',
        quantity: -5,
      };

      expect(request.quantity).toBeLessThan(0);
    });

    it('should handle UUID product format', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const request: AddToCartRequest = {
        product: uuid,
        quantity: 1,
      };

      expect(request.product).toBe(uuid);
    });
  });

  // ============================================
  // UpdateCartItemRequest Interface Tests
  // ============================================

  describe('UpdateCartItemRequest Interface', () => {
    it('should create valid UpdateCartItemRequest', () => {
      const request: UpdateCartItemRequest = {
        product_id: 'prod-123',
        quantity: 5,
      };

      expect(request.product_id).toBe('prod-123');
      expect(request.quantity).toBe(5);
    });

    it('should handle quantity update to zero', () => {
      const request: UpdateCartItemRequest = {
        product_id: 'prod-123',
        quantity: 0,
      };

      expect(request.quantity).toBe(0);
    });

    it('should handle negative quantity', () => {
      const request: UpdateCartItemRequest = {
        product_id: 'prod-123',
        quantity: -1,
      };

      expect(request.quantity).toBeLessThan(0);
    });

    it('should handle large quantity', () => {
      const request: UpdateCartItemRequest = {
        product_id: 'prod-123',
        quantity: 5000,
      };

      expect(request.quantity).toBe(5000);
    });
  });

  // ============================================
  // CartResponse Interface Tests
  // ============================================

  describe('CartResponse Interface', () => {
    it('should create valid CartResponse', () => {
      const cart: Cart = {
        items: [],
        subtotal: 100,
        tax: 10,
        shipping: 5,
        total: 115,
      };

      const response: CartResponse = {
        success: true,
        data: cart,
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual(cart);
    });

    it('should handle failed cart response', () => {
      const cart: Cart = {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      };

      const response: CartResponse = {
        success: false,
        data: cart,
      };

      expect(response.success).toBe(false);
    });
  });

  // ============================================
  // ApiResponse Generic Interface Tests
  // ============================================

  describe('ApiResponse<T> Generic Interface', () => {
    it('should create ApiResponse with Cart data', () => {
      const cart: Cart = {
        items: [],
        subtotal: 100,
        tax: 10,
        shipping: 5,
        total: 115,
      };

      const response: ApiResponse<Cart> = {
        success: true,
        data: cart,
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual(cart);
    });

    it('should create ApiResponse with message', () => {
      const cart: Cart = {
        items: [],
        subtotal: 100,
        tax: 10,
        shipping: 5,
        total: 115,
      };

      const response: ApiResponse<Cart> = {
        success: true,
        data: cart,
        message: 'Cart retrieved successfully',
      };

      expect(response.message).toBe('Cart retrieved successfully');
    });

    it('should handle error response', () => {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Failed to retrieve cart',
      };

      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.message).toBe('Failed to retrieve cart');
    });

    it('should handle response without message', () => {
      const cart: Cart = {
        items: [],
        subtotal: 100,
        tax: 10,
        shipping: 5,
        total: 115,
      };

      const response: ApiResponse<Cart> = {
        success: true,
        data: cart,
      };

      expect(response.message).toBeUndefined();
    });
  });

  // ============================================
  // Serialization/Deserialization Tests
  // ============================================

  describe('Serialization/Deserialization', () => {
    it('should serialize and deserialize CartItem correctly', () => {
      const original: CartItem = {
        productId: 'prod-123',
        name: 'Test Product',
        price: 99.99,
        quantity: 2,
        subtotal: 199.98,
        image: 'https://example.com/image.jpg',
      };

      const serialized = JSON.stringify(original);
      const deserialized: CartItem = JSON.parse(serialized);

      expect(deserialized.productId).toBe(original.productId);
      expect(deserialized.name).toBe(original.name);
      expect(deserialized.price).toBe(original.price);
      expect(deserialized.quantity).toBe(original.quantity);
      expect(deserialized.subtotal).toBe(original.subtotal);
      expect(deserialized.image).toBe(original.image);
    });

    it('should serialize and deserialize Cart correctly', () => {
      const original: Cart = {
        items: [
          { productId: 'prod-1', name: 'Product 1', price: 50, quantity: 2, subtotal: 100 },
          { productId: 'prod-2', name: 'Product 2', price: 25, quantity: 1, subtotal: 25 },
        ],
        subtotal: 125,
        tax: 12.5,
        shipping: 10,
        total: 147.5,
      };

      const serialized = JSON.stringify(original);
      const deserialized: Cart = JSON.parse(serialized);

      expect(deserialized.items).toHaveLength(2);
      expect(deserialized.subtotal).toBe(125);
      expect(deserialized.total).toBe(147.5);
    });

    it('should handle JSON parsing of CartResponse', () => {
      const original: CartResponse = {
        success: true,
        data: {
          items: [],
          subtotal: 100,
          tax: 10,
          shipping: 5,
          total: 115,
        },
      };

      const serialized = JSON.stringify(original);
      const deserialized: CartResponse = JSON.parse(serialized);

      expect(deserialized.success).toBe(true);
      expect(deserialized.data.total).toBe(115);
    });
  });

  // ============================================
  // Edge Cases and Boundary Values
  // ============================================

  describe('Edge Cases and Boundary Values', () => {
    it('should handle Cart with maximum number of items', () => {
      const items: CartItem[] = Array.from({ length: 100 }, (_, i) => ({
        productId: `prod-${i}`,
        name: `Product ${i}`,
        price: 10,
        quantity: 1,
        subtotal: 10,
      }));

      const cart: Cart = {
        items: items,
        subtotal: 1000,
        tax: 100,
        shipping: 50,
        total: 1150,
      };

      expect(cart.items).toHaveLength(100);
      expect(cart.total).toBe(1150);
    });

    it('should handle decimal quantities', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: 'Test Product',
        price: 33.33,
        quantity: 1.5,
        subtotal: 49.995,
      };

      expect(item.quantity).toBe(1.5);
    });

    it('should handle very large price values', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: 'Expensive Product',
        price: 999999999,
        quantity: 1,
        subtotal: 999999999,
      };

      expect(item.price).toBe(999999999);
    });

    it('should handle special characters in product name', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: "Product with 'quotes' & <special> chars",
        price: 50,
        quantity: 1,
        subtotal: 50,
      };

      expect(item.name).toContain("'");
      expect(item.name).toContain('&');
      expect(item.name).toContain('<');
    });

    it('should handle unicode characters in product name', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: '日本語产品 Ελληνικά',
        price: 50,
        quantity: 1,
        subtotal: 50,
      };

      expect(item.name).toContain('日本語');
      expect(item.name).toContain('Ελληνικά');
    });

    it('should handle empty string product ID', () => {
      const item: CartItem = {
        productId: '',
        name: 'Test Product',
        price: 50,
        quantity: 1,
        subtotal: 50,
      };

      expect(item.productId).toBe('');
    });

    it('should handle empty string product name', () => {
      const item: CartItem = {
        productId: 'prod-123',
        name: '',
        price: 50,
        quantity: 1,
        subtotal: 50,
      };

      expect(item.name).toBe('');
    });
  });
});
