import { useState, useEffect } from 'react';
import API from '../../api';
import { FiAlertTriangle, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

export default function ExpiryIntelligence() {
    const [heatmap, setHeatmap] = useState({ expired: [], critical: [], warning: [], caution: [] });
    const [fefoProduct, setFefoProduct] = useState('');
    const [fefoList, setFefoList] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [heatRes, prodRes] = await Promise.all([
                API.get('/batches/expiry-heatmap'),
                API.get('/products')
            ]);
            setHeatmap(heatRes.data);
            setProducts(prodRes.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const loadFEFO = async (productId) => {
        setFefoProduct(productId);
        if (!productId) return setFefoList([]);
        try {
            const res = await API.get(`/batches/fefo-suggest/${productId}`);
            setFefoList(res.data);
        } catch { setFefoList([]); }
    };

    const HeatmapSection = ({ title, icon, color, batches, badge }) => (
        <div className={`card`} style={{ borderLeft: `4px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    {icon} {title}
                </h3>
                <span className={`status-badge status-${badge}`}>{batches.length} batches</span>
            </div>
            {batches.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No batches in this window</p>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Batch ID</th><th>Product</th><th>Qty</th><th>Expires</th><th>Days Left</th></tr>
                        </thead>
                        <tbody>
                            {batches.map(b => {
                                const daysLeft = Math.ceil((new Date(b.expDate) - new Date()) / 86400000);
                                return (
                                    <tr key={b._id}>
                                        <td><strong>{b.batchId}</strong></td>
                                        <td>{b.productId?.name}</td>
                                        <td>{b.quantityProduced}</td>
                                        <td>{new Date(b.expDate).toLocaleDateString()}</td>
                                        <td><span style={{ color, fontWeight: 600 }}>{daysLeft < 0 ? 'EXPIRED' : `${daysLeft} days`}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>🔥 Expiry Intelligence & FEFO</h2>
                <p style={{ color: 'var(--text-secondary)' }}>First-Expired, First-Out management and expiry heatmap</p>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
                <HeatmapSection title="Expired" icon={<FiAlertCircle />} color="#ef4444" batches={heatmap.expired} badge="Cancelled" />
                <HeatmapSection title="Critical (≤30 days)" icon={<FiAlertTriangle />} color="#f59e0b" batches={heatmap.critical} badge="Pending" />
                <HeatmapSection title="Warning (31-60 days)" icon={<FiClock />} color="#3b82f6" batches={heatmap.warning} badge="Approved" />
                <HeatmapSection title="Caution (61-90 days)" icon={<FiCheckCircle />} color="#10b981" batches={heatmap.caution} badge="Delivered" />
            </div>

            <div className="card" style={{ marginTop: 24 }}>
                <h3>📦 FEFO Shipping Recommendations</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Select a product to see which batches should be shipped first</p>
                <select className="form-input" value={fefoProduct} onChange={e => loadFEFO(e.target.value)}>
                    <option value="">Select Product...</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>

                {fefoList.length > 0 && (
                    <div className="table-container" style={{ marginTop: 16 }}>
                        <table>
                            <thead>
                                <tr><th>Priority</th><th>Batch ID</th><th>Qty Available</th><th>Expires</th><th>Recommendation</th></tr>
                            </thead>
                            <tbody>
                                {fefoList.map((b, i) => (
                                    <tr key={b._id}>
                                        <td><strong>#{i + 1}</strong></td>
                                        <td>{b.batchId}</td>
                                        <td>{b.quantityProduced}</td>
                                        <td>{new Date(b.expDate).toLocaleDateString()}</td>
                                        <td><span className="status-badge status-Approved">Ship First</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
