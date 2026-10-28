const Post = require('../models/Post');

// GET /admin/posts/pending — View posts awaiting approval
const getPendingPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'pending' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /admin/posts/approve/:id — Approve a post
const approvePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.status = 'approved';
    await post.save();

    return res.status(200).json({ message: 'Post approved successfully', post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /admin/posts/reject/:id — Reject a post
const rejectPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.status = 'rejected';
    await post.save();

    return res.status(200).json({ message: 'Post rejected', post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getPendingPosts, approvePost, rejectPost };
