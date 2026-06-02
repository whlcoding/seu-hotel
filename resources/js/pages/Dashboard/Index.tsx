import { useState } from 'react';
import KpiCard from '@/components/hotel/KpiCard';
import RoomStatusGrid from '@/components/hotel/RoomStatusGrid';
import AppLayout from '@/components/layout/AppLayout';
import { I } from '@/components/ui/Icons';
import type { DashboardProps, OccupancyPoint } from '@/types/hotel';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CHART_DATA: OccupancyPoint[] = [
    { label: 'Seg', full: 'Segunda, 11 mai',  value: 62, rooms: 31 },
    { label: 'Ter', full: 'Terça, 12 mai',    value: 68, rooms: 34 },
    { label: 'Qua', full: 'Quarta, 13 mai',   value: 71, rooms: 36 },
    { label: 'Qui', full: 'Quinta, 14 mai',   value: 65, rooms: 33 },
    { label: 'Sex', full: 'Sexta, 15 mai',    value: 78, rooms: 39 },
    { label: 'Sáb', full: 'Sábado, 16 mai',   value: 88, rooms: 44 },
    { label: 'Dom', full: 'Domingo, 17 mai',  value: 82, rooms: 41 },
];

interface Task {
    id: string;
    text: string;
    meta: string;
    pill: string;
    pillText: string;
    done: boolean;
}

const TASKS_INIT: Task[] = [
    { id: 't1', text: '2 quartos ainda em limpeza', meta: '301, 408', pill: 'orange', pillText: 'limpeza', done: false },
    { id: 't2', text: 'Manutenção de AC no quarto 201', meta: 'Eduardo · 13:00', pill: 'red', pillText: 'manutenção', done: false },
    { id: 't3', text: 'Confirmar 3 reservas até as 14:00', meta: '#521, #524, #527', pill: 'blue', pillText: 'reservas', done: false },
    { id: 't4', text: 'Receber entrega de roupas de cama', meta: 'Recepção', pill: 'orange', pillText: 'estoque', done: false },
    { id: 't5', text: 'Briefing com camareiras (turno tarde)', meta: '14:30', pill: 'blue', pillText: 'equipe', done: false },
];

// ─── OccupancyChart ───────────────────────────────────────────────────────────

