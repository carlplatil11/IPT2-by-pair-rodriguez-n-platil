<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Log;
use Carbon\Carbon;

class LogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $logs = [
            [
                'user' => 'Admin',
                'action' => 'Created',
                'type' => 'Course',
                'details' => 'Created course: Computer Science',
                'status' => 'success',
                'created_at' => Carbon::now()->subHours(5),
            ],
            [
                'user' => 'Admin',
                'action' => 'Created',
                'type' => 'Department',
                'details' => 'Created department: Engineering',
                'status' => 'success',
                'created_at' => Carbon::now()->subHours(4),
            ],
            [
                'user' => 'Admin',
                'action' => 'Updated',
                'type' => 'Faculty',
                'details' => 'Updated faculty: Dr. John Smith',
                'status' => 'success',
                'created_at' => Carbon::now()->subHours(3),
            ],
            [
                'user' => 'Admin',
                'action' => 'Archived',
                'type' => 'Student',
                'details' => 'Archived student: Jane Doe',
                'status' => 'warning',
                'created_at' => Carbon::now()->subHours(2),
            ],
            [
                'user' => 'Admin',
                'action' => 'Restored',
                'type' => 'Course',
                'details' => 'Restored course: Mathematics',
                'status' => 'success',
                'created_at' => Carbon::now()->subHours(1),
            ],
            [
                'user' => 'Admin',
                'action' => 'Deleted',
                'type' => 'Department',
                'details' => 'Permanently deleted department: Old Department',
                'status' => 'warning',
                'created_at' => Carbon::now()->subMinutes(45),
            ],
            [
                'user' => 'Admin',
                'action' => 'Created',
                'type' => 'Academic Year',
                'details' => 'Created academic year: 2024-2025',
                'status' => 'success',
                'created_at' => Carbon::now()->subMinutes(30),
            ],
            [
                'user' => 'Admin',
                'action' => 'Error',
                'type' => 'Student',
                'details' => 'Failed to create student: Invalid email format',
                'status' => 'error',
                'created_at' => Carbon::now()->subMinutes(15),
            ],
        ];

        foreach ($logs as $log) {
            Log::create($log);
        }
    }
}
