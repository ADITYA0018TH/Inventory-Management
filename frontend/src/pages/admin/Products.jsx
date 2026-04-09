import { useState, useEffect } from 'react';
import API from '../../api';
import { Plus, Edit2, Trash2, X, Package, Search, FlaskConical } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const TYPE_CONFIG = {
    Tablet:    { color: '#6366f1', bg: '#ede9fe' },
    Syrup:     { color: '#06b6d4', bg: '#ecfeff' },
    Injection: { color: '#f59e0b', bg: '#fffbeb' },
};

export default function Products() {
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [form, setForm] = useState({ name: '', type: 'Tablet', pricePerUnit: '', sku: '', description: '', formula: [] });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [p, m] = await Promise.all([API.get('/products'), API.get('/raw-materials')]);
            setProducts(p.data); setMaterials(m.data);
        } catch { toast.error('Failed to load data'); }
    };

    const addFormulaItem = () => setForm({ ...form, formula: [...form.formula, { materialId: '', quantityRequired: '' }] });
    const removeFormulaItem = (i) => setForm({ ...form, formula: form.formula.filter((_, idx) => idx !== i) });
    const updateFormulaItem = (i, field, value) => {
        const updated = [...form.formula];
        updated[i][field] = value;
        setForm({ ...form, formula: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) { await API.put(`/products/${editing}`, form); toast.success('Product updated'); }
            else { await API.post('/products', form); toast.success('Product created'); }
            resetForm(); loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try { await API.delete(`/products/${id}`); toast.success('Deleted'); loadData(); }
        catch { toast.error('Delete failed'); }
    };

    const startEdit = (p) => {
        setForm({ name: p.name, type: p.type, pricePerUnit: p.pricePerUnit, sku: p.sku, description: p.description || '',
            formula: p.formula.map(f => ({ materialId: f.materialId?._id || f.materialId, quantityRequired: f.quantityRequired })) });
        setEditing(p._id); setShowForm(true);
    };
    const resetForm = () => { setForm({ name: '', type: 'Tablet', pricePerUnit: '', sku: '', description: '', formula: [] }); setEditing(null); setShowForm(false); };

    const filtered = products.filter(p => {
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
        const matchType = !filterType || p.type === filterType;
        return matchSearch && matchType;
    });

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Products</h1>
                    <p>Medicine catalog with formula definitions</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                    <Plus size={15} /> Add Product
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div style={{ background: '#fff', border: '1px solid #6366f1', borderLeft: '4px solid #6366f1', borderRadius: 14, padding: 24, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0 }}>{editing ? 'Edit Product' : 'New Product'}</h3>
                        <button onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group"><label>Product Name</label><input type="text" name="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Aster Cold Relief" required /></div>
                            <div className="form-group"><label>Type</label>
                                <Select value={form.type} onValueChange={val => setForm({ ...form, type: val })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['Tablet', 'Syrup', 'Injection'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="form-group"><label>Price / Unit (₹)</label><input type="number" value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: e.target.value })} placeholder="50" required /></div>
                            <div className="form-group"><label>SKU</label><input type="text" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="AST-CR-001" required /></div>
                        </div>
                        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Product description..." rows="2" /></div>

                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FlaskConical size={14} color="#6366f1" /> Formula (per 1 unit)
                                </div>
                                <button type="button" className="btn btn-sm btn-primary" onClick={addFormulaItem}><Plus size={12} /> Add Ingredient</button>
                            </div>
                            {form.formula.length === 0 && (
                                <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>No ingredients added yet</div>
                            )}
                            {form.formula.map((f, i) => (
                                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                                    <div style={{ flex: 2 }}>
                                        <Select value={f.materialId} onValueChange={val => updateFormulaItem(i, 'materialId', val)}>
                                            <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
                                            <SelectContent>
                                                {materials.map(m => <SelectItem key={m._id} value={m._id}>{m.name} ({m.currentStock} {m.unit})</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <input type="number" step="0.001" value={f.quantityRequired} onChange={e => updateFormulaItem(i, 'quantityRequired', e.target.value)}
                                        placeholder="Qty" style={{ width: 90, height: 40, padding: '0 10px', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' }} required />
                                    <button type="button" onClick={() => removeFormulaItem(i)} style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <X size={13} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'} Product</button>
                            <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products or SKU..."
                        style={{ paddingLeft: 32, height: 36, width: 240, fontSize: 13, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, color: '#0f172a' }} />
                </div>
                {['Tablet', 'Syrup', 'Injection'].map(t => {
                    const cfg = TYPE_CONFIG[t];
                    return (
                        <button key={t} onClick={() => setFilterType(filterType === t ? '' : t)} style={{
                            height: 36, padding: '0 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                            background: filterType === t ? cfg.bg : '#fff',
                            color: filterType === t ? cfg.color : '#64748b',
                            border: `1px solid ${filterType === t ? cfg.color + '50' : '#e2e8f0'}`
                        }}>{t}</button>
                    );
                })}
                <span style={{ fontSize: 12, color: '#94a3b8', marginLeft: 'auto' }}>{filtered.length} products</span>
            </div>

            {/* Product grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {filtered.map(p => {
                    const cfg = TYPE_CONFIG[p.type] || { color: '#6366f1', bg: '#ede9fe' };
                    return (
                        <div key={p._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 0, transition: 'all 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color + '50'; e.currentTarget.style.boxShadow = `0 4px 16px ${cfg.color}12`; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}>

                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: cfg.bg, color: cfg.color }}>
                                    {p.type}
                                </span>
                                <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{p.sku}</span>
                            </div>

                            {/* Name & desc */}
                            <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, marginBottom: 14, minHeight: 36 }}>
                                {p.description || <span style={{ color: '#c7d2fe', fontStyle: 'italic' }}>No description</span>}
                            </div>

                            {/* Price */}
                            <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color, marginBottom: 14 }}>
                                ₹{p.pricePerUnit}<span style={{ fontSize: 12, fontWeight: 500, color: '#94a3b8' }}>/unit</span>
                            </div>

                            {/* Formula */}
                            {p.formula.length > 0 && (
                                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 12px', marginBottom: 14, border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                                        <FlaskConical size={10} /> Formula
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                        {p.formula.map((f, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                                                <span style={{ color: '#475569' }}>{f.materialId?.name || 'Unknown'}</span>
                                                <span style={{ fontWeight: 600, color: '#0f172a' }}>{f.quantityRequired} {f.materialId?.unit || ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                                <button onClick={() => startEdit(p)} style={{ flex: 1, height: 34, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}>
                                    <Edit2 size={13} /> Edit
                                </button>
                                <button onClick={() => handleDelete(p._id)} style={{ flex: 1, height: 34, borderRadius: 8, border: '1px solid #fecaca', background: '#fff', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'all 0.15s' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}>
                                    <Trash2 size={13} /> Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
                {filtered.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                        <Package size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                        <div style={{ fontSize: 14 }}>{search || filterType ? 'No products match your filter' : 'No products defined yet'}</div>
                    </div>
                )}
            </div>
        </div>
    );
}
