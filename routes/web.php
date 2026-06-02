<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CheckinController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Auth
Route::get('/login', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store']);
Route::post('/logout', [LoginController::class, 'destroy'])->name('logout')->middleware('auth');

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::middleware('auth')->group(function () {

    Route::get('/reservas/available-rooms', [ReservationController::class, 'availableRooms'])->name('reservas.available-rooms');
    Route::resource('reservas', ReservationController::class);

    Route::get('/checkin', [CheckinController::class, 'index'])->name('checkin');
    Route::post('/checkin/confirm', [CheckinController::class, 'store'])->name('checkin.confirm');

    Route::get('/chatbot', fn() => Inertia::render('Chatbot/Index'))->name('chatbot');

    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout/finalize', [CheckoutController::class, 'finalize'])->name('checkout.finalize');
    Route::post('/chatbot/ask', [ChatbotController::class, 'ask'])->name('chatbot.ask');
    Route::prefix('equipe')->name('equipe.')->group(function () {
        Route::get('/', [TeamController::class, 'index'])->name('index');
        Route::post('/', [TeamController::class, 'store'])->name('store');
        Route::put('/{user}', [TeamController::class, 'update'])->name('update');
        Route::delete('/{user}', [TeamController::class, 'destroy'])->name('destroy');
        Route::patch('/{user}/status', [TeamController::class, 'updateStatus'])->name('status');
        Route::patch('/{user}/schedule', [TeamController::class, 'updateSchedule'])->name('schedule');
    });
    Route::get('/limpeza', fn() => Inertia::render('Limpeza/Index'))->name('limpeza');
    Route::get('/relatorios', fn() => Inertia::render('Relatorios/Index'))->name('relatorios');
});
