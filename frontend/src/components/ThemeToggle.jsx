import { useState, useEffect } from 'react';
import { Sun as FiSun, Moon as FiMoon } from 'lucide-react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <button
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
    );
}
