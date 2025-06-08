const Joi = require('joi');

// User registration validation schema
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required'
    }),
  
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'string.pattern.base': 'First name can only contain letters and spaces',
      'any.required': 'First name is required'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'string.pattern.base': 'Last name can only contain letters and spaces',
      'any.required': 'Last name is required'
    })
});

// User login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]'))
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match new password',
      'any.required': 'Password confirmation is required'
    })
});

// Device registration validation schema
const deviceSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Device name cannot be empty',
      'string.max': 'Device name cannot exceed 100 characters',
      'any.required': 'Device name is required'
    }),
  
  type: Joi.string()
    .valid('mobile', 'tablet', 'wearable', 'tracker', 'other')
    .required()
    .messages({
      'any.only': 'Device type must be one of: mobile, tablet, wearable, tracker, other',
      'any.required': 'Device type is required'
    }),
  
  platform: Joi.string()
    .valid('android', 'ios', 'web', 'other')
    .required()
    .messages({
      'any.only': 'Platform must be one of: android, ios, web, other',
      'any.required': 'Platform is required'
    }),
  
  deviceId: Joi.string()
    .required()
    .messages({
      'any.required': 'Device ID is required'
    })
});

// Location update validation schema
const locationSchema = Joi.object({
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .precision(8)
    .required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
  
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .precision(8)
    .required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
    }),
  
  accuracy: Joi.number()
    .min(0)
    .max(10000)
    .optional()
    .messages({
      'number.min': 'Accuracy cannot be negative',
      'number.max': 'Accuracy cannot exceed 10000 meters'
    }),
  
  altitude: Joi.number()
    .optional(),
  
  speed: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Speed cannot be negative'
    }),
  
  heading: Joi.number()
    .min(0)
    .max(360)
    .optional()
    .messages({
      'number.min': 'Heading must be between 0 and 360',
      'number.max': 'Heading must be between 0 and 360'
    })
});

// Geofence creation validation schema
const geofenceSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Geofence name cannot be empty',
      'string.max': 'Geofence name cannot exceed 100 characters',
      'any.required': 'Geofence name is required'
    }),
  
  centerLatitude: Joi.number()
    .min(-90)
    .max(90)
    .precision(8)
    .required()
    .messages({
      'number.min': 'Center latitude must be between -90 and 90',
      'number.max': 'Center latitude must be between -90 and 90',
      'any.required': 'Center latitude is required'
    }),
  
  centerLongitude: Joi.number()
    .min(-180)
    .max(180)
    .precision(8)
    .required()
    .messages({
      'number.min': 'Center longitude must be between -180 and 180',
      'number.max': 'Center longitude must be between -180 and 180',
      'any.required': 'Center longitude is required'
    }),
  
  radius: Joi.number()
    .min(1)
    .max(100000)
    .required()
    .messages({
      'number.min': 'Radius must be at least 1 meter',
      'number.max': 'Radius cannot exceed 100 kilometers',
      'any.required': 'Radius is required'
    }),
  
  type: Joi.string()
    .valid('entry', 'exit', 'both')
    .default('both')
    .messages({
      'any.only': 'Geofence type must be one of: entry, exit, both'
    }),
  
  isActive: Joi.boolean()
    .default(true)
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  deviceSchema,
  locationSchema,
  geofenceSchema
};
