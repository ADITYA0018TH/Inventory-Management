import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import SearchBar from './SearchBar';
import NotificationBell from './NotificationBell';
import SessionTimeout from './SessionTimeout';

export default function Layout() {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-wrapper">
                <header className="top-bar">
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
