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
    familyCount: {
        type: Number
    },
    maleAbove18: {
        type: Number
    },
    maleAbove60: {
        type: Number
    },
    maleUnder18: {
        type: Number
    },
    femaleAbove18: {
        type: Number
    },
    femaleAbove60: {
        type: Number
    },
    femaleUnder18: {
        type: Number
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
    familyMembers: [{
        name: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        age: { type: Number },
        category: { type: String, trim: true } // e.g., 'male_18_60', 'female_under_18', etc.
    }]
    ,
    familyOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    familyCode: {
        type: String,
        trim: true,
        required: false,
        index: true
    }
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