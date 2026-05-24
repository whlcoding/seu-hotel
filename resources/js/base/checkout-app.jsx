// Check-out — final bill, payment, rating
const { useState, useMemo, useEffect, useRef } = React;
const { I } = window;

// ---------- Mock guests currently checked-in ----------
const ACTIVE_STAYS = [
  {
    id: 521, ref: 'RES-521', guest: 'João Silva', email: 'joao.silva@email.com',
    phone: '+55 11 98765-4321', cpf: '342.118.690-55',
    room: '101', roomType: 'Duplo',
    pricePerNight: 250, nights: 2,
    checkin: { date: '23/05/2026', time: '14:30' },
    checkout: { date: '25/05/2026', time: '10:45' },
    avatarColor: '', tag: 'VIP',
    paidUpfront: true,
  },
  {
    id: 524, ref: 'RES-524', guest: 'Camila Souza', email: 'camila.souza@gmail.com',
    phone: '+55 21 99812-3344', cpf: '108.554.221-09',
    room: '305', roomType: 'Single',
    pricePerNight: 180, nights: 2,
    checkin: { date: '24/05/2026', time: '15:12' },
    checkout: { date: '26/05/2026', time: '11:00' },
    avatarColor: 'blue', tag: 'Novo',
    paidUpfront: false,
  },
  {
    id: 519, ref: 'RES-519', guest: 'Pedro Costa', email: 'pedro.costa@email.com',
    phone: '+55 31 98800-1122', cpf: '903.221.114-44',
    room: '502', roomType: 'Suíte',
    pricePerNight: 480, nights: 3,
    checkin: { date: '22/05/2026', time: '13:50' },
    checkout: { date: '25/05/2026', time: '12:00' },
    avatarColor: 'purple', tag: '',
    paidUpfront: true,
  },
  {
    id: 525, ref: 'RES-525', guest: 'Eduardo Antunes', email: 'eduardo@antunes.co',
    phone: '+55 11 98112-9988', cpf: '775.331.004-12',
    room: '203', roomType: 'Duplo',
    pricePerNight: 250, nights: 4,
    checkin: { date: '21/05/2026', time: '16:20' },
    checkout: { date: '25/05/2026', time: '10:00' },
    avatarColor: 'green', tag: 'VIP',
    paidUpfront: false,
  },
];

