import { useState, useEffect } from 'react';
import API from '../../api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', type: 'Tablet', pricePerUnit: '', sku: '', description: '', formula: [] });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [p, m] = await Promise.all([API.get('/products'), API.get('/raw-materials')]);
            setProducts(p.data); setMaterials(m.data);
        } catch { toast.error('Failed to load data'); }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
            if (editing) {
                await API.put(`/products/${editing}`, form);
                toast.success('Product updated');
            } else {
                await API.post('/products', form);
                toast.success('Product created');
            }
            resetForm(); loadData();
        } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product?')) return;
        try { await API.delete(`/products/${id}`); toast.success('Deleted'); loadData(); }
        catch { toast.error('Delete failed'); }
    };

    const startEdit = (p) => {
        setForm({
            name: p.name, type: p.type, pricePerUnit: p.pricePerUnit, sku: p.sku, description: p.description || '',
            formula: p.formula.map(f => ({ materialId: f.materialId?._id || f.materialId, quantityRequired: f.quantityRequired }))
        });
        setEditing(p._id); setShowForm(true);
    };
    const resetForm = () => { setForm({ name: '', type: 'Tablet', pricePerUnit: '', sku: '', description: '', formula: [] }); setEditing(null); setShowForm(false); };

    return (
        <div className="page">
            <div className="page-header">
                <div><h1>Products</h1><p>Manage medicine definitions and formulas</p></div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}><FiPlus /> Add Product</button>
            </div>

            {showForm && (
                <div className="card form-card">
                    <h3>{editing ? 'Edit Product' : 'New Product'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group"><label>Product Name</label><input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Aster Cold Relief" required /></div>
                            <div className="form-group"><label>Type</label>
                                <select name="type" value={form.type} onChange={handleChange}>
                                    <option value="Tablet">Tablet</option><option value="Syrup">Syrup</option><option value="Injection">Injection</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Price Per Unit (₹)</label><input type="number" name="pricePerUnit" value={form.pricePerUnit} onChange={handleChange} placeholder="50" required /></div>
                            <div className="form-group"><label>SKU</label><input type="text" name="sku" value={form.sku} onChange={handleChange} placeholder="AST-CR-001" required /></div>
                        </div>
                        <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} placeholder="Product description..." rows="2" /></div>

                        <div className="formula-section">
                            <div className="formula-header">
                                <h4>Formula (per 1 unit)</h4>
                                <button type="button" className="btn btn-sm btn-primary" onClick={addFormulaItem}><FiPlus /> Add Ingredient</button>
                            </div>
                            {form.formula.map((f, i) => (
                                <div key={i} className="formula-row">
                                    <select value={f.materialId} onChange={e => updateFormulaItem(i, 'materialId', e.target.value)} required>
                                        <option value="">Select Material</option>
                                        {materials.map(m => <option key={m._id} value={m._id}>{m.name} ({m.currentStock} {m.unit})</option>)}
                                    </select>
                                    <input type="number" step="0.001" value={f.quantityRequired} onChange={e => updateFormulaItem(i, 'quantityRequired', e.target.value)} placeholder="Qty required" required />
                                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeFormulaItem(i)}><FiTrash2 /></button>
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

            <div className="products-grid">
                {products.map(p => (
                    <div key={p._id} className="card product-card">
                        <div className="product-header">
                            <span className={`badge badge-${p.type.toLowerCase()}`}>{p.type}</span>
                            <span className="product-sku">{p.sku}</span>
                        </div>
                        <h3>{p.name}</h3>
                        <p className="product-description">{p.description || 'No description'}</p>
                        <div className="product-price">₹{p.pricePerUnit}/unit</div>
                        {p.formula.length > 0 && (
                            <div className="product-formula">
                                <h4>Formula:</h4>
                                {p.formula.map((f, i) => (
                                    <div key={i} className="formula-item">
                                        <span>{f.materialId?.name || 'Unknown'}</span>
                                        <span>{f.quantityRequired} {f.materialId?.unit || ''}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="product-actions">
                            <button className="btn btn-sm btn-ghost" onClick={() => startEdit(p)}><FiEdit2 /> Edit</button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}><FiTrash2 /> Delete</button>
                        </div>
                    </div>
                ))}
                {products.length === 0 && <div className="empty-state">No products defined yet. Add your first medicine!</div>}
            </div>
        </div>
    );
}
