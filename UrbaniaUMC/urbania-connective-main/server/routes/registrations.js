// Get registration details by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const registration = await EventRegistration.findById(req.params.id)
      .populate('event', 'title location time')
      .lean();

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if the user has permission to view this registration
    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this registration' });
    }

    res.json(registration);
  } catch (error) {
    console.error('Error fetching registration details:', error);
    res.status(500).json({ message: 'Server error' });
  }
}); 