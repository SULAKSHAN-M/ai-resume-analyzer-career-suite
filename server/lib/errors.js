/** Thrown for expected, user-facing failures. Anything else is a 500 with a generic message. */
export class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code ?? "error";
  }
}

export const badRequest = (message, code) => new HttpError(400, message, code);
export const unauthorized = (message = "Sign in to continue.") => new HttpError(401, message, "unauthenticated");
export const forbidden = (message = "You don't have access to this.") => new HttpError(403, message, "forbidden");
export const notFound = (message = "Not found.") => new HttpError(404, message, "not_found");

/** Wraps an async Express handler so a rejected promise reaches the error middleware. */
export const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
