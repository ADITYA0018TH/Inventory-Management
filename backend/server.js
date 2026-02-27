const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.io setup
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Track connected users
const connectedUsers = new Map();
io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.on('register', (userId) => {
        connectedUsers.set(userId, socket.id);
        socket.join(userId);
        console.log(`👤 User ${userId} registered for notifications`);
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
    });
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
const authRoutes = require('./routes/auth');
const rawMaterialRoutes = require('./routes/rawMaterials');
const productRoutes = require('./routes/products');
const batchRoutes = require('./routes/batches');
const orderRoutes = require('./routes/orders');
const auditRoutes = require('./routes/audit');
const searchRoutes = require('./routes/search');
const reportRoutes = require('./routes/reports');
const exportRoutes = require('./routes/export');
const supplierRoutes = require('./routes/suppliers');
const returnRoutes = require('./routes/returns');
const messageRoutes = require('./routes/messages');
const qualityRoutes = require('./routes/quality');
// New feature routes
const recallRoutes = require('./routes/recalls');
const storageRoutes = require('./routes/storage');
const complianceRoutes = require('./routes/compliance');
const forecastingRoutes = require('./routes/forecasting');
const analyticsRoutes = require('./routes/analytics');
const invoiceRoutes = require('./routes/invoice');
const notificationRoutes = require('./routes/notifications');
const purchaseOrderRoutes = require('./routes/purchaseOrders');
const warehouseRoutes = require('./routes/warehouses');

app.use('/api/auth', authRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/products', productRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/quality', qualityRoutes);
// New feature routes
app.use('/api/recalls', recallRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/forecasting', forecastingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/warehouses', warehouseRoutes);

app.get('/', (req, res) => {
    res.send('PharmaLink API is running');
});

// Start Server — use http server for Socket.io
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
