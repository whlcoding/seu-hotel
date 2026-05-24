// Charts for Relatórios screen
const { useState: useStateRC, useMemo: useMemoRC, useRef: useRefRC } = React;

// Catmull-Rom smooth path
function smoothPath(pts) {
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
}

// ============== DUAL AXIS: Occupancy vs Revenue ==============
function DualAxisChart({ data }) {
  const [hover, setHover] = useStateRC(null);
  const W = 560, H = 240;
  const padL = 38, padR = 44, padT = 16, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const wrapRef = useRefRC(null);

  const maxOcc = 100;
  const maxRev = 2000; // R$
  const xFor = (i) => padL + (i * innerW) / (data.length - 1);
  const yOcc = (v) => padT + innerH - (v / maxOcc) * innerH;
  const yRev = (v) => padT + innerH - (v / maxRev) * innerH;

  const occPath = useMemoRC(() => smoothPath(data.map((d, i) => [xFor(i), yOcc(d.occ)])), [data]);
  const revPath = useMemoRC(() => smoothPath(data.map((d, i) => [xFor(i), yRev(d.rev)])), [data]);

  const handleMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const xPx = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0, bd = Infinity;
    data.forEach((d, i) => {
      const dx = Math.abs(xFor(i) - xPx);
      if (dx < bd) { bd = dx; best = i; }
    });
    setHover(best);
  };

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="chart-wrap" ref={wrapRef}
         onMouseMove={handleMove} onMouseLeave={() => setHover(null)}
         style={{ position: 'relative', aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="occFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#378ADD" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#378ADD" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {yTicks.map(t => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={yOcc(t)} y2={yOcc(t)}
                  stroke="#e8e7e0" strokeWidth="1"
                  strokeDasharray={t === 0 ? "" : "3 4"} />
            <text x={padL - 8} y={yOcc(t) + 4} textAnchor="end"
                  fontSize="10" fill="#82817a" fontFamily="JetBrains Mono">{t}%</text>
          </g>
        ))}

        {/* Right axis ticks (revenue) */}
        {[0, 500, 1000, 1500, 2000].map(t => (
          <text key={t} x={W - padR + 6} y={yRev(t) + 4} textAnchor="start"
                fontSize="10" fill="#82817a" fontFamily="JetBrains Mono">
            {t === 0 ? '0' : (t/1000).toFixed(t === 1000 ? 0 : 1) + 'k'}
          </text>
        ))}

        {/* Occupancy area + line (blue) */}
        <path d={`${occPath} L ${xFor(data.length-1)} ${padT+innerH} L ${xFor(0)} ${padT+innerH} Z`} fill="url(#occFill)" />
        <path d={occPath} fill="none" stroke="#378ADD" strokeWidth="2.25"
              strokeLinecap="round" strokeLinejoin="round" />

        {/* Revenue line (green) */}
        <path d={revPath} fill="none" stroke="#639922" strokeWidth="2.25"
              strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={xFor(i)} cy={yOcc(d.occ)} r={hover === i ? 5 : 3.5}
                    fill="#fff" stroke="#378ADD" strokeWidth="2" />
            <circle cx={xFor(i)} cy={yRev(d.rev)} r={hover === i ? 5 : 3.5}
                    fill="#fff" stroke="#639922" strokeWidth="2" />
          </g>
        ))}

        {hover !== null && (
          <line x1={xFor(hover)} x2={xFor(hover)} y1={padT} y2={padT + innerH}
                stroke="#14130f" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />
        )}

        {data.map((d, i) => (
          <text key={i} x={xFor(i)} y={H - 8} textAnchor="middle"
                fontSize="10.5" fill={hover === i ? "#14130f" : "#82817a"}
                fontWeight={hover === i ? 700 : 500} fontFamily="Manrope">
            {d.label}
          </text>
        ))}
      </svg>

      {hover !== null && (
        <div style={{
          position: 'absolute',
          left: `${(xFor(hover) / W) * 100}%`,
          top: `${(Math.min(yOcc(data[hover].occ), yRev(data[hover].rev)) / H) * 100}%`,
          transform: 'translate(-50%, calc(-100% - 8px))',
          background: '#1a1916',
          color: '#fff',
          padding: '8px 10px',
          borderRadius: 8,
          fontSize: 11.5,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 5,
        }}>
          <div style={{ color: '#9a988e', fontSize: 10.5, marginBottom: 4 }}>{data[hover].full}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#378ADD', display: 'inline-block' }}></span>
            Ocupação <strong style={{ marginLeft: 'auto' }}>{data[hover].occ}%</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, marginTop: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#639922', display: 'inline-block' }}></span>
            Receita <strong style={{ marginLeft: 'auto' }}>R$ {data[hover].rev.toLocaleString('pt-BR')}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== BAR CHART: Revenue by Room Type ==============
function RoomTypeBar({ data, onSelect, selected }) {
  const W = 560, H = 240;
  const padL = 70, padR = 24, padT = 16, padB = 18;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const max = Math.max(...data.map(d => d.value)) * 1.15;
  const bandH = innerH / data.length;
  const bw = bandH * 0.55;

  return (
    <div className="chart-wrap" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
        <defs>
          {data.map((d, i) => (
            <linearGradient key={i} id={`bar-${i}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={d.color}/>
              <stop offset="100%" stopColor={d.color} stopOpacity="0.75"/>
            </linearGradient>
          ))}
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const v = max * t;
          const x = padL + innerW * t;
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={padT} y2={padT + innerH}
                    stroke="#e8e7e0" strokeWidth="1"
                    strokeDasharray={t === 0 ? "" : "3 4"} />
              <text x={x} y={H - 4} textAnchor="middle"
                    fontSize="10" fill="#82817a" fontFamily="JetBrains Mono">
                {v >= 1000 ? (v/1000).toFixed(1) + 'k' : Math.round(v)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const y = padT + i * bandH + (bandH - bw) / 2;
          const barW = (d.value / max) * innerW;
          const isSel = selected === d.key;
          return (
            <g key={d.key} style={{ cursor: 'pointer' }} onClick={() => onSelect && onSelect(d.key)}>
              <text x={padL - 10} y={y + bw / 2 + 4} textAnchor="end"
                    fontSize="12.5" fill={isSel ? "#14130f" : "#4a4942"}
                    fontWeight={isSel ? 700 : 600} fontFamily="Manrope">
                {d.label}
              </text>
              <rect x={padL} y={y} width={innerW} height={bw} rx="5" fill="#f1f0ea" />
              <rect x={padL} y={y} width={barW} height={bw} rx="5" fill={`url(#bar-${i})`}
                    style={{ transition: 'opacity .15s' }} opacity={isSel || !selected ? 1 : 0.5} />
              <text x={padL + barW + 8} y={y + bw / 2 + 4} textAnchor="start"
                    fontSize="12" fill="#14130f" fontWeight="700"
                    fontFamily="JetBrains Mono">
                R$ {d.value.toLocaleString('pt-BR')}
              </text>
              <text x={padL + barW - 6} y={y + bw / 2 + 4} textAnchor="end"
                    fontSize="11" fill="#ffffff" fontWeight="700"
                    fontFamily="JetBrains Mono"
                    opacity={barW > 60 ? 1 : 0}>
                {d.pct}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============== SEASONALITY LINE (with forecast) ==============
function SeasonalityChart({ data, forecast }) {
  const [hover, setHover] = useStateRC(null);
  const W = 1140, H = 260;
  const padL = 40, padR = 16, padT = 18, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const wrapRef = useRefRC(null);

  const all = [...data, ...forecast];
  const xFor = (i) => padL + (i * innerW) / (all.length - 1);
  const yFor = (v) => padT + innerH - (v / 100) * innerH;

  const actualPts = data.map((d, i) => [xFor(i), yFor(d.value)]);
  const forecastPts = forecast.map((d, i) => [xFor(data.length - 1 + i), yFor(d.value)]);

  // bridge between actual end and forecast start
  const bridgePts = [actualPts[actualPts.length - 1], ...forecastPts];

  const actualPath = useMemoRC(() => smoothPath(actualPts), [data]);
  const forecastPath = useMemoRC(() => smoothPath(bridgePts), [data, forecast]);
  const areaPath = useMemoRC(() =>
    `${actualPath} L ${actualPts[actualPts.length-1][0]} ${padT+innerH} L ${actualPts[0][0]} ${padT+innerH} Z`,
    [actualPath]);

  const handleMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    const xPx = ((e.clientX - rect.left) / rect.width) * W;
    let best = 0, bd = Infinity;
    all.forEach((d, i) => {
      const dx = Math.abs(xFor(i) - xPx);
      if (dx < bd) { bd = dx; best = i; }
    });
    setHover(best);
  };

  const forecastStartX = xFor(data.length - 1);

  return (
    <div className="chart-wrap" ref={wrapRef}
         onMouseMove={handleMove} onMouseLeave={() => setHover(null)}
         style={{ position: 'relative', aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="seasFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7a5cd4" stopOpacity="0.20"/>
            <stop offset="100%" stopColor="#7a5cd4" stopOpacity="0"/>
          </linearGradient>
          <pattern id="forecastBand" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#7a5cd4" strokeWidth="6" opacity="0.04"/>
          </pattern>
        </defs>

        {/* Forecast band background */}
        <rect x={forecastStartX} y={padT}
              width={(W - padR) - forecastStartX} height={innerH}
              fill="url(#forecastBand)" />

        {[0, 25, 50, 75, 100].map(t => (
          <g key={t}>
            <line x1={padL} x2={W - padR} y1={yFor(t)} y2={yFor(t)}
                  stroke="#e8e7e0" strokeWidth="1"
                  strokeDasharray={t === 0 ? "" : "3 4"} />
            <text x={padL - 8} y={yFor(t) + 4} textAnchor="end"
                  fontSize="10" fill="#82817a" fontFamily="JetBrains Mono">{t}%</text>
          </g>
        ))}

        {/* Forecast separator */}
        <line x1={forecastStartX} x2={forecastStartX}
              y1={padT} y2={padT + innerH}
              stroke="#7a5cd4" strokeWidth="1.25" strokeDasharray="2 4" opacity="0.6"/>
        <text x={forecastStartX + 6} y={padT + 12}
              fontSize="10.5" fill="#4f3aa0" fontWeight="700"
              fontFamily="Manrope" letterSpacing="0.05em">PREVISÃO ↓</text>

        {/* Actual area + line */}
        <path d={areaPath} fill="url(#seasFill)" />
        <path d={actualPath} fill="none" stroke="#7a5cd4" strokeWidth="2.25"
              strokeLinecap="round" strokeLinejoin="round" />

        {/* Forecast (dashed) */}
        <path d={forecastPath} fill="none" stroke="#7a5cd4" strokeWidth="2.25"
              strokeLinecap="round" strokeDasharray="5 5" opacity="0.75" />

        {/* Points */}
        {actualPts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={hover === i ? 4.5 : 2.5}
                  fill="#fff" stroke="#7a5cd4" strokeWidth="2" />
        ))}
        {forecastPts.map((p, i) => (
          <circle key={'f'+i} cx={p[0]} cy={p[1]} r={hover === data.length + i ? 4.5 : 2.5}
                  fill="#fbfbf6" stroke="#7a5cd4" strokeWidth="1.75"
                  strokeDasharray="2 2" />
        ))}

        {hover !== null && (
          <line x1={xFor(hover)} x2={xFor(hover)} y1={padT} y2={padT + innerH}
                stroke="#14130f" strokeWidth="1" strokeDasharray="3 3" opacity="0.2" />
        )}

        {/* X labels — every Nth */}
        {all.map((d, i) => i % Math.ceil(all.length / 14) === 0 && (
          <text key={i} x={xFor(i)} y={H - 8} textAnchor="middle"
                fontSize="10" fill={hover === i ? "#14130f" : "#82817a"}
                fontWeight={hover === i ? 700 : 500} fontFamily="Manrope">
            {d.label}
          </text>
        ))}
      </svg>

      {hover !== null && (
        <div style={{
          position: 'absolute',
          left: `${(xFor(hover) / W) * 100}%`,
          top: `${(yFor(all[hover].value) / H) * 100}%`,
          transform: 'translate(-50%, calc(-100% - 8px))',
          background: '#1a1916',
          color: '#fff',
          padding: '6px 10px',
          borderRadius: 8,
          fontSize: 12,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <div style={{ color: '#9a988e', fontSize: 10.5 }}>
            {all[hover].full} {hover >= data.length && '· previsão'}
          </div>
          <div style={{ fontWeight: 700, marginTop: 2 }}>{all[hover].value}% ocupação</div>
        </div>
      )}
    </div>
  );
}

// ============== DONUT: Booking Origin ==============
function OriginDonut({ data }) {
  const [hover, setHover] = useStateRC(null);
  const W = 260, H = 240;
  const cx = W / 2, cy = H / 2;
  const rOuter = 90, rInner = 60;

  const total = data.reduce((a, b) => a + b.value, 0);
  let acc = 0;
  const slices = data.map((d) => {
    const start = acc / total;
    acc += d.value;
    const end = acc / total;
    return { ...d, start, end };
  });

  function arc(start, end, ro, ri) {
    const a0 = start * 2 * Math.PI - Math.PI / 2;
    const a1 = end * 2 * Math.PI - Math.PI / 2;
    const large = end - start > 0.5 ? 1 : 0;
    const x0 = cx + ro * Math.cos(a0), y0 = cy + ro * Math.sin(a0);
    const x1 = cx + ro * Math.cos(a1), y1 = cy + ro * Math.sin(a1);
    const x2 = cx + ri * Math.cos(a1), y2 = cy + ri * Math.sin(a1);
    const x3 = cx + ri * Math.cos(a0), y3 = cy + ri * Math.sin(a0);
    return `M ${x0} ${y0} A ${ro} ${ro} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${ri} ${ri} 0 ${large} 0 ${x3} ${y3} Z`;
  }

  const hoveredSlice = hover !== null ? slices[hover] : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ flex: '0 0 auto' }}>
        {slices.map((s, i) => (
          <path key={i}
                d={arc(s.start, s.end, hover === i ? rOuter + 6 : rOuter, rInner)}
                fill={s.color}
                style={{ cursor: 'pointer', transition: 'd .15s ease' }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)} />
        ))}
        {hoveredSlice ? (
          <g>
            <text x={cx} y={cy - 4} textAnchor="middle"
                  fontSize="28" fontWeight="800" fill="#14130f"
                  fontFamily="Manrope" letterSpacing="-0.02em">
              {hoveredSlice.value}%
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle"
                  fontSize="11" fill="#82817a" fontFamily="Manrope" fontWeight="600">
              {hoveredSlice.label}
            </text>
          </g>
        ) : (
          <g>
            <text x={cx} y={cy - 4} textAnchor="middle"
                  fontSize="22" fontWeight="800" fill="#14130f"
                  fontFamily="Manrope" letterSpacing="-0.02em">
              {total}
            </text>
            <text x={cx} y={cy + 14} textAnchor="middle"
                  fontSize="11" fill="#82817a" fontFamily="Manrope" fontWeight="600">
              reservas
            </text>
          </g>
        )}
      </svg>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.map((d, i) => (
          <div key={i}
               onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
               style={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: 10,
                 padding: '6px 8px',
                 borderRadius: 6,
                 background: hover === i ? '#f1f0ea' : 'transparent',
                 transition: 'background .12s ease',
                 cursor: 'pointer',
               }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flex: '0 0 10px' }}></span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#14130f' }}>{d.label}</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: '#14130f', fontFamily: 'JetBrains Mono' }}>{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.DualAxisChart = DualAxisChart;
window.RoomTypeBar = RoomTypeBar;
window.SeasonalityChart = SeasonalityChart;
window.OriginDonut = OriginDonut;
