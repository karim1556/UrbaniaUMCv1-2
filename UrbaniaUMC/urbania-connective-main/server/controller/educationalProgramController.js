const EducationalProgram = require('../models/EducationalProgram');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { validateObjectId } = require('../utils/validation');

// Create a new educational program
exports.createProgram = async (req, res) => {
    try {
        const program = new EducationalProgram({
            ...req.body,
            instructor: req.user._id
        });
        await program.save();
        res.status(201).json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all educational programs with filters
exports.getAllPrograms = async (req, res) => {
    try {
        const { type, category, status, mode } = req.query;
        const query = {};

        if (type) query.type = type;
        if (category) query.category = category;
        if (status) query.status = status;
        if (mode) query.mode = mode;

        const programs = await EducationalProgram.find(query)
            .populate('instructor', 'name email')
            .sort({ 'schedule.startDate': 1 });
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single program by ID
exports.getProgram = async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid program ID' });
        }

        const program = await EducationalProgram.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('enrolledStudents.user', 'name email');

        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        res.json(program);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a program
exports.updateProgram = async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid program ID' });
        }

        const program = await EducationalProgram.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Check if user is instructor or admin
        if (program.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this program' });
        }

        Object.assign(program, req.body);
        await program.save();
        res.json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a program
exports.deleteProgram = async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid program ID' });
        }

        const program = await EducationalProgram.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Only admin can delete programs
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete programs' });
        }

        await program.remove();
        res.json({ message: 'Program deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Enroll in a program
exports.enrollInProgram = async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid program ID' });
        }

        const program = await EducationalProgram.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Check if program is full
        if (program.enrolledStudents.length >= program.capacity) {
            return res.status(400).json({ message: 'Program is full' });
        }

        // Check if user is already enrolled
        const isEnrolled = program.enrolledStudents.some(
            student => student.user.toString() === req.user._id.toString()
        );
        if (isEnrolled) {
            return res.status(400).json({ message: 'Already enrolled in this program' });
        }

        program.enrolledStudents.push({
            user: req.user._id,
            enrolledAt: new Date()
        });

        await program.save();
        res.json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update enrollment status
exports.updateEnrollmentStatus = async (req, res) => {
    try {
        if (!validateObjectId(req.params.id) || !validateObjectId(req.params.userId)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const program = await EducationalProgram.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Only instructor or admin can update enrollment status
        if (program.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update enrollment status' });
        }

        const enrollment = program.enrolledStudents.find(
            student => student.user.toString() === req.params.userId
        );

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment not found' });
        }

        enrollment.status = req.body.status;
        await program.save();
        res.json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add program resources
exports.addResource = async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: 'Invalid program ID' });
        }

        const program = await EducationalProgram.findById(req.params.id);
        if (!program) {
            return res.status(404).json({ message: 'Program not found' });
        }

        // Only instructor or admin can add resources
        if (program.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to add resources' });
        }

        let fileUrl = null;
        if (req.file) {
            fileUrl = await uploadToCloudinary(req.file);
        }

        program.resources.push({
            ...req.body,
            fileUrl: fileUrl || req.body.fileUrl
        });

        await program.save();
        res.json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 