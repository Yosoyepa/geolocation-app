import 'dart:convert';
import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'auth_service.dart';

class LocationService {
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  static const String socketUrl = 'http://10.0.2.2:3000';
  final AuthService _authService = AuthService();
  IO.Socket? _socket;
  static const String _deviceIdKey = 'device_id';
  bool _isRegistering = false;
  bool _isInitializingSocket = false;
  static LocationService? _instance;
  
  // Singleton pattern to prevent multiple instances
  factory LocationService() {
    _instance ??= LocationService._internal();
    return _instance!;
  }
  
  LocationService._internal();

  /// Ensures device is registered on first launch after login
  Future<void> ensureDeviceRegistration() async {
    if (_isRegistering) {
      print('Device registration already in progress, skipping...');
      return;
    }
    
    _isRegistering = true;
    try {
      await getOrCreateDeviceId();
    } finally {
      _isRegistering = false;
    }
  }

  Future<String?> getOrCreateDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    String? deviceId = prefs.getString(_deviceIdKey);

    if (deviceId != null) {
      return deviceId;
    }

    final deviceInfo = DeviceInfoPlugin();
    String name, platform, version;
    if (kIsWeb) {
      name = "Web Device";
      platform = "Web";
      version = "Web_Version_NA";
    } else if (Platform.isAndroid) {
      final androidInfo = await deviceInfo.androidInfo;
      name = androidInfo.model ?? "Unknown";
      platform = "Android";
      version = androidInfo.version.release ?? "Unknown";
    } else if (Platform.isIOS) {
      final iosInfo = await deviceInfo.iosInfo;
      name = iosInfo.utsname.machine ?? "Unknown";
      platform = "iOS";
      version = iosInfo.systemVersion ?? "Unknown";
    } else {
      name = "Unknown";
      platform = "Unknown";
      version = "Unknown";
    }

    final metadata = <String, String>{
      'platform': platform.toLowerCase(),
      'model': name,
      'version': version
    };

    final token = await _authService.getToken();
    if (token == null) return null;

    print('Registering device with backend...');
    final requestBody = {
      'name': name,
      'type': 'mobile',  // Add required type field
      'platform': platform.toLowerCase(),  // Use lowercase platform
      'version': version,
      'metadata': metadata,
    };
    print('Device registration request: ${jsonEncode(requestBody)}');
    
    final response = await http.post(
      Uri.parse('$baseUrl/devices'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(requestBody),
    );

    print('Device registration response status: ${response.statusCode}');
    print('Device registration response body: ${response.body}');
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      final responseData = jsonDecode(response.body);
      print('Parsed response data: $responseData');
      
      // Try multiple possible paths for device ID
// Try multiple possible paths for device ID with better null checking
if (responseData.containsKey('data') && 
    responseData['data'] != null &&
    responseData['data'] is Map &&
    responseData['data'].containsKey('device') &&
    responseData['data']['device'] != null &&
    responseData['data']['device'] is Map &&
    responseData['data']['device'].containsKey('id')) {
  deviceId = responseData['data']['device']['id']?.toString();
} else if (responseData.containsKey('device') &&
           responseData['device'] != null &&
           responseData['device'] is Map &&
           responseData['device'].containsKey('id')) {
  deviceId = responseData['device']['id']?.toString();
} else if (responseData.containsKey('deviceId')) {
  deviceId = responseData['deviceId']?.toString();
} else if (responseData.containsKey('id')) {
  deviceId = responseData['id']?.toString();
}

if (deviceId == null) {
  print('ERROR: Could not extract device ID from response');
  print('Response structure: ${responseData.keys.toList()}');
  // Return null to indicate failure
  return null;
}
      
      print('Extracted device ID: $deviceId');
      
      if (deviceId != null) {
        await prefs.setString(_deviceIdKey, deviceId);
        print('Device ID saved to preferences: $deviceId');
        return deviceId;
      } else {
        print('ERROR: Could not extract device ID from response');
      }
    } else {
      print('ERROR: Device registration failed with status ${response.statusCode}');
    }

