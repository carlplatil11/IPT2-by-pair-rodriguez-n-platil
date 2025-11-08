<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Student;
use App\Models\Faculty;
use App\Services\LogService;

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
            'code' => 'required|string|max:20',
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
        
        // Log the creation
        LogService::logCreate('Course', "Created course: {$course->name}");
        
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
        $oldStatus = $course->status;
        $oldArchived = $course->archived;
        
        $validated = $request->validate([
            'code' => 'sometimes|string|max:20',
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
        
        // Check if course is being archived
        $isBeingArchived = (
            (isset($validated['archived']) && $validated['archived'] == true && $oldArchived != true) ||
            (isset($validated['status']) && $validated['status'] === 'archived' && $oldStatus !== 'archived')
        );
        
        // Check if course is being restored
        $isBeingRestored = (
            (isset($validated['archived']) && $validated['archived'] == false && $oldArchived == true) ||
            (isset($validated['status']) && $validated['status'] === 'active' && $oldStatus === 'archived')
        );
        
        if ($isBeingArchived) {
            // Archive all students taking this course
            $studentsArchived = Student::where('course', $course->name)
                ->where('archived', '!=', true)
                ->update(['archived' => true]);
            
            // Archive all faculty teaching this course
            $facultyArchived = Faculty::where('subject', $course->name)
                ->where('archived', '!=', true)
                ->update(['archived' => true]);
            
            // Log the archive action with cascade details
            $details = "Archived course: {$course->name}";
            if ($studentsArchived > 0 || $facultyArchived > 0) {
                $details .= " (Also archived: {$studentsArchived} student(s), {$facultyArchived} faculty)";
            }
            LogService::logArchive('Course', $details);
        } elseif ($isBeingRestored) {
            // Restore all students taking this course
            $studentsRestored = Student::where('course', $course->name)
                ->where('archived', true)
                ->update(['archived' => false]);
            
            // Restore all faculty teaching this course
            $facultyRestored = Faculty::where('subject', $course->name)
                ->where('archived', true)
                ->update(['archived' => false]);
            
            // Log the restore action with cascade details
            $details = "Restored course: {$course->name}";
            if ($studentsRestored > 0 || $facultyRestored > 0) {
                $details .= " (Also restored: {$studentsRestored} student(s), {$facultyRestored} faculty)";
            }
            LogService::logRestore('Course', $details);
        } else {
            // Regular update
            LogService::logUpdate('Course', "Updated course: {$course->name}");
        }
        
        return response()->json($course);
    }

    // DELETE /api/courses/{id}
    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $courseName = $course->name;
        
        // Permanently delete all students taking this course
        $studentsDeleted = Student::where('course', $course->name)->delete();
        
        // Permanently delete all faculty teaching this course
        $facultyDeleted = Faculty::where('subject', $course->name)->delete();
        
        $course->delete();
        
        // Log the deletion with cascade details
        $details = "Permanently deleted course: {$courseName}";
        if ($studentsDeleted > 0 || $facultyDeleted > 0) {
            $details .= " (Also deleted: {$studentsDeleted} student(s), {$facultyDeleted} faculty)";
        }
        LogService::logDelete('Course', $details);
        
        return response()->json(['message' => 'Deleted successfully']);
    }
}
