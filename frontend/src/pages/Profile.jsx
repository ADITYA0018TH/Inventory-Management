import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiSave } from 'react-icons/fi';
import API from '../api';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState({ name: '', email: '', companyName: '', gstNumber: '', role: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        try {
            const res = await API.get('/auth/me');
            setProfile(res.data);
        } catch { toast.error('Failed to load profile'); }
        finally { setLoading(false); }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await API.put('/auth/profile', { name: profile.name, companyName: profile.companyName, gstNumber: profile.gstNumber });
            toast.success('Profile updated!');
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error('Passwords do not match');
        }
        if (passwords.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }
        try {
            await API.put('/auth/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Password changed!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Profile Settings</h1>
                    <p>Manage your account information</p>
                </div>
            </div>

            <div className="profile-grid">
                <div className="card">
                    <h3><FiUser /> Personal Information</h3>
                    <form onSubmit={handleProfileUpdate}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" value={profile.email} disabled />
                            <small className="text-muted">Email cannot be changed</small>
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <input type="text" value={profile.role} disabled style={{ textTransform: 'capitalize' }} />
                        </div>
                        {profile.role === 'distributor' && (
                            <>
                                <div className="form-group">
                                    <label>Company Name</label>
                                    <input type="text" value={profile.companyName || ''} onChange={e => setProfile({ ...profile, companyName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>GST Number</label>
                                    <input type="text" value={profile.gstNumber || ''} onChange={e => setProfile({ ...profile, gstNumber: e.target.value })} />
                                </div>
                            </>
                        )}
                        <button type="submit" className="btn btn-primary"><FiSave /> Save Changes</button>
                    </form>
                </div>

                <div className="card">
                    <h3><FiLock /> Change Password</h3>
                    <form onSubmit={handlePasswordChange}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input type="password" value={passwords.currentPassword} onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
                        </div>
                        <button type="submit" className="btn btn-primary"><FiLock /> Change Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
}
