import type { RoomStatus, RoomSummary } from '@/types/hotel';

// ─── Config ───────────────────────────────────────────────────────────────────

const COLORS: Record<RoomStatus, { bg: string; dot: string; label: string }> = {
    occupied:    { bg: 'var(--blue-soft)',   dot: '#378ADD', label: 'Ocupado' },
    available:   { bg: '#f6f6f3',            dot: '#b3b2a9', label: 'Disponível' },
    cleaning:    { bg: 'var(--orange-soft)', dot: '#BA7517', label: 'Em limpeza' },
    reserved:    { bg: 'var(--green-soft)',  dot: '#639922', label: 'Reservado' },
    maintenance: { bg: 'var(--red-soft)',    dot: '#E24B4A', label: 'Manutenção' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface FloorRow {
    floor: number;
    items: RoomSummary[];
}

function groupByFloor(rooms: RoomSummary[]): FloorRow[] {
    const map = new Map<number, RoomSummary[]>();
    for (const r of rooms) {
        if (!map.has(r.floor)) map.set(r.floor, []);
        map.get(r.floor)!.push(r);
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => b - a)
        .map(([floor, items]) => ({ floor, items }));
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
    rooms: RoomSummary[];
}

export default function RoomStatusGrid({ rooms }: Props) {
    const floors = groupByFloor(rooms);

    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {floors.map(({ floor, items }) => (
                    <div key={floor} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, fontFamily: 'JetBrains Mono' }}>
                            F{floor}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 4, flex: 1 }}>
                            {items.map((r) => (
                                <div
                                    key={r.number}
                                    title={`Quarto ${r.number} · ${COLORS[r.status].label}`}
                                    style={{
                                        background: COLORS[r.status].bg,
                                        border: `1px solid ${COLORS[r.status].dot}33`,
                                        borderRadius: 5,
                                        padding: '6px 0',
                                        textAlign: 'center',
                                        fontSize: 10.5,
                                        fontWeight: 600,
                                        color: 'var(--ink-2)',
                                        fontFamily: 'JetBrains Mono',
                                        cursor: 'default',
                                        transition: 'transform .12s ease',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
                                >
                                    {r.number}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="status-row" style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                {Object.entries(COLORS).map(([k, v]) => (
                    <div key={k} className="status-item">
                        <span className="status-dot" style={{ background: v.dot }} />
                        {v.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
