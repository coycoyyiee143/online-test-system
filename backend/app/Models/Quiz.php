<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'quiz_code',
        'time_limit',
        'max_violations',
        'randomize_questions',
        'randomize_choices',
        'is_active',
        'available_from',
        'available_until',
    ];

    protected $casts = [
        'randomize_questions' => 'boolean',
        'randomize_choices' => 'boolean',
        'is_active' => 'boolean',
        'available_from' => 'datetime',
        'available_until' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function questions()
    {
        return $this->hasMany(Question::class);
    }

    public function sessions()
    {
        return $this->hasMany(QuizSession::class);
    }

    public function results()
    {
        return $this->hasMany(QuizResult::class);
    }
}