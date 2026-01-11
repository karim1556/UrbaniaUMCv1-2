const ServiceRequest = require('../models/ServiceRequest');
const { validateObjectId, validateEmail, validateRequired } = require('../utils/validation');
const mongoose = require('mongoose');

// Create a new service request
const createServiceRequest = async (req, res) => {
    try {
        const {
            // Personal information
            firstName, lastName, email, phone, address, city, state, zipCode,
            // Service details
            serviceType, requestTitle, description, urgency,
            // Service scheduling
            preferredDate, preferredTime, recurring, recurringFrequency,
            // Household members
            householdMembers,
            // Income and eligibility
            incomeVerification,
            // Referral information
            referredBy,
            // Supporting documents
            supportingDocuments,
            // Special requests
            specialRequests
        } = req.body;

        // Basic validation
        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({ message: 'First name, last name, email, and phone are required' });
        }

        if (!serviceType || !requestTitle || !description) {
            return res.status(400).json({ message: 'Service type, title, and description are required' });
        }

        // Create service request data
        const serviceRequestData = {
            // Personal information
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            state,
            zipCode,
            
            // Service details
            serviceType,
            requestTitle,
            description,
            urgency: urgency || 'medium',
            
            // Service scheduling
            ...(preferredDate && { preferredDate: new Date(preferredDate) }),
            ...(preferredTime && { preferredTime }),
            recurring: recurring || false,
            ...(recurring && recurringFrequency && { recurringFrequency }),
            
            // Household members
            ...(householdMembers && { householdMembers }),
            
            // Income and eligibility
            ...(incomeVerification && { incomeVerification }),
            
            // Referral information
            ...(referredBy && { referredBy }),
            
            // Supporting documents
            ...(supportingDocuments && { supportingDocuments }),
            
            // Registration type will be set by the model
            registrationType: 'service',
            
            // Link to user if logged in
            user: req.user ? req.user._id : undefined,
            
            // Special requests
            specialRequests
        };

        // Create service request
        const serviceRequest = new ServiceRequest(serviceRequestData);
        await serviceRequest.save();

        // Return success with service request data
        res.status(201).json({
            message: 'Service request created successfully',
            serviceRequest: {
                id: serviceRequest._id,
                serviceType: serviceRequest.serviceType,
                requestTitle: serviceRequest.requestTitle,
                status: serviceRequest.status
            }
        });
    } catch (error) {
        console.error('Create service request error:', error);
        res.status(500).json({ message: 'Error creating service request', error: error.message });
    }
};

// Get service requests (with specific filtering)
const getServiceRequests = async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get filter parameters
        const { 
            serviceType, urgency, status, search, 
            assignedTo, completionStatus, preferredDateFrom, 
            preferredDateTo, followUpRequired 
        } = req.query;
        
        // Build filter object
        const filter = { registrationType: 'service' };
        
        if (serviceType) {
            filter.serviceType = serviceType;
        }
        
        if (urgency) {
            filter.urgency = urgency;
        }
        
        if (status) {
            filter.status = status;
        }
        
        if (completionStatus) {
            filter.completionStatus = completionStatus;
        }
        
        if (assignedTo && validateObjectId(assignedTo)) {
            filter.assignedTo = assignedTo;
        }
        
        if (followUpRequired !== undefined) {
            filter.followUpRequired = followUpRequired === 'true';
        }
        
        // Filter by preferred date
        if (preferredDateFrom || preferredDateTo) {
            filter.preferredDate = {};
            if (preferredDateFrom) {
                filter.preferredDate.$gte = new Date(preferredDateFrom);
            }
            if (preferredDateTo) {
                filter.preferredDate.$lte = new Date(preferredDateTo);
            }
        }
        
        // Search in name, email, or title
        if (search) {
            filter.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { requestTitle: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get total for pagination
        const total = await ServiceRequest.countDocuments(filter);
        
        // Get service requests
        const serviceRequests = await ServiceRequest.find(filter)
            .populate('user', 'name email')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        res.status(200).json({
            serviceRequests,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });
    } catch (error) {
        console.error('Get service requests error:', error);
        res.status(500).json({ message: 'Error fetching service requests', error: error.message });
    }
};

