# FASCO Store

FASCO is a full-stack fashion storefront project. The backend is the main
coursework deliverable: it provides a REST API, persists application data in
MongoDB, enforces customer/admin permissions, and implements authentication,
inventory, orders, and payment workflows.

## Backend features

- MongoDB/Mongoose models for users, products, categories, orders, coupons,
  reviews, subscribers, and recommendation activity.
- Product search across names and catalog details, with combined keyword,
  price, availability, and existing facet filters.
- MongoDB-managed homepage content, live catalog-driven deals and arrivals,
  and an administrator editor for storefront copy and campaign presentation.
- Customer registration, email verification, login/logout, Google sign-in
  (optional), profile management, and password recovery.
- Role-protected admin operations, product/category management, dashboard
  analytics, stock and coupon reservations, and order status transitions.
- Transactional order/stock/coupon updates, Stripe Checkout integration with
  webhook deduplication/recovery, and retryable order confirmation email.
- Input validation, password hashing, access-token versioning, rate limits,
  request logging, error handling, and automated integration tests.

## Run and inspect the backend

See the [backend setup, instructor review guide, API reference, and email
provider instructions](./backend/README.md).

For an instructor review, use the **Instructor / reviewer quick check** in
`backend/README.md`. The reviewer creates a private local `.env` from the
example, sets their own admin login, and can use their own Mailtrap test inbox
to inspect verification and password-recovery codes. No working credentials
are stored in this repository.

Quick start (from `backend/`):

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

The backend starts a persistent local MongoDB replica set automatically and
seeds the catalog. Check `http://localhost:8000/api/v1/health/ready` and
`http://localhost:8000/api/v1/product`. To inspect stored documents with
MongoDB Compass, connect to
`mongodb://127.0.0.1:27018/fasco?replicaSet=testset`. On Windows, database
files stay outside the repository under `%LOCALAPPDATA%\FASCO\mongodb`.
Optional MongoDB Community setup instructions are in
[`backend/README.md`](./backend/README.md).

Run the backend integration tests from `backend/`:

```powershell
npm.cmd test
```

Signup verification and password recovery use Resend or SMTP. The backend
README explains real inbox delivery and Mailtrap sandbox setup. Stripe
payments also require private credentials.

To run the optional storefront, open a second terminal, change to `frontend/`,
then run `npm.cmd install` and `npm.cmd run dev`. The Vite app uses the local
backend at `http://localhost:8000/api/v1` by default.

## Deploying to Vercel

The root `vercel.json` defines the `backend` and `frontend` services. The
backend receives public `/api/*` requests and the Vite frontend receives `/`.
Production requires an external replica-set MongoDB URI and private
environment variables; Vercel does not run the local MongoDB process.
Production product-image uploads use Vercel Blob.
See [`backend/README.md`](./backend/README.md) for deployment settings and
provider setup for email and Google sign-in.

## Repository layout

- [`backend/`](./backend/) — Express REST API, MongoDB models, authentication,
  business logic, and integration tests.
- [`frontend/`](./frontend/) — React storefront and admin dashboard consuming
  the backend API.
