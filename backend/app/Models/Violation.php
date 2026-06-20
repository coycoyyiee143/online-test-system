<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Violation extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_session_id',
        'violation_type',
        'description',
        'violated_at',
    ];

    protected $casts = [
        'violated_at' => 'datetime',
    ];

    public function session()
    {
        return $this->belongsTo(QuizSession::class);
    }
}