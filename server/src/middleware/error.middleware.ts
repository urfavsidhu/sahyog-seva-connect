import { Request, Response, NextFunction } from "express";

/** 404 handler — mounted after all routes. */
export function notFound(req: Request, res: Response, _next: NextFunction) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

/**
 * Central error handler — mounted last, after notFound. Catches anything
 * passed to next(err) from controllers, plus Mongoose validation/cast
 * errors so every failure returns consistent JSON instead of an HTML stack
 * trace.
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(err);

  let statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  let message = err.message || "Internal server error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e: any) => e.message)
      .join(", ");
  }

  // Duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue ?? {})[0] ?? "field";
    message = `${field} already in use`;
  }

  res.status(statusCode).json({ message });
}
