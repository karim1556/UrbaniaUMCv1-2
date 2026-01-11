const Volunteer = require('../models/Volunteer');
const User = require('../models/User');

// Submit volunteer application (public)
const submitVolunteerApplication = async (req, res) => {
    try {
        console.log('Received volunteer application:', JSON.stringify(req.body, null, 2));

        // Check if request body is empty
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request: Empty request body'
            });
        }
        console.log("hello");
        const {
            name,
            email,
            phone,
            interest, // This is the role the user selected
            availability,
            experience,
            address,
            motivation
        } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !address) {
            console.log('Missing required fields:', { name, email, phone });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, email, and phone are required'
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format:', email);
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Phone format validation (basic check)
        if (phone.length < 7) {
            console.log('Invalid phone format:', phone);
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid phone number'
            });
        }

        // Validate and determine the role
        let role = 'other';
        if (interest) {
            const allowedRoles = ['education', 'events', 'food', 'outreach', 'administrative', 'youth'];
            role = allowedRoles.includes(interest) ? interest : 'other';
        }
        console.log('Selected role:', role);

        // Validate and determine availability
        let availabilityValue = 'flexible';
        if (availability) {
            const allowedAvailabilities = ['weekdays', 'weekends', 'evenings', 'flexible', 'mornings', 'afternoons'];
            availabilityValue = allowedAvailabilities.includes(availability) ? availability : 'flexible';
        }
        console.log('Selected availability:', availabilityValue);

        // Create a volunteer application with role-specific data
        const volunteerApplication = new Volunteer({
            fullName: name,
            email,
            phone,
            role: role,
            experience: experience || "No experience provided",
            availability: availabilityValue,
            applicationDate: new Date(),
            status: 'pending',
            address: address,
            motivation: motivation,
            // If the request comes from an authenticated user, set both user and volunteerId
            ...(req.user && {
                user: req.user._id,
                volunteerId: req.user._id
            })
        });

        console.log('Saving volunteer application for:', name);
        await volunteerApplication.save();
        console.log('Volunteer application saved successfully with ID:', volunteerApplication._id);

        res.status(201).json({
            success: true,
            message: 'Volunteer application submitted successfully',
            data: {
                id: volunteerApplication._id,
                name,
                email,
                role,
                applicationDate: volunteerApplication.applicationDate
            }
        });
    } catch (error) {
        console.error('Error submitting volunteer application:', error);

        // Check if it's a validation error
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            console.error('Validation errors:', validationErrors);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        
        // Generic server error
        res.status(500).json({
            success: false,
            message: 'Error submitting volunteer application. Please try again later.',
            error: error.message
        });
    }
};

// Submit volunteer request
const submitVolunteerRequest = async (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            address,
            experience,
            availability,
            motivation
        } = req.body;

        const volunteerRequest = new Volunteer({
            user: req.user._id,
            fullName,
            email,
            phone,
            address,
            experience,
            availability,
            motivation,
            address,
            role
        });

        await volunteerRequest.save();

        res.status(201).json({
            message: 'Volunteer request submitted successfully',
            volunteerRequest
        });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting volunteer request', error: error.message });
    }
};

// Get all volunteer requests (admin only)
const getAllVolunteerRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const requests = await Volunteer.find(query)
            .populate('user', 'username email')
            .populate('approvedBy', 'username email')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching volunteer requests', error: error.message });
    }
};

// Get single volunteer request
const getVolunteerRequest = async (req, res) => {
    try {
        const request = await Volunteer.findById(req.params.id)
            .populate('user', 'username email')
            .populate('approvedBy', 'username email');

        if (!request) {
            return res.status(404).json({ message: 'Volunteer request not found' });
        }

        // Check if user is authorized to view this request
        // If the request has no user field, only admins can view it
        if (!request.user) {
            if (!req.user.roles.includes('admin')) {
                return res.status(403).json({ message: 'Not authorized to view this request' });
            }
        } else if (request.user._id.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized to view this request' });
        }

        res.json(request);
    } catch (error) {
        console.error('Error in getVolunteerRequest:', error);
        res.status(500).json({ message: 'Error fetching volunteer request', error: error.message });
    }
};

// Approve volunteer request (admin only)
const approveVolunteerRequest = async (req, res) => {
    try {
        const request = await Volunteer.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Volunteer request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been processed' });
        }

        // Update request status
        request.status = 'approved';
        request.approvedBy = req.user._id;
        request.approvedAt = new Date();
        await request.save();

        // Update user role to include volunteer
        await User.findByIdAndUpdate(request.user, {
            $addToSet: { roles: 'volunteer' }
        });

        res.json({
            message: 'Volunteer request approved successfully',
            request
        });
    } catch (error) {
        res.status(500).json({ message: 'Error approving volunteer request', error: error.message });
    }
};

// Reject volunteer request (admin only)
const rejectVolunteerRequest = async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const request = await Volunteer.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Volunteer request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'This request has already been processed' });
        }

        // Update request status
        request.status = 'rejected';
        request.approvedBy = req.user._id;
        request.approvedAt = new Date();
        request.rejectionReason = rejectionReason;
        await request.save();

        res.json({
            message: 'Volunteer request rejected successfully',
            request
        });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting volunteer request', error: error.message });
    }
};

// Get user's volunteer request
const getUserVolunteerRequest = async (req, res) => {
    try {
        const request = await Volunteer.findOne({ user: req.user._id })
            .populate('approvedBy', 'username email');

        if (!request) {
            return res.status(404).json({ message: 'No volunteer request found' });
        }

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching volunteer request', error: error.message });
    }
};

// Get volunteer profile by volunteerId (user-specific)
const getMyVolunteerProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find volunteer by volunteerId (which should match the user's ID)
        const volunteer = await Volunteer.findOne({ volunteerId: userId });

        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'No volunteer profile found for this user'
            });
        }

        res.json({
            success: true,
            data: volunteer
        });
    } catch (error) {
        console.error('Error fetching volunteer profile:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching volunteer profile',
            error: error.message
        });
    }
};

// Fetch all volunteer applications by user id
const getVolunteersByUserId = async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id;
        const volunteers = await Volunteer.find({ user: userId });
        res.status(200).json({ success: true, data: volunteers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching volunteers by user id', error: error.message });
    }
};

// Fetch all volunteer applications by volunteer id
const getVolunteersByVolunteerId = async (req, res) => {
    try {
        const volunteerId = req.params.volunteerId;
        const volunteers = await Volunteer.find({ volunteerId: volunteerId });
        res.status(200).json({ success: true, data: volunteers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching volunteers by volunteer id', error: error.message });
    }
};

module.exports = {
    submitVolunteerRequest,
    submitVolunteerApplication,
    getAllVolunteerRequests,
    getVolunteerRequest,
    approveVolunteerRequest,
    rejectVolunteerRequest,
    getUserVolunteerRequest,
    getMyVolunteerProfile,
    getVolunteersByUserId,
    getVolunteersByVolunteerId,
}; 