// Update service request
const updateServiceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            urgency, preferredDate, preferredTime, recurring, recurringFrequency,
            householdMembers, incomeVerification, specialRequests,
            assignedTo, completionStatus, completionDate, completionNotes,
            followUpRequired, followUpDate, followUpNotes,
            supportingDocuments, serviceDelivery
        } = req.body;

        // Validate ID
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid service request ID' });
        }

        // Find the service request
        const serviceRequest = await ServiceRequest.findById(id);
        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        // Check permissions (admin only for assignment, completion, and service delivery details)
        const needsAdminPrivilege = assignedTo !== undefined || 
                                    completionStatus !== undefined || 
                                    completionDate !== undefined || 
                                    serviceDelivery !== undefined;
                                    
        if (needsAdminPrivilege && !req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized to update these service request details' });
        }

        // Update fields if provided
        if (urgency) serviceRequest.urgency = urgency;
        if (preferredDate) serviceRequest.preferredDate = new Date(preferredDate);
        if (preferredTime) serviceRequest.preferredTime = preferredTime;
        if (recurring !== undefined) serviceRequest.recurring = recurring;
        if (recurringFrequency) serviceRequest.recurringFrequency = recurringFrequency;
        if (householdMembers) serviceRequest.householdMembers = householdMembers;
        if (incomeVerification) serviceRequest.incomeVerification = incomeVerification;
        if (specialRequests) serviceRequest.specialRequests = specialRequests;
        
        // Admin-only updates
        if (assignedTo) {
            serviceRequest.assignedTo = assignedTo;
            serviceRequest.assignmentDate = new Date();
        }
        
        if (completionStatus) {
            serviceRequest.completionStatus = completionStatus;
            
            // If completing the service, update the main status as well
            if (completionStatus === 'completed') {
                serviceRequest.status = 'completed';
                serviceRequest.statusHistory.push({
                    status: 'completed',
                    timestamp: new Date(),
                    note: 'Service request completed'
                });
            }
        }
        
        if (completionDate) serviceRequest.completionDate = new Date(completionDate);
        if (completionNotes) serviceRequest.completionNotes = completionNotes;
        
        if (followUpRequired !== undefined) serviceRequest.followUpRequired = followUpRequired;
        if (followUpDate) serviceRequest.followUpDate = new Date(followUpDate);
        
        if (followUpNotes) {
            const newNote = {
                date: new Date(),
                note: followUpNotes,
                by: req.user._id
            };
            
            if (!serviceRequest.followUpNotes) {
                serviceRequest.followUpNotes = [newNote];
            } else {
                serviceRequest.followUpNotes.push(newNote);
            }
        }
        
        if (supportingDocuments) {
            if (!serviceRequest.supportingDocuments) {
                serviceRequest.supportingDocuments = supportingDocuments;
            } else {
                serviceRequest.supportingDocuments = [
                    ...serviceRequest.supportingDocuments,
                    ...supportingDocuments
                ];
            }
        }
        
        if (serviceDelivery) {
            if (!serviceRequest.serviceDelivery) {
                serviceRequest.serviceDelivery = serviceDelivery;
            } else {
                serviceRequest.serviceDelivery = [
                    ...serviceRequest.serviceDelivery,
                    ...serviceDelivery
                ];
            }
        }

        // Save updated service request
        await serviceRequest.save();

        res.status(200).json({
            message: 'Service request updated successfully',
            serviceRequest: {
                id: serviceRequest._id,
                requestTitle: serviceRequest.requestTitle,
                status: serviceRequest.status,
                completionStatus: serviceRequest.completionStatus,
                updatedAt: serviceRequest.updatedAt
            }
        });
    } catch (error) {
        console.error('Update service request error:', error);
        res.status(500).json({ message: 'Error updating service request', error: error.message });
    }
};

// Assign service request
const assignServiceRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;

        // Validate IDs
        if (!validateObjectId(id) || (assignedTo && !validateObjectId(assignedTo))) {
            return res.status(400).json({ message: 'Invalid ID provided' });
        }

        // Only admins can assign service requests
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized to assign service requests' });
        }

        // Find the service request
        const serviceRequest = await ServiceRequest.findById(id);
        if (!serviceRequest) {
            return res.status(404).json({ message: 'Service request not found' });
        }

        // Assign to staff member
        serviceRequest.assignedTo = assignedTo;
        serviceRequest.assignmentDate = new Date();
        
        // If request was pending, change to in_progress
        if (serviceRequest.completionStatus === 'pending') {
            serviceRequest.completionStatus = 'in_progress';
        }
        
        await serviceRequest.save();

        res.status(200).json({
            message: 'Service request assigned successfully',
            serviceRequest: {
                id: serviceRequest._id,
                requestTitle: serviceRequest.requestTitle,
                assignedTo: serviceRequest.assignedTo,
                assignmentDate: serviceRequest.assignmentDate
            }
        });
    } catch (error) {
        console.error('Assign service request error:', error);
        res.status(500).json({ message: 'Error assigning service request', error: error.message });
    }
};

