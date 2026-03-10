import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { CategoryListResponse } from '@domains/categories/dto';
import {
  SellerCreateProductDto,
  SellerUpdateProductDto,
  SellerProductListResponse,
  //SellerProductDetailResponse,
  SellerProductActionResponse,
  SellerProductFilters,
  SellerOrdersResponse,
  SellerUpdateStatus,
} from '../dto/seller.dto';

@Injectable({ providedIn: 'root' })
export class SellerService {
  private readonly api = inject(ApiService);

  // ── Products ───────────────────────────────────────────────────────────────

  /** GET /products?seller_id=me — lists seller's own products */
  getMyProducts(filters: SellerProductFilters = {}): Observable<SellerProductListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.api.get<SellerProductListResponse>('/products', params);
  }

  /** POST /products — create product */
  createProduct(dto: SellerCreateProductDto): Observable<SellerProductActionResponse> {
    return this.api.post<SellerProductActionResponse>('/products', dto);
  }

  /** PUT /products/:id — update own product */
  updateProduct(id: string, dto: SellerUpdateProductDto): Observable<SellerProductActionResponse> {
    return this.api.put<SellerProductActionResponse>(`/products/${id}`, dto);
  }

  /** DELETE /products/:id — delete own product */
  deleteProduct(id: string): Observable<SellerProductActionResponse> {
    return this.api.delete<SellerProductActionResponse>(`/products/${id}`);
  }

  /** GET /categories */
  getCategories(): Observable<CategoryListResponse> {
    return this.api.get<CategoryListResponse>('/categories');
  }

  // ── Orders ─────────────────────────────────────────────────────────────────

  /** GET /orders/seller — seller's orders */
  getMyOrders(): Observable<SellerOrdersResponse> {
    return this.api.get<SellerOrdersResponse>('/orders/seller');
  }

  /** PUT /orders/:id/seller-status — update order status (shipped|delivered|cancelled) */
  updateOrderStatus(orderId: string, status: SellerUpdateStatus): Observable<any> {
    return this.api.put<any>(`/orders/${orderId}/seller-status`, { status });
  }

  // ── Payouts ────────────────────────────────────────────────────────────────

  /** POST /users/seller/payouts — request payout */
  requestPayout(amount: number, note?: string): Observable<any> {
    return this.api.post<any>('/users/seller/payouts', { amount, note });
  }
}
