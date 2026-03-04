import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Slider } from "./slider/slider";
import { CategoryComponent } from "./Components/category-component/category-component";
import { BestSellerComponent } from "./Components/best-seller-component/best-seller-component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, Slider],
  template: `
    <app-slider/>
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
