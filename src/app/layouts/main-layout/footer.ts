import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- Footer -->
    <footer class="bg-dark text-light pt-5">
      <div class="container">
        <div class="row">
          <!-- Logo + Description -->
          <div class="col-md-4 mb-4">
            <h5 class="fw-bold text-warning">Goshop</h5>
            <p class="small">
              Goshop is an online store that offers the best products at the best prices in Egypt.
              Shop easily and enjoy a smooth and unique shopping experience.
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
            <h6 class="fw-bold">Shop</h6>
            <ul class="list-unstyled">
              <li><a routerLink="/" class="text-decoration-none text-light">Home</a></li>
              <li>
                <a routerLink="/products" class="text-decoration-none text-light">Products</a>
              </li>
              <li>
                <a routerLink="/categories" class="text-decoration-none text-light">Categories</a>
              </li>
              <li><a routerLink="/offers" class="text-decoration-none text-light">Offers</a></li>
            </ul>
          </div>

          <!-- Customer -->
          <div class="col-md-3 mb-4">
            <h6 class="fw-bold">Customer Service</h6>
            <ul class="list-unstyled">
              <li><a routerLink="/" class="text-decoration-none text-light">My Account</a></li>
              <li><a routerLink="/orders" class="text-decoration-none text-light">Orders</a></li>
              <li><a routerLink="/wishlist" class="text-decoration-none text-light">Wishlist</a></li>
              <li><a routerLink="/" class="text-decoration-none text-light">Help</a></li>
            </ul>
          </div>

          <div class="col-md-3 mb-4">
            <h6 class="fw-bold">Contact</h6>
            <p class="small mb-1"><i class="fas fa-map-marker-alt me-2"></i>Egypt</p>
            <p class="small mb-1"><i class="fas fa-envelope me-2"></i>support@goshop.com</p>
            <p class="small mb-1"><i class="fas fa-phone me-2"></i>+20 100 568 253</p>
          </div>
        </div>
      </div>

      <div class="text-center py-3 border-top border-secondary">
        © 2026 SouqMasr - All Rights Reserved
      </div>
    </footer>

    <button
      class="btn btn-warning position-fixed bottom-0 end-0 m-4 rounded-circle shadow"
      onclick="window.scrollTo({top:0, behavior:'smooth'})"
      style="width:45px;height:45px"
    >
      ↑
    </button>
  `,
})
export class Footer {}
