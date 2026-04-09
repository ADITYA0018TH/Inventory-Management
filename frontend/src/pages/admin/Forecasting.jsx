import { useState, useEffect } from 'react';
import API from '../../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, BarChart3, Package } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const TYPE_COLOR = { Tablet: '#6366f1', Syrup: '#06b6d4', Injection: '#f59e0b' };

function TrendBadge({ trend }) {
    const cfg = {
        Active:   { color: '#10b981', bg: '#d1fae5', icon: <TrendingUp size={11} /> },
        Low:      { color: '#94a3b8', bg: '#f1f5f9', icon: <Minus size={11} /> },
        Declining:{ color: '#ef4444', bg: '#fee2e2', icon: <TrendingDown size={11} /> },
    }[trend] || { color: '#94a3b8', bg: '#f1f5f9', icon: <Minus size={11} /> };

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999
        }}>
            {cfg.icon} {trend}
        </span>
    );
}

const tooltipStyle = {
    contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 },
    labelStyle: { color: '#0f172a', fontWeight: 600 },
};

export default function Forecasting() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [allPredictions, setAllPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [prodRes, allRes] = await Promise.all([
                API.get('/products'),
                API.get('/forecasting/all')
            ]);
            setProducts(prodRes.data);
            setAllPredictions(allRes.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const loadPrediction = async (productId) => {
        setSelectedProduct(productId);
        if (!productId) return setPrediction(null);
        setChartLoading(true);
        try {
            const res = await API.get(`/forecasting/predict/${productId}`);
            setPrediction(res.data);
        } catch { setPrediction(null); }
        setChartLoading(false);
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    const chartData = prediction ? [...prediction.historical, ...prediction.forecast] : [];
    // Mark where forecast starts
    const forecastStartIdx = prediction?.historical?.length || 0;
    const forecastStartMonth = chartData[forecastStartIdx]?.month;

    const activeCount = allPredictions.filter(p => p.trend === 'Active').length;
    const totalOrdered = allPredictions.reduce((s, p) => s + p.totalOrdered, 0);
    const avgDemand = allPredictions.length
        ? Math.round(allPredictions.reduce((s, p) => s + p.avgMonthlyDemand, 0) / allPredictions.length)
        : 0;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Demand Forecasting</h1>
                    <p>SMA and EWMA predictions based on 12-month order history</p>
                </div>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                {[
                    { label: 'Active Products', value: activeCount, sub: `of ${allPredictions.length} total`, color: '#10b981', icon: <TrendingUp size={20} /> },
                    { label: 'Total Units Ordered', value: totalOrdered.toLocaleString(), sub: 'across all products', color: '#6366f1', icon: <BarChart3 size={20} /> },
                    { label: 'Avg Monthly Demand', value: avgDemand, sub: 'units per product', color: '#f59e0b', icon: <Package size={20} /> },
                ].map(s => (
                    <div key={s.label} style={{
                        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
                        padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16
                    }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 12,
                            background: s.color + '15', color: s.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 3 }}>{s.label}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{s.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Product selector + chart */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h3 style={{ marginBottom: 2 }}>Detailed Forecast</h3>
                        <p style={{ fontSize: 12, color: '#94a3b8' }}>
                            {prediction
                                ? `${prediction.product?.name} · SMA-${prediction.window} · EWMA α=${prediction.alpha}`
                                : 'Select a product to view its forecast chart'}
                        </p>
                    </div>
                    <div style={{ minWidth: 280 }}>
                        <Select value={selectedProduct} onValueChange={loadPrediction}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select product..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p._id} value={p._id}>
                                        {p.name} ({p.type})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {chartLoading && (
                    <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="spinner" />
                    </div>
                )}

                {!chartLoading && prediction && (
                    <>
                        {/* Legend pills */}
                        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                            {[
                                { color: '#3b82f6', label: 'Actual Demand', dash: false },
                                { color: '#f59e0b', label: 'SMA Forecast', dash: true },
                                { color: '#10b981', label: 'EWMA Forecast', dash: true },
                            ].map(l => (
                                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                                    <svg width="24" height="10">
                                        <line x1="0" y1="5" x2="24" y2="5" stroke={l.color} strokeWidth="2"
                                            strokeDasharray={l.dash ? '5 3' : 'none'} />
                                    </svg>
                                    {l.label}
                                </div>
                            ))}
                            <div style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: 10, height: 10, background: 'rgba(99,102,241,0.08)', border: '1px dashed #c7d2fe', borderRadius: 2 }} />
                                Forecast zone
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip {...tooltipStyle} />
                                {forecastStartMonth && (
                                    <ReferenceLine x={forecastStartMonth} stroke="#c7d2fe" strokeDasharray="4 3"
                                        label={{ value: 'Forecast →', position: 'insideTopRight', fontSize: 10, fill: '#6366f1' }} />
                                )}
                                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} name="Actual" connectNulls={false} />
                                <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} name="SMA" connectNulls={false} />
                                <Line type="monotone" dataKey="ewma" stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 2 }} name="EWMA" connectNulls={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}

                {!chartLoading && !prediction && (
                    <div style={{
                        height: 200, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        background: '#f8fafc', borderRadius: 10, border: '2px dashed #e2e8f0', gap: 8
                    }}>
                        <BarChart3 size={32} color="#c7d2fe" />
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>Select a product above to view its forecast</div>
                    </div>
                )}
            </div>

            {/* All products table */}
            <div className="card">
                <h3 style={{ marginBottom: 16 }}>All Products Forecast Summary</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Type</th>
                            <th>Total Ordered</th>
                            <th>Avg / Month</th>
                            <th>Next Month</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allPredictions.map(p => (
                            <tr key={p.product._id} className="clickable" onClick={() => loadPrediction(p.product._id)}
                                style={{ cursor: 'pointer' }}>
                                <td>
                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.product.name}</div>
                                </td>
                                <td>
                                    <span style={{
                                        fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                                        background: (TYPE_COLOR[p.product.type] || '#6366f1') + '15',
                                        color: TYPE_COLOR[p.product.type] || '#6366f1'
                                    }}>{p.product.type}</span>
                                </td>
                                <td style={{ color: '#475569' }}>{p.totalOrdered}</td>
                                <td style={{ color: '#475569' }}>{p.avgMonthlyDemand}</td>
                                <td>
                                    <span style={{ fontWeight: 700, color: '#6366f1', fontSize: 15 }}>
                                        {p.predictedNextMonth}
                                    </span>
                                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>units</span>
                                </td>
                                <td><TrendBadge trend={p.trend} /></td>
                            </tr>
                        ))}
                        {allPredictions.length === 0 && (
                            <tr><td colSpan={6} className="empty-table">No forecast data available yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
