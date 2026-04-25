/**
 * ──────────────────────────────────────────────────────────────
 *  GLOBAL ERROR HANDLER
 *  Handles operational errors, Zod validation, Mongoose errors,
 *  and ensures no stack trace leaks in production.
 * ──────────────────────────────────────────────────────────────
 */

// ── Error transformers ──────────────────────────────────────

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return { statusCode: 400, status: 'fail', message, isOperational: true };
};

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const message = `Duplicate value for '${field}'. Please use another value.`;
  return { statusCode: 400, status: 'fail', message, isOperational: true };
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return { statusCode: 400, status: 'fail', message, isOperational: true };
};

const handleZodError = (err) => {
  const errors = err.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
  return {
    statusCode: 400,
    status: 'fail',
    message: 'Validation failed',
    errors,
    isOperational: true,
  };
};

const handleJWTError = () => ({
  statusCode: 401,
  status: 'fail',
  message: 'Invalid token. Please log in again!',
  isOperational: true,
});

const handleJWTExpiredError = () => ({
  statusCode: 401,
  status: 'fail',
  message: 'Your token has expired! Please log in again.',
  isOperational: true,
});

// ── Main handler ────────────────────────────────────────────

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // Development: show full error details
    const response = {
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    };

    // Add Zod errors if present
    if (err.errors) response.errors = err.errors;

    res.status(err.statusCode).json(response);
  } else {
    // Production: handle known error types, hide internals
    let error = { ...err, message: err.message, name: err.name };

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'ZodError') error = handleZodError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    if (error.isOperational || err.isOperational) {
      const response = {
        status: error.status || 'fail',
        message: error.message,
      };
      if (error.errors) response.errors = error.errors;

      res.status(error.statusCode || err.statusCode).json(response);
    } else {
      // Unknown error — don't leak details
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
};
