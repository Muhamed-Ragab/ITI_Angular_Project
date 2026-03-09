import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { AdminCouponService } from './admin-coupon.service';
import {
  Coupon,
  CouponUsageStats,
  CouponFilters,
  AdminCouponPagination,
} from '../dto';
import { CreateCouponRequest } from '../dto/create-coupon-request.dto';
import { UpdateCouponRequest } from '../dto/update-coupon-request.dto';
import { ValidateCouponRequest } from '../dto/validate-coupon-request.dto';
import { ValidateCouponResponse } from '../dto/validate-coupon-response.dto';

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class AdminCouponFacadeService {
  private readonly couponService = inject(AdminCouponService);

  // State signals
  readonly coupons = signal<Coupon[]>([]);
  readonly currentCoupon = signal<Coupon | null>(null);
  readonly couponStats = signal<CouponUsageStats | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly pagination = signal<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Filters signal
  readonly filters = signal<CouponFilters>({});

  /**
   * Load coupons with filters
   */
  getCoupons$(filters?: CouponFilters): Observable<Coupon[] | null> {
    this.isLoading.set(true);
    this.error.set(null);

    const currentFilters = { ...this.filters(), ...filters };
    if (filters) {
      this.filters.set(currentFilters);
    }

    // Add pagination parameters to filters
    const filtersWithPagination = {
      ...currentFilters,
      page: this.pagination().page,
      limit: this.pagination().limit,
    };

    return this.couponService.getCoupons(filtersWithPagination).pipe(
      map((response) => {
        if (response.success) {
          this.coupons.set(response.data.coupons);
          this.pagination.set(response.data.pagination);
        }
        this.isLoading.set(false);
        return response.success ? response.data.coupons : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to load coupons');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Load coupons with current state
   */
  loadCoupons(): void {
    this.getCoupons$().subscribe();
  }

  /**
   * Get single coupon by ID
   */
  getCouponById$(id: string): Observable<Coupon | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.couponService.getCouponById(id).pipe(
      map((response) => {
        if (response.success) {
          this.currentCoupon.set(response.data);
        }
        this.isLoading.set(false);
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to load coupon');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Create new coupon
   */
  createCoupon$(request: CreateCouponRequest): Observable<Coupon | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.couponService.createCoupon(request).pipe(
      map((response) => {
        if (response.success && response.data) {
          this.currentCoupon.set(response.data);
          this.loadCoupons(); // Refresh list
        }
        this.isLoading.set(false);
        return response.success && response.data ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to create coupon');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Update coupon
   */
  updateCoupon$(id: string, request: UpdateCouponRequest): Observable<Coupon | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.couponService.updateCoupon(id, request).pipe(
      map((response) => {
        if (response.success) {
          this.currentCoupon.set(response.data);
          this.loadCoupons(); // Refresh list
        }
        this.isLoading.set(false);
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to update coupon');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Delete coupon
   */
  deleteCoupon$(id: string): Observable<boolean> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.couponService.deleteCoupon(id).pipe(
      map((response) => {
        if (response.success) {
          this.currentCoupon.set(null);
          this.loadCoupons(); // Refresh list
        }
        this.isLoading.set(false);
        return response.success;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to delete coupon');
        this.isLoading.set(false);
        return of(false);
      })
    );
  }

  /**
   * Activate coupon
   */
  activateCoupon$(id: string): Observable<Coupon | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.couponService.activateCoupon(id).pipe(
      map((response) => {
        if (response.success) {
          this.currentCoupon.set(response.data);
          this.loadCoupons(); // Refresh list
        }
        this.isLoading.set(false);
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to activate coupon');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Deactivate coupon
   */
  deactivateCoupon$(id: string): Observable<Coupon | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.couponService.deactivateCoupon(id).pipe(
      map((response) => {
        if (response.success) {
          this.currentCoupon.set(response.data);
          this.loadCoupons(); // Refresh list
        }
        this.isLoading.set(false);
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to deactivate coupon');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Validate coupon
   */
  validateCoupon$(request: ValidateCouponRequest): Observable<ValidateCouponResponse | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.couponService.validateCoupon(request).pipe(
      map((response) => {
        this.isLoading.set(false);
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to validate coupon');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Get coupon statistics
   */
  getCouponStats$(id: string): Observable<CouponUsageStats | null> {
    this.isLoading.set(true);
    this.error.set(null);

    return this.couponService.getCouponStats(id).pipe(
      map((response) => {
        if (response.success) {
          this.couponStats.set(response.data);
        }
        this.isLoading.set(false);
        return response.success ? response.data : null;
      }),
      catchError((err) => {
        this.error.set(err.error?.message || 'Failed to load coupon stats');
        this.isLoading.set(false);
        return of(null);
      })
    );
  }

  /**
   * Go to specific page
   */
  goToPage(page: number): void {
    this.pagination.update((p) => ({ ...p, page }));
    this.loadCoupons();
  }

  /**
   * Update filters and reload
   */
  setFilters(newFilters: CouponFilters): void {
    this.filters.set(newFilters);
    this.pagination.update((p) => ({ ...p, page: 1 })); // Reset to page 1
    this.loadCoupons();
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.filters.set({});
    this.pagination.update((p) => ({ ...p, page: 1 }));
    this.loadCoupons();
  }

  /**
   * Get page numbers for pagination UI
   */
  getPageNumbers(): number[] {
    const pages = this.pagination().pages;
    const current = this.pagination().page;
    const result: number[] = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(pages, current + 2);

    for (let i = start; i <= end; i++) {
      result.push(i);
    }

    return result;
  }

  /**
   * Clear facade state
   */
  clearState(): void {
    this.coupons.set([]);
    this.currentCoupon.set(null);
    this.couponStats.set(null);
    this.isLoading.set(false);
    this.error.set(null);
    this.pagination.set({
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    });
    this.filters.set({});
  }
}
