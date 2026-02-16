import { useState, useEffect } from 'react';
import { FiUsers, FiShield, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import API from '../../api';
import toast from 'react-hot-toast';
import { SkeletonTable } from '../../components/SkeletonLoader';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const res = await API.get('/auth/users');
            setUsers(res.data);
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    };

    const toggleUser = async (id) => {
        try {
            const res = await API.put(`/auth/users/${id}/toggle`);
            toast.success(res.data.message);
            setUsers(users.map(u => u._id === id ? { ...u, isActive: res.data.user.isActive } : u));
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1><FiUsers style={{ marginRight: 8 }} /> User Management</h1>
                    <p>Manage all registered users</p>
                </div>
            </div>

            <div className="card">
                {loading ? <SkeletonTable rows={5} cols={6} /> : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Company</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id}>
                                    <td className="td-bold">{u.name}</td>
                                    <td>{u.email}</td>
                                    <td><span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role}</span></td>
                                    <td>{u.companyName || '—'}</td>
                                    <td>
                                        <span className={`badge ${u.isActive !== false ? 'badge-green' : 'badge-amber'}`}>
                                            {u.isActive !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className={`btn btn-sm ${u.isActive !== false ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleUser(u._id)} title={u.isActive !== false ? 'Deactivate' : 'Activate'}>
                                            {u.isActive !== false ? <><FiToggleRight /> Deactivate</> : <><FiToggleLeft /> Activate</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
