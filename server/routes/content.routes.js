// Rewrite/server/routes/content.routes.js
import express from 'express';

// Controllers
import {
  // General / filtering
  getFilteredContent,

  // Sitemap
  getSitemap,

  // Feed controllers
  getMyPageFeed,
  getExploreFeed,

  // Single content & lineage
  getContentById,
  getContentLineage,
  getContentVersions,

  // User-specific content
  getArticlesByUser,

  // Content actions
  createContent,
  updateContent,
  toggleLikeContent,
  reportContent,
  unreportContent,
  toggleArticlePrivacy,

  // Admin actions
  getAllContentForAdmin,
  deleteContentForAdmin,
} from '../controllers/content.controller.js';

// Middleware
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

/* =========================================================
   PUBLIC & STATIC ROUTES
========================================================= */

// Sitemap (must be before dynamic routes)
router.get('/sitemap.xml', getSitemap);

/* =========================================================
   FEED ROUTES (PROTECTED)
========================================================= */

router.get('/feed/my-page', protect, getMyPageFeed);
router.get('/feed/explore', protect, getExploreFeed);

/* =========================================================
   ADMIN ROUTES (MUST COME BEFORE :id)
========================================================= */

router.get('/admin/all', protect, admin, getAllContentForAdmin);
router.delete('/admin/:id', protect, admin, deleteContentForAdmin);

/* =========================================================
   GENERAL CONTENT FETCHING
========================================================= */

// Handles:
// - recent articles
// - popular (?feedType=popular)
// - children (?parentContent=id)
// - title lists (?view=titles)
router.get('/', getFilteredContent);

// User profile articles (privacy aware)
router.get('/user/:userId', protect, getArticlesByUser);

/* =========================================================
   CONTENT CREATION & MUTATION (PROTECTED)
========================================================= */

// Create article or reply
router.post('/', protect, createContent);

// Edit content
router.put('/:id', protect, updateContent);

// Toggle article privacy (public / followers-only)
router.put('/:articleId/privacy', protect, toggleArticlePrivacy);

// Like / unlike
router.post('/:id/like', protect, toggleLikeContent);

// Report / unreport
router.post('/:id/report', protect, reportContent);
router.delete('/:id/report', protect, unreportContent);

/* =========================================================
   DYNAMIC CONTENT ROUTES (MUST BE LAST)
========================================================= */

// Lineage & versions must come before :id
router.get('/:id/lineage', getContentLineage);
router.get('/:id/versions', getContentVersions);

// Single content item
router.get('/:id', getContentById);

export default router;
