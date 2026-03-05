import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Slider } from './slider/slider';
import { CategoryComponent } from './Components/category-component/category-component';
import { BestSellerComponent } from './Components/best-seller-component/best-seller-component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Slider, CategoryComponent, BestSellerComponent],
  template: `
    <main>
      <app-slider />
      <app-category-component />
      <app-best-seller-component />
    </main>
  `,
  styles: [],
})
export class HomeComponent {
  readonly authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
