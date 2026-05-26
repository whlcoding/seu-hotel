<?php

use App\Http\Controllers\Auth\LoginController;
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
Route::middleware('auth')->group(function () {
    Route::get('/', fn() => Inertia::render('Dashboard/Index'))->name('dashboard');

    Route::get('/reservas/available-rooms', [ReservationController::class, 'availableRooms'])->name('reservas.available-rooms');
    Route::resource('reservas', ReservationController::class);

    Route::get('/checkout', fn() => Inertia::render('Checkout/Index'))->name('checkout');
    Route::get('/equipe', fn() => Inertia::render('Equipe/Index'))->name('equipe');
    Route::get('/limpeza', fn() => Inertia::render('Limpeza/Index'))->name('limpeza');
    Route::get('/relatorios', fn() => Inertia::render('Relatorios/Index'))->name('relatorios');
});
