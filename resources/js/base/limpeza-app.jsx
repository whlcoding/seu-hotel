// Tarefas de Limpeza — kanban + list + detail modal
const { useState, useEffect, useMemo, useRef } = React;
const { I } = window;

// ---------- Mock data ----------
const STAFF = [
  { id: 's2', name: 'João da Silva',      short: 'João',    color: 'green' },
  { id: 's3', name: 'Camila Souza',       short: 'Camila',  color: 'blue' },
  { id: 's5', name: 'Larissa Mendonça',   short: 'Larissa', color: 'green' },
  { id: 's7', name: 'Beatriz Castro',     short: 'Beatriz', color: 'orange' },
  { id: 's4', name: 'Pedro Henrique',     short: 'Pedro',   color: 'orange' },
  { id: 's1', name: 'Mariana Reis',       short: 'Mariana', color: 'purple' },
];
const STAFF_BY = Object.fromEntries(STAFF.map(s => [s.id, s]));

const TYPE_LABELS = {
  completa: 'Limpeza completa',
  rapida: 'Limpeza rápida',
  manutencao: 'Manutenção',
  especial: 'Limpeza especial',
};
const TYPE_SHORT = {
  completa: 'Completa',
  rapida: 'Rápida',
  manutencao: 'Manutenção',
  especial: 'Especial',
};

const COLS = [
  { id: 'pendente',   label: 'Pendentes',     color: 'var(--red)' },
  { id: 'andamento',  label: 'Em andamento',  color: 'var(--blue)' },
  { id: 'concluida',  label: 'Concluídas',    color: 'var(--orange)' },
  { id: 'verificada', label: 'Verificadas',   color: 'var(--green)' },
];

const DEFAULT_CHECKLIST = [
  { id: 'bed',   label: 'Cama feita',          done: false },
  { id: 'bath',  label: 'Banheiro higienizado', done: false },
  { id: 'floor', label: 'Piso varrido & lavado',done: false },
  { id: 'dust',  label: 'Pó retirado',          done: false },
  { id: 'towel', label: 'Toalhas trocadas',     done: false },
  { id: 'trash', label: 'Lixo removido',        done: false },
  { id: 'tv',    label: 'TV testada',           done: false },
  { id: 'ac',    label: 'Ar condicionado OK',   done: false },
  { id: 'kit',   label: 'Acessórios repostos',  done: false },
];

function pad(n) { return String(n).padStart(2, '0'); }
function fmtMin(m) {
  const h = Math.floor(m / 60), mm = m % 60;
  if (h > 0) return `${h}h ${mm > 0 ? pad(mm) + 'min' : ''}`.trim();
  return `${mm}min`;
}
function initials(name) { return name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase(); }

const VERIFIER = { id: 'sV', name: 'Mariana Reis', short: 'Mariana', color: 'purple' };

