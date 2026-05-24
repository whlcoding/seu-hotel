// Nova Reserva — multi-step wizard with sticky summary
const { useState, useEffect, useMemo, useRef } = React;
const { I } = window;

// ---------- Mock data ----------
const GUESTS_DB = [
  { id: 'g1', name: 'João Silva',       email: 'joao.silva@email.com',    phone: '+55 11 98765-4321', cpf: '342.118.690-55', stays: 3, last: '12/03/2026', tag: 'VIP',     avatarColor: '' },
  { id: 'g2', name: 'Camila Souza',     email: 'camila.souza@gmail.com',  phone: '+55 21 99812-3344', cpf: '108.554.221-09', stays: 1, last: '02/01/2026', tag: 'Novo',    avatarColor: 'blue' },
  { id: 'g3', name: 'Eduardo Antunes',  email: 'eduardo@antunes.co',      phone: '+55 11 98112-9988', cpf: '775.331.004-12', stays: 7, last: '18/04/2026', tag: 'VIP',     avatarColor: 'green' },
  { id: 'g4', name: 'Mariana Reis',     email: 'mari.reis@outlook.com',   phone: '+55 11 99977-2211', cpf: '441.880.220-77', stays: 2, last: '29/12/2025', tag: '',        avatarColor: 'purple' },
  { id: 'g5', name: 'Pedro Henrique',   email: 'pedrohbm@gmail.com',      phone: '+55 31 98800-1122', cpf: '903.221.114-44', stays: 5, last: '01/05/2026', tag: '',        avatarColor: 'blue' },
  { id: 'g6', name: 'Larissa Mendonça', email: 'lari.mend@hotmail.com',   phone: '+55 41 99655-3322', cpf: '551.224.788-90', stays: 1, last: '10/05/2026', tag: 'Novo',    avatarColor: 'green' },
];

const ROOM_TYPES = [
  {
    id: 'single',
    name: 'Single',
    capacity: '1 pessoa',
    capacityNum: 1,
    bed: '1 cama de solteiro',
    price: 180,
    avail: 4,
    total: 8,
    nums: ['101', '102', '103', '104', '105', '106', '107', '108'],
    occupiedNums: ['102', '105', '107'],
  },
  {
    id: 'duplo',
    name: 'Duplo',
    capacity: 'até 2 pessoas',
    capacityNum: 2,
    bed: '1 cama de casal · 1 sofá-cama',
    price: 250,
    avail: 6,
    total: 14,
    nums: ['201', '202', '203', '204', '205', '301', '302', '303', '304', '305', '401', '402', '403', '404'],
    occupiedNums: ['201', '203', '301', '305', '401', '403', '404'],
  },
  {
    id: 'suite',
    name: 'Suíte',
    capacity: 'até 4 pessoas',
    capacityNum: 4,
    bed: '1 cama queen · varanda',
    price: 480,
    avail: 1,
    total: 4,
    nums: ['501', '502', '503', '504'],
    occupiedNums: ['501', '503', '504'],
  },
];

const CHANNELS = ['Recepção (Telefone)', 'Website', 'App', 'Booking.com', 'Expedia', 'Agência de viagens', 'Walk-in'];

