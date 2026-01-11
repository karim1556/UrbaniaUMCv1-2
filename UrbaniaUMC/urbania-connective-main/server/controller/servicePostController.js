const ServicePost = require('../models/ServicePost');

// Create a new service post (admin)
const createServicePost = async (req, res) => {
  try {
    const { serviceId, title, description, phone, images, meta } = req.body;
    if (!serviceId || !title || !description) {
      return res.status(400).json({ message: 'serviceId, title and description are required' });
    }

    const post = new ServicePost({
      serviceId,
      title,
      description,
      phone,
      images: images || [],
      meta: meta || {},
      createdBy: req.user ? req.user._id : undefined
    });

    await post.save();
    res.status(201).json({ message: 'Service post created', post });
  } catch (error) {
    console.error('Create service post error:', error);
    res.status(500).json({ message: 'Error creating service post', error: error.message });
  }
};

// Get posts (optionally filter by serviceId)
const getServicePosts = async (req, res) => {
  try {
    const { serviceId } = req.query;
    const filter = {};
    if (serviceId) filter.serviceId = serviceId;
    const posts = await ServicePost.find(filter).sort({ createdAt: -1 }).lean();
    res.json(posts);
  } catch (error) {
    console.error('Get service posts error:', error);
    res.status(500).json({ message: 'Error fetching service posts', error: error.message });
  }
};

// Get single post by id
const getServicePostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await ServicePost.findById(id).lean();
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    console.error('Get service post by id error:', error);
    res.status(500).json({ message: 'Error fetching service post', error: error.message });
  }
};

module.exports = { createServicePost, getServicePosts, getServicePostById };
