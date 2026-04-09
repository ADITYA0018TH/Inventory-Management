import { useState, useEffect, useRef } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { Thermometer, Droplet, AlertTriangle, Upload, Plus, X, CheckCircle } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function StorageCompliance() {
    const [stats, setStats] = useState({ totalLogs: 0, totalViolations: 0, complianceRate: 100 });
    const [violations, setViolations] = useState([]);
    const [batches, setBatches] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ batchId: '', temperature: '', humidity: '' });
    const [chartBatchId, setChartBatchId] = useState('');
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const fileRef = useRef();

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

    const loadChart = async (batchId) => {
        setChartBatchId(batchId);
        if (!batchId) return setChartData([]);
        try {
            const res = await API.get(`/storage/logs/${batchId}`);
            const data = res.data.slice(0, 30).reverse().map(l => ({
                time: new Date(l.recordedAt).toLocaleDateString(),
                temperature: l.temperature,
                humidity: l.humidity,
                violation: l.isViolation
            }));
            setChartData(data);
        } catch { setChartData([]); }
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
                toast.error(`Violation: ${res.data.violationDetails}`);
            } else {
                toast.success('Reading logged — within compliance range');
            }
            setShowForm(false);
            setForm({ batchId: '', temperature: '', humidity: '' });
            loadData();
            if (chartBatchId === form.batchId) loadChart(form.batchId);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to log reading');
        }
    };

    const handleCSVImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const text = await file.text();
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const readings = lines.slice(1).map(line => {
            const vals = line.split(',');
            const obj = {};
            headers.forEach((h, i) => obj[h] = vals[i]?.trim());
            return { batchId: obj.batchId, temperature: parseFloat(obj.temperature), humidity: parseFloat(obj.humidity), recordedAt: obj.recordedAt || undefined };
        }).filter(r => r.batchId && !isNaN(r.temperature) && !isNaN(r.humidity));
        if (readings.length === 0) return toast.error('No valid rows found in CSV');
        try {
            const res = await API.post('/storage/bulk-import', { readings });
            toast.success(`Imported ${res.data.saved} readings (${res.data.violations} violations)`);
            loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Import failed'); }
        fileRef.current.value = '';
    };

    const complianceRate = parseFloat(stats.complianceRate);
    const rateColor = complianceRate >= 90 ? '#10b981' : complianceRate >= 70 ? '#f59e0b' : '#ef4444';

    const tooltipStyle = {
        contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', fontSize: 12 },
        labelStyle: { color: '#0f172a', fontWeight: 600 },
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Storage Compliance</h1>
                    <p>Temperature and humidity monitoring for pharmaceutical batches</p>
                </div>
                <div className="header-actions">
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                    <button className="btn btn-ghost" onClick={() => fileRef.current.click()}>
                        <Upload size={15} /> Import CSV
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Log Reading</>}
                    </button>
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                {/* Total readings */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Thermometer size={22} />
                    </div>
                    <div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{stats.totalLogs}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 3 }}>Total Readings</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>All time</div>
                    </div>
                </div>

                {/* Violations */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: stats.totalViolations > 0 ? '#fee2e2' : '#d1fae5', color: stats.totalViolations > 0 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {stats.totalViolations > 0 ? <AlertTriangle size={22} /> : <CheckCircle size={22} />}
                    </div>
                    <div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: stats.totalViolations > 0 ? '#ef4444' : '#10b981', lineHeight: 1 }}>{stats.totalViolations}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 3 }}>Violations</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{stats.totalViolations === 0 ? 'All clear' : 'Needs attention'}</div>
                    </div>
                </div>

                {/* Compliance rate with mini ring */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                        <svg width="48" height="48" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="24" cy="24" r="18" fill="none" stroke="#f1f5f9" strokeWidth="5" />
                            <circle cx="24" cy="24" r="18" fill="none" stroke={rateColor} strokeWidth="5"
                                strokeDasharray={`${(complianceRate / 100) * 113} 113`} strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: rateColor }}>
                            {complianceRate}%
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: rateColor, lineHeight: 1 }}>{stats.complianceRate}%</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 3 }}>Compliance Rate</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                            {complianceRate >= 90 ? 'Excellent' : complianceRate >= 70 ? 'Needs improvement' : 'Critical'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Log reading form */}
            {showForm && (
                <div style={{ background: '#fff', border: '1px solid #6366f1', borderLeft: '4px solid #6366f1', borderRadius: 14, padding: '24px', marginBottom: 20 }}>
                    <h3 style={{ marginBottom: 16 }}>Log Storage Reading</h3>
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

            {/* Chart */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <h3 style={{ marginBottom: 2 }}>Temperature & Humidity Trend</h3>
                        <p style={{ fontSize: 12, color: '#94a3b8' }}>Select a batch to view its readings over time</p>
                    </div>
                    <div style={{ minWidth: 260 }}>
                        <Select value={chartBatchId} onValueChange={loadChart}>
                            <SelectTrigger><SelectValue placeholder="Select batch..." /></SelectTrigger>
                            <SelectContent>
                                {batches.map(b => <SelectItem key={b._id} value={b._id}>{b.batchId} — {b.productId?.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {chartData.length > 0 ? (
                    <>
                        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
                            {[['#ef4444', 'Temperature (°C)', false], ['#3b82f6', 'Humidity (%)', false]].map(([color, label]) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
                                    <div style={{ width: 20, height: 2, background: color, borderRadius: 1 }} />
                                    {label}
                                </div>
                            ))}
                            {chartData.some(d => d.violation) && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#ef4444' }}>
                                    <AlertTriangle size={12} /> Contains violations
                                </div>
                            )}
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip {...tooltipStyle} />
                                <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2} dot={(props) => {
                                    const { cx, cy, payload } = props;
                                    return payload.violation
                                        ? <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                                        : <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#ef4444" />;
                                }} name="Temp (°C)" />
                                <Line type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} name="Humidity (%)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                ) : chartBatchId ? (
                    <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 10, border: '2px dashed #e2e8f0', gap: 8 }}>
                        <Thermometer size={28} color="#c7d2fe" />
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>No readings logged for this batch yet</div>
                    </div>
                ) : (
                    <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: 10, border: '2px dashed #e2e8f0', gap: 8 }}>
                        <Thermometer size={28} color="#c7d2fe" />
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>Select a batch to view its storage trend</div>
                    </div>
                )}
            </div>

            {/* Violations table */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <h3 style={{ marginBottom: 2 }}>Violation History</h3>
                        <p style={{ fontSize: 11, color: '#94a3b8' }}>CSV format: <code style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>batchId,temperature,humidity,recordedAt</code></p>
                    </div>
                    {violations.length > 0 && (
                        <span style={{ background: '#fee2e2', color: '#ef4444', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>
                            {violations.length} violation{violations.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <table className="data-table">
                    <thead>
                        <tr><th>Date & Time</th><th>Batch</th><th>Product</th><th>Temp</th><th>Humidity</th><th>Details</th></tr>
                    </thead>
                    <tbody>
                        {violations.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <CheckCircle size={24} color="#10b981" style={{ margin: '0 auto 8px', display: 'block' }} />
                                    No violations recorded — all readings within range
                                </td>
                            </tr>
                        ) : violations.map(v => (
                            <tr key={v._id}>
                                <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(v.recordedAt).toLocaleString()}</td>
                                <td style={{ fontWeight: 600 }}>{v.batchId?.batchId}</td>
                                <td>{v.batchId?.productId?.name}</td>
                                <td>
                                    <span style={{ background: '#fee2e2', color: '#ef4444', fontWeight: 700, fontSize: 12, padding: '2px 8px', borderRadius: 6 }}>
                                        {v.temperature}°C
                                    </span>
                                </td>
                                <td>
                                    <span style={{ background: '#fee2e2', color: '#ef4444', fontWeight: 700, fontSize: 12, padding: '2px 8px', borderRadius: 6 }}>
                                        {v.humidity}%
                                    </span>
                                </td>
                                <td style={{ fontSize: 12, color: '#64748b', maxWidth: 240 }}>{v.violationDetails}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
