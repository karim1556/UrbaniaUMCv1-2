const mongoose = require('mongoose');

const CourseRegistrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  level: { type: String, required: true },
  experience: { type: String },
  preferredSchedule: { type: String },
  specialRequests: { type: String },
  courseId: { type: String, required: true },
  courseTitle: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  date: { type: Date, default: Date.now }
}, {
  versionKey: false,
  timestamps: true
});

module.exports = mongoose.model('CourseRegistration', CourseRegistrationSchema); 