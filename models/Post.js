const mongoose = require('mongoose');
const { MemoryPost } = require('./memoryStore');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  category: { type: String, default: 'General' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
});

const MongoPost = mongoose.model('Post', postSchema);

// Proxy delegates to real MongoDB when connected, or in-memory store when offline
const PostProxy = new Proxy(MongoPost, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in MemoryPost) {
      return MemoryPost[prop];
    }
    return target[prop];
  },
});

module.exports = PostProxy;
