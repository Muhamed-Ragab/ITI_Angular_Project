import { Component } from '@angular/core';
import { CategoryComponent } from '../../Components/category-component/category-component';

@Component({
  selector: 'app-categories.page',
  standalone: true,
  imports: [CategoryComponent],
  template: ` <app-category-component /> `,
})
export class CategoriesPage {}
