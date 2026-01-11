const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic'
    },
    type: {
        type: String,
        enum: ['discussion', 'question', 'announcement', 'resource'],
        default: 'discussion'
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted'],
        default: 'active'
    },
    tags: [{
        type: String
    }],
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'document', 'video', 'link']
        },
        url: String,
        title: String,
        description: String
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        content: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        likes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        replies: [{
            content: String,
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    }],
    views: {
        type: Number,
        default: 0
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    isSolved: {
        type: Boolean,
        default: false
    },
    solvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    solvedAt: Date,
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Indexes for better query performance
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ topic: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

// Virtual for like count
postSchema.virtual('likeCount').get(function () {
    return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function () {
    return this.comments.length;
});

// Method to add comment
postSchema.methods.addComment = async function (content, authorId) {
    const comment = {
        content,
        author: authorId,
        createdAt: new Date()
    };
    this.comments.push(comment);
    await this.save();
    return comment;
};

// Method to add reply to comment
postSchema.methods.addReply = async function (commentId, content, authorId) {
    const comment = this.comments.id(commentId);
    if (comment) {
        comment.replies.push({
            content,
            author: authorId,
            createdAt: new Date()
        });
        await this.save();
        return comment;
    }
    return null;
};

// Method to like post
postSchema.methods.like = async function (userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        await this.save();
        return true;
    }
    return false;
};

// Method to unlike post
postSchema.methods.unlike = async function (userId) {
    const index = this.likes.indexOf(userId);
    if (index > -1) {
        this.likes.splice(index, 1);
        await this.save();
        return true;
    }
    return false;
};

// Method to mark as solved
postSchema.methods.markAsSolved = async function (userId) {
    if (!this.isSolved) {
        this.isSolved = true;
        this.solvedBy = userId;
        this.solvedAt = new Date();
        await this.save();
        return true;
    }
    return false;
};

// Method to pin post
postSchema.methods.pin = async function () {
    if (!this.isPinned) {
        this.isPinned = true;
        await this.save();
        return true;
    }
    return false;
};

// Method to unpin post
postSchema.methods.unpin = async function () {
    if (this.isPinned) {
        this.isPinned = false;
        await this.save();
        return true;
    }
    return false;
};

// Method to lock post
postSchema.methods.lock = async function () {
    if (!this.isLocked) {
        this.isLocked = true;
        await this.save();
        return true;
    }
    return false;
};

// Method to unlock post
postSchema.methods.unlock = async function () {
    if (this.isLocked) {
        this.isLocked = false;
        await this.save();
        return true;
    }
    return false;
};

// Static method to get posts by community
postSchema.statics.getPostsByCommunity = function (communityId, page = 1, limit = 10) {
    return this.find({ community: communityId })
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name avatar')
        .populate('comments.author', 'name avatar');
};

// Static method to get posts by author
postSchema.statics.getPostsByAuthor = function (authorId, page = 1, limit = 10) {
    return this.find({ author: authorId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('community', 'name')
        .populate('author', 'name avatar');
};

// Static method to get posts by topic
postSchema.statics.getPostsByTopic = function (topicId, page = 1, limit = 10) {
    return this.find({ topic: topicId })
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name avatar')
        .populate('comments.author', 'name avatar');
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 