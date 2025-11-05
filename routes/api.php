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

// Courses CRUD API (explicit routes)
Route::get('courses', [App\Http\Controllers\CourseController::class, 'index']); // List all
Route::post('courses', [App\Http\Controllers\CourseController::class, 'store']); // Create
Route::get('courses/{id}', [App\Http\Controllers\CourseController::class, 'show']); // Read
Route::put('courses/{id}', [App\Http\Controllers\CourseController::class, 'update']); // Update
Route::patch('courses/{id}', [App\Http\Controllers\CourseController::class, 'update']); // Partial update
Route::delete('courses/{id}', [App\Http\Controllers\CourseController::class, 'destroy']); // Delete

// Departments CRUD API (explicit routes)
Route::get('departments', [App\Http\Controllers\DepartmentController::class, 'index']); // List all
Route::post('departments', [App\Http\Controllers\DepartmentController::class, 'store']); // Create
Route::get('departments/{id}', [App\Http\Controllers\DepartmentController::class, 'show']); // Read
Route::put('departments/{id}', [App\Http\Controllers\DepartmentController::class, 'update']); // Update
Route::patch('departments/{id}', [App\Http\Controllers\DepartmentController::class, 'update']); // Partial update
Route::delete('departments/{id}', [App\Http\Controllers\DepartmentController::class, 'destroy']); // Delete

// Students CRUD API (explicit routes)
Route::get('students', [App\Http\Controllers\StudentController::class, 'index']); // List all
Route::post('students', [App\Http\Controllers\StudentController::class, 'store']); // Create
Route::get('students/{id}', [App\Http\Controllers\StudentController::class, 'show']); // Read
Route::put('students/{id}', [App\Http\Controllers\StudentController::class, 'update']); // Update
Route::patch('students/{id}', [App\Http\Controllers\StudentController::class, 'update']); // Partial update
Route::delete('students/{id}', [App\Http\Controllers\StudentController::class, 'destroy']); // Delete
