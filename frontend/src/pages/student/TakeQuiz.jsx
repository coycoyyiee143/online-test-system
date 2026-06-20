import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../context/QuizContext';
import { saveAnswer, calculateScore } from '../../services/answerService';
import { submitSession } from '../../services/sessionService';
import { logViolation } from '../../services/violationService';
import { saveResult } from '../../services/resultService';
import AntiCheat from '../../utils/antiCheat';
import Timer from '../../components/student/Timer';
import QuestionCard from '../../components/student/QuestionCard';
import QuestionPalette from '../../components/student/QuestionPalette';
import ViolationWarning from '../../components/student/ViolationWarning';

const TakeQuiz = () => {
  const { currentQuiz, currentSession, questions, answers, setAnswers, resetQuiz } = useQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [violationCount, setViolationCount] = useState(currentSession?.violationCount || 0);
  const [showWarning, setShowWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const handleSubmitRef = useRef(null);
  const handleViolationRef = useRef(null);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submittingRef.current) return;
    if (!autoSubmit && !window.confirm('Are you sure you want to submit the quiz?')) return;

    AntiCheat.destroy();
    submittingRef.current = true;
    setSubmitting(true);

    try {
      // Calculate score
      const score = await calculateScore(currentSession.id, questions);

      // Submit session
      await submitSession(currentSession.id);

      // Save result
      await saveResult({
        quizId: currentQuiz.id,
        sessionId: currentSession.id,
        studentName: currentSession.studentName,
        studentId: currentSession.studentId,
        section: currentSession.section,
        totalPoints: score.totalPoints,
        earnedPoints: score.earnedPoints,
        percentage: score.percentage,
        remarks: score.remarks,
        totalViolations: violationCount,
      });

      // Save result to localStorage for result page
      localStorage.setItem('quiz_result', JSON.stringify({
        ...score,
        studentName: currentSession.studentName,
        quizTitle: currentQuiz.title,
      }));

      resetQuiz();
      navigate('/quiz/result');
    } catch (e) {
      console.error('Submit error:', e);
      if (handleViolationRef.current) {
        AntiCheat.init(handleViolationRef.current);
      }
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [currentQuiz, currentSession, questions, violationCount, navigate, resetQuiz]);

  const handleViolation = useCallback(async (type, description) => {
    if (submittingRef.current) return;
    try {
      const newCount = await logViolation(
        currentSession.id,
        currentQuiz.id,
        type,
        description
      );
      setViolationCount(newCount);
      setShowWarning(true);

      if (newCount >= currentQuiz.maxViolations) {
        if (handleSubmitRef.current) {
          handleSubmitRef.current(true);
        }
      }
    } catch (e) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession, currentQuiz]);

  useEffect(() => {
    handleSubmitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    handleViolationRef.current = handleViolation;
  }, [handleViolation]);

  useEffect(() => {
    if (!currentQuiz || !currentSession) {
      navigate('/');
      return;
    }
    AntiCheat.init(handleViolation);
    return () => AntiCheat.destroy();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = useCallback(async (questionId, choiceId, essayAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId || essayAnswer,
    }));
    try {
      await saveAnswer(currentSession.id, questionId, choiceId, essayAnswer);
    } catch (e) {}
  }, [currentSession, setAnswers]);

  if (!currentQuiz || !currentSession) return null;

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-vh-100 bg-light">
      {showWarning && (
        <ViolationWarning
          count={violationCount}
          max={currentQuiz.maxViolations}
          onClose={() => setShowWarning(false)}
        />
      )}

      {/* Header */}
      <div className="bg-primary text-white py-3 px-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0 fw-bold">{currentQuiz.title}</h5>
          <small>{questions.length} Questions</small>
        </div>
        <div className="d-flex align-items-center gap-3">
          {violationCount > 0 && (
            <span className="badge bg-danger fs-6">
              ⚠️ {violationCount} Violation(s)
            </span>
          )}
          <Timer timeLimit={currentQuiz.timeLimit} onExpire={() => handleSubmit(true)} />
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-8">
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswer={handleAnswer}
                index={currentIndex}
                total={questions.length}
              />
            )}
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-outline-primary"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
              >
                ← Previous
              </button>
              {currentIndex < questions.length - 1 ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentIndex((i) => i + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : '✅ Submit Quiz'}
                </button>
              )}
            </div>
          </div>

          <div className="col-lg-4">
            <QuestionPalette
              questions={questions}
              answers={answers}
              currentIndex={currentIndex}
              onJump={setCurrentIndex}
            />
            <div className="card mt-3 shadow-sm">
              <div className="card-body text-center">
                <p className="mb-2 fw-bold">
                  {Object.keys(answers).length} / {questions.length} Answered
                </p>
                <div className="progress">
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${(Object.keys(answers).length / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <button
              className="btn btn-success w-100 mt-3 btn-lg"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : '✅ Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;