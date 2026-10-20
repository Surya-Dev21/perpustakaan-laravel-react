<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BukuController;
use App\Http\Controllers\Api\KategoriController;
use App\Http\Controllers\Api\UserController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Dashboard Stats
Route::get('/admin/dashboard', [BukuController::class, 'dashboardStats']);

// Categories
Route::get('/categories', [KategoriController::class, 'index']);
Route::post('/categories', [KategoriController::class, 'store']);
Route::put('/categories/{id}', [KategoriController::class, 'update']);
Route::delete('/categories/{id}', [KategoriController::class, 'destroy']);

// Books
Route::get('/books', [BukuController::class, 'index']);
Route::get('/books/{id}', [BukuController::class, 'show']);
Route::post('/books', [BukuController::class, 'store']);
Route::put('/books/{id}', [BukuController::class, 'update']);
Route::patch('/books/{id}/stok', [BukuController::class, 'updateStock']);
Route::delete('/books/{id}', [BukuController::class, 'destroy']);

// Users
Route::apiResource('users', UserController::class);
