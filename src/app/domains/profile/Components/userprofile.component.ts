import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../Services/profile.service';
import { UserProfile, PaymentMethod } from '../dto/user-profile.dto';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-userprofile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  template: `
<div class="container py-5">
  @if (isLoading()) {
    <div class="text-center py-5"><div class="spinner-border text-primary"></div></div>
  } @else if (profile(); as user) {

    @if (statusMessage()) {
      <div class="alert alert-success alert-dismissible fade show shadow mb-4">
        <i class="bi bi-check-circle-fill me-2"></i> {{ statusMessage() }}
        <button type="button" class="btn-close" (click)="statusMessage.set('')"></button>
      </div>
    }

    <div class="row g-4">
      <div class="col-lg-8">
        <form [formGroup]="profileForm" (ngSubmit)="saveAll()">
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-body p-4">
              <h5 class="fw-bold mb-4 border-bottom pb-2">Account Details</h5>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Full Name</label>
                  <input class="form-control" formControlName="name" [class.is-invalid]="profileForm.get('name')?.invalid && profileForm.get('name')?.touched">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Email</label>
                  <input class="form-control bg-light" [value]="user.email" disabled>
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Phone</label>
                  <input class="form-control" formControlName="phone">
                </div>
                <div class="col-md-6">
                  <label class="form-label small fw-bold">Language</label>
                  <select class="form-select" formControlName="preferred_language">
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg w-100 fw-bold shadow-sm" [disabled]="isSaving()">
            {{ isSaving() ? 'Processing...' : 'Save Changes' }}
          </button>
        </form>

        @if (user.role === 'customer') {
          <div class="card border-0 shadow-sm mt-4 bg-light border-start border-4 border-primary">
            <div class="card-body p-4" [formGroup]="sellerForm">
              <h5 class="fw-bold text-primary mb-3">Apply to become a Seller</h5>
              <div class="mb-3">
                <input class="form-control" placeholder="Store Name" formControlName="store_name"
                       [class.is-invalid]="sellerForm.get('store_name')?.invalid && sellerForm.get('store_name')?.touched">
              </div>
              <textarea class="form-control mb-3" placeholder="Tell us about your products (Bio)" formControlName="bio"></textarea>
              <button class="btn btn-dark w-100 fw-bold" (click)="applyForSeller()" [disabled]="isApplying()">
                {{ isApplying() ? 'Sending...' : 'Submit Seller Request' }}
              </button>
              @if (sellerStatus()) {
                <div class="mt-2 small fw-bold" [ngClass]="sellerStatus().includes('Error') ? 'text-danger' : 'text-primary'">
                  {{ sellerStatus() }}
                </div>
              }
            </div>
          </div>
        }

        @if (user.role === 'admin') {
          <div class="card border-0 shadow-sm mt-4 bg-white border-top border-4 border-warning">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="fw-bold text-dark">Admin: Pending Seller Requests</h5>
                <button class="btn btn-warning btn-sm fw-bold" (click)="checkAllRequests()">Refresh List</button>
              </div>

             @if (adminRequests().length > 0) {
  <div class="list-group list-group-flush border rounded shadow-sm bg-white p-2">
    @for (req of adminRequests(); track req._id) {
      <div class="list-group-item d-flex justify-content-between align-items-start py-3">
        <div class="ms-2 me-auto">
          <div class="fw-bold text-primary">{{ req.name }}</div>
          <div class="small text-muted mb-1">{{ req.email }}</div>
          
          <div class="small fw-bold">Store: {{ req.store_name || 'Not Provided' }}</div>
          <div class="small text-secondary">{{ req.phone }}</div>
        </div>
        
        <div class="text-end">
          <span class="badge bg-warning text-dark px-3 py-2">PENDING</span>
          <div class="mt-2">
             <button class="btn btn-sm btn-success me-1">Approve</button>
             <button class="btn btn-sm btn-outline-danger">Reject</button>
          </div>
        </div>
      </div>
    }
  </div>
} @else {
  <div class="alert alert-light text-center border">
    <i class="bi bi-inbox me-2"></i> No requests to show.
  </div>
}




            </div>
          </div>
        }

        @if (user.role === 'seller') {
          <div class="card border-0 shadow-sm mt-4 bg-light border-start border-4 border-success">
            <div class="card-body p-4" [formGroup]="payoutForm">
              <h5 class="fw-bold text-success mb-3">Withdraw Earnings</h5>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input type="number" class="form-control" formControlName="amount">
                <button class="btn btn-success fw-bold" (click)="withdraw()" [disabled]="isWithdrawing()">Withdraw</button>
              </div>
              @if (payoutStatus()) {
                <div class="mt-2 small text-success fw-bold">{{ payoutStatus() }}</div>
              }
            </div>
          </div>
        }
      </div>

      <div class="col-lg-4">
        <div class="card bg-dark text-white shadow border-0 mb-4 p-4 text-center">
          <small class="text-white-50">Wallet Balance</small>
          <h2 class="fw-bold">{{ user.wallet_balance | currency:'USD' }}</h2>
          <p class="mb-0 text-warning small">Points: {{ user.loyalty_points }}</p>
        </div>

        <div class="card shadow-sm border-0">
          <div class="card-header bg-white py-3 fw-bold d-flex justify-content-between align-items-center">
            <span>Saved Cards</span>
            <button class="btn btn-sm btn-primary" (click)="addCard()">+ Add</button>
          </div>
          <div class="card-body p-0">
            @for (card of paymentMethods(); track card.id) {
              <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
                <div>
                  <span class="fw-bold small text-uppercase">{{ card.brand }}</span>
                  <small class="text-muted d-block">•••• {{ card.last4 }}</small>
                </div>
                <button class="btn btn-sm text-danger" (click)="deleteCard(card.id)"><i class="bi bi-trash"></i></button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  }
</div>
  `
})
export class UserprofileComponent implements OnInit {
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  profile = signal<UserProfile | null>(null);
  paymentMethods = signal<PaymentMethod[]>([]);
  adminRequests = signal<any[]>([]);

