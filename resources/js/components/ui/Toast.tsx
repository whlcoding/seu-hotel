import { useState, useCallback } from 'react';
import { Check, Warning } from '@/components/ui/Icons';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastKind = 'success' | 'warn' | 'error' | '';

interface ToastData {
    id: number;
    msg: string;
    kind: ToastKind;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

let _id = 0;

export function useToast() {
    const [toast, setToast] = useState<ToastData | null>(null);

    const show = useCallback((msg: string, kind: ToastKind = '') => {
        const id = ++_id;
        setToast({ id, msg, kind });
        setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 2600);
    }, []);

    return { toast, show };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ToastProps {
    toast: ToastData | null;
}

export default function Toast({ toast }: ToastProps) {
    if (!toast) return null;

    return (
        <div className={`toast ${toast.kind}`}>
            {toast.kind === 'error' || toast.kind === 'warn' ? (
                <Warning size={16} />
            ) : (
                <Check size={16} stroke={2.5} />
            )}
            {toast.msg}
        </div>
    );
}
