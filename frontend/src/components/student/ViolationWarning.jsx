import React from 'react';

const ViolationWarning = ({ count, max, onClose }) => {
  const remaining = max - count;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-danger">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">⚠️ Warning!</h5>
          </div>
          <div className="modal-body text-center">
            <h4 className="text-danger">Violation Detected!</h4>
            <p className="mb-1">
              You have <strong>{count}</strong> violation(s).
            </p>
            <p className="mb-1">
              <strong>{remaining}</strong> more violation(s) will auto-submit your quiz.
            </p>
            <p className="text-muted small">
              Please stay on the quiz page and avoid switching tabs or copying.
            </p>
          </div>
          <div className="modal-footer justify-content-center">
            <button className="btn btn-danger px-4" onClick={onClose}>
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationWarning;