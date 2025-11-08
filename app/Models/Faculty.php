<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subject',
        'class',
        'email',
        'age',
        'gender',
        'avatar',
        'about',
        'phone',
        'department',
        'archived',
        'academic_year',
    ];
}
