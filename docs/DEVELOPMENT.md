# 🛠️ Development Guide

This guide covers setting up the development environment, coding standards, testing, and contribution guidelines for the Geolocation Tracking App.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Flutter** 3.16.0+
- **PostgreSQL** 13+
- **Git** 2.30+
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **VS Code** or **IntelliJ IDEA** (recommended IDEs)

### Clone & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/geolocation-app.git
cd geolocation-app

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
flutter pub get

# Return to project root
cd ..
```

## 🏗️ Project Structure

```
geolocation-app/
├── README.md                 # Main project documentation
├── docker-compose.yml        # Development Docker setup
├── .gitignore               # Git ignore rules
├── .env.example             # Environment template
│
├── backend/                 # Node.js API server
│   ├── package.json
│   ├── server.js           # Main server entry point
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── tests/              # Backend tests
│   └── migrations/         # Database migrations
│
├── frontend/               # Flutter mobile app
│   ├── pubspec.yaml
│   ├── lib/
│   │   ├── main.dart       # App entry point
│   │   ├── config/         # App configuration
│   │   ├── models/         # Data models
│   │   ├── services/       # API & location services
│   │   ├── screens/        # UI screens
│   │   ├── widgets/        # Reusable UI components
│   │   └── utils/          # Utility functions
│   ├── android/            # Android-specific code
│   ├── ios/                # iOS-specific code
│   └── test/               # Flutter tests
│
└── docs/                   # Documentation
    ├── ARCHITECTURE.md     # System architecture
    ├── API.md              # API documentation
    ├── DEPLOYMENT.md       # Deployment guide
    └── DEVELOPMENT.md      # This file
```

## 🐳 Development Environment Setup

### Option 1: Docker Development (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The development stack includes:
- PostgreSQL database on port 5432
- Backend API on port 3000
- pgAdmin on port 5050 (admin@admin.com / admin)

### Option 2: Local Development

#### Database Setup

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb geolocation_app
sudo -u postgres createuser geolocation_user

# Set password
sudo -u postgres psql
ALTER USER geolocation_user PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE geolocation_app TO geolocation_user;
\q
```

#### Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

**.env configuration:**
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=geolocation_app
DB_USER=geolocation_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_256_bits_long
JWT_EXPIRES_IN=24h

# Server
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# CORS (allow all origins in development)
CORS_ORIGIN=*
```

```bash
# Install dependencies
npm install

# Run database migrations (if any)
npm run migrate

# Start development server
npm run dev
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
flutter pub get

# Run on emulator/device
flutter run

# Run on specific device
flutter devices
flutter run -d <device-id>
```

## 📱 Mobile Development

### Android Setup

1. **Install Android Studio**
2. **Configure AVD (Android Virtual Device)**
3. **Accept Android licenses:**
   ```bash
   flutter doctor --android-licenses
   ```

4. **Enable USB debugging** on physical device

### iOS Setup (macOS only)

1. **Install Xcode** from App Store
2. **Open iOS Simulator:**
   ```bash
   open -a Simulator
   ```

3. **Configure code signing** in Xcode for physical device testing

### Device Permissions

The app requires location permissions. Test both scenarios:

- **Location granted**: Full functionality
- **Location denied**: Graceful degradation with appropriate messaging

## 🧪 Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --grep "auth"
```

#### Test Structure

```
backend/tests/
├── unit/           # Unit tests
│   ├── models/
│   ├── services/
│   └── utils/
├── integration/    # Integration tests
│   └── api/
└── fixtures/       # Test data
```

#### Example Test

```javascript
// backend/tests/unit/services/auth.test.js
const { expect } = require('chai');
const AuthService = require('../../services/AuthService');

describe('AuthService', () => {
  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = AuthService.validatePassword('StrongPass123!');
      expect(result.isValid).to.be.true;
    });

    it('should reject weak password', () => {
      const result = AuthService.validatePassword('weak');
      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Password too short');
    });
  });
});
```

### Frontend Testing

```bash
cd frontend

# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# Run integration tests
flutter test integration_test/
```

#### Test Structure

```
frontend/test/
├── unit/           # Unit tests
├── widget/         # Widget tests
├── integration/    # Integration tests
└── mocks/          # Mock data
```

#### Example Test

```dart
// frontend/test/unit/services/auth_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:geolocation_app/services/auth_service.dart';

void main() {
  group('AuthService', () {
    test('should validate email format', () {
      expect(AuthService.isValidEmail('test@example.com'), true);
      expect(AuthService.isValidEmail('invalid-email'), false);
    });
  });
}
```

### API Testing with Postman

Import the Postman collection:

```bash
# Import collection
curl -o postman-collection.json https://raw.githubusercontent.com/yourusername/geolocation-app/main/docs/postman-collection.json
```

