const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    // Donor information - must be linked to a user account
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async function (v) {
                const User = mongoose.model('User');
                const user = await User.findById(v);
                return user != null;
            },
            message: 'Donor ID must match a valid user ID'
        }
    },
    firstName: {
        type: String,
        trim: true,
        required: function () {
            return !this.anonymous;
        }
    },
    lastName: {
        type: String,
        trim: true,
        required: function () {
            return !this.anonymous;
        }
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    city: {
        type: String,
        trim: true,
        default: ''
    },
    state: {
        type: String,
        trim: true,
        default: ''
    },
    zipCode: {
        type: String,
        trim: true,
        default: ''
    },

    // Donation details
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    currency: {
        type: String,
        default: 'INR'
    },
    program: {
        type: String,
        enum: [
            'general',
            'education',
            'community',
            'zakat',
            'sadka',
            'greenhouse_building',
            'greenhouse_maintenance',
            'platform_building',
            'interest_free_loans'
        ],
        default: 'general'
    },
    donationType: {
        type: String,
        enum: ['one-time', 'recurring'],
        default: 'one-time'
    },
    receiptRequired: {
        type: Boolean,
        default: true
    },
    receipt: {
        type: String,
        default: ''
    },

    // Payment information
    paymentMethod: {
        type: String,
        enum: ['card', 'upi', 'netbanking', 'cash', 'check', 'other', 'razorpay'],
        default: 'razorpay'
    },
    paymentDetails: {
        type: Object,
        default: {}
    },

    // Additional fields
    anonymous: {
        type: Boolean,
        default: false
    },
    message: {
        type: String,
        trim: true,
        default: ''
    },
    receiptUrl: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    taxDeductible: {
        type: Boolean,
        default: true
    },
    recurringDonation: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    category: {
        type: String,
        default: function () {
            return this.program;
        }
    },
    description: {
        type: String,
        default: function () {
            return `Donation for ${this.program} program`;
        }
    }
}, {
    versionKey: false,
    timestamps: true,
    _id: false // This allows us to set our own _id
});

// Add pre-save middleware to enforce consistency
donationSchema.pre('save', async function (next) {
    // Ensure both _id and donor are provided
    if (!this._id || !this.donor) {
        throw new Error('Both _id and donor fields are required');
    }

    // Validate that donor exists in User collection
    const User = mongoose.model('User');
    const user = await User.findById(this.donor);
    if (!user) {
        throw new Error('Donor ID must match a valid user ID');
    }

    // Set firstName and lastName to 'Anonymous'/'Donor' if donation is anonymous
    if (this.anonymous) {
        this.firstName = 'Anonymous';
        this.lastName = 'Donor';
    }

    // Set category same as program if not specified
    if (!this.category) {
        this.category = this.program;
    }

    // Set description if not provided
    if (!this.description) {
        this.description = `Donation for ${this.program} program`;
    }

    // Set recurringDonation based on donationType
    this.recurringDonation = this.donationType === 'recurring';

    // Generate receipt number if receipt is required and not already set
    if (this.receiptRequired && !this.receipt) {
        const timestamp = Date.now();
        this.receipt = `RCP-${String(timestamp).slice(-3).padStart(3, '0')}`;
    }

    next();
});

// Index for faster queries
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ program: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ category: 1 });

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation; 