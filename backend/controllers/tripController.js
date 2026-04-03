const Trip = require('../models/Trip');
const crypto = require('crypto');

exports.createTrip = async (req, res) => {
    try {
        const { title, description, location, date, isPublic } = req.body;
        const publicId = crypto.randomBytes(8).toString('hex');

        const mediaUrls = req.files ? req.files.map(file => ({
            url: file.path,
            publicId: file.filename,
            resourceType: file.mimetype.startsWith('video') ? 'video' : 'image'
        })) : [];

        const newTrip = new Trip({
            user: req.user.id,
            title,
            description,
            location,
            date,
            isPublic: isPublic !== false && isPublic !== 'false',
            publicId,
            media: mediaUrls
        });

        const trip = await newTrip.save();
        res.status(201).json(trip);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id }).sort({ date: -1 });
        res.json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        
        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.json(trip);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPublicTrip = async (req, res) => {
    try {
        const trip = await Trip.findOne({ publicId: req.params.publicId });
        if (!trip) return res.status(404).json({ message: 'Trip not found' });
        if (!trip.isPublic) return res.status(403).json({ message: 'This trip is private' });
        res.json(trip);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await trip.deleteOne();
        res.json({ message: 'Trip deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addMediaToTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        if (trip.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const mediaUrls = req.files ? req.files.map(file => ({
            url: file.path,
            publicId: file.filename,
            resourceType: file.mimetype.startsWith('video') ? 'video' : 'image'
        })) : [];

        trip.media.push(...mediaUrls);
        await trip.save();
        res.json(trip);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
