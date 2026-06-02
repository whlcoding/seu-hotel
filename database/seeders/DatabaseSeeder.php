<?php

namespace Database\Seeders;

use App\Models\CleaningTask;
use App\Models\Guest;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\StayItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Reservation::truncate();
        StayItem::truncate();
        CleaningTask::truncate();
        Room::truncate();
        Guest::truncate();
        User::truncate();
        Schema::enableForeignKeyConstraints();

        $today = Carbon::today();

        // ── 1. EQUIPE ─────────────────────────────────────────────────────────
        $teamData = [
            ['name' => 'Admin',          'email' => 'admin@hotel.com',                'role' => 'gerente',      'color' => 'blue',   'schedule' => ['mat','mat','mat','mat','mat','off','off'], 'pwd' => 'senha123', 'salary' => 4800.00, 'months' => 36],
            ['name' => 'Mariana Reis',    'email' => 'mariana@maranzul.com.br',        'role' => 'gerente',      'color' => 'purple', 'schedule' => ['mat','mat','mat','mat','mat','off','off'], 'pwd' => 'senha123', 'salary' => 4500.00, 'months' => 24],
            ['name' => 'João da Silva',   'email' => 'joao.silva@maranzul.com.br',     'role' => 'housekeeping', 'color' => 'green',  'schedule' => ['mat','mat','mat','mat','mat','mat','off'], 'pwd' => 'senha123', 'salary' => 2200.00, 'months' => 18],
            ['name' => 'Camila Souza',    'email' => 'camila@maranzul.com.br',         'role' => 'housekeeping', 'color' => 'blue',   'schedule' => ['vesp','vesp','vesp','vesp','vesp','off','off'], 'pwd' => 'senha123', 'salary' => 2200.00, 'months' => 12],
            ['name' => 'Pedro Henrique',  'email' => 'pedro@maranzul.com.br',          'role' => 'manutencao',   'color' => 'orange', 'schedule' => ['mat','mat','mat','off','off','mat','mat'], 'pwd' => 'senha123', 'salary' => 2800.00, 'months' => 30],
            ['name' => 'Beatriz Castro',  'email' => 'beatriz@maranzul.com.br',        'role' => 'recepcao',     'color' => 'red',    'schedule' => ['noite','noite','noite','noite','noite','off','off'], 'pwd' => 'senha123', 'salary' => 2600.00, 'months' => 8],
            ['name' => 'Lucas Ferreira',  'email' => 'lucas@maranzul.com.br',          'role' => 'recepcao',     'color' => 'green',  'schedule' => ['mat','mat','off','off','mat','mat','mat'], 'pwd' => 'senha123', 'salary' => 2600.00, 'months' => 6],
            ['name' => 'Ana Paula Nunes', 'email' => 'ana.paula@maranzul.com.br',      'role' => 'housekeeping', 'color' => 'orange', 'schedule' => ['vesp','off','vesp','vesp','vesp','vesp','off'], 'pwd' => 'senha123', 'salary' => 2200.00, 'months' => 4],
        ];

        foreach ($teamData as $u) {
            User::create([
                'name'           => $u['name'],
                'email'          => $u['email'],
                'password'       => Hash::make($u['pwd']),
                'role'           => $u['role'],
                'avatar_color'   => $u['color'],
                'schedule'       => $u['schedule'],
                'admission_date' => Carbon::now()->subMonths($u['months']),
                'salary'         => $u['salary'],
                'team_status'    => 'ativo',
            ]);
        }

        $mariana  = User::where('email', 'mariana@maranzul.com.br')->first();
        $joao     = User::where('email', 'joao.silva@maranzul.com.br')->first();
        $camila   = User::where('email', 'camila@maranzul.com.br')->first();
        $pedro    = User::where('email', 'pedro@maranzul.com.br')->first();
        $lucas    = User::where('email', 'lucas@maranzul.com.br')->first();
        $anaPaula = User::where('email', 'ana.paula@maranzul.com.br')->first();

        // ── 2. HÓSPEDES ───────────────────────────────────────────────────────
        $guestData = [
            ['name' => 'Eduardo Antunes',    'email' => 'eduardo@antunes.co',        'phone' => '+55 11 98112-9988', 'cpf' => '775.331.004-12', 'tag' => 'VIP',  'color' => 'green',  'dob' => '1978-04-15'],
            ['name' => 'Larissa Mendonça',   'email' => 'lari.mend@hotmail.com',     'phone' => '+55 41 99655-3322', 'cpf' => '551.224.788-90', 'tag' => 'Novo', 'color' => 'blue',   'dob' => '1995-09-22'],
            ['name' => 'Carlos Mendes',      'email' => 'carlos.mendes@gmail.com',   'phone' => '+55 21 99888-7766', 'cpf' => '123.456.789-00', 'tag' => null,   'color' => 'orange', 'dob' => '1985-11-03'],
            ['name' => 'Amanda Costa Silva', 'email' => 'a.costa.silva@live.com',    'phone' => '+55 31 99111-2233', 'cpf' => '888.777.666-55', 'tag' => 'VIP',  'color' => 'purple', 'dob' => '1990-06-18'],
            ['name' => 'Rafael Teixeira',    'email' => 'rafael.t@outlook.com',      'phone' => '+55 11 97234-5678', 'cpf' => '332.445.567-89', 'tag' => 'VIP',  'color' => 'red',    'dob' => '1982-02-28'],
            ['name' => 'Fernanda Lima',      'email' => 'fernanda.lima@gmail.com',   'phone' => '+55 51 98877-6655', 'cpf' => '667.889.001-23', 'tag' => 'Novo', 'color' => 'blue',   'dob' => '1998-07-11'],
            ['name' => 'Bruno Carvalho',     'email' => 'b.carvalho@empresa.com',    'phone' => '+55 61 99345-1122', 'cpf' => '445.667.889-34', 'tag' => null,   'color' => 'green',  'dob' => '1988-12-05'],
            ['name' => 'Sofia Martins',      'email' => 'sofia.martins@gmail.com',   'phone' => '+55 19 98765-4321', 'cpf' => '221.334.556-78', 'tag' => 'VIP',  'color' => 'orange', 'dob' => '1975-03-30'],
            ['name' => 'Diego Almeida',      'email' => 'diego.almeida@live.com',    'phone' => '+55 71 97654-3210', 'cpf' => '998.776.554-32', 'tag' => null,   'color' => 'purple', 'dob' => '1993-08-17'],
            ['name' => 'Isabela Rocha',      'email' => 'isa.rocha@hotmail.com',     'phone' => '+55 81 99432-1098', 'cpf' => '112.223.334-56', 'tag' => 'Novo', 'color' => 'red',    'dob' => '2000-01-25'],
            ['name' => 'Marcelo Santos',     'email' => 'marcelo.santos@yahoo.com',  'phone' => '+55 11 98001-7654', 'cpf' => '556.667.778-90', 'tag' => null,   'color' => 'blue',   'dob' => '1971-05-09'],
            ['name' => 'Priya Patel',        'email' => 'priya.patel@gmail.com',     'phone' => '+91 98765-43210',   'cpf' => null,             'tag' => 'VIP',  'color' => 'green',  'dob' => '1986-10-14'],
        ];

        foreach ($guestData as $g) {
            Guest::create([
                'name'         => $g['name'],
                'email'        => $g['email'],
                'phone'        => $g['phone'],
                'cpf'          => $g['cpf'],
                'tag'          => $g['tag'],
                'avatar_color' => $g['color'],
                'dob'          => $g['dob'],
            ]);
        }

        $eduardo  = Guest::where('email', 'eduardo@antunes.co')->first();
        $larissa  = Guest::where('email', 'lari.mend@hotmail.com')->first();
        $carlos   = Guest::where('email', 'carlos.mendes@gmail.com')->first();
        $amanda   = Guest::where('email', 'a.costa.silva@live.com')->first();
        $rafael   = Guest::where('email', 'rafael.t@outlook.com')->first();
        $fernanda = Guest::where('email', 'fernanda.lima@gmail.com')->first();
        $bruno    = Guest::where('email', 'b.carvalho@empresa.com')->first();
        $sofia    = Guest::where('email', 'sofia.martins@gmail.com')->first();
        $diego    = Guest::where('email', 'diego.almeida@live.com')->first();
        $isabela  = Guest::where('email', 'isa.rocha@hotmail.com')->first();
        $marcelo  = Guest::where('email', 'marcelo.santos@yahoo.com')->first();
        $priya    = Guest::where('email', 'priya.patel@gmail.com')->first();

        // ── 3. QUARTOS ────────────────────────────────────────────────────────
        $roomsData = [
            ['number' => '101', 'type' => 'Single', 'floor' => 1, 'price' => 180, 'status' => 'reserved'],    // checkin hoje
            ['number' => '102', 'type' => 'Single', 'floor' => 1, 'price' => 180, 'status' => 'occupied'],    // checkout hoje
            ['number' => '103', 'type' => 'Single', 'floor' => 1, 'price' => 180, 'status' => 'occupied'],    // checkout 04/06
            ['number' => '104', 'type' => 'Single', 'floor' => 1, 'price' => 180, 'status' => 'maintenance'], // manutenção
            ['number' => '201', 'type' => 'Duplo',  'floor' => 2, 'price' => 250, 'status' => 'occupied'],    // checkout hoje
            ['number' => '202', 'type' => 'Duplo',  'floor' => 2, 'price' => 250, 'status' => 'occupied'],    // checkout 05/06
            ['number' => '203', 'type' => 'Duplo',  'floor' => 2, 'price' => 250, 'status' => 'occupied'],    // checkout 03/06
            ['number' => '301', 'type' => 'Duplo',  'floor' => 3, 'price' => 250, 'status' => 'reserved'],    // checkin hoje
            ['number' => '302', 'type' => 'Duplo',  'floor' => 3, 'price' => 250, 'status' => 'occupied'],    // checkout 06/06
            ['number' => '501', 'type' => 'Suíte',  'floor' => 5, 'price' => 480, 'status' => 'occupied'],    // checkout hoje
            ['number' => '502', 'type' => 'Suíte',  'floor' => 5, 'price' => 480, 'status' => 'reserved'],    // checkin hoje
            ['number' => '503', 'type' => 'Suíte',  'floor' => 5, 'price' => 480, 'status' => 'occupied'],    // checkout 07/06
        ];

        foreach ($roomsData as $r) {
            Room::create([
                'number'          => $r['number'],
                'type'            => $r['type'],
                'floor'           => $r['floor'],
                'price_per_night' => $r['price'],
                'status'          => $r['status'],
            ]);
        }

        $r101 = Room::where('number', '101')->first();
        $r102 = Room::where('number', '102')->first();
        $r103 = Room::where('number', '103')->first();
        $r104 = Room::where('number', '104')->first();
        $r201 = Room::where('number', '201')->first();
        $r202 = Room::where('number', '202')->first();
        $r203 = Room::where('number', '203')->first();
        $r301 = Room::where('number', '301')->first();
        $r302 = Room::where('number', '302')->first();
        $r501 = Room::where('number', '501')->first();
        $r502 = Room::where('number', '502')->first();
        $r503 = Room::where('number', '503')->first();

        // ── 4. RESERVAS ───────────────────────────────────────────────────────

        // CHECKOUT HOJE ───────────────────────────────────────────────────────
        $res1 = Reservation::create([
            'ref'            => 'RES-2039',
            'guest_id'       => $eduardo->id,
            'room_id'        => $r501->id,
            'checkin'        => $today->copy()->subDays(3),
            'checkout'       => $today,
            'checked_in_at'  => $today->copy()->subDays(3)->setHour(14)->setMinute(30),
            'nights'         => 3,
            'guests_count'   => 2,
            'status'         => 'realizada',
            'channel'        => 'Website',
            'paid'           => false,
            'total'          => 3 * 480,
            'tax'            => (3 * 480) * 0.05,
            'note'           => 'Hóspede VIP frequente. Solicita travesseiros extras e vista para o mar.',
        ]);

        $res2 = Reservation::create([
            'ref'            => 'RES-4091',
            'guest_id'       => $larissa->id,
            'room_id'        => $r201->id,
            'checkin'        => $today->copy()->subDays(2),
            'checkout'       => $today,
            'checked_in_at'  => $today->copy()->subDays(2)->setHour(15)->setMinute(0),
            'nights'         => 2,
            'guests_count'   => 1,
            'status'         => 'realizada',
            'channel'        => 'Booking.com',
            'paid'           => true,
            'payment_method' => 'pix',
            'total'          => 2 * 250,
            'tax'            => (2 * 250) * 0.05,
            'note'           => 'Primeira estadia. Solicitou mesa de trabalho.',
        ]);

        $res3 = Reservation::create([
            'ref'            => 'RES-7823',
            'guest_id'       => $carlos->id,
            'room_id'        => $r102->id,
            'checkin'        => $today->copy()->subDays(1),
            'checkout'       => $today,
            'checked_in_at'  => $today->copy()->subDays(1)->setHour(16)->setMinute(0),
            'nights'         => 1,
            'guests_count'   => 1,
            'status'         => 'realizada',
            'channel'        => 'Airbnb',
            'paid'           => true,
            'payment_method' => 'card',
            'total'          => 1 * 180,
            'tax'            => (1 * 180) * 0.05,
            'note'           => 'Viagem a negócios.',
        ]);

        // CHECKIN HOJE ────────────────────────────────────────────────────────
        $res4 = Reservation::create([
            'ref'          => 'RES-5512',
            'guest_id'     => $amanda->id,
            'room_id'      => $r301->id,
            'checkin'      => $today,
            'checkout'     => $today->copy()->addDays(3),
            'nights'       => 3,
            'guests_count' => 2,
            'status'       => 'confirmada',
            'channel'      => 'Website',
            'paid'         => true,
            'total'        => 3 * 250,
            'tax'          => (3 * 250) * 0.05,
            'note'         => 'Hóspede VIP. Prefere quarto silencioso.',
        ]);

        $res5 = Reservation::create([
            'ref'          => 'RES-3344',
            'guest_id'     => $rafael->id,
            'room_id'      => $r502->id,
            'checkin'      => $today,
            'checkout'     => $today->copy()->addDays(2),
            'nights'       => 2,
            'guests_count' => 1,
            'status'       => 'confirmada',
            'channel'      => 'Expedia',
            'paid'         => false,
            'total'        => 2 * 480,
            'tax'          => (2 * 480) * 0.05,
            'note'         => 'Check-in previsto para depois das 14h.',
        ]);

        $res6 = Reservation::create([
            'ref'          => 'RES-8821',
            'guest_id'     => $isabela->id,
            'room_id'      => $r101->id,
            'checkin'      => $today,
            'checkout'     => $today->copy()->addDays(2),
            'nights'       => 2,
            'guests_count' => 1,
            'status'       => 'confirmada',
            'channel'      => 'Booking.com',
            'paid'         => true,
            'total'        => 2 * 180,
            'tax'          => (2 * 180) * 0.05,
            'note'         => '',
        ]);

        // ATUALMENTE HOSPEDADOS ───────────────────────────────────────────────
        $res7 = Reservation::create([
            'ref'            => 'RES-1122',
            'guest_id'       => $fernanda->id,
            'room_id'        => $r103->id,
            'checkin'        => $today->copy()->subDays(1),
            'checkout'       => $today->copy()->addDays(2),
            'checked_in_at'  => $today->copy()->subDays(1)->setHour(13)->setMinute(0),
            'nights'         => 3,
            'guests_count'   => 1,
            'status'         => 'realizada',
            'channel'        => 'Airbnb',
            'paid'           => false,
            'total'          => 3 * 180,
            'tax'            => (3 * 180) * 0.05,
            'note'           => 'Viagem a lazer.',
        ]);

        $res8 = Reservation::create([
            'ref'            => 'RES-6677',
            'guest_id'       => $bruno->id,
            'room_id'        => $r202->id,
            'checkin'        => $today->copy()->subDays(2),
            'checkout'       => $today->copy()->addDays(3),
            'checked_in_at'  => $today->copy()->subDays(2)->setHour(14)->setMinute(30),
            'nights'         => 5,
            'guests_count'   => 2,
            'status'         => 'realizada',
            'channel'        => 'Recepção',
            'paid'           => false,
            'total'          => 5 * 250,
            'tax'            => (5 * 250) * 0.05,
            'note'           => 'Casal em viagem a negócios.',
        ]);

        $res9 = Reservation::create([
            'ref'            => 'RES-9910',
            'guest_id'       => $sofia->id,
            'room_id'        => $r203->id,
            'checkin'        => $today->copy()->subDays(4),
            'checkout'       => $today->copy()->addDays(1),
            'checked_in_at'  => $today->copy()->subDays(4)->setHour(15)->setMinute(0),
            'nights'         => 5,
            'guests_count'   => 3,
            'status'         => 'realizada',
            'channel'        => 'Website',
            'paid'           => true,
            'payment_method' => 'card',
            'total'          => 5 * 250,
            'tax'            => (5 * 250) * 0.05,
            'note'           => 'Hóspede VIP. Família com criança pequena.',
        ]);

        $res10 = Reservation::create([
            'ref'            => 'RES-2211',
            'guest_id'       => $diego->id,
            'room_id'        => $r302->id,
            'checkin'        => $today->copy()->subDays(2),
            'checkout'       => $today->copy()->addDays(4),
            'checked_in_at'  => $today->copy()->subDays(2)->setHour(16)->setMinute(0),
            'nights'         => 6,
            'guests_count'   => 1,
            'status'         => 'realizada',
            'channel'        => 'Expedia',
            'paid'           => false,
            'total'          => 6 * 250,
            'tax'            => (6 * 250) * 0.05,
            'note'           => 'Consultor. Solicitou acordar às 6h.',
        ]);

        $res11 = Reservation::create([
            'ref'            => 'RES-4455',
            'guest_id'       => $marcelo->id,
            'room_id'        => $r503->id,
            'checkin'        => $today->copy()->subDays(3),
            'checkout'       => $today->copy()->addDays(5),
            'checked_in_at'  => $today->copy()->subDays(3)->setHour(12)->setMinute(0),
            'nights'         => 8,
            'guests_count'   => 2,
            'status'         => 'realizada',
            'channel'        => 'Website',
            'paid'           => false,
            'total'          => 8 * 480,
            'tax'            => (8 * 480) * 0.05,
            'note'           => 'Aniversário de casamento. Solicitou champanhe e decoração especial.',
        ]);

        // FUTURAS ─────────────────────────────────────────────────────────────
        $res12 = Reservation::create([
            'ref'          => 'RES-6633',
            'guest_id'     => $priya->id,
            'room_id'      => $r501->id,
            'checkin'      => $today->copy()->addDays(5),
            'checkout'     => $today->copy()->addDays(10),
            'nights'       => 5,
            'guests_count' => 1,
            'status'       => 'confirmada',
            'channel'      => 'Airbnb',
            'paid'         => true,
            'total'        => 5 * 480,
            'tax'          => (5 * 480) * 0.05,
            'note'         => 'Internacional. Idioma preferencial: inglês.',
        ]);

        $res13 = Reservation::create([
            'ref'          => 'RES-3321',
            'guest_id'     => $fernanda->id,
            'room_id'      => $r201->id,
            'checkin'      => $today->copy()->addDays(7),
            'checkout'     => $today->copy()->addDays(9),
            'nights'       => 2,
            'guests_count' => 1,
            'status'       => 'confirmada',
            'channel'      => 'Booking.com',
            'paid'         => false,
            'total'        => 2 * 250,
            'tax'          => (2 * 250) * 0.05,
            'note'         => '',
        ]);

        $res14 = Reservation::create([
            'ref'          => 'RES-7710',
            'guest_id'     => $amanda->id,
            'room_id'      => $r502->id,
            'checkin'      => $today->copy()->addDays(10),
            'checkout'     => $today->copy()->addDays(14),
            'nights'       => 4,
            'guests_count' => 2,
            'status'       => 'pendente',
            'channel'      => 'Recepção',
            'paid'         => false,
            'total'        => 4 * 480,
            'tax'          => (4 * 480) * 0.05,
            'note'         => 'Aguardando confirmação de pagamento.',
        ]);

        // CANCELADA / NO-SHOW ─────────────────────────────────────────────────
        Reservation::create([
            'ref'          => 'RES-5599',
            'guest_id'     => $carlos->id,
            'room_id'      => $r103->id,
            'checkin'      => $today->copy()->subDays(10),
            'checkout'     => $today->copy()->subDays(8),
            'nights'       => 2,
            'guests_count' => 1,
            'status'       => 'cancelada',
            'channel'      => 'Booking.com',
            'paid'         => false,
            'total'        => 2 * 180,
            'tax'          => (2 * 180) * 0.05,
            'note'         => 'Cancelado por motivo pessoal.',
        ]);

        Reservation::create([
            'ref'          => 'RES-4412',
            'guest_id'     => $diego->id,
            'room_id'      => $r203->id,
            'checkin'      => $today->copy()->subDays(7),
            'checkout'     => $today->copy()->subDays(5),
            'nights'       => 2,
            'guests_count' => 2,
            'status'       => 'no-show',
            'channel'      => 'Expedia',
            'paid'         => false,
            'total'        => 2 * 250,
            'tax'          => (2 * 250) * 0.05,
            'note'         => 'Não compareceu. Contactado sem resposta.',
        ]);

        // HISTÓRICAS (concluídas no passado) ──────────────────────────────────
        Reservation::create([
            'ref'            => 'RES-0099',
            'guest_id'       => $eduardo->id,
            'room_id'        => $r201->id,
            'checkin'        => $today->copy()->subDays(15),
            'checkout'       => $today->copy()->subDays(12),
            'checked_in_at'  => $today->copy()->subDays(15)->setHour(14)->setMinute(0),
            'nights'         => 3,
            'guests_count'   => 2,
            'status'         => 'realizada',
            'channel'        => 'Website',
            'paid'           => true,
            'payment_method' => 'pix',
            'total'          => 3 * 250,
            'tax'            => (3 * 250) * 0.05,
            'note'           => 'Estadia prévia — hóspede recorrente.',
        ]);

        Reservation::create([
            'ref'            => 'RES-0187',
            'guest_id'       => $marcelo->id,
            'room_id'        => $r103->id,
            'checkin'        => $today->copy()->subDays(20),
            'checkout'       => $today->copy()->subDays(18),
            'checked_in_at'  => $today->copy()->subDays(20)->setHour(13)->setMinute(0),
            'nights'         => 2,
            'guests_count'   => 1,
            'status'         => 'realizada',
            'channel'        => 'Recepção',
            'paid'           => true,
            'payment_method' => 'cash',
            'total'          => 2 * 180,
            'tax'            => (2 * 180) * 0.05,
            'note'           => '',
        ]);

        Reservation::create([
            'ref'            => 'RES-0043',
            'guest_id'       => $sofia->id,
            'room_id'        => $r302->id,
            'checkin'        => $today->copy()->subDays(30),
            'checkout'       => $today->copy()->subDays(26),
            'checked_in_at'  => $today->copy()->subDays(30)->setHour(15)->setMinute(0),
            'nights'         => 4,
            'guests_count'   => 2,
            'status'         => 'realizada',
            'channel'        => 'Website',
            'paid'           => true,
            'payment_method' => 'card',
            'total'          => 4 * 250,
            'tax'            => (4 * 250) * 0.05,
            'note'           => 'Estadia anterior.',
        ]);

        // ── 5. STAY ITEMS ─────────────────────────────────────────────────────

        // RES-2039 — Eduardo, Suíte 501 (checkout hoje, pendente pagamento)
        StayItem::create(['reservation_id' => $res1->id, 'name' => 'Diárias (Suíte 501)',         'unit_price' => 480.00, 'qty' => 3, 'unit_label' => 'noites',  'icon' => 'Hotel',    'locked' => true,  'custom' => false]);
        StayItem::create(['reservation_id' => $res1->id, 'name' => 'Frigobar – Água com Gás',     'unit_price' =>   8.50, 'qty' => 6, 'unit_label' => 'und',     'icon' => 'Sparkles', 'locked' => false, 'custom' => true]);
        StayItem::create(['reservation_id' => $res1->id, 'name' => 'Jantar no Quarto',            'unit_price' =>  85.00, 'qty' => 2, 'unit_label' => 'porção',  'icon' => 'Star',     'locked' => false, 'custom' => true]);
        StayItem::create(['reservation_id' => $res1->id, 'name' => 'Spa – Massagem Relaxante',    'unit_price' => 120.00, 'qty' => 1, 'unit_label' => 'sessão',  'icon' => 'Sparkles', 'locked' => false, 'custom' => true]);
        StayItem::create(['reservation_id' => $res1->id, 'name' => 'Lavanderia',                  'unit_price' =>  45.00, 'qty' => 1, 'unit_label' => 'kg',      'icon' => 'Sparkles', 'locked' => false, 'custom' => true]);

        // RES-4091 — Larissa, Duplo 201 (checkout hoje, pago via pix)
        StayItem::create(['reservation_id' => $res2->id, 'name' => 'Diárias (Duplo 201)',         'unit_price' => 250.00, 'qty' => 2, 'unit_label' => 'noites',  'icon' => 'Hotel',    'locked' => true,  'custom' => false]);
        StayItem::create(['reservation_id' => $res2->id, 'name' => 'Café da Manhã no Quarto',     'unit_price' =>  35.00, 'qty' => 2, 'unit_label' => 'und',     'icon' => 'Star',     'locked' => false, 'custom' => true]);

        // RES-7823 — Carlos, Single 102 (checkout hoje, pago cartão)
        StayItem::create(['reservation_id' => $res3->id, 'name' => 'Diárias (Single 102)',        'unit_price' => 180.00, 'qty' => 1, 'unit_label' => 'noites',  'icon' => 'Hotel',    'locked' => true,  'custom' => false]);
        StayItem::create(['reservation_id' => $res3->id, 'name' => 'Frigobar – Refrigerante',     'unit_price' =>  12.00, 'qty' => 2, 'unit_label' => 'und',     'icon' => 'Sparkles', 'locked' => false, 'custom' => true]);

        // RES-1122 — Fernanda, Single 103 (hospedada)
        StayItem::create(['reservation_id' => $res7->id, 'name' => 'Diárias (Single 103)',        'unit_price' => 180.00, 'qty' => 3, 'unit_label' => 'noites',  'icon' => 'Hotel',    'locked' => true,  'custom' => false]);

        // RES-6677 — Bruno, Duplo 202 (hospedado)
        StayItem::create(['reservation_id' => $res8->id, 'name' => 'Diárias (Duplo 202)',         'unit_price' => 250.00, 'qty' => 5, 'unit_label' => 'noites',  'icon' => 'Hotel',    'locked' => true,  'custom' => false]);
        StayItem::create(['reservation_id' => $res8->id, 'name' => 'Lavanderia',                  'unit_price' =>  45.00, 'qty' => 1, 'unit_label' => 'kg',      'icon' => 'Sparkles', 'locked' => false, 'custom' => true]);

        // RES-9910 — Sofia, Duplo 203 (hospedada, pago)
        StayItem::create(['reservation_id' => $res9->id, 'name' => 'Diárias (Duplo 203)',         'unit_price' => 250.00, 'qty' => 5, 'unit_label' => 'noites',  'icon' => 'Hotel',    'locked' => true,  'custom' => false]);
        StayItem::create(['reservation_id' => $res9->id, 'name' => 'Berço extra',                 'unit_price' =>  50.00, 'qty' => 1, 'unit_label' => 'estadia', 'icon' => 'Star',     'locked' => false, 'custom' => true]);

        // RES-2211 — Diego, Duplo 302 (hospedado)
        StayItem::create(['reservation_id' => $res10->id, 'name' => 'Diárias (Duplo 302)',        'unit_price' => 250.00, 'qty' => 6, 'unit_label' => 'noites',  'icon' => 'Hotel',    'locked' => true,  'custom' => false]);
        StayItem::create(['reservation_id' => $res10->id, 'name' => 'Serviço de Quarto',          'unit_price' =>  65.00, 'qty' => 1, 'unit_label' => 'pedido',  'icon' => 'Star',     'locked' => false, 'custom' => true]);

        // RES-4455 — Marcelo, Suíte 503 (hospedado, aniversário)
        StayItem::create(['reservation_id' => $res11->id, 'name' => 'Diárias (Suíte 503)',        'unit_price' => 480.00, 'qty' => 8, 'unit_label' => 'noites',  'icon' => 'Hotel',    'locked' => true,  'custom' => false]);
        StayItem::create(['reservation_id' => $res11->id, 'name' => 'Champanhe – Boas-Vindas',    'unit_price' =>  95.00, 'qty' => 1, 'unit_label' => 'garrafa', 'icon' => 'Star',     'locked' => false, 'custom' => true]);
        StayItem::create(['reservation_id' => $res11->id, 'name' => 'Serviço de Quarto',          'unit_price' => 120.00, 'qty' => 2, 'unit_label' => 'pedido',  'icon' => 'Star',     'locked' => false, 'custom' => true]);
        StayItem::create(['reservation_id' => $res11->id, 'name' => 'Lavanderia',                 'unit_price' =>  45.00, 'qty' => 2, 'unit_label' => 'kg',      'icon' => 'Sparkles', 'locked' => false, 'custom' => true]);
        StayItem::create(['reservation_id' => $res11->id, 'name' => 'Frigobar – Vinho Tinto',     'unit_price' =>  78.00, 'qty' => 1, 'unit_label' => 'garrafa', 'icon' => 'Sparkles', 'locked' => false, 'custom' => true]);

        // ── 6. CLEANING TASKS ─────────────────────────────────────────────────
        $listCompleta = [
            ['id' => 'bed',    'label' => 'Cama feita',            'done' => false],
            ['id' => 'bath',   'label' => 'Banheiro higienizado',   'done' => false],
            ['id' => 'towel',  'label' => 'Toalhas trocadas',       'done' => false],
            ['id' => 'floor',  'label' => 'Piso varrido e lavado',  'done' => false],
            ['id' => 'trash',  'label' => 'Lixeiras esvaziadas',    'done' => false],
            ['id' => 'window', 'label' => 'Janelas limpas',         'done' => false],
        ];

        $listRapida = [
            ['id' => 'trash', 'label' => 'Lixeiras esvaziadas', 'done' => false],
            ['id' => 'towel', 'label' => 'Toalhas trocadas',    'done' => false],
            ['id' => 'bed',   'label' => 'Cama arrumada',       'done' => false],
        ];

        // 501 — pós checkout VIP hoje, pendente
        CleaningTask::create([
            'room_id'           => $r501->id,
            'assignee_id'       => $joao->id,
            'verifier_id'       => $mariana->id,
            'status'            => 'pendente',
            'type'              => 'completa',
            'priority'          => 'alta',
            'estimated_minutes' => 60,
            'deadline'          => $today->copy()->setHour(15)->setMinute(0),
            'note'              => 'Pós checkout VIP. Próxima reserva em 5 dias.',
            'checklist'         => $listCompleta,
        ]);

        // 201 — pós checkout hoje, em andamento — nova hóspede VIP chegando às 13h
        CleaningTask::create([
            'room_id'           => $r201->id,
            'assignee_id'       => $camila->id,
            'verifier_id'       => $mariana->id,
            'status'            => 'andamento',
            'type'              => 'completa',
            'priority'          => 'alta',
            'estimated_minutes' => 45,
            'started_at'        => $today->copy()->setHour(10)->setMinute(15),
            'deadline'          => $today->copy()->setHour(12)->setMinute(0),
            'note'              => 'Nova hóspede VIP prevista para check-in às 13h.',
            'checklist'         => [
                ['id' => 'bed',    'label' => 'Cama feita',            'done' => true],
                ['id' => 'bath',   'label' => 'Banheiro higienizado',   'done' => true],
                ['id' => 'towel',  'label' => 'Toalhas trocadas',       'done' => false],
                ['id' => 'floor',  'label' => 'Piso varrido e lavado',  'done' => false],
                ['id' => 'trash',  'label' => 'Lixeiras esvaziadas',    'done' => true],
                ['id' => 'window', 'label' => 'Janelas limpas',         'done' => false],
            ],
        ]);

        // 102 — pós checkout hoje, pendente
        CleaningTask::create([
            'room_id'           => $r102->id,
            'assignee_id'       => $anaPaula->id,
            'status'            => 'pendente',
            'type'              => 'rapida',
            'priority'          => 'normal',
            'estimated_minutes' => 20,
            'deadline'          => $today->copy()->setHour(14)->setMinute(0),
            'note'              => '',
            'checklist'         => $listRapida,
        ]);

        // 104 — manutenção ar-condicionado, em andamento
        CleaningTask::create([
            'room_id'           => $r104->id,
            'assignee_id'       => $pedro->id,
            'status'            => 'andamento',
            'type'              => 'manutencao',
            'priority'          => 'alta',
            'estimated_minutes' => 90,
            'started_at'        => $today->copy()->setHour(8)->setMinute(0),
            'deadline'          => $today->copy()->setHour(12)->setMinute(0),
            'note'              => 'Substituição do compressor do ar-condicionado.',
            'checklist'         => [
                ['id' => 'diag',  'label' => 'Diagnóstico realizado',    'done' => true],
                ['id' => 'parts', 'label' => 'Peças substituídas',       'done' => true],
                ['id' => 'test',  'label' => 'Teste de funcionamento',   'done' => false],
                ['id' => 'clean', 'label' => 'Limpeza pós-manutenção',   'done' => false],
            ],
        ]);

        // 202 — hóspede solicitou reposição de toalhas
        CleaningTask::create([
            'room_id'           => $r202->id,
            'assignee_id'       => $joao->id,
            'status'            => 'pendente',
            'type'              => 'rapida',
            'priority'          => 'normal',
            'estimated_minutes' => 15,
            'deadline'          => $today->copy()->setHour(16)->setMinute(0),
            'note'              => 'Hóspede solicitou reposição de toalhas.',
            'checklist'         => $listRapida,
        ]);

        // 302 — limpeza rápida concluída hoje de manhã
        CleaningTask::create([
            'room_id'           => $r302->id,
            'assignee_id'       => $camila->id,
            'status'            => 'concluida',
            'type'              => 'rapida',
            'priority'          => 'baixa',
            'estimated_minutes' => 15,
            'real_minutes'      => 12,
            'started_at'        => $today->copy()->setHour(9)->setMinute(0),
            'deadline'          => $today->copy()->setHour(11)->setMinute(0),
            'note'              => '',
            'checklist'         => [
                ['id' => 'trash', 'label' => 'Lixeiras esvaziadas', 'done' => true],
                ['id' => 'towel', 'label' => 'Toalhas trocadas',    'done' => true],
                ['id' => 'bed',   'label' => 'Cama arrumada',       'done' => true],
            ],
        ]);

        // 101 — pré-checkin verificado
        CleaningTask::create([
            'room_id'           => $r101->id,
            'assignee_id'       => $anaPaula->id,
            'verifier_id'       => $lucas->id,
            'status'            => 'verificada',
            'type'              => 'rapida',
            'priority'          => 'normal',
            'estimated_minutes' => 20,
            'real_minutes'      => 18,
            'started_at'        => $today->copy()->setHour(8)->setMinute(30),
            'deadline'          => $today->copy()->setHour(10)->setMinute(0),
            'verified_at'       => $today->copy()->setHour(10)->setMinute(30),
            'note'              => 'Pré-checkin verificado.',
            'checklist'         => [
                ['id' => 'trash', 'label' => 'Lixeiras esvaziadas', 'done' => true],
                ['id' => 'towel', 'label' => 'Toalhas trocadas',    'done' => true],
                ['id' => 'bed',   'label' => 'Cama arrumada',       'done' => true],
            ],
        ]);

        // 503 — especial verificada (aniversário Marcelo, feita há 3 dias)
        CleaningTask::create([
            'room_id'           => $r503->id,
            'assignee_id'       => $joao->id,
            'verifier_id'       => $mariana->id,
            'status'            => 'verificada',
            'type'              => 'especial',
            'priority'          => 'alta',
            'estimated_minutes' => 75,
            'real_minutes'      => 70,
            'started_at'        => $today->copy()->subDays(3)->setHour(10)->setMinute(0),
            'deadline'          => $today->copy()->subDays(3)->setHour(12)->setMinute(0),
            'verified_at'       => $today->copy()->subDays(3)->setHour(13)->setMinute(0),
            'note'              => 'Decoração especial para aniversário de casamento. Champanhe e flores dispostos.',
            'checklist'         => [
                ['id' => 'bed',       'label' => 'Cama com lençóis especiais', 'done' => true],
                ['id' => 'bath',      'label' => 'Banheiro higienizado',        'done' => true],
                ['id' => 'towel',     'label' => 'Toalhas premium dispostas',   'done' => true],
                ['id' => 'floor',     'label' => 'Piso varrido e lavado',       'done' => true],
                ['id' => 'deco',      'label' => 'Decoração especial montada',  'done' => true],
                ['id' => 'champagne', 'label' => 'Champanhe no frigobar',       'done' => true],
            ],
        ]);

        $this->command->info('Seed completo: 8 usuários · 12 hóspedes · 12 quartos · 18 reservas · stay items · 8 cleaning tasks');
    }
}
