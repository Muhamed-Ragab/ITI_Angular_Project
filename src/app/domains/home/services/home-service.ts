import { inject, Injectable } from '@angular/core';
import { Category } from '../dto/category.dto';
import { map, Observable } from 'rxjs';
import { Product ,ProductListResponse} from '@app/domains/products/dto';
import { ApiService } from '@app/core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
   private api = inject(ApiService);

  getCategories(): Observable<Category[]> {
  return this.api
    .get<any>(`/categories`)
    .pipe(map(res => res.data.categories));
}
    getProductByCatId(id:Number):Observable<Product[]>{
    return this.api
    .get<ProductListResponse>(`/products?category_id=${id}`)
    .pipe(map(res => res.data.products));
  }

 getBestSellerProduct(): Observable<Product[]> {
  return this.api.get<{ data: Product[] }>('/products/best-sellers?limit=10')
    .pipe(map(res => res.data));
}
}