function initials(name) { return name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase(); }
function fmtBR(n) { return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

// ---------- Catalog of consumable items ----------
function buildItems(stay) {
  return [
    { id: 'lodging', name: 'Hospedagem',         unit: stay.pricePerNight, qty: stay.nights, unitLabel: 'noite',     icon: 'Hotel', locked: true, checked: true },
    { id: 'park',    name: 'Estacionamento',      unit: 20,                qty: stay.nights, unitLabel: 'diária',    icon: 'Tools', checked: true },
    { id: 'rs',      name: 'Room Service',         unit: 45,                qty: 0,           unitLabel: 'pedido',    icon: 'Cash',  checked: false },
    { id: 'mini',    name: 'Mini bar',             unit: 35,                qty: 0,           unitLabel: 'consumo',   icon: 'Cash',  checked: false },
    { id: 'call',    name: 'Ligação internacional',unit: 12,                qty: 0,           unitLabel: 'minuto',    icon: 'Bell',  checked: false },
    { id: 'laundry', name: 'Lavanderia',           unit: 28,                qty: 0,           unitLabel: 'peça',      icon: 'Sparkles', checked: false },
    { id: 'spa',     name: 'Spa & Massagem',       unit: 180,               qty: 0,           unitLabel: 'sessão',    icon: 'Star',  checked: false },
  ];
}

// ---------- Components ----------
function GuestSearch({ onSelect }) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hl, setHl] = useState(0);
  const wrapRef = useRef(null);

  const matches = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ACTIVE_STAYS;
    return ACTIVE_STAYS.filter(g =>
      g.guest.toLowerCase().includes(s) ||
      g.email.toLowerCase().includes(s) ||
      g.room.includes(s) ||
      String(g.id).includes(s) ||
      g.ref.toLowerCase().includes(s)
    );
  }, [q]);

  useEffect(() => {
    const h = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    window.addEventListener('mousedown', h);
    return () => window.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="autocomplete" ref={wrapRef}>
      <label className="label" htmlFor="guest-search">
        Buscar hóspede ativo <span className="opt">{ACTIVE_STAYS.length} estadias em curso</span>
      </label>
      <div className="input-wrap">
        <span className="ico-left"><I.Search size={16} /></span>
        <input id="guest-search"
               className="input has-left"
               placeholder="Nome, quarto, #ID ou email…"
               value={q}
               onChange={(e) => { setQ(e.target.value); setOpen(true); setHl(0); }}
               onFocus={() => setOpen(true)}
               onKeyDown={(e) => {
                 if (e.key === 'ArrowDown') { e.preventDefault(); setHl(h => Math.min(h + 1, matches.length - 1)); }
                 else if (e.key === 'ArrowUp') { e.preventDefault(); setHl(h => Math.max(h - 1, 0)); }
                 else if (e.key === 'Enter' && open && matches[hl]) { e.preventDefault(); onSelect(matches[hl]); setOpen(false); setQ(''); }
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
                    onClick={() => { onSelect(g); setOpen(false); setQ(''); }}>
              <div className={`avatar ${g.avatarColor}`}>{initials(g.guest)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ac-name">
                  {g.guest}
                  {g.tag === 'VIP' && <span className="pill orange" style={{ marginLeft: 8 }}>VIP</span>}
                </div>
                <div className="ac-meta">
                  <span className="mono">#{g.id}</span> · Quarto {g.room} ({g.roomType}) · check-out hoje {g.checkout.time}
                </div>
              </div>
              <span className="pill green" style={{ marginLeft: 'auto' }}>Hospedado</span>
            </button>
          ))}
        </div>
      )}
      {open && matches.length === 0 && (
        <div className="autocomplete-list" style={{ padding: 16, color: 'var(--ink-3)', fontSize: 13, textAlign: 'center' }}>
          Nenhuma estadia ativa corresponde a "<strong style={{ color: 'var(--ink)' }}>{q}</strong>"
        </div>
      )}
    </div>
  );
}

function StayCard({ stay }) {
  return (
    <div className="stay-grid">
      <div className={`avatar stay-avatar ${stay.avatarColor}`}>{initials(stay.guest)}</div>
      <div>
        <div className="stay-name">{stay.guest}</div>
        <div className="stay-tags">
          <span className="pill green">Hospedado</span>
          {stay.tag === 'VIP' && <span className="pill orange">VIP</span>}
          <span className="pill blue">{stay.ref}</span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>· {stay.email}</span>
        </div>
      </div>
      <div className="stay-kv" style={{ gridColumn: '1 / -1' }}>
        <div className="kv-item">
          <span className="kv-k">Quarto</span>
          <span className="kv-v">{stay.room}<small>{stay.roomType}</small></span>
        </div>
        <div className="kv-item">
          <span className="kv-k">Check-in</span>
          <span className="kv-v">{stay.checkin.date}<small>{stay.checkin.time}</small></span>
        </div>
        <div className="kv-item">
          <span className="kv-k">Check-out</span>
          <span className="kv-v">{stay.checkout.date}<small>{stay.checkout.time}</small></span>
        </div>
        <div className="kv-item">
          <span className="kv-k">Noites</span>
          <span className="kv-v">{stay.nights}<small>R$ {stay.pricePerNight}/noite</small></span>
        </div>
      </div>
    </div>
  );
}

