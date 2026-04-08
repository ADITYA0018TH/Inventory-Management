import { useState, useEffect } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { AlertTriangle as FiAlertTriangle, CheckCircle as FiCheckCircle, Clock as FiClock, BarChart2 as FiBarChart2 } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function Recalls() {
    const [recalls, setRecalls] = useState([]);
    const [batches, setBatches] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ batchId: '', reason: '', severity: 'Class II', notes: '' });
    const [impact, setImpact] = useState(null);
    const [impactRecallId, setImpactRecallId] = useState(null);
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

    const loadImpact = async (id) => {
        if (impactRecallId === id) { setImpact(null); setImpactRecallId(null); return; }
        try {
            const res = await API.get(`/recalls/${id}/impact`);
            setImpact(res.data);
            setImpactRecallId(id);
        } catch { toast.error('Failed to load impact analysis'); }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Drug Recall Management</h1>
                    <p>Track and manage product recalls</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                    {showForm ? 'Cancel' : '+ Initiate Recall'}
                </button>
            </div>

            {showForm && (
                <div className="card form-card section-gap">
                    <h3>Initiate Product Recall</h3>
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
                        <div className="form-group">
                            <label>Severity</label>
                            <Select value={form.severity} onValueChange={(val) => setForm({ ...form, severity: val })}>
                                <SelectTrigger><SelectValue placeholder="Select Severity" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Class I">Class I — Most serious, health risk</SelectItem>
                                    <SelectItem value="Class II">Class II — May cause temporary health issues</SelectItem>
                                    <SelectItem value="Class III">Class III — Unlikely to cause health issues</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="form-group">
                            <label>Reason</label>
                            <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} required rows={3} placeholder="Describe the reason for recall..." />
                        </div>
                        <div className="form-group">
                            <label>Notes (optional)</label>
                            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes..." />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-danger">Initiate Recall</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Recall ID</th><th>Batch</th><th>Product</th><th>Severity</th>
                            <th>Status</th><th>Affected</th><th>Date</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recalls.length === 0 ? (
                            <tr><td colSpan={8} className="empty-table">No recalls initiated</td></tr>
                        ) : recalls.map(r => (
                            <tr key={r._id}>
                                <td className="td-bold">{r.recallId}</td>
                                <td>{r.batchId?.batchId}</td>
                                <td>{r.productId?.name}</td>
                                <td>
                                    <span className={`badge ${r.severity === 'Class I' ? 'badge-danger' : r.severity === 'Class II' ? 'badge-amber' : 'badge-blue'}`}>
                                        {r.severity}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${r.status === 'Initiated' ? 'pending' : r.status === 'In Progress' ? 'approved' : 'delivered'}`}>
                                        {r.status === 'Initiated' && <FiAlertTriangle />}
                                        {r.status === 'In Progress' && <FiClock />}
                                        {r.status === 'Completed' && <FiCheckCircle />}
                                        {r.status}
                                    </span>
                                </td>
                                <td>{r.affectedDistributors?.length || 0} distributors</td>
                                <td className="text-muted">{new Date(r.initiatedAt).toLocaleDateString()}</td>
                                <td>
                                    {r.status === 'Initiated' && (
                                        <button className="btn btn-sm btn-secondary" onClick={() => updateStatus(r._id, 'In Progress')}>Start</button>
                                    )}
                                    {r.status === 'In Progress' && (
                                        <button className="btn btn-sm btn-primary" onClick={() => updateStatus(r._id, 'Completed')}>Complete</button>
                                    )}
                                    <button className="btn btn-sm btn-ghost ml-1" onClick={() => loadImpact(r._id)} title="Impact Analysis">
                                        <FiBarChart2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {impact && (
                <div className="card mt-4">
                    <h3><FiBarChart2 className="inline mr-2" />Recall Impact Analysis — {impact.recallId}</h3>
                    <div className="grid-auto-fill-280 mt-4">
                        <div className="metric-card">
                            <div className="metric-value">{impact.totalProduced}</div>
                            <p className="metric-label">Total Units Produced</p>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value text-red">{impact.totalUnitsAffected}</div>
                            <p className="metric-label">Units Affected</p>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value text-amber">{impact.percentageAffected}%</div>
                            <p className="metric-label">% of Batch Distributed</p>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value text-danger">₹{impact.estimatedFinancialImpact?.toLocaleString()}</div>
                            <p className="metric-label">Estimated Financial Impact</p>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value">{impact.affectedDistributorsCount}</div>
                            <p className="metric-label">Distributors Affected</p>
                        </div>
                    </div>
                    {impact.affectedDistributors?.length > 0 && (
                        <table className="data-table mt-4">
                            <thead>
                                <tr><th>Distributor</th><th>Company</th><th>Email</th></tr>
                            </thead>
                            <tbody>
                                {impact.affectedDistributors.map(d => (
                                    <tr key={d._id}>
                                        <td>{d.name}</td>
                                        <td>{d.companyName || '—'}</td>
                                        <td>{d.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
