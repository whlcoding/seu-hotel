// Relatórios & Análises — main app
const { useState, useEffect, useRef } = React;
const { I, DualAxisChart, RoomTypeBar, SeasonalityChart, OriginDonut } = window;

// ---------- Extra icons ----------
const Ic = {
  ...I,
  Mail: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
    </svg>
  ),
  FileText: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <path d="M14 3v6h6M8 13h8M8 17h6"/>
    </svg>
  ),
  Sheet: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
    </svg>
  ),
  Csv: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <path d="M14 3v6h6"/>
    </svg>
  ),
  TrendUp: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/>
    </svg>
  ),
  TrendDown: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l6 6 4-4 8 9"/><path d="M14 18h7v-7"/>
    </svg>
  ),
  Filter: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16l-6 8v6l-4-2v-4z"/>
    </svg>
  ),
  Bed: (p) => (
    <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v12M21 19V12a3 3 0 0 0-3-3H8v6M3 14h18"/>
      <circle cx="7" cy="11" r="1.5"/>
    </svg>
  ),
  Calendar: I.Calendar,
  Cash: I.Cash,
  Users: I.Users,
  Star: I.Star,
  Check: I.Check,
  Sparkles: I.Sparkles,
  Warning: I.Warning,
  Refresh: I.Refresh,
  ChevronDown: I.ChevronDown,
  ChevronLeft: I.ChevronLeft,
  ChevronRight: I.ChevronRight,
};

// ---------- Data ----------
const DUAL_DATA = [
  { label: '19/05', full: '19 mai · Seg', occ: 64, rev: 1180 },
  { label: '20/05', full: '20 mai · Ter', occ: 70, rev: 1310 },
  { label: '21/05', full: '21 mai · Qua', occ: 72, rev: 1380 },
  { label: '22/05', full: '22 mai · Qui', occ: 76, rev: 1450 },
  { label: '23/05', full: '23 mai · Sex', occ: 89, rev: 1820 },
  { label: '24/05', full: '24 mai · Sáb', occ: 84, rev: 1700 },
  { label: '25/05', full: '25 mai · Dom', occ: 78, rev: 1410 },
];

const ROOM_TYPE = [
  { key: 'single', label: 'Single',   value: 4200, pct: 23, color: '#378ADD' },
  { key: 'duplo',  label: 'Duplo',    value: 8900, pct: 48, color: '#639922' },
  { key: 'suite',  label: 'Suíte',    value: 5350, pct: 29, color: '#7a5cd4' },
];

// 30 days of actual + 7 days of forecast
const SEASONALITY = (() => {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(2026, 3, 26 + i); // late Apr → late May
    const dow = d.getDay();
    let base = 65 + (dow === 5 || dow === 6 ? 18 : dow === 0 ? 8 : 0);
    base += Math.sin(i / 4) * 5 + (i > 22 ? 4 : 0);
    days.push({
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      full: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      value: Math.max(35, Math.min(98, Math.round(base)))
    });
  }
  return days;
})();
const FORECAST = (() => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(2026, 4, 26 + i);
    const dow = d.getDay();
    let base = 72 + (dow === 5 || dow === 6 ? 14 : 0);
    days.push({
      label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      full: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      value: Math.round(base)
    });
  }
  return days;
})();

const ORIGIN = [
  { label: 'Booking.com', value: 40, color: '#378ADD' },
  { label: 'Website',     value: 35, color: '#639922' },
  { label: 'Agência',     value: 15, color: '#BA7517' },
  { label: 'Direto',      value: 10, color: '#7a5cd4' },
];

// ---------- Tab data ----------
const TAB_RECEITA = [
  { date: '19/05', single: 300, duplo: 700, suite: 400, total: 1400 },
  { date: '20/05', single: 300, duplo: 850, suite: 400, total: 1550 },
  { date: '21/05', single: 150, duplo: 900, suite: 500, total: 1550 },
  { date: '22/05', single: 300, duplo: 950, suite: 500, total: 1750 },
  { date: '23/05', single: 300, duplo: 1100, suite: 600, total: 2000 },
  { date: '24/05', single: 150, duplo: 950, suite: 500, total: 1600 },
  { date: '25/05', single: 0,   duplo: 500, suite: 400, total: 900 },
];

