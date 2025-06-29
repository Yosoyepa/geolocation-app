const io = require('socket.io-client');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const TEST_TOKEN = process.argv[2]; // Pass token as command line argument

if (!TEST_TOKEN) {
    console.log('❌ Please provide a JWT token as an argument');
    console.log('Usage: node socket_test_client.js <JWT_TOKEN>');
    process.exit(1);
}

console.log('🚀 Starting Socket.IO Test Client');
console.log('📡 Connecting to:', SERVER_URL);
console.log('🔑 Using token:', TEST_TOKEN.substring(0, 20) + '...');

// Create socket connection
const socket = io(SERVER_URL, {
    auth: {
        token: TEST_TOKEN
    },
    transports: ['websocket', 'polling']
});

// Connection events
socket.on('connect', () => {
    console.log('✅ Connected to server with ID:', socket.id);
    console.log('🎯 Testing location updates...');
    
    // Start sending test location updates
    let updateCount = 0;
    const sendLocationUpdate = () => {
        updateCount++;
        
        // Generate random coordinates around Bogotá
        const baseLatitude = 4.7110;
        const baseLongitude = -74.0721;
        const randomOffset = () => (Math.random() - 0.5) * 0.01; // Small random offset
        
        const locationData = {
            latitude: baseLatitude + randomOffset(),
            longitude: baseLongitude + randomOffset(),
            accuracy: Math.random() * 20 + 5,
            altitude: 2640 + Math.random() * 100,
            heading: Math.random() * 360,
            speed: Math.random() * 10,
            timestamp: new Date().toISOString(),
            metadata: {
                testUpdate: true,
                updateNumber: updateCount,
                source: 'socket_test_client'
            }
        };
        
        console.log(`📍 Sending location update #${updateCount}:`, {
            lat: locationData.latitude.toFixed(6),
            lng: locationData.longitude.toFixed(6),
            accuracy: locationData.accuracy.toFixed(2)
        });
        
        socket.emit('location-update', locationData);
    };
    
    // Send initial location update
    setTimeout(sendLocationUpdate, 1000);
    
    // Send updates every 5 seconds
    setInterval(sendLocationUpdate, 5000);
});

socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
});

socket.on('disconnect', (reason) => {
    console.log('🔌 Disconnected:', reason);
});

// Listen for location updates from server (what other clients would receive)
socket.on('location-update', (data) => {
    console.log('📡 Received location update broadcast:', {
        userId: data.userId,
        coordinates: `${data.latitude ? data.latitude.toFixed(6) : 'N/A'}, ${data.longitude ? data.longitude.toFixed(6) : 'N/A'}`,
        timestamp: data.timestamp
    });
});

// Listen for welcome message
socket.on('connected', (data) => {
    console.log('🎉 Server welcome message:', data.message);
});

// Listen for errors
socket.on('error', (error) => {
    console.log('⚠️ Socket error:', error);
});

// Listen for ping/pong
socket.on('pong', (data) => {
    console.log('🏓 Pong received:', data.timestamp);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down test client...');
    socket.disconnect();
    process.exit(0);
});

console.log('🔄 Test client is running. Press Ctrl+C to stop.');
console.log('📊 This client will send location updates every 5 seconds and listen for broadcasts.');
