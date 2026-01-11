const GeneralRegistration = require('../models/GeneralRegistration');
const { validateObjectId } = require('../utils/validation');

// Create a new general registration
const createGeneralRegistration = async (req, res) => {
    try {
        const {
            // Personal information
            firstName, lastName, email, phone, address, city, state, zipCode,
            // Membership details
            membershipType, membershipDuration, familyMembers,
            // Emergency contact
            emergencyContact,
            // Demographics
            demographicInfo,
            // Payment
            paymentInfo,
            // Additional fields
            referralSource, interests, volunteerPreferences,
            // Special requests
            specialRequests
        } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({ message: 'First name, last name, email, and phone are required' });
        }

        if (!membershipType) {
            return res.status(400).json({ message: 'Membership type is required' });
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
            
            // Membership details
            membershipType,
            membershipDuration: membershipDuration || 'annual',
            
            // Link to user if logged in
            user: req.user ? req.user._id : undefined,
            
            // Special requests
            specialRequests,
            
            // Set start and end dates
            startDate: new Date(),
            
            // Add family members if provided and membership type is family
            ...(membershipType === 'family' && familyMembers && { familyMembers }),
            
            // Add emergency contact if provided
            ...(emergencyContact && { emergencyContact }),
            
            // Add demographic info if provided
            ...(demographicInfo && { demographicInfo }),
            
            // Add payment info if provided
            ...(paymentInfo && { paymentInfo }),
            
            // Add optional fields if provided
            ...(referralSource && { referralSource }),
            ...(interests && { interests }),
            ...(volunteerPreferences && { volunteerPreferences })
        };

        // Calculate end date based on membership duration
        const endDate = new Date();
        switch (membershipDuration) {
            case 'monthly':
                endDate.setMonth(endDate.getMonth() + 1);
                break;
            case 'quarterly':
                endDate.setMonth(endDate.getMonth() + 3);
                break;
            case 'annual':
                endDate.setFullYear(endDate.getFullYear() + 1);
                break;
            case 'lifetime':
                // Set to far future date for lifetime membership
                endDate.setFullYear(endDate.getFullYear() + 100);
                break;
            default:
                endDate.setFullYear(endDate.getFullYear() + 1); // Default to annual
        }
        registrationData.endDate = endDate;

        // Create registration
        const registration = new GeneralRegistration(registrationData);
        await registration.save();

        // Return success with registration data
        res.status(201).json({
            message: 'General registration created successfully',
            registration: {
                id: registration._id,
                membershipType: registration.membershipType,
                startDate: registration.startDate,
                endDate: registration.endDate,
                status: registration.status
            }
        });
    } catch (error) {
        console.error('Create general registration error:', error);
        res.status(500).json({ message: 'Error creating general registration', error: error.message });
    }
};

// Renew a general registration (membership)
const renewGeneralRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { membershipDuration, paymentInfo } = req.body;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid registration ID' });
        }

        // Find the registration
        const registration = await GeneralRegistration.findById(id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check permissions (admin or owner)
        if (!req.user.roles.includes('admin') && 
            registration.user && registration.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to renew this registration' });
        }

        // Set the new start date (current date or from the end of previous membership, whichever is later)
        const currentDate = new Date();
        const newStartDate = registration.endDate > currentDate ? registration.endDate : currentDate;
        registration.startDate = newStartDate;

        // Set duration if provided, otherwise use the existing one
        const duration = membershipDuration || registration.membershipDuration;
        registration.membershipDuration = duration;

        // Calculate new end date
        const newEndDate = new Date(newStartDate);
        switch (duration) {
            case 'monthly':
                newEndDate.setMonth(newEndDate.getMonth() + 1);
                break;
            case 'quarterly':
                newEndDate.setMonth(newEndDate.getMonth() + 3);
                break;
            case 'annual':
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);
                break;
            case 'lifetime':
                newEndDate.setFullYear(newEndDate.getFullYear() + 100);
                break;
            default:
                newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        }
        registration.endDate = newEndDate;

        // Update payment info if provided
        if (paymentInfo) {
            registration.paymentInfo = {
                ...registration.paymentInfo,
                ...paymentInfo,
                paymentDate: new Date()
            };
        }

        // Set status to approved for renewals
        registration.status = 'approved';
        registration.statusHistory.push({
            status: 'approved',
            timestamp: new Date(),
            note: `Membership renewed for ${duration} duration`
        });

        await registration.save();

        res.status(200).json({
            message: 'Membership renewed successfully',
            registration: {
                id: registration._id,
                membershipType: registration.membershipType,
                startDate: registration.startDate,
                endDate: registration.endDate,
                status: registration.status
            }
        });
    } catch (error) {
        console.error('Renew general registration error:', error);
        res.status(500).json({ message: 'Error renewing membership', error: error.message });
    }
};

