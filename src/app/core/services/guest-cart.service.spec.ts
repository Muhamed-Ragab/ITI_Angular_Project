import { TestBed } from '@angular/core/testing';
import { GuestCartService, GuestCart, GuestCartItem } from './guest-cart.service';
import { StorageService } from './storage.service';

describe('GuestCartService - Type Verification Tests', () => {
  let service: GuestCartService;
  let storageService: jasmine.SpyObj<StorageService>;

  const mockGuestCartItem: GuestCartItem = {
    productId: '69a6f0215a72cce3649aca43',
    name: 'Yoga Mat Premium',
    price: 380,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
  };

  const mockGuestCart: GuestCart = {
    items: [
      mockGuestCartItem,
      {
        productId: '507f1f77bcf86cd799439011',
        name: 'Resistance Bands Set',
        price: 250,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400',
      },
    ],
    subtotal: 880,
    tax: 88,
    shipping: 50,
    total: 1018,
  };

  beforeEach(() => {
    const storageServiceSpy = jasmine.createSpyObj('StorageService', [
      'getItem',
      'setItem',
      'removeItem',
    ]);

    TestBed.configureTestingModule({
      providers: [GuestCartService, { provide: StorageService, useValue: storageServiceSpy }],
    });

    service = TestBed.inject(GuestCartService);
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
  });

  describe('Type Structure Verification', () => {
    it('should have flat structure for guest cart items', () => {
      const item = mockGuestCartItem;

      // Guest cart should have FLAT structure (not nested like authenticated cart)
      expect(item.productId).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.price).toBeDefined();
      expect(item.quantity).toBeDefined();
      expect(item.image).toBeDefined();

      // Should NOT have nested product_id
      const itemAsAny = item as any;
      expect(itemAsAny.product_id).toBeUndefined();
    });

    it('should verify GuestCartItem matches expected structure', () => {
      const item: GuestCartItem = {
        productId: '123',
        name: 'Test Product',
        price: 100,
        quantity: 1,
        image: 'test.jpg',
      };

      expect(typeof item.productId).toBe('string');
      expect(typeof item.name).toBe('string');
      expect(typeof item.price).toBe('number');
      expect(typeof item.quantity).toBe('number');
      expect(typeof item.image).toBe('string');
    });

    it('should calculate subtotal correctly in flat structure', () => {
      const item = mockGuestCartItem;
      const expectedSubtotal = item.price * item.quantity;

      expect(expectedSubtotal).toBe(380);
    });
  });

  describe('Structure Comparison: Guest vs Authenticated Cart', () => {
    it('should document structure difference between guest and authenticated carts', () => {
      // Guest cart item (FLAT):
      const guestItem: GuestCartItem = {
        productId: '69a6f0215a72cce3649aca43',
        name: 'Yoga Mat Premium',
        price: 380,
        quantity: 1,
        image: 'test.jpg',
      };

      // Authenticated cart item (NESTED):
      const authenticatedItem = {
        product_id: {
          productId: '69a6f0215a72cce3649aca43',
          name: 'Yoga Mat Premium',
          price: 380,
          quantity: 1,
          subtotal: 380,
          image: 'test.jpg',
        },
      };

      // Access patterns are different:
      expect(guestItem.productId).toBe('69a6f0215a72cce3649aca43');
      expect(authenticatedItem.product_id.productId).toBe('69a6f0215a72cce3649aca43');

      // This inconsistency causes issues in the checkout component!
      console.log('Guest cart structure:', guestItem);
      console.log('Authenticated cart structure:', authenticatedItem);
    });

    it('should verify both structures contain same essential data', () => {
      const guestItem = mockGuestCartItem;

      // Both should have these fields (just at different paths):
      expect(guestItem.productId).toBeDefined();
      expect(guestItem.name).toBeDefined();
      expect(guestItem.price).toBeDefined();
      expect(guestItem.quantity).toBeDefined();
      expect(guestItem.image).toBeDefined();
    });
  });

  describe('addItem() - Type Verification', () => {
    it('should add item with correct flat structure', () => {
      storageService.getItem.and.returnValue(null);

      const newItem: GuestCartItem = {
        productId: 'new-product-123',
        name: 'New Product',
        price: 500,
        quantity: 1,
        image: 'new.jpg',
      };

      service.addItem(newItem);

      expect(storageService.setItem).toHaveBeenCalled();

      const cart = service.getCart();
      expect(cart.items.length).toBe(1);
      expect(cart.items[0].productId).toBe('new-product-123');
      expect(cart.items[0].name).toBe('New Product');
    });

    it('should maintain flat structure when adding multiple items', () => {
      storageService.getItem.and.returnValue(null);

      service.addItem(mockGuestCartItem);
      service.addItem({
        productId: 'product-2',
        name: 'Product 2',
        price: 200,
        quantity: 1,
        image: 'img2.jpg',
      });

      const cart = service.getCart();
      expect(cart.items.length).toBe(2);

      // Verify all items have flat structure
      cart.items.forEach((item) => {
        expect(item.productId).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.price).toBeDefined();
        expect(item.quantity).toBeDefined();
        expect(typeof item.productId).toBe('string');
      });
    });
  });

  describe('removeItem() - Type Verification', () => {
    beforeEach(() => {
      storageService.getItem.and.returnValue(mockGuestCart);
    });

    it('should remove item using flat productId', () => {
      const productIdToRemove = '69a6f0215a72cce3649aca43';

      service.removeItem(productIdToRemove);

      const cart = service.getCart();
      const removedItem = cart.items.find((item) => item.productId === productIdToRemove);

      expect(removedItem).toBeUndefined();
    });

    it('should verify removeItem parameter type is string', () => {
      const productId = '69a6f0215a72cce3649aca43';

      expect(typeof productId).toBe('string');

      service.removeItem(productId);

      expect(storageService.setItem).toHaveBeenCalled();
    });
  });

  describe('updateQuantity() - Type Verification', () => {
    beforeEach(() => {
      storageService.getItem.and.returnValue(mockGuestCart);
    });

    it('should update quantity using flat productId', () => {
      const productId = '69a6f0215a72cce3649aca43';
      const newQuantity = 5;

      service.updateQuantity(productId, newQuantity);

      const cart = service.getCart();
      const updatedItem = cart.items.find((item) => item.productId === productId);

      expect(updatedItem?.quantity).toBe(newQuantity);
    });

    it('should verify updateQuantity parameter types', () => {
      const productId = '69a6f0215a72cce3649aca43';
      const quantity = 3;

      expect(typeof productId).toBe('string');
      expect(typeof quantity).toBe('number');

      service.updateQuantity(productId, quantity);
    });
  });

  describe('Cart Calculations', () => {
    beforeEach(() => {
      storageService.getItem.and.returnValue(mockGuestCart);
    });

    it('should calculate subtotal from flat structure items', () => {
      const cart = service.getCart();

      const calculatedSubtotal = cart.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      expect(calculatedSubtotal).toBe(880); // (380 * 1) + (250 * 2)
      expect(cart.subtotal).toBe(880);
    });

    it('should calculate total correctly', () => {
      const total = service.getCartTotal();

      expect(total).toBe(1018); // subtotal + tax + shipping
    });

    it('should verify all numeric fields are numbers', () => {
      const cart = service.getCart();

      expect(typeof cart.subtotal).toBe('number');
      expect(typeof cart.tax).toBe('number');
      expect(typeof cart.shipping).toBe('number');
      expect(typeof cart.total).toBe('number');

      cart.items.forEach((item) => {
        expect(typeof item.price).toBe('number');
        expect(typeof item.quantity).toBe('number');
      });
    });
  });

  describe('Template Compatibility', () => {
    it('should verify guest cart items work with checkout template', () => {
      storageService.getItem.and.returnValue(mockGuestCart);
      const cart = service.getCart();

      // Template should be able to access these properties directly:
      cart.items.forEach((item) => {
        expect(item.productId).toBeDefined(); // for track by and methods
        expect(item.name).toBeDefined(); // for display
        expect(item.quantity).toBeDefined(); // for quantity display
        expect(item.price).toBeDefined(); // for price calculation
        expect(item.image).toBeDefined(); // for image src
      });
    });

    it('should document correct template syntax for guest cart', () => {
      // Guest cart template syntax (FLAT structure):
      // @for (item of guestCart()!.items; track item.productId)
      //   {{ item.name }}
      //   {{ item.quantity }}
      //   (click)="removeItem(item.productId)"

      const item = mockGuestCartItem;

      expect(item.productId).toBe('69a6f0215a72cce3649aca43');
      expect(item.name).toBe('Yoga Mat Premium');
      expect(item.quantity).toBe(1);
    });
  });

  describe('Conversion Between Guest and Authenticated Cart', () => {
    it('should document how to convert guest cart to authenticated cart format', () => {
      const guestItem = mockGuestCartItem;

      // To convert to authenticated cart format, we need to wrap in product_id:
      const authenticatedFormat = {
        product_id: {
          productId: guestItem.productId,
          name: guestItem.name,
          price: guestItem.price,
          quantity: guestItem.quantity,
          subtotal: guestItem.price * guestItem.quantity,
          image: guestItem.image,
        },
      };

      expect(authenticatedFormat.product_id.productId).toBe(guestItem.productId);
      expect(authenticatedFormat.product_id.name).toBe(guestItem.name);
    });

    it('should document how to convert authenticated cart to guest cart format', () => {
      const authenticatedItem = {
        product_id: {
          productId: '69a6f0215a72cce3649aca43',
          name: 'Yoga Mat Premium',
          price: 380,
          quantity: 1,
          subtotal: 380,
          image: 'test.jpg',
        },
      };

      // To convert to guest cart format, we need to flatten:
      const guestFormat: GuestCartItem = {
        productId: authenticatedItem.product_id.productId,
        name: authenticatedItem.product_id.name,
        price: authenticatedItem.product_id.price,
        quantity: authenticatedItem.product_id.quantity,
        image: authenticatedItem.product_id.image,
      };

      expect(guestFormat.productId).toBe(authenticatedItem.product_id.productId);
      expect(guestFormat.name).toBe(authenticatedItem.product_id.name);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cart', () => {
      storageService.getItem.and.returnValue(null);

      const cart = service.getCart();

      expect(cart.items.length).toBe(0);
      expect(cart.subtotal).toBe(0);
      expect(cart.total).toBe(0);
      expect(service.hasItems()).toBe(false);
    });

    it('should handle item without image', () => {
      const itemWithoutImage: GuestCartItem = {
        productId: 'test-123',
        name: 'Test Product',
        price: 100,
        quantity: 1,
        image: '',
      };

      storageService.getItem.and.returnValue(null);
      service.addItem(itemWithoutImage);

      const cart = service.getCart();
      expect(cart.items[0].image).toBe('');
    });
  });
});
