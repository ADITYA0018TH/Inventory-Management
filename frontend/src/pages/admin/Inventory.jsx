import { useState, useEffect } from 'react';
import API from '../../api';
import { FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Inventory() {
    const [materials, setMaterials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [stockInId, setStockInId] = useState(null);
    const [stockInQty, setStockInQty] = useState('');
    const [form, setForm] = useState({ name: '', unit: 'kg', currentStock: 0, minimumThreshold: 10, supplier: '' });

    useEffect(() => { loadMaterials(); }, []);

    const loadMaterials = async () => {
        try { const res = await API.get('/raw-materials'); setMaterials(res.data); }
        catch { toast.error('Failed to load materials'); }
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await API.put(`/raw-materials/${editing}`, form);
                toast.success('Material updated');
            } else {
                await API.post('/raw-materials', form);
                toast.success('Material added');
            }
            resetForm();
            loadMaterials();
        } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this material?')) return;
        try { await API.delete(`/raw-materials/${id}`); toast.success('Deleted'); loadMaterials(); }
        catch { toast.error('Delete failed'); }
    };

    const handleStockIn = async (id) => {
        try {
            await API.put(`/raw-materials/${id}/stock-in`, { quantity: Number(stockInQty) });
            toast.success('Stock updated');
            setStockInId(null);
            setStockInQty('');
            loadMaterials();
        } catch { toast.error('Stock-in failed'); }
    };

    const startEdit = (m) => { setForm({ name: m.name, unit: m.unit, currentStock: m.currentStock, minimumThreshold: m.minimumThreshold, supplier: m.supplier || '' }); setEditing(m._id); setShowForm(true); };
    const resetForm = () => { setForm({ name: '', unit: 'kg', currentStock: 0, minimumThreshold: 10, supplier: '' }); setEditing(null); setShowForm(false); };

    const exportCSV = () => {
        window.open('http://localhost:5001/api/export/inventory', '_blank');
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Raw Materials Inventory</h1>
                    <p>Manage your raw materials and stock levels</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={exportCSV}><FiDownload /> Export CSV</button>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                        <FiPlus /> Add Material
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card form-card">
                    <h3>{editing ? 'Edit Material' : 'Add New Material'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group"><label>Name</label><input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Paracetamol Powder" required /></div>
                            <div className="form-group"><label>Unit</label>
                                <select name="unit" value={form.unit} onChange={handleChange}>
                                    <option value="kg">kg</option><option value="liters">liters</option><option value="units">units</option><option value="grams">grams</option><option value="ml">ml</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Current Stock</label><input type="number" name="currentStock" value={form.currentStock} onChange={handleChange} required /></div>
                            <div className="form-group"><label>Min Threshold</label><input type="number" name="minimumThreshold" value={form.minimumThreshold} onChange={handleChange} /></div>
                            <div className="form-group"><label>Supplier</label><input type="text" name="supplier" value={form.supplier} onChange={handleChange} placeholder="Supplier name" /></div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'} Material</button>
                            <button type="button" className="btn btn-ghost" onClick={resetForm}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr><th>Name</th><th>Stock</th><th>Min Threshold</th><th>Supplier</th><th>Last Updated</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {materials.map(m => (
                            <tr key={m._id} className={m.currentStock < m.minimumThreshold ? 'row-alert' : ''}>
                                <td className="td-bold">{m.name}</td>
                                <td>
                                    <span className={`stock-badge ${m.currentStock < m.minimumThreshold ? 'stock-low' : 'stock-ok'}`}>
                                        {m.currentStock} {m.unit}
                                    </span>
                                </td>
                                <td>{m.minimumThreshold} {m.unit}</td>
                                <td>{m.supplier || '—'}</td>
                                <td>{new Date(m.lastUpdated).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-btns">
                                        {stockInId === m._id ? (
                                            <div className="stock-in-inline">
                                                <input type="number" value={stockInQty} onChange={e => setStockInQty(e.target.value)} placeholder="Qty" className="stock-input" />
                                                <button className="btn btn-sm btn-success" onClick={() => handleStockIn(m._id)}>Add</button>
                                                <button className="btn btn-sm btn-ghost" onClick={() => setStockInId(null)}>✕</button>
                                            </div>
                                        ) : (
                                            <>
                                                <button className="btn btn-sm btn-success" onClick={() => setStockInId(m._id)} title="Stock In"><FiArrowUp /></button>
                                                <button className="btn btn-sm btn-ghost" onClick={() => startEdit(m)} title="Edit"><FiEdit2 /></button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(m._id)} title="Delete"><FiTrash2 /></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {materials.length === 0 && <tr><td colSpan="6" className="empty-table">No materials added yet</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
