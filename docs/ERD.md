# Entity Relationship Diagram (ERD)

This document outlines the MongoDB collections with their relationships and schemas.

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ PRODUCTS : sells_if_seller

    PRODUCTS ||--o{ REVIEWS : receives
    PRODUCTS }|--|| CATEGORIES : belongs_to

    USERS {
        ObjectId _id PK
        string email UK
        string password_hash
        string google_id
        string full_name
        string role "customer|seller|admin"
        array addresses
        array cart
        array wishlist
        number wallet_balance
        boolean is_verified
        date created_at
    }

    PRODUCTS {
        ObjectId _id PK
        ObjectId seller_id FK
        ObjectId category_id FK
        string title
        string description
        number price
        number stock_quantity
        array images
        number average_rating
        boolean is_active
        date created_at
    }

    CATEGORIES {
        ObjectId _id PK
        string name UK
        string slug UK
        string image_url
        ObjectId parent_id
        date created_at
    }

    ORDERS {
        ObjectId _id PK
        ObjectId user_id FK
        object guest_info
        number total_amount
        number subtotal_amount
        number discount_amount
        number shipping_amount
        number tax_amount
        object coupon_info
        string status "pending|paid|shipped|delivered|cancelled"
        array status_timeline
        object shipping_address
        array items
        object payment_info
        date created_at
        date updated_at
    }

    REVIEWS {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId product_id FK
        number rating
        string comment
        date created_at
    }

    COUPONS {
        ObjectId _id PK
        string code UK
        string type "percentage|fixed"
        number value
        number min_order_amount
        number usage_limit
        number used_count
        date expires_at
        date created_at
    }
```

## Relationship Details

| Relationship | Type | Description |
|-------------|------|-------------|
| USERS → ORDERS | One-to-Many | A user can place multiple orders |
| USERS → REVIEWS | One-to-Many | A user can write multiple reviews |
| USERS → PRODUCTS | One-to-Many | A seller can list multiple products |
| PRODUCTS → REVIEWS | One-to-Many | A product can have multiple reviews |
| PRODUCTS → CATEGORIES | Many-to-One | Each product belongs to one category |

## Payment Status Flow

```mermaid
stateDiagram-v2
    [*] --> pending
    pending --> paid : Payment Succeeded (Stripe Webhook)
    pending --> paid : Wallet Payment
    pending --> pending_cod : Cash on Delivery
    pending --> pending : PayPal Initiated
    pending --> cancelled : Payment Failed/Cancelled
    paid --> shipped : Seller Ships
    shipped --> delivered : Delivered
    delivered --> [*]
    cancelled --> [*]
```
