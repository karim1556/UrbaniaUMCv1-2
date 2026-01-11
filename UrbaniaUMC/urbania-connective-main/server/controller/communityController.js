const Community = require('../models/Community');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { validateCommunity } = require('../validators/communityValidator');

// Create a new community
exports.createCommunity = async (req, res) => {
    try {
        const { error } = validateCommunity(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        let image = null;
        if (req.file) {
            image = await uploadToCloudinary(req.file);
        }

        const community = new Community({
            ...req.body,
            image,
            creator: req.user._id,
            moderators: [req.user._id],
            members: [{ user: req.user._id, role: 'admin' }]
        });

        await community.save();
        res.status(201).json(community);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all communities with pagination and filters
exports.getCommunities = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        const query = { status: 'active' };

        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const communities = await Community.find(query)
            .sort({ 'statistics.memberCount': -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('creator', 'name avatar')
            .populate('moderators', 'name avatar');

        const total = await Community.countDocuments(query);

        res.json({
            communities,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single community
exports.getCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id)
            .populate('creator', 'name avatar')
            .populate('moderators', 'name avatar')
            .populate('members.user', 'name avatar');

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        res.json(community);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a community
exports.updateCommunity = async (req, res) => {
    try {
        const { error } = validateCommunity(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        let image = null;
        if (req.file) {
            image = await uploadToCloudinary(req.file);
        }

        const community = await Community.findById(req.params.id);
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is admin or moderator
        const isAdmin = community.members.some(member =>
            member.user.toString() === req.user._id.toString() && member.role === 'admin'
        );
        const isModerator = community.moderators.includes(req.user._id);

        if (!isAdmin && !isModerator) {
            return res.status(403).json({ error: 'Not authorized to update this community' });
        }

        Object.assign(community, req.body);
        if (image) community.image = image;

        await community.save();
        res.json(community);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a community
exports.deleteCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is admin
        const isAdmin = community.members.some(member =>
            member.user.toString() === req.user._id.toString() && member.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this community' });
        }

        await community.remove();
        res.json({ message: 'Community deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Join a community
exports.joinCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if community is private and requires approval
        if (community.settings.isPrivate && community.settings.requireApproval) {
            // Add to pending members
            community.pendingMembers = community.pendingMembers || [];
            if (!community.pendingMembers.includes(req.user._id)) {
                community.pendingMembers.push(req.user._id);
                await community.save();
                return res.json({ message: 'Join request sent for approval' });
            }
            return res.status(400).json({ error: 'Join request already sent' });
        }

        const success = await community.addMember(req.user._id);
        if (!success) {
            return res.status(400).json({ error: 'Already a member of this community' });
        }

        res.json({ message: 'Successfully joined community' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Leave a community
exports.leaveCommunity = async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is the creator
        if (community.creator.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'Creator cannot leave the community' });
        }

        const success = await community.removeMember(req.user._id);
        if (!success) {
            return res.status(400).json({ error: 'Not a member of this community' });
        }

        res.json({ message: 'Successfully left community' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add moderator to community
exports.addModerator = async (req, res) => {
    try {
        const { userId } = req.body;
        const community = await Community.findById(req.params.id);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is admin
        const isAdmin = community.members.some(member =>
            member.user.toString() === req.user._id.toString() && member.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({ error: 'Not authorized to add moderators' });
        }

        const success = await community.addModerator(userId);
        if (!success) {
            return res.status(400).json({ error: 'User is already a moderator' });
        }

        res.json({ message: 'Successfully added moderator' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove moderator from community
exports.removeModerator = async (req, res) => {
    try {
        const { userId } = req.body;
        const community = await Community.findById(req.params.id);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is admin
        const isAdmin = community.members.some(member =>
            member.user.toString() === req.user._id.toString() && member.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({ error: 'Not authorized to remove moderators' });
        }

        const success = await community.removeModerator(userId);
        if (!success) {
            return res.status(400).json({ error: 'User is not a moderator' });
        }

        res.json({ message: 'Successfully removed moderator' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add announcement to community
exports.addAnnouncement = async (req, res) => {
    try {
        const { title, content, priority } = req.body;
        const community = await Community.findById(req.params.id);

        if (!community) {
            return res.status(404).json({ error: 'Community not found' });
        }

        // Check if user is admin or moderator
        const isAdmin = community.members.some(member =>
            member.user.toString() === req.user._id.toString() && member.role === 'admin'
        );
        const isModerator = community.moderators.includes(req.user._id);

        if (!isAdmin && !isModerator) {
            return res.status(403).json({ error: 'Not authorized to add announcements' });
        }

        const announcement = await community.addAnnouncement(title, content, req.user._id, priority);
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get active communities
exports.getActiveCommunities = async (req, res) => {
    try {
        const communities = await Community.getActiveCommunities();
        res.json(communities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get communities by category
exports.getCommunitiesByCategory = async (req, res) => {
    try {
        const communities = await Community.getCommunitiesByCategory(req.params.category);
        res.json(communities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get communities by creator
exports.getCommunitiesByCreator = async (req, res) => {
    try {
        const communities = await Community.getCommunitiesByCreator(req.params.creatorId);
        res.json(communities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 