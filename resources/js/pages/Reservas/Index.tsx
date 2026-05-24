import { useState, useMemo, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { I } from '@/components/ui/Icons';
import type { ReservationStatus, AvatarColor, BookingChannel, RoomType } from '@/types/hotel';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ROOMS: Record<string, { type: RoomType; price: number }> = {
    '101': { type: 'Single', price: 180 },
    '102': { type: 'Single', price: 180 },
    '103': { type: 'Single', price: 180 },
    '201': { type: 'Duplo',  price: 250 },
    '202': { type: 'Duplo',  price: 250 },
    '203': { type: 'Duplo',  price: 250 },
    '301': { type: 'Duplo',  price: 250 },
    '305': { type: 'Single', price: 180 },
    '405': { type: 'Duplo',  price: 250 },
    '501': { type: 'Suíte',  price: 480 },
    '502': { type: 'Suíte',  price: 480 },
    '503': { type: 'Suíte',  price: 480 },
};

type GuestRow = [string, string, AvatarColor];

const GUEST_POOL: GuestRow[] = [
    ['João Silva',       'joao.silva@email.com',       ''],
    ['Maria Santos',     'maria.santos@email.com',     'blue'],
    ['Pedro Costa',      'pedro.costa@email.com',      'green'],
    ['Camila Souza',     'camila.souza@gmail.com',     'orange'],
    ['Eduardo Antunes',  'eduardo@antunes.co',         'purple'],
    ['Mariana Reis',     'mari.reis@outlook.com',      'blue'],
    ['Larissa Mendonça', 'lari.mend@hotmail.com',      'green'],
    ['Rafael Lima',      'rafael.lima@gmail.com',      ''],
    ['Beatriz Castro',   'biacastro@yahoo.com.br',     'purple'],
    ['Felipe Almeida',   'felipe.almeida@email.com',   'orange'],
    ['Juliana Pires',    'ju.pires@gmail.com',         'blue'],
    ['Thiago Moreira',   'thiago.m@email.com',         ''],
    ['Letícia Borges',   'leticia.b@outlook.com',      'green'],
    ['André Cardoso',    'andre.cardoso@gmail.com',    'purple'],
    ['Patrícia Lopes',   'pat.lopes@gmail.com',        'orange'],
    ['Bruno Tavares',    'bruno.tav@hotmail.com',      'blue'],
    ['Sandra Vieira',    'sandra.v@gmail.com',         ''],
    ['Marcos Oliveira',  'marcos.o@email.com',         'green'],
    ['Cláudia Ferreira', 'claudia.fer@email.com',      'purple'],
    ['Renato Barbosa',   'renato.b@gmail.com',         'orange'],
];

const STATUS_LIST: ReservationStatus[] = ['confirmada', 'pendente', 'cancelada', 'realizada', 'no-show'];

const STATUS_LABEL: Record<ReservationStatus, string> = {
    confirmada: 'Confirmada',
    pendente:   'Pendente',
    cancelada:  'Cancelada',
    realizada:  'Realizada',
    'no-show':  'No-show',
};

const CHANNELS: BookingChannel[] = ['Recepção', 'Website', 'App', 'Booking.com', 'Expedia', 'Walk-in'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, '0'); }
function iso(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fromIso(s: string): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}
function fmtBR(n: number) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtShort(d: Date | null) {
    if (!d) return '';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
function fmtLong(d: Date | null) {
    if (!d) return '';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function weekdayShort(d: Date | null) {
    if (!d) return '';
    return d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
}
function initials(name: string) {
    return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// ─── Row type ─────────────────────────────────────────────────────────────────

interface ResRow {
    id: number;
    ref: string;
    guest: string;
    email: string;
    avatarColor: AvatarColor;
    room: string;
    roomType: RoomType;
    pricePerNight: number;
    checkin: Date;
    checkout: Date;
    nights: number;
    guests: number;
    status: ReservationStatus;
    channel: BookingChannel;
    paid: boolean;
    total: number;
    tax: number;
    note: string;
    created: Date;
}

// ─── Deterministic mock data ─────────────────────────────────────────────────

function rand(seed: number) {
    let s = seed;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

const RESERVATIONS: ResRow[] = (() => {
    const r = rand(7);
    const out: ResRow[] = [];
    const base = new Date(2026, 4, 1);
    const roomKeys = Object.keys(ROOMS);

    for (let i = 0; i < 42; i++) {
        const g = GUEST_POOL[Math.floor(r() * GUEST_POOL.length)];
        const roomKey = roomKeys[Math.floor(r() * roomKeys.length)];
        const roomInfo = ROOMS[roomKey];
        const offset = Math.floor(r() * 35) - 8;
        const nights = 1 + Math.floor(r() * 5);
        const ci = new Date(base);
        ci.setDate(base.getDate() + offset);
        const co = new Date(ci);
        co.setDate(ci.getDate() + nights);

        let status: ReservationStatus;
        const rs = r();
        if (co < new Date(2026, 4, 15)) {
            status = rs < 0.85 ? 'realizada' : rs < 0.95 ? 'cancelada' : 'no-show';
        } else if (ci < new Date(2026, 4, 23)) {
            status = rs < 0.7 ? 'confirmada' : rs < 0.85 ? 'pendente' : 'cancelada';
        } else {
            status = rs < 0.55 ? 'confirmada' : rs < 0.85 ? 'pendente' : 'cancelada';
        }

        const channel = CHANNELS[Math.floor(r() * CHANNELS.length)];
        const guests = 1 + Math.floor(r() * 3);
        const paid = rs < 0.6;
        const total = nights * roomInfo.price;
        const tax = Math.round(total * 0.05);

        out.push({
            id: 480 + i,
            ref: `RES-${480 + i}`,
            guest: g[0],
            email: g[1],
            avatarColor: g[2],
            room: roomKey,
            roomType: roomInfo.type,
            pricePerNight: roomInfo.price,
            checkin: ci,
            checkout: co,
            nights,
            guests,
            status,
            channel,
            paid,
            total,
            tax,
            created: new Date(ci.getTime() - (3 + Math.floor(r() * 20)) * 86400000),
            note:
                r() < 0.3
                    ? 'Hóspede solicita berço infantil.'
                    : r() < 0.5
                    ? 'Sem preferências.'
                    : 'Quarto silencioso, longe do elevador.',
        });
    }

    out.sort((a, b) => b.id - a.id);
    return out;
})();

// ─── StatusFilter ─────────────────────────────────────────────────────────────

type StatusFilterId = 'all' | ReservationStatus;

interface StatusFilterProps {
    value: StatusFilterId;
    onChange: (v: StatusFilterId) => void;
    counts: Record<string, number>;
}

function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
    const items: { id: StatusFilterId; label: string; dot: string | null }[] = [
        { id: 'all',        label: 'Todas',       dot: null },
        { id: 'confirmada', label: 'Confirmadas',  dot: 'var(--green)' },
        { id: 'pendente',   label: 'Pendentes',    dot: 'var(--orange)' },
        { id: 'cancelada',  label: 'Canceladas',   dot: 'var(--red)' },
        { id: 'realizada',  label: 'Realizadas',   dot: 'var(--blue)' },
    ];

    return (
        <div className="filter-group">
            <div className="filter-label">Status</div>
            <div className="chip-row">
                {items.map((it) => (
                    <button
                        key={it.id}
                        className={`chip ${value === it.id ? 'active' : ''}`}
                        onClick={() => onChange(it.id)}
                    >
                        {it.dot && <span className="dot" style={{ background: it.dot }} />}
                        {it.label}
                        <span className="count">{counts[it.id] ?? 0}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── DateRangeFilter ──────────────────────────────────────────────────────────

interface DateRangeFilterProps {
    from: string;
    to: string;
    onChange: (v: { from: string; to: string }) => void;
}

function DateRangeFilter({ from, to, onChange }: DateRangeFilterProps) {
    return (
        <div className="filter-group">
            <div className="filter-label">Período</div>
            <div className="date-range">
                <input
                    type="date"
                    className="input"
                    value={from}
                    onChange={(e) => onChange({ from: e.target.value, to })}
                    aria-label="Data início"
                />
                <input
                    type="date"
                    className="input"
                    value={to}
                    onChange={(e) => onChange({ from, to: e.target.value })}
                    aria-label="Data fim"
                />
            </div>
        </div>
    );
}

// ─── SearchFilter ─────────────────────────────────────────────────────────────

interface SearchFilterProps {
    value: string;
    onChange: (v: string) => void;
}

function SearchFilter({ value, onChange }: SearchFilterProps) {
    return (
        <div className="filter-group">
            <div className="filter-label">Buscar</div>
            <div className="input-wrap">
                <span className="ico-left">
                    <I.Search size={15} />
                </span>
                <input
                    className="input has-left has-right"
                    placeholder="Nome, email, #ID, quarto…"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                {value && (
                    <button className="clear-x" onClick={() => onChange('')} aria-label="Limpar busca">
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── ActionMenu ───────────────────────────────────────────────────────────────

interface ActionMenuProps {
    row: ResRow;
    onAction: (id: string, row: ResRow) => void;
}

function ActionMenu({ row, onAction }: ActionMenuProps) {
    const items: { id: string; label: string; icon: keyof typeof I; show: boolean; danger?: boolean }[] = [
        { id: 'view',    label: 'Ver detalhes',          icon: 'Search',       show: true },
        { id: 'edit',    label: 'Editar',                icon: 'Tools',        show: true },
        { id: 'pay',     label: 'Confirmar pagamento',   icon: 'Check',        show: !row.paid && row.status !== 'cancelada' },
        { id: 'confirm', label: 'Confirmar reserva',     icon: 'Check',        show: row.status === 'pendente' },
        { id: 'print',   label: 'Imprimir confirmação',  icon: 'ArrowDownTray', show: true },
        {
            id: 'cancel',
            label: 'Cancelar reserva',
            icon: 'Logout',
            show: !(['cancelada', 'realizada', 'no-show'] as ReservationStatus[]).includes(row.status),
            danger: true,
        },
    ];

    const visible = items.filter((i) => i.show);

    return (
        <div className="action-menu" onClick={(e) => e.stopPropagation()}>
            {visible.map((it, idx) => {
                const IconC = I[it.icon];
                const sep = idx > 0 && it.danger && !visible[idx - 1].danger;
                return (
                    <div key={it.id}>
                        {sep && <div className="action-menu-sep" />}
                        <button
                            className={it.danger ? 'danger' : ''}
                            onClick={() => onAction(it.id, row)}
                        >
                            <IconC size={15} /> {it.label}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface DrawerProps {
    row: ResRow;
    onClose: () => void;
    onAction: (id: string, row: ResRow) => void;
}

function Drawer({ row, onClose, onAction }: DrawerProps) {
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', h);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />
            <aside className="drawer" role="dialog" aria-label="Detalhes da reserva">
                <div className="drawer-head">
                    <div>
                        <h2 className="drawer-title">
                            <span style={{ color: 'var(--ink-3)', fontWeight: 600, marginRight: 8 }} className="mono">
                                #{row.id}
                            </span>
                            {row.guest}
                        </h2>
                        <div className="drawer-sub">
                            <span className={`status ${row.status}`} style={{ marginRight: 8 }}>
                                <span className="dot" />
                                {STATUS_LABEL[row.status]}
                            </span>
                            criada em {fmtLong(row.created)} · via {row.channel}
                        </div>
                    </div>
                    <button className="btn ghost icon" onClick={onClose} aria-label="Fechar">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="drawer-body">
                    <div className="drawer-section">
                        <div className="drawer-section-title">Hóspede</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div
                                className={`avatar ${row.avatarColor}`}
                                style={{ width: 40, height: 40, flex: '0 0 40px', fontSize: 13 }}
                            >
                                {initials(row.guest)}
                            </div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{row.guest}</div>
                                <div style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{row.email}</div>
                            </div>
                        </div>
                    </div>

                    <div className="drawer-section">
                        <div className="drawer-section-title">Estadia</div>
                        <div className="kv-grid">
                            <div className="kv-item">
                                <span className="kv-k">Quarto</span>
                                <span className="kv-v">
                                    <span className="mono">{row.room}</span> · {row.roomType}
                                </span>
                            </div>
                            <div className="kv-item">
                                <span className="kv-k">Hóspedes</span>
                                <span className="kv-v">
                                    {row.guests} pessoa{row.guests === 1 ? '' : 's'}
                                </span>
                            </div>
                            <div className="kv-item">
                                <span className="kv-k">Check-in</span>
                                <span className="kv-v mono">{fmtLong(row.checkin)}</span>
                            </div>
                            <div className="kv-item">
                                <span className="kv-k">Check-out</span>
                                <span className="kv-v mono">{fmtLong(row.checkout)}</span>
                            </div>
                            <div className="kv-item">
                                <span className="kv-k">Noites</span>
                                <span className="kv-v mono">{row.nights}</span>
                            </div>
                            <div className="kv-item">
                                <span className="kv-k">Canal</span>
                                <span className="kv-v">{row.channel}</span>
                            </div>
                        </div>
                    </div>

                    <div className="drawer-section">
                        <div className="drawer-section-title">Pagamento</div>
                        <div className="drawer-total">
                            <div className="drawer-total-row">
                                <span>Diária × {row.nights}</span>
                                <span className="v">R$ {fmtBR(row.total)}</span>
                            </div>
                            <div className="drawer-total-row">
                                <span>Taxa de serviço (5%)</span>
                                <span className="v">R$ {fmtBR(row.tax)}</span>
                            </div>
                            <div className="drawer-total-row big">
                                <span>Total</span>
                                <span className="v">R$ {fmtBR(row.total + row.tax)}</span>
                            </div>
                            <div
                                className="drawer-total-row"
                                style={{
                                    marginTop: 8,
                                    paddingTop: 8,
                                    borderTop: '1px dashed var(--line-strong)',
                                }}
                            >
                                <span>Status</span>
                                <span>
                                    {row.paid ? (
                                        <span className="status confirmada">
                                            <span className="dot" />
                                            Pago
                                        </span>
                                    ) : (
                                        <span className="status pendente">
                                            <span className="dot" />
                                            Aguardando
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="drawer-section">
                        <div className="drawer-section-title">Histórico</div>
                        <div className="timeline">
                            <div className="tl-item">
                                <div className="tl-dot">
                                    <I.Plus size={11} stroke={2.5} />
                                </div>
                                <div className="tl-body">
                                    Reserva criada via <strong>{row.channel}</strong>
                                    <div className="tl-time">{fmtLong(row.created)} · 09:14</div>
                                </div>
                            </div>
                            {row.status === 'confirmada' && (
                                <div className="tl-item">
                                    <div className="tl-dot green">
                                        <I.Check size={12} stroke={3} />
                                    </div>
                                    <div className="tl-body">
                                        Reserva confirmada pelo hóspede
                                        <div className="tl-time">
                                            {fmtLong(new Date(row.created.getTime() + 86400000))} · 14:32
                                        </div>
                                    </div>
                                </div>
                            )}
                            {row.paid && (
                                <div className="tl-item">
                                    <div className="tl-dot green">
                                        <I.Cash size={12} stroke={2.5} />
                                    </div>
                                    <div className="tl-body">
                                        Pagamento confirmado · R$ {fmtBR(row.total + row.tax)}
                                        <div className="tl-time">
                                            {fmtLong(new Date(row.created.getTime() + 2 * 86400000))} · 10:08
                                        </div>
                                    </div>
                                </div>
                            )}
                            {row.status === 'pendente' && (
                                <div className="tl-item">
                                    <div className="tl-dot orange">
                                        <I.Clock size={12} />
                                    </div>
                                    <div className="tl-body">
                                        Aguardando confirmação do hóspede
                                        <div className="tl-time">há 2 dias</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {row.note && (
                        <div className="drawer-section">
                            <div className="drawer-section-title">Observações</div>
                            <div
                                style={{
                                    background: '#fbfbf6',
                                    border: '1px dashed var(--line-strong)',
                                    borderRadius: 8,
                                    padding: '10px 12px',
                                    fontSize: 13,
                                    color: 'var(--ink-2)',
                                    fontStyle: 'italic',
                                }}
                            >
                                "{row.note}"
                            </div>
                        </div>
                    )}
                </div>

                <div className="drawer-foot">
                    <button className="btn" onClick={() => onAction('print', row)}>
                        <I.ArrowDownTray size={14} /> Imprimir
                    </button>
                    {row.status === 'pendente' && (
                        <button className="btn primary" onClick={() => onAction('confirm', row)}>
                            <I.Check size={14} /> Confirmar
                        </button>
                    )}
                    {!(['cancelada', 'realizada', 'no-show'] as ReservationStatus[]).includes(row.status) && (
                        <button
                            className="btn"
                            style={{ color: 'var(--red)', borderColor: 'var(--red-soft)' }}
                            onClick={() => onAction('cancel', row)}
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
    total: number;
    start: number;
    end: number;
}

function Pagination({ page, totalPages, onChange, total, start, end }: PaginationProps) {
    const pages: (number | string)[] = [];
    const max = totalPages;
    const cur = page;
    const win = 1;

    if (max <= 7) {
        for (let i = 1; i <= max; i++) pages.push(i);
    } else {
        pages.push(1);
        if (cur > 2 + win) pages.push('e1');
        for (let i = Math.max(2, cur - win); i <= Math.min(max - 1, cur + win); i++) pages.push(i);
        if (cur < max - 1 - win) pages.push('e2');
        pages.push(max);
    }

    return (
        <div className="pagination">
            <div className="page-info">
                Mostrando <strong>{start}-{end}</strong> de <strong>{total}</strong>{' '}
                {total === 1 ? 'reserva' : 'reservas'}
            </div>
            <div className="page-nav">
                <button
                    className="page-btn"
                    disabled={page === 1}
                    onClick={() => onChange(page - 1)}
                    aria-label="Anterior"
                >
                    <I.ChevronLeft size={14} />
                </button>
                {pages.map((p, i) =>
                    p === 'e1' || p === 'e2' ? (
                        <span key={p} className="page-btn ellipsis">…</span>
                    ) : (
                        <button
                            key={i}
                            className={`page-btn ${page === p ? 'active' : ''}`}
                            onClick={() => onChange(p as number)}
                        >
                            {p}
                        </button>
                    ),
                )}
                <button
                    className="page-btn"
                    disabled={page === totalPages}
                    onClick={() => onChange(page + 1)}
                    aria-label="Próximo"
                >
                    <I.ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}

// ─── Toast type ───────────────────────────────────────────────────────────────

interface ToastState {
    msg: string;
    kind: string;
}

// ─── Sort key ────────────────────────────────────────────────────────────────

type SortKey = 'id' | 'guest' | 'room' | 'checkin' | 'checkout' | 'nights' | 'total' | 'status';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReservasIndex() {
    const [status, setStatus] = useState<StatusFilterId>('all');
    const [dates, setDates] = useState({ from: '', to: '' });
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('id');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const perPage = 10;
    const [menu, setMenu] = useState<number | null>(null);
    const [drawerRow, setDrawerRow] = useState<ResRow | null>(null);
    const [toast, setToast] = useState<ToastState | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

    const showToast = (msg: string, kind = '') => {
        setToast({ msg, kind });
        setTimeout(() => setToast(null), 2600);
    };

    const baseFiltered = useMemo(() => {
        return RESERVATIONS.filter((r) => {
            if (dates.from && r.checkout < (fromIso(dates.from) as Date)) return false;
            if (dates.to && r.checkin > (fromIso(dates.to) as Date)) return false;
            if (search) {
                const q = search.toLowerCase();
                const hay = `${r.guest} ${r.email} ${r.room} ${r.id} ${r.ref}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [dates, search]);

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: baseFiltered.length };
        STATUS_LIST.forEach((s) => { c[s] = 0; });
        baseFiltered.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
        return c;
    }, [baseFiltered]);

    const filtered = useMemo(() => {
        return baseFiltered.filter((r) => status === 'all' || r.status === status);
    }, [baseFiltered, status]);

    const sorted = useMemo(() => {
        const list = [...filtered];
        const dir = sortDir === 'asc' ? 1 : -1;
        list.sort((a, b) => {
            let av: number | string, bv: number | string;
            switch (sortKey) {
                case 'id':       av = a.id;                   bv = b.id;                   break;
                case 'guest':    av = a.guest;                bv = b.guest;                break;
                case 'room':     av = a.room;                 bv = b.room;                 break;
                case 'checkin':  av = a.checkin.getTime();    bv = b.checkin.getTime();    break;
                case 'checkout': av = a.checkout.getTime();   bv = b.checkout.getTime();   break;
                case 'nights':   av = a.nights;               bv = b.nights;               break;
                case 'total':    av = a.total;                bv = b.total;                break;
                case 'status':   av = a.status;               bv = b.status;               break;
                default:         av = a.id;                   bv = b.id;
            }
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return 0;
        });
        return list;
    }, [filtered, sortKey, sortDir]);

    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));

    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages]);

    const start = total === 0 ? 0 : (page - 1) * perPage + 1;
    const end = Math.min(total, page * perPage);
    const pageRows = sorted.slice(start - 1, end);

    useEffect(() => {
        if (!menu) return;
        const h = (e: MouseEvent) => {
            const target = e.target as Element;
            if (!target.closest('.action-menu') && !target.closest('.action-btn')) setMenu(null);
        };
        window.addEventListener('mousedown', h);
        return () => window.removeEventListener('mousedown', h);
    }, [menu]);

    const onSort = (k: SortKey) => {
        if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        else { setSortKey(k); setSortDir('asc'); }
    };

    const clearFilters = () => {
        setStatus('all');
        setDates({ from: '', to: '' });
        setSearch('');
        setPage(1);
    };

    const filterCount =
        (status !== 'all' ? 1 : 0) +
        (dates.from || dates.to ? 1 : 0) +
        (search ? 1 : 0);

    const handleAction = (id: string, row: ResRow) => {
        setMenu(null);
        switch (id) {
            case 'view':
                setDrawerRow(row);
                break;
            case 'edit':
                showToast(`Editando reserva #${row.id}`);
                break;
            case 'confirm':
                showToast(`Reserva #${row.id} confirmada`, 'success');
                break;
            case 'pay':
                showToast(`Pagamento de R$ ${fmtBR(row.total + row.tax)} confirmado`, 'success');
                break;
            case 'print':
                showToast(`Confirmação #${row.id} enviada para impressão`);
                break;
            case 'cancel':
                if (window.confirm(`Cancelar a reserva #${row.id} de ${row.guest}?`)) {
                    showToast(`Reserva #${row.id} cancelada`, 'warn');
                }
                break;
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        showToast('Atualizando…');
        setTimeout(() => {
            setRefreshing(false);
            showToast('Dados atualizados', 'success');
        }, 900);
    };

    interface SortableThProps {
        k: SortKey;
        children: React.ReactNode;
        style?: React.CSSProperties;
    }

    const SortableTh = ({ k, children, style }: SortableThProps) => (
        <th
            className={`sortable ${sortKey === k ? 'sorted' : ''}`}
            onClick={() => onSort(k)}
            style={style}
        >
            {children}
            <span className="sort-arrow">{sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
        </th>
    );

    return (
        <AppLayout
            title="Gerenciar Reservas"
            breadcrumb={[{ label: 'Reservas' }]}
        >
            {/* Page head */}
            <div className="page-head">
                <div>
                    <h1 className="page-title">Gerenciar Reservas</h1>
                    <div className="page-sub">
                        {RESERVATIONS.length} reservas registradas no sistema ·{' '}
                        {counts.pendente || 0} pendente{(counts.pendente || 0) === 1 ? '' : 's'}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={onRefresh} disabled={refreshing}>
                        <span
                            className={refreshing ? 'spin' : ''}
                            style={{ display: 'inline-grid', placeItems: 'center' }}
                        >
                            <I.Refresh size={15} />
                        </span>
                        Atualizar
                    </button>
                    <Link href="/reservas/nova" className="btn primary">
                        <I.Plus size={15} stroke={2.5} /> Nova Reserva
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="filters">
                <StatusFilter
                    value={status}
                    onChange={(v) => { setStatus(v); setPage(1); }}
                    counts={counts}
                />
                <DateRangeFilter
                    from={dates.from}
                    to={dates.to}
                    onChange={(v) => { setDates(v); setPage(1); }}
                />
                <SearchFilter
                    value={search}
                    onChange={(v) => { setSearch(v); setPage(1); }}
                />
                <button
                    className="btn ghost filter-clear"
                    disabled={filterCount === 0}
                    onClick={clearFilters}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                    Limpar filtros{filterCount > 0 ? ` (${filterCount})` : ''}
                </button>
            </div>

            {/* Table card */}
            <div className={`table-card ${density === 'compact' ? 'dense' : ''}`}>
                <div className="table-meta">
                    <div className="left">
                        <span>
                            <strong>{total}</strong> resultado{total === 1 ? '' : 's'}
                        </span>
                        {filterCount > 0 && (
                            <span className="bulk">filtros: {filterCount}</span>
                        )}
                    </div>
                    <div className="density-toggle" role="tablist">
                        <button
                            className={density === 'comfortable' ? 'active' : ''}
                            onClick={() => setDensity('comfortable')}
                        >
                            Confortável
                        </button>
                        <button
                            className={density === 'compact' ? 'active' : ''}
                            onClick={() => setDensity('compact')}
                        >
                            Compacto
                        </button>
                    </div>
                </div>

                {total === 0 ? (
                    <div className="empty">
                        <div className="empty-ico">
                            <I.Search size={24} />
                        </div>
                        <h3>Nenhuma reserva encontrada</h3>
                        <p>Tente ajustar os filtros ou limpar a busca.</p>
                        <button className="btn" onClick={clearFilters}>
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="table-scroll">
                            <table className="reservations">
                                <thead>
                                    <tr>
                                        <SortableTh k="id" style={{ paddingLeft: 18 }}>#</SortableTh>
                                        <SortableTh k="guest">Hóspede</SortableTh>
                                        <th>Email</th>
                                        <SortableTh k="room">Quarto</SortableTh>
                                        <SortableTh k="checkin">Check-in</SortableTh>
                                        <SortableTh k="checkout">Check-out</SortableTh>
                                        <SortableTh k="status">Status</SortableTh>
                                        <SortableTh k="nights" style={{ textAlign: 'center' }}>Noites</SortableTh>
                                        <SortableTh k="total" style={{ textAlign: 'right' }}>Total</SortableTh>
                                        <th style={{ textAlign: 'right', paddingRight: 16 }} />
                                    </tr>
                                </thead>
                                <tbody>
                                    {pageRows.map((r) => (
                                        <tr key={r.id} onClick={() => setDrawerRow(r)}>
                                            <td className="cell-id" style={{ paddingLeft: 18 }}>
                                                #{r.id}
                                            </td>
                                            <td>
                                                <div className="cell-guest">
                                                    <div className={`avatar ${r.avatarColor}`}>
                                                        {initials(r.guest)}
                                                    </div>
                                                    <div>
                                                        <div className="cell-name">{r.guest}</div>
                                                        <div className="cell-name-sub channel">
                                                            via {r.channel}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="cell-email">{r.email}</td>
                                            <td>
                                                <div className="cell-room">
                                                    <strong>{r.room}</strong>
                                                    <span className="type-tag">{r.roomType}</span>
                                                </div>
                                            </td>
                                            <td className="cell-date">
                                                {fmtShort(r.checkin)}
                                                <small style={{ textTransform: 'capitalize' }}>
                                                    {weekdayShort(r.checkin)}
                                                </small>
                                            </td>
                                            <td className="cell-date">
                                                {fmtShort(r.checkout)}
                                                <small style={{ textTransform: 'capitalize' }}>
                                                    {weekdayShort(r.checkout)}
                                                </small>
                                            </td>
                                            <td>
                                                <span className={`status ${r.status}`}>
                                                    <span className="dot" />
                                                    {STATUS_LABEL[r.status]}
                                                </span>
                                            </td>
                                            <td className="cell-num">{r.nights}</td>
                                            <td className="cell-total" style={{ textAlign: 'right' }}>
                                                R$ {fmtBR(r.total + r.tax)}
                                            </td>
                                            <td className="cell-actions">
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <button
                                                        className="action-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setMenu(menu === r.id ? null : r.id);
                                                        }}
                                                        aria-label="Ações"
                                                    >
                                                        <svg
                                                            width="18"
                                                            height="18"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <circle cx="12" cy="5" r="1.5" />
                                                            <circle cx="12" cy="12" r="1.5" />
                                                            <circle cx="12" cy="19" r="1.5" />
                                                        </svg>
                                                    </button>
                                                    {menu === r.id && (
                                                        <ActionMenu row={r} onAction={handleAction} />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="cards-list">
                            {pageRows.map((r) => (
                                <div key={r.id} className="res-card" onClick={() => setDrawerRow(r)}>
                                    <div className="top">
                                        <div className="guest-block">
                                            <div className={`avatar ${r.avatarColor}`}>
                                                {initials(r.guest)}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div className="id-line">
                                                    #{r.id} · {r.channel}
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: 14 }}>
                                                    {r.guest}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 11.5,
                                                        color: 'var(--ink-3)',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: 200,
                                                    }}
                                                >
                                                    {r.email}
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`status ${r.status}`}>
                                            <span className="dot" />
                                            {STATUS_LABEL[r.status]}
                                        </span>
                                    </div>
                                    <div className="grid2">
                                        <div>
                                            <div className="k">Quarto</div>
                                            <div className="v">
                                                {r.room} ·{' '}
                                                <span style={{ fontFamily: 'Manrope', fontWeight: 500 }}>
                                                    {r.roomType}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="k">Total</div>
                                            <div className="v">R$ {fmtBR(r.total + r.tax)}</div>
                                        </div>
                                        <div>
                                            <div className="k">Check-in</div>
                                            <div className="v">{fmtShort(r.checkin)}</div>
                                        </div>
                                        <div>
                                            <div className="k">Check-out</div>
                                            <div className="v">{fmtShort(r.checkout)}</div>
                                        </div>
                                    </div>
                                    <div className="foot">
                                        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                                            {r.nights} noite{r.nights === 1 ? '' : 's'}
                                        </span>
                                        <div style={{ position: 'relative' }}>
                                            <button
                                                className="action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setMenu(menu === r.id ? null : r.id);
                                                }}
                                                aria-label="Ações"
                                            >
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <circle cx="12" cy="5" r="1.5" />
                                                    <circle cx="12" cy="12" r="1.5" />
                                                    <circle cx="12" cy="19" r="1.5" />
                                                </svg>
                                            </button>
                                            {menu === r.id && (
                                                <ActionMenu row={r} onAction={handleAction} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onChange={setPage}
                            total={total}
                            start={start}
                            end={end}
                        />
                    </>
                )}
            </div>

            {/* Drawer */}
            {drawerRow && (
                <Drawer
                    row={drawerRow}
                    onClose={() => setDrawerRow(null)}
                    onAction={handleAction}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.kind || ''}`}>
                    {toast.kind === 'error' || toast.kind === 'warn' ? (
                        <I.Warning size={16} />
                    ) : (
                        <I.Check size={16} stroke={2.5} />
                    )}
                    {toast.msg}
                </div>
            )}
        </AppLayout>
    );
}
