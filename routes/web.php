<?php

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

// App
Route::get('/', fn() => Inertia::render('Dashboard/Index'))->name('dashboard');
Route::middleware('auth')->group(function () {

    Route::get('/reservas/available-rooms', [ReservationController::class, 'availableRooms'])->name('reservas.available-rooms');
    Route::resource('reservas', ReservationController::class);

    Route::get('/chatbot', fn() => Inertia::render('Chatbot/Index'))->name('chatbot');

    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout/finalize', [CheckoutController::class, 'finalize'])->name('checkout.finalize');
    Route::get('/chatbot', fn() => Inertia::render('Chatbot/Index'))->name('chatbot');
    Route::post('/chatbot/ask', [ChatbotController::class, 'ask'])->name('chatbot.ask');
    Route::get('/equipe', fn() => Inertia::render('Equipe/Index'))->name('equipe');
    Route::get('/limpeza', fn() => Inertia::render('Limpeza/Index'))->name('limpeza');
    Route::get('/relatorios', fn() => Inertia::render('Relatorios/Index'))->name('relatorios');
});
