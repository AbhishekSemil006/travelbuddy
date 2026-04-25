import { z } from 'zod';

/**
 * ──────────────────────────────────────────────────────────────
 *  ZOD VALIDATION SCHEMAS — Validate every input shape
 * ──────────────────────────────────────────────────────────────
 */

// ── Shared refinements ──────────────────────────────────────

const emailField = z
  .string({ required_error: 'Email is required' })
  .email('Please provide a valid email')
  .max(255, 'Email too long')
  .toLowerCase()
  .trim();

const passwordField = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const nameField = z
  .string({ required_error: 'Name is required' })
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .trim();

const mobileField = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Please provide a valid mobile number')
  .optional()
  .or(z.literal(''));

const objectIdField = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

// ═══════════════════════════════════════════════════════════════
//  AUTH SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const registerSchema = z.object({
  email: emailField,
  password: passwordField,
  fullName: nameField,
  mobileNo: mobileField,
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string({ required_error: 'Password is required' }).min(1, 'Password is required'),
});

export const googleSignInSchema = z.object({
  credential: z.string({ required_error: 'Google credential is required' }).min(1),
});

// ═══════════════════════════════════════════════════════════════
//  USER / PROFILE SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const profileUpdateSchema = z.object({
  displayName: z.string().min(2).max(50).trim().optional(),
  bio: z.string().max(300, 'Bio must be 300 characters or less').trim().optional(),
  gender: z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say']).optional(),
  interests: z.array(z.string().max(50)).max(20, 'Maximum 20 interests').optional(),
  languages: z.array(z.string().max(50)).max(15, 'Maximum 15 languages').optional(),
  dateOfBirth: z.string().datetime({ offset: true }).optional()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
});

// ═══════════════════════════════════════════════════════════════
//  TRIP SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const createTripSchema = z.object({
  title: z
    .string({ required_error: 'Trip must have a title' })
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be 100 characters or less')
    .trim(),
  description: z.string().max(2000, 'Description too long').trim().optional(),
  destination: z
    .string({ required_error: 'Trip must have a destination' })
    .min(2, 'Destination must be at least 2 characters')
    .max(200, 'Destination too long')
    .trim(),
  startDate: z.string({ required_error: 'Start date is required' }),
  endDate: z.string({ required_error: 'End date is required' }),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  maxParticipants: z.number().int().min(2).max(50).default(4),
  visibility: z.enum(['public', 'private']).default('public'),
  femaleOnly: z.boolean().default(false),
  interests: z.array(z.string().max(50)).max(20).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
});

export const updateTripSchema = z.object({
  title: z.string().min(3).max(100).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  destination: z.string().min(2).max(200).trim().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  maxParticipants: z.number().int().min(2).max(50).optional(),
  visibility: z.enum(['public', 'private']).optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
  femaleOnly: z.boolean().optional(),
  interests: z.array(z.string().max(50)).max(20).optional(),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
});

// ═══════════════════════════════════════════════════════════════
//  MESSAGE SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const sendMessageSchema = z.object({
  content: z
    .string({ required_error: 'Message content is required' })
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)')
    .trim(),
});

export const startConversationSchema = z.object({
  otherUserId: objectIdField,
});

export const reportConversationSchema = z.object({
  reason: z.enum(
    ['spam', 'harassment', 'inappropriate_content', 'scam', 'fake_profile', 'threats', 'other'],
    { required_error: 'Report reason is required' }
  ),
  description: z.string().max(1000, 'Description too long').trim().optional(),
});

// ═══════════════════════════════════════════════════════════════
//  ADMIN SCHEMAS
// ═══════════════════════════════════════════════════════════════

export const adminFineSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required' })
    .positive('Amount must be positive')
    .max(10000, 'Fine amount too high'),
});

export const adminReportStatusSchema = z.object({
  status: z.enum(['reviewed', 'dismissed', 'actioned'], {
    required_error: 'Valid status required',
  }),
  adminNotes: z.string().max(2000).trim().optional(),
});

export const adminUpdateTripSchema = z.object({
  title: z.string().min(3).max(100).trim().optional(),
  description: z.string().max(2000).trim().optional(),
  destination: z.string().min(2).max(200).trim().optional(),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
  visibility: z.enum(['public', 'private']).optional(),
});
