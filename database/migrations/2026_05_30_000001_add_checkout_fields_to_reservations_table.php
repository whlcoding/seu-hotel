<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->timestamp('checked_in_at')->nullable()->after('checkout');
            $table->enum('payment_method', ['card', 'debit', 'cash', 'pix', 'check'])->nullable()->after('paid');
            $table->json('rating')->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['rating', 'payment_method', 'checked_in_at']);
        });
    }
};
