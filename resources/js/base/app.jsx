// Main hotel dashboard app
const { useState, useEffect, useRef } = React;
const { I, OccupancyChart, TweaksPanel, TweakSection, TweakRadio, TweakToggle, TweakColor, useTweaks } = window;

// ---------- Data ----------
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'Dashboard' },
  { id: 'reservas', label: 'Reservas', icon: 'Calendar', badge: 7 },
  { id: 'checkin', label: 'Check-in / Check-out', icon: 'ArrowsLR' },
  { id: 'equipe', label: 'Equipe', icon: 'Users' },
  { id: 'avaliacoes', label: 'Avaliações', icon: 'Star' },
  { id: 'relatorios', label: 'Relatórios', icon: 'Chart' },
  { id: 'configuracoes', label: 'Configurações', icon: 'Settings' },
];

const CHART_DATA = [
  { label: 'Seg', full: 'Segunda, 11 mai',  value: 62, rooms: 31 },
  { label: 'Ter', full: 'Terça, 12 mai',    value: 68, rooms: 34 },
  { label: 'Qua', full: 'Quarta, 13 mai',   value: 71, rooms: 36 },
  { label: 'Qui', full: 'Quinta, 14 mai',   value: 65, rooms: 33 },
  { label: 'Sex', full: 'Sexta, 15 mai',    value: 78, rooms: 39 },
  { label: 'Sáb', full: 'Sábado, 16 mai',   value: 88, rooms: 44 },
  { label: 'Dom', full: 'Domingo, 17 mai',  value: 82, rooms: 41 },
];

const TASKS_INIT = [
  { id: 't1', text: '2 quartos ainda em limpeza', meta: '301, 408', pill: 'orange', pillText: 'limpeza' },
  { id: 't2', text: 'Manutenção de AC no quarto 201', meta: 'Eduardo · 13:00', pill: 'red', pillText: 'manutenção' },
  { id: 't3', text: 'Confirmar 3 reservas até as 14:00', meta: '#521, #524, #527', pill: 'blue', pillText: 'reservas' },
  { id: 't4', text: 'Receber entrega de roupas de cama', meta: 'Recepção', pill: 'orange', pillText: 'estoque' },
  { id: 't5', text: 'Briefing com camareiras (turno tarde)', meta: '14:30', pill: 'blue', pillText: 'equipe' },
];

