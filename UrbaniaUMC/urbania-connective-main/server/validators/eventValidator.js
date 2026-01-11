const Joi = require('joi');

const eventSchema = Joi.object({
    title: Joi.string().required().min(3).max(100).trim(),
    description: Joi.string().required().min(10).max(1000),
    fullDescription: Joi.string().required().min(50).max(5000),
    date: Joi.string().required(),
    time: Joi.alternatives().try(
        Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM) to ([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/),
        Joi.object({
            startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/).required(),
            endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9] (AM|PM)$/).required()
        })
    ).required(),
    location: Joi.string().required().min(5).max(200),
    category: Joi.string().valid(
        'community',
        'education',
        'charity'
    ).required(),
    image: Joi.string(),
    featured: Joi.boolean().default(false),
    pricing: Joi.object({
        type: Joi.string().valid('free', 'paid').required(),
        amount: Joi.number().min(0).default(0),
        details: Joi.string().required()
    }).required(),
    registration: Joi.object({
        required: Joi.boolean().default(false),
        deadline: Joi.string(),
        capacity: Joi.number().integer().min(1).required()
    }).required(),
    organizerName: Joi.string().required().min(3).max(100),
    additionalDetails: Joi.alternatives().try(
        Joi.string(),
        Joi.array().items(Joi.string())
    ),
    attendees: Joi.number().integer().min(0).default(0),
    status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').default('upcoming'),
    requirements: Joi.array().items(Joi.string()),
    materials: Joi.array().items(Joi.string()),
    isRecurring: Joi.boolean().default(false),
    recurringDetails: Joi.object({
        frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly'),
        endDate: Joi.date(),
        daysOfWeek: Joi.array().items(Joi.number().min(0).max(6))
    }),
    price: Joi.number().min(0).default(0),
    tags: Joi.array().items(Joi.string()),
    highlights: Joi.array().items(Joi.string()),
    testimonials: Joi.array().items(Joi.object({
        user: Joi.string(),
        text: Joi.string(),
        rating: Joi.number().min(1).max(5),
        date: Joi.date()
    })),
    socialLinks: Joi.object({
        facebook: Joi.string().uri(),
        twitter: Joi.string().uri(),
        instagram: Joi.string().uri(),
        linkedin: Joi.string().uri()
    })
});

const validateEvent = (data) => {
    return eventSchema.validate(data, { abortEarly: false });
};

// Add a partial schema for updates
const eventUpdateSchema = eventSchema.fork(Object.keys(eventSchema.describe().keys), (schema) => schema.optional());

const validateEventUpdate = (data) => {
    return eventUpdateSchema.validate(data, { abortEarly: false });
};

module.exports = { validateEvent, validateEventUpdate }; 