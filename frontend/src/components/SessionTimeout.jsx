import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@/components/ui/animated-modal';

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

    return (
        <Modal open={showWarning} setOpen={setShowWarning}>
            <ModalBody>
                <ModalContent className="items-center text-center max-w-[400px]">
                    <div className="session-warning-icon text-5xl mb-4 text-amber-500">⏰</div>
                    <h3 className="text-xl font-bold mb-2 text-white">Session Expiring Soon</h3>
                    <p className="text-neutral-400 mb-6">You've been inactive for a while. Your session will expire in 5 minutes.</p>
                    <ModalFooter className="p-0 bg-transparent flex justify-center w-full">
                        <button className="btn btn-primary btn-full w-full" onClick={resetTimers}>
                            I'm Still Here
                        </button>
                    </ModalFooter>
                </ModalContent>
            </ModalBody>
        </Modal>
    );
}
