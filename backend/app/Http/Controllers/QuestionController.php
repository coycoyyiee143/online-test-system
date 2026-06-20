<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Quiz;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function store(Request $request, $quizId)
    {
        $quiz = Quiz::where('user_id', $request->user()->id)->findOrFail($quizId);

        $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|in:multiple_choice,true_false,essay',
            'points' => 'required|integer|min:1',
            'order' => 'integer',
            'choices' => 'required_if:question_type,multiple_choice,true_false|array',
            'choices.*.choice_text' => 'required|string',
            'choices.*.is_correct' => 'required|boolean',
        ]);

        $question = Question::create([
            'quiz_id' => $quiz->id,
            'question_text' => $request->question_text,
            'question_type' => $request->question_type,
            'points' => $request->points,
            'order' => $request->order ?? 0,
        ]);

        if ($request->choices) {
            foreach ($request->choices as $choice) {
                $question->choices()->create($choice);
            }
        }

        return response()->json([
            'message' => 'Question created successfully',
            'question' => $question->load('choices'),
        ], 201);
    }

    public function update(Request $request, $quizId, $questionId)
    {
        $quiz = Quiz::where('user_id', $request->user()->id)->findOrFail($quizId);
        $question = Question::where('quiz_id', $quiz->id)->findOrFail($questionId);

        $request->validate([
            'question_text' => 'sometimes|string',
            'question_type' => 'sometimes|in:multiple_choice,true_false,essay',
            'points' => 'sometimes|integer|min:1',
            'order' => 'integer',
            'choices' => 'sometimes|array',
            'choices.*.choice_text' => 'required|string',
            'choices.*.is_correct' => 'required|boolean',
        ]);

        $question->update($request->only(['question_text', 'question_type', 'points', 'order']));

        if ($request->choices) {
            $question->choices()->delete();
            foreach ($request->choices as $choice) {
                $question->choices()->create($choice);
            }
        }

        return response()->json([
            'message' => 'Question updated successfully',
            'question' => $question->load('choices'),
        ]);
    }

    public function destroy(Request $request, $quizId, $questionId)
    {
        $quiz = Quiz::where('user_id', $request->user()->id)->findOrFail($quizId);
        $question = Question::where('quiz_id', $quiz->id)->findOrFail($questionId);
        $question->delete();

        return response()->json([
            'message' => 'Question deleted successfully',
        ]);
    }
}