import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerTeacher } from '../../services/authService';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await registerTeacher(name, email, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow p-5 text-center" style={{ maxWidth: '420px', width: '100%' }}>
          <div style={{ fontSize: '60px' }}>⏳</div>
          <h4 className="fw-bold text-warning mt-3">Account Pending Approval</h4>
          <p className="text-muted">
            Your account has been created and is waiting for admin approval.
            You will be able to login once your account is approved.
          </p>
          <Link to="/teacher/login" className="btn btn-primary mt-2">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow p-4" style={{ maxWidth: '420px', width: '100%' }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '50px' }}>📝</div>
          <h2 className="fw-bold text-primary">QuizSystem</h2>
          <p className="text-muted">Create Teacher Account</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="alert alert-info small">
          ℹ️ Your account will need admin approval before you can login.
        </div>

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label className="form-label fw-bold">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold">Confirm Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted">
            Already have an account?{' '}
            <Link to="/teacher/login" className="text-primary">Login here</Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Register;