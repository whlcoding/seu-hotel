import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import AppLayout from '@/components/layout/AppLayout';
import Avatar from '@/components/ui/Avatar';
import { I } from '@/components/ui/Icons';

type Message = {
    id: string;
    role: 'bot' | 'user';
    name: string;
    text: string;
    time: string;
};

const BOT_NAME = 'Aurora';
const USER_NAME = 'Mariana Reis';

const INITIAL_MESSAGES: Message[] = [
    {
        id: 'm1',
        role: 'bot',
        name: BOT_NAME,
        text: 'Ola, Mariana! Posso ajudar com reservas, limpeza ou relatorios.\nQuer um resumo do dia?',
        time: '09:10',
    },
    {
        id: 'm2',
        role: 'user',
        name: USER_NAME,
        text: 'Preciso dos check-ins de hoje e das pendencias de limpeza.',
        time: '09:12',
    },
    {
        id: 'm3',
        role: 'bot',
        name: BOT_NAME,
        text:
            'Check-ins confirmados: 5 (11:00-18:00).\n' +
            'Pendencias: 2 quartos em limpeza (301, 408).\n' +
            'Quer que eu priorize a equipe ou envie alertas?',
        time: '09:12',
    },
];

const QUICK_PROMPTS = [
    { id: 'p1', label: 'Quais sao os check-ins de hoje?' },
    { id: 'p2', label: 'Ha hospedes VIP chegando?' },
    { id: 'p3', label: 'Quais quartos estao em limpeza?' },
    { id: 'p4', label: 'Como esta a ocupacao agora?' },
];

const TOPICS: Array<{ id: string; icon: keyof typeof I; label: string; desc: string }> = [
    { id: 't1', icon: 'Calendar',  label: 'Reservas',  desc: 'Consulte check-ins, check-outs e status de reservas' },
    { id: 't2', icon: 'User',      label: 'Hospedes',  desc: 'Informacoes sobre hospedes, VIPs e historico' },
    { id: 't3', icon: 'Broom',     label: 'Limpeza',   desc: 'Status dos quartos e pendencias da equipe' },
    { id: 't4', icon: 'Users',     label: 'Equipe',    desc: 'Turnos, disponibilidade e escalas do dia' },
    { id: 't5', icon: 'Chart',     label: 'Relatorios',desc: 'Ocupacao, receita e indicadores gerais' },
];

const QUICK_ACTIONS: Array<{ id: string; label: string; icon: keyof typeof I }> = [
    { id: 'a1', label: 'Quais sao os check-ins de hoje?',           icon: 'Calendar' },
    { id: 'a2', label: 'Ha hospedes VIP chegando agora?',           icon: 'Star' },
    { id: 'a3', label: 'Quais quartos estao pendentes de limpeza?', icon: 'Broom' },
    { id: 'a4', label: 'Qual e a ocupacao atual do hotel?',         icon: 'Chart' },
    { id: 'a5', label: 'Quem esta de turno hoje?',                  icon: 'Users' },
    { id: 'a6', label: 'Ha reservas aguardando confirmacao?',       icon: 'Warning' },
];

