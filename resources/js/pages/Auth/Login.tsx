import { Head, useForm } from '@inertiajs/react';
import { useState, useId } from 'react';
import LoginController from '@/actions/App/Http/Controllers/Auth/LoginController';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Icons (inline — page has no app shell) ───────────────────────────────────

function IconHotel() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M5 21V8l7-4 7 4v13M9 10h2M13 10h2M9 14h2M13 14h2M10 21v-4h4v4"/>
        </svg>
    );
}
function IconEmail() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>
        </svg>
    );
}
function IconLock() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>
        </svg>
    );
}
function IconEyeOn() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>
        </svg>
    );
}
function IconEyeOff() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3l18 18"/><path d="M10.6 6.1A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.1 4M6.6 6.6A17 17 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.3-.8"/><path d="M9.5 9.5a3 3 0 0 0 4.2 4.2"/>
        </svg>
    );
}
function IconCheck({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7"/>
        </svg>
    );
}
function IconAlert() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.01"/>
        </svg>
    );
}
function IconGlobe() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
        </svg>
    );
}

// ─── Brand Panel ──────────────────────────────────────────────────────────────

function BrandPanel() {
    return (
        <aside className="login-brand" aria-hidden="true">
            <div className="login-brand-top">
                <div className="login-brand-mark">
                    <IconHotel />
                </div>
                <div className="login-brand-name">
                    Hotel Management
                    <span>Sistema de Gestão</span>
                </div>
            </div>

            <div className="login-brand-hero">
                <h1>Gerencie sua pousada com a <em>tranquilidade</em> de quem está em casa.</h1>
                <p>Reservas, check-ins, equipe e receita — tudo num só painel. Para hotéis e pousadas de 20 a 50 quartos.</p>

                <div className="login-features">
                    <div className="login-feature">
                        <div className="login-feature-ico">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
                        </div>
                        <div>
                            <div className="login-feature-title">Reservas centralizadas</div>
                            <div className="login-feature-sub">Booking, Expedia, direto — num só calendário.</div>
                        </div>
                    </div>
                    <div className="login-feature">
                        <div className="login-feature-ico">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 15l3-4 3 2 4-7"/></svg>
                        </div>
                        <div>
                            <div className="login-feature-title">Receita em tempo real</div>
                            <div className="login-feature-sub">RevPAR, ADR e ocupação ao vivo.</div>
                        </div>
                    </div>
                    <div className="login-feature">
                        <div className="login-feature-ico">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M21 19c0-2.6-2-4.5-4.5-4.5"/></svg>
                        </div>
                        <div>
                            <div className="login-feature-title">Equipe sincronizada</div>
                            <div className="login-feature-sub">Recepção, camareiras e manutenção alinhadas.</div>
                        </div>
                    </div>
                    <div className="login-feature">
                        <div className="login-feature-ico">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.7 5.5 6 .9-4.3 4.2 1 6L12 16.8 6.6 19.6l1-6L3.3 9.4l6-.9L12 3z"/></svg>
                        </div>
                        <div>
                            <div className="login-feature-title">Hóspedes felizes</div>
                            <div className="login-feature-sub">Avaliações e feedback no mesmo lugar.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="login-hotel-card">
                <div className="login-hotel-card-photo">
                    <span className="login-hotel-card-tag">QUARTO 405</span>
                </div>
                <h4>Suíte vista mar</h4>
                <div className="login-hotel-card-row">
                    <span className="login-hotel-card-rating">★ 4,9 · 142 avaliações</span>
                </div>
                <div className="login-hotel-card-row">
                    <span>2 ad · 1 noite</span>
                    <span className="login-hotel-card-price mono">R$ 468</span>
                </div>
            </div>

            <div className="login-brand-foot">
                <div style={{ display: 'flex', gap: 28 }}>
                    <div className="login-stat">
                        <div className="login-stat-val mono">340+</div>
                        <div className="login-stat-lbl">pousadas no Brasil</div>
                    </div>
                    <div className="login-stat">
                        <div className="login-stat-val mono">98,2%</div>
                        <div className="login-stat-lbl">uptime</div>
                    </div>
                </div>
                <div className="login-brand-meta">v3.4 · São Paulo</div>
            </div>
        </aside>
    );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

interface LoginProps {
    status?: string;
}

export default function Login({ status }: LoginProps) {
    const emailId = useId();
    const passwordId = useId();

    const [showPwd, setShowPwd] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [pwdTouched, setPwdTouched] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const emailValid = EMAIL_RE.test(data.email);
    const pwdValid = data.password.length >= 6;

    const emailError = emailTouched && !emailValid
        ? (data.email === '' ? 'Informe seu email' : 'Email inválido — verifique o formato')
        : (errors.email ?? null);
    const pwdError = pwdTouched && !pwdValid
        ? (data.password === '' ? 'Informe sua senha' : 'Senha precisa ter ao menos 6 caracteres')
        : (errors.password ?? null);

    function fillTest() {
        setData({ email: 'admin@hotel.com', password: 'senha123', remember: true });
        setEmailTouched(false);
        setPwdTouched(false);
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setEmailTouched(true);
        setPwdTouched(true);

        if (!emailValid || !pwdValid) {
return;
}

        post(LoginController.store.url(), { onError: () => reset('password') });
    }

    return (
        <>
            <Head title="Entrar" />
            <div className="login-page">
                <BrandPanel />

                <main className="login-form-panel">
                    <div className="login-form-top">
                        <div>Bem-vindo de volta</div>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <button className="login-locale" type="button" aria-label="Idioma">
                                <IconGlobe /> PT-BR
                            </button>
                        </div>
                    </div>

                    <div className="login-form-shell">
                        <form className="login-form-card" onSubmit={handleSubmit} noValidate>
                            {/* Mobile brand */}
                            <div className="login-mobile-brand">
                                <div className="login-brand-mark" style={{ background: 'var(--blue)', border: 'none', width: 36, height: 36, borderRadius: 9 }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 21h18M5 21V8l7-4 7 4v13M9 10h2M13 10h2M9 14h2M13 14h2M10 21v-4h4v4"/>
                                    </svg>
                                </div>
                                <div className="login-brand-name" style={{ color: 'var(--ink)' }}>
                                    Hotel Management
                                    <span style={{ color: 'var(--ink-3)' }}>Sistema de Gestão</span>
                                </div>
                            </div>

                            {status && (
                                <div className="login-status-msg">{status}</div>
                            )}

                            <h1 className="login-form-title">Entrar na sua conta</h1>
                            <p className="login-form-sub">Bem-vindo de volta. Faça login para gerenciar sua pousada.</p>

                            {/* Email */}
                            <div className={`login-field${emailError ? ' error' : emailValid && data.email ? ' valid' : ''}`}>
                                <label className="login-field-label" htmlFor={emailId}>Email</label>
                                <div className="login-input-wrap">
                                    <span className="login-ico-left"><IconEmail /></span>
                                    <input
                                        id={emailId}
                                        type="email"
                                        className="login-input"
                                        placeholder="seu@email.com"
                                        autoComplete="email"
                                        inputMode="email"
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        onBlur={() => setEmailTouched(true)}
                                    />
                                    {emailValid && data.email && (
                                        <span className="login-ico-validity"><IconCheck /></span>
                                    )}
                                </div>
                                {emailError && (
                                    <div className="login-field-msg" role="alert">
                                        <IconAlert /><span>{emailError}</span>
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div className={`login-field${pwdError ? ' error' : pwdValid ? ' valid' : ''}`}>
                                <label className="login-field-label" htmlFor={passwordId}>
                                    Senha
                                    <a href="#" className="login-right-link">Esqueceu a senha?</a>
                                </label>
                                <div className="login-input-wrap">
                                    <span className="login-ico-left"><IconLock /></span>
                                    <input
                                        id={passwordId}
                                        type={showPwd ? 'text' : 'password'}
                                        className="login-input login-input-has-right"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={e => setData('password', e.target.value)}
                                        onBlur={() => setPwdTouched(true)}
                                    />
                                    <button
                                        type="button"
                                        className="login-ico-right-btn"
                                        onClick={() => setShowPwd(v => !v)}
                                        aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
                                        aria-pressed={showPwd}
                                    >
                                        {showPwd ? <IconEyeOff /> : <IconEyeOn />}
                                    </button>
                                    {pwdValid && (
                                        <span className="login-ico-validity login-ico-validity-pwd"><IconCheck /></span>
                                    )}
                                </div>
                                {pwdError && (
                                    <div className="login-field-msg" role="alert">
                                        <IconAlert /><span>{pwdError}</span>
                                    </div>
                                )}
                            </div>

                            <div className="login-checkbox-row">
                                <label className="login-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={e => setData('remember', e.target.checked)}
                                    />
                                    <span className="login-checkbox-box">
                                        {data.remember && <IconCheck size={11} />}
                                    </span>
                                    Manter-me conectado
                                </label>
                                <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Sessão de 7 dias</span>
                            </div>

                            <button
                                type="submit"
                                className="login-btn-primary"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <span className="login-spin" />
                                        Entrando…
                                    </>
                                ) : 'Entrar'}
                            </button>

                            <div className="login-divider">ou</div>

                            <div className="login-sso-row">
                                <button type="button" className="login-sso-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4c-.2 1.3-.9 2.4-2 3.1v2.6h3.2c1.9-1.7 3-4.3 3-7.6z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.6c-.9.6-2 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.8v2.7C4.5 19.7 8 22 12 22z"/><path fill="#FBBC05" d="M6.2 13.7c-.2-.6-.3-1.2-.3-1.7s.1-1.1.3-1.7V7.6H2.8C2.3 8.9 2 10.4 2 12s.3 3.1.8 4.4l3.4-2.7z"/><path fill="#EA4335" d="M12 5.8c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.5 4.3 2.8 7.6l3.4 2.7C7 7.6 9.3 5.8 12 5.8z"/></svg>
                                    Google
                                </button>
                                <button type="button" className="login-sso-btn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#000"><path d="M16.4 12.7c0-2.7 2.2-4 2.3-4-1.3-1.8-3.2-2.1-3.9-2.2-1.7-.2-3.2 1-4.1 1s-2.1-1-3.5-1c-1.8 0-3.5 1-4.4 2.7-1.9 3.2-.5 8 1.3 10.6.9 1.3 2 2.7 3.4 2.6 1.4-.1 1.9-.9 3.6-.9s2.2.9 3.6.9c1.5 0 2.5-1.3 3.4-2.6 1.1-1.5 1.5-3 1.5-3-.1 0-2.9-1.1-2.9-4.3zM13.7 4.6c.8-.9 1.3-2.2 1.1-3.4-1.1.1-2.4.7-3.2 1.6-.7.8-1.4 2.1-1.2 3.3 1.2.1 2.5-.6 3.3-1.5z"/></svg>
                                    Apple
                                </button>
                            </div>

                            <div className="login-register-line">
                                Não tem conta? <a href="#">Solicitar acesso</a>
                            </div>

                            {/* Test credentials */}
                            <div className="login-creds" role="region" aria-label="Credenciais de teste">
                                <div className="login-creds-head">
                                    <span>Credenciais de teste</span>
                                    <button type="button" className="login-creds-fill" onClick={fillTest}>
                                        Preencher
                                    </button>
                                </div>
                                <div className="login-creds-list">
                                    <div className="login-creds-row"><span>Email</span><span>admin@hotel.com</span></div>
                                    <div className="login-creds-row"><span>Senha</span><span>senha123</span></div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="login-form-foot">
                        © 2026 Hotel Management. <a href="#">Termos de uso</a> · <a href="#">Privacidade</a>
                    </div>
                </main>
            </div>
        </>
    );
}
