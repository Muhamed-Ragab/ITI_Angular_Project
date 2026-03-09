import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
//import { RouterLink } from '@angular/router';
import { Category } from '../../dto';

@Component({
  selector: 'app-category-tree',
  standalone: true,
  //imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="list-group list-group-flush">
      @for (cat of categories(); track cat._id) {
        <li class="list-group-item px-0">
          <div class="d-flex align-items-center justify-content-between">
            <!-- Name + product count -->
            <div class="d-flex align-items-center gap-2">
              @if (cat.subcategories?.length) {
                <i class="bi bi-folder2-open text-warning"></i>
              } @else {
                <i class="bi bi-tag text-secondary"></i>
              }
              <span class="fw-semibold">{{ cat.name }}</span>
              @if (cat.description) {
                <small class="text-muted">— {{ cat.description }}</small>
              }
              @if (cat.productCount != null) {
                <span class="badge bg-secondary">{{ cat.productCount }} products</span>
              }
            </div>

            <!-- Admin actions (shown when showActions=true) -->
            @if (showActions()) {
              <div class="d-flex gap-1">
                <button
                  class="btn btn-outline-primary btn-sm"
                  title="Add subcategory"
                  (click)="addSub.emit(cat)"
                >
                  <i class="bi bi-plus-lg"></i>
                </button>
                <button
                  class="btn btn-outline-secondary btn-sm"
                  title="Edit"
                  (click)="edit.emit(cat)"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-outline-danger btn-sm"
                  title="Delete"
                  (click)="delete.emit(cat)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            }
          </div>

          <!-- Recurse into subcategories -->
          @if (cat.subcategories?.length) {
            <div class="ms-4 mt-1">
              <app-category-tree
                [categories]="cat.subcategories!"
                [showActions]="showActions()"
                (edit)="edit.emit($event)"
                (delete)="delete.emit($event)"
                (addSub)="addSub.emit($event)"
              />
            </div>
          }
        </li>
      }
    </ul>
  `,
})
export class CategoryTreeComponent {
  readonly categories = input.required<Category[]>();
  readonly showActions = input<boolean>(false);

  readonly edit = output<Category>();
  readonly delete = output<Category>();
  readonly addSub = output<Category>();
}