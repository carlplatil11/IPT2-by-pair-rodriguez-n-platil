<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasFactory;

    protected $table = 'admin_settings';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'role',
        'date_of_birth',
        'country',
        'city',
        'postal_code',
        'username',
        'password',
    ];

    protected $hidden = [
        'password',
    ];
}
