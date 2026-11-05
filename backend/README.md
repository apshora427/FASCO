# FASCO Backend

Express API for the FASCO storefront. The frontend client lives in
[`frontend/src/api/backend.js`](../frontend/src/api/backend.js) and talks to
`http://localhost:8000/api/v1` (override with `VITE_AUTH_URL`).

## Quick start

```bash
cd backend
npm install
npm run dev
```

On Windows PowerShell, copy the example configuration first:

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

When `MONGODB_URI` is unset, the backend starts a persistent local MongoDB
replica set automatically. Its database files live outside the repository in
`%LOCALAPPDATA%\FASCO\mongodb` on Windows, so no database folder is added to
the project or GitHub. MongoDB Compass can connect to
`mongodb://127.0.0.1:27018/fasco?replicaSet=testset`. Set `MONGODB_URI` in
`.env` to use an installed MongoDB Community Server or another replica-set
deployment. The API seeds the product catalog, categories, coupon, and (when
configured) administrator account at startup.

### Optional: use MongoDB Community Server

To use MongoDB Community Server instead of the automatic local database,
install MongoDB Community Server and MongoDB Shell from PowerShell:

```powershell
winget install --id MongoDB.Server --exact
winget install --id MongoDB.Shell --exact
```

In the server's `mongod.cfg` file, add the following top-level section (keep
existing settings):

```yaml
replication:
  replSetName: rs0
```

Find the config path used by the Windows service with:

```powershell
(Get-CimInstance Win32_Service -Filter "Name='MongoDB'").PathName
```

Restart the service, initialize the replica set once, then set the connection
string in `backend/.env`:

```powershell
Restart-Service MongoDB
mongosh "mongodb://127.0.0.1:27017/admin" --eval "rs.initiate()"
```

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/fasco?replicaSet=rs0
```

MongoDB stores its files in its own configured database directory.

## Instructor / reviewer quick check

The repository is enough to run the backend and its automated checks. Real
email delivery and Stripe payments need credentials supplied locally; they
are intentionally not included in GitHub.

1. Install Node.js 20.19 or newer, then run `npm install` and `npm run dev` from
   `backend/`.
2. Visit <http://localhost:8000/api/v1/health/ready>. A working local setup
   returns `status: "ready"`, a MongoDB topology of `replica_set`, and whether
   an email provider is configured. The older `/health` endpoint is a liveness check only.
3. Visit <http://localhost:8000/api/v1/product>. On a fresh database, the
   first boot seeds 18 products.
4. Visit <http://localhost:8000/api/v1/homepage> to verify homepage content,
   featured products, arrivals, and discounted deals are coming from MongoDB.
   An administrator can edit homepage copy, images, links, testimonials, and
   campaign layout in **Admin → Homepage**.
5. To inspect MongoDB directly, open MongoDB Compass and connect to
   `mongodb://127.0.0.1:27018/fasco?replicaSet=testset`. On Windows, the
   persistent database is stored under `%LOCALAPPDATA%\FASCO\mongodb`; it is
   not part of the repository.
6. To sign in as an administrator, set `ADMIN_EMAIL` and a private
   `ADMIN_PASSWORD` in `backend/.env`, then restart the backend. The admin
   account is created/synchronized from these settings. Sign in with
   `POST /api/v1/login` using `{ "email": "...", "password": "...", "role": "admin" }`.
   Use its returned `userInfo.accesstoken` as the raw `Authorization` header
   for `GET /api/v1/users`, `GET /api/v1/dashboard/stats`, and other admin
   endpoints.
7. To test real verification and password-recovery mail, configure Resend or
   SMTP using the steps below, restart, and register an email address you can access.
   The password-recovery email contains a **6-digit, 10-minute code**, not a
   password-reset link. Enter that code in the recovery flow and choose a new
   password. Never commit `.env` or paste mail credentials into source files.
8. Run `npm test` from `backend/` (`npm.cmd test` in PowerShell) to verify
   auth, database persistence, password recovery, permissions, inventory
   transactions, coupons, orders, and other API flows against a temporary
   MongoDB replica set.

### Vercel deployment

The root `vercel.json` deploys the `backend` Express service and `frontend`
Vite service under one domain. `/api/*` is routed to Express; all other paths
go to the SPA. The frontend calls the same-domain `/api/v1` path in production.
No service binding is needed because the browser uses the public rewrite and
the frontend is a static build, not a server-side service caller.

