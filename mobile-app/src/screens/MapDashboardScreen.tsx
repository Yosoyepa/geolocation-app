import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useAuth } from '../context/AuthContext';
import LocationService from '../services/LocationService';
import { StackNavigationProp } from '@react-navigation/stack';
import io, { Socket } from 'socket.io-client';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MapDashboard: undefined;
};

type MapDashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MapDashboard'>;

interface Props {
  navigation: MapDashboardScreenNavigationProp;
}

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
}

const MapDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, token } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [device, setDevice] = useState<Device | null>(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);
  
  const mapRef = useRef<MapView>(null);
  const watchIdRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    initializeApp();
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const initializeApp = async () => {
    try {
      await requestLocationPermission();
      await setupDevice();
      await getCurrentLocation();
      await initializeSocket();
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize the app. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to track your position.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions differently
  };

  const setupDevice = async () => {
    try {
      let storedDeviceId = await LocationService.getStoredDeviceId();
      
      if (!storedDeviceId) {
        // Register new device
        const deviceInfo = {
          name: `${user?.name}'s Device`,
          platform: Platform.OS,
          version: Platform.Version.toString(),
          metadata: {
            userAgent: Platform.constants?.reactNativeVersion?.major || 'unknown'
          }
        };
        
        const newDevice = await LocationService.registerDevice(deviceInfo);
        await LocationService.storeDeviceId(newDevice.id);
        setDevice(newDevice);
      } else {
        // Get existing device info
        const devices = await LocationService.getUserDevices();
        const currentDevice = devices.find((d: Device) => d.id === storedDeviceId);
        if (currentDevice) {
          setDevice(currentDevice);
        }
      }
    } catch (error) {
      console.error('Device setup error:', error);
      Alert.alert('Error', 'Failed to setup device. Please try again.');
    }
  };
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position: any) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationData: LocationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        };
        setCurrentLocation(locationData);
        
        // Center map on current location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      },
      (error: any) => {
        console.error('Location error:', error);
        Alert.alert('Location Error', 'Unable to get your current location. Please check your location settings.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const initializeSocket = async () => {
    try {
      if (!token) return;

      socketRef.current = io('http://localhost:3001', {
        auth: {
          token: token
        },
        transports: ['websocket'],
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });      socketRef.current.on('location-update', (data: any) => {
        console.log('Received location update:', data);
        // Handle real-time location updates from other devices if needed
      });

      socketRef.current.on('connect_error', (error: any) => {
        console.error('Socket connection error:', error);
      });

    } catch (error) {
      console.error('Socket initialization error:', error);
    }
  };

  const startTracking = () => {
    if (!device) {
      Alert.alert('Error', 'Device not initialized. Please restart the app.');
      return;
    }

    setIsTracking(true);
      watchIdRef.current = Geolocation.watchPosition(
      async (position: any) => {
        const { latitude, longitude, accuracy } = position.coords;
        const locationData: LocationData = {
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        };
        
        setCurrentLocation(locationData);
        setLastLocationUpdate(new Date());
        
        try {
          // Send location to server
          await LocationService.sendLocation(device.id, locationData);
          
          // Emit real-time update via socket
          if (socketRef.current) {
            socketRef.current.emit('location-update', {
              deviceId: device.id,
              ...locationData
            });
          }
        } catch (error) {
          console.error('Failed to send location:', error);
        }
      },
      (error: any) => {
        console.error('Location tracking error:', error);
        Alert.alert('Tracking Error', 'Failed to track location. Please check your location settings.');
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
        fastestInterval: 3000,
      }
    );
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            cleanup();
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: currentLocation?.latitude || 37.78825,
          longitude: currentLocation?.longitude || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        followsUserLocation={isTracking}>
        
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            description={`Accuracy: ${currentLocation.accuracy?.toFixed(2)}m`}
          />
        )}
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.trackingButton,
              isTracking ? styles.trackingButtonActive : styles.trackingButtonInactive
            ]}
            onPress={isTracking ? stopTracking : startTracking}>
            <Text style={styles.trackingButtonText}>
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>

          {lastLocationUpdate && (
            <Text style={styles.lastUpdate}>
              Last update: {lastLocationUpdate.toLocaleTimeString()}
            </Text>
          )}
        </View>

        {currentLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationText}>
              Lat: {currentLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              Lng: {currentLocation.longitude.toFixed(6)}
            </Text>
            {currentLocation.accuracy && (
              <Text style={styles.locationText}>
                Accuracy: {currentLocation.accuracy.toFixed(2)}m
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 15,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  controls: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 15,
  },
  trackingButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
  },
  trackingButtonActive: {
    backgroundColor: '#ff4444',
  },
  trackingButtonInactive: {
    backgroundColor: '#4CAF50',
  },
  trackingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastUpdate: {
    marginTop: 10,
    fontSize: 12,
    color: '#666',
  },
  locationInfo: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  locationText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default MapDashboardScreen;
