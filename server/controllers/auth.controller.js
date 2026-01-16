import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.model.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import AppError from '../utils/AppError.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;
  
  if (await User.findOne({ $or: [{ email }, { username }] })) {
    return next(new AppError('User already exists', 400));
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const user = await User.create({
    username, email, password,
    verificationToken,
    verificationExpires: Date.now() + 24 * 60 * 60 * 1000
  });

  const url = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify your Rewrite Account',
      html: `<h1>Welcome!</h1><p>Please verify your email by clicking <a href="${url}">here</a>.</p>`
    });
    res.status(201).json({ message: 'Verification email sent!' });
  } catch (err) {
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Email could not be sent. Try again later.', 500));
  }
});

export const verifyEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    verificationToken: req.params.token,
    verificationExpires: { $gt: Date.now() }
  });

  if (!user) return next(new AppError('Token is invalid or expired', 400));

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save();

  res.status(200).json({ message: 'Email verified successfully!' });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }
  if (!user.isVerified) return next(new AppError('Please verify your email first', 401));

  res.json({
    token: generateToken(user._id, user.role),
    user: { id: user._id, username: user.username, email: user.email }
  });
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const { email, name, picture, sub } = ticket.getPayload();

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      username: name.replace(/\s+/g, '').toLowerCase() + sub.slice(-4),
      email,
      googleId: sub,
      authProvider: 'google',
      isVerified: true,
      profilePicture: picture
    });
  }

  res.json({
    token: generateToken(user._id, user.role),
    user: { id: user._id, username: user.username, profilePicture: user.profilePicture }
  });
});