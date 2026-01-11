const mongoose = require('mongoose');
const { Registration } = require('./Registration');

// Event Registration Schema - extends the base schema
const eventRegistrationSchema = new mongoose.Schema({
    // Event Details
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    eventName: {
        type: String,
        required: true,
        trim: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    
    // Additional Personal Information
    gender: {
        type: String,
        trim: true
    },
    buildingName: {
        type: String,
        trim: true
    },
    wing: {
        type: String,
        trim: true
    },
    flatNo: {
        type: String,
        trim: true
    },
    
    // Guest Information
    guests: [{
        name: {
            type: String,
            trim: true
        },
        age: {
            type: String,
            trim: true
        },
        // gender removed - we now collect guest names and ages
    }],
    
    
    // Total Attendees
    totalAttendees: {
        type: Number,
        default: 0
    },
    
    // Dietary Preferences/Restrictions
    dietaryRestrictions: {
        type: String,
        trim: true
    },
    
    // Accessibility Requirements
    accessibilityNeeds: {
        type: String,
        trim: true
    },
    
    // Payment Information
    ticketPrice: {
        type: Number,
        required: true,
        min: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentInfo: {
        method: {
            type: String,
            enum: ['credit_card', 'bank_transfer', 'cash', 'check', 'online_payment', 'free', 'razorpay'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: {
            type: String
        },
        paymentDate: {
            type: Date
        },
        // Razorpay specific fields
        razorpay_payment_id: {
            type: String
        },
        razorpay_order_id: {
            type: String
        },
        razorpay_signature: {
            type: String
        }
    },
    
    // Check-in Information
    checkedIn: {
        type: Boolean,
        default: false
    },
    checkInTime: {
        type: Date
    },
    
    // Promotional Code
    promoCode: {
        type: String,
        trim: true
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    
    // Communication Preferences
    sendReminders: {
        type: Boolean,
        default: true
    },
    remindersSent: [{
        type: {
            type: String,
            enum: ['email', 'sms', 'app']
        },
        sentAt: {
            type: Date
        },
        successful: {
            type: Boolean
        }
    }],
    
    // Additional Questions
    howDidYouHear: {
        type: String,
        trim: true
    },
    
    // For special events: seating preferences, etc.
    preferences: {
        seatingPreference: {
            type: String,
            trim: true
        },
        additionalServices: [{
            type: String,
            trim: true
        }]
    },
    
    // Cancellation Information
    cancellationStatus: {
        type: String,
        enum: ['active', 'cancelled', 'refunded'],
        default: 'active'
    },
    cancellationDate: {
        type: Date
    },
    cancellationReason: {
        type: String,
        trim: true
    },
    userCustomId: {
        type: String,
        trim: true
    }
});

// Set the discriminator key value
eventRegistrationSchema.set('discriminatorKey', 'registrationType');

// Create the model using base Registration as the parent
const EventRegistration = Registration.discriminator(
    'event', 
    eventRegistrationSchema
);

// Remove problematic unique index if it exists
const removeProblematicIndex = async () => {
    try {
        const collection = EventRegistration.collection;
        const indexes = await collection.indexes();
        
        // Find and drop the problematic index
        const problematicIndex = indexes.find(index => 
            index.key && 
            index.key.eventId === 1 && 
            index.key.userId === 1 && 
            index.unique === true
        );
        
        if (problematicIndex) {
            console.log('Removing problematic unique index on eventId and userId...');
            await collection.dropIndex(problematicIndex.name);
            console.log('Problematic index removed successfully');
        }
        
        // Also check for any index with event and user fields
        const eventUserIndex = indexes.find(index => 
            index.key && 
            index.key.event === 1 && 
            index.key.user === 1 && 
            index.unique === true
        );
        
        if (eventUserIndex) {
            console.log('Removing problematic unique index on event and user...');
            await collection.dropIndex(eventUserIndex.name);
            console.log('Event-user unique index removed successfully');
        }
        
    } catch (error) {
        console.log('No problematic indexes found or error removing them:', error.message);
    }
};

// Call the function when the model is first loaded
removeProblematicIndex();

module.exports = EventRegistration; 