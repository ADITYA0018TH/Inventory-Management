import { useState, useEffect } from 'react';
import API from '../../api';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FiDownload } from 'react-icons/fi';
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

    return (
        <div className="page">
            <div className="page-header">
                <h1>Reports & Analytics</h1>
                <p>Data-driven insights for decision making</p>
                <button className="btn btn-secondary" onClick={() => downloadReport('orders')}><FiDownload /> Export All Data</button>
            </div>

            <div className="dashboard-grid">
                {/* Sales Trend */}
                <div className="card chart-card" style={{ gridColumn: 'span 2' }}>
                    <div className="card-header">
                        <h3>Monthly Revenue Trend</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #333' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Production Volume */}
                <div className="card chart-card">
                    <div className="card-header">
                        <h3>Production Output</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #333' }} />
                            <Bar dataKey="totalUnits" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Stock Consumption */}
                <div className="card chart-card" style={{ gridColumn: 'span 3' }}>
                    <div className="card-header">
                        <h3>Raw Material Stock vs Usage</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #333' }} />
                            <Legend />
                            <Bar dataKey="currentStock" name="Current Stock" fill="#22d3ee" stackId="a" />
                            <Bar dataKey="usage" name="Est. Usage" fill="#f59e0b" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
