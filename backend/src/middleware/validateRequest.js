/**
 * ──────────────────────────────────────────────────────────────
 *  REQUEST VALIDATION MIDDLEWARE
 *  Usage: router.post('/endpoint', validate(myZodSchema), handler)
 * ──────────────────────────────────────────────────────────────
 */

/**
 * Validates req.body against a Zod schema.
 * On failure, returns 400 with structured field-level errors.
 * On success, replaces req.body with the parsed (clean) data.
 *
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against
 * @returns {Function} Express middleware
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors,
      });
    }

    // Replace body with parsed & cleaned data (strips unknown fields)
    req.body = result.data;
    next();
  };
};

/**
 * Validates req.query against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @returns {Function}
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        status: 'fail',
        message: 'Invalid query parameters',
        errors,
      });
    }

    req.query = result.data;
    next();
  };
};
