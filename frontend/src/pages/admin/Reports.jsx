import { useState, useEffect } from 'react';
import API from '../../api';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download as FiDownload } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
    const [salesData, setSalesData] = useState([]);
    const [productionData, setProductionData] = useState([]);
    const [stockData, setStockData] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

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
        } catch (err) {
            toast.error('Failed to load reports');
        }
    };

    const downloadReport = (type) => {
        // Implementation for downloading specific chart data as CSV
        window.open(`http://localhost:5001/api/export/${type}`, '_blank');
    };

    const tooltipStyle = {
        contentStyle: { background: 'var(--clay-surface)', border: '1px solid var(--border)', borderRadius: 8 },
        labelStyle: { color: 'var(--text-primary)' },
        itemStyle: { color: 'var(--text-secondary)' },
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Reports & Analytics</h1>
                    <p>Data-driven insights for decision making</p>
                </div>
                <button className="btn btn-secondary" onClick={() => downloadReport('orders')}><FiDownload /> Export All Data</button>
            </div>

            <div className="dashboard-grid">
                <div className="card chart-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header"><h3>Monthly Revenue Trend</h3></div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Area type="monotone" dataKey="revenue" stroke="var(--success)" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="card chart-card">
                    <div className="card-header"><h3>Production Output</h3></div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="totalUnits" fill="var(--accent)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card chart-card" style={{ gridColumn: 'span 3' }}>
                    <div className="card-header"><h3>Raw Material Stock vs Usage</h3></div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Legend />
                            <Bar dataKey="currentStock" name="Current Stock" fill="#22d3ee" stackId="a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="usage" name="Est. Usage" fill="var(--warning)" stackId="a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
