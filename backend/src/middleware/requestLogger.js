import { env } from "../config/env.js";

// dev-only request line: `GET /api/v1/health`
export const requestLogger = (req, _res, next) => {
  if (!env.isProduction) console.log(`${req.method} ${req.originalUrl}`);
  next();
};
