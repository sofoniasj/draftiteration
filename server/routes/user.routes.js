// Rewrite/server/routes/user.routes.js
import express from 'express';

// Controllers
import {
  // Search
  searchUsers,

  // Public profile
  getUserProfileByUsername,

  // Follow system
  followUser,
  unfollowUser,
  getMyFollowers,
  getMyFollowing,
  getMyPendingFollowRequests,
  respondToFollowRequest,
  removeFollower,

  // Profile & account
  updateUserProfile,
  toggleAccountPrivacy,
  changeUsername,
  changePassword,
  deleteAccount,

  // Verification
  requestVerification,
  getVerificationRequests,
  approveVerification,

  // Saved articles
  saveArticleForUser,
  unsaveArticleForUser,
  getSavedArticlesForUser,
} from '../controllers/user.controller.js';

// Middleware
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

/* =========================================================
   SEARCH & PUBLIC PROFILE
========================================================= */

// User search (authenticated users only)
router.get('/search', protect, searchUsers);

// Public profile by username
// Controller handles privacy rules
router.get('/profile/:username', protect, getUserProfileByUsername);

/* =========================================================
   FOLLOW / UNFOLLOW (ACTING ON OTHERS)
========================================================= */

router.post('/:userIdToFollow/follow', protect, followUser);
router.post('/:userIdToUnfollow/unfollow', protect, unfollowUser);

/* =========================================================
   "ME" ROUTES (CURRENT AUTHENTICATED USER)
========================================================= */

// Followers / following
router.get('/me/followers', protect, getMyFollowers);
router.get('/me/following', protect, getMyFollowing);

// Pending follow requests
router.get('/me/pending-requests', protect, getMyPendingFollowRequests);
router.post(
  '/me/pending-requests/:requesterId/respond',
  protect,
  respondToFollowRequest
);

// Remove a follower
router.delete(
  '/me/followers/:followerIdToRemove',
  protect,
  removeFollower
);

// Profile & account settings
router.put('/me/profile', protect, updateUserProfile);
router.put('/me/privacy', protect, toggleAccountPrivacy);
router.put('/me/change-username', protect, changeUsername);
router.put('/me/change-password', protect, changePassword);

// Account deletion (soft delete)
router.delete('/me/account', protect, deleteAccount);

// Verification request
router.post('/me/request-verification', protect, requestVerification);

/* =========================================================
   SAVED ARTICLES (ME)
========================================================= */

router.post('/me/saved-articles', protect, saveArticleForUser);
router.get('/me/saved-articles', protect, getSavedArticlesForUser);
router.delete(
  '/me/saved-articles/:savedItemId',
  protect,
  unsaveArticleForUser
);

/* =========================================================
   ADMIN ROUTES (MUST BE LAST & PROTECTED)
========================================================= */

router.get(
  '/admin/verification-requests',
  protect,
  admin,
  getVerificationRequests
);

router.post(
  '/admin/verification-requests/:userId/approve',
  protect,
  admin,
  approveVerification
);

export default router;
