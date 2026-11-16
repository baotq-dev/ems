import React, { useState, useMemo } from 'react';
import { MOCK_USERS } from '@/mocks/users';
import { INITIAL_MOCK_SCHEDULES } from '@/mocks/shiftMockData';
import { DailyScheduleRecord, AssignedShiftItem } from '@/types/shift';
import { ScheduleFilterCard } from '@/components/schedule/ScheduleFilterCard';
import { EmployeeSidebar } from '@/components/schedule/EmployeeSidebar';
import { MonthlyCalendar } from '@/components/schedule/MonthlyCalendar';
import { ScheduleStatistics } from '@/components/schedule/ScheduleStatistics';
import { ScheduleDetailModal } from '@/components/schedule/ScheduleDetailModal';
import { ScheduleImportModal } from '@/components/schedule/ScheduleImportModal';
import { exportScheduleToCsv, downloadScheduleTemplateCsv } from '@/utils/csv';

export const WorkSchedulePage: React.FC = () => {
  // Master schedules state
  const [schedules, setSchedules] = useState<DailyScheduleRecord[]>(INITIAL_MOCK_SCHEDULES);

  // Month navigation: default to system current month (11/2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(11);

  // Selected Employee (Strict Rule A: Initial State is null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Filter inputs
  const [supervisorFilter, setSupervisorFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [employeeDropdownFilter, setEmployeeDropdownFilter] = useState('');

  // Applied filters for sidebar list
  const [appliedSupervisor, setAppliedSupervisor] = useState('');
  const [appliedPosition, setAppliedPosition] = useState('');

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeEditDate, setActiveEditDate] = useState<string>('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Supervisors list for dropdown
  const supervisors = useMemo(() => {
    return MOCK_USERS.filter((u) => u.currentPosition === 'Supervisor' || u.currentPosition === 'Admin');
  }, []);

  // Filtered employees for sidebar list
  const filteredEmployees = useMemo(() => {
    return MOCK_USERS.filter((emp) => {
      if (appliedSupervisor && emp.currentSupervisorId !== appliedSupervisor) {
        return false;
      }
      if (appliedPosition && emp.currentPosition !== appliedPosition) {
        return false;
      }
      return true;
    });
  }, [appliedSupervisor, appliedPosition]);

  // Active selected employee object
  const activeEmployee = useMemo(() => {
    if (!selectedEmployeeId) return null;
    return MOCK_USERS.find((u) => u.id === selectedEmployeeId) || null;
  }, [selectedEmployeeId]);

  // Search Action
  const handleSearch = () => {
    setAppliedSupervisor(supervisorFilter);
    setAppliedPosition(positionFilter);

    // If an employee was chosen in dropdown, activate them immediately on the calendar
    if (employeeDropdownFilter) {
      setSelectedEmployeeId(employeeDropdownFilter);
    }
  };

  // Clear Action
  const handleClear = () => {
    setSupervisorFilter('');
    setPositionFilter('');
    setEmployeeDropdownFilter('');
    setAppliedSupervisor('');
    setAppliedPosition('');
    setSelectedEmployeeId(null);
  };

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  // Export Report Action
  const handleExportReport = () => {
    if (!activeEmployee) return;
    const monthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const userSchedules = schedules.filter(
      (s) => s.userId === activeEmployee.id && s.date.startsWith(monthPrefix)
    );
    exportScheduleToCsv(activeEmployee, `${currentMonth}/${currentYear}`, userSchedules);
  };

  // Open Edit Date in Modal
  const handleOpenEditDate = (date: string) => {
    setActiveEditDate(date);
    setIsDetailModalOpen(true);
  };

  // Save Schedule for Date
  const handleSaveSchedule = (date: string, assignedShifts: AssignedShiftItem[]) => {
    if (!selectedEmployeeId) return;

    setSchedules((prev) => {
      const existingIndex = prev.findIndex(
        (s) => s.userId === selectedEmployeeId && s.date === date
      );

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          assignedShifts,
        };
        return copy;
      } else {
        const newRecord: DailyScheduleRecord = {
          userId: selectedEmployeeId,
          date,
          assignedShifts,
          changeRequests: [],
        };
        return [...prev, newRecord];
      }
    });
  };

  // Delete Change Requests for Date
  const handleDeleteChangeRequests = (date: string, requestIds: string[]) => {
    if (!selectedEmployeeId) return;

    setSchedules((prev) => {
      const existingIndex = prev.findIndex(
        (s) => s.userId === selectedEmployeeId && s.date === date
      );
      if (existingIndex < 0) return prev;

      const copy = [...prev];
      copy[existingIndex] = {
        ...copy[existingIndex],
        changeRequests: copy[existingIndex].changeRequests.filter(
          (cr) => !requestIds.includes(cr.id)
        ),
      };
      return copy;
    });
  };

  // Import Schedules Action
  const handleImportSchedules = (importedRecords: DailyScheduleRecord[]) => {
    setSchedules((prev) => {
      const copy = [...prev];
      importedRecords.forEach((imported) => {
        const idx = copy.findIndex(
          (c) => c.userId === imported.userId && c.date === imported.date
        );
        if (idx >= 0) {
          copy[idx] = {
            ...copy[idx],
            assignedShifts: [...copy[idx].assignedShifts, ...imported.assignedShifts],
          };
        } else {
          copy.push(imported);
        }
      });
      return copy;
    });
  };

  // Selected schedule record for modal
  const activeRecord = useMemo(() => {
    if (!selectedEmployeeId || !activeEditDate) return undefined;
    return schedules.find(
      (s) => s.userId === selectedEmployeeId && s.date === activeEditDate
    );
  }, [schedules, selectedEmployeeId, activeEditDate]);

  return (
    <div>
      {/* 3.1 Top Filter & Action Card */}
      <ScheduleFilterCard
        supervisors={supervisors}
        allEmployees={MOCK_USERS}
        selectedSupervisorId={supervisorFilter}
        selectedPosition={positionFilter}
        selectedEmployeeDropdownId={employeeDropdownFilter}
        onSupervisorChange={setSupervisorFilter}
        onPositionChange={setPositionFilter}
        onEmployeeDropdownChange={setEmployeeDropdownFilter}
        onSearch={handleSearch}
        onClear={handleClear}
        onExportReport={handleExportReport}
        onDownloadTemplate={downloadScheduleTemplateCsv}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        hasActiveEmployee={Boolean(selectedEmployeeId)}
      />

      {/* 4. Split Workspace: Employee Sidebar & Monthly Calendar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* 4.1 Left Employee List Panel */}
        <EmployeeSidebar
          employees={filteredEmployees}
          selectedEmployeeId={selectedEmployeeId}
          onSelectEmployee={(id) => setSelectedEmployeeId(id)}
        />

        {/* 4.2 Right Monthly Calendar Grid */}
        <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
          <MonthlyCalendar
            currentYear={currentYear}
            currentMonth={currentMonth}
            selectedEmployeeId={selectedEmployeeId}
            schedules={schedules}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onOpenEditDate={handleOpenEditDate}
          />

          {/* 4.3 Bottom Section: Working Schedule Statistics (Collapsible) */}
          <ScheduleStatistics
            selectedEmployeeId={selectedEmployeeId}
            currentYear={currentYear}
            currentMonth={currentMonth}
            schedules={schedules}
          />
        </div>
      </div>

      {/* 5. Schedule Detail & Edit Modal */}
      {activeEmployee && isDetailModalOpen && (
        <ScheduleDetailModal
          isOpen={isDetailModalOpen}
          date={activeEditDate}
          employee={activeEmployee}
          scheduleRecord={activeRecord}
          onClose={() => setIsDetailModalOpen(false)}
          onSaveSchedule={handleSaveSchedule}
          onDeleteChangeRequests={handleDeleteChangeRequests}
        />
      )}

      {/* Schedule Import Modal */}
      <ScheduleImportModal
        isOpen={isImportModalOpen}
        employees={MOCK_USERS}
        onClose={() => setIsImportModalOpen(false)}
        onImportSchedules={handleImportSchedules}
      />
    </div>
  );
};

export default WorkSchedulePage;
