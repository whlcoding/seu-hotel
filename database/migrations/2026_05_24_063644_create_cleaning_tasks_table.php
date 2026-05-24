<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cleaning_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete();
            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('verifier_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['pendente', 'andamento', 'concluida', 'verificada'])->default('pendente');
            $table->enum('type', ['completa', 'rapida', 'manutencao', 'especial']);
            $table->enum('priority', ['alta', 'normal', 'baixa'])->default('normal');
            $table->unsignedSmallInteger('estimated_minutes');
            $table->unsignedSmallInteger('real_minutes')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('deadline');
            $table->text('note')->nullable();
            $table->json('checklist');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cleaning_tasks');
    }
};
