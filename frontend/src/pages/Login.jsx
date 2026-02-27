import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import API from '../api';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requires2FA, setRequires2FA] = useState(false);
    const [tempToken, setTempToken] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user?.requires2FA) {
                setRequires2FA(true);
                setTempToken(user.tempToken);
                setLoading(false);
                return;
            }
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/distributor/catalog');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handle2FAVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await API.post('/auth/2fa/validate', { tempToken, token: otpCode });
            localStorage.setItem('token', res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}!`);
            window.location.href = res.data.user.role === 'admin' ? '/admin/dashboard' : '/distributor/catalog';
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid 2FA code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-branding">
                        <img src="/src/assets/logo.png" alt="PharmaLink" className="auth-logo" />
                        <h1>PharmaLink</h1>
                        <p>Supply Chain & Inventory Management System</p>
                    </div>
                    <div className="auth-features">
                        <div className="feature-item">
                            <span>📦</span><span>Track Raw Materials & Inventory</span>
                        </div>
                        <div className="feature-item">
                            <span>🏭</span><span>Batch Manufacturing with Formula Logic</span>
                        </div>
                        <div className="feature-item">
                            <span>📱</span><span>QR Code Based Track & Trace</span>
                        </div>
                        <div className="feature-item">
                            <span>🛒</span><span>Distributor Ordering System</span>
                        </div>
                    </div>
                </div>
                <div className="auth-right">
                    {requires2FA ? (
                        <form className="auth-form" onSubmit={handle2FAVerify}>
                            <h2>🔐 Two-Factor Authentication</h2>
                            <p className="auth-subtitle">Enter the 6-digit code from your authenticator app</p>
                            <div className="form-group">
                                <label>Verification Code</label>
                                <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="000000" maxLength={6} required style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }} />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Sign In'}
                            </Button>
                            <p className="auth-footer mt-4">
                                <Button type="button" variant="ghost" onClick={() => { setRequires2FA(false); setOtpCode(''); }}>← Back to Login</Button>
                            </p>
                        </form>
                    ) : (
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <h2>Sign In</h2>
                            <p className="auth-subtitle">Enter your credentials to access the dashboard</p>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@pharmalink.com" required />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <div className="password-input-wrapper">
                                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                                    <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Signing in...' : 'Sign In'}
                            </Button>
                            <p className="auth-footer">
                                Don't have an account? <Link to="/register" className="text-primary font-medium hover:underline">Register here</Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
