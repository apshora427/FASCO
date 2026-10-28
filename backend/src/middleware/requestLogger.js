import { env } from "../config/env.js";

// dev-only request line: `GET /api/v1/health`
export const requestLogger = (req, _res, next) => {
  if (!env.isProduction) {
    const safePath = req.path.replace(
      /\/(verify|verify-reset-code|setnew-password)\/[^/]+/gi,
      "/$1/[redacted]"
    );
    console.log(`${req.method} ${req.baseUrl}${safePath}`);
  }
  next();
};
