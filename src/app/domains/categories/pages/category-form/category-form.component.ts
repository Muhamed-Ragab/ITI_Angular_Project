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
import { TranslateModule } from '@ngx-translate/core';
import { CdnUploadService } from '@core/services/cdn-upload.service';
import { firstValueFrom } from 'rxjs';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../dto';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-category-form',
  imports: [FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Modal backdrop -->
    <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.45)">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <!-- Header -->
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-folder-plus me-2 text-primary"></i>
              @if (editTarget()) {
                {{ 'categories.form.editTitle' | translate }}
              } @else if (parentCategory()) {
                {{ 'categories.addSubcategory' | translate }} "{{ parentCategory()!.name }}"
              } @else {
                {{ 'categories.form.addRootTitle' | translate }}
              }
            </h5>
            <button type="button" class="btn-close" (click)="cancel.emit()"></button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            @if (error()) {
              <div class="alert alert-danger py-2">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ error() }}
              </div>
            }

            <div class="mb-3">
              <label class="form-label fw-semibold"
                >{{ 'categories.form.name' | translate }} <span class="text-danger">*</span></label
              >
              <input
                class="form-control"
                [placeholder]="'categories.form.namePlaceholder' | translate"
                [(ngModel)]="name"
                name="name"
                [disabled]="isSaving()"
              />
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">{{
                'categories.form.description' | translate
              }}</label>
              <textarea
                class="form-control"
                rows="3"
                [placeholder]="'categories.form.descPlaceholder' | translate"
                [(ngModel)]="description"
                name="description"
                [disabled]="isSaving()"
              ></textarea>
            </div>

            <!-- Image Upload -->
            <div class="mb-3">
              <label class="form-label fw-semibold">
                {{ 'categories.form.image' | translate }}
                <span class="fw-normal text-muted">{{ 'categories.form.imageHint' | translate }}</span>
              </label>

              @if (!image() && !isUploading()) {
                <label
                  class="d-block border-2 border-dashed rounded-3 p-4 text-center"
                  style="border:2px dashed #cbd5e1;cursor:pointer;background:#f8fafc"
                >
                  <i class="bi bi-cloud-upload fs-2 text-muted d-block mb-1"></i>
                  <span class="small text-muted">
                    {{ 'categories.form.uploadCta' | translate }}
                  </span>
                  <input type="file" class="d-none" accept="image/*" 
                    (change)="onImageSelect($event)" />
                </label>
              }

              @if (isUploading()) {
                <div class="text-center py-3">
                  <div class="spinner-border text-primary mb-2"></div>
                  <p class="small text-muted mb-0">
                    {{ 'categories.form.uploadingProgress' | translate }} {{ uploadProgress() }}%
                  </p>
                  <div class="progress mt-2 rounded-pill" style="height:6px">
                    <div class="progress-bar bg-success" [style.width.%]="uploadProgress()"
                      style="transition:width 0.3s"></div>
                  </div>
                </div>
              }

              @if (image()) {
                <div class="position-relative d-inline-block">
                  <img [src]="image()" class="rounded-3 border shadow-sm"
                    style="width:120px;height:120px;object-fit:cover"
                    (error)="onImageError($event)" />
                  <button type="button"
                    class="btn btn-danger btn-sm position-absolute top-0 end-0
                      rounded-circle d-flex align-items-center justify-content-center"
                    style="width:24px;height:24px;padding:0;font-size:0.7rem;
                      transform:translate(30%,-30%)"
                    (click)="removeImage()">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              }
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button
              class="btn btn-outline-secondary"
              (click)="cancel.emit()"
              [disabled]="isSaving()"
            >
              {{ 'categories.form.cancel' | translate }}
            </button>
            <button
              class="btn btn-primary"
              (click)="save()"
              [disabled]="isSaving() || !name.trim()"
            >
              @if (isSaving()) {
                <span class="spinner-border spinner-border-sm me-1"></span
                >{{ 'categories.form.saving' | translate }}
              } @else {
                <i class="bi bi-check-lg me-1"></i>{{ 'categories.form.save' | translate }}
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CategoryFormComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly cdnService = inject(CdnUploadService);

  /** Pass to edit an existing category */
  readonly editTarget = input<Category | null>(null);
  /** Pass the parent when creating a subcategory */
  readonly parentCategory = input<Category | null>(null);

  readonly saved = output<void>();
  readonly cancel = output<void>();

  name = '';
  description = '';

  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);

  // Image upload state
  readonly image = signal<string | null>(null);
  readonly isUploading = signal(false);
  readonly uploadProgress = signal(0);

  ngOnInit(): void {
    const target = this.editTarget();
    if (target) {
      this.name = target.name;
      this.description = target.description ?? '';
      this.image.set(target.image ?? null);
    }
  }

  // ── Image Upload ───────────────────────────────────────────────────────────

  async onImageSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.error.set('File size must be less than 2MB');
      return;
    }

    this.error.set(null);
    this.isUploading.set(true);
    this.uploadProgress.set(0);

    try {
      const creds = await firstValueFrom(this.cdnService.getUploadCredentials('categories'));
      
      // Simulate progress
      this.uploadProgress.set(30);
      
      const url = await firstValueFrom(this.cdnService.uploadToCloudinary(file, creds));
      this.uploadProgress.set(100);
      this.image.set(url);
    } catch {
      this.error.set('Failed to upload image. Please try again.');
    } finally {
      this.isUploading.set(false);
      this.uploadProgress.set(0);
      input.value = '';
    }
  }

  removeImage(): void {
    this.image.set(null);
  }

  onImageError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/120x120/e2e8f0/94a3b8?text=?+?';
  }

  save(): void {
    const trimmed = this.name.trim();
    if (!trimmed) return;

    this.isSaving.set(true);
    this.error.set(null);

    const target = this.editTarget();

    if (target) {
      // ── UPDATE ─────────────────────────────────────────────────────────────
      const dto: UpdateCategoryDto = { name: trimmed };
      if (this.description.trim()) dto.description = this.description.trim();
      if (this.image()) dto.image = this.image()!;

      this.categoryService.updateCategory(target._id, dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Failed to update category.');
          this.isSaving.set(false);
        },
      });
    } else {
      // ── CREATE ─────────────────────────────────────────────────────────────
      const dto: CreateCategoryDto = { name: trimmed };
      if (this.description.trim()) dto.description = this.description.trim();
      const parent = this.parentCategory();
      if (parent) dto.parentId = parent._id;
      if (this.image()) dto.image = this.image()!;

      this.categoryService.createCategory(dto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saved.emit();
        },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Failed to create category.');
          this.isSaving.set(false);
        },
      });
    }
  }
}
