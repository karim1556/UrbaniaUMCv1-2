const Event = require('../models/Event');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { validateEvent, validateEventUpdate } = require('../validators/eventValidator');
const EventRegistration = require('../models/EventRegistration');

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        console.log('Received request body:', req.body);
        console.log('Received file:', req.file);

        // Parse the JSON data from the FormData
        let eventData;
        try {
            eventData = req.body.data ? JSON.parse(req.body.data) : req.body;
            console.log('Parsed event data:', eventData);
        } catch (parseError) {
            console.error('Error parsing event data:', parseError);
            return res.status(400).json({ error: 'Invalid event data format' });
        }

        // Validate required fields
        const requiredFields = ['title', 'description', 'fullDescription', 'date', 'time', 'location', 'category', 'organizerName'];
        const missingFields = requiredFields.filter(field => !eventData[field]);

        if (missingFields.length > 0) {
            console.error('Missing required fields:', missingFields);
            return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
        }

        const { error } = validateEvent(eventData);
        if (error) {
            console.log('Validation error:', error.details[0].message);
            return res.status(400).json({ error: error.details[0].message });
        }

        // Handle image upload
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'At least one image is required' });
        }

        // Process additional details if provided as string
        if (eventData.additionalDetails && typeof eventData.additionalDetails === 'string') {
            eventData.additionalDetails = eventData.additionalDetails
                .split('\n')
                .map(detail => detail.trim())
                .filter(detail => detail.length > 0);
        }

        // Ensure pricing object has all required fields
        eventData.pricing = {
            type: eventData.pricing?.type || 'free',
            amount: Number(eventData.pricing?.amount) || 0,
            details: eventData.pricing?.details || 'Free for all'
        };

        // Ensure registration object has all required fields
        eventData.registration = {
            required: true,
            deadline: eventData.registration?.deadline,
            capacity: Number(eventData.registration?.capacity) || 0
        };

        // Format time object
        if (typeof eventData.time === 'string') {
            const [startTime, endTime] = eventData.time.split(' to ');
            eventData.time = {
                startTime: startTime.trim(),
                endTime: endTime.trim()
            };
        }

        const imagePaths = req.files.map(file => file.path || file.filename || file.url);
        const event = new Event({
            ...eventData,
            images: imagePaths,
            organizer: req.user._id,
            attendees: 0,
            status: 'upcoming'
        });

        console.log('Creating new event:', event);

        const savedEvent = await event.save();
        console.log('Event saved successfully:', savedEvent);

        res.status(201).json(savedEvent);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all events with pagination and filters
exports.getEvents = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, featured, search } = req.query;
        const query = {};

        if (category) query.category = category;
        if (featured) query.featured = featured === 'true';
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const events = await Event.find(query)
            .sort({ date: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Event.countDocuments(query);
        console.log(events)
        res.json({
            events,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single event
exports.getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an event
exports.updateEvent = async (req, res) => {
    try {
        // If data is sent as JSON string (from FormData), parse it
        let updateData = req.body;
        if (req.body.data) {
            updateData = JSON.parse(req.body.data);
        }
        console.log('Update event data:', updateData);

        // If updateData.time is undefined, empty string, or null, remove it so it doesn't overwrite or trigger validation
        if (updateData.time === undefined || updateData.time === '' || updateData.time === null) {
            delete updateData.time;
        }

        // Validate the event data (if you have a validateEvent function)
        if (typeof validateEventUpdate === 'function') {
            const { error } = validateEventUpdate(updateData);
            if (error) {
                return res.status(400).json({ error: error.details[0].message });
            }
        }

        // Handle file upload (image)
        let newImages = null;
        if (req.files && req.files.length > 0) {
            newImages = req.files.map(file => file.path || file.filename || file.url);
        }

        // Find the event
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Process additionalDetails if provided as string
        if (updateData.additionalDetails && typeof updateData.additionalDetails === 'string') {
            updateData.additionalDetails = updateData.additionalDetails
                .split('\n')
                .map(detail => detail.trim())
                .filter(detail => detail.length > 0);
        }

        // Ensure time is an object with startTime and endTime
        if (updateData.time && typeof updateData.time === 'string') {
            const [startTime, endTime] = updateData.time.split(' to ');
            updateData.time = {
                startTime: startTime.trim(),
                endTime: endTime.trim()
            };
        }

        // Update event fields
        Object.assign(event, updateData);
        if (newImages) event.images = newImages;

        await event.save();
        res.json(event);
    } catch (error) {
        console.error('Update Event Error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Register for an event
exports.registerForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const canRegister = await event.canRegister(req.user._id);
        if (!canRegister) {
            return res.status(400).json({ error: 'Cannot register for this event' });
        }

        await event.addParticipant(req.user._id);
        res.json({ message: 'Successfully registered for event' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unregister from an event
exports.unregisterFromEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const success = await event.removeParticipant(req.user._id);
        if (!success) {
            return res.status(400).json({ error: 'Not registered for this event' });
        }

        res.json({ message: 'Successfully unregistered from event' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add testimonial to an event
exports.addTestimonial = async (req, res) => {
    try {
        const { text, rating } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user has attended the event
        if (!event.registeredParticipants.includes(req.user._id)) {
            return res.status(403).json({ error: 'Must attend event to add testimonial' });
        }

        event.testimonials.push({
            user: req.user._id,
            text,
            rating
        });

        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get featured events
exports.getFeaturedEvents = async (req, res) => {
    try {
        const events = await Event.getFeaturedEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get events by category
exports.getEventsByCategory = async (req, res) => {
    try {
        const events = await Event.getEventsByCategory(req.params.category);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
    try {
        const events = await Event.getUpcomingEvents();
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get events by organizer
exports.getEventsByOrganizer = async (req, res) => {
    try {
        const events = await Event.getEventsByOrganizer(req.params.organizerId);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get total attendees for an event by summing guests in registrations
exports.getTotalAttendees = async (req, res) => {
    try {
        const eventId = req.params.id;
        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required' });
        }
        const registrations = await EventRegistration.find({ event: eventId });
        let totalAttendees = 0;
        registrations.forEach(reg => {
            totalAttendees += (reg.guests && reg.guests.length) ? reg.guests.length : 0;
        });
        res.json({ totalAttendees });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching total attendees', error: error.message });
    }
};