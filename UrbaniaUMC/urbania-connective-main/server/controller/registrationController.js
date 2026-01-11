const { Registration } = require('../models/Registration');
const GeneralRegistration = require('../models/GeneralRegistration');
const ProgramRegistration = require('../models/ProgramRegistration');
const EventRegistration = require('../models/EventRegistration');
const ServiceRequest = require('../models/ServiceRequest');
const VolunteerRegistration = require('../models/VolunteerRegistration');
const Program = require('../models/Program');
const Event = require('../models/Event');
const { validateObjectId } = require('../utils/validation');

/**
 * Common registration controller with shared functionality
 */

// Get all registrations (admin)
const getAllRegistrations = async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get filter parameters
        const { type, status, search, startDate, endDate } = req.query;

        // Build filter
        const filter = {};

        if (type) {
            filter.registrationType = type;
        }

        if (status) {
            filter.status = status;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Search in name or email
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Get total for pagination
        const total = await Registration.countDocuments(filter);

        // Get registrations
        const registrations = await Registration.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            registrations,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Get all registrations error:', error);
        res.status(500).json({ message: 'Error fetching registrations', error: error.message });
    }
};

// Get user's registrations
const getUserRegistrations = async (req, res) => {
    try {
        // Get user from request (set by auth middleware)
        const userId = req.user._id;

        // Get pagination and filters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { type, status } = req.query;

        // Build filter
        const filter = { user: userId };

        if (type) {
            filter.registrationType = type;
        }

        if (status) {
            filter.status = status;
        }

        // Get total count
        const total = await Registration.countDocuments(filter);

        // Get registrations
        const registrations = await Registration.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            registrations,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Get user registrations error:', error);
        res.status(500).json({ message: 'Error fetching your registrations', error: error.message });
    }
};

// Get registration by ID
const getRegistrationById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid registration ID' });
        }

        // Find registration
        const registration = await Registration.findById(id)
            .populate('user', 'name email');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check permissions (admin or owner)
        if (!req.user.roles.includes('admin') &&
            registration.user && registration.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this registration' });
        }

        res.status(200).json(registration);
    } catch (error) {
        console.error('Get registration by ID error:', error);
        res.status(500).json({ message: 'Error fetching registration', error: error.message });
    }
};

// Update registration status
const updateRegistrationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid registration ID' });
        }

        // Validate status
        const validStatuses = ['pending', 'approved', 'rejected', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Find and update
        const registration = await Registration.findById(id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Update status
        registration.status = status;

        // Add note to status history if provided
        if (notes) {
            registration.statusHistory.push({
                status,
                timestamp: new Date(),
                note: notes
            });
            registration.notes = notes;
        }

        await registration.save();

        res.status(200).json({
            message: 'Registration status updated',
            registration: {
                id: registration._id,
                status: registration.status,
                updatedAt: registration.updatedAt
            }
        });
    } catch (error) {
        console.error('Update registration status error:', error);
        res.status(500).json({ message: 'Error updating registration status', error: error.message });
    }
};

// Delete registration
const deleteRegistration = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid registration ID' });
        }

        // Find registration
        const registration = await Registration.findById(id);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check permissions (admin or owner)
        if (!req.user.roles.includes('admin') &&
            registration.user && registration.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this registration' });
        }

        // Delete registration
        await Registration.findByIdAndDelete(id);

        res.status(200).json({ message: 'Registration deleted successfully' });
    } catch (error) {
        console.error('Delete registration error:', error);
        res.status(500).json({ message: 'Error deleting registration', error: error.message });
    }
};

// Get registration statistics (for admin dashboard)
const getRegistrationStats = async (req, res) => {
    try {
        // Total registrations by type
        const registrationsByType = await Registration.aggregate([
            { $group: { _id: '$registrationType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Total registrations by status
        const registrationsByStatus = await Registration.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Recent registrations (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentRegistrations = await Registration.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Total counts
        const totalRegistrations = await Registration.countDocuments();
        const pendingRegistrations = await Registration.countDocuments({ status: 'pending' });
        const approvedRegistrations = await Registration.countDocuments({ status: 'approved' });

        res.status(200).json({
            totalRegistrations,
            pendingRegistrations,
            approvedRegistrations,
            byType: registrationsByType,
            byStatus: registrationsByStatus,
            recent: recentRegistrations
        });
    } catch (error) {
        console.error('Get registration stats error:', error);
        res.status(500).json({ message: 'Error fetching registration statistics', error: error.message });
    }
};

module.exports = {
    // Common registration functions
    getAllRegistrations,
    getUserRegistrations,
    getRegistrationById,
    updateRegistrationStatus,
    deleteRegistration,
    getRegistrationStats
}; 