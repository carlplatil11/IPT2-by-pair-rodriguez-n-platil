<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'status',
        'archived',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'archived' => 'boolean',
    ];

    /**
     * Get the students for this academic year.
     */
    public function students()
    {
        return $this->hasMany(Student::class, 'academic_year', 'name');
    }

    /**
     * Get the faculties for this academic year.
     */
    public function faculties()
    {
        return $this->hasMany(Faculty::class, 'academic_year', 'name');
    }
}
