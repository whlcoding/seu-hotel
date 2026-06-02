<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'phone', 'cpf', 'role', 'team_status', 'admission_date', 'salary', 'avatar_color', 'schedule', 'shifts'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'admission_date' => 'date',
            'salary' => 'decimal:2',
            'schedule' => 'json',
            'shifts'   => 'json',
        ];
    }

    public function tasksAssigned(): HasMany
    {
        return $this->hasMany(CleaningTask::class, 'assignee_id');
    }

    public function tasksVerified(): HasMany
    {
        return $this->hasMany(CleaningTask::class, 'verifier_id');
    }
}
