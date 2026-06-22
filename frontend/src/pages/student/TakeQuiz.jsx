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
        totalViolations: violationCount ?? 0,
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
      const newCount = await logViolation(
        currentSession.id,
        currentQuiz.id,
        type,
        description
      );

      setViolationCount(newCount ?? 0);
      setShowWarning(true);
      if (newCount >= currentQuiz.maxViolations) {
        if (handleSubmitRef.current) handleSubmitRef.current(true);
      }
    } catch (e) { }
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
    } catch (e) { }
  }, [currentSession, setAnswers]);

  if (!currentQuiz || !currentSession) return null;

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
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
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div>
          <h6 style={{ margin: 0, fontWeight: '700', fontSize: '14px', lineHeight: 1.3 }}>
            {currentQuiz.title}
          </h6>
          <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
            {questions.length} Questions
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {violationCount > 0 && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: '20px', padding: '3px 10px',
              fontSize: '11px', color: '#dc2626', fontWeight: '600',
            }}>
              {violationCount} Violation{violationCount > 1 ? 's' : ''}
            </div>
          )}
          <Timer timeLimit={currentQuiz.timeLimit} onExpire={() => handleSubmit(true)} />
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: '3px', background: '#f0f0f0', flexShrink: 0 }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: '#000', transition: 'width 0.3s',
        }} />
      </div>

      {/* Body */}
      <div style={{
        flex: 1,
        maxWidth: '720px',
        width: '100%',
        margin: '0 auto',
        padding: '16px 14px 100px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>

        {/* Question meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '12px', color: '#888',
            background: '#f0f0f0', borderRadius: '20px', padding: '3px 10px',
          }}>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span style={{ fontSize: '12px', color: '#888' }}>
            {answeredCount} answered
          </span>
        </div>

        {/* Question card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            answer={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
            index={currentIndex}
            total={questions.length}
          />
        )}

        {/* Question Palette — always visible */}
        <div style={{
          background: '#fff',
          border: '1px solid #e8e8e8',
          borderRadius: '12px',
          padding: '14px',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '12px',
          }}>
            <span style={{
              fontSize: '11px', fontWeight: '700', color: '#888',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              All Questions
            </span>
            <span style={{ fontSize: '11px', color: '#888' }}>
              {answeredCount} / {questions.length} answered
            </span>
          </div>

          <QuestionPalette
            questions={questions}
            answers={answers}
            currentIndex={currentIndex}
            onJump={setCurrentIndex}
          />

          {/* Legend */}
          <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
            {[
              { label: 'Answered', style: { background: '#000', borderRadius: '3px', width: 12, height: 12 } },
              { label: 'Current', style: { border: '1.5px solid #000', borderRadius: '3px', width: 12, height: 12 } },
              { label: 'Skipped', style: { border: '1px solid #ccc', borderRadius: '3px', width: 12, height: 12 } },
            ].map(({ label, style }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={style} />
                <span style={{ fontSize: '10px', color: '#888' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        background: '#fff',
        borderTop: '1px solid #e0e0e0',
        padding: '10px 14px',
        display: 'flex',
        gap: '8px',
        zIndex: 100,
      }}>
        <button
          onClick={() => setCurrentIndex((i) => i - 1)}
          disabled={isFirst}
          style={{
            flex: 1, padding: '11px',
            border: '1px solid #e0e0e0', borderRadius: '8px',
            background: isFirst ? '#f5f5f5' : '#fff',
            color: isFirst ? '#bbb' : '#000',
            fontSize: '13px', fontWeight: '500',
            cursor: isFirst ? 'not-allowed' : 'pointer',
          }}
        >
          ← Prev
        </button>

        {isLast ? (
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            style={{
              flex: 2, padding: '11px',
              border: 'none', borderRadius: '8px',
              background: submitting ? '#ccc' : '#000',
              color: '#fff', fontSize: '13px', fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            style={{
              flex: 2, padding: '11px',
              border: 'none', borderRadius: '8px',
              background: '#000', color: '#fff',
              fontSize: '13px', fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default TakeQuiz;