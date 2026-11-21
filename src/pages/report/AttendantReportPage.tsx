import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  Eye,
  UserPlus,
  Star,
  Pencil,
  X,
  ArrowUpDown,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
} from 'lucide-react';
import { MOCK_ATTENDANT_LOGS } from '@/mocks/attendantMockData';
import { MOCK_USERS } from '@/mocks/users';
import { AttendantLogRecord, FaceVerificationStatus } from '@/types/attendant';
import { useI18n } from '@/context/I18nContext';

export const AttendantReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [logs, setLogs] = useState<AttendantLogRecord[]>(MOCK_ATTENDANT_LOGS);

  // Search Collapsible State
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);

  // Search Filter State
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterChain, setFilterChain] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [filterSupervisorId, setFilterSupervisorId] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterStoreCode, setFilterStoreCode] = useState('');

  // Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: '',
    toDate: '',
    channel: '',
    chain: '',
    zone: '',
    province: '',
    supervisorId: '',
    position: '',
    employeeId: '',
    storeCode: '',
  });

  // Inline Quick Filters
  const [inlineZone, setInlineZone] = useState('');
  const [inlineChain, setInlineChain] = useState('');
  const [inlineStoreName, setInlineStoreName] = useState('');
  const [inlineAddress, setInlineAddress] = useState('');
  const [inlineEmployeeName, setInlineEmployeeName] = useState('');

  // Sorting
  const [sortField, setSortField] = useState<keyof AttendantLogRecord | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Photo Preview Modal
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Manual Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addRecord, setAddRecord] = useState<Partial<AttendantLogRecord>>({
    zone: 'A',
    channel: 'MT',
    chain: 'Emart',
    verificationStatus: 'Matched',
    workDate: '2026-11-18',
    shiftCode: 'CA_AM',
    shiftTimeRange: '08:00-16:00',
    checkInTime: '08:00',
    checkOutTime: '16:00',
    totalDuration: '08:00:00',
    checkInDistanceMeters: 10,
    checkOutDistanceMeters: 10,
  });

  // Action status override dropdown menu
  const [activeOverrideMenuId, setActiveOverrideMenuId] = useState<string | null>(null);

  const supervisors = useMemo(() => {
    return MOCK_USERS.filter((u) => u.currentPosition === 'Supervisor' || u.currentPosition === 'Admin');
  }, []);

  const employees = useMemo(() => {
    return MOCK_USERS;
  }, []);

  // Handle Search
  const handleSearch = () => {
    setAppliedFilters({
      fromDate: filterFromDate,
      toDate: filterToDate,
      channel: filterChannel,
      chain: filterChain,
      zone: filterZone,
      province: filterProvince,
      supervisorId: filterSupervisorId,
      position: filterPosition,
      employeeId: filterEmployeeId,
      storeCode: filterStoreCode,
    });
    setCurrentPage(1);
  };

  const handleClear = () => {
    setFilterFromDate('');
    setFilterToDate('');
    setFilterChannel('');
    setFilterChain('');
    setFilterZone('');
    setFilterProvince('');
    setFilterSupervisorId('');
    setFilterPosition('');
    setFilterEmployeeId('');
    setFilterStoreCode('');
    setInlineZone('');
    setInlineChain('');
    setInlineStoreName('');
    setInlineAddress('');
    setInlineEmployeeName('');
    setAppliedFilters({
      fromDate: '',
      toDate: '',
      channel: '',
      chain: '',
      zone: '',
      province: '',
      supervisorId: '',
      position: '',
      employeeId: '',
      storeCode: '',
    });
    setCurrentPage(1);
  };

  const handleSort = (field: keyof AttendantLogRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filtered & Sorted Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (appliedFilters.fromDate && log.workDate < appliedFilters.fromDate) return false;
      if (appliedFilters.toDate && log.workDate > appliedFilters.toDate) return false;
      if (appliedFilters.channel && log.channel !== appliedFilters.channel) return false;
      if (appliedFilters.chain && log.chain !== appliedFilters.chain) return false;
      if (appliedFilters.zone && log.zone !== appliedFilters.zone) return false;
      if (appliedFilters.province && log.province !== appliedFilters.province) return false;
      if (appliedFilters.supervisorId && log.supervisorId !== appliedFilters.supervisorId) return false;
      if (appliedFilters.position && log.position !== appliedFilters.position) return false;
      if (appliedFilters.employeeId && log.userId !== appliedFilters.employeeId) return false;
      if (appliedFilters.storeCode && !log.storeCode.toLowerCase().includes(appliedFilters.storeCode.toLowerCase())) return false;

      // Inline filters
      if (inlineZone && !log.zone.toLowerCase().includes(inlineZone.toLowerCase())) return false;
      if (inlineChain && !log.chain.toLowerCase().includes(inlineChain.toLowerCase())) return false;
      if (inlineStoreName && !(`${log.storeCode} ${log.storeName}`).toLowerCase().includes(inlineStoreName.toLowerCase())) return false;
      if (inlineAddress && !log.storeAddress.toLowerCase().includes(inlineAddress.toLowerCase())) return false;
      if (inlineEmployeeName && !(`${log.employeeName} ${log.phoneNumber}`).toLowerCase().includes(inlineEmployeeName.toLowerCase())) return false;

      return true;
    });
  }, [logs, appliedFilters, inlineZone, inlineChain, inlineStoreName, inlineAddress, inlineEmployeeName]);

  const sortedLogs = useMemo(() => {
    if (!sortField) return filteredLogs;
    return [...filteredLogs].sort((a, b) => {
      const valA = String(a[sortField] || '').toLowerCase();
      const valB = String(b[sortField] || '').toLowerCase();
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLogs, sortField, sortOrder]);

  const totalEntries = sortedLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalEntries, currentPage * pageSize);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLogs.slice(start, start + pageSize);
  }, [sortedLogs, currentPage, pageSize]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'No.',
      'Zone',
      'Chain',
      'Store Code',
      'Store Name',
      'Address',
      'Employee Code',
      'Employee Name',
      'Phone Number',
      'Position',
      'Date',
      'Shift',
      'Check In',
      'Check Out',
      'Verification Status',
      'Distance In (m)',
      'Distance Out (m)',
      'Total Duration',
    ];

    const rows = sortedLogs.map((log, idx) => [
      idx + 1,
      log.zone,
      `"${log.chain}"`,
      `"${log.storeCode}"`,
      `"${log.storeName}"`,
      `"${log.storeAddress}"`,
      log.employeeCode,
      `"${log.employeeName}"`,
      log.phoneNumber,
      `"${log.position}"`,
      log.workDate,
      `"${log.shiftCode} (${log.shiftTimeRange})"`,
      log.checkInTime || '',
      log.checkOutTime || '',
      log.verificationStatus,
      log.checkInDistanceMeters,
      log.checkOutDistanceMeters ?? 0,
      log.totalDuration,
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance_logs_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Status Override Handler
  const handleOverrideStatus = (logId: string, newStatus: FaceVerificationStatus) => {
    setLogs((prev) =>
      prev.map((item) => (item.id === logId ? { ...item, verificationStatus: newStatus } : item))
    );
    setActiveOverrideMenuId(null);
  };

  // Manual Add Submit
  const handleSaveAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: AttendantLogRecord = {
      id: `att-log-${Date.now()}`,
      region: 'South',
      zone: addRecord.zone || 'A',
      channel: addRecord.channel || 'MT',
      chain: addRecord.chain || 'Emart',
      storeCode: addRecord.storeCode || 'HCM_NEW',
      storeName: addRecord.storeName || 'NEW STORE',
      storeAddress: addRecord.storeAddress || 'Ho Chi Minh City',
      province: 'Ho Chi Minh City',
      supervisorId: addRecord.supervisorId || 'usr-003',
      supervisorName: addRecord.supervisorName || 'Tran Thi Mai',
      userId: addRecord.userId || 'usr-004',
      employeeCode: addRecord.employeeCode || 'FD004',
      employeeName: addRecord.employeeName || 'Le Hoang Nam',
      phoneNumber: addRecord.phoneNumber || '0934567890',
      position: 'PG-Inline',
      workDate: addRecord.workDate || '2026-11-18',
      shiftCode: addRecord.shiftCode || 'CA_AM',
      shiftTimeRange: addRecord.shiftTimeRange || '08:00-16:00',
      checkInTime: addRecord.checkInTime || '08:00',
      checkOutTime: addRecord.checkOutTime || '16:00',
      verificationStatus: addRecord.verificationStatus || 'Matched',
      checkInDistanceMeters: Number(addRecord.checkInDistanceMeters) || 10,
      checkOutDistanceMeters: Number(addRecord.checkOutDistanceMeters) || 10,
      totalDuration: addRecord.totalDuration || '08:00:00',
      checkInPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      checkOutPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };
    setLogs([newLog, ...logs]);
    setIsAddModalOpen(false);
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
          <span>{t('action.search', 'Search')}</span>
        </div>

        {!isSearchCollapsed && (
          <div style={{ padding: '16px' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {/* 1. Date Range */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  {t('field.date_range', 'Date Range')}
                </label>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                    style={{ width: '100%', height: '30px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                  <span>-</span>
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                    style={{ width: '100%', height: '30px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>

              {/* 2. Channel */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  {t('field.channel', 'Channel')}
                </label>
                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select channel</option>
                  <option value="MT">MT (Modern Trade)</option>
                  <option value="GT">GT (General Trade)</option>
                </select>
              </div>

              {/* 3. Chain */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  {t('field.chain', 'Chain')}
                </label>
                <select
                  value={filterChain}
                  onChange={(e) => setFilterChain(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select chain</option>
                  <option value="Emart">Emart</option>
                  <option value="Co.opmart">Co.opmart</option>
                  <option value="WinMart">WinMart</option>
                  <option value="Lotte Mart">Lotte Mart</option>
                </select>
              </div>

              {/* 4. Zone */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  {t('field.zone', 'Zone')}
                </label>
                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select zone</option>
                  <option value="A">Zone A</option>
                  <option value="B">Zone B</option>
                  <option value="C">Zone C</option>
                </select>
              </div>

              {/* 5. Province/City */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  {t('field.province', 'Province/City')}
                </label>
                <select
                  value={filterProvince}
                  onChange={(e) => setFilterProvince(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select province</option>
                  <option value="Ho Chi Minh City">Ho Chi Minh City</option>
                  <option value="Ha Noi">Ha Noi</option>
                  <option value="Da Nang">Da Nang</option>
                </select>
              </div>

              {/* 6. Supervisor */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  {t('field.supervisor', 'Supervisor')}
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

              {/* 7. Position */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  {t('field.position', 'Position')}
                </label>
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select position</option>
                  <option value="PG-Inline">PG-Inline</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              {/* 8. Employee */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  {t('field.employee', 'Employee')}
                </label>
                <select
                  value={filterEmployeeId}
                  onChange={(e) => setFilterEmployeeId(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.employeeCode} - {emp.fullName}</option>
                  ))}
                </select>
              </div>

              {/* 9. Store Code */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>
                  {t('field.store_code', 'Store Code')}
                </label>
                <input
                  type="text"
                  placeholder="Enter store code"
                  value={filterStoreCode}
                  onChange={(e) => setFilterStoreCode(e.target.value)}
                  style={{ width: '100%', height: '30px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                />
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
                  <Search size={15} /> {t('action.search', 'Search')}
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
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
                  <Download size={15} /> {t('action.export_file', 'Export CSV')}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/attendant-summary')}
                  style={{
                    height: '32px',
                    padding: '0 12px',
                    backgroundColor: 'var(--color-primary-soft-bg)',
                    color: 'var(--color-primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid var(--color-primary)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Eye size={15} /> Image Verification Stats
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
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
                  <UserPlus size={15} /> {t('action.add', 'Add')}
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

      {/* 3.2 Verification Legend & Data Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Top Bar with Pagination & Verification Legend */}
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
          {/* Centered / Left Pagination Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
              Showing {startIndex} to {endIndex} of {totalEntries} entries
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginLeft: '8px' }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(1)}
                style={{ width: '26px', height: '26px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronsLeft size={13} />
              </button>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                style={{ width: '26px', height: '26px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={13} />
              </button>
              <span style={{ fontSize: '12px', padding: '0 6px' }}>
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                style={{ width: '26px', height: '26px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronRight size={13} />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                style={{ width: '26px', height: '26px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
              style={{ height: '26px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Right-aligned Image Verification Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: 600 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Image Verification Legend:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="#2E7D32" color="#2E7D32" />
              <span style={{ color: '#2E7D32' }}>Matched</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="#F59E0B" color="#F59E0B" />
              <span style={{ color: '#F59E0B' }}>Mismatched</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={14} fill="var(--color-primary)" color="var(--color-primary)" />
              <span style={{ color: 'var(--color-primary)' }}>Scan Failed</span>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ width: '40px', padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('table.no', 'No.')}</th>
                <th onClick={() => handleSort('zone')} style={{ padding: '8px', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <span>{t('field.zone', 'Zone')}</span> <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('chain')} style={{ padding: '8px', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <span>{t('field.chain', 'Chain')}</span> <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('storeName')} style={{ padding: '8px', textAlign: 'left', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <span>{t('field.store_name', 'Store Name')}</span> <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ padding: '8px', textAlign: 'left', color: 'var(--color-primary)', fontWeight: 700 }}>Address</th>
                <th onClick={() => handleSort('employeeName')} style={{ padding: '8px', textAlign: 'left', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <span>Employee Name</span> <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort('workDate')} style={{ padding: '8px', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <span>Date & Shift</span> <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>Check-in - Check-out</th>
                <th style={{ padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>Distance</th>
                <th onClick={() => handleSort('totalDuration')} style={{ padding: '8px', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <span>Total Duration</span> <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ width: '60px', padding: '8px', color: 'var(--color-primary)', fontWeight: 700 }}>#</th>
              </tr>
              {/* Inline Quick Filters */}
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '2px solid var(--border-color)' }}>
                <th></th>
                <th style={{ padding: '3px' }}>
                  <input
                    type="text"
                    placeholder="Zone..."
                    value={inlineZone}
                    onChange={(e) => setInlineZone(e.target.value)}
                    style={{ width: '100%', height: '24px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}
                  />
                </th>
                <th style={{ padding: '3px' }}>
                  <input
                    type="text"
                    placeholder="Chain..."
                    value={inlineChain}
                    onChange={(e) => setInlineChain(e.target.value)}
                    style={{ width: '100%', height: '24px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}
                  />
                </th>
                <th style={{ padding: '3px' }}>
                  <input
                    type="text"
                    placeholder="Filter store..."
                    value={inlineStoreName}
                    onChange={(e) => setInlineStoreName(e.target.value)}
                    style={{ width: '100%', height: '24px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '3px' }}>
                  <input
                    type="text"
                    placeholder="Filter address..."
                    value={inlineAddress}
                    onChange={(e) => setInlineAddress(e.target.value)}
                    style={{ width: '100%', height: '24px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '3px' }}>
                  <input
                    type="text"
                    placeholder="Filter employee..."
                    value={inlineEmployeeName}
                    onChange={(e) => setInlineEmployeeName(e.target.value)}
                    style={{ width: '100%', height: '24px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '24px', color: 'var(--text-secondary)' }}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => {
                  const starColor =
                    log.verificationStatus === 'Matched'
                      ? '#2E7D32'
                      : log.verificationStatus === 'Mismatched'
                      ? '#F59E0B'
                      : 'var(--color-primary)';

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px' }}>{(currentPage - 1) * pageSize + idx + 1}</td>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{log.zone}</td>
                      <td style={{ padding: '8px' }}>{log.chain}</td>

                      {/* Store Name 2-line */}
                      <td style={{ padding: '8px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{log.storeCode}</div>
                        <div style={{ color: 'var(--text-primary)' }}>{log.storeName}</div>
                      </td>

                      {/* Address */}
                      <td style={{ padding: '8px', textAlign: 'left', maxWidth: '200px', whiteSpace: 'normal' }}>
                        {log.storeAddress}
                      </td>

                      {/* Employee Name 3-line */}
                      <td style={{ padding: '8px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{log.phoneNumber}</div>
                        <div style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{log.employeeName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{log.position}</div>
                      </td>

                      {/* Date & Shift 3-line */}
                      <td style={{ padding: '8px' }}>
                        <div>{log.workDate}</div>
                        <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{log.shiftCode}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>({log.shiftTimeRange})</div>
                      </td>

                      {/* Check-in - Check-out Side-by-side with photo and star */}
                      <td style={{ padding: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {/* Check-in */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {log.checkInTime || '-'}
                            </span>
                            {log.checkInPhotoUrl ? (
                              <div style={{ position: 'relative', marginTop: '2px' }}>
                                <img
                                  src={log.checkInPhotoUrl}
                                  alt="Check In"
                                  onClick={() => setPreviewPhoto({ url: log.checkInPhotoUrl!, title: `Check-in: ${log.employeeName} (${log.checkInTime})` })}
                                  style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                                />
                                <div style={{ position: 'absolute', top: '-4px', right: '-4px' }}>
                                  <Star size={13} fill={starColor} color={starColor} />
                                </div>
                              </div>
                            ) : (
                              <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                N/A
                              </div>
                            )}
                          </div>

                          {/* Check-out */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {log.checkOutTime || '-'}
                            </span>
                            {log.checkOutPhotoUrl ? (
                              <div style={{ position: 'relative', marginTop: '2px' }}>
                                <img
                                  src={log.checkOutPhotoUrl}
                                  alt="Check Out"
                                  onClick={() => setPreviewPhoto({ url: log.checkOutPhotoUrl!, title: `Check-out: ${log.employeeName} (${log.checkOutTime})` })}
                                  style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid var(--border-color)' }}
                                />
                                <div style={{ position: 'absolute', top: '-4px', right: '-4px' }}>
                                  <Star size={13} fill={starColor} color={starColor} />
                                </div>
                              </div>
                            ) : (
                              <div style={{ width: '42px', height: '42px', backgroundColor: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                N/A
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Distance 2-line */}
                      <td style={{ padding: '8px' }}>
                        <div>In: {log.checkInDistanceMeters} (m)</div>
                        <div>Out: {log.checkOutDistanceMeters ?? 0} (m)</div>
                      </td>

                      {/* Total Duration */}
                      <td style={{ padding: '8px', fontWeight: 700 }}>{log.totalDuration}</td>

                      {/* Actions with Status Override Menu */}
                      <td style={{ padding: '8px', position: 'relative' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveOverrideMenuId(activeOverrideMenuId === log.id ? null : log.id)
                            }
                            title="Override Verification Status"
                            style={{
                              padding: '4px 6px',
                              backgroundColor: 'var(--color-primary-soft-bg)',
                              color: 'var(--color-primary)',
                              border: '1px solid var(--color-primary)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                            }}
                          >
                            <Pencil size={12} />
                            <ChevronDown size={10} />
                          </button>

                          {activeOverrideMenuId === log.id && (
                            <div
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                zIndex: 30,
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                padding: '4px 0',
                                minWidth: '130px',
                                textAlign: 'left',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleOverrideStatus(log.id, 'Matched')}
                                style={{
                                  width: '100%',
                                  padding: '6px 12px',
                                  border: 'none',
                                  background: 'none',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  color: '#2E7D32',
                                  fontWeight: 600,
                                  textAlign: 'left',
                                }}
                              >
                                Set Matched
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOverrideStatus(log.id, 'Mismatched')}
                                style={{
                                  width: '100%',
                                  padding: '6px 12px',
                                  border: 'none',
                                  background: 'none',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  color: '#F59E0B',
                                  fontWeight: 600,
                                  textAlign: 'left',
                                }}
                              >
                                Set Mismatched
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOverrideStatus(log.id, 'ScanFailed')}
                                style={{
                                  width: '100%',
                                  padding: '6px 12px',
                                  border: 'none',
                                  background: 'none',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  color: 'var(--color-primary)',
                                  fontWeight: 600,
                                  textAlign: 'left',
                                }}
                              >
                                Set Scan Failed
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enlarged Photo Preview Modal */}
      {previewPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              maxWidth: '450px',
              width: '100%',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-primary)' }}>
                {previewPhoto.title}
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <img
              src={previewPhoto.url}
              alt="Verification Preview"
              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
            />
          </div>
        </div>
      )}

      {/* Manual Add Attendance Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)',
              borderTop: '4px solid var(--color-primary)',
              maxWidth: '520px',
              width: '100%',
              padding: '20px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Record Manual Attendance</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAddRecord} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Employee</label>
                <select
                  required
                  value={addRecord.userId}
                  onChange={(e) => {
                    const emp = employees.find((x) => x.id === e.target.value);
                    if (emp) {
                      setAddRecord({
                        ...addRecord,
                        userId: emp.id,
                        employeeCode: emp.employeeCode,
                        employeeName: emp.fullName,
                        phoneNumber: emp.phoneNumber,
                      });
                    }
                  }}
                  style={{ width: '100%', height: '32px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px' }}
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.employeeCode} - {emp.fullName}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Work Date</label>
                  <input
                    type="date"
                    required
                    value={addRecord.workDate}
                    onChange={(e) => setAddRecord({ ...addRecord, workDate: e.target.value })}
                    style={{ width: '100%', height: '32px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Store Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMART PHAN VAN TRI"
                    value={addRecord.storeName || ''}
                    onChange={(e) => setAddRecord({ ...addRecord, storeName: e.target.value })}
                    style={{ width: '100%', height: '32px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Check In Time</label>
                  <input
                    type="text"
                    placeholder="08:00"
                    value={addRecord.checkInTime || ''}
                    onChange={(e) => setAddRecord({ ...addRecord, checkInTime: e.target.value })}
                    style={{ width: '100%', height: '32px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Check Out Time</label>
                  <input
                    type="text"
                    placeholder="16:00"
                    value={addRecord.checkOutTime || ''}
                    onChange={(e) => setAddRecord({ ...addRecord, checkOutTime: e.target.value })}
                    style={{ width: '100%', height: '32px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Verification Status</label>
                <select
                  value={addRecord.verificationStatus}
                  onChange={(e) => setAddRecord({ ...addRecord, verificationStatus: e.target.value as FaceVerificationStatus })}
                  style={{ width: '100%', height: '32px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0 8px' }}
                >
                  <option value="Matched">Matched</option>
                  <option value="Mismatched">Mismatched</option>
                  <option value="ScanFailed">ScanFailed</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{ padding: '6px 14px', fontSize: '13px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: 'var(--bg-surface)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: 'var(--color-primary)', color: '#FFFFFF', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendantReportPage;
