import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate(user.role === 'admin' ? '/admin/dashboard' : '/distributor/catalog');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
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
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <p className="auth-footer">
                            Don't have an account? <Link to="/register">Register here</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
