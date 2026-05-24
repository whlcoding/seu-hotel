<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'number',
        'type',
        'floor',
        'price_per_night',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price_per_night' => 'decimal:2',
            'floor' => 'integer',
        ];
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function cleaningTasks(): HasMany
    {
        return $this->hasMany(CleaningTask::class);
    }
}
