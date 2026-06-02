import { useState, useMemo, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { I } from '@/components/ui/Icons';
import type { TeamMember, TeamRole, TeamMemberStatus, Shift, AvatarColor, EquipeProps } from '@/types/hotel';

// ---------- Static data ----------

const ROLES: Record<TeamRole, { label: string; color: string }> = {
    recepcao:     { label: 'Recepção',     color: 'blue' },
    housekeeping: { label: 'Housekeeping', color: 'green' },
    gerente:      { label: 'Gerente',      color: 'purple' },
    manutencao:   { label: 'Manutenção',   color: 'orange' },
    cozinha:      { label: 'Cozinha',      color: 'red' },
};

const SHIFTS: Record<Shift, { code: string; label: string; range: string }> = {
    mat:    { code: 'Mat',   label: 'Matutino',   range: '08–16h' },
    vesp:   { code: 'Vesp',  label: 'Vespertino', range: '16–00h' },
    noite:  { code: 'Noite', label: 'Noturno',    range: '00–08h' },
    off:    { code: 'OFF',   label: 'Folga',      range: '' },
    ferias: { code: 'Fer.',  label: 'Férias',     range: '' },
};

const SHIFT_ORDER: Shift[] = ['mat', 'vesp', 'noite', 'off', 'ferias'];

const WEEKDAYS = [
    { short: 'Seg', weekend: false },
    { short: 'Ter', weekend: false },
    { short: 'Qua', weekend: false },
    { short: 'Qui', weekend: false },
    { short: 'Sex', weekend: false },
    { short: 'Sáb', weekend: true },
    { short: 'Dom', weekend: true },
];


// ---------- Helpers ----------

function initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function fmtDate(s: string): string {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
}

function shiftLabel(m: TeamMember): string {
    if (!m.shifts.length) return '—';
    return m.shifts.map(x => SHIFTS[x]?.code).filter(Boolean).join(' · ');
}

function shiftRange(m: TeamMember): string {
    return m.shifts.map(x => SHIFTS[x]?.range).filter(Boolean).join(' / ');
}

const onlyDigits = (s: string) => (s || '').replace(/\D/g, '');

function fmtCpf(s: string): string {
    const d = onlyDigits(s).slice(0, 11);
    if (d.length > 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
    if (d.length > 6) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    if (d.length > 3) return `${d.slice(0,3)}.${d.slice(3)}`;
    return d;
}

function fmtPhone(s: string): string {
    const d = onlyDigits(s).slice(0, 13);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `+${d.slice(0,2)} ${d.slice(2)}`;
    if (d.length <= 9) return `+${d.slice(0,2)} ${d.slice(2,4)} ${d.slice(4)}`;
    return `+${d.slice(0,2)} ${d.slice(2,4)} ${d.slice(4,9)}-${d.slice(9,13)}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CPF_RE = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// ---------- Types for form ----------

type MemberForm = {
    id?: number;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    admission: string;
    role: TeamRole;
    status: TeamMemberStatus;
    shifts: Shift[];
    salary: string | number;
    avatarColor: AvatarColor;
    schedule: Shift[];
    _delete?: boolean;
};

// ---------- Components ----------

function StatCard({ tone, icon, value, label, delta }: { tone: string; icon: keyof typeof I; value: string | number; label: string; delta?: string }) {
    const IconC = I[icon];
    return (
        <div className="stat">
            <div className={`stat-ico ${tone}`}><IconC size={20} stroke={2} /></div>
            <div>
                <div className="stat-v">{value}</div>
                <div className="stat-k">
                    {label}
                    {delta && <span className="stat-delta">▲ {delta}</span>}
                </div>
            </div>
        </div>
    );
}

function ActionMenu({ row, onAction }: { row: TeamMember; onAction: (action: string, row: TeamMember) => void }) {
    return (
        <div className="action-menu" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onAction('edit', row)}><I.Tools size={15} /> Editar</button>
            <button onClick={() => onAction('view', row)}><I.User size={15} /> Ver detalhes</button>
            <button onClick={() => onAction('schedule', row)}><I.Calendar size={15} /> Editar escala</button>
            <button onClick={() => onAction('print', row)}><I.ArrowDownTray size={15} /> Gerar recibo</button>
            <div className="action-menu-sep"></div>
            {row.status !== 'inativo'
                ? <button className="danger" onClick={() => onAction('deactivate', row)}><I.Logout size={15} /> Desativar</button>
                : <button onClick={() => onAction('activate', row)}><I.Check size={15} /> Reativar</button>}
        </div>
    );
}

function StaffCard({ m, menuOpen, setMenuOpen, onAction }: { m: TeamMember; menuOpen: number | null; setMenuOpen: (id: number | null) => void; onAction: (action: string, row: TeamMember) => void }) {
    return (
        <div className="staff-card">
            <div className={`staff-cover ${ROLES[m.role].color}`}></div>
            <div className="staff-top">
                <div className={`avatar ${m.avatarColor}`}>{initials(m.name)}</div>
                <div className="staff-act">
                    <button className="action-btn" onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)} aria-label="Ações">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                        </svg>
                    </button>
                    {menuOpen === m.id && <ActionMenu row={m} onAction={onAction} />}
                </div>
            </div>
            <div className="staff-body">
                <div className="staff-name">{m.name}</div>
                <div className="staff-role">
                    <span className={`role-dot ${m.role}`}></span>{ROLES[m.role].label}
                </div>
                <div className="staff-kv">
                    <div className="kv">
                        <span className="k">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                        </span>
                        <span className="v">{m.email}</span>
                    </div>
                    <div className="kv">
                        <span className="k">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2 1a12 12 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>
                        </span>
                        <span className="v mono">{m.phone}</span>
                    </div>
                    <div className="kv">
                        <span className="k"><I.Calendar size={12} /></span>
                        <span className="v">Admissão: <span className="mono">{fmtDate(m.admission)}</span></span>
                    </div>
                </div>
            </div>
            <div className="staff-foot">
                <span className={`status-chip ${m.status}`}>
                    <span className="dot"></span>
                    {m.status === 'ativo' ? 'Ativo' : m.status === 'ferias' ? 'Férias' : 'Inativo'}
                </span>
                <span className="shift-pill">{shiftLabel(m)}</span>
            </div>
            <div className="staff-actions-row">
                <button className="btn sm" onClick={() => onAction('edit', m)}><I.Tools size={13} /> Editar</button>
                <button className="btn sm" onClick={() => onAction('schedule', m)}><I.Calendar size={13} /> Escala</button>
            </div>
        </div>
    );
}

function StaffTable({ rows, menuOpen, setMenuOpen, onAction }: { rows: TeamMember[]; menuOpen: number | null; setMenuOpen: (id: number | null) => void; onAction: (action: string, row: TeamMember) => void }) {
    return (
        <div className="table-card">
            <div className="table-scroll">
                <table className="staff-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: 18 }}>Colaborador</th>
                            <th>Função</th>
                            <th>Contato</th>
                            <th>Admissão</th>
                            <th>Turno</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right', paddingRight: 16 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map(m => (
                            <tr key={m.id}>
                                <td style={{ paddingLeft: 18 }}>
                                    <div className="cell-name-line">
                                        <div className={`avatar sm ${m.avatarColor}`}>{initials(m.name)}</div>
                                        <div>
                                            <div className="cell-name">{m.name}</div>
                                            <div className="cell-sub mono">CPF {m.cpf}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                        <span className={`role-dot ${m.role}`}></span>
                                        {ROLES[m.role].label}
                                    </span>
                                </td>
                                <td>
                                    <div>{m.email}</div>
                                    <div className="cell-sub mono">{m.phone}</div>
                                </td>
                                <td className="mono">{fmtDate(m.admission)}</td>
                                <td>
                                    <span className="shift-pill">{shiftLabel(m)}</span>
                                    <div className="cell-sub" style={{ marginTop: 2 }}>{shiftRange(m)}</div>
                                </td>
                                <td>
                                    <span className={`status-chip ${m.status}`}>
                                        <span className="dot"></span>
                                        {m.status === 'ativo' ? 'Ativo' : m.status === 'ferias' ? 'Férias' : 'Inativo'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: 16 }}>
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <button className="action-btn"
                                                onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === m.id ? null : m.id); }}
                                                aria-label="Ações">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                                            </svg>
                                        </button>
                                        {menuOpen === m.id && <ActionMenu row={m} onAction={onAction} />}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function MemberModal({ initial, onClose, onSave }: { initial: TeamMember | null; onClose: () => void; onSave: (form: MemberForm) => void }) {
    const isEdit = !!initial;
    const [form, setForm] = useState<MemberForm>(initial
        ? { ...initial, salary: initial.salary ?? '' }
        : { name: '', email: '', phone: '', cpf: '', admission: '', role: 'housekeeping', status: 'ativo', shifts: ['mat'], salary: '', avatarColor: 'blue', schedule: ['mat','mat','mat','mat','mat','off','off'] }
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        document.body.style.overflow = 'hidden';
        return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
    }, [onClose]);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name || form.name.trim().length < 3) e.name = 'Nome muito curto';
        if (!EMAIL_RE.test(form.email || '')) e.email = 'Email inválido';
        if (onlyDigits(form.phone).length < 10) e.phone = 'Telefone incompleto';
        if (!CPF_RE.test(form.cpf || '')) e.cpf = 'CPF incompleto';
        if (!form.admission) e.admission = 'Informe a data';
        if (!form.shifts.length) e.shifts = 'Selecione ao menos 1 turno';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            onSave({ ...form, salary: Number(form.salary) || 0 });
        }, 800);
    };

    const toggleShift = (s: Shift) => {
        const has = form.shifts.includes(s);
        setForm({ ...form, shifts: has ? form.shifts.filter(x => x !== s) : [...form.shifts, s] });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={isEdit ? 'Editar colaborador' : 'Adicionar colaborador'}>
                <div className="modal-head">
                    <div>
                        <h2 className="modal-title">{isEdit ? 'Editar colaborador' : 'Adicionar colaborador'}</h2>
                        <div className="modal-sub">{isEdit ? `Atualize os dados de ${initial!.name}` : 'Preencha os dados do novo colaborador'}</div>
                    </div>
                    <button className="btn ghost icon" onClick={onClose} aria-label="Fechar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="form-grid">
                        <div className="form-col">
                            <div className={`field ${errors.name ? 'error' : ''}`}>
                                <label className="label">Nome completo <span className="req">*</span></label>
                                <input className="input" placeholder="Ex: João da Silva" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                {errors.name && <div className="error-msg"><I.Warning size={11} /> {errors.name}</div>}
                            </div>
                            <div className={`field ${errors.email ? 'error' : ''}`}>
                                <label className="label">Email <span className="req">*</span></label>
                                <input type="email" className="input" placeholder="nome@hotel.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                {errors.email && <div className="error-msg"><I.Warning size={11} /> {errors.email}</div>}
                            </div>
                            <div className={`field ${errors.phone ? 'error' : ''}`}>
                                <label className="label">Telefone <span className="req">*</span></label>
                                <input className="input" placeholder="+55 11 99999-9999" value={form.phone} onChange={(e) => setForm({ ...form, phone: fmtPhone(e.target.value) })} />
                                {errors.phone && <div className="error-msg"><I.Warning size={11} /> {errors.phone}</div>}
                            </div>
                            <div className={`field ${errors.cpf ? 'error' : ''}`}>
                                <label className="label">CPF <span className="req">*</span></label>
                                <input className="input mono" placeholder="000.000.000-00" inputMode="numeric" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: fmtCpf(e.target.value) })} />
                                {errors.cpf && <div className="error-msg"><I.Warning size={11} /> {errors.cpf}</div>}
                            </div>
                            <div className={`field ${errors.admission ? 'error' : ''}`}>
                                <label className="label">Data de admissão <span className="req">*</span></label>
                                <input type="date" className="input" value={form.admission} onChange={(e) => setForm({ ...form, admission: e.target.value })} />
                                {errors.admission && <div className="error-msg"><I.Warning size={11} /> {errors.admission}</div>}
                            </div>
                        </div>

                        <div className="form-col">
                            <div className="field">
                                <label className="label">Função <span className="req">*</span></label>
                                <div className="radio-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                    {(Object.entries(ROLES) as [TeamRole, { label: string; color: string }][]).map(([key, r]) => (
                                        <button key={key} type="button" className={`radio-btn ${form.role === key ? 'active' : ''}`} onClick={() => setForm({ ...form, role: key })}>
                                            <span className="dot"></span> {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Status <span className="req">*</span></label>
                                <div className="radio-grid">
                                    {(['ativo','ferias','inativo'] as TeamMemberStatus[]).map(s => (
                                        <button key={s} type="button" className={`radio-btn ${form.status === s ? 'active' : ''}`} onClick={() => setForm({ ...form, status: s })}>
                                            <span className="dot"></span>
                                            {s === 'ativo' ? 'Ativo' : s === 'ferias' ? 'Férias' : 'Inativo'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={`field ${errors.shifts ? 'error' : ''}`}>
                                <label className="label">Turnos <span className="req">*</span> <span className="opt">marque um ou mais</span></label>
                                <div className="check-grid">
                                    {(['mat','vesp','noite'] as Shift[]).map(s => (
                                        <button key={s} type="button" className={`check-btn ${form.shifts.includes(s) ? 'active' : ''}`} onClick={() => toggleShift(s)}>
                                            <span className="box">
                                                {form.shifts.includes(s) && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>}
                                            </span>
                                            {SHIFTS[s].label}
                                        </button>
                                    ))}
                                </div>
                                {errors.shifts && <div className="error-msg"><I.Warning size={11} /> {errors.shifts}</div>}
                            </div>

                            <div className="field">
                                <label className="label">Salário base <span className="opt">opcional</span></label>
                                <div className="input-wrap">
                                    <span className="ico-left mono" style={{ fontWeight: 700, color: 'var(--ink-3)' }}>R$</span>
                                    <input className="input has-left mono" placeholder="0,00" inputMode="decimal"
                                           value={form.salary}
                                           onChange={(e) => setForm({ ...form, salary: e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.') })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-foot">
                    <button className="btn ghost" onClick={onClose}>Cancelar</button>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {isEdit && (
                            <button className="btn danger" onClick={() => onSave({ ...form, _delete: true })}>Remover</button>
                        )}
                        <button className="btn primary" disabled={saving} onClick={handleSave}>
                            {saving ? <><span className="spin"></span> Salvando…</> : <><I.Check size={14} /> {isEdit ? 'Salvar alterações' : 'Adicionar'}</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ScheduleView({ team, onChange }: { team: TeamMember[]; onChange: (memberId: number, dayIdx: number, newShift: Shift) => void }) {
    const [popover, setPopover] = useState<{ mid: number; dayIdx: number; x: number; y: number } | null>(null);
    const popRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!popover) return;
        const h = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (popRef.current && !popRef.current.contains(target) && !target.closest('.shift-cell')) setPopover(null);
        };
        window.addEventListener('mousedown', h);
        return () => window.removeEventListener('mousedown', h);
    }, [popover]);

    const activeTeam = team.filter(m => m.status !== 'inativo');

    const counts = useMemo(() => {
        const c: Record<string, number> = {};
        activeTeam.forEach(m => { m.schedule.forEach(s => { c[s] = (c[s] || 0) + 1; }); });
        return c;
    }, [activeTeam]);

    const totalDays = activeTeam.length * 7;
    const workingDays = totalDays - (counts.off || 0) - (counts.ferias || 0);
    const utilization = totalDays > 0 ? Math.round((workingDays / totalDays) * 100) : 0;

    const onCellClick = (e: React.MouseEvent<HTMLButtonElement>, mid: number, dayIdx: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPopover({ mid, dayIdx, x: rect.left + window.scrollX, y: rect.bottom + window.scrollY + 4 });
    };

    const setShift = (newShift: Shift) => {
        if (!popover) return;
        onChange(popover.mid, popover.dayIdx, newShift);
        setPopover(null);
    };

    return (
        <div className="schedule-card">
            <div className="schedule-head">
                <div>
                    <h2 className="schedule-title">Escala Semanal</h2>
                    <div className="schedule-sub">Clique em uma célula para alterar o turno · {activeTeam.length} colaboradores</div>
                </div>
                <div className="week-nav">
                    <button className="btn ghost sm icon"><I.ChevronLeft size={14} /></button>
                    <span className="week-label">18 – 24 mai · 2026</span>
                    <button className="btn ghost sm icon"><I.ChevronRight size={14} /></button>
                    <button className="btn sm">Hoje</button>
                    <button className="btn sm"><I.ArrowDownTray size={13} /> Exportar</button>
                </div>
            </div>

            <div className="schedule-scroll">
                <table className="schedule">
                    <thead>
                        <tr>
                            <th className="staff-col">Colaborador</th>
                            {WEEKDAYS.map(d => (
                                <th key={d.short} className={d.weekend ? 'weekend' : ''}>{d.short}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {activeTeam.map(m => (
                            <tr key={m.id}>
                                <td className="staff-col">
                                    <div className="cell-name-line">
                                        <div className={`avatar sm ${m.avatarColor}`}>{initials(m.name)}</div>
                                        <div>
                                            <div className="cell-name" style={{ fontSize: 13 }}>{m.name}</div>
                                            <div className="cell-sub">{ROLES[m.role].label}</div>
                                        </div>
                                    </div>
                                </td>
                                {m.schedule.map((s, i) => (
                                    <td key={i}>
                                        <button className={`shift-cell shift-${s}`} onClick={(e) => onCellClick(e, m.id, i)}>
                                            {SHIFTS[s].code}
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="schedule-legend">
                <div className="legend-item"><span className="legend-sw" style={{ background: 'var(--blue-soft)', border: '1px solid var(--blue)' }}></span>Mat (08–16h)</div>
                <div className="legend-item"><span className="legend-sw" style={{ background: 'var(--orange-soft)', border: '1px solid var(--orange)' }}></span>Vesp (16–00h)</div>
                <div className="legend-item"><span className="legend-sw" style={{ background: 'var(--purple-soft)', border: '1px solid var(--purple)' }}></span>Noite (00–08h)</div>
                <div className="legend-item"><span className="legend-sw" style={{ background: '#f1f0ea', border: '1px solid var(--line-strong)' }}></span>OFF (folga)</div>
                <div className="legend-item"><span className="legend-sw" style={{ background: 'var(--green-soft)', border: '1px solid var(--green)' }}></span>Férias</div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 14 }}>
                    <span style={{ fontSize: 12.5 }}>Cobertura: <strong className="mono" style={{ color: 'var(--ink)' }}>{workingDays}/{totalDays} dias</strong></span>
                    <span style={{ fontSize: 12.5 }}>Utilização: <strong className="mono" style={{ color: 'var(--green-ink)' }}>{utilization}%</strong></span>
                </div>
            </div>

            {popover && (
                <div className="shift-pop" ref={popRef}
                     style={{ left: Math.min(popover.x, window.innerWidth - 160), top: popover.y }}>
                    {SHIFT_ORDER.map(s => (
                        <button key={s} onClick={() => setShift(s)}>
                            <span className="sw" style={{
                                background: s === 'mat' ? 'var(--blue-soft)' : s === 'vesp' ? 'var(--orange-soft)' : s === 'noite' ? 'var(--purple-soft)' : s === 'ferias' ? 'var(--green-soft)' : '#f1f0ea',
                                border: `1px solid ${s === 'mat' ? 'var(--blue)' : s === 'vesp' ? 'var(--orange)' : s === 'noite' ? 'var(--purple)' : s === 'ferias' ? 'var(--green)' : 'var(--line-strong)'}`,
                            }}></span>
                            {SHIFTS[s].label} {SHIFTS[s].range && <span style={{ color: 'var(--ink-3)', fontSize: 11, marginLeft: 'auto' }}>{SHIFTS[s].range}</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ---------- Page ----------

export default function EquipeIndex({ team: teamProp = [] }: EquipeProps) {
    const { props } = usePage<{ team?: TeamMember[] }>();
    const [tab, setTab] = useState<'team' | 'schedule'>('team');
    const [team, setTeam] = useState<TeamMember[]>(teamProp);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState<TeamRole | 'all'>('all');
    const [status, setStatus] = useState<TeamMemberStatus | 'all'>('all');
    const [view, setView] = useState<'grid' | 'table'>('grid');
    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const [modal, setModal] = useState<TeamMember | null | 'new'>(null);
    const [toast, setToast] = useState<{ msg: string; kind: string } | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { setTeam(props.team ?? []); }, [props.team]);

    useEffect(() => {
        if (!menuOpen) return;
        const h = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.action-menu') && !target.closest('.action-btn')) setMenuOpen(null);
        };
        window.addEventListener('mousedown', h);
        return () => window.removeEventListener('mousedown', h);
    }, [menuOpen]);

    const filtered = useMemo(() => {
        return team.filter(m => {
            if (role !== 'all' && m.role !== role) return false;
            if (status !== 'all' && m.status !== status) return false;
            if (search) {
                const q = search.toLowerCase();
                const hay = `${m.name} ${m.email} ${m.cpf}`.toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }, [team, role, status, search]);

    const stats = useMemo(() => {
        const ativos = team.filter(m => m.status === 'ativo').length;
        const ferias = team.filter(m => m.status === 'ferias').length;
        const activeMembers = team.filter(m => m.status !== 'inativo');
        const totalShifts = activeMembers.reduce((s, m) => s + m.schedule.filter(x => x !== 'off' && x !== 'ferias').length, 0);
        const totalSlots = activeMembers.length * 7;
        const util = totalSlots > 0 ? Math.round((totalShifts / totalSlots) * 100) : 0;
        return { total: team.length, ativos, ferias, util };
    }, [team]);

    const showToast = (msg: string, kind = '') => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2400); };

    const handleAction = (action: string, row: TeamMember) => {
        setMenuOpen(null);
        switch (action) {
            case 'edit':
            case 'view':
                setModal(row);
                break;
            case 'schedule':
                setTab('schedule');
                showToast(`Editando escala de ${row.name}`, '');
                break;
            case 'print':
                showToast(`Recibo gerado para ${row.name}`, 'success');
                break;
            case 'deactivate':
                if (!window.confirm(`Desativar ${row.name}? O acesso ao sistema será revogado.`)) break;
                router.patch(`/equipe/${row.id}/status`, { status: 'inativo' }, {
                    preserveState: true,
                    onSuccess: () => showToast(`${row.name} foi desativado(a)`, 'warn'),
                });
                break;
            case 'activate':
                router.patch(`/equipe/${row.id}/status`, { status: 'ativo' }, {
                    preserveState: true,
                    onSuccess: () => showToast(`${row.name} foi reativado(a)`, 'success'),
                });
                break;
        }
    };

    const handleSave = (form: MemberForm) => {
        const payload = {
            name: form.name, email: form.email, phone: form.phone, cpf: form.cpf,
            admission: form.admission, role: form.role, status: form.status,
            shifts: form.shifts, salary: form.salary || null,
        };

        if (form._delete && form.id) {
            router.delete(`/equipe/${form.id}`, {
                preserveState: true,
                onSuccess: () => { setModal(null); showToast(`${form.name} removido(a) da equipe`, 'warn'); },
            });
            return;
        }

        const options = {
            preserveState: true as const,
            onSuccess: () => {
                setModal(null);
                showToast(form.id ? `Dados de ${form.name} atualizados` : `${form.name} adicionado(a) à equipe`, 'success');
            },
            onError: () => showToast('Erro ao salvar. Verifique os campos.', 'error'),
        };

        if (form.id) {
            router.put(`/equipe/${form.id}`, payload, options);
        } else {
            router.post('/equipe', payload, options);
        }
    };

    const onRefresh = () => {
        if (refreshing) return;
        setRefreshing(true);
        router.reload({
            only: ['team'],
            onSuccess: () => { setRefreshing(false); showToast('Dados atualizados', 'success'); },
            onError:   () => setRefreshing(false),
        });
    };

    const updateSchedule = (memberId: number, dayIdx: number, newShift: Shift) => {
        setTeam(prev => prev.map(m => {
            if (m.id !== memberId) return m;
            const sched = [...m.schedule];
            sched[dayIdx] = newShift;
            return { ...m, schedule: sched };
        }));
        router.patch(`/equipe/${memberId}/schedule`, { day: dayIdx, shift: newShift }, {
            preserveState: true,
        });
    };

    const clearFilters = () => { setSearch(''); setRole('all'); setStatus('all'); };
    const filterCount = (search ? 1 : 0) + (role !== 'all' ? 1 : 0) + (status !== 'all' ? 1 : 0);

    const modalMember = modal === 'new' ? null : modal;

    return (
        <AppLayout title="Equipe" breadcrumb={[{ label: 'Equipe' }]}>
            <div className="page">
                <div className="page-head">
                    <div>
                        <h1 className="page-title">Gerenciar Equipe</h1>
                        <div className="page-sub">{stats.total} colaboradores · {stats.ativos} ativos · {stats.ferias} em férias</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn" onClick={onRefresh} disabled={refreshing}>
                            {refreshing ? <span className="spin"></span> : <I.Refresh size={15} />}
                            Atualizar
                        </button>
                        <button className="btn primary" onClick={() => setModal('new')}>
                            <I.Plus size={15} stroke={2.5} /> Adicionar colaborador
                        </button>
                    </div>
                </div>

                <div className="stats">
                    <StatCard tone="blue"   icon="Users"    value={stats.total}      label="Total de colaboradores" />
                    <StatCard tone="green"  icon="Check"    value={stats.ativos}     label="Ativos no momento" />
                    <StatCard tone="orange" icon="Calendar" value={stats.ferias}     label="Em férias" />
                    <StatCard tone="purple" icon="Chart"    value={`${stats.util}%`} label="Taxa de utilização" delta="3,2 pts" />
                </div>

                <div className="tabs-strip" role="tablist">
                    <button className={tab === 'team' ? 'active' : ''} onClick={() => setTab('team')}>
                        <I.Users size={15} /> Equipe
                    </button>
                    <button className={tab === 'schedule' ? 'active' : ''} onClick={() => setTab('schedule')}>
                        <I.Calendar size={15} /> Escala semanal
                    </button>
                </div>

                {tab === 'team' && (
                    <>
                        <div className="filters">
                            <div className="input-wrap">
                                <span className="ico-left"><I.Search size={15} /></span>
                                <input className="input has-left"
                                       placeholder="Buscar colaborador, email ou CPF…"
                                       value={search}
                                       onChange={(e) => setSearch(e.target.value)} />
                                {search && (
                                    <button className="clear-x" onClick={() => setSearch('')} aria-label="Limpar">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                    </button>
                                )}
                            </div>
                            <select className="select" value={role} onChange={(e) => setRole(e.target.value as TeamRole | 'all')} aria-label="Função">
                                <option value="all">Todas as funções</option>
                                {(Object.entries(ROLES) as [TeamRole, { label: string }][]).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
                            </select>
                            <select className="select" value={status} onChange={(e) => setStatus(e.target.value as TeamMemberStatus | 'all')} aria-label="Status">
                                <option value="all">Todos os status</option>
                                <option value="ativo">Ativos</option>
                                <option value="ferias">Em férias</option>
                                <option value="inativo">Inativos</option>
                            </select>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                {filterCount > 0 && (
                                    <button className="btn ghost sm" onClick={clearFilters}>Limpar ({filterCount})</button>
                                )}
                                <div className="view-toggle">
                                    <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Cards">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                                    </button>
                                    <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} aria-label="Tabela">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="table-card">
                                <div className="empty">
                                    <div className="empty-ico"><I.Search size={24} /></div>
                                    <h3>Nenhum colaborador encontrado</h3>
                                    <p>Tente ajustar os filtros ou limpar a busca.</p>
                                    <button className="btn" onClick={clearFilters}>Limpar filtros</button>
                                </div>
                            </div>
                        ) : view === 'grid' ? (
                            <div className="cards-grid">
                                {filtered.map(m => (
                                    <StaffCard key={m.id} m={m} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onAction={handleAction} />
                                ))}
                            </div>
                        ) : (
                            <StaffTable rows={filtered} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onAction={handleAction} />
                        )}
                    </>
                )}

                {tab === 'schedule' && (
                    <ScheduleView team={team} onChange={updateSchedule} />
                )}

                {modal !== null && (
                    <MemberModal
                        initial={modalMember as TeamMember | null}
                        onClose={() => setModal(null)}
                        onSave={handleSave}
                    />
                )}

                {toast && (
                    <div className={`toast ${toast.kind || ''}`}>
                        {toast.kind === 'error' || toast.kind === 'warn' ? <I.Warning size={16} /> : <I.Check size={16} stroke={2.5} />}
                        {toast.msg}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