const TAB_OCUPACAO = [
  { date: '19/05', total: 50, ocup: 32, taxa: 64, delta: '+3', up: true },
  { date: '20/05', total: 50, ocup: 35, taxa: 70, delta: '+6', up: true },
  { date: '21/05', total: 50, ocup: 36, taxa: 72, delta: '+2', up: true },
  { date: '22/05', total: 50, ocup: 38, taxa: 76, delta: '+4', up: true },
  { date: '23/05', total: 50, ocup: 44, taxa: 88, delta: '+12', up: true },
  { date: '24/05', total: 50, ocup: 42, taxa: 84, delta: '-4', up: false },
  { date: '25/05', total: 50, ocup: 39, taxa: 78, delta: '-6', up: false },
];

const TAB_CLIENTES = [
  { k: 'Total Hóspedes',       v: '142',     delta: '+15%', up: true,  hint: 'no período' },
  { k: 'Clientes Novos',       v: '38',      delta: '+20%', up: true,  hint: '26,8% do total' },
  { k: 'Clientes Recorrentes', v: '104',     delta: '+12%', up: true,  hint: '73,2% do total' },
  { k: 'Estadia Média',        v: '2,1 dias', delta: 'estável', up: null, hint: 'entre check-in e check-out' },
  { k: 'Valor Médio Reserva',  v: 'R$ 520',  delta: '−2%',  up: false, hint: 'ticket por reserva' },
  { k: 'Idade Média Hóspede',  v: '38 anos', delta: '+1',   up: true,  hint: 'demografia' },
];

const TAB_EQUIPE = [
  { name: 'Maria Oliveira', role: 'Housekeeping',  init: 'MO', av: 'green',  tasks: 32, succ: 100, sat: 4.8, prod: 16 },
  { name: 'João Pereira',   role: 'Recepção',      init: 'JP', av: 'blue',   tasks: 28, succ: 96,  sat: 4.6, prod: 14 },
  { name: 'Pedro Santos',   role: 'Manutenção',    init: 'PS', av: 'orange', tasks: 24, succ: 92,  sat: 4.2, prod: 12 },
  { name: 'Ana Costa',      role: 'Housekeeping',  init: 'AC', av: 'purple', tasks: 30, succ: 98,  sat: 4.7, prod: 15 },
  { name: 'Carlos Mendes',  role: 'Recepção',      init: 'CM', av: 'blue',   tasks: 22, succ: 95,  sat: 4.4, prod: 11 },
];

const TAB_SATISFACAO = [
  { k: 'NPS (Net Promoter)',    v: '8,2',   delta: '+0,5', up: true,  hint: 'em escala 0–10' },
  { k: 'Satisfação Geral',      v: '4,3/5', delta: 'estável', up: null, hint: 'média de 87 avaliações' },
  { k: 'Taxa Recomendação',     v: '87%',   delta: '+3%',  up: true,  hint: 'recomendariam o hotel' },
  { k: 'Taxa Resposta',         v: '85%',   delta: '−2%',  up: false, hint: 'pesquisas respondidas' },
  { k: 'Tempo Médio Atendimento', v: '6 min', delta: '−12%', up: true, hint: 'check-in até quarto' },
];

const SATISF_HIGHLIGHTS = [
  { kind: 'good', label: 'Elogio Mais Comum',     value: 'Limpeza',    detail: '34 menções positivas' },
  { kind: 'good', label: 'Segundo Elogio',         value: 'Atendimento', detail: '28 menções positivas' },
  { kind: 'bad',  label: 'Reclamação Mais Comum', value: 'Barulho',    detail: '12 menções (quartos 201–205)' },
  { kind: 'bad',  label: 'Segunda Reclamação',     value: 'Wi-Fi lento', detail: '7 menções (área externa)' },
];

