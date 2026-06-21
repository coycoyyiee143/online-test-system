import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivityLog } from '../../services/adminActivityService';
import AdminNavbar from '../../components/admin/Navbar';

const ActivityLog = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getActivityLog();
        setLogs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const actionLabels = {
    teacher_approved: { label: 'Teacher Approved', bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
    teacher_rejected: { label: 'Teacher Rejected', bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
    quiz_deleted: { label: 'Quiz Deleted', bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  };

  const actionTypes = [...new Set(logs.map((l) => l.action))];

  const filtered = logs.filter((log) => {
    const matchSearch =
      log.adminName?.toLowerCase().includes(search.toLowerCase()) ||
      log.targetName?.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'all' || log.action === filterAction;
    return matchSearch && matchAction;
  });

  const formatDateTime = (value) => {
    if (!value) return '-';
    if (value?.toDate) return new Date(value.toDate()).toLocaleString();
    return value;
  };

  const s = {
    page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: '900px', margin: '0 auto', padding: '28px 20px' },
    input: {
      border: '1px solid #e0e0e0', borderRadius: '8px', padding: '9px 14px',
      fontSize: '13px', outline: 'none', background: '#fff',
      fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box',
    },
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #e0e0e0', borderTop: '3px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={s.page}>
      <AdminNavbar />
      <div style={s.container}>

        {/* Back */}
        <button
          onClick={() => navigate('/admin/dashboard')}
          style={{ border: 'none', background: 'none', fontSize: '13px', color: '#888', cursor: 'pointer', padding: '0 0 16px 0', fontFamily: 'Inter, sans-serif' }}
        >
          ← Back to Dashboard
        </button>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Activity Log</h4>
          <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0 0' }}>
            Track admin actions across the platform
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by admin or target name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...s.input, flex: 2, minWidth: '200px' }}
          />
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            style={{ ...s.input, flex: 1, minWidth: '160px', cursor: 'pointer' }}
          >
            <option value="all">All Actions</option>
            {actionTypes.map((type) => (
              <option key={type} value={type}>
                {actionLabels[type]?.label || type}
              </option>
            ))}
          </select>
        </div>

        {/* Log List */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '48px 0', color: '#aaa',
            background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0',
          }}>
            <p style={{ fontSize: '14px', margin: 0 }}>
              {logs.length === 0 ? 'No activity recorded yet' : 'No results match your search'}
            </p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' }}>
            {filtered.map((log, i) => {
              const meta = actionLabels[log.action] || { label: log.action, bg: '#f0f0f0', color: '#555', border: '#e0e0e0' };
              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '16px 20px',
                    borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #f0f0f0',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '6px',
                        background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
                      }}>
                        {meta.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#333', margin: 0 }}>
                      <strong>{log.adminName || 'Unknown admin'}</strong>
                      {' '}acted on{' '}
                      <strong>{log.targetName || 'unknown'}</strong>
                    </p>
                  </div>
                  <span style={{ fontSize: '12px', color: '#aaa', flexShrink: 0, whiteSpace: 'nowrap' }}>
                    {formatDateTime(log.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;