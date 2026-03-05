import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../main-layout/header';
import { Footer } from '../main-layout/footer';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="container">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [],
})
export class AuthLayoutComponent {}
