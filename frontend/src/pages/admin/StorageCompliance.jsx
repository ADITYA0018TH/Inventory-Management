import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { FiThermometer, FiDroplet, FiAlertTriangle } from 'react-icons/fi';

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
                toast.error(`⚠️ Violation detected: ${res.data.violationDetails}`);
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
        <div className="page-container">
            <div className="page-header">
                <h2>🌡️ Storage Compliance</h2>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Log Reading'}
                </button>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <FiThermometer size={24} style={{ color: '#3b82f6' }} />
                    <h3 style={{ margin: '8px 0 0' }}>{stats.totalLogs}</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Total Readings</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <FiAlertTriangle size={24} style={{ color: '#ef4444' }} />
                    <h3 style={{ margin: '8px 0 0' }}>{stats.totalViolations}</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Violations</p>
                </div>
                <div className="card" style={{ textAlign: 'center' }}>
                    <FiDroplet size={24} style={{ color: '#10b981' }} />
                    <h3 style={{ margin: '8px 0 0' }}>{stats.complianceRate}%</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Compliance Rate</p>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Log Storage Reading</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                        <div>
                            <label className="form-label">Batch</label>
                            <select className="form-input" value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} required>
                                <option value="">Select batch...</option>
                                {batches.map(b => <option key={b._id} value={b._id}>{b.batchId} — {b.productId?.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label className="form-label">Temperature (°C)</label>
                                <input type="number" step="0.1" className="form-input" value={form.temperature} onChange={e => setForm({ ...form, temperature: e.target.value })} required placeholder="e.g. 22.5" />
                            </div>
                            <div>
                                <label className="form-label">Humidity (%)</label>
                                <input type="number" step="0.1" className="form-input" value={form.humidity} onChange={e => setForm({ ...form, humidity: e.target.value })} required placeholder="e.g. 45" />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Log Reading</button>
                    </form>
                </div>
            )}

            <div className="card">
                <h3>⚠️ Violation History</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr><th>Date</th><th>Batch</th><th>Product</th><th>Temp</th><th>Humidity</th><th>Details</th></tr>
                        </thead>
                        <tbody>
                            {violations.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}>✅ No violations recorded</td></tr>
                            ) : violations.map(v => (
                                <tr key={v._id}>
                                    <td>{new Date(v.recordedAt).toLocaleString()}</td>
                                    <td><strong>{v.batchId?.batchId}</strong></td>
                                    <td>{v.batchId?.productId?.name}</td>
                                    <td style={{ color: '#ef4444', fontWeight: 600 }}>{v.temperature}°C</td>
                                    <td style={{ color: '#ef4444', fontWeight: 600 }}>{v.humidity}%</td>
                                    <td style={{ fontSize: 12 }}>{v.violationDetails}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
