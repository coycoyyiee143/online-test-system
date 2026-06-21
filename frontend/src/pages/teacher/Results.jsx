import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResultsByQuiz } from '../../services/resultService';
import Navbar from '../../components/teacher/Navbar';

const Results = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [filterRemarks, setFilterRemarks] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await getResultsByQuiz(id);
        setData(res);
      } catch (e) {}
    };
    fetchResults();
  }, [id]);

  if (!data) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid #e0e0e0', borderTop: '3px solid #000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const { results, stats } = data;
  const sections = [...new Set(results.map((r) => r.section).filter(Boolean))];

  const filtered = results.filter((r) => {
    const matchSearch =
      r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      r.studentId?.toLowerCase().includes(search.toLowerCase());
    const matchSection = filterSection === '' || r.section === filterSection;
    const matchRemarks = filterRemarks === 'all' || r.remarks === filterRemarks;
    return matchSearch && matchSection && matchRemarks;
  });

  const handleExport = () => {
    const headers = ['Student Name', 'Student ID', 'Section', 'Score', 'Percentage', 'Remarks', 'Violations'];
    const rows = filtered.map((r) => [
      r.studentName, r.studentId, r.section || '-',
      `${r.earnedPoints}/${r.totalPoints}`,
      `${r.percentage}%`, r.remarks, r.totalViolations,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_results_${id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const s = {
    page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Inter, sans-serif' },
    container: { maxWidth: '1100px', margin: '0 auto', padding: '28px 20px' },
    tableWrap: { background: '#fff', borderRadius: '12px', border: '1px solid #e0e0e0', overflow: 'hidden' },
    th: {
      padding: '12px 16px', fontSize: '11px', fontWeight: '700',
      textTransform: 'uppercase', letterSpacing: '0.5px', color: '#888',
      borderBottom: '1px solid #f0f0f0', textAlign: 'left', background: '#fafafa',
    },
    td: { padding: '14px 16px', fontSize: '13px', color: '#333', borderBottom: '1px solid #f5f5f5' },
    input: {
      border: '1px solid #e0e0e0', borderRadius: '8px', padding: '9px 14px',
      fontSize: '13px', outline: 'none', background: '#fff',
      fontFamily: 'Inter, sans-serif', width: '100%', boxSizing: 'border-box',
    },
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.container}>

        {/* Top Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => navigate(`/teacher/quiz/${id}`)}
            style={{ border: 'none', background: 'none', fontSize: '13px', color: '#888', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif' }}
          >
            ← Back
          </button>
          <button
            onClick={handleExport}
            style={{
              padding: '8px 16px', border: 'none', borderRadius: '8px',
              background: '#000', color: '#fff', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
            }}
          >
            Export CSV
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Quiz Results</h4>
          <p style={{ fontSize: '13px', color: '#888', margin: '4px 0 0 0' }}>
            View and analyze student performance
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Takers', value: stats.total_takers },
            { label: 'Average Score', value: `${stats.average_score}%` },
            { label: 'Highest Score', value: `${stats.highest_score}%` },
            { label: 'Lowest Score', value: `${stats.lowest_score}%` },
            { label: 'Passed', value: stats.passed },
            { label: 'Failed', value: stats.failed },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                flex: 1, minWidth: '100px', background: '#fff',
                borderRadius: '12px', padding: '16px', border: '1px solid #e0e0e0', textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 4px 0', color: '#111' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...s.input, flex: 2, minWidth: '200px' }}
          />
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            style={{ ...s.input, flex: 1, minWidth: '140px', cursor: 'pointer' }}
          >
            <option value="">All Sections</option>
            {sections.map((sec) => <option key={sec} value={sec}>{sec}</option>)}
          </select>
          <select
            value={filterRemarks}
            onChange={(e) => setFilterRemarks(e.target.value)}
            style={{ ...s.input, flex: 1, minWidth: '140px', cursor: 'pointer' }}
          >
            <option value="all">All Remarks</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        {/* Table */}
        <div style={s.tableWrap}>
          {/* Table Header */}
          <div style={{
            padding: '14px 16px', borderBottom: '1px solid #f0f0f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <p style={{ fontSize: '13px', fontWeight: '700', margin: 0 }}>Student Results</p>
            <span style={{
              fontSize: '12px', fontWeight: '600', padding: '3px 10px',
              borderRadius: '999px', background: '#f0f0f0', color: '#555',
            }}>
              {filtered.length} records
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Student Name', 'Student ID', 'Section', 'Score', 'Percentage', 'Remarks', 'Violations'].map((h) => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ ...s.td, textAlign: 'center', color: '#aaa', padding: '32px' }}>
                      No results found
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, index) => (
                    <tr key={r.id}>
                      <td style={s.td}>{index + 1}</td>
                      <td style={{ ...s.td, fontWeight: '600' }}>{r.studentName}</td>
                      <td style={s.td}>{r.studentId}</td>
                      <td style={s.td}>{r.section || '-'}</td>
                      <td style={s.td}>{r.earnedPoints} / {r.totalPoints}</td>
                      <td style={s.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', background: '#f0f0f0', borderRadius: '999px', overflow: 'hidden', minWidth: '80px' }}>
                            <div style={{
                              height: '100%',
                              width: `${r.percentage}%`,
                              background: r.percentage >= 60 ? '#16a34a' : '#dc2626',
                              borderRadius: '999px',
                            }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#333', flexShrink: 0 }}>
                            {r.percentage}%
                          </span>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={{
                          fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px',
                          background: r.remarks === 'Passed' ? '#f0fdf4' : '#fef2f2',
                          color: r.remarks === 'Passed' ? '#16a34a' : '#dc2626',
                          border: `1px solid ${r.remarks === 'Passed' ? '#86efac' : '#fca5a5'}`,
                        }}>
                          {r.remarks}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{
                          fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '6px',
                          background: r.totalViolations > 0 ? '#fef2f2' : '#fafafa',
                          color: r.totalViolations > 0 ? '#dc2626' : '#888',
                          border: `1px solid ${r.totalViolations > 0 ? '#fca5a5' : '#e0e0e0'}`,
                        }}>
                          {r.totalViolations}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;