import {
  ChangeDetectionStrategy, Component, inject, input, OnInit, output, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '@domains/categories/dto';
import { SellerService } from '../../services/seller.services';
import { SellerProduct, SellerCreateProductDto, SellerUpdateProductDto } from '../../dto/seller.dto';

@Component({
  selector: 'app-seller-product-form',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal d-block" tabindex="-1" style="background:rgba(0,0,0,.6)">
      <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg">

          <div class="modal-header border-0 pb-0" style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)">
            <h5 class="modal-title text-white fw-bold">
              <i class="bi bi-{{ editTarget() ? 'pencil-square' : 'plus-circle' }} me-2" style="color:#4ade80"></i>
              {{ editTarget() ? 'Edit Product' : 'Add New Product' }}
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="cancel.emit()"></button>
          </div>

          <div class="modal-body p-4">
            @if (error()) {
              <div class="alert alert-danger py-2 border-0 rounded-3">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ error() }}
              </div>
            }

            @if (loadingCats()) {
              <div class="text-center py-4">
                <div class="spinner-border text-primary spinner-border-sm"></div>
              </div>
            } @else {
              <div class="row g-3">

                <div class="col-12">
                  <label class="form-label fw-semibold small text-uppercase text-muted ls-1">
                    Product Name <span class="text-danger">*</span>
                  </label>
                  <input class="form-control form-control-lg border-0 bg-light rounded-3"
                    placeholder="e.g. Wireless Headphones Pro"
                    [(ngModel)]="form.title" name="title" />
                  @if (form.title.length > 0 && form.title.length < 3) {
                    <small class="text-danger">Minimum 3 characters</small>
                  }
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold small text-uppercase text-muted">
                    Description <span class="text-danger">*</span>
                    <span class="text-muted fw-normal">(min 10 chars)</span>
                  </label>
                  <textarea class="form-control border-0 bg-light rounded-3" rows="4"
                    placeholder="Describe your product in detail…"
                    [(ngModel)]="form.description" name="description"></textarea>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small text-uppercase text-muted">
                    Price ($) <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text border-0 bg-light">$</span>
                    <input type="number" class="form-control border-0 bg-light rounded-end-3"
                      placeholder="0.00" min="0" step="0.01"
                      [(ngModel)]="form.price" name="price" />
                  </div>
                </div>

                <div class="col-md-6">
                  <label class="form-label fw-semibold small text-uppercase text-muted">
                    Stock Quantity <span class="text-danger">*</span>
                  </label>
                  <input type="number" class="form-control border-0 bg-light rounded-3"
                    placeholder="0" min="0"
                    [(ngModel)]="form.stock_quantity" name="stock_quantity" />
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold small text-uppercase text-muted">
                    Category <span class="text-danger">*</span>
                  </label>
                  <select class="form-select border-0 bg-light rounded-3"
                    [(ngModel)]="form.category_id" name="category_id">
                    <option value="">— Select category —</option>
                    @for (cat of flatCategories(); track cat._id) {
                      <option [value]="cat._id">{{ cat.parentId ? '↳ ' : '' }}{{ cat.name }}</option>
                    }
                  </select>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold small text-uppercase text-muted">Image URLs</label>
                  <small class="text-muted d-block mb-2">One URL per line</small>
                  <textarea class="form-control font-monospace border-0 bg-light rounded-3" rows="3"
                    placeholder="https://cdn.example.com/img1.jpg&#10;https://cdn.example.com/img2.jpg"
                    [ngModel]="imagesText()" (ngModelChange)="onImagesChange($event)" name="images"></textarea>
                </div>

                @if (form.images.length > 0) {
                  <div class="col-12">
                    <div class="d-flex gap-2 flex-wrap">
                      @for (img of form.images; track $index) {
                        <img [src]="img" class="rounded-3 border"
                          style="width:80px;height:80px;object-fit:cover"
                          (error)="onImgError($event)" />
                      }
                    </div>
                  </div>
                }

              </div>
            }
          </div>

          <div class="modal-footer border-0 pt-0">
            <button class="btn btn-outline-secondary rounded-pill px-4" (click)="cancel.emit()" [disabled]="isSaving()">
              Cancel
            </button>
            <button class="btn rounded-pill px-4 fw-semibold"
              style="background:linear-gradient(135deg,#4ade80,#22c55e);color:#fff;border:none"
              (click)="save()" [disabled]="isSaving() || loadingCats() || !isValid()">
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
export class SellerProductFormComponent implements OnInit {
  private readonly sellerService = inject(SellerService);

  readonly editTarget = input<SellerProduct | null>(null);
  readonly saved  = output<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();

  readonly flatCategories = signal<Category[]>([]);
  readonly loadingCats = signal(true);
  readonly isSaving = signal(false);
  readonly error    = signal<string | null>(null);

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
      this.form.title          = t.title ?? '';
      this.form.description    = t.description ?? '';
      this.form.price          = t.price;
      this.form.stock_quantity = t.stock_quantity ?? 0;
      this.form.category_id    = t.category_id?._id ?? t.category_id?.id ?? '';
      this.form.images         = [...(t.images ?? [])];
    }

    this.sellerService.getCategories().subscribe({
      next: (res) => {
        const flat: Category[] = [];
        const flatten = (cats: Category[]) =>
          cats.forEach(c => { flat.push(c); if (c.subcategories?.length) flatten(c.subcategories); });
        flatten(res.data.categories);
        this.flatCategories.set(flat);
        this.loadingCats.set(false);
      },
      error: () => this.loadingCats.set(false),
    });
  }

  imagesText(): string { return this.form.images.join('\n'); }
  onImagesChange(val: string): void {
    this.form.images = val.split('\n').map(s => s.trim()).filter(Boolean);
  }
  onImgError(e: Event): void {
    (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/e2e8f0/94a3b8?text=?';
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
    const target = this.editTarget();

    if (target) {
      const dto: SellerUpdateProductDto = {
        title: this.form.title.trim(), description: this.form.description.trim(),
        price: this.form.price!, stock_quantity: this.form.stock_quantity!,
        category_id: this.form.category_id, images: this.form.images,
      };
      const id = (target._id ?? target.id) as string;
      this.sellerService.updateProduct(id, dto).subscribe({
        next:  () => { this.isSaving.set(false); this.saved.emit(); },
        error: (err) => { this.error.set(err?.error?.message ?? 'Failed to update.'); this.isSaving.set(false); },
      });
    } else {
      const dto: SellerCreateProductDto = {
        title: this.form.title.trim(), description: this.form.description.trim(),
        price: this.form.price!, stock_quantity: this.form.stock_quantity!,
        category_id: this.form.category_id, images: this.form.images,
      };
      this.sellerService.createProduct(dto).subscribe({
        next:  () => { this.isSaving.set(false); this.saved.emit(); },
        error: (err) => { this.error.set(err?.error?.message ?? 'Failed to create.'); this.isSaving.set(false); },
      });
    }
  }
}
