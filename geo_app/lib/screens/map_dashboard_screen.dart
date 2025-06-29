import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../services/location_service.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';

class MapDashboardScreen extends StatefulWidget {
  const MapDashboardScreen({super.key});

  @override
  State<MapDashboardScreen> createState() => _MapDashboardScreenState();
}

class _MapDashboardScreenState extends State<MapDashboardScreen> {
  final LocationService _locationService = LocationService();
  final AuthService _authService = AuthService();
  GoogleMapController? _mapController;

  Position? _currentPosition;
  final Set<Marker> _markers = {};
  StreamSubscription<Position>? _positionSubscription;
  bool _isTracking = false;
  bool _permissionsGranted = false;

  @override
  void initState() {
    super.initState();
    _initializeLocation();
    _initializeSocket();
  }

  @override
  void dispose() {
    _positionSubscription?.cancel();
    _locationService.disconnect();
    super.dispose();
  }

  Future<void> _initializeLocation() async {
    // Ensure device is registered on first launch after login
    await _locationService.ensureDeviceRegistration();
    
    // Check permissions
    _permissionsGranted = await _locationService.checkPermissions();

    if (!_permissionsGranted) {
      _showPermissionDialog();
      return;
    }

    // Get current position
    _currentPosition = await _locationService.getCurrentPosition();

    if (_currentPosition != null) {
      setState(() {
        _markers.add(
          Marker(
            markerId: const MarkerId('current_location'),
            position: LatLng(
              _currentPosition!.latitude,
              _currentPosition!.longitude,
            ),
            infoWindow: const InfoWindow(title: 'Current Location'),
            icon: BitmapDescriptor.defaultMarkerWithHue(
              BitmapDescriptor.hueBlue,
            ),
          ),
        );
      });

      // Move camera to current position
      if (_mapController != null) {
        _mapController!.animateCamera(
          CameraUpdate.newLatLngZoom(
            LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
            15.0,
          ),
        );
      }
    }
  }

  Future<void> _initializeSocket() async {
    await _locationService.initializeSocket();
    
    // Listen to location updates from other devices/users
    await _locationService.listenToLocationUpdates((locationData) {
      // Handle real-time location updates from other devices/users
      print('Received location update: $locationData');
    });
    
    // Listen for location-update events
    _locationService.onLocationUpdate((data) {
      print('Location update event: $data');
      // Handle location update event - could update markers on map
      _handleLocationUpdate(data);
    });
    
    // Listen for geofence events
    _locationService.onGeofenceEvent((data) {
      print('Geofence event: $data');
      // Handle geofence event - could show notifications
      _handleGeofenceEvent(data);
    });
  }

  void _startTracking() {
    if (!_permissionsGranted) {
      _showPermissionDialog();
      return;
    }

    setState(() {
      _isTracking = true;
    });

    _positionSubscription = _locationService.getPositionStream().listen(
      (Position position) {
        setState(() {
          _currentPosition = position;
          _markers.removeWhere(
            (marker) => marker.markerId.value == 'current_location',
          );
          _markers.add(
            Marker(
              markerId: const MarkerId('current_location'),
              position: LatLng(position.latitude, position.longitude),
              infoWindow: const InfoWindow(title: 'Current Location'),
              icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueGreen,
              ),
            ),
          );
        });

        // Send location to server
        _locationService.sendLocationToServer(
          position.latitude,
          position.longitude,
          accuracy: position.accuracy,
        );

        // Update camera position
        if (_mapController != null) {
          _mapController!.animateCamera(
            CameraUpdate.newLatLng(
              LatLng(position.latitude, position.longitude),
            ),
          );
        }
      },
      onError: (error) {
        print('Location stream error: $error');
        _stopTracking();
      },
    );
  }

  void _stopTracking() {
    setState(() {
      _isTracking = false;
    });
    _positionSubscription?.cancel();
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Location Permission Required'),
        content: const Text(
          'This app needs location permission to track your position. Please enable location services and grant permission.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Geolocator.openLocationSettings();
            },
            child: const Text('Settings'),
          ),
        ],
      ),
    );
  }

  void _handleLocationUpdate(Map<String, dynamic> data) {
    // Handle location updates from other users/devices
    // This could be used to show other users' locations on the map
    try {
      final latitude = data['latitude']?.toDouble();
      final longitude = data['longitude']?.toDouble();
      final userId = data['userId'];
      
      if (latitude != null && longitude != null) {
        setState(() {
          // Add or update marker for other user's location
          _markers.add(
            Marker(
              markerId: MarkerId('user_$userId'),
              position: LatLng(latitude, longitude),
              infoWindow: InfoWindow(title: 'User $userId'),
              icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueRed,
              ),
            ),
          );
        });
      }
    } catch (e) {
      print('Error handling location update: $e');
    }
  }
  
  void _handleGeofenceEvent(Map<String, dynamic> data) {
    // Handle geofence events
    try {
      final eventType = data['type'];
      final userId = data['userId'];
      final geofenceName = data['geofenceName'];
      
      // Show notification or dialog for geofence events
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Geofence Event: $eventType for $geofenceName'),
            backgroundColor: eventType == 'enter' ? Colors.green : Colors.orange,
          ),
        );
      }
    } catch (e) {
      print('Error handling geofence event: $e');
    }
  }

  Future<void> _logout() async {
    await _authService.logout();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Geo Tracking'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ],
      ),
      body: _currentPosition == null
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Getting your location...'),
                ],
              ),
            )
          : GoogleMap(
              onMapCreated: (GoogleMapController controller) {
                _mapController = controller;
              },
              initialCameraPosition: CameraPosition(
                target: LatLng(
                  _currentPosition!.latitude,
                  _currentPosition!.longitude,
                ),
                zoom: 15.0,
              ),
              markers: _markers,
              myLocationEnabled: true,
              myLocationButtonEnabled: true,
              compassEnabled: true,
              mapToolbarEnabled: false,
            ),
      floatingActionButton: _permissionsGranted
          ? FloatingActionButton.extended(
              onPressed: _isTracking ? _stopTracking : _startTracking,
              icon: Icon(_isTracking ? Icons.stop : Icons.play_arrow),
              label: Text(_isTracking ? 'Stop Tracking' : 'Start Tracking'),
              backgroundColor: _isTracking ? Colors.red : Colors.green,
            )
          : null,
      bottomNavigationBar: _currentPosition != null
          ? Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Latitude: ${_currentPosition!.latitude.toStringAsFixed(6)}',
                    style: const TextStyle(fontSize: 14),
                  ),
                  Text(
                    'Longitude: ${_currentPosition!.longitude.toStringAsFixed(6)}',
                    style: const TextStyle(fontSize: 14),
                  ),
                  Text(
                    'Status: ${_isTracking ? "Tracking Active" : "Tracking Stopped"}',
                    style: TextStyle(
                      fontSize: 14,
                      color: _isTracking ? Colors.green : Colors.grey,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            )
          : null,
    );
  }
}
