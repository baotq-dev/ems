import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
} from 'lucide-react';
import { MOCK_TIMESHEET_ROWS } from '@/mocks/attendantMockData';
import { MOCK_USERS } from '@/mocks/users';
import { EmployeeTimesheetRow, TimesheetCellHighlight } from '@/types/attendant';

const HIGHLIGHT_STYLES: Record<TimesheetCellHighlight, { bg: string; color: string }> = {
  none: { bg: 'transparent', color: 'inherit' },
  confirmed: { bg: '#0284C7', color: '#FFFFFF' }, // Blue: 1_Confirm
  rejected: { bg: '#F97316', color: '#FFFFFF' }, // Orange: 1_Reject
  absent: { bg: 'var(--color-primary)', color: '#FFFFFF' }, // Red: Absent
  not_checked_out: { bg: '#EAB308', color: '#1F2937' }, // Yellow: Not Checked Out
  worked_off_day: { bg: 'var(--color-success-accent)', color: '#FFFFFF' }, // Green: Worked on Day Off
};

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const TimesheetPage: React.FC = () => {
  const [rows] = useState<EmployeeTimesheetRow[]>(MOCK_TIMESHEET_ROWS);

  // Search Collapsible State
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);

  // Filters
  const [filterMonth, setFilterMonth] = useState('2026-11');
  const [filterSupervisorId, setFilterSupervisorId] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterEmployeeId, setFilterEmployeeId] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    month: '2026-11',
    supervisorId: '',
    position: '',
    employeeId: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const supervisors = useMemo(() => {
    return MOCK_USERS.filter((u) => u.currentPosition === 'Supervisor' || u.currentPosition === 'Admin');
  }, []);

  const handleSearch = () => {
    setAppliedFilters({
      month: filterMonth,
      supervisorId: filterSupervisorId,
      position: filterPosition,
      employeeId: filterEmployeeId,
    });
    setCurrentPage(1);
  };

  // Filtered Rows
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (appliedFilters.month && r.month !== appliedFilters.month) return false;
      if (appliedFilters.supervisorId && r.supervisorId !== appliedFilters.supervisorId) return false;
      if (appliedFilters.position && r.position !== appliedFilters.position) return false;
      if (appliedFilters.employeeId && r.employeeCode !== appliedFilters.employeeId) return false;
      return true;
    });
  }, [rows, appliedFilters]);

  // Days in month (e.g. November 2026 has 30 days)
  const daysInMonth = useMemo(() => {
    const [y, m] = appliedFilters.month.split('-').map(Number);
    return new Date(y, m, 0).getDate();
  }, [appliedFilters.month]);

  const daysHeaderInfo = useMemo(() => {
    const [y, m] = appliedFilters.month.split('-').map(Number);
    const list: { day: number; weekday: string; isSunday: boolean }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m - 1, d);
      const wdIndex = date.getDay();
      list.push({
        day: d,
        weekday: WEEKDAY_NAMES[wdIndex],
        isSunday: wdIndex === 0,
      });
    }
    return list;
  }, [appliedFilters.month, daysInMonth]);

  // Pagination calculations
  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalEntries, currentPage * pageSize);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  // Export CSV
  const handleExportCsv = () => {
    const headerRow1 = ['No.', 'Supervisor', 'Employee Code', 'Employee Name', 'Position'];
    for (let d = 1; d <= daysInMonth; d++) {
      headerRow1.push(`Day ${d}`);
    }

    const dataLines = filteredRows.map((r, idx) => {
      const row = [
        idx + 1,
        `"${r.supervisorName}"`,
        r.employeeCode,
        `"${r.employeeName}"`,
        r.position,
      ];
      for (let d = 1; d <= daysInMonth; d++) {
        const dayEntry = r.days.find((entry) => entry.day === d);
        row.push(dayEntry ? dayEntry.code : '');
      }
      return row.join(',');
    });

    const csvContent = [headerRow1.join(','), ...dataLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timesheet_${appliedFilters.month}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* 4.1 Collapsible Search Card */}
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
              {/* Target Month */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Target Month
                </label>
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>

              {/* Supervisor */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Supervisor
                </label>
                <select
                  value={filterSupervisorId}
                  onChange={(e) => setFilterSupervisorId(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select supervisor</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName}</option>
                  ))}
                </select>
              </div>

              {/* Position */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Position
                </label>
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select position</option>
                  <option value="PG-Inline">PG-Inline</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="MER">MER</option>
                </select>
              </div>

              {/* Employee */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  Employee
                </label>
                <select
                  value={filterEmployeeId}
                  onChange={(e) => setFilterEmployeeId(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select employee</option>
                  {MOCK_USERS.map((emp) => (
                    <option key={emp.employeeCode} value={emp.employeeCode}>
                      {emp.employeeCode} - {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Toolbar */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
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
                onClick={handleExportCsv}
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
                <Download size={15} /> Export Excel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4.2 Color Status Legend Strip */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '14px',
          fontSize: '12px',
          fontWeight: 600,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '14px', backgroundColor: '#0284C7', borderRadius: '2px' }} />
          <span>1_Confirm</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '14px', backgroundColor: '#F97316', borderRadius: '2px' }} />
          <span>1_Reject</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '14px', backgroundColor: 'var(--color-primary)', borderRadius: '2px' }} />
          <span>Absent</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '14px', backgroundColor: '#EAB308', borderRadius: '2px' }} />
          <span>Not Checked Out</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '14px', backgroundColor: 'var(--color-success-accent)', borderRadius: '2px' }} />
          <span>Worked on Day Off</span>
        </div>
      </div>

      {/* 4.3 Multi-Header Monthly Matrix Table */}
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

        {/* Matrix Table with sticky frozen columns */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
            <thead>
              {/* Row 1: Month spanning header */}
              <tr style={{ backgroundColor: '#4B5563', color: '#FFFFFF', borderBottom: '1px solid var(--border-color)' }}>
                <th
                  rowSpan={3}
                  style={{
                    position: 'sticky',
                    left: 0,
                    zIndex: 20,
                    backgroundColor: '#4B5563',
                    width: '35px',
                    padding: '6px',
                    borderRight: '1px solid #6B7280',
                  }}
                >
                  No.
                </th>
                <th
                  rowSpan={3}
                  style={{
                    position: 'sticky',
                    left: '35px',
                    zIndex: 20,
                    backgroundColor: '#4B5563',
                    width: '120px',
                    padding: '6px',
                    textAlign: 'left',
                    borderRight: '1px solid #6B7280',
                  }}
                >
                  Supervisor
                </th>
                <th
                  rowSpan={3}
                  style={{
                    position: 'sticky',
                    left: '155px',
                    zIndex: 20,
                    backgroundColor: '#4B5563',
                    width: '150px',
                    padding: '6px',
                    textAlign: 'left',
                    borderRight: '2px solid var(--color-primary)',
                  }}
                >
                  Employee
                </th>
                <th colSpan={daysInMonth} style={{ padding: '6px', fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px' }}>
                  {new Date(appliedFilters.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </th>
              </tr>

              {/* Row 2: Weekday Row */}
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)' }}>
                {daysHeaderInfo.map((h) => (
                  <th
                    key={`wd-${h.day}`}
                    style={{
                      padding: '4px',
                      width: '32px',
                      minWidth: '32px',
                      backgroundColor: h.isSunday ? '#7C2D12' : 'var(--bg-canvas)',
                      color: h.isSunday ? '#FFFFFF' : 'var(--text-primary)',
                      fontWeight: 700,
                      borderRight: '1px solid var(--border-color)',
                    }}
                  >
                    {h.weekday}
                  </th>
                ))}
              </tr>

              {/* Row 3: Day Number Row */}
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '2px solid var(--border-color)' }}>
                {daysHeaderInfo.map((h) => (
                  <th
                    key={`num-${h.day}`}
                    style={{
                      padding: '4px',
                      width: '32px',
                      minWidth: '32px',
                      backgroundColor: h.isSunday ? '#7C2D12' : 'var(--bg-canvas)',
                      color: h.isSunday ? '#FFFFFF' : 'var(--text-primary)',
                      fontWeight: 700,
                      borderRight: '1px solid var(--border-color)',
                    }}
                  >
                    {h.day}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={3 + daysInMonth} style={{ padding: '24px', color: 'var(--text-secondary)' }}>
                    No timesheet records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {/* Sticky 1: No. */}
                      <td
                        style={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 10,
                          backgroundColor: 'var(--bg-surface)',
                          padding: '6px',
                          borderRight: '1px solid var(--border-color)',
                        }}
                      >
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>

                      {/* Sticky 2: Supervisor */}
                      <td
                        style={{
                          position: 'sticky',
                          left: '35px',
                          zIndex: 10,
                          backgroundColor: 'var(--bg-surface)',
                          padding: '6px',
                          textAlign: 'left',
                          borderRight: '1px solid var(--border-color)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row.supervisorName}
                      </td>

                      {/* Sticky 3: Employee 2-line */}
                      <td
                        style={{
                          position: 'sticky',
                          left: '155px',
                          zIndex: 10,
                          backgroundColor: 'var(--bg-surface)',
                          padding: '6px',
                          textAlign: 'left',
                          borderRight: '2px solid var(--color-primary)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{row.employeeCode}</div>
                        <div style={{ color: 'var(--text-primary)' }}>
                          {row.employeeName} <span style={{ color: 'var(--text-secondary)' }}>({row.position})</span>
                        </div>
                      </td>

                      {/* Calendar Day Cells */}
                      {daysHeaderInfo.map((h) => {
                        const dayEntry = row.days.find((d) => d.day === h.day);
                        const code = dayEntry ? dayEntry.code : '';
                        const hlStyle = dayEntry ? HIGHLIGHT_STYLES[dayEntry.highlight] : HIGHLIGHT_STYLES.none;

                        return (
                          <td
                            key={`cell-${row.id}-${h.day}`}
                            style={{
                              padding: '6px 2px',
                              borderRight: '1px solid var(--border-color)',
                              backgroundColor: hlStyle.bg,
                              color: hlStyle.color,
                              fontWeight: dayEntry?.highlight !== 'none' || code === 'X' ? 700 : 400,
                            }}
                          >
                            {code}
                          </td>
                        );
                      })}
                    </tr>
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

export default TimesheetPage;