// Get service statistics
const getServiceStats = async (req, res) => {
    try {
        // Total requests by service type
        const requestsByType = await ServiceRequest.aggregate([
            { $match: { registrationType: 'service' } },
            { $group: { _id: '$serviceType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Total requests by urgency
        const requestsByUrgency = await ServiceRequest.aggregate([
            { $match: { registrationType: 'service' } },
            { $group: { _id: '$urgency', count: { $sum: 1 } } },
            { $sort: { 
                _id: 1,
                // Custom sort for urgency levels
                $computed: { 
                    $switch: {
                        branches: [
                            { case: { $eq: ['$_id', 'low'] }, then: 1 },
                            { case: { $eq: ['$_id', 'medium'] }, then: 2 },
                            { case: { $eq: ['$_id', 'high'] }, then: 3 },
                            { case: { $eq: ['$_id', 'emergency'] }, then: 4 }
                        ],
                        default: 5
                    }
                }
            } }
        ]);
        
        // Total requests by completion status
        const requestsByCompletionStatus = await ServiceRequest.aggregate([
            { $match: { registrationType: 'service' } },
            { $group: { _id: '$completionStatus', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        // Requests by staff member (assigned to)
        const requestsByStaff = await ServiceRequest.aggregate([
            { $match: { registrationType: 'service', assignedTo: { $exists: true, $ne: null } } },
            { $group: { 
                _id: '$assignedTo', 
                count: { $sum: 1 },
                completed: { $sum: { $cond: [{ $eq: ['$completionStatus', 'completed'] }, 1, 0] } },
                pending: { $sum: { $cond: [{ $eq: ['$completionStatus', 'pending'] }, 1, 0] } },
                inProgress: { $sum: { $cond: [{ $eq: ['$completionStatus', 'in_progress'] }, 1, 0] } }
            } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        // Get staff member details
        const staffIds = requestsByStaff.map(r => r._id);
        const staffMembers = await mongoose.model('User').find(
            { _id: { $in: staffIds } }, 
            'name email'
        );
        
        const staffMap = {};
        staffMembers.forEach(s => {
            staffMap[s._id] = { name: s.name, email: s.email };
        });
        
        const requestsByStaffWithDetails = requestsByStaff.map(r => ({
            staffId: r._id,
            staffName: staffMap[r._id] ? staffMap[r._id].name : 'Unknown',
            staffEmail: staffMap[r._id] ? staffMap[r._id].email : 'Unknown',
            totalRequests: r.count,
            completedRequests: r.completed,
            pendingRequests: r.pending,
            inProgressRequests: r.inProgress,
            completionRate: r.count > 0 ? Math.round((r.completed / r.count) * 100) : 0
        }));
        
        // Requests by month
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const requestsByMonth = await ServiceRequest.aggregate([
            { $match: { registrationType: 'service', createdAt: { $gte: sixMonthsAgo } } },
            { $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        // Total counts
        const totalRequests = await ServiceRequest.countDocuments({ registrationType: 'service' });
        const pendingRequests = await ServiceRequest.countDocuments({ 
            registrationType: 'service', 
            completionStatus: { $in: ['pending', 'in_progress'] }
        });
        const completedRequests = await ServiceRequest.countDocuments({ 
            registrationType: 'service', 
            completionStatus: 'completed' 
        });
        const unassignedRequests = await ServiceRequest.countDocuments({
            registrationType: 'service',
            assignedTo: { $exists: false }
        });
        const needsFollowUp = await ServiceRequest.countDocuments({
            registrationType: 'service',
            followUpRequired: true,
            completionStatus: { $ne: 'completed' }
        });
        
        res.status(200).json({
            totalRequests,
            pendingRequests,
            completedRequests,
            unassignedRequests,
            needsFollowUp,
            byType: requestsByType,
            byUrgency: requestsByUrgency,
            byCompletionStatus: requestsByCompletionStatus,
            byStaff: requestsByStaffWithDetails,
            byMonth: requestsByMonth
        });
    } catch (error) {
        console.error('Get service stats error:', error);
        res.status(500).json({ message: 'Error fetching service statistics', error: error.message });
    }
};

module.exports = {
    createServiceRequest,
    getServiceRequests,
    updateServiceRequest,
    assignServiceRequest,
    getServiceStats
}; 