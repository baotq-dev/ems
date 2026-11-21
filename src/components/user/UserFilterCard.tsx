import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  Info,
  UserPlus,
  Plus,
  X,
} from 'lucide-react';
import { User, UserFilterParams, EmploymentStatus } from '@/types/user';
import { useI18n } from '@/context/I18nContext';

interface UserFilterCardProps {
  filterParams: UserFilterParams;
  supervisors: User[];
  onFilterChange: (params: UserFilterParams) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  onExportCsv: () => void;
  onDownloadTemplate: () => void;
  onOpenImei: () => void;
  onOpenAddModal: () => void;
  onOpenImportModal: () => void;
}

export const UserFilterCard: React.FC<UserFilterCardProps> = ({
  filterParams,
  supervisors,
  onFilterChange,
  onSearch,
  onClearFilters,
  onExportCsv,
  onDownloadTemplate,
  onOpenImei,
  onOpenAddModal,
  onOpenImportModal,
}) => {
  const { t } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleFieldChange = (key: keyof UserFilterParams, value: string) => {
    onFilterChange({
      ...filterParams,
      [key]: value,
    });
  };

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
        marginBottom: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* 3.1 Header Bar */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsCollapsed(!isCollapsed)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsCollapsed(!isCollapsed);
          }
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
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
        <span>{t('action.search', 'Search')}</span>
      </div>

      {/* Filter Body & Action Toolbar */}
      {!isCollapsed && (
        <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
          {/* 3.2 Responsive 4-Column x 2-Row Filter Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4"
          >
            {/* Row 1, Col 1: Position */}
            <div>
              <label
                htmlFor="filter-position"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {t('field.position', 'Position')}
              </label>
              <select
                id="filter-position"
                value={filterParams.position || ''}
                onChange={(e) => handleFieldChange('position', e.target.value)}
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
                <option value="">{t('field.select_position', 'Select position')}</option>
                <option value="PG-Inline">PG-Inline</option>
                <option value="Customer">Customer</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            {/* Row 1, Col 2: Supervisor */}
            <div>
              <label
                htmlFor="filter-supervisor"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {t('field.supervisor', 'Supervisor')}
              </label>
              <select
                id="filter-supervisor"
                value={filterParams.supervisorId || ''}
                onChange={(e) => handleFieldChange('supervisorId', e.target.value)}
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
                <option value="">{t('field.select_supervisor', 'Select supervisor')}</option>
                {supervisors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.currentPosition})
                  </option>
                ))}
              </select>
            </div>

            {/* Row 1, Col 3: Employee Code */}
            <div>
              <label
                htmlFor="filter-emp-code"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {t('field.employee_code', 'Employee Code')}
              </label>
              <input
                id="filter-emp-code"
                type="text"
                placeholder="Enter employee code"
                value={filterParams.employeeCode || ''}
                onChange={(e) => handleFieldChange('employeeCode', e.target.value)}
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
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Row 1, Col 4: Full Name */}
            <div>
              <label
                htmlFor="filter-fullname"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {t('field.full_name', 'Full Name')}
              </label>
              <input
                id="filter-fullname"
                type="text"
                placeholder="Enter full name"
                value={filterParams.fullName || ''}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
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
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Row 2, Col 1: Username */}
            <div>
              <label
                htmlFor="filter-username"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {t('login.username', 'Username')}
              </label>
              <input
                id="filter-username"
                type="text"
                placeholder="Enter username"
                value={filterParams.username || ''}
                onChange={(e) => handleFieldChange('username', e.target.value)}
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
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Row 2, Col 2: Phone Number */}
            <div>
              <label
                htmlFor="filter-phone"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {t('field.phone', 'Phone Number')}
              </label>
              <input
                id="filter-phone"
                type="text"
                placeholder="Enter phone number"
                value={filterParams.phoneNumber || ''}
                onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
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
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Row 2, Col 3: ID / CCCD */}
            <div>
              <label
                htmlFor="filter-id"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {t('field.identity_number', 'ID / CCCD')}
              </label>
              <input
                id="filter-id"
                type="text"
                placeholder="Enter ID / CCCD"
                value={filterParams.identityNumber || ''}
                onChange={(e) => handleFieldChange('identityNumber', e.target.value)}
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
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Row 2, Col 4: Status */}
            <div>
              <label
                htmlFor="filter-status"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  marginBottom: '4px',
                }}
              >
                {t('field.status', 'Status')}
              </label>
              <select
                id="filter-status"
                value={filterParams.employmentStatus || ''}
                onChange={(e) => handleFieldChange('employmentStatus', e.target.value as EmploymentStatus)}
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
                <option value="">{t('field.select_status', 'Select status')}</option>
                <option value="Official">Official</option>
                <option value="Probation">Probation</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
          </div>

          {/* 3.3 Action Toolbar */}
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
            {/* Left Action Group */}
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
                <span>{t('action.search', 'Search')}</span>
              </button>

              <button
                type="button"
                onClick={onExportCsv}
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
                <Download size={15} />
                <span>{t('action.export_file', 'Export File')}</span>
              </button>

              <button
                type="button"
                onClick={onDownloadTemplate}
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
                <Download size={15} />
                <span>{t('action.template_file', 'Template File')}</span>
              </button>

              <button
                type="button"
                onClick={onOpenImei}
                style={{
                  height: '32px',
                  padding: '0 12px',
                  backgroundColor: 'var(--color-secondary-accent)',
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
                <Info size={15} />
                <span>I_imei</span>
              </button>
            </div>

            {/* Right Action Group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={onOpenAddModal}
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
                }}
              >
                <UserPlus size={15} />
                <span>{t('action.add', 'Add')}</span>
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
                <span>{t('action.import_file', 'Import File')}</span>
              </button>

              <button
                type="button"
                onClick={onClearFilters}
                title={t('action.clear', 'Clear all filters')}
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
      )}
    </div>
  );
};
export default UserFilterCard;
