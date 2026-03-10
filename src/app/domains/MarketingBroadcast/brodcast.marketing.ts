import { inject, Injectable } from '@angular/core';
import { ApiService } from '@app/core/services/api.service';
import { Observable } from 'rxjs';
import { BroadcastRequest, BroadcastResponse } from './brodcast.dto';

@Injectable({
  providedIn: 'root',
})
export class BrodcastMarketing {
  private api=inject(ApiService);
  sendBrodcast(payload: BroadcastRequest):Observable<BroadcastResponse>{
    return this.api.post<BroadcastResponse>('/users/admin/marketing/broadcast',payload);
  }
}
