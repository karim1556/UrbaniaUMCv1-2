const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['education', 'skill_development', 'professional', 'creative', 'other'],
        required: true
    },
    image: {
        public_id: String,
        url: String
    },
    capacity: {
        type: Number,
        required: true
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
    price: {
        type: Number,
        default: 0
    },
    prerequisites: [{
        type: String
    }],
    materials: [{
        type: String
    }],
    schedule: [{
        date: Date,
        topics: [{
            type: String
        }],
        duration: String
    }],
    objectives: [{
        type: String
    }],
    learningOutcomes: [{
        type: String
    }],
    certification: {
        type: Boolean,
        default: false
    },
    certificateDetails: {
        name: String,
        issuer: String,
        validity: String
    },
    registrationDeadline: {
        type: Date
    },
    tags: [{
        type: String
    }],
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    resources: [{
        title: String,
        type: {
            type: String,
            enum: ['document', 'video', 'link']
        },
        url: String,
        description: String
    }],
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringDetails: {
        frequency: {
            type: String,
            enum: ['weekly', 'monthly', 'quarterly']
        },
        endDate: Date,
        daysOfWeek: [{
            type: Number // 0-6 for Sunday-Saturday
        }]
    }
}, {
    timestamps: true
});

// Indexes for better query performance
workshopSchema.index({ startDate: 1, status: 1 });
workshopSchema.index({ category: 1 });
workshopSchema.index({ instructor: 1 });
workshopSchema.index({ tags: 1 });

// Virtual for checking if workshop is full
workshopSchema.virtual('isFull').get(function () {
    return this.registeredParticipants.length >= this.capacity;
});

// Virtual for checking if registration is open
workshopSchema.virtual('isRegistrationOpen').get(function () {
    if (!this.registrationDeadline) return true;
    return new Date() <= this.registrationDeadline;
});

// Virtual for calculating average rating
workshopSchema.virtual('averageRating').get(function () {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / this.reviews.length;
});

// Method to check if user can register
workshopSchema.methods.canRegister = function (userId) {
    return !this.isFull &&
        this.isRegistrationOpen &&
        !this.registeredParticipants.includes(userId);
};

// Method to add participant
workshopSchema.methods.addParticipant = async function (userId) {
    if (this.canRegister(userId)) {
        this.registeredParticipants.push(userId);
        await this.save();
        return true;
    }
    return false;
};

// Method to remove participant
workshopSchema.methods.removeParticipant = async function (userId) {
    const index = this.registeredParticipants.indexOf(userId);
    if (index > -1) {
        this.registeredParticipants.splice(index, 1);
        await this.save();
        return true;
    }
    return false;
};

// Method to add review
workshopSchema.methods.addReview = async function (userId, rating, comment) {
    const review = {
        user: userId,
        rating,
        comment,
        date: new Date()
    };
    this.reviews.push(review);
    await this.save();
    return review;
};

// Static method to get upcoming workshops
workshopSchema.statics.getUpcomingWorkshops = function () {
    return this.find({
        startDate: { $gte: new Date() },
        status: 'upcoming'
    }).sort({ startDate: 1 });
};

// Static method to get workshops by category
workshopSchema.statics.getWorkshopsByCategory = function (category) {
    return this.find({ category }).sort({ startDate: 1 });
};

// Static method to get workshops by instructor
workshopSchema.statics.getWorkshopsByInstructor = function (instructorId) {
    return this.find({ instructor: instructorId }).sort({ startDate: 1 });
};

const Workshop = mongoose.model('Workshop', workshopSchema);

module.exports = Workshop; 