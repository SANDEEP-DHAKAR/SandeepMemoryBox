const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const { uploadToCloudinary } = require('../controllers/uploadController');

router.post('/', protect, upload.single('file'), uploadToCloudinary);

module.exports = router;
