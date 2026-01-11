const mongoose = require('mongoose');
const { Registration } = require('./Registration');

// Volunteer Registration Schema - extends the base schema
const volunteerRegistrationSchema = new mongoose.Schema({
    // Volunteer Type
    volunteerType: {
        type: String,
        enum: ['regular', 'one_time', 'event_specific', 'professional', 'youth', 'senior'],
        required: true
    },
    
    // Availability
    availability: {
        weekdays: {
            type: Boolean,
            default: false
        },
        weekends: {
            type: Boolean,
            default: false
        },
        timePreference: [{
            type: String,
            enum: ['morning', 'afternoon', 'evening']
        }],
        specificDays: [{
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }],
        hoursPerWeek: {
            type: Number
        }
    },
    
    // Skills and Interests
    skills: [{
        type: String,
        trim: true
    }],
    interests: [{
        type: String,
        trim: true
    }],
    
    // Areas of Interest for Volunteering
    areasOfInterest: [{
        type: String,
        enum: [
            'education', 'events', 'administrative', 'youth_programs', 
            'senior_services', 'fundraising', 'marketing', 'community_outreach', 
            'food_services', 'facilities', 'professional_services', 'other'
        ]
    }],
    
    // Experience
    previousExperience: {
        type: String,
        trim: true
    },
    yearsOfExperience: {
        type: Number
    },
    
    // Background Check Information
    backgroundCheck: {
        required: {
            type: Boolean,
            default: false
        },
        completed: {
            type: Boolean,
            default: false
        },
        clearanceDate: {
            type: Date
        },
        expirationDate: {
            type: Date
        }
    },
    
    // Emergency Contact
    emergencyContact: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        relationship: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        }
    },
    
    // References
    references: [{
        name: {
            type: String,
            trim: true
        },
        relationship: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true
        }
    }],
    
    // Orientation and Training
    orientation: {
        required: {
            type: Boolean,
            default: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date
        }
    },
    trainings: [{
        title: {
            type: String,
            trim: true
        },
        required: {
            type: Boolean,
            default: false
        },
        completed: {
            type: Boolean,
            default: false
        },
        completionDate: {
            type: Date
        }
    }],
    
    // Assignment Information
    assignments: [{
        program: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            trim: true
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            default: 'active'
        },
        supervisor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    
    // Agreement and Waivers
    agreementSigned: {
        type: Boolean,
        default: false
    },
    agreementDate: {
        type: Date
    },
    
    // Volunteer Status
    status: {
        type: String,
        enum: ['pending', 'active', 'inactive', 'former'],
        default: 'pending'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    
    // Recognition
    recognition: [{
        type: {
            type: String,
            enum: ['certificate', 'award', 'milestone', 'other']
        },
        name: {
            type: String,
            trim: true
        },
        date: {
            type: Date
        },
        description: {
            type: String,
            trim: true
        }
    }]
});

// Set the discriminator key value
volunteerRegistrationSchema.set('discriminatorKey', 'registrationType');

// Create the model using base Registration as the parent
const VolunteerRegistration = Registration.discriminator(
    'volunteer', 
    volunteerRegistrationSchema
);

module.exports = VolunteerRegistration; 