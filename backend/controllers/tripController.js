const Trip = require('../models/Trip');
const cloudinary = require('../config/cloudinary');

// Get all trips for logged in user
exports.getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    const { title, description, location, date, isPublic } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const trip = await Trip.create({
      userId: req.user._id,
      title,
      description: description || '',
      location: location || '',
      date: date ? new Date(date) : undefined,
      isPublic: isPublic !== undefined ? isPublic : true
    });
    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single trip by ID (Private)
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single trip by publicId (Public - no auth required)
exports.getPublicTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ publicId: req.params.publicId, isPublic: true });
    if (!trip) return res.status(404).json({ message: 'Trip not found or private' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Attach media to trip
exports.attachMedia = async (req, res) => {
  try {
    const { mediaItem } = req.body;
    if (!mediaItem || !mediaItem.url || !mediaItem.publicId) {
      return res.status(400).json({ message: 'Invalid media item' });
    }

    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $push: { media: mediaItem } },
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete single media item from trip (and destroy Cloudinary asset)
exports.deleteMediaItem = async (req, res) => {
  try {
    const { id, mediaId } = req.params;
    const trip = await Trip.findOne({ _id: id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const mediaItem = trip.media.id(mediaId);
    if (!mediaItem) return res.status(404).json({ message: 'Media item not found' });

    // Try destroying Cloudinary asset if publicId exists
    if (mediaItem.publicId) {
      try {
        await cloudinary.uploader.destroy(mediaItem.publicId, {
          resource_type: mediaItem.resourceType || 'image'
        });
      } catch (cloudErr) {
        console.error('Cloudinary deletion warning:', cloudErr.message);
      }
    }

    trip.media.pull(mediaId);
    await trip.save();

    res.json({ message: 'Media item deleted', trip });
  } catch (err) {
    console.error('deleteMediaItem error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Toggle public visibility
exports.togglePublic = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.isPublic = !trip.isPublic;
    await trip.save();
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete entire trip
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Clean up all Cloudinary assets in this trip
    if (trip.media && trip.media.length > 0) {
      for (const item of trip.media) {
        if (item.publicId) {
          try {
            await cloudinary.uploader.destroy(item.publicId, {
              resource_type: item.resourceType || 'image'
            });
          } catch (cloudErr) {
            console.error('Cloudinary destroy error during trip delete:', cloudErr.message);
          }
        }
      }
    }

    await Trip.deleteOne({ _id: req.params.id });
    res.json({ message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};