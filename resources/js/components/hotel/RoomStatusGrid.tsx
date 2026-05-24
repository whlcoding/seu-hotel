import type { RoomStatus } from '@/types/hotel';

// ─── Types ────────────────────────────────────────────────────────────────────

type RoomCell = { n: string; st: RoomStatus };

const COLORS: Record<RoomStatus, { bg: string; dot: string; label: string }> = {
    occupied:    { bg: 'var(--blue-soft)',   dot: '#378ADD', label: 'Ocupado' },
    available:   { bg: '#f6f6f3',            dot: '#b3b2a9', label: 'Disponível' },
    cleaning:    { bg: 'var(--orange-soft)', dot: '#BA7517', label: 'Em limpeza' },
    reserved:    { bg: 'var(--green-soft)',  dot: '#639922', label: 'Reservado' },
    maintenance: { bg: 'var(--red-soft)',    dot: '#E24B4A', label: 'Manutenção' },
};

// ─── Deterministic random for consistent demo ─────────────────────────────────

function roomRng() {
    let s = 7;
    return () => {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

function buildRooms(): RoomCell[][] {
    const r = roomRng();
    const floors = [4, 3, 2, 1, 0];
    return floors.map((f) => {
        return Array.from({ length: 10 }, (_, i) => {
            const rv = r();
            let st: RoomStatus;
            if (rv < 0.55)       st = 'occupied';
            else if (rv < 0.75)  st = 'available';
            else if (rv < 0.85)  st = 'cleaning';
            else if (rv < 0.92)  st = 'reserved';
            else                 st = 'maintenance';
            return { n: `${f + 1}${String(i + 1).padStart(2, '0')}`, st };
        });
    });
}

const ROOMS = buildRooms();

// ─── Component ────────────────────────────────────────────────────────────────

export default function RoomStatusGrid() {
    return (
        <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ROOMS.map((row, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, fontFamily: 'JetBrains Mono' }}>
                            F{ROOMS.length - i}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, flex: 1 }}>
                            {row.map((r) => (
                                <div
                                    key={r.n}
                                    title={`Quarto ${r.n} · ${COLORS[r.st].label}`}
                                    style={{
                                        background: COLORS[r.st].bg,
                                        border: `1px solid ${COLORS[r.st].dot}33`,
                                        borderRadius: 5,
                                        padding: '6px 0',
                                        textAlign: 'center',
                                        fontSize: 10.5,
                                        fontWeight: 600,
                                        color: 'var(--ink-2)',
                                        fontFamily: 'JetBrains Mono',
                                        cursor: 'pointer',
                                        transition: 'transform .12s ease',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.transform = '')}
                                >
                                    {r.n}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
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
