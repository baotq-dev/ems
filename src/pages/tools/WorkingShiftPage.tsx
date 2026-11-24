import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Download,
  FilePlus,
  Plus,
  X,
  Pencil,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
} from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { WorkingShiftRecord } from '@/types/workingShift';
import { INITIAL_WORKING_SHIFTS, MOCK_SHIFT_GROUPS } from '@/mocks/workingShiftMockData';
import { InsertShiftModal } from '@/components/workingShift/InsertShiftModal';
import { UpdateShiftModal } from '@/components/workingShift/UpdateShiftModal';
import { WorkingShiftImportModal } from '@/components/workingShift/WorkingShiftImportModal';
import { generateShiftTemplateXlsx, exportWorkingShiftsCsv } from '@/utils/excel';

export const WorkingShiftPage: React.FC = () => {
  const { t } = useI18n();

  // Primary shift list state
  const [shifts, setShifts] = useState<WorkingShiftRecord[]>(INITIAL_WORKING_SHIFTS);

  // Search card state
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [filterShiftGroup, setFilterShiftGroup] = useState<string>('');
  const [filterActiveOnly, setFilterActiveOnly] = useState<boolean>(true);
  const [appliedShiftGroup, setAppliedShiftGroup] = useState<string>('');
  const [appliedActiveOnly, setAppliedActiveOnly] = useState<boolean>(true);

  // Inline column filter states
  const [colFilterGroup, setColFilterGroup] = useState('');
  const [colFilterGroupName, setColFilterGroupName] = useState('');
  const [colFilterShiftCode, setColFilterShiftCode] = useState('');
  const [colFilterShiftName, setColFilterShiftName] = useState('');
  const [colFilterFrom, setColFilterFrom] = useState('');
  const [colFilterTo, setColFilterTo] = useState('');
  const [colFilterValue, setColFilterValue] = useState('');
  const [colFilterRefCode, setColFilterRefCode] = useState('');
  const [colFilterNote, setColFilterNote] = useState('');

  // Pagination state (default 50)
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<WorkingShiftRecord | null>(null);

  // Search trigger
  const handleSearch = () => {
    setAppliedShiftGroup(filterShiftGroup);
    setAppliedActiveOnly(filterActiveOnly);
    setCurrentPage(1);
  };

  // Clear trigger
  const handleClear = () => {
    setFilterShiftGroup('');
    setFilterActiveOnly(true);
    setAppliedShiftGroup('');
    setAppliedActiveOnly(true);
    setColFilterGroup('');
    setColFilterGroupName('');
    setColFilterShiftCode('');
    setColFilterShiftName('');
    setColFilterFrom('');
    setColFilterTo('');
    setColFilterValue('');
    setColFilterRefCode('');
    setColFilterNote('');
    setCurrentPage(1);
  };

  // CRUD Handlers
  const handleCreateShift = (newShift: WorkingShiftRecord) => {
    setShifts((prev) => [newShift, ...prev]);
  };

  const handleUpdateShift = (updatedShift: WorkingShiftRecord) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === updatedShift.id ? updatedShift : s))
    );
  };

  const handleImportShifts = (newShifts: WorkingShiftRecord[]) => {
    setShifts((prev) => {
      // Append or replace matching codes
      const existingCodes = new Set(prev.map((p) => p.shiftCode.toLowerCase()));
      const nonOverlapping = newShifts.filter((n) => !existingCodes.has(n.shiftCode.toLowerCase()));
      return [...nonOverlapping, ...prev];
    });
  };

  // Filtered dataset
  const filteredShifts = useMemo(() => {
    return shifts.filter((item) => {
      // Top filter criteria
      if (appliedShiftGroup && item.shiftGroup !== appliedShiftGroup) {
        return false;
      }
      if (appliedActiveOnly && !item.isActive) {
        return false;
      }

      // Inline column criteria
      if (colFilterGroup && !item.shiftGroup.toLowerCase().includes(colFilterGroup.toLowerCase())) {
        return false;
      }
      if (colFilterGroupName && !item.groupName.toLowerCase().includes(colFilterGroupName.toLowerCase())) {
        return false;
      }
      if (colFilterShiftCode && !item.shiftCode.toLowerCase().includes(colFilterShiftCode.toLowerCase())) {
        return false;
      }
      if (colFilterShiftName && !item.shiftName.toLowerCase().includes(colFilterShiftName.toLowerCase())) {
        return false;
      }
      if (colFilterFrom && !item.fromTime.toLowerCase().includes(colFilterFrom.toLowerCase())) {
        return false;
      }
      if (colFilterTo && !item.toTime.toLowerCase().includes(colFilterTo.toLowerCase())) {
        return false;
      }
      if (colFilterValue && !String(item.value).includes(colFilterValue)) {
        return false;
      }
      if (colFilterRefCode && !item.refCode.toLowerCase().includes(colFilterRefCode.toLowerCase())) {
        return false;
      }
      if (colFilterNote && !(item.note || '').toLowerCase().includes(colFilterNote.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [
    shifts,
    appliedShiftGroup,
    appliedActiveOnly,
    colFilterGroup,
    colFilterGroupName,
    colFilterShiftCode,
    colFilterShiftName,
    colFilterFrom,
    colFilterTo,
    colFilterValue,
    colFilterRefCode,
    colFilterNote,
  ]);

  // Paginated dataset
  const totalEntries = filteredShifts.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalEntries, currentPage * pageSize);

  const paginatedShifts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShifts.slice(start, start + pageSize);
  }, [filteredShifts, currentPage, pageSize]);

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
        {/* Header Bar: var(--color-primary), white bold text "Search" + chevron */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsFilterCollapsed(!isFilterCollapsed);
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
          {isFilterCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
          <span>{t('action.search', 'Search')}</span>
        </div>

        {/* Card Body */}
        {!isFilterCollapsed && (
          <div style={{ padding: '16px' }}>
            {/* Filter Inputs (Horizontal Row) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', marginBottom: '16px' }}>
              {/* 1. Shift Group */}
              <div style={{ minWidth: '220px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('shift.shift_group', 'Shift Group')}
                </label>
                <select
                  value={filterShiftGroup}
                  onChange={(e) => setFilterShiftGroup(e.target.value)}
                  style={{
                    width: '100%',
                    height: '32px',
                    padding: '0 8px',
                    fontSize: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                  }}
                >
                  <option value="">{t('common.all', 'All')}</option>
                  {MOCK_SHIFT_GROUPS.map((g) => (
                    <option key={g.code} value={g.code}>
                      {g.code} - {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Status Checkbox (Active) */}
              <div style={{ display: 'flex', alignItems: 'center', height: '32px' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                  <input
                    type="checkbox"
                    checked={filterActiveOnly}
                    onChange={(e) => setFilterActiveOnly(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <span>{t('user.status_active', 'Active')}</span>
                </label>
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
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)',
              }}
            >
              {/* Left Group: Search & Export Report */}
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
                  <Search size={15} /> {t('action.search', 'Search')}
                </button>
                <button
                  type="button"
                  onClick={() => exportWorkingShiftsCsv(filteredShifts)}
                  style={{
                    height: '32px',
                    padding: '0 14px',
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
                  <Download size={15} /> {t('action.export_report', 'Export Report')}
                </button>
              </div>

              {/* Right Group: Template File, Add, Import File, Clear */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={generateShiftTemplateXlsx}
                  style={{
                    height: '32px',
                    padding: '0 14px',
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
                  <Download size={15} /> {t('shift.template_file', 'Template File')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
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
                  <FilePlus size={15} /> {t('action.add', 'Add')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportOpen(true)}
                  style={{
                    height: '32px',
                    padding: '0 14px',
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
                  <Plus size={15} /> {t('shift.import_file', 'Import File')}
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

      {/* 3.2 Shift Data Table & Pagination Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Top Bar with Pagination Controls */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
              Showing {startIndex} to {endIndex} of {totalEntries} entries
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '8px' }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(1)}
                style={{
                  width: '26px',
                  height: '26px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage <= 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <ChevronsLeft size={13} />
              </button>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                style={{
                  width: '26px',
                  height: '26px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage <= 1 ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <ChevronLeft size={13} />
              </button>
              <span style={{ fontSize: '12px', padding: '0 6px', fontWeight: 500 }}>
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{
                  width: '26px',
                  height: '26px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage >= totalPages ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <ChevronRight size={13} />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                style={{
                  width: '26px',
                  height: '26px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage >= totalPages ? 0.4 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <ChevronsRight size={13} />
              </button>
            </div>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                height: '26px',
                fontSize: '12px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface)',
              }}
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Data Table with Row 1 Header & Row 2 Inline Filters */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
            <thead>
              {/* Row 1: Column Headers */}
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ width: '45px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('table.no', 'No.')}</th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('shift.shift_group', 'Shift Group')}</th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('shift.group_name', 'Group Name')}</th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('shift.shift_code', 'Shift Code')}</th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('shift.shift_name', 'Shift Name')}</th>
                <th style={{ width: '50px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('shift.ot', 'OT')}</th>
                <th style={{ width: '70px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('shift.from', 'From')}</th>
                <th style={{ width: '70px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('shift.to', 'To')}</th>
                <th style={{ width: '60px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('shift.value', 'Value')}</th>
                <th style={{ width: '85px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('shift.ref_code', 'Ref Code')}</th>
                <th style={{ width: '85px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('shift.skip_report', 'Skip Report')}</th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700, textAlign: 'left' }}>{t('field.note', 'Note')}</th>
                <th style={{ width: '65px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('action.actions', 'Actions')}</th>
              </tr>

              {/* Row 2: Inline Column Filters */}
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '4px' }}></th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={colFilterGroup}
                    onChange={(e) => {
                      setColFilterGroup(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '24px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={colFilterGroupName}
                    onChange={(e) => {
                      setColFilterGroupName(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '24px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={colFilterShiftCode}
                    onChange={(e) => {
                      setColFilterShiftCode(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '24px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={colFilterShiftName}
                    onChange={(e) => {
                      setColFilterShiftName(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '24px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}></th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={colFilterFrom}
                    onChange={(e) => {
                      setColFilterFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="HH:mm"
                    style={{ width: '100%', height: '24px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={colFilterTo}
                    onChange={(e) => {
                      setColFilterTo(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="HH:mm"
                    style={{ width: '100%', height: '24px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={colFilterValue}
                    onChange={(e) => {
                      setColFilterValue(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Val"
                    style={{ width: '100%', height: '24px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={colFilterRefCode}
                    onChange={(e) => {
                      setColFilterRefCode(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="ON/OFF"
                    style={{ width: '100%', height: '24px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}></th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={colFilterNote}
                    onChange={(e) => {
                      setColFilterNote(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '24px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedShifts.length === 0 ? (
                <tr>
                  <td colSpan={13} style={{ padding: '32px 16px', color: 'var(--text-secondary)' }}>
                    No working shift records found.
                  </td>
                </tr>
              ) : (
                paginatedShifts.map((row, index) => {
                  const seqNo = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-canvas)',
                      }}
                    >
                      <td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>{seqNo}</td>
                      <td style={{ padding: '8px 6px', fontWeight: 600 }}>{row.shiftGroup}</td>
                      <td style={{ padding: '8px 6px' }}>{row.groupName}</td>
                      <td style={{ padding: '8px 6px', fontWeight: 600, color: 'var(--color-primary)' }}>{row.shiftCode}</td>
                      <td style={{ padding: '8px 6px' }}>{row.shiftName}</td>
                      {/* OT Read-only checkbox */}
                      <td style={{ padding: '8px 4px' }}>
                        <input
                          type="checkbox"
                          checked={row.isOt}
                          readOnly
                          style={{ pointerEvents: 'none', cursor: 'default' }}
                        />
                      </td>
                      <td style={{ padding: '8px 4px' }}>{row.fromTime}</td>
                      <td style={{ padding: '8px 4px' }}>{row.toTime}</td>
                      <td style={{ padding: '8px 4px' }}>{row.value}</td>
                      {/* Ref Code: ON / OFF */}
                      <td style={{ padding: '8px 4px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: row.refCode === 'ON' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            color: row.refCode === 'ON' ? 'var(--color-success-accent)' : '#6B7280',
                            border: `1px solid ${row.refCode === 'ON' ? 'var(--color-success-accent)' : '#9CA3AF'}`,
                          }}
                        >
                          {row.refCode}
                        </span>
                      </td>
                      {/* Skip Report Read-only checkbox */}
                      <td style={{ padding: '8px 4px' }}>
                        <input
                          type="checkbox"
                          checked={row.skipReport}
                          readOnly
                          style={{ pointerEvents: 'none', cursor: 'default' }}
                        />
                      </td>
                      {/* Note */}
                      <td style={{ padding: '8px 6px', textAlign: 'left', color: 'var(--text-secondary)' }}>
                        {row.note || '-'}
                      </td>
                      {/* Actions: Circular outline icon button with Pencil */}
                      <td style={{ padding: '8px 4px' }}>
                        <button
                          type="button"
                          onClick={() => setEditingShift(row)}
                          title="Edit Shift"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: '1px solid var(--color-primary)',
                            backgroundColor: 'transparent',
                            color: 'var(--color-primary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insert Shift Modal */}
      <InsertShiftModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddShift={handleCreateShift}
      />

      {/* Update Shift Modal */}
      <UpdateShiftModal
        isOpen={Boolean(editingShift)}
        shift={editingShift}
        onClose={() => setEditingShift(null)}
        onUpdateShift={handleUpdateShift}
      />

      {/* Working Shift Import Modal */}
      <WorkingShiftImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportShifts={handleImportShifts}
      />
    </div>
  );
};
