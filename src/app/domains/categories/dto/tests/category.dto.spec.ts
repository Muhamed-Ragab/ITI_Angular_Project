import { describe, expect, it } from 'vitest';
import {
  Category,
  CategoryActionResponse,
  CategoryDetailResponse,
  CategoryListResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../category.dto';

describe('Category DTOs - Comprehensive Unit Tests', () => {
  // ============================================
  // HAPPY PATH - Category Interface
  // ============================================

  describe('Category Interface - Happy Path', () => {
    it('should create valid category with required fields', () => {
      const category: Category = {
        _id: 'cat-123',
        name: 'Electronics',
      };

      expect(category._id).toBe('cat-123');
      expect(category.name).toBe('Electronics');
    });

    it('should create category with all optional fields', () => {
      const category: Category = {
        _id: 'cat-123',
        id: 'cat-123',
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        parentId: null,
        subcategories: [],
        productCount: 50,
        slug: 'electronics',
      };

      expect(category.description).toBe('Electronic devices and gadgets');
      expect(category.parentId).toBeNull();
      expect(category.subcategories).toEqual([]);
      expect(category.productCount).toBe(50);
      expect(category.slug).toBe('electronics');
    });

    it('should handle category with nested subcategories', () => {
      const parentCategory: Category = {
        _id: 'parent-1',
        name: 'Electronics',
        subcategories: [
          { _id: 'child-1', name: 'Phones', parentId: 'parent-1' },
          { _id: 'child-2', name: 'Laptops', parentId: 'parent-1' },
        ],
      };

      expect(parentCategory.subcategories?.length).toBe(2);
      expect(parentCategory.subcategories?.[0].name).toBe('Phones');
      expect(parentCategory.subcategories?.[1].parentId).toBe('parent-1');
    });

    it('should handle deep nested hierarchy', () => {
      const grandparent: Category = {
        _id: 'grandparent',
        name: 'Products',
        subcategories: [
          {
            _id: 'parent',
            name: 'Electronics',
            parentId: 'grandparent',
            subcategories: [
              {
                _id: 'child',
                name: 'Phones',
                parentId: 'parent',
              },
            ],
          },
        ],
      };

      expect(grandparent.subcategories?.[0].subcategories?.[0].name).toBe('Phones');
    });
  });

  // ============================================
  // EDGE CASES - Category Interface
  // ============================================

  describe('Category Interface - Edge Cases', () => {
    it('should handle null parentId', () => {
      const rootCategory: Category = {
        _id: 'root-1',
        name: 'Root Category',
        parentId: null,
      };

      expect(rootCategory.parentId).toBeNull();
    });

    it('should handle undefined parentId', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
      };

      expect(category.parentId).toBeUndefined();
    });

    it('should handle empty subcategories array', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Leaf Category',
        subcategories: [],
      };

      expect(category.subcategories).toEqual([]);
      expect(category.subcategories?.length).toBe(0);
    });

    it('should handle undefined subcategories', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Category',
      };

      expect(category.subcategories).toBeUndefined();
    });

    it('should handle zero product count', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'Empty Category',
        productCount: 0,
      };

      expect(category.productCount).toBe(0);
    });

    it('should handle very long category name', () => {
      const longName = 'a'.repeat(1000);
      const category: Category = {
        _id: 'cat-1',
        name: longName,
      };

      expect(category.name.length).toBe(1000);
    });

    it('should handle unicode category name', () => {
      const category: Category = {
        _id: 'cat-1',
        name: 'إلكترونيات',
      };

      expect(category.name).toBe('إلكترونيات');
    });

    it('should handle special characters in name', () => {
      const category: Category = {
        _id: 'cat-1',
        name: "TV's & Audio Equipment!",
      };

      expect(category.name).toBe("TV's & Audio Equipment!");
    });

    it('should handle empty string name', () => {
      const category: Category = {
        _id: 'cat-1',
        name: '',
      };

      expect(category.name).toBe('');
    });

    it('should handle category with only required fields', () => {
      const category: Category = {
        _id: 'cat-1',
        name: '',
      };

      expect(category._id).toBe('cat-1');
      expect(category.name).toBe('');
    });
  });

  // ============================================
  // SERIALIZATION/DESERIALIZATION - Category
  // ============================================

  describe('Category Serialization Tests', () => {
    it('should serialize category to JSON correctly', () => {
      const category: Category = {
        _id: 'cat-123',
        name: 'Electronics',
        description: 'Electronic items',
        parentId: null,
        productCount: 100,
        slug: 'electronics',
      };

      const json = JSON.stringify(category);
      const parsed = JSON.parse(json);

      expect(parsed._id).toBe('cat-123');
      expect(parsed.name).toBe('Electronics');
      expect(parsed.description).toBe('Electronic items');
      expect(parsed.parentId).toBeNull();
      expect(parsed.productCount).toBe(100);
      expect(parsed.slug).toBe('electronics');
    });

    it('should deserialize from JSON correctly', () => {
      const json = JSON.stringify({
        _id: 'cat-123',
        name: 'Electronics',
        description: 'Electronic items',
        parentId: null,
        subcategories: [],
      });

      const category: Category = JSON.parse(json);

      expect(category._id).toBe('cat-123');
      expect(category.name).toBe('Electronics');
      expect(category.parentId).toBeNull();
    });

    it('should handle nested serialization correctly', () => {
      const category: Category = {
        _id: 'parent',
        name: 'Parent',
        subcategories: [
          { _id: 'child1', name: 'Child 1', parentId: 'parent' },
          { _id: 'child2', name: 'Child 2', parentId: 'parent' },
        ],
      };

      const json = JSON.stringify(category);
      const parsed: Category = JSON.parse(json);

      expect(parsed.subcategories?.length).toBe(2);
      expect(parsed.subcategories?.[0].name).toBe('Child 1');
    });
  });

  // ============================================
  // CategoryListResponse
  // ============================================

  describe('CategoryListResponse - Tests', () => {
    it('should create valid list response', () => {
      const response: CategoryListResponse = {
        success: true,
        data: {
          categories: [
            { _id: 'cat-1', name: 'Electronics' },
            { _id: 'cat-2', name: 'Clothing' },
          ],
        },
      };

      expect(response.success).toBe(true);
      expect(response.data.categories.length).toBe(2);
    });

    it('should handle empty categories array', () => {
      const response: CategoryListResponse = {
        success: true,
        data: {
          categories: [],
        },
      };

      expect(response.data.categories).toEqual([]);
      expect(response.data.categories.length).toBe(0);
    });

    it('should serialize and deserialize list response', () => {
      const response: CategoryListResponse = {
        success: true,
        data: {
          categories: [{ _id: 'cat-1', name: 'Electronics' }],
        },
      };

      const json = JSON.stringify(response);
      const parsed: CategoryListResponse = JSON.parse(json);

      expect(parsed.success).toBe(true);
      expect(parsed.data.categories[0].name).toBe('Electronics');
    });
  });

  // ============================================
  // CategoryDetailResponse
  // ============================================

  describe('CategoryDetailResponse - Tests', () => {
    it('should create valid detail response', () => {
      const response: CategoryDetailResponse = {
        success: true,
        data: {
          _id: 'cat-123',
          name: 'Electronics',
          description: 'Electronic devices',
          productCount: 50,
        },
      };

      expect(response.success).toBe(true);
      expect(response.data.name).toBe('Electronics');
    });

    it('should handle category with nested subcategories', () => {
      const response: CategoryDetailResponse = {
        success: true,
        data: {
          _id: 'cat-123',
          name: 'Electronics',
          subcategories: [{ _id: 'child-1', name: 'Phones', parentId: 'cat-123' }],
        },
      };

      expect(response.data.subcategories?.length).toBe(1);
    });
  });

  // ============================================
  // CategoryActionResponse
  // ============================================

  describe('CategoryActionResponse - Tests', () => {
    it('should create valid action response for create', () => {
      const response: CategoryActionResponse = {
        success: true,
        message: 'Category created successfully',
        data: {
          id: 'new-cat-123',
          name: 'New Category',
        },
      };

      expect(response.success).toBe(true);
      expect(response.message).toBe('Category created successfully');
      expect(response.data?.id).toBe('new-cat-123');
    });

    it('should create valid action response for update', () => {
      const response: CategoryActionResponse = {
        success: true,
        message: 'Category updated successfully',
      };

      expect(response.success).toBe(true);
      expect(response.message).toBe('Category updated successfully');
    });

    it('should create valid action response for delete', () => {
      const response: CategoryActionResponse = {
        success: true,
        message: 'Category deleted successfully',
      };

      expect(response.success).toBe(true);
      expect(response.message).toBe('Category deleted successfully');
    });

    it('should handle action response without data', () => {
      const response: CategoryActionResponse = {
        success: true,
        message: 'Operation completed',
      };

      expect(response.data).toBeUndefined();
    });
  });

  // ============================================
  // CreateCategoryDto
  // ============================================

  describe('CreateCategoryDto - Tests', () => {
    it('should create valid DTO with required fields', () => {
      const dto: CreateCategoryDto = {
        name: 'New Category',
      };

      expect(dto.name).toBe('New Category');
    });

    it('should create valid DTO with all fields', () => {
      const dto: CreateCategoryDto = {
        name: 'Sub Category',
        description: 'A subcategory',
        parentId: 'parent-123',
      };

      expect(dto.name).toBe('Sub Category');
      expect(dto.description).toBe('A subcategory');
      expect(dto.parentId).toBe('parent-123');
    });

    it('should handle null parentId for root category', () => {
      const dto: CreateCategoryDto = {
        name: 'Root Category',
        parentId: null,
      };

      expect(dto.parentId).toBeNull();
    });

    it('should serialize and deserialize CreateCategoryDto', () => {
      const dto: CreateCategoryDto = {
        name: 'Test Category',
        description: 'Test description',
        parentId: 'parent-123',
      };

      const json = JSON.stringify(dto);
      const parsed: CreateCategoryDto = JSON.parse(json);

      expect(parsed.name).toBe('Test Category');
      expect(parsed.description).toBe('Test description');
      expect(parsed.parentId).toBe('parent-123');
    });

    it('should handle DTO with undefined optional fields', () => {
      const dto: CreateCategoryDto = {
        name: 'Category',
      };

      expect(dto.description).toBeUndefined();
      expect(dto.parentId).toBeUndefined();
    });
  });

  // ============================================
  // UpdateCategoryDto
  // ============================================

  describe('UpdateCategoryDto - Tests', () => {
    it('should create valid DTO with name only', () => {
      const dto: UpdateCategoryDto = {
        name: 'Updated Name',
      };

      expect(dto.name).toBe('Updated Name');
    });

    it('should create valid DTO with description only', () => {
      const dto: UpdateCategoryDto = {
        description: 'Updated description',
      };

      expect(dto.description).toBe('Updated description');
    });

    it('should create valid DTO with both fields', () => {
      const dto: UpdateCategoryDto = {
        name: 'New Name',
        description: 'New description',
      };

      expect(dto.name).toBe('New Name');
      expect(dto.description).toBe('New description');
    });

    it('should allow empty object for partial update', () => {
      const dto: UpdateCategoryDto = {};

      expect(dto.name).toBeUndefined();
      expect(dto.description).toBeUndefined();
    });

    it('should serialize and deserialize UpdateCategoryDto', () => {
      const dto: UpdateCategoryDto = {
        name: 'Updated',
        description: 'Description updated',
      };

      const json = JSON.stringify(dto);
      const parsed: UpdateCategoryDto = JSON.parse(json);

      expect(parsed.name).toBe('Updated');
      expect(parsed.description).toBe('Description updated');
    });
  });

  // ============================================
  // TYPE SAFETY TESTS
  // ============================================

  describe('Type Safety Tests', () => {
    it('should enforce required fields in Category', () => {
      const category: Category = {
        _id: 'test-id',
        name: 'Test',
      };

      expect(typeof category._id).toBe('string');
      expect(typeof category.name).toBe('string');
    });

    it('should allow optional fields to be undefined', () => {
      const category: Category = {
        _id: 'test-id',
        name: 'Test',
      };

      expect(category.description).toBeUndefined();
      expect(category.slug).toBeUndefined();
      expect(category.productCount).toBeUndefined();
    });

    it('should enforce string type for parentId when provided', () => {
      const category: Category = {
        _id: 'child',
        name: 'Child',
        parentId: 'parent',
      };

      expect(typeof category.parentId).toBe('string');
    });

    it('should allow null for parentId', () => {
      const category: Category = {
        _id: 'root',
        name: 'Root',
        parentId: null,
      };

      expect(category.parentId).toBeNull();
    });

    it('should enforce CreateCategoryDto required fields', () => {
      const dto: CreateCategoryDto = {
        name: 'Required Name',
      };

      expect(typeof dto.name).toBe('string');
    });
  });
});
