const VolunteerRegistration = require('../models/VolunteerRegistration');
const { validateObjectId, validateEmail, validateRequired } = require('../utils/validation');

// Create a new volunteer registration
const createVolunteerRegistration = async (req, res) => {
    try {
        const {
            // Personal information
            firstName, lastName, email, phone, address, city, state, zipCode,
            // Volunteer details
            volunteerType, availability, skills, interests, areasOfInterest,
            // Experience
            previousExperience, yearsOfExperience,
            // Background check
            backgroundCheck,
            // Emergency contact
            emergencyContact,
            // References
            references,
            // Special requests
            specialRequests
        } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({ message: 'First name, last name, email, and phone are required' });
        }

        if (!volunteerType) {
            return res.status(400).json({ message: 'Volunteer type is required' });
        }

        if (!emergencyContact || !emergencyContact.name || !emergencyContact.phone) {
            return res.status(400).json({ message: 'Emergency contact name and phone are required' });
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
            
            // Volunteer details
            volunteerType,
            availability: availability || {
                weekdays: false,
                weekends: false
            },
            skills: skills || [],
            interests: interests || [],
            areasOfInterest: areasOfInterest || [],
            
            // Experience
            previousExperience,
            yearsOfExperience,
            
            // Background check
            backgroundCheck: backgroundCheck || {
                required: false,
                completed: false
            },
            
            // Emergency contact
            emergencyContact,
            
            // References
            references: references || [],
            
            // Registration type will be set by the model
            registrationType: 'volunteer',
            
            // Link to user if logged in
            user: req.user ? req.user._id : undefined,
            
            // Special requests
            specialRequests,
            
            // Default fields
            agreementSigned: false,
            status: 'pending'
        };

        // Create registration
        const registration = new VolunteerRegistration(registrationData);
        await registration.save();

        // Return success with registration data
        res.status(201).json({
            message: 'Volunteer registration created successfully',
            registration: {
                id: registration._id,
                volunteerType: registration.volunteerType,
                status: registration.status
            }
        });
    } catch (error) {
        console.error('Create volunteer registration error:', error);
        res.status(500).json({ message: 'Error creating volunteer registration', error: error.message });
    }
};

// Get volunteer registrations (with specific filtering)
const getVolunteerRegistrations = async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get filter parameters
        const { 
            volunteerType, status, skill, interest, areaOfInterest, 
            backgroundCheckCompleted, search, availableOnWeekends 
        } = req.query;
        
        // Build filter object
        const filter = { registrationType: 'volunteer' };
        
        if (volunteerType) {
            filter.volunteerType = volunteerType;
        }
        
        if (status) {
            filter.status = status;
        }
        
        if (skill) {
            filter.skills = skill;
        }
        
        if (interest) {
            filter.interests = interest;
        }
        
        if (areaOfInterest) {
            filter.areasOfInterest = areaOfInterest;
        }
        
        if (backgroundCheckCompleted !== undefined) {
            filter['backgroundCheck.completed'] = backgroundCheckCompleted === 'true';
        }
        
        if (availableOnWeekends !== undefined) {
            filter['availability.weekends'] = availableOnWeekends === 'true';
        }
        
        // Search in name or email
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { skills: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get total for pagination
        const total = await VolunteerRegistration.countDocuments(filter);
        
        // Get registrations
        const registrations = await VolunteerRegistration.find(filter)
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
        console.error('Get volunteer registrations error:', error);
        res.status(500).json({ message: 'Error fetching volunteer registrations', error: error.message });
    }
};

