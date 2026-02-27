import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { FiAlertTriangle, FiCheckCircle, FiClock } from 'react-icons/fi';

export default function Recalls() {
    const [recalls, setRecalls] = useState([]);
    const [batches, setBatches] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ batchId: '', reason: '', severity: 'Class II', notes: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [recallsRes, batchesRes] = await Promise.all([
                API.get('/recalls'),
                API.get('/batches')
            ]);
            setRecalls(recallsRes.data);
            setBatches(batchesRes.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/recalls', form);
            toast.success('Recall initiated successfully');
            setShowForm(false);
            setForm({ batchId: '', reason: '', severity: 'Class II', notes: '' });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to initiate recall');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await API.put(`/recalls/${id}/status`, { status });
            toast.success(`Recall ${status.toLowerCase()}`);
            loadData();
        } catch { toast.error('Failed to update'); }
    };

    const severityColor = { 'Class I': '#ef4444', 'Class II': '#f59e0b', 'Class III': '#3b82f6' };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>🚨 Drug Recall Management</h2>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Initiate Recall'}
                </button>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3>Initiate Product Recall</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
                        <div>
                            <label className="form-label">Batch</label>
                            <select className="form-input" value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} required>
                                <option value="">Select batch...</option>
                                {batches.map(b => (
                                    <option key={b._id} value={b._id}>{b.batchId} — {b.productId?.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Severity</label>
                            <select className="form-input" value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}>
                                <option value="Class I">Class I — Most serious, health risk</option>
                                <option value="Class II">Class II — May cause temporary health issues</option>
                                <option value="Class III">Class III — Unlikely to cause health issues</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Reason</label>
                            <textarea className="form-input" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required rows={3} placeholder="Describe the reason for recall..." />
                        </div>
                        <div>
                            <label className="form-label">Notes (optional)</label>
                            <input className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
                        </div>
                        <button type="submit" className="btn btn-primary">⚠️ Initiate Recall</button>
                    </form>
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Recall ID</th><th>Batch</th><th>Product</th><th>Severity</th>
                            <th>Status</th><th>Affected</th><th>Date</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recalls.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}>✅ No recalls initiated</td></tr>
                        ) : recalls.map(r => (
                            <tr key={r._id}>
                                <td><strong>{r.recallId}</strong></td>
                                <td>{r.batchId?.batchId}</td>
                                <td>{r.productId?.name}</td>
                                <td>
                                    <span style={{ color: severityColor[r.severity], fontWeight: 600 }}>
                                        {r.severity}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge status-${r.status === 'Initiated' ? 'Pending' : r.status === 'In Progress' ? 'Approved' : 'Delivered'}`}>
                                        {r.status === 'Initiated' && <FiAlertTriangle style={{ marginRight: 4 }} />}
                                        {r.status === 'In Progress' && <FiClock style={{ marginRight: 4 }} />}
                                        {r.status === 'Completed' && <FiCheckCircle style={{ marginRight: 4 }} />}
                                        {r.status}
                                    </span>
                                </td>
                                <td>{r.affectedDistributors?.length || 0} distributors</td>
                                <td>{new Date(r.initiatedAt).toLocaleDateString()}</td>
                                <td>
                                    {r.status === 'Initiated' && (
                                        <button className="btn btn-sm" onClick={() => updateStatus(r._id, 'In Progress')}>Start</button>
                                    )}
                                    {r.status === 'In Progress' && (
                                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(r._id, 'Completed')}>Complete</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
