const Workshop = require('../models/Workshop');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { validateWorkshop } = require('../validators/workshopValidator');

// Create a new workshop
exports.createWorkshop = async (req, res) => {
    try {
        const { error } = validateWorkshop(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        let image = null;
        if (req.file) {
            image = await uploadToCloudinary(req.file);
        }

        const workshop = new Workshop({
            ...req.body,
            image,
            instructor: req.user._id
        });

        await workshop.save();
        res.status(201).json(workshop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all workshops with pagination and filters
exports.getWorkshops = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, status, search } = req.query;
        const query = {};

        if (category) query.category = category;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const workshops = await Workshop.find(query)
            .sort({ startDate: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('instructor', 'name avatar');

        const total = await Workshop.countDocuments(query);

        res.json({
            workshops,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single workshop
exports.getWorkshop = async (req, res) => {
    try {
        const workshop = await Workshop.findById(req.params.id)
            .populate('instructor', 'name avatar')
            .populate('registeredParticipants', 'name avatar');

        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        res.json(workshop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a workshop
exports.updateWorkshop = async (req, res) => {
    try {
        const { error } = validateWorkshop(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        let image = null;
        if (req.file) {
            image = await uploadToCloudinary(req.file);
        }

        const workshop = await Workshop.findById(req.params.id);
        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        // Check if user is the instructor
        if (workshop.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this workshop' });
        }

        Object.assign(workshop, req.body);
        if (image) workshop.image = image;

        await workshop.save();
        res.json(workshop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a workshop
exports.deleteWorkshop = async (req, res) => {
    try {
        const workshop = await Workshop.findById(req.params.id);
        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        // Check if user is the instructor
        if (workshop.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this workshop' });
        }

        await workshop.remove();
        res.json({ message: 'Workshop deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Register for a workshop
exports.registerForWorkshop = async (req, res) => {
    try {
        const workshop = await Workshop.findById(req.params.id);
        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        const canRegister = await workshop.canRegister(req.user._id);
        if (!canRegister) {
            return res.status(400).json({ error: 'Cannot register for this workshop' });
        }

        await workshop.addParticipant(req.user._id);
        res.json({ message: 'Successfully registered for workshop' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unregister from a workshop
exports.unregisterFromWorkshop = async (req, res) => {
    try {
        const workshop = await Workshop.findById(req.params.id);
        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        const success = await workshop.removeParticipant(req.user._id);
        if (!success) {
            return res.status(400).json({ error: 'Not registered for this workshop' });
        }

        res.json({ message: 'Successfully unregistered from workshop' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add review to a workshop
exports.addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const workshop = await Workshop.findById(req.params.id);

        if (!workshop) {
            return res.status(404).json({ error: 'Workshop not found' });
        }

        // Check if user has attended the workshop
        if (!workshop.registeredParticipants.includes(req.user._id)) {
            return res.status(403).json({ error: 'Must attend workshop to add review' });
        }

        await workshop.addReview(req.user._id, rating, comment);
        res.json(workshop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get upcoming workshops
exports.getUpcomingWorkshops = async (req, res) => {
    try {
        const workshops = await Workshop.getUpcomingWorkshops();
        res.json(workshops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get workshops by category
exports.getWorkshopsByCategory = async (req, res) => {
    try {
        const workshops = await Workshop.getWorkshopsByCategory(req.params.category);
        res.json(workshops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get workshops by instructor
exports.getWorkshopsByInstructor = async (req, res) => {
    try {
        const workshops = await Workshop.getWorkshopsByInstructor(req.params.instructorId);
        res.json(workshops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 