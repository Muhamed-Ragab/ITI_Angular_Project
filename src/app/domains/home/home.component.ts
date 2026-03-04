import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CategoryComponent } from "./Components/category-component/category-component";
import { BestSellerComponent } from "./Components/best-seller-component/best-seller-component";

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <app-category-component/>
    <app-best-seller-component/>
`,
  styles: [],
  imports: [CategoryComponent, BestSellerComponent],
})
export class HomeComponent {
  readonly authService = inject(AuthService);
  
  onLogout(): void {
    this.authService.logout();
  }
}
