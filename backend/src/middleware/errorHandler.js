import { env } from "../config/env.js";

// Final stop for every error in the pipeline. Keeps the same envelope the
// frontend's api client already expects: { success: false, message }.
export const errorHandler = (err, _req, res, _next) => {
  const isBadJson = err?.type === "entity.parse.failed";
  const isDuplicateKey = err?.code === 11000;
  const isValidation = err?.name === "ValidationError";
  const isCastError = err?.name === "CastError";
  const isUploadTooLarge = err?.code === "LIMIT_FILE_SIZE";
  const status = isBadJson
    ? 400
    : isDuplicateKey
      ? 409
      : isValidation
        ? 400
        : isCastError
          ? 400
          : isUploadTooLarge
            ? 413
    : err?.statusCode || err?.status || 500;
  const message = isBadJson
    ? "Malformed JSON body"
    : isDuplicateKey
      ? "An account with this information already exists"
      : isValidation
        ? "Invalid request data"
        : isCastError
          ? "Invalid request identifier"
          : isUploadTooLarge
            ? "Image files must be 5 MB or smaller"
          : err?.isOperational
            ? err.message
        : status >= 500 && env.isProduction
          ? "Internal server error"
          : err?.message || "Internal server error";

  if (status >= 500 && !err?.isOperational) {
    console.error("[error]", err);
  }

  res.status(status).json({ success: false, message });
};
