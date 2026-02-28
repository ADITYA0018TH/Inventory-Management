import { useState, useEffect } from 'react';
import API from '../../api';
import { AlertTriangle as FiAlertTriangle, Clock as FiClock, AlertCircle as FiAlertCircle, CheckCircle as FiCheckCircle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function ExpiryIntelligence() {
    const [heatmap, setHeatmap] = useState({ expired: [], critical: [], warning: [], caution: [] });
    const [fefoProduct, setFefoProduct] = useState('');
    const [fefoList, setFefoList] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

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

    const colorMap = { red: 'var(--danger)', amber: 'var(--warning)', blue: 'var(--info)', green: 'var(--success)' };

    const HeatmapSection = ({ title, icon, variant, batches, badgeClass }) => (
        <div className={`card card-bordered-left card-border-${variant}`}>
            <div className="card-header">
                <h3 className="flex-row">{icon} {title}</h3>
                <span className={`status-badge ${badgeClass}`}>{batches.length} batches</span>
            </div>
            {batches.length === 0 ? (
                <p className="text-secondary-color">No batches in this window</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr><th>Batch ID</th><th>Product</th><th>Qty</th><th>Expires</th><th>Days Left</th></tr>
                    </thead>
                    <tbody>
                        {batches.map(b => {
                            const daysLeft = Math.ceil((new Date(b.expDate) - new Date()) / 86400000);
                            return (
                                <tr key={b._id}>
                                    <td className="td-bold">{b.batchId}</td>
                                    <td>{b.productId?.name}</td>
                                    <td>{b.quantityProduced}</td>
                                    <td>{new Date(b.expDate).toLocaleDateString()}</td>
                                    <td><span className={`text-${variant} font-semibold`}>{daysLeft < 0 ? 'EXPIRED' : `${daysLeft} days`}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Expiry Intelligence & FEFO</h1>
                    <p>First-Expired, First-Out management and expiry heatmap</p>
                </div>
            </div>

            <div className="stack-gap section-gap">
                <HeatmapSection title="Expired" icon={<FiAlertCircle />} variant="red" batches={heatmap.expired} badgeClass="cancelled" />
                <HeatmapSection title="Critical (≤30 days)" icon={<FiAlertTriangle />} variant="amber" batches={heatmap.critical} badgeClass="pending" />
                <HeatmapSection title="Warning (31-60 days)" icon={<FiClock />} variant="blue" batches={heatmap.warning} badgeClass="approved" />
                <HeatmapSection title="Caution (61-90 days)" icon={<FiCheckCircle />} variant="green" batches={heatmap.caution} badgeClass="delivered" />
            </div>

            <div className="card mt-6">
                <h3>FEFO Shipping Recommendations</h3>
                <p className="text-secondary-color mb-3">Select a product to see which batches should be shipped first</p>
                <Select value={fefoProduct} onValueChange={loadFEFO}>
                    <SelectTrigger><SelectValue placeholder="Select Product..." /></SelectTrigger>
                    <SelectContent>
                        {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>

                {fefoList.length > 0 && (
                    <table className="data-table mt-4">
                        <thead>
                            <tr><th>Priority</th><th>Batch ID</th><th>Qty Available</th><th>Expires</th><th>Recommendation</th></tr>
                        </thead>
                        <tbody>
                            {fefoList.map((b, i) => (
                                <tr key={b._id}>
                                    <td className="td-bold">#{i + 1}</td>
                                    <td>{b.batchId}</td>
                                    <td>{b.quantityProduced}</td>
                                    <td>{new Date(b.expDate).toLocaleDateString()}</td>
                                    <td><span className="status-badge approved">Ship First</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
