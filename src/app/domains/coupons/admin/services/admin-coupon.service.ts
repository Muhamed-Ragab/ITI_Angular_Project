import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';
import {
  AdminCouponResponse,
  AdminCouponListResponse,
  AdminCouponActionResponse,
  AdminCouponStatsResponse,
  AdminValidateCouponResponse,
  CouponFilters,
} from '../dto';
import { CreateCouponRequest } from '../dto/create-coupon-request.dto';
import { UpdateCouponRequest } from '../dto/update-coupon-request.dto';
import { ValidateCouponRequest } from '../dto/validate-coupon-request.dto';

@Injectable({ providedIn: 'root' })
export class AdminCouponService {
  private readonly api = inject(ApiService);

  /**
   * GET /coupons/admin - paginated list with filters
   */
  getCoupons(filters: CouponFilters = {}): Observable<AdminCouponListResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.api.get<AdminCouponListResponse>('/coupons', params);
  }

  /**
   * GET /coupons/:id - single coupon details
   */
  getCouponById(id: string): Observable<AdminCouponResponse> {
    return this.api.get<AdminCouponResponse>(`/coupons/${id}`);
  }

  /**
   * POST /coupons - create new coupon
   */
  createCoupon(request: CreateCouponRequest): Observable<AdminCouponActionResponse> {
    return this.api.post<AdminCouponActionResponse>('/coupons', request);
  }

  /**
   * PUT /coupons/:id - update coupon
   */
  updateCoupon(id: string, request: UpdateCouponRequest): Observable<AdminCouponResponse> {
    return this.api.put<AdminCouponResponse>(`/coupons/${id}`, request);
  }

  /**
   * DELETE /coupons/:id - delete coupon
   */
  deleteCoupon(id: string): Observable<AdminCouponActionResponse> {
    return this.api.delete<AdminCouponActionResponse>(`/coupons/${id}`);
  }

  /**
   * PUT /coupons/:id - activate coupon (update is_active to true)
   */
  activateCoupon(id: string): Observable<AdminCouponResponse> {
    return this.api.put<AdminCouponResponse>(`/coupons/${id}`, { is_active: true });
  }

  /**
   * PUT /coupons/:id - deactivate coupon (update is_active to false)
   */
  deactivateCoupon(id: string): Observable<AdminCouponResponse> {
    return this.api.put<AdminCouponResponse>(`/coupons/${id}`, { is_active: false });
  }

  /**
   * POST /coupons/admin/validate - validate coupon
   */
  validateCoupon(request: ValidateCouponRequest): Observable<AdminValidateCouponResponse> {
    return this.api.post<AdminValidateCouponResponse>('/coupons/validate', request);
  }

  /**
   * GET /coupons/admin/:id/stats - coupon usage statistics
   */
  getCouponStats(id: string): Observable<AdminCouponStatsResponse> {
    return this.api.get<AdminCouponStatsResponse>(`/coupons/${id}`);
  }
}
