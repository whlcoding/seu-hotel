<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckinController extends Controller
{
    public function index(): Response
    {
        $today = Carbon::today()->startOfDay();

        $arrivals = Reservation::with(['guest', 'room'])
            ->whereIn('status', ['pendente', 'confirmada'])
            ->whereNull('checked_in_at')
            ->whereDate('checkin', '<=', $today)
            ->whereDate('checkout', '>=', $today)
            ->orderBy('checkin')
            ->orderBy('id')
            ->get()
            ->map(fn (Reservation $reservation) => $this->formatArrival($reservation))
            ->values();

        return Inertia::render('Checkin/Index', [
            'arrivals' => $arrivals,
            'generatedAt' => Carbon::now()->toIso8601String(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reservation_id' => 'required|exists:reservations,id',
            'payment_status' => 'required|in:paid,now',
            'payment_method' => 'required_if:payment_status,paid|nullable|in:card,debit,cash,pix,check',
        ]);

        DB::transaction(function () use ($validated) {
            $reservation = Reservation::with('room')->lockForUpdate()->findOrFail($validated['reservation_id']);

            if ($reservation->checked_in_at) {
                throw ValidationException::withMessages([
                    'reservation_id' => 'Este check-in já foi registrado.',
                ]);
            }

            $reservation->update([
                'status' => 'confirmada',
                'checked_in_at' => now(),
                'paid' => $validated['payment_status'] === 'paid',
                'payment_method' => $validated['payment_status'] === 'paid'
                    ? $validated['payment_method']
                    : null,
            ]);

            $reservation->room->update(['status' => 'occupied']);
        });

        return redirect()->route('checkin')
            ->with('success', 'Check-in registrado com sucesso.');
    }

    private function formatArrival(Reservation $reservation): array
    {
        return [
            'id' => $reservation->id,
            'ref' => $reservation->ref,
            'guest' => $reservation->guest->name,
            'email' => $reservation->guest->email,
            'avatarColor' => $reservation->guest->avatar_color ?? '',
            'room' => $reservation->room->number,
            'roomType' => $reservation->room->type,
            'pricePerNight' => (float) $reservation->room->price_per_night,
            'checkin' => $reservation->checkin->toDateString(),
            'checkout' => $reservation->checkout->toDateString(),
            'nights' => $reservation->nights,
            'guests' => $reservation->guests_count,
            'status' => $reservation->status,
            'channel' => $reservation->channel,
            'paid' => (bool) $reservation->paid,
            'total' => (float) $reservation->total,
            'tax' => (float) $reservation->tax,
            'note' => $reservation->note ?? '',
            'created' => $reservation->created_at->toDateString(),
        ];
    }
}


