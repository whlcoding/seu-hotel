// 7-day occupancy area chart with interactive tooltips
const { useState, useMemo, useRef } = React;

function OccupancyChart({ data, style = 'area' }) {
  const [hover, setHover] = useState(null);
  const W = 720, H = 240;
  const padL = 40, padR = 16, padT = 14, padB = 32;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxY = 100;
  const minY = 0;

  const xFor = (i) => padL + (i * innerW) / (data.length - 1);
  const yFor = (v) => padT + innerH - ((v - minY) / (maxY - minY)) * innerH;

  // Smooth path (Catmull-Rom -> Bezier)
  const path = useMemo(() => {
    const pts = data.map((d, i) => [xFor(i), yFor(d.value)]);
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || pts[i + 1];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
    }
    return d;
  }, [data]);

  const areaPath = useMemo(() => {
    return `${path} L ${xFor(data.length - 1)} ${padT + innerH} L ${xFor(0)} ${padT + innerH} Z`;
  }, [path]);

  const wrapRef = useRef(null);

  const handleMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const xPx = ((e.clientX - rect.left) / rect.width) * W;
    // find nearest point
    let best = 0, bd = Infinity;
    data.forEach((d, i) => {
      const dx = Math.abs(xFor(i) - xPx);
      if (dx < bd) { bd = dx; best = i; }
    });
    setHover(best);
  };
  const handleLeave = () => setHover(null);

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="chart-wrap" ref={wrapRef}
         onMouseMove={handleMove} onMouseLeave={handleLeave}
         style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="occGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#378ADD" stopOpacity="0.28"/>
            <stop offset="100%" stopColor="#378ADD" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Y gridlines */}
        {yTicks.map(t => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={yFor(t)} y2={yFor(t)}
                  stroke="#e8e7e0" strokeWidth="1"
                  strokeDasharray={t === 100 ? "" : "3 4"} />
            <text x={padL - 8} y={yFor(t) + 4} textAnchor="end"
                  fontSize="11" fill="#82817a" fontFamily="JetBrains Mono">{t}%</text>
          </g>
        ))}

        {/* Target line at 70% */}
        <line x1={padL} x2={W - padR} y1={yFor(70)} y2={yFor(70)}
              stroke="#639922" strokeWidth="1.25" strokeDasharray="4 5" opacity="0.55"/>
        <text x={W - padR - 4} y={yFor(70) - 5} textAnchor="end"
              fontSize="10" fill="#436817" fontWeight="600" fontFamily="Manrope">Meta 70%</text>

        {/* Area */}
        {style === 'area' && <path d={areaPath} fill="url(#occGrad)" />}

        {/* Bars (alt style) */}
        {style === 'bars' && data.map((d, i) => {
          const bw = innerW / data.length * 0.55;
          return (
            <rect key={i}
                  x={xFor(i) - bw / 2}
                  y={yFor(d.value)}
                  width={bw}
                  height={padT + innerH - yFor(d.value)}
                  rx="3"
                  fill={d.value >= 70 ? "#378ADD" : "#9bbfe6"} />
          );
        })}

        {/* Line */}
        {style !== 'bars' && (
          <path d={path} fill="none" stroke="#378ADD" strokeWidth="2.25"
                strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xFor(i)} cy={yFor(d.value)} r={hover === i ? 6 : 4}
                    fill="#fff" stroke="#378ADD" strokeWidth="2" />
          </g>
        ))}

        {/* Hover guide */}
        {hover !== null && (
          <line x1={xFor(hover)} x2={xFor(hover)} y1={padT} y2={padT + innerH}
                stroke="#14130f" strokeWidth="1" strokeDasharray="3 3" opacity="0.18" />
        )}

        {/* X labels */}
        {data.map((d, i) => (
          <text key={i} x={xFor(i)} y={H - 10} textAnchor="middle"
                fontSize="11.5" fill={hover === i ? "#14130f" : "#82817a"}
                fontWeight={hover === i ? 700 : 500} fontFamily="Manrope">
            {d.label}
          </text>
        ))}
      </svg>

      {hover !== null && (
        <div className="chart-tooltip"
             style={{
               left: `${(xFor(hover) / W) * 100}%`,
               top: `${(yFor(data[hover].value) / H) * 100}%`,
               marginTop: '-12px'
             }}>
          <div className="t-day">{data[hover].full}</div>
          <div className="t-val">{data[hover].value}% &middot; {data[hover].rooms} quartos</div>
        </div>
      )}
    </div>
  );
}

window.OccupancyChart = OccupancyChart;
