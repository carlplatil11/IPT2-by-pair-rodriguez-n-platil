<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    // The departments table is used by default (plural of model)
    protected $fillable = [
        'name',
        'head',
        'email',
        'description',
        'status',
        'archived',
        'students',
    ];
}
