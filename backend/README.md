# FASCO Backend

Express API for the FASCO storefront. The frontend client lives in
[`frontend/src/api/backend.js`](../frontend/src/api/backend.js) and talks to
`http://localhost:8000/api/v1` (override with `VITE_AUTH_URL`).

## Quick start

```bash
cd backend
npm install
cp .env.example .env   # optional — defaults work for local dev
npm run dev            # node --watch, restarts on changes
```

Health check: <http://localhost:8000/api/v1/health>

## Structure

```
backend/
├── src/
│   ├── server.js              entry point — reads config, starts the listener
│   ├── app.js                 assembles the express app (middleware → routes → errors)
│   ├── config/
│   │   └── env.js             all environment values + defaults, one place
│   ├── routes/
│   │   ├── index.js           mounts every feature router under /api/v1
│   │   └── health.routes.js   GET /health
│   ├── controllers/
│   │   └── health.controller.js
│   ├── middleware/
│   │   ├── requestLogger.js   dev-only request line
│   │   ├── notFound.js        unmatched route → 404 JSON
│   │   └── errorHandler.js    any error → { success: false, message }
│   └── utils/
│       ├── ApiError.js        operational errors (404, 400, …)
│       └── asyncHandler.js    promise errors → error middleware
├── .env.example
└── package.json
```

## Conventions

- **Envelope**: every response is JSON shaped `{ success: boolean, ... }` —
  the frontend client already checks `data.success`.
- **Errors**: throw `new ApiError(status, message)` (or reject inside an
  `asyncHandler`); the error middleware formats them. Unexpected errors become
  500s and are only logged outside production.
- **Adding a feature**: create `routes/<feature>.routes.js` +
  `controllers/<feature>.controller.js`, then mount it in `routes/index.js`.

## API reference

All paths below are relative to `/api/v1`. JSON endpoints use
`Content-Type: application/json`. Authenticated requests send the raw access
token in the `Authorization` header. Admin endpoints require a valid verified
admin session; customer endpoints require a valid verified user session.
Responses use `{ success, message, ... }`; errors use
`{ success: false, message }`.

### Store catalog and categories

| Method and path | Access | Request | Success response |
| --- | --- | --- | --- |
| `GET /health` | Public | — | `{ status: "ok" }` |
| `GET /product` | Public | Optional `?category=<name>` | `{ products: Product[] }` |
| `GET /product/:id` | Public | Numeric catalog id | `{ product: Product }` |
| `POST /product/create` | Admin | Product fields (below) | `201 { product }` |
| `POST /product/upload-image` | Admin | Multipart form field `image` | `201 { imageUrl }` |
| `PUT /product/:id` | Admin | Any validated product fields | `{ product }` |
| `DELETE /product/:id` | Admin | — | `{ message: "Product deleted" }` |
| `GET /category` | Public | — | `{ category: [{ _id, categoryName }] }` |
| `POST /category` | Admin | `{ "categoryName": "Dresses" }` | `201 { category }` |
| `PUT /category/:id` | Admin | `{ "categoryName": "Eveningwear" }` | `{ category }` |
| `DELETE /category/:id` | Admin | — | `{ message: "Category deleted" }`; returns `400` while products use it |

Product creation requires `title`, `price`, `category`, and `image`; optional
fields include `originalPrice`, `discount`, `brand`, `rating`, `reviews`,
`tag`, `images`, `sizes`, `colors`, `stock`, and `arrival`. Prices and stock
are validated on the server and category must refer to an existing category.
Product image uploads accept JPEG, PNG, or WebP content up to 5 MB per file;
the server checks the declared MIME type against the file signature. Files are
stored in `backend/uploads` and served from `/uploads`. This local-disk storage
is suitable for development and single-instance deployments with a persistent
volume; production deployments with ephemeral or multiple instances should
configure durable shared object storage before enabling uploads.

The shop currently searches product names, filters categories, price ranges,
stock availability, sizes, colors, brands, and tags, sorts by newest or price,
and paginates in the storefront. The public catalog endpoint returns the live
catalog; the UI applies those combined filters to that result.

