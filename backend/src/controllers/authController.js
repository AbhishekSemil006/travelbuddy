import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User } from '../models/userModel.js';
import { Profile } from '../models/profileModel.js';
import { AppError } from '../utils/appError.js';
import { sanitizeString } from '../utils/sanitize.js';

// 🔐 Sign Token
const signToken = (id, type = 'access') => {
  const secret =
    type === 'access'
      ? process.env.JWT_SECRET
      : process.env.JWT_REFRESH_SECRET;

  const expiresIn =
    type === 'access'
      ? process.env.JWT_EXPIRES_IN
      : process.env.JWT_REFRESH_EXPIRES_IN;

  return jwt.sign({ id }, secret, { expiresIn });
};

// 🚀 Send Token
const createSendToken = async (user, statusCode, req, res) => {
  const accessToken = signToken(user._id, 'access');
  const refreshToken = signToken(user._id, 'refresh');

  const cookieOptions = {
    expires: new Date(
      Date.now() +
        process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  res.cookie('jwt_refresh', refreshToken, cookieOptions);

  // Get profile
  const profile = await Profile.findOne({ user: user._id });

  // Never send password
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    data: {
      user: {
        _id: user._id,
        id: user._id.toString(),
        email: user.email,
        mobileNo: user.mobileNo || '',
        fullName: profile?.displayName || user.name || 'User',
        avatarUrl: profile?.avatarUrl || null,
        role: user.role || 'user',
        authProvider: user.authProvider || 'local',
      },
    },
  });
};

// ══════════════════════════════════════════════════════════════
// REGISTER — Validation handled by route middleware (registerSchema)
// ══════════════════════════════════════════════════════════════
export const register = async (req, res, next) => {
  try {
    const { email, password, fullName, mobileNo } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User already exists', 400));
    }

    // Sanitize display name
    const safeName = sanitizeString(fullName, 50);

    const newUser = await User.create({
      name: safeName,
      email,
      password,
      mobileNo: mobileNo || undefined,
      authProvider: 'local',
    });

    await Profile.create({
      user: newUser._id,
      displayName: safeName,
    });

    createSendToken(newUser, 201, req, res);
  } catch (err) {
    next(err);
  }
};


// ══════════════════════════════════════════════════════════════
// LOGIN — Validation handled by route middleware (loginSchema)
// ══════════════════════════════════════════════════════════════
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
// GOOGLE SIGN-IN — Validation handled by route middleware
// ══════════════════════════════════════════════════════════════
export const googleSignIn = async (req, res, next) => {
  try {
    const { credential } = req.body;

    // Verify the Google ID token
    const googleRes = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    const { sub: googleId, email, name, picture } = googleRes.data;

    if (!email) {
      return next(new AppError('Failed to get email from Google', 400));
    }

    // Sanitize Google-provided data
    const safeName = sanitizeString(name || email.split('@')[0], 50);

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // Link Google account if user exists with email but no googleId
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        await user.save({ validateBeforeSave: false });
      }

      // Update avatar if not set
      const profile = await Profile.findOne({ user: user._id });
      if (profile && !profile.avatarUrl && picture) {
        profile.avatarUrl = picture;
        await profile.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: safeName,
        email,
        googleId,
        authProvider: 'google',
      });

      await Profile.create({
        user: user._id,
        displayName: safeName,
        avatarUrl: picture || null,
      });
    }

    createSendToken(user, 200, req, res);
  } catch (err) {
    if (err?.response?.status === 400) {
      return next(new AppError('Invalid Google credential', 401));
    }
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════════════════════
export const logout = (req, res) => {
  res.cookie('jwt_refresh', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });

  res.status(200).json({ status: 'success' });
};

// ══════════════════════════════════════════════════════════════
// REFRESH TOKEN
// ══════════════════════════════════════════════════════════════
export const refreshToken = async (req, res, next) => {
  try {
    const rfToken = req.cookies.jwt_refresh;

    if (!rfToken || rfToken === 'loggedout') {
      return next(
        new AppError('Not logged in. Please login again.', 401)
      );
    }

    const decoded = jwt.verify(
      rfToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new AppError('User no longer exists.', 401)
      );
    }

    if (user.status === 'blocked') {
      return next(new AppError('Your account has been blocked.', 403));
    }

    const accessToken = signToken(user._id, 'access');

    res.status(200).json({
      status: 'success',
      token: accessToken,
    });
  } catch (err) {
    next(
      new AppError(
        'Invalid or expired refresh token. Please login again.',
        401
      )
    );
  }
};