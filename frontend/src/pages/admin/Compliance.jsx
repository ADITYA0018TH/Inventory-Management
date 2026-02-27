import { useState, useEffect } from 'react';
import API from '../../api';
import { FiShield, FiCheckCircle, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi';

export default function Compliance() {
    const [score, setScore] = useState(null);
    const [audit, setAudit] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [scoreRes, auditRes] = await Promise.all([
                API.get('/compliance/score'),
                API.get('/compliance/audit-readiness')
            ]);
            setScore(scoreRes.data);
            setAudit(auditRes.data);
        } catch { /* silent */ }
        setLoading(false);
    };

    const getScoreColor = (val) => {
        const v = parseFloat(val);
        if (v >= 80) return '#10b981';
        if (v >= 60) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h2>🛡️ Regulatory Compliance Dashboard</h2>
            </div>

            {/* Overall Score */}
            {score && (
                <div className="card" style={{ textAlign: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 120, borderRadius: '50%', border: `6px solid ${getScoreColor(score.overall)}`, margin: '0 auto 12px' }}>
                        <span style={{ fontSize: 32, fontWeight: 700, color: getScoreColor(score.overall) }}>{score.overall}%</span>
                    </div>
                    <h3 style={{ margin: 0 }}>Overall Compliance Score</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Weighted average across all compliance metrics</p>
                </div>
            )}

            {/* Individual Metrics */}
            {score && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                    {Object.entries(score.metrics).map(([key, metric]) => (
                        <div key={key} className="card" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: getScoreColor(metric.value) }}>
                                {metric.value}%
                            </div>
                            <p style={{ margin: '4px 0 0', fontWeight: 500 }}>{metric.label}</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 12, margin: 0 }}>Weight: {metric.weight}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Audit Readiness Checklist */}
            {audit && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}><FiShield style={{ marginRight: 8 }} />Audit Readiness Checklist</h3>
                        <span className={`status-badge status-${audit.readiness === 'Ready' ? 'Delivered' : 'Pending'}`}>
                            {audit.score} — {audit.readiness}
                        </span>
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {audit.checklist.map(item => (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                                {item.status === 'pass' && <FiCheckCircle style={{ color: '#10b981', flexShrink: 0 }} />}
                                {item.status === 'warning' && <FiAlertTriangle style={{ color: '#f59e0b', flexShrink: 0 }} />}
                                {item.status === 'fail' && <FiAlertCircle style={{ color: '#ef4444', flexShrink: 0 }} />}
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 500 }}>{item.item}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{item.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
