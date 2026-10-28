const multer = require('multer');

// Store uploaded files in memory as buffers for Gemini API
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

module.exports = upload;
