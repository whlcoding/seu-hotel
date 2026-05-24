import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { I } from '@/components/ui/Icons';

// ---------- Extra icons not in Icons.tsx ----------

const IcoMail = (p: { size?: number }) => (
    <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
    </svg>
);

const IcoFileText = (p: { size?: number }) => (
    <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <path d="M14 3v6h6M8 13h8M8 17h6"/>
    </svg>
);

const IcoSheet = (p: { size?: number }) => (
    <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
    </svg>
);

const IcoCsv = (p: { size?: number }) => (
    <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <path d="M14 3v6h6"/>
    </svg>
);

const IcoTrendUp = (p: { size?: number }) => (
    <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/>
    </svg>
);

const IcoTrendDown = (p: { size?: number }) => (
    <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7l6 6 4-4 8 9"/><path d="M14 18h7v-7"/>
    </svg>
);

// ---------- Data ----------

type DualPoint = { label: string; full: string; occ: number; rev: number };

const DUAL_DATA: DualPoint[] = [
    { label: '19/05', full: '19 mai · Seg', occ: 64,  rev: 1180 },
    { label: '20/05', full: '20 mai · Ter', occ: 70,  rev: 1310 },
    { label: '21/05', full: '21 mai · Qua', occ: 72,  rev: 1380 },
    { label: '22/05', full: '22 mai · Qui', occ: 76,  rev: 1450 },
    { label: '23/05', full: '23 mai · Sex', occ: 89,  rev: 1820 },
    { label: '24/05', full: '24 mai · Sáb', occ: 84,  rev: 1700 },
    { label: '25/05', full: '25 mai · Dom', occ: 78,  rev: 1410 },
];

type RoomTypeRow = { key: string; label: string; value: number; pct: number; color: string };

const ROOM_TYPE: RoomTypeRow[] = [
    { key: 'single', label: 'Single', value: 4200, pct: 23, color: '#378ADD' },
    { key: 'duplo',  label: 'Duplo',  value: 8900, pct: 48, color: '#639922' },
    { key: 'suite',  label: 'Suíte',  value: 5350, pct: 29, color: '#7a5cd4' },
];

type TabReceitaRow = { date: string; single: number; duplo: number; suite: number; total: number };
const TAB_RECEITA: TabReceitaRow[] = [
    { date: '19/05', single: 300,  duplo: 700,  suite: 400, total: 1400 },
    { date: '20/05', single: 300,  duplo: 850,  suite: 400, total: 1550 },
    { date: '21/05', single: 150,  duplo: 900,  suite: 500, total: 1550 },
    { date: '22/05', single: 300,  duplo: 950,  suite: 500, total: 1750 },
    { date: '23/05', single: 300,  duplo: 1100, suite: 600, total: 2000 },
    { date: '24/05', single: 150,  duplo: 950,  suite: 500, total: 1600 },
    { date: '25/05', single: 0,    duplo: 500,  suite: 400, total: 900  },
];

type TabOcupacaoRow = { date: string; total: number; ocup: number; taxa: number; delta: string; up: boolean };
const TAB_OCUPACAO: TabOcupacaoRow[] = [
    { date: '19/05', total: 50, ocup: 32, taxa: 64, delta: '+3',  up: true },
    { date: '20/05', total: 50, ocup: 35, taxa: 70, delta: '+6',  up: true },
    { date: '21/05', total: 50, ocup: 36, taxa: 72, delta: '+2',  up: true },
    { date: '22/05', total: 50, ocup: 38, taxa: 76, delta: '+4',  up: true },
    { date: '23/05', total: 50, ocup: 44, taxa: 88, delta: '+12', up: true },
    { date: '24/05', total: 50, ocup: 42, taxa: 84, delta: '-4',  up: false },
    { date: '25/05', total: 50, ocup: 39, taxa: 78, delta: '-6',  up: false },
];

