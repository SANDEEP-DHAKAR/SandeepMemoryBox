const cloudinary = require('../config/cloudinary');
const Media = require('../models/Media');

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const albumId = req.body.albumId || null;
    const userId = req.user ? req.user._id : req.body.userId; // JWT middleware se req.user milega

    // Cloudinary Stream Upload
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sandeep_memorybox/user_${userId}`,
        resource_type: 'auto',
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error });
        }

        // MongoDB mein metadata save karo
        const newMedia = await Media.create({
          userId: userId,
          albumId: albumId,
          url: result.secure_url,
          cloudinaryPublicId: result.public_id,
          mediaType: result.resource_type,
          sizeBytes: result.bytes,
        });

        return res.status(201).json({
          success: true,
          message: 'Media uploaded and saved successfully',
          data: newMedia,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

module.exports = { uploadMedia };