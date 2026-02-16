const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use('/api/auth', authRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/products', productRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/search', searchRoutes);

app.get('/', (req, res) => {
    res.send('PharmaLink API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