const TASKS_INIT = [
  // pendentes
  { id: 't1',  room: '405', floor: 4, status: 'pendente',  type: 'completa', assignee: null,        priority: 'alta',   estimated: 90, real: 0,  startedAt: null, createdAt: '10:12', deadline: '14:30', note: 'Próximo check-in às 15:00 (Camila Souza).', checklist: DEFAULT_CHECKLIST },
  { id: 't2',  room: '305', floor: 3, status: 'pendente',  type: 'rapida',   assignee: null,        priority: 'normal', estimated: 30, real: 0,  startedAt: null, createdAt: '11:00', deadline: '16:00', note: '', checklist: DEFAULT_CHECKLIST },
  { id: 't3',  room: '208', floor: 2, status: 'pendente',  type: 'completa', assignee: null,        priority: 'normal', estimated: 90, real: 0,  startedAt: null, createdAt: '09:42', deadline: '15:00', note: '', checklist: DEFAULT_CHECKLIST },
  { id: 't4',  room: '107', floor: 1, status: 'pendente',  type: 'rapida',   assignee: 's5',        priority: 'baixa',  estimated: 30, real: 0,  startedAt: null, createdAt: '08:50', deadline: '17:30', note: '', checklist: DEFAULT_CHECKLIST },
  { id: 't5',  room: '502', floor: 5, status: 'pendente',  type: 'especial', assignee: null,        priority: 'alta',   estimated: 120,real: 0,  startedAt: null, createdAt: '07:30', deadline: '13:00', note: 'Hóspede VIP — montar amenities extras.', checklist: DEFAULT_CHECKLIST },
  { id: 't6',  room: '210', floor: 2, status: 'pendente',  type: 'manutencao', assignee: 's4',      priority: 'alta',   estimated: 60, real: 0,  startedAt: null, createdAt: '10:35', deadline: '13:30', note: 'Trocar lâmpada do banheiro.', checklist: DEFAULT_CHECKLIST },
  { id: 't7',  room: '108', floor: 1, status: 'pendente',  type: 'rapida',   assignee: null,        priority: 'normal', estimated: 30, real: 0,  startedAt: null, createdAt: '11:42', deadline: '18:00', note: '', checklist: DEFAULT_CHECKLIST },
  // andamento
  { id: 't8',  room: '102', floor: 1, status: 'andamento', type: 'completa', assignee: 's2',        priority: 'normal', estimated: 90, real: 45, startedAt: '10:30', createdAt: '09:00', deadline: '14:00', note: '', checklist: DEFAULT_CHECKLIST.map((c, i) => ({ ...c, done: i < 4 })) },
  { id: 't9',  room: '203', floor: 2, status: 'andamento', type: 'rapida',   assignee: 's3',        priority: 'alta',   estimated: 30, real: 18, startedAt: '11:12', createdAt: '10:45', deadline: '12:30', note: '', checklist: DEFAULT_CHECKLIST.map((c, i) => ({ ...c, done: i < 2 })) },
  { id: 't10', room: '404', floor: 4, status: 'andamento', type: 'completa', assignee: 's7',        priority: 'normal', estimated: 90, real: 62, startedAt: '10:08', createdAt: '09:30', deadline: '14:00', note: '', checklist: DEFAULT_CHECKLIST.map((c, i) => ({ ...c, done: i < 6 })) },
  // concluidas
  { id: 't11', room: '201', floor: 2, status: 'concluida', type: 'completa', assignee: 's2',        priority: 'normal', estimated: 90, real: 105,startedAt: null, createdAt: '08:00', deadline: '11:00', note: '', checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, done: true })) },
  { id: 't12', room: '303', floor: 3, status: 'concluida', type: 'rapida',   assignee: 's5',        priority: 'baixa',  estimated: 30, real: 28, startedAt: null, createdAt: '07:45', deadline: '10:00', note: '', checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, done: true })) },
  { id: 't13', room: '402', floor: 4, status: 'concluida', type: 'completa', assignee: 's3',        priority: 'normal', estimated: 90, real: 85, startedAt: null, createdAt: '08:15', deadline: '11:30', note: '', checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, done: true })) },
  // verificadas
  { id: 't14', room: '101', floor: 1, status: 'verificada', type: 'completa', assignee: 's2',       priority: 'normal', estimated: 90, real: 75, startedAt: null, createdAt: '07:30', deadline: '10:00', note: '', verifier: 'sV', verifiedAt: '10:45', checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, done: true })) },
  { id: 't15', room: '202', floor: 2, status: 'verificada', type: 'rapida',   assignee: 's3',       priority: 'baixa',  estimated: 30, real: 32, startedAt: null, createdAt: '07:50', deadline: '10:00', note: '', verifier: 'sV', verifiedAt: '10:50', checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, done: true })) },
  { id: 't16', room: '301', floor: 3, status: 'verificada', type: 'completa', assignee: 's5',       priority: 'normal', estimated: 90, real: 80, startedAt: null, createdAt: '07:55', deadline: '10:30', note: '', verifier: 'sV', verifiedAt: '11:10', checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, done: true })) },
  { id: 't17', room: '302', floor: 3, status: 'verificada', type: 'rapida',   assignee: 's7',       priority: 'baixa',  estimated: 30, real: 26, startedAt: null, createdAt: '08:30', deadline: '11:00', note: '', verifier: 'sV', verifiedAt: '11:30', checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, done: true })) },
];

// ---------- Components ----------
function MiniStat({ tone, icon, value, label }) {
  const IconC = I[icon];
  return (
    <div className="mini-stat">
      <div className={`mini-stat-ico ${tone}`}><IconC size={18} stroke={2} /></div>
      <div>
        <div className="mini-stat-v">{value}</div>
        <div className="mini-stat-k">{label}</div>
      </div>
    </div>
  );
}

