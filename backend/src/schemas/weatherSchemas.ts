import Joi from 'joi';

export const weatherSchemas = {
  getCurrentWeather: Joi.object({
    lat: Joi.number().min(-90).max(90).default(18.5204),
    lon: Joi.number().min(-180).max(180).default(73.8567),
  }),

  getForecast: Joi.object({
    lat: Joi.number().min(-90).max(90).default(18.5204),
    lon: Joi.number().min(-180).max(180).default(73.8567),
  }),

  getAlerts: Joi.object({
    lat: Joi.number().min(-90).max(90).default(18.5204),
    lon: Joi.number().min(-180).max(180).default(73.8567),
  }),
}; 