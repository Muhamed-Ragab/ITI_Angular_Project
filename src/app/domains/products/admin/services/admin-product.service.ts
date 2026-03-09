import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@core/services/api.service';
import {
  AdminProductListResponse,
  AdminProductDetailResponse,
  AdminProductActionResponse,
  AdminCreateProductDto,
  AdminUpdateProductDto,
  AdminProductFilters,
  SellerListResponse,
  SellerUser,
} from '../dto';
import { CategoryListResponse } from '@domains/categories/dto';

@Injectable({ providedIn: 'root' })
export class AdminProductService {
  private readonly api = inject(ApiService);

  // ── Products ───────────────────────────────────────────────────────────────

  getProducts(filters: AdminProductFilters = {}): Observable<AdminProductListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.api.get<AdminProductListResponse>('/products', params);
  }

  getProductById(id: string): Observable<AdminProductDetailResponse> {
    return this.api.get<AdminProductDetailResponse>(`/products/${id}`);
  }

  createProduct(dto: AdminCreateProductDto): Observable<AdminProductActionResponse> {
    return this.api.post<AdminProductActionResponse>('/products/admin', dto);
  }

  updateProduct(id: string, dto: AdminUpdateProductDto): Observable<AdminProductActionResponse> {
    return this.api.put<AdminProductActionResponse>(`/products/admin/${id}`, dto);
  }

  deleteProduct(id: string): Observable<AdminProductActionResponse> {
    return this.api.delete<AdminProductActionResponse>(`/products/admin/${id}`);
  }

  // ── Support data ───────────────────────────────────────────────────────────

  // GET /users?role=seller
  // Real API returns: { success, data: User[] } — flat array, each user has _id not id
  getSellers(): Observable<SellerUser[]> {
    const params = new HttpParams().set('role', 'seller').set('limit', '100');
    return this.api.get<{ success: boolean; data: any[] }>('/users', params).pipe(
      map(res => (res.data ?? []).map((u: any) => ({
        id:    u._id ?? u.id,        // API returns _id
        name:  u.seller_profile?.store_name ?? u.name,  // prefer store name
        email: u.email,
      } as SellerUser)))
    );
  }

  getCategories(): Observable<CategoryListResponse> {
    return this.api.get<CategoryListResponse>('/categories');
  }
}