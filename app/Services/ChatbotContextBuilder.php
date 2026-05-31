<?php

namespace App\Services;

use App\Models\CleaningTask;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\StayItem;
use App\Models\User;
use Illuminate\Support\Carbon;

class ChatbotContextBuilder
{
    public function build(): array
    {
        $now = Carbon::now();
        $limits = config('chatbot.context');

        $reservations = $this->loadReservations($now, $limits['reservations']);
        $reservationIds = $reservations->pluck('id');

        $context = [
            'meta' => [
                'generated_at' => $now->toIso8601String(),
                'timezone' => config('app.timezone'),
                'limits' => $limits,
            ],
            'stats' => $this->buildStats($now),
            'rooms' => $this->loadRooms($limits['rooms']['limit']),
            'guests' => $this->loadGuests($limits['guests']['limit']),
            'reservations' => $reservations
                ->map(fn (Reservation $reservation) => $this->formatReservation($reservation))
                ->values()
                ->all(),
            'stay_items' => $this->loadStayItems($reservationIds, $limits['stay_items']['limit']),
            'cleaning_tasks' => $this->loadCleaningTasks($now, $limits['cleaning_tasks']),
            'team' => $this->loadTeam($limits['team']['limit']),
        ];

        return $context;
    }

    private function loadReservations(Carbon $now, array $config)
    {
        $from = $now->copy()->subDays($config['past_days']);
        $to = $now->copy()->addDays($config['future_days']);

        return Reservation::with(['guest', 'room'])
            ->where(function ($query) use ($from, $to) {
                $query->whereBetween('checkin', [$from, $to])
                    ->orWhereBetween('checkout', [$from, $to]);
            })
            ->orderByDesc('checkin')
            ->limit($config['limit'])
            ->get();
    }

    private function loadRooms(int $limit): array
    {
        return Room::orderBy('number')
            ->limit($limit)
            ->get()
            ->map(fn (Room $room) => [
                'id' => $room->id,
                'number' => $room->number,
                'type' => $room->type,
                'floor' => $room->floor,
                'status' => $room->status,
                'price_per_night' => (float) $room->price_per_night,
            ])
            ->values()
            ->all();
    }

    private function loadGuests(int $limit): array
    {
        return Guest::orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(fn (Guest $guest) => [
                'id' => $guest->id,
                'name' => $guest->name,
                'email' => $guest->email,
                'phone' => $guest->phone,
                'tag' => $guest->tag,
                'avatar_color' => $guest->avatar_color,
                'created_at' => $guest->created_at?->toDateString(),
            ])
            ->values()
            ->all();
    }

    private function loadCleaningTasks(Carbon $now, array $config): array
    {
        $cutoff = $now->copy()->subDays($config['days']);

        return CleaningTask::with(['room', 'assignee', 'verifier'])
            ->where(function ($query) use ($cutoff) {
                $query->whereIn('status', ['pendente', 'andamento'])
                    ->orWhere('created_at', '>=', $cutoff);
            })
            ->orderBy('deadline')
            ->limit($config['limit'])
            ->get()
            ->map(function (CleaningTask $task) {
                $checklist = $task->checklist ?? [];
                $done = collect($checklist)->where('done', true)->count();

                return [
                    'id' => $task->id,
                    'room' => $task->room?->number,
                    'status' => $task->status,
                    'type' => $task->type,
                    'priority' => $task->priority,
                    'assignee' => $task->assignee?->name,
                    'verifier' => $task->verifier?->name,
                    'estimated_minutes' => $task->estimated_minutes,
                    'real_minutes' => $task->real_minutes,
                    'started_at' => $task->started_at?->toIso8601String(),
                    'deadline' => $task->deadline?->toIso8601String(),
                    'note' => $task->note,
                    'checklist_total' => count($checklist),
                    'checklist_done' => $done,
                    'verified_at' => $task->verified_at?->toIso8601String(),
                ];
            })
            ->values()
            ->all();
    }

    private function loadStayItems($reservationIds, int $limit): array
    {
        if ($reservationIds->isEmpty()) {
            return [];
        }

        return StayItem::whereIn('reservation_id', $reservationIds)
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(fn (StayItem $item) => [
                'id' => $item->id,
                'reservation_id' => $item->reservation_id,
                'name' => $item->name,
                'unit_price' => (float) $item->unit_price,
                'qty' => $item->qty,
                'unit_label' => $item->unit_label,
                'icon' => $item->icon,
                'locked' => (bool) $item->locked,
                'custom' => (bool) $item->custom,
            ])
            ->values()
            ->all();
    }

    private function loadTeam(int $limit): array
    {
        return User::query()
            ->whereNotNull('role')
            ->orderBy('name')
            ->limit($limit)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'team_status' => $user->team_status,
                'admission_date' => $user->admission_date?->toDateString(),
                'avatar_color' => $user->avatar_color,
                'schedule' => $user->schedule,
                'salary' => $user->salary,
            ])
            ->values()
            ->all();
    }

    private function buildStats(Carbon $now): array
    {
        $roomStatus = Room::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        $reservationStatus = Reservation::selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status')
            ->all();

        $checkinsToday = Reservation::whereDate('checkin', $now->toDateString())->count();
        $checkoutsToday = Reservation::whereDate('checkout', $now->toDateString())->count();

        $activeStays = Reservation::with(['guest', 'room'])
            ->where('status', 'confirmada')
            ->whereDate('checkin', '<=', $now->toDateString())
            ->whereDate('checkout', '>=', $now->toDateString())
            ->orderBy('checkin')
            ->limit(30)
            ->get()
            ->map(fn (Reservation $reservation) => [
                'id' => $reservation->id,
                'ref' => $reservation->ref,
                'guest' => $reservation->guest?->name,
                'room' => $reservation->room?->number,
                'checkin' => $reservation->checkin?->toDateString(),
                'checkout' => $reservation->checkout?->toDateString(),
            ])
            ->values()
            ->all();

        $openCleaningTasks = CleaningTask::whereIn('status', ['pendente', 'andamento'])->count();

        return [
            'room_status' => $roomStatus,
            'reservation_status' => $reservationStatus,
            'checkins_today' => $checkinsToday,
            'checkouts_today' => $checkoutsToday,
            'open_cleaning_tasks' => $openCleaningTasks,
            'active_stays' => $activeStays,
        ];
    }

    private function formatReservation(Reservation $reservation): array
    {
        return [
            'id' => $reservation->id,
            'ref' => $reservation->ref,
            'guest' => $reservation->guest?->name,
            'guest_email' => $reservation->guest?->email,
            'guest_tag' => $reservation->guest?->tag,
            'room' => $reservation->room?->number,
            'room_type' => $reservation->room?->type,
            'checkin' => $reservation->checkin?->toDateString(),
            'checkout' => $reservation->checkout?->toDateString(),
            'nights' => $reservation->nights,
            'guests_count' => $reservation->guests_count,
            'status' => $reservation->status,
            'channel' => $reservation->channel,
            'paid' => (bool) $reservation->paid,
            'payment_method' => $reservation->payment_method,
            'total' => (float) $reservation->total,
            'tax' => (float) $reservation->tax,
            'checked_in_at' => $reservation->checked_in_at?->toIso8601String(),
            'created_at' => $reservation->created_at?->toDateString(),
        ];
    }
}
