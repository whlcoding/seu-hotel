import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    Hotel, Dashboard, Calendar, ArrowsLR,
    Users, Star, Chart, Settings, PanelLeft,
    ChevronDown,
} from '@/components/ui/Icons';
import Avatar from '@/components/ui/Avatar';

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_OPERACAO = [
    { id: 'dashboard',  label: 'Dashboard',           icon: Dashboard,  route: '/' },
    { id: 'reservas',   label: 'Reservas',            icon: Calendar,   route: '/reservas',  badge: 7 },
    { id: 'checkout',    label: 'Check-out', icon: ArrowsLR,   route: '/checkout' },
    // { id: 'checkin',    label: 'Check-in', icon: ArrowsLR,   route: '/checkin' },
    { id: 'chatbot',    label: 'ChatBot', icon: ArrowsLR,   route: '/chatbot' },
    { id: 'equipe',     label: 'Equipe',               icon: Users,      route: '/equipe' },
    { id: 'limpeza',    label: 'Limpeza',              icon: Star,       route: '/limpeza' },
];

const NAV_ANALISE = [
    { id: 'relatorios',     label: 'Relatórios',     icon: Chart,    route: '/relatorios' },
    { id: 'configuracoes',  label: 'Configurações',  icon: Settings, route: '/configuracoes' },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    onItemClick?: () => void;
}

export default function Sidebar({ collapsed, onToggle, onItemClick }: SidebarProps) {
    const { url } = usePage();

    const isActive = (route: string) => {
        if (route === '/') return url === '/';
        return url.startsWith(route);
    };

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="brand">
                <div className="brand-mark">
                    <Hotel size={18} stroke={2} />
                </div>
                <div className="brand-text">Hotel Management</div>
                <button
                    className="sidebar-toggle"
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                    title={collapsed ? 'Expandir' : 'Recolher'}
                >
                    <PanelLeft size={16} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="nav" aria-label="Navegação principal">
                <div className="section-label">Operação</div>
                {NAV_OPERACAO.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={item.route}
                            className={`nav-item ${isActive(item.route) ? 'active' : ''}`}
                            onClick={onItemClick}
                        >
                            <span className="nav-icon"><Icon size={18} /></span>
                            <span className="nav-label">{item.label}</span>
                            {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </Link>
                    );
                })}

                <div className="section-label">Análise</div>
                {NAV_ANALISE.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={item.route}
                            className={`nav-item ${isActive(item.route) ? 'active' : ''}`}
                            onClick={onItemClick}
                        >
                            <span className="nav-icon"><Icon size={18} /></span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User chip */}
            <div className="sidebar-foot">
                <button className="user-chip" type="button">
                    <Avatar name="Mariana Reis" color="purple" size="sm" />
                    <div className="user-meta">
                        <div className="user-name">Mariana Reis</div>
                        <div className="user-role">Gerente · Pousada Mar Azul</div>
                    </div>
                </button>
            </div>
        </aside>
    );
}
