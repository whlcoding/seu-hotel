import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import '@/styles/hotel.css';

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumb?: { label: string; href?: string }[];
}

export default function AppLayout({ children, title, breadcrumb }: AppLayoutProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className={`app ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            <Sidebar
                collapsed={collapsed}
                onToggle={() => setCollapsed((v) => !v)}
                onItemClick={() => setMobileOpen(false)}
            />

            <div className="main">
                <Topbar
                    onMenuClick={() => setMobileOpen((v) => !v)}
                    title={title}
                    breadcrumb={breadcrumb}
                />
                <div className="content">
                    {children}
                </div>
            </div>
        </div>
    );
}
