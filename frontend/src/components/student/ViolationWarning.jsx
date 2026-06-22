import React from 'react';

const ViolationWarning = ({ count, max, onClose }) => {
  // Convert to valid numbers
  const safeCount = Number(count);
  const safeMax = Number(max);

  const violations = Number.isFinite(safeCount) ? safeCount : 0;
  const maxViolations = Number.isFinite(safeMax) ? safeMax : 0;

  const remaining = Math.max(0, maxViolations - violations);
  const isLast = remaining === 1;

  // Debug (remove kapag okay na)
  console.log({
    count,
    max,
    violations,
    maxViolations,
    remaining,
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '380px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Top Bar */}
        <div
          style={{
            height: '4px',
            background: isLast ? '#dc2626' : '#f59e0b',
          }}
        />

        <div style={{ padding: '28px 24px 24px' }}>
          {/* Icon */}
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: isLast ? '#fef2f2' : '#fffbeb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              marginBottom: '16px',
            }}
          >
            {isLast ? '🔴' : '⚠️'}
          </div>

          <h5
            style={{
              fontSize: '17px',
              fontWeight: '700',
              margin: '0 0 8px 0',
              color: '#111',
            }}
          >
            Violation Detected
          </h5>

          <p
            style={{
              fontSize: '13px',
              color: '#555',
              lineHeight: '1.6',
              margin: '0 0 16px 0',
            }}
          >
            This action has been recorded as a violation.
            Please stay on this page and avoid prohibited actions.
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                flex: 1,
                background: '#fafafa',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center',
                border: '1px solid #f0f0f0',
              }}
            >
              <p
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  margin: 0,
                  color: '#dc2626',
                }}
              >
                {violations}
              </p>

              <p
                style={{
                  fontSize: '11px',
                  color: '#888',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Violations
              </p>
            </div>

            <div
              style={{
                flex: 1,
                background: '#fafafa',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'center',
                border: '1px solid #f0f0f0',
              }}
            >
              <p
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  margin: 0,
                  color: isLast ? '#dc2626' : '#d97706',
                }}
              >
                {remaining}
              </p>

              <p
                style={{
                  fontSize: '11px',
                  color: '#888',
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Remaining
              </p>
            </div>
          </div>

          {isLast && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#dc2626',
                marginBottom: '20px',
                fontWeight: '500',
              }}
            >
              One more violation will automatically submit your quiz.
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '13px',
              border: 'none',
              borderRadius: '8px',
              background: '#000',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViolationWarning;