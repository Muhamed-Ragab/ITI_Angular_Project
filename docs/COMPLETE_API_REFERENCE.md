# Complete API Reference Guide

**Project:** MEAN E-Commerce Backend  
**Base URL:** `http://localhost:3000/api`  
**Last Updated:** February 2026

---

## Table of Contents

1. [Authentication Module](#1-authentication-module--auth)
2. [User Management Module](#2-user-management-module--users)
3. [Marketing & Engagement](#3-marketing--engagement-features)
4. [Product Management](#4-product-management-module--products)
5. [Order Management](#5-order-management-module--orders)
6. [Payment Module](#6-payment-module--payments)
7. [Category Management](#7-category-management-module--categories)
8. [Coupon System](#8-coupon-module--coupons)
9. [Content Management](#9-content-module--content)
10. [Reviews & Ratings](#10-reviews-module--reviews)
11. [Role-Based Access Control](#role-based-access-control)

---

## 1. Authentication Module (`/auth`)

Handles all user authentication flows including traditional login, passwordless OTP, email verification, and social authentication.

### 1.1 Register New User

**Endpoint:** `POST /auth/register`  
**Auth:** Public (no auth required)

**What it does:**
- Creates a new user account with email/password
- Automatically generates a unique referral code (e.g., `REF-ABC123`)
- Sends email verification link to user's inbox
- Sets initial role as `customer`
- User cannot login until email is verified

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john@example.com"
  }
}
```

**Workflow:**
1. User submits registration form
2. System hashes password with bcrypt
3. Generates JWT verification token (expires in 1 hour)
4. Sends email with verification link: `GET /auth/verify-email?token=<token>`
5. User clicks link → email verified → can now login

---

### 1.2 Login with Email/Password

**Endpoint:** `POST /auth/login`  
**Auth:** Public

**What it does:**
- Authenticates user with email and password
- Returns JWT access token (valid for 24 hours by default)
- Blocks login if email not verified, user restricted, or account deleted

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

**Error Cases:**
- `AUTH.INVALID_CREDENTIALS` - Wrong email/password
- `AUTH.EMAIL_NOT_VERIFIED` - Email not verified yet
- `AUTH.USER_RESTRICTED` - Admin restricted this account
- `AUTH.USER_DELETED` - Account was soft-deleted

---

### 1.3 Request Email OTP

**Endpoint:** `POST /auth/email/request-otp`  
**Auth:** Public

**What it does:**
- Sends a 6-digit OTP to user's email for passwordless login
- OTP expires in 5 minutes
- OTP is hashed before storage (security best practice)

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email"
}
```

**Workflow:**
1. User requests OTP (e.g., from login page "Login with OTP")
2. System generates 6-digit code (e.g., `847293`)
3. Hashes OTP and stores with expiry timestamp
4. Sends email: "Your login code is: 847293"
5. User has 5 minutes to use it via `POST /auth/email/login`

---

### 1.4 Login with Email OTP

**Endpoint:** `POST /auth/email/login`  
**Auth:** Public

**What it does:**
- Authenticates user with email + OTP (no password needed)
- Returns JWT token on success
- Consumes (clears) the OTP after successful login

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "847293"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Cases:**
- `AUTH.INVALID_EMAIL_OTP` - Wrong OTP
- `AUTH.EMAIL_OTP_EXPIRED` - OTP expired (5 min limit)
- `AUTH.EMAIL_OTP_REQUIRED` - Missing OTP

---

### 1.5 Verify Email

**Endpoint:** `GET /auth/verify-email?token=<token>`  
**Auth:** Public

**What it does:**
- Verifies user's email using token from registration email
- Activates account for login
- Token expires in 1 hour

**Request:**
```
GET /auth/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

**Workflow:**
1. User registers → receives verification email
2. User clicks link in email
3. System validates token signature and expiry
4. Sets `emailVerified: true` on user record
5. User can now login with password or OTP

---

### 1.6 Logout

**Endpoint:** `POST /auth/logout`  
**Auth:** Required (JWT)

**What it does:**
- Invalidates current JWT token by incrementing `tokenVersion`
- All previously issued tokens become invalid
- DB-backed logout (more secure than client-side only)

**Request:**
```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Security Note:**
- Token versioning ensures logout is enforced server-side
- Even if token hasn't expired, it won't work after logout

---

### 1.7 Google OAuth (Social Login)

**Endpoint:** `GET /auth/google`  
**Auth:** Public

**What it does:**
- Initiates Google OAuth 2.0 flow
- Redirects user to Google login page
- Creates/updates user account on callback

**Request:**
```
GET /auth/google
```

**Callback:** `GET /auth/google/callback?code=<auth_code>`

**Response:**
- Redirects to frontend with JWT token
- Creates new user if first time, or logs in existing user

**Workflow:**
1. User clicks "Login with Google"
2. System redirects to Google OAuth consent screen
3. User grants permission
4. Google redirects back with authorization code
5. System exchanges code for user info
6. Creates/updates user, issues JWT token

---

## 2. User Management Module (`/users`)

Manages user profiles, preferences, shopping cart, wishlist, addresses, and payment methods.

### 2.1 Get User Profile

**Endpoint:** `GET /users/profile`  
**Auth:** Required

**What it does:**
- Returns complete user profile including:
  - Basic info (name, email, phone)
  - Role (customer/seller/admin)
  - Wallet balance
  - Loyalty points
  - Marketing preferences
  - Seller profile (if applicable)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer",
    "phone": "+1234567890",
    "wallet_balance": 50.00,
    "loyalty_points": 150,
    "referral_code": "REF-ABC123",
    "marketing_preferences": {
      "push_notifications": true,
      "email_newsletter": false,
      "promotional_notifications": true
    },
    "preferred_language": "en"
  }
}
```

---

### 2.2 Update Profile

**Endpoint:** `PUT /users/profile`  
**Auth:** Required

**What it does:**
- Updates user's name and/or phone number
- Cannot change email or role through this endpoint

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Updated",
    "phone": "+9876543210"
  }
}
```

---

### 2.3 Get Wishlist

**Endpoint:** `GET /users/wishlist`  
**Auth:** Required

**What it does:**
- Returns user's saved/favorited products
- Useful for "Save for later" functionality

**Response:**
```json
{
  "success": true,
  "data": {
    "wishlist": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "name": "Wireless Headphones",
        "price": 99.99,
        "image": "https://cdn.example.com/product.jpg",
        "addedAt": "2026-02-20T10:00:00Z"
      }
    ],
    "count": 1
  }
}
```

---

### 2.4 Add to Wishlist

**Endpoint:** `POST /users/wishlist`  
**Auth:** Required

**What it does:**
- Adds a product to user's wishlist
- Prevents duplicates

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added to wishlist",
  "data": {
    "wishlist": [...]
  }
}
```

---

### 2.5 Remove from Wishlist

**Endpoint:** `DELETE /users/wishlist/:productId`  
**Auth:** Required

**Request:**
```
DELETE /users/wishlist/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Removed from wishlist"
}
```

---

### 2.6 Get Cart

**Endpoint:** `GET /users/cart`  
**Auth:** Required

**What it does:**
- Returns user's shopping cart with all items
- Includes calculated totals (subtotal, tax, shipping)

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "productId": "507f1f77bcf86cd799439011",
        "name": "Wireless Headphones",
        "price": 99.99,
        "quantity": 2,
        "subtotal": 199.98
      }
    ],
    "subtotal": 199.98,
    "tax": 20.00,
    "shipping": 5.99,
    "total": 225.97
  }
}
```

---

### 2.7 Add/Update Cart Item

**Endpoint:** `PUT /users/cart`  
**Auth:** Required

**What it does:**
- Adds item to cart or updates quantity if exists
- Auto-calculates line item subtotal

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart updated",
  "data": {
    "items": [...],
    "total": 225.97
  }
}
```

---

### 2.8 Remove from Cart

**Endpoint:** `DELETE /users/cart/:productId`  
**Auth:** Required

**Request:**
```
DELETE /users/cart/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

---

### 2.10 Add Address

**Endpoint:** `POST /users/address`  
**Auth:** Required

**Request Body:**
```json
{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zip": "10001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Address added",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "street": "123 Main St",
    "city": "New York",
    "country": "USA",
    "zip": "10001"
  }
}
```

---

### 2.11 Update Address

**Endpoint:** `PUT /users/address/:addressId`  
**Auth:** Required

**Request:**
```
PUT /users/address/507f1f77bcf86cd799439012
```

**Body:** Same as add address

---

### 2.12 Delete Address

**Endpoint:** `DELETE /users/address/:addressId`  
**Auth:** Required

**Request:**
```
DELETE /users/address/507f1f77bcf86cd799439012
```

**Response:**
```json
{
  "success": true,
  "message": "Address deleted"
}
```

---

### 2.13 Get Payment Methods

**Endpoint:** `GET /users/payment-methods`  
**Auth:** Required

**What it does:**
- Returns user's saved payment methods (credit cards, etc.)
- Used for faster checkout

**Response:**
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": "507f1f77bcf86cd799439013",
        "provider": "stripe",
        "brand": "visa",
        "last4": "4242",
        "expiry_month": 12,
        "expiry_year": 2027,
        "isDefault": true
      }
    ]
  }
}
```

---

### 2.14 Add Payment Method

**Endpoint:** `POST /users/payment-methods`  
**Auth:** Required

**Request Body:**
```json
{
  "provider": "stripe",
  "provider_token": "tok_visa_4242",
  "brand": "visa",
  "last4": "4242",
  "expiry_month": 12,
  "expiry_year": 2027
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment method added",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "brand": "visa",
    "last4": "4242"
  }
}
```

---

### 2.15 Remove Payment Method

**Endpoint:** `DELETE /users/payment-methods/:methodId`  
**Auth:** Required

**Request:**
```
DELETE /users/payment-methods/507f1f77bcf86cd799439013
```

---

### 2.16 Set Default Payment Method

**Endpoint:** `PATCH /users/payment-methods/:methodId/default`  
**Auth:** Required

**What it does:**
- Sets a payment method as default for future checkouts

**Request:**
```
PATCH /users/payment-methods/507f1f77bcf86cd799439013/default
```

**Response:**
```json
{
  "success": true,
  "message": "Default payment method updated"
}
```

---

## 3. Marketing & Engagement Features

### 3.1 Update Marketing Preferences

**Endpoint:** `PATCH /users/preferences/marketing`  
**Auth:** Required

**What it does:**
- Lets users control what marketing communications they receive
- Preferences are checked before sending broadcasts

**Request Body:**
```json
{
  "push_notifications": true,
  "email_newsletter": false,
  "promotional_notifications": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Preferences updated",
  "data": {
    "marketing_preferences": {
      "push_notifications": true,
      "email_newsletter": false,
      "promotional_notifications": true
    }
  }
}
```

**Use Case:**
- User opts out of email newsletters but keeps push notifications
- Admin broadcasts only reach users who opted in

---

### 3.2 Update Preferred Language

**Endpoint:** `PATCH /users/preferences/language`  
**Auth:** Required

**What it does:**
- Sets user's preferred language for localized content
- Supported: `en` (English), `ar` (Arabic), `fr` (French)

**Request Body:**
```json
{
  "language": "ar"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Language preference updated",
  "data": {
    "preferred_language": "ar"
  }
}
```

---

### 3.3 Get Loyalty Summary

**Endpoint:** `GET /users/loyalty`  
**Auth:** Required

**What it does:**
- Returns user's loyalty points balance and referral stats
- Points earned from purchases, referrals, admin grants

**Response:**
```json
{
  "success": true,
  "data": {
    "loyalty_points": 150,
    "referrals_count": 3
  }
}
```

**Point Earning Examples:**
- Purchase $100 = 10 points (10% back)
- Successful referral = 25 points each
- Admin bonus grant = variable

---

### 3.4 Apply Referral Code

**Endpoint:** `POST /users/referrals/apply`  
**Auth:** Required

**What it does:**
- Applies a referral code to user's account
- Both referrer and referee earn loyalty points
- Can only apply once per account

**Request Body:**
```json
{
  "referralCode": "REF-ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Referral code applied! You both earned 25 points",
  "data": {
    "pointsEarned": 25,
    "newBalance": 175
  }
}
```

**Validation Rules:**
- Cannot apply own referral code
- Can only apply once (tracked in `appliedReferral: true`)
- Code must exist and belong to another user

---

### 3.5 Get Referral Summary

**Endpoint:** `GET /users/referrals`  
**Auth:** Required

**What it does:**
- Shows user's referral code and referral stats

**Response:**
```json
{
  "success": true,
  "data": {
    "referralCode": "REF-ABC123",
    "referralsCount": 3,
    "totalPointsEarned": 75
  }
}
```

---

### 3.6 Grant Loyalty Points (Admin)

**Endpoint:** `PATCH /users/admin/:id/loyalty`  
**Auth:** Admin

**What it does:**
- Admin can grant bonus loyalty points to any user
- Used for promotions, compensation, rewards

**Request Body:**
```json
{
  "points": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Granted 100 loyalty points",
  "data": {
    "newBalance": 250
  }
}
```

---

### 3.7 Marketing Broadcast (Admin)

**Endpoint:** `POST /users/admin/marketing/broadcast`  
**Auth:** Admin

**What it does:**
- Sends marketing message to users who opted in
- Filters by channel (email, push, promotional)

**Request Body:**
```json
{
  "channel": "email_newsletter",
  "title": "Summer Sale!",
  "body": "Get 50% off on all electronics this weekend!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Broadcast sent to 1,234 users",
  "data": {
    "targetedCount": 1234,
    "channel": "email_newsletter"
  }
}
```

**Workflow:**
1. Admin creates broadcast message
2. System queries users with `marketing_preferences[channel] = true`
3. Sends email/push to filtered list
4. Returns count of recipients

---

## 4. Product Management Module (`/products`)

### 4.1 List Products (Public)

**Endpoint:** `GET /products`  
**Auth:** Public

**What it does:**
- Returns paginated product list with filtering/sorting
- Public endpoint (no auth required)

**Query Parameters:**
```
GET /products?page=1&limit=10&category=507f...&search=headphones&minPrice=50&maxPrice=200&rating=4&sort=price_asc
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `category` | string | Filter by category ID |
| `search` | string | Search in name/description |
| `minPrice` | number | Minimum price filter |
| `maxPrice` | number | Maximum price filter |
| `rating` | number | Minimum rating (1-5) |
| `sort` | string | `price_asc`, `price_desc`, `newest`, `rating` |

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Wireless Headphones",
        "description": "High-quality wireless headphones",
        "price": 99.99,
        "category": {
          "id": "507f1f77bcf86cd799439020",
          "name": "Electronics"
        },
        "stock": 50,
        "images": ["https://cdn.example.com/img1.jpg"],
        "average_rating": 4.5,
        "ratings_count": 120,
        "seller": {
          "id": "507f1f77bcf86cd799439030",
          "store_name": "Tech Store"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

---

### 4.2 Get Product Details

**Endpoint:** `GET /products/:id`  
**Auth:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 99.99,
    "category": {...},
    "stock": 50,
    "images": [...],
    "average_rating": 4.5,
    "ratings_count": 120,
    "seller": {
      "id": "507f1f77bcf86cd799439030",
      "store_name": "Tech Store",
      "bio": "Premium electronics seller"
    },
    "reviews": [...]
  }
}
```

---

### 4.3 Create Product (Seller)

**Endpoint:** `POST /products`  
**Auth:** Seller

**What it does:**
- Seller creates a new product listing
- Sets initial stock, price, images
- Product is immediately visible to customers

**Request Body:**
```json
{
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones",
  "price": 99.99,
  "category": "507f1f77bcf86cd799439020",
  "stock": 50,
  "images": [
    "https://cdn.example.com/img1.jpg",
    "https://cdn.example.com/img2.jpg"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Wireless Headphones",
    "seller_id": "507f1f77bcf86cd799439030"
  }
}
```

**Workflow:**
1. Seller fills product form
2. System validates required fields
3. Creates product with seller_id
4. Product appears in marketplace immediately

---

### 4.4 Update Product (Seller)

**Endpoint:** `PUT /products/:id`  
**Auth:** Seller (owner only)

**What it does:**
- Seller updates their own product
- Can change price, description, stock, images
- Ownership check prevents editing others' products

**Request Body:**
```json
{
  "name": "Updated Headphones",
  "price": 89.99,
  "stock": 75
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Updated Headphones",
    "price": 89.99,
    "stock": 75
  }
}
```

---

### 4.5 Delete Product (Seller)

**Endpoint:** `DELETE /products/:id`  
**Auth:** Seller (owner only)

**Request:**
```
DELETE /products/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted"
}
```

---

### 4.7 Admin Update Product

**Endpoint:** `PUT /products/admin/:id`  
**Auth:** Admin

**What it does:**
- Admin can update any product (moderation)
- Used for content policy enforcement

---

### 4.9 Admin Delete Product

**Endpoint:** `DELETE /products/admin/:id`  
**Auth:** Admin

**What it does:**
- Admin can delete any product
- Used for policy violations, recalls

---

### 4.10 Get Image Upload Payload (Seller)

**Endpoint:** `POST /products/images/upload-payload`  
**Auth:** Seller

**What it does:**
- Generates pre-signed URL for direct image upload
- Used for cloud storage (S3, Cloudinary, etc.)

**Request Body:**
```json
{
  "filename": "product-image.jpg",
  "contentType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uploadUrl": "https://storage.example.com/upload?signature=...",
    "imageUrl": "https://cdn.example.com/product-image.jpg"
  }
}
```

**Workflow:**
1. Seller requests upload URL
2. System generates pre-signed URL (expires in 15 min)
3. Frontend uploads directly to cloud storage
4. Returns public image URL for product

---

### 4.11 Upload Product Images (Seller)

**Endpoint:** `POST /products/:id/images/upload`  
**Auth:** Seller

**What it does:**
- Associates uploaded images with product
- Updates product's images array

**Request Body:**
```json
{
  "imageUrl": "https://cdn.example.com/new-image.jpg"
}
```

---

## 5. Order Management Module (`/orders`)

### 5.1 Create Order (from Cart)

**Endpoint:** `POST /orders`  
**Auth:** Required

**What it does:**
- Creates order from user's cart items
- Calculates totals (subtotal, tax, shipping, discounts)
- Clears cart after successful order

**Request Body:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zip": "10001"
  },
  "paymentMethod": "stripe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439100",
    "orderNumber": "ORD-2026-0001",
    "status": "pending",
    "items": [...],
    "subtotal": 199.98,
    "tax": 20.00,
    "shipping": 5.99,
    "total": 225.97,
    "shippingAddress": {...}
  }
}
```

**Workflow:**
1. User clicks "Checkout"
2. System locks cart items (prevent race condition)
3. Creates order with `pending` status
4. Clears user's cart
5. User proceeds to payment

---

### 5.2 Guest Checkout

**Endpoint:** `POST /orders/guest`  
**Auth:** Public

**What it does:**
- Allows checkout without account
- Creates order with guest contact info

**Request Body:**
```json
{
  "items": [...],
  "guestInfo": {
    "name": "Guest User",
    "email": "guest@example.com",
    "phone": "+1234567890"
  },
  "shippingAddress": {...}
}
```

**Response:** Same as authenticated order

**Use Case:**
- First-time buyers who don't want to register
- Still tracks order via email

---

### 5.3 Get User Orders

**Endpoint:** `GET /orders/me`  
**Auth:** Required

**What it does:**
- Returns current user's order history

**Query Parameters:**
```
GET /orders/me?status=shipped&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "507f1f77bcf86cd799439100",
        "orderNumber": "ORD-2026-0001",
        "status": "delivered",
        "total": 225.97,
        "items": [...],
        "createdAt": "2026-02-20T10:00:00Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

### 5.4 Get Order Details

**Endpoint:** `GET /orders/:id`  
**Auth:** Required (owner or admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439100",
    "orderNumber": "ORD-2026-0001",
    "status": "delivered",
    "status_timeline": [
      {
        "status": "pending",
        "timestamp": "2026-02-20T10:00:00Z"
      },
      {
        "status": "paid",
        "timestamp": "2026-02-20T10:05:00Z"
      },
      {
        "status": "shipped",
        "timestamp": "2026-02-21T09:00:00Z",
        "note": "Shipped via FedEx"
      },
      {
        "status": "delivered",
        "timestamp": "2026-02-23T14:30:00Z"
      }
    ],
    "items": [...],
    "shippingAddress": {...},
    "payment": {
      "method": "stripe",
      "status": "paid",
      "transactionId": "pi_1234567890"
    },
    "tracking": {
      "number": "1Z999AA10123456784",
      "carrier": "FedEx"
    }
  }
}
```

---

### 5.5 Get Seller Orders

**Endpoint:** `GET /orders/seller`  
**Auth:** Seller

**What it does:**
- Returns orders containing seller's products
- Seller can only see their own orders

**Query Parameters:**
```
GET /orders/seller?status=processing
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "507f1f77bcf86cd799439100",
        "orderNumber": "ORD-2026-0001",
        "status": "processing",
        "items": [
          {
            "productId": "507f1f77bcf86cd799439011",
            "quantity": 2,
            "seller_id": "507f1f77bcf86cd799439030"
          }
        ],
        "customer": {
          "name": "John Doe",
          "shippingAddress": {...}
        }
      }
    ]
  }
}
```

---

### 5.6 Get All Orders (Admin)

**Endpoint:** `GET /orders`  
**Auth:** Admin

**What it does:**
- Returns all orders (platform-wide)
- Used for admin dashboard, analytics

---

### 5.7 Update Order Status (Admin)

**Endpoint:** `PUT /orders/:id/status`  
**Auth:** Admin

**What it does:**
- Admin updates order status
- Triggers email notification to customer
- Appends to status_timeline

**Request Body:**
```json
{
  "status": "shipped",
  "note": "Shipped via FedEx, tracking: 1Z999AA10123456784"
}
```

**Allowed Statuses:**
- `pending` → `paid` → `processing` → `shipped` → `delivered`
- Or `cancelled` at any point before `delivered`

**Response:**
```json
{
  "success": true,
  "message": "Order status updated to shipped",
  "data": {
    "status": "shipped",
    "status_timeline": [...]
  }
}
```

---

### 5.8 Update Order Status (Seller)

**Endpoint:** `PUT /orders/:id/seller-status`  
**Auth:** Seller

**What it does:**
- Seller updates status for their own orders
- Limited to: `shipped`, `delivered`, `cancelled`

**Request Body:**
```json
{
  "status": "shipped",
  "note": "Package handed to FedEx"
}
```

**Response:** Same as admin update

---

## 6. Payment Module (`/payments`)

### 6.1 Create Payment Intent

**Endpoint:** `POST /payments/create-payment-intent`  
**Auth:** Required

**What it does:**
- Creates Stripe Payment Intent for order
- Returns client_secret for frontend Stripe.js

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439100",
  "amount": 22597,
  "currency": "usd"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdef",
    "paymentIntentId": "pi_1234567890"
  }
}
```

**Workflow:**
1. User proceeds to checkout
2. System creates Stripe Payment Intent
3. Frontend uses client_secret with Stripe.js
4. User enters card details securely
5. Stripe confirms payment → webhook updates order

---

### 6.2 Process Checkout Payment

**Endpoint:** `POST /payments/checkout`  
**Auth:** Required

**What it does:**
- Processes payment for order using various methods
- Supports: stripe, paypal, cod, wallet

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439100",
  "method": "stripe",
  "savedMethodId": "507f1f77bcf86cd799439013"
}
```

**Payment Methods:**

| Method | Description |
|--------|-------------|
| `stripe` | Credit/debit card via Stripe |
| `paypal` | PayPal checkout |
| `cod` | Cash on delivery (payment status: pending) |
| `wallet` | Deduct from user's wallet balance |

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "orderId": "507f1f77bcf86cd799439100",
    "paymentStatus": "paid",
    "transactionId": "pi_1234567890"
  }
}
```

**Workflow by Method:**

**Stripe:**
1. Creates/uses Payment Intent
2. Waits for Stripe webhook confirmation
3. Marks order as `paid`

**Wallet:**
1. Checks user has sufficient balance
2. Deducts amount from `wallet_balance`
3. Marks order as `paid` immediately
4. Records wallet transaction

**COD:**
1. Sets `payment_info.status = "pending_cod"`
2. Order status = `pending`
3. Payment collected on delivery

**PayPal:**
1. Redirects to PayPal
2. PayPal callback updates order

---

### 6.3 Stripe Webhook

**Endpoint:** `POST /payments/webhook`  
**Auth:** Public (Stripe signs requests)

**What it does:**
- Receives Stripe payment events
- Updates order status on `payment_intent.succeeded`
- Handles refunds, disputes

**Events Handled:**
- `payment_intent.succeeded` → Mark order `paid`
- `payment_intent.payment_failed` → Notify user
- `charge.refunded` → Process refund

---

### 6.4 Create Payment Intent

**Endpoint:** `POST /payments/create-payment-intent`
**Auth:** Required

**What it does:**
- Creates Stripe Payment Intent for checkout
- Returns client secret for Stripe.js

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439100"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abc123",
    "paymentIntentId": "pi_1234567890",
    "amount": 22597,
    "currency": "usd"
  }
}
```

---

### 6.5 List Payments (Admin)

**Endpoint:** `GET /payments/admin`  
**Auth:** Admin

**Query Parameters:**
```
GET /payments/admin?status=paid&startDate=2026-01-01&endDate=2026-02-28
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [...],
    "totalRevenue": 50000.00,
    "pagination": {...}
  }
}
```

---

## 7. Category Management Module (`/categories`)

### 7.1 List Categories (Public)

**Endpoint:** `GET /categories`  
**Auth:** Public

**What it does:**
- Returns all categories in tree structure
- Supports nested subcategories

**Response:**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "507f1f77bcf86cd799439020",
        "name": "Electronics",
        "description": "Electronic devices and accessories",
        "parentId": null,
        "subcategories": [
          {
            "id": "507f1f77bcf86cd799439021",
            "name": "Headphones",
            "parentId": "507f1f77bcf86cd799439020"
          }
        ]
      }
    ]
  }
}
```

---

### 7.2 Get Category by ID

**Endpoint:** `GET /categories/:id`  
**Auth:** Public

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "productCount": 150
  }
}
```

---

### 7.4 Create Category (Admin)

**Endpoint:** `POST /categories`  
**Auth:** Admin

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "parentId": null
}
```

**For Subcategory:**
```json
{
  "name": "Headphones",
  "description": "Wireless and wired headphones",
  "parentId": "507f1f77bcf86cd799439020"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created",
  "data": {
    "id": "507f1f77bcf86cd799439020",
    "name": "Electronics"
  }
}
```

---

### 7.5 Update Category (Admin)

**Endpoint:** `PUT /categories/:id`  
**Auth:** Admin

**Request Body:**
```json
{
  "name": "Updated Electronics",
  "description": "Updated description"
}
```

---

### 7.6 Delete Category (Admin)

**Endpoint:** `DELETE /categories/:id`  
**Auth:** Admin

**Note:** Cannot delete category with products (must reassign first)

---

## 8. Coupon Module (`/coupons`)

### 8.1 Validate Coupon

**Endpoint:** `POST /coupons/validate`  
**Auth:** Required

**What it does:**
- Validates coupon code against order total
- Returns discount amount if valid

**Request Body:**
```json
{
  "code": "SUMMER25",
  "orderTotal": 150
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discountAmount": 37.50,
    "couponInfo": {
      "code": "SUMMER25",
      "type": "percentage",
      "value": 25,
      "minOrderAmount": 100,
      "expiresAt": "2026-12-31T23:59:59Z"
    }
  }
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": {
    "code": "COUPON.NOT_FOUND"
  }
}
```

| Error Code | Meaning |
|------------|---------|
| `COUPON.NOT_FOUND` | Invalid code |
| `COUPON.INACTIVE` | Coupon disabled by admin |
| `COUPON.EXPIRED` | Past expiration date |
| `COUPON.MIN_ORDER_NOT_MET` | Order below minimum amount |
| `COUPON.USAGE_LIMIT_REACHED` | Global usage limit hit |
| `COUPON.USER_LIMIT_REACHED` | User already used this coupon |

---

### 8.2 Create Coupon (Admin)

**Endpoint:** `POST /coupons`  
**Auth:** Admin

**Request Body:**
```json
{
  "code": "SUMMER25",
  "type": "percentage",
  "value": 25,
  "minOrderAmount": 100,
  "expiresAt": "2026-12-31T23:59:59Z",
  "usageLimit": 1000,
  "userLimit": 1
}
```

**Coupon Types:**
- `percentage` - Percentage discount (e.g., 25 = 25% off)
- `fixed` - Fixed amount discount (e.g., 25 = $25 off)

**Response:**
```json
{
  "success": true,
  "message": "Coupon created",
  "data": {
    "id": "507f1f77bcf86cd799439050",
    "code": "SUMMER25"
  }
}
```

---

### 8.3 List Coupons (Admin)

**Endpoint:** `GET /coupons`  
**Auth:** Admin

**Query Parameters:**
```
GET /coupons?active=true&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "coupons": [...],
    "pagination": {...}
  }
}
```

---

### 8.4 Get Coupon by ID (Admin)

**Endpoint:** `GET /coupons/:id`  
**Auth:** Admin

---

### 8.5 Update Coupon (Admin)

**Endpoint:** `PUT /coupons/:id`  
**Auth:** Admin

**Request Body:**
```json
{
  "value": 30,
  "expiresAt": "2027-12-31T23:59:59Z"
}
```

---

### 8.6 Delete Coupon (Admin)

**Endpoint:** `DELETE /coupons/:id`  
**Auth:** Admin

**Note:** Soft delete (sets `active: false`)

---

## 9. Content Module (`/content`)

CMS for banners, homepage content, FAQs.

### 9.1 List Content (Public)

**Endpoint:** `GET /content`  
**Auth:** Public

**Query Parameters:**
```
GET /content?section=homepage
```

**Supported Sections:**
- `homepage` - Homepage banners/hero
- `banner` - Promotional banners
- `faq` - FAQ content

**Response:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "507f1f77bcf86cd799439060",
        "section": "homepage",
        "title": "Summer Sale",
        "content": "Up to 50% off on all electronics",
        "image": "https://cdn.example.com/banner.jpg",
        "link": "/products?category=sale",
        "order": 1,
        "active": true
      }
    ]
  }
}
```

---

### 9.2 Get Content by ID (Public)

**Endpoint:** `GET /content/:id`  
**Auth:** Public

---

### 9.3 Create Content (Admin)

**Endpoint:** `POST /content`  
**Auth:** Admin

**Request Body:**
```json
{
  "section": "homepage",
  "title": "Summer Sale",
  "content": "Up to 50% off",
  "image": "https://cdn.example.com/banner.jpg",
  "link": "/products?category=sale",
  "order": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content created",
  "data": {
    "id": "507f1f77bcf86cd799439060",
    "title": "Summer Sale"
  }
}
```

---

### 9.4 Update Content (Admin)

**Endpoint:** `PUT /content/:id`  
**Auth:** Admin

---

### 9.5 Delete Content (Admin)

**Endpoint:** `DELETE /content/:id`  
**Auth:** Admin

---

## 10. Reviews Module (`/reviews`)

### 10.1 Create Review

**Endpoint:** `POST /reviews`  
**Auth:** Required

**What it does:**
- User creates review for a product
- One review per user per product
- Updates product's average rating

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "rating": 5,
  "comment": "Great product! Fast shipping and excellent quality."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review submitted",
  "data": {
    "id": "507f1f77bcf86cd799439070",
    "productId": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439030",
    "rating": 5,
    "comment": "Great product! Fast shipping and excellent quality."
  }
}
```

**Workflow:**
1. User submits review
2. System checks user hasn't reviewed before
3. Creates review
4. Recalculates product's `average_rating` and `ratings_count`

---

### 10.2 Get Product Reviews

**Endpoint:** `GET /reviews/product/:productId`  
**Auth:** Public

**Query Parameters:**
```
GET /reviews/product/507f1f77bcf86cd799439011?page=1&limit=10&sort=newest
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "507f1f77bcf86cd799439070",
        "rating": 5,
        "comment": "Great product!",
        "user": {
          "name": "John D.",
          "verified_purchase": true
        },
        "createdAt": "2026-02-20T10:00:00Z"
      }
    ],
    "average_rating": 4.5,
    "total_reviews": 120,
    "pagination": {...}
  }
}
```

---

### 10.3 Get Review by ID

**Endpoint:** `GET /reviews/:id`  
**Auth:** Public

---

### 10.4 Update Review

**Endpoint:** `PUT /reviews/:id`  
**Auth:** Required (owner only)

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review after using for a week"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Review updated",
  "data": {
    "id": "507f1f77bcf86cd799439070",
    "rating": 4,
    "comment": "Updated review..."
  }
}
```

---

### 10.5 Delete Review

**Endpoint:** `DELETE /reviews/:id`
**Auth:** Required (owner only)

**Response:**
```json
{
  "success": true,
  "message": "Review deleted"
}
```

---

## Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **customer** | Browse products, manage profile/wishlist/cart/orders, leave reviews, apply referrals, use coupons |
| **seller** | All customer permissions + create/update/delete own products, view seller orders, update order status, request payouts, become seller via onboarding |
| **admin** | All permissions + manage categories, users (roles, restrictions, soft-delete, wallet), coupons, content, refunds, all orders, seller approvals, marketing broadcasts |

---

## Common Error Codes

| Code | HTTP Status | Meaning |
|------|-------------|---------|
| `AUTH.INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `AUTH.EMAIL_NOT_VERIFIED` | 401 | Email not verified |
| `AUTH.USER_RESTRICTED` | 403 | Admin restricted account |
| `AUTH.USER_DELETED` | 403 | Account soft-deleted |
| `AUTH.UNAUTHORIZED` | 401 | Missing/invalid JWT |
| `AUTH.FORBIDDEN` | 403 | Insufficient role |
| `USER.NOT_FOUND` | 404 | User doesn't exist |
| `PRODUCT.NOT_FOUND` | 404 | Product doesn't exist |
| `ORDER.NOT_FOUND` | 404 | Order doesn't exist |
| `COUPON.*` | 400 | Various coupon errors |
| `VALIDATION_ERROR` | 400 | Invalid request body |

---

## Testing

Import Postman collection: `MEAN_E-Commerce_API.postman_collection.json`

Run tests:
```bash
npm test
```

---

*Generated: February 2026*
