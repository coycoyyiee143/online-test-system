import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Navbar from '../../components/teacher/Navbar';

const CreateQuiz = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    time_limit: 30,
    max_violations: 3,
    randomize_questions: false,
    randomize_choices: false,
    available_from: '',
    available_until: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/quizzes', form);
      navigate(`/teacher/quiz/${res.data.quiz.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating quiz');
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
                    value={form.time_limit}
                    onChange={(e) => setForm({ ...form, time_limit: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Max Violations</label>
                  <input
                    type="number"
                    className="form-control"
                    min={1}
                    value={form.max_violations}
                    onChange={(e) => setForm({ ...form, max_violations: parseInt(e.target.value) })}
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
                    value={form.available_from}
                    onChange={(e) => setForm({ ...form, available_from: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold">Available Until</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={form.available_until}
                    onChange={(e) => setForm({ ...form, available_until: e.target.value })}
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
                      checked={form.randomize_questions}
                      onChange={(e) => setForm({ ...form, randomize_questions: e.target.checked })}
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
                      checked={form.randomize_choices}
                      onChange={(e) => setForm({ ...form, randomize_choices: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="randomC">
                      Randomize Choices
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 btn-lg"
                disabled={loading}
              >
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