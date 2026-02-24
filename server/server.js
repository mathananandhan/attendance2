const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: { message: 'Too many requests, please try again later.' }
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// Make io accessible to controllers
app.set('io', io);

// Routes
app.get('/', (req, res) => {
    res.send('EdTech API Gateway is running...');
});

const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const gamificationRoutes = require('./routes/gamificationRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const examRoutes = require('./routes/examRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/notifications', notificationRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/exams', examRoutes);

// Socket.io Connection
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('register', (userId) => {
        connectedUsers.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
        // Remove user from map
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

// Export for use in controllers
app.set('connectedUsers', connectedUsers);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edtech_platform';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    });

module.exports = app;
