import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@core/services/api.service';

export interface UploadCredentials {
  uploadUrl: string;
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
}

@Injectable({ providedIn: 'root' })
export class CdnUploadService {
  private readonly api = inject(ApiService);

  /**
   * Step 1 — POST /{folder}/images/upload-payload
   * Backend returns signed Cloudinary credentials.
   * Uses ApiService so the auth interceptor attaches the Bearer token.
   */
  getUploadCredentials(folder = 'products'): Observable<UploadCredentials> {
    return this.api
      .post<{ success: boolean; data: UploadCredentials }>(
        `/${folder}/images/upload-payload`,
        { folder },
      )
      .pipe(map(res => res.data));
  }

  /**
   * Step 2 — Upload directly to Cloudinary (bypasses backend, no auth needed).
   * Returns the secure_url of the uploaded image.
   */
  uploadToCloudinary(file: File, creds: UploadCredentials): Observable<string> {
    const fd = new FormData();
    fd.append('file',      file);
    fd.append('api_key',   creds.apiKey);
    fd.append('timestamp', creds.timestamp.toString());
    fd.append('signature', creds.signature);
    fd.append('folder',    creds.folder);

    return from(
      fetch(creds.uploadUrl, { method: 'POST', body: fd })
        .then(r => r.json())
        .then((d: any) => d.secure_url as string),
    );
  }
}