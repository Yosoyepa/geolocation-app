# API Documentation - Geolocation Tracking System

## Base URL
```
http://localhost:3001/api
```

## Authentication

The API uses JSON Web Tokens (JWT) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Validation errors (if applicable)
  ]
}
```

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "TestPassword123!"
}
```

**Validation Rules:**
- `username`: Required, string, 3-30 characters, alphanumeric
- `firstName`: Required, string, 2-50 characters, letters only
- `lastName`: Required, string, 2-50 characters, letters only
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters with uppercase, lowercase, number, and special character

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2025-06-08T23:15:30.000Z",
      "updatedAt": "2025-06-08T23:15:30.000Z"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email already exists"
  ]
}
```

---

### Login User

**POST** `/auth/login`

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "lastLoginAt": "2025-06-08T23:20:30.000Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Get User Profile

**GET** `/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "uuid-string",
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2025-06-08T23:15:30.000Z",
      "lastLoginAt": "2025-06-08T23:20:30.000Z"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

---

## Device Management Endpoints

### Register Device

**POST** `/devices/register`

Register a new tracking device for the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "John's iPhone",
  "platform": "ios",
  "version": "17.0",
  "metadata": {
    "model": "iPhone 14",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Validation Rules:**
- `name`: Required, string, 2-100 characters
- `platform`: Required, string
- `version`: Required, string
- `metadata`: Optional, object

**Success Response (201):**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "data": {
    "device": {
      "id": "device-uuid",
      "name": "John's iPhone",
      "platform": "ios",
      "version": "17.0",
      "isActive": true,
      "userId": "user-uuid",
      "createdAt": "2025-06-08T23:25:30.000Z",
      "lastConnectedAt": "2025-06-08T23:25:30.000Z",
      "metadata": {
        "model": "iPhone 14",
        "userAgent": "Mozilla/5.0..."
      }
    }
  }
}
```

---

### Get User Devices

**GET** `/devices`

Get all devices registered by the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Devices retrieved successfully",
  "data": {
    "devices": [
      {
        "id": "device-uuid-1",
        "name": "John's iPhone",
        "platform": "ios",
        "version": "17.0",
        "isActive": true,
        "lastConnectedAt": "2025-06-08T23:25:30.000Z",
        "createdAt": "2025-06-08T23:20:30.000Z"
      },
      {
        "id": "device-uuid-2",
        "name": "John's Android",
        "platform": "android",
        "version": "14",
        "isActive": false,
        "lastConnectedAt": "2025-06-07T15:30:00.000Z",
        "createdAt": "2025-06-01T10:15:00.000Z"
      }
    ]
  }
}
```

---

### Update Device

**PUT** `/devices/:deviceId`

Update device information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "John's New iPhone",
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Device updated successfully",
  "data": {
    "device": {
      "id": "device-uuid",
      "name": "John's New iPhone",
      "platform": "ios",
      "version": "17.0",
      "isActive": true,
      "lastConnectedAt": "2025-06-08T23:30:30.000Z"
    }
  }
}
```

---

## Location Tracking Endpoints

### Store Location

**POST** `/locations`

Store a new location update from a device.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "deviceId": "device-uuid",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 5.0,
  "timestamp": 1704750630000
}
```

