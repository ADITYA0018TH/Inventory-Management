import { useState, useEffect } from 'react';
import API, { getBaseURL } from '../../api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Line, Cell } from 'recharts';
import { Download as FiDownload, TrendingUp, DollarSign, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
    const [salesData, setSalesData] = useState([]);
    const [productionData, setProductionData] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [marginData, setMarginData] = useState([]);
    const [loadingMargins, setLoadingMargins] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [salesRes, prodRes, stockRes] = await Promise.all([
                API.get('/reports/sales-trend'),
                API.get('/reports/production'),
                API.get('/reports/stock-consumption')
            ]);
            setSalesData(salesRes.data);
            setProductionData(prodRes.data);
            setStockData(stockRes.data);
        } catch { toast.error('Failed to load reports'); }
        loadMarginData();
    };

    const loadMarginData = async () => {
        setLoadingMargins(true);
        try {
            // Fetch all batches, then get cost for each
            const batchesRes = await API.get('/batches');
            const batches = batchesRes.data.filter(b => b.status !== 'In Production');

            // Group by product, get cost for a sample batch per product
            const productMap = {};
            for (const b of batches) {
                const pName = b.productId?.name;
                if (!pName || productMap[pName]) continue;
                try {
                    const costRes = await API.get(`/batches/${b._id}/cost`);
                    const d = costRes.data;
                    if (d.sellingPrice > 0) {
                        productMap[pName] = {
                            product: pName,
                            sellingPrice: d.sellingPrice,
                            costPerUnit: parseFloat(d.costPerProducedUnit.toFixed(2)),
                            margin: parseFloat(d.profitMargin || 0),
                            totalCost: d.totalCost,
                        };
                    }
                } catch { /* no cost data */ }
            }
            setMarginData(Object.values(productMap));
        } catch { /* silent */ }
        setLoadingMargins(false);
    };

    const downloadReport = (type) => {
        const token = localStorage.getItem('token');
        window.open(`${getBaseURL()}/api/export/${type}?token=${token}`, '_blank');
    };

    const tooltipStyle = {
        contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 },
        labelStyle: { color: '#0f172a', fontWeight: 600 },
    };

    const getMarginColor = (margin) => {
        if (margin >= 50) return '#10b981';
        if (margin >= 25) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Data-driven insights for decision making</p>
                </div>
                <button className="btn btn-ghost" onClick={() => downloadReport('orders')}>
                    <FiDownload size={15} /> Export Data
                </button>
            </div>

            {/* Profit Margin Analysis */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h3 style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={18} color="#6366f1" /> Profit Margin Analysis
                        </h3>
                        <p style={{ fontSize: 12, color: '#94a3b8' }}>Cost per unit vs selling price per product — based on formula material costs</p>
                    </div>
                </div>

                {loadingMargins ? (
                    <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="spinner" />
                    </div>
                ) : marginData.length === 0 ? (
                    <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 10, border: '2px dashed #e2e8f0', gap: 8 }}>
                        <DollarSign size={28} color="#c7d2fe" />
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>No cost data yet — set material costs in Products to enable margin analysis</div>
                    </div>
                ) : (
                    <>
                        {/* Summary cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                            {marginData.map(d => {
                                const color = getMarginColor(d.margin);
                                return (
                                    <div key={d.product} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px' }}>
                                        <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.product}</div>
                                        <div style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{d.margin}%</div>
                                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                            Cost ₹{d.costPerUnit} · Sell ₹{d.sellingPrice}
                                        </div>
                                        <div style={{ height: 4, background: '#e2e8f0', borderRadius: 999, marginTop: 8, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.min(d.margin, 100)}%`, background: color, borderRadius: 999 }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grouped bar chart: cost vs selling price */}
                        <ResponsiveContainer width="100%" height={280}>
                            <ComposedChart data={marginData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="product" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} />
                                <Tooltip {...tooltipStyle} formatter={(val, name) => [`₹${val}`, name]} />
                                <Legend />
                                <Bar dataKey="costPerUnit" name="Cost / Unit" fill="#e2e8f0" radius={[4, 4, 0, 0]}>
                                    {marginData.map((_, i) => <Cell key={i} fill="#94a3b8" />)}
                                </Bar>
                                <Bar dataKey="sellingPrice" name="Selling Price" radius={[4, 4, 0, 0]}>
                                    {marginData.map((d, i) => <Cell key={i} fill={getMarginColor(d.margin)} />)}
                                </Bar>
                                <Line type="monotone" dataKey="margin" name="Margin %" yAxisId={1} stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'center' }}>
                            Green = margin ≥50% · Amber = 25–50% · Red = &lt;25%
                        </p>
                    </>
                )}
            </div>

            <div className="dashboard-grid">
                <div className="card chart-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header"><h3>Monthly Revenue Trend</h3></div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card chart-card">
                    <div className="card-header"><h3>Production Output</h3></div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={productionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="totalUnits" fill="#6366f1" radius={[6, 6, 0, 0]} name="Units Produced" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card chart-card" style={{ gridColumn: 'span 3' }}>
                    <div className="card-header"><h3>Raw Material Stock vs Estimated Usage</h3></div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={stockData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Legend />
                            <Bar dataKey="currentStock" name="Current Stock" fill="#06b6d4" stackId="a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="usage" name="Est. Usage" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
