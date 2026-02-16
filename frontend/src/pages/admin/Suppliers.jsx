import { useState, useEffect } from 'react';
import API from '../../api';
import { FiPlus, FiTrash2, FiEdit2, FiPhone, FiMail, FiMapPin, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', materials: [], rating: 3 });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [supRes, matRes] = await Promise.all([API.get('/suppliers'), API.get('/raw-materials')]);
            setSuppliers(supRes.data);
            setMaterials(matRes.data);
        } catch (err) {
            toast.error('Failed to load data');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await API.put(`/suppliers/${editingId}`, formData);
                toast.success('Supplier updated');
            } else {
                await API.post('/suppliers', formData);
                toast.success('Supplier added');
            }
            setIsModalOpen(false);
            setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', materials: [], rating: 3 });
            setEditingId(null);
            loadData();
        } catch (err) {
            toast.error('Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await API.delete(`/suppliers/${id}`);
            toast.success('Supplier deleted');
            loadData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const openEdit = (s) => {
        setFormData({ ...s, materials: s.materials.map(m => m._id) });
        setEditingId(s._id);
        setIsModalOpen(true);
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Supplier Management</h1>
                    <p>Manage raw material suppliers and ratings</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}><FiPlus /> Add Supplier</button>
            </div>

            <div className="grid-list">
                {suppliers.map(s => (
                    <div key={s._id} className="card supplier-card">
                        <div className="card-header">
                            <h3>{s.name}</h3>
                            <div className="rating">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar key={i} fill={i < s.rating ? "#f59e0b" : "none"} color={i < s.rating ? "#f59e0b" : "#64748b"} />
                                ))}
                            </div>
                        </div>
                        <div className="card-body">
                            <p><FiUser className="icon" /> {s.contactPerson}</p>
                            <p><FiMail className="icon" /> {s.email}</p>
                            <p><FiPhone className="icon" /> {s.phone}</p>
                            <p><FiMapPin className="icon" /> {s.address}</p>
                            <div className="tags">
                                {s.materials.map(m => <span key={m._id} className="badge badge-blue">{m.name}</span>)}
                            </div>
                        </div>
                        <div className="card-footer">
                            <button className="btn-icon" onClick={() => openEdit(s)}><FiEdit2 /></button>
                            <button className="btn-icon danger" onClick={() => handleDelete(s._id)}><FiTrash2 /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Company Name</label>
                                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Contact Person</label>
                                <input value={formData.contactPerson} onChange={e => setFormData({ ...formData, contactPerson: e.target.value })} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Supplies Materials</label>
                                <select multiple value={formData.materials} onChange={e => setFormData({ ...formData, materials: [...e.target.selectedOptions].map(o => o.value) })} className="multi-select">
                                    {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Rating (1-5)</label>
                                <input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} />
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

import { FiUser } from 'react-icons/fi';
