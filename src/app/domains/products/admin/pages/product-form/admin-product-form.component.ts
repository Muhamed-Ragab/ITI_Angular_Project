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
import { Category } from '@domains/categories/dto';
import { AdminProduct, AdminUpdateProductDto } from '../../dto';
import { AdminProductService } from '../../services/admin-product.service';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.5)">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content">

          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-pencil-square me-2 text-primary"></i>Edit Product
            </h5>
            <button type="button" class="btn-close" (click)="cancel.emit()"></button>
          </div>

          <div class="modal-body">

            @if (error()) {
              <div class="alert alert-danger py-2">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ error() }}
              </div>
            }

            @if (loadingSupport()) {
              <div class="text-center py-4">
                <div class="spinner-border text-primary spinner-border-sm"></div>
                <p class="small text-muted mt-2">Loading…</p>
              </div>
            } @else {
              <div class="row g-3">

                <!-- Title -->
                <div class="col-12">
                  <label class="form-label fw-semibold">
                    Product Name <span class="text-danger">*</span>
                  </label>
                  <input
                    class="form-control"
                    placeholder="e.g. Wireless Headphones Pro"
                    [(ngModel)]="form.title"
                    name="title"
                  />
                </div>

                <!-- Description -->
                <div class="col-12">
                  <label class="form-label fw-semibold">
                    Description <span class="text-danger">*</span>
                    <small class="text-muted fw-normal ms-1">(min 10 characters)</small>
                  </label>
                  <textarea
                    class="form-control"
                    rows="3"
                    placeholder="Describe the product…"
                    [(ngModel)]="form.description"
                    name="description"
                  ></textarea>
                </div>

                <!-- Price + Stock -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">
                    Price ($) <span class="text-danger">*</span>
                  </label>
                  <input
                    type="number" class="form-control"
                    placeholder="0.00" min="0" step="0.01"
                    [(ngModel)]="form.price" name="price"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">
                    Stock Quantity <span class="text-danger">*</span>
                  </label>
                  <input
                    type="number" class="form-control"
                    placeholder="0" min="0"
                    [(ngModel)]="form.stock_quantity" name="stock_quantity"
                  />
                </div>

                <!-- Category -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">
                    Category <span class="text-danger">*</span>
                  </label>
                  <select class="form-select" [(ngModel)]="form.category_id" name="category_id">
                    <option value="">— Select category —</option>
                    @for (cat of flatCategories(); track cat._id) {
                      <option [value]="cat._id">
                        {{ cat.parentId ? '↳ ' : '' }}{{ cat.name }}
                      </option>
                    }
                  </select>
                </div>

                <!-- Image URLs -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Image URLs</label>
                  <small class="text-muted d-block mb-1">One URL per line</small>
                  <textarea
                    class="form-control font-monospace" rows="3"
                    placeholder="https://cdn.example.com/img1.jpg"
                    [ngModel]="imagesText()"
                    (ngModelChange)="onImagesChange($event)"
                    name="images"
                  ></textarea>
                </div>

                <!-- Image preview -->
                @if (form.images.length > 0) {
                  <div class="col-12">
                    <div class="d-flex gap-2 flex-wrap">
                      @for (img of form.images; track $index) {
                        <img [src]="img" class="rounded border"
                          style="width:72px;height:72px;object-fit:cover"
                          (error)="onImgError($event)" [title]="img" />
                      }
                    </div>
                  </div>
                }

              </div>
            }
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline-secondary" (click)="cancel.emit()" [disabled]="isSaving()">
              Cancel
            </button>
            <button
              class="btn btn-primary"
              (click)="save()"
              [disabled]="isSaving() || loadingSupport() || !isValid()"
            >
              @if (isSaving()) {
                <span class="spinner-border spinner-border-sm me-1"></span>Saving…
              } @else {
                <i class="bi bi-check-lg me-1"></i>Update Product
              }
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
})
export class AdminProductFormComponent implements OnInit {
  private readonly adminProductService = inject(AdminProductService);

  readonly editTarget = input<AdminProduct | null>(null);
  readonly saved  = output<void>();
  readonly cancel = output<void>();

  readonly flatCategories = signal<Category[]>([]);
  readonly loadingSupport = signal(true);
  readonly isSaving = signal(false);
  readonly error    = signal<string | null>(null);

  // Form uses backend field names exactly
  form = {
    title:          '',
    description:    '',
    price:          null as number | null,
    stock_quantity: null as number | null,
    category_id:    '',
    images:         [] as string[],
  };

  ngOnInit(): void {
    const t = this.editTarget();
    if (t) {
      this.form.title          = t.title ?? t.name ?? '';
      this.form.description    = t.description ?? '';
      this.form.price          = t.price;
      this.form.stock_quantity = t.stock_quantity ?? t.stock ?? 0;
      this.form.category_id    =
        t.category_id?._id ?? t.category_id?.id ??
        t.category?._id   ?? t.category?.id ?? '';
      this.form.images = [...(t.images ?? [])];
    }

    // Load categories for dropdown
    this.adminProductService.getCategories().subscribe({
      next: (res) => {
        const flat: Category[] = [];
        const flatten = (cats: Category[]) =>
          cats.forEach(c => { flat.push(c); if (c.subcategories?.length) flatten(c.subcategories); });
        flatten(res.data.categories);
        this.flatCategories.set(flat);
        this.loadingSupport.set(false);
      },
      error: () => this.loadingSupport.set(false),
    });
  }

  imagesText(): string { return this.form.images.join('\n'); }

  onImagesChange(val: string): void {
    this.form.images = val.split('\n').map(s => s.trim()).filter(Boolean);
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/72x72/e2e8f0/94a3b8?text=?';
  }

  isValid(): boolean {
    const f = this.form;
    return (
      f.title.trim().length >= 3 &&
      f.description.trim().length >= 10 &&
      f.price !== null && f.price >= 0 &&
      f.stock_quantity !== null && f.stock_quantity >= 0 &&
      !!f.category_id
    );
  }

  save(): void {
    if (!this.isValid()) return;
    this.isSaving.set(true);
    this.error.set(null);

    const dto: AdminUpdateProductDto = {
      title:          this.form.title.trim(),
      description:    this.form.description.trim(),
      price:          this.form.price!,
      stock_quantity: this.form.stock_quantity!,
      category_id:    this.form.category_id,
      images:         this.form.images,
    };

    const id = (this.editTarget()?._id ?? this.editTarget()?.id) as string;

    this.adminProductService.updateProduct(id, dto).subscribe({
      next:  () => { this.isSaving.set(false); this.saved.emit(); },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to update product.');
        this.isSaving.set(false);
      },
    });
  }
}