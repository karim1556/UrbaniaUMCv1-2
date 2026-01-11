const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phoneno: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied'],
        default: 'new'
    },
    readAt: {
        type: Date,
        default: null
    },
    repliedAt: {
        type: Date,
        default: null
    },
    reply: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

// Add method to mark message as read
contactSchema.methods.markAsRead = async function () {
    if (this.status === 'new') {
        this.status = 'read';
        this.readAt = new Date();
        return this.save();
    }
    return this;
};

// Add method to mark message as replied
contactSchema.methods.markAsReplied = async function (replyMessage) {
    this.status = 'replied';
    this.repliedAt = new Date();
    this.reply = replyMessage;
    return this.save();
};

const Contact = mongoose.model('Contact', contactSchema);
module.exports = Contact; 