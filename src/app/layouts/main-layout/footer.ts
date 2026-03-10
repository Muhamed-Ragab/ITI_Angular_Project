import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <!-- Footer -->
    <footer class="bg-dark text-light pt-5">
      <div class="container">
        <div class="row">
          <!-- Logo + Description -->
          <div class="col-md-4 mb-4">
            <h5 class="fw-bold text-warning">{{ 'footer.brand' | translate }}</h5>
            <p class="small">
              {{ 'footer.description' | translate }}
            </p>

            <!-- Social -->
            <div>
              <a routerLink="" class="text-light me-3 fs-5"><i class="fab fa-facebook"></i></a>
              <a routerLink="" class="text-light me-3 fs-5"><i class="fab fa-instagram"></i></a>
              <a routerLink="" class="text-light me-3 fs-5"><i class="fab fa-twitter"></i></a>
              <a routerLink="" class="text-light fs-5"><i class="fab fa-linkedin"></i></a>
            </div>
          </div>

          <!-- Shop Links -->
          <div class="col-md-2 mb-4">
            <h6 class="fw-bold">{{ 'footer.shop' | translate }}</h6>
            <ul class="list-unstyled">
              <li><a routerLink="/" class="text-decoration-none text-light">{{ 'footer.home' | translate }}</a></li>
              <li>
                <a routerLink="/products" class="text-decoration-none text-light">{{ 'footer.products' | translate }}</a>
              </li>
              <li>
                <a routerLink="/categories" class="text-decoration-none text-light">{{ 'footer.categories' | translate }}</a>
              </li>
              <li><a routerLink="/offers" class="text-decoration-none text-light">{{ 'footer.offers' | translate }}</a></li>
            </ul>
          </div>

          <!-- Customer -->
          <div class="col-md-3 mb-4">
            <h6 class="fw-bold">{{ 'footer.customerService' | translate }}</h6>
            <ul class="list-unstyled">
              <li><a routerLink="/profile" class="text-decoration-none text-light">{{ 'footer.myAccount' | translate }}</a></li>
              <li><a routerLink="/orders" class="text-decoration-none text-light">{{ 'footer.orders' | translate }}</a></li>
              <li><a routerLink="/wishlist" class="text-decoration-none text-light">{{ 'footer.wishlist' | translate }}</a></li>
              <li><a routerLink="/" class="text-decoration-none text-light">{{ 'footer.help' | translate }}</a></li>
            </ul>
          </div>

          <div class="col-md-3 mb-4">
            <h6 class="fw-bold">{{ 'footer.contact' | translate }}</h6>
            <p class="small mb-1"><i class="fas fa-map-marker-alt me-2"></i>{{ 'footer.location' | translate }}</p>
            <p class="small mb-1"><i class="fas fa-envelope me-2"></i>support@goshop.com</p>
            <p class="small mb-1"><i class="fas fa-phone me-2"></i>+20 100 568 253</p>
          </div>
        </div>
      </div>

      <div class="text-center py-3 border-top border-secondary">
        {{ 'footer.copyright' | translate:{ year: 2026 } }}
      </div>
    </footer>

  `,
})
export class Footer {}
