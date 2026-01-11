const Joi = require('joi');

const workshopSchema = Joi.object({
    title: Joi.string().required().min(3).max(100).trim(),
    description: Joi.string().required().min(10).max(1000),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    location: Joi.string().required().min(5).max(200),
    category: Joi.string().valid(
        'education',
        'skill_development',
        'professional',
        'creative',
        'other'
    ).required(),
    capacity: Joi.number().integer().min(1).required(),
    price: Joi.number().min(0).required(),
    prerequisites: Joi.array().items(Joi.string()),
    materials: Joi.array().items(Joi.string()),
    schedule: Joi.array().items(Joi.object({
        date: Joi.date().iso(),
        topic: Joi.string(),
        duration: Joi.string()
    })),
    objectives: Joi.array().items(Joi.string()),
    learningOutcomes: Joi.array().items(Joi.string()),
    certification: Joi.boolean().default(false),
    certificateDetails: Joi.object({
        name: Joi.string(),
        issuer: Joi.string(),
        validity: Joi.string()
    }).when('certification', {
        is: true,
        then: Joi.required()
    }),
    registrationDeadline: Joi.date().iso(),
    tags: Joi.array().items(Joi.string()),
    resources: Joi.array().items(Joi.object({
        title: Joi.string(),
        type: Joi.string().valid('document', 'video', 'link'),
        url: Joi.string().uri()
    })),
    isRecurring: Joi.boolean().default(false),
    recurringDetails: Joi.object({
        frequency: Joi.string().valid('weekly', 'monthly', 'quarterly'),
        endDate: Joi.date().iso(),
        daysOfWeek: Joi.array().items(Joi.number().min(0).max(6))
    }).when('isRecurring', {
        is: true,
        then: Joi.required()
    })
});

const validateWorkshop = (data) => {
    return workshopSchema.validate(data, { abortEarly: false });
};

module.exports = { validateWorkshop }; 