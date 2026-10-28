const express = require('express');
const router = express.Router();
const { improvePostContent, processDocument } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/improve/:postId', protect, improvePostContent);
router.post('/process-document', protect, upload.single('document'), processDocument);

module.exports = router;
