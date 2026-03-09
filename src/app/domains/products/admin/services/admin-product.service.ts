import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import {
  AdminProductListResponse,
  AdminProductDetailResponse,
  AdminProductActionResponse,
  AdminCreateProductDto,
  AdminUpdateProductDto,
  AdminProductFilters,
  SellerListResponse,
} from '../dto';
import { CategoryListResponse } from '@domains/categories/dto';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private readonly api = inject(ApiService);

  // ── Products ───────────────────────────────────────────────────────────────

  /** GET /products — paginated + filterable list (public endpoint) */
  getProducts(filters: AdminProductFilters = {}): Observable<AdminProductListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.api.get<AdminProductListResponse>('/products', params);
  }

  /** GET /products/:id */
  getProductById(id: string): Observable<AdminProductDetailResponse> {
    return this.api.get<AdminProductDetailResponse>(`/products/${id}`);
  }

  /** POST /products/admin — admin creates product on behalf of a seller */
  createProduct(dto: AdminCreateProductDto): Observable<AdminProductActionResponse> {
    return this.api.post<AdminProductActionResponse>('/products/admin', dto);
  }

  /** PUT /products/admin/:id — admin updates any product */
  updateProduct(id: string, dto: AdminUpdateProductDto): Observable<AdminProductActionResponse> {
    return this.api.put<AdminProductActionResponse>(`/products/admin/${id}`, dto);
  }

  /** DELETE /products/admin/:id — admin deletes any product */
  deleteProduct(id: string): Observable<AdminProductActionResponse> {
    return this.api.delete<AdminProductActionResponse>(`/products/admin/${id}`);
  }

  // ── Support data ───────────────────────────────────────────────────────────

  /** GET /users?role=seller — fetch sellers for the product form dropdown */
  getSellers(): Observable<SellerListResponse> {
    const params = new HttpParams().set('role', 'seller').set('limit', '100');
    return this.api.get<SellerListResponse>('/users', params);
  }

  /** GET /categories — fetch categories for the product form dropdown */
  getCategories(): Observable<CategoryListResponse> {
    return this.api.get<CategoryListResponse>('/categories');
  }
}