// ---------- Helpers ----------
function fmtBR(n) { return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function pad(n) { return String(n).padStart(2, '0'); }
function isoDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function fromIso(s) { if (!s) return null; const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function diffNights(a, b) {
  if (!a || !b) return 0;
  const A = fromIso(a), B = fromIso(b);
  if (!A || !B) return 0;
  return Math.max(0, Math.round((B - A) / 86400000));
}
function fmtDateBR(iso) {
  const d = fromIso(iso);
  if (!d) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function initials(name) { return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(); }
function onlyDigits(s) { return (s || '').replace(/\D/g, ''); }
function fmtCpf(s) {
  const d = onlyDigits(s).slice(0, 11);
  let out = d;
  if (d.length > 9) out = `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
  else if (d.length > 6) out = `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  else if (d.length > 3) out = `${d.slice(0,3)}.${d.slice(3)}`;
  return out;
}
function fmtPhone(s) {
  const d = onlyDigits(s).slice(0, 13);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `+${d.slice(0,2)} ${d.slice(2)}`;
  if (d.length <= 9) return `+${d.slice(0,2)} ${d.slice(2,4)} ${d.slice(4)}`;
  if (d.length <= 11) return `+${d.slice(0,2)} ${d.slice(2,4)} ${d.slice(4,9)}-${d.slice(9)}`;
  return `+${d.slice(0,2)} ${d.slice(2,4)} ${d.slice(4,9)}-${d.slice(9,13)}`;
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CPF_RE = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// ---------- Components ----------
function StepIndicator({ steps }) {
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`step ${s.state}`}>
            <span className="step-num">
              {s.state === 'done' ? <I.Check size={13} stroke={3} /> : (i + 1)}
            </span>
            <span className="step-label">{s.label}</span>
          </div>
          {i < steps.length - 1 && <div className={`step-line ${s.state === 'done' ? 'done' : ''}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

function GuestSection({ guest, setGuest, newGuest, setNewGuest, mode, setMode, errors }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [hl, setHl] = useState(0);
  const wrapRef = useRef(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GUESTS_DB.slice(0, 5);
    return GUESTS_DB.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.cpf.includes(q)
    ).slice(0, 6);
  }, [query]);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, []);

  const selectGuest = (g) => {
    setGuest(g);
    setMode('existing');
    setOpen(false);
    setQuery('');
  };

  const isComplete = !!guest || (mode === 'new' && newGuest.name && EMAIL_RE.test(newGuest.email || '') && (newGuest.phone || '').length > 8 && CPF_RE.test(newGuest.cpf || ''));

  return (
    <section className={`section ${isComplete ? 'complete' : ''}`} id="section-guest">
      <div className="section-head">
        <div className="section-num">{isComplete ? <I.Check size={14} stroke={3} /> : '1'}</div>
        <div style={{ flex: 1 }}>
          <h2 className="section-title">Hóspede</h2>
          <div className="section-sub">Busque um hóspede existente ou cadastre um novo</div>
        </div>
      </div>

      {!guest && mode === 'search' && (
        <div className="guest-search-row" ref={wrapRef}>
          <div className="autocomplete">
            <label className="label" htmlFor="guest-search">Buscar hóspede <span className="opt">por nome, email ou CPF</span></label>
            <div className="input-wrap">
              <span className="ico-left"><I.Search size={16} /></span>
              <input id="guest-search"
                     className="input has-left"
                     placeholder="Ex: João Silva, joao@…, 342.118…"
                     value={query}
                     onChange={(e) => { setQuery(e.target.value); setOpen(true); setHl(0); }}
                     onFocus={() => setOpen(true)}
                     onKeyDown={(e) => {
                       if (e.key === 'ArrowDown') { e.preventDefault(); setHl(h => Math.min(h + 1, matches.length - 1)); }
                       else if (e.key === 'ArrowUp') { e.preventDefault(); setHl(h => Math.max(h - 1, 0)); }
                       else if (e.key === 'Enter' && open && matches[hl]) { e.preventDefault(); selectGuest(matches[hl]); }
                       else if (e.key === 'Escape') setOpen(false);
                     }}
                     autoComplete="off" />
            </div>
            {open && matches.length > 0 && (
              <div className="autocomplete-list" role="listbox">
                {matches.map((g, i) => (
                  <button key={g.id} type="button"
                          className={`autocomplete-item ${i === hl ? 'hl' : ''}`}
                          onMouseEnter={() => setHl(i)}
                          onClick={() => selectGuest(g)}>
                    <div className={`avatar ${g.avatarColor}`}>{initials(g.name)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ac-name">
                        {g.name}
                        {g.tag === 'VIP' && <span className="pill orange" style={{ marginLeft: 8 }}>VIP</span>}
                      </div>
                      <div className="ac-meta">{g.email} · {g.stays} estadia{g.stays === 1 ? '' : 's'}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className="btn lg" onClick={() => { setMode('new'); setOpen(false); }}>
            <I.Plus size={15} /> Novo Hóspede
          </button>
        </div>
      )}

      {guest && (
        <div className="guest-selected">
          <div className={`avatar ${guest.avatarColor}`}>{initials(guest.name)}</div>
          <div className="guest-selected-info">
            <div className="guest-selected-name">
              {guest.name}
              {guest.tag === 'VIP' && <span className="pill orange" style={{ marginLeft: 8 }}>VIP</span>}
              {guest.tag === 'Novo' && <span className="pill blue" style={{ marginLeft: 8 }}>Primeira estadia</span>}
            </div>
            <div className="guest-selected-meta">
              {guest.email} · {guest.phone} · CPF {guest.cpf}
            </div>
            <div className="guest-selected-meta" style={{ marginTop: 2 }}>
              <span style={{ color: 'var(--ink-3)' }}>{guest.stays} estadia{guest.stays === 1 ? '' : 's'} · Última: {guest.last}</span>
            </div>
          </div>
          <button type="button" className="btn sm" onClick={() => { setGuest(null); setMode('search'); }}>Trocar</button>
        </div>
      )}

      {!guest && mode === 'new' && (
        <div className="expand">
          <div className="expand-head">
            <div className="expand-title">Cadastrar novo hóspede</div>
            <button type="button" className="btn ghost sm" onClick={() => setMode('search')}>
              <I.ChevronLeft size={14} /> Voltar à busca
            </button>
          </div>

          <div className="row cols-2">
            <div className={`field ${errors.ng_name ? 'error' : (newGuest.name ? 'valid' : '')}`}>
              <label className="label" htmlFor="ng-name">Nome completo <span className="req">*</span></label>
              <div className="input-wrap">
                <input id="ng-name" className="input" placeholder="Ex: Camila Souza"
                       value={newGuest.name || ''}
                       onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })} />
                {newGuest.name && !errors.ng_name && <span className="ico-right"><I.Check size={16} stroke={2.5} /></span>}
              </div>
              <div className="error-msg"><I.Warning size={13} /> Informe o nome completo</div>
            </div>

            <div className={`field ${errors.ng_email ? 'error' : (EMAIL_RE.test(newGuest.email || '') ? 'valid' : '')}`}>
              <label className="label" htmlFor="ng-email">Email <span className="req">*</span></label>
              <div className="input-wrap">
                <input id="ng-email" type="email" className="input" placeholder="hospede@email.com"
                       value={newGuest.email || ''}
                       onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })} />
                {EMAIL_RE.test(newGuest.email || '') && <span className="ico-right"><I.Check size={16} stroke={2.5} /></span>}
              </div>
              <div className="error-msg"><I.Warning size={13} /> Informe um email válido</div>
            </div>
          </div>

          <div className="row cols-2">
            <div className={`field ${errors.ng_phone ? 'error' : (onlyDigits(newGuest.phone).length >= 10 ? 'valid' : '')}`}>
              <label className="label" htmlFor="ng-phone">Telefone <span className="req">*</span></label>
              <div className="input-wrap">
                <input id="ng-phone" className="input" placeholder="+55 11 99999-9999"
                       value={newGuest.phone || ''}
                       onChange={(e) => setNewGuest({ ...newGuest, phone: fmtPhone(e.target.value) })} />
                {onlyDigits(newGuest.phone).length >= 10 && <span className="ico-right"><I.Check size={16} stroke={2.5} /></span>}
              </div>
              <div className="error-msg"><I.Warning size={13} /> Informe um telefone válido</div>
            </div>

            <div className={`field ${errors.ng_cpf ? 'error' : (CPF_RE.test(newGuest.cpf || '') ? 'valid' : '')}`}>
              <label className="label" htmlFor="ng-cpf">CPF <span className="req">*</span></label>
              <div className="input-wrap">
                <input id="ng-cpf" className="input" placeholder="000.000.000-00"
                       inputMode="numeric"
                       value={newGuest.cpf || ''}
                       onChange={(e) => setNewGuest({ ...newGuest, cpf: fmtCpf(e.target.value) })} />
                {CPF_RE.test(newGuest.cpf || '') && <span className="ico-right"><I.Check size={16} stroke={2.5} /></span>}
              </div>
              <div className="error-msg"><I.Warning size={13} /> CPF incompleto</div>
            </div>
          </div>

          <div className="row cols-2">
            <div className="field">
              <label className="label" htmlFor="ng-addr">Endereço <span className="opt">opcional</span></label>
              <input id="ng-addr" className="input" placeholder="Rua, número, cidade"
                     value={newGuest.address || ''}
                     onChange={(e) => setNewGuest({ ...newGuest, address: e.target.value })} />
            </div>
            <div className="field">
              <label className="label" htmlFor="ng-dob">Data de Nascimento <span className="opt">opcional</span></label>
              <input id="ng-dob" type="date" className="input"
                     value={newGuest.dob || ''}
                     onChange={(e) => setNewGuest({ ...newGuest, dob: e.target.value })} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function RoomSection({ roomType, setRoomType, roomNumber, setRoomNumber }) {
  const isComplete = !!roomType && !!roomNumber;
  return (
    <section className={`section ${isComplete ? 'complete' : ''}`} id="section-room">
      <div className="section-head">
        <div className="section-num">{isComplete ? <I.Check size={14} stroke={3} /> : '2'}</div>
        <div style={{ flex: 1 }}>
          <h2 className="section-title">Quarto</h2>
          <div className="section-sub">Escolha o tipo de quarto e a unidade</div>
        </div>
      </div>

      <div className="room-grid">
        {ROOM_TYPES.map(r => {
          const sel = roomType?.id === r.id;
          const availClass = r.avail === 0 ? 'none' : r.avail <= 2 ? 'low' : 'ok';
          const photoCls = r.id === 'duplo' ? 'duplo' : r.id === 'suite' ? 'suite' : '';
          return (
            <button key={r.id} type="button"
                    className={`room-card ${sel ? 'selected' : ''} ${r.avail === 0 ? 'unavailable' : ''}`}
                    onClick={() => {
                      if (r.avail === 0) return;
                      setRoomType(r);
                      // pick first free room
                      const firstFree = r.nums.find(n => !r.occupiedNums.includes(n));
                      setRoomNumber(firstFree || null);
                    }}>
              <div className={`room-photo ${photoCls}`}>
                <div className="ico">
                  {r.id === 'single' && <I.User size={28} stroke={1.5} />}
                  {r.id === 'duplo' && <I.Users size={28} stroke={1.5} />}
                  {r.id === 'suite' && <I.Star size={28} stroke={1.5} />}
                </div>
              </div>
              <div className="room-check">
                {sel && <I.Check size={13} stroke={3} />}
              </div>
              <div className="room-name">
                {r.name}
                <span className={`room-availability ${availClass}`}>
                  {r.avail === 0 ? 'esgotado' : `${r.avail}/${r.total}`}
                </span>
              </div>
              <div className="room-meta">
                <span>{r.capacity}</span>
                <span className="dot"></span>
                <span>{r.bed}</span>
              </div>
              <div className="room-price">
                <div>
                  <span className="v">R$ {r.price}</span>
                </div>
                <span className="u">por noite</span>
              </div>
            </button>
          );
        })}
      </div>

      {roomType && (
        <>
          <label className="label" style={{ marginTop: 18 }}>
            Selecione o quarto <span className="opt">{roomType.nums.length - roomType.occupiedNums.length} disponíveis</span>
          </label>
          <div className="room-numbers">
            {roomType.nums.map(n => {
              const taken = roomType.occupiedNums.includes(n);
              return (
                <button key={n} type="button"
                        className={`room-num-btn ${roomNumber === n ? 'active' : ''}`}
                        disabled={taken}
                        title={taken ? 'Ocupado neste período' : 'Disponível'}
                        onClick={() => setRoomNumber(n)}>
                  {n}
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

function MiniCalendar({ checkin, checkout, onPick }) {
  const today = new Date('2026-05-23T00:00:00');
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });

  const monthName = new Date(view.y, view.m, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const firstDay = new Date(view.y, view.m, 1);
  const startOffset = firstDay.getDay(); // 0 = Sun
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const daysPrev = new Date(view.y, view.m, 0).getDate();

  // deterministic availability seed
  const availFor = (y, m, d) => {
    const seed = (y * 372 + m * 31 + d) % 100;
    if (seed < 15) return 'low';
    if (seed < 50) return 'mid';
    return 'high';
  };
  const isUnavailable = (y, m, d) => {
    const seed = (y * 372 + m * 31 + d) % 100;
    return seed < 5;
  };

  const cells = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push({ d: daysPrev - startOffset + 1 + i, dim: true });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ d: i, dim: false });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1];
    cells.push({ d: last.dim && last.d > 20 ? last.d + 1 : 1, dim: true });
  }

  const ciIso = checkin;
  const coIso = checkout;

  const ciTime = ciIso ? fromIso(ciIso).getTime() : null;
  const coTime = coIso ? fromIso(coIso).getTime() : null;

  return (
    <div className="mini-cal">
      <div className="mini-cal-head">
        <div className="mini-cal-title" style={{ textTransform: 'capitalize' }}>{monthName}</div>
        <div className="mini-cal-nav">
          <button type="button" className="btn sm ghost" onClick={() => setView(v => ({ y: v.m === 0 ? v.y - 1 : v.y, m: (v.m + 11) % 12 }))}>
            <I.ChevronLeft size={14} />
          </button>
          <button type="button" className="btn sm ghost" onClick={() => setView(v => ({ y: v.m === 11 ? v.y + 1 : v.y, m: (v.m + 1) % 12 }))}>
            <I.ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="cal-grid">
        {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => (
          <div key={d} className="cal-dow">{d.slice(0,1)}</div>
        ))}
        {cells.map((c, i) => {
          if (c.dim) return <div key={i} className="cal-day dim">{c.d}</div>;
          const dt = new Date(view.y, view.m, c.d);
          const t = dt.getTime();
          const iso = isoDate(dt);
          const isToday = isoDate(dt) === isoDate(today);
          const unavail = isUnavailable(view.y, view.m, c.d);
          const avail = availFor(view.y, view.m, c.d);
          const isStart = ciIso === iso;
          const isEnd = coIso === iso;
          const inRange = ciTime && coTime && t > ciTime && t < coTime;

          let cls = 'cal-day';
          if (unavail && !isStart && !isEnd) cls += ' unavail';
          if (isToday) cls += ' today';
          if (inRange) cls += ' in-range';
          if (isStart) cls += ' start';
          if (isEnd) cls += ' end';

          return (
            <div key={i} className={cls}
                 onClick={() => { if (!unavail) onPick(iso); }}
                 title={unavail ? 'Sem disponibilidade' : ''}>
              {c.d}
              {!isStart && !isEnd && !inRange && (
                <span className={`avail-dot ${avail}`}></span>
              )}
            </div>
          );
        })}
      </div>

      <div className="cal-legend">
        <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'var(--green)' }}></span>alta disponibilidade</div>
        <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'var(--orange)' }}></span>poucas vagas</div>
        <div className="cal-legend-item"><span className="cal-legend-dot" style={{ background: 'var(--red)' }}></span>esgotado</div>
      </div>
    </div>
  );
}

function DateSection({ checkin, setCheckin, checkout, setCheckout, errors }) {
  const nights = diffNights(checkin, checkout);
  const isComplete = !!checkin && !!checkout && nights > 0;
  const conflict = errors.dateConflict;

  // Click on calendar — sets start, then end
  const onPickDate = (iso) => {
    if (!checkin || (checkin && checkout)) {
      setCheckin(iso); setCheckout('');
    } else {
      const a = fromIso(checkin), b = fromIso(iso);
      if (b.getTime() <= a.getTime()) {
        setCheckin(iso); setCheckout('');
      } else {
        setCheckout(iso);
      }
    }
  };

  return (
    <section className={`section ${isComplete ? 'complete' : ''}`} id="section-dates">
      <div className="section-head">
        <div className="section-num">{isComplete ? <I.Check size={14} stroke={3} /> : '3'}</div>
        <div style={{ flex: 1 }}>
          <h2 className="section-title">Datas</h2>
          <div className="section-sub">Defina o período da estadia. Clique no calendário para selecionar.</div>
        </div>
      </div>

      <div className="row cols-2">
        <div className={`field ${errors.checkin ? 'error' : (checkin ? 'valid' : '')}`}>
          <div className="date-card">
            <label htmlFor="checkin">Check-in</label>
            <input id="checkin" type="date" value={checkin}
                   min="2026-05-23"
                   onChange={(e) => setCheckin(e.target.value)} />
          </div>
          <div className="error-msg" style={{ marginTop: 6 }}><I.Warning size={13} /> Informe a data de check-in</div>
        </div>
        <div className={`field ${errors.checkout ? 'error' : (checkout && nights > 0 ? 'valid' : '')}`}>
          <div className="date-card">
            <label htmlFor="checkout">Check-out</label>
            <input id="checkout" type="date" value={checkout}
                   min={checkin || '2026-05-24'}
                   onChange={(e) => setCheckout(e.target.value)} />
          </div>
          <div className="error-msg" style={{ marginTop: 6 }}><I.Warning size={13} /> Check-out deve ser após o check-in</div>
        </div>
      </div>

      {nights > 0 && (
        <div className="nights-bar">
          <div className="l">
            <I.Calendar size={18} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{nights} noite{nights > 1 ? 's' : ''}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{fmtDateBR(checkin)} → {fmtDateBR(checkout)}</div>
            </div>
          </div>
          <div className="v">{nights}</div>
        </div>
      )}

      {conflict && (
        <div className="conflict">
          <I.Warning size={16} />
          <div>
            <strong>Atenção:</strong> as datas selecionadas têm baixa disponibilidade no tipo escolhido.
            Sugerimos confirmar o quarto antes de seguir.
          </div>
        </div>
      )}

      <MiniCalendar checkin={checkin} checkout={checkout} onPick={onPickDate} />
    </section>
  );
}

function ReviewSection({ data }) {
  const ready = data.guest && data.roomType && data.roomNumber && data.nights > 0;
  return (
    <section className={`section ${ready ? 'complete' : ''}`} id="section-review">
      <div className="section-head">
        <div className="section-num">{ready ? <I.Check size={14} stroke={3} /> : '4'}</div>
        <div style={{ flex: 1 }}>
          <h2 className="section-title">Revisar</h2>
          <div className="section-sub">Confira os detalhes no resumo ao lado antes de confirmar</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <ReviewItem label="Hóspede" value={data.guest ? data.guest.name : null} icon="User" />
        <ReviewItem label="Quarto" value={data.roomNumber ? `${data.roomNumber} · ${data.roomType.name}` : null} icon="Hotel" />
        <ReviewItem label="Período" value={data.nights > 0 ? `${fmtDateBR(data.checkin)} → ${fmtDateBR(data.checkout)}` : null} icon="Calendar" />
        <ReviewItem label="Total" value={data.nights > 0 && data.roomType ? `R$ ${fmtBR(data.nights * data.roomType.price)}` : null} icon="Cash" />
      </div>

      {!ready && (
        <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--ink-3)' }}>
          Complete as seções acima para habilitar o botão <strong>Criar Reserva</strong>.
        </div>
      )}
    </section>
  );
}

function ReviewItem({ label, value, icon }) {
  const IconC = I[icon];
  return (
    <div style={{
      border: '1px solid var(--line)',
      borderRadius: 10,
      padding: 12,
      background: value ? '#fbfbf6' : 'transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
        <IconC size={13} /> {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: value ? 'var(--ink)' : 'var(--ink-4)', fontStyle: value ? 'normal' : 'italic' }}>
        {value || 'Não definido'}
      </div>
    </div>
  );
}

function Summary({ data, channel, setChannel, status, setStatus, onCancel, onSubmit, canSubmit, submitting }) {
  const total = data.nights > 0 && data.roomType ? data.nights * data.roomType.price : 0;
  const tax = total > 0 ? Math.round(total * 0.05) : 0;

  return (
    <div className="summary-card">
      <div className="summary-head">
        <h3 className="summary-title">Resumo da reserva</h3>
        <div className="summary-sub">Atualizado em tempo real</div>
      </div>
      <div className="summary-body">
        <div className="summary-row">
          <span className="k">Hóspede</span>
          <span className={`v ${!data.guest ? 'empty' : ''}`}>{data.guest ? data.guest.name : 'A definir'}</span>
        </div>
        <div className="summary-row">
          <span className="k">Quarto</span>
          <span className={`v ${!data.roomNumber ? 'empty' : ''}`}>
            {data.roomNumber ? <span><span className="mono">{data.roomNumber}</span> · {data.roomType.name}</span> : 'A definir'}
          </span>
        </div>
        <div className="summary-row">
          <span className="k">Check-in</span>
          <span className={`v ${!data.checkin ? 'empty' : ''}`}><span className="mono">{data.checkin ? fmtDateBR(data.checkin) : '—'}</span></span>
        </div>
        <div className="summary-row">
          <span className="k">Check-out</span>
          <span className={`v ${!data.checkout ? 'empty' : ''}`}><span className="mono">{data.checkout ? fmtDateBR(data.checkout) : '—'}</span></span>
        </div>
        <div className="summary-row">
          <span className="k">Noites</span>
          <span className={`v ${data.nights === 0 ? 'empty' : ''}`}><span className="mono">{data.nights || '—'}</span></span>
        </div>
        <div className="summary-row">
          <span className="k">Preço por noite</span>
          <span className={`v ${!data.roomType ? 'empty' : ''}`}><span className="mono">{data.roomType ? `R$ ${data.roomType.price},00` : '—'}</span></span>
        </div>
        {total > 0 && (
          <div className="summary-row">
            <span className="k">Subtotal</span>
            <span className="v"><span className="mono">R$ {fmtBR(total)}</span></span>
          </div>
        )}
        {tax > 0 && (
          <div className="summary-row">
            <span className="k">Taxa de serviço (5%)</span>
            <span className="v"><span className="mono">R$ {fmtBR(tax)}</span></span>
          </div>
        )}
      </div>

      <div className="summary-total">
        <span className="k">Total</span>
        <span className="v">R$ {fmtBR(total + tax)}</span>
      </div>

      <div className="summary-foot">
        <div>
          <label className="label" htmlFor="channel">Canal de origem</label>
          <select id="channel" className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
            {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Status</label>
          <div className="radio-row">
            <button type="button" className={`radio-btn ${status === 'confirmada' ? 'active' : ''}`}
                    onClick={() => setStatus('confirmada')}>
              <span className="dot"></span> Confirmada
            </button>
            <button type="button" className={`radio-btn ${status === 'pendente' ? 'active' : ''}`}
                    onClick={() => setStatus('pendente')}>
              <span className="dot"></span> Pendente
            </button>
          </div>
        </div>

        <div className="cta-row" style={{ marginTop: 4 }}>
          <button type="button" className="btn lg" onClick={onCancel}>Cancelar</button>
          <button type="button" className="btn primary lg"
                  disabled={!canSubmit || submitting}
                  onClick={onSubmit}>
            {submitting ? <><span className="spin"></span> Criando…</> : <><I.Check size={15} stroke={2.5} /> Criar Reserva</>}
          </button>
        </div>

        <div style={{ fontSize: 11.5, color: 'var(--ink-4)', textAlign: 'center', marginTop: 4 }}>
          O hóspede receberá uma confirmação por email.
        </div>
      </div>
    </div>
  );
}

function App() {
  const [guest, setGuest] = useState(null);
  const [mode, setMode] = useState('search'); // 'search' | 'new'
  const [newGuest, setNewGuest] = useState({});

  const [roomType, setRoomType] = useState(null);
  const [roomNumber, setRoomNumber] = useState(null);

  const [checkin, setCheckin] = useState('2026-05-23');
  const [checkout, setCheckout] = useState('2026-05-25');

  const [channel, setChannel] = useState('Recepção (Telefone)');
  const [status, setStatus] = useState('confirmada');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  const [toast, setToast] = useState(null);

  const nights = diffNights(checkin, checkout);

  // Effective guest: existing or new
  const effectiveGuest = guest || (mode === 'new' && newGuest.name && EMAIL_RE.test(newGuest.email || '') && CPF_RE.test(newGuest.cpf || '')
    ? { id: 'new', name: newGuest.name, email: newGuest.email, phone: newGuest.phone, cpf: newGuest.cpf, stays: 0, last: '—', tag: 'Novo', avatarColor: 'blue' }
    : null);

  // Determine completion of each step (for indicator)
  const stepGuestDone = !!effectiveGuest;
  const stepRoomDone = !!roomType && !!roomNumber;
  const stepDatesDone = !!checkin && !!checkout && nights > 0;
  const stepReviewDone = stepGuestDone && stepRoomDone && stepDatesDone;

  const stepState = (done, isCurrent) => done ? 'done' : (isCurrent ? 'active' : '');
  const currentStep = !stepGuestDone ? 1 : !stepRoomDone ? 2 : !stepDatesDone ? 3 : 4;

  const steps = [
    { label: 'Hóspede', state: stepState(stepGuestDone, currentStep === 1) },
    { label: 'Quarto', state: stepState(stepRoomDone, currentStep === 2) },
    { label: 'Datas', state: stepState(stepDatesDone, currentStep === 3) },
    { label: 'Revisar', state: stepState(stepReviewDone, currentStep === 4) },
  ];

  // Date conflict warning (mock: dates within next 7 days and Suite picked)
  useEffect(() => {
    const next = {};
    if (roomType?.id === 'suite' && nights > 0) {
      next.dateConflict = true;
    }
    setErrors(prev => ({ ...prev, ...next, dateConflict: next.dateConflict || false }));
  }, [roomType, nights]);

  const canSubmit = stepReviewDone;

  const showToast = (msg, kind) => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2600);
  };

  const handleSubmit = () => {
    // Validate new-guest fields if applicable
    const next = {};
    if (!guest && mode === 'new') {
      if (!newGuest.name) next.ng_name = true;
      if (!EMAIL_RE.test(newGuest.email || '')) next.ng_email = true;
      if (onlyDigits(newGuest.phone).length < 10) next.ng_phone = true;
      if (!CPF_RE.test(newGuest.cpf || '')) next.ng_cpf = true;
    } else if (!guest && mode === 'search') {
      next.ng_name = true;
    }
    if (!checkin) next.checkin = true;
    if (!checkout || nights === 0) next.checkout = true;

    if (Object.keys(next).length > 0) {
      setErrors(prev => ({ ...prev, ...next }));
      showToast('Revise os campos destacados', 'error');
      // scroll to first error
      const firstErrSection =
        next.ng_name || next.ng_email || next.ng_phone || next.ng_cpf ? 'section-guest' :
        next.checkin || next.checkout ? 'section-dates' : null;
      if (firstErrSection) {
        const el = document.getElementById(firstErrSection);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      const ref = `RES-${Math.floor(Math.random() * 9000 + 1000)}`;
      setCreated({ ref });
      showToast('Reserva criada com sucesso', 'success');
    }, 1100);
  };

  const handleCancel = () => {
    if (window.confirm('Cancelar e voltar ao dashboard?')) {
      window.location.href = 'index.html';
    }
  };

  if (created) {
    const total = nights * (roomType?.price || 0);
    const tax = Math.round(total * 0.05);
    return (
      <div className="page">
        <div className="success-screen">
          <div className="check"><I.Check size={32} stroke={3} /></div>
          <h2>Reserva criada</h2>
          <p>A reserva foi registrada e o hóspede receberá a confirmação por email.</p>
          <div className="ref">{created.ref}</div>
          <div style={{ textAlign: 'left', background: '#f6f6f3', borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
              <span style={{ color: 'var(--ink-3)' }}>Hóspede</span><strong>{effectiveGuest.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
              <span style={{ color: 'var(--ink-3)' }}>Quarto</span><strong>{roomNumber} · {roomType.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
              <span style={{ color: 'var(--ink-3)' }}>Período</span><strong>{fmtDateBR(checkin)} → {fmtDateBR(checkout)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderTop: '1px dashed var(--line-strong)', marginTop: 6, paddingTop: 8 }}>
              <span style={{ color: 'var(--ink-3)' }}>Total</span><strong className="mono">R$ {fmtBR(total + tax)}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <a href="index.html" className="btn">Ver dashboard</a>
            <button className="btn primary" onClick={() => { setCreated(null); setGuest(null); setRoomType(null); setRoomNumber(null); }}>
              <I.Plus size={14} /> Nova reserva
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">Criar Nova Reserva</h1>
        <div className="page-sub">Preencha as etapas abaixo. O resumo é atualizado em tempo real.</div>
      </div>

      <StepIndicator steps={steps} />

      <div className="layout">
        <div>
          <GuestSection
            guest={guest} setGuest={setGuest}
            newGuest={newGuest} setNewGuest={setNewGuest}
            mode={mode} setMode={setMode}
            errors={errors} />

          <RoomSection
            roomType={roomType} setRoomType={setRoomType}
            roomNumber={roomNumber} setRoomNumber={setRoomNumber} />

          <DateSection
            checkin={checkin} setCheckin={setCheckin}
            checkout={checkout} setCheckout={setCheckout}
            errors={errors} />

          <ReviewSection
            data={{ guest: effectiveGuest, roomType, roomNumber, checkin, checkout, nights }} />
        </div>

        <aside className="summary-col">
          <Summary
            data={{ guest: effectiveGuest, roomType, roomNumber, checkin, checkout, nights }}
            channel={channel} setChannel={setChannel}
            status={status} setStatus={setStatus}
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            canSubmit={canSubmit}
            submitting={submitting} />
        </aside>
      </div>

      {toast && (
        <div className={`toast ${toast.kind || ''}`}>
          {toast.kind === 'error'
            ? <I.Warning size={16} />
            : <I.Check size={16} stroke={2.5} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
