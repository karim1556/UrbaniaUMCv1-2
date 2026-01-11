const mongoose = require('mongoose');
const { Registration } = require('./Registration');

// Program Registration Schema - extends the base schema
const programRegistrationSchema = new mongoose.Schema({
    // Program Details
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    programName: {
        type: String,
        required: true,
        trim: true
    },
    
    // Session Preferences
    sessionPreference: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'weekend'],
        required: true
    },
    
    // Participant Details
    participantAge: {
        type: Number
    },
    participantGender: {
        type: String,
        enum: ['male', 'female', 'non-binary', 'prefer not to say']
    },
    
    // For Group Registrations
    numberOfParticipants: {
        type: Number,
        default: 1,
        min: 1
    },
    additionalParticipants: [{
        firstName: {
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        age: {
            type: Number
        },
        relationship: {
            type: String,
            trim: true
        }
    }],
    
    // Emergency Contact
    emergencyContact: {
        name: {
            type: String,
            trim: true,
            required: true
        },
        phone: {
            type: String,
            trim: true,
            required: true
        },
        relationship: {
            type: String,
            trim: true
        }
    },
    
    // Medical Information
    medicalInformation: {
        allergies: {
            type: String,
            trim: true
        },
        medicalConditions: {
            type: String,
            trim: true
        },
        medications: {
            type: String,
            trim: true
        },
        specialNeeds: {
            type: String,
            trim: true
        }
    },
    
    // Program-specific Requirements
    prerequisites: [{
        name: {
            type: String,
            trim: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    
    // Agreement and Waivers
    agreementSignature: {
        type: String,
        trim: true
    },
    agreementDate: {
        type: Date
    },
    
    // Payment Information
    fee: {
        type: Number,
        default: 0
    },
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
    
    // Scholarship/Financial Aid
    scholarshipRequested: {
        type: Boolean,
        default: false
    },
    scholarshipDetails: {
        type: String,
        trim: true
    },
    
    // Attendance Tracking
    attendanceDates: [{
        date: {
            type: Date
        },
        attended: {
            type: Boolean,
            default: false
        },
        notes: {
            type: String,
            trim: true
        }
    }],
    
    // Completion Information
    completed: {
        type: Boolean,
        default: false
    },
    completionDate: {
        type: Date
    },
    certificateIssued: {
        type: Boolean,
        default: false
    },
    certificateDetails: {
        issueDate: {
            type: Date
        },
        certificateNumber: {
            type: String,
            trim: true
        }
    }
});

// Set the discriminator key value
programRegistrationSchema.set('discriminatorKey', 'registrationType');

// Create the model using base Registration as the parent
const ProgramRegistration = Registration.discriminator(
    'program', 
    programRegistrationSchema
);

module.exports = ProgramRegistration; 