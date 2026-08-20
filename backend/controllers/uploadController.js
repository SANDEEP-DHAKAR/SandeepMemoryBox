const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const isVideo = req.file.mimetype ? req.file.mimetype.startsWith('video') : false;

  const uploadStream = cloudinary.uploader.upload_stream(
    {
      folder: `sandeep_memorybox/${req.user._id}`,
      resource_type: isVideo ? 'video' : 'image',
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload failed:', error);
        return res.status(500).json({ message: 'Cloudinary Upload Failed', error });
      }
      return res.status(200).json({
        url: result.secure_url,
        publicId: result.public_id,
        type: isVideo ? 'video' : 'image',
      });
    }
  );

  uploadStream.end(req.file.buffer);
};

module.exports = { uploadToCloudinary };