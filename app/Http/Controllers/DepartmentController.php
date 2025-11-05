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
            'status' => 'nullable|in:Active,Deactivated,Archived',
            'archived' => 'nullable|boolean',
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
            'status' => 'nullable|in:Active,Deactivated,Archived',
            'archived' => 'nullable|boolean',
            'students' => 'nullable|integer',
        ]);

        // Check if department is being archived
        $isBeingArchived = isset($validated['archived']) && $validated['archived'] === true;
        $wasArchived = $department->archived === true;
        
        // If department is being archived, archive all related faculty and students
        if ($isBeingArchived && !$wasArchived) {
            // Archive all faculty in this department
            $affectedFaculty = \App\Models\Faculty::where('department', $department->name)
                ->where('archived', false)
                ->get();
            
            foreach ($affectedFaculty as $faculty) {
                $faculty->archived = true;
                $faculty->save();
            }
            
            // Archive all students in this department
            $affectedStudents = \App\Models\Student::where('department', $department->name)
                ->where('archived', false)
                ->get();
            
            foreach ($affectedStudents as $student) {
                $student->archived = true;
                $student->save();
            }
        }
        
        // If department is being unarchived, unarchive related faculty and students
        if (isset($validated['archived']) && $validated['archived'] === false && $wasArchived) {
            // Unarchive all faculty in this department
            $affectedFaculty = \App\Models\Faculty::where('department', $department->name)
                ->where('archived', true)
                ->get();
            
            foreach ($affectedFaculty as $faculty) {
                $faculty->archived = false;
                $faculty->save();
            }
            
            // Unarchive all students in this department
            $affectedStudents = \App\Models\Student::where('department', $department->name)
                ->where('archived', true)
                ->get();
            
            foreach ($affectedStudents as $student) {
                $student->archived = false;
                $student->save();
            }
        }

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
