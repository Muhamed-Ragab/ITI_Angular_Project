import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Slider } from "./slider/slider";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, Slider],
  template: `
   <app-slider/>
  `,
  styles: [],
})
export class HomeComponent {
  readonly authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
