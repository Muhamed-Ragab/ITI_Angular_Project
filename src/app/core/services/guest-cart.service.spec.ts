import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GuestCartService, GuestCart, GuestCartItem } from './guest-cart.service';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('GuestCartService - Comprehensive Unit Tests', () => {
  let guestCartService: GuestCartService;

  const clearLocalStorage = () => {
    localStorageMock.clear();
    vi.clearAllMocks();
  };

  beforeEach(() => {
    clearLocalStorage();
    guestCartService = new GuestCartService();
  });

  // ============================================
  // HAPPY PATH TESTS
  // ============================================

  describe('Happy Path - addItem()', () => {
    it('should add item to empty cart', () => {
      guestCartService.addItem({
        productId: 'prod-1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
      });

      const cart = guestCartService.getCart();
      expect(cart).not.toBeNull();
      expect(cart?.items).toHaveLength(1);
      expect(cart?.items[0].productId).toBe('prod-1');
      expect(cart?.items[0].subtotal).toBe(100);
    });

    it('should add multiple items to cart', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product 1', price: 50, quantity: 1 });
      guestCartService.addItem({ productId: 'prod-2', name: 'Product 2', price: 75, quantity: 2 });

      const cart = guestCartService.getCart();
      expect(cart?.items).toHaveLength(2);
    });

    it('should update quantity when adding existing item', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 100, quantity: 1 });
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 100, quantity: 2 });

      const cart = guestCartService.getCart();
      expect(cart?.items).toHaveLength(1);
      expect(cart?.items[0].quantity).toBe(3);
      expect(cart?.items[0].subtotal).toBe(300);
    });
  });

  describe('Happy Path - getCart()', () => {
    it('should return null for empty cart', () => {
      expect(guestCartService.getCart()).toBeNull();
    });

    it('should return cart after adding item', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 100, quantity: 1 });
      expect(guestCartService.getCart()).not.toBeNull();
    });
  });

  describe('Happy Path - removeItem()', () => {
    it('should remove item from cart', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product 1', price: 100, quantity: 1 });
      guestCartService.addItem({ productId: 'prod-2', name: 'Product 2', price: 50, quantity: 1 });

      guestCartService.removeItem('prod-1');

      const cart = guestCartService.getCart();
      expect(cart?.items).toHaveLength(1);
      expect(cart?.items[0].productId).toBe('prod-2');
    });
  });

  describe('Happy Path - updateQuantity()', () => {
    it('should update item quantity', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 100, quantity: 1 });
      guestCartService.updateQuantity('prod-1', 5);

      const cart = guestCartService.getCart();
      expect(cart?.items[0].quantity).toBe(5);
      expect(cart?.items[0].subtotal).toBe(500);
    });

    it('should remove item when quantity is 0', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 100, quantity: 1 });
      guestCartService.updateQuantity('prod-1', 0);

      const cart = guestCartService.getCart();
      expect(cart?.items).toHaveLength(0);
    });
  });

  describe('Happy Path - clearCart()', () => {
    it('should clear all items from cart', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product 1', price: 100, quantity: 1 });
      guestCartService.addItem({ productId: 'prod-2', name: 'Product 2', price: 50, quantity: 1 });

      guestCartService.clearCart();

      expect(guestCartService.getCart()).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('guest_cart');
    });
  });

  describe('Happy Path - getCartTotal()', () => {
    it('should return 0 for empty cart', () => {
      expect(guestCartService.getCartTotal()).toBe(0);
    });

    it('should return correct total', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 100, quantity: 1 });
      // total = subtotal + tax (10%) + shipping (10) = 100 + 10 + 10 = 120
      expect(guestCartService.getCartTotal()).toBe(120);
    });
  });

  describe('Happy Path - getItemCount()', () => {
    it('should return 0 for empty cart', () => {
      expect(guestCartService.getItemCount()).toBe(0);
    });

    it('should return correct item count', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product 1', price: 100, quantity: 2 });
      guestCartService.addItem({ productId: 'prod-2', name: 'Product 2', price: 50, quantity: 3 });

      expect(guestCartService.getItemCount()).toBe(2);
    });
  });

  describe('Happy Path - hasItems()', () => {
    it('should return false for empty cart', () => {
      expect(guestCartService.hasItems()).toBe(false);
    });

    it('should return true when cart has items', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 100, quantity: 1 });
      expect(guestCartService.hasItems()).toBe(true);
    });
  });

  // ============================================
  // NULL/EMPTY INPUT TESTS
  // ============================================

  describe('Null/Empty Input Tests', () => {
    it('should handle adding item with no image', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 100, quantity: 1 });
      const cart = guestCartService.getCart();
      expect(cart?.items[0].image).toBeUndefined();
    });

    it('should handle updateQuantity for non-existent item', () => {
      expect(() => guestCartService.updateQuantity('non-existent', 5)).not.toThrow();
    });

    it('should handle removeItem for non-existent item', () => {
      expect(() => guestCartService.removeItem('non-existent')).not.toThrow();
    });
  });

  // ============================================
  // EDGE CASES AND BOUNDARY VALUES
  // ============================================

  describe('Edge Cases and Boundary Values', () => {
    it('should handle very large quantity', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 1, quantity: 999999 });
      const cart = guestCartService.getCart();
      expect(cart?.items[0].quantity).toBe(999999);
      expect(cart?.items[0].subtotal).toBe(999999);
    });

    it('should handle zero price item', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Free Product', price: 0, quantity: 1 });
      const cart = guestCartService.getCart();
      expect(cart?.items[0].subtotal).toBe(0);
    });

    it('should handle negative quantity in updateQuantity', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 100, quantity: 1 });
      guestCartService.updateQuantity('prod-1', -5);

      const cart = guestCartService.getCart();
      expect(cart?.items).toHaveLength(0); // Should remove item
    });

    it('should calculate totals correctly with multiple items', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product 1', price: 100, quantity: 2 }); // subtotal: 200
      guestCartService.addItem({ productId: 'prod-2', name: 'Product 2', price: 50, quantity: 1 });  // subtotal: 50

      const cart = guestCartService.getCart()!;
      expect(cart.subtotal).toBe(250);   // 200 + 50
      expect(cart.tax).toBe(25);        // 250 * 0.1
      expect(cart.shipping).toBe(10);    // $10 since items exist
      expect(cart.total).toBe(285);      // 250 + 25 + 10
    });

    it('should return null for getCart after clearCart', () => {
      guestCartService.clearCart();
      expect(guestCartService.getCart()).toBeNull();
    });
  });

  // ============================================
  // CONCURRENCY EDGE CASES
  // ============================================

  describe('Concurrency Edge Cases', () => {
    it('should handle rapid addItem calls', () => {
      for (let i = 0; i < 100; i++) {
        guestCartService.addItem({ productId: 'prod-' + i, name: 'Product ' + i, price: 10, quantity: 1 });
      }
      expect(guestCartService.getItemCount()).toBe(100);
    });

    it('should handle rapid clearCart calls', () => {
      guestCartService.addItem({ productId: 'prod-1', name: 'Product', price: 100, quantity: 1 });
      
      for (let i = 0; i < 10; i++) {
        guestCartService.clearCart();
      }
      
      expect(guestCartService.getCart()).toBeNull();
    });
  });
});
