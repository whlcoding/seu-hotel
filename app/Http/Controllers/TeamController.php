<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    private const ROLE_COLORS = [
        'recepcao'     => 'blue',
        'housekeeping' => 'green',
        'gerente'      => 'purple',
        'manutencao'   => 'orange',
        'cozinha'      => 'red',
    ];

    public function index(): Response
    {
        $team = User::whereNotNull('role')
            ->orderBy('name')
            ->get()
            ->map(fn (User $u) => $this->toMember($u));

        return Inertia::render('Equipe/Index', ['team' => $team]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->memberRules());

        User::create([
            'name'           => $data['name'],
            'email'          => $data['email'],
            'password'       => Hash::make(Str::random(16)),
            'phone'          => $data['phone'],
            'cpf'            => $data['cpf'],
            'role'           => $data['role'],
            'team_status'    => $data['status'],
            'admission_date' => $data['admission'],
            'shifts'         => $data['shifts'],
            'salary'         => $data['salary'] ?? null,
            'avatar_color'   => self::ROLE_COLORS[$data['role']],
            'schedule'       => array_fill(0, 7, 'off'),
        ]);

        return redirect()->route('equipe.index');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate($this->memberRules($user->id));

        $user->update([
            'name'           => $data['name'],
            'email'          => $data['email'],
            'phone'          => $data['phone'],
            'cpf'            => $data['cpf'],
            'role'           => $data['role'],
            'team_status'    => $data['status'],
            'admission_date' => $data['admission'],
            'shifts'         => $data['shifts'],
            'salary'         => $data['salary'] ?? null,
        ]);

        return redirect()->route('equipe.index');
    }

    public function destroy(User $user): RedirectResponse
    {
        abort_if($user->id === auth()->id(), 403, 'Não é possível remover seu próprio usuário.');
        $user->delete();

        return redirect()->route('equipe.index');
    }

    public function updateStatus(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate(['status' => 'required|in:ativo,ferias,inativo']);
        $user->update(['team_status' => $data['status']]);

        return redirect()->route('equipe.index');
    }

    public function updateSchedule(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'day'   => 'required|integer|between:0,6',
            'shift' => 'required|in:mat,vesp,noite,off,ferias',
        ]);

        $schedule = array_values($user->schedule ?? array_fill(0, 7, 'off'));
        $schedule[$data['day']] = $data['shift'];
        $user->update(['schedule' => $schedule]);

        return redirect()->route('equipe.index');
    }

    private function memberRules(?int $ignoreId = null): array
    {
        $emailUnique = $ignoreId
            ? "required|email|unique:users,email,{$ignoreId}"
            : 'required|email|unique:users,email';

        return [
            'name'      => 'required|string|min:3|max:255',
            'email'     => $emailUnique,
            'phone'     => 'required|string|max:20',
            'cpf'       => 'required|string|max:14',
            'admission' => 'required|date',
            'role'      => 'required|in:recepcao,housekeeping,gerente,manutencao,cozinha',
            'status'    => 'required|in:ativo,ferias,inativo',
            'shifts'    => 'required|array|min:1',
            'shifts.*'  => 'in:mat,vesp,noite',
            'salary'    => 'nullable|numeric|min:0',
        ];
    }

    private function toMember(User $u): array
    {
        return [
            'id'          => $u->id,
            'name'        => $u->name,
            'email'       => $u->email,
            'phone'       => $u->phone ?? '',
            'cpf'         => $u->cpf ?? '',
            'role'        => $u->role,
            'status'      => $u->team_status,
            'admission'   => $u->admission_date?->format('Y-m-d') ?? '',
            'shifts'      => array_values($u->shifts ?? []),
            'salary'      => $u->salary !== null ? (float) $u->salary : null,
            'avatarColor' => $u->avatar_color ?? 'blue',
            'schedule'    => array_values($u->schedule ?? array_fill(0, 7, 'off')),
        ];
    }
}
