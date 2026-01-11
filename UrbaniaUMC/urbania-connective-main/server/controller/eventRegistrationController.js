const EventRegistration = require('../models/EventRegistration');
const Event = require('../models/Event');
const User = require('../models/User');
const { validateObjectId, validateEmail, validateRequired } = require('../utils/validation');
const Razorpay = require('razorpay');
const mongoose = require('mongoose');
const { sendEmail } = require('../utils/emailService');
const { sendMailEventRegistration } = require('../config/mail');
const { getEventRegistrationReceiptHtml } = require('../utils/emailTemplates');





// Create a new event registration
const createEventRegistration = async (req, res) => {
    try {
        let {
            // Personal information
            firstName, lastName, email, phone, address, city, state, zipCode,
            // Event details
            eventId, eventName, eventDate,
            // Additional information
            dietaryRestrictions, accessibilityNeeds,
            // Payment information
            ticketPrice, totalAmount, paymentInfo,
            // New fields
                gender, buildingName, wing, flatNo, guests,
            // Terms
            agreeTerms
        } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({ message: 'First name, last name, email, and phone are required' });
        }

        if (!eventId || !eventName || !eventDate) {
            return res.status(400).json({ message: 'Event ID, name, and date are required' });
        }

        // Validate eventId first and ensure it's not null
        if (!eventId || eventId === 'null' || eventId === 'undefined') {
            return res.status(400).json({ message: 'Valid event ID is required' });
        }

        if (!validateObjectId(eventId)) {
            return res.status(400).json({ message: 'Invalid event ID format' });
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // For paid events, validate payment information
        if (event.pricing && event.pricing.type !== 'free') {
            if (!ticketPrice || !totalAmount) {
                return res.status(400).json({ message: 'Ticket price and total amount are required for paid events' });
            }
            if (!paymentInfo || !paymentInfo.method) {
                return res.status(400).json({ message: 'Payment method is required for paid events' });
            }
        } else {
            // For free events, set default values
            ticketPrice = 0;
            totalAmount = 0;
            paymentInfo = {
                method: 'free',
                status: 'completed'
            };
        }

        // Calculate totalAttendees from guests array
        const totalAttendees = guests ? guests.length : 0;

        // Fetch user's customId if logged in
        let userCustomId = null;
        if (req.user && req.user._id) {
            const userDoc = await User.findById(req.user._id).select('customId');
            if (userDoc && userDoc.customId) {
                userCustomId = userDoc.customId;
            }
        }

        // Prefer customUserId from frontend if provided
        if (req.body.customUserId) {
            userCustomId = req.body.customUserId;
        }

        // Create registration data
        const registrationData = {
            // Personal information
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            zipCode,
            // Event details - ensure eventId is valid
            event: eventId, // This should be a valid ObjectId
            eventName,
            eventDate: new Date(eventDate),
            // Additional information
            dietaryRestrictions,
            accessibilityNeeds,
            // Payment information
            ticketPrice,
            totalAmount,
            paymentInfo,
            // New fields
            ...(gender && { gender }),
            ...(buildingName && { buildingName }),
            ...(wing && { wing }),
            ...(flatNo && { flatNo }),
            ...(guests && guests.length > 0 && { guests }),
            totalAttendees, // Store totalAttendees
            // Registration type will be set by the model
            registrationType: 'event',
            // Link to user if logged in (can be undefined for guest registrations)
            ...(req.user && req.user._id && { user: req.user._id }),
            ...(userCustomId && { userCustomId })
        };

        // Final validation to ensure event is not null
        if (!registrationData.event) {
            return res.status(400).json({ message: 'Event ID is required and cannot be null' });
        }

        console.log('Creating registration with data:', {
            eventId: registrationData.event,
            eventName: registrationData.eventName,
            userId: registrationData.user || 'guest'
        });

        // Create registration
        const registration = new EventRegistration(registrationData);
        await registration.save();

        // Add event to user's events array if user is logged in
        if (req.user && req.user._id) {
            await User.findByIdAndUpdate(
                req.user._id,
                { $addToSet: { events: eventId } },
                { new: true }
            );
        }

        // --- Send Registration Email ---
        try {
            await sendMailEventRegistration(
                registration.email,
                { username: `${registration.firstName} ${registration.lastName}` },
                event,
                registration
            );
            console.log(`Registration email sent successfully to ${registration.email}`);
        } catch (emailError) {
            console.error(`Failed to send registration email for registration ${registration._id}:`, emailError);
            // Do not block the API response if email fails. Log it for monitoring.
        }
        // --- End Send Registration Email ---


        // Return success with registration data
        res.status(201).json({
            message: 'Event registration created successfully',
            registration: {
                id: registration._id,
                eventName: registration.eventName,
                status: registration.status,
                totalAmount: registration.totalAmount
            }
        });
    } catch (error) {
        console.error('Create event registration error:', error);
        res.status(500).json({ message: 'Error creating event registration', error: error.message });
    }
};

