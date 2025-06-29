# Geolocation Tracking System - Complete Documentation

## Project Overview

This is a comprehensive geolocation tracking system built with a Node.js backend, PostgreSQL database, and **Flutter mobile application**. The system provides real-time location tracking, user authentication, device management, and interactive mapping capabilities with Socket.IO real-time communication.

## Architecture

### Backend (Node.js + Express)
- **API Server**: RESTful API with JWT authentication
- **Real-time Communication**: Socket.IO for live location updates  
- **Database**: PostgreSQL with Sequelize ORM
- **Security**: bcrypt password hashing, JWT tokens, rate limiting

### Database (PostgreSQL)
- **Users**: User accounts and authentication
- **Devices**: Registered tracking devices
- **Locations**: GPS coordinates with timestamps
- **Geofences**: Geographic boundaries (future implementation)

### Mobile App (Flutter)
- **Cross-platform**: iOS and Android support with single codebase
- **Authentication**: Login/registration screens with form validation
- **Real-time Tracking**: GPS location monitoring with location permissions
- **Map Visualization**: Interactive OpenStreetMap with custom markers
- **Socket Integration**: Real-time location updates via Socket.IO
- **Modern UI**: Material Design with responsive layouts

## Quick Start Guide

### Prerequisites

1. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
2. **Docker** - [Download Docker Desktop](https://www.docker.com/products/docker-desktop)
3. **Git** - For version control
4. **Flutter Development Environment**:
   - Flutter SDK 3.19+ - [Install Flutter](https://docs.flutter.dev/get-started/install)
   - Android Studio (for Android development)
   - Xcode (for iOS development, macOS only)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd geolocation-app
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your configuration
   # Default values should work for local development
   ```

3. **Start the Database**
   ```bash
   docker-compose up -d postgres
   ```

4. **Setup Backend**
   ```bash
   cd backend
   npm install
   npx sequelize-cli db:migrate
   npm start
   ```

5. **Setup Mobile App**
   ```bash
   cd geo_app
   flutter pub get
   
   # Check connected devices
   flutter devices
   
   # Run on connected device/emulator:
   flutter run
   
   # For specific platform:
   flutter run -d android
   flutter run -d ios  # macOS only
   ```

### Verification

1. Backend should be running on `http://localhost:3000`
2. Test API endpoint: `curl http://localhost:3000/api/auth/profile`
3. Mobile app should connect to backend automatically

## System Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  Mobile App     │◄──►│  Backend API    │◄──►│  PostgreSQL     │
│  (Flutter)      │    │  (Node.js)      │    │  Database       │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │
        │                       │
        └───────────────────────┘
         Real-time (Socket.IO)
```

## Feature Checklist

### ✅ Completed Features

#### Authentication System
- [x] User registration with email validation
- [x] User login with JWT tokens
- [x] Password hashing with bcrypt
- [x] Token-based session management
- [x] Protected route middleware
- [x] User profile management

#### Database & Models
- [x] PostgreSQL database setup
- [x] Sequelize ORM configuration
- [x] User model with authentication fields
- [x] Device model for tracking devices
- [x] Location model for GPS coordinates
- [x] Geofence model (structure ready)
- [x] Database migrations executed

#### Backend API
- [x] RESTful API design
- [x] Input validation with Joi
- [x] Error handling middleware
- [x] Rate limiting for security
- [x] CORS configuration
- [x] Security headers with Helmet
- [x] Socket.IO real-time communication

#### Device Management
- [x] Device registration endpoint
- [x] Device listing and updates
- [x] Device-user association
- [x] Device metadata storage

#### Location Tracking
- [x] Location storage endpoint
- [x] Location history retrieval
- [x] Latest location per device
- [x] Real-time location updates via Socket.IO
- [x] Location accuracy tracking

#### Mobile Application
- [x] Flutter project setup with cross-platform support
- [x] Navigation between screens with Flutter Navigator
- [x] Authentication state management with Provider
- [x] Login and registration screens with Material Design
- [x] Map visualization with OpenStreetMap integration
- [x] GPS location tracking with geolocator package
- [x] Real-time location updates via Socket.IO client
- [x] Location permission handling with permission_handler
- [x] Secure token storage with flutter_secure_storage

### ⏳ Pending Features (Future Development)

#### Geofencing System
- [ ] Complete geofence CRUD operations
- [ ] Geofence entry/exit detection
- [ ] Push notifications for geofence events
- [ ] Geofence visualization on maps

#### Enhanced Mobile Features
- [ ] Offline location caching
- [ ] Background location tracking
- [ ] Location history visualization
- [ ] Multi-device tracking view
- [ ] Dark mode support
- [ ] Push notifications

#### Advanced Backend Features
- [ ] Location data analytics
- [ ] Export location history
- [ ] Admin dashboard
- [ ] Multi-tenant support
- [ ] Location data encryption

## Development Workflow

### Backend Development

1. **Making Database Changes**
   ```bash
   cd backend
   
   # Create new migration
   npx sequelize-cli migration:generate --name migration-name
   
   # Edit migration file
   # Apply migration
   npx sequelize-cli db:migrate
   ```

2. **Adding New API Endpoints**
   - Create controller in `src/api/`
   - Add validation schema in `src/middlewares/validationSchemas.js`
   - Create routes in `src/api/` 
   - Update main app.js if needed

3. **Testing API Endpoints**
   ```bash
   # Using curl
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

### Mobile Development

1. **Adding New Screens**
   - Create screen widget in `lib/screens/`
   - Add to navigation routes in `main.dart`
   - Update routing configuration in MaterialApp

2. **Testing on Devices**
   ```bash
   # Check connected devices
   flutter devices
   
   # Android - ensure device is connected
   adb devices
   flutter run -d android
   
   # iOS - use Xcode simulator (macOS only)
   flutter run -d ios
   ```

3. **Debugging**
   ```bash
   # View logs
   flutter logs
   
   # Hot reload during development
   flutter run --hot
   
   # Clear cache if needed
   flutter clean
   flutter pub get
   ```

## Security Considerations

### Implemented Security Measures

1. **Authentication Security**
   - JWT tokens with expiration
   - bcrypt password hashing with salt rounds
   - Secure token storage in mobile app

2. **API Security**
   - Rate limiting on all endpoints
   - Input validation and sanitization
   - CORS protection
   - Security headers via Helmet
   - SQL injection prevention via Sequelize

3. **Mobile Security**
   - Flutter Secure Storage for secure token storage
   - HTTPS enforcement in production
   - Permission-based location access

### Production Security Checklist

- [ ] Use HTTPS/TLS certificates
- [ ] Set strong JWT secret keys
- [ ] Configure environment variables properly
- [ ] Enable database connection encryption
- [ ] Set up proper CORS origins
- [ ] Implement request logging
- [ ] Add API rate limiting per user
- [ ] Enable database backups

## Deployment Guide

### Backend Deployment

1. **Environment Setup**
   ```bash
   # Production environment variables
   NODE_ENV=production
   JWT_SECRET=your-super-secure-secret-key
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_NAME=geolocation_tracker
   DB_USER=your-db-user
   DB_PASS=your-db-password
   ```

2. **Database Migration**
   ```bash
   npx sequelize-cli db:migrate --env production
   ```

3. **Docker Deployment**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Mobile App Deployment

1. **Android (Play Store)**
   ```bash
   cd geo_app
   
   # Build APK for testing
   flutter build apk --release
   
   # Build App Bundle for Play Store
   flutter build appbundle --release
   
   # Upload AAB to Play Store Console
   ```

2. **iOS (App Store)**
   ```bash
   cd geo_app
   
   # Build iOS app
   flutter build ios --release
   
   # Open Xcode for signing and upload
   open ios/Runner.xcworkspace
   
   # Archive and upload to App Store Connect
   ```

## Troubleshooting Guide

### Common Backend Issues

1. **Database Connection Failed**
   - Check PostgreSQL container is running: `docker ps`
   - Verify connection string in .env
   - Ensure database exists: `docker-compose exec postgres psql -U postgres -l`

2. **Migration Errors**
   - Check migration syntax
   - Verify database permissions
   - Run migrations manually: `npx sequelize-cli db:migrate`

3. **Socket.IO Connection Issues**
   - Verify JWT token in authentication
   - Check CORS settings
   - Enable websocket transport

### Common Mobile Issues

1. **Flutter Build Issues**
   ```bash
   # Clear all caches
   flutter clean
   flutter pub get
   
   # Reset pub cache if needed
   flutter pub cache repair
   ```

2. **Location Permission Denied**
   - Check device location settings
   - Request permissions in app settings
   - Test on physical device (emulator GPS limited)

3. **API Connection Issues**
   - Verify backend URL in services
   - For Android emulator: `adb reverse tcp:3000 tcp:3000`
   - Check network connectivity

## Performance Optimization

### Backend Optimization

1. **Database Indexing**
   - Add indexes on frequently queried fields
   - Optimize location queries with spatial indexes
   - Use connection pooling

2. **API Performance**
   - Implement response caching
   - Use pagination for large datasets
   - Optimize JSON serialization

### Mobile Optimization

1. **Location Tracking**
   - Adjust GPS accuracy based on needs
   - Implement intelligent location filtering
   - Use background location efficiently

2. **Map Performance**
   - Limit markers on screen
   - Use clustering for many points
   - Optimize map rendering

## Contributing Guidelines

1. **Code Standards**
   - Use ESLint and Prettier
   - Follow conventional commit messages
   - Write unit tests for new features

2. **Pull Request Process**
   - Create feature branches
   - Test thoroughly before submitting
   - Update documentation as needed

## Support and Maintenance

### Monitoring
- Set up error tracking (Sentry)
- Monitor API performance
- Track mobile app crashes

### Updates
- Keep dependencies updated
- Monitor security vulnerabilities
- Regular database maintenance

## License

This project is developed for educational purposes as part of a university networking course. See LICENSE file for details.

---

## 📞 Support & Contact

For questions, support, or collaboration:

**👨‍💻 Developer & Maintainer:**
- **Juan Carlos Andrade Unigarro**
- 📧 **Primary Email**: jandradeu@unal.edu.co
- 📧 **Alternative Email**: andradeunigarrojuancarlos@gmail.com
- 🏫 **Institution**: Universidad Nacional de Colombia
- 📚 **Course**: Redes 2025

**📋 Project Resources:**
- 🐛 **Bug Reports**: Create GitHub Issues
- 📖 **Documentation**: Check project documentation files
- 💬 **Questions**: Contact via email above

---

**Last Updated**: June 29, 2025  
**Version**: 1.0.0  
**Status**: Complete - Flutter Implementation with Comprehensive Documentation  
**© 2025 Juan Carlos Andrade Unigarro - Universidad Nacional de Colombia**
