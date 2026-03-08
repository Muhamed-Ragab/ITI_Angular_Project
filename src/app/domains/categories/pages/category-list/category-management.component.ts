import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Category } from '../../dto';
import { CategoryService } from '../../services/category.service';
import { CategoryTreeComponent } from '../../components/category-tree/category-tree.component';
import { CategoryFormComponent } from '../category-form/category-form.component';

type ModalMode =
  | { type: 'create-root' }
  | { type: 'create-sub'; parent: Category }
  | { type: 'edit'; target: Category }
  | null;

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CategoryTreeComponent, CategoryFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="container py-4">

      <!-- Page header -->
      <div class="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 class="fw-bold mb-0">
            <i class="bi bi-diagram-3 me-2 text-primary"></i>Category Management
          </h4>
          <p class="text-muted small mb-0 mt-1">Manage the product category tree visible to customers.</p>
        </div>
        <button class="btn btn-primary" (click)="openCreateRoot()">
          <i class="bi bi-plus-lg me-1"></i>Add Root Category
        </button>
      </div>

      <!-- Loading -->
      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading…</span>
          </div>
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error() }}
          <button class="btn btn-sm btn-outline-danger ms-3" (click)="load()">Retry</button>
        </div>
      }

      <!-- Success toast -->
      @if (successMsg()) {
        <div class="alert alert-success d-flex align-items-center gap-2 py-2">
          <i class="bi bi-check-circle-fill"></i>{{ successMsg() }}
        </div>
      }

      <!-- Delete confirm banner -->
      @if (pendingDelete()) {
        <div class="alert alert-warning d-flex align-items-center justify-content-between">
          <span>
            <i class="bi bi-exclamation-triangle me-2"></i>
            Delete <strong>{{ pendingDelete()!.name }}</strong>? This cannot be undone.
            Categories with products cannot be deleted.
          </span>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" (click)="pendingDelete.set(null)">
              Cancel
            </button>
            <button
              class="btn btn-sm btn-danger"
              [disabled]="isDeleting()"
              (click)="confirmDelete()"
            >
              @if (isDeleting()) {
                <span class="spinner-border spinner-border-sm me-1"></span>
              }
              Delete
            </button>
          </div>
        </div>
      }

      <!-- Category tree card -->
      @if (!isLoading() && !error()) {
        @if (categories().length === 0) {
          <div class="card border-dashed text-center py-5">
            <div class="text-muted">
              <i class="bi bi-folder2-open" style="font-size:2.5rem"></i>
              <p class="mt-2 mb-0">No categories yet. Add your first root category.</p>
            </div>
          </div>
        } @else {
          <div class="card border-0 shadow-sm">
            <div class="card-body p-3">
              <app-category-tree
                [categories]="categories()"
                [showActions]="true"
                (edit)="openEdit($event)"
                (delete)="requestDelete($event)"
                (addSub)="openCreateSub($event)"
              />
            </div>
          </div>
        }
      }

    </div>

    <!-- Modal -->
    @if (modal()) {
      @if (modal()!.type === 'edit') {
        <app-category-form
          [editTarget]="asEdit(modal())"
          (saved)="onSaved()"
          (cancel)="modal.set(null)"
        />
      } @else if (modal()!.type === 'create-sub') {
        <app-category-form
          [parentCategory]="asSub(modal())"
          (saved)="onSaved()"
          (cancel)="modal.set(null)"
        />
      } @else {
        <app-category-form
          (saved)="onSaved()"
          (cancel)="modal.set(null)"
        />
      }
    }
  `,
})
export class CategoryManagementComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);

  readonly categories = signal<Category[]>([]);
  readonly isLoading = signal(false);
  readonly isDeleting = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMsg = signal<string | null>(null);
  readonly modal = signal<ModalMode>(null);
  readonly pendingDelete = signal<Category | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data.categories);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to load categories.');
        this.isLoading.set(false);
      },
    });
  }

  // ── Modal helpers ──────────────────────────────────────────────────────────

  openCreateRoot(): void {
    this.modal.set({ type: 'create-root' });
  }

  openCreateSub(parent: Category): void {
    this.modal.set({ type: 'create-sub', parent });
  }

  openEdit(target: Category): void {
    this.modal.set({ type: 'edit', target });
  }

  onSaved(): void {
    this.modal.set(null);
    this.showSuccess('Category saved successfully.');
    this.load();
  }

  // ── Delete ─────────────────────────────────────────────────────────────────

  requestDelete(cat: Category): void {
    this.pendingDelete.set(cat);
  }

  confirmDelete(): void {
    const cat = this.pendingDelete();
    if (!cat) return;

    this.isDeleting.set(true);
    this.categoryService.deleteCategory(cat._id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.pendingDelete.set(null);
        this.showSuccess(`"${cat.name}" deleted successfully.`);
        this.load();
      },
      error: (err) => {
        this.isDeleting.set(false);
        this.pendingDelete.set(null);
        this.error.set(err?.error?.message ?? 'Cannot delete: category may have products.');
      },
    });
  }

  // ── Template helpers (type narrowing) ─────────────────────────────────────

  asEdit(m: ModalMode): Category | null {
    return m?.type === 'edit' ? m.target : null;
  }

  asSub(m: ModalMode): Category | null {
    return m?.type === 'create-sub' ? m.parent : null;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    setTimeout(() => this.successMsg.set(null), 3000);
  }
}