import { ApiError } from "../utils/ApiError.js";

// Anything no route matched lands here — always JSON, never an HTML 404 page.
export const notFound = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
