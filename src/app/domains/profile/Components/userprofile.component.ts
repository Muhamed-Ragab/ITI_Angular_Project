import { Component, inject, signal } from '@angular/core';
import { UserProfile } from '../dto/user-profile.dto';
import { sign } from 'node:crypto';
import { ProfileService } from '../Services/profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-userprofile.component',
  standalone:true,
  imports: [CommonModule,FormsModule],
  template: `
  <div class="container py-5">
    @if (isLoading()) {
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>
    } @else if (profile(); as user) {
      
      <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 class="fw-bold mb-1">Welcome, {{ user.name }}</h2>
          <span class="badge rounded-pill shadow-sm" [ngClass]="{
            'bg-primary-subtle text-primary border border-primary': user.role === 'customer',
            'bg-success-subtle text-success border border-success': user.role === 'seller',
            'bg-danger-subtle text-danger border border-danger': user.role === 'admin'
          }">{{ user.role | titlecase }} Account</span>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-header bg-transparent border-bottom py-3 fw-bold">
              <i class="bi bi-person-gear me-2 text-primary"></i>Personal Information
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Full Name</label>
                  <input class="form-control" [ngModel]="user.name" (ngModelChange)="updateField('name', $event)">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Email Address</label>
                  <input class="form-control bg-light" [value]="user.email" disabled>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Phone Number</label>
                  <input class="form-control" [ngModel]="user.phone" (ngModelChange)="updateField('phone', $event)">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-semibold">Preferred Language</label>
                  <select class="form-select" [ngModel]="user.preferred_language" (ngModelChange)="updateField('preferred_language', $event)">
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
              
              <div class="mt-4 pt-3 border-top d-flex align-items-center gap-3">
                <button class="btn btn-primary px-4 fw-bold" (click)="updateProfile()" [disabled]="isSaving()">
                  @if (isSaving()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                  Save Profile Changes
                </button>
                @if (message()) {
                  <span class="text-success small fw-semibold animate__animated animate__fadeIn">
                    <i class="bi bi-check2-circle me-1"></i> {{ message() }}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card bg-dark text-white shadow border-0 mb-4 overflow-hidden position-relative">
            <div class="card-body p-4">
              <p class="text-white-50 small mb-1">Available Balance</p>
              <h2 class="display-6 fw-bold mb-0">{{ user.wallet_balance | currency:'USD' }}</h2>
              <i class="bi bi-wallet2 position-absolute top-50 end-0 translate-middle-y opacity-25 me-3" style="font-size: 3.5rem;"></i>
            </div>
          </div>

          <div class="card bg-warning-subtle text-warning-emphasis shadow-sm border-0 overflow-hidden">
            <div class="card-body p-4 text-center">
              <p class="small mb-1 text-uppercase fw-bold opacity-75">Loyalty Points</p>
              <h3 class="fw-bold mb-0 text-dark">
                <i class="bi bi-star-fill text-warning me-2"></i>{{ user.loyalty_points }}
              </h3>
            </div>
            <div class="bg-warning py-1 text-center small fw-bold text-dark">
              Exclusive Rewards Member
            </div>
          </div>
        </div>
      </div>

    } @else {
      <div class="text-center py-5 text-muted">
        <i class="bi bi-person-x mb-2" style="font-size: 3rem;"></i>
        <p>No profile record found.</p>
      </div>
    }
  </div>
  `
})
export class UserprofileComponent {

   private userService = inject(ProfileService);
  
  profile = signal<UserProfile | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  message = signal('');

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.userService.getUserProfile().subscribe({
      next: (res) => {
        console.log(res)
        this.profile.set(res);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  updateField(field: keyof UserProfile, value: any) {
    this.profile.update(p => p ? { ...p, [field]: value } : null);
  }

  updateProfile() {
    const data = this.profile();
    if (!data) return;

    this.isSaving.set(true);
    this.userService.updateProfile(data).subscribe({
      next: (res) => {
        this.profile.set(res);
        this.message.set('Profile updated!');
        this.isSaving.set(false);
        setTimeout(() => this.message.set(''), 3000);
      },
      error: () => this.isSaving.set(false)
    });
  }
}
