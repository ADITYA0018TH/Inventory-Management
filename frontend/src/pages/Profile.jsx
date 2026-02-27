import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User as FiUser, Lock as FiLock, Save as FiSave, Shield as FiShield } from 'lucide-react';
import API from '../api';
import toast from 'react-hot-toast';

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState({ name: '', email: '', companyName: '', gstNumber: '', role: '', twoFactorEnabled: false });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [twoFASetup, setTwoFASetup] = useState(null);
    const [verifyCode, setVerifyCode] = useState('');

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
        if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
        if (passwords.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
        try {
            await API.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
            toast.success('Password changed!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const setup2FA = async () => {
        try {
            const res = await API.post('/auth/2fa/setup');
            setTwoFASetup(res.data);
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to setup 2FA'); }
    };

    const verify2FA = async (e) => {
        e.preventDefault();
        try {
            await API.post('/auth/2fa/verify', { token: verifyCode });
            toast.success('2FA enabled successfully!');
            setTwoFASetup(null);
            setVerifyCode('');
            loadProfile();
        } catch (err) { toast.error(err.response?.data?.message || 'Invalid code'); }
    };

    const disable2FA = async () => {
        try {
            await API.post('/auth/2fa/disable');
            toast.success('2FA disabled');
            loadProfile();
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

                <div className="card">
                    <h3><FiShield /> Two-Factor Authentication</h3>
                    {profile.twoFactorEnabled ? (
                        <div>
                            <p style={{ color: '#10b981', fontWeight: 500 }}>✅ 2FA is enabled on your account</p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Your account is protected with TOTP-based two-factor authentication.</p>
                            <button className="btn" onClick={disable2FA} style={{ marginTop: 8 }}>Disable 2FA</button>
                        </div>
                    ) : twoFASetup ? (
                        <div>
                            <p style={{ marginBottom: 12 }}>Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):</p>
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <img src={twoFASetup.qrCode} alt="2FA QR Code" style={{ maxWidth: 200, borderRadius: 8 }} />
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                                Manual key: <code>{twoFASetup.secret}</code>
                            </p>
                            <form onSubmit={verify2FA}>
                                <div className="form-group">
                                    <label>Enter 6-digit verification code</label>
                                    <input type="text" value={verifyCode} onChange={e => setVerifyCode(e.target.value)} maxLength={6} placeholder="000000" required style={{ textAlign: 'center', fontSize: 20, letterSpacing: 6 }} />
                                </div>
                                <button type="submit" className="btn btn-primary">Verify & Enable 2FA</button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <p style={{ color: 'var(--text-secondary)' }}>Add an extra layer of security to your account using a TOTP authenticator app.</p>
                            <button className="btn btn-primary" onClick={setup2FA} style={{ marginTop: 8 }}><FiShield /> Enable 2FA</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
