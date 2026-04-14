import { useState, useEffect } from 'react';
import API from '../../api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Package, Layers, IndianRupee, ShoppingCart,
    AlertTriangle, Clock, TrendingUp, ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f87171', '#8b5cf6'];

const tooltipStyle = {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    color: '#1e293b',
    boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
    fontSize: 13,
    padding: '10px 14px',
};

const DATE_FILTERS = [
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last 365 days', days: 365 },
    { label: 'All time', days: 0 },
];

const CustomBarLabel = ({ x, y, width, value }) => {
    if (!value) return null;
    return (
        <text x={x + width / 2} y={y - 6} fill="#6366f1" textAnchor="middle" fontSize={11} fontWeight={600}>
            {value}
        </text>
    );
};

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [products, setProducts] = useState([]);
    const [batches, setBatches] = useState([]);
    const [dateFilter, setDateFilter] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadDashboard(); }, [dateFilter]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const params = dateFilter > 0 ? `?days=${dateFilter}` : '';
            const isAdmin = user?.role === 'admin';
            const [statsRes, alertsRes, expiringRes, productsRes, batchesRes] = await Promise.all([
                isAdmin ? API.get(`/orders/stats${params}`) : Promise.resolve({ data: null }),
                API.get('/raw-materials/alerts'),
                API.get('/batches/expiring'),
                API.get('/products'),
                API.get(`/batches${params}`),
            ]);
            setStats(statsRes.data);
            setAlerts(alertsRes.data);
            setExpiring(expiringRes.data);
            setProducts(productsRes.data);
            setBatches(batchesRes.data);
        } catch {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const orderChartData = stats ? [
        { name: 'Pending', value: stats.pendingOrders || 0 },
        { name: 'Approved', value: stats.approvedOrders || 0 },
        { name: 'Shipped', value: stats.shippedOrders || 0 },
        { name: 'Delivered', value: stats.deliveredOrders || 0 },
    ].filter(d => d.value > 0) : [];

    const productionData = batches.reduce((acc, batch) => {
        const name = batch.productId?.name || 'Unknown';
        const existing = acc.find(i => i.name === name);
        if (existing) existing.quantity += batch.quantityProduced;
        else acc.push({ name, quantity: batch.quantityProduced });
        return acc;
    }, []);

    const statCards = [
        {
            label: 'Total Products',
            value: products.length,
            icon: Package,
            color: '#6366f1',
            bg: 'rgba(99,102,241,0.10)',
            trend: '+2 this month',
        },
        {
            label: 'Total Batches',
            value: batches.length,
            icon: Layers,
            color: '#3b82f6',
            bg: 'rgba(59,130,246,0.10)',
            trend: `${dateFilter > 0 ? `Last ${dateFilter}d` : 'All time'}`,
        },
        {
            label: 'Total Revenue',
            value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`,
            icon: IndianRupee,
            color: '#10b981',
            bg: 'rgba(16,185,129,0.10)',
            trend: 'Delivered orders',
        },
        {
            label: 'Pending Orders',
            value: stats?.pendingOrders || 0,
            icon: ShoppingCart,
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.10)',
            trend: 'Awaiting approval',
        },
    ];

    return (
        <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Dashboard</h1>
                    <p style={{ color: '#64748b', fontSize: 14 }}>Overview of your manufacturing operations</p>
                </div>
                <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: '4px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    {DATE_FILTERS.map(f => (
                        <button
                            key={f.days}
                            onClick={() => setDateFilter(f.days)}
                            style={{
                                padding: '7px 14px',
                                borderRadius: 8,
                                border: 'none',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: dateFilter === f.days ? '#6366f1' : 'transparent',
                                color: dateFilter === f.days ? '#fff' : '#64748b',
                                boxShadow: dateFilter === f.days ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                            }}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                {statCards.map((s, i) => (
                    <div key={i} style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 14,
                        padding: '20px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                        cursor: 'default',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <div style={{ width: 50, height: 50, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <s.icon size={22} color={s.color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{loading ? '—' : s.value}</div>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginTop: 2 }}>{s.label}</div>
                            <div style={{ fontSize: 11, color: s.color, marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                                <TrendingUp size={10} /> {s.trend}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

                {/* Production Volume */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Production Volume</h3>
                            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Units produced by product</p>
                        </div>
                        <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#6366f1', fontWeight: 600 }}>
                            {batches.length} batches
                        </div>
                    </div>
                    {productionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={productionData} margin={{ top: 16, right: 8, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 6 }} />
                                <Bar dataKey="quantity" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={48} label={<CustomBarLabel />} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', gap: 8 }}>
                            <Layers size={36} strokeWidth={1} />
                            <span style={{ fontSize: 13 }}>No production data yet</span>
                        </div>
                    )}
                </div>

                {/* Order Status */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>Order Status</h3>
                            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Distribution by status</p>
                        </div>
                        <div style={{ background: 'rgba(16,185,129,0.08)', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#10b981', fontWeight: 600 }}>
                            {stats?.totalOrders || 0} total
                        </div>
                    </div>
                    {orderChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={orderChartData}
                                    cx="50%" cy="45%"
                                    innerRadius={60} outerRadius={95}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {orderChartData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value, entry) => (
                                        <span style={{ fontSize: 12, color: '#475569' }}>{value}: <strong>{entry.payload.value}</strong></span>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', gap: 8 }}>
                            <ShoppingCart size={36} strokeWidth={1} />
                            <span style={{ fontSize: 13 }}>No orders yet</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Alerts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

                {/* Low Stock Alerts */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AlertTriangle size={16} color="#ef4444" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Low Stock Alerts</h3>
                                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Materials below minimum threshold</p>
                            </div>
                        </div>
                        {alerts.length > 0 && (
                            <span style={{ background: '#fef2f2', color: '#ef4444', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, border: '1px solid #fecaca' }}>
                                {alerts.length} alert{alerts.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    {alerts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {alerts.slice(0, 5).map(a => (
                                <div key={a._id} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 14px', background: '#fef9f9', borderRadius: 10,
                                    border: '1px solid #fee2e2', borderLeft: '3px solid #ef4444'
                                }}>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{a.name}</span>
                                    <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
                                        {a.currentStock} {a.unit} <span style={{ color: '#94a3b8', fontWeight: 400 }}>/ min {a.minimumThreshold}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: '#10b981', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowUpRight size={18} color="#10b981" />
                            </div>
                            All materials above threshold
                        </div>
                    )}
                </div>

                {/* Expiring Soon */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(245,158,11,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={16} color="#f59e0b" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>Expiring in 30 Days</h3>
                                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Batches approaching expiry</p>
                            </div>
                        </div>
                        {expiring.length > 0 && (
                            <span style={{ background: '#fffbeb', color: '#f59e0b', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, border: '1px solid #fde68a' }}>
                                {expiring.length} batch{expiring.length > 1 ? 'es' : ''}
                            </span>
                        )}
                    </div>
                    {expiring.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {expiring.slice(0, 5).map(b => {
                                const daysLeft = Math.ceil((new Date(b.expDate) - new Date()) / (1000 * 60 * 60 * 24));
                                return (
                                    <div key={b._id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '10px 14px', background: '#fffdf5', borderRadius: 10,
                                        border: '1px solid #fde68a', borderLeft: '3px solid #f59e0b'
                                    }}>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{b.batchId}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.productId?.name}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 12, color: daysLeft <= 7 ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                                                {daysLeft}d left
                                            </div>
                                            <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                                {new Date(b.expDate).toLocaleDateString('en-IN')}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ padding: '24px 0', textAlign: 'center', color: '#10b981', fontSize: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(16,185,129,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowUpRight size={18} color="#10b981" />
                            </div>
                            No batches expiring soon
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
