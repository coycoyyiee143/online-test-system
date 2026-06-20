<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $quizzes = Quiz::where('user_id', $request->user()->id)
            ->withCount('questions')
            ->withCount('sessions')
            ->latest()
            ->get();

        return response()->json($quizzes);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'required|integer|min:1',
            'max_violations' => 'required|integer|min:1',
            'randomize_questions' => 'boolean',
            'randomize_choices' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date',
        ]);

        $quiz = Quiz::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'quiz_code' => strtoupper(Str::random(6)),
            'time_limit' => $request->time_limit,
            'max_violations' => $request->max_violations,
            'randomize_questions' => $request->randomize_questions ?? false,
            'randomize_choices' => $request->randomize_choices ?? false,
            'available_from' => $request->available_from,
            'available_until' => $request->available_until,
        ]);

        return response()->json([
            'message' => 'Quiz created successfully',
            'quiz' => $quiz,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $quiz = Quiz::where('user_id', $request->user()->id)
            ->with(['questions.choices'])
            ->findOrFail($id);

        return response()->json($quiz);
    }

    public function update(Request $request, $id)
    {
        $quiz = Quiz::where('user_id', $request->user()->id)->findOrFail($id);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'time_limit' => 'sometimes|integer|min:1',
            'max_violations' => 'sometimes|integer|min:1',
            'randomize_questions' => 'boolean',
            'randomize_choices' => 'boolean',
            'is_active' => 'boolean',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date',
        ]);

        $quiz->update($request->all());

        return response()->json([
            'message' => 'Quiz updated successfully',
            'quiz' => $quiz,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $quiz = Quiz::where('user_id', $request->user()->id)->findOrFail($id);
        $quiz->delete();

        return response()->json([
            'message' => 'Quiz deleted successfully',
        ]);
    }

    public function toggleActive(Request $request, $id)
    {
        $quiz = Quiz::where('user_id', $request->user()->id)->findOrFail($id);
        $quiz->update(['is_active' => !$quiz->is_active]);

        return response()->json([
            'message' => 'Quiz status updated',
            'is_active' => $quiz->is_active,
        ]);
    }

    // Public - for students
    public function findByCode(Request $request)
    {
        $request->validate([
            'quiz_code' => 'required|string',
        ]);

        $quiz = Quiz::where('quiz_code', strtoupper($request->quiz_code))
            ->where('is_active', true)
            ->first();

        if (!$quiz) {
            return response()->json([
                'message' => 'Invalid or inactive quiz code',
            ], 404);
        }

        return response()->json([
            'quiz_id' => $quiz->id,
            'title' => $quiz->title,
            'description' => $quiz->description,
            'time_limit' => $quiz->time_limit,
        ]);
    }
}