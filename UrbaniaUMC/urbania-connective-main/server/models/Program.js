const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
    // Basic Program Information
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['education', 'community', 'religious', 'youth', 'seniors', 'health', 'arts', 'sports', 'professional', 'other'],
        required: true
    },
    
    // Program Type and Duration
    programType: {
        type: String,
        enum: ['course', 'workshop', 'seminar', 'ongoing', 'outreach', 'support_group', 'service'],
        required: true
    },
    duration: {
        length: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: ['hours', 'days', 'weeks', 'months'],
            required: true
        }
    },
    
    // Schedule Information
    schedule: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date
        },
        days: [{
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }],
        time: {
            start: String,
            end: String
        },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'biweekly', 'monthly', 'custom']
        },
        isRecurring: {
            type: Boolean,
            default: false
        }
    },
    
    // Location Information
    location: {
        name: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        room: {
            type: String,
            trim: true
        },
        isOnline: {
            type: Boolean,
            default: false
        },
        onlineLink: {
            type: String,
            trim: true
        }
    },
    
    // Enrollment Information
    enrollment: {
        capacity: {
            type: Number,
            required: true
        },
        currentEnrollment: {
            type: Number,
            default: 0
        },
        waitlistEnabled: {
            type: Boolean,
            default: false
        },
        waitlistSize: {
            type: Number,
            default: 0
        },
        enrollmentDeadline: {
            type: Date
        },
        minimumAge: {
            type: Number
        },
        maximumAge: {
            type: Number
        },
        registrationFee: {
            type: Number,
            default: 0
        },
        scholarshipAvailable: {
            type: Boolean,
            default: false
        }
    },
    
    // Program Content
    curriculum: [{
        title: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        order: {
            type: Number
        }
    }],
    
    // Staff Information
    instructors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    coordinators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // Additional Information
    prerequisites: [{
        type: String,
        trim: true
    }],
    materials: [{
        type: String,
        trim: true
    }],
    targetAudience: {
        type: String,
        trim: true
    },
    learningOutcomes: [{
        type: String,
        trim: true
    }],
    
    // Media
    image: {
        url: {
            type: String,
            trim: true
        },
        alt: {
            type: String,
            trim: true
        }
    },
    
    // Status
    status: {
        type: String,
        enum: ['draft', 'open', 'in_progress', 'completed', 'cancelled'],
        default: 'draft'
    },
    
    // Tags for filtering
    tags: [{
        type: String,
        trim: true
    }],
    
    // Certificate information
    certification: {
        provided: {
            type: Boolean,
            default: false
        },
        name: {
            type: String,
            trim: true
        },
        requirements: {
            type: String,
            trim: true
        }
    }
}, {
    timestamps: true
});

// Virtual for checking if registration is open
programSchema.virtual('isRegistrationOpen').get(function() {
    if (!this.enrollment.enrollmentDeadline) return true;
    return new Date() <= this.enrollment.enrollmentDeadline;
});

// Virtual for checking if program is full
programSchema.virtual('isFull').get(function() {
    return this.enrollment.currentEnrollment >= this.enrollment.capacity;
});

// Virtual for percentage full
programSchema.virtual('percentageFull').get(function() {
    if (this.enrollment.capacity === 0) return 100;
    return Math.round((this.enrollment.currentEnrollment / this.enrollment.capacity) * 100);
});

// Virtual for remaining spots
programSchema.virtual('spotsRemaining').get(function() {
    return Math.max(0, this.enrollment.capacity - this.enrollment.currentEnrollment);
});

// Method to register a participant
programSchema.methods.registerParticipant = async function() {
    if (this.isFull) return false;
    this.enrollment.currentEnrollment += 1;
    await this.save();
    return true;
};

// Static method to get active programs
programSchema.statics.getActivePrograms = function() {
    return this.find({
        status: { $in: ['open', 'in_progress'] },
        'schedule.startDate': { $lte: new Date() }
    }).sort('schedule.startDate');
};

// Static method to get upcoming programs
programSchema.statics.getUpcomingPrograms = function() {
    return this.find({
        status: 'open',
        'schedule.startDate': { $gt: new Date() }
    }).sort('schedule.startDate');
};

// Static method to get programs by category
programSchema.statics.getProgramsByCategory = function(category) {
    return this.find({
        category,
        status: { $in: ['open', 'in_progress'] }
    }).sort('schedule.startDate');
};

// Create indexes for performance
programSchema.index({ category: 1 });
programSchema.index({ status: 1 });
programSchema.index({ 'schedule.startDate': 1 });
programSchema.index({ tags: 1 });

const Program = mongoose.model('Program', programSchema);

module.exports = Program; 