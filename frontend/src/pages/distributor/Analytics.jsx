import { useState, useEffect } from 'react';
import API from '../../api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { ShoppingCart, DollarSign, Package, TrendingUp } from 'lucide-react';

const COLORS = ['#7c9dff', '#22d3ee', '#fbbf24', '#2dd4bf', '#f87171'];

export default function DistributorAnalytics() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/orders').then(res => { setOrders(res.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    // Monthly spend trend
    const monthlySpend = orders.reduce((acc, o) => {
        const month = new Date(o.orderDate).toLocaleString('default', { month: 'short', year: '2-digit' });
        const existing = acc.find(m => m.month === month);
        if (existing) { existing.spend += o.totalAmount || 0; existing.orders += 1; }
        else acc.push({ month, spend: o.totalAmount || 0, orders: 1 });
        return acc;
    }, []).slice(-12);

    // Status breakdown
    const statusBreakdown = orders.reduce((acc, o) => {
        const existing = acc.find(s => s.name === o.status);
        if (existing) existing.value++;
        else acc.push({ name: o.status, value: 1 });
        return acc;
    }, []);

    // Top products ordered
    const productMap = {};
    orders.forEach(o => {
        o.items?.forEach(item => {
            const name = item.productId?.name || 'Unknown';
            productMap[name] = (productMap[name] || 0) + item.quantity;
        });
    });
    const topProducts = Object.entries(productMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 6);

    const totalSpend = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
    const pendingCount = orders.filter(o => o.status === 'Pending').length;

    const tooltipStyle = {
        contentStyle: { background: 'var(--clay-surface)', border: '1px solid var(--border)', borderRadius: 8 },
        labelStyle: { color: 'var(--text-primary)' },
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>My Analytics</h1>
                    <p>Order history and spend insights</p>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card stat-purple">
                    <div className="stat-icon"><ShoppingCart /></div>
                    <div className="stat-info">
                        <span className="stat-value">{orders.length}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                </div>
                <div className="stat-card stat-green">
                    <div className="stat-icon"><DollarSign /></div>
                    <div className="stat-info">
                        <span className="stat-value">₹{totalSpend.toLocaleString()}</span>
                        <span className="stat-label">Total Spend</span>
                    </div>
                </div>
                <div className="stat-card stat-blue">
                    <div className="stat-icon"><Package /></div>
                    <div className="stat-info">
                        <span className="stat-value">{deliveredCount}</span>
                        <span className="stat-label">Delivered</span>
                    </div>
                </div>
                <div className="stat-card stat-amber">
                    <div className="stat-icon"><TrendingUp /></div>
                    <div className="stat-info">
                        <span className="stat-value">{pendingCount}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="card chart-card" style={{ gridColumn: 'span 2' }}>
                    <h3>Monthly Spend Trend</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={monthlySpend}>
                            <defs>
                                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Area type="monotone" dataKey="spend" stroke="var(--accent)" fill="url(#spendGrad)" name="Spend (₹)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card chart-card">
                    <h3>Order Status Breakdown</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`} stroke="none">
                                {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip {...tooltipStyle} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card chart-card" style={{ gridColumn: 'span 3' }}>
                    <h3>Top Products Ordered</h3>
                    {topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip {...tooltipStyle} />
                                <Bar dataKey="qty" fill="var(--info)" radius={[6, 6, 0, 0]} name="Units Ordered" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">No order data yet</div>
                    )}
                </div>
            </div>
        </div>
    );
}