// Get event registrations (with specific filtering)
const getEventRegistrations = async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get filter parameters
        const { eventId, ticketType, status, search, checkedIn } = req.query;

        // Build filter object
        const filter = { registrationType: 'event' };

        if (eventId && validateObjectId(eventId)) {
            filter.event = eventId;
        }

        if (ticketType) {
            filter.ticketType = ticketType;
        }

        if (status) {
            filter.status = status;
        }

        if (checkedIn !== undefined) {
            filter.checkedIn = checkedIn === 'true';
        }

        // Search in name or email
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { eventName: { $regex: search, $options: 'i' } }
            ];
        }

        // Get total for pagination
        const total = await EventRegistration.countDocuments(filter);

        // Get registrations
        const registrations = await EventRegistration.find(filter)
            .populate('user', 'name email customId')
            .populate('event', 'title dateTime')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Map registrations to include customId at the top level for each attendee
        const registrationsWithCustomId = registrations.map(reg => {
            const regObj = reg.toObject();
            regObj.customId = regObj.user && regObj.user.customId ? regObj.user.customId : null;
            return regObj;
        });

        res.status(200).json({
            registrations: registrationsWithCustomId,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Get event registrations error:', error);
        res.status(500).json({ message: 'Error fetching event registrations', error: error.message });
    }
};

// Update event registration (check-in)
const updateEventRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            checkedIn, checkInTime, dietaryRestrictions,
            accessibilityNeeds, specialRequests, notes,
            cancellationStatus, cancellationReason
        } = req.body;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid registration ID' });
        }

        // Find the registration
        const registration = await EventRegistration.findById(id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check permissions (admin only for check-in)
        if ((checkedIn !== undefined || checkInTime) && !req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized to update check-in details' });
        }

        // Update fields if provided
        if (checkedIn !== undefined) registration.checkedIn = checkedIn;
        if (checkInTime) registration.checkInTime = new Date(checkInTime);
        if (dietaryRestrictions) registration.dietaryRestrictions = dietaryRestrictions;
        if (accessibilityNeeds) registration.accessibilityNeeds = accessibilityNeeds;
        if (specialRequests) registration.specialRequests = specialRequests;
        if (notes) registration.notes = notes;

        // Handle cancellation
        if (cancellationStatus) {
            registration.cancellationStatus = cancellationStatus;
            registration.cancellationDate = new Date();
            registration.cancellationReason = cancellationReason;

            // If cancelled, update main status
            if (cancellationStatus === 'cancelled' || cancellationStatus === 'refunded') {
                registration.status = 'cancelled';
                registration.statusHistory.push({
                    status: 'cancelled',
                    timestamp: new Date(),
                    note: `Event registration cancelled: ${cancellationReason || ''}`
                });
            }
        }

        // Save updated registration
        await registration.save();

        res.status(200).json({
            message: 'Event registration updated successfully',
            registration: {
                id: registration._id,
                eventName: registration.eventName,
                checkedIn: registration.checkedIn,
                cancellationStatus: registration.cancellationStatus,
                updatedAt: registration.updatedAt
            }
        });
    } catch (error) {
        console.error('Update event registration error:', error);
        res.status(500).json({ message: 'Error updating event registration', error: error.message });
    }
};

