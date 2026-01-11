const mongoose = require('mongoose');
const { Registration } = require('./Registration');

// Service Request Schema - extends the base schema
const serviceRequestSchema = new mongoose.Schema({
    // Service Type
    serviceType: {
        type: String,
        enum: ['counseling', 'legal_aid', 'food_assistance', 'housing_support', 'healthcare', 'education', 'financial_assistance', 'employment', 'childcare', 'senior_services', 'other'],
        required: true
    },
    
    // Request Details
    requestTitle: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'emergency'],
        default: 'medium'
    },
    
    // Service Scheduling
    preferredDate: {
        type: Date
    },
    preferredTime: {
        type: String,
        enum: ['morning', 'afternoon', 'evening'],
    },
    recurring: {
        type: Boolean,
        default: false
    },
    recurringFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
    },
    
    // For Household Requests
    householdMembers: [{
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
    
    // Income and Eligibility (for resource-based services)
    incomeVerification: {
        incomeLevel: {
            type: String,
            enum: ['below_25k', '25k_50k', '50k_75k', '75k_100k', 'above_100k']
        },
        documentProvided: {
            type: Boolean,
            default: false
        },
        verificationDate: {
            type: Date
        }
    },
    
    // Referral Information
    referredBy: {
        type: String,
        trim: true
    },
    referredTo: {
        type: String,
        trim: true
    },
    
    // Assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignmentDate: {
        type: Date
    },
    
    // Service Delivery
    serviceDelivery: [{
        date: {
            type: Date
        },
        provider: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        },
        outcome: {
            type: String,
            enum: ['completed', 'partial', 'rescheduled', 'cancelled', 'no_show'],
        }
    }],
    
    // Supporting Documents
    supportingDocuments: [{
        docType: {
            type: String,
            trim: true
        },
        name: {
            type: String,
            trim: true
        },
        fileUrl: {
            type: String,
            trim: true
        },
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Follow-up Information
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    },
    followUpNotes: [{
        date: {
            type: Date,
            default: Date.now
        },
        note: {
            type: String,
            trim: true
        },
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Service Completion
    completionStatus: {
        type: String,
        enum: ['pending', 'in_progress', 'completed', 'cancelled', 'referred'],
        default: 'pending'
    },
    completionDate: {
        type: Date
    },
    completionNotes: {
        type: String,
        trim: true
    }
});

// Set the discriminator key value
serviceRequestSchema.set('discriminatorKey', 'registrationType');

// Create the model using base Registration as the parent
const ServiceRequest = Registration.discriminator(
    'service', 
    serviceRequestSchema
);

module.exports = ServiceRequest; 