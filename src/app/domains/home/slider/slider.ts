import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SliderBannerService } from './slider.banner.service';

@Component({
  selector: 'app-slider',
  standalone:true,
  imports: [RouterLink],
  template: `
  <div id="mainCarousel" class="carousel slide w-100" data-bs-ride="carousel" data-bs-interval="4000">
  
  <!-- Indicators -->
  <div class="carousel-indicators">
    @for (slide of slides; track $index) {
      @if ($index === 0) {
        <button 
              type="button"
              data-bs-target="#mainCarousel"
              [attr.data-bs-slide-to]="$index"
              class="active"
              aria-current="true">
        </button>
      } @else {
        <button 
              type="button"
              data-bs-target="#mainCarousel"
              [attr.data-bs-slide-to]="$index">
        </button>
      }
    }
  
  </div>

  <!-- Slides -->
  <div class="carousel-inner">
    @for (slide of slides; track $index) {
      @if ($index === 0) {
        <div class="carousel-item active">
          <img [src]="slide.img" class="d-block w-100 slider-img" [alt]="slide.title">
          <div class="carousel-caption d-none d-md-block">
            <h5 class="text-white">{{ slide.title }}</h5>
            <p class="text-white">{{ slide.desc }}</p>
            <a class="btn btn-warning" [routerLink]="slide.link">Shop Now</a>
          </div>
        </div>
      } @else {
        <div class="carousel-item">
          <img [src]="slide.img" class="d-block w-100 slider-img" [alt]="slide.title">
          <div class="carousel-caption d-none d-md-block">
            <h5 class="text-white">{{ slide.title }}</h5>
            <p class="text-white">{{ slide.desc }}</p>
            <a class="btn btn-warning" [routerLink]="slide.link">Shop Now</a>
          </div>
        </div>
      }
    }
  
  </div>

  <!-- Controls -->
  <button class="carousel-control-prev" type="button" data-bs-target="#mainCarousel" data-bs-slide="prev">
    <span class="carousel-control-prev-icon"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#mainCarousel" data-bs-slide="next">
    <span class="carousel-control-next-icon"></span>
    <span class="visually-hidden">Next</span>
  </button>

</div>
`,
  styles:`
  .slider-img {
  height: 60vh;   
  object-fit: cover;
  width: 100%;
}
`
})
export class Slider {
  // slides = [
  //   { img: 'slide1.jpg', title: 'Big Sale on Electronics', desc: 'Up to 50% off on selected items', link: '/category/electronics' },
  //   { img: 'slide2.jpg', title: 'Fashion Trends', desc: 'New arrivals for this season', link: '/category/fashion' },
  //   { img: 'slide3.jpg', title: 'Home Essentials', desc: 'Upgrade your home today', link: '/category/home' },
  //   { img: 'slide4.jpg', title: 'Home Essentials', desc: 'Upgrade your home today', link: '/category/home' }
  // ];

  private banner=inject(SliderBannerService);
  
}
