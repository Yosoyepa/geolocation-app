# Geolocation Tracker Mobile App

React Native mobile application for real-time location tracking with backend integration.

## Features

- **User Authentication**: Login and registration with JWT tokens
- **Real-time Location Tracking**: GPS-based location monitoring
- **Live Map Display**: Interactive maps showing current position
- **Socket.IO Integration**: Real-time location updates
- **Device Management**: Automatic device registration and management
- **Secure Storage**: Encrypted local storage for authentication tokens

## Prerequisites

- Node.js 18+
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Setup Instructions

### 1. Install Dependencies

```bash
cd mobile-app
npm install --legacy-peer-deps
```

### 2. Platform-specific Setup

#### Android Setup

1. Ensure Android Studio is installed
2. Set up Android SDK and emulator
3. Enable developer options on your device
4. Run: `npx react-native run-android`

#### iOS Setup (macOS only)

1. Ensure Xcode is installed
2. Install CocoaPods: `sudo gem install cocoapods`
3. Navigate to iOS folder: `cd ios && pod install && cd ..`
4. Run: `npx react-native run-ios`

### 3. Start Metro Bundler

```bash
npx react-native start
```

### 4. Backend Configuration

Make sure the backend server is running on `http://localhost:3000` before starting the mobile app.

To change the backend URL, edit the `API_BASE_URL` in:
- `src/services/AuthService.ts`
- `src/services/LocationService.ts`
- `src/screens/MapDashboardScreen.tsx` (Socket.IO connection)

## App Structure

```
src/
├── context/
│   └── AuthContext.tsx          # Authentication state management
├── screens/
│   ├── LoginScreen.tsx          # User login interface
│   ├── RegisterScreen.tsx       # User registration interface
│   └── MapDashboardScreen.tsx   # Main map and tracking interface
├── services/
│   ├── AuthService.ts           # Authentication API calls
│   └── LocationService.ts       # Location and device API calls
└── components/                  # Reusable UI components (future use)
```

## Key Features Implementation

### Authentication Flow
1. User login/registration with email and password
2. JWT token storage in AsyncStorage
3. Automatic token validation on app start
4. Secure logout with token cleanup

### Location Tracking
1. Request location permissions on Android/iOS
2. GPS location monitoring with high accuracy
3. Real-time location updates sent to backend
4. Live map visualization with markers
5. Socket.IO real-time communication

### Device Management
1. Automatic device registration on first use
2. Device information storage (platform, version)
3. Device ID persistence for location association

## Permissions Required

### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

### iOS (ios/GeolocationTracker/Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to track your position.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This app needs location access to track your position.</string>
```

## API Integration

The app integrates with the following backend endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Device Management
- `POST /api/devices/register` - Register new device
- `GET /api/devices` - Get user devices

### Location Tracking
- `POST /api/locations` - Send location update
- `GET /api/locations/history/:deviceId` - Get location history
- `GET /api/locations/latest` - Get latest locations

### Real-time Communication
- Socket.IO connection with JWT authentication
- `location-update` events for real-time tracking

## Troubleshooting

### Common Issues

1. **Metro bundler fails to start**
   - Clear cache: `npx react-native start --reset-cache`
   - Clear node_modules: `rm -rf node_modules && npm install`

2. **Android build fails**
   - Clean project: `cd android && ./gradlew clean && cd ..`
   - Check Android SDK setup

3. **iOS build fails**
   - Clean CocoaPods: `cd ios && pod deintegrate && pod install && cd ..`
   - Clean Xcode project

4. **Location not working**
   - Check device location permissions
   - Ensure location services are enabled
   - Test on physical device (emulator GPS may be limited)

5. **Backend connection issues**
   - Verify backend server is running
   - Check network connectivity
   - Update API_BASE_URL for production

## Development Tips

1. **Testing on Physical Device**
   - Enable developer options and USB debugging
   - For location testing, use physical device instead of emulator

2. **Network Configuration**
   - Use `adb reverse tcp:3000 tcp:3000` for Android to access localhost
   - For iOS simulator, localhost should work directly

3. **Debugging**
   - Use `npx react-native log-android` for Android logs
   - Use `npx react-native log-ios` for iOS logs
   - Enable Remote JS Debugging in development menu

## Future Enhancements

- Offline location caching
- Geofencing notifications
- Location history visualization
- Multi-device tracking
- Push notifications
- Dark mode support

## License

This project is part of the Geolocation Tracking System developed for educational purposes.
