import React, { useState, useMemo, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  Upload,
  X,
  Trash2,
  Save,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
} from 'lucide-react';
import { MOCK_EXAMS } from '@/mocks/examMockData';
import { ExamItem, TargetExamRole } from '@/types/exam';
import { generateExamTemplateXlsx, parseExamImportXlsx, exportExamListCsv } from '@/utils/excel';

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

export const ExamListPage: React.FC = () => {
  const [exams, setExams] = useState<ExamItem[]>(MOCK_EXAMS);

  // Search Filters
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterExamId, setFilterExamId] = useState('');

  // Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: '',
    toDate: '',
    examId: '',
  });

  // Inline filter for table
  const [inlineExamName, setInlineExamName] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Expanded Exam Rows
  const [expandedExamIds, setExpandedExamIds] = useState<Record<string, boolean>>({});

  // Question search per expanded exam
  const [questionSearchMap, setQuestionSearchMap] = useState<Record<string, string>>({});

  // Feedback banner
  const [feedbackMsg, setFeedbackMsg] = useState<{ id: string; text: string } | null>(null);

  // Confirm delete dialog state
  const [examToDelete, setExamToDelete] = useState<ExamItem | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<{ examId: string; questionId: string } | null>(null);

  // Hidden file input for Excel upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle expand row
  const toggleExpand = (id: string) => {
    setExpandedExamIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Search Action
  const handleSearch = () => {
    setAppliedFilters({
      fromDate: filterFromDate,
      toDate: filterToDate,
      examId: filterExamId,
    });
    setCurrentPage(1);
  };

  // Clear Action
  const handleClear = () => {
    setFilterFromDate('');
    setFilterToDate('');
    setFilterExamId('');
    setInlineExamName('');
    setAppliedFilters({ fromDate: '', toDate: '', examId: '' });
    setCurrentPage(1);
  };

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((ex) => {
      if (appliedFilters.examId && ex.id !== appliedFilters.examId) {
        return false;
      }
      if (appliedFilters.fromDate && ex.fromDate < appliedFilters.fromDate) {
        return false;
      }
      if (appliedFilters.toDate && ex.toDate && ex.toDate > appliedFilters.toDate) {
        return false;
      }
      if (inlineExamName && !ex.examName.toLowerCase().includes(inlineExamName.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [exams, appliedFilters, inlineExamName]);

  // Paginated Exams
  const totalEntries = filteredExams.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalEntries, currentPage * pageSize);

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExams.slice(start, start + pageSize);
  }, [filteredExams, currentPage, pageSize]);

  // Excel Import Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedExam = await parseExamImportXlsx(file);
      setExams((prev) => [importedExam, ...prev]);
      alert(`Imported exam "${importedExam.examName}" with ${importedExam.questions.length} questions successfully!`);
    } catch {
      alert('Error parsing Excel file. Please ensure it follows TemplateExamList.xlsx schema.');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Delete Exam
  const handleConfirmDeleteExam = () => {
    if (!examToDelete) return;
    setExams((prev) => prev.filter((ex) => ex.id !== examToDelete.id));
    setExamToDelete(null);
  };

  // Delete Question
  const handleConfirmDeleteQuestion = () => {
    if (!questionToDelete) return;
    setExams((prev) =>
      prev.map((ex) => {
        if (ex.id !== questionToDelete.examId) return ex;
        return {
          ...ex,
          questions: ex.questions.filter((q) => q.questionId !== questionToDelete.questionId),
        };
      })
    );
    setQuestionToDelete(null);
  };

  // Role Toggle
  const handleToggleRole = (examId: string, role: TargetExamRole) => {
    setExams((prev) =>
      prev.map((ex) => {
        if (ex.id !== examId) return ex;
        const exists = ex.assignedRoles.includes(role);
        return {
          ...ex,
          assignedRoles: exists
            ? ex.assignedRoles.filter((r) => r !== role)
            : [...ex.assignedRoles, role],
        };
      })
    );
  };

  // Save Roles
  const handleSaveRoles = (examId: string) => {
    setFeedbackMsg({ id: examId, text: 'Assigned target roles updated successfully!' });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  return (
    <div>
      {/* 3.1 Collapsible Search & Action Card */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Date Range */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  Date Range (From - To)
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                    style={{
                      flex: 1,
                      height: '32px',
                      padding: '0 8px',
                      fontSize: '13px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                  />
                  <span style={{ color: 'var(--text-secondary)' }}>-</span>
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                    style={{
                      flex: 1,
                      height: '32px',
                      padding: '0 8px',
                      fontSize: '13px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface)',
                    }}
                  />
                </div>
              </div>

              {/* Exam Select */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  Exam
                </label>
                <select
                  value={filterExamId}
                  onChange={(e) => setFilterExamId(e.target.value)}
                  style={{
                    width: '100%',
                    height: '32px',
                    padding: '0 8px',
                    fontSize: '13px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  <option value="">Select exam</option>
                  {exams.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.examName} ({ex.fromDate} {ex.toDate ? `- ${ex.toDate}` : ''})
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
                  onClick={() => exportExamListCsv(filteredExams)}
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

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={generateExamTemplateXlsx}
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    backgroundColor: '#F59E0B',
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
                  <Download size={15} /> Template File (.xlsx)
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    height: '32px',
                    padding: '0 12px',
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
                  <Upload size={15} /> Import File (.xlsx)
                </button>

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
          </div>
        )}
      </div>

      {/* 3.2 Exam List Data Table */}
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

        {/* Master Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ width: '40px', padding: '8px' }}></th>
                <th style={{ width: '50px', padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>No.</th>
                <th style={{ padding: '8px', textAlign: 'left', color: 'var(--color-primary)', fontWeight: 700 }}>Exam Name</th>
                <th style={{ width: '130px', padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>From Date</th>
                <th style={{ width: '130px', padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>To Date</th>
                <th style={{ width: '120px', padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>Questions</th>
                <th style={{ width: '80px', padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>Action</th>
              </tr>
              {/* Inline quick-filter */}
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '2px solid var(--border-color)' }}>
                <th></th>
                <th></th>
                <th style={{ padding: '4px 8px', textAlign: 'left' }}>
                  <input
                    type="text"
                    placeholder="Filter Exam Name..."
                    value={inlineExamName}
                    onChange={(e) => setInlineExamName(e.target.value)}
                    style={{ width: '100%', height: '26px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedExams.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '24px', color: 'var(--text-secondary)' }}>
                    No exams found.
                  </td>
                </tr>
              ) : (
                paginatedExams.map((exam, idx) => {
                  const isExpanded = Boolean(expandedExamIds[exam.id]);
                  const qSearch = (questionSearchMap[exam.id] || '').toLowerCase();
                  const displayedQuestions = exam.questions.filter((q) =>
                    q.questionText.toLowerCase().includes(qSearch)
                  );

                  return (
                    <React.Fragment key={exam.id}>
                      <tr
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: isExpanded ? 'var(--color-primary-soft-bg)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => toggleExpand(exam.id)}
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
                        <td style={{ padding: '8px', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {exam.examName}
                        </td>
                        <td style={{ padding: '8px' }}>{exam.fromDate}</td>
                        <td style={{ padding: '8px' }}>{exam.toDate || '-'}</td>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{exam.questions.length}</td>
                        <td style={{ padding: '8px' }}>
                          <button
                            type="button"
                            onClick={() => setExamToDelete(exam)}
                            title="Delete Exam"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-primary)',
                              cursor: 'pointer',
                              padding: '4px',
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Detail Drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} style={{ padding: '16px', backgroundColor: '#FAFAFA', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>
                            {/* Role Assignment Strip */}
                            <div
                              style={{
                                padding: '10px 14px',
                                backgroundColor: 'var(--color-primary-soft-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '10px',
                                marginBottom: '14px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                                  Target Roles:
                                </span>
                                {ALL_ROLES.map((role) => {
                                  const isChecked = exam.assignedRoles.includes(role);
                                  return (
                                    <label
                                      key={role}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '12px',
                                        fontWeight: isChecked ? 600 : 400,
                                        color: isChecked ? 'var(--color-primary)' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggleRole(exam.id, role)}
                                        style={{ cursor: 'pointer' }}
                                      />
                                      {role}
                                    </label>
                                  );
                                })}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSaveRoles(exam.id)}
                                style={{
                                  height: '28px',
                                  padding: '0 12px',
                                  backgroundColor: 'var(--color-secondary-accent)',
                                  color: '#FFFFFF',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  border: 'none',
                                  borderRadius: 'var(--radius-sm)',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <Save size={14} /> Save Roles
                              </button>
                            </div>

                            {feedbackMsg?.id === exam.id && (
                              <div
                                style={{
                                  padding: '8px 12px',
                                  backgroundColor: '#E8F5E9',
                                  color: 'var(--color-success-accent)',
                                  fontSize: '12px',
                                  borderRadius: 'var(--radius-sm)',
                                  marginBottom: '12px',
                                  fontWeight: 600,
                                }}
                              >
                                {feedbackMsg.text}
                              </div>
                            )}

                            {/* Question Search Bar */}
                            <div style={{ marginBottom: '12px' }}>
                              <input
                                type="text"
                                placeholder="Search question..."
                                value={questionSearchMap[exam.id] || ''}
                                onChange={(e) =>
                                  setQuestionSearchMap((prev) => ({ ...prev, [exam.id]: e.target.value }))
                                }
                                style={{
                                  width: '100%',
                                  maxWidth: '350px',
                                  height: '30px',
                                  padding: '0 10px',
                                  fontSize: '12px',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--bg-surface)',
                                }}
                              />
                            </div>

                            {/* 2-Column Question & Answer Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {displayedQuestions.map((q) => (
                                <div
                                  key={q.questionId}
                                  style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--bg-surface)',
                                    padding: '12px',
                                  }}
                                >
                                  {/* Question Header */}
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      justifyContent: 'space-between',
                                      gap: '8px',
                                      marginBottom: '8px',
                                      borderBottom: '1px solid var(--border-color)',
                                      paddingBottom: '6px',
                                    }}
                                  >
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                                      Question {q.orderNo}: {q.questionText}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setQuestionToDelete({ examId: exam.id, questionId: q.questionId })}
                                      title="Delete Question"
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        padding: 0,
                                        display: 'flex',
                                      }}
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>

                                  {/* Options List */}
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {q.options.map((opt) => (
                                      <div
                                        key={opt.answerId}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '8px',
                                          fontSize: '12px',
                                          color: opt.isCorrect ? 'var(--color-primary)' : 'var(--text-primary)',
                                          fontWeight: opt.isCorrect ? 700 : 400,
                                        }}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={opt.isCorrect}
                                          readOnly
                                          style={{
                                            accentColor: 'var(--color-primary)',
                                            cursor: 'default',
                                          }}
                                        />
                                        <span>{opt.answerText}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
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

      {/* Delete Exam Dialog */}
      {examToDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', borderTop: '4px solid var(--color-primary)', padding: '20px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700 }}>Confirm Delete Exam</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Are you sure you want to delete exam &quot;{examToDelete.examName}&quot;?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setExamToDelete(null)}
                style={{ padding: '6px 14px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: 'var(--bg-surface)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteExam}
                style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--color-primary)', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Question Dialog */}
      {questionToDelete && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: '16px' }}>
          <div style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', borderTop: '4px solid var(--color-primary)', padding: '20px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700 }}>Confirm Delete Question</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Are you sure you want to delete this question from the exam?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setQuestionToDelete(null)}
                style={{ padding: '6px 14px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: 'var(--bg-surface)' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteQuestion}
                style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--color-primary)', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamListPage;
