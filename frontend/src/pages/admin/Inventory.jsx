import { useState, useEffect } from 'react';
import API, { getBaseURL } from '../../api';
import { Plus, Edit2, Trash2, ArrowUp, Download, X, Package, AlertTriangle, CheckCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function Inventory() {
    const [materials, setMaterials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [stockInId, setStockInId] = useState(null);
    const [stockInQty, setStockInQty] = useState('');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', unit: 'kg', currentStock: 0, minimumThreshold: 10, supplier: '' });

    useEffect(() => { loadMaterials(); }, []);

    const loadMaterials = async () => {
        try { const res = await API.get('/raw-materials'); setMaterials(res.data); }
        catch { toast.error('Failed to load materials'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await API.put(`/raw-materials/${editing}`, form); toast.success('Material updated'); }
            else { await API.post('/raw-materials', form); toast.success('Material added'); }
            resetForm(); loadMaterials();
        } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this material?')) return;
        try { await API.delete(`/raw-materials/${id}`); toast.success('Deleted'); loadMaterials(); }
        catch { toast.error('Delete failed'); }
    };

    const handleStockIn = async (id) => {
        if (!stockInQty || isNaN(stockInQty)) return toast.error('Enter a valid quantity');
        try {
            await API.put(`/raw-materials/${id}/stock-in`, { quantity: Number(stockInQty) });
            toast.success('Stock updated'); setStockInId(null); setStockInQty(''); loadMaterials();
        } catch { toast.error('Stock-in failed'); }
    };

    const startEdit = (m) => {
        setForm({ name: m.name, unit: m.unit, currentStock: m.currentStock, minimumThreshold: m.minimumThreshold, supplier: m.supplier || '' });
        setEditing(m._id); setShowForm(true);
    };
    const resetForm = () => { setForm({ name: '', unit: 'kg', currentStock: 0, minimumThreshold: 10, supplier: '' }); setEditing(null); setShowForm(false); };

    const filtered = materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || (m.supplier || '').toLowerCase().includes(search.toLowerCase()));
    const lowStock = materials.filter(m => m.currentStock < m.minimumThreshold).length;
    const totalItems = materials.length;

    const stockPct = (m) => Math.min((m.currentStock / Math.max(m.minimumThreshold * 3, 1)) * 100, 100);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Raw Materials Inventory</h1>
                    <p>Manage stock levels and reorder thresholds</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-ghost" onClick={() => window.open(`${getBaseURL()}/api/export/inventory`, '_blank')}>
                        <Download size={15} /> Export CSV
                    </button>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                        <Plus size={15} /> Add Material
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{totalItems}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 3 }}>Total Materials</div>
                    </div>
                </div>
                <div style={{ background: '#fff', border: `1px solid ${lowStock > 0 ? '#fecaca' : '#e2e8f0'}`, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: lowStock > 0 ? '#fee2e2' : '#d1fae5', color: lowStock > 0 ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {lowStock > 0 ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: lowStock > 0 ? '#ef4444' : '#10b981', lineHeight: 1 }}>{lowStock}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 3 }}>Low Stock Alerts</div>
                    </div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#d1fae5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981', lineHeight: 1 }}>{totalItems - lowStock}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 3 }}>Adequately Stocked</div>
                    </div>
                </div>
            </div>

            {/* Add/Edit form */}
            {showForm && (
                <div style={{ background: '#fff', border: '1px solid #6366f1', borderLeft: '4px solid #6366f1', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>{editing ? 'Edit Material' : 'Add New Material'}</h3>
                        <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Material Name</label>
                                <input type="text" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Paracetamol Powder" required />
                            </div>
                            <div className="form-group">
                                <label>Unit</label>
                                <Select value={form.unit} onValueChange={(val) => setForm({ ...form, unit: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['kg', 'liters', 'units', 'grams', 'ml'].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Current Stock</label>
                                <input type="number" name="currentStock" value={form.currentStock} onChange={e => setForm({ ...form, currentStock: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Min Threshold</label>
                                <input type="number" name="minimumThreshold" value={form.minimumThreshold} onChange={e => setForm({ ...form, minimumThreshold: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Supplier</label>
                                <input type="text" name="supplier" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier name" />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Material</button>
                            <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table card */}
            <div className="card">
                {/* Search bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ position: 'relative', width: 280 }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials or supplier..."
                            style={{ paddingLeft: 32, height: 36, fontSize: 13, width: '100%', boxSizing: 'border-box', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{filtered.length} of {totalItems} materials</span>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Stock Level</th>
                            <th>Min Threshold</th>
                            <th>Supplier</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(m => {
                            const isLow = m.currentStock < m.minimumThreshold;
                            const pct = stockPct(m);
                            return (
                                <tr key={m._id} style={{ background: isLow ? '#fff5f5' : 'transparent' }}>
                                    <td>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.name}</div>
                                        {isLow && (
                                            <div style={{ fontSize: 11, color: '#ef4444', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <AlertTriangle size={10} /> Below threshold
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ minWidth: 160 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ flex: 1, height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${pct}%`, background: isLow ? '#ef4444' : '#10b981', borderRadius: 999, transition: 'width 0.5s ease' }} />
                                            </div>
                                            <span style={{
                                                fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 6, flexShrink: 0,
                                                background: isLow ? '#fee2e2' : '#d1fae5',
                                                color: isLow ? '#ef4444' : '#10b981'
                                            }}>{m.currentStock} {m.unit}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: '#64748b', fontSize: 13 }}>{m.minimumThreshold} {m.unit}</td>
                                    <td style={{ color: '#64748b', fontSize: 13 }}>{m.supplier || <span style={{ color: '#c7d2fe' }}>—</span>}</td>
                                    <td style={{ color: '#94a3b8', fontSize: 12 }}>{new Date(m.lastUpdated).toLocaleDateString()}</td>
                                    <td>
                                        {stockInId === m._id ? (
                                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                <input type="number" value={stockInQty} onChange={e => setStockInQty(e.target.value)}
                                                    placeholder="Qty" autoFocus
                                                    style={{ width: 72, height: 32, padding: '0 8px', fontSize: 13, border: '1px solid #6366f1', borderRadius: 7, color: '#0f172a' }} />
                                                <button className="btn btn-sm btn-success" onClick={() => handleStockIn(m._id)}>Add</button>
                                                <button className="btn btn-sm btn-ghost" onClick={() => { setStockInId(null); setStockInQty(''); }}>
                                                    <X size={13} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-sm btn-success" onClick={() => setStockInId(m._id)} title="Add Stock">
                                                    <ArrowUp size={13} />
                                                </button>
                                                <button className="btn btn-sm btn-ghost" onClick={() => startEdit(m)} title="Edit">
                                                    <Edit2 size={13} />
                                                </button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m._id)} title="Delete">
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                    <Package size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                                    {search ? 'No materials match your search' : 'No materials added yet'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
