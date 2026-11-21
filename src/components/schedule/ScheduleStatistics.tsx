import React, { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { DailyScheduleRecord } from '@/types/shift';
import { MOCK_SHIFTS } from '@/mocks/shiftMockData';
import { useI18n } from '@/context/I18nContext';

interface ScheduleStatisticsProps {
  selectedEmployeeId: string | null;
  currentYear: number;
  currentMonth: number;
  schedules: DailyScheduleRecord[];
}

export const ScheduleStatistics: React.FC<ScheduleStatisticsProps> = ({
  selectedEmployeeId,
  currentYear,
  currentMonth,
  schedules,
}) => {
  const { t } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Month prefix string YYYY-MM
  const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  // Filter schedules for the selected employee in the current active month
  const activeSchedules = selectedEmployeeId
    ? schedules.filter((s) => s.userId === selectedEmployeeId && s.date.startsWith(monthPrefix))
    : [];

  // 1. Standard Working Hours / Month: Fixed 216 (or 0 when no employee is selected)
  const standardHours = selectedEmployeeId ? 216 : 0;

  // 2. Total Registered Working Hours
  let totalHours = 0;
  const shiftCounts: Record<string, number> = {};
  MOCK_SHIFTS.forEach((s) => {
    shiftCounts[s.code] = 0;
  });

  const distinctStoreIds = new Set<string>();

  activeSchedules.forEach((record) => {
    record.assignedShifts.forEach((shift) => {
      const shiftDef = MOCK_SHIFTS.find((ms) => ms.code === shift.shiftCode || ms.id === shift.shiftId);
      if (shiftDef) {
        totalHours += shiftDef.hours;
      }
      shiftCounts[shift.shiftCode] = (shiftCounts[shift.shiftCode] || 0) + 1;
      if (shift.storeId) {
        distinctStoreIds.add(shift.storeId);
      }
    });
  });

  const activeStoresCount = selectedEmployeeId ? distinctStoreIds.size : 0;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        marginTop: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Header Bar */}
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
          padding: '10px 16px',
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          fontWeight: 700,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span>{t('schedule.statistics_title', 'Working Schedule Statistics')}</span>
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFFFF',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
          }}
        >
          {isCollapsed ? <Plus size={18} /> : <Minus size={18} />}
        </button>
      </div>

      {/* 2-Column Summary Table */}
      {!isCollapsed && (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--text-primary)', width: '60%' }}>
                  {t('schedule.metric', 'Metric')}
                </th>
                <th style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {t('schedule.quantity', 'Quantity')}
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Standard Working Hours / Month */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 16px' }}>{t('schedule.standard_hours', 'Standard Working Hours / Month')}</td>
                <td style={{ padding: '8px 16px', fontWeight: 600 }}>{standardHours}</td>
              </tr>

              {/* 2. Total Registered Working Hours */}
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '8px 16px' }}>{t('schedule.total_registered_hours', 'Total Registered Working Hours')}</td>
                <td style={{ padding: '8px 16px', fontWeight: 600, color: 'var(--color-primary)' }}>
                  {totalHours}
                </td>
              </tr>

              {/* 3. Dynamic Shift Count Rows */}
              {MOCK_SHIFTS.map((shift) => (
                <tr key={shift.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '8px 16px' }}>{shift.code} ({shift.name})</td>
                  <td style={{ padding: '8px 16px', fontWeight: 600 }}>
                    {selectedEmployeeId ? shiftCounts[shift.code] || 0 : 0}
                  </td>
                </tr>
              ))}

              {/* 4. Active Scheduled Stores Count */}
              <tr>
                <td style={{ padding: '8px 16px' }}>{t('schedule.active_stores_count', 'Active Scheduled Stores Count')}</td>
                <td style={{ padding: '8px 16px', fontWeight: 600 }}>{activeStoresCount}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