## 🎨 Code Style & Standards

### Backend (JavaScript/Node.js)

#### ESLint Configuration

```json
{
  "extends": ["eslint:recommended", "node"],
  "env": {
    "node": true,
    "es6": true
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-console": "warn",
    "no-unused-vars": "error"
  }
}
```

#### Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100
}
```

#### Code Conventions

```javascript
// File naming: kebab-case
// auth-service.js, user-controller.js

// Class naming: PascalCase
class AuthService {
  // Method naming: camelCase
  validatePassword(password) {
    // Variable naming: camelCase
    const minLength = 8;
    
    // Constants: SCREAMING_SNAKE_CASE
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    
    return PASSWORD_REGEX.test(password) && password.length >= minLength;
  }
}

// Function documentation
/**
 * Validates user password strength
 * @param {string} password - The password to validate
 * @returns {boolean} True if password is strong
 */
function validatePassword(password) {
  // Implementation
}
```

### Frontend (Dart/Flutter)

#### Analysis Options

```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  exclude:
    - "**/*.g.dart"
    - "**/*.freezed.dart"

linter:
  rules:
    prefer_const_constructors: true
    prefer_const_declarations: true
    avoid_print: true
    prefer_single_quotes: true
```

#### Code Conventions

```dart
// File naming: snake_case
// auth_service.dart, user_screen.dart

// Class naming: PascalCase
class AuthService {
  // Method naming: camelCase
  Future<bool> validatePassword(String password) async {
    // Variable naming: camelCase
    const int minLength = 8;
    
    // Constants: camelCase with const
    const String passwordRegex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)';
    
    return RegExp(passwordRegex).hasMatch(password) && 
           password.length >= minLength;
  }
}

// Widget documentation
/// A custom button widget for authentication screens
/// 
/// [onPressed] callback is called when button is tapped
/// [text] is the button label text
/// [isLoading] shows loading indicator when true
class AuthButton extends StatelessWidget {
  const AuthButton({
    Key? key,
    required this.onPressed,
    required this.text,
    this.isLoading = false,
  }) : super(key: key);
  
  final VoidCallback? onPressed;
  final String text;
  final bool isLoading;
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      child: isLoading 
        ? const CircularProgressIndicator()
        : Text(text),
    );
  }
}
```

## 🔧 Development Tools

### VS Code Extensions

**Backend Development:**
- ESLint
- Prettier
- REST Client
- Thunder Client
- GitLens

**Frontend Development:**
- Flutter
- Dart
- Flutter Widget Snippets
- Awesome Flutter Snippets

### IntelliJ IDEA Plugins

- Flutter
- Dart
- Database Navigator
- GitToolBox

### Debugging

#### Backend Debugging

```bash
# Debug mode with inspector
node --inspect server.js

# VS Code launch configuration
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/backend/server.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

#### Frontend Debugging

```bash
# Flutter inspector
flutter run --debug

# VS Code launch configuration
{
  "type": "dart",
  "request": "launch",
  "name": "Debug Flutter",
  "program": "lib/main.dart"
}
```

## 🔄 Git Workflow

### Branch Naming

- `feature/user-authentication`
- `bugfix/location-accuracy-issue`
- `hotfix/critical-security-patch`
- `refactor/api-response-structure`

### Commit Message Format

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```bash
feat(auth): add password strength validation

Implement password validation with requirements:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

Closes #123

fix(location): handle location permission denied

Add proper error handling when user denies location permission.
Show appropriate message and disable tracking features.

Fixes #456
```

### Pull Request Process

1. **Create feature branch** from `develop`
2. **Implement feature** with tests
3. **Run all tests** and ensure they pass
4. **Update documentation** if needed
5. **Create pull request** with clear description
6. **Code review** by team members
7. **Merge** after approval

### Pre-commit Hooks

```bash
# Install husky
npm install -D husky

# Install lint-staged
npm install -D lint-staged

# Setup pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

**lint-staged configuration:**
```json
{
  "lint-staged": {
    "backend/**/*.js": ["eslint --fix", "prettier --write"],
    "frontend/**/*.dart": ["dart format", "flutter analyze"]
  }
}
```

## 🚀 Development Commands

### Backend Commands

```bash
# Development
npm run dev          # Start with nodemon
npm run start        # Start production
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier

# Database
npm run migrate      # Run migrations
npm run migrate:undo # Undo last migration
npm run seed         # Seed database with test data
```

### Frontend Commands

```bash
# Development
flutter run                    # Run on default device
flutter run --hot             # Hot reload enabled
flutter run --release         # Release mode
flutter run -d chrome         # Run on web

