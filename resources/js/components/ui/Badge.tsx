import type { ReservationStatus } from '@/types/hotel';

// ─── Status Badge ────────────────────────────────────────────────────────────

interface StatusBadgeProps {
    status: ReservationStatus;
    className?: string;
}

const STATUS_LABEL: Record<ReservationStatus, string> = {
    confirmada: 'Confirmada',
    pendente:   'Pendente',
    cancelada:  'Cancelada',
    realizada:  'Realizada',
    'no-show':  'No-show',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
    return (
        <span className={`status ${status} ${className}`}>
            <span className="dot" />
            {STATUS_LABEL[status]}
        </span>
    );
}

// ─── Pill ────────────────────────────────────────────────────────────────────

type PillVariant = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';

interface PillProps {
    children: React.ReactNode;
    variant?: PillVariant;
    className?: string;
}

export function Pill({ children, variant = 'gray', className = '' }: PillProps) {
    return (
        <span className={`pill ${variant} ${className}`}>
            {children}
        </span>
    );
}

// ─── Priority Flag ───────────────────────────────────────────────────────────

type Priority = 'alta' | 'normal' | 'baixa';

interface PriorityFlagProps {
    priority: Priority;
}

export function PriorityFlag({ priority }: PriorityFlagProps) {
    return (
        <span className={`priority-flag ${priority}`}>
            {priority === 'alta' && '⚠ '}
            {priority}
        </span>
    );
}
