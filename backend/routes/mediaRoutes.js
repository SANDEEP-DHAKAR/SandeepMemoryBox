const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { uploadMedia } = require('../controllers/mediaController');
// const authMiddleware = require('../middleware/authMiddleware'); // JWT verification

// router.post('/upload', authMiddleware, upload.single('file'), uploadMedia);
router.post('/upload', upload.single('file'), uploadMedia);

module.exports = router;