# Building
flutter build apk             # Build Android APK
flutter build ios             # Build iOS
flutter build web             # Build for web

# Testing
flutter test                  # Run unit tests
flutter test --coverage      # With coverage
flutter integration_test     # Run integration tests

# Analysis
flutter analyze              # Static analysis
flutter doctor              # Check setup
dart format lib/            # Format code
```

## 🐛 Debugging Tips

### Common Issues

1. **Backend not starting:**
   ```bash
   # Check port availability
   lsof -i :3000
   
   # Check environment variables
   printenv | grep DB_
   
   # Test database connection
   psql -h localhost -U geolocation_user -d geolocation_app
   ```

2. **Flutter build failures:**
   ```bash
   # Clean build cache
   flutter clean
   flutter pub get
   
   # Clear pub cache
   flutter pub cache repair
   
   # Check Flutter doctor
   flutter doctor -v
   ```

3. **Location not working:**
   - Check app permissions in device settings
   - Verify location services are enabled
   - Test on physical device (emulator may not have GPS)
   - Check network connectivity for assisted GPS

### Performance Profiling

#### Backend Profiling

```bash
# Using clinic.js
npm install -g clinic
clinic doctor -- node server.js

# Using built-in profiler
node --prof server.js
node --prof-process isolate-*.log > profile.txt
```

#### Flutter Profiling

```bash
# Performance overlay
flutter run --profile

# Memory profiling
flutter run --track-widget-creation

# Observatory (debugging tools)
flutter run --observatory-port=8888
```

## 🔐 Security Guidelines

### API Security

1. **Always validate input** on both client and server
2. **Use parameterized queries** to prevent SQL injection
3. **Implement rate limiting** on all endpoints
4. **Sanitize output** to prevent XSS attacks
5. **Use HTTPS** in production
6. **Store secrets** in environment variables, not code

### Mobile Security

1. **Validate server certificates** in HTTPS requests
2. **Store sensitive data** in secure storage (Keychain/Keystore)
3. **Obfuscate code** in release builds
4. **Implement certificate pinning** for API calls
5. **Handle app backgrounding** to hide sensitive information

## 📦 Package Management

### Backend Dependencies

```bash
# Add production dependency
npm install package-name

# Add development dependency
npm install -D package-name

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

### Frontend Dependencies

```bash
# Add dependency
flutter pub add package_name

# Add dev dependency
flutter pub add -d package_name

# Update dependencies
flutter pub upgrade

# Get dependencies
flutter pub get
```

## 🌍 Internationalization (i18n)

### Backend i18n

```javascript
// Using i18next
const i18next = require('i18next');

i18next.init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        'auth.login.success': 'Login successful',
        'auth.login.invalid': 'Invalid credentials'
      }
    },
    es: {
      translation: {
        'auth.login.success': 'Inicio de sesión exitoso',
        'auth.login.invalid': 'Credenciales inválidas'
      }
    }
  }
});
```

### Frontend i18n

```yaml
# pubspec.yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: any
```

```dart
// lib/l10n/app_localizations.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AppLocalizations {
  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  String get loginSuccess => Intl.message(
    'Login successful',
    name: 'loginSuccess',
  );
}
```

## 🚀 Performance Optimization

### Backend Optimization

1. **Database indexing** for frequently queried columns
2. **Connection pooling** for database connections
3. **Caching** with Redis for frequent data
4. **Compression** middleware for responses
5. **Clustering** for multi-core utilization

### Frontend Optimization

1. **Lazy loading** for heavy screens
2. **Image optimization** and caching
3. **State management** efficiency
4. **Build optimization** with tree shaking
5. **Memory management** for location updates

## 📊 Monitoring & Logging

### Development Logging

```javascript
// Backend logging with winston
const winston = require('winston');

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console()
  ]
});
```

```dart
// Flutter logging
import 'package:logging/logging.dart';

final logger = Logger('GeolocationApp');

void setupLogging() {
  Logger.root.level = Level.ALL;
  Logger.root.onRecord.listen((record) {
    print('${record.level.name}: ${record.time}: ${record.message}');
  });
}
```

## 🤝 Contributing

### Getting Started

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch
4. **Make** your changes
5. **Test** thoroughly
6. **Submit** a pull request

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance impact considered
- [ ] Backwards compatibility maintained

### Issue Reporting

Use the issue template:

```markdown
**Bug Description**
A clear description of the bug.

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- OS: [e.g. iOS/Android/Web]
- Version: [e.g. 1.0.0]
- Device: [e.g. iPhone 12, Pixel 5]
```

---

## 📚 Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Flutter Documentation](https://docs.flutter.dev/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Happy Coding! 🚀**

For questions or help, reach out to the development team or create an issue on GitHub.
