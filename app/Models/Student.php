<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'name',
        'subject',
        'email',
        'age',
        'gender',
        'about',
        'phone',
        'department',
        'year',
        'avatar',
    ];
}
