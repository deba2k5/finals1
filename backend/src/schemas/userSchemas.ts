import Joi from 'joi';

export const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(50).required(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    location: Joi.string().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).optional(),
    location: Joi.string().optional(),
    preferences: Joi.object().optional(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),
}; 