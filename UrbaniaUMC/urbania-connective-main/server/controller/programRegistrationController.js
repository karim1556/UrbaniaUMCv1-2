const ProgramRegistration = require('../models/ProgramRegistration');
const Program = require('../models/Program');
const { validateObjectId, validateEmail, validateRequired } = require('../utils/validation');

// Create a new program registration
const createProgramRegistration = async (req, res) => {
    try {
        const {
            // Personal information
            firstName, lastName, email, phone, address, city, state, zipCode,
            // Program details
            programId, programName, sessionPreference,
            // Participant details
            participantAge, participantGender, numberOfParticipants, additionalParticipants,
            // Emergency contact
            emergencyContact,
            // Medical information
            medicalInformation,
            // Payment information
            paymentInfo,
            // Scholarship
            scholarshipRequested, scholarshipDetails,
            // Special requests
            specialRequests
        } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({ message: 'First name, last name, email, and phone are required' });
        }

        if (!programId || !programName || !sessionPreference) {
            return res.status(400).json({ message: 'Program ID, name, and session preference are required' });
        }

        if (!emergencyContact || !emergencyContact.name || !emergencyContact.phone) {
            return res.status(400).json({ message: 'Emergency contact name and phone are required' });
        }

        // Validate programId
        if (!validateObjectId(programId)) {
            return res.status(400).json({ message: 'Invalid program ID' });
        }

        // Check if program exists
        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Check if program is open for registration
        if (program.status !== 'open' && program.status !== 'in_progress') {
            return res.status(400).json({ message: 'Program is not open for registration' });
        }

        // Check if program is full
        if (program.isFull) {
            return res.status(400).json({ message: 'Program is full' });
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
            
            // Program details
            program: programId,
            programName,
            sessionPreference,
            
            // Registration type will be set by the model
            registrationType: 'program',
            
            // Link to user if logged in
            user: req.user ? req.user._id : undefined,
            
            // Special requests
            specialRequests,
            
            // Participant details
            participantAge,
            participantGender,
            numberOfParticipants: numberOfParticipants || 1,
            ...(additionalParticipants && { additionalParticipants }),
            
            // Emergency contact
            emergencyContact,
            
            // Medical information
            ...(medicalInformation && { medicalInformation }),
            
            // Payment information
            fee: program.enrollment.registrationFee || 0,
            ...(paymentInfo && { paymentInfo }),
            
            // Scholarship
            scholarshipRequested: scholarshipRequested || false,
            ...(scholarshipDetails && { scholarshipDetails })
        };

        // Create registration
        const registration = new ProgramRegistration(registrationData);
        await registration.save();

        // Increment program enrollment count
        program.enrollment.currentEnrollment += 1;
        await program.save();

        // Return success with registration data
        res.status(201).json({
            message: 'Program registration created successfully',
            registration: {
                id: registration._id,
                programName: registration.programName,
                sessionPreference: registration.sessionPreference,
                status: registration.status
            }
        });
    } catch (error) {
        console.error('Create program registration error:', error);
        res.status(500).json({ message: 'Error creating program registration', error: error.message });
    }
};

// Get program registrations (with specific filtering)
const getProgramRegistrations = async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get filter parameters
        const { programId, sessionPreference, status, search } = req.query;
        
        // Build filter object
        const filter = { registrationType: 'program' };
        
        if (programId && validateObjectId(programId)) {
            filter.program = programId;
        }
        
        if (sessionPreference) {
            filter.sessionPreference = sessionPreference;
        }
        
        if (status) {
            filter.status = status;
        }
        
        // Search in name or email
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { programName: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get total for pagination
        const total = await ProgramRegistration.countDocuments(filter);
        
        // Get registrations
        const registrations = await ProgramRegistration.find(filter)
            .populate('user', 'name email')
            .populate('program', 'title category')
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
        console.error('Get program registrations error:', error);
        res.status(500).json({ message: 'Error fetching program registrations', error: error.message });
    }
};

// Update program registration (attendance)
const updateProgramRegistration = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            completed, completionDate, certificateIssued, certificateDetails,
            attendanceDates, medicalInformation, specialRequests, notes
        } = req.body;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid registration ID' });
        }

        // Find the registration
        const registration = await ProgramRegistration.findById(id);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Check permissions (admin only for completion details)
        if ((completed !== undefined || completionDate || certificateIssued || certificateDetails) && 
            !req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized to update completion details' });
        }

        // Update fields if provided
        if (completed !== undefined) registration.completed = completed;
        if (completionDate) registration.completionDate = new Date(completionDate);
        if (certificateIssued !== undefined) registration.certificateIssued = certificateIssued;
        if (certificateDetails) registration.certificateDetails = certificateDetails;
        if (attendanceDates) registration.attendanceDates = attendanceDates;
        if (medicalInformation) registration.medicalInformation = medicalInformation;
        if (specialRequests) registration.specialRequests = specialRequests;
        if (notes) registration.notes = notes;

        // Save updated registration
        await registration.save();

        res.status(200).json({
            message: 'Program registration updated successfully',
            registration: {
                id: registration._id,
                programName: registration.programName,
                completed: registration.completed,
                updatedAt: registration.updatedAt
            }
        });
    } catch (error) {
        console.error('Update program registration error:', error);
        res.status(500).json({ message: 'Error updating program registration', error: error.message });
    }
};

// Get program statistics
const getProgramStats = async (req, res) => {
    try {
        // Total registrations by program
        const registrationsByProgram = await ProgramRegistration.aggregate([
            { $match: { registrationType: 'program' } },
            { $group: { _id: '$program', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Registrations by program with program details
        const programDetails = await Program.find({
            _id: { $in: registrationsByProgram.map(r => r._id) }
        }, 'title category');
        
        const programMap = {};
        programDetails.forEach(p => {
            programMap[p._id] = { title: p.title, category: p.category };
        });
        
        const registrationsByProgramWithDetails = registrationsByProgram.map(r => ({
            program: r._id,
            programTitle: programMap[r._id] ? programMap[r._id].title : 'Unknown',
            programCategory: programMap[r._id] ? programMap[r._id].category : 'Unknown',
            count: r.count
        }));
        
        // Total registrations by session preference
        const registrationsBySession = await ProgramRegistration.aggregate([
            { $match: { registrationType: 'program' } },
            { $group: { _id: '$sessionPreference', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Total registrations by completion status
        const registrationsByCompletion = await ProgramRegistration.aggregate([
            { $match: { registrationType: 'program' } },
            { $group: { _id: '$completed', count: { $sum: 1 } } }
        ]);
        
        // Registrations by month
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const registrationsByMonth = await ProgramRegistration.aggregate([
            { $match: { registrationType: 'program', createdAt: { $gte: sixMonthsAgo } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        res.status(200).json({
            byProgram: registrationsByProgramWithDetails,
            bySession: registrationsBySession,
            byCompletion: {
                completed: registrationsByCompletion.find(r => r._id === true)?.count || 0,
                inProgress: registrationsByCompletion.find(r => r._id === false)?.count || 0
            },
            byMonth: registrationsByMonth
        });
    } catch (error) {
        console.error('Get program stats error:', error);
        res.status(500).json({ message: 'Error fetching program statistics', error: error.message });
    }
};

module.exports = {
    createProgramRegistration,
    getProgramRegistrations,
    updateProgramRegistration,
    getProgramStats
}; 