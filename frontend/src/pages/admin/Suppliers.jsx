import { useState, useEffect } from 'react';
import API from '../../api';
import { Plus as FiPlus, Trash2 as FiTrash2, Edit2 as FiEdit2, Phone as FiPhone, Mail as FiMail, MapPin as FiMapPin, Star as FiStar, User as FiUser } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
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

    const openCreate = () => {
        setEditingId(null);
        setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstNumber: '', materials: [], rating: 3 });
        setIsModalOpen(true);
    };

    const filteredSuppliers = suppliers.filter((supplier) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        return [
            supplier.name,
            supplier.contactPerson,
            supplier.email,
            supplier.phone,
            supplier.address,
            supplier.gstNumber,
        ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
    });

    const averageRating = suppliers.length
        ? (suppliers.reduce((total, supplier) => total + (Number(supplier.rating) || 0), 0) / suppliers.length).toFixed(1)
        : '0.0';

    const totalMaterialConnections = suppliers.reduce((total, supplier) => total + (supplier.materials?.length || 0), 0);

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Supplier Management</h1>
                    <p>Manage supplier profiles, contacts, and material partnerships</p>
                </div>
                <Button onClick={openCreate}><FiPlus /> Add Supplier</Button>
            </div>

            <div className="stats-grid suppliers-stats">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Total Suppliers</span>
                        <span className="stat-value">{suppliers.length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Avg Rating</span>
                        <span className="stat-value">{averageRating}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Material Links</span>
                        <span className="stat-value">{totalMaterialConnections}</span>
                    </div>
                </div>
            </div>

            <div className="card suppliers-toolbar">
                <div className="search-input-group suppliers-search">
                    <input
                        type="text"
                        placeholder="Search by company, contact, email, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="suppliers-toolbar-meta">
                    Showing {filteredSuppliers.length} of {suppliers.length}
                </div>
            </div>

            <div className="grid-list suppliers-grid">
                {filteredSuppliers.map((s) => (
                    <div key={s._id} className="card supplier-card supplier-card-redesign">
                        <div className="supplier-card-top">
                            <div>
                                <h3>{s.name}</h3>
                                <p className="supplier-subtext">GST: {s.gstNumber || 'Not provided'}</p>
                            </div>
                            <div className="rating supplier-rating">
                                {[...Array(5)].map((_, i) => (
                                    <FiStar
                                        key={i}
                                        fill={i < s.rating ? 'currentColor' : 'none'}
                                        color={i < s.rating ? 'var(--warning)' : 'var(--text-muted)'}
                                        style={{ color: i < s.rating ? 'var(--warning)' : 'var(--text-muted)' }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="supplier-meta-list">
                            <p><FiUser className="icon" /> {s.contactPerson || 'No contact person'}</p>
                            <p><FiMail className="icon" /> {s.email || 'No email address'}</p>
                            <p><FiPhone className="icon" /> {s.phone || 'No phone number'}</p>
                            <p><FiMapPin className="icon" /> {s.address || 'No address provided'}</p>
                        </div>

                        <div className="supplier-materials">
                            <h4>Supplied Materials</h4>
                            <div className="tags">
                                {s.materials?.length
                                    ? s.materials.map((m) => <span key={m._id} className="badge badge-blue">{m.name}</span>)
                                    : <span className="badge">No linked materials</span>}
                            </div>
                        </div>

                        <div className="supplier-actions">
                            <Button variant="outline" size="icon" onClick={() => openEdit(s)} aria-label="Edit supplier">
                                <FiEdit2 />
                            </Button>
                            <Button variant="destructive" size="icon" onClick={() => handleDelete(s._id)} aria-label="Delete supplier">
                                <FiTrash2 />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSuppliers.length === 0 && (
                <div className="card empty-state suppliers-empty-state">
                    {suppliers.length === 0
                        ? 'No suppliers added yet. Create your first supplier profile.'
                        : 'No suppliers match your search query.'}
                </div>
            )}

            <Modal open={isModalOpen} setOpen={setIsModalOpen}>
                <ModalBody>
                    <ModalContent className="supplier-modal-content">
                        <h2 className="text-xl font-bold mb-1">{editingId ? 'Edit Supplier' : 'Add Supplier'}</h2>
                        <p className="suppliers-modal-subtitle mb-4">Maintain supplier contacts and material sourcing details.</p>
                        <form onSubmit={handleSubmit} className="supplier-form-layout">
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
                                <label>GST Number</label>
                                <input value={formData.gstNumber} onChange={e => setFormData({ ...formData, gstNumber: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Supplies Materials</label>
                                <select multiple value={formData.materials} onChange={e => setFormData({ ...formData, materials: [...e.target.selectedOptions].map(o => o.value) })} className="multi-select">
                                    {materials.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group mb-0">
                                <label>Rating (1-5)</label>
                                <input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })} />
                            </div>
                            <ModalFooter className="gap-2 mt-6 bg-transparent border-t supplier-modal-footer">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit">Save</Button>
                            </ModalFooter>
                        </form>
                    </ModalContent>
                </ModalBody>
            </Modal>
        </div>
    );
}
