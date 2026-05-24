<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Guest;
use App\Models\Room;
use App\Models\Reservation;
use App\Models\StayItem;
use App\Models\CleaningTask;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
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

        $this->command->info('Limpando dados antigos e iniciando seed com dados simulados realistas...');

        // 1. Equipe / Users
        $users = [
            ['name' => 'Admin', 'email' => 'admin@hotel.com', 'role' => 'gerente', 'avatar_color' => 'blue', 'schedule' => ['mat', 'mat', 'mat', 'mat', 'mat', 'off', 'off'], 'pwd' => 'senha123'],
            ['name' => 'Mariana Reis', 'email' => 'mariana@maranzul.com.br', 'role' => 'gerente', 'avatar_color' => 'purple', 'schedule' => ['mat', 'mat', 'mat', 'mat', 'mat', 'off', 'off'], 'pwd' => 'senha123'],
            ['name' => 'João da Silva', 'email' => 'joao.silva@maranzul.com.br', 'role' => 'housekeeping', 'avatar_color' => 'green', 'schedule' => ['mat', 'mat', 'mat', 'mat', 'mat', 'mat', 'off'], 'pwd' => 'senha123'],
            ['name' => 'Camila Souza', 'email' => 'camila@maranzul.com.br', 'role' => 'housekeeping', 'avatar_color' => 'blue', 'schedule' => ['vesp', 'vesp', 'vesp', 'vesp', 'vesp', 'off', 'off'], 'pwd' => 'senha123'],
            ['name' => 'Pedro Henrique', 'email' => 'pedro@maranzul.com.br', 'role' => 'manutencao', 'avatar_color' => 'orange', 'schedule' => ['mat', 'mat', 'mat', 'off', 'off', 'mat', 'mat'], 'pwd' => 'senha123'],
            ['name' => 'Beatriz Castro', 'email' => 'beatriz@maranzul.com.br', 'role' => 'recepcao', 'avatar_color' => 'red', 'schedule' => ['noite', 'noite', 'noite', 'noite', 'noite', 'off', 'off'], 'pwd' => 'senha123'],
        ];

        foreach ($users as $u) {
            User::create([
                'email' => $u['email'],
                'name' => $u['name'],
                'password' => Hash::make($u['pwd']),
                'role' => $u['role'],
                'avatar_color' => $u['avatar_color'],
                'schedule' => $u['schedule'],
                'admission_date' => Carbon::now()->subMonths(rand(2, 24)),
                'salary' => 2500.00,
                'team_status' => 'ativo',
            ]);
        }

        $adminId = User::where('email', 'admin@hotel.com')->first()->id;
        $marianaId = User::where('email', 'mariana@maranzul.com.br')->first()->id;
        $joaoId = User::where('email', 'joao.silva@maranzul.com.br')->first()->id;

        // 2. Hóspedes (Guests)
        $guests = [
            ['name' => 'Eduardo Antunes', 'email' => 'eduardo@antunes.co', 'phone' => '+55 11 98112-9988', 'cpf' => '775.331.004-12', 'tag' => 'VIP', 'avatar_color' => 'green'],
            ['name' => 'Larissa Mendonça', 'email' => 'lari.mend@hotmail.com', 'phone' => '+55 41 99655-3322', 'cpf' => '551.224.788-90', 'tag' => 'Novo', 'avatar_color' => 'blue'],
            ['name' => 'Carlos Mendes', 'email' => 'carlos.mendes@gmail.com', 'phone' => '+55 21 99888-7766', 'cpf' => '123.456.789-00', 'tag' => null, 'avatar_color' => 'orange'],
            ['name' => 'Amanda Costa Silva', 'email' => 'a.costa.silva@live.com', 'phone' => '+55 31 99111-2233', 'cpf' => '888.777.666-55', 'tag' => 'VIP', 'avatar_color' => 'purple'],
        ];

        foreach ($guests as $g) {
            Guest::create($g);
        }

        // 3. Quartos (Rooms)
        $roomsData = [
            ['type' => 'Single', 'price' => 180, 'nums' => ['101', '102', '103', '104']],
            ['type' => 'Duplo', 'price' => 250, 'nums' => ['201', '202', '203', '301', '302']],
            ['type' => 'Suíte', 'price' => 480, 'nums' => ['501', '502', '503']],
        ];

        foreach ($roomsData as $rd) {
            foreach ($rd['nums'] as $num) {
                Room::create([
                    'number' => $num,
                    'type' => $rd['type'],
                    'floor' => (int) substr($num, 0, 1),
                    'price_per_night' => $rd['price'],
                    'status' => 'available'
                ]);
            }
        }

        // 4. Reservas
        $guest1 = Guest::where('email', 'eduardo@antunes.co')->first();
        $guest2 = Guest::where('email', 'lari.mend@hotmail.com')->first();
        $guest3 = Guest::where('email', 'a.costa.silva@live.com')->first();
        
        $room1 = Room::where('number', '501')->first();
        $room2 = Room::where('number', '201')->first();
        $room3 = Room::where('number', '502')->first();

        $room1->update(['status' => 'occupied']);
        $room2->update(['status' => 'reserved']);
        $room3->update(['status' => 'cleaning']);

        $res1 = Reservation::create([
            'ref' => 'RES-2039',
            'guest_id' => $guest1->id,
            'room_id' => $room1->id,
            'checkin' => Carbon::today()->subDays(2),
            'checkout' => Carbon::today()->addDays(3),
            'nights' => 5,
            'guests_count' => 2,
            'status' => 'realizada', 
            'channel' => 'Website',
            'paid' => false,
            'total' => 5 * 480,
            'tax' => (5 * 480) * 0.05,
            'note' => 'Hóspede VIP frequente. Solicita travesseiros extras e vista para o mar.',
        ]);

        $res2 = Reservation::create([
            'ref' => 'RES-4091',
            'guest_id' => $guest2->id,
            'room_id' => $room2->id,
            'checkin' => Carbon::today()->addDays(1),
            'checkout' => Carbon::today()->addDays(4),
            'nights' => 3,
            'guests_count' => 1,
            'status' => 'confirmada',
            'channel' => 'Booking.com',
            'paid' => true,
            'total' => 3 * 250,
            'tax' => (3 * 250) * 0.05,
            'note' => 'Primeira estadia',
        ]);
        
        $res3 = Reservation::create([
            'ref' => 'RES-9932',
            'guest_id' => $guest3->id,
            'room_id' => $room3->id,
            'checkin' => Carbon::today()->subDays(5),
            'checkout' => Carbon::today(),
            'nights' => 5,
            'guests_count' => 3,
            'status' => 'confirmada', // Doing checkout today
            'channel' => 'Recepção',
            'paid' => true,
            'total' => 5 * 480,
            'tax' => (5 * 480) * 0.05,
            'note' => 'Checkout programado para antes das 11h.',
        ]);

        // 5. Stay Items
        StayItem::create([
            'reservation_id' => $res1->id,
            'name' => 'Diárias Estadia (Suíte)',
            'unit_price' => 480.00,
            'qty' => 5,
            'unit_label' => 'noites',
            'icon' => 'Hotel',
            'locked' => true,
            'custom' => false,
        ]);

        StayItem::create([
            'reservation_id' => $res1->id,
            'name' => 'Frigobar - Água com Gás',
            'unit_price' => 8.50,
            'qty' => 2,
            'unit_label' => 'und',
            'icon' => 'Sparkles',
            'locked' => false,
            'custom' => true,
        ]);

        StayItem::create([
            'reservation_id' => $res1->id,
            'name' => 'M&Ms - Serviço de Quarto',
            'unit_price' => 12.00,
            'qty' => 1,
            'unit_label' => 'und',
            'icon' => 'Star',
            'locked' => false,
            'custom' => true,
        ]);

        StayItem::create([
            'reservation_id' => $res3->id,
            'name' => 'Diárias Estadia',
            'unit_price' => 480.00,
            'qty' => 5,
            'unit_label' => 'noites',
            'icon' => 'Hotel',
            'locked' => true,
            'custom' => false,
        ]);

        // 6. Limpeza (Cleaning Tasks)
        $checklistCompleta = [
            ['id' => 'bed', 'label' => 'Cama feita', 'done' => false],
            ['id' => 'bath', 'label' => 'Banheiro higienizado', 'done' => false],
            ['id' => 'towel', 'label' => 'Toalhas trocadas', 'done' => false],
            ['id' => 'floor', 'label' => 'Piso varrido e lavado', 'done' => false],
        ];

        CleaningTask::create([
            'room_id' => Room::where('number', '101')->first()->id,
            'assignee_id' => $joaoId,
            'verifier_id' => $marianaId,
            'status' => 'pendente',
            'type' => 'completa',
            'priority' => 'alta',
            'estimated_minutes' => 45,
            'deadline' => Carbon::today()->addHours(14),
            'note' => 'Hóspede chegará cedo. Prioridade.',
            'checklist' => $checklistCompleta,
        ]);
        
        CleaningTask::create([
            'room_id' => Room::where('number', '102')->first()->id,
            'assignee_id' => null,
            'status' => 'pendente',
            'type' => 'rapida',
            'priority' => 'normal',
            'estimated_minutes' => 15,
            'deadline' => Carbon::today()->addHours(16),
            'note' => '',
            'checklist' => [
                ['id' => 'trash', 'label' => 'Limpeza lixeiras', 'done' => false],
                ['id' => 'towel', 'label' => 'Toalhas trocadas', 'done' => false]
            ],
        ]);
        
        CleaningTask::create([
            'room_id' => $room3->id, // Quarto 502, checkout today
            'assignee_id' => $joaoId,
            'status' => 'andamento',
            'type' => 'completa',
            'priority' => 'alta',
            'estimated_minutes' => 50,
            'started_at' => Carbon::now()->subMinutes(12),
            'deadline' => Carbon::today()->addHours(15),
            'note' => 'Limpeza pós check-out',
            'checklist' => [
                ['id' => 'bed', 'label' => 'Cama feita', 'done' => true],
                ['id' => 'bath', 'label' => 'Banheiro higienizado', 'done' => false],
                ['id' => 'towel', 'label' => 'Toalhas trocadas', 'done' => true],
                ['id' => 'floor', 'label' => 'Piso varrido e lavado', 'done' => false],
                ['id' => 'minibar', 'label' => 'Validar Itens Consumidos (Frigobar)', 'done' => false],
            ],
        ]);

        $this->command->info('Dados Seed criados com sucesso!');
    }
}
