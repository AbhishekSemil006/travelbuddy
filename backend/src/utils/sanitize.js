import mongoose from 'mongoose';

/**
 * ──────────────────────────────────────────────────────────────
 *  SECURITY UTILITIES — Sanitize · Escape · Verify
 * ──────────────────────────────────────────────────────────────
 */

// ── HTML Entity Escape (XSS Prevention) ─────────────────────
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

const HTML_ESCAPE_REGEX = /[&<>"'`/]/g;

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * @param {string} str
 * @returns {string}
 */
export const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char]);
};

/**
 * Strips HTML tags from a string entirely.
 * @param {string} str
 * @returns {string}
 */
export const stripHtmlTags = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
};

/**
 * Full sanitize: strip tags → escape remaining entities → trim → limit length.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const sanitizeString = (str, maxLength = 5000) => {
  if (typeof str !== 'string') return str;
  return escapeHtml(stripHtmlTags(str)).trim().slice(0, maxLength);
};

/**
 * Recursively sanitize all string values in an object.
 * @param {Object} obj
 * @param {number} maxLength
 * @returns {Object}
 */
export const sanitizeObject = (obj, maxLength = 5000) => {
  if (!obj || typeof obj !== 'object') return obj;

  const sanitized = Array.isArray(obj) ? [] : {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, maxLength);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, maxLength);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

// ── MongoDB ObjectId Validation ─────────────────────────────

/**
 * Check if a string is a valid MongoDB ObjectId.
 * @param {string} id
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
};

/**
 * Middleware: Validate that specified route params are valid ObjectIds.
 * @param  {...string} paramNames - The param names to validate (e.g. 'id', 'userId')
 * @returns {Function} Express middleware
 */
export const validateObjectIdParams = (...paramNames) => {
  return (req, res, next) => {
    for (const param of paramNames) {
      if (req.params[param] && !isValidObjectId(req.params[param])) {
        return res.status(400).json({
          status: 'fail',
          message: `Invalid ${param} format`,
        });
      }
    }
    next();
  };
};

// ── XSS Body Sanitization Middleware ────────────────────────

/**
 * Express middleware: sanitize req.body, req.query, req.params strings.
 */
export const xssSanitizeMiddleware = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  // Don't sanitize params — they're validated by ObjectId middleware
  next();
};
