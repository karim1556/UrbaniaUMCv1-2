const Post = require('../models/Post');
const Community = require('../models/Community');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { validatePost } = require('../validators/postValidator');

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { error } = validatePost(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Check if community exists and user is a member
        const community = await Community.findById(req.body.community);
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        const isMember = community.members.some(member =>
            member.user.toString() === req.user._id.toString()
        );

        if (!isMember) {
            return res.status(403).json({ error: 'Must be a community member to create posts' });
        }

        // Handle attachments
        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = await Promise.all(
                req.files.map(async (file) => {
                    const upload = await uploadToCloudinary(file);
                    return {
                        type: file.mimetype.startsWith('image/') ? 'image' :
                            file.mimetype.startsWith('video/') ? 'video' : 'document',
                        url: upload.url,
                        title: file.originalname
                    };
                })
            );
        }

        const post = new Post({
            ...req.body,
            author: req.user._id,
            attachments
        });

        await post.save();

        // Update community statistics
        community.statistics.postCount += 1;
        await community.save();

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all posts with pagination and filters
exports.getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, community, topic, type, search } = req.query;
        const query = { status: 'active' };

        if (community) query.community = community;
        if (topic) query.topic = topic;
        if (type) query.type = type;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await Post.find(query)
            .sort({ isPinned: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('author', 'name avatar')
            .populate('community', 'name')
            .populate('comments.author', 'name avatar');

        const total = await Post.countDocuments(query);

        res.json({
            posts,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single post
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name avatar')
            .populate('community', 'name')
            .populate('comments.author', 'name avatar')
            .populate('comments.replies.author', 'name avatar');

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Increment view count
        post.views += 1;
        await post.save();

        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a post
exports.updatePost = async (req, res) => {
    try {
        const { error } = validatePost(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this post' });
        }

        // Handle new attachments
        let attachments = [...post.attachments];
        if (req.files && req.files.length > 0) {
            const newAttachments = await Promise.all(
                req.files.map(async (file) => {
                    const upload = await uploadToCloudinary(file);
                    return {
                        type: file.mimetype.startsWith('image/') ? 'image' :
                            file.mimetype.startsWith('video/') ? 'video' : 'document',
                        url: upload.url,
                        title: file.originalname
                    };
                })
            );
            attachments = [...attachments, ...newAttachments];
        }

        Object.assign(post, req.body);
        post.attachments = attachments;

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user is the author or a moderator
        const community = await Community.findById(post.community);
        const isAuthor = post.author.toString() === req.user._id.toString();
        const isModerator = community.moderators.includes(req.user._id);

        if (!isAuthor && !isModerator) {
            return res.status(403).json({ error: 'Not authorized to delete this post' });
        }

        // Update community statistics
        community.statistics.postCount -= 1;
        await community.save();

        await post.remove();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add comment to post
exports.addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if post is locked
        if (post.isLocked) {
            return res.status(400).json({ error: 'Post is locked' });
        }

        const comment = await post.addComment(content, req.user._id);
        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add reply to comment
exports.addReply = async (req, res) => {
    try {
        const { content } = req.body;
        const { commentId } = req.params;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if post is locked
        if (post.isLocked) {
            return res.status(400).json({ error: 'Post is locked' });
        }

        const comment = await post.addReply(commentId, content, req.user._id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.json(comment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Like/Unlike post
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const isLiked = post.likes.includes(req.user._id);
        if (isLiked) {
            await post.unlike(req.user._id);
            res.json({ message: 'Post unliked successfully' });
        } else {
            await post.like(req.user._id);
            res.json({ message: 'Post liked successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Pin/Unpin post
exports.togglePin = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user is a moderator
        const community = await Community.findById(post.community);
        const isModerator = community.moderators.includes(req.user._id);

        if (!isModerator) {
            return res.status(403).json({ error: 'Not authorized to pin/unpin posts' });
        }

        if (post.isPinned) {
            await post.unpin();
            res.json({ message: 'Post unpinned successfully' });
        } else {
            await post.pin();
            res.json({ message: 'Post pinned successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lock/Unlock post
exports.toggleLock = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user is a moderator
        const community = await Community.findById(post.community);
        const isModerator = community.moderators.includes(req.user._id);

        if (!isModerator) {
            return res.status(403).json({ error: 'Not authorized to lock/unlock posts' });
        }

        if (post.isLocked) {
            await post.unlock();
            res.json({ message: 'Post unlocked successfully' });
        } else {
            await post.lock();
            res.json({ message: 'Post locked successfully' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark post as solved
exports.markAsSolved = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to mark post as solved' });
        }

        await post.markAsSolved(req.user._id);
        res.json({ message: 'Post marked as solved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get posts by community
exports.getPostsByCommunity = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const posts = await Post.getPostsByCommunity(req.params.communityId, page, limit);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get posts by author
exports.getPostsByAuthor = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const posts = await Post.getPostsByAuthor(req.params.authorId, page, limit);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get posts by topic
exports.getPostsByTopic = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const posts = await Post.getPostsByTopic(req.params.topicId, page, limit);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 