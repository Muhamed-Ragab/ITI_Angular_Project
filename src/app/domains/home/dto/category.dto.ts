export interface Category {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string | null;
  parentId?: string | null;
  subcategories?: Category[];
}
