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
      const score = await calculateScore(currentSession.id, questions);
      await submitSession(currentSession.id);
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

      localStorage.setItem('quiz_result', JSON.stringify({
        ...score,
        studentName: currentSession.studentName,
        quizTitle: currentQuiz.title,
      }));

      resetQuiz();
      navigate('/quiz/result');
    } catch (e) {
      console.error('Submit error:', e);
      if (handleViolationRef.current) AntiCheat.init(handleViolationRef.current);
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [currentQuiz, currentSession, questions, violationCount, navigate, resetQuiz]);

  const handleViolation = useCallback(async (type, description) => {
    if (submittingRef.current) return;
    try {
      const newCount = await logViolation(currentSession.id, currentQuiz.id, type, description);
      setViolationCount(newCount);
      setShowWarning(true);
      if (newCount >= currentQuiz.maxViolations) {
        if (handleSubmitRef.current) handleSubmitRef.current(true);
      }
    } catch (e) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession, currentQuiz]);

  useEffect(() => { handleSubmitRef.current = handleSubmit; }, [handleSubmit]);
  useEffect(() => { handleViolationRef.current = handleViolation; }, [handleViolation]);

  useEffect(() => {
    if (!currentQuiz || !currentSession) { navigate('/'); return; }
    AntiCheat.init(handleViolation);
    return () => AntiCheat.destroy();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnswer = useCallback(async (questionId, choiceId, essayAnswer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId || essayAnswer }));
    try {
      await saveAnswer(currentSession.id, questionId, choiceId, essayAnswer);
    } catch (e) {}
  }, [currentSession, setAnswers]);

  if (!currentQuiz || !currentSession) return null;

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' }}>
      {showWarning && (
        <ViolationWarning
          count={violationCount}
          max={currentQuiz.maxViolations}
          onClose={() => setShowWarning(false)}
        />
      )}

      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e0e0e0',
        padding: '14px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div>
          <h6 style={{ margin: 0, fontWeight: '700', fontSize: '15px' }}>
            {currentQuiz.title}
          </h6>
          <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
            {questions.length} Questions
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {violationCount > 0 && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              color: '#dc2626',
              fontWeight: '600',
            }}>
              {violationCount} Violation{violationCount > 1 ? 's' : ''}
            </div>
          )}
          <Timer timeLimit={currentQuiz.timeLimit} onExpire={() => handleSubmit(true)} />
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '3px', background: '#f0f0f0' }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: '#000',
          transition: 'width 0.3s',
        }} />
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

          {/* Question Area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                answer={answers[currentQuestion.id]}
                onAnswer={handleAnswer}
                index={currentIndex}
                total={questions.length}
              />
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button
                onClick={() => setCurrentIndex((i) => i - 1)}
                disabled={currentIndex === 0}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  background: currentIndex === 0 ? '#f5f5f5' : '#fff',
                  color: currentIndex === 0 ? '#bbb' : '#000',
                  fontSize: '14px',
                  cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                }}
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#000',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    background: submitting ? '#ccc' : '#000',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ width: '240px', flexShrink: 0 }}>

            {/* Progress Card */}
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid #e0e0e0',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Progress
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700' }}>
                  {answeredCount}/{questions.length}
                </span>
              </div>
              <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: '#000',
                  borderRadius: '999px',
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>

            {/* Question Palette */}
            <QuestionPalette
              questions={questions}
              answers={answers}
              currentIndex={currentIndex}
              onJump={setCurrentIndex}
            />

            {/* Submit Button */}
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              style={{
                width: '100%',
                padding: '13px',
                border: 'none',
                borderRadius: '8px',
                background: submitting ? '#ccc' : '#000',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: submitting ? 'not-allowed' : 'pointer',
                marginTop: '12px',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;