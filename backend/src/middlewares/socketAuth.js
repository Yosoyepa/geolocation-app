const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Socket.IO authentication middleware
 * Authenticates socket connections using JWT tokens
 */
const socketAuth = async (socket, next) => {
  try {
    // Get token from handshake auth or query
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in database
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'email', 'firstName', 'lastName', 'isActive']
    });

    if (!user || !user.isActive) {
      return next(new Error('User not found or inactive'));
    }

    // Attach user to socket
    socket.user = user;
    
    // Join user-specific room for private notifications
    socket.join(`user:${user.id}`);

    console.log(`Socket authenticated for user ${user.id} (${user.email})`);
    
    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Authentication failed'));
  }
};

/**
 * Initialize Socket.IO server with authentication and event handlers
 * @param {Object} io - Socket.IO server instance
 */
const initializeSocket = (io) => {
  // Use authentication middleware
  io.use(socketAuth);

  // Handle client connections
  io.on('connection', (socket) => {
    const user = socket.user;
    
    console.log(`User ${user.id} (${user.email}) connected via Socket.IO`);

    // Handle location updates (for real-time tracking)
    socket.on('location-update', (data) => {
      try {
        console.log(`Location update from user ${user.id}:`, data);
        
        // Broadcast to user's other devices/sessions
        socket.to(`user:${user.id}`).emit('location-update', {
          ...data,
          userId: user.id,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error handling location update:', error);
        socket.emit('error', { message: 'Failed to process location update' });
      }
    });

    // Handle geofence alerts (for future implementation)
    socket.on('geofence-alert', (data) => {
      try {
        console.log(`Geofence alert from user ${user.id}:`, data);
        
        // Broadcast geofence alert to user's devices
        io.to(`user:${user.id}`).emit('geofence-alert', {
          ...data,
          userId: user.id,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error handling geofence alert:', error);
        socket.emit('error', { message: 'Failed to process geofence alert' });
      }
    });

    // Handle device status updates
    socket.on('device-status', (data) => {
      try {
        console.log(`Device status update from user ${user.id}:`, data);
        
        // Broadcast to user's other sessions
        socket.to(`user:${user.id}`).emit('device-status', {
          ...data,
          userId: user.id,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Error handling device status:', error);
        socket.emit('error', { message: 'Failed to process device status' });
      }
    });

    // Handle client ping for connection health check
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User ${user.id} (${user.email}) disconnected: ${reason}`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`Socket error for user ${user.id}:`, error);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Connected to geolocation tracking server',
      userId: user.id,
      timestamp: new Date().toISOString()
    });
  });

  // Handle general Socket.IO errors
  io.on('error', (error) => {
    console.error('Socket.IO server error:', error);
  });

  console.log('✅ Socket.IO server initialized with authentication');
};

/**
 * Middleware to attach Socket.IO instance to Express requests
 * This allows controllers to emit events
 */
const attachSocketIO = (io) => {
  return (req, res, next) => {
    req.io = io;
    next();
  };
};

module.exports = {
  socketAuth,
  initializeSocket,
  attachSocketIO
};
