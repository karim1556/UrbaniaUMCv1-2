const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Make user field optional for public submissions
        required: false
    },
    volunteerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // This will be the same as user._id for authenticated users
        // Removed unique constraint to allow multiple applications
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        // Note: Email is NOT unique to allow multiple applications from the same email
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    // Store the specific role the volunteer applied for
    role: {
        type: String,
        required: true,
        // Allow any role id from the frontend
        enum: ['education', 'events', 'food', 'outreach', 'administrative', 'youth', 'other'],
        default: 'other'
    },
    experience: {
        type: String,
        required: false, // Make experience optional
        default: "No experience provided"
    },
    availability: {
        type: String,
        required: true,
        // Expand the availability options
        enum: ['weekdays', 'weekends', 'evenings', 'flexible', 'mornings', 'afternoons', 'other'],
        default: 'flexible'
    },
    motivation: {
        type: String,
        required: false,
        default: "Applied through public form"
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    applicationDate: {
        type: Date,
        default: Date.now
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String
}, {
    versionKey: false,
    timestamps: true
});

// Removed all unique indexes to allow duplicate entries
// No indexes defined - allowing complete duplicate applications

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

module.exports = Volunteer; 