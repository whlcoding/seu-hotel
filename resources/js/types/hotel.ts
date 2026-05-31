// ─── Core domain types ───────────────────────────────────────────────────────

export type AvatarColor = 'blue' | 'green' | 'orange' | 'purple' | 'red' | '';

export type ReservationStatus = 'confirmada' | 'pendente' | 'cancelada' | 'realizada' | 'no-show';

export type RoomStatus = 'occupied' | 'available' | 'cleaning' | 'maintenance' | 'reserved';

export type RoomType = 'Single' | 'Duplo' | 'Suíte';

export type TeamRole = 'recepcao' | 'housekeeping' | 'gerente' | 'manutencao' | 'cozinha';

export type Shift = 'mat' | 'vesp' | 'noite' | 'off' | 'ferias';

export type TeamMemberStatus = 'ativo' | 'ferias' | 'inativo';

export type CleaningTaskStatus = 'pendente' | 'andamento' | 'concluida' | 'verificada';

export type CleaningTaskType = 'completa' | 'rapida' | 'manutencao' | 'especial';

export type Priority = 'alta' | 'normal' | 'baixa';

export type PaymentMethod = 'card' | 'debit' | 'cash' | 'pix' | 'check';

export type BookingChannel =
    | 'Recepção'
    | 'Website'
    | 'App'
    | 'Booking.com'
    | 'Expedia'
    | 'Walk-in'
    | string;

// ─── Guest ───────────────────────────────────────────────────────────────────

export interface Guest {
    id: string | number;
    name: string;
    email: string;
    phone?: string;
    cpf?: string;
    address?: string;
    dob?: string;
    avatarColor?: AvatarColor;
    stays?: number;
    lastStay?: string;
    tag?: 'VIP' | 'Novo' | '';
}

// ─── Room ────────────────────────────────────────────────────────────────────

export interface Room {
    number: string;
    type: RoomType;
    floor: number;
    pricePerNight: number;
    status: RoomStatus;
}

export interface RoomTypeInfo {
    id: string;
    name: RoomType;
    capacity: string;
    capacityNum: number;
    bed: string;
    pricePerNight: number;
    available: number;
    total: number;
    roomNumbers: string[];
    occupiedNumbers: string[];
}

// ─── Reservation ─────────────────────────────────────────────────────────────

export interface Reservation {
    id: number;
    ref: string;
    guest: string;
    guestId?: number;
    email: string;
    avatarColor?: AvatarColor;
    room: string;
    roomType: RoomType;
    pricePerNight: number;
    checkin: Date | string;
    checkout: Date | string;
    nights: number;
    guests: number;
    status: ReservationStatus;
    channel: BookingChannel;
    paid: boolean;
    total: number;
    tax: number;
    note?: string;
    created: Date | string;
}

// ─── Billing line item ───────────────────────────────────────────────────────

export interface BillingItem {
    id: string;
    name: string;
    unit: number;
    qty: number;
    unitLabel: string;
    icon: string;
    locked?: boolean;
    checked: boolean;
    custom?: boolean;
}

// ─── Active Stay (for checkout) ───────────────────────────────────────────────

export interface ActiveStay {
    id: number;
    ref: string;
    guest: string;
    email: string;
    phone: string;
    cpf: string;
    room: string;
    roomType: string;
    pricePerNight: number;
    nights: number;
    checkin: { date: string; time: string };
    checkout: { date: string; time: string };
    avatarColor: AvatarColor;
    tag: 'VIP' | 'Novo' | '';
    paidUpfront: boolean;
    items?: BillingItem[];
}

// ─── Team ────────────────────────────────────────────────────────────────────

export interface TeamMember {
    id: number;
    name: string;
    email: string;
    phone: string;
    cpf: string;
    role: TeamRole;
    status: TeamMemberStatus;
    admission: string;
    shifts: Shift[];
    salary?: number;
    avatarColor: AvatarColor;
    schedule: Shift[]; // 7 days
}

// ─── Cleaning ────────────────────────────────────────────────────────────────

export interface ChecklistItem {
    id: string;
    label: string;
    done: boolean;
}

export interface CleaningTask {
    id: string;
    room: string;
    floor: number;
    status: CleaningTaskStatus;
    type: CleaningTaskType;
    assignee: string | null;
    priority: Priority;
    estimated: number; // minutes
    real: number; // minutes
    startedAt: string | null;
    createdAt: string;
    deadline: string;
    note: string;
    checklist: ChecklistItem[];
    verifier?: string;
    verifiedAt?: string;
}

// ─── KPI ─────────────────────────────────────────────────────────────────────

export interface KpiData {
    tone: 'blue' | 'green' | 'orange' | 'purple';
    icon: string;
    value: string;
    label: string;
    sub: string;
    delta?: string;
    deltaDir?: 'up' | 'down';
    spark?: number[];
}

// ─── Chart data ───────────────────────────────────────────────────────────────

export interface OccupancyPoint {
    label: string;
    full: string;
    value: number;
    rooms: number;
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export type AlertSeverity = 'warn' | 'danger' | 'info';

export interface Alert {
    id: string;
    severity: AlertSeverity;
    tag: string;
    title: string;
    text: string;
    actions: Array<{ id: string; label: string; primary?: boolean }>;
}

// ─── Ratings ─────────────────────────────────────────────────────────────────

export interface Ratings {
    limpeza: number;
    conforto: number;
    atendimento: number;
    wifi: number;
}

// ─── Page props (Inertia) ────────────────────────────────────────────────────

export interface DashboardProps {
    reservations?: Reservation[];
    occupancyRate?: number;
    checkinsToday?: number;
    checkoutsToday?: number;
    revenueToday?: number;
}

export interface ReservasProps {
    reservations?: Reservation[];
}

export interface CheckoutProps {
    activeStays: ActiveStay[];
}

export interface EquipeProps {
    team?: TeamMember[];
}

export interface LimpezaProps {
    tasks?: CleaningTask[];
    staff?: Array<{ id: string; name: string; short: string; color: AvatarColor }>;
}
