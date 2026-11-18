import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Download,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { SellOutReportRecord } from '@/types/sellOut';
import { MOCK_SELL_OUT_RECORDS } from '@/mocks/sellOutMockData';
import { MOCK_USERS } from '@/mocks/users';
import { CreateSellOutModal } from '@/components/sellOut/CreateSellOutModal';

type SortField =
  | 'zoneCode'
  | 'chain'
  | 'storeName'
  | 'storeAddress'
  | 'employeeName'
  | 'recordedAt'
  | 'totalQuantity';

type SortDirection = 'asc' | 'desc';

export const SellOutPaReportPage: React.FC = () => {
  // Master records state initialized with mock data
  const [records, setRecords] = useState<SellOutReportRecord[]>(MOCK_SELL_OUT_RECORDS);

  // Search card collapsed state
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(true);

  // Search filter inputs
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterChannel, setFilterChannel] = useState<string>('');
  const [filterChain, setFilterChain] = useState<string>('');
  const [filterZone, setFilterZone] = useState<string>('');
  const [filterProvince, setFilterProvince] = useState<string>('');
  const [filterSupervisor, setFilterSupervisor] = useState<string>('');
  const [filterPosition, setFilterPosition] = useState<string>('');
  const [filterEmployee, setFilterEmployee] = useState<string>('');
  const [filterStoreCode, setFilterStoreCode] = useState<string>('');

  // Applied filters (updated when clicking Search)
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: '',
    endDate: '',
    channel: '',
    chain: '',
    zone: '',
    province: '',
    supervisor: '',
    position: '',
    employee: '',
    storeCode: '',
  });

  // Table inline quick-filters
  const [inlineZone, setInlineZone] = useState<string>('');
  const [inlineChain, setInlineChain] = useState<string>('');
  const [inlineStore, setInlineStore] = useState<string>('');
  const [inlineAddress, setInlineAddress] = useState<string>('');
  const [inlineEmployee, setInlineEmployee] = useState<string>('');
  const [inlineDate, setInlineDate] = useState<string>('');
  const [inlineTotal, setInlineTotal] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Expanded row IDs
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(
    () => new Set(['so-001']) // default first row expanded for immediate preview
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Unique options for search card dropdowns
  const channelOptions = useMemo(() => ['MT', 'GT'], []);
  const chainOptions = useMemo(() => ['Co.opmart', 'WinMart', 'Emart', 'Lotte Mart'], []);
  const zoneOptions = useMemo(() => ['HCM01', 'HCM02', 'HCM03', 'HN01', 'HP01'], []);
  const provinceOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.province))).sort(),
    [records]
  );
  const supervisorOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.supervisorName))).sort(),
    [records]
  );
  const positionOptions = useMemo(() => ['PG-D', 'PG-Inline', 'PA'], []);
  const employeeOptions = useMemo(() => {
    return MOCK_USERS.filter((u) =>
      ['PG-D', 'PG-Inline', 'PA'].includes(u.currentPosition)
    );
  }, []);

  const handleApplySearch = () => {
    setAppliedFilters({
      startDate: filterStartDate,
      endDate: filterEndDate,
      channel: filterChannel,
      chain: filterChain,
      zone: filterZone,
      province: filterProvince,
      supervisor: filterSupervisor,
      position: filterPosition,
      employee: filterEmployee,
      storeCode: filterStoreCode,
    });
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRowExpanded = (id: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteRecord = (record: SellOutReportRecord) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the sell-out report record for store "${record.storeName}" submitted by ${record.employeeName}?`
    );
    if (confirmed) {
      setRecords((prev) => prev.filter((r) => r.id !== record.id));
      setExpandedRowIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
  };

  const handleAddRecord = (newRecord: SellOutReportRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    // Automatically expand the newly created record
    setExpandedRowIds((prev) => new Set([newRecord.id, ...prev]));
  };

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Applied search filters
      if (appliedFilters.startDate) {
        const recordDate = r.recordedAt.split(' ')[0];
        if (recordDate < appliedFilters.startDate) return false;
      }
      if (appliedFilters.endDate) {
        const recordDate = r.recordedAt.split(' ')[0];
        if (recordDate > appliedFilters.endDate) return false;
      }
      if (appliedFilters.channel && r.channel !== appliedFilters.channel) return false;
      if (appliedFilters.chain && r.chain !== appliedFilters.chain) return false;
      if (appliedFilters.zone && r.zoneCode !== appliedFilters.zone) return false;
      if (appliedFilters.province && r.province !== appliedFilters.province) return false;
      if (appliedFilters.supervisor && r.supervisorName !== appliedFilters.supervisor) return false;
      if (appliedFilters.position && r.position !== appliedFilters.position) return false;
      if (appliedFilters.employee && r.userId !== appliedFilters.employee) return false;
      if (
        appliedFilters.storeCode &&
        !r.storeCode.toLowerCase().includes(appliedFilters.storeCode.toLowerCase())
      ) {
        return false;
      }

      // Inline quick filters
      if (inlineZone && !r.zoneCode.toLowerCase().includes(inlineZone.toLowerCase())) {
        return false;
      }
      if (inlineChain && !r.chain.toLowerCase().includes(inlineChain.toLowerCase())) {
        return false;
      }
      if (
        inlineStore &&
        !r.storeName.toLowerCase().includes(inlineStore.toLowerCase()) &&
        !r.storeCode.toLowerCase().includes(inlineStore.toLowerCase())
      ) {
        return false;
      }
      if (inlineAddress && !r.storeAddress.toLowerCase().includes(inlineAddress.toLowerCase())) {
        return false;
      }
      if (
        inlineEmployee &&
        !r.employeeName.toLowerCase().includes(inlineEmployee.toLowerCase()) &&
        !r.phoneNumber.toLowerCase().includes(inlineEmployee.toLowerCase()) &&
        !r.position.toLowerCase().includes(inlineEmployee.toLowerCase())
      ) {
        return false;
      }
      if (
        inlineDate &&
        !r.recordedAt.toLowerCase().includes(inlineDate.toLowerCase()) &&
        !r.shiftCode.toLowerCase().includes(inlineDate.toLowerCase())
      ) {
        return false;
      }
      if (inlineTotal && !String(r.totalQuantity).includes(inlineTotal)) {
        return false;
      }

      return true;
    });
  }, [
    records,
    appliedFilters,
    inlineZone,
    inlineChain,
    inlineStore,
    inlineAddress,
    inlineEmployee,
    inlineDate,
    inlineTotal,
  ]);

  const sortedRecords = useMemo(() => {
    if (!sortField) return filteredRecords;
    return [...filteredRecords].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'zoneCode':
          valA = a.zoneCode;
          valB = b.zoneCode;
          break;
        case 'chain':
          valA = a.chain;
          valB = b.chain;
          break;
        case 'storeName':
          valA = a.storeName;
          valB = b.storeName;
          break;
        case 'storeAddress':
          valA = a.storeAddress;
          valB = b.storeAddress;
          break;
        case 'employeeName':
          valA = a.employeeName;
          valB = b.employeeName;
          break;
        case 'recordedAt':
          valA = a.recordedAt;
          valB = b.recordedAt;
          break;
        case 'totalQuantity':
          valA = a.totalQuantity;
          valB = b.totalQuantity;
          break;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRecords, sortField, sortDirection]);

  // Pagination calculation
  const totalEntries = sortedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);
  const currentRecords = sortedRecords.slice(startIndex, endIndex);

  // CSV Export helper
  const handleExportCsv = () => {
    const headers = [
      'No.',
      'Zone',
      'Channel',
      'Chain',
      'Province',
      'Store Code',
      'Store Name',
      'Store Address',
      'Supervisor',
      'Employee Code',
      'Employee Name',
      'Phone Number',
      'Position',
      'Recorded At',
      'Shift',
      'Total Quantity',
    ];

    const rows = sortedRecords.map((r, i) => [
      i + 1,
      `"${r.zoneCode}"`,
      `"${r.channel}"`,
      `"${r.chain}"`,
      `"${r.province}"`,
      `"${r.storeCode}"`,
      `"${r.storeName.replace(/"/g, '""')}"`,
      `"${r.storeAddress.replace(/"/g, '""')}"`,
      `"${r.supervisorName.replace(/"/g, '""')}"`,
      `"${r.employeeCode}"`,
      `"${r.employeeName.replace(/"/g, '""')}"`,
      `"${r.phoneNumber}"`,
      `"${r.position}"`,
      `"${r.recordedAt}"`,
      `"${r.shiftCode}"`,
      r.totalQuantity,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `SellOut_PA_Report_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} style={{ opacity: 0.6, marginLeft: '4px' }} />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} style={{ marginLeft: '4px' }} />
    ) : (
      <ArrowDown size={12} style={{ marginLeft: '4px' }} />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 3.1. Collapsible Search & Action Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm, 4px)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Header Bar */}
        <div
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#ffffff',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
            <Search size={16} />
            <span>Search</span>
          </div>
          <div>
            {isSearchExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </div>
        </div>

        {/* Filter Inputs & Action Toolbar */}
        {isSearchExpanded && (
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 4-Column Responsive Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '14px',
              }}
            >
              {/* 1. Date Range */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Date Range
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      fontSize: '12.5px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>-</span>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      fontSize: '12.5px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>

              {/* 2. Channel */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Channel
                </label>
                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">All Channels</option>
                  {channelOptions.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Chain */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Chain
                </label>
                <select
                  value={filterChain}
                  onChange={(e) => setFilterChain(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">All Chains</option>
                  {chainOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Zone */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Zone
                </label>
                <select
                  value={filterZone}
                  onChange={(e) => setFilterZone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">All Zones</option>
                  {zoneOptions.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Province/City */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Province/City
                </label>
                <select
                  value={filterProvince}
                  onChange={(e) => setFilterProvince(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">All Provinces</option>
                  {provinceOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. Supervisor */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Supervisor
                </label>
                <select
                  value={filterSupervisor}
                  onChange={(e) => setFilterSupervisor(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">All Supervisors</option>
                  {supervisorOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* 7. Position */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Position
                </label>
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">All Positions</option>
                  {positionOptions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>

              {/* 8. Employee */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Employee
                </label>
                <select
                  value={filterEmployee}
                  onChange={(e) => setFilterEmployee(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="">All Employees</option>
                  {employeeOptions.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeCode} - {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 9. Store Code */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
                  Store Code
                </label>
                <input
                  type="text"
                  placeholder="Enter store code"
                  value={filterStoreCode}
                  onChange={(e) => setFilterStoreCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px',
                    fontSize: '12.5px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Action Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleApplySearch}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 18px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Search size={14} />
                  <span>Search</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    backgroundColor: 'var(--color-primary-hover)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 500,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Download size={14} />
                  <span>Export File</span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 18px',
                    backgroundColor: 'var(--color-primary)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Plus size={15} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3.2. Master Data Table Section */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm, 4px)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        {/* Top Pagination Controls */}
        <div
          style={{
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{totalEntries === 0 ? 0 : startIndex + 1}</strong> to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{endIndex}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalEntries}</strong> entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>entries</span>
            </div>

            {/* Pagination buttons */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '3px',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                {'<<'}
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '3px',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                {'<'}
              </button>
              <span
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-primary-soft-bg, rgba(29, 78, 216, 0.08))',
                  color: 'var(--color-primary)',
                  borderRadius: '3px',
                  border: '1px solid var(--color-primary)',
                }}
              >
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '3px',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                {'>'}
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '3px',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                {'>>'}
              </button>
            </div>
          </div>
        </div>

        {/* Master Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12.5px',
              textAlign: 'left',
            }}
          >
            {/* Header with Sort and Column Titles */}
            <thead>
              <tr
                style={{
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                <th style={{ padding: '9px 10px', width: '38px', textAlign: 'center' }}></th>
                <th style={{ padding: '9px 10px', width: '40px', textAlign: 'center' }}>No.</th>
                <th
                  onClick={() => handleSort('zoneCode')}
                  style={{ padding: '9px 10px', width: '85px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Zone</span>
                    {renderSortIcon('zoneCode')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('chain')}
                  style={{ padding: '9px 10px', width: '105px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Chain</span>
                    {renderSortIcon('chain')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('storeName')}
                  style={{ padding: '9px 10px', minWidth: '180px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Store Name</span>
                    {renderSortIcon('storeName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('storeAddress')}
                  style={{ padding: '9px 10px', minWidth: '220px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Address</span>
                    {renderSortIcon('storeAddress')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('employeeName')}
                  style={{ padding: '9px 10px', minWidth: '170px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Employee Name</span>
                    {renderSortIcon('employeeName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('recordedAt')}
                  style={{ padding: '9px 10px', minWidth: '130px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>Date</span>
                    {renderSortIcon('recordedAt')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('totalQuantity')}
                  style={{
                    padding: '9px 10px',
                    width: '80px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Total</span>
                    {renderSortIcon('totalQuantity')}
                  </div>
                </th>
                <th style={{ padding: '9px 10px', width: '60px', textAlign: 'center' }}>#</th>
              </tr>

              {/* Inline Quick-Filter Row */}
              <tr style={{ backgroundColor: 'var(--bg-main, #f8fafc)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '4px 6px' }}></th>
                <th style={{ padding: '4px 6px' }}></th>
                <th style={{ padding: '4px 6px' }}>
                  <input
                    type="text"
                    placeholder="Zone..."
                    value={inlineZone}
                    onChange={(e) => setInlineZone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '3px 5px',
                      fontSize: '11.5px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '3px',
                      boxSizing: 'border-box',
                    }}
                  />
                </th>
                <th style={{ padding: '4px 6px' }}>
                  <input
                    type="text"
                    placeholder="Chain..."
                    value={inlineChain}
                    onChange={(e) => setInlineChain(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '3px 5px',
                      fontSize: '11.5px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '3px',
                      boxSizing: 'border-box',
                    }}
                  />
                </th>
                <th style={{ padding: '4px 6px' }}>
                  <input
                    type="text"
                    placeholder="Store..."
                    value={inlineStore}
                    onChange={(e) => setInlineStore(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '3px 5px',
                      fontSize: '11.5px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '3px',
                      boxSizing: 'border-box',
                    }}
                  />
                </th>
                <th style={{ padding: '4px 6px' }}>
                  <input
                    type="text"
                    placeholder="Address..."
                    value={inlineAddress}
                    onChange={(e) => setInlineAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '3px 5px',
                      fontSize: '11.5px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '3px',
                      boxSizing: 'border-box',
                    }}
                  />
                </th>
                <th style={{ padding: '4px 6px' }}>
                  <input
                    type="text"
                    placeholder="Employee..."
                    value={inlineEmployee}
                    onChange={(e) => setInlineEmployee(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '3px 5px',
                      fontSize: '11.5px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '3px',
                      boxSizing: 'border-box',
                    }}
                  />
                </th>
                <th style={{ padding: '4px 6px' }}>
                  <input
                    type="text"
                    placeholder="Date..."
                    value={inlineDate}
                    onChange={(e) => setInlineDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '3px 5px',
                      fontSize: '11.5px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '3px',
                      boxSizing: 'border-box',
                    }}
                  />
                </th>
                <th style={{ padding: '4px 6px' }}>
                  <input
                    type="text"
                    placeholder="Qty..."
                    value={inlineTotal}
                    onChange={(e) => setInlineTotal(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '3px 5px',
                      fontSize: '11.5px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '3px',
                      textAlign: 'center',
                      boxSizing: 'border-box',
                    }}
                  />
                </th>
                <th style={{ padding: '4px 6px' }}></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    style={{
                      padding: '40px 16px',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                    }}
                  >
                    No sell-out records found
                  </td>
                </tr>
              ) : (
                currentRecords.map((r, index) => {
                  const isExpanded = expandedRowIds.has(r.id);
                  return (
                    <React.Fragment key={r.id}>
                      <tr
                        style={{
                          borderBottom: isExpanded ? 'none' : '1px solid var(--border-color)',
                          backgroundColor: isExpanded
                            ? 'var(--color-primary-soft-bg, rgba(29, 78, 216, 0.03))'
                            : 'transparent',
                        }}
                      >
                        {/* 1. Expand Toggle */}
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => toggleRowExpanded(r.id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--color-primary)',
                            }}
                            title={isExpanded ? 'Collapse breakdown' : 'Expand breakdown'}
                          >
                            {isExpanded ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                          </button>
                        </td>

                        {/* 2. No. */}
                        <td style={{ padding: '10px 8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                          {startIndex + index + 1}
                        </td>

                        {/* 3. Zone */}
                        <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {r.zoneCode}
                        </td>

                        {/* 4. Chain */}
                        <td style={{ padding: '10px 8px', color: 'var(--text-primary)' }}>
                          {r.chain}
                        </td>

                        {/* 5. Store Name (2-line: bold storeCode over storeName) */}
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {r.storeCode}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {r.storeName}
                          </div>
                        </td>

                        {/* 6. Address */}
                        <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {r.storeAddress}
                        </td>

                        {/* 7. Employee Name (2-line: bold phone over name (position)) */}
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {r.phoneNumber}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {r.employeeName} ({r.position})
                          </div>
                        </td>

                        {/* 8. Date (2-line: recordedAt over bold shiftCode) */}
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                            {r.recordedAt}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '11.5px', color: 'var(--color-primary)' }}>
                            {r.shiftCode}
                          </div>
                        </td>

                        {/* 9. Total Quantity */}
                        <td
                          style={{
                            padding: '10px 8px',
                            textAlign: 'center',
                            fontWeight: 700,
                            fontSize: '13px',
                            color: 'var(--text-primary)',
                          }}
                        >
                          {r.totalQuantity}
                        </td>

                        {/* 10. Actions (#) */}
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(r)}
                            title="Delete sell-out record"
                            style={{
                              border: '1px solid #fecaca',
                              backgroundColor: '#fff5f5',
                              color: '#dc2626',
                              borderRadius: '4px',
                              padding: '5px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Line-Item Sub-Table */}
                      {isExpanded && (
                        <tr
                          style={{
                            backgroundColor: 'var(--color-primary-soft-bg, rgba(29, 78, 216, 0.02))',
                            borderBottom: '1px solid var(--border-color)',
                          }}
                        >
                          <td colSpan={10} style={{ padding: '10px 18px 16px 48px' }}>
                            <div
                              style={{
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                backgroundColor: 'var(--bg-surface)',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                              }}
                            >
                              <div
                                style={{
                                  padding: '7px 12px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  backgroundColor: 'var(--bg-main, #f1f5f9)',
                                  color: 'var(--text-primary)',
                                  borderBottom: '1px solid var(--border-color)',
                                }}
                              >
                                Line Item Breakdown ({r.items.length} SKUs)
                              </div>
                              <table
                                style={{
                                  width: '100%',
                                  borderCollapse: 'collapse',
                                  fontSize: '12px',
                                  textAlign: 'left',
                                }}
                              >
                                <thead>
                                  <tr
                                    style={{
                                      backgroundColor: 'var(--bg-main, #f8fafc)',
                                      color: 'var(--text-secondary)',
                                      borderBottom: '1px solid var(--border-color)',
                                    }}
                                  >
                                    <th style={{ padding: '6px 10px', width: '35px', textAlign: 'center' }}>No.</th>
                                    <th style={{ padding: '6px 10px', width: '110px' }}>Category</th>
                                    <th style={{ padding: '6px 10px', width: '160px' }}>Product Group</th>
                                    <th style={{ padding: '6px 10px', width: '100px' }}>Product Code</th>
                                    <th style={{ padding: '6px 10px' }}>Product Name</th>
                                    <th style={{ padding: '6px 10px', width: '80px', textAlign: 'center' }}>Quantity</th>
                                    <th style={{ padding: '6px 10px', width: '80px', textAlign: 'center' }}>OSA</th>
                                    <th style={{ padding: '6px 10px', minWidth: '150px' }}>Note</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {r.items.map((item, itemIdx) => (
                                    <tr
                                      key={item.id}
                                      style={{
                                        borderBottom:
                                          itemIdx === r.items.length - 1
                                            ? 'none'
                                            : '1px solid var(--border-color)',
                                      }}
                                    >
                                      <td style={{ padding: '7px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        {itemIdx + 1}
                                      </td>
                                      <td style={{ padding: '7px 10px', color: 'var(--text-primary)' }}>
                                        {item.category}
                                      </td>
                                      <td style={{ padding: '7px 10px', color: 'var(--text-primary)' }}>
                                        {item.productGroup}
                                      </td>
                                      <td style={{ padding: '7px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {item.productCode}
                                      </td>
                                      <td style={{ padding: '7px 10px', color: 'var(--text-primary)' }}>
                                        {item.productName}
                                      </td>
                                      <td
                                        style={{
                                          padding: '7px 10px',
                                          textAlign: 'center',
                                          fontWeight: 600,
                                          color: 'var(--color-primary)',
                                        }}
                                      >
                                        {item.quantity}
                                      </td>
                                      <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                                        {item.osa ? (
                                          <span
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '3px',
                                              padding: '2px 6px',
                                              borderRadius: '3px',
                                              fontSize: '11px',
                                              fontWeight: 600,
                                              backgroundColor: '#ecfdf5',
                                              color: '#059669',
                                              border: '1px solid #a7f3d0',
                                            }}
                                          >
                                            <CheckCircle2 size={12} />
                                            Yes
                                          </span>
                                        ) : (
                                          <span
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '3px',
                                              padding: '2px 6px',
                                              borderRadius: '3px',
                                              fontSize: '11px',
                                              fontWeight: 600,
                                              backgroundColor: '#fef2f2',
                                              color: '#dc2626',
                                              border: '1px solid #fecaca',
                                            }}
                                          >
                                            <XCircle size={12} />
                                            No
                                          </span>
                                        )}
                                      </td>
                                      <td style={{ padding: '7px 10px', color: 'var(--text-secondary)', fontSize: '11.5px' }}>
                                        {item.note || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Sell-Out Modal */}
      <CreateSellOutModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleAddRecord}
      />
    </div>
  );
};

export default SellOutPaReportPage;
