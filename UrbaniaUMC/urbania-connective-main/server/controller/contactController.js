require('dotenv').config();
const { sendMailContact } = require("../config/mail")
const Contact = require('../models/Contact');
const ServiceRequest = require('../models/ServiceRequest');


// Handle contact form submission

const submitContactForm = async (req, res) => {
    try {
        const { name, phoneno, email, subject, message } = req.body;
        console.log("hii")
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create new contact entry
        const newContact = new Contact({
            name,
            email,
            phoneno,
            subject,
            message,
            status: 'new' // Set initial status
        });

        // Save contact to database
        await newContact.save();

        // If the contact appears to be a service request, also create a ServiceRequest
        // Heuristic: subject contains 'service request' (case-insensitive) or starts with 'Service Request:'
        const subLower = (subject || '').toLowerCase();
        if (subLower.includes('service request') || subLower.startsWith('service request:')) {
            try {
                const nameParts = (name || '').trim().split(/\s+/);
                const firstName = nameParts[0] || 'Anonymous';
                const lastName = nameParts.slice(1).join(' ') || 'User';

                // Try to parse a serviceType from the subject after ':' or use 'other'
                let parsedType = 'other';
                const colonIndex = subject.indexOf(':');
                if (colonIndex !== -1) {
                    const maybe = subject.slice(colonIndex + 1).trim().toLowerCase();
                    // map some common labels to enums used by ServiceRequest
                    if (maybe.includes('education')) parsedType = 'education';
                    else if (maybe.includes('food')) parsedType = 'food_assistance';
                    else if (maybe.includes('housing')) parsedType = 'housing_support';
                    else if (maybe.includes('health')) parsedType = 'healthcare';
                    else if (maybe.includes('legal')) parsedType = 'legal_aid';
                    else if (maybe.includes('employment') || maybe.includes('job')) parsedType = 'employment';
                    else if (maybe.includes('child')) parsedType = 'childcare';
                    else if (maybe.includes('senior')) parsedType = 'senior_services';
                    else parsedType = 'other';
                }

                const serviceRequestData = {
                    firstName,
                    lastName,
                    email,
                    phone: phoneno || undefined,
                    serviceType: parsedType,
                    requestTitle: subject || 'Service request from contact form',
                    description: message || '',
                    registrationType: 'service'
                };

                const sr = new ServiceRequest(serviceRequestData);
                await sr.save();
                console.log('Created ServiceRequest from contact form:', sr._id.toString());
            } catch (err) {
                console.error('Error creating ServiceRequest from contact form:', err);
            }
        }

        // Log SMTP configuration (remove in production)
        console.log('SMTP Config:', {
            user: process.env.SMTP_USER,
            from: process.env.SMTP_FROM
        });

        res.status(200).json({ message: 'Message sent successfully' });
        // Send email to admin and User
        await sendMailContact(email, name, phoneno, subject, message);

    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({
            message: 'Error sending message',
            error: error.message,
            stack: error.stack
        });
    }
};

// Get all contact messages with optional status filter
const getContactMessages = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const messages = await Contact.find(filter)
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({
            message: 'Error fetching messages',
            error: error.message
        });
    }
};

// Mark a message as read
const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Contact.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        await message.markAsRead();

        res.status(200).json({ message: 'Message marked as read' });
    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({
            message: 'Error updating message status',
            error: error.message
        });
    }
};

// Reply to a message
const replyToMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { reply } = req.body;

        if (!reply) {
            return res.status(400).json({ message: 'Reply message is required' });
        }

        const message = await Contact.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Send reply email to the user
        await sendMailContact(
            message.email,
            message.name,
            message.phoneno,
            `Re: ${message.subject}`,
            reply
        );

        // Mark message as replied
        await message.markAsReplied(reply);

        res.status(200).json({ message: 'Reply sent successfully' });
    } catch (error) {
        console.error('Error replying to message:', error);
        res.status(500).json({
            message: 'Error sending reply',
            error: error.message
        });
    }
};

// Get message counts by status
const getMessageCounts = async (req, res) => {
    try {
        const counts = await Contact.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const result = {
            new: 0,
            read: 0,
            replied: 0,
            total: 0
        };

        counts.forEach(item => {
            result[item._id] = item.count;
            result.total += item.count;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getting message counts:', error);
        res.status(500).json({
            message: 'Error getting message counts',
            error: error.message
        });
    }
};

// Delete a contact message
const deleteContactMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const deleted = await Contact.findByIdAndDelete(messageId);
        if (!deleted) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting message', error: error.message });
    }
};

module.exports = {
    submitContactForm,
    getContactMessages,
    markMessageAsRead,
    replyToMessage,
    getMessageCounts,
    deleteContactMessage
};