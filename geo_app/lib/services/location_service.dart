import 'dart:convert';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'auth_service.dart';

class LocationService {
  static const String baseUrl = 'http://localhost:3000/api';
  final AuthService _authService = AuthService();
  IO.Socket? _socket;

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

  Future<bool> sendLocationToServer(double latitude, double longitude) async {
    try {
      final token = await _authService.getToken();
      if (token == null) return false;

      final response = await http.post(
        Uri.parse('$baseUrl/locations'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'device_id': 1, // For MVP, using a default device ID
          'latitude': latitude,
          'longitude': longitude,
        }),
      );

      return response.statusCode == 200 || response.statusCode == 201;
    } catch (e) {
      print('Error sending location to server: $e');
      return false;
    }
  }

  void initializeSocket() {
    if (_socket != null) return;

    _socket = IO.io('http://localhost:3000', <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    _socket!.connect();

    _socket!.on('connect', (_) {
      print('Connected to Socket.IO server');
    });

    _socket!.on('disconnect', (_) {
      print('Disconnected from Socket.IO server');
    });
  }

  void listenToLocationUpdates(
    Function(Map<String, dynamic>) onLocationUpdate,
  ) {
    if (_socket == null) {
      initializeSocket();
    }

    _socket!.on('new-location', (data) {
      onLocationUpdate(data);
    });
  }

  void joinUserRoom(int userId) {
    if (_socket != null) {
      _socket!.emit('join', 'user:$userId');
    }
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
