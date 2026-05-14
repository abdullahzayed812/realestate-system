import Joi from 'joi';

export const sendOtpSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{7,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone must be a valid international phone number (e.g., +201012345678)',
    }),
  purpose: Joi.string()
    .valid('LOGIN', 'REGISTER', 'RESET_PASSWORD', 'PHONE_VERIFY')
    .required(),
});

export const registerSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{7,14}$/)
    .required(),
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().optional().allow('', null),
  role: Joi.string().valid('CUSTOMER', 'BROKER').optional().default('CUSTOMER'),
  otpCode: Joi.string().length(6).pattern(/^\d+$/).required(),
});

export const loginSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{7,14}$/)
    .required(),
  otpCode: Joi.string().length(6).pattern(/^\d+$/).required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).optional(),
  lastName: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional().allow('', null),
  preferredLang: Joi.string().valid('ar', 'en').optional(),
});
