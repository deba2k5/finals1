import Joi from 'joi';

export const aiSchemas = {
  chatMessage: Joi.object({
    message: Joi.string().required().min(1).max(1000),
    language: Joi.string().valid('english', 'hindi', 'marathi', 'gujarati', 'punjabi').default('english'),
    context: Joi.object().optional(),
  }),

  cropRecommendations: Joi.object({
    soilType: Joi.string().required(),
    climate: Joi.string().required(),
    season: Joi.string().required(),
    farmSize: Joi.number().positive().required(),
    location: Joi.string().required(),
  }),

  diseaseDiagnosis: Joi.object({
    imageBase64: Joi.string().required(),
    cropType: Joi.string().required(),
  }),
}; 