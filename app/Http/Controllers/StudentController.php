<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Student;

class StudentController extends Controller
{
    // GET /api/students
    public function index()
    {
        return Student::all();
    }

    // POST /api/students
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'course' => 'required|string',
            'email' => 'required|email|unique:students,email',
            'age' => 'nullable|integer',
            'gender' => 'required|in:Male,Female',
            'about' => 'nullable|string',
            'phone' => 'nullable|string',
            'department' => 'nullable|string',
            'year' => 'nullable|string',
        ]);

        // Handle avatar upload (optional)
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        $student = Student::create($validated);
        return response()->json($student, 201);
    }

    // GET /api/students/{id}
    public function show($id)
    {
        return Student::findOrFail($id);
    }

    // PUT/PATCH /api/students/{id}
    public function update(Request $request, $id)
    {
        $student = Student::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'course' => 'sometimes|string',
            'email' => 'sometimes|email|unique:students,email,' . $id,
            'age' => 'nullable|integer',
            'gender' => 'sometimes|in:Male,Female',
            'about' => 'nullable|string',
            'phone' => 'nullable|string',
            'department' => 'nullable|string',
            'year' => 'nullable|string',
            'archived' => 'nullable|boolean',
        ]);

        // Handle avatar upload (optional)
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        $student->fill($validated);
        $student->save();
        return response()->json($student);
    }

    // DELETE /api/students/{id}
    public function destroy($id)
    {
        $student = Student::findOrFail($id);
        $student->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
