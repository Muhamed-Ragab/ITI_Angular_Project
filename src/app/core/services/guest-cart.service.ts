import { Injectable, computed, signal } from '@angular/core';

export interface GuestCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
}

export interface GuestCart {
  items: GuestCartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

const GUEST_CART_KEY = 'guest_cart';
const TAX_RATE = 0.1; // 10% tax
const SHIPPING_COST = 10; // $10 shipping

@Injectable({ providedIn: 'root' })
export class GuestCartService {
  readonly cart = signal<GuestCart | null>(null);

  // Computed signals for reactive access
  readonly cartItems = computed(() => this.cart()?.items ?? []);
  
  readonly itemCount = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );
  
  readonly subtotal = computed(() => this.cart()?.subtotal ?? 0);

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load cart from localStorage - can be called to refresh state
   */
  loadFromStorage(): void {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (stored) {
      this.cart.set(JSON.parse(stored));
    }
  }

  private saveCart(cart: GuestCart): void {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    this.cart.set(cart);
  }

  addItem(item: Omit<GuestCartItem, 'subtotal'>): void {
    let cart = this.cart();

    if (!cart) {
      cart = {
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      };
    }

    // Check if item already exists
    const existingIndex = cart.items.findIndex((i) => i.productId === item.productId);

    if (existingIndex >= 0) {
      // Update quantity
      cart.items[existingIndex].quantity += item.quantity;
      cart.items[existingIndex].subtotal =
        cart.items[existingIndex].price * cart.items[existingIndex].quantity;
    } else {
      // Add new item
      cart.items.push({
        ...item,
        subtotal: item.price * item.quantity,
      });
    }

    this.recalculateTotals(cart);
  }

  private recalculateTotals(cart: GuestCart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    cart.tax = cart.subtotal * TAX_RATE;
    cart.shipping = cart.items.length > 0 ? SHIPPING_COST : 0;
    cart.total = cart.subtotal + cart.tax + cart.shipping;
    this.saveCart(cart);
  }

  getCart(): GuestCart | null {
    return this.cart();
  }

  getCartTotal(): number {
    return this.cart()?.total ?? 0;
  }

  getItemCount(): number {
    return this.cart()?.items.length ?? 0;
  }

  clearCart(): void {
    localStorage.removeItem(GUEST_CART_KEY);
    this.cart.set(null);
  }

  hasItems(): boolean {
    const cart = this.cart();
    return !!(cart && cart.items.length > 0);
  }

  updateQuantity(product_id: string, quantity: number): void {
    const cart = this.cart();
    if (!cart) return;

    const itemIndex = cart.items.findIndex((i) => i.productId === product_id);
    if (itemIndex === -1) return;

    if (quantity <= 0) {
      this.removeItem(product_id);
      return;
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;
    this.recalculateTotals(cart);
  }

  removeItem(product_id: string): void {
    const cart = this.cart();
    if (!cart) return;

    cart.items = cart.items.filter((i) => i.productId !== product_id);
    this.recalculateTotals(cart);
  }
}
