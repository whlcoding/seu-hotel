<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StayItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'name',
        'unit_price',
        'qty',
        'unit_label',
        'icon',
        'locked',
        'custom',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'qty' => 'integer',
            'locked' => 'boolean',
            'custom' => 'boolean',
        ];
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }
}
