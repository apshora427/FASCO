import "dotenv/config";

// ports must be a usable TCP port — rejects missing, 0 ("random port"), and
// out-of-range values so a stray PORT= in the shell can't hijack the API
const toPort = (value, fallback) => {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isInteger(n) && n >= 1 && n <= 65535 ? n : fallback;
};

// Single source of truth for environment values. Every module imports `env`
// instead of touching process.env, so defaults live in exactly one place.
export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: (process.env.NODE_ENV || "development") === "production",
  // frontend/src/api/backend.js falls back to http://localhost:8000/api/v1
  port: toPort(process.env.PORT, 8000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  apiPrefix: "/api/v1",
  mongoUri: process.env.MONGODB_URI || null,

  // --- auth ---------------------------------------------------------------
  // Signs access tokens (login session) and nothing else.
  jwtSecret: process.env.JWT_SECRET || "fasco-dev-jwt-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // First admin seeded on boot (see src/data/admin.seed.js)
  adminEmail: process.env.ADMIN_EMAIL || "admin@fasco.com",
  adminPassword: process.env.ADMIN_PASSWORD || "",

  // --- email (nodemailer / SMTP) ------------------------------------------
  // When SMTP_USER/SMTP_PASS are absent the mailer falls back to logging the
  // confirmation code to the backend console so dev flows never dead-end.
  smtp: {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: toPort(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || '"FASCO" <no-reply@fasco.com>',
  },
};