### Checkout, orders, and coupons

| Method and path | Access | Request | Success response |
| --- | --- | --- | --- |
| `GET /payment/config` | Public | — | `{ paymentEnabled }` |
| `POST /payment/checkout-session` | Public; optional user token | Same cart/customer/coupon payload as checkout | `201 { checkoutUrl, orderNumber }` |
| `POST /payments/webhook` | Stripe signature | Stripe Checkout event body | `{ received: true }` |
| `GET /my-orders` | Customer | — | `{ orders: Order[] }`, limited to the signed-in customer |
| `GET /order` | Admin | Optional `?status=` and `?search=` | `{ orders: Order[] }` |
| `GET /order/:id` | Admin | — | `{ order }` |
| `PATCH /order/:id/status` | Admin | `{ "status": "confirmed" }` | `{ order }` |
| `POST /coupon/validate` | Public | `{ "code": "FASCO10", "subtotal": 100 }` | `{ coupon: { code, discount, amount } }` |
| `GET /coupon` | Admin | — | `{ coupons: Coupon[] }` |
| `POST /coupon` | Admin | `{ code, discount, minOrderAmount?, usageLimit?, expiresAt?, active?, description? }` | `201 { coupon }` |
| `PUT /coupon/:id` | Admin | Any coupon fields above | `{ coupon }` |
| `DELETE /coupon/:id` | Admin | — | `{ message: "Coupon deleted" }` |

Order creation is intentionally available only through the hosted payment
session endpoint; a direct unpaid `POST /order` is not exposed.

Coupon `discount` is a fraction (`0.1` is 10%). `usageLimit: null` means
unlimited; `minOrderAmount` is the merchandise subtotal in dollars. Expired,
inactive, under-minimum, and exhausted codes are rejected by both validation
and checkout. Usage is reserved atomically during checkout and released if an
eligible order is cancelled. Order prices and discounts are recalculated by
the server. Stock is reserved when the order is created and restored only
when cancelled before shipment.

Order transitions are `pending → confirmed → packed → shipped → delivered`.
An order may be cancelled from `pending`, `confirmed`, or `packed`; `shipped`,
`delivered`, and `cancelled` are terminal except for the normal shipped-to-
delivered transition. Invalid transitions return `400`.

The storefront uses hosted Stripe Checkout and never collects or stores card
numbers. Payment stays disabled until `STRIPE_SECRET_KEY` and
`STRIPE_WEBHOOK_SECRET` are set; use Stripe test-mode credentials for testing.
Configure Stripe to send `checkout.session.completed`,
`checkout.session.async_payment_succeeded`,
`checkout.session.expired`, and `checkout.session.async_payment_failed` events
to `/api/v1/payments/webhook`. For local testing, Stripe CLI can forward events
to `http://localhost:8000/api/v1/payments/webhook`. Stock and coupon usage are
reserved when a checkout session is created and released when Stripe reports
an expired or failed session. Revenue and top-selling analytics include paid
orders only (and exclude cancelled orders). A webhook-confirmed payment sends
the order confirmation email. Cancelling a paid Stripe order requests an
idempotent provider refund before the cancellation is recorded. Cancelling an
unpaid order first expires its still-open Stripe session; if payment has
already completed, cancellation is rejected until the payment webhook updates
the order.

Order confirmation and status update emails use the configured SMTP account.
When SMTP is missing or delivery fails, the order/status API still succeeds
and the skipped or failed email is logged; configure SMTP to enable delivery.

### Reviews and admin operations

