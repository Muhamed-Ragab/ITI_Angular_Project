import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SliderBannerService } from './slider.banner.service';
import { Banner } from '../dto/banner.dto';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div
      id="mainCarousel"
      class="carousel slide w-100"
      data-bs-ride="carousel"
      data-bs-interval="4000"
    >
      <!-- Indicators -->
      <div class="carousel-indicators">
        @for (slide of sliders(); track $index) {
          @if ($index === 0) {
            <button
              type="button"
              data-bs-target="#mainCarousel"
              [attr.data-bs-slide-to]="$index"
              class="active"
              aria-current="true"
            ></button>
          } @else {
            <button
              type="button"
              data-bs-target="#mainCarousel"
              [attr.data-bs-slide-to]="$index"
            ></button>
          }
        }
      </div>

      <!-- Slides -->
      <div class="carousel-inner">
        @for (slide of sliders(); track $index) {
          @if ($index === 0) {
            <div class="carousel-item active">
              <img [src]="slide.image_url" class="d-block w-100 slider-img" [alt]="slide.title" />
              <div class="carousel-caption d-none d-md-block">
                <h5 class="text-white">{{ slide.title }}</h5>
                <p class="text-white">{{ slide.content }}</p>
                <a class="btn btn-warning" [routerLink]="slide.link">Shop Now</a>
              </div>
            </div>
          } @else {
            <div class="carousel-item">
              <img [src]="slide.image_url" class="d-block w-100 slider-img" [alt]="slide.title" />
              <div class="carousel-caption d-none d-md-block">
                <h5 class="text-white">{{ slide.title }}</h5>
                <p class="text-white">{{ slide.content }}</p>
                <a class="btn btn-warning" [routerLink]="slide.link">Shop Now</a>
              </div>
            </div>
          }
        }
      </div>

      <!-- Controls -->
      <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#mainCarousel"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#mainCarousel"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  `,
  styles: `
    .slider-img {
      height: 60vh;
    }
  `,
})
export class Slider {
  private banner = inject(SliderBannerService);
  // private router = inject(Router)
  sliders = signal<Banner[]>([]);
  loading = signal(true);
  constructor() {
    this.loadProduct();
  }

  loadProduct() {
    this.banner.getHomeBanner().subscribe({
      next: (res) => {
        this.sliders.set(res);
        console.log(res);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
