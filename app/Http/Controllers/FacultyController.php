<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Faculty;

class FacultyController extends Controller
{
    // GET /api/faculties
    public function index()
    {
        return Faculty::all();
    }

    // Not needed for API: create()

    // POST /api/faculties
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'subject' => 'required|string',
            'email' => 'required|email|unique:faculties,email',
            'age' => 'nullable|integer',
            'gender' => 'required|in:Male,Female',
            'about' => 'nullable|string',
            'phone' => 'nullable|string',
            'department' => 'nullable|string',
            'class' => 'nullable|string',
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        $faculty = Faculty::create($validated);
        return response()->json($faculty, 201);
    }

    // GET /api/faculties/{id}
    public function show($id)
    {
        return Faculty::findOrFail($id);
    }

    // Not needed for API: edit()

    // PUT/PATCH /api/faculties/{id}
    public function update(Request $request, $id)
    {
        $faculty = Faculty::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'subject' => 'sometimes|string',
            'email' => 'sometimes|email|unique:faculties,email,' . $id,
            'age' => 'nullable|integer',
            'gender' => 'sometimes|in:Male,Female',
            'about' => 'nullable|string',
            'phone' => 'nullable|string',
            'department' => 'nullable|string',
            'class' => 'nullable|string',
            'archived' => 'nullable|boolean',
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = '/storage/' . $path;
        }

        $faculty->fill($validated);
        $faculty->save();
        return response()->json($faculty);
    }

    // DELETE /api/faculties/{id}
    public function destroy($id)
    {
        $faculty = Faculty::findOrFail($id);
        $faculty->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
