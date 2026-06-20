import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createQuiz } from '../../services/quizService';
import Navbar from '../../components/teacher/Navbar';

const CreateQuiz = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    timeLimit: 30,
    maxViolations: 3,
    randomizeQuestions: false,
    randomizeChoices: false,
    availableFrom: '',
    availableUntil: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { id } = await createQuiz(user.uid, form);
      navigate(`/teacher/quiz/${id}`);
    } catch (err) {
      setError(err.message || 'Error creating quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4" style={{ maxWidth: '700px' }}>
        <button
          className="btn btn-outline-secondary btn-sm mb-3"
          onClick={() => navigate('/teacher/dashboard')}
        >
          ← Back to Dashboard
        </button>
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white fw-bold fs-5">
            Create New Quiz
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter quiz title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Enter quiz description (optional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Time Limit (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={form.timeLimit}
                    onChange={(e) => setForm({ ...form, timeLimit: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Max Violations</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={form.maxViolations}
                    onChange={(e) => setForm({ ...form, maxViolations: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-bold">Available From</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.availableFrom}
                    onChange={(e) => setForm({ ...form, availableFrom: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Available Until</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.availableUntil}
                    onChange={(e) => setForm({ ...form, availableUntil: e.target.value })}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label fw-bold">Options</label>
                <div className="d-flex gap-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="randomQ"
                      checked={form.randomizeQuestions}
                      onChange={(e) => setForm({ ...form, randomizeQuestions: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="randomQ">
                      Randomize Questions
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="randomC"
                      checked={form.randomizeChoices}
                      onChange={(e) => setForm({ ...form, randomizeChoices: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="randomC">
                      Randomize Choices
                    </label>
                  </div>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
                {loading ? 'Creating...' : 'Create Quiz'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;