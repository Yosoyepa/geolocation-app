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
const registerDeviceSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Device name is required',
      'string.max': 'Device name cannot exceed 100 characters',
      'any.required': 'Device name is required'
    }),
  
  type: Joi.string()
    .valid('mobile', 'tablet', 'gps_tracker', 'vehicle', 'other')
    .required()
    .messages({
      'any.only': 'Device type must be one of: mobile, tablet, gps_tracker, vehicle, other',
      'any.required': 'Device type is required'
    }),
  
  platform: Joi.string()
    .valid('android', 'ios', 'windows', 'linux', 'other')
    .optional()
    .messages({
      'any.only': 'Platform must be one of: android, ios, windows, linux, other'
    }),
  
  version: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Version cannot exceed 50 characters'
    }),
  
  metadata: Joi.object()
    .optional()
    .messages({
      'object.base': 'Metadata must be a valid object'
    })
});

// Device update validation schema
const updateDeviceSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Device name cannot be empty',
      'string.max': 'Device name cannot exceed 100 characters'
    }),
  
  isActive: Joi.boolean()
    .optional(),
  
  metadata: Joi.object()
    .optional()
    .messages({
      'object.base': 'Metadata must be a valid object'
    })
});

// Location storage validation schema
const storeLocationSchema = Joi.object({
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
  
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
    }),
  
  accuracy: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Accuracy must be a positive number'
    }),
  
  altitude: Joi.number()
    .optional(),
  
  heading: Joi.number()
    .min(0)
    .max(360)
    .optional()
    .messages({
      'number.min': 'Heading must be between 0 and 360',
      'number.max': 'Heading must be between 0 and 360'
    }),
  
  speed: Joi.number()
    .min(0)
    .optional()
    .messages({
      'number.min': 'Speed must be a positive number'
    }),
  
  timestamp: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Timestamp must be a valid ISO date'
    }),
  
  deviceId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.integer': 'Device ID must be an integer',
      'number.positive': 'Device ID must be a positive number',
      'any.required': 'Device ID is required'
    }),
  
  metadata: Joi.object()
    .optional()
    .messages({
      'object.base': 'Metadata must be a valid object'
    })
});

// Location query filters validation schema
const locationFiltersSchema = Joi.object({
  startDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Start date must be a valid ISO date'
    }),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.format': 'End date must be a valid ISO date',
      'date.min': 'End date must be after start date'
    }),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .default(100)
    .messages({
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 1000'
    }),
  
  offset: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.integer': 'Offset must be an integer',
      'number.min': 'Offset must be 0 or greater'
    }),
  
  deviceId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.integer': 'Device ID must be an integer',
      'number.positive': 'Device ID must be a positive number'
    })
});

// Geofence creation validation schema
const createGeofenceSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Geofence name is required',
      'string.max': 'Geofence name cannot exceed 100 characters',
      'any.required': 'Geofence name is required'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
  
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
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
    .valid('enter', 'exit', 'both')
    .optional()
    .default('both')
    .messages({
      'any.only': 'Type must be one of: enter, exit, both'
    }),
  
  metadata: Joi.object()
    .optional()
    .messages({
      'object.base': 'Metadata must be a valid object'
    })
});

// Geofence update validation schema
const updateGeofenceSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Geofence name cannot be empty',
      'string.max': 'Geofence name cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    }),
  
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),
  
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    }),
  
  radius: Joi.number()
    .min(1)
    .max(100000)
    .optional()
    .messages({
      'number.min': 'Radius must be at least 1 meter',
      'number.max': 'Radius cannot exceed 100 kilometers'
    }),
  
  type: Joi.string()
    .valid('enter', 'exit', 'both')
    .optional()
    .messages({
      'any.only': 'Type must be one of: enter, exit, both'
    }),
  
  isActive: Joi.boolean()
    .optional(),
  
  metadata: Joi.object()
    .optional()
    .messages({
      'object.base': 'Metadata must be a valid object'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  registerDeviceSchema,
  updateDeviceSchema,
  storeLocationSchema,
  locationFiltersSchema,
  createGeofenceSchema,
  updateGeofenceSchema
};
