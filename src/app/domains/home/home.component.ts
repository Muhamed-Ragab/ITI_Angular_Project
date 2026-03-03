import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>hello</h1>
  `,
  styles: [],
})
export class HomeComponent {
  readonly authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}
