const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const mediaItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  resourceType: { type: String, enum: ['image', 'video'], default: 'image' },
  publicId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const tripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  date: { type: Date },
  isPublic: { type: Boolean, default: true },
  publicId: { type: String, default: () => nanoid(10), unique: true },
  media: [mediaItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);