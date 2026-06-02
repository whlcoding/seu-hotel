<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CheckinController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ReservationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Auth
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});
Route::post('/logout', [LoginController::class, 'destroy'])->name('logout')->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/reservas/available-rooms', [ReservationController::class, 'availableRooms'])->name('reservas.available-rooms');
    Route::resource('reservas', ReservationController::class);

    Route::get('/checkin', [CheckinController::class, 'index'])->name('checkin');
    Route::post('/checkin/confirm', [CheckinController::class, 'store'])->name('checkin.confirm');

    Route::get('/chatbot', fn() => Inertia::render('Chatbot/Index'))->name('chatbot');

    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout/finalize', [CheckoutController::class, 'finalize'])->name('checkout.finalize');
    Route::post('/chatbot/ask', [ChatbotController::class, 'ask'])->name('chatbot.ask');
    Route::get('/equipe', fn() => Inertia::render('Equipe/Index'))->name('equipe');
    Route::get('/limpeza', fn() => Inertia::render('Limpeza/Index'))->name('limpeza');
    Route::get('/relatorios', fn() => Inertia::render('Relatorios/Index'))->name('relatorios');
});
