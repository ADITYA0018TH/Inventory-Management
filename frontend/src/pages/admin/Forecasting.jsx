import { useState, useEffect } from 'react';
import API from '../../api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp as FiTrendingUp } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function Forecasting() {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [allPredictions, setAllPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

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
        try {
            const res = await API.get(`/forecasting/predict/${productId}`);
            setPrediction(res.data);
        } catch { setPrediction(null); }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    const chartData = prediction ? [...prediction.historical, ...prediction.forecast] : [];

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>📈 Demand Forecasting</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Simple Moving Average predictions based on order history</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                {allPredictions.slice(0, 4).map(p => (
                    <div key={p.product._id} className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => loadPrediction(p.product._id)}>
                        <FiTrendingUp size={20} style={{ color: p.trend === 'Active' ? '#10b981' : '#666' }} />
                        <h4 style={{ margin: '8px 0 4px' }}>{p.product.name}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0 }}>
                            Avg: {p.avgMonthlyDemand}/mo · Predicted: <strong>{p.predictedNextMonth}</strong>
                        </p>
                        <span className={`status-badge status-${p.trend === 'Active' ? 'Delivered' : 'Pending'}`} style={{ marginTop: 8 }}>{p.trend}</span>
                    </div>
                ))}
            </div>

            {/* Product Selector */}
            <div className="card" style={{ marginBottom: 20 }}>
                <h3>Detailed Prediction</h3>
                <Select value={selectedProduct} onValueChange={loadPrediction}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a product to view detailed forecast..." />
                    </SelectTrigger>
                    <SelectContent>
                        {products.map(p => (
                            <SelectItem key={p._id} value={p._id}>{p.name} ({p.type})</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Chart */}
            {prediction && (
                <div className="card">
                    <h3>📊 {prediction.product?.name} — Actual vs Predicted (SMA-{prediction.window})</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} />
                            <Tooltip contentStyle={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }} />
                            <Legend />
                            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Actual Demand" />
                            <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Predicted (SMA)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* All Products Table */}
            <div className="card" style={{ marginTop: 20 }}>
                <h3>All Products Forecast Summary</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Product</th><th>Type</th><th>Total Ordered</th><th>Avg/Month</th><th>Next Month Prediction</th><th>Trend</th></tr>
                        </thead>
                        <tbody>
                            {allPredictions.map(p => (
                                <tr key={p.product._id} style={{ cursor: 'pointer' }} onClick={() => loadPrediction(p.product._id)}>
                                    <td><strong>{p.product.name}</strong></td>
                                    <td>{p.product.type}</td>
                                    <td>{p.totalOrdered}</td>
                                    <td>{p.avgMonthlyDemand}</td>
                                    <td style={{ fontWeight: 600, color: '#3b82f6' }}>{p.predictedNextMonth}</td>
                                    <td><span className={`status-badge status-${p.trend === 'Active' ? 'Delivered' : 'Pending'}`}>{p.trend}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
