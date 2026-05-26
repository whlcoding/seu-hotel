import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    Menu, Search, Help, Bell, ChevronDown,
    User, Settings, Logout,
} from '@/components/ui/Icons';
import Avatar from '@/components/ui/Avatar';

interface TopbarProps {
    onMenuClick: () => void;
    breadcrumb?: { label: string; href?: string }[];
    title?: string;
}

export default function Topbar({ onMenuClick, breadcrumb, title = 'Dashboard' }: TopbarProps) {
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        if (!profileOpen) return;
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        };
        window.addEventListener('mousedown', handler);
        return () => window.removeEventListener('mousedown', handler);
    }, [profileOpen]);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="topbar">
            {/* Mobile menu button */}
            <button className="icon-btn" onClick={onMenuClick} aria-label="Abrir menu">
                <Menu size={18} />
            </button>

            {/* Breadcrumb */}
            <div className="crumbs">
                <span>Pousada Mar Azul</span>
                {(breadcrumb ?? []).map((b, i) => (
                    <span key={i}>
                        <span className="sep">/</span>
                        {b.href ? (
                            <Link href={b.href}>{b.label}</Link>
                        ) : (
                            <strong>{b.label}</strong>
                        )}
                    </span>
                ))}
                {!breadcrumb && (
                    <>
                        <span className="sep">/</span>
                        <strong>{title}</strong>
                    </>
                )}
            </div>

            {/* Global search */}
            <div className="search" style={{ marginLeft: 24 }}>
                <Search size={16} />
                <input placeholder="Buscar reserva, hóspede, quarto…" aria-label="Busca global" />
                <kbd>⌘K</kbd>
            </div>

            {/* Right actions */}
            <div className="topbar-right">
                <button className="icon-btn" aria-label="Ajuda">
                    <Help size={18} />
                </button>

                <button className="icon-btn" aria-label="Notificações">
                    <Bell size={18} />
                    <span className="dot" />
                </button>

                {/* Profile dropdown */}
                <div style={{ position: 'relative' }} ref={profileRef}>
                    <button
                        className="profile-trigger"
                        onClick={() => setProfileOpen((v) => !v)}
                        aria-expanded={profileOpen}
                        aria-haspopup="true"
                    >
                        <Avatar name="Mariana Reis" color="purple" size="sm" />
                        <span className="pname">Mariana Reis</span>
                        <ChevronDown size={14} />
                    </button>

                    {profileOpen && (
                        <div className="dropdown" role="menu">
                            <div className="dropdown-head">
                                <div className="pname">Mariana Reis</div>
                                <div className="pmail">mariana@maranzul.com.br</div>
                            </div>
                            <button className="dropdown-item" role="menuitem">
                                <User size={16} /> Meu perfil
                            </button>
                            <button className="dropdown-item" role="menuitem">
                                <Settings size={16} /> Preferências
                            </button>
                            <button className="dropdown-item" role="menuitem">
                                <Help size={16} /> Ajuda & suporte
                            </button>
                            <div className="dropdown-sep" />
                            <button className="dropdown-item danger" role="menuitem" onClick={handleLogout}>
                                <Logout size={16} /> Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
