import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { UserAddress } from '@domains/auth/types';
import {
  CreateOrderRequest,
  GuestCheckoutRequest,
  OrderDetailResponse,
  OrderListResponse,
  OrderResponse,
} from '@domains/orders/dto';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';

export interface UserAddressesResponse {
  success: boolean;
  data: UserAddress[];
}

/**
 * User profile response from GET /users/profile
 * Note: As per API docs, profile does NOT include address fields.
 * If addresses are needed, either:
 * 1. Use a separate GET /users/address endpoint (not currently available in API)
 * 2. Request address fields be added to the profile endpoint
 */
export interface UserProfileResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    wallet_balance?: number;
    loyalty_points?: number;
    referral_code?: string;
    marketing_preferences?: {
      push_notifications: boolean;
      email_newsletter: boolean;
      promotional_notifications: boolean;
    };
    preferred_language?: string;
    // Note: addresses field is NOT in the API response currently
    addresses?: UserAddress[];
    address?: Partial<UserAddress>;
  };
}

export interface AddressValidationResult {
  isValid: boolean;
  missingFields: Array<'street' | 'city' | 'country' | 'zip'>;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);

  /**
   * Get authenticated user profile.
   */
  getUserProfile(): Observable<UserProfileResponse> {
    return this.api.get<UserProfileResponse>('/users/profile');
  }

  /**
   * Get user addresses from /users/profile only (no GET /users/address dependency).
   */
  getUserAddresses(): Observable<UserAddressesResponse> {
    return this.getUserProfile().pipe(
      map((response) => ({
        success: response.success,
        data: this.extractAddressesFromProfile(response.data),
      })),
    );
  }

  /**
   * Validate required shipping address fields.
   */
  validateShippingAddress(
    address: Partial<UserAddress> | null | undefined,
  ): AddressValidationResult {
    const missingFields: Array<'street' | 'city' | 'country' | 'zip'> = [];

    if (!address?.street?.trim()) missingFields.push('street');
    if (!address?.city?.trim()) missingFields.push('city');
    if (!address?.country?.trim()) missingFields.push('country');
    if (!address?.zip?.trim()) missingFields.push('zip');

    if (missingFields.length > 0) {
      return {
        isValid: false,
        missingFields,
        message: `Missing required address field(s): ${missingFields.join(', ')}`,
      };
    }

    return {
      isValid: true,
      missingFields: [],
      message: '',
    };
  }

  private extractAddressesFromProfile(profile: UserProfileResponse['data']): UserAddress[] {
    if (Array.isArray(profile.addresses)) {
      return profile.addresses.filter((address) => this.validateShippingAddress(address).isValid);
    }

    if (profile.address) {
      const normalizedAddress: UserAddress = {
        _id: profile.address._id ?? 'profile-address-0',
        street: profile.address.street ?? '',
        city: profile.address.city ?? '',
        country: profile.address.country ?? '',
        zip: profile.address.zip ?? '',
        state: profile.address.state,
        isDefault: true,
      };

      return this.validateShippingAddress(normalizedAddress).isValid ? [normalizedAddress] : [];
    }

    return [];
  }

  /**
   * Add a new shipping address for the user
   */
  addUserAddress(address: Omit<UserAddress, '_id'>): Observable<UserAddressesResponse> {
    return this.api.post<UserAddressesResponse>('/users/address', address);
  }

  /**
   * Create an order from the current cart
   * @param request - Order creation request with shipping address index, coupon, payment method
   */
  createOrder(request: Omit<CreateOrderRequest, 'items'>): Observable<OrderResponse> {
    console.log('=== OrderService.createOrder ===');
    console.log('Request payload:', JSON.stringify(request, null, 2));
    return this.api.post<OrderResponse>('/orders', request);
  }

  /**
   * Guest checkout without authentication
   * @param request - Guest checkout request with guest info, shipping address, items
   */
  guestCheckout(request: GuestCheckoutRequest): Observable<OrderResponse> {
    console.log('=== OrderService.guestCheckout ===');
    console.log('Request:', request);
    return this.api.post<OrderResponse>('/orders/guest', request);
  }

  /**
   * Get the authenticated user's orders
   * @param params - Optional filters: status, page, limit
   */
  getMyOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Observable<OrderListResponse> {
    let httpParams = new HttpParams();
    if (params) {
      // Only add status if it's not empty
      if (params.status && params.status.trim() !== '') {
        httpParams = httpParams.set('status', params.status);
      }
      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    }
    return this.api.get<OrderListResponse>('/orders/me', httpParams);
  }

  /**
   * Get order details by ID
   * @param orderId - The order ID to fetch
   */
  getOrderById(orderId: string): Observable<OrderDetailResponse> {
    return this.api.get<OrderDetailResponse>(`/orders/${orderId}`);
  }
}
