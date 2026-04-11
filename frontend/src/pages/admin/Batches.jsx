import { useState, useEffect } from 'react';
import API, { getBaseURL } from '../../api';
import { Plus, Download, X, Layers, CheckCircle, Truck, FlaskConical, QrCode, AlertCircle, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

const STATUS_CONFIG = {
    'In Production': { color: '#3b82f6', bg: '#eff6ff', icon: <FlaskConical size={12} /> },
    'Quality Check':  { color: '#f59e0b', bg: '#fffbeb', icon: <AlertCircle size={12} /> },
    'Released':       { color: '#10b981', bg: '#f0fdf4', icon: <CheckCircle size={12} /> },
    'Shipped':        { color: '#8b5cf6', bg: '#f5f3ff', icon: <Truck size={12} /> },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] || { color: '#94a3b8', bg: '#f1f5f9', icon: null };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: cfg.bg, color: cfg.color,
            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999,
            border: `1px solid ${cfg.color}30`
        }}>
            {cfg.icon} {status}
        </span>
    );
}

function ExpiryBadge({ expDate }) {
    const days = Math.ceil((new Date(expDate) - new Date()) / 86400000);
    if (days < 0) return <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: 6 }}>Expired</span>;
    if (days <= 30) return <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', background: '#fee2e2', padding: '2px 8px', borderRadius: 6 }}>{days}d left</span>;
    if (days <= 90) return <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', background: '#fffbeb', padding: '2px 8px', borderRadius: 6 }}>{days}d left</span>;
    return <span style={{ fontSize: 12, color: '#64748b' }}>{new Date(expDate).toLocaleDateString()}</span>;
}

