import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  X,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
} from 'lucide-react';
import { MOCK_EXAM_RESULTS, MOCK_EXAMS } from '@/mocks/examMockData';
import { MOCK_USERS } from '@/mocks/users';
import { EmployeeExamResultSummary, TargetExamRole } from '@/types/exam';
import { exportExamResultsCsv } from '@/utils/excel';

const ALL_ROLES: TargetExamRole[] = [
  'Customer',
  'GS',
  'TL',
  'PG-D',
  'PG-Inline',
  'PG-G',
  'SUP-D',
  'SUP-G',
  'TBHV',
];

export const ExamResultPage: React.FC = () => {
  const [results] = useState<EmployeeExamResultSummary[]>(MOCK_EXAM_RESULTS);

  // Search Filters
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterExamId, setFilterExamId] = useState('');
  const [filterSupervisorId, setFilterSupervisorId] = useState('');
  const [filterPosition, setFilterPosition] = useState('');

  // Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: '',
    toDate: '',
    examId: '',
    supervisorId: '',
    position: '',
  });

  // Inline table filters
  const [inlineFilters, setInlineFilters] = useState({
    supervisorName: '',
    employeeCode: '',
    employeeName: '',
    position: '',
    examName: '',
    attemptDateRange: '',
    attemptCount: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Expanded Result Rows
  const [expandedResultIds, setExpandedResultIds] = useState<Record<string, boolean>>({});

  // Supervisors for dropdown
  const supervisors = useMemo(() => {
    return MOCK_USERS.filter((u) => u.currentPosition === 'Supervisor' || u.currentPosition === 'Admin');
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedResultIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = () => {
    setAppliedFilters({
      fromDate: filterFromDate,
      toDate: filterToDate,
      examId: filterExamId,
      supervisorId: filterSupervisorId,
      position: filterPosition,
    });
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilterFromDate('');
    setFilterToDate('');
    setFilterExamId('');
    setFilterSupervisorId('');
    setFilterPosition('');
    setInlineFilters({
      supervisorName: '',
      employeeCode: '',
      employeeName: '',
      position: '',
      examName: '',
      attemptDateRange: '',
      attemptCount: '',
    });
    setAppliedFilters({
      fromDate: '',
      toDate: '',
      examId: '',
      supervisorId: '',
      position: '',
    });
    setCurrentPage(1);
  };

  // Filtered Results
  const filteredResults = useMemo(() => {
    return results.filter((r) => {
      if (appliedFilters.examId && r.examId !== appliedFilters.examId) return false;
      if (appliedFilters.supervisorId && r.supervisorId !== appliedFilters.supervisorId) return false;
      if (appliedFilters.position && r.position !== appliedFilters.position) return false;
      if (appliedFilters.fromDate && r.examFromDate < appliedFilters.fromDate) return false;
      if (appliedFilters.toDate && r.examToDate && r.examToDate > appliedFilters.toDate) return false;

      // Inline filters
      if (inlineFilters.supervisorName && !r.supervisorName.toLowerCase().includes(inlineFilters.supervisorName.toLowerCase())) return false;
      if (inlineFilters.employeeCode && !r.employeeCode.toLowerCase().includes(inlineFilters.employeeCode.toLowerCase())) return false;
      if (inlineFilters.employeeName && !r.employeeName.toLowerCase().includes(inlineFilters.employeeName.toLowerCase())) return false;
      if (inlineFilters.position && !r.position.toLowerCase().includes(inlineFilters.position.toLowerCase())) return false;
      if (inlineFilters.examName && !r.examName.toLowerCase().includes(inlineFilters.examName.toLowerCase())) return false;
      if (inlineFilters.attemptDateRange && !r.attemptDateRange.toLowerCase().includes(inlineFilters.attemptDateRange.toLowerCase())) return false;
      if (inlineFilters.attemptCount && String(r.attemptCount) !== inlineFilters.attemptCount.trim()) return false;

      return true;
    });
  }, [results, appliedFilters, inlineFilters]);

  // Pagination calculation
  const totalEntries = filteredResults.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalEntries, currentPage * pageSize);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  return (
    <div>
      {/* 4.1 Collapsible Search & Action Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsSearchCollapsed(!isSearchCollapsed)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsSearchCollapsed(!isSearchCollapsed);
          }}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            padding: '10px 16px',
            fontWeight: 700,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          {isSearchCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          <span>Search</span>
        </div>

        {!isSearchCollapsed && (
          <div style={{ padding: '16px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {/* Date Range */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  Date Range
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                  <span>-</span>
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>

              {/* Exam */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  Exam
                </label>
                <select
                  value={filterExamId}
                  onChange={(e) => setFilterExamId(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select exam</option>
                  {MOCK_EXAMS.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.examName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supervisor */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  Supervisor
                </label>
                <select
                  value={filterSupervisorId}
                  onChange={(e) => setFilterSupervisorId(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select supervisor</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  Position
                </label>
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select position</option>
                  {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Toolbar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleSearch}
                  style={{
                    height: '32px',
                    padding: '0 14px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Search size={15} /> Search
                </button>
                <button
                  type="button"
                  onClick={() => exportExamResultsCsv(filteredResults)}
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    backgroundColor: 'var(--color-success-accent)',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={15} /> Export File
                </button>
              </div>

              <button
                type="button"
                onClick={handleClear}
                title="Clear filters"
                style={{
                  height: '32px',
                  width: '32px',
                  backgroundColor: 'var(--bg-canvas)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4.2 Exam Result Summary Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Pagination Bar */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
            Showing {startIndex} to {endIndex} of {totalEntries} entries
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(1)}
                style={{ width: '28px', height: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                style={{ width: '28px', height: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '13px', padding: '0 8px' }}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{ width: '28px', height: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                style={{ width: '28px', height: '28px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronsRight size={14} />
              </button>
            </div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ height: '28px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ width: '40px', padding: '8px' }}></th>
                <th style={{ width: '45px', padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>No.</th>
                <th style={{ padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>Sup</th>
                <th style={{ padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>Employee Code</th>
                <th style={{ padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>Employee Name</th>
                <th style={{ padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>Position</th>
                <th style={{ padding: '8px', color: 'var(--color-primary)', fontWeight: 700, textAlign: 'left' }}>Exam Name</th>
                <th style={{ padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>Date</th>
                <th style={{ width: '80px', padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>Attempts</th>
              </tr>
              {/* Inline quick-filters */}
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '2px solid var(--border-color)' }}>
                <th></th>
                <th></th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={inlineFilters.supervisorName}
                    onChange={(e) => setInlineFilters((prev) => ({ ...prev, supervisorName: e.target.value }))}
                    style={{ width: '100%', height: '26px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={inlineFilters.employeeCode}
                    onChange={(e) => setInlineFilters((prev) => ({ ...prev, employeeCode: e.target.value }))}
                    style={{ width: '100%', height: '26px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={inlineFilters.employeeName}
                    onChange={(e) => setInlineFilters((prev) => ({ ...prev, employeeName: e.target.value }))}
                    style={{ width: '100%', height: '26px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={inlineFilters.position}
                    onChange={(e) => setInlineFilters((prev) => ({ ...prev, position: e.target.value }))}
                    style={{ width: '100%', height: '26px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={inlineFilters.examName}
                    onChange={(e) => setInlineFilters((prev) => ({ ...prev, examName: e.target.value }))}
                    style={{ width: '100%', height: '26px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    placeholder="Filter..."
                    value={inlineFilters.attemptDateRange}
                    onChange={(e) => setInlineFilters((prev) => ({ ...prev, attemptDateRange: e.target.value }))}
                    style={{ width: '100%', height: '26px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    placeholder="Qty"
                    value={inlineFilters.attemptCount}
                    onChange={(e) => setInlineFilters((prev) => ({ ...prev, attemptCount: e.target.value }))}
                    style={{ width: '100%', height: '26px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', color: 'var(--text-secondary)' }}>
                    No exam results found.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((result, idx) => {
                  const isExpanded = Boolean(expandedResultIds[result.id]);

                  // STRICT Latest-Attempt Rule per SPEC-07 Section 1 & Section 4.2:
                  // Select ONLY the single most recent attempt (highest submittedAt)
                  const latestAttempt = [...result.attempts].sort(
                    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                  )[0];

                  // Corresponding ExamItem to render questions in order
                  const examDef = MOCK_EXAMS.find((e) => e.id === result.examId);

                  return (
                    <React.Fragment key={result.id}>
                      <tr
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: isExpanded ? 'var(--color-primary-soft-bg)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '8px' }}>
                          <button
                            type="button"
                            onClick={() => toggleExpand(result.id)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: '1px solid var(--border-color)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </td>
                        <td style={{ padding: '8px' }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                        <td style={{ padding: '8px' }}>{result.supervisorName}</td>
                        <td style={{ padding: '8px', fontWeight: 600, color: 'var(--color-primary)' }}>
                          {result.employeeCode}
                        </td>
                        <td style={{ padding: '8px', fontWeight: 500 }}>{result.employeeName}</td>
                        <td style={{ padding: '8px' }}>{result.position}</td>
                        <td style={{ padding: '8px', textAlign: 'left' }}>
                          {result.examName} ({result.examFromDate} {result.examToDate ? `- ${result.examToDate}` : ''})
                        </td>
                        <td style={{ padding: '8px' }}>{result.attemptDateRange}</td>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{result.attemptCount}</td>
                      </tr>

                      {/* Expandable Latest Attempt Detail Panel */}
                      {isExpanded && latestAttempt && examDef && (
                        <tr>
                          <td
                            colSpan={9}
                            style={{
                              padding: '16px',
                              backgroundColor: '#FAFAFA',
                              textAlign: 'left',
                              borderBottom: '2px solid var(--border-color)',
                            }}
                          >
                            {/* Header Badge */}
                            <div
                              style={{
                                padding: '10px 16px',
                                backgroundColor: 'var(--color-primary-soft-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                              }}
                            >
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                                Submitted At: {latestAttempt.submittedAt}
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                                Score: {latestAttempt.score}/{latestAttempt.totalWeight}
                              </div>
                            </div>

                            {/* Question-by-Question Answer Breakdown with 4 Distinct Color Highlight Rules */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              {examDef.questions.map((q) => {
                                const empAns = latestAttempt.answers.find((a) => a.questionId === q.questionId);
                                const selectedAnswerId = empAns ? empAns.selectedAnswerId : null;

                                return (
                                  <div
                                    key={q.questionId}
                                    style={{
                                      padding: '12px',
                                      backgroundColor: 'var(--bg-surface)',
                                      border: '1px solid var(--border-color)',
                                      borderRadius: 'var(--radius-sm)',
                                    }}
                                  >
                                    {/* Question Title */}
                                    <div
                                      style={{
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        color: '#1B5E20',
                                        marginBottom: '8px',
                                        borderBottom: '1px solid var(--border-color)',
                                        paddingBottom: '4px',
                                      }}
                                    >
                                      Question {q.orderNo}: {q.questionText}
                                    </div>

                                    {/* Options List with Highlight Rules */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {q.options.map((opt) => {
                                        const isSelected = selectedAnswerId === opt.answerId;
                                        const isCorrect = opt.isCorrect;

                                        // Rule 1: Correct Answer (Not Selected by Employee) -> Amber/Orange #D97706 + (Correct Answer)
                                        // Rule 2: Employee Selected & Correct -> Green var(--color-success-accent) + (Selected - Correct)
                                        // Rule 3: Employee Selected & Incorrect -> Red var(--color-primary) + (Selected - Incorrect)
                                        // Rule 4: Unselected & Incorrect -> Neutral text
                                        let textColor = 'var(--text-primary)';
                                        let fontWeight = 400;
                                        let badgeText = '';
                                        let badgeColor = '';
                                        let badgeBg = '';

                                        if (isSelected && isCorrect) {
                                          textColor = 'var(--color-success-accent)';
                                          fontWeight = 700;
                                          badgeText = '(Selected - Correct)';
                                          badgeColor = 'var(--color-success-accent)';
                                          badgeBg = '#E8F5E9';
                                        } else if (isSelected && !isCorrect) {
                                          textColor = 'var(--color-primary)';
                                          fontWeight = 700;
                                          badgeText = '(Selected - Incorrect)';
                                          badgeColor = 'var(--color-primary)';
                                          badgeBg = 'var(--color-primary-soft-bg)';
                                        } else if (!isSelected && isCorrect) {
                                          textColor = '#D97706';
                                          fontWeight = 700;
                                          badgeText = '(Correct Answer)';
                                          badgeColor = '#D97706';
                                          badgeBg = '#FEF3C7';
                                        }

                                        return (
                                          <div
                                            key={opt.answerId}
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'space-between',
                                              gap: '8px',
                                              fontSize: '12px',
                                              color: textColor,
                                              fontWeight,
                                              padding: '4px 6px',
                                              borderRadius: 'var(--radius-sm)',
                                              backgroundColor: isSelected ? badgeBg : 'transparent',
                                            }}
                                          >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                style={{
                                                  cursor: 'default',
                                                  accentColor: isSelected
                                                    ? isCorrect
                                                      ? 'var(--color-success-accent)'
                                                      : 'var(--color-primary)'
                                                    : undefined,
                                                }}
                                              />
                                              <span>{opt.answerText}</span>
                                            </div>

                                            {badgeText && (
                                              <span
                                                style={{
                                                  padding: '2px 8px',
                                                  borderRadius: 'var(--radius-sm)',
                                                  fontSize: '11px',
                                                  fontWeight: 700,
                                                  color: badgeColor,
                                                  backgroundColor: badgeBg,
                                                  border: `1px solid ${badgeColor}`,
                                                }}
                                              >
                                                {badgeText}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExamResultPage;
