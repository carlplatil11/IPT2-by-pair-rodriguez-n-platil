<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Department;
use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Services\LogService;

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
        
        // Log the creation
        LogService::logCreate('Department', "Created department: {$department->name}");
        
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
        $isBeingStatusArchived = isset($validated['status']) && $validated['status'] === 'Archived';
        $wasStatusArchived = $department->status === 'Archived';
        
        // If department is being archived, archive all related courses, faculty and students
        if (($isBeingArchived && !$wasArchived) || ($isBeingStatusArchived && !$wasStatusArchived)) {
            // Archive all courses in this department
            $coursesArchived = Course::where('department', $department->name)
                ->where(function($query) {
                    $query->where('archived', '!=', true)
                          ->orWhere('status', '!=', 'archived');
                })
                ->update(['archived' => true, 'status' => 'archived']);
            
            // Archive all faculty in this department
            $facultyArchived = Faculty::where('department', $department->name)
                ->where('archived', '!=', true)
                ->update(['archived' => true]);
            
            // Archive all students in this department
            $studentsArchived = Student::where('department', $department->name)
                ->where('archived', '!=', true)
                ->update(['archived' => true]);
            
            // Log the archive action with cascade details
            $details = "Archived department: {$department->name}";
            if ($coursesArchived > 0 || $facultyArchived > 0 || $studentsArchived > 0) {
                $details .= " (Also archived: {$coursesArchived} course(s), {$facultyArchived} faculty, {$studentsArchived} student(s))";
            }
            LogService::logArchive('Department', $details);
        }
        // If department is being unarchived, unarchive related courses, faculty and students
        elseif ((isset($validated['archived']) && $validated['archived'] === false && $wasArchived) || 
                (isset($validated['status']) && $validated['status'] === 'Active' && $wasStatusArchived)) {
            // Unarchive all courses in this department
            $coursesRestored = Course::where('department', $department->name)
                ->where('archived', true)
                ->update(['archived' => false, 'status' => 'active']);
            
            // Unarchive all faculty in this department
            $facultyRestored = Faculty::where('department', $department->name)
                ->where('archived', true)
                ->update(['archived' => false]);
            
            // Unarchive all students in this department
            $studentsRestored = Student::where('department', $department->name)
                ->where('archived', true)
                ->update(['archived' => false]);
            
            // Log the restore action with cascade details
            $details = "Restored department: {$department->name}";
            if ($coursesRestored > 0 || $facultyRestored > 0 || $studentsRestored > 0) {
                $details .= " (Also restored: {$coursesRestored} course(s), {$facultyRestored} faculty, {$studentsRestored} student(s))";
            }
            LogService::logRestore('Department', $details);
        } else {
            // Regular update
            LogService::logUpdate('Department', "Updated department: {$department->name}");
        }

        $department->fill($validated);
        $department->save();
        return response()->json($department);
    }

    // DELETE /api/departments/{id}
    public function destroy($id)
    {
        $department = Department::findOrFail($id);
        $departmentName = $department->name;
        
        // Permanently delete all courses in this department
        $coursesDeleted = Course::where('department', $department->name)->delete();
        
        // Permanently delete all faculty in this department
        $facultyDeleted = Faculty::where('department', $department->name)->delete();
        
        // Permanently delete all students in this department
        $studentsDeleted = Student::where('department', $department->name)->delete();
        
        $department->delete();
        
        // Log the deletion with cascade details
        $details = "Permanently deleted department: {$departmentName}";
        if ($coursesDeleted > 0 || $facultyDeleted > 0 || $studentsDeleted > 0) {
            $details .= " (Also deleted: {$coursesDeleted} course(s), {$facultyDeleted} faculty, {$studentsDeleted} student(s))";
        }
        LogService::logDelete('Department', $details);
        
        return response()->json(['message' => 'Deleted successfully']);
    }
}
