<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable();
            $table->string('cpf')->nullable();
            $table->enum('role', ['recepcao', 'housekeeping', 'gerente', 'manutencao', 'cozinha'])->nullable();
            $table->enum('team_status', ['ativo', 'ferias', 'inativo'])->default('ativo');
            $table->date('admission_date')->nullable();
            $table->decimal('salary', 10, 2)->nullable();
            $table->enum('avatar_color', ['blue', 'green', 'orange', 'purple', 'red'])->nullable();
            $table->json('schedule')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'cpf',
                'role',
                'team_status',
                'admission_date',
                'salary',
                'avatar_color',
                'schedule',
            ]);
        });
    }
};
