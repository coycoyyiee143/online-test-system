import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
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
        const res = await api.get(`/quizzes/${id}/results`);
        setData(res.data);
      } catch (e) {}
    };
    fetchResults();
  }, [id]);

  if (!data) return <div className="text-center mt-5">Loading...</div>;

  const { results, stats } = data;

  // Get unique sections
  const sections = [...new Set(results.map((r) => r.section).filter(Boolean))];

  const filtered = results.filter((r) => {
    const matchSearch =
      r.student_name.toLowerCase().includes(search.toLowerCase()) ||
      r.student_id.toLowerCase().includes(search.toLowerCase());
    const matchSection = filterSection === '' || r.section === filterSection;
    const matchRemarks = filterRemarks === 'all' || r.remarks === filterRemarks;
    return matchSearch && matchSection && matchRemarks;
  });

  const handleExport = () => {
    const headers = ['Student Name', 'Student ID', 'Section', 'Score', 'Percentage', 'Remarks', 'Violations'];
    const rows = filtered.map((r) => [
      r.student_name,
      r.student_id,
      r.section || '-',
      `${r.earned_points}/${r.total_points}`,
      `${r.percentage}%`,
      r.remarks,
      r.total_violations,
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

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(`/teacher/quiz/${id}`)}
          >
            ← Back
          </button>
          <button className="btn btn-success btn-sm" onClick={handleExport}>
            📥 Export CSV
          </button>
        </div>

        <h3 className="fw-bold mb-4">📊 Quiz Results</h3>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: 'Total Takers', value: stats.total_takers, color: 'primary', icon: '👥' },
            { label: 'Average Score', value: `${stats.average_score}%`, color: 'info', icon: '📈' },
            { label: 'Highest Score', value: `${stats.highest_score}%`, color: 'success', icon: '🏆' },
            { label: 'Lowest Score', value: `${stats.lowest_score}%`, color: 'warning', icon: '📉' },
            { label: 'Passed', value: stats.passed, color: 'success', icon: '✅' },
            { label: 'Failed', value: stats.failed, color: 'danger', icon: '❌' },
          ].map((stat) => (
            <div key={stat.label} className="col-6 col-md-4 col-lg-2">
              <div className={`card text-center border-${stat.color} shadow-sm`}>
                <div className="card-body py-3">
                  <div className="fs-4">{stat.icon}</div>
                  <div className={`fs-4 fw-bold text-${stat.color}`}>{stat.value}</div>
                  <small className="text-muted">{stat.label}</small>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="row g-2 mb-3">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="🔍 Search by name or student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className="form-select"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={filterRemarks}
              onChange={(e) => setFilterRemarks(e.target.value)}
            >
              <option value="all">All Remarks</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Results Table */}
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white fw-bold d-flex justify-content-between">
            <span>Student Results</span>
            <span className="badge bg-light text-primary">{filtered.length} records</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Student ID</th>
                  <th>Section</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Remarks</th>
                  <th>Violations</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No results found
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, index) => (
                    <tr key={r.id}>
                      <td>{index + 1}</td>
                      <td>{r.student_name}</td>
                      <td>{r.student_id}</td>
                      <td>{r.section || '-'}</td>
                      <td>{r.earned_points} / {r.total_points}</td>
                      <td>
                        <div className="progress" style={{ height: '20px', minWidth: '100px' }}>
                          <div
                            className={`progress-bar ${r.percentage >= 60 ? 'bg-success' : 'bg-danger'}`}
                            style={{ width: `${r.percentage}%` }}
                          >
                            {r.percentage}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${r.remarks === 'Passed' ? 'bg-success' : 'bg-danger'}`}>
                          {r.remarks}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${r.total_violations > 0 ? 'bg-danger' : 'bg-secondary'}`}>
                          {r.total_violations}
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