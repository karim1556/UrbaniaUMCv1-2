const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    fullDescription: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        }
    },
    location: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['community', 'education', 'charity'],
        required: true
    },
    images: [{
        type: String,
        required: true
    }],
    featured: {
        type: Boolean,
        default: false
    },
    pricing: {
        type: {
            type: String,
            enum: ['free', 'paid'],
            required: true
        },
        amount: {
            type: Number,
            default: 0
        },
        details: {
            type: String,
        }
    },
    registration: {
        required: {
            type: Boolean,
            default: false
        },
        deadline: {
            type: String
        },
        capacity: {
            type: Number,
            required: true
        }
    },
    registeredParticipants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizerName: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    materials: [{
        type: String
    }],
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringDetails: {
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'yearly']
        },
        endDate: Date,
        daysOfWeek: [{
            type: Number // 0-6 for Sunday-Saturday
        }]
    },
    price: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String
    }],
    highlights: [{
        type: String
    }],
    additionalDetails: [{
        type: String
    }],
    attendees: {
        type: Number,
        default: 0
    },
    testimonials: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String
    }
}, {
    versionKey: false,
    timestamps: true
});

// Indexes for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ featured: 1 });

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function () {
    return this.registeredParticipants?.length >= this.registration.capacity;
});

// Virtual for checking if registration is open
eventSchema.virtual('isRegistrationOpen').get(function () {
    if (!this.registration.deadline) return true;
    return new Date() <= new Date(this.registration.deadline);
});

// Method to check if user can register
eventSchema.methods.canRegister = function (userId) {
    return !this.isFull &&
        this.isRegistrationOpen &&
        !this.registeredParticipants.includes(userId);
};

// Method to add participant
eventSchema.methods.addParticipant = async function (userId) {
    if (this.canRegister(userId)) {
        this.registeredParticipants.push(userId);
        await this.save();
        return true;
    }
    return false;
};

// Method to remove participant
eventSchema.methods.removeParticipant = async function (userId) {
    const index = this.registeredParticipants.indexOf(userId);
    if (index > -1) {
        this.registeredParticipants.splice(index, 1);
        await this.save();
        return true;
    }
    return false;
};

// Static method to get featured events
eventSchema.statics.getFeaturedEvents = function () {
    return this.find({ featured: true }).sort({ date: 1 });
};

// Static method to get events by category
eventSchema.statics.getEventsByCategory = function (category) {
    return this.find({ category }).sort({ date: 1 });
};

// Static method to get upcoming events
eventSchema.statics.getUpcomingEvents = function () {
    return this.find().sort({ date: 1 });
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event; 