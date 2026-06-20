<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'student_name',
        'student_id',
        'section',
        'session_token',
        'started_at',
        'submitted_at',
        'last_activity',
        'violation_count',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'last_activity' => 'datetime',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function answers()
    {
        return $this->hasMany(StudentAnswer::class);
    }

    public function violations()
    {
        return $this->hasMany(Violation::class);
    }

    public function result()
    {
        return $this->hasOne(QuizResult::class);
    }
}