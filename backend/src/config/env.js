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
  clientOrigins: [
    ...(process.env.CLIENT_ORIGIN ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173"))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
    ...[
      process.env.VERCEL_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    ].filter(Boolean).map((host) => `https://${host}`),
  ],
  trustProxy: process.env.TRUST_PROXY === "true" || process.env.VERCEL === "1",
  apiPrefix: "/api/v1",
  mongoUri: process.env.MONGODB_URI || null,

  // --- auth ---------------------------------------------------------------
  // Signs access tokens (login session) and nothing else.
  jwtSecret: process.env.JWT_SECRET || "fasco-dev-jwt-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // First admin seeded on boot (see src/data/admin.seed.js)
  adminEmail: process.env.ADMIN_EMAIL || "admin@fasco.com",
  adminPassword: process.env.ADMIN_PASSWORD || "",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",

  // --- email (Resend API or SMTP) -----------------------------------------
  resendApiKey: process.env.RESEND_API_KEY || "",
  emailFrom: process.env.EMAIL_FROM || process.env.SMTP_FROM || '"FASCO" <hello@fasco.test>',
  smtp: {
    host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
    port: toPort(process.env.SMTP_PORT, 2525),
    secure: process.env.SMTP_SECURE === "true",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.EMAIL_FROM || process.env.SMTP_FROM || '"FASCO" <hello@fasco.test>',
  },
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  stripeCurrency: (process.env.STRIPE_CURRENCY || "usd").toLowerCase(),
};

if (env.isProduction) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set to a random value of at least 32 characters in production");
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be configured in production");
  }
  if (env.clientOrigins.length === 0) {
    throw new Error("CLIENT_ORIGIN or a Vercel deployment URL must be configured in production");
  }
  for (const origin of env.clientOrigins) {
    let parsedOrigin;
    try {
      parsedOrigin = new URL(origin);
    } catch {
      throw new Error("CLIENT_ORIGIN must contain valid origin URLs");
    }
    if (parsedOrigin.protocol !== "https:" || parsedOrigin.origin !== origin) {
      throw new Error("Production CLIENT_ORIGIN values must be HTTPS origins without paths");
    }
  }
  if (!env.resendApiKey && !(env.smtp.user && env.smtp.pass)) {
    throw new Error("Configure RESEND_API_KEY or SMTP_USER and SMTP_PASS in production");
  }
  if (env.resendApiKey && !process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM must be a verified sender address when using Resend in production");
  }
}