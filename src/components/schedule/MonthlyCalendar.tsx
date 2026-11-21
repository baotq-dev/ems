import React from 'react';
import { ChevronLeft, ChevronRight, SquarePen, Pencil } from 'lucide-react';
import { DailyScheduleRecord, ShiftOption } from '@/types/shift';
import { useI18n } from '@/context/I18nContext';

interface CalendarDateCell {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
}

interface MonthlyCalendarProps {
  currentYear: number;
  currentMonth: number; // 1 - 12
  selectedEmployeeId: string | null;
  schedules: DailyScheduleRecord[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenEditDate: (date: string) => void;
}

const SHIFT_COLOR_STYLES: Record<
  ShiftOption['colorToken'],
  { bg: string; text: string; border: string }
> = {
  teal: { bg: '#E0F2F1', text: '#00695C', border: '#80CBC4' },
  navy: { bg: '#E8EAF6', text: '#1A237E', border: '#9FA8DA' },
  green: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  amber: { bg: '#FFF8E1', text: '#F57F17', border: '#FFE082' },
  red: { bg: 'var(--color-primary-soft-bg)', text: 'var(--color-primary)', border: 'var(--color-primary)' },
};

export const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({
  currentYear,
  currentMonth,
  selectedEmployeeId,
  schedules,
  onPrevMonth,
  onNextMonth,
  onOpenEditDate,
}) => {
  const { t } = useI18n();

  // Format Month/Year Title MM/YYYY
  const monthTitle = `${String(currentMonth).padStart(2, '0')}/${currentYear}`;

  // Weekday Headers (Monday to Sunday)
  const weekdays = [
    t('day.mon', 'Mon'),
    t('day.tue', 'Tue'),
    t('day.wed', 'Wed'),
    t('day.thu', 'Thu'),
    t('day.fri', 'Fri'),
    t('day.sat', 'Sat'),
    t('day.sun', 'Sun'),
  ];

  // Calculate calendar grid dates
  // 1st day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
  // Total days in month
  const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
  const daysInCurrentMonth = lastDayOfMonth.getDate();

  // Monday = 0, Sunday = 6
  const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  // Days in previous month
  const prevMonthLastDay = new Date(currentYear, currentMonth - 1, 0).getDate();

  const cells: CalendarDateCell[] = [];

  // Leading days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: false,
    });
  }

  // Days in current active month
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    cells.push({
      date: dateStr,
      dayNumber: day,
      isCurrentMonth: true,
    });
  }

  // Trailing days from next month to complete the last week (through Sunday)
  const remainder = cells.length % 7;
  if (remainder > 0) {
    const trailingCount = 7 - remainder;
    for (let day = 1; day <= trailingCount; day++) {
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        date: dateStr,
        dayNumber: day,
        isCurrentMonth: false,
      });
    }
  }

  // Map schedules by date for selected employee
  const scheduleMap = new Map<string, DailyScheduleRecord>();
  if (selectedEmployeeId) {
    schedules
      .filter((s) => s.userId === selectedEmployeeId)
      .forEach((record) => {
        scheduleMap.set(record.date, record);
      });
  }

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* 4.2.1 Calendar Top Bar */}
      <div
        style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        {/* Left: Previous / Next Month Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={onPrevMonth}
            title="Previous Month"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            title="Next Month"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Center: Month / Year Title */}
        <div
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '0.2px',
          }}
        >
          {monthTitle}
        </div>

        {/* Right: Static Active View Badge */}
        <div
          style={{
            padding: '4px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {t('field.month', 'Month')}
        </div>
      </div>

      {/* 4.2.2 Grid Structure (Monday to Sunday) */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: '700px' }}>
          {/* Weekday Headers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              backgroundColor: 'var(--bg-canvas)',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            {weekdays.map((wd) => (
              <div
                key={wd}
                style={{
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  borderRight: '1px solid var(--border-color)',
                }}
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
            }}
          >
            {cells.map((cell) => {
              const record = cell.isCurrentMonth ? scheduleMap.get(cell.date) : undefined;
              const assignedShifts = record ? record.assignedShifts : [];
              const hasShifts = assignedShifts.length > 0;

              // Rule A: No employee selected -> completely empty
              // Rule B: Employee selected -> editable ONLY if isCurrentMonth
              const canEdit = Boolean(selectedEmployeeId && cell.isCurrentMonth);

              return (
                <div
                  key={cell.date}
                  style={{
                    minHeight: '105px',
                    padding: '6px',
                    borderRight: '1px solid var(--border-color)',
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: cell.isCurrentMonth ? 'var(--bg-surface)' : 'var(--bg-canvas)',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {/* Day Number in top-right corner */}
                  <div
                    style={{
                      textAlign: 'right',
                      fontSize: '12px',
                      fontWeight: cell.isCurrentMonth ? 700 : 400,
                      color: cell.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-secondary)',
                      opacity: cell.isCurrentMonth ? 1 : 0.45,
                      marginBottom: '4px',
                    }}
                  >
                    {cell.dayNumber}
                  </div>

                  {/* Cell Content */}
                  {canEdit && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {hasShifts ? (
                        // Render stacked shift pill bar(s) with edit icon
                        assignedShifts.map((shift) => {
                          const style = SHIFT_COLOR_STYLES[shift.colorToken] || SHIFT_COLOR_STYLES.teal;
                          return (
                            <div
                              key={shift.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => onOpenEditDate(cell.date)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  onOpenEditDate(cell.date);
                                }
                              }}
                              title={`${shift.shiftCode} (${shift.shiftName}) - ${shift.storeName} [Click to edit]`}
                              style={{
                                padding: '3px 6px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: style.bg,
                                color: style.text,
                                border: `1px solid ${style.border}`,
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '4px',
                                overflow: 'hidden',
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {shift.shiftCode} - {shift.storeName.split(',')[0]}
                              </span>
                              <Pencil size={11} style={{ flexShrink: 0, opacity: 0.8 }} />
                            </div>
                          );
                        })
                      ) : (
                        // No shifts assigned: render full-width clickable edit bar with centered SquarePen
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => onOpenEditDate(cell.date)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              onOpenEditDate(cell.date);
                            }
                          }}
                          title="Click to schedule shift"
                          style={{
                            flex: 1,
                            minHeight: '40px',
                            border: '1px dashed var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-canvas)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.color = 'var(--color-primary)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          <SquarePen size={16} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
