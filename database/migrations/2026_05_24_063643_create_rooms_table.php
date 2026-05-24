<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->enum('type', ['Single', 'Duplo', 'Suíte']);
            $table->unsignedTinyInteger('floor');
            $table->decimal('price_per_night', 10, 2);
            $table->enum('status', ['available', 'occupied', 'cleaning', 'maintenance', 'reserved'])->default('available');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
