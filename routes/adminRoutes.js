const express = require('express');
const router = express.Router();
const {
  getPendingPosts,
  approvePost,
  rejectPost,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// View posts awaiting approval
router.get('/posts/pending', getPendingPosts);

// Approve a post
router.patch('/posts/approve/:id', approvePost);

// Reject a post
router.patch('/posts/reject/:id', rejectPost);

module.exports = router;

