import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { Profile } from '../models/profileModel.js';
import { AppError } from '../utils/appError.js';

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
    secure:
      req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict',
  };

  res.cookie('jwt_refresh', refreshToken, cookieOptions);

  // ✅ Get profile (IMPORTANT FIX)
  const profile = await Profile.findOne({ user: user._id });

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: accessToken,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        fullName: profile?.displayName || 'User',
        role: user.role || 'user',
      },
    },
  });
};
// =======================
// ✅ REGISTER
// =======================
export const register = async (req, res, next) => {
  try {
    console.log('BODY:', req.body);

    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return next(new AppError('All fields are required', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User already exists', 400));
    }

    const newUser = await User.create({
      name: fullName,
      email,
      password,
      isVerified: true,
    });

    await Profile.create({
      user: newUser._id,
      displayName: fullName || 'User',
    });

    createSendToken(newUser, 201, req, res);
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    next(err);
  }
};

// =======================
// ✅ LOGIN
// =======================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new AppError('Please provide email and password!', 400)
      );
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    createSendToken(user, 200, req, res);
  } catch (err) {
    next(err);
  }

  console.log('BODY:', req.body);
};

// =======================
// ✅ LOGOUT
// =======================
export const logout = (req, res) => {
  res.cookie('jwt_refresh', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ status: 'success' });
};

// =======================
// ✅ REFRESH TOKEN
// =======================
export const refreshToken = async (req, res, next) => {
  try {
    const rfToken = req.cookies.jwt_refresh;

    if (!rfToken) {
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