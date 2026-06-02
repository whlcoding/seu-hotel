import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Avatar from '@/components/ui/Avatar';
import { I } from '@/components/ui/Icons';
import type { CheckinProps, PaymentMethod, Reservation } from '@/types/hotel';

function fmtBR(n: number): string {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(value: Date | string): string {
    const date = typeof value === 'string' ? new Date(value) : value;

    return date.toLocaleDateString('pt-BR');
}

function fmtDateTime(value?: Date | string): string {
    if (!value) {
        return '';
    }

    const date = typeof value === 'string' ? new Date(value) : value;

    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function ArrivalCard({ reservation, onDone }: { reservation: Reservation; onDone: (message: string) => void }) {
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'now'>(reservation.paid ? 'paid' : 'now');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(reservation.paid ? 'card' : 'pix');
    const [submitting, setSubmitting] = useState(false);

    const badgeText = useMemo(() => (reservation.paid ? 'Pagamento antecipado' : 'Pagamento em aberto'), [reservation.paid]);

    const confirmCheckin = () => {
        if (submitting) {
            return;
        }

        setSubmitting(true);
        router.post(
            '/checkin/confirm',
            {
                reservation_id: reservation.id,
                payment_status: paymentStatus,
                payment_method: paymentStatus === 'paid' ? paymentMethod : null,
            },
            {
                preserveScroll: true,
                onSuccess: () => onDone(`Check-in de ${reservation.guest} registrado com sucesso.`),
                onError: () => onDone('Não foi possível registrar o check-in.'),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    return (
        <div className="panel" style={{ marginBottom: 16 }}>
            <div className="panel-head">
                <div>
                    <h3 className="panel-title">{reservation.guest}</h3>
                    <div className="panel-sub">
                        Reserva <strong className="mono">#{reservation.ref}</strong> · Quarto {reservation.room} · {reservation.roomType}
                    </div>
                </div>
                <span className={`pill ${reservation.paid ? 'green' : 'orange'}`}>{badgeText}</span>
            </div>

            <div className="grid-2" style={{ gap: 12 }}>
                <div className="stay-grid" style={{ marginBottom: 0 }}>
                    <Avatar name={reservation.guest} color={reservation.avatarColor || 'blue'} size="sm" />
                    <div>
                        <div className="stay-name">{reservation.guest}</div>
                        <div className="stay-tags">
                            <span className="pill blue">{reservation.channel}</span>
                            <span className="pill green">{reservation.guests} hóspede{reservation.guests === 1 ? '' : 's'}</span>
                            {reservation.note && <span className="pill orange">Observação</span>}
                        </div>
                    </div>
                    <div className="stay-kv" style={{ gridColumn: '1 / -1' }}>
                        <div className="kv-item">
                            <span className="kv-k">Check-in</span>
                            <span className="kv-v">{fmtDate(reservation.checkin)}</span>
                        </div>
                        <div className="kv-item">
                            <span className="kv-k">Check-out</span>
                            <span className="kv-v">{fmtDate(reservation.checkout)}</span>
                        </div>
                        <div className="kv-item">
                            <span className="kv-k">Diária</span>
                            <span className="kv-v">R$ {fmtBR(reservation.pricePerNight)}</span>
                        </div>
                        <div className="kv-item">
                            <span className="kv-k">Total</span>
                            <span className="kv-v">R$ {fmtBR(reservation.total)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="section-sub" style={{ marginBottom: 8 }}>
                        Você pode registrar o pagamento agora ou deixar para o check-out.
                    </div>

                    <div className="radio-row" style={{ marginBottom: 12 }}>
                        <button
                            type="button"
                            className={`radio-btn ${paymentStatus === 'paid' ? 'active' : ''}`}
                            onClick={() => setPaymentStatus('paid')}
                        >
                            <span className="dot" /> Receber agora
                        </button>
                        <button
                            type="button"
                            className={`radio-btn ${paymentStatus === 'now' ? 'active' : ''}`}
                            onClick={() => setPaymentStatus('now')}
                        >
                            <span className="dot" /> Cobrar no check-out
                        </button>
                    </div>

                    {paymentStatus === 'paid' && (
                        <div style={{ marginBottom: 12 }}>
                            <label className="label" htmlFor={`payment-method-${reservation.id}`}>
                                Método de pagamento
                            </label>
                            <select
                                id={`payment-method-${reservation.id}`}
                                className="select"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            >
                                <option value="card">Cartão de crédito</option>
                                <option value="debit">Cartão de débito</option>
                                <option value="cash">Dinheiro</option>
                                <option value="pix">Pix</option>
                                <option value="check">Cheque</option>
                            </select>
                        </div>
                    )}

                    <div className="panel" style={{ padding: 12, background: 'var(--bg-2)' }}>
                        <div className="status-row">
                            <div className="status-item">
                                <span className="status-dot" style={{ background: '#378ADD' }} />
                                {reservation.paid ? 'Reserva já paga' : 'Pagamento pendente'}
                            </div>
                            <div className="status-item">
                                <span className="status-dot" style={{ background: '#639922' }} />
                                {reservation.nights} noite{reservation.nights === 1 ? '' : 's'}
                            </div>
                            <div className="status-item">
                                <span className="status-dot" style={{ background: '#BA7517' }} />
                                {fmtDateTime(reservation.created)}
                            </div>
                        </div>

                        {reservation.note && (
                            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--ink-2)' }}>
                                <strong>Observação:</strong> {reservation.note}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn primary" onClick={confirmCheckin} disabled={submitting}>
                            <I.Check size={15} stroke={2.5} />
                            {submitting ? 'Registrando…' : 'Confirmar check-in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckinIndex({ arrivals = [], generatedAt }: CheckinProps) {
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 2400);
    };

    const updatedAt = generatedAt ? new Date(generatedAt) : new Date();

    return (
        <AppLayout title="Check-in" breadcrumb={[{ label: 'Check-in' }]}>
            <div className="page-head">
                <div>
                    <h1 className="page-title">Check-in</h1>
                    <div className="page-sub">
                        <span>Registre a entrada do hóspede, marque o quarto como ocupado e defina se o pagamento será feito agora.</span>
                        <span className="live-dot">ao vivo</span>
                    </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'right' }}>
                    <div>{arrivals.length} check-in{arrivals.length === 1 ? '' : 's'} pendente{arrivals.length === 1 ? '' : 's'}</div>
                    <div className="mono" style={{ fontSize: 11 }}>
                        Atualizado às {updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            {arrivals.length > 0 ? (
                <div>
                            {arrivals.map((reservation: Reservation) => (
                        <ArrivalCard key={reservation.id} reservation={reservation} onDone={showToast} />
                    ))}
                </div>
            ) : (
                <div className="panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
                    <I.Hotel size={40} />
                    <div style={{ marginTop: 12, fontSize: 15, fontWeight: 600, color: 'var(--ink-2)' }}>
                        Nenhum check-in pendente
                    </div>
                    <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-3)' }}>
                        Todas as chegadas confirmadas de hoje já foram registradas.
                    </div>
                </div>
            )}

            {toast && (
                <div className="toast">
                    <I.Check size={16} stroke={2.5} />
                    {toast}
                </div>
            )}
        </AppLayout>
    );
}


