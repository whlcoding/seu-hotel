<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stay_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('unit_price', 10, 2);
            $table->unsignedSmallInteger('qty');
            $table->string('unit_label');
            $table->string('icon');
            $table->boolean('locked')->default(false);
            $table->boolean('custom')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stay_items');
    }
};
