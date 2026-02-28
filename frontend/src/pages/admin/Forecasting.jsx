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

    const tooltipStyle = {
        contentStyle: { background: 'var(--clay-surface)', border: '1px solid var(--border)', borderRadius: 8 },
        labelStyle: { color: 'var(--text-primary)' },
        itemStyle: { color: 'var(--text-secondary)' },
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Demand Forecasting</h1>
                    <p>Simple Moving Average predictions based on order history</p>
                </div>
            </div>

            <div className="grid-auto-fill-280 section-gap">
                {allPredictions.slice(0, 4).map(p => (
                    <div key={p.product._id} className="metric-card clickable" onClick={() => loadPrediction(p.product._id)}>
                        <FiTrendingUp size={20} className={p.trend === 'Active' ? 'text-success' : 'text-muted'} />
                        <h4 className="mt-2 mb-0">{p.product.name}</h4>
                        <p className="text-xs text-secondary-color">
                            Avg: {p.avgMonthlyDemand}/mo · Predicted: <strong>{p.predictedNextMonth}</strong>
                        </p>
                        <span className={`status-badge ${p.trend === 'Active' ? 'delivered' : 'pending'} mt-2`}>{p.trend}</span>
                    </div>
                ))}
            </div>

            <div className="card section-gap">
                <h3>Detailed Prediction</h3>
                <Select value={selectedProduct} onValueChange={loadPrediction}>
                    <SelectTrigger><SelectValue placeholder="Select a product to view detailed forecast..." /></SelectTrigger>
                    <SelectContent>
                        {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name} ({p.type})</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

            {prediction && (
                <div className="card">
                    <h3>{prediction.product?.name} — Actual vs Predicted (SMA-{prediction.window})</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Legend />
                            <Line type="monotone" dataKey="actual" stroke="var(--info)" strokeWidth={2} dot={{ r: 4 }} name="Actual Demand" />
                            <Line type="monotone" dataKey="predicted" stroke="var(--warning)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Predicted (SMA)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="card mt-5">
                <h3>All Products Forecast Summary</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Product</th><th>Type</th><th>Total Ordered</th><th>Avg/Month</th><th>Next Month Prediction</th><th>Trend</th></tr>
                    </thead>
                    <tbody>
                        {allPredictions.map(p => (
                            <tr key={p.product._id} className="clickable" onClick={() => loadPrediction(p.product._id)}>
                                <td className="td-bold">{p.product.name}</td>
                                <td>{p.product.type}</td>
                                <td>{p.totalOrdered}</td>
                                <td>{p.avgMonthlyDemand}</td>
                                <td className="td-bold text-info">{p.predictedNextMonth}</td>
                                <td><span className={`status-badge ${p.trend === 'Active' ? 'delivered' : 'pending'}`}>{p.trend}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
