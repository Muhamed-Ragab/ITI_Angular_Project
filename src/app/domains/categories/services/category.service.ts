import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import {
  CategoryListResponse,
  CategoryDetailResponse,
  CategoryActionResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../dto';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly api = inject(ApiService);

  // ── Public ────────────────────────────────────────────────────────────────

  /** GET /categories — tree of all categories */
  getCategories(): Observable<CategoryListResponse> {
    return this.api.get<CategoryListResponse>('/categories');
  }

  /** GET /categories/:id — single category with productCount */
  getCategoryById(id: string): Observable<CategoryDetailResponse> {
    return this.api.get<CategoryDetailResponse>(`/categories/${id}`);
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  /** POST /categories — create root or sub category */
  createCategory(dto: CreateCategoryDto): Observable<CategoryActionResponse> {
    return this.api.post<CategoryActionResponse>('/categories', dto);
  }

  /** PUT /categories/:id — rename / redescribe */
  updateCategory(id: string, dto: UpdateCategoryDto): Observable<CategoryActionResponse> {
    return this.api.put<CategoryActionResponse>(`/categories/${id}`, dto);
  }

  /** DELETE /categories/:id — fails if category has products */
  deleteCategory(id: string): Observable<CategoryActionResponse> {
    return this.api.delete<CategoryActionResponse>(`/categories/${id}`);
  }
}