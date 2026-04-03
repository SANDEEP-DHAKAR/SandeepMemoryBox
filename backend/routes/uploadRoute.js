const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../middleware/uploadMiddleware');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, (req, res, next) => {
    const uploadSingle = upload.single('file');
    uploadSingle(req, res, (err) => {
        if (err) {
            console.error("Multer error:", err);
            return res.status(400).json({ message: err.message || 'File upload error' });
        }
        next();
    });
}, (req, res) => {
    if (!req.file) {
        console.error("No file received in request");
        return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log(`Received file: ${req.file.originalname}, Size: ${req.file.size}`);

    const isVideo = req.file.mimetype.startsWith('video');

    const uploadStream = cloudinary.uploader.upload_stream(
        {
            folder: 'sandeepmemorybox',
            resource_type: isVideo ? 'video' : 'image'
        },
        (error, result) => {
            if (error) {
                console.error("Cloudinary upload error:", error);
                return res.status(500).json({ message: 'Error uploading to Cloudinary', error });
            }
            console.log(`Cloudinary upload successful: ${result.secure_url}`);
            res.json({
                url: result.secure_url,
                type: isVideo ? 'video' : 'image',
                publicId: result.public_id
            });
        }
    );

    uploadStream.end(req.file.buffer);
});

module.exports = router;
