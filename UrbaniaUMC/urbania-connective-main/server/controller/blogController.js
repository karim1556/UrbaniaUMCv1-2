const Blog = require('../models/Blog');
const { cloudinary } = require('../config/cloudinary');

// Create new blog post
const createBlogPost = async (req, res) => {
    try {
        const {
            title,
            content,
            excerpt,
            category,
            tags
        } = req.body;

        // Handle image upload
        let featuredImage = {};
        if (req.file) {
            featuredImage = {
                public_id: req.file.filename,
                url: req.file.path
            };
        }

        const blogPost = new Blog({
            title,
            content,
            excerpt,
            category,
            tags,
            featuredImage,
            author: req.user._id,
            status: req.user.roles.includes('admin') || req.user.roles.includes('editor')
                ? 'published'
                : 'pending'
        });

        await blogPost.save();

        res.status(201).json({
            message: 'Blog post created successfully',
            blogPost
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating blog post', error: error.message });
    }
};

// Get all blog posts (with filters)
const getAllBlogPosts = async (req, res) => {
    try {
        const {
            status,
            category,
            author,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10
        } = req.query;

        // Build query
        const query = {};

        // If user is not admin/editor, only show published posts
        if (!req.user?.roles.includes('admin') && !req.user?.roles.includes('editor')) {
            query.status = 'published';
        } else if (status) {
            query.status = status;
        }

        if (category) {
            query.category = category;
        }

        if (author) {
            query.author = author;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { excerpt: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Calculate pagination
        const skip = (page - 1) * limit;

        const posts = await Blog.find(query)
            .populate('author', 'username email')
            .populate('publishedBy', 'username email')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Blog.countDocuments(query);

        res.json({
            posts,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blog posts', error: error.message });
    }
};

// Get single blog post
const getBlogPost = async (req, res) => {
    try {
        const post = await Blog.findOne({ slug: req.params.slug })
            .populate('author', 'username email')
            .populate('publishedBy', 'username email')
            .populate('comments.user', 'username email');

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Increment view count
        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blog post', error: error.message });
    }
};

// Update blog post
const updateBlogPost = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Check authorization
        if (!req.user.roles.includes('admin') &&
            !req.user.roles.includes('editor') &&
            post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this post' });
        }

        const updateData = { ...req.body };

        // Handle image upload
        if (req.file) {
            // Delete old image from Cloudinary
            if (post.featuredImage.public_id) {
                await cloudinary.uploader.destroy(post.featuredImage.public_id);
            }

            updateData.featuredImage = {
                public_id: req.file.filename,
                url: req.file.path
            };
        }

        const updatedPost = await Blog.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            message: 'Blog post updated successfully',
            post: updatedPost
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating blog post', error: error.message });
    }
};

// Delete blog post
const deleteBlogPost = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Only admin can delete posts
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        // Delete image from Cloudinary
        if (post.featuredImage.public_id) {
            await cloudinary.uploader.destroy(post.featuredImage.public_id);
        }

        await post.deleteOne();

        res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting blog post', error: error.message });
    }
};

// Publish blog post
const publishBlogPost = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Only admin and editor can publish posts
        if (!req.user.roles.includes('admin') && !req.user.roles.includes('editor')) {
            return res.status(403).json({ message: 'Not authorized to publish posts' });
        }

        post.status = 'published';
        post.publishedBy = req.user._id;
        post.publishedAt = new Date();
        await post.save();

        res.json({
            message: 'Blog post published successfully',
            post
        });
    } catch (error) {
        res.status(500).json({ message: 'Error publishing blog post', error: error.message });
    }
};

// Add comment to blog post
const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        post.comments.push({
            user: req.user._id,
            content
        });

        await post.save();

        res.json({
            message: 'Comment added successfully',
            post
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment', error: error.message });
    }
};

// Like/Unlike blog post
const toggleLike = async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);
        if (likeIndex === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();

        res.json({
            message: likeIndex === -1 ? 'Post liked successfully' : 'Post unliked successfully',
            post
        });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling like', error: error.message });
    }
};

module.exports = {
    createBlogPost,
    getAllBlogPosts,
    getBlogPost,
    updateBlogPost,
    deleteBlogPost,
    publishBlogPost,
    addComment,
    toggleLike
}; 