import { useState, useEffect, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { I } from '@/components/ui/Icons';
import type { ReservationStatus, AvatarColor, BookingChannel, RoomType } from '@/types/hotel';

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
function fromIso(s: string): Date | null {
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
}
function fmtBR(n: number) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtShort(d: string | null) {
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
function fmtLong(d: string | null) {
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function weekdayShort(d: string | null) {
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
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
    checkin: string;
    checkout: string;
    nights: number;
    guests: number;
    status: ReservationStatus;
    channel: BookingChannel;
    paid: boolean;
    total: number;
    tax: number;
    note: string;
    created: string;
}

interface PaginationData {
    current_page: number;
    total: number;
    per_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
}

interface PageProps {
    reservations: ResRow[];
    pagination: PaginationData;
    status_counts: Record<string, number>;
}

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
        { id: 'view',    label: 'Ver detalhes',          icon: 'Search',        show: true },
        { id: 'quick-edit', label: 'Editar datas/status', icon: 'Tools',         show: row.status === 'pendente' || row.status === 'confirmada' },
        { id: 'pay',     label: 'Confirmar pagamento',   icon: 'Cash',          show: !row.paid && !(['cancelada', 'no-show'] as ReservationStatus[]).includes(row.status) },
        { id: 'confirm', label: 'Confirmar reserva',     icon: 'Check',         show: row.status === 'pendente' },
        { id: 'print',   label: 'Imprimir confirmação',  icon: 'ArrowDownTray', show: true },
        {
            id: 'no-show',
            label: 'Marcar como No-show',
            icon: 'Warning',
            show: !(['cancelada', 'realizada', 'no-show'] as ReservationStatus[]).includes(row.status),
            danger: true,
        },
        {
            id: 'cancel',
            label: 'Cancelar reserva',
            icon: 'Logout',
            show: row.status === 'pendente' || row.status === 'confirmada',
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

// ─── EditModal ───────────────────────────────────────────────────────────────

function EditModal({ row, onSync, onClose }: { row: ResRow; onSync: any; onClose: () => void }) {
    const [checkin, setCheckin] = useState(row.checkin || '');
    const [checkout, setCheckout] = useState(row.checkout || '');
    const [status, setStatus] = useState<ReservationStatus>(row.status || 'pendente');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.patch(`/reservas/${row.id}/quick-update`, {
            checkin,
            checkout,
            status,
        }, {
            onSuccess: () => {
                onClose();
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <div>
                        <div className="modal-title">Editar Reserva #{row.id}</div>
                        <div className="modal-sub">{row.guest} · {row.room}</div>
                    </div>
                    <button className="btn ghost icon sm" onClick={onClose} aria-label="Fechar">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-grid">
                            <div className="field">
                                <label className="label">Check-in</label>
                                <input type="date" className="input" value={checkin} onChange={e => setCheckin(e.target.value)} required />
                            </div>
                            <div className="field">
                                <label className="label">Check-out</label>
                                <input type="date" className="input" value={checkout} onChange={e => setCheckout(e.target.value)} required />
                            </div>
                        </div>
                        <div className="field" style={{ marginTop: 16 }}>
                            <label className="label">Status</label>
                            <div className="radio-row">
                                <button type="button" className={`radio-btn ${status === 'confirmada' ? 'active' : ''}`} onClick={() => setStatus('confirmada')}>
                                    <span className="dot" /> Confirmada
                                </button>
                                <button type="button" className={`radio-btn ${status === 'pendente' ? 'active' : ''}`} onClick={() => setStatus('pendente')}>
                                    <span className="dot" /> Pendente
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="modal-foot">
                         <div className="right">
                            <button type="button" className="btn" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn primary" disabled={submitting}>
                                {submitting ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
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
                                            {fmtLong(new Date(new Date(row.created).getTime() + 86400000).toISOString().split('T')[0])} · 14:32
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
                                            {fmtLong(new Date(new Date(row.created).getTime() + 2 * 86400000).toISOString().split('T')[0])} · 10:08
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
                    {(row.status === 'pendente' || row.status === 'confirmada') && (
                        <button className="btn" onClick={() => onAction('quick-edit', row)}>
                            <I.Tools size={14} /> Editar
                        </button>
                    )}
                    {row.status === 'pendente' && (
                        <button className="btn primary" onClick={() => onAction('confirm', row)}>
                            <I.Check size={14} /> Confirmar
                        </button>
                    )}
                    {!row.paid && !(['cancelada', 'no-show'] as ReservationStatus[]).includes(row.status) && (
                        <button className="btn success" onClick={() => onAction('pay', row)}>
                            <I.Cash size={14} /> Pago
                        </button>
                    )}
                    {(row.status === 'pendente' || row.status === 'confirmada') && (
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

export default function ReservasIndex({ reservations = [], pagination = {} as PaginationData, status_counts = {} }: PageProps) {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

    const [status, setStatus] = useState<StatusFilterId>((urlParams.get('status') as StatusFilterId) || 'all');
    const [dates, setDates] = useState({
        from: urlParams.get('from') || '',
        to: urlParams.get('to') || '',
    });
    const [search, setSearch] = useState(urlParams.get('search') || '');
    const [sortKey, setSortKey] = useState<SortKey>((urlParams.get('sort_key') as SortKey) || 'id');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>((urlParams.get('sort_dir') as 'asc' | 'desc') || 'desc');
    const [page, setPage] = useState(parseInt(urlParams.get('page') || '1'));
    const [menu, setMenu] = useState<number | null>(null);
    const [drawerRow, setDrawerRow] = useState<ResRow | null>(null);
    const [editRow, setEditRow] = useState<ResRow | null>(null);
    const [toast, setToast] = useState<ToastState | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');

    const showToast = (msg: string, kind = '') => {
        setToast({ msg, kind });
        setTimeout(() => setToast(null), 2600);
    };

    const navigateWithFilters = (newStatus?: StatusFilterId, newDates?: typeof dates, newSearch?: string, newSortKey?: SortKey, newSortDir?: 'asc' | 'desc', newPage?: number) => {
        const params = new URLSearchParams();

        const s = newStatus !== undefined ? newStatus : status;
        const d = newDates !== undefined ? newDates : dates;
        const q = newSearch !== undefined ? newSearch : search;
        const sk = newSortKey !== undefined ? newSortKey : sortKey;
        const sd = newSortDir !== undefined ? newSortDir : sortDir;
        const p = newPage !== undefined ? newPage : 1;

        if (s !== 'all') params.set('status', s);
        if (d.from) params.set('from', d.from);
        if (d.to) params.set('to', d.to);
        if (q) params.set('search', q);
        if (sk !== 'id') params.set('sort_key', sk);
        if (sd !== 'desc') params.set('sort_dir', sd);
        if (p > 1) params.set('page', String(p));

        const queryString = params.toString();
        window.location.href = `/reservas${queryString ? '?' + queryString : ''}`;
    };

    const total = pagination.total || 0;
    const totalPages = pagination.last_page || 1;
    const pageRows = reservations;

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
        const newDir = k === sortKey && sortDir === 'asc' ? 'desc' : 'asc';
        navigateWithFilters(undefined, undefined, undefined, k, newDir, 1);
    };

    const clearFilters = () => {
        window.location.href = '/reservas';
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
            case 'quick-edit':
                setEditRow(row);
                break;
            case 'edit':
                router.visit(`/reservas/${row.id}/edit`);
                break;
            case 'confirm':
                setDrawerRow(null);
                router.patch(`/reservas/${row.id}/confirm`, {}, {
                    onSuccess: () => showToast(`Reserva #${row.id} confirmada`, 'success'),
                    onError: () => showToast('Erro ao confirmar reserva', 'error'),
                });
                break;
            case 'pay':
                setDrawerRow(null);
                router.patch(`/reservas/${row.id}/pay`, {}, {
                    onSuccess: () => showToast(`Pagamento da reserva #${row.id} confirmado`, 'success'),
                    onError: () => showToast('Erro ao confirmar pagamento', 'error'),
                });
                break;
            case 'no-show':
                if (window.confirm(`Marcar a reserva #${row.id} de ${row.guest} como no-show?`)) {
                    setDrawerRow(null);
                    router.patch(`/reservas/${row.id}/no-show`, {}, {
                        onSuccess: () => showToast(`Reserva #${row.id} marcada como no-show`, 'warn'),
                        onError: () => showToast('Erro ao atualizar reserva', 'error'),
                    });
                }
                break;
            case 'print':
                showToast(`Confirmação #${row.id} enviada para impressão`);
                break;
            case 'cancel':
                if (window.confirm(`Cancelar a reserva #${row.id} de ${row.guest}?`)) {
                    setDrawerRow(null);
                    router.patch(`/reservas/${row.id}/cancel`, {}, {
                        onSuccess: () => showToast(`Reserva #${row.id} cancelada`, 'warn'),
                        onError: () => showToast('Erro ao cancelar reserva', 'error'),
                    });
                }
                break;
        }
    };

    const handleStatusChange = (v: StatusFilterId) => {
        navigateWithFilters(v, undefined, undefined, undefined, undefined, 1);
    };

    const handleDateChange = (v: typeof dates) => {
        navigateWithFilters(undefined, v, undefined, undefined, undefined, 1);
    };

    const handleSearchChange = (v: string) => {
        navigateWithFilters(undefined, undefined, v, undefined, undefined, 1);
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
                        {total} reservas registradas no sistema ·{' '}
                        {status_counts.pendente || 0} pendente{(status_counts.pendente || 0) === 1 ? '' : 's'}
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
                    <Link href="/reservas/create" className="btn primary">
                        <I.Plus size={15} stroke={2.5} /> Nova Reserva
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="filters">
                <StatusFilter
                    value={status}
                    onChange={handleStatusChange}
                    counts={status_counts}
                />
                <DateRangeFilter
                    from={dates.from}
                    to={dates.to}
                    onChange={handleDateChange}
                />
                <SearchFilter
                    value={search}
                    onChange={handleSearchChange}
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
                                        <tr
                                            key={r.id}
                                            onClick={() => setDrawerRow(r)}
                                            role="button"
                                            tabIndex={0}
                                            style={{ cursor: 'pointer' }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setDrawerRow(r);
                                                }
                                            }}
                                        >
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
                                <div
                                    key={r.id}
                                    className="res-card"
                                    onClick={() => setDrawerRow(r)}
                                    role="button"
                                    tabIndex={0}
                                    style={{ cursor: 'pointer' }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            setDrawerRow(r);
                                        }
                                    }}
                                >
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
                            page={pagination.current_page || 1}
                            totalPages={totalPages}
                            onChange={(p) => navigateWithFilters(undefined, undefined, undefined, undefined, undefined, p)}
                            total={total}
                            start={pagination.from || 0}
                            end={pagination.to || 0}
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

            {/* Quick Edit Modal */}
            {editRow && (
                <EditModal
                    row={editRow}
                    onSync={() => {}}
                    onClose={() => setEditRow(null)}
                />
            )}

            {/* Quick Edit Modal */}
            {editRow && (
                <EditModal
                    row={editRow}
                    onSync={() => {}}
                    onClose={() => setEditRow(null)}
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