function OccupancyChart() {
    const [range, setRange] = useState<'7d' | '14d' | '30d'>('7d');

    const W = 460, H = 160;
    const padL = 32, padR = 16, padT = 12, padB = 32;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const max = 100;
    const barW = Math.floor(chartW / CHART_DATA.length) - 6;
    const GOAL = 70;
    const goalY = padT + chartH - (GOAL / max) * chartH;

    return (
        <div className="panel">
            <div className="panel-head">
                <div>
                    <h3 className="panel-title">Ocupação — Últimos 7 Dias</h3>
                    <div className="panel-sub">Quartos ocupados como % do inventário (50)</div>
                </div>
                <div className="tabs" role="tablist">
                    {(['7d', '14d', '30d'] as const).map((r) => (
                        <button
                            key={r}
                            className={range === r ? 'active' : ''}
                            onClick={() => setRange(r)}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-summary">
                <div className="chart-big">73,4%</div>
                <div className="kpi-delta up">▲ 4,2 pts</div>
                <div style={{ color: 'var(--ink-3)', fontSize: 12, marginLeft: 'auto' }}>
                    vs. semana anterior (69,2%)
                </div>
            </div>

            <svg
                width="100%"
                viewBox={`0 0 ${W} ${H}`}
                style={{ overflow: 'visible' }}
            >
                {/* Goal line */}
                <line
                    x1={padL} y1={goalY} x2={W - padR} y2={goalY}
                    stroke="var(--green)"
                    strokeWidth="1.5"
                    strokeDasharray="5 4"
                    opacity={0.6}
                />
                {/* Y axis ticks */}
                {[0, 25, 50, 75, 100].map((v) => (
                    <g key={v}>
                        <line
                            x1={padL}
                            y1={padT + chartH - (v / max) * chartH}
                            x2={W - padR}
                            y2={padT + chartH - (v / max) * chartH}
                            stroke="var(--line)"
                            strokeWidth="1"
                        />
                        <text
                            x={padL - 6}
                            y={padT + chartH - (v / max) * chartH + 4}
                            textAnchor="end"
                            fontSize={9}
                            fill="var(--ink-3)"
                        >
                            {v}%
                        </text>
                    </g>
                ))}
                {/* Bars */}
                {CHART_DATA.map((d, i) => (
                    <g key={d.label}>
                        <rect
                            x={padL + i * (chartW / CHART_DATA.length) + ((chartW / CHART_DATA.length) - barW) / 2}
                            y={padT + chartH - (d.value / max) * chartH}
                            width={barW}
                            height={(d.value / max) * chartH}
                            rx={4}
                            fill={d.value === Math.max(...CHART_DATA.map((c) => c.value)) ? 'var(--blue)' : 'var(--blue-soft)'}
                            stroke={d.value === Math.max(...CHART_DATA.map((c) => c.value)) ? 'var(--blue)' : 'transparent'}
                        />
                        <text
                            x={padL + i * (chartW / CHART_DATA.length) + ((chartW / CHART_DATA.length) - barW) / 2 + barW / 2}
                            y={padT + chartH - (d.value / max) * chartH - 4}
                            textAnchor="middle"
                            fontSize={9.5}
                            fontWeight={700}
                            fill={d.value === Math.max(...CHART_DATA.map((c) => c.value)) ? 'var(--blue-ink)' : 'var(--ink-3)'}
                        >
                            {d.value}%
                        </text>
                        <text
                            x={padL + i * (chartW / CHART_DATA.length) + ((chartW / CHART_DATA.length) - barW) / 2 + barW / 2}
                            y={padT + chartH + 14}
                            textAnchor="middle"
                            fontSize={10}
                            fill="var(--ink-3)"
                        >
                            {d.label}
                        </text>
                    </g>
                ))}
            </svg>

            <div
                className="status-row"
                style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}
            >
                <div className="status-item">
                    <span className="status-dot" style={{ background: '#378ADD' }} />
                    Ocupação %
                </div>
                <div className="status-item">
                    <span
                        className="status-dot"
                        style={{ background: '#639922', height: 2, marginTop: 3 }}
                    />
                    Meta diária (70%)
                </div>
                <div className="status-item" style={{ marginLeft: 'auto' }}>
                    Pico:{' '}
                    <strong style={{ color: 'var(--ink)' }} className="mono">
                        88% sáb
                    </strong>
                </div>
                <div className="status-item">
                    Vale:{' '}
                    <strong style={{ color: 'var(--ink)' }} className="mono">
                        62% seg
                    </strong>
                </div>
            </div>
        </div>
    );
}

// ─── AlertsPanel ──────────────────────────────────────────────────────────────

interface AlertsPanelProps {
    dismissed: string[];
    onConfirm: (id: string) => void;
    onPrioritize: (id: string) => void;
    onDismiss: (id: string) => void;
}

function AlertsPanel({ dismissed, onConfirm, onPrioritize, onDismiss }: AlertsPanelProps) {
    return (
        <div className="panel">
            <div className="panel-head">
                <div>
                    <h3 className="panel-title">Alertas</h3>
                    <div className="panel-sub">Itens que precisam de ação agora</div>
                </div>
                <button className="btn ghost sm">Ver todos</button>
            </div>

            {!dismissed.includes('a1') && (
                <div className="alert-card">
                    <div className="alert-icn warn">
                        <I.Warning size={18} />
                    </div>
                    <div className="alert-body">
                        <span className="alert-tag warn">Reserva em risco</span>
                        <h4 className="alert-title">#521 — João Silva</h4>
                        <p className="alert-text">
                            Risco de <strong>48% de no-show</strong>. Hóspede não respondeu confirmação enviada às 09:12.
                        </p>
                        <div className="alert-actions">
                            <button className="btn primary sm" onClick={() => onConfirm('a1')}>
                                <I.Check size={14} /> Confirmar
                            </button>
                            <button className="btn sm">Ligar para hóspede</button>
                        </div>
                    </div>
                </div>
            )}

            {!dismissed.includes('a2') && (
                <div className="alert-card">
                    <div className="alert-icn danger">
                        <I.Clock size={18} />
                    </div>
                    <div className="alert-body">
                        <span className="alert-tag danger">Limpeza atrasada</span>
                        <h4 className="alert-title">Quarto 405</h4>
                        <p className="alert-text">
                            <strong>45 minutos de atraso</strong>. Próximo check-in marcado para 15:00 (Camila Souza).
                        </p>
                        <div className="alert-actions">
                            <button className="btn primary sm" onClick={() => onPrioritize('a2')}>
                                <I.Sparkles size={14} /> Priorizar
                            </button>
                            <button className="btn sm">Reatribuir</button>
                        </div>
                    </div>
                </div>
            )}

            {!dismissed.includes('a3') && (
                <div className="alert-card">
                    <div className="alert-icn warn">
                        <I.Tools size={18} />
                    </div>
                    <div className="alert-body">
                        <span className="alert-tag warn">Manutenção pendente</span>
                        <h4 className="alert-title">Quarto 201 — Ar condicionado</h4>
                        <p className="alert-text">
                            Aberto há 2 dias. Técnico (Eduardo) com chegada estimada hoje 13:00.
                        </p>
                        <div className="alert-actions">
                            <button className="btn sm">Acompanhar</button>
                            <button className="btn ghost sm" onClick={() => onDismiss('a3')}>
                                Adiar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {dismissed.length === 3 && (
                <div style={{ padding: '24px 8px', textAlign: 'center', color: 'var(--ink-3)' }}>
                    <I.Check size={28} />
                    <div style={{ marginTop: 6, fontWeight: 600, color: 'var(--ink)' }}>Tudo em ordem</div>
                    <div style={{ fontSize: 12.5 }}>Nenhum alerta pendente no momento.</div>
                </div>
            )}
        </div>
    );
}

// ─── TasksPanel ───────────────────────────────────────────────────────────────

interface TasksPanelProps {
    tasks: Task[];
    onToggle: (id: string) => void;
}

function TasksPanel({ tasks, onToggle }: TasksPanelProps) {
    const open = tasks.filter((t) => !t.done).length;
    const done = tasks.length - open;

    return (
        <div className="panel">
            <div className="panel-head">
                <div>
                    <h3 className="panel-title">Tarefas Pendentes</h3>
                    <div className="panel-sub">
                        {open} aberta{open === 1 ? '' : 's'} · {done} concluída{done === 1 ? '' : 's'}
                    </div>
                </div>
                <button className="btn ghost sm">
                    <I.Plus size={14} /> Nova
                </button>
            </div>

            <div>
                {tasks.map((t) => (
                    <div key={t.id} className={`task ${t.done ? 'done' : ''}`}>
                        <button
                            className={`task-check ${t.done ? 'done' : ''}`}
                            onClick={() => onToggle(t.id)}
                            aria-label="Toggle"
                        >
                            {t.done && <I.Check size={12} stroke={3} />}
                        </button>
                        <div className="task-text">
                            {t.text}
                            <div className="task-meta">{t.meta}</div>
                        </div>
                        <span className={`pill ${t.pill}`}>{t.pillText}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardIndex({ kpis, generatedAt }: DashboardProps) {
    const [refreshing, setRefreshing] = useState(false);
    const [tasks, setTasks] = useState<Task[]>(TASKS_INIT);
    const [dismissed, setDismissed] = useState<string[]>([]);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2400);
    };

    const onRefresh = () => {
        if (!refreshing) {
            setRefreshing(true);
            showToast('Atualizando dados…');
            setTimeout(() => {
                setRefreshing(false);
                showToast(
                    'Dados atualizados às ' +
                        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                );
            }, 1200);
        }
    };

    const toggleTask = (id: string) => {
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    };

    const confirmAlert = (id: string) => {
        setDismissed((d) => [...d, id]);
        showToast('Reserva #521 confirmada com sucesso');
    };

    const prioritizeAlert = (id: string) => {
        setDismissed((d) => [...d, id]);
        showToast('Quarto 405 movido para prioridade alta');
    };

    const dismissAlert = (id: string) => {
        setDismissed((d) => [...d, id]);
    };

    const updatedAt = generatedAt ? new Date(generatedAt) : new Date();
    const dateLong = updatedAt.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const weekday = updatedAt.toLocaleDateString('pt-BR', { weekday: 'long' });

    return (
        <AppLayout title="Dashboard" breadcrumb={[{ label: 'Dashboard' }]}>
            {/* Page head */}
            <div className="page-head">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <div className="page-sub">
                        <span style={{ textTransform: 'capitalize' }}>{weekday}</span>
                        <span>·</span>
                        <span>{dateLong}</span>
                        <span className="live-dot">ao vivo</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn">
                        <I.ArrowDownTray size={15} /> Exportar
                    </button>
                    <button className="btn primary" onClick={onRefresh} disabled={refreshing}>
                        <span
                            className={refreshing ? 'spin' : ''}
                            style={{ display: 'inline-grid', placeItems: 'center' }}
                        >
                            <I.Refresh size={15} />
                        </span>
                        {refreshing ? 'Atualizando…' : 'Atualizar'}
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="kpi-grid">
                {kpis.map((kpi) => (
                    <KpiCard key={`${kpi.label}-${kpi.tone}`} {...kpi} />
                ))}
            </div>

            {/* Chart + Alerts */}
            <div className="grid-2">
                <OccupancyChart />
                <AlertsPanel
                    dismissed={dismissed}
                    onConfirm={confirmAlert}
                    onPrioritize={prioritizeAlert}
                    onDismiss={dismissAlert}
                />
            </div>

            {/* Tasks + Room Status */}
            <div className="grid-2">
                <TasksPanel tasks={tasks} onToggle={toggleTask} />
                <div className="panel">
                    <div className="panel-head">
                        <div>
                            <h3 className="panel-title">Status dos Quartos</h3>
                            <div className="panel-sub">Visão rápida — 50 quartos</div>
                        </div>
                        <button className="btn ghost sm">Ver mapa</button>
                    </div>
                    <RoomStatusGrid />
                </div>
            </div>

            {toast && (
                <div className="toast">
                    <I.Check size={16} stroke={2.5} />
                    {toast}
                </div>
            )}
        </AppLayout>
    );
}
