const express = require('express');
const router = express.Router();
const {
  createPost,
  getAllApprovedPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPost);
router.get('/', getAllApprovedPosts);
router.get('/my-posts', protect, getMyPosts);
router.get('/:id', getPostById);
router.patch('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

module.exports = router;
