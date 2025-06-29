# 📡 API Documentation

Comprehensive REST API documentation for the Geolocation Tracking App backend.

## 🔗 Base URL

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

## 🔐 Authentication

The API uses **JSON Web Tokens (JWT)** for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration
- **Default**: 24 hours
- **Refresh**: Not implemented (tokens must be renewed via login)

## 📋 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "provided_value"
    }
  ]
}
```

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `username`: 3-50 characters, alphanumeric + underscore
- `email`: Valid email format, unique
- `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- `firstName/lastName`: 2-50 characters, letters and spaces only

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /auth/login
Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "lastLoginAt": "2024-01-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### GET /auth/profile
Get current user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isActive": true,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "lastLoginAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

### POST /auth/logout
Logout user (client-side token removal).

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### PUT /auth/profile
Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John Updated",
  "lastName": "Doe Updated"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "firstName": "John Updated",
      "lastName": "Doe Updated",
      "isActive": true,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:30:00.000Z"
    }
  }
}
```

---

### PUT /auth/change-password
Change user password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!",
  "confirmPassword": "NewPass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### POST /auth/verify-token
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

## 📱 Device Management Endpoints

### POST /devices
Register a new device or update existing device information.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "sdk_gphone64_x86_64",
  "type": "mobile",
  "platform": "android",
  "version": "16",
  "metadata": {
    "model": "sdk_gphone64_x86_64",
    "manufacturer": "Google",
    "osVersion": "16",
    "appVersion": "1.0.0"
  }
}
```

**Device Types:**
- `mobile`
- `tablet`
- `gps_tracker`
- `vehicle`
- `other`

**Response (201) - New Device:**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "device": {
      "id": 5,
      "userId": 1,
      "deviceName": "sdk_gphone64_x86_64",
      "deviceType": "mobile",
      "platform": "android",
      "version": "16",
      "isActive": true,
      "lastConnectedAt": "2024-01-01T12:00:00.000Z",
      "metadata": {
        "model": "sdk_gphone64_x86_64",
        "manufacturer": "Google"
      },
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    },
    "isNew": true
  }
}
```

**Response (200) - Updated Device:**
```json
{
  "success": true,
  "message": "Device updated successfully",
  "data": {
    "device": {
      "id": 5,
      "userId": 1,
      "deviceName": "sdk_gphone64_x86_64",
      "deviceType": "mobile",
      "platform": "android",
      "version": "16",
      "isActive": true,
      "lastConnectedAt": "2024-01-01T12:05:00.000Z",
      "metadata": {
        "model": "sdk_gphone64_x86_64"
      },
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:05:00.000Z"
    },
    "isNew": false
  }
}
```

---

### GET /devices
Get all devices for the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Devices retrieved successfully",
  "data": {
    "devices": [
      {
        "id": 5,
        "deviceName": "sdk_gphone64_x86_64",
        "deviceType": "mobile",
        "platform": "android",
        "isActive": true,
        "lastConnectedAt": "2024-01-01T12:00:00.000Z",
        "locations": [
          {
            "id": 10,
            "latitude": "37.4219983",
            "longitude": "-122.084",
            "timestamp": "2024-01-01T12:00:00.000Z"
          }
        ]
      }
    ],
    "count": 1
  }
}
```

---

### PUT /devices/:deviceId
Update a specific device.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Device Name",
  "isActive": true,
  "metadata": {
    "customField": "value"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Device updated successfully",
  "data": {
    "device": {
      "id": 5,
      "deviceName": "Updated Device Name",
      "deviceType": "mobile",
      "platform": "android",
      "isActive": true,
      "lastConnectedAt": "2024-01-01T12:05:00.000Z"
    }
  }
}
```

---

## 📍 Location Tracking Endpoints

### POST /locations
Store a new GPS location point.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "deviceId": "5",
  "latitude": 37.4219983,
  "longitude": -122.084,
  "accuracy": 5.0,
  "altitude": 10.0,
  "heading": 180.0,
  "speed": 0.0,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "metadata": {
    "source": "gps",
    "provider": "network"
  }
}
```

**Validation Rules:**
- `latitude`: -90 to 90
- `longitude`: -180 to 180
- `accuracy`: >= 0 (meters)
- `altitude`: Optional (meters)
- `heading`: 0-360 degrees
- `speed`: >= 0 (m/s)
- `deviceId`: Must belong to authenticated user

**Response (201):**
```json
{
  "success": true,
  "message": "Location stored successfully",
  "data": {
    "location": {
      "id": 14,
      "deviceId": 5,
      "latitude": "37.4219983",
      "longitude": "-122.084",
      "accuracy": "5",
      "altitude": "10",
      "heading": "180",
      "speed": "0",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z",
      "device": {
        "id": 5,
        "deviceName": "sdk_gphone64_x86_64",
        "deviceType": "mobile",
        "userId": 1
      }
    }
  }
}
```

---

### GET /locations
Retrieve location history with filtering options.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `deviceId` (optional): Filter by specific device
- `startDate` (optional): ISO date string (e.g., 2024-01-01T00:00:00Z)
- `endDate` (optional): ISO date string
- `limit` (optional): Number of results (1-1000, default: 100)
- `offset` (optional): Offset for pagination (default: 0)

**Example:**
```
GET /api/locations?deviceId=5&startDate=2024-01-01T00:00:00Z&limit=50
```

