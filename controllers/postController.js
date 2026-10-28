const Post = require('../models/Post');

// POST /posts — Create a post or draft
const createPost = async (req, res) => {
  try {
    const { title, description, content, image, category, status } = req.body;

    if (!title || !description || !content) {
      return res.status(400).json({ message: 'Title, description, and content are required' });
    }

    const post = await Post.create({
      title,
      description,
      content,
      image: image || '',
      category: category || 'General',
      createdBy: req.user._id,
      status: ['draft', 'pending'].includes(status) ? status : 'draft',
    });

    return res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /posts — View all approved posts
const getAllApprovedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'approved' })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /posts/my-posts — View the logged-in user's posts and drafts
const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /posts/:id — View an approved post by ID
const getPostById = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, status: 'approved' }).populate(
      'createdBy',
      'name email'
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found or not approved' });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /posts/:id — Update the user's own post
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own posts' });
    }

    const { title, description, content, image, category, status } = req.body;
    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (content !== undefined) post.content = content;
    if (image !== undefined) post.image = image;
    if (category !== undefined) post.category = category;
    if (status !== undefined && ['draft', 'pending'].includes(status)) {
      post.status = status;
    }

    await post.save();
    return res.status(200).json({ message: 'Post updated successfully', post });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /posts/:id — Delete the user's own post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getAllApprovedPosts,
  getMyPosts,
  getPostById,
  updatePost,
  deletePost,
};
