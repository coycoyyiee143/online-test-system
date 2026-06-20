<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\QuizResult;
use Illuminate\Http\Request;

class QuizResultController extends Controller
{
    public function index(Request $request, $quizId)
    {
        $quiz = Quiz::where('user_id', $request->user()->id)->findOrFail($quizId);

        $results = QuizResult::where('quiz_id', $quiz->id)
            ->with('session.violations')
            ->latest()
            ->get();

        $stats = [
            'total_takers' => $results->count(),
            'average_score' => round($results->avg('percentage'), 2),
            'highest_score' => $results->max('percentage'),
            'lowest_score' => $results->min('percentage'),
            'passed' => $results->where('remarks', 'Passed')->count(),
            'failed' => $results->where('remarks', 'Failed')->count(),
        ];

        return response()->json([
            'results' => $results,
            'stats' => $stats,
        ]);
    }
}