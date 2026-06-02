import { useState, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { I } from '@/components/ui/Icons';

// ─── Extra icons ──────────────────────────────────────────────────────────────

const IcoMail     = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
const IcoFileText = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/></svg>;
const IcoSheet    = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>;
const IcoCsv      = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>;
const IcoTrendUp  = ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/></svg>;
const IcoTrendDown= ({ size = 16 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7l6 6 4-4 8 9"/><path d="M14 18h7v-7"/></svg>;

// ─── Smooth Catmull-Rom path ──────────────────────────────────────────────────

function smoothPath(pts: [number, number][]): string {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i - 1] ?? pts[i];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] ?? pts[i + 1];
        const c1x = p1[0] + (p2[0] - p0[0]) / 6;
        const c1y = p1[1] + (p2[1] - p0[1]) / 6;
        const c2x = p2[0] - (p3[0] - p1[0]) / 6;
        const c2y = p2[1] - (p3[1] - p1[1]) / 6;
        d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Period   = '7d' | '14d' | '30d' | '3m';
type TabId    = 'receita' | 'ocupacao' | 'hospedes' | 'equipe' | 'satisfacao';
type DeltaDir = boolean | null;

interface DualPoint    { label: string; full: string; occ: number; rev: number }
interface SeasonPoint  { label: string; full: string; value: number }
interface OriginPoint  { label: string; value: number; color: string }
interface RoomTypeRow  { key: string; label: string; value: number; pct: number; color: string }
interface TabReceitaRow { date: string; single: number; duplo: number; suite: number; total: number }
interface TabOcupacaoRow { date: string; total: number; ocup: number; taxa: number; delta: string; up: boolean }
interface MetricRow    { k: string; v: string; delta: string; up: DeltaDir; hint: string }
interface EquipeRow    { name: string; role: string; init: string; av: string; tasks: number; succ: number; sat: number; prod: number }
interface SatisfHighlight { kind: 'good' | 'bad'; label: string; value: string; detail: string }

// ─── Mock data ────────────────────────────────────────────────────────────────

const DUAL_DATA: DualPoint[] = [
    { label: '19/05', full: '19 mai · Seg', occ: 64, rev: 1180 },
    { label: '20/05', full: '20 mai · Ter', occ: 70, rev: 1310 },
    { label: '21/05', full: '21 mai · Qua', occ: 72, rev: 1380 },
    { label: '22/05', full: '22 mai · Qui', occ: 76, rev: 1450 },
    { label: '23/05', full: '23 mai · Sex', occ: 89, rev: 1820 },
    { label: '24/05', full: '24 mai · Sáb', occ: 84, rev: 1700 },
    { label: '25/05', full: '25 mai · Dom', occ: 78, rev: 1410 },
];

const SEASONALITY: SeasonPoint[] = (() => {
    const days: SeasonPoint[] = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date(2026, 3, 26 + i);
        const dow = d.getDay();
        let base = 65 + (dow === 5 || dow === 6 ? 18 : dow === 0 ? 8 : 0);
        base += Math.sin(i / 4) * 5 + (i > 22 ? 4 : 0);
        days.push({
            label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            full:  d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            value: Math.max(35, Math.min(98, Math.round(base))),
        });
    }
    return days;
})();

const FORECAST: SeasonPoint[] = (() => {
    const days: SeasonPoint[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(2026, 4, 26 + i);
        const dow = d.getDay();
        days.push({
            label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            full:  d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            value: Math.round(72 + (dow === 5 || dow === 6 ? 14 : 0)),
        });
    }
    return days;
})();

const ORIGIN_DATA: OriginPoint[] = [
    { label: 'Booking.com', value: 40, color: '#378ADD' },
    { label: 'Website',     value: 35, color: '#639922' },
    { label: 'Agência',     value: 15, color: '#BA7517' },
    { label: 'Direto',      value: 10, color: '#7a5cd4' },
];

const ROOM_TYPE: RoomTypeRow[] = [
    { key: 'single', label: 'Single', value: 4200, pct: 23, color: '#378ADD' },
    { key: 'duplo',  label: 'Duplo',  value: 8900, pct: 48, color: '#639922' },
    { key: 'suite',  label: 'Suíte',  value: 5350, pct: 29, color: '#7a5cd4' },
];

const TAB_RECEITA: TabReceitaRow[] = [
    { date: '19/05', single: 300, duplo: 700,  suite: 400, total: 1400 },
    { date: '20/05', single: 300, duplo: 850,  suite: 400, total: 1550 },
    { date: '21/05', single: 150, duplo: 900,  suite: 500, total: 1550 },
    { date: '22/05', single: 300, duplo: 950,  suite: 500, total: 1750 },
    { date: '23/05', single: 300, duplo: 1100, suite: 600, total: 2000 },
    { date: '24/05', single: 150, duplo: 950,  suite: 500, total: 1600 },
    { date: '25/05', single: 0,   duplo: 500,  suite: 400, total: 900  },
];

const TAB_OCUPACAO: TabOcupacaoRow[] = [
    { date: '19/05', total: 50, ocup: 32, taxa: 64, delta: '+3',  up: true  },
    { date: '20/05', total: 50, ocup: 35, taxa: 70, delta: '+6',  up: true  },
    { date: '21/05', total: 50, ocup: 36, taxa: 72, delta: '+2',  up: true  },
    { date: '22/05', total: 50, ocup: 38, taxa: 76, delta: '+4',  up: true  },
    { date: '23/05', total: 50, ocup: 44, taxa: 88, delta: '+12', up: true  },
    { date: '24/05', total: 50, ocup: 42, taxa: 84, delta: '-4',  up: false },
    { date: '25/05', total: 50, ocup: 39, taxa: 78, delta: '-6',  up: false },
];

const TAB_HOSPEDES: MetricRow[] = [
    { k: 'Total Hóspedes',        v: '142',      delta: '+15%',   up: true,  hint: 'no período' },
    { k: 'Clientes Novos',        v: '38',        delta: '+20%',   up: true,  hint: '26,8% do total' },
    { k: 'Clientes Recorrentes',  v: '104',       delta: '+12%',   up: true,  hint: '73,2% do total' },
    { k: 'Estadia Média',         v: '2,1 dias',  delta: 'estável',up: null,  hint: 'entre check-in e check-out' },
    { k: 'Valor Médio Reserva',   v: 'R$ 520',    delta: '−2%',    up: false, hint: 'ticket por reserva' },
    { k: 'Idade Média Hóspede',   v: '38 anos',   delta: '+1',     up: true,  hint: 'demografia' },
];

const TAB_EQUIPE: EquipeRow[] = [
    { name: 'Maria Oliveira', role: 'Housekeeping', init: 'MO', av: 'green',  tasks: 32, succ: 100, sat: 4.8, prod: 16 },
    { name: 'João Pereira',   role: 'Recepção',     init: 'JP', av: 'blue',   tasks: 28, succ: 96,  sat: 4.6, prod: 14 },
    { name: 'Pedro Santos',   role: 'Manutenção',   init: 'PS', av: 'orange', tasks: 24, succ: 92,  sat: 4.2, prod: 12 },
    { name: 'Ana Costa',      role: 'Housekeeping', init: 'AC', av: 'purple', tasks: 30, succ: 98,  sat: 4.7, prod: 15 },
    { name: 'Carlos Mendes',  role: 'Recepção',     init: 'CM', av: 'blue',   tasks: 22, succ: 95,  sat: 4.4, prod: 11 },
];

const TAB_SATISFACAO: MetricRow[] = [
    { k: 'NPS (Net Promoter)',         v: '8,2',    delta: '+0,5',   up: true,  hint: 'em escala 0–10' },
    { k: 'Satisfação Geral',           v: '4,3/5',  delta: 'estável',up: null,  hint: 'média de 87 avaliações' },
    { k: 'Taxa Recomendação',          v: '87%',    delta: '+3%',    up: true,  hint: 'recomendariam o hotel' },
    { k: 'Taxa Resposta',              v: '85%',    delta: '−2%',    up: false, hint: 'pesquisas respondidas' },
    { k: 'Tempo Médio Atendimento',    v: '6 min',  delta: '−12%',   up: true,  hint: 'check-in até quarto' },
];

const SATISF_HIGHLIGHTS: SatisfHighlight[] = [
    { kind: 'good', label: 'Elogio Mais Comum',     value: 'Limpeza',     detail: '34 menções positivas' },
    { kind: 'good', label: 'Segundo Elogio',         value: 'Atendimento', detail: '28 menções positivas' },
    { kind: 'bad',  label: 'Reclamação Mais Comum',  value: 'Barulho',     detail: '12 menções (quartos 201–205)' },
    { kind: 'bad',  label: 'Segunda Reclamação',     value: 'Wi-Fi lento', detail: '7 menções (área externa)' },
];

// ─── Charts ───────────────────────────────────────────────────────────────────

function DualAxisChart({ data }: { data: DualPoint[] }) {
    const [hover, setHover] = useState<number | null>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const W = 560, H = 240, padL = 38, padR = 44, padT = 16, padB = 30;
    const innerW = W - padL - padR, innerH = H - padT - padB;
    const maxRev = 2000;
    const xFor  = (i: number) => padL + (i * innerW) / (data.length - 1);
    const yOcc  = (v: number) => padT + innerH - (v / 100) * innerH;
    const yRev  = (v: number) => padT + innerH - (v / maxRev) * innerH;
    const occPts: [number, number][] = data.map((d, i) => [xFor(i), yOcc(d.occ)]);
    const revPts: [number, number][] = data.map((d, i) => [xFor(i), yRev(d.rev)]);
    const occPath = smoothPath(occPts);
    const revPath = smoothPath(revPts);

    const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!wrapRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        const xPx = ((e.clientX - rect.left) / rect.width) * W;
        let best = 0, bd = Infinity;
        data.forEach((_, i) => { const dx = Math.abs(xFor(i) - xPx); if (dx < bd) { bd = dx; best = i; } });
        setHover(best);
    };

    return (
        <div ref={wrapRef} style={{ position: 'relative', aspectRatio: `${W} / ${H}` }}
             onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
                <defs>
                    <linearGradient id="occFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#378ADD" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#378ADD" stopOpacity="0" />
                    </linearGradient>
                </defs>
                {[0, 25, 50, 75, 100].map(t => (
                    <g key={t}>
                        <line x1={padL} x2={W - padR} y1={yOcc(t)} y2={yOcc(t)} stroke="#e8e7e0" strokeWidth="1" strokeDasharray={t === 0 ? '' : '3 4'} />
                        <text x={padL - 8} y={yOcc(t) + 4} textAnchor="end" fontSize="10" fill="#82817a" fontFamily="JetBrains Mono">{t}%</text>
                    </g>
                ))}
                {[0, 500, 1000, 1500, 2000].map(t => (
                    <text key={t} x={W - padR + 6} y={yRev(t) + 4} textAnchor="start" fontSize="10" fill="#82817a" fontFamily="JetBrains Mono">
                        {t === 0 ? '0' : `${(t / 1000).toFixed(t === 1000 ? 0 : 1)}k`}
                    </text>
                ))}
                <path d={`${occPath} L ${xFor(data.length - 1)} ${padT + innerH} L ${xFor(0)} ${padT + innerH} Z`} fill="url(#occFill)" />
                <path d={occPath} fill="none" stroke="#378ADD" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d={revPath} fill="none" stroke="#639922" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                {data.map((d, i) => (
                    <g key={i}>
                        <circle cx={xFor(i)} cy={yOcc(d.occ)} r={hover === i ? 5 : 3.5} fill="#fff" stroke="#378ADD" strokeWidth="2" />
                        <circle cx={xFor(i)} cy={yRev(d.rev)} r={hover === i ? 5 : 3.5} fill="#fff" stroke="#639922" strokeWidth="2" />
                    </g>
                ))}
                {hover !== null && (
                    <line x1={xFor(hover)} x2={xFor(hover)} y1={padT} y2={padT + innerH} stroke="#14130f" strokeWidth="1" strokeDasharray="3 3" opacity={0.2} />
                )}
                {data.map((d, i) => (
                    <text key={i} x={xFor(i)} y={H - 8} textAnchor="middle" fontSize="10.5"
                          fill={hover === i ? '#14130f' : '#82817a'} fontWeight={hover === i ? 700 : 500} fontFamily="Manrope">
                        {d.label}
                    </text>
                ))}
            </svg>
            {hover !== null && (
                <div style={{ position: 'absolute', left: `${(xFor(hover) / W) * 100}%`, top: `${(Math.min(yOcc(data[hover].occ), yRev(data[hover].rev)) / H) * 100}%`, transform: 'translate(-50%, calc(-100% - 8px))', background: '#1a1916', color: '#fff', padding: '8px 10px', borderRadius: 8, fontSize: 11.5, pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-lg)', zIndex: 5 }}>
                    <div style={{ color: '#9a988e', fontSize: 10.5, marginBottom: 4 }}>{data[hover].full}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: '#378ADD', display: 'inline-block' }} />
                        Ocupação <strong style={{ marginLeft: 'auto', paddingLeft: 8 }}>{data[hover].occ}%</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, marginTop: 2 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: '#639922', display: 'inline-block' }} />
                        Receita <strong style={{ marginLeft: 'auto', paddingLeft: 8 }}>R$ {data[hover].rev.toLocaleString('pt-BR')}</strong>
                    </div>
                </div>
            )}
        </div>
    );
}

