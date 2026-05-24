<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CleaningTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_id',
        'assignee_id',
        'verifier_id',
        'status',
        'type',
        'priority',
        'estimated_minutes',
        'real_minutes',
        'started_at',
        'deadline',
        'note',
        'checklist',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'estimated_minutes' => 'integer',
            'real_minutes' => 'integer',
            'started_at' => 'datetime',
            'deadline' => 'datetime',
            'verified_at' => 'datetime',
            'checklist' => 'json',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verifier_id');
    }
}
