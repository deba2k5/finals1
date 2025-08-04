import Joi from 'joi';

export const satelliteSchemas = {
  getSatelliteData: Joi.object({
    lat: Joi.number().min(-90).max(90).default(18.5204),
    lon: Joi.number().min(-180).max(180).default(73.8567),
  }),

  getFieldBoundaries: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lon: Joi.number().min(-180).max(180).required(),
  }),
}; 