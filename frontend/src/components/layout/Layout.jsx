import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import SearchBar from '../common/SearchBar';
import NotificationBell from '../common/NotificationBell';
import SessionTimeout from '../common/SessionTimeout';
import { Menu as FiMenu } from 'lucide-react';

export default function Layout() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const SIDEBAR_WIDTH = isCollapsed ? 64 : 260;

    return (
        <div className="app-layout">
            <Sidebar
                isOpen={isMobileOpen}
                onClose={() => setIsMobileOpen(false)}
                isCollapsed={isCollapsed}
                onToggleCollapse={() => setIsCollapsed(prev => !prev)}
            />
            <div
                className="main-wrapper"
                style={{ marginLeft: SIDEBAR_WIDTH, transition: 'margin-left 0.25s ease' }}
            >
                <header className="top-bar">
                    {/* Mobile hamburger */}
                    <button
                        className="mobile-toggle"
                        onClick={() => setIsMobileOpen(prev => !prev)}
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
