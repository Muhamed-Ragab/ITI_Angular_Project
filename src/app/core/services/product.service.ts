import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateReviewDto,
  ProductDetailResponse,
  ProductFilters,
  ProductListResponse,
} from '@domains/products/dto';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly api = inject(ApiService);

  getProducts(filters: ProductFilters = {}): Observable<ProductListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.api.get<ProductListResponse>('/products', params);
  }

  // ← ADD THIS
  getProductById(id: string): Observable<ProductDetailResponse> {
    return this.api.get<ProductDetailResponse>(`/products/${id}`);
  }

  getProductsByIds(ids: string[]): Observable<BatchProductResponse> {
    return this.api.post<BatchProductResponse>('/products/batch', { ids });
  }

  // ← ADD THIS (for the review form)
  createReview(body: CreateReviewDto): Observable<void> {
    return this.api.post<void>('/reviews', body);
  }
}
