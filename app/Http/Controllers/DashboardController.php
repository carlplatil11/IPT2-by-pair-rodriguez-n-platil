<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Faculty;
use App\Models\Course;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function stats()
    {
        // Count all students and faculty
        $totalStudents = Student::count();
        $totalFaculty = Faculty::count();

        return response()->json([
            'students' => $totalStudents,
            'faculty' => $totalFaculty,
            'total_students' => $totalStudents,
            'total_faculty' => $totalFaculty
        ]);
    }

    /**
     * Get students grouped by course
     */
    public function studentsByCourse()
    {
        $data = Student::select('course', DB::raw('count(*) as count'))
            ->whereNotNull('course')
            ->groupBy('course')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function($item) {
                return [
                    'course_name' => $item->course,
                    'label' => $item->course,
                    'count' => $item->count,
                    'value' => $item->count
                ];
            });

        return response()->json($data);
    }

    /**
     * Get faculty grouped by department
     */
    public function facultyByDepartment()
    {
        $data = Faculty::select('department', DB::raw('count(*) as count'))
            ->whereNotNull('department')
            ->groupBy('department')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function($item) {
                return [
                    'department_name' => $item->department,
                    'label' => $item->department,
                    'count' => $item->count,
                    'value' => $item->count
                ];
            });

        return response()->json($data);
    }
}