// Update a general registration
const updateGeneralRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            firstName, lastName, email, phone, address, city, state, zipCode,
            emergencyContact, demographicInfo, familyMembers,
            interests, volunteerPreferences, specialRequests
        } = req.body;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid registration ID' });
        }

        // Find the registration
        const registration = await GeneralRegistration.findById(id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check permissions (admin or owner)
        if (!req.user.roles.includes('admin') && 
            registration.user && registration.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this registration' });
        }

        // Update fields if provided
        if (firstName) registration.firstName = firstName;
        if (lastName) registration.lastName = lastName;
        if (email) registration.email = email;
        if (phone) registration.phone = phone;
        if (address) registration.address = address;
        if (city) registration.city = city;
        if (state) registration.state = state;
        if (zipCode) registration.zipCode = zipCode;
        if (emergencyContact) registration.emergencyContact = emergencyContact;
        if (demographicInfo) registration.demographicInfo = demographicInfo;
        if (familyMembers) registration.familyMembers = familyMembers;
        if (interests) registration.interests = interests;
        if (volunteerPreferences) registration.volunteerPreferences = volunteerPreferences;
        if (specialRequests) registration.specialRequests = specialRequests;

        // Save updated registration
        await registration.save();

        res.status(200).json({
            message: 'Registration updated successfully',
            registration: {
                id: registration._id,
                membershipType: registration.membershipType,
                email: registration.email,
                updatedAt: registration.updatedAt
            }
        });
    } catch (error) {
        console.error('Update general registration error:', error);
        res.status(500).json({ message: 'Error updating registration', error: error.message });
    }
};

// Get general registrations (with type-specific filtering)
const getGeneralRegistrations = async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get filter parameters
        const { membershipType, status, search, startDateFrom, startDateTo, endDateFrom, endDateTo } = req.query;
        
        // Build filter object
        const filter = { registrationType: 'general' };
        
        if (membershipType) {
            filter.membershipType = membershipType;
        }
        
        if (status) {
            filter.status = status;
        }
        
        // Filter by start and end dates
        if (startDateFrom || startDateTo) {
            filter.startDate = {};
            if (startDateFrom) {
                filter.startDate.$gte = new Date(startDateFrom);
            }
            if (startDateTo) {
                filter.startDate.$lte = new Date(startDateTo);
            }
        }
        
        if (endDateFrom || endDateTo) {
            filter.endDate = {};
            if (endDateFrom) {
                filter.endDate.$gte = new Date(endDateFrom);
            }
            if (endDateTo) {
                filter.endDate.$lte = new Date(endDateTo);
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
        const total = await GeneralRegistration.countDocuments(filter);
        
        // Get registrations
        const registrations = await GeneralRegistration.find(filter)
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
        console.error('Get general registrations error:', error);
        res.status(500).json({ message: 'Error fetching general registrations', error: error.message });
    }
};

// Get membership statistics
const getMembershipStats = async (req, res) => {
    try {
        // Total memberships by type
        const membershipsByType = await GeneralRegistration.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$membershipType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Active vs Expired memberships
        const now = new Date();
        const activeMemberships = await GeneralRegistration.countDocuments({
            status: 'approved',
            endDate: { $gt: now }
        });
        
        const expiredMemberships = await GeneralRegistration.countDocuments({
            status: 'approved',
            endDate: { $lte: now }
        });
        
        // Memberships expiring in the next 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const expiringMemberships = await GeneralRegistration.countDocuments({
            status: 'approved',
            endDate: { $gt: now, $lte: thirtyDaysFromNow }
        });
        
        // New memberships by month (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        const newMembershipsByMonth = await GeneralRegistration.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        res.status(200).json({
            active: activeMemberships,
            expired: expiredMemberships,
            expiringSoon: expiringMemberships,
            byType: membershipsByType,
            byMonth: newMembershipsByMonth
        });
    } catch (error) {
        console.error('Get membership stats error:', error);
        res.status(500).json({ message: 'Error fetching membership statistics', error: error.message });
    }
};

module.exports = {
    createGeneralRegistration,
    renewGeneralRegistration,
    updateGeneralRegistration,
    getGeneralRegistrations,
    getMembershipStats
}; 