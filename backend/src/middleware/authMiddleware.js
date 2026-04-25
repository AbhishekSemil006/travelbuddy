import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import { AppError } from '../utils/appError.js';
import { isValidObjectId } from '../utils/sanitize.js';

export const protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Validate token format before verification
    if (token.length < 20 || token.length > 1000) {
      return next(new AppError('Invalid token format.', 401));
    }

    // 3) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4) Validate decoded ID is a valid ObjectId
    if (!decoded.id || !isValidObjectId(decoded.id)) {
      return next(new AppError('Invalid token payload.', 401));
    }

    // 5) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    // 6) Check if user is blocked
    if (currentUser.status === 'blocked') {
      return next(new AppError('Your account has been blocked by an administrator.', 403));
    }

    // 7) Check if user changed password after the token was issued
    if (currentUser.passwordChangedAt) {
      const changedTimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10
      );
      if (decoded.iat < changedTimestamp) {
        return next(
          new AppError('User recently changed password! Please log in again.', 401)
        );
      }
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    next(err);
  }
};

// Middleware to restrict access based on roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'moderator']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