export default function ChatbotIndex() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const endRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    const history = useMemo(
        () =>
            messages.slice(-8).map((message) => ({
                role: message.role === 'bot' ? 'model' : 'user',
                text: message.text,
            })),
        [messages],
    );

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, sending]);

    const formatTime = () =>
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const getCsrfToken = () =>
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

    const pushMessage = (message: Message) => {
        setMessages((prev) => [...prev, message]);
    };

    const sendMessage = async (textOverride?: string) => {
        const text = (textOverride ?? input).trim();
        if (!text || sending) return;

        const userMessage: Message = {
            id: `u-${Date.now()}`,
            role: 'user',
            name: USER_NAME,
            text,
            time: formatTime(),
        };

        pushMessage(userMessage);
        setInput('');
        setSending(true);

        try {
            const response = await fetch('/chatbot/ask', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({ message: text, history }),
            });

            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                throw new Error(payload?.message || 'Erro ao consultar o assistente.');
            }

            const reply = payload?.reply ?? 'Nao foi possivel gerar uma resposta agora.';
            pushMessage({
                id: `b-${Date.now()}`,
                role: 'bot',
                name: BOT_NAME,
                text: reply,
                time: formatTime(),
            });
        } catch (error) {
            const fallback =
                error instanceof Error ? error.message : 'Nao foi possivel gerar uma resposta agora.';
            pushMessage({
                id: `e-${Date.now()}`,
                role: 'bot',
                name: BOT_NAME,
                text: fallback,
                time: formatTime(),
            });
        } finally {
            setSending(false);
        }
    };

    const handlePromptClick = (label: string) => {
        setInput(label);
        inputRef.current?.focus();
    };

    const handleClear = () => {
        setInput('');
        inputRef.current?.focus();
    };

    const handleNewChat = () => {
        setMessages(INITIAL_MESSAGES);
        setInput('');
        inputRef.current?.focus();
    };

    return (
        <AppLayout title="Chatbot" breadcrumb={[{ label: 'Chatbot' }]}>
            <div className="page-head">
                <div>
                    <h1 className="page-title">Chatbot</h1>
                    <div className="page-sub">
                        <span>Assistente operacional</span>
                        <span>·</span>
                        <span>Base atualizada ha 4 min</span>
                        <span className="live-dot">online</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={handleNewChat}>
                        <I.Plus size={15} /> Nova conversa
                    </button>
                    <button className="btn primary">
                        <I.ArrowUpTray size={15} /> Compartilhar
                    </button>
                </div>
            </div>

            <div className="chat-layout">
                <div className="panel chat-panel">
                    <div className="chat-head">
                        <div>
                            <h3 className="panel-title">
                                {BOT_NAME} · Assistente do hotel
                            </h3>
                            <div className="panel-sub">
                                Respostas com base nas reservas e processos
                                internos.
                            </div>
                        </div>
                        <div className="chat-head-actions">
                            <span className="pill blue">Online</span>
                            <button className="btn ghost sm">
                                <I.Refresh size={14} /> Sincronizar
                            </button>
                        </div>
                    </div>

                    <div className="chat-body">
                        <div className="chat-day">Hoje</div>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`chat-msg ${message.role}`}
                            >
                                <Avatar
                                    name={message.name}
                                    color={
                                        message.role === 'bot'
                                            ? 'blue'
                                            : 'purple'
                                    }
                                    size="sm"
                                    className="chat-avatar"
                                />
                                <div className="chat-msg-body">
                                    {message.role === 'bot' && (
                                        <div className="chat-name">
                                            {message.name}
                                        </div>
                                    )}
                                    <div className="chat-bubble">
                                        <ReactMarkdown>
                                            {message.text}
                                        </ReactMarkdown>
                                    </div>
                                    <div className="chat-meta">
                                        {message.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {sending && (
                            <div className="chat-msg bot">
                                <Avatar
                                    name={BOT_NAME}
                                    color="blue"
                                    size="sm"
                                    className="chat-avatar"
                                />
                                <div className="chat-msg-body">
                                    <div className="chat-name">{BOT_NAME}</div>
                                    <div className="chat-bubble">
                                        Digitando...
                                    </div>
                                    <div className="chat-meta">agora</div>
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    <div className="chat-suggestions">
                        <span className="chat-suggest-label">
                            Sugestoes rapidas
                        </span>
                        <div className="chip-row">
                            {QUICK_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt.id}
                                    className="chip"
                                    type="button"
                                    onClick={() =>
                                        handlePromptClick(prompt.label)
                                    }
                                >
                                    {prompt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="chat-input">
                        <div className="chat-input-row">
                            <textarea
                                className="textarea chat-textarea"
                                rows={2}
                                placeholder="Digite sua pergunta para o assistente..."
                                value={input}
                                onChange={(event) =>
                                    setInput(event.target.value)
                                }
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Enter' &&
                                        !event.shiftKey
                                    ) {
                                        event.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                ref={inputRef}
                            />
                            <div className="chat-input-actions">
                                <button
                                    className="btn ghost sm"
                                    type="button"
                                    onClick={handleClear}
                                >
                                    Limpar
                                </button>
                                <button
                                    className="btn primary sm"
                                    type="button"
                                    onClick={() => sendMessage()}
                                    disabled={sending}
                                >
                                    <I.ArrowUpTray size={14} /> Enviar
                                </button>
                            </div>
                        </div>
                        <div className="chat-hint">
                            Enter envia · Shift+Enter quebra linha
                        </div>
                    </div>
                </div>

                <div className="chat-aside">
                    <div className="panel">
                        <div className="panel-head">
                            <div>
                                <h3 className="panel-title">Topicos disponíveis</h3>
                                <div className="panel-sub">
                                    O que voce pode perguntar
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {TOPICS.map((topic) => {
                                const Icon = I[topic.icon];
                                return (
                                    <div
                                        key={topic.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 10,
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: '1px solid var(--line)',
                                            background: 'var(--bg)',
                                        }}
                                    >
                                        <div style={{
                                            width: 30, height: 30,
                                            borderRadius: 8,
                                            background: 'var(--blue-soft)',
                                            color: 'var(--blue-ink)',
                                            display: 'grid', placeItems: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Icon size={15} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                                                {topic.label}
                                            </div>
                                            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2, lineHeight: 1.4 }}>
                                                {topic.desc}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-head">
                            <div>
                                <h3 className="panel-title">
                                    Perguntas rapidas
                                </h3>
                                <div className="panel-sub">Clique para preencher a mensagem</div>
                            </div>
                        </div>
                        <div className="chat-quick">
                            {QUICK_ACTIONS.map((action) => {
                                const Icon = I[action.icon];
                                return (
                                    <button
                                        key={action.id}
                                        className="btn sm"
                                        type="button"
                                        onClick={() =>
                                            handlePromptClick(action.label)
                                        }
                                    >
                                        <Icon size={14} />
                                        {action.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
