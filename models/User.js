const mongoose = require('mongoose');
const { MemoryUser } = require('./memoryStore');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

const MongoUser = mongoose.model('User', userSchema);

// Proxy delegates to real MongoDB when connected, or in-memory store when offline
const UserProxy = new Proxy(MongoUser, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (prop in MemoryUser) {
      return MemoryUser[prop];
    }
    return target[prop];
  },
});

module.exports = UserProxy;
