export class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    code = "GENERAL_ERROR", // Default value ensures backward compatibility
    errors = [],
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.code = code; // New property
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
