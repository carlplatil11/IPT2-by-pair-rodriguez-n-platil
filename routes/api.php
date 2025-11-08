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

// Dashboard Statistics API
Route::get('stats/totals', [App\Http\Controllers\DashboardController::class, 'stats']);
Route::get('stats/students-by-course', [App\Http\Controllers\DashboardController::class, 'studentsByCourse']);
Route::get('stats/faculty-by-department', [App\Http\Controllers\DashboardController::class, 'facultyByDepartment']);

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

// Academic Years CRUD API (explicit routes)
Route::get('academic-years', [App\Http\Controllers\AcademicYearController::class, 'index']); // List all
Route::post('academic-years', [App\Http\Controllers\AcademicYearController::class, 'store']); // Create
Route::get('academic-years/{id}', [App\Http\Controllers\AcademicYearController::class, 'show']); // Read
Route::put('academic-years/{id}', [App\Http\Controllers\AcademicYearController::class, 'update']); // Update
Route::patch('academic-years/{id}', [App\Http\Controllers\AcademicYearController::class, 'update']); // Partial update
Route::delete('academic-years/{id}', [App\Http\Controllers\AcademicYearController::class, 'destroy']); // Delete

// Admin Profile API
Route::get('admin/profile', [App\Http\Controllers\ProfileController::class, 'getProfile']); // Get profile
Route::put('admin/profile', [App\Http\Controllers\ProfileController::class, 'updateProfile']); // Update profile
Route::post('admin/credentials', [App\Http\Controllers\ProfileController::class, 'updateCredentials']); // Update credentials
Route::post('admin/login', [App\Http\Controllers\ProfileController::class, 'login']); // Login

// System Logs API (explicit routes)
Route::get('logs', [App\Http\Controllers\LogController::class, 'index']); // List all logs
Route::post('logs', [App\Http\Controllers\LogController::class, 'store']); // Create log
Route::get('logs/{id}', [App\Http\Controllers\LogController::class, 'show']); // Read single log
Route::delete('logs/{id}', [App\Http\Controllers\LogController::class, 'destroy']); // Delete single log
Route::post('logs/clear', [App\Http\Controllers\LogController::class, 'clear']); // Clear all logs

