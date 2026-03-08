import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProfileService } from '../Services/profile.service';
import { UserProfile } from '../dto/user-profile.dto';
import { ProfileFormComponent } from '../Components/profile-form.component/profile-form.component';
import { SellerApplyComponent } from '../Components/seller-apply.component/seller-apply.component';
import { SellerPayoutComponent } from '../Components/seller-payout.component.ts/seller-payout.component.ts';
import { WalletCardComponent } from '../Components/wallet-card.component/wallet-card.component';
// استيراد مكون الحالة الجديد (تأكد من صحة المسار لديك)
import { CustomerSellerStatusComponent } from '../Components/customer-seller-status.component/customer-seller-status.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProfileFormComponent,
    SellerApplyComponent,
    SellerPayoutComponent,
    WalletCardComponent,
    CustomerSellerStatusComponent, // أضفناه هنا
  ],
  template: `
<div class="container py-5">

@if (isLoading()) {
  <div class="text-center py-5">
    <div class="spinner-border text-primary"></div>
  </div>
}
@else if (profile(); as user) {

  <div class="row g-4">

    <div class="col-lg-8">

      <app-profile-form
        [user]="user"
        [form]="profileForm"
        [isSaving]="isSaving()"
        [statusMessage]="statusMessage()"
        (save)="saveAll()"
        (clearMessage)="statusMessage.set('')">
      </app-profile-form>

      @if(user.role === 'customer'){
        <app-customer-seller-status 
          [sellerProfile]="user.seller_profile">
        </app-customer-seller-status>

        <app-seller-apply
          [form]="sellerForm"
          [isApplying]="isApplying()"
          [status]="sellerStatus()"
          (apply)="applyForSeller()">
        </app-seller-apply>
      }

      @if(user.role === 'seller'){
        <app-seller-payout
          [form]="payoutForm"
          [status]="payoutStatus()"
          [loading]="isWithdrawing()"
          (withdraw)="withdraw()">
        </app-seller-payout>
      }

    </div>

    <div class="col-lg-4">
      <app-wallet-card
        [balance]="user.wallet_balance"
        [points]="user.loyalty_points">
      </app-wallet-card>
    </div>
  </div>
}
</div>
`
})
export class ProfilePageComponent implements OnInit {

  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  profile = signal<UserProfile | null>(null);

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

  ngOnInit(){
    this.initForms();
    this.loadData();
  }

  initForms(){
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.pattern(/^\+2[0-9]{10,15}$/)]],
      preferred_language: ['en', Validators.required],
      marketing_preferences: this.fb.group({
        push_notifications: [false],
        email_newsletter: [false],
        promotional_notifications: [false]
      })
    });

    this.sellerForm = this.fb.group({
      store_name: ['', [Validators.required, Validators.minLength(3)]],
      bio: ['', [Validators.maxLength(300)]]
    });

    this.payoutForm = this.fb.group({
      amount: [0, [
        Validators.required,
        Validators.min(1),
        Validators.max(100000)
      ]]
    });
  }

  loadData(){
    this.isLoading.set(true);
    this.profileService.getUserProfile().subscribe({
      next:(user)=>{
        this.profile.set(user);
        this.profileForm.patchValue(user);
        this.isLoading.set(false);
      },
      error:()=>this.isLoading.set(false)
    })
  }

  applyForSeller(){
    if(this.sellerForm.invalid){
      this.sellerForm.markAllAsTouched();
      return;
    }

    this.isApplying.set(true);
    this.sellerStatus.set('');

    const payload = {
      store_name:String(this.sellerForm.value.store_name),
      bio:String(this.sellerForm.value.bio || ""),
      payout_method:"bank_transfer"
    };

    this.profileService.requestSellerOnboarding(payload).subscribe({
      next:()=>{
        this.isApplying.set(false);
        this.sellerStatus.set('Request submitted successfully! Status: Pending.');
        this.sellerForm.reset();
        this.sellerForm.markAsPristine();
        this.sellerForm.markAsUntouched();
        // تحديث البيانات فوراً لرؤية الحالة الجديدة
        this.loadData();
      },
      error:(err)=>{
        this.isApplying.set(false);
        this.sellerStatus.set('Error: '+(err.error?.message || 'Invalid Data'));
      }
    });
  }

  saveAll(){
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    const val = this.profileForm.getRawValue();
    forkJoin({
      profile:this.profileService.updateProfile({name:val.name,phone:val.phone}),
      lang:this.profileService.updateLanguage(val.preferred_language),
      marketing:this.profileService.updateMarketing(val.marketing_preferences)
    }).subscribe({
      next:()=>{
        this.statusMessage.set('Profile updated! ✅');
        this.isSaving.set(false);
        this.profileForm.markAsPristine();
        this.profileForm.markAsUntouched();
      },
      error:()=>this.isSaving.set(false)
    })
  }

  withdraw(){
    if (this.payoutForm.invalid) {
      this.payoutForm.markAllAsTouched();
      return;
    }
    this.isWithdrawing.set(true);
    this.profileService.requestPayout(this.payoutForm.value).subscribe({
      next:()=>{
        this.payoutStatus.set('Withdrawal pending approval.');
        this.isWithdrawing.set(false);
        this.payoutForm.markAsPristine();
        this.payoutForm.markAsUntouched();
      },
      error:()=>this.isWithdrawing.set(false)
    })
  }
}