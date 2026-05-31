<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'ref',
        'guest_id',
        'room_id',
        'checkin',
        'checkout',
        'checked_in_at',
        'nights',
        'guests_count',
        'status',
        'channel',
        'paid',
        'payment_method',
        'total',
        'tax',
        'note',
        'rating',
    ];

    protected function casts(): array
    {
        return [
            'checkin'       => 'date',
            'checkout'      => 'date',
            'checked_in_at' => 'datetime',
            'paid'          => 'boolean',
            'nights'        => 'integer',
            'guests_count'  => 'integer',
            'total'         => 'decimal:2',
            'tax'           => 'decimal:2',
            'rating'        => 'array',
        ];
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(Guest::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function stayItems(): HasMany
    {
        return $this->hasMany(StayItem::class);
    }
}
