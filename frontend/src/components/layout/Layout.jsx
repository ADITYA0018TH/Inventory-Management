import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import SearchBar from '../common/SearchBar';
import NotificationBell from '../common/NotificationBell';
import SessionTimeout from '../common/SessionTimeout';
import { Menu as FiMenu } from 'lucide-react';

export default function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="main-wrapper">
                <header className="top-bar">
                    <button
                        className="mobile-toggle"
                        onClick={() => setIsSidebarOpen((prev) => !prev)}
                        aria-label="Toggle sidebar"
                    >
                        <FiMenu />
                    </button>
                    <SearchBar />
                    <div className="top-bar-actions">
                        <NotificationBell />
                    </div>
                </header>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
            <SessionTimeout />
        </div>
    );
}
