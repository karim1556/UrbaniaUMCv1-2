const mongoose = require('mongoose');

// Base schema with common fields for all registration types
const baseRegistrationSchema = {
    // Personal Information
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    zipCode: {
        type: String,
        trim: true
    },
    
    // Registration metadata
    registrationType: {
        type: String,
        enum: ['general', 'program', 'event', 'service', 'volunteer'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
        default: 'pending'
    },
    notes: {
        type: String,
        trim: true
    },
    specialRequests: {
        type: String,
        trim: true
    },
    
    // Relationship to user (if logged in)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Timestamps
    statusHistory: [{
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        note: String
    }]
};

// Create the schema with timestamps
const registrationSchema = new mongoose.Schema(baseRegistrationSchema, { 
    timestamps: true,
    discriminatorKey: 'registrationType'
});

// Add pre-save hook to track status changes
registrationSchema.pre('save', function(next) {
    // If this is a new document or the status has changed
    if (this.isNew || this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            note: `Status changed to ${this.status}`
        });
    }
    next();
});

// Indexes for performance
registrationSchema.index({ email: 1 });
registrationSchema.index({ status: 1 });
registrationSchema.index({ registrationType: 1 });
registrationSchema.index({ createdAt: -1 });

// Create the model
const Registration = mongoose.model('Registration', registrationSchema);

module.exports = {
    Registration,
    baseRegistrationSchema
}; 