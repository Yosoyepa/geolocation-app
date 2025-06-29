import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';

class AuthService {
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  static const String socketUrl = 'http://10.0.2.2:3000';

  Future<Map<String, dynamic>> register(
    String username,
    String firstName,
    String lastName,
    String email,
    String password,
  ) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
        }),
      );

      final responseData = jsonDecode(response.body);

      // Save token and user data if registration is successful
      if (response.statusCode == 201 && responseData['success'] == true && responseData['data'] != null) {
        final data = responseData['data'];
        if (data['token'] != null && data['user'] != null) {
          await _saveToken(data['token']);
          await _saveUser(User.fromJson(data['user']));
          // Clear any existing device ID to force new device creation
          await _clearDeviceId();
        }
      }

      return responseData;
    } catch (e) {
      return {'error': 'Network error: $e'};
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200 && responseData['success'] == true && responseData['data'] != null) {
        final data = responseData['data'];
        if (data['token'] != null && data['user'] != null) {
          await _saveToken(data['token']);
          await _saveUser(User.fromJson(data['user']));
          // Clear any existing device ID to ensure correct device association
          await _clearDeviceId();
        }
      }

      return responseData;
    } catch (e) {
      return {'error': 'Network error: $e'};
    }
  }

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<void> _saveUser(User user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_data', jsonEncode(user.toJson()));
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<User?> getCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userData = prefs.getString('user_data');
    if (userData != null) {
      return User.fromJson(jsonDecode(userData));
    }
    return null;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear(); // Clear all stored data
    print('All user data cleared on logout');
  }

  Future<void> _clearDeviceId() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('device_id');
  }

  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null;
  }
}