// Check in attendee
const checkInAttendee = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid registration ID' });
        }

        // Find the registration
        const registration = await EventRegistration.findById(id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check if already checked in
        if (registration.checkedIn) {
            return res.status(400).json({
                message: 'Attendee already checked in',
                registration: {
                    id: registration._id,
                    eventName: registration.eventName,
                    eventDate: registration.eventDate,
                    checkedIn: registration.checkedIn,
                    checkInTime: registration.checkInTime
                }
            });
        }

        // Update check-in status
        registration.checkedIn = true;
        registration.checkInTime = new Date();
        await registration.save();

        res.status(200).json({
            message: 'Attendee checked in successfully',
            registration: {
                id: registration._id,
                eventName: registration.eventName,
                eventDate: registration.eventDate,
                checkedIn: registration.checkedIn,
                checkInTime: registration.checkInTime
            }
        });
    } catch (error) {
        console.error('Check in attendee error:', error);
        res.status(500).json({ message: 'Error checking in attendee', error: error.message });
    }
};

// Get event statistics
const getEventStats = async (req, res) => {
    try {
        // Get event ID if provided
        const { eventId } = req.query;

        // Build match filter
        const matchFilter = { registrationType: 'event' };
        if (eventId && validateObjectId(eventId)) {
            matchFilter.event = mongoose.Types.ObjectId(eventId);
        }

        // Total registrations by event
        const registrationsByEvent = await EventRegistration.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$event',
                    count: { $sum: 1 },
                    checkedIn: { $sum: { $cond: ['$checkedIn', 1, 0] } },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // If specific event, get event details
        let eventDetails = null;
        if (eventId && validateObjectId(eventId)) {
            eventDetails = await Event.findById(eventId, 'title dateTime capacity');
        }

        // Total registrations by ticket type
        const registrationsByTicketType = await EventRegistration.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$ticketType',
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Total registrations by status
        const registrationsByStatus = await EventRegistration.aggregate([
            { $match: matchFilter },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Check-in statistics
        const checkInStats = await EventRegistration.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$checkedIn',
                    count: { $sum: 1 }
                }
            }
        ]);

        const checkedIn = checkInStats.find(s => s._id === true)?.count || 0;
        const notCheckedIn = checkInStats.find(s => s._id === false)?.count || 0;

        // Guests count aggregation (sum of guest entries per event)
        const guestsCountAgg = await EventRegistration.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$event',
                    guestsCount: { $sum: { $cond: [ { $isArray: '$guests' }, { $size: '$guests' }, 0 ] } }
                }
            }
        ]);

        // Compute response
        const response = {
            totalRegistrations: checkedIn + notCheckedIn,
            checkedIn,
            notCheckedIn,
            byTicketType: registrationsByTicketType,
            byStatus: registrationsByStatus
        };

        // Add event-specific details if requested
        if (eventId && validateObjectId(eventId)) {
            response.event = eventDetails;
            const eventRegistrations = registrationsByEvent.find(r => r._id.toString() === eventId);
            const guestsCountsObj = guestsCountAgg.find(r => r._id.toString() === eventId) || { guestsCount: 0 };
            if (eventRegistrations) {
                const totalAttendees = guestsCountsObj.guestsCount || 0;
                response.attendance = {
                    registered: eventRegistrations.count,
                    checkedIn: eventRegistrations.checkedIn,
                    percentageAttended: eventRegistrations.count > 0
                        ? Math.round((eventRegistrations.checkedIn / eventRegistrations.count) * 100)
                        : 0,
                    revenue: eventRegistrations.revenue,
                    guestsCount: guestsCountsObj.guestsCount || 0,
                    totalAttendees
                };

                if (eventDetails && eventDetails.capacity) {
                    response.attendance.capacityFilled = Math.round((eventRegistrations.count / eventDetails.capacity) * 100);
                }
            }
        } else {
            // If no specific event, summarize all events
            response.byEvent = await Promise.all(registrationsByEvent.map(async (event) => {
                const eventDetails = await Event.findById(event._id, 'title dateTime');
                const guestsObj = guestsCountAgg.find(r => r._id.toString() === event._id.toString()) || { guestsCount: 0 };
                const totalAttendees = guestsObj.guestsCount || 0;
                return {
                    event: event._id,
                    eventTitle: eventDetails ? eventDetails.title : 'Unknown Event',
                    eventDate: eventDetails ? eventDetails.dateTime : null,
                    registrations: event.count,
                    checkedIn: event.checkedIn,
                    attendanceRate: event.count > 0 ? Math.round((event.checkedIn / event.count) * 100) : 0,
                    revenue: event.revenue,
                    guestsCount: guestsObj.guestsCount || 0,
                    totalAttendees
                };
            }));
        }

        res.status(200).json(response);
    } catch (error) {
        console.error('Get event stats error:', error);
        res.status(500).json({ message: 'Error fetching event statistics', error: error.message });
    }
};

