import { useState, useEffect } from 'react';
import API from '../../api';
import { Shield as FiShield, CheckCircle as FiCheckCircle, AlertTriangle as FiAlertTriangle, AlertCircle as FiAlertCircle, Save as FiSave } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function Compliance() {
    const [score, setScore] = useState(null);
    const [audit, setAudit] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [scoreRes, auditRes, historyRes] = await Promise.all([
                API.get('/compliance/score'),
                API.get('/compliance/audit-readiness'),
                API.get('/compliance/history')
            ]);
            setScore(scoreRes.data);
            setAudit(auditRes.data);
            setHistory(historyRes.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const saveSnapshot = async () => {
        try {
            await API.post('/compliance/snapshot');
            toast.success('Compliance snapshot saved');
            loadData();
        } catch { toast.error('Failed to save snapshot'); }
    };

    const getScoreVariant = (val) => {
        const v = parseFloat(val);
        if (v >= 80) return 'green';
        if (v >= 60) return 'amber';
        return 'red';
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
                    <h1>Regulatory Compliance Dashboard</h1>
                    <p>Monitor compliance scores and audit readiness</p>
                </div>
                <button className="btn btn-secondary" onClick={saveSnapshot}>
                    <FiSave /> Save Snapshot
                </button>
            </div>

            {score && (
                <div className="card text-center section-gap">
                    <div className={`score-ring score-ring-${getScoreVariant(score.overall)}`}>
                        <span>{score.overall}%</span>
                    </div>
                    <h3 className="mb-0">Overall Compliance Score</h3>
                    <p className="text-sm text-secondary-color">Weighted average across all compliance metrics</p>
                </div>
            )}

            {score && (
                <div className="grid-auto-fill-280 section-gap">
                    {Object.entries(score.metrics).map(([key, metric]) => (
                        <div key={key} className="metric-card">
                            <div className={`metric-value text-${getScoreVariant(metric.value)}`}>
                                {metric.value}%
                            </div>
                            <p className="metric-label">{metric.label}</p>
                            <p className="text-xs text-secondary-color">Weight: {metric.weight}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Compliance History Trend */}
            <div className="card section-gap">
                <h3>Compliance Score History</h3>
                <p className="text-xs text-secondary-color mb-3">
                    {history.length === 0
                        ? 'No snapshots yet — click "Save Snapshot" to start tracking history'
                        : `${history.length} snapshots recorded`}
                </p>
                {history.length > 0 && (
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={history.map(h => ({
                            date: new Date(h.date).toLocaleDateString(),
                            overall: h.overall,
                            storage: h.storageScore,
                            testing: h.testingRate,
                            fulfillment: h.fulfillmentRate
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Legend />
                            <Line type="monotone" dataKey="overall" stroke="var(--accent)" strokeWidth={2.5} dot={{ r: 3 }} name="Overall" />
                            <Line type="monotone" dataKey="storage" stroke="var(--info)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Storage" />
                            <Line type="monotone" dataKey="testing" stroke="var(--success)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="QC Testing" />
                            <Line type="monotone" dataKey="fulfillment" stroke="var(--warning)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Fulfillment" />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>

            {audit && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="flex-row"><FiShield /> Audit Readiness Checklist</h3>
                        <span className={`status-badge ${audit.readiness === 'Ready' ? 'delivered' : 'pending'}`}>
                            {audit.score} — {audit.readiness}
                        </span>
                    </div>
                    <div className="checklist">
                        {audit.checklist.map(item => (
                            <div key={item.id} className="checklist-item">
                                {item.status === 'pass' && <FiCheckCircle className="text-success" />}
                                {item.status === 'warning' && <FiAlertTriangle className="text-warning" />}
                                {item.status === 'fail' && <FiAlertCircle className="text-danger" />}
                                <div className="checklist-content">
                                    <div className="checklist-title">{item.item}</div>
                                    <div className="checklist-detail">{item.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
