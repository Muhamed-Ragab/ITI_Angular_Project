export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  data: {
    wishlist: WishlistItem[];
    count: number;
  };
}

export interface AddToWishlistDto {
  productId: string;
}

export interface RemoveFromWishlistResponse {
  success: boolean;
  message: string;
}
