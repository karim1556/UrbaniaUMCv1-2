const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['education', 'health', 'environment', 'social', 'cultural', 'other'],
        required: true
    },
    image: {
        public_id: String,
        url: String
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['member', 'moderator', 'admin'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    },
    rules: [{
        type: String
    }],
    topics: [{
        name: String,
        description: String,
        posts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        }]
    }],
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    resources: [{
        title: String,
        type: {
            type: String,
            enum: ['document', 'video', 'link']
        },
        url: String,
        description: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    announcements: [{
        title: String,
        content: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        }
    }],
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        linkedin: String,
        website: String
    },
    settings: {
        isPrivate: {
            type: Boolean,
            default: false
        },
        allowMemberInvites: {
            type: Boolean,
            default: true
        },
        requireApproval: {
            type: Boolean,
            default: false
        },
        allowPosts: {
            type: Boolean,
            default: true
        },
        allowComments: {
            type: Boolean,
            default: true
        }
    },
    statistics: {
        memberCount: {
            type: Number,
            default: 0
        },
        postCount: {
            type: Number,
            default: 0
        },
        eventCount: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
communitySchema.index({ name: 1 });
communitySchema.index({ category: 1 });
communitySchema.index({ creator: 1 });
communitySchema.index({ 'members.user': 1 });

// Virtual for checking if user is a member
communitySchema.virtual('isMember').get(function () {
    return (userId) => {
        return this.members.some(member => member.user.toString() === userId.toString());
    };
});

// Virtual for checking if user is a moderator
communitySchema.virtual('isModerator').get(function () {
    return (userId) => {
        return this.moderators.includes(userId);
    };
});

// Method to add member
communitySchema.methods.addMember = async function (userId, role = 'member') {
    if (!this.isMember(userId)) {
        this.members.push({
            user: userId,
            role,
            joinedAt: new Date()
        });
        this.statistics.memberCount += 1;
        await this.save();
        return true;
    }
    return false;
};

// Method to remove member
communitySchema.methods.removeMember = async function (userId) {
    const index = this.members.findIndex(member => member.user.toString() === userId.toString());
    if (index > -1) {
        this.members.splice(index, 1);
        this.statistics.memberCount -= 1;
        await this.save();
        return true;
    }
    return false;
};

// Method to add moderator
communitySchema.methods.addModerator = async function (userId) {
    if (!this.moderators.includes(userId)) {
        this.moderators.push(userId);
        const memberIndex = this.members.findIndex(member => member.user.toString() === userId.toString());
        if (memberIndex > -1) {
            this.members[memberIndex].role = 'moderator';
        }
        await this.save();
        return true;
    }
    return false;
};

// Method to remove moderator
communitySchema.methods.removeModerator = async function (userId) {
    const index = this.moderators.indexOf(userId);
    if (index > -1) {
        this.moderators.splice(index, 1);
        const memberIndex = this.members.findIndex(member => member.user.toString() === userId.toString());
        if (memberIndex > -1) {
            this.members[memberIndex].role = 'member';
        }
        await this.save();
        return true;
    }
    return false;
};

// Method to add announcement
communitySchema.methods.addAnnouncement = async function (title, content, createdBy, priority = 'medium') {
    const announcement = {
        title,
        content,
        createdBy,
        priority,
        createdAt: new Date()
    };
    this.announcements.push(announcement);
    await this.save();
    return announcement;
};

// Static method to get active communities
communitySchema.statics.getActiveCommunities = function () {
    return this.find({ status: 'active' }).sort({ 'statistics.memberCount': -1 });
};

// Static method to get communities by category
communitySchema.statics.getCommunitiesByCategory = function (category) {
    return this.find({ category, status: 'active' }).sort({ 'statistics.memberCount': -1 });
};

// Static method to get communities by creator
communitySchema.statics.getCommunitiesByCreator = function (creatorId) {
    return this.find({ creator: creatorId }).sort({ createdAt: -1 });
};

const Community = mongoose.model('Community', communitySchema);

module.exports = Community; 