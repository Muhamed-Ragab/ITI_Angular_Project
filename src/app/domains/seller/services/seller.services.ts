import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import { CategoryListResponse } from '@domains/categories/dto';
import {
  SellerCreateProductDto,
  SellerUpdateProductDto,
  SellerProductListResponse,
  SellerProductFilters,
  SellerOrdersResponse,
  SellerUpdateStatus,
} from '../dto/seller.dto';

@Injectable({ providedIn: 'root' })
export class SellerService {
  private readonly api = inject(ApiService);

  // ── Products ───────────────────────────────────────────────────────────────

  /** GET /products?seller_id=<me> — only my products */
  getMyProducts(sellerId: string, filters: SellerProductFilters = {}): Observable<SellerProductListResponse> {
    let params = new HttpParams().set('seller_id', sellerId);
    if (filters.page)   params = params.set('page',   String(filters.page));
    if (filters.limit)  params = params.set('limit',  String(filters.limit));
    if (filters.search) params = params.set('search', filters.search);
    if (filters.sort)   params = params.set('sort',   filters.sort);
    return this.api.get<SellerProductListResponse>('/products', params);
  }

  /** POST /products — create a new product */
  createProduct(dto: SellerCreateProductDto): Observable<any> {
    return this.api.post<any>('/products', dto);
  }

  /** PUT /products/:id — update own product */
  updateProduct(id: string, dto: SellerUpdateProductDto): Observable<any> {
    return this.api.put<any>(`/products/${id}`, dto);
  }

  /** DELETE /products/:id — delete own product */
  deleteProduct(id: string): Observable<any> {
    return this.api.delete<any>(`/products/${id}`);
  }

  /** GET /categories — for the product form dropdown */
  getCategories(): Observable<CategoryListResponse> {
    return this.api.get<CategoryListResponse>('/categories');
  }

  // ── Orders ─────────────────────────────────────────────────────────────────

  /** GET /orders/seller — orders containing my products */
  getMyOrders(): Observable<SellerOrdersResponse> {
    return this.api.get<SellerOrdersResponse>('/orders/seller');
  }

  /** PUT /orders/:id/seller-status — update to shipped|delivered|cancelled */
  updateOrderStatus(orderId: string, status: SellerUpdateStatus): Observable<any> {
    return this.api.put<any>(`/orders/${orderId}/seller-status`, { status });
  }

  // ── Payouts ────────────────────────────────────────────────────────────────

  /** POST /users/seller/payouts — request a payout */
  requestPayout(amount: number, note?: string): Observable<any> {
    return this.api.post<any>('/users/seller/payouts', { amount, ...(note ? { note } : {}) });
  }
}