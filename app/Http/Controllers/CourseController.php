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
            'department' => 'nullable|string',
            'age' => 'nullable|integer', // credits
            'gender' => 'nullable|string', // level
            'about' => 'nullable|string',
            'status' => 'nullable|string',
            'archived' => 'nullable|boolean',
        ]);

        // Set defaults
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['archived'] = $validated['archived'] ?? false;

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
            'department' => 'nullable|string',
            'age' => 'nullable|integer', // credits
            'gender' => 'nullable|string', // level
            'about' => 'nullable|string',
            'status' => 'nullable|string',
            'archived' => 'nullable|boolean',
        ]);

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
