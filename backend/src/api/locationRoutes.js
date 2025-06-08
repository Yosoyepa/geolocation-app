const express = require('express');
const router = express.Router();

// Import middleware
const validate = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const { generalLimiter } = require('../middlewares/rateLimiter');

// Import validation schemas
const { 
  registerDeviceSchema,
  updateDeviceSchema,
  storeLocationSchema,
  locationFiltersSchema,
  createGeofenceSchema,
  updateGeofenceSchema
} = require('../middlewares/validationSchemas');

// Import controller
const locationController = require('./locationController');

/**
 * Device Management Routes
 */

/**
 * @route   POST /api/devices
 * @desc    Register a new device
 * @access  Private
 */
router.post(
  '/devices',
  generalLimiter,
  authenticate,
  validate(registerDeviceSchema),
  locationController.registerDevice
);

/**
 * @route   GET /api/devices
 * @desc    Get all devices for the authenticated user
 * @access  Private
 */
router.get(
  '/devices',
  authenticate,
  locationController.getUserDevices
);

/**
 * @route   PUT /api/devices/:deviceId
 * @desc    Update a device
 * @access  Private
 */
router.put(
  '/devices/:deviceId',
  authenticate,
  validate(updateDeviceSchema),
  locationController.updateDevice
);

/**
 * @route   GET /api/devices/:deviceId/locations
 * @desc    Get locations for a specific device
 * @access  Private
 */
router.get(
  '/devices/:deviceId/locations',
  authenticate,
  validate(locationFiltersSchema, 'query'),
  locationController.getDeviceLocations
);

/**
 * Location Tracking Routes
 */

/**
 * @route   POST /api/locations
 * @desc    Store a new location
 * @access  Private
 */
router.post(
  '/locations',
  generalLimiter,
  authenticate,
  validate(storeLocationSchema),
  locationController.storeLocation
);

/**
 * @route   GET /api/locations
 * @desc    Get all locations for the authenticated user
 * @access  Private
 */
router.get(
  '/locations',
  authenticate,
  validate(locationFiltersSchema, 'query'),
  locationController.getUserLocations
);

/**
 * @route   GET /api/locations/latest
 * @desc    Get latest location for each device
 * @access  Private
 */
router.get(
  '/locations/latest',
  authenticate,
  locationController.getLatestLocations
);

/**
 * Geofencing Routes
 */

/**
 * @route   POST /api/geofences
 * @desc    Create a new geofence
 * @access  Private
 */
router.post(
  '/geofences',
  authenticate,
  validate(createGeofenceSchema),
  locationController.createGeofence
);

/**
 * @route   GET /api/geofences
 * @desc    Get all geofences for the authenticated user
 * @access  Private
 */
router.get(
  '/geofences',
  authenticate,
  locationController.getUserGeofences
);

/**
 * @route   PUT /api/geofences/:geofenceId
 * @desc    Update a geofence
 * @access  Private
 */
router.put(
  '/geofences/:geofenceId',
  authenticate,
  validate(updateGeofenceSchema),
  locationController.updateGeofence
);

/**
 * @route   DELETE /api/geofences/:geofenceId
 * @desc    Delete a geofence
 * @access  Private
 */
router.delete(
  '/geofences/:geofenceId',
  authenticate,
  locationController.deleteGeofence
);

/**
 * @route   POST /api/geofences/check
 * @desc    Check geofences for a location
 * @access  Private
 */
router.post(
  '/geofences/check',
  authenticate,
  validate(require('joi').object({
    latitude: require('joi').number().min(-90).max(90).required(),
    longitude: require('joi').number().min(-180).max(180).required()
  })),
  locationController.checkGeofences
);

module.exports = router;
