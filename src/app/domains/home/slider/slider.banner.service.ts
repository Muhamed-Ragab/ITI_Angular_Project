import { inject, Injectable } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { map } from 'rxjs';
import { Banner } from '../dto/banner.dto';

@Injectable({
  providedIn: 'root',
})
export class SliderBannerService {
  private api = inject(ApiService)

  getHomeBanner(){
    return this.api.get('/content?section=homepage')
    .pipe(map((res:any)=>res.data))

  }
}
