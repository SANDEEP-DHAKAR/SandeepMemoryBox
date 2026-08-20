const express = require('express');
const router = express.Router();
const {
  getUserTrips,
  createTrip,
  getTripById,
  getPublicTrip,
  attachMedia,
  deleteMediaItem,
  togglePublic,
  deleteTrip
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

// Public route must be before /:id route
router.get('/p/:publicId', getPublicTrip);

// Private routes
router.get('/', protect, getUserTrips);
router.post('/', protect, createTrip);
router.get('/:id', protect, getTripById);
router.delete('/:id', protect, deleteTrip);
router.post('/:id/media', protect, attachMedia);
router.delete('/:id/media/:mediaId', protect, deleteMediaItem);
router.patch('/:id/toggle-public', protect, togglePublic);

module.exports = router;
