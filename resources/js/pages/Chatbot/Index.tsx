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
    { id: 'p1', label: 'Resumo de check-ins de hoje' },
    { id: 'p2', label: 'Hospedes VIP chegando' },
    { id: 'p3', label: 'Pendencias de limpeza' },
    { id: 'p4', label: 'Relatorio do turno da manha' },
];

const CONTEXT_ROWS = [
    { id: 'c1', label: 'Ocupacao', value: '78% (39/50)' },
    { id: 'c2', label: 'Check-ins hoje', value: '5 confirmados' },
    { id: 'c3', label: 'Check-outs', value: '3 previstos' },
    { id: 'c4', label: 'Pendencias', value: '2 quartos' },
    { id: 'c5', label: 'Atualizacao', value: 'ha 4 min' },
];

const QUICK_ACTIONS: Array<{ id: string; label: string; icon: keyof typeof I }> = [
    { id: 'a1', label: 'Priorizar quartos em limpeza', icon: 'Broom' },
    { id: 'a2', label: 'Listar VIPs chegando hoje', icon: 'Star' },
    { id: 'a3', label: 'Ver pendencias de manutencao', icon: 'Tools' },
    { id: 'a4', label: 'Enviar resumo ao gerente', icon: 'ArrowUpTray' },
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
                                <h3 className="panel-title">Contexto rapido</h3>
                                <div className="panel-sub">
                                    Indicadores do dia
                                </div>
                            </div>
                        </div>
                        <div className="chat-context">
                            {CONTEXT_ROWS.map((row) => (
                                <div key={row.id} className="chat-context-row">
                                    <span className="k">{row.label}</span>
                                    <span className="v">{row.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="chat-source-row">
                            <span className="pill blue">Reservas</span>
                            <span className="pill green">Limpeza</span>
                            <span className="pill orange">Equipe</span>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-head">
                            <div>
                                <h3 className="panel-title">
                                    Atalhos do assistente
                                </h3>
                                <div className="panel-sub">Acoes rapidas</div>
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
                        <div className="chat-quick-note">
                            Escolha uma acao para preencher a mensagem
                            automaticamente.
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
