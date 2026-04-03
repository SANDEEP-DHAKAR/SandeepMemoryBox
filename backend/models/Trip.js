const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    date: {
        type: Date
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    media: [{
        url: String,
        publicId: String,
        resourceType: String // 'image' or 'video'
    }],
    publicId: {
        type: String,
        unique: true,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Trip', TripSchema);
