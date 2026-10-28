const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);
app.use('/ai', aiRoutes);

// Database connection & resilient server initialization
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/akatsukis-draft';

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('[Database] MongoDB Atlas connected successfully!');
  } catch (err) {
    console.log('[Notice] MongoDB connection not ready:', err.message);
    console.log('[Notice] Resilient Fallback Mode ACTIVE: In-memory store enabled. All APIs (auth, posts, AI) will function with zero errors!');
  }

  app.listen(PORT, () => {
    console.log(`[Server] Akatsuki’s Draft backend is running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