**Validation Rules:**
- `deviceId`: Required, valid UUID, must belong to authenticated user
- `latitude`: Required, number, -90 to 90
- `longitude`: Required, number, -180 to 180
- `accuracy`: Optional, number, >= 0
- `timestamp`: Optional, number (Unix timestamp)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Location stored successfully",
  "data": {
    "location": {
      "id": "location-uuid",
      "deviceId": "device-uuid",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "accuracy": 5.0,
      "timestamp": "2025-06-08T23:35:30.000Z",
      "createdAt": "2025-06-08T23:35:30.000Z"
    },
    "geofenceEvents": []
  }
}
```

---

### Get Location History

**GET** `/locations/history/:deviceId`

Get paginated location history for a specific device.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50, max: 100)
- `startDate`: Start date filter (ISO string)
- `endDate`: End date filter (ISO string)

**Example Request:**
```
GET /locations/history/device-uuid?page=1&limit=20&startDate=2025-06-01T00:00:00.000Z
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Location history retrieved successfully",
  "data": {
    "locations": [
      {
        "id": "location-uuid-1",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "accuracy": 5.0,
        "timestamp": "2025-06-08T23:35:30.000Z",
        "createdAt": "2025-06-08T23:35:30.000Z"
      },
      {
        "id": "location-uuid-2",
        "latitude": 40.7130,
        "longitude": -74.0062,
        "accuracy": 3.0,
        "timestamp": "2025-06-08T23:30:30.000Z",
        "createdAt": "2025-06-08T23:30:30.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### Get Latest Locations

**GET** `/locations/latest`

Get the latest location for each of the user's devices.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Latest locations retrieved successfully",
  "data": {
    "locations": [
      {
        "deviceId": "device-uuid-1",
        "deviceName": "John's iPhone",
        "location": {
          "id": "location-uuid-1",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "accuracy": 5.0,
          "timestamp": "2025-06-08T23:35:30.000Z",
          "createdAt": "2025-06-08T23:35:30.000Z"
        }
      },
      {
        "deviceId": "device-uuid-2",
        "deviceName": "John's Android",
        "location": {
          "id": "location-uuid-2",
          "latitude": 40.7130,
          "longitude": -74.0062,
          "accuracy": 8.0,
          "timestamp": "2025-06-08T22:30:30.000Z",
          "createdAt": "2025-06-08T22:30:30.000Z"
        }
      }
    ]
  }
}
```

---

## Geofence Endpoints (Future Implementation)

### Create Geofence

**POST** `/geofences`

Create a new geofence boundary.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Home",
  "description": "Home geofence area",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 100,
  "isActive": true
}
```

---

### Get User Geofences

**GET** `/geofences`

Get all geofences created by the authenticated user.

---

### Update Geofence

**PUT** `/geofences/:geofenceId`

Update an existing geofence.

---

### Delete Geofence

**DELETE** `/geofences/:geofenceId`

Delete a geofence.

---

## Real-time Communication (Socket.IO)

### Connection

Connect to the Socket.IO server with JWT authentication:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Events

#### Client → Server

**location-update**
Send real-time location updates:

```javascript
socket.emit('location-update', {
  deviceId: 'device-uuid',
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 5.0,
  timestamp: Date.now()
});
```

#### Server → Client

**location-update**
Receive real-time location updates from other devices:

```javascript
socket.on('location-update', (data) => {
  console.log('New location:', data);
  // data contains: deviceId, latitude, longitude, accuracy, timestamp
});
```

**geofence-event**
Receive geofence entry/exit notifications:

```javascript
socket.on('geofence-event', (data) => {
  console.log('Geofence event:', data);
  // data contains: deviceId, geofenceId, eventType, timestamp
});
```

---

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | VALIDATION_ERROR | Request validation failed |
| 401 | UNAUTHORIZED | Authentication required or invalid |
| 403 | FORBIDDEN | Access denied |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | UNPROCESSABLE_ENTITY | Invalid request data |
| 429 | TOO_MANY_REQUESTS | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Server error |

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 attempts per 15 minutes per IP
- **Location updates**: 1000 requests per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1704750900
```

---

## Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Register a device:
```bash
curl -X POST http://localhost:3000/api/devices/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Device",
    "platform": "web",
    "version": "1.0"
  }'
```

### Send location:
```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "deviceId": "YOUR_DEVICE_ID",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "accuracy": 5.0
  }'
```

---

## API Client SDKs

### JavaScript/TypeScript Example

```typescript
class GeolocationAPI {
  private baseURL = 'http://localhost:3000/api';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.data.token);
    return data;
  }

  async sendLocation(deviceId: string, latitude: number, longitude: number) {
    return this.request('/locations', {
      method: 'POST',
      body: JSON.stringify({ deviceId, latitude, longitude }),
    });
  }
}
```

---

**Last Updated**: June 8, 2025  
**API Version**: 1.0.0  
**Contact**: Development Team
