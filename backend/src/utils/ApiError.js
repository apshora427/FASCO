// Small error type for failures we *want* to show the client (404, 400, …).
// Anything else thrown in a handler falls through to the error middleware as a
// plain Error and surfaces as a 500.
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
