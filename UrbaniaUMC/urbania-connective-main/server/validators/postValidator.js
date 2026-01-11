const Joi = require('joi');

const postSchema = Joi.object({
    title: Joi.string().required().min(3).max(200).trim(),
    content: Joi.string().required().min(10).max(5000),
    community: Joi.string().required(),
    topic: Joi.string(),
    type: Joi.string().valid('discussion', 'question', 'announcement', 'resource').default('discussion'),
    status: Joi.string().valid('active', 'archived', 'deleted').default('active'),
    tags: Joi.array().items(Joi.string()),
    attachments: Joi.array().items(Joi.object({
        type: Joi.string().valid('image', 'document', 'video', 'link'),
        url: Joi.string().uri(),
        title: Joi.string(),
        description: Joi.string()
    })),
    likes: Joi.array().items(Joi.string()),
    comments: Joi.array().items(Joi.object({
        content: Joi.string().required(),
        author: Joi.string().required(),
        createdAt: Joi.date().iso(),
        likes: Joi.array().items(Joi.string()),
        replies: Joi.array().items(Joi.object({
            content: Joi.string(),
            author: Joi.string(),
            createdAt: Joi.date().iso()
        }))
    })),
    views: Joi.number().integer().min(0).default(0),
    isPinned: Joi.boolean().default(false),
    isLocked: Joi.boolean().default(false),
    isSolved: Joi.boolean().default(false),
    solvedBy: Joi.string(),
    solvedAt: Joi.date().iso(),
    metadata: Joi.object().pattern(Joi.string(), Joi.any())
});

const validatePost = (data) => {
    return postSchema.validate(data, { abortEarly: false });
};

module.exports = { validatePost }; 