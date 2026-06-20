<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\QuizSessionController;
use App\Http\Controllers\ViolationController;
use App\Http\Controllers\QuizResultController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Student Routes (no auth required)
Route::post('/quiz/find', [QuizController::class, 'findByCode']);
Route::post('/session/start', [QuizSessionController::class, 'start']);
Route::post('/session/answer', [QuizSessionController::class, 'saveAnswer']);
Route::post('/session/submit', [QuizSessionController::class, 'submit']);
Route::post('/violation', [ViolationController::class, 'store']);

// Teacher Routes (auth required)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Quiz CRUD
    Route::get('/quizzes', [QuizController::class, 'index']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::get('/quizzes/{id}', [QuizController::class, 'show']);
    Route::put('/quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
    Route::patch('/quizzes/{id}/toggle', [QuizController::class, 'toggleActive']);

    // Questions
    Route::post('/quizzes/{quizId}/questions', [QuestionController::class, 'store']);
    Route::put('/quizzes/{quizId}/questions/{questionId}', [QuestionController::class, 'update']);
    Route::delete('/quizzes/{quizId}/questions/{questionId}', [QuestionController::class, 'destroy']);

    // Participants
    Route::get('/quizzes/{quizId}/participants', [QuizSessionController::class, 'getParticipants']);

    // Results
    Route::get('/quizzes/{quizId}/results', [QuizResultController::class, 'index']);

    // Violations
    Route::get('/quizzes/{quizId}/violations', [ViolationController::class, 'getByQuiz']);
});