type MetricRow = { k: string; v: string; delta: string; up: boolean | null; hint: string };
const TAB_HOSPEDES: MetricRow[] = [
    { k: 'Total Hóspedes',          v: '142',      delta: '+15%',   up: true,  hint: 'no período' },
    { k: 'Clientes Novos',          v: '38',       delta: '+20%',   up: true,  hint: '26,8% do total' },
    { k: 'Clientes Recorrentes',    v: '104',      delta: '+12%',   up: true,  hint: '73,2% do total' },
    { k: 'Estadia Média',           v: '2,1 dias', delta: 'estável',up: null,  hint: 'entre check-in e check-out' },
    { k: 'Valor Médio Reserva',     v: 'R$ 520',   delta: '−2%',    up: false, hint: 'ticket por reserva' },
    { k: 'Idade Média Hóspede',     v: '38 anos',  delta: '+1',     up: true,  hint: 'demografia' },
];

type EquipeRow = { name: string; role: string; init: string; av: string; tasks: number; succ: number; sat: number; prod: number };
const TAB_EQUIPE: EquipeRow[] = [
    { name: 'Maria Oliveira', role: 'Housekeeping', init: 'MO', av: 'green',  tasks: 32, succ: 100, sat: 4.8, prod: 16 },
    { name: 'João Pereira',   role: 'Recepção',     init: 'JP', av: 'blue',   tasks: 28, succ: 96,  sat: 4.6, prod: 14 },
    { name: 'Pedro Santos',   role: 'Manutenção',   init: 'PS', av: 'orange', tasks: 24, succ: 92,  sat: 4.2, prod: 12 },
    { name: 'Ana Costa',      role: 'Housekeeping', init: 'AC', av: 'purple', tasks: 30, succ: 98,  sat: 4.7, prod: 15 },
    { name: 'Carlos Mendes',  role: 'Recepção',     init: 'CM', av: 'blue',   tasks: 22, succ: 95,  sat: 4.4, prod: 11 },
];

const TAB_SATISFACAO: MetricRow[] = [
    { k: 'NPS (Net Promoter)',         v: '8,2',   delta: '+0,5',   up: true,  hint: 'em escala 0–10' },
    { k: 'Satisfação Geral',           v: '4,3/5', delta: 'estável',up: null,  hint: 'média de 87 avaliações' },
    { k: 'Taxa Recomendação',          v: '87%',   delta: '+3%',    up: true,  hint: 'recomendariam o hotel' },
    { k: 'Taxa Resposta',              v: '85%',   delta: '−2%',    up: false, hint: 'pesquisas respondidas' },
    { k: 'Tempo Médio Atendimento',    v: '6 min', delta: '−12%',   up: true,  hint: 'check-in até quarto' },
];

type SatisfHighlight = { kind: 'good' | 'bad'; label: string; value: string; detail: string };
const SATISF_HIGHLIGHTS: SatisfHighlight[] = [
    { kind: 'good', label: 'Elogio Mais Comum',      value: 'Limpeza',     detail: '34 menções positivas' },
    { kind: 'good', label: 'Segundo Elogio',          value: 'Atendimento', detail: '28 menções positivas' },
    { kind: 'bad',  label: 'Reclamação Mais Comum',  value: 'Barulho',     detail: '12 menções (quartos 201–205)' },
    { kind: 'bad',  label: 'Segunda Reclamação',      value: 'Wi-Fi lento', detail: '7 menções (área externa)' },
];

// ---------- SVG Charts ----------

