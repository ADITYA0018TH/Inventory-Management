import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TIMEOUT_MS = 30 * 60 * 1000;     // 30 minutes
const WARNING_MS = 25 * 60 * 1000;     // 25 minutes — show warning

export default function SessionTimeout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);
    const timerRef = useRef();
    const warningRef = useRef();

    const resetTimers = () => {
        setShowWarning(false);
        clearTimeout(timerRef.current);
        clearTimeout(warningRef.current);

        warningRef.current = setTimeout(() => setShowWarning(true), WARNING_MS);
        timerRef.current = setTimeout(() => {
            logout();
            navigate('/login');
        }, TIMEOUT_MS);
    };

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimers));
        resetTimers();
        return () => {
            events.forEach(e => window.removeEventListener(e, resetTimers));
            clearTimeout(timerRef.current);
            clearTimeout(warningRef.current);
        };
    }, []);

    if (!showWarning) return null;

    return (
        <div className="modal-overlay">
            <div className="modal session-modal">
                <div className="session-warning-icon">⏰</div>
                <h3>Session Expiring Soon</h3>
                <p>You've been inactive for a while. Your session will expire in 5 minutes.</p>
                <button className="btn btn-primary btn-full" onClick={resetTimers}>
                    I'm Still Here
                </button>
            </div>
        </div>
    );
}
