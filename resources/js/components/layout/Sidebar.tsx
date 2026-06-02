import { Link, usePage } from '@inertiajs/react';
import Avatar from '@/components/ui/Avatar';
import {
    Hotel, Dashboard, Calendar, ArrowUpTray, Sparkles,
    Users, Star, Chart, Settings, PanelLeft,
} from '@/components/ui/Icons';

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_OPERACAO = [
    { id: 'dashboard',  label: 'Dashboard',           icon: Dashboard,  route: '/' },
    { id: 'reservas',   label: 'Reservas',            icon: Calendar,   route: '/reservas',  badge: 7 },
    { id: 'checkout',    label: 'Check-out',            icon: ArrowUpTray, route: '/checkout' },
    { id: 'checkin',    label: 'Check-in',             icon: Hotel,       route: '/checkin' },
    { id: 'chatbot',    label: 'ChatBot',              icon: Sparkles,    route: '/chatbot' },
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

    const isActive = (route: string) => route === '/' ? url === '/' : url.startsWith(route);

    return (
        <aside className="sidebar">
            {/* Brand */}
            <div className="brand">
                <div className="brand-mark">
                    <Hotel size={18} stroke={2} />
                </div>
                <div className="brand-text">Seu Hotel</div>
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
                {NAV_OPERACAO.map(({ id, label, icon: Icon, route, badge }) => (
                    <Link
                        key={id}
                        href={route}
                        className={`nav-item ${isActive(route) ? 'active' : ''}`}
                        onClick={onItemClick}
                    >
                        <span className="nav-icon"><Icon size={18} /></span>
                        <span className="nav-label">{label}</span>
                        {badge && <span className="nav-badge">{badge}</span>}
                    </Link>
                ))}

                <div className="section-label">Análise</div>
                {NAV_ANALISE.map(({ id, label, icon: Icon, route }) => (
                    <Link
                        key={id}
                        href={route}
                        className={`nav-item ${isActive(route) ? 'active' : ''}`}
                        onClick={onItemClick}
                    >
                        <span className="nav-icon"><Icon size={18} /></span>
                        <span className="nav-label">{label}</span>
                    </Link>
                ))}
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