function RoomTypeBar({ data, selected, onSelect }: { data: RoomTypeRow[]; selected: string | null; onSelect: (key: string | null) => void }) {
    const W = 560, H = 240, padL = 70, padR = 24, padT = 16, padB = 18;
    const innerW = W - padL - padR, innerH = H - padT - padB;
    const max  = Math.max(...data.map(d => d.value)) * 1.15;
    const bH   = innerH / data.length;
    const bw   = bH * 0.55;

    return (
        <div style={{ aspectRatio: `${W} / ${H}` }}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
                <defs>
                    {data.map((d, i) => (
                        <linearGradient key={i} id={`rbar-${i}`} x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor={d.color} />
                            <stop offset="100%" stopColor={d.color} stopOpacity="0.75" />
                        </linearGradient>
                    ))}
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
                    const x = padL + innerW * t;
                    return (
                        <g key={i}>
                            <line x1={x} x2={x} y1={padT} y2={padT + innerH} stroke="#e8e7e0" strokeWidth="1" strokeDasharray={t === 0 ? '' : '3 4'} />
                            <text x={x} y={H - 4} textAnchor="middle" fontSize="10" fill="#82817a" fontFamily="JetBrains Mono">
                                {max * t >= 1000 ? `${((max * t) / 1000).toFixed(1)}k` : Math.round(max * t)}
                            </text>
                        </g>
                    );
                })}
                {data.map((d, i) => {
                    const y    = padT + i * bH + (bH - bw) / 2;
                    const barW = (d.value / max) * innerW;
                    const isSel = selected === d.key;
                    return (
                        <g key={d.key} style={{ cursor: 'pointer' }} onClick={() => onSelect(isSel ? null : d.key)}>
                            <text x={padL - 10} y={y + bw / 2 + 4} textAnchor="end" fontSize="12.5" fill={isSel ? '#14130f' : '#4a4942'} fontWeight={isSel ? 700 : 600} fontFamily="Manrope">{d.label}</text>
                            <rect x={padL} y={y} width={innerW} height={bw} rx="5" fill="#f1f0ea" />
                            <rect x={padL} y={y} width={barW} height={bw} rx="5" fill={`url(#rbar-${i})`} opacity={isSel || !selected ? 1 : 0.5} />
                            <text x={padL + barW + 8} y={y + bw / 2 + 4} textAnchor="start" fontSize="12" fill="#14130f" fontWeight="700" fontFamily="JetBrains Mono">R$ {d.value.toLocaleString('pt-BR')}</text>
                            {barW > 60 && <text x={padL + barW - 6} y={y + bw / 2 + 4} textAnchor="end" fontSize="11" fill="#fff" fontWeight="700" fontFamily="JetBrains Mono">{d.pct}%</text>}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function SeasonalityChart({ data, forecast }: { data: SeasonPoint[]; forecast: SeasonPoint[] }) {
    const [hover, setHover] = useState<number | null>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const W = 1140, H = 260, padL = 40, padR = 16, padT = 18, padB = 30;
    const innerW = W - padL - padR, innerH = H - padT - padB;
    const all  = [...data, ...forecast];
    const xFor = (i: number) => padL + (i * innerW) / (all.length - 1);
    const yFor = (v: number) => padT + innerH - (v / 100) * innerH;
    const actualPts: [number, number][]   = data.map((d, i) => [xFor(i), yFor(d.value)]);
    const forecastPts: [number, number][] = forecast.map((d, i) => [xFor(data.length - 1 + i), yFor(d.value)]);
    const bridgePts  = [actualPts[actualPts.length - 1], ...forecastPts];
    const actualPath  = smoothPath(actualPts);
    const forecastPath= smoothPath(bridgePts);
    const areaPath    = `${actualPath} L ${actualPts[actualPts.length - 1][0]} ${padT + innerH} L ${actualPts[0][0]} ${padT + innerH} Z`;
    const forecastX   = xFor(data.length - 1);
    const step        = Math.ceil(all.length / 14);

    const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!wrapRef.current) return;
        const rect = wrapRef.current.getBoundingClientRect();
        const xPx = ((e.clientX - rect.left) / rect.width) * W;
        let best = 0, bd = Infinity;
        all.forEach((_, i) => { const dx = Math.abs(xFor(i) - xPx); if (dx < bd) { bd = dx; best = i; } });
        setHover(best);
    };

    return (
        <div ref={wrapRef} style={{ position: 'relative', aspectRatio: `${W} / ${H}` }}
             onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
                <defs>
                    <linearGradient id="seasFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7a5cd4" stopOpacity="0.20" />
                        <stop offset="100%" stopColor="#7a5cd4" stopOpacity="0" />
                    </linearGradient>
                    <pattern id="fcBand" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="6" stroke="#7a5cd4" strokeWidth="6" opacity={0.04} />
                    </pattern>
                </defs>
                <rect x={forecastX} y={padT} width={(W - padR) - forecastX} height={innerH} fill="url(#fcBand)" />
                {[0, 25, 50, 75, 100].map(t => (
                    <g key={t}>
                        <line x1={padL} x2={W - padR} y1={yFor(t)} y2={yFor(t)} stroke="#e8e7e0" strokeWidth="1" strokeDasharray={t === 0 ? '' : '3 4'} />
                        <text x={padL - 8} y={yFor(t) + 4} textAnchor="end" fontSize="10" fill="#82817a" fontFamily="JetBrains Mono">{t}%</text>
                    </g>
                ))}
                <line x1={forecastX} x2={forecastX} y1={padT} y2={padT + innerH} stroke="#7a5cd4" strokeWidth="1.25" strokeDasharray="2 4" opacity={0.6} />
                <text x={forecastX + 6} y={padT + 12} fontSize="10.5" fill="#4f3aa0" fontWeight="700" fontFamily="Manrope" letterSpacing="0.05em">PREVISÃO ↓</text>
                <path d={areaPath} fill="url(#seasFill)" />
                <path d={actualPath} fill="none" stroke="#7a5cd4" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
                <path d={forecastPath} fill="none" stroke="#7a5cd4" strokeWidth="2.25" strokeLinecap="round" strokeDasharray="5 5" opacity={0.75} />
                {actualPts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={hover === i ? 4.5 : 2.5} fill="#fff" stroke="#7a5cd4" strokeWidth="2" />)}
                {forecastPts.map((p, i) => <circle key={`f${i}`} cx={p[0]} cy={p[1]} r={hover === data.length + i ? 4.5 : 2.5} fill="#fbfbf6" stroke="#7a5cd4" strokeWidth="1.75" strokeDasharray="2 2" />)}
                {hover !== null && <line x1={xFor(hover)} x2={xFor(hover)} y1={padT} y2={padT + innerH} stroke="#14130f" strokeWidth="1" strokeDasharray="3 3" opacity={0.2} />}
                {all.map((d, i) => i % step !== 0 ? null : (
                    <text key={i} x={xFor(i)} y={H - 8} textAnchor="middle" fontSize="10" fill={hover === i ? '#14130f' : '#82817a'} fontWeight={hover === i ? 700 : 500} fontFamily="Manrope">{d.label}</text>
                ))}
            </svg>
            {hover !== null && (
                <div style={{ position: 'absolute', left: `${(xFor(hover) / W) * 100}%`, top: `${(yFor(all[hover].value) / H) * 100}%`, transform: 'translate(-50%, calc(-100% - 8px))', background: '#1a1916', color: '#fff', padding: '6px 10px', borderRadius: 8, fontSize: 12, pointerEvents: 'none', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-lg)' }}>
                    <div style={{ color: '#9a988e', fontSize: 10.5 }}>{all[hover].full}{hover >= data.length && ' · previsão'}</div>
                    <div style={{ fontWeight: 700, marginTop: 2 }}>{all[hover].value}% ocupação</div>
                </div>
            )}
        </div>
    );
}

function OriginDonut({ data }: { data: OriginPoint[] }) {
    const [hover, setHover] = useState<number | null>(null);
    const W = 260, H = 240, cx = W / 2, cy = H / 2, rO = 90, rI = 60;
    const total = data.reduce((a, b) => a + b.value, 0);
    let acc = 0;
    const slices = data.map(d => { const s = acc / total; acc += d.value; return { ...d, s, e: acc / total }; });

    const arc = (s: number, e: number, ro: number, ri: number) => {
        const a0 = s * 2 * Math.PI - Math.PI / 2, a1 = e * 2 * Math.PI - Math.PI / 2;
        const lg = e - s > 0.5 ? 1 : 0;
        const [x0, y0] = [cx + ro * Math.cos(a0), cy + ro * Math.sin(a0)];
        const [x1, y1] = [cx + ro * Math.cos(a1), cy + ro * Math.sin(a1)];
        const [x2, y2] = [cx + ri * Math.cos(a1), cy + ri * Math.sin(a1)];
        const [x3, y3] = [cx + ri * Math.cos(a0), cy + ri * Math.sin(a0)];
        return `M ${x0} ${y0} A ${ro} ${ro} 0 ${lg} 1 ${x1} ${y1} L ${x2} ${y2} A ${ri} ${ri} 0 ${lg} 0 ${x3} ${y3} Z`;
    };

    const hov = hover !== null ? slices[hover] : null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ flex: '0 0 auto' }}>
                {slices.map((sl, i) => (
                    <path key={i} d={arc(sl.s, sl.e, hover === i ? rO + 6 : rO, rI)} fill={sl.color}
                          style={{ cursor: 'pointer' }} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
                ))}
                {hov ? (
                    <g>
                        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="28" fontWeight="800" fill="#14130f" fontFamily="Manrope" letterSpacing="-0.02em">{hov.value}%</text>
                        <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="#82817a" fontFamily="Manrope" fontWeight="600">{hov.label}</text>
                    </g>
                ) : (
                    <g>
                        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="22" fontWeight="800" fill="#14130f" fontFamily="Manrope" letterSpacing="-0.02em">{total}</text>
                        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#82817a" fontFamily="Manrope" fontWeight="600">reservas</text>
                    </g>
                )}
            </svg>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.map((d, i) => (
                    <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
                         style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 6, background: hover === i ? '#f1f0ea' : 'transparent', transition: 'background .12s', cursor: 'pointer' }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flex: '0 0 10px' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#14130f' }}>{d.label}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#14130f', fontFamily: 'JetBrains Mono' }}>{d.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function KpiCards() {
    return (
        <div className="kpi-grid" style={{ marginBottom: 0 }}>
            <div className="kpi blue">
                <div className="kpi-accent" />
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
                <div className="kpi-accent" />
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
                <div className="kpi-accent" />
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
                <div className="kpi-accent" />
                <div className="kpi-head">
                    <div className="kpi-ico"><I.Warning size={20} stroke={2} /></div>
                    <div className="kpi-delta down"><IcoTrendDown size={12} /> −1,5 pts</div>
                </div>
                <div className="kpi-value">4,2%</div>
                <div className="kpi-label">Taxa de No-show</div>
                <div className="kpi-foot">
                    <div className="row"><span>6 no-shows em 142 reservas</span><strong /></div>
                    <div className="row"><span>Previsão próximo mês</span><strong>≈ 2%</strong></div>
                </div>
            </div>
        </div>
    );
}

// ─── FiltersRow ───────────────────────────────────────────────────────────────

interface FiltersRowProps {
    period: Period; setPeriod: (p: Period) => void;
    roomType: string; setRoomType: (v: string) => void;
    sortBy: string; setSortBy: (v: string) => void;
    refreshing: boolean; onRefresh: () => void;
    exportOpen: boolean; setExportOpen: (v: boolean) => void;
    onExport: (fmt: string) => void; onEmail: () => void;
}

function FiltersRow({ period, setPeriod, roomType, setRoomType, sortBy, setSortBy, refreshing, onRefresh, exportOpen, setExportOpen, onExport, onEmail }: FiltersRowProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    return (
        <div className="rpt-filters">
            <div className="rpt-filter-group">
                <span className="rpt-filter-label">Período</span>
                <div className="segmented">
                    {([['7d','7 dias'],['14d','14 dias'],['30d','30 dias'],['3m','3 meses']] as [Period, string][]).map(([id, label]) => (
                        <button key={id} className={period === id ? 'active' : ''} onClick={() => setPeriod(id)}>{label}</button>
                    ))}
                </div>
            </div>
            <div className="rpt-filter-group">
                <span className="rpt-filter-label">Quarto</span>
                <select className="select" value={roomType} onChange={e => setRoomType(e.target.value)}>
                    <option value="todos">Todos os tipos</option>
                    <option value="single">Single</option>
                    <option value="duplo">Duplo</option>
                    <option value="suite">Suíte</option>
                </select>
            </div>
            <div className="rpt-filter-group">
                <span className="rpt-filter-label">Ordenar</span>
                <select className="select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="receita">Receita</option>
                    <option value="ocupacao">Ocupação</option>
                    <option value="satisfacao">Satisfação</option>
                </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="btn" onClick={onRefresh} disabled={refreshing}>
                    <span className={refreshing ? 'spin' : ''} style={{ display: 'inline-grid', placeItems: 'center' }}><I.Refresh size={15} /></span>
                    {refreshing ? 'Atualizando…' : 'Atualizar'}
                </button>
                <div className="rpt-export-menu" ref={menuRef}>
                    <button className="btn" onClick={() => setExportOpen(!exportOpen)}>
                        <I.ArrowDownTray size={15} /> Exportar <I.ChevronDown size={14} />
                    </button>
                    {exportOpen && (
                        <div className="rpt-menu">
                            <div className="rpt-menu-head">Baixar Como</div>
                            <button className="rpt-menu-item" onClick={() => { onExport('pdf'); setExportOpen(false); }}><IcoFileText size={16} /> PDF — Relatório formatado</button>
                            <button className="rpt-menu-item" onClick={() => { onExport('xlsx'); setExportOpen(false); }}><IcoSheet size={16} /> Excel — Planilha (.xlsx)</button>
                            <button className="rpt-menu-item" onClick={() => { onExport('csv'); setExportOpen(false); }}><IcoCsv size={16} /> CSV — Dados brutos</button>
                        </div>
                    )}
                </div>
                <button className="btn primary" onClick={onEmail}><IcoMail size={15} /> Enviar por Email</button>
            </div>
        </div>
    );
}

// ─── Detail tables ────────────────────────────────────────────────────────────

function DeltaChip({ up, delta }: { up: DeltaDir; delta: string }) {
    const cls = up === null ? 'flat' : up ? 'up' : 'down';
    const arrow = up === null ? '→' : up ? '▲' : '▼';
    return <span className={`delta-chip ${cls}`}>{arrow} {delta}</span>;
}

function ReceitaTable({ picked }: { picked: string | null }) {
    const totals = TAB_RECEITA.reduce((a, r) => ({ single: a.single + r.single, duplo: a.duplo + r.duplo, suite: a.suite + r.suite, total: a.total + r.total }), { single: 0, duplo: 0, suite: 0, total: 0 });
    const hl = (col: string) => picked === col ? { background: col === 'single' ? '#eaf3fc' : col === 'duplo' ? '#eef5e3' : '#f0ebfb' } : {};

    return (
        <div className="rpt-table-card">
            <div className="rpt-table-head">
                <div><div style={{ fontWeight: 700, fontSize: 14 }}>Receita Detalhada por Dia</div><div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Valores em BRL · 7 dias</div></div>
                <button className="btn sm"><I.ArrowDownTray size={13} /> Baixar CSV</button>
            </div>
            <div className="rpt-table-scroll">
                <table className="rpt-data">
                    <thead><tr><th>Data</th><th className="right" style={hl('single')}>Single</th><th className="right" style={hl('duplo')}>Duplo</th><th className="right" style={hl('suite')}>Suíte</th><th className="right">Total</th><th className="right">Média / quarto</th></tr></thead>
                    <tbody>
                        {TAB_RECEITA.map(r => {
                            const nonZero = [r.single, r.duplo, r.suite].filter(v => v > 0).length;
                            return (
                                <tr key={r.date}>
                                    <td><span className="mono">{r.date}</span></td>
                                    <td className="right mono" style={hl('single')}>{r.single ? `R$ ${r.single}` : <span style={{ color: 'var(--ink-4)' }}>—</span>}</td>
                                    <td className="right mono" style={hl('duplo')}>R$ {r.duplo}</td>
                                    <td className="right mono" style={hl('suite')}>R$ {r.suite}</td>
                                    <td className="right mono" style={{ fontWeight: 700 }}>R$ {r.total.toLocaleString('pt-BR')}</td>
                                    <td className="right mono" style={{ color: 'var(--ink-3)' }}>R$ {Math.round(r.total / nonZero).toLocaleString('pt-BR')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot><tr>
                        <td>Total no período</td>
                        <td className="right mono">R$ {totals.single.toLocaleString('pt-BR')}</td>
                        <td className="right mono">R$ {totals.duplo.toLocaleString('pt-BR')}</td>
                        <td className="right mono">R$ {totals.suite.toLocaleString('pt-BR')}</td>
                        <td className="right mono" style={{ color: 'var(--blue-ink)' }}>R$ {totals.total.toLocaleString('pt-BR')}</td>
                        <td className="right mono" style={{ color: 'var(--ink-3)', fontWeight: 600 }}>R$ {Math.round(totals.total / TAB_RECEITA.length).toLocaleString('pt-BR')} / dia</td>
                    </tr></tfoot>
                </table>
            </div>
        </div>
    );
}

function OcupacaoTable() {
    return (
        <div className="rpt-table-card">
            <div className="rpt-table-head">
                <div><div style={{ fontWeight: 700, fontSize: 14 }}>Ocupação Diária</div><div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Inventário fixo de 50 quartos · variação vs. dia anterior</div></div>
                <button className="btn sm"><I.ArrowDownTray size={13} /> Baixar CSV</button>
            </div>
            <div className="rpt-table-scroll">
                <table className="rpt-data">
                    <thead><tr><th>Data</th><th className="right">Total quartos</th><th className="right">Ocupados</th><th>Taxa</th><th className="right">Variação</th></tr></thead>
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
                                            <div style={{ width: `${r.taxa}%`, height: '100%', background: r.taxa >= 80 ? 'var(--green)' : r.taxa >= 65 ? 'var(--blue)' : 'var(--orange)', borderRadius: 4 }} />
                                        </div>
                                    </div>
                                </td>
                                <td className="right"><DeltaChip up={r.up} delta={`${r.delta} pts`} /></td>
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
        <div className="rpt-table-card">
            <div className="rpt-table-head">
                <div><div style={{ fontWeight: 700, fontSize: 14 }}>Métricas de Hóspedes</div><div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Hóspedes únicos e comportamento no período</div></div>
                <button className="btn sm"><I.ArrowDownTray size={13} /> Baixar CSV</button>
            </div>
            <div className="rpt-table-scroll">
                <table className="rpt-data">
                    <thead><tr><th>Métrica</th><th className="right">Valor</th><th className="right">Variação</th><th>Observação</th></tr></thead>
                    <tbody>
                        {TAB_HOSPEDES.map(r => (
                            <tr key={r.k}>
                                <td style={{ fontWeight: 600 }}>{r.k}</td>
                                <td className="right mono" style={{ fontWeight: 700 }}>{r.v}</td>
                                <td className="right"><DeltaChip up={r.up} delta={r.delta} /></td>
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
        <div className="rpt-table-card">
            <div className="rpt-table-head">
                <div><div style={{ fontWeight: 700, fontSize: 14 }}>Desempenho da Equipe</div><div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Tarefas concluídas, satisfação e produtividade no período</div></div>
                <button className="btn sm"><I.ArrowDownTray size={13} /> Baixar CSV</button>
            </div>
            <div className="rpt-table-scroll">
                <table className="rpt-data">
                    <thead><tr><th>Colaborador</th><th className="right">Tarefas</th><th className="right">Taxa Sucesso</th><th>Satisfação</th><th>Produtividade</th></tr></thead>
                    <tbody>
                        {TAB_EQUIPE.map(s => (
                            <tr key={s.name}>
                                <td>
                                    <div className="cell-guest">
                                        <div className={`avatar sm ${s.av}`}>{s.init}</div>
                                        <div><div className="cell-name">{s.name}</div><div className="cell-name-sub">{s.role}</div></div>
                                    </div>
                                </td>
                                <td className="right mono">{s.tasks}</td>
                                <td className="right"><span className={`delta-chip ${s.succ >= 95 ? 'up' : s.succ >= 90 ? 'flat' : 'down'}`}>{s.succ}%</span></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span className="mono" style={{ fontWeight: 700, minWidth: 40 }}>{s.sat.toFixed(1)}/5</span>
                                        <div style={{ display: 'flex', gap: 2 }}>
                                            {[0,1,2,3,4].map(i => (
                                                <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i < Math.round(s.sat) ? '#d8b22b' : '#e8e7e0'} stroke="none"><path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.6 19.6l1-6L3.3 9.4l6-.9L12 3z" /></svg>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span className="mono" style={{ fontWeight: 700, minWidth: 80 }}>{s.prod} qtos/dia</span>
                                        <div style={{ flex: 1, height: 6, background: '#f1f0ea', borderRadius: 3, overflow: 'hidden', maxWidth: 180 }}>
                                            <div style={{ width: `${(s.prod / maxProd) * 100}%`, height: '100%', background: s.prod === maxProd ? 'var(--green)' : 'var(--blue)', borderRadius: 3 }} />
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
            <div className="rpt-table-card">
                <div className="rpt-table-head">
                    <div><div style={{ fontWeight: 700, fontSize: 14 }}>Indicadores de Satisfação</div><div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Pesquisa pós-checkout · 87 respostas</div></div>
                    <button className="btn sm"><I.ArrowDownTray size={13} /> Baixar CSV</button>
                </div>
                <div className="rpt-table-scroll">
                    <table className="rpt-data">
                        <thead><tr><th>Métrica</th><th className="right">Valor</th><th className="right">Tendência</th><th>Observação</th></tr></thead>
                        <tbody>
                            {TAB_SATISFACAO.map(r => (
                                <tr key={r.k}>
                                    <td style={{ fontWeight: 600 }}>{r.k}</td>
                                    <td className="right mono" style={{ fontWeight: 700 }}>{r.v}</td>
                                    <td className="right"><DeltaChip up={r.up} delta={r.delta} /></td>
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
                        <div key={i} style={{ padding: 12, borderRadius: 10, background: h.kind === 'good' ? 'var(--green-soft)' : 'var(--red-soft)', border: `1px solid ${h.kind === 'good' ? 'rgba(99,153,34,0.25)' : 'rgba(226,75,74,0.22)'}` }}>
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

// ─── Insights ─────────────────────────────────────────────────────────────────

function Insights({ showToast }: { showToast: (msg: string) => void }) {
    return (
        <div className="insights-grid">
            <div className="insight">
                <div className="insight-top">
                    <div className="insight-icn good"><IcoTrendUp size={20} /></div>
                    <div style={{ flex: 1 }}><span className="insight-tag good">Tendência positiva</span><h4 className="insight-title">Ocupação crescendo</h4></div>
                </div>
                <p className="insight-body">Últimos 7 dias com média de <strong>76%</strong> — alta consistente acima da meta de 70%. Sexta-feira atingiu pico histórico de <strong>89%</strong>.</p>
                <div className="insight-actions">
                    <button className="btn sm">Ver detalhes</button>
                    <button className="btn ghost sm">Compartilhar</button>
                </div>
            </div>
            <div className="insight">
                <div className="insight-top">
                    <div className="insight-icn alert"><I.Warning size={20} /></div>
                    <div style={{ flex: 1 }}><span className="insight-tag alert">Atenção necessária</span><h4 className="insight-title">Quarto 203 com reclamações</h4></div>
                </div>
                <p className="insight-body"><strong>5 avaliações baixas</strong> nos últimos 30 dias mencionando <strong>barulho</strong>. NPS deste quarto: 4,2 (média geral 8,2).</p>
                <div className="insight-actions">
                    <button className="btn sm" onClick={() => showToast('Investigação aberta para quarto 203')}>Investigar</button>
                    <button className="btn sm" onClick={() => showToast('Manutenção solicitada para quarto 203')}><I.Tools size={13} /> Manutenção</button>
                </div>
            </div>
            <div className="insight">
                <div className="insight-top">
                    <div className="insight-icn info"><I.Star size={20} /></div>
                    <div style={{ flex: 1 }}><span className="insight-tag info">Destaque do mês</span><h4 className="insight-title">Maria lidera a equipe</h4></div>
                </div>
                <p className="insight-body">Maior satisfação <strong>(4,8/5)</strong> e produtividade <strong>(16 quartos/dia)</strong> — 100% de taxa de sucesso em 32 tarefas concluídas.</p>
                <div className="insight-actions">
                    <button className="btn sm">Ver perfil</button>
                    <button className="btn ghost sm" onClick={() => showToast('Reconhecimento enviado para Maria')}><I.Sparkles size={13} /> Reconhecer</button>
                </div>
            </div>
        </div>
    );
}

// ─── Export panel ─────────────────────────────────────────────────────────────

function ExportPanel({ showToast }: { showToast: (msg: string) => void }) {
    const [sections, setSections] = useState({ resumo: true, graficos: true, tabelas: true, equipe: true, feedback: true });
    const [format, setFormat]         = useState('pdf');
    const [periodicity, setPeriodicity] = useState('weekly');
    const [email, setEmail]           = useState('mariana@maranzul.com.br');
    const toggle = (k: keyof typeof sections) => setSections(s => ({ ...s, [k]: !s[k] }));
    const checked = Object.values(sections).filter(Boolean).length;

    const onGenerate = () => {
        const freq = periodicity === 'none' ? 'sem envio' : `envio ${periodicity === 'weekly' ? 'semanal' : 'mensal'} para ${email}`;
        showToast(`Relatório ${format.toUpperCase()} gerado · ${checked} seções · ${freq}`);
    };

    const SECTION_LIST = [
        { id: 'resumo'   as const, label: 'Resumo Executivo',   sub: '4 KPIs principais' },
        { id: 'graficos' as const, label: 'Gráficos',            sub: '4 visualizações' },
        { id: 'tabelas'  as const, label: 'Tabelas Detalhadas',  sub: 'Receita e ocupação' },
        { id: 'equipe'   as const, label: 'Análise de Equipe',   sub: '5 colaboradores' },
        { id: 'feedback' as const, label: 'Feedback de Clientes',sub: 'NPS + comentários' },
    ];

    return (
        <div className="export-panel">
            <div>
                <div className="export-head">
                    <h3>Exportar Relatório Completo</h3>
                    <p>Monte um pacote com as seções que você precisa e agende envios automáticos por email.</p>
                </div>
                <div className="export-block">
                    <div className="export-block-title">Seções incluídas <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>({checked}/5)</span></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {SECTION_LIST.map(o => (
                            <div key={o.id} className={`check-row ${sections[o.id] ? 'on' : ''}`} onClick={() => toggle(o.id)} role="checkbox" aria-checked={sections[o.id]} tabIndex={0} onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(o.id); } }}>
                                <div className="check-box">{sections[o.id] && <I.Check size={12} stroke={3} />}</div>
                                <div className="check-text">{o.label}</div>
                                <div className="check-sub">{o.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div>
                <div className="export-block">
                    <div className="export-block-title">Formato</div>
                    <div className="format-grid">
                        {([['pdf','PDF','Ideal para impressão'],['xlsx','Excel','Análise avançada'],['csv','CSV','Outras ferramentas']] as const).map(([id, name, desc]) => (
                            <button key={id} className={`format-card ${id} ${format === id ? 'on' : ''}`} onClick={() => setFormat(id)}>
                                <div className="icn">{id === 'pdf' ? <IcoFileText size={18} /> : id === 'xlsx' ? <IcoSheet size={18} /> : <IcoCsv size={18} />}</div>
                                <div className="name">{name}</div>
                                <div className="desc">{desc}</div>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="export-block">
                    <div className="export-block-title">Envio Automático</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {([['none','Não enviar','gerar apenas uma vez'],['weekly','Semanalmente','toda segunda-feira 08:00'],['monthly','Mensalmente','dia 1º de cada mês']] as const).map(([id, label, sub]) => (
                            <div key={id} className={`radio-row ${periodicity === id ? 'on' : ''}`} onClick={() => setPeriodicity(id)} role="radio" aria-checked={periodicity === id} tabIndex={0} onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPeriodicity(id); } }}>
                                <div className="radio-circle" />
                                <div className="check-text">{label}</div>
                                <div className="check-sub">{sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
                {periodicity !== 'none' && (
                    <div className="export-block">
                        <div className="export-block-title">Enviar para</div>
                        <div className="input-wrap">
                            <span className="ico-left"><IcoMail size={16} /></span>
                            <input className="input has-left" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com.br" />
                        </div>
                    </div>
                )}
            </div>

            <div className="export-cta">
                <div className="meta">
                    <strong>{checked}</strong> seções · formato <strong>{format.toUpperCase()}</strong> ·{' '}
                    {periodicity === 'none' ? 'sem envio recorrente' : <>envio <strong>{periodicity === 'weekly' ? 'semanal' : 'mensal'}</strong> para <strong>{email}</strong></>}
                </div>
                <button className="btn primary lg" disabled={checked === 0} onClick={onGenerate}>
                    <I.ArrowDownTray size={16} /> Gerar Relatório
                </button>
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PERIOD_LABEL: Record<Period, string> = { '7d': 'Últimos 7 dias', '14d': 'Últimos 14 dias', '30d': 'Últimos 30 dias', '3m': 'Últimos 3 meses' };

const TABS: { id: TabId; label: string; count: number }[] = [
    { id: 'receita',    label: 'Receita',    count: 7 },
    { id: 'ocupacao',   label: 'Ocupação',   count: 7 },
    { id: 'hospedes',   label: 'Hóspedes',   count: 6 },
    { id: 'equipe',     label: 'Equipe',     count: 5 },
    { id: 'satisfacao', label: 'Satisfação', count: 5 },
];

export default function RelatoriosIndex() {
    const [period, setPeriod]         = useState<Period>('7d');
    const [roomType, setRoomType]     = useState('todos');
    const [sortBy, setSortBy]         = useState('receita');
    const [refreshing, setRefreshing] = useState(false);
    const [exportOpen, setExportOpen] = useState(false);
    const [tab, setTab]               = useState<TabId>('receita');
    const [picked, setPicked]         = useState<string | null>(null);
    const [toast, setToast]           = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };
    const onRefresh = () => {
        if (refreshing) return;
        setRefreshing(true);
        showToast('Atualizando dados…');
        setTimeout(() => { setRefreshing(false); showToast('Dados atualizados às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })); }, 1200);
    };
    const onPickRoomType = (key: string | null) => { setPicked(key); if (key) setTab('receita'); };

    return (
        <AppLayout title="Relatórios" breadcrumb={[{ label: 'Relatórios & Análises' }]}>
            <div className="page">
                <div className="page-head">
                    <div>
                        <h1 className="page-title">Relatórios &amp; Análises</h1>
                        <div className="page-sub">
                            <span>{PERIOD_LABEL[period]}</span><span>·</span>
                            <span>19 mai – 25 mai 2026</span><span>·</span>
                            <span>142 reservas analisadas</span>
                        </div>
                    </div>
                </div>

                <FiltersRow period={period} setPeriod={setPeriod} roomType={roomType} setRoomType={setRoomType}
                            sortBy={sortBy} setSortBy={setSortBy} refreshing={refreshing} onRefresh={onRefresh}
                            exportOpen={exportOpen} setExportOpen={setExportOpen}
                            onExport={fmt => showToast(`Exportando relatório em ${fmt.toUpperCase()}…`)}
                            onEmail={() => showToast('Relatório enviado por email para mariana@maranzul.com.br')} />

                <div className="rpt-section">Resumo Executivo</div>
                <KpiCards />

                <div className="rpt-section">Visualizações</div>
                <div className="charts-grid">
                    <div className="panel">
                        <div className="panel-head">
                            <div><h3 className="panel-title">Ocupação vs Receita</h3><div className="panel-sub">Comparativo diário · últimos 7 dias</div></div>
                            <div className="legend-row">
                                <div className="legend-item"><span className="legend-line" style={{ background: '#378ADD' }} />Ocupação %</div>
                                <div className="legend-item"><span className="legend-line" style={{ background: '#639922' }} />Receita R$</div>
                            </div>
                        </div>
                        <DualAxisChart data={DUAL_DATA} />
                    </div>
                    <div className="panel">
                        <div className="panel-head">
                            <div>
                                <h3 className="panel-title">Receita por Tipo de Quarto</h3>
                                <div className="panel-sub">
                                    {picked
                                        ? <span>Filtrado: <strong>{ROOM_TYPE.find(r => r.key === picked)?.label}</strong> · <button onClick={() => onPickRoomType(null)} style={{ border: 'none', background: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 700 }}>limpar</button></span>
                                        : 'Clique numa barra para filtrar a tabela'}
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Total <strong style={{ color: 'var(--ink)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>R$ 18.450</strong></div>
                        </div>
                        <RoomTypeBar data={ROOM_TYPE} selected={picked} onSelect={onPickRoomType} />
                    </div>
                    <div className="panel" style={{ gridColumn: '1 / -1' }}>
                        <div className="panel-head">
                            <div><h3 className="panel-title">Sazonalidade — Ocupação no Período</h3><div className="panel-sub">30 dias reais + previsão para 7 dias seguintes</div></div>
                            <div className="legend-row">
                                <div className="legend-item"><span className="legend-line" style={{ background: '#7a5cd4' }} />Real</div>
                                <div className="legend-item"><span className="legend-line dashed" style={{ color: '#7a5cd4' }} />Previsão</div>
                            </div>
                        </div>
                        <SeasonalityChart data={SEASONALITY} forecast={FORECAST} />
                    </div>
                    <div className="panel" style={{ gridColumn: '1 / -1' }}>
                        <div className="panel-head">
                            <div><h3 className="panel-title">Origem das Reservas</h3><div className="panel-sub">142 reservas no período · passe o mouse para detalhar</div></div>
                        </div>
                        <OriginDonut data={ORIGIN_DATA} />
                    </div>
                </div>

                <div className="rpt-section">Análise Detalhada</div>
                <div className="tabs-strip" role="tablist">
                    {TABS.map(t => (
                        <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
                            {t.label} <span className="count">{t.count}</span>
                        </button>
                    ))}
                </div>
                {tab === 'receita'    && <ReceitaTable picked={picked} />}
                {tab === 'ocupacao'   && <OcupacaoTable />}
                {tab === 'hospedes'   && <HospedesTable />}
                {tab === 'equipe'     && <EquipeTable />}
                {tab === 'satisfacao' && <SatisfacaoTable />}

                <div className="rpt-section">Insights &amp; Recomendações</div>
                <Insights showToast={showToast} />

                <div className="rpt-section">Exportar &amp; Agendar</div>
                <ExportPanel showToast={showToast} />

                {toast && (
                    <div className="toast success"><I.Check size={16} stroke={2.5} />{toast}</div>
                )}
            </div>
        </AppLayout>
    );
}
