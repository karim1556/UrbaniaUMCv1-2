const mongoose = require('mongoose');

const ServicePostSchema = new mongoose.Schema({
  serviceId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  phone: { type: String },
  images: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  meta: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('ServicePost', ServicePostSchema);
