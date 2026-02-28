import { useState, useEffect } from 'react';
import API from '../../api';
import { Shield as FiShield, CheckCircle as FiCheckCircle, AlertTriangle as FiAlertTriangle, AlertCircle as FiAlertCircle } from 'lucide-react';

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

    const getScoreVariant = (val) => {
        const v = parseFloat(val);
        if (v >= 80) return 'green';
        if (v >= 60) return 'amber';
        return 'red';
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Regulatory Compliance Dashboard</h1>
                    <p>Monitor compliance scores and audit readiness</p>
                </div>
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
