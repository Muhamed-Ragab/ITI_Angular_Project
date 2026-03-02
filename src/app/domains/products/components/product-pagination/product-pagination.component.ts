import { Component, input, output } from '@angular/core';
import { ProductPagination } from '../../dto';

@Component({
  selector: 'app-product-pagination',
  standalone: true,
  template: `
    @if (pagination()) {
      <nav class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" [class.disabled]="pagination()!.page <= 1">
            <button class="page-link" (click)="pageChange.emit(pagination()!.page - 1)">
              <i class="bi bi-chevron-left"></i>
            </button>
          </li>
          <li class="page-item disabled">
            <span class="page-link">
              Page {{ pagination()!.page }} of {{ pagination()!.pages }}
              &nbsp;·&nbsp; {{ pagination()!.total }} items
            </span>
          </li>
          <li class="page-item" [class.disabled]="pagination()!.page >= pagination()!.pages">
            <button class="page-link" (click)="pageChange.emit(pagination()!.page + 1)">
              <i class="bi bi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    }
  `,
})
export class ProductPaginationComponent {
  readonly pagination = input<ProductPagination | null>(null);
  readonly pageChange = output<number>();
}