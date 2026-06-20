<?php

namespace App\Http\Controllers;

use App\Models\QuizSession;
use App\Models\Violation;
use Illuminate\Http\Request;

class ViolationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'session_token' => 'required|string',
            'violation_type' => 'required|string',
            'description' => 'nullable|string',
        ]);

        $session = QuizSession::where('session_token', $request->session_token)
            ->where('status', 'active')
            ->firstOrFail();

        Violation::create([
            'quiz_session_id' => $session->id,
            'violation_type' => $request->violation_type,
            'description' => $request->description,
            'violated_at' => now(),
        ]);

        $session->increment('violation_count');
        $session->refresh();

        $quiz = $session->quiz;
        $autoSubmit = $session->violation_count >= $quiz->max_violations;

        return response()->json([
            'message' => 'Violation recorded',
            'violation_count' => $session->violation_count,
            'max_violations' => $quiz->max_violations,
            'auto_submit' => $autoSubmit,
        ]);
    }

    public function getByQuiz(Request $request, $quizId)
    {
        $quiz = \App\Models\Quiz::where('user_id', $request->user()->id)->findOrFail($quizId);

        $violations = Violation::whereHas('session', function ($q) use ($quiz) {
            $q->where('quiz_id', $quiz->id);
        })->with('session')->latest('violated_at')->get();

        return response()->json($violations);
    }
}