function TaskCard({ task, onOpen, onDragStart, onDragEnd, onAssign, onAction, dragging }) {
  const assignee = task.assignee ? STAFF_BY[task.assignee] : null;
  const verifier = task.verifier ? VERIFIER : null;
  const checklistDone = task.checklist.filter(c => c.done).length;
  const checklistTotal = task.checklist.length;
  const checklistPct = (checklistDone / checklistTotal) * 100;

  const realMin = task.status === 'andamento' ? task.real : task.real;
  const over = realMin > task.estimated;

  // status-based primary action
  let primary = null;
  if (task.status === 'pendente') {
    if (!task.assignee) {
      primary = { id: 'assign', label: 'Atribuir', tone: 'primary' };
    } else {
      primary = { id: 'start', label: 'Iniciar', tone: 'primary' };
    }
  } else if (task.status === 'andamento') {
    primary = { id: 'complete', label: 'Concluir', tone: 'success' };
  } else if (task.status === 'concluida') {
    primary = { id: 'verify', label: 'Verificar', tone: 'success' };
  } else if (task.status === 'verificada') {
    primary = null;
  }

  return (
    <div className={`task-card ${dragging ? 'dragging' : ''}`}
         data-priority={task.priority}
         draggable="true"
         onClick={() => onOpen(task)}
         onDragStart={(e) => onDragStart(e, task)}
         onDragEnd={onDragEnd}>
      <div className="card-top">
        <div className="card-room">
          <span className="room-num">{task.room}</span>
          <span className="room-type">{TYPE_SHORT[task.type]}</span>
        </div>
        <span className={`priority-flag ${task.priority}`}>
          {task.priority === 'alta' && '⚠ '}
          {task.priority}
        </span>
      </div>

      {task.note && (
        <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.35 }}>
          {task.note}
        </div>
      )}

      <div className="card-meta">
        {task.status !== 'pendente' && (
          <div className="mi" title="Checklist">
            <I.Check size={13} />
            <span className="mono">{checklistDone}/{checklistTotal}</span>
          </div>
        )}
        <div className="mi" title="Andar">
          <I.Hotel size={13} />
          <span>Andar {task.floor}</span>
        </div>
        {task.status !== 'verificada' && (
          <div className="mi" title="Prazo">
            <I.Clock size={13} />
            até <strong className="mono">{task.deadline}</strong>
          </div>
        )}
      </div>

      {(task.status === 'andamento' || task.status === 'concluida') && (
        <div className={`progress ${task.status === 'concluida' ? 'success' : ''}`}>
          <span style={{ width: `${Math.min(100, checklistPct)}%` }}></span>
        </div>
      )}

      <div className="card-foot">
        {assignee ? (
          <span className="assignee">
            <span className={`avatar ${assignee.color}`}>{initials(assignee.name)}</span>
            {assignee.short}
          </span>
        ) : task.status === 'verificada' && verifier ? (
          <span className="assignee">
            <span className={`avatar ${verifier.color}`}>{initials(verifier.name)}</span>
            ✓ {verifier.short}
          </span>
        ) : (
          <span className="unassigned"><I.Warning size={11} /> Sem atribuição</span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {task.status === 'andamento' && (
            <span className="timer running" title="Tempo decorrido">
              <span className="mono">{fmtMin(realMin)}</span>
            </span>
          )}
          {(task.status === 'concluida' || task.status === 'verificada') && (
            <span className={`timer ${over ? 'over' : ''}`} title="Tempo total">
              <I.Clock size={11} />
              <span className="mono">{fmtMin(realMin)}</span>
            </span>
          )}
          {task.status === 'pendente' && (
            <span className="timer mono" title="Estimado">
              ~{fmtMin(task.estimated)}
            </span>
          )}
          {primary && (
            <button className={`btn ${primary.tone === 'success' ? 'success' : 'primary'} xs`}
                    onClick={(e) => { e.stopPropagation(); onAction(primary.id, task); }}>
              {primary.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Column({ col, tasks, onDrop, onDragOver, dragTarget, ...handlers }) {
  return (
    <div className={`col ${col.id} ${dragTarget === col.id ? 'drag-over' : ''}`}
         onDragOver={(e) => { e.preventDefault(); onDragOver(col.id); }}
         onDragLeave={() => onDragOver(null)}
         onDrop={(e) => { e.preventDefault(); onDrop(col.id); }}>
      <div className="col-head">
        <div className="col-title-row">
          <span className="col-dot"></span>
          <span className="col-title">{col.label}</span>
          <span className="col-count">{tasks.length}</span>
        </div>
        {col.id === 'pendente' && (
          <button className="col-add" onClick={handlers.onAddTask} aria-label="Nova tarefa">
            <I.Plus size={16} />
          </button>
        )}
      </div>
      <div className="col-body">
        {tasks.map(t => (
          <TaskCard key={t.id} task={t}
                    onOpen={handlers.onOpen}
                    onDragStart={handlers.onDragStart}
                    onDragEnd={handlers.onDragEnd}
                    onAction={handlers.onAction}
                    dragging={handlers.draggingId === t.id} />
        ))}
        {tasks.length === 0 && <div className="col-empty">Nenhuma tarefa</div>}
      </div>
    </div>
  );
}

function TaskModal({ task, onClose, onUpdate, onAction }) {
  const [draft, setDraft] = useState(task);
  useEffect(() => { setDraft(task); }, [task?.id]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  if (!task) return null;

  const assignee = draft.assignee ? STAFF_BY[draft.assignee] : null;
  const checklistDone = draft.checklist.filter(c => c.done).length;
  const checklistTotal = draft.checklist.length;

  const save = (patch) => {
    const next = { ...draft, ...patch };
    setDraft(next);
    onUpdate(next);
  };

  const toggleCheck = (id) => {
    save({ checklist: draft.checklist.map(c => c.id === id ? { ...c, done: !c.done } : c) });
  };

  // Status transitions buttons
  const statusButtons = [];
  if (draft.status === 'pendente') statusButtons.push({ id: 'start', label: 'Iniciar', tone: 'primary', icon: 'Check' });
  if (draft.status === 'andamento') {
    statusButtons.push({ id: 'pause', label: 'Pausar', tone: '', icon: 'Clock' });
    statusButtons.push({ id: 'complete', label: 'Concluir', tone: 'success', icon: 'Check' });
  }
  if (draft.status === 'concluida') {
    statusButtons.push({ id: 'reopen', label: 'Reabrir', tone: '', icon: 'Refresh' });
    statusButtons.push({ id: 'verify', label: 'Verificar & arquivar', tone: 'success', icon: 'Check' });
  }
  if (draft.status === 'verificada') {
    statusButtons.push({ id: 'reopen', label: 'Reverter para concluída', tone: '', icon: 'Refresh' });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <div>
            <h2 className="modal-title">
              <span className="room-num">{draft.room}</span>
              {TYPE_LABELS[draft.type]}
              <span className={`status-chip ${draft.status}`} style={{ marginLeft: 8 }}>
                <span className="dot"></span>
                {draft.status === 'pendente' ? 'Pendente' :
                 draft.status === 'andamento' ? 'Em andamento' :
                 draft.status === 'concluida' ? 'Concluída' : 'Verificada'}
              </span>
            </h2>
            <div className="modal-sub">
              Andar {draft.floor} · criada às <span className="mono">{draft.createdAt}</span> · prazo <span className="mono">{draft.deadline}</span>
            </div>
          </div>
          <button className="btn ghost icon" onClick={onClose} aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="field-grid">
            <div>
              <label className="label">Tipo</label>
              <div className="radio-grid">
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <button key={k} type="button"
                          className={`radio-btn ${draft.type === k ? 'active' : ''}`}
                          onClick={() => save({ type: k })}>
                    <span className="dot"></span>{v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Prioridade</label>
              <div className="radio-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {['alta','normal','baixa'].map(p => (
                  <button key={p} type="button"
                          className={`radio-btn ${draft.priority === p ? 'active' : ''}`}
                          onClick={() => save({ priority: p })}>
                    <span className="dot"></span>
                    {p[0].toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="field-grid" style={{ marginTop: 14 }}>
            <div>
              <label className="label">Atribuído a</label>
              <select className="select" style={{ width: '100%' }}
                      value={draft.assignee || ''}
                      onChange={(e) => save({ assignee: e.target.value || null })}>
                <option value="">— Não atribuído —</option>
                {STAFF.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {assignee && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--ink-2)' }}>
                  <span className={`avatar ${assignee.color}`}>{initials(assignee.name)}</span>
                  Responsável: <strong>{assignee.name}</strong>
                </div>
              )}
            </div>

            <div>
              <label className="label">Tempo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>Estimado</div>
                  <div className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{fmtMin(draft.estimated)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>Real</div>
                  <input className="input mono" style={{ width: '100%', fontSize: 16, fontWeight: 700, height: 32, padding: '0 10px' }}
                         value={draft.real}
                         onChange={(e) => save({ real: Math.max(0, parseInt(e.target.value.replace(/\D/g, '')) || 0) })} />
                </div>
              </div>
              {draft.real > draft.estimated && (
                <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--red-ink)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <I.Warning size={12} /> {draft.real - draft.estimated} min acima do estimado
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Checklist</span>
              <span className="mono" style={{ color: 'var(--green-ink)', textTransform: 'none', letterSpacing: 0 }}>{checklistDone}/{checklistTotal} concluídos</span>
            </label>
            <div className="checklist">
              {draft.checklist.map(c => (
                <div key={c.id}
                     className={`check-row ${c.done ? 'done' : ''}`}
                     onClick={() => toggleCheck(c.id)}
                     role="checkbox"
                     aria-checked={c.done}>
                  <div className="checkbox">{c.done && <I.Check size={11} stroke={3} />}</div>
                  <span className="check-text">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <label className="label" htmlFor="task-note">Observações</label>
            <textarea id="task-note"
                      className="textarea"
                      placeholder="Notas para a equipe…"
                      value={draft.note}
                      onChange={(e) => save({ note: e.target.value })} />
          </div>

          <details className="history">
            <summary>Histórico</summary>
            <div className="timeline">
              <div className="tl-item">
                <div className="tl-dot"><I.Plus size={10} stroke={2.5} /></div>
                <div className="tl-body">
                  Tarefa criada
                  <div className="tl-time">hoje · {draft.createdAt}</div>
                </div>
              </div>
              {assignee && (
                <div className="tl-item">
                  <div className="tl-dot"><I.User size={10} /></div>
                  <div className="tl-body">
                    Atribuída para <strong>{assignee.name}</strong>
                    <div className="tl-time">hoje · {draft.createdAt}</div>
                  </div>
                </div>
              )}
              {draft.startedAt && (
                <div className="tl-item">
                  <div className="tl-dot"><I.Clock size={10} /></div>
                  <div className="tl-body">
                    Início do serviço
                    <div className="tl-time">hoje · {draft.startedAt}</div>
                  </div>
                </div>
              )}
              {(draft.status === 'concluida' || draft.status === 'verificada') && (
                <div className="tl-item">
                  <div className="tl-dot green"><I.Check size={10} stroke={3} /></div>
                  <div className="tl-body">
                    Marcada como concluída · tempo total <span className="mono">{fmtMin(draft.real)}</span>
                    <div className="tl-time">hoje · {pad(parseInt(draft.createdAt) + 2)}:{(draft.createdAt.split(':')[1])}</div>
                  </div>
                </div>
              )}
              {draft.status === 'verificada' && (
                <div className="tl-item">
                  <div className="tl-dot green"><I.Check size={10} stroke={3} /></div>
                  <div className="tl-body">
                    Verificada por <strong>{VERIFIER.name}</strong>
                    <div className="tl-time">hoje · {draft.verifiedAt}</div>
                  </div>
                </div>
              )}
            </div>
          </details>
        </div>

        <div className="modal-foot">
          <button className="btn danger" onClick={() => onAction('delete', draft)}>
            Remover tarefa
          </button>
          <div className="right">
            <button className="btn" onClick={onClose}>Fechar</button>
            {statusButtons.map(b => {
              const IconC = I[b.icon];
              return (
                <button key={b.id}
                        className={`btn ${b.tone}`}
                        onClick={() => { onAction(b.id, draft); onClose(); }}>
                  <IconC size={14} /> {b.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListView({ rows, onOpen }) {
  return (
    <div className="list-card">
      <div className="list-scroll">
        <table className="tasks-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 18 }}>Quarto</th>
              <th>Tipo</th>
              <th>Atribuído</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Tempo</th>
              <th>Prazo</th>
              <th style={{ textAlign: 'right', paddingRight: 16 }}>Checklist</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(t => {
              const a = t.assignee ? STAFF_BY[t.assignee] : null;
              const done = t.checklist.filter(c => c.done).length;
              return (
                <tr key={t.id} onClick={() => onOpen(t)}>
                  <td style={{ paddingLeft: 18 }}>
                    <span className="room-num">{t.room}</span>
                  </td>
                  <td>{TYPE_LABELS[t.type]}</td>
                  <td>
                    {a
                      ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <span className={`avatar ${a.color}`}>{initials(a.name)}</span>
                          {a.short}
                        </span>
                      : <span className="unassigned"><I.Warning size={11} /> Sem atribuição</span>}
                  </td>
                  <td>
                    <span className={`status-chip ${t.status}`}>
                      <span className="dot"></span>
                      {t.status === 'pendente' ? 'Pendente' :
                       t.status === 'andamento' ? 'Em andamento' :
                       t.status === 'concluida' ? 'Concluída' : 'Verificada'}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-flag ${t.priority}`}>
                      {t.priority === 'alta' && '⚠ '}{t.priority}
                    </span>
                  </td>
                  <td className="mono">
                    {t.status === 'pendente' ? <span style={{ color: 'var(--ink-3)' }}>~{fmtMin(t.estimated)}</span> : fmtMin(t.real)}
                  </td>
                  <td className="mono">{t.deadline}</td>
                  <td style={{ textAlign: 'right', paddingRight: 16 }} className="mono">
                    {done}/{t.checklist.length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function App() {
  const [tasks, setTasks] = useState(TASKS_INIT);
  const [view, setView] = useState('kanban');
  const [search, setSearch] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [openTask, setOpenTask] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragTarget, setDragTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg, kind) => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2400); };

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      if (filterAssignee !== 'all') {
        if (filterAssignee === 'none' ? t.assignee : t.assignee !== filterAssignee) return false;
      }
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${t.room} ${TYPE_LABELS[t.type]} ${STAFF_BY[t.assignee]?.name || ''} ${t.note}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [tasks, search, filterAssignee, filterPriority]);

  const byCol = useMemo(() => {
    const o = { pendente: [], andamento: [], concluida: [], verificada: [] };
    filtered.forEach(t => o[t.status]?.push(t));
    return o;
  }, [filtered]);

  const counts = {
    pendente: tasks.filter(t => t.status === 'pendente').length,
    andamento: tasks.filter(t => t.status === 'andamento').length,
    concluida: tasks.filter(t => t.status === 'concluida').length,
    verificada: tasks.filter(t => t.status === 'verificada').length,
  };

  const unassigned = tasks.filter(t => !t.assignee && t.status !== 'verificada').length;

  const updateTask = (next) => {
    setTasks(prev => prev.map(t => t.id === next.id ? next : t));
    setOpenTask(prev => prev?.id === next.id ? next : prev);
  };

  const moveTaskStatus = (id, newStatus, opts = {}) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = { ...t, status: newStatus };
      if (newStatus === 'andamento' && !t.startedAt) {
        const now = new Date();
        next.startedAt = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
        if (!t.assignee) next.assignee = STAFF[0].id;
      }
      if (newStatus === 'concluida') {
        next.checklist = t.checklist.map(c => ({ ...c, done: true }));
        if (!t.real) next.real = t.estimated;
      }
      if (newStatus === 'verificada') {
        const now = new Date();
        next.verifier = 'sV';
        next.verifiedAt = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
      }
      return next;
    }));
  };

  const onDragStart = (e, task) => {
    setDraggingId(task.id);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragEnd = () => { setDraggingId(null); setDragTarget(null); };
  const onDrop = (colId) => {
    if (draggingId) {
      const task = tasks.find(t => t.id === draggingId);
      if (task && task.status !== colId) {
        moveTaskStatus(draggingId, colId);
        showToast(`Tarefa do quarto ${task.room} movida para ${COLS.find(c => c.id === colId).label}`, 'success');
      }
    }
    setDraggingId(null);
    setDragTarget(null);
  };

  const handleAction = (action, task) => {
    switch (action) {
      case 'start':
        moveTaskStatus(task.id, 'andamento');
        showToast(`Iniciada limpeza do quarto ${task.room}`, '');
        break;
      case 'pause':
        moveTaskStatus(task.id, 'pendente');
        showToast(`Tarefa do quarto ${task.room} pausada`, 'warn');
        break;
      case 'complete':
        moveTaskStatus(task.id, 'concluida');
        showToast(`Quarto ${task.room} concluído`, 'success');
        break;
      case 'verify':
        moveTaskStatus(task.id, 'verificada');
        showToast(`Quarto ${task.room} verificado`, 'success');
        break;
      case 'reopen':
        moveTaskStatus(task.id, task.status === 'verificada' ? 'concluida' : 'andamento');
        showToast(`Tarefa do quarto ${task.room} reaberta`, '');
        break;
      case 'assign':
        setOpenTask(task);
        break;
      case 'delete':
        setTasks(prev => prev.filter(t => t.id !== task.id));
        setOpenTask(null);
        showToast(`Tarefa do quarto ${task.room} removida`, 'warn');
        break;
      default:
    }
  };

  const onAddTask = () => {
    const id = 't' + Date.now();
    const newTask = {
      id, room: '', floor: 1, status: 'pendente', type: 'completa',
      assignee: null, priority: 'normal', estimated: 60, real: 0,
      startedAt: null, createdAt: `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`,
      deadline: '18:00', note: '', checklist: DEFAULT_CHECKLIST,
    };
    setTasks([newTask, ...tasks]);
    setOpenTask(newTask);
  };

  const onRefresh = () => {
    setRefreshing(true);
    showToast('Sincronizando…', '');
    setTimeout(() => { setRefreshing(false); showToast('Tarefas atualizadas', 'success'); }, 800);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Tarefas de Limpeza</h1>
          <div className="page-sub">
            {tasks.length} tarefas no dia ·
            {' '}{counts.pendente} pendente{counts.pendente === 1 ? '' : 's'} ·
            {' '}{unassigned > 0 ? <strong style={{ color: 'var(--red-ink)' }}>{unassigned} sem atribuição</strong> : 'todas atribuídas'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={onRefresh} disabled={refreshing}>
            {refreshing ? <span className="spin"></span> : <I.Refresh size={15} />}
            Atualizar
          </button>
          <button className="btn primary" onClick={onAddTask}>
            <I.Plus size={15} stroke={2.5} /> Nova tarefa
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <MiniStat tone="red"    icon="Warning" value={counts.pendente}   label="Pendentes" />
        <MiniStat tone="blue"   icon="Clock"   value={counts.andamento}  label="Em andamento" />
        <MiniStat tone="orange" icon="Check"   value={counts.concluida}  label="Concluídas hoje" />
        <MiniStat tone="green"  icon="Sparkles"value={counts.verificada} label="Verificadas hoje" />
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="view-toggle">
          <button className={view === 'kanban' ? 'active' : ''} onClick={() => setView('kanban')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="5" height="16" rx="1"/><rect x="10" y="4" width="5" height="11" rx="1"/><rect x="17" y="4" width="4" height="7" rx="1"/></svg>
            Kanban
          </button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            Lista
          </button>
        </div>

        <div className="input-wrap">
          <span className="ico-left"><I.Search size={14} /></span>
          <input className="input has-left"
                 placeholder="Buscar quarto, tipo, colaborador…"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 style={{ width: 240 }} />
        </div>

        <select className="select" value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)}>
          <option value="all">Todos colaboradores</option>
          <option value="none">Sem atribuição</option>
          {STAFF.map(s => <option key={s.id} value={s.id}>{s.short}</option>)}
        </select>

        <select className="select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="all">Todas prioridades</option>
          <option value="alta">Alta</option>
          <option value="normal">Normal</option>
          <option value="baixa">Baixa</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--red)' }}></span> Alta
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--orange)' }}></span> Normal
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--green)' }}></span> Baixa
          </span>
        </div>
      </div>

      {/* Board / List */}
      {view === 'kanban' ? (
        <div className="board">
          {COLS.map(col => (
            <Column key={col.id} col={col}
                    tasks={byCol[col.id]}
                    dragTarget={dragTarget}
                    onDragOver={setDragTarget}
                    onDrop={onDrop}
                    onOpen={setOpenTask}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onAction={handleAction}
                    onAddTask={onAddTask}
                    draggingId={draggingId} />
          ))}
        </div>
      ) : (
        <ListView rows={filtered} onOpen={setOpenTask} />
      )}

      {openTask && (
        <TaskModal task={openTask}
                   onClose={() => setOpenTask(null)}
                   onUpdate={updateTask}
                   onAction={handleAction} />
      )}

      {toast && (
        <div className={`toast ${toast.kind || ''}`}>
          {toast.kind === 'warn' || toast.kind === 'error'
            ? <I.Warning size={16} />
            : <I.Check size={16} stroke={2.5} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
