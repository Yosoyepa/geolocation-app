import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AuthService from './AuthService';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

interface Device {
  id: string;
  name: string;
  platform: string;
  version: string;
  isActive: boolean;
  lastConnectedAt: string;
}

class LocationService {
  // Register device
  async registerDevice(deviceInfo: {
    name: string;
    platform: string;
    version: string;
    metadata?: any;
  }) {
    try {
      const response = await axios.post('/devices/register', deviceInfo);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Device registration failed');
    }
  }

  // Send location update
  async sendLocation(deviceId: string, locationData: LocationData) {
    try {
      const response = await axios.post('/locations', {
        deviceId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp || Date.now(),
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send location');
    }
  }

  // Get location history
  async getLocationHistory(deviceId: string, page: number = 1, limit: number = 50) {
    try {
      const response = await axios.get(`/locations/history/${deviceId}`, {
        params: { page, limit }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get location history');
    }
  }

  // Get latest locations for all devices
  async getLatestLocations() {
    try {
      const response = await axios.get('/locations/latest');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get latest locations');
    }
  }

  // Get user devices
  async getUserDevices() {
    try {
      const response = await axios.get('/devices');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get devices');
    }
  }

  // Store device ID locally
  async storeDeviceId(deviceId: string) {
    try {
      await AsyncStorage.setItem('deviceId', deviceId);
    } catch (error) {
      console.error('Error storing device ID:', error);
    }
  }

  // Get stored device ID
  async getStoredDeviceId() {
    try {
      return await AsyncStorage.getItem('deviceId');
    } catch (error) {
      console.error('Error getting stored device ID:', error);
      return null;
    }
  }
}

export default new LocationService();
