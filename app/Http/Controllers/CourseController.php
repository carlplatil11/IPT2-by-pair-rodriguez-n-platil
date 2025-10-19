<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;

class CourseController extends Controller
{
    // GET /api/courses
    public function index()
    {
        return Course::all();
    }

    // POST /api/courses
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'subject' => 'required|string',
            'class' => 'sometimes|string',
            'email' => 'nullable|email|unique:courses,email',
            'age' => 'nullable|integer',
            'gender' => 'sometimes|string',
            'about' => 'nullable|string',
            'phone' => 'nullable|string',
            'department' => 'nullable|string',
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        $course = Course::create($validated);
        return response()->json($course, 201);
    }

    // GET /api/courses/{id}
    public function show($id)
    {
        return Course::findOrFail($id);
    }

    // PUT/PATCH /api/courses/{id}
    public function update(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'subject' => 'sometimes|string',
            'class' => 'sometimes|string',
            'email' => 'nullable|email|unique:courses,email,' . $id,
            'age' => 'nullable|integer',
            'gender' => 'sometimes|string',
            'about' => 'nullable|string',
            'phone' => 'nullable|string',
            'department' => 'nullable|string',
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        $course->fill($validated);
        $course->save();
        return response()->json($course);
    }

    // DELETE /api/courses/{id}
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
