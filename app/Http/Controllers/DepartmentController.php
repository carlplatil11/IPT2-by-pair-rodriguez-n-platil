<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Department;

class DepartmentController extends Controller
{
    // GET /api/departments
    public function index()
    {
        return Department::all();
    }

    // POST /api/departments
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'head' => 'nullable|string',
            'email' => 'nullable|email|unique:departments,email',
            'description' => 'nullable|string',
            'status' => 'nullable|in:Active,Deactivated',
            'students' => 'nullable|integer',
        ]);

        $department = Department::create($validated);
        return response()->json($department, 201);
    }

    // GET /api/departments/{id}
    public function show($id)
    {
        return Department::findOrFail($id);
    }

    // PUT/PATCH /api/departments/{id}
    public function update(Request $request, $id)
    {
        $department = Department::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string',
            'head' => 'nullable|string',
            'email' => 'sometimes|email|unique:departments,email,' . $id,
            'description' => 'nullable|string',
            'status' => 'nullable|in:Active,Deactivated',
            'students' => 'nullable|integer',
        ]);

        $department->fill($validated);
        $department->save();
        return response()->json($department);
    }

    // DELETE /api/departments/{id}
    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        $department->delete();
        return response()->json(['message' => 'Deleted successfully']);
    }
}
