import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { MOCK_ATTENDANT_LOGS } from '@/mocks/attendantMockData';
import { MOCK_USERS } from '@/mocks/users';
import { useI18n } from '@/context/I18nContext';

export const AttendantSummaryPage: React.FC = () => {
  const { t } = useI18n();
  // Filters
  const [fromDate, setFromDate] = useState('2026-11-10');
  const [toDate, setToDate] = useState('2026-11-20');
  const [zone, setZone] = useState('');
  const [chain, setChain] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [store, setStore] = useState('');
  const [groupBy, setGroupBy] = useState<'By Employee' | 'By Store' | 'By Supervisor'>('By Employee');

  // Chart 4 Tab Switcher (PA | SUP)
  const [chart4RoleTab, setChart4RoleTab] = useState<'PA' | 'SUP'>('PA');

  const supervisors = useMemo(() => {
    return MOCK_USERS.filter((u) => u.currentPosition === 'Supervisor' || u.currentPosition === 'Admin');
  }, []);

  // Filter logs based on filter bar
  const filteredLogs = useMemo(() => {
    return MOCK_ATTENDANT_LOGS.filter((l) => {
      if (fromDate && l.workDate < fromDate) return false;
      if (toDate && l.workDate > toDate) return false;
      if (zone && l.zone !== zone) return false;
      if (chain && l.chain !== chain) return false;
      if (supervisorId && l.supervisorId !== supervisorId) return false;
      if (store && l.storeCode !== store && l.storeName !== store) return false;
      return true;
    });
  }, [fromDate, toDate, zone, chain, supervisorId, store]);

  // Daily statistics for dates
  const dailyDates = useMemo(() => {
    const dates = Array.from(new Set(MOCK_ATTENDANT_LOGS.map((l) => l.workDate))).sort();
    return dates.filter((d) => (!fromDate || d >= fromDate) && (!toDate || d <= toDate));
  }, [fromDate, toDate]);

  // Chart 1: Daily PA Statistics
  const dailyPAData = useMemo(() => {
    return dailyDates.map((dateStr) => {
      const paLogs = filteredLogs.filter((l) => l.workDate === dateStr && l.position.includes('PG'));
      const checkedIn = paLogs.filter((l) => l.checkInTime).length;
      const scheduled = Math.max(checkedIn, paLogs.length > 0 ? paLogs.length + 1 : 2);
      const rate = scheduled > 0 ? Math.round((checkedIn / scheduled) * 100) : 0;
      const [, m, d] = dateStr.split('-');
      return {
        label: `${d}/${m}`,
        fullDate: dateStr,
        scheduled,
        checkedIn,
        rate,
      };
    });
  }, [dailyDates, filteredLogs]);

  // Chart 2: Daily Supervisor Statistics
  const dailySupData = useMemo(() => {
    return dailyDates.map((dateStr) => {
      const supLogs = filteredLogs.filter((l) => l.workDate === dateStr && l.position === 'Supervisor');
      const checkedIn = supLogs.filter((l) => l.checkInTime).length;
      const scheduled = Math.max(checkedIn, supLogs.length > 0 ? supLogs.length : 2);
      const rate = scheduled > 0 ? Math.round((checkedIn / scheduled) * 100) : 0;
      const [, m, d] = dateStr.split('-');
      return {
        label: `${d}/${m}`,
        fullDate: dateStr,
        scheduled,
        checkedIn,
        rate,
      };
    });
  }, [dailyDates, filteredLogs]);

  // Verification Breakdown
  const verificationCounts = useMemo(() => {
    let matched = 0;
    let mismatched = 0;
    let scanFailed = 0;
    filteredLogs.forEach((l) => {
      if (l.verificationStatus === 'Matched') matched++;
      else if (l.verificationStatus === 'Mismatched') mismatched++;
      else if (l.verificationStatus === 'ScanFailed') scanFailed++;
    });
    const total = Math.max(1, filteredLogs.length);
    return {
      matched,
      mismatched,
      scanFailed,
      total: filteredLogs.length,
      matchedPct: Math.round((matched / total) * 100),
      mismatchedPct: Math.round((mismatched / total) * 100),
      scanFailedPct: Math.round((scanFailed / total) * 100),
    };
  }, [filteredLogs]);

  // Donut Rates
  const donutOverallRate = useMemo(() => {
    const total = filteredLogs.length || 1;
    const verified = filteredLogs.filter((l) => l.verificationStatus === 'Matched').length;
    return Math.round((verified / total) * 100);
  }, [filteredLogs]);

  const donutPARate = useMemo(() => {
    const pa = filteredLogs.filter((l) => l.position.includes('PG'));
    const total = pa.length || 1;
    const verified = pa.filter((l) => l.verificationStatus === 'Matched').length;
    return Math.round((verified / total) * 100);
  }, [filteredLogs]);

  const donutSupRate = useMemo(() => {
    const sups = filteredLogs.filter((l) => l.position === 'Supervisor');
    const total = sups.length || 1;
    const verified = sups.filter((l) => l.verificationStatus === 'Matched').length;
    return Math.round((verified / total) * 100);
  }, [filteredLogs]);

  // Chart 4: By Supervisor Data
  const supervisorChartData = useMemo(() => {
    const targetSupIds = ['usr-002', 'usr-003', 'usr-008'];
    return targetSupIds.map((sId) => {
      const supObj = supervisors.find((s) => s.id === sId);
      const sName = supObj ? supObj.fullName : sId;
      const targetRoleLogs = filteredLogs.filter(
        (l) => l.supervisorId === sId && (chart4RoleTab === 'PA' ? l.position.includes('PG') : l.position === 'Supervisor')
      );
      const checkedIn = targetRoleLogs.filter((l) => l.checkInTime).length;
      const scheduled = Math.max(checkedIn, targetRoleLogs.length + (chart4RoleTab === 'PA' ? 2 : 0));
      const rate = scheduled > 0 ? Math.round((checkedIn / scheduled) * 100) : 0;
      return {
        supervisorName: sName,
        scheduled,
        checkedIn,
        rate,
      };
    });
  }, [supervisors, filteredLogs, chart4RoleTab]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 5.1 Filter Bar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Row 1 (4-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* Date Range */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>{t('field.date_range', 'Date Range')}</label>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ width: '100%', height: '30px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
              <span>-</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ width: '100%', height: '30px', padding: '0 4px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>

          {/* Zone */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>{t('field.zone', 'Zone')}</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="">{t('field.all_zones', 'Select zone')}</option>
              <option value="A">Zone A</option>
              <option value="B">Zone B</option>
              <option value="C">Zone C</option>
            </select>
          </div>

          {/* Chain */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>{t('field.chain', 'Chain')}</label>
            <select
              value={chain}
              onChange={(e) => setChain(e.target.value)}
              style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="">{t('field.all_chains', 'Select chain')}</option>
              <option value="Emart">Emart</option>
              <option value="Co.opmart">Co.opmart</option>
              <option value="WinMart">WinMart</option>
              <option value="Lotte Mart">Lotte Mart</option>
            </select>
          </div>

          {/* Supervisor */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>{t('field.supervisor', 'Supervisor')}</label>
            <select
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="">{t('field.select_supervisor', 'Select supervisor')}</option>
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2 (3-Column Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Store */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>{t('field.store', 'Store')}</label>
            <select
              value={store}
              onChange={(e) => setStore(e.target.value)}
              style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="">{t('field.select_store', 'Select store')}</option>
              <option value="EMART PHAN VAN TRI">EMART PHAN VAN TRI</option>
              <option value="CO.OPMART NGUYEN DINH CHIEU">CO.OPMART NGUYEN DINH CHIEU</option>
              <option value="WINMART LE THANH TON">WINMART LE THANH TON</option>
              <option value="LOTTE MART DA NANG">LOTTE MART DA NANG</option>
            </select>
          </div>

          {/* Group By */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '4px' }}>{t('field.group_by', 'Group By')}</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              style={{ width: '100%', height: '30px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
            >
              <option value="By Employee">{t('field.by_employee', 'By Employee')}</option>
              <option value="By Store">{t('field.by_store', 'By Store')}</option>
              <option value="By Supervisor">{t('field.by_supervisor', 'By Supervisor')}</option>
            </select>
          </div>

          {/* Search Button */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              type="button"
              style={{
                height: '30px',
                padding: '0 18px',
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
          </div>
        </div>
      </div>

      {/* 5.2 Chart 1: Daily PA Attendance Statistics */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {t('attendant.daily_pa_stats', 'Daily PA Attendance Statistics')}
          </h3>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#0284C7' }} />
              <span>{t('attendant.scheduled_users', 'Scheduled Users')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#2E7D32' }} />
              <span>{t('attendant.checked_in_users', 'Checked-in Users')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '2px', backgroundColor: 'var(--color-primary)' }} />
              <span>{t('attendant.attendance_rate', 'Attendance Rate (%)')}</span>
            </div>
          </div>
        </div>

        {/* SVG Combo Chart */}
        <div style={{ overflowX: 'auto' }}>
          <svg viewBox="0 0 800 220" style={{ width: '100%', minWidth: '600px', height: '220px' }}>
            {/* Grid Lines */}
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="50" y1={y + 10} x2="780" y2={y + 10} stroke="#E5E7EB" strokeDasharray="3 3" />
            ))}

            {/* Bars and Line Points */}
            {dailyPAData.map((item, idx) => {
              const xBase = 80 + idx * 110;
              const barWidth = 18;
              const maxVal = 5;
              const schedHeight = (item.scheduled / maxVal) * 160;
              const checkedHeight = (item.checkedIn / maxVal) * 160;
              const schedY = 190 - schedHeight;
              const checkedY = 190 - checkedHeight;
              const lineY = 190 - (item.rate / 100) * 160;

              return (
                <g key={item.label}>
                  {/* Scheduled Bar (Blue) */}
                  <rect x={xBase} y={schedY} width={barWidth} height={schedHeight} fill="#0284C7" rx="2" />
                  {/* Checked-in Bar (Green) */}
                  <rect x={xBase + 22} y={checkedY} width={barWidth} height={checkedHeight} fill="#2E7D32" rx="2" />
                  {/* X Axis Label */}
                  <text x={xBase + 20} y="210" fontSize="11" textAnchor="middle" fill="#6B7280">
                    {item.label}
                  </text>
                  {/* Line Point */}
                  <circle cx={xBase + 20} cy={lineY} r="4" fill="var(--color-primary)" />
                  <text x={xBase + 20} y={lineY - 6} fontSize="10" fontWeight="bold" textAnchor="middle" fill="var(--color-primary)">
                    {item.rate}%
                  </text>
                </g>
              );
            })}

            {/* Connecting line for rate */}
            {dailyPAData.length > 1 && (
              <polyline
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                points={dailyPAData
                  .map((item, idx) => {
                    const xBase = 80 + idx * 110 + 20;
                    const lineY = 190 - (item.rate / 100) * 160;
                    return `${xBase},${lineY}`;
                  })
                  .join(' ')}
              />
            )}
          </svg>
        </div>
      </div>

      {/* 5.2 Chart 2: Daily Supervisor Attendance Statistics */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {t('attendant.daily_sup_stats', 'Daily Supervisor Attendance Statistics')}
          </h3>
          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#0284C7' }} />
              <span>{t('attendant.scheduled_users', 'Scheduled Users')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '10px', backgroundColor: '#2E7D32' }} />
              <span>{t('attendant.checked_in_users', 'Checked-in Users')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '10px', height: '2px', backgroundColor: 'var(--color-primary)' }} />
              <span>{t('attendant.attendance_rate', 'Attendance Rate (%)')}</span>
            </div>
          </div>
        </div>

        {/* SVG Combo Chart */}
        <div style={{ overflowX: 'auto' }}>
          <svg viewBox="0 0 800 220" style={{ width: '100%', minWidth: '600px', height: '220px' }}>
            {[0, 50, 100, 150, 200].map((y) => (
              <line key={y} x1="50" y1={y + 10} x2="780" y2={y + 10} stroke="#E5E7EB" strokeDasharray="3 3" />
            ))}

            {dailySupData.map((item, idx) => {
              const xBase = 80 + idx * 110;
              const barWidth = 18;
              const maxVal = 4;
              const schedHeight = (item.scheduled / maxVal) * 160;
              const checkedHeight = (item.checkedIn / maxVal) * 160;
              const schedY = 190 - schedHeight;
              const checkedY = 190 - checkedHeight;
              const lineY = 190 - (item.rate / 100) * 160;

              return (
                <g key={item.label}>
                  <rect x={xBase} y={schedY} width={barWidth} height={schedHeight} fill="#0284C7" rx="2" />
                  <rect x={xBase + 22} y={checkedY} width={barWidth} height={checkedHeight} fill="#2E7D32" rx="2" />
                  <text x={xBase + 20} y="210" fontSize="11" textAnchor="middle" fill="#6B7280">
                    {item.label}
                  </text>
                  <circle cx={xBase + 20} cy={lineY} r="4" fill="var(--color-primary)" />
                  <text x={xBase + 20} y={lineY - 6} fontSize="10" fontWeight="bold" textAnchor="middle" fill="var(--color-primary)">
                    {item.rate}%
                  </text>
                </g>
              );
            })}

            {dailySupData.length > 1 && (
              <polyline
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                points={dailySupData
                  .map((item, idx) => {
                    const xBase = 80 + idx * 110 + 20;
                    const lineY = 190 - (item.rate / 100) * 160;
                    return `${xBase},${lineY}`;
                  })
                  .join(' ')}
              />
            )}
          </svg>
        </div>
      </div>

      {/* Row 3: 3-Column Donut Chart Grid + Image Verification Status Strip */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Donut 1: Overall */}
          <div style={{ textAlign: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
              Overall Attendance & Verification Rate
            </div>
            <svg viewBox="0 0 100 100" style={{ width: '110px', height: '110px', margin: '0 auto' }}>
              <circle cx="50" cy="50" r="38" fill="none" stroke="#E5E7EB" strokeWidth="12" />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#2E7D32"
                strokeWidth="12"
                strokeDasharray={`${(donutOverallRate / 100) * 238} 238`}
                strokeDashoffset="60"
                strokeLinecap="round"
              />
              <text x="50" y="56" textAnchor="middle" fontSize="18" fontWeight="bold" fill="var(--text-primary)">
                {donutOverallRate}%
              </text>
            </svg>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Checked-in & Matched
            </div>
          </div>

          {/* Donut 2: PA */}
          <div style={{ textAlign: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
              PA Attendance & Verification Rate
            </div>
            <svg viewBox="0 0 100 100" style={{ width: '110px', height: '110px', margin: '0 auto' }}>
              <circle cx="50" cy="50" r="38" fill="none" stroke="#E5E7EB" strokeWidth="12" />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#0284C7"
                strokeWidth="12"
                strokeDasharray={`${(donutPARate / 100) * 238} 238`}
                strokeDashoffset="60"
                strokeLinecap="round"
              />
              <text x="50" y="56" textAnchor="middle" fontSize="18" fontWeight="bold" fill="var(--text-primary)">
                {donutPARate}%
              </text>
            </svg>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              PA/PG Group
            </div>
          </div>

          {/* Donut 3: Supervisor */}
          <div style={{ textAlign: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
              Supervisor Attendance & Verification Rate
            </div>
            <svg viewBox="0 0 100 100" style={{ width: '110px', height: '110px', margin: '0 auto' }}>
              <circle cx="50" cy="50" r="38" fill="none" stroke="#E5E7EB" strokeWidth="12" />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="12"
                strokeDasharray={`${(donutSupRate / 100) * 238} 238`}
                strokeDashoffset="60"
                strokeLinecap="round"
              />
              <text x="50" y="56" textAnchor="middle" fontSize="18" fontWeight="bold" fill="var(--text-primary)">
                {donutSupRate}%
              </text>
            </svg>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Supervisor Group
            </div>
          </div>
        </div>

        {/* Image Verification Status Summary Strip */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-canvas)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#2E7D32', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              {t('attendant.matched', 'Matched')}: <strong style={{ color: '#2E7D32' }}>{verificationCounts.matched}</strong> ({verificationCounts.matchedPct}%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: '#F59E0B', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              {t('attendant.mismatched', 'Mismatched')}: <strong style={{ color: '#F59E0B' }}>{verificationCounts.mismatched}</strong> ({verificationCounts.mismatchedPct}%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-primary)', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              {t('attendant.scan_failed', 'Scan Failed')}: <strong style={{ color: 'var(--color-primary)' }}>{verificationCounts.scanFailed}</strong> ({verificationCounts.scanFailedPct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Chart 4: Attendance Statistics by Supervisor */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {t('attendant.attendance_by_supervisor', 'Attendance Statistics by Supervisor')}
          </h3>

          {/* Role Tab Switcher: PA | SUP */}
          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setChart4RoleTab('PA')}
              style={{
                padding: '4px 14px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: chart4RoleTab === 'PA' ? 'var(--color-primary)' : 'var(--bg-surface)',
                color: chart4RoleTab === 'PA' ? '#FFFFFF' : 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              PA
            </button>
            <button
              type="button"
              onClick={() => setChart4RoleTab('SUP')}
              style={{
                padding: '4px 14px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: chart4RoleTab === 'SUP' ? 'var(--color-primary)' : 'var(--bg-surface)',
                color: chart4RoleTab === 'SUP' ? '#FFFFFF' : 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              SUP
            </button>
          </div>
        </div>

        {/* SVG Chart */}
        <div style={{ overflowX: 'auto' }}>
          <svg viewBox="0 0 700 200" style={{ width: '100%', minWidth: '550px', height: '200px' }}>
            {[0, 40, 80, 120, 160].map((y) => (
              <line key={y} x1="50" y1={y + 10} x2="680" y2={y + 10} stroke="#E5E7EB" strokeDasharray="3 3" />
            ))}

            {supervisorChartData.map((item, idx) => {
              const xBase = 100 + idx * 200;
              const barWidth = 24;
              const maxVal = 6;
              const schedH = (item.scheduled / maxVal) * 140;
              const checkH = (item.checkedIn / maxVal) * 140;

              return (
                <g key={item.supervisorName}>
                  <rect x={xBase} y={170 - schedH} width={barWidth} height={schedH} fill="#0284C7" rx="2" />
                  <rect x={xBase + 28} y={170 - checkH} width={barWidth} height={checkH} fill="#2E7D32" rx="2" />
                  <text x={xBase + 26} y="190" fontSize="11" textAnchor="middle" fill="#4B5563">
                    {item.supervisorName}
                  </text>
                  <circle cx={xBase + 26} cy={170 - (item.rate / 100) * 140} r="4" fill="var(--color-primary)" />
                  <text
                    x={xBase + 26}
                    y={170 - (item.rate / 100) * 140 - 6}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="var(--color-primary)"
                  >
                    {item.rate}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AttendantSummaryPage;
