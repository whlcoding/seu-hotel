<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('ref')->unique();
            $table->foreignId('guest_id')->constrained('guests')->restrictOnDelete();
            $table->foreignId('room_id')->constrained('rooms')->restrictOnDelete();
            $table->date('checkin');
            $table->date('checkout');
            $table->unsignedSmallInteger('nights');
            $table->unsignedTinyInteger('guests_count');
            $table->enum('status', ['confirmada', 'pendente', 'cancelada', 'realizada', 'no-show'])->default('pendente');
            $table->string('channel');
            $table->boolean('paid')->default(false);
            $table->decimal('total', 10, 2);
            $table->decimal('tax', 10, 2);
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
