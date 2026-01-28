const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    mobile: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    birthdate: {
        type: Date
    },
    bio: {
        type: String,
        trim: true
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    preferences: {
        notifications: {
            emailNotifications: {
                type: Boolean,
                default: true
            },
            eventReminders: {
                type: Boolean,
                default: true
            },
            donationReceipts: {
                type: Boolean,
                default: true
            },
            newsletters: {
                type: Boolean,
                default: true
            },
            marketingEmails: {
                type: Boolean,
                default: false
            }
        },
        appearance: {
            theme: {
                type: String,
                enum: ['light', 'dark', 'system'],
                default: 'system'
            },
            fontSize: {
                type: String,
                enum: ['small', 'medium', 'large'],
                default: 'medium'
            },
            language: {
                type: String,
                enum: ['english', 'arabic', 'french'],
                default: 'english'
            }
        }
    },
    roles: {
        type: [String],
        enum: ['user', 'admin'],
        default: ['user']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    customId: {
        type: String,
        unique: true,
        required: true
    },
    buildingName: {
        type: String,
        required: false,
        trim: true
    },
    wing: {
        type: String,
        required: false,
        trim: true
    },
    flatNo: {
        type: String,
        required: false,
        trim: true
    },
    middleName: {
        type: String,
        trim: true
    },
    occupationProfile: {
        type: String,
        trim: true
    },
    workplaceAddress: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ['M', 'F'],
        required: false
    },
    forumContribution: {
        type: String,
        trim: true
    }
    ,
    residenceType: {
        type: String,
        enum: ['owner', 'tenant'],
        required: false
    }
    ,
    
}, {
    versionKey: false,
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 