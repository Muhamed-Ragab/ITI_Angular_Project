import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiService } from '@core/services/api.service';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CategoryActionResponse,
  CategoryDetailResponse,
  CategoryListResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../../dto/category.dto';
import { CategoryService } from '../category.service';

// Mock ApiService
const createMockApiService = () => {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
};

describe('CategoryService - Comprehensive Unit Tests', () => {
  let service: CategoryService;
  let mockApiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [CategoryService, { provide: ApiService, useValue: mockApiService }],
    });

    service = TestBed.inject(CategoryService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // getCategories() Tests
  // ============================================

  describe('getCategories() - Happy Path', () => {
    it('should return categories list when API call succeeds', () => {
      const mockResponse: CategoryListResponse = {
        success: true,
        data: {
          categories: [
            { _id: 'cat-1', name: 'Electronics' },
            { _id: 'cat-2', name: 'Clothing' },
          ],
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: CategoryListResponse | undefined;
      service.getCategories().subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith('/categories');
      expect(result?.success).toBe(true);
      expect(result?.data.categories.length).toBe(2);
      expect(result?.data.categories[0].name).toBe('Electronics');
    });

    it('should return empty categories list when no categories exist', () => {
      const mockResponse: CategoryListResponse = {
        success: true,
        data: {
          categories: [],
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: CategoryListResponse | undefined;
      service.getCategories().subscribe((response) => {
        result = response;
      });

      expect(result?.data.categories).toEqual([]);
      expect(result?.data.categories.length).toBe(0);
    });

    it('should return categories with nested subcategories', () => {
      const mockResponse: CategoryListResponse = {
        success: true,
        data: {
          categories: [
            {
              _id: 'cat-1',
              name: 'Electronics',
              subcategories: [{ _id: 'child-1', name: 'Phones', parentId: 'cat-1' }],
            },
          ],
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: CategoryListResponse | undefined;
      service.getCategories().subscribe((response) => {
        result = response;
      });

      expect(result?.data.categories[0].subcategories?.length).toBe(1);
    });
  });

  describe('getCategories() - Error Handling', () => {
    it('should handle 400 Bad Request error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid request parameters' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getCategories().subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });

    it('should handle 500 Internal Server Error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Server error' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getCategories().subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });

    it('should handle network error', () => {
      const errorResponse = new HttpErrorResponse({
        status: 0,
        statusText: 'Unknown Error',
        error: { message: 'Network error' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getCategories().subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(0);
    });
  });

  // ============================================
  // getCategoryById() Tests
  // ============================================

  describe('getCategoryById() - Happy Path', () => {
    it('should return category detail when API call succeeds', () => {
      const categoryId = 'cat-123';
      const mockResponse: CategoryDetailResponse = {
        success: true,
        data: {
          _id: categoryId,
          name: 'Electronics',
          description: 'Electronic devices',
          productCount: 50,
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: CategoryDetailResponse | undefined;
      service.getCategoryById(categoryId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.get).toHaveBeenCalledWith(`/categories/${categoryId}`);
      expect(result?.success).toBe(true);
      expect(result?.data._id).toBe(categoryId);
      expect(result?.data.name).toBe('Electronics');
    });

    it('should return category with all fields', () => {
      const categoryId = 'cat-123';
      const mockResponse: CategoryDetailResponse = {
        success: true,
        data: {
          _id: categoryId,
          id: categoryId,
          name: 'Electronics',
          description: 'Electronic devices',
          parentId: null,
          productCount: 50,
          slug: 'electronics',
        },
      };

      mockApiService.get.mockReturnValue(of(mockResponse));

      let result: CategoryDetailResponse | undefined;
      service.getCategoryById(categoryId).subscribe((response) => {
        result = response;
      });

      expect(result?.data.slug).toBe('electronics');
      expect(result?.data.parentId).toBeNull();
    });
  });

  describe('getCategoryById() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const categoryId = 'non-existent';
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Category not found' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getCategoryById(categoryId).subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
    });

    it('should handle 500 Internal Server Error', () => {
      const categoryId = 'cat-123';
      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Server error' },
      });

      mockApiService.get.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.getCategoryById(categoryId).subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // createCategory() Tests
  // ============================================

  describe('createCategory() - Happy Path', () => {
    it('should create root category when API call succeeds', () => {
      const dto: CreateCategoryDto = {
        name: 'New Category',
        description: 'A new category',
      };

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Category created successfully',
        data: {
          id: 'new-cat-123',
          name: 'New Category',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.createCategory(dto).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/categories', dto);
      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Category created successfully');
      expect(result?.data?.id).toBe('new-cat-123');
    });

    it('should create subcategory with parentId', () => {
      const dto: CreateCategoryDto = {
        name: 'Phones',
        description: 'Mobile phones',
        parentId: 'parent-cat-123',
      };

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Category created successfully',
        data: {
          id: 'phone-cat',
          name: 'Phones',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.createCategory(dto).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.post).toHaveBeenCalledWith('/categories', dto);
      expect(result?.data?.name).toBe('Phones');
    });

    it('should create root category with null parentId', () => {
      const dto: CreateCategoryDto = {
        name: 'Root Category',
        parentId: null,
      };

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Category created successfully',
        data: {
          id: 'root-cat',
          name: 'Root Category',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.createCategory(dto).subscribe((response) => {
        result = response;
      });

      expect(result?.data?.id).toBe('root-cat');
    });

    it('should create category with minimum required fields', () => {
      const dto: CreateCategoryDto = {
        name: 'Minimal Category',
      };

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Category created successfully',
        data: {
          id: 'min-cat',
          name: 'Minimal Category',
        },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.createCategory(dto).subscribe((response) => {
        result = response;
      });

      expect(result?.success).toBe(true);
    });
  });

  describe('createCategory() - Error Handling', () => {
    it('should handle 400 Bad Request error', () => {
      const dto: CreateCategoryDto = {
        name: '',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Category name is required' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createCategory(dto).subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });

    it('should handle 500 Internal Server Error', () => {
      const dto: CreateCategoryDto = {
        name: 'New Category',
      };

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to create category' },
      });

      mockApiService.post.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.createCategory(dto).subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // updateCategory() Tests
  // ============================================

  describe('updateCategory() - Happy Path', () => {
    it('should update category name when API call succeeds', () => {
      const categoryId = 'cat-123';
      const dto: UpdateCategoryDto = {
        name: 'Updated Name',
      };

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Category updated successfully',
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.updateCategory(categoryId, dto).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.put).toHaveBeenCalledWith(`/categories/${categoryId}`, dto);
      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Category updated successfully');
    });

    it('should update category description', () => {
      const categoryId = 'cat-123';
      const dto: UpdateCategoryDto = {
        description: 'Updated description',
      };

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Category updated successfully',
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.updateCategory(categoryId, dto).subscribe((response) => {
        result = response;
      });

      expect(result?.success).toBe(true);
    });

    it('should update both name and description', () => {
      const categoryId = 'cat-123';
      const dto: UpdateCategoryDto = {
        name: 'New Name',
        description: 'New description',
      };

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Category updated successfully',
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.updateCategory(categoryId, dto).subscribe((response) => {
        result = response;
      });

      expect(result?.success).toBe(true);
    });

    it('should handle empty update DTO', () => {
      const categoryId = 'cat-123';
      const dto: UpdateCategoryDto = {};

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Category updated successfully',
      };

      mockApiService.put.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.updateCategory(categoryId, dto).subscribe((response) => {
        result = response;
      });

      expect(result?.success).toBe(true);
    });
  });

  describe('updateCategory() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const categoryId = 'non-existent';
      const dto: UpdateCategoryDto = {
        name: 'Updated Name',
      };

      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Category not found' },
      });

      mockApiService.put.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.updateCategory(categoryId, dto).subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
    });

    it('should handle 400 Bad Request error for invalid data', () => {
      const categoryId = 'cat-123';
      const dto: UpdateCategoryDto = {
        name: '',
      };

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Invalid category data' },
      });

      mockApiService.put.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.updateCategory(categoryId, dto).subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
    });

    it('should handle 500 Internal Server Error', () => {
      const categoryId = 'cat-123';
      const dto: UpdateCategoryDto = {
        name: 'Updated Name',
      };

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to update category' },
      });

      mockApiService.put.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.updateCategory(categoryId, dto).subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // deleteCategory() Tests
  // ============================================

  describe('deleteCategory() - Happy Path', () => {
    it('should delete category when API call succeeds', () => {
      const categoryId = 'cat-123';

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Category deleted successfully',
      };

      mockApiService.delete.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.deleteCategory(categoryId).subscribe((response) => {
        result = response;
      });

      expect(mockApiService.delete).toHaveBeenCalledWith(`/categories/${categoryId}`);
      expect(result?.success).toBe(true);
      expect(result?.message).toBe('Category deleted successfully');
    });

    it('should return success with deleted category info', () => {
      const categoryId = 'cat-123';

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Category deleted successfully',
        data: {
          id: categoryId,
          name: 'Deleted Category',
        },
      };

      mockApiService.delete.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.deleteCategory(categoryId).subscribe((response) => {
        result = response;
      });

      expect(result?.data?.id).toBe(categoryId);
    });
  });

  describe('deleteCategory() - Error Handling', () => {
    it('should handle 404 Not Found error', () => {
      const categoryId = 'non-existent';

      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Category not found' },
      });

      mockApiService.delete.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.deleteCategory(categoryId).subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(404);
    });

    it('should handle 400 Bad Request when category has products', () => {
      const categoryId = 'cat-123';

      const errorResponse = new HttpErrorResponse({
        status: 400,
        statusText: 'Bad Request',
        error: { message: 'Cannot delete category with existing products' },
      });

      mockApiService.delete.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.deleteCategory(categoryId).subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(400);
      expect(caughtError?.error.message).toContain('products');
    });

    it('should handle 500 Internal Server Error', () => {
      const categoryId = 'cat-123';

      const errorResponse = new HttpErrorResponse({
        status: 500,
        statusText: 'Internal Server Error',
        error: { message: 'Failed to delete category' },
      });

      mockApiService.delete.mockReturnValue(throwError(() => errorResponse));

      let caughtError: HttpErrorResponse | undefined;
      service.deleteCategory(categoryId).subscribe({
        next: () => { throw new Error('should have thrown an error'); },
        error: (err) => {
          caughtError = err;
        },
      });

      expect(caughtError?.status).toBe(500);
    });
  });

  // ============================================
  // Service Integration Tests
  // ============================================

  describe('Service Integration - Multiple Operations', () => {
    it('should handle creating, updating, and deleting categories in sequence', () => {
      // Create
      const createDto: CreateCategoryDto = { name: 'Test Category' };
      const createResponse: CategoryActionResponse = {
        success: true,
        message: 'Created',
        data: { id: 'new-id', name: 'Test Category' },
      };

      mockApiService.post.mockReturnValue(of(createResponse));

      let createResult: CategoryActionResponse | undefined;
      service.createCategory(createDto).subscribe((r) => (createResult = r));

      expect(createResult?.success).toBe(true);

      // Update
      const updateDto: UpdateCategoryDto = { name: 'Updated Category' };
      const updateResponse: CategoryActionResponse = {
        success: true,
        message: 'Updated',
      };

      mockApiService.put.mockReturnValue(of(updateResponse));

      let updateResult: CategoryActionResponse | undefined;
      service.updateCategory('new-id', updateDto).subscribe((r) => (updateResult = r));

      expect(updateResult?.success).toBe(true);

      // Delete
      const deleteResponse: CategoryActionResponse = {
        success: true,
        message: 'Deleted',
      };

      mockApiService.delete.mockReturnValue(of(deleteResponse));

      let deleteResult: CategoryActionResponse | undefined;
      service.deleteCategory('new-id').subscribe((r) => (deleteResult = r));

      expect(deleteResult?.success).toBe(true);
    });

    it('should call correct HTTP methods for each operation', () => {
      // getCategories uses GET
      mockApiService.get.mockReturnValue(of({ success: true, data: { categories: [] } }));
      service.getCategories().subscribe();
      expect(mockApiService.get).toHaveBeenCalledTimes(1);

      // getCategoryById uses GET
      mockApiService.get.mockReturnValue(of({ success: true, data: { _id: '1', name: 'Test' } }));
      service.getCategoryById('1').subscribe();
      expect(mockApiService.get).toHaveBeenCalledTimes(2);

      // createCategory uses POST
      mockApiService.post.mockReturnValue(of({ success: true, message: 'Created' }));
      service.createCategory({ name: 'Test' }).subscribe();
      expect(mockApiService.post).toHaveBeenCalledTimes(1);

      // updateCategory uses PUT
      mockApiService.put.mockReturnValue(of({ success: true, message: 'Updated' }));
      service.updateCategory('1', { name: 'Test' }).subscribe();
      expect(mockApiService.put).toHaveBeenCalledTimes(1);

      // deleteCategory uses DELETE
      mockApiService.delete.mockReturnValue(of({ success: true, message: 'Deleted' }));
      service.deleteCategory('1').subscribe();
      expect(mockApiService.delete).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================

  describe('Edge Cases', () => {
    it('should handle very long category ID', () => {
      const longId = 'a'.repeat(500);

      mockApiService.get.mockReturnValue(
        of({
          success: true,
          data: { _id: longId, name: 'Test' },
        }),
      );

      let result: CategoryDetailResponse | undefined;
      service.getCategoryById(longId).subscribe((r) => (result = r));

      expect(result?.data._id).toBe(longId);
    });

    it('should handle special characters in category data', () => {
      const createDto: CreateCategoryDto = {
        name: "Electronics & Gadget's <Tags>",
        description: 'Description with "quotes" and <special> chars',
      };

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Created',
        data: { id: 'new-id', name: createDto.name },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.createCategory(createDto).subscribe((r) => (result = r));

      expect(result?.data?.name).toBe(createDto.name);
    });

    it('should handle unicode characters in category data', () => {
      const createDto: CreateCategoryDto = {
        name: 'إلكترونيات',
        description: '电子设备',
      };

      const mockResponse: CategoryActionResponse = {
        success: true,
        message: 'Created',
        data: { id: 'new-id', name: createDto.name },
      };

      mockApiService.post.mockReturnValue(of(mockResponse));

      let result: CategoryActionResponse | undefined;
      service.createCategory(createDto).subscribe((r) => (result = r));

      expect(result?.data?.name).toBe('إلكترونيات');
    });

    it('should handle category ID with special characters', () => {
      const specialId = 'cat-id-with-dashes_underscores';

      mockApiService.get.mockReturnValue(
        of({
          success: true,
          data: { _id: specialId, name: 'Test' },
        }),
      );

      let result: CategoryDetailResponse | undefined;
      service.getCategoryById(specialId).subscribe((r) => (result = r));

      expect(mockApiService.get).toHaveBeenCalledWith(`/categories/${specialId}`);
    });
  });
});
