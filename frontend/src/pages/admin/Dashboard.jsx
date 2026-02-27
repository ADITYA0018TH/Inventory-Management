import { useState, useEffect } from 'react';
import API from '../../api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package as FiPackage, AlertTriangle as FiAlertTriangle, DollarSign as FiDollarSign, ShoppingCart as FiShoppingCart, Layers as FiLayers, Clock as FiClock } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [products, setProducts] = useState([]);
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [statsRes, alertsRes, expiringRes, productsRes, batchesRes] = await Promise.all([
                API.get('/orders/stats'),
                API.get('/raw-materials/alerts'),
                API.get('/batches/expiring'),
                API.get('/products'),
                API.get('/batches')
            ]);
            setStats(statsRes.data);
            setAlerts(alertsRes.data);
            setExpiring(expiringRes.data);
            setProducts(productsRes.data);
            setBatches(batchesRes.data);
        } catch (err) {
            toast.error('Failed to load dashboard');
        }
    };

    const orderChartData = stats ? [
        { name: 'Pending', value: stats.pendingOrders },
        { name: 'Approved', value: stats.approvedOrders },
        { name: 'Shipped', value: stats.shippedOrders },
        { name: 'Delivered', value: stats.deliveredOrders },
    ] : [];

    const productionData = batches.reduce((acc, batch) => {
        const name = batch.productId?.name || 'Unknown';
        const existing = acc.find(i => i.name === name);
        if (existing) existing.quantity += batch.quantityProduced;
        else acc.push({ name, quantity: batch.quantityProduced });
        return acc;
    }, []);

    return (
        <div className="page">
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Overview of your manufacturing operations</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card stat-purple">
                    <div className="stat-icon"><FiPackage /></div>
                    <div className="stat-info">
                        <span className="stat-value">{products.length}</span>
                        <span className="stat-label">Products</span>
                    </div>
                </div>
                <div className="stat-card stat-blue">
                    <div className="stat-icon"><FiLayers /></div>
                    <div className="stat-info">
                        <span className="stat-value">{batches.length}</span>
                        <span className="stat-label">Batches</span>
                    </div>
                </div>
                <div className="stat-card stat-green">
                    <div className="stat-icon"><FiDollarSign /></div>
                    <div className="stat-info">
                        <span className="stat-value">₹{stats?.totalRevenue?.toLocaleString() || 0}</span>
                        <span className="stat-label">Revenue</span>
                    </div>
                </div>
                <div className="stat-card stat-amber">
                    <div className="stat-icon"><FiShoppingCart /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.pendingOrders || 0}</span>
                        <span className="stat-label">Pending Orders</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Production Chart */}
                <div className="card chart-card">
                    <h3>Production Volume by Product</h3>
                    {productionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={productionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" fontSize={12} />
                                <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                <Bar dataKey="quantity" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">No production data yet</div>
                    )}
                </div>

                {/* Order Status Pie */}
                <div className="card chart-card">
                    <h3>Order Status</h3>
                    {stats?.totalOrders > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={orderChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                                    {orderChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">No orders yet</div>
                    )}
                </div>

                {/* Low Stock Alerts */}
                <div className="card alert-card">
                    <h3><FiAlertTriangle className="text-amber" /> Low Stock Alerts</h3>
                    {alerts.length > 0 ? (
                        <div className="alert-list">
                            {alerts.map(a => (
                                <div key={a._id} className="alert-item">
                                    <span className="alert-name">{a.name}</span>
                                    <span className="alert-stock danger">{a.currentStock} {a.unit} remaining (Min: {a.minimumThreshold})</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state success">✅ All materials above threshold</div>
                    )}
                </div>

                {/* Expiring Batches */}
                <div className="card alert-card">
                    <h3><FiClock className="text-amber" /> Expiring in 30 Days</h3>
                    {expiring.length > 0 ? (
                        <div className="alert-list">
                            {expiring.map(b => (
                                <div key={b._id} className="alert-item">
                                    <span className="alert-name">{b.batchId} — {b.productId?.name}</span>
                                    <span className="alert-stock warning">Exp: {new Date(b.expDate).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state success">✅ No batches expiring soon</div>
                    )}
                </div>
            </div>
        </div>
    );
}
