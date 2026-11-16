import React from 'react';
import { Search, Download, Plus, X } from 'lucide-react';
import { User, UserPosition } from '@/types/user';

interface ScheduleFilterCardProps {
  supervisors: User[];
  allEmployees: User[];
  selectedSupervisorId: string;
  selectedPosition: string;
  selectedEmployeeDropdownId: string;
  onSupervisorChange: (val: string) => void;
  onPositionChange: (val: string) => void;
  onEmployeeDropdownChange: (val: string) => void;
  onSearch: () => void;
  onClear: () => void;
  onExportReport: () => void;
  onDownloadTemplate: () => void;
  onOpenImportModal: () => void;
  hasActiveEmployee: boolean;
}

export const ScheduleFilterCard: React.FC<ScheduleFilterCardProps> = ({
  supervisors,
  allEmployees,
  selectedSupervisorId,
  selectedPosition,
  selectedEmployeeDropdownId,
  onSupervisorChange,
  onPositionChange,
  onEmployeeDropdownChange,
  onSearch,
  onClear,
  onExportReport,
  onDownloadTemplate,
  onOpenImportModal,
  hasActiveEmployee,
}) => {
  // Filter selectable employees in dropdown by supervisor and position
  const availableEmployees = allEmployees.filter((emp) => {
    if (selectedSupervisorId && emp.currentSupervisorId !== selectedSupervisorId) {
      return false;
    }
    if (selectedPosition && emp.currentPosition !== selectedPosition) {
      return false;
    }
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* 3-Column Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* 1. Supervisor */}
          <div>
            <label
              htmlFor="schedule-filter-supervisor"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              Supervisor
            </label>
            <select
              id="schedule-filter-supervisor"
              value={selectedSupervisorId}
              onChange={(e) => onSupervisorChange(e.target.value)}
              style={{
                width: '100%',
                height: '32px',
                padding: '0 8px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
              }}
            >
              <option value="">Select supervisor</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.currentPosition})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Position */}
          <div>
            <label
              htmlFor="schedule-filter-position"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              Position
            </label>
            <select
              id="schedule-filter-position"
              value={selectedPosition}
              onChange={(e) => onPositionChange(e.target.value)}
              style={{
                width: '100%',
                height: '32px',
                padding: '0 8px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
              }}
            >
              <option value="">Select position</option>
              {(['PG-Inline', 'Customer', 'Supervisor', 'Admin'] as UserPosition[]).map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Employee */}
          <div>
            <label
              htmlFor="schedule-filter-employee"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}
            >
              Employee
            </label>
            <select
              id="schedule-filter-employee"
              value={selectedEmployeeDropdownId}
              onChange={(e) => onEmployeeDropdownChange(e.target.value)}
              style={{
                width: '100%',
                height: '32px',
                padding: '0 8px',
                fontSize: '13px',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                outline: 'none',
              }}
            >
              <option value="">Select employee</option>
              {availableEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeCode} - {emp.fullName}
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
          {/* Left Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="submit"
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.15s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
            >
              <Search size={15} />
              <span>Search</span>
            </button>

            <button
              type="button"
              disabled={!hasActiveEmployee}
              onClick={onExportReport}
              style={{
                height: '32px',
                padding: '0 12px',
                backgroundColor: hasActiveEmployee ? 'var(--color-primary)' : 'var(--border-color)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: hasActiveEmployee ? 'pointer' : 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={15} />
              <span>Export Report</span>
            </button>
          </div>

          {/* Right Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onDownloadTemplate}
              style={{
                height: '32px',
                padding: '0 12px',
                backgroundColor: '#F57F17', // Amber secondary accent per SPEC-06 3.1
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={15} />
              <span>Template File</span>
            </button>

            <button
              type="button"
              onClick={onOpenImportModal}
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={15} />
              <span>Import File</span>
            </button>

            <button
              type="button"
              onClick={onClear}
              title="Clear filters"
              style={{
                height: '32px',
                width: '32px',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
