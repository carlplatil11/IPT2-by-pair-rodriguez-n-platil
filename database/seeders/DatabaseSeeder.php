<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Clear existing data
        DB::table('students')->delete();
        DB::table('courses')->delete();
        DB::table('faculties')->delete();
        DB::table('departments')->delete();
        DB::table('academic_years')->delete();

        // Seed Departments
        $departments = [
            [
                'name' => 'Computer Science',
                'head' => 'Dr. Sarah Johnson',
                'email' => 'sarah.johnson@university.edu',
                'description' => 'The Computer Science department focuses on software development, algorithms, artificial intelligence, and computer systems. We prepare students for careers in technology and innovation.',
                'status' => 'Active',
                'archived' => false,
                'students' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Business Administration',
                'head' => 'Prof. Michael Chen',
                'email' => 'michael.chen@university.edu',
                'description' => 'Business Administration provides comprehensive education in management, finance, marketing, and entrepreneurship. Our graduates become successful business leaders.',
                'status' => 'Active',
                'archived' => false,
                'students' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Engineering',
                'head' => 'Dr. Emily Rodriguez',
                'email' => 'emily.rodriguez@university.edu',
                'description' => 'Engineering department offers programs in civil, mechanical, electrical, and chemical engineering. We emphasize hands-on learning and innovation.',
                'status' => 'Active',
                'archived' => false,
                'students' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Arts & Humanities',
                'head' => 'Dr. David Williams',
                'email' => 'david.williams@university.edu',
                'description' => 'Arts & Humanities explores literature, history, philosophy, and creative arts. We cultivate critical thinking and cultural understanding.',
                'status' => 'Active',
                'archived' => false,
                'students' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Natural Sciences',
                'head' => 'Dr. Lisa Anderson',
                'email' => 'lisa.anderson@university.edu',
                'description' => 'Natural Sciences department covers biology, chemistry, physics, and environmental science. We promote scientific inquiry and research excellence.',
                'status' => 'Active',
                'archived' => false,
                'students' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('departments')->insert($departments);

        // Seed Academic Years
        $academicYears = [
            [
                'name' => '2023-2024',
                'start_date' => '2023-08-01',
                'end_date' => '2024-05-31',
                'status' => 'inactive',
                'archived' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '2024-2025',
                'start_date' => '2024-08-01',
                'end_date' => '2025-05-31',
                'status' => 'active',
                'archived' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => '2025-2026',
                'start_date' => '2025-08-01',
                'end_date' => '2026-05-31',
                'status' => 'upcoming',
                'archived' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('academic_years')->insert($academicYears);

        // Seed Courses
        $courses = [
            // Computer Science Courses
            [
                'code' => 'BSCS',
                'name' => 'Bachelor of Science in Computer Science',
                'department' => 'Computer Science',
                'age' => 4,
                'gender' => 'Undergraduate',
                'status' => 'active',
                'archived' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'BSIT',
                'name' => 'Bachelor of Science in Information Technology',
                'department' => 'Computer Science',
                'age' => 4,
                'gender' => 'Undergraduate',
                'status' => 'active',
                'archived' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'MSCS',
                'name' => 'Master of Science in Computer Science',
                'department' => 'Computer Science',
                'age' => 2,
                'gender' => 'Postgraduate',
                'status' => 'active',
                'archived' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Engineering Courses
            [
                'code' => 'BSCE',
                'name' => 'Bachelor of Science in Civil Engineering',
                'department' => 'Engineering',
                'age' => 4,
                'gender' => 'Undergraduate',
                'status' => 'active',
                'archived' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            
            // Business Administration Courses
            [
                'code' => 'BSBA',
                'name' => 'Bachelor of Science in Business Administration',
                'department' => 'Business Administration',
                'age' => 4,
                'gender' => 'Undergraduate',
                'status' => 'active',
                'archived' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('courses')->insert($courses);

        // Seed Faculties
        $faculties = [
            [
                'name' => 'Dr. James Mitchell',
                'email' => 'james.mitchell@university.edu',
                'department' => 'Computer Science',
                'subject' => 'BSCS',
                'phone' => '+1-555-0101',
                'age' => 45,
                'gender' => 'Male',
                'about' => 'Specializes in algorithm optimization and computational complexity with 15 years of teaching experience.',
                'avatar' => 'https://randomuser.me/api/portraits/men/1.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Prof. Maria Garcia',
                'email' => 'maria.garcia@university.edu',
                'department' => 'Computer Science',
                'subject' => 'BSIT',
                'phone' => '+1-555-0102',
                'age' => 38,
                'gender' => 'Female',
                'about' => 'AI researcher focusing on neural networks and deep learning applications.',
                'avatar' => 'https://randomuser.me/api/portraits/women/1.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dr. Robert Taylor',
                'email' => 'robert.taylor@university.edu',
                'department' => 'Business Administration',
                'subject' => 'BSBA',
                'phone' => '+1-555-0103',
                'age' => 52,
                'gender' => 'Male',
                'about' => 'Former investment banker with expertise in corporate finance and portfolio management.',
                'avatar' => 'https://randomuser.me/api/portraits/men/2.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dr. Jennifer Lee',
                'email' => 'jennifer.lee@university.edu',
                'department' => 'Business Administration',
                'subject' => 'BSBA',
                'phone' => '+1-555-0104',
                'age' => 41,
                'gender' => 'Female',
                'about' => 'Digital marketing expert with focus on consumer behavior and brand strategy.',
                'avatar' => 'https://randomuser.me/api/portraits/women/2.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Prof. Thomas Brown',
                'email' => 'thomas.brown@university.edu',
                'department' => 'Engineering',
                'subject' => 'BSCE',
                'phone' => '+1-555-0105',
                'age' => 48,
                'gender' => 'Male',
                'about' => 'Licensed structural engineer with expertise in seismic design and construction.',
                'avatar' => 'https://randomuser.me/api/portraits/men/3.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dr. Amanda White',
                'email' => 'amanda.white@university.edu',
                'department' => 'Engineering',
                'subject' => 'BSCE',
                'phone' => '+1-555-0106',
                'age' => 36,
                'gender' => 'Female',
                'about' => 'Renewable energy researcher specializing in solar and wind power systems.',
                'avatar' => 'https://randomuser.me/api/portraits/women/3.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Prof. Christopher Davis',
                'email' => 'christopher.davis@university.edu',
                'department' => 'Arts & Humanities',
                'subject' => 'BSCS',
                'phone' => '+1-555-0107',
                'age' => 55,
                'gender' => 'Male',
                'about' => 'Literary scholar specializing in contemporary fiction and literary theory.',
                'avatar' => 'https://randomuser.me/api/portraits/men/4.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Dr. Rachel Martinez',
                'email' => 'rachel.martinez@university.edu',
                'department' => 'Natural Sciences',
                'subject' => 'MSCS',
                'phone' => '+1-555-0108',
                'age' => 42,
                'gender' => 'Female',
                'about' => 'Molecular biologist researching genetic engineering and biotechnology.',
                'avatar' => 'https://randomuser.me/api/portraits/women/4.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('faculties')->insert($faculties);

        // Seed Students
        $students = [
            [
                'name' => 'Alex Thompson',
                'email' => 'alex.thompson@student.edu',
                'department' => 'Computer Science',
                'course' => 'BSCS',
                'phone' => '+1-555-1001',
                'year' => '3rd Year',
                'age' => 21,
                'gender' => 'Male',
                'about' => 'Passionate about web development and open-source contributions. Aspiring full-stack developer.',
                'avatar' => 'https://randomuser.me/api/portraits/men/10.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Emma Wilson',
                'email' => 'emma.wilson@student.edu',
                'department' => 'Computer Science',
                'course' => 'BSIT',
                'phone' => '+1-555-1002',
                'year' => '2nd Year',
                'age' => 20,
                'gender' => 'Female',
                'about' => 'Interested in machine learning and data analytics. Working on predictive models.',
                'avatar' => 'https://randomuser.me/api/portraits/women/10.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Michael Johnson',
                'email' => 'michael.johnson@student.edu',
                'department' => 'Business Administration',
                'course' => 'BSBA',
                'phone' => '+1-555-1003',
                'year' => '4th Year',
                'age' => 22,
                'gender' => 'Male',
                'about' => 'Finance major with internship experience at investment firms. CFA Level 1 candidate.',
                'avatar' => 'https://randomuser.me/api/portraits/men/11.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Sophia Anderson',
                'email' => 'sophia.anderson@student.edu',
                'department' => 'Business Administration',
                'course' => 'BSBA',
                'phone' => '+1-555-1004',
                'year' => '3rd Year',
                'age' => 21,
                'gender' => 'Female',
                'about' => 'Digital marketing enthusiast with focus on social media strategy and content creation.',
                'avatar' => 'https://randomuser.me/api/portraits/women/11.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Daniel Martinez',
                'email' => 'daniel.martinez@student.edu',
                'department' => 'Engineering',
                'course' => 'BSCE',
                'phone' => '+1-555-1005',
                'year' => '3rd Year',
                'age' => 22,
                'gender' => 'Male',
                'about' => 'Interested in sustainable infrastructure and urban planning. CAD and BIM proficient.',
                'avatar' => 'https://randomuser.me/api/portraits/men/12.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Olivia Brown',
                'email' => 'olivia.brown@student.edu',
                'department' => 'Engineering',
                'course' => 'BSCE',
                'phone' => '+1-555-1006',
                'year' => '2nd Year',
                'age' => 19,
                'gender' => 'Female',
                'about' => 'Passionate about renewable energy systems and smart grid technology.',
                'avatar' => 'https://randomuser.me/api/portraits/women/12.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'William Davis',
                'email' => 'william.davis@student.edu',
                'department' => 'Arts & Humanities',
                'course' => 'BSCS',
                'phone' => '+1-555-1007',
                'year' => '4th Year',
                'age' => 23,
                'gender' => 'Male',
                'about' => 'History major specializing in modern European history. Working on senior thesis.',
                'avatar' => 'https://randomuser.me/api/portraits/men/13.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Isabella Garcia',
                'email' => 'isabella.garcia@student.edu',
                'department' => 'Arts & Humanities',
                'course' => 'MSCS',
                'phone' => '+1-555-1008',
                'year' => '1st Year',
                'age' => 20,
                'gender' => 'Female',
                'about' => 'Aspiring writer and literary critic. Editor of the university literary magazine.',
                'avatar' => 'https://randomuser.me/api/portraits/women/13.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ethan Miller',
                'email' => 'ethan.miller@student.edu',
                'department' => 'Natural Sciences',
                'course' => 'BSIT',
                'phone' => '+1-555-1009',
                'year' => '3rd Year',
                'age' => 21,
                'gender' => 'Male',
                'about' => 'Pre-med student with research experience in molecular biology and genetics.',
                'avatar' => 'https://randomuser.me/api/portraits/men/14.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Ava Wilson',
                'email' => 'ava.wilson@student.edu',
                'department' => 'Natural Sciences',
                'course' => 'MSCS',
                'phone' => '+1-555-1010',
                'year' => '1st Year',
                'age' => 19,
                'gender' => 'Female',
                'about' => 'Environmental activist focused on climate change research and conservation.',
                'avatar' => 'https://randomuser.me/api/portraits/women/14.jpg',
                'academic_year' => '2024-2025',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('students')->insert($students);

        echo "Database seeded successfully!\n";
        echo "- " . count($departments) . " departments\n";
        echo "- " . count($academicYears) . " academic years\n";
        echo "- " . count($courses) . " courses\n";
        echo "- " . count($faculties) . " faculties\n";
        echo "- " . count($students) . " students\n";
    }
}