  isLoading = signal(true);
  isSaving = signal(false);
  isApplying = signal(false);
  isWithdrawing = signal(false);

  statusMessage = signal('');
  sellerStatus = signal('');
  payoutStatus = signal('');

  profileForm!: FormGroup;
  sellerForm!: FormGroup;
  payoutForm!: FormGroup;

  ngOnInit() {
    this.initForms();
    this.loadData();
  }

  initForms() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      preferred_language: ['en'],
      marketing_preferences: this.fb.group({
        push_notifications: [false],
        email_newsletter: [false],
        promotional_notifications: [false]
      })
    });

    this.sellerForm = this.fb.group({ store_name: ['', Validators.required], bio: [''] });
    this.payoutForm = this.fb.group({ amount: [0, [Validators.required, Validators.min(1)]] });
  }

  loadData() {
    this.isLoading.set(true);
    this.profileService.getUserProfile().subscribe({
      next: (user) => {
        this.profile.set(user);
        this.profileForm.patchValue(user);
        this.isLoading.set(false);
        this.refreshCards();
        if (user.role === 'admin') this.checkAllRequests();
      },
      error: () => this.isLoading.set(false)
    });
  }

  // تطبيق طلب البائع (المتطابق مع الـ JSON)
  applyForSeller() {
    if (this.sellerForm.invalid) { this.sellerForm.markAllAsTouched(); return; }
    
    this.isApplying.set(true);
    this.sellerStatus.set('');

    const payload = {
      store_name: String(this.sellerForm.value.store_name),
      bio: String(this.sellerForm.value.bio || ""),
      payout_method: "bank_transfer" // القيمة الإجبارية حسب الـ JSON
    };

    this.profileService.requestSellerOnboarding(payload).subscribe({
      next: (res) => {
        this.isApplying.set(false);
        this.sellerStatus.set('Request submitted successfully! Status: Pending.');
        this.sellerForm.reset();
      },
      error: (err) => {
        this.isApplying.set(false);
        this.sellerStatus.set('Error: ' + (err.error?.message || 'Invalid Data'));
      }
    });
  }

  // جلب الطلبات للأدمن
  checkAllRequests() {
  this.profileService.getAdminSellerRequests().subscribe({
    next: (res) => {
      console.log('Full Admin Response:', res);
      
      // التعديل هنا: الـ Array موجود مباشرة جوه res.data
      if (res && res.success && Array.isArray(res.data)) {
        this.adminRequests.set(res.data); // بنخزن الـ Array اللي فيه Alice وغيرها
      } else {
        this.adminRequests.set([]);
        console.warn('Expected an array in res.data but got:', res.data);
      }
    },
    error: (err) => {
      console.error('Admin Fetch Error:', err);
    }
  });
}

  // بقية الوظائف
  saveAll() {
    this.isSaving.set(true);
    const val = this.profileForm.getRawValue();
    forkJoin({
      profile: this.profileService.updateProfile({ name: val.name, phone: val.phone }),
      lang: this.profileService.updateLanguage(val.preferred_language),
      marketing: this.profileService.updateMarketing(val.marketing_preferences)
    }).subscribe({
      next: () => { this.statusMessage.set('Profile updated! ✅'); this.isSaving.set(false); },
      error: () => this.isSaving.set(false)
    });
  }

  withdraw() {
    this.isWithdrawing.set(true);
    this.profileService.requestPayout(this.payoutForm.value).subscribe({
      next: () => { this.payoutStatus.set('Withdrawal pending approval.'); this.isWithdrawing.set(false); },
      error: () => this.isWithdrawing.set(false)
    });
  }

  refreshCards() { this.profileService.getPaymentMethods().subscribe(res => this.paymentMethods.set(res)); }
  addCard() { this.profileService.addPaymentMethod({provider: 'stripe', brand:'visa', last4:'4242'}).subscribe(() => this.refreshCards()); }
  deleteCard(id: string) { if(confirm('Delete?')) this.profileService.removePaymentMethod(id).subscribe(() => this.refreshCards()); }
}