function ItemsList({ items, setItems }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const toggle = (id) => {
    setItems(items.map(it => {
      if (it.id !== id) return it;
      const next = !it.checked;
      return { ...it, checked: next, qty: next ? Math.max(it.qty, 1) : it.qty };
    }));
  };
  const setQty = (id, qty) => {
    qty = Math.max(0, Math.min(99, qty));
    setItems(items.map(it => it.id === id ? { ...it, qty, checked: qty > 0 ? it.checked : false } : it));
  };
  const removeItem = (id) => setItems(items.filter(it => it.id !== id));

  const addManual = () => {
    if (!newName || !Number(newPrice)) return;
    const id = 'm' + Date.now();
    setItems([...items, { id, name: newName, unit: Number(newPrice), qty: 1, unitLabel: 'unidade', icon: 'Plus', checked: true, custom: true }]);
    setNewName(''); setNewPrice(''); setAdding(false);
  };

  return (
    <div>
      <div className="items">
        {items.map(it => {
          const IconC = I[it.icon] || I.Plus;
          const subtotal = it.unit * it.qty;
          return (
            <div key={it.id} className={`item ${it.checked && it.qty > 0 ? 'checked' : 'unchecked'}`}>
              <div className="check" onClick={() => !it.locked && toggle(it.id)}
                   role="checkbox" aria-checked={it.checked} tabIndex="0">
                {it.checked && <I.Check size={13} stroke={3} />}
              </div>
              <div className="item-ico"><IconC size={18} /></div>
              <div className="item-body">
                <div className="item-name">
                  {it.name}
                  {it.locked && <span style={{ fontSize: 10.5, color: 'var(--ink-3)', marginLeft: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>obrigatório</span>}
                  {it.custom && <span className="pill blue" style={{ marginLeft: 8 }}>manual</span>}
                </div>
                <div className="item-calc">
                  {it.qty} × R$ {fmtBR(it.unit)}/{it.unitLabel}
                </div>
              </div>
              <div className="item-qty">
                <button className="qty-btn" disabled={it.locked || it.qty <= 0} onClick={() => setQty(it.id, it.qty - 1)} aria-label="Diminuir">−</button>
                <span className="qty-val">{it.qty}</span>
                <button className="qty-btn" disabled={it.locked} onClick={() => setQty(it.id, it.qty + 1)} aria-label="Aumentar">+</button>
              </div>
              <div className="item-amount">R$ {fmtBR(subtotal)}</div>
              {it.custom && (
                <button className="item-remove" onClick={() => removeItem(it.id)} aria-label="Remover">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        {adding ? (
          <div className="add-item-form">
            <input className="input" placeholder="Nome do item (ex: Late check-out)"
                   value={newName} onChange={(e) => setNewName(e.target.value)}
                   autoFocus
                   onKeyDown={(e) => { if (e.key === 'Enter') addManual(); }} />
            <input className="input mono" placeholder="R$ 0,00" inputMode="decimal"
                   value={newPrice}
                   onChange={(e) => setNewPrice(e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.'))}
                   onKeyDown={(e) => { if (e.key === 'Enter') addManual(); }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn sm" onClick={() => { setAdding(false); setNewName(''); setNewPrice(''); }}>Cancelar</button>
              <button className="btn primary sm" disabled={!newName || !Number(newPrice)} onClick={addManual}>Adicionar</button>
            </div>
          </div>
        ) : (
          <button className="btn" onClick={() => setAdding(true)}>
            <I.Plus size={14} stroke={2.5} /> Adicionar item manual
          </button>
        )}
      </div>
    </div>
  );
}

function StarsInput({ value, onChange, label, icon }) {
  const [hover, setHover] = useState(0);
  const IconC = I[icon];
  return (
    <div className="rating-row">
      <div className="rating-label">
        {IconC && <IconC size={15} stroke={1.75} />}
        {label}
      </div>
      <div className="rating-stars" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
        {[1,2,3,4,5].map(n => (
          <button key={n}
                  type="button"
                  className={`star-btn ${(hover || value) >= n ? 'active' : ''}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => onChange(n)}
                  aria-label={`${n} estrela${n > 1 ? 's' : ''}`}>
            <svg width="22" height="22" viewBox="0 0 24 24"
                 fill={(hover || value) >= n ? 'currentColor' : 'none'}
                 stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.6 19.6l1-6L3.3 9.4l6-.9L12 3z"/>
            </svg>
          </button>
        ))}
      </div>
      <span className="rating-val">{value ? `${value}.0` : '—'}</span>
    </div>
  );
}

function Bill({ stay, items, subtotal, tax, total, paymentStatus, setPaymentStatus, payment, setPayment, change, canFinalize, submitting, onPreview, onCancel, onFinalize }) {
  return (
    <div className="bill">
      <div className="bill-head">
        <div className="bill-head-row">
          <h3 className="bill-title">Conta Final</h3>
          <span className="bill-ref">{stay.ref}</span>
        </div>
        <div className="bill-name">{stay.guest}</div>
        <div className="bill-room">Quarto {stay.room} · {stay.roomType} · {stay.nights} noite{stay.nights > 1 ? 's' : ''}</div>
      </div>

      <div className="bill-body">
        {items.filter(it => it.checked && it.qty > 0).map(it => (
          <div key={it.id} className="bill-line">
            <div className="l">
              <div className="name">{it.name}</div>
              <div className="calc">{it.qty} × R$ {fmtBR(it.unit)}</div>
            </div>
            <div className="amount">R$ {fmtBR(it.unit * it.qty)}</div>
          </div>
        ))}
        {items.filter(it => it.checked && it.qty > 0).length === 0 && (
          <div className="bill-line muted">
            <div className="l"><div className="name">Nenhum item selecionado</div></div>
            <div className="amount">R$ 0,00</div>
          </div>
        )}

        <div className="bill-sub">
          <div className="bill-line">
            <div className="l"><div className="name">Subtotal</div></div>
            <div className="amount">R$ {fmtBR(subtotal)}</div>
          </div>
          <div className="bill-line">
            <div className="l"><div className="name">Imposto de serviço (5%)</div></div>
            <div className="amount">R$ {fmtBR(tax)}</div>
          </div>
        </div>
      </div>

      <div className="bill-total">
        <span className="k">Total a pagar</span>
        <span className="v">R$ {fmtBR(total)}</span>
      </div>

      <div className="bill-foot">
        <div>
          <div className="label">Pagamento</div>
          <div className="radio-row">
            <button type="button"
                    className={`radio-btn ${paymentStatus === 'paid' ? 'active' : ''}`}
                    onClick={() => setPaymentStatus('paid')}>
              <span className="dot"></span> Já pago no check-in
            </button>
            <button type="button"
                    className={`radio-btn ${paymentStatus === 'now' ? 'active' : ''}`}
                    onClick={() => setPaymentStatus('now')}>
              <span className="dot"></span> Pagar agora
            </button>
          </div>
        </div>

        {paymentStatus === 'now' && (
          <div className="pay-form">
            <div>
              <label className="label" htmlFor="pay-method">Método</label>
              <select id="pay-method" className="select" value={payment.method}
                      onChange={(e) => setPayment({ ...payment, method: e.target.value })}>
                <option value="card">Cartão de crédito</option>
                <option value="debit">Cartão de débito</option>
                <option value="cash">Dinheiro</option>
                <option value="pix">Pix</option>
                <option value="check">Cheque</option>
              </select>
            </div>
            {payment.method === 'cash' && (
              <>
                <div>
                  <label className="label" htmlFor="pay-amount">Valor recebido</label>
                  <div className="input-wrap">
                    <span className="ico-left mono" style={{ fontWeight: 700, color: 'var(--ink-3)' }}>R$</span>
                    <input id="pay-amount" className="input has-left mono"
                           inputMode="decimal" placeholder="0,00"
                           value={payment.amount}
                           onChange={(e) => setPayment({ ...payment, amount: e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.') })} />
                  </div>
                </div>
                {payment.amount && (
                  <div className={`change-card ${change < 0 ? 'error' : ''}`}>
                    <span>{change < 0 ? 'Falta receber' : 'Troco'}</span>
                    <span className="v">R$ {fmtBR(Math.abs(change))}</span>
                  </div>
                )}
              </>
            )}
            {payment.method === 'pix' && (
              <div style={{ background: '#f3faec', border: '1px dashed #cee0ad', padding: 10, borderRadius: 8, fontSize: 12.5, color: 'var(--green-ink)' }}>
                <strong>Pix gerado automaticamente.</strong> Expira em 10 minutos. O sistema confirma o pagamento na hora.
              </div>
            )}
          </div>
        )}

        {paymentStatus === 'paid' && stay.paidUpfront && (
          <div className="change-card" style={{ background: '#eef5e3', color: 'var(--green-ink)' }}>
            <span><I.Check size={14} stroke={2.5} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Pagamento confirmado no check-in</span>
            <span className="v">{stay.checkin.date}</span>
          </div>
        )}
        {paymentStatus === 'paid' && !stay.paidUpfront && (
          <div className="change-card error">
            <span><I.Warning size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Não há registro de pagamento prévio</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr', gap: 8, marginTop: 4 }}>
          <button className="btn" onClick={onPreview} title="Pré-visualizar recibo">
            <I.Search size={14} />
          </button>
          <button className="btn" onClick={onCancel}>Cancelar</button>
          <button className="btn success lg" disabled={!canFinalize || submitting} onClick={onFinalize}>
            {submitting ? <><span className="spin"></span> Finalizando…</> : <><I.Check size={15} stroke={2.5} /> Finalizar</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ stay, total, ratings, onPrint, onEmail, onNew, onClose }) {
  const avg = useMemo(() => {
    const vals = Object.values(ratings).filter(v => v > 0);
    if (!vals.length) return 0;
    return (vals.reduce((a,b) => a+b, 0) / vals.length).toFixed(1);
  }, [ratings]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-check"><I.Check size={36} stroke={3} /></div>
          <h2 className="modal-title">Check-out realizado!</h2>
          <p className="modal-sub">Obrigado pela hospedagem, <strong>{stay.guest.split(' ')[0]}</strong>!</p>
        </div>
        <div className="modal-body">
          <div className="receipt-preview">
            <div className="receipt-row">
              <span>Reserva</span>
              <strong className="mono">{stay.ref}</strong>
            </div>
            <div className="receipt-row">
              <span>Quarto</span>
              <strong>{stay.room} · {stay.roomType}</strong>
            </div>
            <div className="receipt-row">
              <span>Período</span>
              <strong>{stay.checkin.date} → {stay.checkout.date}</strong>
            </div>
            {avg > 0 && (
              <div className="receipt-row">
                <span>Avaliação</span>
                <strong style={{ color: '#b8860b' }}>★ {avg} / 5</strong>
              </div>
            )}
            <div className="receipt-row total">
              <span>Total cobrado</span>
              <strong>R$ {fmtBR(total)}</strong>
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center' }}>
            Recibo arquivado em <span className="mono">recibos/{stay.ref}.pdf</span>
          </div>
        </div>
        <div className="modal-foot">
          <div className="row">
            <button className="btn" onClick={onPrint}>
              <I.ArrowDownTray size={14} /> Imprimir recibo
            </button>
            <button className="btn" onClick={onEmail}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
              Enviar por email
            </button>
          </div>
          <button className="btn primary" onClick={onNew}>
            <I.Plus size={14} stroke={2.5} /> Novo check-out
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ stay, items, subtotal, tax, total, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pré-visualização do recibo</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>Pousada Mar Azul</div>
          </div>
          <button className="btn ghost sm" onClick={onClose} aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{ padding: 24, fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, lineHeight: 1.7 }}>
          <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--line-strong)', paddingBottom: 12, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Manrope, sans-serif' }}>Recibo de Hospedagem</div>
            <div style={{ color: 'var(--ink-3)' }}>{stay.ref} · {new Date().toLocaleDateString('pt-BR')}</div>
          </div>
          <div>Hóspede: <strong>{stay.guest}</strong></div>
          <div>CPF: {stay.cpf}</div>
          <div>Quarto: {stay.room} ({stay.roomType})</div>
          <div>Período: {stay.checkin.date} {stay.checkin.time} → {stay.checkout.date} {stay.checkout.time}</div>
          <div style={{ borderTop: '1px dashed var(--line-strong)', marginTop: 12, paddingTop: 12 }}>
            {items.filter(it => it.checked && it.qty > 0).map(it => (
              <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{it.name} × {it.qty}</span>
                <span>R$ {fmtBR(it.unit * it.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px dashed var(--line-strong)', marginTop: 12, paddingTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>R$ {fmtBR(subtotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Imposto (5%)</span><span>R$ {fmtBR(tax)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 6, fontSize: 14 }}>
              <span>TOTAL</span><span>R$ {fmtBR(total)}</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--ink-3)' }}>
            Volte sempre · pousadamarazul.com.br
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Default: start with first active stay selected for fast prototyping
  const [stay, setStay] = useState(ACTIVE_STAYS[0]);
  const [items, setItems] = useState(() => buildItems(ACTIVE_STAYS[0]));
  const [paymentStatus, setPaymentStatus] = useState(ACTIVE_STAYS[0].paidUpfront ? 'paid' : 'now');
  const [payment, setPayment] = useState({ method: 'card', amount: '' });
  const [ratings, setRatings] = useState({ limpeza: 4, conforto: 5, atendimento: 4, wifi: 3 });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [preview, setPreview] = useState(false);
  const [toast, setToast] = useState(null);

  const subtotal = useMemo(() => items.filter(it => it.checked && it.qty > 0).reduce((s, it) => s + it.unit * it.qty, 0), [items]);
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax;
  const amountPaid = Number(payment.amount) || 0;
  const change = amountPaid - total;

  const charCount = comment.length;
  const charClass = charCount > 500 ? 'over' : (charCount > 450 ? 'warn' : '');

  const canFinalize = useMemo(() => {
    if (!stay) return false;
    if (paymentStatus === 'now') {
      if (payment.method === 'cash') return amountPaid >= total;
      return true;
    }
    return stay.paidUpfront;
  }, [stay, paymentStatus, payment, amountPaid, total]);

  const showToast = (msg, kind) => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2400); };

  const onSelectStay = (s) => {
    setStay(s);
    setItems(buildItems(s));
    setPaymentStatus(s.paidUpfront ? 'paid' : 'now');
    setPayment({ method: 'card', amount: '' });
    setRatings({ limpeza: 0, conforto: 0, atendimento: 0, wifi: 0 });
    setComment('');
  };

  const onFinalize = () => {
    if (!canFinalize) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess({ total, ratings: { ...ratings } });
    }, 1100);
  };

  const onCancel = () => {
    if (window.confirm('Cancelar este check-out e voltar?')) {
      window.location.href = 'reservas.html';
    }
  };

  const onNewCheckout = () => {
    setSuccess(null);
    const remaining = ACTIVE_STAYS.filter(s => s.id !== stay.id);
    if (remaining.length > 0) onSelectStay(remaining[0]);
    showToast('Pronto para o próximo hóspede', 'success');
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Check-out</h1>
          <div className="page-sub">Finalize a estadia, gere a conta e colete avaliação · <strong>{ACTIVE_STAYS.length} hóspedes</strong> hospedados</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'right' }}>
          <div>Recepção · Mariana Reis</div>
          <div className="mono" style={{ fontSize: 11 }}>{new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</div>
        </div>
      </div>

      <div className="layout">
        <div>
          {/* Section 1: Search */}
          <section className="section done">
            <div className="section-head">
              <div className="section-num"><I.Check size={14} stroke={3} /></div>
              <div style={{ flex: 1 }}>
                <h2 className="section-title">Buscar hóspede</h2>
                <div className="section-sub">Selecione o hóspede que está fazendo check-out</div>
              </div>
            </div>
            <GuestSearch onSelect={onSelectStay} />
          </section>

          {/* Section 2: Stay details */}
          <section className="section done">
            <div className="section-head">
              <div className="section-num">2</div>
              <div style={{ flex: 1 }}>
                <h2 className="section-title">Dados da hospedagem</h2>
                <div className="section-sub">Confira os dados antes de fechar a conta</div>
              </div>
            </div>
            <StayCard stay={stay} />
          </section>

          {/* Section 3: Items */}
          <section className="section">
            <div className="section-head">
              <div className="section-num">3</div>
              <div style={{ flex: 1 }}>
                <h2 className="section-title">Serviços & itens consumidos</h2>
                <div className="section-sub">Marque os itens que devem entrar na conta</div>
              </div>
            </div>
            <ItemsList items={items} setItems={setItems} />
          </section>

          {/* Section 4: Rating */}
          <section className="section">
            <div className="section-head">
              <div className="section-num">4</div>
              <div style={{ flex: 1 }}>
                <h2 className="section-title">Avaliação da hospedagem</h2>
                <div className="section-sub">Opcional · ajuda a melhorar o serviço</div>
              </div>
            </div>

            <div className="rating-list">
              <StarsInput label="Limpeza"     icon="Sparkles" value={ratings.limpeza}     onChange={v => setRatings({ ...ratings, limpeza: v })} />
              <StarsInput label="Conforto"    icon="Hotel"    value={ratings.conforto}    onChange={v => setRatings({ ...ratings, conforto: v })} />
              <StarsInput label="Atendimento" icon="Users"    value={ratings.atendimento} onChange={v => setRatings({ ...ratings, atendimento: v })} />
              <StarsInput label="Wi-Fi"       icon="Bell"     value={ratings.wifi}        onChange={v => setRatings({ ...ratings, wifi: v })} />
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="label" htmlFor="comment">
                Comentário <span className="opt">opcional</span>
              </label>
              <textarea id="comment"
                        className="textarea"
                        placeholder="Conte-nos sua experiência…"
                        maxLength={500}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)} />
              <div className={`char-counter ${charClass}`}>{charCount}/500</div>
            </div>
          </section>

          {/* Bottom action row for mobile */}
          <div className="action-row">
            <button className="btn" onClick={() => setPreview(true)}>
              <I.Search size={14} /> Pré-visualizar recibo
            </button>
          </div>
        </div>

        {/* Right column: bill */}
        <aside className="bill-col">
          <Bill stay={stay}
                items={items}
                subtotal={subtotal}
                tax={tax}
                total={total}
                paymentStatus={paymentStatus}
                setPaymentStatus={setPaymentStatus}
                payment={payment}
                setPayment={setPayment}
                change={change}
                canFinalize={canFinalize}
                submitting={submitting}
                onPreview={() => setPreview(true)}
                onCancel={onCancel}
                onFinalize={onFinalize} />
        </aside>
      </div>

      {preview && (
        <PreviewModal stay={stay} items={items} subtotal={subtotal} tax={tax} total={total} onClose={() => setPreview(false)} />
      )}

      {success && (
        <SuccessModal stay={stay} total={success.total} ratings={success.ratings}
                      onPrint={() => showToast('Recibo enviado para impressão', 'success')}
                      onEmail={() => showToast(`Recibo enviado para ${stay.email}`, 'success')}
                      onNew={onNewCheckout}
                      onClose={() => setSuccess(null)} />
      )}

      {toast && (
        <div className={`toast ${toast.kind || ''}`}>
          {toast.kind === 'error' ? <I.Warning size={16} /> : <I.Check size={16} stroke={2.5} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
