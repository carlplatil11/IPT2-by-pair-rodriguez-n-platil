<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    use HasFactory;

    protected $table = 'system_logs';

    protected $fillable = [
        'user',
        'action',
        'type',
        'details',
        'status'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Append timestamp as formatted string for frontend
    protected $appends = ['timestamp'];

    public function getTimestampAttribute()
    {
        return $this->created_at->toIso8601String();
    }
}