// Update volunteer registration
const updateVolunteerRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            // Volunteer details
            volunteerType, availability, skills, interests, areasOfInterest,
            // Personal details
            phone, address, city, state, zipCode,
            // Experience
            previousExperience, yearsOfExperience,
            // Emergency contact
            emergencyContact,
            // References
            references,
            // Special requests
            specialRequests
        } = req.body;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid registration ID' });
        }

        // Find the registration
        const registration = await VolunteerRegistration.findById(id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check permissions (admin or owner)
        if (!req.user.roles.includes('admin') && 
            registration.user && registration.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this registration' });
        }

        // Update fields if provided
        if (volunteerType) registration.volunteerType = volunteerType;
        if (availability) registration.availability = { ...registration.availability, ...availability };
        if (skills) registration.skills = skills;
        if (interests) registration.interests = interests;
        if (areasOfInterest) registration.areasOfInterest = areasOfInterest;
        if (phone) registration.phone = phone;
        if (address) registration.address = address;
        if (city) registration.city = city;
        if (state) registration.state = state;
        if (zipCode) registration.zipCode = zipCode;
        if (previousExperience) registration.previousExperience = previousExperience;
        if (yearsOfExperience) registration.yearsOfExperience = yearsOfExperience;
        if (emergencyContact) registration.emergencyContact = { ...registration.emergencyContact, ...emergencyContact };
        if (references) registration.references = references;
        if (specialRequests) registration.specialRequests = specialRequests;

        // Save updated registration
        await registration.save();

        res.status(200).json({
            message: 'Volunteer registration updated successfully',
            registration: {
                id: registration._id,
                volunteerType: registration.volunteerType,
                status: registration.status,
                updatedAt: registration.updatedAt
            }
        });
    } catch (error) {
        console.error('Update volunteer registration error:', error);
        res.status(500).json({ message: 'Error updating volunteer registration', error: error.message });
    }
};

// Update volunteer status
const updateVolunteerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            status, backgroundCheck, orientation, trainings,
            assignments, agreementSigned, agreementDate,
            startDate, endDate, recognition
        } = req.body;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid registration ID' });
        }

        // Only admins can update volunteer status
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized to update volunteer status' });
        }

        // Find the registration
        const registration = await VolunteerRegistration.findById(id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Update fields if provided
        if (status) {
            registration.status = status;
            registration.statusHistory.push({
                status,
                timestamp: new Date(),
                note: `Volunteer status updated to ${status}`
            });
        }
        
        if (backgroundCheck) {
            registration.backgroundCheck = { ...registration.backgroundCheck, ...backgroundCheck };
        }
        
        if (orientation) {
            registration.orientation = { ...registration.orientation, ...orientation };
        }
        
        if (trainings) {
            if (!registration.trainings) {
                registration.trainings = trainings;
            } else {
                // Update existing trainings or add new ones
                trainings.forEach(newTraining => {
                    const existingIndex = registration.trainings.findIndex(
                        t => t.title === newTraining.title
                    );
                    
                    if (existingIndex >= 0) {
                        registration.trainings[existingIndex] = {
                            ...registration.trainings[existingIndex],
                            ...newTraining
                        };
                    } else {
                        registration.trainings.push(newTraining);
                    }
                });
            }
        }
        
        if (assignments) {
            if (!registration.assignments) {
                registration.assignments = assignments;
            } else {
                registration.assignments = [...registration.assignments, ...assignments];
            }
        }
        
        if (agreementSigned !== undefined) {
            registration.agreementSigned = agreementSigned;
            if (agreementSigned && agreementDate) {
                registration.agreementDate = new Date(agreementDate);
            }
        }
        
        if (startDate) {
            registration.startDate = new Date(startDate);
        }
        
        if (endDate) {
            registration.endDate = new Date(endDate);
        }
        
        if (recognition) {
            if (!registration.recognition) {
                registration.recognition = recognition;
            } else {
                registration.recognition = [...registration.recognition, ...recognition];
            }
        }

        // Save updated registration
        await registration.save();

        res.status(200).json({
            message: 'Volunteer status updated successfully',
            registration: {
                id: registration._id,
                volunteerType: registration.volunteerType,
                status: registration.status,
                backgroundCheck: registration.backgroundCheck,
                orientation: registration.orientation,
                updatedAt: registration.updatedAt
            }
        });
    } catch (error) {
        console.error('Update volunteer status error:', error);
        res.status(500).json({ message: 'Error updating volunteer status', error: error.message });
    }
};