function DualAxisChart({ data }: { data: DualPoint[] }) {
    const W = 600, H = 220;
    const padL = 44, padR = 52, padT = 16, padB = 36;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    const n = data.length;
    const barW = Math.floor(innerW / n * 0.5);
    const maxOcc = 100;
    const maxRev = Math.max(...data.map(d => d.rev)) * 1.15;

    const xPos = (i: number) => padL + (i + 0.5) * (innerW / n);
    const yOcc = (v: number) => padT + innerH - (v / maxOcc) * innerH;
    const yRev = (v: number) => padT + innerH - (v / maxRev) * innerH;

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xPos(i)},${yRev(d.rev)}`).join(' ');

    const gridLines = [0, 25, 50, 75, 100];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
            {gridLines.map(v => (
                <g key={v}>
                    <line x1={padL} y1={yOcc(v)} x2={W - padR} y2={yOcc(v)} stroke="#e8e7e0" strokeWidth="1" />
                    <text x={padL - 6} y={yOcc(v) + 4} textAnchor="end" fontSize="10" fill="#b0afa8">{v}%</text>
                </g>
            ))}
            {[0, 500, 1000, 1500, 2000].map(v => (
                <text key={v} x={W - padR + 6} y={yRev(v) + 4} textAnchor="start" fontSize="10" fill="#b0afa8">
                    {v >= 1000 ? `${v / 1000}k` : v}
                </text>
            ))}
            {data.map((d, i) => (
                <g key={d.label}>
                    <rect
                        x={xPos(i) - barW / 2}
                        y={yOcc(d.occ)}
                        width={barW}
                        height={innerH - (yOcc(d.occ) - padT)}
                        fill="#b8d4f0"
                        rx="3"
                    />
                    <text x={xPos(i)} y={H - padB + 14} textAnchor="middle" fontSize="10" fill="#8a8a80">{d.label}</text>
                    <text x={xPos(i)} y={yOcc(d.occ) - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="#378ADD">{d.occ}%</text>
                </g>
            ))}
            <path d={linePath} fill="none" stroke="#639922" strokeWidth="2.5" strokeLinejoin="round" />
            {data.map((d, i) => (
                <circle key={d.label} cx={xPos(i)} cy={yRev(d.rev)} r="4" fill="#639922" stroke="#fff" strokeWidth="2" />
            ))}
        </svg>
    );
}

function RoomTypeBar({ data, selected, onSelect }: { data: RoomTypeRow[]; selected: string | null; onSelect: (key: string | null) => void }) {
    const maxVal = Math.max(...data.map(d => d.value));
    return (
        <div style={{ padding: '8px 0 4px' }}>
            {data.map(d => (
                <div key={d.key}
                     style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer', opacity: selected && selected !== d.key ? 0.45 : 1, transition: 'opacity .15s' }}
                     onClick={() => onSelect(selected === d.key ? null : d.key)}>
                    <div style={{ width: 64, fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{d.label}</div>
                    <div style={{ flex: 1, height: 28, background: '#f1f0ea', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${(d.value / maxVal) * 100}%`, height: '100%', background: d.color, borderRadius: 6, transition: 'width .4s' }}></div>
                    </div>
                    <div style={{ width: 80, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                        R$ {d.value.toLocaleString('pt-BR')}
                    </div>
                    <div style={{ width: 36, textAlign: 'right', fontSize: 12, color: 'var(--ink-3)' }}>{d.pct}%</div>
                </div>
            ))}
        </div>
    );
}

// ---------- KPI Cards ----------

function KpiCards() {
    return (
        <div className="kpi-grid">
            <div className="kpi blue">
                <div className="kpi-accent"></div>
                <div className="kpi-head">
                    <div className="kpi-ico"><I.Cash size={20} stroke={2} /></div>
                    <div className="kpi-delta up"><IcoTrendUp size={12} /> +12%</div>
                </div>
                <div className="kpi-value">R$ 18.450</div>
                <div className="kpi-label">Receita Total</div>
                <div className="kpi-foot">
                    <div className="row"><span>vs. período anterior</span><strong>R$ 16.473</strong></div>
                    <div className="row"><span>Média diária</span><strong>R$ 1.321</strong></div>
                </div>
            </div>

            <div className="kpi green">
                <div className="kpi-accent"></div>
                <div className="kpi-head">
                    <div className="kpi-ico"><I.Hotel size={20} stroke={2} /></div>
                    <div className="kpi-delta up"><IcoTrendUp size={12} /> +5 pts</div>
                </div>
                <div className="kpi-value">76%</div>
                <div className="kpi-label">Taxa de Ocupação Média</div>
                <div className="kpi-foot">
                    <div className="row"><span>Melhor dia · sexta</span><strong>89%</strong></div>
                    <div className="row"><span>Pior dia · segunda</span><strong>64%</strong></div>
                </div>
            </div>

            <div className="kpi purple">
                <div className="kpi-accent"></div>
                <div className="kpi-head">
                    <div className="kpi-ico"><I.Users size={20} stroke={2} /></div>
                    <div className="kpi-delta up"><IcoTrendUp size={12} /> +15%</div>
                </div>
                <div className="kpi-value">142</div>
                <div className="kpi-label">Total de Hóspedes</div>
                <div className="kpi-foot">
                    <div className="row"><span>Média por reserva</span><strong>2,1 pessoas</strong></div>
                    <div className="row"><span>Clientes novos</span><strong>38 (27%)</strong></div>
                </div>
            </div>

            <div className="kpi orange">
                <div className="kpi-accent"></div>
                <div className="kpi-head">
                    <div className="kpi-ico"><I.Warning size={20} stroke={2} /></div>
                    <div className="kpi-delta down"><IcoTrendDown size={12} /> −1,5 pts</div>
                </div>
                <div className="kpi-value">4,2%</div>
                <div className="kpi-label">Taxa de No-show</div>
                <div className="kpi-foot">
                    <div className="row"><span>6 no-shows em 142 reservas</span><strong></strong></div>
                    <div className="row"><span>Previsão próximo mês</span><strong>≈ 2%</strong></div>
                </div>
            </div>
        </div>
    );
}

