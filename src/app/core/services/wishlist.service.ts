import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  WishlistResponse,
  AddToWishlistDto,
  RemoveFromWishlistResponse,
} from '@domains/wishlist/dto';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly api = inject(ApiService); // ← always use ApiService

  getWishlist(): Observable<WishlistResponse> {
    return this.api.get<WishlistResponse>('/users/wishlist');
  }

  addToWishlist(body: AddToWishlistDto): Observable<WishlistResponse> {
    return this.api.post<WishlistResponse>('/users/wishlist', body);
  }

  removeFromWishlist(productId: string): Observable<RemoveFromWishlistResponse> {
    return this.api.delete<RemoveFromWishlistResponse>(`/users/wishlist/${productId}`);
  }
}