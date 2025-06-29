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

  /// Ensures device is registered on first launch after login
  Future<void> ensureDeviceRegistration() async {
    await getOrCreateDeviceId();
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
      'platform': platform,
      'model': name,
      'version': version
    };

    final token = await _authService.getToken();
    if (token == null) return null;

    final response = await http.post(
      Uri.parse('$baseUrl/devices/register'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'name': name,
        'platform': platform,
        'version': version,
        'metadata': metadata,
      }),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      final responseData = jsonDecode(response.body);
      deviceId = responseData['device']['id']?.toString();
      if (deviceId != null) {
        await prefs.setString(_deviceIdKey, deviceId);
        return deviceId;
      }
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
      final token = await _authService.getToken();
      if (token == null) return false;

      final deviceId = await getOrCreateDeviceId();
      if (deviceId == null) return false;

      final response = await http.post(
        Uri.parse('$baseUrl/locations'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'deviceId': deviceId,
          'latitude': latitude,
          'longitude': longitude,
          'accuracy': accuracy ?? 0.0,
          'timestamp': DateTime.now().toIso8601String(),
        }),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error sending location to server: $e');
      return false;
    }
  }

  Future<void> initializeSocket() async {
    if (_socket != null) return;

    // Get token and deviceId before connecting
    final token = await _authService.getToken();
    final deviceId = await getOrCreateDeviceId();
    
    if (token == null) {
      print('No token available, cannot initialize socket');
      return;
    }

    _socket = IO.io(socketUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {'token': token},
    });

    _socket!.on('connect', (_) async {
      print('Connected to Socket.IO server');
      
      // Get current user and emit join event
      final user = await _authService.getCurrentUser();
      if (user != null) {
        _socket!.emit('join', {'userId': user.id});
        print('Joined user room: ${user.id}');
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
