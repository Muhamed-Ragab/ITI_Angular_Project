import { describe, it, expect } from 'vitest';
import { Category } from '../category.dto';

describe('CategoryDto - Comprehensive Unit Tests', () => {
  // ============================================
  // HAPPY PATH TESTS
  // ============================================

  describe('Happy Path - Valid Category', () => {
    it('should create valid category with all required properties', () => {
      const category: Category = {
        _id: 'cat-123',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and accessories',
        image: 'https://example.com/electronics.jpg',
        parentId: null,
      };

      expect(category._id).toBe('cat-123');
      expect(category.name).toBe('Electronics');
      expect(category.slug).toBe('electronics');
      expect(category.description).toBe('Electronic devices and accessories');
      expect(category.image).toBe('https://example.com/electronics.jpg');
      expect(category.parentId).toBeNull();
    });

    it('should create category with all optional properties', () => {
      const category: Category = {
        _id: 'cat-456',
        id: 'cat-456',
        name: 'Clothing',
        slug: 'clothing',
        description: 'Fashion and apparel',
        image: 'https://example.com/clothing.jpg',
        parentId: 'parent-cat-1',
        subcategories: [],
      };

      expect(category._id).toBe('cat-456');
      expect(category.id).toBe('cat-456');
      expect(category.name).toBe('Clothing');
      expect(category.slug).toBe('clothing');
      expect(category.parentId).toBe('parent-cat-1');
      expect(category.subcategories).toEqual([]);
    });

    it('should handle category with subcategories', () => {
      const subcategory: Category = {
        _id: 'sub-cat-1',
        name: 'Smartphones',
        slug: 'smartphones',
        image: 'https://example.com/smartphones.jpg',
      };

      const parentCategory: Category = {
        _id: 'cat-electronics',
        name: 'Electronics',
        slug: 'electronics',
        image: 'https://example.com/electronics.jpg',
        subcategories: [subcategory],
      };

      expect(parentCategory.subcategories).toHaveLength(1);
      expect(parentCategory.subcategories?.[0].name).toBe('Smartphones');
    });

    it('should handle multiple nested subcategories', () => {
      const deepSubcategory: Category = {
        _id: 'deep-sub',
        name: 'Android Phones',
        slug: 'android-phones',
        image: 'https://example.com/android.jpg',
      };

      const subcategory: Category = {
        _id: 'sub-cat',
        name: 'Smartphones',
        slug: 'smartphones',
        image: 'https://example.com/smartphones.jpg',
        subcategories: [deepSubcategory],
      };

      const parent: Category = {
        _id: 'parent',
        name: 'Electronics',
        slug: 'electronics',
        image: 'https://example.com/electronics.jpg',
        subcategories: [subcategory],
      };

      expect(parent.subcategories?.[0].subcategories?.[0].name).toBe('Android Phones');
    });
  });

  // ============================================
  // NULL/EMPTY INPUT TESTS
  // ============================================

  describe('Null/Empty Input Tests', () => {
    it('should handle empty string _id', () => {
      const category: Category = {
        _id: '',
        name: 'Category',
      };

      expect(category._id).toBe('');
    });

    it('should handle empty string name', () => {
      const category: Category = {
        _id: 'cat-1',
        name: '',
      };

      expect(category.name).toBe('');
    });

    it('should handle empty string slug', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        slug: '',
      };

      expect(category.slug).toBe('');
    });

    it('should handle null image', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        image: null,
      };

      expect(category.image).toBeNull();
    });

    it('should handle null parentId', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        parentId: null,
      };

      expect(category.parentId).toBeNull();
    });

    it('should handle null description', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        description: null,
      };

      expect(category.description).toBeNull();
    });

    it('should handle undefined optional properties', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
      };

      expect(category.slug).toBeUndefined();
      expect(category.description).toBeUndefined();
      expect(category.image).toBeUndefined();
      expect(category.parentId).toBeUndefined();
      expect(category.subcategories).toBeUndefined();
    });

    it('should handle whitespace-only strings', () => {
      const category: Category = {
        _id: '   ',
        name: '   ',
        slug: '   ',
        description: '   ',
      };

      expect(category._id).toBe('   ');
      expect(category.name).toBe('   ');
    });
  });

  // ============================================
  // EDGE CASES - Product Count (via subcategories)
  // ============================================

  describe('Edge Cases - Zero Products / Empty Subcategories', () => {
    it('should handle empty subcategories array', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Empty Category',
        subcategories: [],
      };

      expect(category.subcategories).toEqual([]);
      expect(category.subcategories).toHaveLength(0);
    });

    it('should handle category without subcategories', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Leaf Category',
      };

      expect(category.subcategories).toBeUndefined();
    });

    it('should handle deeply nested empty categories', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Parent',
        subcategories: [
          {
            _id: 'cat-2',
            name: 'Child',
            subcategories: [],
          },
        ],
      };

      expect(category.subcategories?.[0].subcategories).toEqual([]);
    });
  });

  // ============================================
  // EDGE CASES - Special Characters
  // ============================================

  describe('Edge Cases - Special Characters', () => {
    it('should handle unicode characters in name', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Électronique',
        slug: 'electronique',
      };

      expect(category.name).toBe('Électronique');
    });

    it('should handle arabic characters in name', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'إلكترونيات',
        slug: 'electronics-ar',
      };

      expect(category.name).toBe('إلكترونيات');
    });

    it('should handle chinese characters in name', () => {
      const category: Category = {
        _id: 'cat-1',
        name: '电子产品',
        slug: 'electronics-zh',
      };

      expect(category.name).toBe('电子产品');
    });

    it('should handle special characters in slug', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Test Category',
        slug: 'test-category_123',
      };

      expect(category.slug).toBe('test-category_123');
    });

    it('should handle HTML in description', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        description: '<p>This is <strong>bold</strong> text</p>',
      };

      expect(category.description).toContain('<p>');
      expect(category.description).toContain('<strong>');
    });

    it('should handle emoji in name', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Gaming 🎮',
        slug: 'gaming',
      };

      expect(category.name).toContain('🎮');
    });
  });

  // ============================================
  // EDGE CASES - Image Values
  // ============================================

  describe('Edge Cases - Image Values', () => {
    it('should handle valid HTTPS image URL', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        image: 'https://cdn.example.com/category-image.jpg',
      };

      expect(category.image).toBe('https://cdn.example.com/category-image.jpg');
    });

    it('should handle HTTP image URL', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        image: 'http://example.com/image.jpg',
      };

      expect(category.image).toBe('http://example.com/image.jpg');
    });

    it('should handle relative image path', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        image: '/assets/categories/cat1.png',
      };

      expect(category.image).toBe('/assets/categories/cat1.png');
    });

    it('should handle image URL with query parameters', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        image: 'https://example.com/image.jpg?width=200&height=200',
      };

      expect(category.image).toContain('?width=200');
    });

    it('should handle data URI for images', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0icmVkIi8+PC9zdmc+',
      };

      expect(category.image).toContain('data:image/svg+xml');
    });
  });

  // ============================================
  // SERIALIZATION TESTS
  // ============================================

  describe('Serialization Tests', () => {
    it('should serialize to JSON correctly', () => {
      const category: Category = {
        _id: 'cat-123',
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic items',
        image: 'https://example.com/electronics.jpg',
        parentId: null,
        subcategories: [],
      };

      const json = JSON.stringify(category);
      expect(json).toContain('"_id":"cat-123"');
      expect(json).toContain('"name":"Electronics"');
      expect(json).toContain('"slug":"electronics"');
    });

    it('should deserialize from JSON correctly', () => {
      const json = '{"_id":"cat-456","name":"Clothing","slug":"clothing","description":"Fashion","image":"https://example.com/clothing.jpg","parentId":null,"subcategories":[]}';
      const category: Category = JSON.parse(json);

      expect(category._id).toBe('cat-456');
      expect(category.name).toBe('Clothing');
      expect(category.slug).toBe('clothing');
      expect(category.parentId).toBeNull();
    });

    it('should handle JSON serialization with special characters', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Test "quoted" name',
        description: 'Description with <html> tags',
      };

      const json = JSON.stringify(category);
      const parsed = JSON.parse(json);
      expect(parsed.name).toBe('Test "quoted" name');
      expect(parsed.description).toContain('<html>');
    });

    it('should handle serialization with undefined properties', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
      };

      const json = JSON.stringify(category);
      expect(json).toBe('{"_id":"cat-1","name":"Category"}');
    });

    it('should serialize nested subcategories', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Parent',
        subcategories: [
          {
            _id: 'cat-2',
            name: 'Child',
          },
        ],
      };

      const json = JSON.stringify(category);
      expect(json).toContain('"subcategories"');
      expect(json).toContain('"name":"Child"');
    });
  });

  // ============================================
  // TYPE SAFETY TESTS
  // ============================================

  describe('Type Safety Tests', () => {
    it('should enforce string type for _id', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
      };

      expect(typeof category._id).toBe('string');
      expect(typeof category.name).toBe('string');
    });

    it('should allow optional string for slug', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
      };

      expect(category.slug).toBeUndefined();
    });

    it('should allow null for image', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        image: null,
      };

      expect(category.image).toBeNull();
    });

    it('should allow null for parentId', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        parentId: null,
      };

      expect(category.parentId).toBeNull();
    });

    it('should allow Category array for subcategories', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Parent',
        subcategories: [
          { _id: 'sub-1', name: 'Sub 1' },
          { _id: 'sub-2', name: 'Sub 2' },
        ],
      };

      expect(Array.isArray(category.subcategories)).toBe(true);
      expect(category.subcategories).toHaveLength(2);
    });
  });

  // ============================================
  // CLONING/MUTATION TESTS
  // ============================================

  describe('Cloning/Mutation Tests', () => {
    it('should create a shallow copy of the object', () => {
      const original: Category = {
        _id: 'cat-1',
        name: 'Original Category',
        slug: 'original',
        description: 'Original Description',
      };

      const copy = { ...original };
      copy.name = 'Modified Category';
      copy.slug = 'modified';

      expect(original.name).toBe('Original Category');
      expect(original.slug).toBe('original');
      expect(copy.name).toBe('Modified Category');
      expect(copy.slug).toBe('modified');
    });

    it('should preserve original object when mutating copy', () => {
      const original: Category = {
        _id: 'cat-1',
        name: 'Category',
        description: 'Description',
      };

      const copy = JSON.parse(JSON.stringify(original));
      copy.description = 'New Description';

      expect(original.description).toBe('Description');
      expect(copy.description).toBe('New Description');
    });

    it('should handle deep clone of nested subcategories', () => {
      const original: Category = {
        _id: 'cat-1',
        name: 'Parent',
        subcategories: [
          {
            _id: 'sub-1',
            name: 'Child',
          },
        ],
      };

      const copy = JSON.parse(JSON.stringify(original));
      copy.subcategories[0].name = 'Modified Child';

      expect(original.subcategories[0].name).toBe('Child');
      expect(copy.subcategories[0].name).toBe('Modified Child');
    });

    it('should handle Object.assign correctly', () => {
      const original: Category = {
        _id: 'cat-1',
        name: 'Category',
      };

      const copy = Object.assign({}, original);
      copy.name = 'New Name';

      expect(original.name).toBe('Category');
      expect(copy.name).toBe('New Name');
    });
  });

  // ============================================
  // EDGE CASES - Slug Values
  // ============================================

  describe('Edge Cases - Slug Values', () => {
    it('should handle URL-friendly slug', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Home & Garden',
        slug: 'home-and-garden',
      };

      expect(category.slug).toBe('home-and-garden');
    });

    it('should handle numeric slug', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category 2024',
        slug: 'category-2024',
      };

      expect(category.slug).toBe('category-2024');
    });

    it('should handle single word slug', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Books',
        slug: 'books',
      };

      expect(category.slug).toBe('books');
    });

    it('should handle slug with numbers', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
        slug: 'category-123-abc',
      };

      expect(category.slug).toBe('category-123-abc');
    });
  });

  // ============================================
  // EDGE CASES - Parent/Child Relationships
  // ============================================

  describe('Edge Cases - Parent/Child Relationships', () => {
    it('should handle root category (no parent)', () => {
      const category: Category = {
        _id: 'root-1',
        name: 'Root Category',
        parentId: null,
      };

      expect(category.parentId).toBeNull();
    });

    it('should handle child category with parent', () => {
      const category: Category = {
        _id: 'child-1',
        name: 'Child Category',
        parentId: 'parent-1',
      };

      expect(category.parentId).toBe('parent-1');
    });

    it('should handle multiple levels of hierarchy', () => {
      const grandchild: Category = {
        _id: 'grandchild',
        name: 'Grandchild',
        parentId: 'child',
      };

      const child: Category = {
        _id: 'child',
        name: 'Child',
        parentId: 'parent',
        subcategories: [grandchild],
      };

      const parent: Category = {
        _id: 'parent',
        name: 'Parent',
        parentId: null,
        subcategories: [child],
      };

      expect(parent.parentId).toBeNull();
      expect(parent.subcategories?.[0].parentId).toBe('parent');
      expect(parent.subcategories?.[0].subcategories?.[0].parentId).toBe('child');
    });
  });
});
