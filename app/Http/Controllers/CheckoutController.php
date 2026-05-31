<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function index(): Response
    {
        $today = today();

        $activeStays = Reservation::with(['guest', 'room', 'stayItems'])
            ->where('status', 'confirmada')
            ->whereDate('checkin', '<=', $today)
            ->whereDate('checkout', '>=', $today)
            ->get()
            ->map(fn ($r) => $this->formatActiveStay($r))
            ->values();

        return Inertia::render('Checkout/Index', [
            'activeStays' => $activeStays,
        ]);
    }

    public function finalize(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reservation_id'       => 'required|exists:reservations,id',
            'payment_status'       => 'required|in:paid,now',
            'payment_method'       => 'nullable|in:card,debit,cash,pix,check',
            'items'                => 'required|array',
            'items.*.id'           => 'required|string',
            'items.*.name'         => 'required|string',
            'items.*.unit'         => 'required|numeric|min:0',
            'items.*.qty'          => 'required|integer|min:0',
            'items.*.unitLabel'    => 'required|string',
            'items.*.icon'         => 'required|string',
            'items.*.locked'       => 'boolean',
            'items.*.custom'       => 'boolean',
            'ratings'              => 'nullable|array',
            'ratings.limpeza'      => 'nullable|integer|min:0|max:5',
            'ratings.conforto'     => 'nullable|integer|min:0|max:5',
            'ratings.atendimento'  => 'nullable|integer|min:0|max:5',
            'ratings.wifi'         => 'nullable|integer|min:0|max:5',
            'ratings.comment'      => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated) {
            $reservation = Reservation::with(['guest', 'room'])->findOrFail($validated['reservation_id']);

            $activeItems = collect($validated['items'])->filter(fn ($it) => ($it['qty'] ?? 0) > 0);
            $subtotal = $activeItems->sum(fn ($it) => $it['unit'] * $it['qty']);
            $tax = round($subtotal * 0.05, 2);
            $total = $subtotal + $tax;

            $reservation->stayItems()->delete();
            foreach ($activeItems as $item) {
                $reservation->stayItems()->create([
                    'name'       => $item['name'],
                    'unit_price' => $item['unit'],
                    'qty'        => $item['qty'],
                    'unit_label' => $item['unitLabel'],
                    'icon'       => $item['icon'],
                    'locked'     => $item['locked'] ?? false,
                    'custom'     => $item['custom'] ?? false,
                ]);
            }

            $reservation->update([
                'status'         => 'realizada',
                'total'          => $total,
                'tax'            => $tax,
                'paid'           => true,
                'payment_method' => $validated['payment_method'] ?? null,
                'rating'         => $validated['ratings'] ?? null,
            ]);

            $reservation->room->update(['status' => 'cleaning']);
        });

        $reservation = Reservation::with('guest')->find($validated['reservation_id']);

        return redirect()->route('checkout')
            ->with('success', "Check-out de {$reservation->guest->name} realizado com sucesso.");
    }

    private function formatActiveStay(Reservation $r): array
    {
        return [
            'id'           => $r->id,
            'ref'          => $r->ref,
            'guest'        => $r->guest->name,
            'email'        => $r->guest->email,
            'phone'        => $r->guest->phone ?? '',
            'cpf'          => $r->guest->cpf ?? '',
            'room'         => $r->room->number,
            'roomType'     => $r->room->type,
            'pricePerNight' => (float) $r->room->price_per_night,
            'nights'       => $r->nights,
            'checkin'      => [
                'date' => $r->checkin->format('d/m/Y'),
                'time' => $r->checked_in_at?->format('H:i') ?? '',
            ],
            'checkout'     => [
                'date' => $r->checkout->format('d/m/Y'),
                'time' => '',
            ],
            'avatarColor'  => $r->guest->avatar_color ?? '',
            'tag'          => $r->guest->tag ?? '',
            'paidUpfront'  => (bool) $r->paid,
            'items'        => $r->stayItems->map(fn ($it) => [
                'id'        => (string) $it->id,
                'name'      => $it->name,
                'unit'      => (float) $it->unit_price,
                'qty'       => $it->qty,
                'unitLabel' => $it->unit_label,
                'icon'      => $it->icon,
                'locked'    => (bool) $it->locked,
                'custom'    => (bool) $it->custom,
                'checked'   => true,
            ])->values()->all(),
        ];
    }
}
