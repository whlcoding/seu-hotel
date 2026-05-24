<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('cpf')->nullable();
            $table->text('address')->nullable();
            $table->date('dob')->nullable();
            $table->enum('avatar_color', ['blue', 'green', 'orange', 'purple', 'red'])->default('blue');
            $table->enum('tag', ['VIP', 'Novo'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guests');
    }
};
