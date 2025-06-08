const locationService = require('../services/locationService');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * Device Management Controller
 */

/**
 * Register a new device
 * POST /api/devices
 */
const registerDevice = asyncHandler(async (req, res) => {
  const { name, type, platform, version, metadata } = req.body;
  const userId = req.user.id;

  const result = await locationService.registerDevice({
    name,
    type,
    platform,
    version,
    metadata
  }, userId);

  res.status(result.isNew ? 201 : 200).json({
    success: true,
    message: result.isNew ? 'Device registered successfully' : 'Device updated successfully',
    data: {
      device: result.device,
      isNew: result.isNew
    }
  });
});

/**
 * Get all devices for the authenticated user
 * GET /api/devices
 */
const getUserDevices = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const devices = await locationService.getUserDevices(userId);

  res.json({
    success: true,
    message: 'Devices retrieved successfully',
    data: {
      devices,
      count: devices.length
    }
  });
});

/**
 * Update a device
 * PUT /api/devices/:deviceId
 */
const updateDevice = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  const device = await locationService.updateDevice(parseInt(deviceId), userId, updateData);

  res.json({
    success: true,
    message: 'Device updated successfully',
    data: { device }
  });
});

/**
 * Location Tracking Controller
 */

/**
 * Store a new location
 * POST /api/locations
 */
const storeLocation = asyncHandler(async (req, res) => {
  const locationData = req.body;
  const userId = req.user.id;
  const { deviceId } = locationData;

  const location = await locationService.storeLocation(locationData, deviceId, userId);

  // Emit real-time location update via Socket.IO
  if (req.io) {
    req.io.to(`user:${userId}`).emit('new-location', {
      location: location,
      userId: userId,
      deviceId: deviceId,
      timestamp: new Date().toISOString()
    });
  }

  res.status(201).json({
    success: true,
    message: 'Location stored successfully',
    data: { location }
  });
});

/**
 * Get locations for a specific device
 * GET /api/devices/:deviceId/locations
 */
const getDeviceLocations = asyncHandler(async (req, res) => {
  const { deviceId } = req.params;
  const userId = req.user.id;
  const filters = req.query;

  const locations = await locationService.getDeviceLocations(
    parseInt(deviceId), 
    userId, 
    filters
  );

  res.json({
    success: true,
    message: 'Device locations retrieved successfully',
    data: {
      locations,
      count: locations.length,
      deviceId: parseInt(deviceId),
      filters
    }
  });
});

/**
 * Get all locations for the authenticated user
 * GET /api/locations
 */
const getUserLocations = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const filters = req.query;

  const locations = await locationService.getUserLocations(userId, filters);

  res.json({
    success: true,
    message: 'User locations retrieved successfully',
    data: {
      locations,
      count: locations.length,
      filters
    }
  });
});

/**
 * Get latest location for each device
 * GET /api/locations/latest
 */
const getLatestLocations = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const latestLocations = await locationService.getUserLatestLocations(userId);

  res.json({
    success: true,
    message: 'Latest locations retrieved successfully',
    data: {
      devices: latestLocations,
      count: latestLocations.length
    }
  });
});

/**
 * Geofencing Controller
 */

/**
 * Create a new geofence
 * POST /api/geofences
 */
const createGeofence = asyncHandler(async (req, res) => {
  const { name, description, latitude, longitude, radius, type, metadata } = req.body;
  const userId = req.user.id;

  // Note: This will need to be implemented when we create the geofence service
  // For now, we'll create a placeholder response
  res.status(501).json({
    success: false,
    message: 'Geofence functionality will be implemented in the next phase',
    data: null
  });
});

/**
 * Get all geofences for the authenticated user
 * GET /api/geofences
 */
const getUserGeofences = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Note: This will need to be implemented when we create the geofence service
  res.status(501).json({
    success: false,
    message: 'Geofence functionality will be implemented in the next phase',
    data: null
  });
});

/**
 * Update a geofence
 * PUT /api/geofences/:geofenceId
 */
const updateGeofence = asyncHandler(async (req, res) => {
  const { geofenceId } = req.params;
  const userId = req.user.id;
  const updateData = req.body;

  // Note: This will need to be implemented when we create the geofence service
  res.status(501).json({
    success: false,
    message: 'Geofence functionality will be implemented in the next phase',
    data: null
  });
});

/**
 * Delete a geofence
 * DELETE /api/geofences/:geofenceId
 */
const deleteGeofence = asyncHandler(async (req, res) => {
  const { geofenceId } = req.params;
  const userId = req.user.id;

  // Note: This will need to be implemented when we create the geofence service
  res.status(501).json({
    success: false,
    message: 'Geofence functionality will be implemented in the next phase',
    data: null
  });
});

/**
 * Check geofences for a location
 * POST /api/geofences/check
 */
const checkGeofences = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  const userId = req.user.id;

  const triggeredGeofences = await locationService.checkGeofences(latitude, longitude, userId);

  res.json({
    success: true,
    message: 'Geofences checked successfully',
    data: {
      triggeredGeofences,
      count: triggeredGeofences.length,
      location: { latitude, longitude }
    }
  });
});

module.exports = {
  // Device management
  registerDevice,
  getUserDevices,
  updateDevice,
  
  // Location tracking
  storeLocation,
  getDeviceLocations,
  getUserLocations,
  getLatestLocations,
  
  // Geofencing (placeholder for future implementation)
  createGeofence,
  getUserGeofences,
  updateGeofence,
  deleteGeofence,
  checkGeofences
};
