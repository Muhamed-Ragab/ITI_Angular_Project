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

  ngOnInit(): void {
    const target = this.editTarget();
    if (target) {
      this.name = target.name;
      this.description = target.description ?? '';
    }
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
