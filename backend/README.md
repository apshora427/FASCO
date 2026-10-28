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

## Planned routers (see `src/routes/index.js`)

| Group    | Endpoints the frontend calls                                              |
| -------- | ------------------------------------------------------------------------- |
| auth     | `POST /register`, `/verify/:token`, `/forgot-password`, `/setnew-password/:token` |
| category | `GET/POST /category`, `PUT/DELETE /category/:id`                           |
| product  | `POST /product/create` (admin JWT)                                         |

## Environment

| Variable       | Default                   | Purpose                        |
| -------------- | ------------------------- | ------------------------------ |
| `PORT`         | `8000`                    | API port                       |
| `CLIENT_ORIGIN`| `http://localhost:5173`   | allowed CORS origin (Vite dev) |
| `NODE_ENV`     | `development`             | `production` silences logs     |
| `MONGODB_URI`  | —                         | next step: database connection |
