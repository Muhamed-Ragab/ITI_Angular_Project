// ─── Response Models ──────────────────────────────────────────────────────────

export interface Category {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  parentId?: string | null;
  subcategories?: Category[];
  productCount?: number;
  slug?: string;
}

export interface CategoryListResponse {
  success: boolean;
  data: {
    categories: Category[];
  };
}

export interface CategoryDetailResponse {
  success: boolean;
  data: Category;
}

export interface CategoryActionResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    name: string;
  };
}

// ─── Request Models ───────────────────────────────────────────────────────────

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentId?: string | null;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}