| Method and path | Access | Request | Success response |
| --- | --- | --- | --- |
| `GET /product/:id/reviews` | Public | Numeric product id | `{ reviews: [{ _id, name, rating, comment, createdAt }] }` |
| `POST /product/:id/reviews` | Customer | `{ "rating": 5, "comment": "Great fit." }` | `201 { review, product: { id, rating, reviews } }` |
| `GET /dashboard/stats` | Admin | — | `{ stats }` |
| `GET /wishlist` | Customer | — | `{ wishlistIds: number[] }` |
| `PUT /wishlist` | Customer | `{ "wishlistIds": [1, 2] }` | `{ wishlistIds: number[] }` |
| `GET /users` | Admin | — | `{ users }` |
| `PATCH /user/:id/role` | Admin | `{ "role": "admin" }` | `{ user }` |
| `DELETE /user/:id` | Admin | — | `{ message: "User deleted" }` |
| `GET /subscriber` | Admin | — | `{ subscribers }` |
| `POST /subscribe` | Public | `{ "email": "buyer@example.com", "source": "footer" }` | `201 { message }` |
| `POST /subscriber` | Admin | `{ email, source? }` | `201 { message }` |
| `DELETE /subscriber/:id` | Admin | — | `{ message: "Subscriber removed" }` |

Reviews require a delivered order belonging to the signed-in customer and
containing the product. A customer may review a product once. Valid reviews
are stored separately and update the product's average rating and review
count. Review ratings must be whole numbers from 1 to 5; comments are limited
to 1000 characters.

### Authentication endpoints

| Method and path | Access | Request | Success response |
| --- | --- | --- | --- |
| `POST /register` | Public | `{ name, email, password, phone? }` | `201 { user, devCode? }` |
| `POST /verify` | Public | `{ email, code }` | `{ user }` |
| `POST /revarify-email` | Public | `{ email }` | `{ message, devCode? }` |
| `POST /login` | Public | `{ email, password, role }` | `{ userInfo: { id, name, email, role, accesstoken } }` |
| `POST /google` | Public | `{ credential, role }` | `{ userInfo }` |
| `POST /forgot-password` | Public | `{ email }` | `{ message, devCode? }` |
| `POST /verify-reset-code` | Public | `{ email, code }` | `{ message }` |
| `POST /setnew-password` | Public | `{ email, code, newPassword, confirmPassword }` | `{ message }` |
| `GET /me` | Customer/Admin | — | `{ user }` |
| `POST /logout` | Customer/Admin | — | `{ message }` |
| `PATCH /profile` | Customer/Admin | `{ name?, phone?, avatar? }` | `{ user }` |
| `POST /profile/email/request` | Customer/Admin | `{ email }` | `{ message, devCode? }` |
| `POST /profile/email/verify` | Customer/Admin | `{ code }` | `{ user, accesstoken }` |
| `POST /profile/password` | Customer/Admin | `{ currentPassword, newPassword, confirmPassword }` | `{ user, accesstoken }` |

### Error cases

Typical error statuses are `400` for invalid fields, inventory, coupons, or
state transitions; `401` for missing/invalid authentication; `403` for
insufficient permissions or ineligible reviews; `404` for missing resources;
`409` for duplicate categories/reviews or concurrent state conflicts; and
`429` when rate limits are exceeded.

## Automated tests

Run `npm test` from `backend/`. The Node test suite uses an in-memory MongoDB
and covers role permissions, product/category validation, concurrent stock
reservations and restoration, order transitions, coupon minimums/expiry/usage
limits, review eligibility and duplication, subscribers, auth, and customer
profile/order privacy. Both successful requests and representative rejected
requests are asserted.

## Environment

| Variable       | Default                   | Purpose                        |
| -------------- | ------------------------- | ------------------------------ |
| `PORT`         | `8000`                    | API port                       |
| `CLIENT_ORIGIN`| `http://localhost:5173`   | allowed CORS origin (Vite dev) |
| `NODE_ENV`     | `development`             | `production` silences logs     |
| `MONGODB_URI`  | embedded local DB in dev  | MongoDB connection URI; optional only in development |
| `JWT_SECRET`   | development-only fallback | Must be a random value of at least 32 characters in production |
| `JWT_EXPIRES_IN` | `7d`                     | Access-token lifetime           |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@fasco.com` / unset | First admin seed credentials |
| `GOOGLE_CLIENT_ID` | unset                 | Optional Google Identity Services client id |
| `SMTP_USER` / `SMTP_PASS` | unset          | Configure email delivery; dev logs codes if omitted |
