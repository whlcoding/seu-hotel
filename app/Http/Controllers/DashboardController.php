<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    private const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    private const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

    public function index(): Response
    {
        $today = Carbon::today()->startOfDay();
        $historyStart = $today->copy()->subDays(6);

        $totalRooms = Room::count();
        $occupiedRooms = Room::where('status', 'occupied')->count();
        $occupancyRate = $this->percentage($occupiedRooms, $totalRooms);

        $reservations = Reservation::with('room')
            ->where('status', '!=', 'cancelada')
            ->whereDate('checkin', '<=', $today)
            ->whereDate('checkout', '>=', $historyStart)
            ->get();

        $series = $this->buildDailySeries($reservations, $historyStart, 7, $totalRooms);
        $todayMetrics = $series->last() ?? [
            'occupancy' => 0,
            'checkins' => 0,
            'checkouts' => 0,
            'revenue' => 0.0,
        ];
        $previousMetrics = $series->count() > 1 ? $series->slice(-2, 1)->first() : null;
        $previousOccupancyAverage = $series->count() > 1
            ? (float) round(($series->take($series->count() - 1)->avg('occupancy') ?? 0), 1)
            : 0.0;

        $checkinsToday = (int) $todayMetrics['checkins'];
        $checkoutsToday = (int) $todayMetrics['checkouts'];
        $revenueToday = (float) $todayMetrics['revenue'];

        $checkinsPlannedToday = $reservations->filter(fn (Reservation $reservation) => $reservation->checkin->isSameDay($today))->count();
        $checkinsCompletedToday = $reservations->filter(fn (Reservation $reservation) => $reservation->checkin->isSameDay($today) && (bool) $reservation->checked_in_at)->count();
        $checkoutsPlannedToday = $reservations->filter(fn (Reservation $reservation) => $reservation->checkout->isSameDay($today))->count();
        $checkoutsCompletedToday = $reservations->filter(fn (Reservation $reservation) => $reservation->checkout->isSameDay($today) && $reservation->status === 'realizada')->count();
        $revenueCollectedToday = (float) $reservations
            ->filter(fn (Reservation $reservation) => $reservation->checkin->isSameDay($today) && (bool) $reservation->paid)
            ->sum('total');

        $checkinsDelta = $checkinsToday - (int) ($previousMetrics['checkins'] ?? 0);
        $checkoutsDelta = $checkoutsToday - (int) ($previousMetrics['checkouts'] ?? 0);
        $revenueDelta = $revenueToday - (float) ($previousMetrics['revenue'] ?? 0);
        $occupancyDelta = round($occupancyRate - $previousOccupancyAverage, 1);

        $kpis = [
            [
                'tone' => 'blue',
                'icon' => 'Hotel',
                'value' => $this->formatPercent($occupancyRate),
                'label' => 'Taxa de Ocupação',
                'sub' => sprintf('%d de %d quartos ocupados', $occupiedRooms, $totalRooms),
                'delta' => $this->formatDeltaPoints(abs($occupancyDelta)),
                'deltaDir' => $occupancyDelta >= 0 ? 'up' : 'down',
                'spark' => $series->pluck('occupancy')->all(),
            ],
            [
                'tone' => 'green',
                'icon' => 'ArrowDownTray',
                'value' => (string) $checkinsCompletedToday,
                'label' => 'Check-ins de hoje',
                'sub' => sprintf('de %d programados hoje · %d ainda pendentes', $checkinsPlannedToday, max($checkinsPlannedToday - $checkinsCompletedToday, 0)),
                'delta' => (string) abs($checkinsCompletedToday - (int) ($previousMetrics['checkinsCompleted'] ?? 0)),
                'deltaDir' => $checkinsCompletedToday >= (int) ($previousMetrics['checkinsCompleted'] ?? 0) ? 'up' : 'down',
                'spark' => $series->pluck('checkinsCompleted')->all(),
            ],
            [
                'tone' => 'orange',
                'icon' => 'ArrowUpTray',
                'value' => (string) $checkoutsCompletedToday,
                'label' => 'Check-outs de hoje',
                'sub' => sprintf('de %d programados hoje · %d ainda pendentes', $checkoutsPlannedToday, max($checkoutsPlannedToday - $checkoutsCompletedToday, 0)),
                'delta' => (string) abs($checkoutsCompletedToday - (int) ($previousMetrics['checkoutsCompleted'] ?? 0)),
                'deltaDir' => $checkoutsCompletedToday >= (int) ($previousMetrics['checkoutsCompleted'] ?? 0) ? 'up' : 'down',
                'spark' => $series->pluck('checkoutsCompleted')->all(),
            ],
            [
                'tone' => 'purple',
                'icon' => 'Cash',
                'value' => $this->formatCurrency($revenueToday),
                'label' => 'Receita de hoje',
                'sub' => sprintf(
                    'prevista %s · já recebida %s',
                    $this->formatCurrency($revenueToday),
                    $this->formatCurrency($revenueCollectedToday)
                ),
                'delta' => $this->formatCurrency(abs($revenueDelta)),
                'deltaDir' => $revenueDelta >= 0 ? 'up' : 'down',
                'spark' => $series->pluck('revenueCollected')->map(fn ($value) => (float) $value)->all(),
            ],
        ];

        $chartData = $series->map(fn (array $day) => [
            'label' => $day['label'],
            'full'  => $day['full'],
            'value' => $day['occupancy'],
            'rooms' => $day['occupiedRooms'],
        ]);

        $rooms = Room::select('number', 'floor', 'status')
            ->orderBy('floor')
            ->orderBy('number')
            ->get()
            ->map(fn (Room $r) => [
                'number' => $r->number,
                'floor'  => $r->floor,
                'status' => $r->status,
            ]);

        return Inertia::render('Dashboard/Index', [
            'kpis' => $kpis,
            'occupancyRate' => $occupancyRate,
            'checkinsToday' => $checkinsToday,
            'checkoutsToday' => $checkoutsToday,
            'revenueToday' => $revenueToday,
            'generatedAt' => now()->toIso8601String(),
            'chartData'   => $chartData,
            'rooms'       => $rooms,
        ]);
    }

    private function buildDailySeries(Collection $reservations, Carbon $start, int $days, int $totalRooms): Collection
    {
        return collect(range(0, $days - 1))->map(function (int $offset) use ($reservations, $start, $totalRooms) {
            $day = $start->copy()->addDays($offset)->startOfDay();

            $occupiedReservations = $reservations->filter(function (Reservation $reservation) use ($day) {
                $checkin = $reservation->checkin->copy()->startOfDay();
                $checkout = $reservation->checkout->copy()->startOfDay();

                return $checkin->lte($day) && $checkout->gt($day);
            });

            $checkins = $reservations->filter(fn (Reservation $reservation) => $reservation->checkin->isSameDay($day))->count();
            $checkinsCompleted = $reservations->filter(fn (Reservation $reservation) => $reservation->checkin->isSameDay($day) && (bool) $reservation->checked_in_at)->count();
            $checkouts = $reservations->filter(fn (Reservation $reservation) => $reservation->checkout->isSameDay($day))->count();
            $checkoutsCompleted = $reservations->filter(fn (Reservation $reservation) => $reservation->checkout->isSameDay($day) && $reservation->status === 'realizada')->count();
            $revenue = (float) $reservations
                ->filter(fn (Reservation $reservation) => $reservation->checkin->isSameDay($day))
                ->sum('total');
            $revenueCollected = (float) $reservations
                ->filter(fn (Reservation $reservation) => $reservation->checkin->isSameDay($day) && (bool) $reservation->paid)
                ->sum('total');
            $occupiedRooms = $occupiedReservations->pluck('room_id')->unique()->count();

            return [
                'label'         => $this->dayShortLabel($day),
                'full'          => $this->dayFullLabel($day),
                'occupancy'     => $this->percentage($occupiedRooms, $totalRooms),
                'occupiedRooms' => $occupiedRooms,
                'checkins'      => $checkins,
                'checkinsCompleted' => $checkinsCompleted,
                'checkouts'     => $checkouts,
                'checkoutsCompleted' => $checkoutsCompleted,
                'revenue'       => $revenue,
                'revenueCollected' => $revenueCollected,
            ];
        })->values();
    }

    private function percentage(int|float $value, int|float $total): float
    {
        if ($total <= 0) {
            return 0.0;
        }

        return round(($value / $total) * 100, 1);
    }

    private function formatPercent(float $value): string
    {
        return number_format($value, 1, ',', '.') . '%';
    }

    private function formatCurrency(float $value): string
    {
        return 'R$ ' . number_format($value, 0, ',', '.');
    }

    private function formatDeltaPoints(float $value): string
    {
        return number_format($value, 1, ',', '.') . ' pts';
    }

    private function dayShortLabel(Carbon $day): string
    {
        return self::WEEKDAYS[(int) $day->dayOfWeek];
    }

    private function dayFullLabel(Carbon $day): string
    {
        return sprintf(
            '%s, %s %s',
            self::WEEKDAYS_FULL[(int) $day->dayOfWeek],
            $day->format('d'),
            self::MONTHS[(int) $day->month - 1]
        );
    }
}