// ---------- Pieces ----------
function FiltersRow({ period, setPeriod, roomType, setRoomType, sortBy, setSortBy,
                     refreshing, onRefresh, onExport, onEmail, exportOpen, setExportOpen }) {
  const exportRef = useRef(null);
  useEffect(() => {
    if (!exportOpen) return;
    const h = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false); };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, [exportOpen]);

  return (
    <div className="filters-row">
      <div className="filter-group">
        <span className="filter-label">Período</span>
        <div className="segmented">
          {[
            { id: '7d',  label: '7 dias' },
            { id: '30d', label: '30 dias' },
            { id: '90d', label: '90 dias' },
            { id: 'custom', label: 'Personalizado' },
          ].map(p => (
            <button key={p.id} className={period === p.id ? 'active' : ''} onClick={() => setPeriod(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">Quarto</span>
        <select className="select" value={roomType} onChange={e => setRoomType(e.target.value)}>
          <option value="todos">Todos os tipos</option>
          <option value="single">Single</option>
          <option value="duplo">Duplo</option>
          <option value="suite">Suíte</option>
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">Ordenar</span>
        <select className="select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="receita">Receita</option>
          <option value="ocupacao">Ocupação</option>
          <option value="satisfacao">Satisfação</option>
        </select>
      </div>

      <div className="filters-spacer"></div>

      <button className="btn" onClick={onRefresh} disabled={refreshing}>
        <span className={refreshing ? 'spin' : ''}><Ic.Refresh size={15}/></span>
        {refreshing ? 'Atualizando…' : 'Atualizar'}
      </button>

      <div className="menu-anchor" ref={exportRef}>
        <button className="btn" onClick={() => setExportOpen(o => !o)}>
          <Ic.ArrowDownTray size={15}/>
          Exportar
          <Ic.ChevronDown size={14}/>
        </button>
        {exportOpen && (
          <div className="menu">
            <div className="menu-head">Baixar Como</div>
            <button className="menu-item" onClick={() => { onExport('pdf'); setExportOpen(false); }}>
              <Ic.FileText size={16}/> PDF — Relatório formatado
            </button>
            <button className="menu-item" onClick={() => { onExport('xlsx'); setExportOpen(false); }}>
              <Ic.Sheet size={16}/> Excel — Planilha (.xlsx)
            </button>
            <button className="menu-item" onClick={() => { onExport('csv'); setExportOpen(false); }}>
              <Ic.Csv size={16}/> CSV — Dados brutos
            </button>
          </div>
        )}
      </div>

      <button className="btn primary" onClick={onEmail}>
        <Ic.Mail size={15}/> Enviar por Email
      </button>
    </div>
  );
}

// ---------- KPI cards ----------
function KpiCards() {
  return (
    <div className="kpi-grid">
      <div className="kpi blue">
        <div className="kpi-accent"></div>
        <div className="kpi-head">
          <div className="kpi-ico"><Ic.Cash size={20} stroke={2}/></div>
          <div className="kpi-delta up"><Ic.TrendUp size={12}/> +12%</div>
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
          <div className="kpi-ico"><Ic.Hotel size={20} stroke={2}/></div>
          <div className="kpi-delta up"><Ic.TrendUp size={12}/> +5 pts</div>
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
          <div className="kpi-ico"><Ic.Users size={20} stroke={2}/></div>
          <div className="kpi-delta up"><Ic.TrendUp size={12}/> +15%</div>
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
          <div className="kpi-ico"><Ic.Warning size={20} stroke={2}/></div>
          <div className="kpi-delta up"><Ic.TrendDown size={12}/> −1,5 pts</div>
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

// ---------- Charts row ----------
function ChartsGrid({ onPickRoomType, pickedRoomType }) {
  return (
    <div className="charts-grid">
      {/* 1 */}
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
        <DualAxisChart data={DUAL_DATA}/>
      </div>

      {/* 2 */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Receita por Tipo de Quarto</h3>
            <div className="panel-sub">
              {pickedRoomType
                ? <span>Filtrado: <strong>{ROOM_TYPE.find(r=>r.key===pickedRoomType).label}</strong> · <button onClick={()=>onPickRoomType(null)} style={{border:'none',background:'none',color:'var(--blue)',cursor:'pointer',fontWeight:700}}>limpar</button></span>
                : 'Clique numa barra para filtrar a tabela'}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            Total <strong style={{ color: 'var(--ink)', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>R$ 18.450</strong>
          </div>
        </div>
        <RoomTypeBar data={ROOM_TYPE} onSelect={onPickRoomType} selected={pickedRoomType}/>
      </div>

      {/* 3 — full width */}
      <div className="panel" style={{ gridColumn: '1 / -1' }}>
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Sazonalidade — Ocupação no Período</h3>
            <div className="panel-sub">30 dias reais + previsão para 7 dias seguintes</div>
          </div>
          <div className="legend-row">
            <div className="legend-item"><span className="legend-line" style={{ background: '#7a5cd4' }}></span>Real</div>
            <div className="legend-item"><span className="legend-line dashed" style={{ color: '#7a5cd4' }}></span>Previsão</div>
          </div>
        </div>
        <SeasonalityChart data={SEASONALITY} forecast={FORECAST}/>
      </div>

      {/* 4 — origin */}
      <div className="panel" style={{ gridColumn: '1 / -1' }}>
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Origem das Reservas</h3>
            <div className="panel-sub">142 reservas no período · passe o mouse para detalhar</div>
          </div>
        </div>
        <OriginDonut data={ORIGIN}/>
      </div>
    </div>
  );
}

// ---------- Detail tabs ----------
function DetailTabs({ tab, setTab, pickedRoomType }) {
  const tabs = [
    { id: 'receita',     label: 'Receita',     count: 7 },
    { id: 'ocupacao',    label: 'Ocupação',    count: 7 },
    { id: 'clientes',    label: 'Clientes',    count: 6 },
    { id: 'equipe',      label: 'Equipe',      count: 5 },
    { id: 'satisfacao',  label: 'Satisfação',  count: 5 },
  ];

  return (
    <>
      <div className="tabs-strip" role="tablist">
        {tabs.map(t => (
          <button key={t.id} className={tab === t.id ? 'active' : ''} onClick={() => setTab(t.id)}>
            {t.label}
            <span className="count">{t.count}</span>
          </button>
        ))}
      </div>

      {tab === 'receita'    && <ReceitaTable pickedRoomType={pickedRoomType}/>}
      {tab === 'ocupacao'   && <OcupacaoTable/>}
      {tab === 'clientes'   && <ClientesTable/>}
      {tab === 'equipe'     && <EquipeTable/>}
      {tab === 'satisfacao' && <SatisfacaoTable/>}
    </>
  );
}

function ReceitaTable({ pickedRoomType }) {
  const totals = TAB_RECEITA.reduce((a, r) => ({
    single: a.single + r.single, duplo: a.duplo + r.duplo, suite: a.suite + r.suite, total: a.total + r.total
  }), { single: 0, duplo: 0, suite: 0, total: 0 });

  return (
    <div className="table-card">
      <div className="table-head">
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Receita Detalhada por Dia</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
            Valores em BRL · {pickedRoomType ? <strong>destacando coluna: {pickedRoomType}</strong> : '7 dias'}
          </div>
        </div>
        <button className="btn sm"><Ic.ArrowDownTray size={13}/> Baixar CSV</button>
      </div>
      <div className="table-scroll">
        <table className="data">
          <thead>
            <tr>
              <th>Data</th>
              <th className="right" style={{ background: pickedRoomType==='single'? '#eaf3fc': undefined }}>Single</th>
              <th className="right" style={{ background: pickedRoomType==='duplo'? '#eef5e3': undefined }}>Duplo</th>
              <th className="right" style={{ background: pickedRoomType==='suite'? '#f0ebfb': undefined }}>Suíte</th>
              <th className="right">Total</th>
              <th className="right">Média / quarto</th>
            </tr>
          </thead>
          <tbody>
            {TAB_RECEITA.map(r => (
              <tr key={r.date}>
                <td><span className="mono">{r.date}</span></td>
                <td className="right mono" style={{ background: pickedRoomType==='single'? '#eaf3fc': undefined }}>
                  {r.single ? `R$ ${r.single}` : <span style={{ color: 'var(--ink-4)' }}>—</span>}
                </td>
                <td className="right mono" style={{ background: pickedRoomType==='duplo'? '#eef5e3': undefined }}>
                  R$ {r.duplo}
                </td>
                <td className="right mono" style={{ background: pickedRoomType==='suite'? '#f0ebfb': undefined }}>
                  R$ {r.suite}
                </td>
                <td className="right mono" style={{ fontWeight: 700 }}>R$ {r.total.toLocaleString('pt-BR')}</td>
                <td className="right mono" style={{ color: 'var(--ink-3)' }}>
                  R$ {Math.round(r.total / [r.single, r.duplo, r.suite].filter(v => v > 0).length).toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
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
        <button className="btn sm"><Ic.ArrowDownTray size={13}/> Baixar CSV</button>
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
                      <div style={{
                        width: `${r.taxa}%`, height: '100%',
                        background: r.taxa >= 80 ? 'var(--green)' : r.taxa >= 65 ? 'var(--blue)' : 'var(--orange)',
                        borderRadius: 4,
                      }}></div>
                    </div>
                  </div>
                </td>
                <td className="right">
                  <span className={`delta-chip ${r.up ? 'up' : 'down'}`}>
                    {r.up ? '▲' : '▼'} {r.delta} pts
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClientesTable() {
  return (
    <div className="table-card">
      <div className="table-head">
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Métricas de Clientes</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Hóspedes únicos e comportamento no período</div>
        </div>
        <button className="btn sm"><Ic.ArrowDownTray size={13}/> Baixar CSV</button>
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
            {TAB_CLIENTES.map(r => (
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
  const max = Math.max(...TAB_EQUIPE.map(s => s.prod));
  return (
    <div className="table-card">
      <div className="table-head">
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Desempenho da Equipe</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Tarefas concluídas, satisfação e produtividade no período</div>
        </div>
        <button className="btn sm"><Ic.ArrowDownTray size={13}/> Baixar CSV</button>
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
                    <div className={`avatar-sm ${s.av}`}>{s.init}</div>
                    <div>
                      <div className="cell-name">{s.name}</div>
                      <div className="cell-sub">{s.role}</div>
                    </div>
                  </div>
                </td>
                <td className="right mono">{s.tasks}</td>
                <td className="right">
                  <span className={`delta-chip ${s.succ >= 95 ? 'up' : s.succ >= 90 ? 'flat' : 'down'}`}>
                    {s.succ}%
                  </span>
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
                      <div style={{
                        width: `${(s.prod / max) * 100}%`, height: '100%',
                        background: s.prod === max ? 'var(--green)' : 'var(--blue)',
                        borderRadius: 3,
                      }}></div>
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
          <button className="btn sm"><Ic.ArrowDownTray size={13}/> Baixar CSV</button>
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
              padding: 12,
              borderRadius: 10,
              border: '1px solid var(--line)',
              background: h.kind === 'good' ? 'var(--green-soft)' : 'var(--red-soft)',
              borderColor: h.kind === 'good' ? 'rgba(99,153,34,0.25)' : 'rgba(226,75,74,0.22)',
            }}>
              <div style={{
                fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: h.kind === 'good' ? 'var(--green-ink)' : 'var(--red-ink)',
                marginBottom: 4,
              }}>{h.label}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{h.value}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{h.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Insights ----------
function Insights({ showToast }) {
  return (
    <div className="insights-grid">
      <div className="insight">
        <div className="insight-top">
          <div className="insight-icn good"><Ic.TrendUp size={20}/></div>
          <div style={{ flex: 1 }}>
            <span className="insight-tag good">Tendência positiva</span>
            <h4 className="insight-title">Ocupação crescendo</h4>
          </div>
        </div>
        <p className="insight-body">
          Últimos 7 dias com média de <strong>76%</strong> — alta consistente acima da meta de 70%. Sexta-feira atingiu pico histórico de <strong>89%</strong>.
        </p>
        <div className="insight-actions">
          <button className="btn sm">Ver detalhes</button>
          <button className="btn ghost sm">Compartilhar</button>
        </div>
      </div>

      <div className="insight">
        <div className="insight-top">
          <div className="insight-icn alert"><Ic.Warning size={20}/></div>
          <div style={{ flex: 1 }}>
            <span className="insight-tag alert">Atenção necessária</span>
            <h4 className="insight-title">Quarto 203 com reclamações</h4>
          </div>
        </div>
        <p className="insight-body">
          <strong>5 avaliações baixas</strong> nos últimos 30 dias mencionando <strong>barulho</strong>. NPS deste quarto: 4,2 (média geral 8,2).
        </p>
        <div className="insight-actions">
          <button className="btn sm" onClick={() => showToast('Investigação aberta para quarto 203')}>Investigar</button>
          <button className="btn sm" onClick={() => showToast('Manutenção solicitada para quarto 203')}>
            <Ic.Tools size={13}/> Manutenção
          </button>
        </div>
      </div>

      <div className="insight">
        <div className="insight-top">
          <div className="insight-icn info"><Ic.Star size={20}/></div>
          <div style={{ flex: 1 }}>
            <span className="insight-tag info">Destaque do mês</span>
            <h4 className="insight-title">Maria lidera a equipe</h4>
          </div>
        </div>
        <p className="insight-body">
          Maior satisfação <strong>(4,8/5)</strong> e produtividade <strong>(16 quartos/dia)</strong> — 100% de taxa de sucesso em 32 tarefas concluídas.
        </p>
        <div className="insight-actions">
          <button className="btn sm">Ver perfil</button>
          <button className="btn ghost sm" onClick={() => showToast('Reconhecimento enviado para Maria')}>
            <Ic.Sparkles size={13}/> Reconhecer
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Export panel ----------
function ExportPanel({ showToast }) {
  const [sections, setSections] = useState({
    resumo: true, graficos: true, tabelas: true, equipe: true, feedback: true,
  });
  const [format, setFormat] = useState('pdf');
  const [periodicity, setPeriodicity] = useState('weekly');
  const [email, setEmail] = useState('mariana@maranzul.com.br');

  const toggle = (k) => setSections(s => ({ ...s, [k]: !s[k] }));
  const checkedCount = Object.values(sections).filter(Boolean).length;

  const onGenerate = () => {
    showToast(`Relatório ${format.toUpperCase()} gerado · ${checkedCount} seções · ${periodicity === 'none' ? 'sem envio' : 'envio ' + (periodicity === 'weekly' ? 'semanal' : 'mensal') + ' para ' + email}`);
  };

  return (
    <div className="export-panel">
      <div>
        <div className="export-head">
          <h3>Exportar Relatório Completo</h3>
          <p>Monte um pacote com as seções que você precisa e agende envios automáticos por email.</p>
        </div>

        <div className="export-block">
          <div className="export-block-title">Seções incluídas <span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>({checkedCount}/5)</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { id: 'resumo',   label: 'Resumo Executivo', sub: '4 KPIs principais' },
              { id: 'graficos', label: 'Gráficos',          sub: '4 visualizações' },
              { id: 'tabelas',  label: 'Tabelas Detalhadas', sub: 'Receita e ocupação' },
              { id: 'equipe',   label: 'Análise de Equipe', sub: '5 colaboradores' },
              { id: 'feedback', label: 'Feedback de Clientes', sub: 'NPS + comentários' },
            ].map(o => (
              <div key={o.id} className={`check-row ${sections[o.id] ? 'on' : ''}`}
                   role="checkbox" aria-checked={sections[o.id]}
                   tabIndex="0"
                   onClick={() => toggle(o.id)}
                   onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(o.id); } }}>
                <div className="check-box">{sections[o.id] && <Ic.Check size={12} stroke={3}/>}</div>
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
            <button className={`format-card pdf ${format === 'pdf' ? 'on' : ''}`} onClick={() => setFormat('pdf')}>
              <div className="icn"><Ic.FileText size={18}/></div>
              <div className="name">PDF</div>
              <div className="desc">Ideal para impressão</div>
            </button>
            <button className={`format-card xlsx ${format === 'xlsx' ? 'on' : ''}`} onClick={() => setFormat('xlsx')}>
              <div className="icn"><Ic.Sheet size={18}/></div>
              <div className="name">Excel</div>
              <div className="desc">Análise avançada</div>
            </button>
            <button className={`format-card csv ${format === 'csv' ? 'on' : ''}`} onClick={() => setFormat('csv')}>
              <div className="icn"><Ic.Csv size={18}/></div>
              <div className="name">CSV</div>
              <div className="desc">Outras ferramentas</div>
            </button>
          </div>
        </div>

        <div className="export-block">
          <div className="export-block-title">Envio Automático</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { id: 'none',    label: 'Não enviar',        sub: 'gerar apenas uma vez' },
              { id: 'weekly',  label: 'Semanalmente',      sub: 'toda segunda-feira 08:00' },
              { id: 'monthly', label: 'Mensalmente',       sub: 'dia 1º de cada mês' },
            ].map(o => (
              <div key={o.id} className={`radio-row ${periodicity === o.id ? 'on' : ''}`}
                   role="radio" aria-checked={periodicity === o.id}
                   tabIndex="0"
                   onClick={() => setPeriodicity(o.id)}
                   onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setPeriodicity(o.id); } }}>
                <div className="radio-circle"></div>
                <div className="check-text">{o.label}</div>
                <div className="check-sub">{o.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {periodicity !== 'none' && (
          <div className="export-block">
            <div className="export-block-title">Enviar para</div>
            <div className="field">
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 12, color: 'var(--ink-3)' }}>
                  <Ic.Mail size={16}/>
                </span>
                <input className="input" style={{ paddingLeft: 36 }}
                       value={email} onChange={e => setEmail(e.target.value)}
                       placeholder="seu@email.com.br" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <div className="export-cta">
          <div className="meta">
            <strong>{checkedCount}</strong> seções · formato <strong>{format.toUpperCase()}</strong> · {' '}
            {periodicity === 'none' ? 'sem envio recorrente' :
              <>envio <strong>{periodicity === 'weekly' ? 'semanal' : 'mensal'}</strong> para <strong>{email}</strong></>}
          </div>
          <button className="btn primary lg" disabled={checkedCount === 0} onClick={onGenerate}>
            <Ic.ArrowDownTray size={16}/> Gerar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- App ----------
function App() {
  const [period, setPeriod] = useState('7d');
  const [roomType, setRoomType] = useState('todos');
  const [sortBy, setSortBy] = useState('receita');
  const [refreshing, setRefreshing] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [tab, setTab] = useState('receita');
  const [pickedRoomType, setPickedRoomType] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
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

  const onExport = (fmt) => {
    showToast(`Exportando relatório em ${fmt.toUpperCase()}…`);
  };

  const onEmail = () => {
    showToast('Relatório enviado por email para mariana@maranzul.com.br');
  };

  const onPickRoomType = (key) => {
    setPickedRoomType(key);
    if (key) setTab('receita');
  };

  const periodLabel = {
    '7d':   'Últimos 7 dias',
    '30d':  'Últimos 30 dias',
    '90d':  'Últimos 90 dias',
    'custom': 'Período personalizado',
  }[period];

  return (
    <div className="page">
      {/* Page head */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Relatórios &amp; Análises</h1>
          <div className="page-sub">
            <span>{periodLabel}</span>
            <span>·</span>
            <span>19 mai – 25 mai 2026</span>
            <span>·</span>
            <span>142 reservas analisadas</span>
          </div>
        </div>
      </div>

      <FiltersRow
        period={period} setPeriod={setPeriod}
        roomType={roomType} setRoomType={setRoomType}
        sortBy={sortBy} setSortBy={setSortBy}
        refreshing={refreshing} onRefresh={onRefresh}
        onExport={onExport} onEmail={onEmail}
        exportOpen={exportOpen} setExportOpen={setExportOpen}
      />

      <div className="section-label">Resumo Executivo</div>
      <KpiCards/>

      <div className="section-label">Visualizações</div>
      <ChartsGrid onPickRoomType={onPickRoomType} pickedRoomType={pickedRoomType}/>

      <div className="section-label">Análise Detalhada</div>
      <DetailTabs tab={tab} setTab={setTab} pickedRoomType={pickedRoomType}/>

      <div className="section-label">Insights &amp; Recomendações</div>
      <Insights showToast={showToast}/>

      <div className="section-label">Exportar &amp; Agendar</div>
      <ExportPanel showToast={showToast}/>

      {toast && (
        <div className="toast success">
          <Ic.Check size={16} stroke={2.5}/>{toast}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
