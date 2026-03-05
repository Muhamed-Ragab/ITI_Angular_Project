export interface WishlistItem {
  product_id: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

export interface WishlistApiItem {
  productId?: string;
  product_id?: string;
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  price?: number;
  image?: string;
  images?: string[];
  addedAt?: string;
}

export interface WishlistResponse {
  success: boolean;
  data: WishlistApiItem[];
}

export interface AddToWishlistDto {
  productId: string;
}

export interface RemoveFromWishlistResponse {
  success: boolean;
  message: string;
}