**Response (200):**
```json
{
  "success": true,
  "message": "User locations retrieved successfully",
  "data": {
    "locations": [
      {
        "id": 14,
        "deviceId": 5,
        "latitude": "37.4219983",
        "longitude": "-122.084",
        "accuracy": "5",
        "timestamp": "2024-01-01T12:00:00.000Z",
        "device": {
          "id": 5,
          "deviceName": "sdk_gphone64_x86_64",
          "deviceType": "mobile"
        }
      }
    ],
    "count": 1,
    "filters": {
      "deviceId": "5",
      "startDate": "2024-01-01T00:00:00Z",
      "limit": "50"
    }
  }
}
```

---

### GET /devices/:deviceId/locations
Get locations for a specific device.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:** Same as `/locations`

**Response (200):**
```json
{
  "success": true,
  "message": "Device locations retrieved successfully",
  "data": {
    "locations": [
      {
        "id": 14,
        "deviceId": 5,
        "latitude": "37.4219983",
        "longitude": "-122.084",
        "accuracy": "5",
        "timestamp": "2024-01-01T12:00:00.000Z"
      }
    ],
    "count": 1,
    "deviceId": 5,
    "filters": {}
  }
}
```

---

### GET /locations/latest
Get latest location for each device.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Latest locations retrieved successfully",
  "data": {
    "devices": [
      {
        "id": 5,
        "deviceName": "sdk_gphone64_x86_64",
        "deviceType": "mobile",
        "lastLocation": {
          "id": 14,
          "latitude": "37.4219983",
          "longitude": "-122.084",
          "accuracy": "5",
          "timestamp": "2024-01-01T12:00:00.000Z"
        }
      }
    ],
    "count": 1
  }
}
```

---

## 🎯 Geofence Endpoints (Planned - Not Yet Implemented)

### POST /geofences
Create a new geofence.

**Response (501):**
```json
{
  "success": false,
  "message": "Geofence functionality will be implemented in the next phase",
  "data": null
}
```

### GET /geofences
Get user geofences.

**Response (501):**
```json
{
  "success": false,
  "message": "Geofence functionality will be implemented in the next phase",
  "data": null
}
```

---

## 🔌 Socket.IO Real-time Events

### Connection
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Client to Server Events

#### join
Join user-specific room for real-time updates.
```javascript
socket.emit('join', { userId: 1 });
```

#### location-update
Send real-time location update.
```javascript
socket.emit('location-update', {
  latitude: 37.4219983,
  longitude: -122.084,
  accuracy: 5.0,
  timestamp: new Date().toISOString()
});
```

#### ping
Health check.
```javascript
socket.emit('ping');
```

### Server to Client Events

#### connected
Connection confirmation.
```javascript
socket.on('connected', (data) => {
  console.log('Connected:', data.message);
  // Output: "Connected to geolocation tracking server"
});
```

#### new-location
Real-time location updates from devices.
```javascript
socket.on('new-location', (data) => {
  console.log('Location update:', data);
  /*
  {
    location: {
      id: 14,
      deviceId: 5,
      latitude: 37.4219983,
      longitude: -122.084,
      timestamp: "2024-01-01T12:00:00.000Z",
      device: { id: 5, deviceName: "Phone", userId: 1 }
    },
    userId: 1,
    deviceId: 5,
    timestamp: "2024-01-01T12:00:00.000Z"
  }
  */
});
```

#### pong
Health check response.
```javascript
socket.on('pong', (data) => {
  console.log('Pong received:', data.timestamp);
});
```

#### error
Socket error handling.
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

---

## 🚨 Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long",
      "value": ""
    }
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication token missing",
  "status": 401
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "Access denied",
  "status": 403
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Resource not found",
  "status": 404
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "status": 500
}
```

---

## 📊 HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (resource created) |
| `400` | Bad Request | Invalid request data |
| `401` | Unauthorized | Missing or invalid authentication |
| `403` | Forbidden | Valid auth but insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `422` | Unprocessable Entity | Validation failed |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server-side error |
| `501` | Not Implemented | Feature not yet implemented |

---

## ⚡ Rate Limiting

API endpoints have different rate limits:

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| `/auth/login`, `/auth/register` | 5 requests | 1 minute |
| `/auth/change-password` | 3 requests | 1 minute |
| General API endpoints | 100 requests | 1 minute |
| `/locations` POST | 60 requests | 1 minute |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🧪 Testing Examples

### Using cURL

**Register User:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login User:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Register Device:**
```bash
curl -X POST http://localhost:3000/api/devices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Device",
    "type": "mobile",
    "platform": "android",
    "version": "14"
  }'
```

**Send Location:**
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deviceId": "5",
    "latitude": 37.4219983,
    "longitude": -122.084,
    "accuracy": 5.0,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }'
```

### Using JavaScript (Fetch)

```javascript
// Login
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'TestPass123!'
  })
});

const loginData = await loginResponse.json();
const token = loginData.data.token;

// Send Location
const locationResponse = await fetch('http://localhost:3000/api/locations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    deviceId: '5',
    latitude: 37.4219983,
    longitude: -122.084,
    accuracy: 5.0,
    timestamp: new Date().toISOString()
  })
});
```

---

## 🔐 Security Considerations

1. **Always use HTTPS** in production
2. **Store JWT tokens securely** (not in localStorage for web)
3. **Validate all input data** on both client and server
4. **Implement proper CORS** for web applications
5. **Rate limiting** prevents abuse
6. **Input sanitization** prevents injection attacks
7. **Regular security audits** of dependencies

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
- 📖 **Documentation**: Check `/docs` folder
- 💬 **Questions**: Contact via email above

---

**Last Updated**: June 29, 2025  
**API Version**: 1.0.0  
**© 2025 Juan Carlos Andrade Unigarro - Universidad Nacional de Colombia**