// ---------- Pieces ----------
function Sidebar({ active, setActive, collapsed, setCollapsed }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <I.Hotel size={18} stroke={2} />
        </div>
        <div className="brand-text">Hotel Management</div>
        <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar" title={collapsed ? "Expandir" : "Recolher"}>
          <I.PanelLeft size={16} />
        </button>
      </div>

      <nav className="nav">
        <div className="section-label">Operação</div>
        {NAV.slice(0, 5).map(item => {
          const IconC = I[item.icon];
          return (
            <button key={item.id}
                    className={`nav-item ${active === item.id ? 'active' : ''}`}
                    onClick={() => setActive(item.id)}>
              <span className="nav-icon"><IconC size={18} /></span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}

        <div className="section-label">Análise</div>
        {NAV.slice(5).map(item => {
          const IconC = I[item.icon];
          return (
            <button key={item.id}
                    className={`nav-item ${active === item.id ? 'active' : ''}`}
                    onClick={() => setActive(item.id)}>
              <span className="nav-icon"><IconC size={18} /></span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-foot">
        <button className="user-chip">
          <div className="avatar">MR</div>
          <div className="user-meta">
            <div className="user-name">Mariana Reis</div>
            <div className="user-role">Gerente · Pousada Mar Azul</div>
          </div>
        </button>
      </div>
    </aside>
  );
}

function Topbar({ onMenu, profileOpen, setProfileOpen }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!profileOpen) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setProfileOpen(false); };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, [profileOpen]);

  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onMenu} aria-label="Menu">
        <I.Menu size={18} />
      </button>
      <div className="crumbs">
        <span>Pousada Mar Azul</span>
        <span className="sep">/</span>
        <strong>Dashboard</strong>
      </div>

      <div className="search" style={{ marginLeft: 24 }}>
        <I.Search size={16} />
        <input placeholder="Buscar reserva, hóspede, quarto…" />
        <kbd>⌘K</kbd>
      </div>

      <div className="topbar-right">
        <button className="icon-btn" aria-label="Ajuda"><I.Help size={18} /></button>
        <button className="icon-btn" aria-label="Notificações">
          <I.Bell size={18} />
          <span className="dot"></span>
        </button>

        <div style={{ position: 'relative' }} ref={ref}>
          <button className="profile-trigger" onClick={() => setProfileOpen(v => !v)}>
            <div className="avatar">MR</div>
            <span className="pname">Mariana Reis</span>
            <I.ChevronDown size={14} />
          </button>

          {profileOpen && (
            <div className="dropdown">
              <div className="dropdown-head">
                <div className="pname">Mariana Reis</div>
                <div className="pmail">mariana@maranzul.com.br</div>
              </div>
              <button className="dropdown-item"><I.User size={16} /> Meu perfil</button>
              <button className="dropdown-item"><I.Settings size={16} /> Preferências</button>
              <button className="dropdown-item"><I.Help size={16} /> Ajuda & suporte</button>
              <div className="dropdown-sep"></div>
              <button className="dropdown-item danger"><I.Logout size={16} /> Sair</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Tiny sparkline for KPI cards
function Spark({ values, color }) {
  const W = 80, H = 28;
  const max = Math.max(...values), min = Math.min(...values);
  const range = max - min || 1;
  const step = W / (values.length - 1);
  const pts = values.map((v, i) => [i * step, H - 2 - ((v - min) / range) * (H - 4)]);
  const d = pts.reduce((acc, p, i) => acc + (i === 0 ? `M ${p[0]} ${p[1]}` : ` L ${p[0]} ${p[1]}`), '');
  return (
    <svg className="kpi-sparkline" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function KpiCard({ tone, icon, value, label, sub, delta, deltaDir, spark, showSparkline }) {
  const IconC = I[icon];
  return (
    <div className={`kpi ${tone}`} tabIndex="0">
      {showSparkline && <Spark values={spark} color={
        tone === 'blue' ? '#378ADD' : tone === 'green' ? '#639922' : tone === 'orange' ? '#BA7517' : '#7a5cd4'
      } />}
      <div className="kpi-head">
        <div className="kpi-ico"><IconC size={20} stroke={2} /></div>
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

function ChartPanel({ chartStyle }) {
  const [range, setRange] = useState('7d');
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Ocupação — Últimos 7 Dias</h3>
          <div className="panel-sub">Quartos ocupados como % do inventário (50)</div>
        </div>
        <div className="tabs" role="tablist">
          {['7d', '14d', '30d'].map(r => (
            <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>{r}</button>
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

      <OccupancyChart data={CHART_DATA} style={chartStyle} />

      <div className="status-row" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        <div className="status-item"><span className="status-dot" style={{ background: '#378ADD' }}></span>Ocupação %</div>
        <div className="status-item"><span className="status-dot" style={{ background: '#639922', height: 2, marginTop: 3 }}></span>Meta diária (70%)</div>
        <div className="status-item" style={{ marginLeft: 'auto' }}>
          Pico: <strong style={{ color: 'var(--ink)' }} className="num">88% sáb</strong>
        </div>
        <div className="status-item">
          Vale: <strong style={{ color: 'var(--ink)' }} className="num">62% seg</strong>
        </div>
      </div>
    </div>
  );
}

function AlertsPanel({ confirmAlert, prioritizeAlert, dismissed }) {
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
          <div className="alert-icn warn"><I.Warning size={18} /></div>
          <div className="alert-body">
            <span className="alert-tag warn">Reserva em risco</span>
            <h4 className="alert-title">#521 — João Silva</h4>
            <p className="alert-text">
              Risco de <strong>48% de no-show</strong>. Hóspede não respondeu confirmação enviada às 09:12.
            </p>
            <div className="alert-actions">
              <button className="btn primary sm" onClick={() => confirmAlert('a1')}>
                <I.Check size={14} /> Confirmar
              </button>
              <button className="btn sm">Ligar para hóspede</button>
            </div>
          </div>
        </div>
      )}

      {!dismissed.includes('a2') && (
        <div className="alert-card">
          <div className="alert-icn danger"><I.Clock size={18} /></div>
          <div className="alert-body">
            <span className="alert-tag danger">Limpeza atrasada</span>
            <h4 className="alert-title">Quarto 405</h4>
            <p className="alert-text">
              <strong>45 minutos de atraso</strong>. Próximo check-in marcado para 15:00 (Camila Souza).
            </p>
            <div className="alert-actions">
              <button className="btn primary sm" onClick={() => prioritizeAlert('a2')}>
                <I.Sparkles size={14} /> Priorizar
              </button>
              <button className="btn sm">Reatribuir</button>
            </div>
          </div>
        </div>
      )}

      {!dismissed.includes('a3') && (
        <div className="alert-card">
          <div className="alert-icn warn"><I.Tools size={18} /></div>
          <div className="alert-body">
            <span className="alert-tag warn">Manutenção pendente</span>
            <h4 className="alert-title">Quarto 201 — Ar condicionado</h4>
            <p className="alert-text">
              Aberto há 2 dias. Técnico (Eduardo) com chegada estimada hoje 13:00.
            </p>
            <div className="alert-actions">
              <button className="btn sm">Acompanhar</button>
              <button className="btn ghost sm">Adiar</button>
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

function TasksPanel({ tasks, toggleTask }) {
  const open = tasks.filter(t => !t.done).length;
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Tarefas Pendentes</h3>
          <div className="panel-sub">{open} aberta{open === 1 ? '' : 's'} · {tasks.length - open} concluída{tasks.length - open === 1 ? '' : 's'}</div>
        </div>
        <button className="btn ghost sm"><I.Plus size={14} /> Nova</button>
      </div>

      <div>
        {tasks.map(t => (
          <div key={t.id} className={`task ${t.done ? 'done' : ''}`}>
            <button className={`task-check ${t.done ? 'done' : ''}`}
                    onClick={() => toggleTask(t.id)}
                    aria-label="Toggle">
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

// ---------- App ----------
function App() {
  const [t, setTweak] = useTweaks(window.__TWEAK_DEFAULTS);
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState(TASKS_INIT.map(x => ({ ...x, done: false })));
  const [dismissed, setDismissed] = useState([]);
  const [toast, setToast] = useState(null);

  // expose accent live
  useEffect(() => {
    if (t.accent) document.documentElement.style.setProperty('--blue', t.accent);
  }, [t.accent]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const onRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    showToast('Atualizando dados…');
    setTimeout(() => {
      setRefreshing(false);
      showToast('Dados atualizados às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    }, 1200);
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const confirmAlert = (id) => {
    setDismissed(d => [...d, id]);
    showToast('Reserva #521 confirmada com sucesso');
  };
  const prioritizeAlert = (id) => {
    setDismissed(d => [...d, id]);
    showToast('Quarto 405 movido para prioridade alta');
  };

  const today = new Date('2026-05-15T10:00:00');
  const dateLong = today.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  const weekday = today.toLocaleDateString('pt-BR', { weekday: 'long' });

  return (
    <div className={`app ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <Sidebar active={active} setActive={(id) => { setActive(id); setMobileOpen(false); }}
               collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className="main">
        <Topbar onMenu={() => setMobileOpen(o => !o)}
                profileOpen={profileOpen} setProfileOpen={setProfileOpen} />

        <div className="content">
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
              <button className="btn"><I.ArrowDownTray size={15} /> Exportar</button>
              <button className="btn primary" onClick={onRefresh} disabled={refreshing}>
                <span className={refreshing ? 'spin' : ''} style={{ display: 'inline-grid', placeItems: 'center' }}>
                  <I.Refresh size={15} />
                </span>
                {refreshing ? 'Atualizando…' : 'Atualizar'}
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="kpi-grid">
            <KpiCard tone="blue" icon="Hotel"
                     value="78%" label="Taxa de Ocupação" sub="39 de 50 quartos ocupados"
                     delta="6,1 pts" deltaDir="up"
                     spark={[58,62,68,71,65,78,88,82,78]}
                     showSparkline={t.showSparklines} />
            <KpiCard tone="green" icon="ArrowDownTray"
                     value="5" label="Check-ins Hoje" sub="próximas chegadas em 2h"
                     delta="2" deltaDir="up"
                     spark={[3,4,2,6,5,7,5]}
                     showSparkline={t.showSparklines} />
            <KpiCard tone="orange" icon="ArrowUpTray"
                     value="3" label="Check-outs Hoje" sub="last call: 12:00"
                     delta="1" deltaDir="down"
                     spark={[4,3,5,6,4,4,3]}
                     showSparkline={t.showSparklines} />
            <KpiCard tone="purple" icon="Cash"
                     value="R$ 2.340" label="Receita Prevista Hoje" sub="ticket médio R$ 468"
                     delta="R$ 320" deltaDir="up"
                     spark={[1800,2100,1950,2400,2150,2280,2340]}
                     showSparkline={t.showSparklines} />
          </div>

          {/* Chart + Alerts side by side, then Tasks below alerts? Use 2 cols: chart big | alerts/tasks stacked */}
          <div className="grid-2">
            <ChartPanel chartStyle={t.chartStyle} />
            <AlertsPanel confirmAlert={confirmAlert} prioritizeAlert={prioritizeAlert} dismissed={dismissed} />
          </div>

          <div className="grid-2">
            <TasksPanel tasks={tasks} toggleTask={toggleTask} />
            <div className="panel">
              <div className="panel-head">
                <div>
                  <h3 className="panel-title">Status dos Quartos</h3>
                  <div className="panel-sub">Visão rápida — 50 quartos</div>
                </div>
                <button className="btn ghost sm">Ver mapa</button>
              </div>
              <RoomStatus />
            </div>
          </div>

        </div>
      </div>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Aparência">
          <TweakColor label="Cor primária"
                      value={t.accent}
                      options={['#378ADD', '#7a5cd4', '#639922', '#BA7517', '#0f766e']}
                      onChange={v => setTweak('accent', v)} />
        </TweakSection>

        <TweakSection title="Gráfico">
          <TweakRadio label="Estilo"
                      value={t.chartStyle}
                      options={[{ value: 'area', label: 'Área' }, { value: 'bars', label: 'Barras' }]}
                      onChange={v => setTweak('chartStyle', v)} />
        </TweakSection>

        <TweakSection title="Cards">
          <TweakToggle label="Sparklines nos KPIs"
                       value={t.showSparklines}
                       onChange={v => setTweak('showSparklines', v)} />
        </TweakSection>
      </TweaksPanel>

      {toast && <div className="toast"><I.Check size={16} stroke={2.5} />{toast}</div>}
    </div>
  );
}

function RoomStatus() {
  // 50 rooms across 5 floors; each cell colored by status
  const STATUS = ['occupied', 'available', 'cleaning', 'maintenance', 'reserved'];
  const rng = (() => { let s = 7; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })();
  const floors = [4, 3, 2, 1, 0];
  const rooms = [];
  for (const f of floors) {
    const row = [];
    for (let i = 1; i <= 10; i++) {
      const r = rng();
      let st;
      if (r < 0.55) st = 'occupied';
      else if (r < 0.75) st = 'available';
      else if (r < 0.85) st = 'cleaning';
      else if (r < 0.92) st = 'reserved';
      else st = 'maintenance';
      row.push({ n: `${f + 1}${String(i).padStart(2, '0')}`, st });
    }
    rooms.push(row);
  }

  const colors = {
    occupied: { bg: 'var(--blue-soft)', dot: '#378ADD', label: 'Ocupado' },
    available: { bg: '#f6f6f3', dot: '#b3b2a9', label: 'Disponível' },
    cleaning: { bg: 'var(--orange-soft)', dot: '#BA7517', label: 'Em limpeza' },
    reserved: { bg: 'var(--green-soft)', dot: '#639922', label: 'Reservado' },
    maintenance: { bg: 'var(--red-soft)', dot: '#E24B4A', label: 'Manutenção' },
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rooms.map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, fontFamily: 'JetBrains Mono' }}>
              F{rooms.length - i}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, flex: 1 }}>
              {row.map(r => (
                <div key={r.n}
                     title={`Quarto ${r.n} · ${colors[r.st].label}`}
                     style={{
                       background: colors[r.st].bg,
                       border: `1px solid ${colors[r.st].dot}33`,
                       borderRadius: 5,
                       padding: '6px 0',
                       textAlign: 'center',
                       fontSize: 10.5,
                       fontWeight: 600,
                       color: 'var(--ink-2)',
                       fontFamily: 'JetBrains Mono',
                       cursor: 'pointer',
                       transition: 'transform .12s ease',
                       position: 'relative'
                     }}
                     onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                     onMouseLeave={e => e.currentTarget.style.transform = ''}>
                  {r.n}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="status-row" style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
        {Object.entries(colors).map(([k, v]) => (
          <div key={k} className="status-item">
            <span className="status-dot" style={{ background: v.dot }}></span>{v.label}
          </div>
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