Configure these production environment variables for the `backend` service:

- `MONGODB_URI`: an externally hosted MongoDB replica-set or sharded-cluster
  URI (for example, MongoDB Atlas). The local automatic database cannot run
  inside a Vercel Function.
- `JWT_SECRET`: a private random value with at least 32 characters.
- Either `RESEND_API_KEY` and `EMAIL_FROM` (a sender address verified by Resend)
  or `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and
  `SMTP_FROM`. Resend delivers to real inboxes; Mailtrap SMTP is useful for
  test-only inbox capture. Keep all credentials private.
- `GOOGLE_CLIENT_ID` on the backend and the same value as
  `VITE_GOOGLE_CLIENT_ID` on the frontend to enable Google sign-in/sign-up.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: administrator login credentials.
- `BLOB_READ_WRITE_TOKEN`: connect a Vercel Blob store to the backend service
  to enable durable product-image uploads.

Set `VITE_AUTH_URL` only if you deliberately want to call an API on a
different origin; otherwise leave it unset so the app uses `/api/v1`.
Vercel's deployment URL is allowed automatically for API CORS.

Product image uploads use Vercel Blob in production and local disk during
development. Create a Blob store and connect it to the Vercel project so
`BLOB_READ_WRITE_TOKEN` is available to the backend; production uploads fail
with a clear configuration error if the token is missing. Vercel's server
request-size limit means uploads are capped at 4 MiB there (5 MiB locally).
Blob URLs are stored on products directly; local `/uploads/*` files are not
shared with or persisted by Vercel.

### Configure email delivery

For real inbox delivery, create a Resend account, verify a sender domain/address,
and set `RESEND_API_KEY` and `EMAIL_FROM` in `backend/.env` (and in Vercel's
backend environment settings for deployment):

```dotenv
RESEND_API_KEY=re_...
EMAIL_FROM="FASCO <noreply@your-verified-domain.com>"
```

Resend is preferred when you want verification and recovery codes delivered to
real or temporary email inboxes. The sender must be verified by Resend. Never
commit the API key.

Alternatively, configure a Mailtrap test inbox:

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and
`SMTP_FROM` in the local `backend/.env` using the SMTP settings shown in your
Mailtrap Email Testing sandbox. Mailtrap captures the signup-verification and
password-recovery messages in its web inbox instead of delivering them to a
real recipient address. The instructor must have access to that Mailtrap
inbox to inspect the messages. Keep the sandbox credentials private and never
commit them:

```dotenv
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-sandbox-username
SMTP_PASS=your-mailtrap-sandbox-password
SMTP_FROM="FASCO" <hello@fasco.test>
```

After restarting the API, readiness reports `checks.email.status: "configured"`
and the selected provider. Register a new user and find the confirmation code
in the configured inbox.
New accounts are stored with `isVerified: false`; login is blocked until the
code is entered on the confirmation screen. The **Resend** action requests a
fresh code if needed. `POST /api/v1/forgot-password` sends a reset code to the
configured provider without revealing whether an account exists. Codes expire
after ten minutes. If email delivery is unavailable, signup/reset now returns
an explicit error and clears the unsent code; it never sends the user to a
confirmation screen that cannot work. Invalid codes are rejected by the
server, expire after ten minutes, and lock after repeated incorrect attempts.

Mailtrap is an email-testing sandbox, not a public disposable-mail provider.
To deliver to an actual temporary inbox, configure Resend or another email
provider that permits delivery to that inbox.

### Demonstrate a password reset with the API

Use an existing verified user's email and an email inbox you can access. Each
request below is JSON sent to `http://localhost:8000/api/v1`:

```json
POST /forgot-password
{ "email": "you@example.com" }

POST /verify-reset-code
{ "email": "you@example.com", "code": "123456" }

POST /setnew-password
{
  "email": "you@example.com",
  "code": "123456",
  "newPassword": "New-Password1!",
  "confirmPassword": "New-Password1!"
}
```

The API deliberately returns a generic forgot-password response to prevent
account discovery. The code is delivered only by email; it is never returned
by the API. Passwords require 6–12 characters, including uppercase, lowercase,
number, and special character. Codes expire after ten minutes and are
single-use; repeated invalid attempts are rate limited and temporarily locked.

### Verify user data is persisted

Registering a user writes a MongoDB `users` document. Confirm the new email in
Compass by opening the `fasco` database and `users` collection, or sign in as
admin and call `GET /api/v1/users`. Password hashes, reset codes, and access
token internals are excluded from normal API responses. The `orders`,
`products`, `coupons`, `reviews`, and other collections similarly hold the
store's persisted records. The test suite also checks user creation, hashed
password storage, successful password reset, and login with the new password.

### Payment demo limits

Hosted Stripe checkout is optional and disabled until `STRIPE_SECRET_KEY` and
`STRIPE_WEBHOOK_SECRET` are set. Without Stripe credentials the catalog,
authentication, admin operations, and automated transaction tests still run.
Use Stripe test-mode keys and Stripe CLI webhook forwarding to demonstrate
payments; never put Stripe secrets in frontend variables or GitHub.

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
│   │   └── health.routes.js   GET /health, /health/ready
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
| `GET /health/ready` | Public | — | `{ status, checks: { database, email } }`; `503` if the database is unavailable or not transaction-capable |
| `GET /product` | Public | Optional `?category=<name>` | `{ products: Product[] }` |
| `GET /product/:id` | Public | Numeric catalog id | `{ product: Product }` |
| `GET /homepage` | Public | — | `{ content, products, deals, featuredProduct, dealEndsAt }` |
| `PUT /homepage` | Admin | `{ "content": HomepageContent }` | `{ content }` |
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
Product image uploads accept JPEG, PNG, or WebP content; the server checks the
declared MIME type against the file signature. Uploads are limited to 5 MiB
locally and 4 MiB on Vercel. Local files are stored in `backend/uploads` and
served from `/uploads`; on Vercel, uploads are stored in Blob and the resulting
public URL is saved directly on the product.

Homepage copy and layout data are stored in the `homepagecontents` MongoDB
collection. The initial content is seeded only when that record is absent;
catalogue changes automatically update the homepage's arrival and deal lists.
Homepage edits are validated and saved through the admin-only `PUT /homepage`
endpoint or the dashboard's Homepage editor.

The shop currently searches product names, filters categories, price ranges,
stock availability, sizes, colors, brands, and tags, sorts by newest or price,
and paginates in the storefront. The public catalog endpoint returns the live
catalog; the UI applies those combined filters to that result.

### Personalized recommendations

| Method and path | Access | Request | Success response |
| --- | --- | --- | --- |
| `POST /recommendations/events` | Customer | `{ "productId": 12, "eventType": "view" }` (`view`, `cart`, or `wishlist`) | `202 { message }` |
| `GET /recommendations` | Customer | Optional `?excludeProductId=12&limit=8` (`limit` 1–12) | `{ recommendations, signals }` |

Recommendation activity is stored as per-customer, per-product aggregates.
Ranking combines recency-weighted browsing, wishlist/cart actions, existing
wishlists, paid purchases, category/brand affinity, and collaborative signals
from customers with overlapping activity or purchases. Unavailable and
previously interacted products are omitted. New accounts get stable popular
picks until enough activity is available. Removing a product or customer
cleans up their activity records.

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
unlimited; `minOrderAmount` is the merchandise subtotal in dollars. Expired, inactive, under-minimum, and exhausted codes are rejected by both
validation and checkout. Order creation, stock reservation, and coupon
reservation commit together in a MongoDB transaction; cancellation and
reservation release are transactional as well. Order prices and discounts are
recalculated by the server. Stock is reserved when the order is created and
restored only when cancelled before shipment.
MongoDB must be a replica set or sharded cluster; startup rejects standalone
deployments that cannot provide transactions. Local development starts a
persistent one-member replica set automatically. Integration tests use
isolated temporary one-member replica sets.

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
the order confirmation email. Verified Stripe event IDs are persisted with
processing status, attempt counts, and retry details, so duplicate deliveries
are idempotent and failed event processing can recover after a restart.
Confirmation emails are queued on the order and tracked separately from payment;
failed deliveries are retried with backoff by the background recovery worker
and on duplicate Stripe delivery. Cancelling a paid Stripe order requests an
idempotent provider refund before the cancellation is recorded. Cancelling an
unpaid order first expires its still-open Stripe session; if payment has
already completed, cancellation is rejected until the payment webhook updates
the order.

Order confirmation and status update emails use the configured email provider.
Payment confirmation emails remain queued for background retry when email
delivery is unavailable or fails. Status-update emails remain best-effort and failures
are logged; neither email failure changes the order API result.

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

Email-based signups must verify the emailed code; verification returns a customer
session so the customer can continue without logging in again. Google sign-in
and sign-up verify the ID token on the server and accept only Google-verified
email addresses. Create an OAuth 2.0 Web client in Google Cloud, add each
frontend origin to its authorized JavaScript origins, and configure the same
Web client ID as `GOOGLE_CLIENT_ID` in the backend and `VITE_GOOGLE_CLIENT_ID`
in the frontend. On Vercel, set the value for both the backend service and
frontend build.

| Method and path | Access | Request | Success response |
| --- | --- | --- | --- |
| `POST /register` | Public | `{ name, email, password, phone? }` | `201 { data: { email, emailSent } }` |
| `POST /verify` | Public | `{ email, code }` | Verified customer session (`userInfo` with access token) |
| `POST /verify-reset-code` | Public | `{ email, code }` | `{ message }` |
| `POST /revarify-email` | Public | `{ email }` | `{ message, emailSent }` |
| `POST /login` | Public | `{ email, password, role }` | `{ userInfo: { id, name, email, role, accesstoken } }` |
| `POST /google` | Public | `{ credential, role }` | `{ userInfo }` |
| `POST /forgot-password` | Public | `{ email }` | Generic confirmation message; code is emailed when a provider is configured |
| `POST /setnew-password` | Public | `{ email, code, newPassword, confirmPassword }` | `{ message }` |
| `GET /me` | Customer/Admin | — | `{ user }` |
| `POST /logout` | Customer/Admin | — | `{ message }` |
| `PATCH /profile` | Customer/Admin | `{ name?, phone?, avatar? }` | `{ user }` |
| `POST /profile/email/request` | Customer/Admin | `{ email }` | `{ message, emailSent }` |
| `POST /profile/email/verify` | Customer/Admin | `{ code }` | `{ user, accesstoken }` |
| `POST /profile/password` | Customer/Admin | `{ currentPassword, newPassword, confirmPassword }` | `{ user, accesstoken }` |

### Error cases

Typical error statuses are `400` for invalid fields, inventory, coupons, or
state transitions; `401` for missing/invalid authentication; `403` for
insufficient permissions or ineligible reviews; `404` for missing resources;
`409` for duplicate categories/reviews or concurrent state conflicts; and
`429` when rate limits are exceeded.

## Automated tests

Run `npm test` from `backend/` (`npm.cmd test` in Windows PowerShell). The
Node test suite uses an in-memory MongoDB and covers role permissions,
product/category validation, concurrent stock reservations and restoration,
order transitions, coupon minimums/expiry/usage limits, review eligibility
and duplication, subscribers, auth, password recovery, and customer
profile/order privacy. Successful and representative rejected requests are
asserted.

## Environment

| Variable       | Default                   | Purpose                        |
| -------------- | ------------------------- | ------------------------------ |
| `PORT`         | `8000`                    | API port                       |
| `CLIENT_ORIGIN`| `http://localhost:5173`   | allowed CORS origin (Vite dev) |
| `NODE_ENV`     | `development`             | `production` silences logs     |
| `MONGODB_URI`  | persistent local replica set on `127.0.0.1:27018` | Optional replica-set or sharded-cluster MongoDB URI |
| `JWT_SECRET`   | development-only fallback | Must be a random value of at least 32 characters in production |
| `JWT_EXPIRES_IN` | `7d`                     | Access-token lifetime           |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | `admin@fasco.com` / unset | First admin seed credentials |
| `GOOGLE_CLIENT_ID` | unset                 | Google Identity Services Web client id |
| `VITE_GOOGLE_CLIENT_ID` | unset            | Same client id, exposed to the frontend build |
| `RESEND_API_KEY` / `EMAIL_FROM` | unset     | Resend API key and verified sender; preferred for real inbox delivery |
| `SMTP_USER` / `SMTP_PASS` | unset          | Alternative SMTP authentication for confirmation, reset, and account-change codes |
