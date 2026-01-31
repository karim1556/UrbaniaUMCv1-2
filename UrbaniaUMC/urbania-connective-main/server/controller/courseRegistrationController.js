const CourseRegistration = require('../models/CourseRegistration');
const { sendMailEducationRegistration } = require('../config/mail');

const createCourseRegistration = async (req, res) => {
  try {
    const {
      userId, name, email, phone, age, gender, address, level, experience, preferredSchedule, specialRequests, courseId, courseTitle
    } = req.body;
    if (!name || !email || !phone || !age || !gender || !address || !level || !courseId || !courseTitle) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const registration = new CourseRegistration({
      userId, name, email, phone, age, gender, address, level, experience, preferredSchedule, specialRequests, courseId, courseTitle
    });
    await registration.save();
    console.log('Course registration saved:', { id: registration._id, email, name, courseId, courseTitle });

    // Log before sending response
    console.log('Sending registration response for:', registration._id);
    res.status(201).json({ message: 'Registration successful.' });

    // Send email AFTER response (using setImmediate to ensure it runs in next tick)
    setImmediate(async () => {
      try {
        await sendMailEducationRegistration(email, name, courseTitle);
        console.log(`Education registration email sent to ${email}`);
      } catch (emailError) {
        console.error(`Failed to send education registration email:`, emailError);
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await CourseRegistration.find().sort({ date: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    // req.user is populated by the auth middleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const registrations = await CourseRegistration.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await CourseRegistration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!registration) {
      return res.status(404).json({ msg: 'Registration not found' });
    }

    res.json(registration);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  createCourseRegistration,
  getAllRegistrations,
  getMyRegistrations,
  updateRegistrationStatus,
}; 