// ---------- Detail Tabs ----------

function ReceitaTable({ pickedRoomType }: { pickedRoomType: string | null }) {
    const totals = TAB_RECEITA.reduce((a, r) => ({
        single: a.single + r.single, duplo: a.duplo + r.duplo, suite: a.suite + r.suite, total: a.total + r.total,
    }), { single: 0, duplo: 0, suite: 0, total: 0 });

    const hl = (col: string) => pickedRoomType === col ? { background: col === 'single' ? '#eaf3fc' : col === 'duplo' ? '#eef5e3' : '#f0ebfb' } : {};

    return (
        <div className="table-card">
            <div className="table-head">
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Receita Detalhada por Dia</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Valores em BRL · 7 dias</div>
                </div>
                <button className="btn sm"><I.ArrowDownTray size={13} /> Baixar CSV</button>
            </div>
            <div className="table-scroll">
                <table className="data">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th className="right" style={hl('single')}>Single</th>
                            <th className="right" style={hl('duplo')}>Duplo</th>
                            <th className="right" style={hl('suite')}>Suíte</th>
                            <th className="right">Total</th>
                            <th className="right">Média / quarto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TAB_RECEITA.map(r => {
                            const nonZero = [r.single, r.duplo, r.suite].filter(v => v > 0).length;
                            return (
                                <tr key={r.date}>
                                    <td><span className="mono">{r.date}</span></td>
                                    <td className="right mono" style={hl('single')}>
                                        {r.single ? `R$ ${r.single}` : <span style={{ color: 'var(--ink-4)' }}>—</span>}
                                    </td>
                                    <td className="right mono" style={hl('duplo')}>R$ {r.duplo}</td>
                                    <td className="right mono" style={hl('suite')}>R$ {r.suite}</td>
                                    <td className="right mono" style={{ fontWeight: 700 }}>R$ {r.total.toLocaleString('pt-BR')}</td>
                                    <td className="right mono" style={{ color: 'var(--ink-3)' }}>
                                        R$ {Math.round(r.total / nonZero).toLocaleString('pt-BR')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>Total no período</td>
                            <td className="right mono">R$ {totals.single.toLocaleString('pt-BR')}</td>
                            <td className="right mono">R$ {totals.duplo.toLocaleString('pt-BR')}</td>
                            <td className="right mono">R$ {totals.suite.toLocaleString('pt-BR')}</td>
                            <td className="right mono" style={{ color: 'var(--blue-ink)' }}>R$ {totals.total.toLocaleString('pt-BR')}</td>
                            <td className="right mono" style={{ color: 'var(--ink-3)', fontWeight: 600 }}>
                                R$ {Math.round(totals.total / TAB_RECEITA.length).toLocaleString('pt-BR')} / dia
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

function OcupacaoTable() {
    return (
        <div className="table-card">
            <div className="table-head">
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Ocupação Diária</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Inventário fixo de 50 quartos · variação vs. dia anterior</div>
                </div>
                <button className="btn sm"><I.ArrowDownTray size={13} /> Baixar CSV</button>
            </div>
            <div className="table-scroll">
                <table className="data">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th className="right">Total quartos</th>
                            <th className="right">Ocupados</th>
                            <th>Taxa</th>
                            <th className="right">Variação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TAB_OCUPACAO.map(r => (
                            <tr key={r.date}>
                                <td><span className="mono">{r.date}</span></td>
                                <td className="right mono">{r.total}</td>
                                <td className="right mono">{r.ocup}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="mono" style={{ fontWeight: 700, minWidth: 40 }}>{r.taxa}%</span>
                                        <div style={{ flex: 1, height: 8, background: '#f1f0ea', borderRadius: 4, overflow: 'hidden', maxWidth: 220 }}>
                                            <div style={{ width: `${r.taxa}%`, height: '100%', background: r.taxa >= 80 ? 'var(--green)' : r.taxa >= 65 ? 'var(--blue)' : 'var(--orange)', borderRadius: 4 }}></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="right">
                                    <span className={`delta-chip ${r.up ? 'up' : 'down'}`}>{r.up ? '▲' : '▼'} {r.delta} pts</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function HospedesTable() {
    return (
        <div className="table-card">
            <div className="table-head">
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Métricas de Hóspedes</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Hóspedes únicos e comportamento no período</div>
                </div>
                <button className="btn sm"><I.ArrowDownTray size={13} /> Baixar CSV</button>
            </div>
            <div className="table-scroll">
                <table className="data">
                    <thead>
                        <tr>
                            <th>Métrica</th>
                            <th className="right">Valor</th>
                            <th className="right">Variação</th>
                            <th>Observação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TAB_HOSPEDES.map(r => (
                            <tr key={r.k}>
                                <td style={{ fontWeight: 600 }}>{r.k}</td>
                                <td className="right mono" style={{ fontWeight: 700 }}>{r.v}</td>
                                <td className="right">
                                    <span className={`delta-chip ${r.up === null ? 'flat' : r.up ? 'up' : 'down'}`}>
                                        {r.up === null ? '→' : r.up ? '▲' : '▼'} {r.delta}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--ink-3)', fontSize: 12.5 }}>{r.hint}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EquipeTable() {
    const maxProd = Math.max(...TAB_EQUIPE.map(s => s.prod));
    return (
        <div className="table-card">
            <div className="table-head">
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Desempenho da Equipe</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Tarefas concluídas, satisfação e produtividade no período</div>
                </div>
                <button className="btn sm"><I.ArrowDownTray size={13} /> Baixar CSV</button>
            </div>
            <div className="table-scroll">
                <table className="data">
                    <thead>
                        <tr>
                            <th>Colaborador</th>
                            <th className="right">Tarefas</th>
                            <th className="right">Taxa Sucesso</th>
                            <th>Satisfação</th>
                            <th>Produtividade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {TAB_EQUIPE.map(s => (
                            <tr key={s.name}>
                                <td>
                                    <div className="cell-name-line">
                                        <div className={`avatar sm ${s.av}`}>{s.init}</div>
                                        <div>
                                            <div className="cell-name">{s.name}</div>
                                            <div className="cell-sub">{s.role}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="right mono">{s.tasks}</td>
                                <td className="right">
                                    <span className={`delta-chip ${s.succ >= 95 ? 'up' : s.succ >= 90 ? 'flat' : 'down'}`}>{s.succ}%</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span className="mono" style={{ fontWeight: 700, minWidth: 40 }}>{s.sat.toFixed(1)}/5</span>
                                        <div className="rating-stars">
                                            {[0,1,2,3,4].map(i => (
                                                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < Math.round(s.sat) ? '#d8b22b' : '#e8e7e0'} stroke="none">
                                                    <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.6 19.6l1-6L3.3 9.4l6-.9L12 3z"/>
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="mono" style={{ fontWeight: 700, minWidth: 80 }}>{s.prod} qtos/dia</span>
                                        <div style={{ flex: 1, height: 6, background: '#f1f0ea', borderRadius: 3, overflow: 'hidden', maxWidth: 180 }}>
                                            <div style={{ width: `${(s.prod / maxProd) * 100}%`, height: '100%', background: s.prod === maxProd ? 'var(--green)' : 'var(--blue)', borderRadius: 3 }}></div>
                                        </div>
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

function SatisfacaoTable() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div className="table-card">
                <div className="table-head">
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Indicadores de Satisfação</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Pesquisa pós-checkout · 87 respostas</div>
                    </div>
                    <button className="btn sm"><I.ArrowDownTray size={13} /> Baixar CSV</button>
                </div>
                <div className="table-scroll">
                    <table className="data">
                        <thead>
                            <tr>
                                <th>Métrica</th>
                                <th className="right">Valor</th>
                                <th className="right">Tendência</th>
                                <th>Observação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {TAB_SATISFACAO.map(r => (
                                <tr key={r.k}>
                                    <td style={{ fontWeight: 600 }}>{r.k}</td>
                                    <td className="right mono" style={{ fontWeight: 700 }}>{r.v}</td>
                                    <td className="right">
                                        <span className={`delta-chip ${r.up === null ? 'flat' : r.up ? 'up' : 'down'}`}>
                                            {r.up === null ? '→' : r.up ? '▲' : '▼'} {r.delta}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--ink-3)', fontSize: 12.5 }}>{r.hint}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="panel" style={{ padding: 18 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Comentários Recorrentes</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 14 }}>Análise das respostas abertas</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {SATISF_HIGHLIGHTS.map((h, i) => (
                        <div key={i} style={{
                            padding: 12, borderRadius: 10, border: '1px solid var(--line)',
                            background: h.kind === 'good' ? 'var(--green-soft)' : 'var(--red-soft)',
                            borderColor: h.kind === 'good' ? 'rgba(99,153,34,0.25)' : 'rgba(226,75,74,0.22)',
                        }}>
                            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: h.kind === 'good' ? 'var(--green-ink)' : 'var(--red-ink)', marginBottom: 4 }}>{h.label}</div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{h.value}</div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{h.detail}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ---------- Filters row ----------

type Period = '7d' | '14d' | '30d' | '3m';

function FiltersRow({ period, setPeriod, refreshing, onRefresh, exportOpen, setExportOpen, onExport, onEmail }: {
    period: Period;
    setPeriod: (p: Period) => void;
    refreshing: boolean;
    onRefresh: () => void;
    exportOpen: boolean;
    setExportOpen: (v: boolean) => void;
    onExport: (fmt: string) => void;
    onEmail: () => void;
}) {
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!exportOpen) return;
        const h = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
        };
        window.addEventListener('mousedown', h);
        return () => window.removeEventListener('mousedown', h);
    }, [exportOpen, setExportOpen]);

    return (
        <div className="filters-row">
            <div className="filter-group">
                <span className="filter-label">Período</span>
                <div className="segmented">
                    {([['7d','7 dias'],['14d','14 dias'],['30d','30 dias'],['3m','3 meses']] as [Period, string][]).map(([id, label]) => (
                        <button key={id} className={period === id ? 'active' : ''} onClick={() => setPeriod(id)}>{label}</button>
                    ))}
                </div>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn" onClick={onRefresh} disabled={refreshing}>
                    <span className={refreshing ? 'spin' : ''}><I.Refresh size={15} /></span>
                    {refreshing ? 'Atualizando…' : 'Atualizar'}
                </button>

                <div className="menu-anchor" ref={exportRef} style={{ position: 'relative' }}>
                    <button className="btn" onClick={() => setExportOpen(!exportOpen)}>
                        <I.ArrowDownTray size={15} />
                        Exportar
                        <I.ChevronDown size={14} />
                    </button>
                    {exportOpen && (
                        <div className="menu">
                            <div className="menu-head">Baixar Como</div>
                            <button className="menu-item" onClick={() => { onExport('pdf'); setExportOpen(false); }}>
                                <IcoFileText size={16} /> PDF — Relatório formatado
                            </button>
                            <button className="menu-item" onClick={() => { onExport('xlsx'); setExportOpen(false); }}>
                                <IcoSheet size={16} /> Excel — Planilha (.xlsx)
                            </button>
                            <button className="menu-item" onClick={() => { onExport('csv'); setExportOpen(false); }}>
                                <IcoCsv size={16} /> CSV — Dados brutos
                            </button>
                        </div>
                    )}
                </div>

                <button className="btn primary" onClick={onEmail}>
                    <IcoMail size={15} /> Enviar por Email
                </button>
            </div>
        </div>
    );
}

// ---------- Page ----------

type TabId = 'receita' | 'ocupacao' | 'hospedes' | 'equipe' | 'satisfacao';

export default function RelatoriosIndex() {
    const [period, setPeriod] = useState<Period>('7d');
    const [refreshing, setRefreshing] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [tab, setTab] = useState<TabId>('receita');
    const [pickedRoomType, setPickedRoomType] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

    const onRefresh = () => {
        if (refreshing) return;
        setRefreshing(true);
        showToast('Atualizando dados…');
        setTimeout(() => {
            setRefreshing(false);
            showToast('Dados atualizados às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        }, 1200);
    };

    const onExport = (fmt: string) => showToast(`Exportando relatório em ${fmt.toUpperCase()}…`);
    const onEmail = () => showToast('Relatório enviado por email para mariana@maranzul.com.br');

    const onPickRoomType = (key: string | null) => {
        setPickedRoomType(key);
        if (key) setTab('receita');
    };

    const periodLabel: Record<Period, string> = {
        '7d':  'Últimos 7 dias',
        '14d': 'Últimos 14 dias',
        '30d': 'Últimos 30 dias',
        '3m':  'Últimos 3 meses',
    };

    const tabs: { id: TabId; label: string; count: number }[] = [
        { id: 'receita',    label: 'Receita',    count: 7 },
        { id: 'ocupacao',   label: 'Ocupação',   count: 7 },
        { id: 'hospedes',   label: 'Hóspedes',   count: 6 },
        { id: 'equipe',     label: 'Equipe',      count: 5 },
        { id: 'satisfacao', label: 'Satisfação',  count: 5 },
    ];

    return (
        <AppLayout title="Relatórios" breadcrumb={[{ label: 'Relatórios & Análises' }]}>
            <div className="page">
                <div className="page-head">
                    <div>
                        <h1 className="page-title">Relatórios &amp; Análises</h1>
                        <div className="page-sub">
                            <span>{periodLabel[period]}</span>
                            <span>·</span>
                            <span>19 mai – 25 mai 2026</span>
                            <span>·</span>
                            <span>142 reservas analisadas</span>
                        </div>
                    </div>
                </div>

                <FiltersRow
                    period={period} setPeriod={setPeriod}
                    refreshing={refreshing} onRefresh={onRefresh}
                    exportOpen={exportOpen} setExportOpen={setExportOpen}
                    onExport={onExport} onEmail={onEmail}
                />

                <div className="section-label">Resumo Executivo</div>
                <KpiCards />

                <div className="section-label">Visualizações</div>

                <div className="charts-grid">
                    <div className="panel">
                        <div className="panel-head">
                            <div>
                                <h3 className="panel-title">Ocupação vs Receita</h3>
                                <div className="panel-sub">Comparativo diário · últimos 7 dias</div>
                            </div>
                            <div className="legend-row">
                                <div className="legend-item"><span className="legend-line" style={{ background: '#378ADD' }}></span>Ocupação %</div>
                                <div className="legend-item"><span className="legend-line" style={{ background: '#639922' }}></span>Receita R$</div>
                            </div>
                        </div>
                        <DualAxisChart data={DUAL_DATA} />
                    </div>

                    <div className="panel">
                        <div className="panel-head">
                            <div>
                                <h3 className="panel-title">Receita por Tipo de Quarto</h3>
                                <div className="panel-sub">
                                    {pickedRoomType
                                        ? <span>Filtrado: <strong>{ROOM_TYPE.find(r => r.key === pickedRoomType)?.label}</strong> · <button onClick={() => onPickRoomType(null)} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 700 }}>limpar</button></span>
                                        : 'Clique numa barra para filtrar a tabela'}
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                                Total <strong style={{ color: 'var(--ink)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>R$ 18.450</strong>
                            </div>
                        </div>
                        <RoomTypeBar data={ROOM_TYPE} onSelect={onPickRoomType} selected={pickedRoomType} />
                    </div>
                </div>

                <div className="section-label">Análise Detalhada</div>

                <div className="tabs-strip" role="tablist">
                    {tabs.map(t => (
                        <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
                            {t.label}
                            <span className="count">{t.count}</span>
                        </button>
                    ))}
                </div>

                {tab === 'receita'    && <ReceitaTable pickedRoomType={pickedRoomType} />}
                {tab === 'ocupacao'   && <OcupacaoTable />}
                {tab === 'hospedes'   && <HospedesTable />}
                {tab === 'equipe'     && <EquipeTable />}
                {tab === 'satisfacao' && <SatisfacaoTable />}

                {toast && (
                    <div className="toast success">
                        <I.Check size={16} stroke={2.5} />{toast}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
