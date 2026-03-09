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
import { AdminProduct, AdminCreateProductDto, AdminUpdateProductDto, SellerUser } from '../../dto';
import { AdminProductService } from '../../services/admin-product.service';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Modal backdrop -->
    <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.5)">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content">

          <!-- Header -->
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-box-seam me-2 text-primary"></i>
              {{ editTarget() ? 'Edit Product' : 'Add New Product' }}
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

            @if (loadingSupport()) {
              <div class="text-center py-4">
                <div class="spinner-border text-primary spinner-border-sm"></div>
                <p class="small text-muted mt-2">Loading categories & sellers…</p>
              </div>
            } @else {
              <div class="row g-3">

                <!-- Name -->
                <div class="col-12">
                  <label class="form-label fw-semibold">
                    Product Name <span class="text-danger">*</span>
                  </label>
                  <input
                    class="form-control"
                    placeholder="e.g. Wireless Headphones Pro"
                    [(ngModel)]="form.name"
                    name="name"
                  />
                </div>

                <!-- Description -->
                <div class="col-12">
                  <label class="form-label fw-semibold">
                    Description <span class="text-danger">*</span>
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
                    type="number"
                    class="form-control"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    [(ngModel)]="form.price"
                    name="price"
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold">
                    Stock Quantity <span class="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    class="form-control"
                    placeholder="0"
                    min="0"
                    [(ngModel)]="form.stock"
                    name="stock"
                  />
                </div>

                <!-- Category -->
                <div class="col-md-6">
                  <label class="form-label fw-semibold">
                    Category <span class="text-danger">*</span>
                  </label>
                  <select class="form-select" [(ngModel)]="form.category" name="category">
                    <option value="">— Select category —</option>
                    @for (cat of flatCategories(); track cat._id) {
                      <option [value]="cat._id">
                        {{ cat.parentId ? '↳ ' : '' }}{{ cat.name }}
                      </option>
                    }
                  </select>
                </div>

                <!-- Seller (only on create) -->
                @if (!editTarget()) {
                  <div class="col-md-6">
                    <label class="form-label fw-semibold">
                      Seller <span class="text-danger">*</span>
                    </label>
                    <select class="form-select" [(ngModel)]="form.seller" name="seller">
                      <option value="">— Select seller —</option>
                      @for (s of sellers(); track s.id) {
                        <option [value]="s.id">{{ s.name }} ({{ s.email }})</option>
                      }
                    </select>
                    @if (sellers().length === 0) {
                      <div class="form-text text-warning">
                        <i class="bi bi-exclamation-triangle me-1"></i>No sellers found.
                      </div>
                    }
                  </div>
                }

                <!-- Image URLs -->
                <div class="col-12">
                  <label class="form-label fw-semibold">Image URLs</label>
                  <small class="text-muted d-block mb-2">One URL per line</small>
                  <textarea
                    class="form-control font-monospace"
                    rows="3"
                    placeholder="https://cdn.example.com/img1.jpg&#10;https://cdn.example.com/img2.jpg"
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
                        <img
                          [src]="img"
                          class="rounded border"
                          style="width:72px;height:72px;object-fit:cover"
                          (error)="onImgError($event)"
                          [title]="img"
                        />
                      }
                    </div>
                  </div>
                }

              </div>
            }
          </div>

          <!-- Footer -->
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
                <i class="bi bi-check-lg me-1"></i>{{ editTarget() ? 'Update' : 'Create' }} Product
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

  readonly saved = output<void>();
  readonly cancel = output<void>();

  // ── Support data ──────────────────────────────────────────────────────────
  readonly flatCategories = signal<Category[]>([]);
  readonly sellers = signal<SellerUser[]>([]);
  readonly loadingSupport = signal(true);

  // ── Form state ────────────────────────────────────────────────────────────
  form: {
    name: string;
    description: string;
    price: number | null;
    stock: number | null;
    category: string;
    seller: string;
    images: string[];
  } = { name: '', description: '', price: null, stock: null, category: '', seller: '', images: [] };

  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Pre-fill form when editing
    const t = this.editTarget();
    if (t) {
      this.form.name = t.name ?? t.title ?? '';
      this.form.description = t.description ?? '';
      this.form.price = t.price;
      this.form.stock = t.stock ?? t.stock_quantity ?? 0;
      this.form.category = (t.category?._id ?? t.category?.id ?? t.category_id?._id ?? t.category_id?.id) ?? '';
      this.form.images = [...(t.images ?? [])];
    }

    this.loadSupportData();
  }

  private loadSupportData(): void {
    let categoriesDone = false;
    let sellersDone = false;

    const check = () => {
      if (categoriesDone && sellersDone) this.loadingSupport.set(false);
    };

    // Categories — flatten tree to a single list for <select>
    this.adminProductService.getCategories().subscribe({
      next: (res) => {
        const flat: Category[] = [];
        const flatten = (cats: Category[]) => {
          cats.forEach(c => {
            flat.push(c);
            if (c.subcategories?.length) flatten(c.subcategories);
          });
        };
        flatten(res.data.categories);
        this.flatCategories.set(flat);
        categoriesDone = true;
        check();
      },
      error: () => { categoriesDone = true; check(); },
    });

    // Sellers
    this.adminProductService.getSellers().subscribe({
      next: (res) => {
        this.sellers.set(res);
        sellersDone = true;
        check();
      },
      error: () => { sellersDone = true; check(); },
    });
  }

  // ── Image helpers ─────────────────────────────────────────────────────────

  imagesText(): string {
    return this.form.images.join('\n');
  }

  onImagesChange(val: string): void {
    this.form.images = val.split('\n').map(s => s.trim()).filter(Boolean);
  }

  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/72x72/e2e8f0/94a3b8?text=?';
  }

  // ── Validation ────────────────────────────────────────────────────────────

  isValid(): boolean {
    const f = this.form;
    const baseValid = !!f.name.trim() && !!f.description.trim() &&
      f.price !== null && f.price >= 0 &&
      f.stock !== null && f.stock >= 0 &&
      !!f.category;
    if (!this.editTarget()) return baseValid && !!f.seller;
    return baseValid;
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  save(): void {
    if (!this.isValid()) return;

    this.isSaving.set(true);
    this.error.set(null);

    const target = this.editTarget();

    if (target) {
      const dto: AdminUpdateProductDto = {
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        price: this.form.price!,
        stock: this.form.stock!,
        category: this.form.category,
        images: this.form.images,
      };
      const id = (target.id ?? target._id) as string;

      this.adminProductService.updateProduct(id, dto).subscribe({
        next: () => { this.isSaving.set(false); this.saved.emit(); },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Failed to update product.');
          this.isSaving.set(false);
        },
      });
    } else {
      const dto: AdminCreateProductDto = {
        name: this.form.name.trim(),
        description: this.form.description.trim(),
        price: this.form.price!,
        stock: this.form.stock!,
        category: this.form.category,
        seller: this.form.seller,
        images: this.form.images,
      };

      this.adminProductService.createProduct(dto).subscribe({
        next: () => { this.isSaving.set(false); this.saved.emit(); },
        error: (err) => {
          this.error.set(err?.error?.message ?? 'Failed to create product.');
          this.isSaving.set(false);
        },
      });
    }
  }
}