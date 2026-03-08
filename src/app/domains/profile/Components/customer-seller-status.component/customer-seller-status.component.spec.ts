import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerSellerStatusComponent } from './customer-seller-status.component';

describe('CustomerSellerStatusComponent', () => {
  let component: CustomerSellerStatusComponent;
  let fixture: ComponentFixture<CustomerSellerStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerSellerStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerSellerStatusComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
