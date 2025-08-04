import Joi from 'joi';

export const smsSchemas = {
  sendSMS: Joi.object({
    message: Joi.string().required().min(1).max(160),
    type: Joi.string().valid('weather', 'crop', 'market', 'insurance', 'emergency').required(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
  }),

  subscribe: Joi.object({
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
    alertTypes: Joi.array().items(Joi.string()).min(1).required(),
    language: Joi.string().valid('english', 'hindi', 'marathi', 'gujarati', 'punjabi').default('english'),
    location: Joi.string().required(),
  }),
}; 