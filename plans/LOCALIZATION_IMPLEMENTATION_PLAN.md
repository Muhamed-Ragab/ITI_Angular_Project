# ITI Angular E-Commerce Localization (i18n) Implementation Plan

**Project:** ITI Angular E-Commerce Frontend  
**Version:** 2.0 (Comprehensive)  
**Date:** March 2026  
**Status:** Comprehensive Implementation Plan

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Existing i18n Infrastructure](#2-existing-i18n-infrastructure)
3. [Translation Key Naming Conventions](#3-translation-key-naming-conventions)
4. [Catalog of Untranslated Strings](#4-catalog-of-untranslated-strings)
5. [Priority Implementation Order](#5-priority-implementation-order)
6. [Step-by-Step Implementation Guide](#6-step-by-step-implementation-guide)
7. [Recommended JSON Structure](#7-recommended-json-structure)
8. [Testing Approach](#8-testing-approach)

---

## 1. Executive Summary

The ITI Angular E-Commerce project has a **partially implemented i18n infrastructure** using `ngx-translate`. The foundation is in place with:

- **I18nService** for language switching with RTL support
- **Translation files** at `src/assets/i18n/en.json` and `src/assets/i18n/ar.json`
- **Partial translations** for common, roles, nav, and footer sections
- **Language switcher component** for user language selection
- **Bootstrap RTL support** for Arabic text rendering

**However, most application components contain hardcoded English strings** that need to be converted to use the translate pipe. This plan catalogs all untranslated strings and provides a systematic approach to complete the localization implementation.

---

## 2. Existing i18n Infrastructure

### 2.1 Core Files

| File | Purpose |
|------|---------|
| `src/app/core/services/i18n.service.ts` | Language switching, RTL support, Bootstrap RTL toggle |
| `src/app/core/i18n/translate.provider.ts` | ngx-translate configuration with JSON loader |
| `src/app/core/i18n/app-initializer.ts` | App initializer for i18n |
| `src/app/core/services/i18n-init.service.ts` | Initialization service |
| `src/app/shared/components/language-switcher/` | Language switcher UI component |

### 2.2 Translation Files

| File | Status |
|------|--------|
| `src/assets/i18n/en.json` | Partially populated (~40 keys) |
| `src/assets/i18n/ar.json` | Partially populated (~40 keys) |

### 2.3 Current Translation Keys (Existing)

```json
{
  "common": {
    "language": "Language",
    "english": "English",
    "arabic": "Arabic",
    "logout": "Logout",
    "login": "Login",
    "profile": "Profile",
    "cart": "Cart",
    "wishlist": "Wishlist",
    "categories": "Categories",
    "orders": "My Orders"
  },
  "roles": {
    "admin": "Admin",
    "seller": "Seller"
  },
  "nav": {
    "manageCategories": "Manage Categories",
    "manageProducts": "Manage Products",
    "manageSellerRequest": "Manage Seller Request",
    "payoutStatus": "Payout Status"
  },
  "footer": {
    "brand": "Goshop",
    "description": "...",
    "shop": "Shop",
    "home": "Home",
    "products": "Products",
    "categories": "Categories",
    "offers": "Offers",
    "customerService": "Customer Service",
    "myAccount": "My Account",
    "orders": "Orders",
    "wishlist": "Wishlist",
    "help": "Help",
    "contact": "Contact",
    "location": "Egypt",
    "copyright": "© {{year}} SouqMasr - All Rights Reserved"
  }
}
```

### 2.4 Infrastructure Features

- ✅ Language detection from URL, localStorage, and browser
- ✅ RTL/LTR direction switching
- ✅ Bootstrap RTL CSS toggling
- ✅ Persistent language preference
- ✅ Lazy-loaded translation files

---

## 3. Translation Key Naming Conventions

### 3.1 Pattern Structure

Following the existing pattern: `{domain}.{feature}.{element}`

| Level | Description | Examples |
|-------|-------------|----------|
| `domain` | Top-level domain/area | `auth`, `cart`, `products`, `orders`, `profile`, `admin`, `seller`, `home`, `checkout` |
| `feature` | Specific feature within domain | `login`, `register`, `form`, `list`, `detail`, `summary` |
| `element` | Specific UI element | `title`, `label`, `placeholder`, `button`, `message`, `error`, `success` |

### 3.2 Common Keys (Reusable)

| Key Pattern | Usage |
|-------------|-------|
| `common.*` | Buttons, labels, generic terms (Loading, Save, Cancel, etc.) |
| `validation.*` | Form validation messages |
| `errors.*` | Error messages |
| `status.*` | Order/status labels |

### 3.3 Examples

| Component | Key |
|-----------|-----|
| Login title | `auth.login.title` |
| Email label | `auth.login.emailLabel` |
| Email placeholder | `auth.login.emailPlaceholder` |
| Password label | `auth.login.passwordLabel` |
| Login button | `auth.login.submitButton` |
| Cart title | `cart.title` |
| Checkout button | `checkout.placeOrderButton` |

---

## 4. Catalog of Untranslated Strings

### 4.1 Authentication Domain (`src/app/domains/auth/`)

#### Login Component (`src/app/domains/auth/components/login/login.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 17 | `Login` | `auth.login.title` |
| 22 | `Email verified successfully! Please login.` | `auth.login.emailVerified` |
| 34 | `Email` | `auth.login.emailLabel` |
| 39 | `Enter your email` | `auth.login.emailPlaceholder` |
| 49 | `Password` | `auth.login.passwordLabel` |
| 54 | `Enter your password` | `auth.login.passwordPlaceholder` |
| 70 | `Logging in...` | `auth.login.loggingIn` |
| 72 | `Login` | `auth.login.submitButton` |
| 77 | `Login with OTP` | `auth.login.loginWithOtp` |
| 83 | `Continue with Google` | `auth.login.continueWithGoogle` |
| 90 | `Don't have an account?` | `auth.login.noAccount` |
| 92 | `Register` | `auth.login.registerButton` |
| 127 | `Invalid email or password` | `auth.login.invalidCredentials` |
| 132 | `Login failed` | `auth.login.failed` |

#### Register Component (`src/app/domains/auth/components/register/register.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 17 | `Create Account` | `auth.register.title` |
| 27 | `Registration successful! Please check your email to verify your account.` | `auth.register.success` |
| 33 | `Full Name` | `auth.register.nameLabel` |
| 38 | `Enter your name` | `auth.register.namePlaceholder` |
| 48 | `Email` | `auth.register.emailLabel` |
| 53 | `Enter your email` | `auth.register.emailPlaceholder` |
| 63 | `Phone (Optional)` | `auth.register.phoneLabel` |
| 68 | `+1234567890` | `auth.register.phonePlaceholder` |
| 77 | `Password` | `auth.register.passwordLabel` |
| 82 | `Create a password` | `auth.register.passwordPlaceholder` |
| 99 | `Creating account...` | `auth.register.creating` |
| 101 | `Register` | `auth.register.submitButton` |
| 108 | `Sign up with Google` | `auth.register.signUpWithGoogle` |
| 115 | `Already have an account?` | `auth.register.hasAccount` |
| 116 | `Login` | `auth.register.loginButton` |
| 153, 161 | `Registration failed` | `auth.register.failed` |

#### OTP Login Component (`src/app/domains/auth/components/otp-login/otp-login.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 17 | `Login with OTP` | `auth.otp.title` |
| 27 | `OTP sent to {{ email }}. Please check your inbox.` | `auth.otp.sent` |
| 32 | `Enter OTP` | `auth.otp.enterLabel` |
| 37 | `Enter 6-digit OTP` | `auth.otp.enterPlaceholder` |
| 57 | `Verifying...` | `auth.otp.verifying` |
| 59 | `Verify & Login` | `auth.otp.verifyButton` |
| 69 | `Resend OTP` | `auth.otp.resendButton` |
| 75 | `Email` | `auth.otp.emailLabel` |
| 80 | `Enter your email` | `auth.otp.emailPlaceholder` |
| 96 | `Sending OTP...` | `auth.otp.sending` |
| 98 | `Send OTP` | `auth.otp.sendButton` |
| 107 | `Back to password login` | `auth.otp.backToLogin` |
| 136, 141 | `Failed to send OTP` | `auth.otp.sendFailed` |
| 154, 159 | `Invalid OTP` | `auth.otp.invalid` |

#### Verify Email Component (`src/app/domains/auth/components/verify-email/verify-email.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 19 | `Verifying your email...` | `auth.verifyEmail.verifying` |
| 24 | `Email Verified!` | `auth.verifyEmail.successTitle` |
| 26-27 | `Your email has been successfully verified. Redirecting you to login...` | `auth.verifyEmail.successMessage` |
| 36 | `Registration Successful!` | `auth.verifyEmail.registerSuccessTitle` |
| 38 | `Please check your email to verify your account.` | `auth.verifyEmail.registerSuccessMessage` |
| 41 | `We've sent a verification link to` | `auth.verifyEmail.sentTo` |
| 45 | `Go to Login` | `auth.verifyEmail.goToLogin` |
| 51 | `Verification Failed` | `auth.verifyEmail.failedTitle` |
| 55 | `Try Again` | `auth.verifyEmail.tryAgain` |
| 92 | `No verification token provided` | `auth.verifyEmail.noToken` |
| 110 | `Invalid or expired verification token` | `auth.verifyEmail.invalidToken` |
| 116-117 | `Verification failed. Please check your email and try again.` | `auth.verifyEmail.failed` |

---

### 4.2 Cart Domain (`src/app/domains/cart/`)

#### Cart Component (`src/app/domains/cart/components/cart/cart.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 13 | `Shopping Cart` | `cart.title` |
| 25 | `Your cart is empty` | `cart.empty.title` |
| 26 | `Looks like you haven't added anything to your cart yet.` | `cart.empty.message` |
| 27 | `Start Shopping` | `cart.empty.shopButton` |
| 59 | `each` | `cart.item.each` |
| 102 | `Continue Shopping` | `cart.continueShopping` |
| 111 | `Order Summary` | `cart.summary.title` |
| 114 | `Subtotal ({{ count }} items)` | `cart.summary.subtotal` |
| 118 | `Tax` | `cart.summary.tax` |
| 122 | `Shipping` | `cart.summary.shipping` |
| 127 | `Total` | `cart.summary.total` |
| 131 | `Proceed to Checkout` | `cart.checkoutButton` |

---

### 4.3 Checkout Domain (`src/app/domains/orders/components/checkout/`)

#### Checkout Component (`src/app/domains/orders/components/checkout/checkout.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 30 | `Guest Checkout` / `Checkout` | `checkout.title` |
| 35 | `Checking out as guest. Login to save your information for faster checkout.` | `checkout.guestMessage` |
| 48 | `Your cart is empty. Continue shopping` | `checkout.emptyCart` |
| 56 | `Loading your information...` | `checkout.loadingUser` |
| 62 | `Shipping address required` | `checkout.addressRequired` |
| 64 | `You need to add a shipping address before proceeding with checkout.` | `checkout.addressRequiredMessage` |
| 70 | `Add Shipping Address` | `checkout.addAddress` |
| 80, 187 | `Street` | `checkout.streetLabel` |
| 85, 192 | `Enter your street address` | `checkout.streetPlaceholder` |
| 89, 195 | `City` | `checkout.cityLabel` |
| 94, 196 | `Enter city` | `checkout.cityPlaceholder` |
| 98, 199 | `Country` | `checkout.countryLabel` |
| 103, 203 | `Enter country` | `checkout.countryPlaceholder` |
| 107, 207 | `ZIP Code` | `checkout.zipLabel` |
| 112, 208 | `Enter ZIP code` | `checkout.zipPlaceholder` |
| 125 | `Save Address` | `checkout.saveAddress` |
| 136 | `Contact Information` | `checkout.contactInfo` |
| 139 | `Full Name` | `checkout.fullNameLabel` |
| 143 | `Email` | `checkout.emailLabel` |
| 147 | `Phone` | `checkout.phoneLabel` |
| 174 | `Enter a new address` | `checkout.newAddressOption` |
| 218 | `Coupon Code` | `checkout.couponTitle` |
| 224 | `Enter coupon code` | `checkout.couponPlaceholder` |
| 235 | `Apply` | `checkout.applyCoupon` |
| 251 | `Coupon applied!` | `checkout.couponApplied` |
| 260 | `Payment Method` | `checkout.paymentMethod` |
| 271 | `Credit/Debit Card` | `checkout.cardPayment` |
| 283 | `PayPal` | `checkout.paypal` |
| 295 | `Cash on Delivery` | `checkout.cod` |
| 308 | `Wallet Balance` | `checkout.wallet` |
| 321 | `Order Summary` | `checkout.summaryTitle` |
| 392 | `Subtotal` | `checkout.subtotal` |
| 400 | `Tax` | `checkout.tax` |
| 406 | `Shipping` | `checkout.shipping` |
| 415 | `Discount` | `checkout.discount` |
| 421 | `Total` | `checkout.total` |
| 432 | `Processing...` | `checkout.processing` |
| 434 | `Place Order` | `checkout.placeOrder` |

---

### 4.4 Home Domain (`src/app/domains/home/`)

#### Best Seller Component (`src/app/domains/home/Components/best-seller-component/best-seller-component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 12 | `Explore Best Seller Product` | `home.bestSellers.title` |
| 15 | `Loading...` | `common.loading` |
| 53 | `View` | `common.view` |

#### Category Component (`src/app/domains/home/Components/category-component/category-component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 13 | `Loading...` | `common.loading` |
| 16 | `What are you shopping for today?` | `home.categories.title` |
| 33 | `See All Products` | `home.categories.seeAll` |

---

### 4.5 Products Domain (`src/app/domains/products/`)

#### Product Card Component (`src/app/domains/products/components/product-card/product-card.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 22 | `by {{ seller }}` | `products.seller` |
| 32 | `In Stock` | `products.inStock` |
| 32 | `Out of Stock` | `products.outOfStock` |

#### Product Filters Component (`src/app/domains/products/components/product-filters/product-filters.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 14 | `Search` | `products.filters.searchLabel` |
| 17 | `Search products...` | `products.filters.searchPlaceholder` |
| 25 | `Min Price` | `products.filters.minPrice` |
| 36 | `Max Price` | `products.filters.maxPrice` |
| 47 | `Sort` | `products.filters.sortLabel` |
| 54 | `Sort by...` | `products.filters.sortDefault` |
| 55 | `Newest` | `products.filters.sortNewest` |
| 56 | `Price ↑` | `products.filters.sortPriceAsc` |
| 57 | `Price ↓` | `products.filters.sortPriceDesc` |
| 58 | `Rating` | `products.filters.sortRating` |
| 59 | `Popular` | `products.filters.sortPopular` |

#### Product Reviews Component (`src/app/domains/products/components/product-reviews/products-reviews.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 15 | `Customer Reviews` | `products.reviews.title` |
| 20 | `Page {{ page }} of {{ pages }} · Showing up to {{ limit }} · Total {{ total }}` | `products.reviews.pagination` |
| 32 | `Verified Purchase` | `products.reviews.verified` |
| 58 | `No reviews yet. Be the first to review!` | `products.reviews.noReviews` |
| 64 | `Write a Review` | `products.reviews.writeTitle` |
| 68 | `Rating` | `products.reviews.ratingLabel` |
| 86 | `Comment` | `products.reviews.commentLabel` |
| 90 | `Share your experience...` | `products.reviews.commentPlaceholder` |
| 102 | `Submit Review` | `products.reviews.submitButton` |

---

### 4.6 Orders Domain (`src/app/domains/orders/`)

#### Order List Component

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| - | `My Orders` | `orders.title` |
| - | `Order #{{ id }}` | `orders.orderId` |
| - | `View Details` | `orders.viewDetails` |
| - | `Order Details` | `orders.details.title` |
| - | `Order Status` | `orders.status` |
| - | `Order Date` | `orders.date` |
| - | `Total Amount` | `orders.total` |
| - | `Items` | `orders.items` |
| - | `Shipping Address` | `orders.shippingAddress` |
| - | `Payment Method` | `orders.paymentMethod` |

---

### 4.7 Profile Domain (`src/app/domains/profile/`)

#### Profile Page Component (`src/app/domains/profile/profile-page.component/profile-page.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 170 | `Request submitted successfully! Status: Pending.` | `profile.seller.requestSuccess` |
| 178 | `Error: {{ message }}` | `profile.seller.requestError` |
| 196 | `Profile updated!` | `profile.updateSuccess` |
| 213 | `Withdrawal pending approval.` | `profile.payout.pending` |

#### Profile Form Component

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| - | `Profile Information` | `profile.form.title` |
| - | `Name` | `profile.form.nameLabel` |
| - | `Phone` | `profile.form.phoneLabel` |
| - | `Preferred Language` | `profile.form.languageLabel` |
| - | `Marketing Preferences` | `profile.form.marketingTitle` |
| - | `Push Notifications` | `profile.form.pushNotifications` |
| - | `Email Newsletter` | `profile.form.emailNewsletter` |
| - | `Promotional Notifications` | `profile.form.promotional` |
| - | `Save Changes` | `profile.form.saveButton` |

#### Seller Apply Component

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| - | `Become a Seller` | `profile.seller.title` |
| - | `Store Name` | `profile.seller.storeNameLabel` |
| - | `Bio` | `profile.seller.bioLabel` |
| - | `Apply Now` | `profile.seller.applyButton` |

---

### 4.8 Admin Domain (`src/app/layouts/admin-layout/`)

#### Admin Dashboard Component (`src/app/layouts/admin-layout/admin-dashboard.component.ts`)

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 38 | `Admin Dashboard` | `admin.dashboard.title` |
| 70 | `Quick Actions` | `admin.dashboard.quickActions` |
| 77 | `Manage Users` | `admin.dashboard.manageUsers` |
| 83 | `Manage Orders` | `admin.dashboard.manageOrders` |
| 89 | `Manage Products` | `admin.dashboard.manageProducts` |
| 95 | `Manage Coupons` | `admin.dashboard.manageCoupons` |
| 101 | `Manage Categories` | `admin.dashboard.manageCategories` |
| 113 | `Recent Activity` | `admin.dashboard.recentActivity` |
| 119 | `Loading...` | `common.loading` |
| 137 | `No recent activity` | `admin.dashboard.noActivity` |
| 148 | `Recent Orders` | `admin.dashboard.recentOrders` |
| 149 | `View All` | `common.viewAll` |
| 156 | `Order #` | `admin.orders.orderId` |
| 157 | `Customer` | `admin.orders.customer` |
| 158 | `Total` | `admin.orders.total` |
| 159 | `Status` | `admin.orders.status` |
| 160 | `Date` | `admin.orders.date` |
| 182 | `No orders yet` | `admin.orders.noOrders` |
| 215 | `Total Orders` | `admin.stats.totalOrders` |
| 216 | `Total Products` | `admin.stats.totalProducts` |
| 217 | `Total Coupons` | `admin.stats.totalCoupons` |
| 218 | `Total Users` | `admin.stats.totalUsers` |
| 301 | `Guest` | `common.guest` |

---

### 4.9 Seller Domain (`src/app/domains/seller/`)

#### Seller Dashboard Component

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| - | `Seller Dashboard` | `seller.dashboard.title` |
| - | `My Products` | `seller.products.title` |
| - | `Add Product` | `seller.products.add` |
| - | `My Orders` | `seller.orders.title` |
| - | `Payout Status` | `seller.payout.status` |
| - | `Request Payout` | `seller.payout.request` |
| 398 | `Seller` | `seller.dashboard.sellerName` |

#### Seller Orders Component

| Line | Current Text | Suggested Key |
|------|--------------|---------------|
| 190 | `Product` | `seller.orders.product` |
| 239 | `Total` | `seller.orders.total` |
| 240 | `Pending` | `seller.orders.pending` |
| 241 | `Shipped` | `seller.orders.shipped` |
| 242 | `Delivered` | `seller.orders.delivered` |
| 243 | `Cancelled` | `seller.orders.cancelled` |

---

### 4.10 Validation & Error Messages (Global)

| Current Text | Suggested Key |
|--------------|---------------|
| `This field is required` | `validation.required` |
| `Invalid email address` | `validation.email` |
| `Password must be at least 8 characters` | `validation.passwordMinLength` |
| `Invalid phone number` | `validation.phone` |
| `Something went wrong` | `errors.general` |
| `Network error. Please try again.` | `errors.network` |
| `Unauthorized` | `errors.unauthorized` |
| `Forbidden` | `errors.forbidden` |
| `Not Found` | `errors.notFound` |
| `Server Error` | `errors.server` |

---

## 5. Priority Implementation Order

### Phase 1: High Impact (User-Facing) - Priority 1

These components are most frequently seen by users and should be localized first:

1. **Auth Domain** (Login, Register, OTP)
   - User impact: Critical for new users
   - Complexity: Low
   - Strings: ~60

2. **Cart & Checkout**
   - User impact: Critical for conversion
   - Complexity: Medium
   - Strings: ~50

3. **Header/Footer** (already partially done)
   - User impact: Very high (visible everywhere)
   - Complexity: Low
   - Strings: ~10 remaining

### Phase 2: Medium Impact - Priority 2

4. **Home Page** (Best Sellers, Categories)
   - User impact: High (first impression)
   - Complexity: Low
   - Strings: ~10

5. **Products List & Filters**
   - User impact: High (browsing experience)
   - Complexity: Low
   - Strings: ~25

6. **Product Details & Reviews**
   - User impact: High (purchase decision)
   - Complexity: Low
   - Strings: ~20

### Phase 3: Lower Impact - Priority 3

7. **Orders (List & Details)**
   - User impact: Medium
   - Complexity: Low
   - Strings: ~20

8. **Profile & Settings**
   - User impact: Medium
   - Complexity: Medium
   - Strings: ~25

### Phase 4: Admin/Seller - Priority 4

9. **Admin Dashboard**
   - User impact: Low (internal)
   - Complexity: Medium
   - Strings: ~25

10. **Seller Dashboard**
    - User impact: Low (sellers only)
    - Complexity: Medium
    - Strings: ~20

---

## 6. Step-by-Step Implementation Guide

### Step 1: Update Translation Files First

Before modifying components, add all keys to both `en.json` and `ar.json`.

### Step 2: Import TranslateModule in Components

Each component needs `TranslateModule` in imports:

```typescript
import { TranslateModule } from '@ngx-translate/core';

@Component({
  // ...
  imports: [/* other imports */, TranslateModule],
  // ...
})
export class MyComponent { }
```

### Step 3: Replace Hardcoded Strings

Replace hardcoded strings with translate pipe:

**Before:**
```html
<h2>Login</h2>
<label>Email</label>
<input placeholder="Enter your email" />
<button>Login</button>
```

**After:**
```html
<h2>{{ 'auth.login.title' | translate }}</h2>
<label>{{ 'auth.login.emailLabel' | translate }}</label>
<input [placeholder]="'auth.login.emailPlaceholder' | translate" />
<button>{{ 'auth.login.submitButton' | translate }}</button>
```

### Step 4: Handle Dynamic Values

For strings with dynamic values, use translate params:

**Before:**
```html
<p>OTP sent to {{ email }}. Please check your inbox.</p>
```

**After:**
```html
<p>{{ 'auth.otp.sent' | translate:{ email: email() } }}</p>
```

In translation file:
```json
{
  "auth": {
    "otp": {
      "sent": "OTP sent to {{email}}. Please check your inbox."
    }
  }
}
```

### Step 5: Handle Conditional Text

**Before:**
```html
<span>{{ product.stock > 0 ? 'In Stock' : 'Out of Stock' }}</span>
```

**After:**
```html
<span>{{ (product.stock > 0 ? 'products.inStock' : 'products.outOfStock') | translate }}</span>
```

### Step 6: Handle Status Badges

For order/product status, create status translation keys:
```json
{
  "status": {
    "pending": "Pending",
    "shipped": "Shipped",
    "delivered": "Delivered",
    "cancelled": "Cancelled"
  }
}
```

---

## 7. Recommended JSON Structure

### 7.1 Complete en.json Structure

```json
{
  "common": {
    "language": "Language",
    "english": "English",
    "arabic": "Arabic",
    "logout": "Logout",
    "login": "Login",
    "register": "Register",
    "profile": "Profile",
    "cart": "Cart",
    "wishlist": "Wishlist",
    "categories": "Categories",
    "orders": "My Orders",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "viewAll": "View All",
    "submit": "Submit",
    "loading": "Loading...",
    "guest": "Guest",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "back": "Back",
    "continue": "Continue",
    "yes": "Yes",
    "no": "No",
    "close": "Close",
    "success": "Success",
    "error": "Error",
    "warning": "Warning",
    "info": "Info"
  },
  "validation": {
    "required": "This field is required",
    "email": "Invalid email address",
    "minLength": "Minimum {{min}} characters required",
    "maxLength": "Maximum {{max}} characters allowed",
    "phone": "Invalid phone number",
    "passwordMinLength": "Password must be at least 8 characters"
  },
  "errors": {
    "general": "Something went wrong",
    "network": "Network error. Please try again.",
    "unauthorized": "Unauthorized",
    "forbidden": "Forbidden",
    "notFound": "Not Found",
    "server": "Server Error",
    "unknown": "An unknown error occurred"
  },
  "status": {
    "pending": "Pending",
    "processing": "Processing",
    "shipped": "Shipped",
    "delivered": "Delivered",
    "cancelled": "Cancelled",
    "paid": "Paid",
    "failed": "Failed"
  },
  "roles": {
    "admin": "Admin",
    "seller": "Seller",
    "customer": "Customer"
  },
  "nav": {
    "manageCategories": "Manage Categories",
    "manageProducts": "Manage Products",
    "manageSellerRequest": "Manage Seller Request",
    "payoutStatus": "Payout Status"
  },
  "footer": {
    "brand": "Goshop",
    "description": "Goshop is an online store that offers the best products at the best prices in Egypt.",
    "shop": "Shop",
    "home": "Home",
    "products": "Products",
    "categories": "Categories",
    "offers": "Offers",
    "customerService": "Customer Service",
    "myAccount": "My Account",
    "orders": "Orders",
    "wishlist": "Wishlist",
    "help": "Help",
    "contact": "Contact",
    "location": "Egypt",
    "copyright": "© {{year}} SouqMasr - All Rights Reserved"
  },
  "auth": {
    "login": {
      "title": "Login",
      "emailLabel": "Email",
      "emailPlaceholder": "Enter your email",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Enter your password",
      "submitButton": "Login",
      "loggingIn": "Logging in...",
      "loginWithOtp": "Login with OTP",
      "continueWithGoogle": "Continue with Google",
      "noAccount": "Don't have an account?",
      "registerButton": "Register",
      "emailVerified": "Email verified successfully! Please login.",
      "invalidCredentials": "Invalid email or password",
      "failed": "Login failed"
    },
    "register": {
      "title": "Create Account",
      "nameLabel": "Full Name",
      "namePlaceholder": "Enter your name",
      "emailLabel": "Email",
      "emailPlaceholder": "Enter your email",
      "phoneLabel": "Phone (Optional)",
      "phonePlaceholder": "+1234567890",
      "passwordLabel": "Password",
      "passwordPlaceholder": "Create a password",
      "submitButton": "Register",
      "creating": "Creating account...",
      "signUpWithGoogle": "Sign up with Google",
      "hasAccount": "Already have an account?",
      "loginButton": "Login",
      "success": "Registration successful! Please check your email to verify your account.",
      "failed": "Registration failed"
    },
    "otp": {
      "title": "Login with OTP",
      "emailLabel": "Email",
      "emailPlaceholder": "Enter your email",
      "enterLabel": "Enter OTP",
      "enterPlaceholder": "Enter 6-digit OTP",
      "sendButton": "Send OTP",
      "sending": "Sending OTP...",
      "verifyButton": "Verify & Login",
      "verifying": "Verifying...",
      "resendButton": "Resend OTP",
      "backToLogin": "Back to password login",
      "sent": "OTP sent to {{email}}. Please check your inbox.",
      "sendFailed": "Failed to send OTP",
      "invalid": "Invalid OTP"
    },
    "verifyEmail": {
      "verifying": "Verifying your email...",
      "successTitle": "Email Verified!",
      "successMessage": "Your email has been successfully verified. Redirecting you to login...",
      "registerSuccessTitle": "Registration Successful!",
      "registerSuccessMessage": "Please check your email to verify your account.",
      "sentTo": "We've sent a verification link to",
      "goToLogin": "Go to Login",
      "failedTitle": "Verification Failed",
      "tryAgain": "Try Again",
      "noToken": "No verification token provided",
      "invalidToken": "Invalid or expired verification token",
      "failed": "Verification failed. Please check your email and try again."
    }
  },
  "cart": {
    "title": "Shopping Cart",
    "empty": {
      "title": "Your cart is empty",
      "message": "Looks like you haven't added anything to your cart yet.",
      "shopButton": "Start Shopping"
    },
    "item": {
      "each": "each"
    },
    "continueShopping": "Continue Shopping",
    "summary": {
      "title": "Order Summary",
      "subtotal": "Subtotal ({{count}} items)",
      "tax": "Tax",
      "shipping": "Shipping",
      "total": "Total"
    },
    "checkoutButton": "Proceed to Checkout"
  },
  "checkout": {
    "title": "Checkout",
    "guestTitle": "Guest Checkout",
    "guestMessage": "Checking out as guest. Login to save your information for faster checkout.",
    "emptyCart": "Your cart is empty. Continue shopping",
    "loadingUser": "Loading your information...",
    "addressRequired": "Shipping address required",
    "addressRequiredMessage": "You need to add a shipping address before proceeding with checkout.",
    "addAddress": "Add Shipping Address",
    "streetLabel": "Street",
    "streetPlaceholder": "Enter your street address",
    "cityLabel": "City",
    "cityPlaceholder": "Enter city",
    "countryLabel": "Country",
    "countryPlaceholder": "Enter country",
    "zipLabel": "ZIP Code",
    "zipPlaceholder": "Enter ZIP code",
    "saveAddress": "Save Address",
    "newAddressOption": "Enter a new address",
    "contactInfo": "Contact Information",
    "fullNameLabel": "Full Name",
    "emailLabel": "Email",
    "phoneLabel": "Phone",
    "couponTitle": "Coupon Code",
    "couponPlaceholder": "Enter coupon code",
    "applyCoupon": "Apply",
    "couponApplied": "Coupon applied!",
    "paymentMethod": "Payment Method",
    "cardPayment": "Credit/Debit Card",
    "paypal": "PayPal",
    "cod": "Cash on Delivery",
    "wallet": "Wallet Balance",
    "summaryTitle": "Order Summary",
    "subtotal": "Subtotal",
    "tax": "Tax",
    "shipping": "Shipping",
    "discount": "Discount",
    "total": "Total",
    "processing": "Processing...",
    "placeOrder": "Place Order"
  },
  "home": {
    "bestSellers": {
      "title": "Explore Best Seller Product"
    },
    "categories": {
      "title": "What are you shopping for today?",
      "seeAll": "See All Products"
    }
  },
  "products": {
    "seller": "by {{seller}}",
    "inStock": "In Stock",
    "outOfStock": "Out of Stock",
    "filters": {
      "searchLabel": "Search",
      "searchPlaceholder": "Search products...",
      "minPrice": "Min Price",
      "maxPrice": "Max Price",
      "sortLabel": "Sort",
      "sortDefault": "Sort by...",
      "sortNewest": "Newest",
      "sortPriceAsc": "Price ↑",
      "sortPriceDesc": "Price ↓",
      "sortRating": "Rating",
      "sortPopular": "Popular"
    },
    "reviews": {
      "title": "Customer Reviews",
      "pagination": "Page {{page}} of {{pages}}",
      "verified": "Verified Purchase",
      "noReviews": "No reviews yet. Be the first to review!",
      "writeTitle": "Write a Review",
      "ratingLabel": "Rating",
      "commentLabel": "Comment",
      "commentPlaceholder": "Share your experience...",
      "submitButton": "Submit Review"
    }
  },
  "orders": {
    "title": "My Orders",
    "orderId": "Order #{{id}}",
    "viewDetails": "View Details",
    "details": {
      "title": "Order Details"
    },
    "status": "Order Status",
    "date": "Order Date",
    "total": "Total Amount",
    "items": "Items",
    "shippingAddress": "Shipping Address",
    "paymentMethod": "Payment Method"
  },
  "profile": {
    "form": {
      "title": "Profile Information",
      "nameLabel": "Name",
      "phoneLabel": "Phone",
      "languageLabel": "Preferred Language",
      "marketingTitle": "Marketing Preferences",
      "pushNotifications": "Push Notifications",
      "emailNewsletter": "Email Newsletter",
      "promotional": "Promotional Notifications",
      "saveButton": "Save Changes"
    },
    "updateSuccess": "Profile updated!",
    "seller": {
      "title": "Become a Seller",
      "storeNameLabel": "Store Name",
      "storeNamePlaceholder": "Enter your store name",
      "bioLabel": "Bio",
      "bioPlaceholder": "Tell us about your store...",
      "applyButton": "Apply Now",
      "requestSuccess": "Request submitted successfully! Status: Pending.",
      "requestError": "Error: {{message}}"
    },
    "payout": {
      "status": "Payout Status",
      "request": "Request Payout",
      "amountLabel": "Amount",
      "withdrawButton": "Withdraw",
      "pending": "Withdrawal pending approval."
    }
  },
  "admin": {
    "dashboard": {
      "title": "Admin Dashboard",
      "quickActions": "Quick Actions",
      "manageUsers": "Manage Users",
      "manageOrders": "Manage Orders",
      "manageProducts": "Manage Products",
      "manageCoupons": "Manage Coupons",
      "manageCategories": "Manage Categories",
      "recentActivity": "Recent Activity",
      "noActivity": "No recent activity",
      "recentOrders": "Recent Orders"
    },
    "orders": {
      "orderId": "Order #",
      "customer": "Customer",
      "total": "Total",
      "status": "Status",
      "date": "Date",
      "noOrders": "No orders yet"
    },
    "stats": {
      "totalOrders": "Total Orders",
      "totalProducts": "Total Products",
      "totalCoupons": "Total Coupons",
      "totalUsers": "Total Users"
    }
  },
  "seller": {
    "dashboard": {
      "title": "Seller Dashboard",
      "sellerName": "Seller"
    },
    "products": {
      "title": "My Products",
      "add": "Add Product"
    },
    "orders": {
      "title": "My Orders",
      "product": "Product",
      "total": "Total",
      "pending": "Pending",
      "shipped": "Shipped",
      "delivered": "Delivered",
      "cancelled": "Cancelled"
    },
    "payout": {
      "status": "Payout Status",
      "request": "Request Payout"
    }
  }
}
```

### 7.2 Arabic (ar.json) Structure

The Arabic file follows the same structure with Arabic translations. Key considerations:

- RTL direction is handled by the I18nService
- Bootstrap RTL CSS is automatically toggled

---

## 8. Testing Approach

### 8.1 Manual Testing Checklist

| Test Case | Expected Result |
|-----------|-----------------|
| Switch language to Arabic | All visible text changes to Arabic, layout flips to RTL |
| Switch language to English | All visible text changes to English, layout flips to LTR |
| Refresh page with Arabic selected | Language persists, Arabic displays |
| Test login form in Arabic | All labels, placeholders, buttons in Arabic |
| Test checkout in Arabic | All steps display Arabic text |
| Test with long Arabic text | UI handles text overflow correctly |
| Test dynamic values (e.g., order #) | Numbers/IDs display correctly in both languages |

### 8.2 Key Testing Points

1. **No Missing Keys**: Ensure no translation keys are missing (console warnings)
2. **RTL Layout**: Verify Bootstrap RTL CSS is applied correctly
3. **Text Overflow**: Test with long text in both languages
4. **Form Validation**: Validation messages display in selected language
5. **Dynamic Content**: User-generated content (reviews, product names) stays in original language
6. **URL Parameters**: Language parameter in URL works correctly

---

## Appendix: Implementation Checklist

### Phase 1: Auth Domain
- [ ] Login component - 14 strings
- [ ] Register component - 16 strings
- [ ] OTP Login component - 15 strings
- [ ] Verify Email component - 12 strings

### Phase 2: Cart & Checkout
- [ ] Cart component - 13 strings
- [ ] Checkout component - 40+ strings

### Phase 3: Home & Products
- [ ] Best Seller component - 3 strings
- [ ] Category component - 3 strings
- [ ] Product Card component - 3 strings
- [ ] Product Filters component - 13 strings
- [ ] Product Reviews component - 10 strings

### Phase 4: Orders & Profile
- [ ] Order List component - 10 strings
- [ ] Order Detail component - 10 strings
- [ ] Profile Page component - 5 strings
- [ ] Profile Form component - 10 strings
- [ ] Seller Apply component - 5 strings

### Phase 5: Admin & Seller
- [ ] Admin Dashboard - 20 strings
- [ ] Seller Dashboard - 10 strings
- [ ] Seller Orders - 8 strings

### Global
- [ ] Validation messages - 6 strings
- [ ] Error messages - 6 strings

---

## Conclusion

This plan provides a comprehensive roadmap for completing the i18n implementation in the ITI Angular E-Commerce project. The existing infrastructure is solid and only requires filling in the translation keys and updating components to use the translate pipe.

**Estimated Total Strings:** ~250-300 strings across all domains

**Recommended Timeline:**
- Phase 1 (Auth): 1-2 days
- Phase 2 (Cart/Checkout): 1-2 days
- Phase 3 (Home/Products): 1 day
- Phase 4 (Orders/Profile): 1-2 days
- Phase 5 (Admin/Seller): 1-2 days

**Total Estimated Effort:** 5-9 days

---

*Document created: March 2026*
*Last updated: March 2026*
