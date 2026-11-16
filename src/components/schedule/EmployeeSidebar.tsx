import React from 'react';
import { ChevronRight } from 'lucide-react';
import { User } from '@/types/user';

interface EmployeeSidebarProps {
  employees: User[];
  selectedEmployeeId: string | null;
  onSelectEmployee: (id: string) => void;
}

export const EmployeeSidebar: React.FC<EmployeeSidebarProps> = ({
  employees,
  selectedEmployeeId,
  onSelectEmployee,
}) => {
  return (
    <div
      style={{
        width: '260px',
        flexShrink: 0,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* 4.1 Top Status Legend Strip */}
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '4px',
          backgroundColor: 'var(--bg-canvas)',
          fontSize: '11px',
        }}
      >
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#E0F2F1',
            color: '#00695C',
            fontWeight: 600,
          }}
        >
          MS
        </span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#E8EAF6',
            color: '#1A237E',
            fontWeight: 600,
          }}
        >
          AS
        </span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
            fontWeight: 600,
          }}
        >
          FS
        </span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FFF8E1',
            color: '#F57F17',
            fontWeight: 600,
          }}
        >
          OFF
        </span>
      </div>

      {/* Panel Header */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--color-primary-soft-bg)',
          color: 'var(--color-primary)',
          fontWeight: 700,
          fontSize: '13px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        Employees ({employees.length})
      </div>

      {/* Scrollable Employee List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: '620px',
        }}
      >
        {employees.length === 0 ? (
          <div
            style={{
              padding: '20px 12px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '13px',
            }}
          >
            No employees found
          </div>
        ) : (
          employees.map((emp) => {
            const isSelected = selectedEmployeeId === emp.id;
            return (
              <div
                key={emp.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectEmployee(emp.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectEmployee(emp.id);
                  }
                }}
                style={{
                  padding: '10px 12px',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: isSelected ? 'var(--color-primary-soft-bg)' : 'transparent',
                  color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 600 : 400,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span>{emp.employeeCode} - {emp.fullName}</span>{' '}
                  <span style={{ opacity: 0.75, fontSize: '11px' }}>({emp.currentPosition})</span>
                </div>
                {isSelected && <ChevronRight size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
