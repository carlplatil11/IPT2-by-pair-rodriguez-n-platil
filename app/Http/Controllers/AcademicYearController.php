<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AcademicYear;
use App\Models\Student;
use App\Models\Faculty;
use App\Services\LogService;

class AcademicYearController extends Controller
{
    // GET /api/academic-years
    public function index()
    {
        return AcademicYear::all();
    }

    // POST /api/academic-years
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|string',
            'archived' => 'nullable|boolean',
        ]);

        // Set defaults
        $validated['status'] = $validated['status'] ?? 'active';
        $validated['archived'] = $validated['archived'] ?? false;

        $academicYear = AcademicYear::create($validated);
        
        // Log the creation
        LogService::logCreate('Academic Year', "Created academic year: {$academicYear->name}");
        
        return response()->json($academicYear, 201);
    }

    // GET /api/academic-years/{id}
    public function show($id)
    {
        return AcademicYear::findOrFail($id);
    }

    // PUT/PATCH /api/academic-years/{id}
    public function update(Request $request, $id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|string',
            'archived' => 'nullable|boolean',
        ]);

        // Check if academic year is being archived
        $isBeingArchived = isset($validated['archived']) && $validated['archived'] === true;
        $wasArchived = $academicYear->archived === true;
        
        // If academic year is being archived, cascade archive to related students and faculty
        if ($isBeingArchived && !$wasArchived) {
            // Archive all students in this academic year
            $studentsArchived = Student::where('academic_year', $academicYear->name)
                ->where(function($query) {
                    $query->where('archived', '!=', true)
                          ->orWhereNull('archived');
                })
                ->update(['archived' => true]);
            
            // Archive all faculty in this academic year
            $facultyArchived = Faculty::where('academic_year', $academicYear->name)
                ->where(function($query) {
                    $query->where('archived', '!=', true)
                          ->orWhereNull('archived');
                })
                ->update(['archived' => true]);
            
            // Log the archive action with cascade details
            $details = "Archived academic year: {$academicYear->name}";
            if ($studentsArchived > 0 || $facultyArchived > 0) {
                $details .= " (Also archived: {$studentsArchived} student(s), {$facultyArchived} faculty)";
            }
            LogService::logArchive('Academic Year', $details);
        }
        // If academic year is being unarchived, cascade unarchive to related students and faculty
        elseif (isset($validated['archived']) && $validated['archived'] === false && $wasArchived) {
            // Unarchive all students in this academic year
            $studentsRestored = Student::where('academic_year', $academicYear->name)
                ->where('archived', true)
                ->update(['archived' => false]);
            
            // Unarchive all faculty in this academic year
            $facultyRestored = Faculty::where('academic_year', $academicYear->name)
                ->where('archived', true)
                ->update(['archived' => false]);
            
            // Log the restore action with cascade details
            $details = "Restored academic year: {$academicYear->name}";
            if ($studentsRestored > 0 || $facultyRestored > 0) {
                $details .= " (Also restored: {$studentsRestored} student(s), {$facultyRestored} faculty)";
            }
            LogService::logRestore('Academic Year', $details);
        } else {
            // Regular update
            LogService::logUpdate('Academic Year', "Updated academic year: {$academicYear->name}");
        }

        $academicYear->fill($validated);
        $academicYear->save();
        return response()->json($academicYear);
    }

    // DELETE /api/academic-years/{id}
    public function destroy($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        $academicYearName = $academicYear->name;
        
        // Permanently delete all students in this academic year
        $studentsDeleted = Student::where('academic_year', $academicYear->name)->delete();
        
        // Permanently delete all faculty in this academic year
        $facultyDeleted = Faculty::where('academic_year', $academicYear->name)->delete();
        
        $academicYear->delete();
        
        // Log the deletion with cascade details
        $details = "Permanently deleted academic year: {$academicYearName}";
        if ($studentsDeleted > 0 || $facultyDeleted > 0) {
            $details .= " (Also deleted: {$studentsDeleted} student(s), {$facultyDeleted} faculty)";
        }
        LogService::logDelete('Academic Year', $details);
        
        return response()->json(['message' => 'Deleted successfully']);
    }
}
