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


Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/books', [BukuController::class, 'index']);
Route::get('/categories', [KategoriController::class, 'index']);
Route::post('/books', [BukuController::class, 'store']);
Route::put('/books/{id}', [BukuController::class, 'update']);
Route::delete('/books/{id}', [BukuController::class, 'destroy']);
Route::apiResource('users', UserController::class);
