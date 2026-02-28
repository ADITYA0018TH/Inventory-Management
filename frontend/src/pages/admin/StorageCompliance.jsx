import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { Thermometer as FiThermometer, Droplet as FiDroplet, AlertTriangle as FiAlertTriangle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function StorageCompliance() {
    const [stats, setStats] = useState({ totalLogs: 0, totalViolations: 0, complianceRate: 100, recentViolations: [] });
    const [violations, setViolations] = useState([]);
    const [batches, setBatches] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ batchId: '', temperature: '', humidity: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [statsRes, violationsRes, batchesRes] = await Promise.all([
                API.get('/storage/stats'),
                API.get('/storage/violations'),
                API.get('/batches')
            ]);
            setStats(statsRes.data);
            setViolations(violationsRes.data);
            setBatches(batchesRes.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/storage/log', {
                batchId: form.batchId,
                temperature: parseFloat(form.temperature),
                humidity: parseFloat(form.humidity)
            });
            if (res.data.isViolation) {
                toast.error(`Violation detected: ${res.data.violationDetails}`);
            } else {
                toast.success('Reading logged — within compliance range');
            }
            setShowForm(false);
            setForm({ batchId: '', temperature: '', humidity: '' });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to log reading');
        }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Storage Compliance</h1>
                    <p>Temperature and humidity monitoring</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Log Reading'}
                </button>
            </div>

            <div className="grid-auto-fill-280 section-gap">
                <div className="metric-card">
                    <FiThermometer size={24} className="text-info" />
                    <div className="metric-value">{stats.totalLogs}</div>
                    <p className="metric-label">Total Readings</p>
                </div>
                <div className="metric-card">
                    <FiAlertTriangle size={24} className="text-danger" />
                    <div className="metric-value text-red">{stats.totalViolations}</div>
                    <p className="metric-label">Violations</p>
                </div>
                <div className="metric-card">
                    <FiDroplet size={24} className="text-success" />
                    <div className="metric-value text-green">{stats.complianceRate}%</div>
                    <p className="metric-label">Compliance Rate</p>
                </div>
            </div>

            {showForm && (
                <div className="card form-card section-gap">
                    <h3>Log Storage Reading</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Batch</label>
                            <Select value={form.batchId} onValueChange={(val) => setForm({ ...form, batchId: val })}>
                                <SelectTrigger><SelectValue placeholder="Select batch..." /></SelectTrigger>
                                <SelectContent>
                                    {batches.map(b => <SelectItem key={b._id} value={b._id}>{b.batchId} — {b.productId?.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Temperature (°C)</label>
                                <input type="number" step="0.1" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} required placeholder="e.g. 22.5" />
                            </div>
                            <div className="form-group">
                                <label>Humidity (%)</label>
                                <input type="number" step="0.1" value={form.humidity} onChange={e => setForm({ ...form, humidity: e.target.value })} required placeholder="e.g. 45" />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Log Reading</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <h3>Violation History</h3>
                <table className="data-table">
                    <thead>
                        <tr><th>Date</th><th>Batch</th><th>Product</th><th>Temp</th><th>Humidity</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                        {violations.length === 0 ? (
                            <tr><td colSpan={6} className="empty-table">No violations recorded</td></tr>
                        ) : violations.map(v => (
                            <tr key={v._id}>
                                <td className="text-muted">{new Date(v.recordedAt).toLocaleString()}</td>
                                <td className="td-bold">{v.batchId?.batchId}</td>
                                <td>{v.batchId?.productId?.name}</td>
                                <td className="text-danger font-semibold">{v.temperature}°C</td>
                                <td className="text-danger font-semibold">{v.humidity}%</td>
                                <td className="text-xs">{v.violationDetails}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
