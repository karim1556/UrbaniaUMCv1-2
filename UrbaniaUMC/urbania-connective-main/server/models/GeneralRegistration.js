const mongoose = require('mongoose');
const { Registration, baseRegistrationSchema } = require('./Registration');

// General Registration Schema - extends the base schema
const generalRegistrationSchema = new mongoose.Schema({
    // Membership Type
    membershipType: {
        type: String,
        enum: ['individual', 'family', 'senior', 'student', 'lifetime'],
        required: true
    },
    
    // Family Member Details (for family membership)
    familyMembers: [{
        firstName: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        relationship: {
            type: String,
            trim: true
        },
        age: {
            type: Number
        }
    }],
    
    // Emergency Contact
    emergencyContact: {
        name: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        relationship: {
            type: String,
            trim: true
        }
    },
    
    // Demographic Information (optional)
    demographicInfo: {
        gender: {
            type: String,
            enum: ['male', 'female', 'non-binary', 'prefer not to say']
        },
        age: {
            type: Number
        },
        ethnicity: {
            type: String,
            trim: true
        },
        preferredLanguage: {
            type: String,
            trim: true
        }
    },
    
    // Membership Duration
    membershipDuration: {
        type: String,
        enum: ['monthly', 'quarterly', 'annual', 'lifetime'],
        default: 'annual'
    },
    
    // Start and End Dates
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    
    // Payment Information
    paymentInfo: {
        amount: {
            type: Number
        },
        paymentMethod: {
            type: String,
            enum: ['credit_card', 'bank_transfer', 'cash', 'check', 'online_payment']
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: {
            type: String
        },
        paymentDate: {
            type: Date
        }
    },
    
    // Additional Fields
    referralSource: {
        type: String,
        trim: true
    },
    interests: [{
        type: String,
        trim: true
    }],
    volunteerPreferences: [{
        type: String,
        trim: true
    }]
});

// Set the discriminator key value
generalRegistrationSchema.set('discriminatorKey', 'registrationType');

// Create the model using base Registration as the parent
const GeneralRegistration = Registration.discriminator(
    'general', 
    generalRegistrationSchema
);

module.exports = GeneralRegistration; 