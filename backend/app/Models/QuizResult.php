<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizResult extends Model
{
    use HasFactory;

   protected $fillable = [
        'quiz_session_id',
        'quiz_id',
        'student_name',
        'student_id',
        'section',
        'total_points',
        'earned_points',
        'percentage',
        'remarks',
        'total_violations',
    ];

    public function session()
    {
        return $this->belongsTo(QuizSession::class);
    }

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }
}