// Helper to sanitize description for Razorpay
function sanitizeDescription(description) {
  let sanitized = description.replace(/[^\x00-\x7F]/g, ""); // Remove non-ASCII
  sanitized = sanitized.replace(/[\r\n]+/g, " "); // Replace line breaks with space
  sanitized = sanitized.trim().slice(0, 255); // Limit length
  return sanitized;
}

// Create Razorpay order for event registration
const createEventRegistrationPaymentOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', eventId } = req.body;
        if (!amount || !eventId) {
            return res.status(400).json({ message: 'Amount and eventId are required' });
        }
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        // Fetch event for description
        const event = await require('../models/Event').findById(eventId);
        let safeDescription = event && event.description ? sanitizeDescription(event.description) : '';
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // in paise
            currency,
            receipt: `eventreg_${Date.now()}`.slice(0, 40),
            notes: {
                userId: req.user ? req.user._id : undefined,
                eventId: eventId,
                description: safeDescription
            },
            payment_capture: 1
        });
        res.status(200).json({ order });
    } catch (error) {
        console.error('Error creating Razorpay order for event registration:', error);
        res.status(500).json({ message: 'Error creating payment order', error: error.message });
    }
};

// Get registrations for a specific event by eventId (query param)
const getEventRegistrationsByEventId = async (req, res) => {
    try {
        const { eventId } = req.query;
        if (!eventId) {
            return res.status(400).json({ message: 'eventId is required' });
        }
        const registrations = await EventRegistration.find({ event: new mongoose.Types.ObjectId(eventId) });
        res.json({ registrations });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching event registrations', error: error.message });
    }
};

// Get user's event registrations
const getMyEventRegistrations = async (req, res) => {
    try {
        const userId = req.user._id;
        const userCustomId = req.user.customId;

        // Build filter to match either user ID or customId
        const filter = {
            $or: [
                { user: userId },
                { userCustomId: userCustomId }
            ],
            registrationType: 'event'
        };

        // Get registrations with populated event details
        const registrations = await EventRegistration.find(filter)
            .populate('event', 'title dateTime time location')
            .sort({ eventDate: 1 });

        res.status(200).json({
            registrations: registrations.map(reg => ({
                _id: reg._id,
                eventName: reg.eventName,
                eventDate: reg.eventDate,
                event: {
                    _id: reg.event?._id,
                    title: reg.event?.title,
                    time: reg.event?.time,
                    location: reg.event?.location
                },
                status: reg.status,
                totalAmount: reg.totalAmount,
                checkedIn: reg.checkedIn
            }))
        });
    } catch (error) {
        console.error('Get my event registrations error:', error);
        res.status(500).json({ message: 'Error fetching your event registrations', error: error.message });
    }
};

module.exports = {
    createEventRegistration,
    getEventRegistrations,
    updateEventRegistration,
    checkInAttendee,
    getEventStats,
    createEventRegistrationPaymentOrder,
    getEventRegistrationsByEventId,
    getMyEventRegistrations
};