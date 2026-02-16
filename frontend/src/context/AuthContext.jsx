import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            API.get('/auth/me')
                .then(res => { setUser(res.data); setLoading(false); })
                .catch(() => { logout(); setLoading(false); });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (data) => {
        const res = await API.post('/auth/register', data);
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
