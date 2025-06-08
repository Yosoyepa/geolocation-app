import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

class AuthService {
  // Set auth token for all requests
  setAuthToken(token: string | null) {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  // Login user
  async login(email: string, password: string) {
    try {
      const response = await axios.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data.data;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Set token for future requests
      this.setAuthToken(token);
      
      return { token, user };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Register user
  async register(name: string, email: string, password: string) {
    try {
      const response = await axios.post('/auth/register', {
        name,
        email,
        password,
      });

      const { token, user } = response.data.data;
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Set token for future requests
      this.setAuthToken(token);
      
      return { token, user };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // Logout user
  async logout() {
    try {
      // Remove token from AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Remove token from axios headers
      this.setAuthToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Get stored token
  async getStoredToken() {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        this.setAuthToken(token);
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  // Get stored user
  async getStoredUser() {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const token = await this.getStoredToken();
    return !!token;
  }
}

export default new AuthService();
