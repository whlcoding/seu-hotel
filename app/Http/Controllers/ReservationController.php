<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Guest;
use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservationController extends Controller
{
    public function indexApi(Request $request)
    {
        $query = Reservation::with(['guest', 'room'])->latest('id');

        // Apply filters
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('from')) {
            $query->whereDate('checkout', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('checkin', '<=', $request->to);
        }

        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->whereHas('guest', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->orWhere('ref', 'like', "%{$search}%")
            ->orWhereHas('room', function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%");
            });
        }

        // Get total before pagination
        $total = $query->count();

        // Apply sorting
        $sortKey = $request->get('sort_key', 'id');
        $sortDir = $request->get('sort_dir', 'desc');

        switch ($sortKey) {
            case 'guest':
                $query->join('guests', 'reservations.guest_id', '=', 'guests.id')
                      ->orderBy('guests.name', $sortDir)
                      ->select('reservations.*');
                break;
            case 'room':
                $query->join('rooms', 'reservations.room_id', '=', 'rooms.id')
                      ->orderBy('rooms.number', $sortDir)
                      ->select('reservations.*');
                break;
            case 'checkin':
                $query->orderBy('checkin', $sortDir);
                break;
            case 'checkout':
                $query->orderBy('checkout', $sortDir);
                break;
            case 'status':
                $query->orderBy('status', $sortDir);
                break;
            case 'nights':
                $query->orderBy('nights', $sortDir);
                break;
            case 'total':
                $query->orderBy('total', $sortDir);
                break;
            default:
                $query->orderBy('id', $sortDir);
        }

        // Paginate
        $page = max(1, (int) $request->get('page', 1));
        $perPage = (int) $request->get('per_page', 10);
        $reservations = $query->paginate($perPage, ['reservations.*'], 'page', $page);

        // Transform data to match frontend format
        $data = $reservations->map(fn ($r) => $this->formatReservation($r))->all();

        // Count by status
        $statusCounts = Reservation::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();
        $statusCounts['all'] = Reservation::count();

        return response()->json([
            'data' => $data,
            'pagination' => [
                'current_page' => $reservations->currentPage(),
                'total' => $total,
                'per_page' => $perPage,
                'last_page' => $reservations->lastPage(),
                'from' => $reservations->firstItem(),
                'to' => $reservations->lastItem(),
            ],
            'status_counts' => $statusCounts,
        ]);
    }

    public function index(Request $request)
    {
        $query = Reservation::with(['guest', 'room'])->latest('id');

        // Apply filters
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('from')) {
            $query->whereDate('checkout', '>=', $request->from);
        }

        if ($request->filled('to')) {
            $query->whereDate('checkin', '<=', $request->to);
        }

        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->whereHas('guest', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->orWhere('ref', 'like', "%{$search}%")
            ->orWhereHas('room', function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%");
            });
        }

        // Get total before pagination
        $total = $query->count();

        // Apply sorting
        $sortKey = $request->get('sort_key', 'id');
        $sortDir = $request->get('sort_dir', 'desc');

        switch ($sortKey) {
            case 'guest':
                $query->join('guests', 'reservations.guest_id', '=', 'guests.id')
                      ->orderBy('guests.name', $sortDir)
                      ->select('reservations.*');
                break;
            case 'room':
                $query->join('rooms', 'reservations.room_id', '=', 'rooms.id')
                      ->orderBy('rooms.number', $sortDir)
                      ->select('reservations.*');
                break;
            case 'checkin':
                $query->orderBy('checkin', $sortDir);
                break;
            case 'checkout':
                $query->orderBy('checkout', $sortDir);
                break;
            case 'status':
                $query->orderBy('status', $sortDir);
                break;
            case 'nights':
                $query->orderBy('nights', $sortDir);
                break;
            case 'total':
                $query->orderBy('total', $sortDir);
                break;
            default:
                $query->orderBy('id', $sortDir);
        }

        // Paginate
        $page = max(1, (int) $request->get('page', 1));
        $perPage = (int) $request->get('per_page', 10);
        $reservations = $query->paginate($perPage, ['reservations.*'], 'page', $page);

        // Transform data to match frontend format
        $data = $reservations->map(fn ($r) => $this->formatReservation($r))->all();

        // Count by status
        $statusCounts = Reservation::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->all();
        $statusCounts['all'] = Reservation::count();

        return Inertia::render('Reservas/Index', [
            'reservations' => $data,
            'pagination' => [
                'current_page' => $reservations->currentPage(),
                'total' => $total,
                'per_page' => $perPage,
                'last_page' => $reservations->lastPage(),
                'from' => $reservations->firstItem(),
                'to' => $reservations->lastItem(),
            ],
            'status_counts' => $statusCounts,
        ]);
    }

    public function create()
    {
        $typeMeta = [
            'Single' => ['capacity' => '1 pessoa',      'capacityNum' => 1, 'bed' => '1 cama de solteiro'],
            'Duplo'  => ['capacity' => 'até 2 pessoas', 'capacityNum' => 2, 'bed' => '1 cama de casal · 1 sofá-cama'],
            'Suíte'  => ['capacity' => 'até 4 pessoas', 'capacityNum' => 4, 'bed' => '1 cama queen · varanda'],
        ];

        $typeId = ['Single' => 'single', 'Duplo' => 'duplo', 'Suíte' => 'suite'];

        $guests = Guest::withCount('reservations as stays')
            ->with('reservations:id,guest_id,checkout')
            ->get()
            ->map(function ($g) {
                $lastCheckout = $g->reservations->sortByDesc('checkout')->first()?->checkout;
                return [
                    'id'           => $g->id,
                    'name'         => $g->name,
                    'email'        => $g->email,
                    'phone'        => $g->phone ?? '',
                    'cpf'          => $g->cpf ?? '',
                    'avatar_color' => $g->avatar_color ?? '',
                    'tag'          => $g->tag ?? '',
                    'stays'        => $g->stays,
                    'last'         => $lastCheckout ? $lastCheckout->format('d/m/Y') : '—',
                ];
            });

        $roomTypes = Room::all()
            ->groupBy('type')
            ->map(function ($rooms, $type) use ($typeMeta, $typeId) {
                $meta = $typeMeta[$type] ?? ['capacity' => '', 'capacityNum' => 1, 'bed' => ''];
                $roomIdMap = $rooms->pluck('id', 'number')->toArray();
                return [
                    'id'          => $typeId[$type] ?? strtolower($type),
                    'name'        => $type,
                    'capacity'    => $meta['capacity'],
                    'capacityNum' => $meta['capacityNum'],
                    'bed'         => $meta['bed'],
                    'price'       => (float) $rooms->first()->price_per_night,
                    'total'       => $rooms->count(),
                    'nums'        => $rooms->pluck('number')->values()->toArray(),
                    'roomIdMap'   => $roomIdMap,
                ];
            })
            ->values();

        return Inertia::render('Reservas/Create', [
            'guests'    => $guests->values(),
            'roomTypes' => $roomTypes,
            'booking'   => session('booking'),
        ]);
    }

    public function availableRooms(Request $request)
    {
        $request->validate([
            'checkin'  => 'required|date',
            'checkout' => 'required|date|after:checkin',
        ]);

        $occupiedRoomIds = Reservation::whereNotIn('status', ['cancelada', 'no-show'])
            ->where('checkin', '<', $request->checkout)
            ->where('checkout', '>', $request->checkin)
            ->pluck('room_id')
            ->unique()
            ->values();

        return response()->json(['occupied_room_ids' => $occupiedRoomIds]);
    }

    public function store(Request $request)
    {
        $guestMode = $request->input('guest_mode', 'search');

        $rules = [
            'room_id'  => 'required|exists:rooms,id',
            'checkin'  => 'required|date',
            'checkout' => 'required|date|after:checkin',
            'status'   => 'required|in:confirmada,pendente,cancelada,realizada,no-show',
            'channel'  => 'required|in:Recepção (Telefone),Website,App,Booking.com,Expedia,Agência de viagens,Walk-in',
            'paid'     => 'boolean',
            'note'     => 'nullable|string',
        ];

        if ($guestMode === 'new') {
            $rules += [
                'ng_name'    => 'required|string|max:255',
                'ng_email'   => 'required|email|unique:guests,email',
                'ng_phone'   => 'required|string|max:20',
                'ng_cpf'     => 'required|string|max:14',
                'ng_address' => 'nullable|string|max:500',
                'ng_dob'     => 'nullable|date',
            ];
        } else {
            $rules['guest_id'] = 'required|exists:guests,id';
        }

        $validated = $request->validate($rules);

        if ($guestMode === 'new') {
            $guest = Guest::create([
                'name'         => $validated['ng_name'],
                'email'        => $validated['ng_email'],
                'phone'        => $validated['ng_phone'],
                'cpf'          => $validated['ng_cpf'],
                'address'      => $validated['ng_address'] ?? null,
                'dob'          => $validated['ng_dob'] ?? null,
                'avatar_color' => 'blue',
                'tag'          => 'Novo',
            ]);
            $guestId = $guest->id;
        } else {
            $guestId = $validated['guest_id'];
            $guest = Guest::find($guestId);
        }

        $checkin  = new \DateTime($validated['checkin']);
        $checkout = new \DateTime($validated['checkout']);
        $nights   = $checkout->diff($checkin)->days;

        $room  = Room::find($validated['room_id']);
        $total = $nights * $room->price_per_night;
        $tax   = round($total * 0.05, 2);

        $reservation = Reservation::create([
            'ref'          => 'RES-' . (Reservation::max('id') + 1),
            'guest_id'     => $guestId,
            'room_id'      => $validated['room_id'],
            'checkin'      => $validated['checkin'],
            'checkout'     => $validated['checkout'],
            'nights'       => $nights,
            'guests_count' => 1,
            'status'       => $validated['status'],
            'channel'      => $validated['channel'],
            'paid'         => $validated['paid'] ?? false,
            'note'         => $validated['note'] ?? null,
            'total'        => $total,
            'tax'          => $tax,
        ]);

        return redirect()->route('reservas.create')
            ->with('booking', [
                'ref'          => $reservation->ref,
                'guestName'    => $guest->name,
                'roomNumber'   => $room->number,
                'roomTypeName' => $room->type,
                'pricePerNight'=> (float) $room->price_per_night,
                'checkin'      => $validated['checkin'],
                'checkout'     => $validated['checkout'],
                'nights'       => $nights,
                'total'        => (float) $total,
                'tax'          => (float) $tax,
            ]);
    }

    public function show(Reservation $reservation)
    {
        $reservation->load(['guest', 'room']);

        return Inertia::render('Reservas/Show', [
            'reservation' => $this->formatReservation($reservation),
        ]);
    }

    public function edit(Reservation $reservation)
    {
        $reservation->load(['guest', 'room']);

        return Inertia::render('Reservas/Edit', [
            'reservation' => $this->formatReservation($reservation),
        ]);
    }

    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'guest_id' => 'required|exists:guests,id',
            'room_id' => 'required|exists:rooms,id',
            'checkin' => 'required|date',
            'checkout' => 'required|date|after:checkin',
            'guests_count' => 'required|integer|min:1',
            'status' => 'required|in:confirmada,pendente,cancelada,realizada,no-show',
            'channel' => 'required|in:Recepção (Telefone),Website,App,Booking.com,Expedia,Agência de viagens,Walk-in',
            'paid' => 'boolean',
            'note' => 'nullable|string',
        ]);

        // Recalculate if dates or room changed
        $checkin = new \DateTime($validated['checkin']);
        $checkout = new \DateTime($validated['checkout']);
        $nights = $checkout->diff($checkin)->days;

        $room = \App\Models\Room::find($validated['room_id']);
        $total = $nights * $room->price_per_night;
        $tax = round($total * 0.05, 2);

        $reservation->update([
            ...$validated,
            'nights' => $nights,
            'total' => $total,
            'tax' => $tax,
            'paid' => $validated['paid'] ?? false,
        ]);

        return redirect()->route('reservas')
                        ->with('success', "Reserva #{$reservation->id} atualizada com sucesso");
    }

    public function destroy(Reservation $reservation)
    {
        $id = $reservation->id;
        $reservation->delete();

        return redirect()->route('reservas')
                        ->with('success', "Reserva #{$id} cancelada com sucesso");
    }

    private function formatReservation(Reservation $reservation): array
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
