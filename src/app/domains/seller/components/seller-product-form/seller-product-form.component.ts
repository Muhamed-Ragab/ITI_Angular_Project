import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CdnUploadService } from '@core/services/cdn-upload.service';
import { Category } from '@domains/categories/dto';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  SellerCreateProductDto,
  SellerProduct,
  SellerUpdateProductDto,
} from '../../dto/seller.dto';
import { SellerService } from '../../services/seller.services';

@Component({
  selector: 'app-seller-product-form',
  imports: [FormsModule, CommonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.55)">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <!-- Header -->
          <div
            class="modal-header border-0 py-3 px-4"
            style="background:linear-gradient(135deg,#1a1a2e,#16213e)"
          >
            <h5 class="modal-title text-white fw-bold mb-0">
              <i
                class="bi bi-{{ editTarget() ? 'pencil-square' : 'plus-circle' }} me-2"
                style="color:#4ade80"
              ></i>
              {{
                editTarget()
                  ? ('seller.productForm.editTitle' | translate)
                  : ('seller.productForm.newTitle' | translate)
              }}
            </h5>
            <button
              class="btn-close btn-close-white"
              [attr.aria-label]="translate.instant('seller.productForm.cancel')"
              (click)="cancel.emit()"
            ></button>
          </div>

          <!-- Body -->
          <div class="modal-body p-4" style="background:#fafafa">
            @if (error()) {
              <div
                class="alert alert-danger border-0 rounded-3 py-2 mb-3 d-flex align-items-center gap-2"
              >
                <i class="bi bi-exclamation-triangle-fill"></i>{{ error() }}
              </div>
            }

            @if (loadingCats()) {
              <div class="text-center py-5">
                <div class="spinner-border" style="color:#4ade80"></div>
                <p class="text-muted mt-2 small">
                  {{ 'seller.productForm.loadingCategories' | translate }}
                </p>
              </div>
            } @else {
              <div class="row g-3">
                <!-- Title -->
                <div class="col-12">
                  <label class="form-label fw-semibold small text-uppercase text-muted">
                    {{ 'seller.productForm.productTitle' | translate }}
                    <span class="text-danger">*</span>
                  </label>
                  <input
                    class="form-control border-0 bg-white shadow-sm rounded-3"
                    [placeholder]="translate.instant('seller.productForm.titlePlaceholder')"
                    [(ngModel)]="form.title"
                    name="title"
                    maxlength="100"
                  />
                  @if (form.title.length > 0 && form.title.length < 3) {
                    <small class="text-danger">{{
                      'seller.productForm.minTitle' | translate
                    }}</small>
                  }
                </div>

                <!-- Description -->
                <div class="col-12">
                  <label class="form-label fw-semibold small text-uppercase text-muted">
                    {{ 'seller.productForm.description' | translate }}
                    <span class="text-danger">*</span>
                    <span class="fw-normal">{{ 'seller.productForm.descHint' | translate }}</span>
                  </label>
                  <textarea
                    class="form-control border-0 bg-white shadow-sm rounded-3"
                    rows="4"
                    [placeholder]="translate.instant('seller.productForm.descriptionPlaceholder')"
                    [(ngModel)]="form.description"
                    name="description"
                  ></textarea>
                  @if (form.description.length > 0 && form.description.length < 10) {
                    <small class="text-danger">{{
                      'seller.productForm.minDesc' | translate
                    }}</small>
                  }
                </div>

                <!-- Price + Stock -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold small text-uppercase text-muted">
                    {{ 'seller.productForm.price' | translate }} <span class="text-danger">*</span>
                  </label>
                  <div class="input-group shadow-sm">
                    <span class="input-group-text border-0 bg-white">$</span>
                    <input
                      type="number"
                      class="form-control border-0 bg-white rounded-end-3"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      [(ngModel)]="form.price"
                      name="price"
                    />
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small text-uppercase text-muted">
                    {{ 'seller.productForm.stock' | translate }} <span class="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    class="form-control border-0 bg-white shadow-sm rounded-3"
                    placeholder="0"
                    min="0"
                    [(ngModel)]="form.stock_quantity"
                    name="stock_quantity"
                  />
                </div>

                <!-- Category -->
                <div class="col-12">
                  <label class="form-label fw-semibold small text-uppercase text-muted">
                    {{ 'seller.productForm.category' | translate }}
                    <span class="text-danger">*</span>
                  </label>
                  <select
                    class="form-select border-0 bg-white shadow-sm rounded-3"
                    [(ngModel)]="form.category_id"
                    name="category_id"
                  >
                    <option value="">{{ 'seller.productForm.selectCategory' | translate }}</option>
                    @for (cat of flatCategories(); track cat._id) {
                      <option [value]="cat._id">
                        {{ cat.parentId ? '↳ ' : '' }}{{ cat.name }}
                      </option>
                    }
                  </select>
                </div>

                <!-- ── Image Upload ──────────────────────────────────────── -->
                <div class="col-12">
                  <label class="form-label fw-semibold small text-uppercase text-muted">
                    {{ 'seller.productForm.images' | translate }}
                    <span class="fw-normal text-muted">{{
                      'seller.productForm.imagesHint' | translate
                    }}</span>
                  </label>

                  <!-- Drop zone -->
                  <label
                    class="d-block border-2 border-dashed rounded-3 p-4 text-center"
                    style="border:2px dashed #cbd5e1;cursor:pointer;background:#f8fafc"
                    [class.opacity-50]="isUploading()"
                  >
                    <i class="bi bi-cloud-upload fs-2 text-muted d-block mb-1"></i>
                    <span class="small text-muted">
                      @if (isUploading()) {
                        {{
                          'seller.productForm.uploadingProgress'
                            | translate: { progress: uploadProgress() }
                        }}
                      } @else {
                        {{ 'seller.productForm.uploadCta' | translate }}
                      }
                    </span>
                    <input
                      type="file"
                      class="d-none"
                      multiple
                      accept="image/*"
                      [disabled]="isUploading()"
                      (change)="onFileSelect($event)"
                    />
                  </label>

                  <!-- Upload progress bar -->
                  @if (isUploading()) {
                    <div class="progress mt-2 rounded-pill" style="height:6px">
                      <div
                        class="progress-bar bg-success"
                        [style.width.%]="uploadProgress()"
                        style="transition:width 0.3s"
                      ></div>
                    </div>
                    <p class="small text-muted mt-1 mb-0 text-center">
                      {{
                        'seller.productForm.uploadingImage'
                          | translate: { current: uploadingIndex(), total: uploadTotal() }
                      }}
                    </p>
                  }
                </div>

                <!-- Image previews -->
                @if (form.images.length > 0) {
                  <div class="col-12">
                    <div class="d-flex gap-2 flex-wrap">
                      @for (img of form.images; track $index) {
                        <div class="position-relative">
                          <img
                            [src]="img"
                            class="rounded-3 border shadow-sm"
                            style="width:80px;height:80px;object-fit:cover"
                            (error)="onImgError($event)"
                          />
                          <button
                            type="button"
                            class="btn btn-danger btn-sm position-absolute top-0 end-0
                              rounded-circle d-flex align-items-center justify-content-center"
                            style="width:20px;height:20px;padding:0;font-size:0.6rem;
                              transform:translate(40%,-40%)"
                            (click)="removeImage($index)"
                          >
                            <i class="bi bi-x"></i>
                          </button>
                        </div>
                      }
                    </div>
                    <small class="text-muted">{{
                      'seller.productForm.imagesReady' | translate: { count: form.images.length }
                    }}</small>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="modal-footer border-0 bg-white px-4 py-3">
            <button
              class="btn btn-outline-secondary rounded-pill px-4"
              (click)="cancel.emit()"
              [disabled]="isSaving() || isUploading()"
            >
              {{ 'seller.productForm.cancel' | translate }}
            </button>
            <button
              class="btn rounded-pill px-4 fw-semibold text-white"
              style="background:linear-gradient(135deg,#4ade80,#22c55e);border:none"
              (click)="save()"
              [disabled]="isSaving() || isUploading() || loadingCats() || !isValid()"
            >
              @if (isSaving()) {
                <span class="spinner-border spinner-border-sm me-1"></span
                >{{ 'seller.productForm.saving' | translate }}
              } @else if (isUploading()) {
                <span class="spinner-border spinner-border-sm me-1"></span
                >{{ 'seller.productForm.uploading' | translate }}
              } @else {
                <i class="bi bi-check-lg me-1"></i>
                {{
                  editTarget()
                    ? ('seller.productForm.update' | translate)
                    : ('seller.productForm.create' | translate)
                }}
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SellerProductFormComponent implements OnInit {
  private readonly sellerService = inject(SellerService);
  private readonly cdnService = inject(CdnUploadService);
  readonly translate = inject(TranslateService);

  readonly editTarget = input<SellerProduct | null>(null);
  readonly saved = output<void>();
  readonly cancel = output<void>();

  readonly flatCategories = signal<Category[]>([]);
  readonly loadingCats = signal(true);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);

  // Upload state
  readonly isUploading = signal(false);
  readonly uploadProgress = signal(0);
  readonly uploadingIndex = signal(0);
  readonly uploadTotal = signal(0);

  form = {
    title: '',
    description: '',
    price: null as number | null,
    stock_quantity: null as number | null,
    category_id: '',
    images: [] as string[],
  };

  ngOnInit(): void {
    const t = this.editTarget();
    if (t) {
      this.form.title = t.title ?? '';
      this.form.description = t.description ?? '';
      this.form.price = t.price ?? null;
      this.form.stock_quantity = t.stock_quantity ?? null;
      const cat = t.category_id as any;
      this.form.category_id = cat?._id ?? cat?.id ?? (typeof cat === 'string' ? cat : '');
      this.form.images = [...(t.images ?? [])];
    }

    this.sellerService.getCategories().subscribe({
      next: (res) => {
        const flat: Category[] = [];
        const walk = (cats: Category[]) =>
          cats.forEach((c) => {
            flat.push(c);
            if (c.subcategories?.length) walk(c.subcategories);
          });
        walk(res.data.categories);
        this.flatCategories.set(flat);
        this.loadingCats.set(false);
      },
      error: () => this.loadingCats.set(false),
    });
  }

  // ── Image upload ──────────────────────────────────────────────────────────

  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;

    // Validate
    const invalid = files.find((file) => file.size > 5 * 1024 * 1024);
    if (invalid) {
      this.error.set(
        this.translate.instant('seller.productForm.errors.fileTooLarge', { name: invalid.name }),
      );
      return;
    }
    if (this.form.images.length + files.length > 5) {
      this.error.set(this.translate.instant('seller.productForm.errors.tooManyImages'));
      return;
    }

    this.error.set(null);
    this.isUploading.set(true);
    this.uploadTotal.set(files.length);
    this.uploadProgress.set(0);

    try {
      // Step 1 — get signed credentials from backend (one call covers all files)
      const creds = await firstValueFrom(this.cdnService.getUploadCredentials('products'));

      // Step 2 — upload each file sequentially, show progress
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        this.uploadingIndex.set(i + 1);
        const url = await firstValueFrom(this.cdnService.uploadToCloudinary(files[i], creds));
        urls.push(url);
        this.uploadProgress.set(Math.round(((i + 1) / files.length) * 100));
      }

      // Step 3 — add returned URLs to the form
      this.form.images = [...this.form.images, ...urls];
    } catch {
      this.error.set(this.translate.instant('seller.productForm.errors.uploadFailed'));
    } finally {
      this.isUploading.set(false);
      this.uploadProgress.set(0);
      // Reset file input so same file can be re-selected
      input.value = '';
    }
  }

  removeImage(index: number): void {
    this.form.images = this.form.images.filter((_, i) => i !== index);
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/e2e8f0/94a3b8?text=?';
  }

  // ── Validation & save ─────────────────────────────────────────────────────

  isValid(): boolean {
    const f = this.form;
    return (
      f.title.trim().length >= 3 &&
      f.description.trim().length >= 10 &&
      f.price !== null &&
      f.price >= 0 &&
      f.stock_quantity !== null &&
      f.stock_quantity >= 0 &&
      !!f.category_id
    );
  }

  save(): void {
    if (!this.isValid()) return;
    this.isSaving.set(true);
    this.error.set(null);

    const target = this.editTarget();
    const id = target ? ((target._id ?? target.id) as string) : null;

    if (id) {
      const dto: SellerUpdateProductDto = {
        title: this.form.title.trim(),
        description: this.form.description.trim(),
        price: this.form.price!,
        stock_quantity: this.form.stock_quantity!,
        category_id: this.form.category_id,
        images: this.form.images,
      };
      this.sellerService.updateProduct(id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.error.set(
            err?.error?.message ?? this.translate.instant('seller.productForm.errors.updateFailed'),
          );
        },
      });
    } else {
      const dto: SellerCreateProductDto = {
        title: this.form.title.trim(),
        description: this.form.description.trim(),
        price: this.form.price!,
        stock_quantity: this.form.stock_quantity!,
        category_id: this.form.category_id,
        images: this.form.images,
      };
      this.sellerService.createProduct(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.isSaving.set(false);
          this.error.set(
            err?.error?.message ?? this.translate.instant('seller.productForm.errors.createFailed'),
          );
        },
      });
    }
  }
}
