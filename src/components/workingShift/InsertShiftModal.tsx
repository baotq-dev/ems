import React, { useState } from 'react';
import { X } from 'lucide-react';
import { WorkingShiftRecord, ShiftRefCode } from '@/types/workingShift';
import { MOCK_SHIFT_GROUPS } from '@/mocks/workingShiftMockData';
import { useI18n } from '@/context/I18nContext';

interface InsertShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShift: (newShift: WorkingShiftRecord) => void;
}

export const InsertShiftModal: React.FC<InsertShiftModalProps> = ({
  isOpen,
  onClose,
  onAddShift,
}) => {
  const { t } = useI18n();

  // Form State
  const [shiftGroup, setShiftGroup] = useState('');
  const [shiftCode, setShiftCode] = useState('');
  const [shiftName, setShiftName] = useState('');
  const [fromTime, setFromTime] = useState('00:00');
  const [toTime, setToTime] = useState('00:00');
  const [value, setValue] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<number | undefined>(undefined);
  const [refCode, setRefCode] = useState<ShiftRefCode>('ON');
  const [isOt, setIsOt] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [skipReport, setSkipReport] = useState<boolean>(false);
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleGroupChange = (code: string) => {
    setShiftGroup(code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!shiftGroup) {
      setFormError(t('shift.error_group_required', 'Shift Group is required.'));
      return;
    }
    if (!shiftCode.trim()) {
      setFormError(t('shift.error_code_required', 'Shift Code is required.'));
      return;
    }
    if (!shiftName.trim()) {
      setFormError(t('shift.error_name_required', 'Shift Name is required.'));
      return;
    }

    const matchedGroup = MOCK_SHIFT_GROUPS.find((g) => g.code === shiftGroup);
    const groupName = matchedGroup ? matchedGroup.name : shiftGroup;

    const newRecord: WorkingShiftRecord = {
      id: `ws-${Date.now()}`,
      shiftGroup,
      groupName,
      shiftCode: shiftCode.trim(),
      shiftName: shiftName.trim(),
      fromTime: fromTime || '00:00',
      toTime: toTime || '00:00',
      value: Number(value) || 1,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
      refCode,
      isOt,
      isActive,
      skipReport,
      note: note.trim() || undefined,
    };

    onAddShift(newRecord);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
            {t('action.add', 'Insert')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && (
              <div
                style={{
                  backgroundColor: 'var(--color-primary-soft-bg)',
                  color: 'var(--color-primary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  border: '1px solid var(--color-primary)',
                }}
              >
                {formError}
              </div>
            )}

            {/* Row 1: 2 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('shift.shift_group', 'Shift Group')} *
                </label>
                <select
                  value={shiftGroup}
                  onChange={(e) => handleGroupChange(e.target.value)}
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
                  <option value="">{t('shift.select_group', 'Select group name')}</option>
                  {MOCK_SHIFT_GROUPS.map((g) => (
                    <option key={g.code} value={g.code}>
                      {g.code} - {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('shift.shift_code', 'Shift Code')} *
                </label>
                <input
                  type="text"
                  value={shiftCode}
                  onChange={(e) => setShiftCode(e.target.value)}
                  placeholder="e.g. AM07H00"
                  style={{
                    width: '100%',
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

            {/* Row 2: Full Width Shift Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                {t('shift.shift_name', 'Shift Name')} *
              </label>
              <input
                type="text"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                placeholder="e.g. 07:00 - 15:00"
                style={{
                  width: '100%',
                  height: '32px',
                  padding: '0 8px',
                  fontSize: '13px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                }}
              />
            </div>

            {/* Row 3: 4 Columns (From, To, Value, Sort Order) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('shift.from', 'From')}
                </label>
                <input
                  type="time"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                  style={{
                    width: '100%',
                    height: '32px',
                    padding: '0 6px',
                    fontSize: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('shift.to', 'To')}
                </label>
                <input
                  type="time"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                  style={{
                    width: '100%',
                    height: '32px',
                    padding: '0 6px',
                    fontSize: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('shift.value', 'Value')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: '32px',
                    padding: '0 8px',
                    fontSize: '13px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('shift.sort_order', 'Sort Order')}
                </label>
                <input
                  type="number"
                  value={sortOrder !== undefined ? sortOrder : ''}
                  onChange={(e) => setSortOrder(e.target.value === '' ? undefined : Number(e.target.value))}
                  placeholder="Optional"
                  style={{
                    width: '100%',
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

            {/* Row 4: 4-Column Boolean & Toggle Strip */}
            <div
              style={{
                padding: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-canvas)',
              }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center"
            >
              {/* 1. Ref Code Toggle */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  {t('shift.ref_code', 'Ref Code')}
                </label>
                <div style={{ display: 'inline-flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setRefCode('ON')}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      backgroundColor: refCode === 'ON' ? 'var(--color-success-accent)' : 'var(--bg-surface)',
                      color: refCode === 'ON' ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    ON
                  </button>
                  <button
                    type="button"
                    onClick={() => setRefCode('OFF')}
                    style={{
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      backgroundColor: refCode === 'OFF' ? '#6B7280' : 'var(--bg-surface)',
                      color: refCode === 'OFF' ? '#FFFFFF' : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    OFF
                  </button>
                </div>
              </div>

              {/* 2. OT Checkbox */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  {t('shift.ot', 'OT')}
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isOt}
                    onChange={(e) => setIsOt(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <span>{isOt ? t('common.yes', 'Yes') : t('common.no', 'No')}</span>
                </label>
              </div>

              {/* 3. Status Checkbox */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  {t('field.status', 'Status')}
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontWeight: 600, color: isActive ? 'var(--color-success-accent)' : 'var(--text-secondary)' }}>
                    {isActive ? t('user.status_active', 'Active') : t('user.status_inactive', 'Inactive')}
                  </span>
                </label>
              </div>

              {/* 4. Skip Report Checkbox */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  {t('shift.skip_report', 'Skip Report')}
                </label>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={skipReport}
                    onChange={(e) => setSkipReport(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <span>{skipReport ? t('common.yes', 'Yes') : t('common.no', 'No')}</span>
                </label>
              </div>
            </div>

            {/* Row 5: Full Width Note */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                {t('field.note', 'Note')}
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional shift notes"
                style={{
                  width: '100%',
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

          {/* Footer */}
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              backgroundColor: 'var(--bg-canvas)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 20px',
                fontSize: '13px',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {t('action.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 24px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: 'var(--color-success-accent)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {t('action.add', 'Add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
