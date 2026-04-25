import express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { AppError } from './utils/appError.js';
import { globalErrorHandler } from './controllers/errorController.js';
import { xssSanitizeMiddleware } from './utils/sanitize.js';

// Routers
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import tripRouter from './routes/tripRoutes.js';
import adminRoutes from './routes/admin-routes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

export const app = express();

// ═══════════════════════════════════════════════════════════════
// 1) SECURITY MIDDLEWARES
// ═══════════════════════════════════════════════════════════════

// ── Helmet — HTTP security headers ─────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'https://lh3.googleusercontent.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow Cloudinary images
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    frameguard: { action: 'deny' },
  })
);

// ── CORS ────────────────────────────────────────────────────
const allowedOrigins = [
  /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)(:\d+)?$/,
  'https://travelbuddy-sandy.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.options(/(.*)/, cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(null, isAllowed);
  },
  credentials: true
}));

// ── Logging (dev only) ──────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Rate Limiting ───────────────────────────────────────────

// Global API rate limiter
const globalLimiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// Strict rate limiter for auth endpoints (brute-force protection)
const authLimiter = rateLimit({
  max: 10,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many login/register attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1/auth/google', authLimiter);

// ── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── Data Sanitization — NoSQL injection ─────────────────────
app.use(
  mongoSanitize({
    replaceWith: '_',
  })
);

// ── Data Sanitization — XSS ────────────────────────────────
app.use(xssSanitizeMiddleware);

// ── HTTP Parameter Pollution protection ─────────────────────
app.use(hpp({
  whitelist: [
    'status', 'destination', 'startDate', 'endDate',
    'budgetMin', 'budgetMax', 'visibility', 'sort',
  ],
}));


// ═══════════════════════════════════════════════════════════════
// 2) ROUTES
// ═══════════════════════════════════════════════════════════════

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/trips', tripRouter);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/messages', messageRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);