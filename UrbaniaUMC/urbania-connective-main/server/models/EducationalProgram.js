const mongoose = require('mongoose');

const educationalProgramSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['course', 'workshop'],
        required: true
    },
    duration: {
        value: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            enum: ['hours', 'days', 'weeks', 'months'],
            required: true
        }
    },
    schedule: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        sessions: [{
            date: Date,
            startTime: String,
            endTime: String,
            topic: String
        }]
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    enrolledStudents: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        enrolledAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'dropped'],
            default: 'active'
        }
    }],
    resources: [{
        title: String,
        description: String,
        fileUrl: String,
        type: {
            type: String,
            enum: ['document', 'video', 'link']
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    prerequisites: [{
        type: String,
        trim: true
    }],
    objectives: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    category: {
        type: String,
        required: true,
        enum: ['Education', 'Skills Development', 'Career Training', 'Personal Growth', 'Other']
    },
    location: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['online', 'offline', 'hybrid'],
        required: true
    },
    certificate: {
        available: {
            type: Boolean,
            default: true
        },
        requirements: [{
            type: String,
            trim: true
        }]
    }
}, {
    timestamps: true
});

const EducationalProgram = mongoose.model('EducationalProgram', educationalProgramSchema);

module.exports = EducationalProgram; 