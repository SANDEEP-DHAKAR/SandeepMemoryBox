const express = require('express');
const router = express.Router();
const { createTrip, getTrips, getTripById, deleteTrip, addMediaToTrip, getPublicTrip } = require('../controllers/tripController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, createTrip);
router.get('/', auth, getTrips);
router.get('/:id', auth, getTripById);
router.delete('/:id', auth, deleteTrip);
router.post('/:id/media', auth, addMediaToTrip);

// Public route should be handled before specific id routes if they conflict, but here we use /p/ for public
router.get('/p/:publicId', getPublicTrip);

module.exports = router;