export default function Batches() {
    const [batches, setBatches] = useState([]);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ batchId: '', productId: '', quantityProduced: '', mfgDate: '', expDate: '' });
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [printBatch, setPrintBatch] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [b, p] = await Promise.all([API.get('/batches'), API.get('/products')]);
            setBatches(b.data); setProducts(p.data);
        } catch { toast.error('Failed to load data'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post('/batches', form);
            toast.success('Batch created — raw materials deducted');
            setShowForm(false);
            setForm({ batchId: '', productId: '', quantityProduced: '', mfgDate: '', expDate: '' });
            loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Batch creation failed'); }
    };

    const updateStatus = async (id, status) => {
        try { await API.put(`/batches/${id}/status`, { status }); toast.success(`Status → ${status}`); loadData(); }
        catch { toast.error('Status update failed'); }
    };

    const counts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
        acc[s] = batches.filter(b => b.status === s).length;
        return acc;
    }, {});

    const filtered = batches.filter(b => {
        const matchSearch = !search || b.batchId.toLowerCase().includes(search.toLowerCase()) || b.productId?.name?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || b.status === filterStatus;
        return matchSearch && matchStatus;
    });

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Batch Management</h1>
                    <p>Track production batches, QR codes, and expiry dates</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-ghost" onClick={() => window.open(`${getBaseURL()}/api/export/batches`, '_blank')}>
                        <Download size={15} /> Export CSV
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        <Plus size={15} /> Create Batch
                    </button>
                </div>
            </div>

            {/* Status summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                    <div key={status} onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
                        style={{
                            background: filterStatus === status ? cfg.bg : '#fff',
                            border: `1px solid ${filterStatus === status ? cfg.color + '60' : '#e2e8f0'}`,
                            borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                            transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 12
                        }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {cfg.icon}
                        </div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color, lineHeight: 1 }}>{counts[status] || 0}</div>
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{status}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create form */}
            {showForm && (
                <div style={{ background: '#fff', border: '1px solid #6366f1', borderLeft: '4px solid #6366f1', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h3 style={{ margin: 0 }}>Create New Batch</h3>
                        <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
                    </div>
                    <p style={{ fontSize: 12, color: '#f59e0b', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', marginBottom: 16 }}>
                        Raw materials will be automatically deducted based on the product formula.
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Batch ID</label>
                                <input type="text" value={form.batchId} onChange={e => setForm({ ...form, batchId: e.target.value })} placeholder="AST-2026-001" required />
                            </div>
                            <div className="form-group">
                                <label>Product</label>
                                <Select value={form.productId} onValueChange={val => setForm(p => ({ ...p, productId: val }))}>
                                    <SelectTrigger><SelectValue placeholder="Select Product" /></SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => <SelectItem key={p._id} value={p._id}>{p.name} ({p.type})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="form-group">
                                <label>Quantity</label>
                                <input type="number" value={form.quantityProduced} onChange={e => setForm({ ...form, quantityProduced: e.target.value })} placeholder="1000" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Mfg Date</label><DatePicker value={form.mfgDate} onChange={date => setForm({ ...form, mfgDate: date })} /></div>
                            <div className="form-group"><label>Expiry Date</label><DatePicker value={form.expDate} onChange={date => setForm({ ...form, expDate: date })} /></div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">Create Batch</button>
                            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            <div className="card">
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search batch ID or product..."
                        style={{ flex: 1, maxWidth: 300, height: 36, padding: '0 12px', fontSize: 13, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' }} />
                    {filterStatus && (
                        <button onClick={() => setFilterStatus('')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6366f1', background: '#ede9fe', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
                            <X size={12} /> Clear filter
                        </button>
                    )}
                    <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{filtered.length} batches</span>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Batch ID</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Mfg Date</th>
                            <th>Expiry</th>
                            <th>Status</th>
                            <th>QR</th>
                            <th>Update Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(b => (
                            <tr key={b._id}>
                                <td>
                                    <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', fontSize: 13 }}>{b.batchId}</span>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500, color: '#0f172a', fontSize: 13 }}>{b.productId?.name || '—'}</div>
                                    {b.productId?.type && (
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{b.productId.type}</div>
                                    )}
                                </td>
                                <td style={{ fontWeight: 600, color: '#475569' }}>{b.quantityProduced?.toLocaleString()}</td>
                                <td style={{ fontSize: 12, color: '#64748b' }}>{new Date(b.mfgDate).toLocaleDateString()}</td>
                                <td><ExpiryBadge expDate={b.expDate} /></td>
                                <td><StatusBadge status={b.status} /></td>
                                <td>
                                    {b.qrCodeData ? (
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            <button onClick={() => setSelectedBatch(b)} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                fontSize: 12, fontWeight: 600, color: '#6366f1',
                                                background: '#ede9fe', border: 'none', borderRadius: 7,
                                                padding: '5px 10px', cursor: 'pointer'
                                            }}>
                                                <QrCode size={13} /> View QR
                                            </button>
                                            <button onClick={() => setPrintBatch(b)} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                fontSize: 12, fontWeight: 600, color: '#10b981',
                                                background: '#d1fae5', border: 'none', borderRadius: 7,
                                                padding: '5px 10px', cursor: 'pointer'
                                            }}>
                                                <Printer size={13} /> Label
                                            </button>
                                        </div>
                                    ) : <span style={{ color: '#c7d2fe', fontSize: 12 }}>—</span>}
                                </td>
                                <td style={{ minWidth: 160 }}>
                                    <Select value={b.status} onValueChange={val => updateStatus(b._id, val)}>
                                        <SelectTrigger data-size="sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(STATUS_CONFIG).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <Layers size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                                    {search || filterStatus ? 'No batches match your filter' : 'No batches created yet'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Print Label Modal */}
            {printBatch && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                    onClick={() => setPrintBatch(null)}>
                    <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Batch Label</h3>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer' }}>
                                    <Printer size={13} /> Print
                                </button>
                                <button onClick={() => setPrintBatch(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
                            </div>
                        </div>

                        {/* Label preview — this is what gets printed */}
                        <div id="batch-label" style={{ border: '2px solid #0f172a', borderRadius: 12, padding: 20, fontFamily: 'monospace' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>PharmaLink</div>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginTop: 2 }}>{printBatch.batchId}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginTop: 2 }}>{printBatch.productId?.name}</div>
                                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{printBatch.productId?.type} · SKU: {printBatch.productId?.sku}</div>
                                </div>
                                {printBatch.qrCodeData && (
                                    <img src={printBatch.qrCodeData} alt="QR" style={{ width: 80, height: 80, border: '1px solid #e2e8f0', borderRadius: 6, padding: 4, background: '#fff' }} />
                                )}
                            </div>
                            <div style={{ height: 1, background: '#e2e8f0', marginBottom: 12 }} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                {[
                                    ['Qty Produced', `${printBatch.quantityProduced?.toLocaleString()} units`],
                                    ['Status', printBatch.status],
                                    ['Mfg Date', new Date(printBatch.mfgDate).toLocaleDateString()],
                                    ['Exp Date', new Date(printBatch.expDate).toLocaleDateString()],
                                ].map(([label, value]) => (
                                    <div key={label}>
                                        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginTop: 1 }}>{value}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 12, fontSize: 9, color: '#94a3b8', textAlign: 'center' }}>
                                Scan QR code to verify authenticity · PharmaLink Supply Chain
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Modal */}
            <Modal open={!!selectedBatch} setOpen={open => !open && setSelectedBatch(null)}>
                <ModalBody>
                    <ModalContent className="items-center text-center max-w-[400px]">
                        {selectedBatch && (
                            <>
                                <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>QR Code</h3>
                                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>{selectedBatch.batchId} — {selectedBatch.productId?.name}</p>
                                <div style={{ background: '#fff', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0', display: 'inline-block', marginBottom: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                                    <img src={selectedBatch.qrCodeData} alt="QR Code" style={{ width: 180, height: 180, display: 'block' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', marginBottom: 20, background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0' }}>
                                    {[
                                        ['Product', selectedBatch.productId?.name],
                                        ['Quantity', selectedBatch.quantityProduced?.toLocaleString()],
                                        ['Mfg Date', new Date(selectedBatch.mfgDate).toLocaleDateString()],
                                        ['Exp Date', new Date(selectedBatch.expDate).toLocaleDateString()],
                                    ].map(([label, value]) => (
                                        <div key={label} style={{ textAlign: 'left' }}>
                                            <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{value}</div>
                                        </div>
                                    ))}
                                </div>
                                <ModalFooter style={{ background: 'transparent', border: 'none', width: '100%' }}>
                                    <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setSelectedBatch(null)}>Close</button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
