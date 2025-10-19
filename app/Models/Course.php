<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'subject',
        'class',
        'email',
        'age', // used for credits
        'gender', // used for level: Undergraduate/Postgraduate
        'avatar',
        'about',
        'phone',
        'department',
    ];
}
