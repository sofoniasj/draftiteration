import express from 'express';
import {
  login,
  signup,
  googleLogin,
  verifyEmail,
  resetPassword,
  getMe,
  updateUserProfile,
  updateUserPassword,
  deleteUser,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  getAllUsersForAdmin,
  toggleUserStatus
} from '../controllers/auth.controller.js';

import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// --------------------
// Public Routes
// --------------------
router.post('/login', login);
router.post('/signup', signup);
router.post('/google', googleLogin);

router.get('/verify-email/:token', verifyEmail);
router.put('/reset-password/:token', resetPassword);

// --------------------
// Protected User Routes
// --------------------
router
  .route('/me')
  .get(protect, getMe)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUser);

router.put('/update-password', protect, updateUserPassword);

// --------------------
// Followers / Following
// --------------------
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);
router.post('/follow/:userId', protect, followUser);
router.post('/unfollow/:userId', protect, unfollowUser);

// --------------------
// Admin Routes
// --------------------
router.get('/admin/users', protect, admin, getAllUsersForAdmin);
router.put('/admin/users/:userId/status', protect, admin, toggleUserStatus);

export default router;
