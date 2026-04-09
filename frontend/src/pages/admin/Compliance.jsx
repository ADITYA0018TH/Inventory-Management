import { useState, useEffect } from 'react';
import API from '../../api';
import {
    Shield as FiShield, CheckCircle as FiCheckCircle, AlertTriangle as FiAlertTriangle,
    AlertCircle as FiAlertCircle, Save, TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const METRIC_CONFIG = {
    testingRate:    { label: 'Batch Testing Rate',   weight: '25%', icon: '🧪', color: '#6366f1' },
    expiryScore:    { label: 'Expiry Management',    weight: '20%', icon: '📅', color: '#f59e0b' },
    storageScore:   { label: 'Storage Compliance',   weight: '25%', icon: '🌡️', color: '#06b6d4' },
    recallScore:    { label: 'Recall Response',      weight: '15%', icon: '⚠️', color: '#ef4444' },
    fulfillmentRate:{ label: 'Order Fulfillment',    weight: '15%', icon: '📦', color: '#10b981' },
};

function ScoreRing({ value }) {
    const v = parseFloat(value) || 0;
    const color = v >= 80 ? '#10b981' : v >= 60 ? '#f59e0b' : '#ef4444';
    const label = v >= 80 ? 'Excellent' : v >= 60 ? 'Needs Attention' : 'Critical';
    const r = 54, circ = 2 * Math.PI * r;
    const dash = (v / 100) * circ;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
                <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
                        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                        style={{ transition: 'stroke-dasharray 1s ease' }} />
                </svg>
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{v}%</span>
                </div>
            </div>
            <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'white', background: color, padding: '3px 10px', borderRadius: 999
            }}>{label}</span>
        </div>
    );
}

function MetricCard({ metricKey, metric, config }) {
    const v = parseFloat(metric.value);
    const color = config.color;
    const barW = Math.min(v, 100);

    return (
        <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14,
            padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                        {config.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{metric.value}%</div>
                </div>
                <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: color + '18', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 18
                }}>{config.icon}</div>
            </div>
            <div>
                <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${barW}%`, background: color,
                        borderRadius: 999, transition: 'width 1s ease'
                    }} />
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>Weight: {config.weight}</div>
            </div>
        </div>
    );
}

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

    const tooltipStyle = {
        contentStyle: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' },
        labelStyle: { color: '#0f172a', fontWeight: 600 },
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    const passCount = audit?.checklist?.filter(c => c.status === 'pass').length || 0;
    const total = audit?.checklist?.length || 10;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Regulatory Compliance</h1>
                    <p>GMP audit readiness and compliance score tracking</p>
                </div>
                <button className="btn btn-ghost" onClick={saveSnapshot}>
                    <Save size={15} /> Save Snapshot
                </button>
            </div>

            {/* Top section: score ring + summary */}
            {score && (
                <div style={{
                    display: 'grid', gridTemplateColumns: '280px 1fr',
                    gap: 20, marginBottom: 20
                }}>
                    {/* Score ring card */}
                    <div style={{
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        borderRadius: 16, padding: '32px 24px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 16, color: 'white'
                    }}>
                        <ScoreRing value={score.overall} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Overall Compliance Score</div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>
                                Weighted across 5 GMP dimensions
                            </div>
                        </div>
                        {audit && (
                            <div style={{
                                background: 'rgba(255,255,255,0.15)', borderRadius: 10,
                                padding: '10px 20px', textAlign: 'center', width: '100%'
                            }}>
                                <div style={{ fontSize: 22, fontWeight: 800 }}>{passCount}/{total}</div>
                                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                                    Audit Checklist Items Passed
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metrics grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                        {Object.entries(score.metrics).map(([key, metric]) => (
                            <MetricCard key={key} metricKey={key} metric={metric} config={METRIC_CONFIG[key]} />
                        ))}
                    </div>
                </div>
            )}

            {/* History chart */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <h3 style={{ marginBottom: 2 }}>Compliance Score History</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            {history.length === 0
                                ? 'No snapshots yet — click "Save Snapshot" to start tracking'
                                : `${history.length} snapshots recorded`}
                        </p>
                    </div>
                    {history.length > 1 && (() => {
                        const diff = (history[history.length - 1]?.overall - history[0]?.overall).toFixed(1);
                        const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
                        const color = diff > 0 ? '#10b981' : diff < 0 ? '#ef4444' : '#94a3b8';
                        return (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color }}>
                                <Icon size={16} /> {diff > 0 ? '+' : ''}{diff}% trend
                            </div>
                        );
                    })()}
                </div>
                {history.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={history.map(h => ({
                            date: new Date(h.date).toLocaleDateString(),
                            Overall: h.overall,
                            Storage: h.storageScore,
                            Testing: h.testingRate,
                            Fulfillment: h.fulfillmentRate,
                        }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip {...tooltipStyle} />
                            <Legend />
                            <Line type="monotone" dataKey="Overall" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="Storage" stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                            <Line type="monotone" dataKey="Testing" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                            <Line type="monotone" dataKey="Fulfillment" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{
                        height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#f8fafc', borderRadius: 10, border: '2px dashed #e2e8f0'
                    }}>
                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                            <TrendingUp size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                            <div style={{ fontSize: 13 }}>Save your first snapshot to start tracking history</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Audit checklist */}
            {audit && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <h3 style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FiShield size={18} color="#6366f1" /> Audit Readiness Checklist
                            </h3>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>GMP regulatory requirements verification</p>
                        </div>
                        <div style={{
                            background: audit.readiness === 'Ready' ? '#d1fae5' : '#fef3c7',
                            color: audit.readiness === 'Ready' ? '#059669' : '#d97706',
                            border: `1px solid ${audit.readiness === 'Ready' ? '#a7f3d0' : '#fde68a'}`,
                            padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700
                        }}>
                            {audit.score} — {audit.readiness}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {audit.checklist.map(item => (
                            <div key={item.id} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 12,
                                padding: '12px 14px', borderRadius: 10,
                                background: item.status === 'pass' ? '#f0fdf4' : item.status === 'warning' ? '#fffbeb' : '#fef2f2',
                                border: `1px solid ${item.status === 'pass' ? '#bbf7d0' : item.status === 'warning' ? '#fde68a' : '#fecaca'}`
                            }}>
                                <div style={{ flexShrink: 0, marginTop: 1 }}>
                                    {item.status === 'pass' && <FiCheckCircle size={16} color="#10b981" />}
                                    {item.status === 'warning' && <FiAlertTriangle size={16} color="#f59e0b" />}
                                    {item.status === 'fail' && <FiAlertCircle size={16} color="#ef4444" />}
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{item.item}</div>
                                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{item.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
