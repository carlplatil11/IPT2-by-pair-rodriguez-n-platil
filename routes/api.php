<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Faculty CRUD API (explicit routes)
Route::get('faculties', [App\Http\Controllers\FacultyController::class, 'index']); // List all
Route::post('faculties', [App\Http\Controllers\FacultyController::class, 'store']); // Create
Route::get('faculties/{id}', [App\Http\Controllers\FacultyController::class, 'show']); // Read
Route::put('faculties/{id}', [App\Http\Controllers\FacultyController::class, 'update']); // Update
Route::patch('faculties/{id}', [App\Http\Controllers\FacultyController::class, 'update']); // Partial update
Route::delete('faculties/{id}', [App\Http\Controllers\FacultyController::class, 'destroy']); // Delete