    return null;
  }

  Future<bool> checkPermissions() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return false;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return false;
    }

    return true;
  }

  Stream<Position> getPositionStream() {
    return Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 10,
      ),
    );
  }

  Future<Position?> getCurrentPosition() async {
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      print('Error getting current position: $e');
      return null;
    }
  }

  Future<bool> sendLocationToServer(double latitude, double longitude, {double? accuracy}) async {
    try {
      print('=== sendLocationToServer called ===');
      final token = await _authService.getToken();
      if (token == null) {
        print('No token available');
        return false;
      }
      print('Token available: ${token.substring(0, 20)}...');

      final deviceId = await getOrCreateDeviceId();
      if (deviceId == null) {
        print('No device ID available');
        return false;
      }
      print('Device ID: $deviceId');

      final requestBody = {
        'deviceId': deviceId,
        'latitude': latitude,
        'longitude': longitude,
        'accuracy': accuracy ?? 0.0,
        'timestamp': DateTime.now().toIso8601String(),
      };
      print('Sending location request to: $baseUrl/locations');
      print('Request body: ${jsonEncode(requestBody)}');
      
      final response = await http.post(
        Uri.parse('$baseUrl/locations'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(requestBody),
      );

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');
      
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error sending location to server: $e');
      return false;
    }
  }

  Future<void> initializeSocket() async {
    if (_isInitializingSocket) {
      print('Socket initialization already in progress, skipping...');
      return;
    }

    _isInitializingSocket = true;
    try {
      // Always disconnect existing socket first
      if (_socket != null) {
        print('Disconnecting existing socket...');
        _socket!.disconnect();
        _socket = null;
      }

      // Get fresh token and deviceId before connecting
      final token = await _authService.getToken();
      final user = await _authService.getCurrentUser();
      
      if (token == null) {
        print('No token available, cannot initialize socket');
        return;
      }
      
      if (user == null) {
        print('No user available, cannot initialize socket');
        return;
      }

      print('Initializing socket with fresh token for user: ${user.id}');
      
      _socket = IO.io(socketUrl, <String, dynamic>{
        'transports': ['websocket'],
        'autoConnect': false,
        'forceNew': true, // Force new connection
        'auth': {'token': token},
      });

      _socket!.on('connect', (_) async {
        print('Connected to Socket.IO server');
        
        // Get current user and emit join event with fresh user data
        final currentUser = await _authService.getCurrentUser();
        if (currentUser != null && currentUser.id != null && currentUser.id.isNotEmpty) {
          _socket?.emit('join', {'userId': currentUser.id});
          print('Joined user room: ${currentUser.id}');
        } else {
          print('No user available for socket join');
        }
      });

      _socket!.on('disconnect', (_) {
        print('Disconnected from Socket.IO server');
      });

      // Listen for location updates
      _socket!.on('location-update', (data) {
        print('Received location update: $data');
        // Handle location update
      });

      // Listen for geofence events
      _socket!.on('geofence-event', (data) {
        print('Received geofence event: $data');
        // Handle geofence event
      });

      // Connect after configuration
      _socket!.connect();
    } catch (e) {
      print('Error initializing socket: $e');
    } finally {
      _isInitializingSocket = false;
    }
  }

  Future<void> listenToLocationUpdates(
    Function(Map<String, dynamic>) onLocationUpdate,
  ) async {
    if (_socket == null) {
      await initializeSocket();
    }

    _socket!.on('new-location', (data) {
      onLocationUpdate(data);
    });
  }

  // Add method to listen for location updates
  void onLocationUpdate(Function(Map<String, dynamic>) callback) {
    _socket?.on('location-update', (data) {
      callback(Map<String, dynamic>.from(data));
    });
  }

  // Add method to listen for geofence events
  void onGeofenceEvent(Function(Map<String, dynamic>) callback) {
    _socket?.on('geofence-event', (data) {
      callback(Map<String, dynamic>.from(data));
    });
  }

  void joinUserRoom(int userId) {
    if (_socket != null) {
      _socket!.emit('join', {'userId': userId});
      print('Manually joined user room: $userId');
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
