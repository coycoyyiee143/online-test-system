import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AntiCheat from '../../utils/antiCheat';
import Timer from '../../components/student/Timer';
import QuestionCard from '../../components/student/QuestionCard';
import QuestionPalette from '../../components/student/QuestionPalette';
import ViolationWarning from '../../components/student/ViolationWarning';

const TakeQuiz = () => {
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [violationCount, setViolationCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submittingRef.current) return;
    if (!autoSubmit && !window.confirm('Are you sure you want to submit the quiz?')) return;

    // I-destroy muna AntiCheat bago mag-submit
    AntiCheat.destroy();
    submittingRef.current = true;
    setSubmitting(true);

    const token = localStorage.getItem('session_token');

    try {
      const res = await api.post('/session/submit', { session_token: token });
      localStorage.setItem('quiz_result', JSON.stringify(res.data.result));
      localStorage.removeItem('session_token');
      localStorage.removeItem('quiz_data');
      navigate('/quiz/result');
    } catch (e) {
      console.error('Submit error:', e);
      // Kung may error, i-reinit
      AntiCheat.init(handleViolation);
      submittingRef.current = false;
      setSubmitting(false);
    }
  }, [navigate]);

  const handleViolation = useCallback(async (type, description) => {
    if (submittingRef.current) return; // wag mag-log ng violation kung nag-su-submit na
    const token = localStorage.getItem('session_token');
    try {
      const res = await api.post('/violation', {
        session_token: token,
        violation_type: type,
        description,
      });

      setViolationCount(res.data.violation_count);
      setShowWarning(true);

      if (res.data.auto_submit) {
        handleSubmit(true);
      }
    } catch (e) {}
  }, [handleSubmit]);

  useEffect(() => {
    const data = localStorage.getItem('quiz_data');
    const token = localStorage.getItem('session_token');

    if (!data || !token) {
      navigate('/');
      return;
    }

    const parsed = JSON.parse(data);
    setQuizData(parsed);
    setQuestions(parsed.questions || []);

    // Restore saved answers kung nag-resume
    if (parsed.is_resumed && parsed.saved_answers) {
      const restored = {};
      Object.values(parsed.saved_answers).forEach((ans) => {
        if (ans.choice_id) {
          restored[ans.question_id] = ans.choice_id;
        } else if (ans.essay_answer) {
          restored[ans.question_id] = ans.essay_answer;
        }
      });
      setAnswers(restored);
    }

    AntiCheat.init(handleViolation);

    return () => AntiCheat.destroy();
  }, [navigate, handleViolation]);

  const handleAnswer = useCallback(async (questionId, choiceId, essayAnswer) => {
    const token = localStorage.getItem('session_token');

    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId || essayAnswer,
    }));

    try {
      await api.post('/session/answer', {
        session_token: token,
        question_id: questionId,
        choice_id: choiceId,
        essay_answer: essayAnswer,
      });
    } catch (e) {}
  }, []);

  if (!quizData) return <div className="text-center mt-5">Loading quiz...</div>;

  const currentQuestion = questions[currentIndex];
  const quiz = quizData.quiz;

  return (
    <div className="min-vh-100 bg-light">
      {showWarning && (
        <ViolationWarning
          count={violationCount}
          max={quiz.max_violations}
          onClose={() => setShowWarning(false)}
        />
      )}

      {/* Header */}
      <div className="bg-primary text-white py-3 px-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="mb-0 fw-bold">{quiz.title}</h5>
          <small>{questions.length} Questions</small>
        </div>
        <div className="d-flex align-items-center gap-3">
          {violationCount > 0 && (
            <span className="badge bg-danger fs-6">
              ⚠️ {violationCount} Violation(s)
            </span>
          )}
          <Timer timeLimit={quiz.time_limit} onExpire={() => handleSubmit(true)} />
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          {/* Question */}
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

            {/* Navigation */}
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

          {/* Sidebar */}
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