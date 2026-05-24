import type { KpiData } from '@/types/hotel';
import { I, type IconName } from '@/components/ui/Icons';

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ values, color }: { values: number[]; color: string }) {
    const W = 80, H = 28;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const step = W / (values.length - 1);
    const pts = values.map((v, i) => [i * step, H - 2 - ((v - min) / range) * (H - 4)] as [number, number]);
    const d = pts.reduce(
        (acc, p, i) => acc + (i === 0 ? `M ${p[0]} ${p[1]}` : ` L ${p[0]} ${p[1]}`),
        '',
    );
    return (
        <svg className="kpi-sparkline" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

const SPARKLINE_COLORS: Record<string, string> = {
    blue:   '#378ADD',
    green:  '#639922',
    orange: '#BA7517',
    purple: '#7a5cd4',
};

// ─── KpiCard ──────────────────────────────────────────────────────────────────

interface KpiCardProps extends KpiData {
    showSparkline?: boolean;
}

export default function KpiCard({
    tone, icon, value, label, sub,
    delta, deltaDir, spark,
    showSparkline = true,
}: KpiCardProps) {
    const IconC = I[icon as IconName];

    return (
        <div className={`kpi ${tone}`} tabIndex={0}>
            {showSparkline && spark && spark.length > 1 && (
                <Sparkline values={spark} color={SPARKLINE_COLORS[tone]} />
            )}
            <div className="kpi-head">
                <div className="kpi-ico">
                    {IconC && <IconC size={20} stroke={2} />}
                </div>
                {delta && (
                    <div className={`kpi-delta ${deltaDir === 'up' ? 'up' : 'down'}`}>
                        {deltaDir === 'up' ? '▲' : '▼'} {delta}
                    </div>
                )}
            </div>
            <div className="kpi-value">{value}</div>
            <div className="kpi-label">{label}</div>
            <div className="kpi-sub">{sub}</div>
        </div>
    );
}
