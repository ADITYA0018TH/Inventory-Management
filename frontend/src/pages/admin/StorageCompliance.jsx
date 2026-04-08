import { useState, useEffect, useRef } from 'react';
import API from '../../api';
import toast from 'react-hot-toast';
import { Thermometer as FiThermometer, Droplet as FiDroplet, AlertTriangle as FiAlertTriangle, Upload as FiUpload } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
                toast.error(`Violation detected: ${res.data.violationDetails}`);
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

    // Bulk CSV import: expects CSV with columns batchId,temperature,humidity,recordedAt
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
            return {
                batchId: obj.batchId,
                temperature: parseFloat(obj.temperature),
                humidity: parseFloat(obj.humidity),
                recordedAt: obj.recordedAt || undefined
            };
        }).filter(r => r.batchId && !isNaN(r.temperature) && !isNaN(r.humidity));

        if (readings.length === 0) return toast.error('No valid rows found in CSV');
        try {
            const res = await API.post('/storage/bulk-import', { readings });
            toast.success(`Imported ${res.data.saved} readings (${res.data.violations} violations)`);
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Import failed');
        }
        fileRef.current.value = '';
    };

    const tooltipStyle = {
        contentStyle: { background: 'var(--clay-surface)', border: '1px solid var(--border)', borderRadius: 8 },
        labelStyle: { color: 'var(--text-primary)' },
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Storage Compliance</h1>
                    <p>Temperature and humidity monitoring</p>
                </div>
                <div className="header-actions">
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVImport} />
                    <button className="btn btn-secondary" onClick={() => fileRef.current.click()}>
                        <FiUpload /> Import CSV
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ Log Reading'}
                    </button>
                </div>
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

            {/* Temperature & Humidity Chart */}
            <div className="card section-gap">
                <h3>Temperature & Humidity Trend</h3>
                <p className="text-secondary-color mb-3">Select a batch to view its storage readings over time</p>
                <Select value={chartBatchId} onValueChange={loadChart}>
                    <SelectTrigger><SelectValue placeholder="Select batch to view chart..." /></SelectTrigger>
                    <SelectContent>
                        {batches.map(b => <SelectItem key={b._id} value={b._id}>{b.batchId} — {b.productId?.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280} className="mt-4">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Legend />
                            <Line type="monotone" dataKey="temperature" stroke="var(--danger)" strokeWidth={2} dot={{ r: 3 }} name="Temp (°C)" />
                            <Line type="monotone" dataKey="humidity" stroke="var(--info)" strokeWidth={2} dot={{ r: 3 }} name="Humidity (%)" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : chartBatchId ? (
                    <div className="empty-state mt-4">No readings logged for this batch yet</div>
                ) : null}
            </div>

            <div className="card">
                <h3>Violation History</h3>
                <p className="text-xs text-secondary-color mb-2">CSV import format: <code>batchId,temperature,humidity,recordedAt</code></p>
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
