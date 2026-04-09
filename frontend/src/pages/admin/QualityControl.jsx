import { useState, useEffect } from 'react';
import API from '../../api';
import { ClipboardCheck, FlaskConical, CheckCircle, XCircle, Clock, Package, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

const STATUS_CONFIG = {
    'In Production': { color: '#3b82f6', bg: '#eff6ff', icon: <Clock size={12} /> },
    'Quality Check':  { color: '#f59e0b', bg: '#fffbeb', icon: <FlaskConical size={12} /> },
};

export default function QualityControl() {
    const [batches, setBatches] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [qcData, setQcData] = useState({ inspector: '', tests: [], notes: '' });
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await API.get('/batches');
            setBatches(res.data.filter(b => b.status === 'In Production' || b.status === 'Quality Check'));
        } catch { toast.error('Failed to load batches'); }
    };

    const openQC = async (batch) => {
        setSelectedBatch(batch);
        setLoadingTemplates(true);
        setModalOpen(true);
        try {
            const res = await API.get(`/quality/templates/${batch._id}`);
            setQcData({ inspector: '', tests: res.data.tests.map(t => ({ name: t.name, result: '', status: 'Pass', description: t.description || '' })), notes: '' });
        } catch {
            setQcData({ inspector: '', tests: [
                { name: 'Visual Inspection', result: '', status: 'Pass', description: 'Check for physical defects, color, shape' },
                { name: 'pH Level', result: '', status: 'Pass', description: 'Measure acidity/alkalinity' },
                { name: 'Dissolution', result: '', status: 'Pass', description: 'Rate of dissolution in standard medium' },
                { name: 'Assay', result: '', status: 'Pass', description: 'Active ingredient content verification' },
            ], notes: '' });
        }
        setLoadingTemplates(false);
    };

    const handleTestChange = (index, field, value) => {
        const newTests = [...qcData.tests];
        newTests[index][field] = value;
        setQcData({ ...qcData, tests: newTests });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!qcData.inspector.trim()) return toast.error('Inspector name is required');
        try {
            await API.post('/quality', { batchId: selectedBatch._id, ...qcData });
            const allPass = qcData.tests.every(t => t.status === 'Pass');
            toast.success(allPass ? 'QC Passed — Batch Released ✓' : 'QC Report Submitted (Failed)');
            setModalOpen(false);
            loadData();
        } catch { toast.error('Submission failed'); }
    };

    const inProduction = batches.filter(b => b.status === 'In Production').length;
    const inQC = batches.filter(b => b.status === 'Quality Check').length;

    const filtered = batches.filter(b =>
        !search || b.batchId.toLowerCase().includes(search.toLowerCase()) || b.productId?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Quality Control</h1>
                    <p>Inspect batches before release — tests loaded from product configuration</p>
                </div>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                {[
                    { label: 'Pending Inspection', value: batches.length, color: '#6366f1', bg: '#ede9fe', icon: <ClipboardCheck size={20} /> },
                    { label: 'In Production', value: inProduction, color: '#3b82f6', bg: '#eff6ff', icon: <Clock size={20} /> },
                    { label: 'Quality Check', value: inQC, color: '#f59e0b', bg: '#fffbeb', icon: <FlaskConical size={20} /> },
                ].map(s => (
                    <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 3 }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20, maxWidth: 320 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search batch ID or product..."
                    style={{ paddingLeft: 32, height: 36, width: '100%', boxSizing: 'border-box', fontSize: 13, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' }} />
            </div>

            {/* Batch cards */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                    <ClipboardCheck size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                    <div style={{ fontSize: 14 }}>{search ? 'No batches match your search' : 'No batches pending QC inspection'}</div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                    {filtered.map(b => {
                        const cfg = STATUS_CONFIG[b.status] || { color: '#94a3b8', bg: '#f1f5f9', icon: null };
                        const daysToExp = Math.ceil((new Date(b.expDate) - new Date()) / 86400000);
                        return (
                            <div key={b._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color + '50'; e.currentTarget.style.boxShadow = `0 4px 16px ${cfg.color}10`; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>

                                {/* Top accent bar */}
                                <div style={{ height: 4, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}80)` }} />

                                <div style={{ padding: '18px 20px' }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>{b.batchId}</div>
                                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{b.productId?.name}</div>
                                        </div>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            {cfg.icon} {b.status}
                                        </span>
                                    </div>

                                    {/* Details grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                                        {[
                                            ['Type', b.productId?.type],
                                            ['Quantity', `${b.quantityProduced?.toLocaleString()} units`],
                                            ['Mfg Date', new Date(b.mfgDate).toLocaleDateString()],
                                            ['Exp Date', new Date(b.expDate).toLocaleDateString()],
                                        ].map(([label, value]) => (
                                            <div key={label} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                                                <div style={{ fontSize: 10, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                                                <div style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{value}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Expiry warning */}
                                    {daysToExp <= 90 && daysToExp > 0 && (
                                        <div style={{ fontSize: 11, color: daysToExp <= 30 ? '#ef4444' : '#f59e0b', background: daysToExp <= 30 ? '#fee2e2' : '#fffbeb', borderRadius: 7, padding: '5px 10px', marginBottom: 12, fontWeight: 600 }}>
                                            ⚠ Expires in {daysToExp} days
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <button onClick={() => openQC(b)} style={{
                                        width: '100%', height: 40, borderRadius: 10, border: 'none',
                                        background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
                                        color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        transition: 'filter 0.15s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
                                        onMouseLeave={e => e.currentTarget.style.filter = 'none'}>
                                        <ClipboardCheck size={15} /> Perform QC Inspection
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* QC Modal */}
            <Modal open={modalOpen} setOpen={setModalOpen}>
                <ModalBody>
                    <ModalContent style={{ maxWidth: 640 }}>
                        {/* Modal header */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>QC Inspection</div>
                            <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1' }}>{selectedBatch?.batchId}</span>
                                {' · '}{selectedBatch?.productId?.name} ({selectedBatch?.productId?.type})
                            </div>
                        </div>

                        {loadingTemplates ? (
                            <div style={{ textAlign: 'center', padding: '32px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group" style={{ marginBottom: 20 }}>
                                    <label>Inspector Name *</label>
                                    <input value={qcData.inspector} onChange={e => setQcData({ ...qcData, inspector: e.target.value })} placeholder="Enter inspector name" required />
                                </div>

                                {/* Test rows */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                                    {qcData.tests.map((t, i) => (
                                        <div key={i} style={{ background: t.status === 'Fail' ? '#fef2f2' : '#f8fafc', border: `1px solid ${t.status === 'Fail' ? '#fecaca' : '#e2e8f0'}`, borderRadius: 10, padding: '12px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr 120px 100px', gap: 12, alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{t.name}</div>
                                                {t.description && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{t.description}</div>}
                                            </div>
                                            <input value={t.result} onChange={e => handleTestChange(i, 'result', e.target.value)}
                                                placeholder="Result value" required
                                                style={{ height: 36, padding: '0 10px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a', background: '#fff' }} />
                                            <Select value={t.status} onValueChange={val => handleTestChange(i, 'status', val)}>
                                                <SelectTrigger data-size="sm"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Pass">Pass</SelectItem>
                                                    <SelectItem value="Fail">Fail</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: t.status === 'Pass' ? '#10b981' : '#ef4444' }}>
                                                {t.status === 'Pass' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                                {t.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pass/fail summary */}
                                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                                    <div style={{ flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>{qcData.tests.filter(t => t.status === 'Pass').length}</div>
                                        <div style={{ fontSize: 11, color: '#64748b' }}>Passing</div>
                                    </div>
                                    <div style={{ flex: 1, background: qcData.tests.some(t => t.status === 'Fail') ? '#fef2f2' : '#f8fafc', border: `1px solid ${qcData.tests.some(t => t.status === 'Fail') ? '#fecaca' : '#e2e8f0'}`, borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: 18, fontWeight: 800, color: qcData.tests.some(t => t.status === 'Fail') ? '#ef4444' : '#94a3b8' }}>{qcData.tests.filter(t => t.status === 'Fail').length}</div>
                                        <div style={{ fontSize: 11, color: '#64748b' }}>Failing</div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Notes (optional)</label>
                                    <textarea value={qcData.notes} onChange={e => setQcData({ ...qcData, notes: e.target.value })} placeholder="Additional observations..." rows={2} />
                                </div>

                                <ModalFooter style={{ background: 'transparent', border: 'none', paddingTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                    <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                                    <button type="submit" style={{ background: qcData.tests.every(t => t.status === 'Pass') ? '#10b981' : '#ef4444', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        {qcData.tests.every(t => t.status === 'Pass') ? <CheckCircle size={15} /> : <XCircle size={15} />}
                                        Submit QC Report
                                    </button>
                                </ModalFooter>
                            </form>
                        )}
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
