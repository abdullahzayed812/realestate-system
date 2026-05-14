import Joi from 'joi';

const locationSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  address: Joi.string().required(),
  addressAr: Joi.string().optional().allow('', null),
  city: Joi.string().optional().default('Borg El Arab'),
  district: Joi.string().optional().allow('', null),
  neighborhood: Joi.string().optional().allow('', null),
  googlePlaceId: Joi.string().optional().allow('', null),
});

const featureSchema = Joi.object({
  feature: Joi.string().required(),
  featureAr: Joi.string().optional().allow('', null),
  category: Joi.string()
    .valid('INDOOR', 'OUTDOOR', 'SECURITY', 'UTILITIES', 'NEARBY')
    .required(),
});

export const createPropertySchema = Joi.object({
  title: Joi.string().min(10).max(500).required(),
  titleAr: Joi.string().max(500).optional().allow('', null),
  description: Joi.string().min(50).required(),
  descriptionAr: Joi.string().optional().allow('', null),
  type: Joi.string()
    .valid(
      'APARTMENT', 'VILLA', 'LAND', 'OFFICE', 'SHOP',
      'WAREHOUSE', 'FACTORY', 'COMMERCIAL_BUILDING',
      'CHALET', 'DUPLEX', 'PENTHOUSE', 'STUDIO', 'TOWNHOUSE',
    )
    .required(),
  listingType: Joi.string().valid('SALE', 'RENT', 'DAILY_RENT').required(),
  price: Joi.number().positive().required(),
  currency: Joi.string().valid('EGP', 'USD', 'EUR').default('EGP'),
  pricePer: Joi.string().valid('TOTAL', 'METER', 'NIGHT', 'MONTH', 'YEAR').default('TOTAL'),
  area: Joi.number().positive().required(),
  bedrooms: Joi.number().integer().min(0).max(20).optional().allow(null),
  bathrooms: Joi.number().integer().min(0).max(20).optional().allow(null),
  floor: Joi.number().integer().optional().allow(null),
  totalFloors: Joi.number().integer().optional().allow(null),
  parkingSpaces: Joi.number().integer().min(0).default(0),
  furnished: Joi.string().valid('FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED').optional().allow(null),
  condition: Joi.string().valid('NEW', 'EXCELLENT', 'GOOD', 'NEEDS_RENOVATION').optional().allow(null),
  yearBuilt: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional().allow(null),
  location: locationSchema.required(),
  features: Joi.array().items(featureSchema).optional().default([]),
});

export const updatePropertySchema = createPropertySchema.fork(
  ['title', 'description', 'type', 'listingType', 'price', 'area', 'location'],
  (schema) => schema.optional(),
);

export const rejectPropertySchema = Joi.object({
  reason: Joi.string().min(10).max(500).required(),
});