// Get volunteer statistics
const getVolunteerStats = async (req, res) => {
    try {
        // Total volunteers by type
        const volunteersByType = await VolunteerRegistration.aggregate([
            { $match: { registrationType: 'volunteer' } },
            { $group: { _id: '$volunteerType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Total volunteers by status
        const volunteersByStatus = await VolunteerRegistration.aggregate([
            { $match: { registrationType: 'volunteer' } },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Volunteers by area of interest
        const volunteersByArea = await VolunteerRegistration.aggregate([
            { $match: { registrationType: 'volunteer' } },
            { $unwind: '$areasOfInterest' },
            { $group: { _id: '$areasOfInterest', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Volunteers by skill
        const volunteersBySkill = await VolunteerRegistration.aggregate([
            { $match: { registrationType: 'volunteer' } },
            { $unwind: '$skills' },
            { $group: { _id: '$skills', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        // Volunteers by availability
        const volunteersByAvailability = {
            weekdays: await VolunteerRegistration.countDocuments({
                registrationType: 'volunteer',
                'availability.weekdays': true
            }),
            weekends: await VolunteerRegistration.countDocuments({
                registrationType: 'volunteer',
                'availability.weekends': true
            }),
            morning: await VolunteerRegistration.countDocuments({
                registrationType: 'volunteer',
                'availability.timePreference': 'morning'
            }),
            afternoon: await VolunteerRegistration.countDocuments({
                registrationType: 'volunteer',
                'availability.timePreference': 'afternoon'
            }),
            evening: await VolunteerRegistration.countDocuments({
                registrationType: 'volunteer',
                'availability.timePreference': 'evening'
            })
        };
        
        // Background check statistics
        const backgroundCheckStats = {
            completed: await VolunteerRegistration.countDocuments({
                registrationType: 'volunteer',
                'backgroundCheck.completed': true
            }),
            pending: await VolunteerRegistration.countDocuments({
                registrationType: 'volunteer',
                'backgroundCheck.required': true,
                'backgroundCheck.completed': false
            }),
            notRequired: await VolunteerRegistration.countDocuments({
                registrationType: 'volunteer',
                'backgroundCheck.required': false
            })
        };
        
        // Orientation statistics
        const orientationStats = {
            completed: await VolunteerRegistration.countDocuments({
                registrationType: 'volunteer',
                'orientation.completed': true
            }),
            pending: await VolunteerRegistration.countDocuments({
                registrationType: 'volunteer',
                'orientation.required': true,
                'orientation.completed': false
            })
        };
        
        // New volunteers by month (last 12 months)
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        const newVolunteersByMonth = await VolunteerRegistration.aggregate([
            { $match: { registrationType: 'volunteer', createdAt: { $gte: twelveMonthsAgo } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        // Total counts
        const totalVolunteers = await VolunteerRegistration.countDocuments({ 
            registrationType: 'volunteer' 
        });
        
        const activeVolunteers = await VolunteerRegistration.countDocuments({ 
            registrationType: 'volunteer',
            status: 'active'
        });
        
        const pendingVolunteers = await VolunteerRegistration.countDocuments({
            registrationType: 'volunteer',
            status: 'pending'
        });
        
        res.status(200).json({
            totalVolunteers,
            activeVolunteers,
            pendingVolunteers,
            byType: volunteersByType,
            byStatus: volunteersByStatus,
            byArea: volunteersByArea,
            bySkill: volunteersBySkill,
            byAvailability: volunteersByAvailability,
            backgroundCheck: backgroundCheckStats,
            orientation: orientationStats,
            byMonth: newVolunteersByMonth
        });
    } catch (error) {
        console.error('Get volunteer stats error:', error);
        res.status(500).json({ message: 'Error fetching volunteer statistics', error: error.message });
    }
};

module.exports = {
    createVolunteerRegistration,
    getVolunteerRegistrations,
    updateVolunteerRegistration,
    updateVolunteerStatus,
    getVolunteerStats
}; 