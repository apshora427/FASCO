import { env } from "../config/env.js";

// Final stop for every error in the pipeline. Keeps the same envelope the
// frontend's api client already expects: { success: false, message }.
export const errorHandler = (err, _req, res, _next) => {
  const isBadJson = err?.type === "entity.parse.failed";
  const status = isBadJson
    ? 400
    : err?.statusCode || err?.status || 500;
  const message = isBadJson
    ? "Malformed JSON body"
    : err?.message || "Internal server error";

  if (status >= 500 && !env.isProduction) {
    console.error("[error]", err);
  }

  res.status(status).json({ success: false, message });
};
