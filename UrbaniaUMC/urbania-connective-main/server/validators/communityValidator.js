const Joi = require('joi');

const communitySchema = Joi.object({
    name: Joi.string().required().min(3).max(50).trim(),
    description: Joi.string().required().min(10).max(1000),
    category: Joi.string().valid(
        'education',
        'health',
        'environment',
        'social',
        'cultural',
        'other'
    ).required(),
    rules: Joi.array().items(Joi.string()),
    topics: Joi.array().items(Joi.string()),
    resources: Joi.array().items(Joi.object({
        title: Joi.string(),
        type: Joi.string().valid('document', 'video', 'link'),
        url: Joi.string().uri(),
        description: Joi.string()
    })),
    announcements: Joi.array().items(Joi.object({
        title: Joi.string(),
        content: Joi.string(),
        priority: Joi.string().valid('low', 'medium', 'high'),
        createdAt: Joi.date().iso()
    })),
    socialLinks: Joi.object({
        facebook: Joi.string().uri(),
        twitter: Joi.string().uri(),
        instagram: Joi.string().uri(),
        linkedin: Joi.string().uri(),
        website: Joi.string().uri()
    }),
    settings: Joi.object({
        isPrivate: Joi.boolean().default(false),
        requireApproval: Joi.boolean().default(false),
        allowMemberInvites: Joi.boolean().default(true),
        allowPostCreation: Joi.boolean().default(true),
        allowComments: Joi.boolean().default(true),
        allowFileSharing: Joi.boolean().default(true)
    }),
    statistics: Joi.object({
        memberCount: Joi.number().integer().min(0).default(0),
        postCount: Joi.number().integer().min(0).default(0),
        eventCount: Joi.number().integer().min(0).default(0)
    })
});

const validateCommunity = (data) => {
    return communitySchema.validate(data, { abortEarly: false });
};

module.exports = { validateCommunity }; 