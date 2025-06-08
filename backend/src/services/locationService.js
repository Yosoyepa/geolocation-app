const { Device, Location, Geofence, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Location tracking service
 * Handles device management and location storage
 */
class LocationService {
  /**
   * Register a new device for a user
   * @param {Object} deviceData - Device information
   * @param {number} userId - User ID
   * @returns {Object} Created device
   */  async registerDevice(deviceData, userId) {
    const { name, type, platform, version, metadata } = deviceData;

    // Check if device already exists for this user
    const existingDevice = await Device.findOne({
      where: {
        userId,
        deviceName: name,
        deviceType: type
      }
    });

    if (existingDevice) {
      // Update existing device
      await existingDevice.update({
        platform,
        version,
        metadata,
        isActive: true,
        lastConnectedAt: new Date()
      });

      return {
        device: existingDevice,
        isNew: false
      };
    }

    // Create new device
    const device = await Device.create({
      deviceName: name,
      deviceType: type,
      platform,
      version,
      metadata,
      userId,
      isActive: true,
      lastConnectedAt: new Date()
    });

    return {
      device,
      isNew: true
    };
  }

  /**
   * Get all devices for a user
   * @param {number} userId - User ID
   * @returns {Array} List of devices
   */
  async getUserDevices(userId) {
    const devices = await Device.findAll({
      where: { userId },
      order: [['lastConnectedAt', 'DESC']],
      include: [
        {
          model: Location,
          as: 'locations',
          limit: 1,
          order: [['timestamp', 'DESC']],
          required: false
        }
      ]
    });

    return devices;
  }

  /**
   * Update device status
   * @param {number} deviceId - Device ID
   * @param {number} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Object} Updated device
   */  async updateDevice(deviceId, userId, updateData) {
    const device = await Device.findOne({
      where: {
        id: deviceId,
        userId
      }
    });

    if (!device) {
      throw new Error('Device not found');
    }

    const allowedFields = ['deviceName', 'isActive', 'metadata'];
    const filteredData = {};
    
    // Map 'name' to 'deviceName' if provided
    if (updateData.name !== undefined) {
      filteredData.deviceName = updateData.name;
    }
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    await device.update(filteredData);
    return device;
  }

  /**
   * Store a new location for a device
   * @param {Object} locationData - Location information
   * @param {number} deviceId - Device ID
   * @param {number} userId - User ID for verification
   * @returns {Object} Created location
   */
  async storeLocation(locationData, deviceId, userId) {
    const { latitude, longitude, accuracy, altitude, heading, speed, timestamp } = locationData;

    // Verify device belongs to user
    const device = await Device.findOne({
      where: {
        id: deviceId,
        userId,
        isActive: true
      }
    });

    if (!device) {
      throw new Error('Device not found or inactive');
    }

    // Create location record
    const location = await Location.create({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : null,
      altitude: altitude ? parseFloat(altitude) : null,
      heading: heading ? parseFloat(heading) : null,
      speed: speed ? parseFloat(speed) : null,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      deviceId,
      metadata: locationData.metadata || {}
    });

    // Update device last connected time
    await device.update({
      lastConnectedAt: new Date()
    });

    // Include device information in response
    const locationWithDevice = await Location.findByPk(location.id, {
      include: [        {
          model: Device,
          as: 'device',
          attributes: ['id', 'deviceName', 'deviceType', 'userId']
        }
      ]
    });

    return locationWithDevice;
  }

  /**
   * Get locations for a device with optional filters
   * @param {number} deviceId - Device ID
   * @param {number} userId - User ID for verification
   * @param {Object} filters - Query filters
   * @returns {Array} List of locations
   */
  async getDeviceLocations(deviceId, userId, filters = {}) {
    // Verify device belongs to user
    const device = await Device.findOne({
      where: {
        id: deviceId,
        userId
      }
    });

    if (!device) {
      throw new Error('Device not found');
    }

    const whereClause = { deviceId };
    const { startDate, endDate, limit = 100, offset = 0 } = filters;

    // Add date filters if provided
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) {
        whereClause.timestamp[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.timestamp[Op.lte] = new Date(endDate);
      }
    }

    const locations = await Location.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [        {
          model: Device,
          as: 'device',
          attributes: ['id', 'deviceName', 'deviceType']
        }
      ]
    });

    return locations;
  }

  /**
   * Get all locations for a user across all devices
   * @param {number} userId - User ID
   * @param {Object} filters - Query filters
   * @returns {Array} List of locations
   */
  async getUserLocations(userId, filters = {}) {
    const { startDate, endDate, limit = 100, offset = 0, deviceId } = filters;

    const whereClause = {};
    
    // Add date filters if provided
    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) {
        whereClause.timestamp[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereClause.timestamp[Op.lte] = new Date(endDate);
      }
    }

    const deviceWhere = { userId };
    if (deviceId) {
      deviceWhere.id = deviceId;
    }

    const locations = await Location.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [        {
          model: Device,
          as: 'device',
          where: deviceWhere,
          attributes: ['id', 'deviceName', 'deviceType', 'userId']
        }
      ]
    });

    return locations;
  }

  /**
   * Get latest location for each device of a user
   * @param {number} userId - User ID
   * @returns {Array} Latest locations
   */
  async getUserLatestLocations(userId) {
    const devices = await Device.findAll({
      where: { 
        userId,
        isActive: true
      },
      include: [
        {
          model: Location,
          as: 'locations',
          limit: 1,
          order: [['timestamp', 'DESC']],
          required: false
        }
      ]
    });    return devices.map(device => ({
      device: {
        id: device.id,
        name: device.deviceName,
        type: device.deviceType,
        lastConnectedAt: device.lastConnectedAt
      },
      location: device.locations[0] || null
    }));
  }

  /**
   * Delete old locations (cleanup utility)
   * @param {number} daysOld - Number of days to keep
   * @returns {number} Number of deleted records
   */
  async cleanupOldLocations(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedCount = await Location.destroy({
      where: {
        timestamp: {
          [Op.lt]: cutoffDate
        }
      }
    });

    return deletedCount;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param {number} lat1 - Latitude 1
   * @param {number} lon1 - Longitude 1
   * @param {number} lat2 - Latitude 2
   * @param {number} lon2 - Longitude 2
   * @returns {number} Distance in meters
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  /**
   * Check if a location is within any geofences for a user
   * @param {number} latitude - Location latitude
   * @param {number} longitude - Location longitude
   * @param {number} userId - User ID
   * @returns {Array} List of triggered geofences
   */
  async checkGeofences(latitude, longitude, userId) {
    const geofences = await Geofence.findAll({
      where: {
        userId,
        isActive: true
      }
    });

    const triggeredGeofences = [];

    for (const geofence of geofences) {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        geofence.latitude,
        geofence.longitude
      );

      const isInside = distance <= geofence.radius;
      
      triggeredGeofences.push({
        geofence: geofence,
        distance: Math.round(distance),
        isInside,
        status: isInside ? 'entered' : 'exited'
      });
    }

    return triggeredGeofences.filter(g => g.isInside);
  }
}

module.exports = new LocationService();
