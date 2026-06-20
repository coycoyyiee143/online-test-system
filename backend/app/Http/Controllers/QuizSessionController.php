<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizSession;
use App\Models\StudentAnswer;
use App\Models\QuizResult;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QuizSessionController extends Controller
{
    public function start(Request $request)
    {
        $request->validate([
            'quiz_id' => 'required|exists:quizzes,id',
            'student_name' => 'required|string|max:255',
            'student_id' => 'required|string|max:255',
            'section' => 'nullable|string|max:255',
        ]);

        $quiz = Quiz::where('id', $request->quiz_id)
            ->where('is_active', true)
            ->firstOrFail();

        // Check if already submitted
        $submitted = QuizSession::where('quiz_id', $quiz->id)
            ->where('student_id', $request->student_id)
            ->where('status', 'submitted')
            ->first();

        if ($submitted) {
            return response()->json([
                'message' => 'You have already submitted this quiz. Duplicate attempt is not allowed.',
            ], 403);
        }

        // Check if Student ID is already used by different name
        $existingName = QuizSession::where('quiz_id', $quiz->id)
            ->where('student_id', $request->student_id)
            ->whereNotNull('student_name')
            ->first();

        if ($existingName && strtolower(trim($existingName->student_name)) !== strtolower(trim($request->student_name))) {
            return response()->json([
                'message' => 'This Student ID is already registered under a different name.',
            ], 403);
        }

        // Check existing active session - resume
        $existing = QuizSession::where('quiz_id', $quiz->id)
            ->where('student_id', $request->student_id)
            ->where('status', 'active')
            ->first();

        if ($existing) {
            // Load saved answers para ma-restore sa frontend
            $savedAnswers = $existing->answers()->get()->keyBy('question_id');

            $questions = $quiz->questions()->with('choices')->get();

            if ($quiz->randomize_questions) {
                $questions = $questions->shuffle();
            }

            if ($quiz->randomize_choices) {
                $questions->each(function ($question) {
                    $question->setRelation('choices', $question->choices->shuffle());
                });
            }

            return response()->json([
                'message' => 'Resuming existing session',
                'session_token' => $existing->session_token,
                'is_resumed' => true,
                'quiz' => [
                    'title' => $quiz->title,
                    'time_limit' => $quiz->time_limit,
                    'max_violations' => $quiz->max_violations,
                ],
                'questions' => $questions,
                'saved_answers' => $savedAnswers,
            ]);
        }

        // Check expired session - allow new session
        $expired = QuizSession::where('quiz_id', $quiz->id)
            ->where('student_id', $request->student_id)
            ->where('status', 'expired')
            ->first();

        if ($expired) {
            // I-update ang expired session to active
            $expired->update([
                'student_name' => $request->student_name,
                'section' => $request->section,
                'session_token' => Str::uuid(),
                'started_at' => now(),
                'last_activity' => now(),
                'status' => 'active',
                'violation_count' => 0,
            ]);

            $session = $expired->fresh();
        } else {
            // New session
            $session = QuizSession::create([
                'quiz_id' => $quiz->id,
                'student_name' => $request->student_name,
                'student_id' => $request->student_id,
                'section' => $request->section,
                'session_token' => Str::uuid(),
                'started_at' => now(),
                'last_activity' => now(),
                'status' => 'active',
            ]);
        }

        $questions = $quiz->questions()->with('choices')->get();

        if ($quiz->randomize_questions) {
            $questions = $questions->shuffle();
        }

        if ($quiz->randomize_choices) {
            $questions->each(function ($question) {
                $question->setRelation('choices', $question->choices->shuffle());
            });
        }

        return response()->json([
            'message' => 'Quiz started',
            'session_token' => $session->session_token,
            'is_resumed' => false,
            'quiz' => [
                'title' => $quiz->title,
                'time_limit' => $quiz->time_limit,
                'max_violations' => $quiz->max_violations,
            ],
            'questions' => $questions,
            'saved_answers' => [],
        ], 201);
    }

    public function saveAnswer(Request $request)
    {
        $request->validate([
            'session_token' => 'required|string',
            'question_id' => 'required|exists:questions,id',
            'choice_id' => 'nullable|exists:choices,id',
            'essay_answer' => 'nullable|string',
        ]);

        $session = QuizSession::where('session_token', $request->session_token)
            ->where('status', 'active')
            ->firstOrFail();

        $session->update(['last_activity' => now()]);

        $answer = StudentAnswer::updateOrCreate(
            [
                'quiz_session_id' => $session->id,
                'question_id' => $request->question_id,
            ],
            [
                'choice_id' => $request->choice_id,
                'essay_answer' => $request->essay_answer,
            ]
        );

        return response()->json([
            'message' => 'Answer saved',
            'answer' => $answer,
        ]);
    }

    public function submit(Request $request)
    {
        $request->validate([
            'session_token' => 'required|string',
        ]);

        $session = QuizSession::where('session_token', $request->session_token)
            ->where('status', 'active')
            ->firstOrFail();

        $quiz = $session->quiz;
        $questions = $quiz->questions()->with('choices')->get();

        $totalPoints = 0;
        $earnedPoints = 0;

        foreach ($questions as $question) {
            $totalPoints += $question->points;

            if ($question->question_type !== 'essay') {
                $answer = $session->answers()->where('question_id', $question->id)->first();

                if ($answer && $answer->choice_id) {
                    $correctChoice = $question->choices()->where('is_correct', true)->first();

                    if ($correctChoice && $answer->choice_id == $correctChoice->id) {
                        $earnedPoints += $question->points;
                        $answer->update([
                            'is_correct' => true,
                            'points_earned' => $question->points,
                        ]);
                    } else {
                        $answer->update(['is_correct' => false, 'points_earned' => 0]);
                    }
                }
            }
        }

        $percentage = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;

        $session->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        QuizResult::create([
            'quiz_session_id' => $session->id,
            'quiz_id' => $quiz->id,
            'student_name' => $session->student_name,
            'student_id' => $session->student_id,
            'section' => $session->section,
            'total_points' => $totalPoints,
            'earned_points' => $earnedPoints,
            'percentage' => $percentage,
            'remarks' => $percentage >= 60 ? 'Passed' : 'Failed',
            'total_violations' => $session->violation_count,
        ]);

        return response()->json([
            'message' => 'Quiz submitted successfully',
            'result' => [
                'total_points' => $totalPoints,
                'earned_points' => $earnedPoints,
                'percentage' => round($percentage, 2),
                'remarks' => $percentage >= 60 ? 'Passed' : 'Failed',
            ],
        ]);
    }

    public function getParticipants(Request $request, $quizId)
    {
        $quiz = Quiz::where('user_id', $request->user()->id)->findOrFail($quizId);

        $sessions = QuizSession::where('quiz_id', $quiz->id)
            ->with('violations')
            ->latest()
            ->get();

        return response()->json($sessions);
    }
}