import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Download,
  Plus,
  ArrowUpDown,
  Pencil,
  X,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
} from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { StoreRecord } from '@/types/store';
import {
  INITIAL_STORE_RECORDS,
  MOCK_CHANNELS,
  MOCK_ACCOUNTS,
  MOCK_PROVINCE_HIERARCHY,
  MOCK_NEW_PROVINCES,
} from '@/mocks/storeMockData';
import { StoreFormModal } from '@/components/store/StoreFormModal';
import {
  generateStoreTemplateXlsx,
  parseStoreImportXlsx,
  exportStoresCsv,
} from '@/utils/excel';

type SortDirection = 'asc' | 'desc';
type StoreSortField =
  | 'area'
  | 'channelName'
  | 'accountCode'
  | 'storeCode'
  | 'storeName'
  | 'address'
  | 'closedDate'
  | 'newProvince'
  | 'newTown';

export const StorePage: React.FC = () => {
  const { t } = useI18n();

  // Primary dataset
  const [stores, setStores] = useState<StoreRecord[]>(INITIAL_STORE_RECORDS);

  // Search card collapsed
  const [isSearchCollapsed, setIsSearchCollapsed] = useState<boolean>(false);

  // Search filter inputs
  const [filterChannel, setFilterChannel] = useState<string>('');
  const [filterChain, setFilterChain] = useState<string>('');
  const [filterArea, setFilterArea] = useState<string>('');
  const [filterProvince, setFilterProvince] = useState<string>('');
  const [filterStoreCode, setFilterStoreCode] = useState<string>('');
  const [filterStoreName, setFilterStoreName] = useState<string>('');
  const [filterNewProvince, setFilterNewProvince] = useState<string>('');
  const [filterNewTown, setFilterNewTown] = useState<string>('');

  // Status checkbox: "InActive"
  // Unchecked by default (displays Active stores); when InActive is checked, filters specifically for Inactive stores
  const [filterInactiveOnly, setFilterInactiveOnly] = useState<boolean>(false);

  // Applied Filter States
  const [appliedFilters, setAppliedFilters] = useState({
    channel: '',
    chain: '',
    area: '',
    province: '',
    storeCode: '',
    storeName: '',
    newProvince: '',
    newTown: '',
    inactiveOnly: false,
  });

  // Inline Quick-Filters for table columns
  const [inlineRegion, setInlineRegion] = useState<string>('');
  const [inlineChannel, setInlineChannel] = useState<string>('');
  const [inlineChain, setInlineChain] = useState<string>('');
  const [inlineStoreCode, setInlineStoreCode] = useState<string>('');
  const [inlineStoreName, setInlineStoreName] = useState<string>('');
  const [inlineAddress, setInlineAddress] = useState<string>('');
  const [inlineClosedDate, setInlineClosedDate] = useState<string>('');
  const [inlineNewProvince, setInlineNewProvince] = useState<string>('');
  const [inlineNewTown, setInlineNewTown] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<StoreSortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination (defaults to 20)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [selectedStore, setSelectedStore] = useState<StoreRecord | null>(null);

  // Import file ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Cascading options for search card
  const areaOptions = useMemo(() => {
    return Array.from(new Set(MOCK_PROVINCE_HIERARCHY.map((p) => p.area)));
  }, []);

  const provinceOptions = useMemo(() => {
    if (!filterArea) {
      return Array.from(new Set(MOCK_PROVINCE_HIERARCHY.map((p) => p.province)));
    }
    return MOCK_PROVINCE_HIERARCHY.filter((p) => p.area === filterArea).map((p) => p.province);
  }, [filterArea]);

  const newProvinceOptions = useMemo(() => {
    return MOCK_NEW_PROVINCES.map((np) => np.province);
  }, []);

  const newTownOptions = useMemo(() => {
    if (!filterNewProvince) return [];
    const found = MOCK_NEW_PROVINCES.find((np) => np.province === filterNewProvince);
    return found ? found.wards : [];
  }, [filterNewProvince]);

  // Search Action
  const handleSearch = () => {
    setAppliedFilters({
      channel: filterChannel,
      chain: filterChain,
      area: filterArea,
      province: filterProvince,
      storeCode: filterStoreCode,
      storeName: filterStoreName,
      newProvince: filterNewProvince,
      newTown: filterNewTown,
      inactiveOnly: filterInactiveOnly,
    });
    setCurrentPage(1);
  };

  // Clear Action
  const handleClear = () => {
    setFilterChannel('');
    setFilterChain('');
    setFilterArea('');
    setFilterProvince('');
    setFilterStoreCode('');
    setFilterStoreName('');
    setFilterNewProvince('');
    setFilterNewTown('');
    setFilterInactiveOnly(false);
    setAppliedFilters({
      channel: '',
      chain: '',
      area: '',
      province: '',
      storeCode: '',
      storeName: '',
      newProvince: '',
      newTown: '',
      inactiveOnly: false,
    });
    setInlineRegion('');
    setInlineChannel('');
    setInlineChain('');
    setInlineStoreCode('');
    setInlineStoreName('');
    setInlineAddress('');
    setInlineClosedDate('');
    setInlineNewProvince('');
    setInlineNewTown('');
    setCurrentPage(1);
  };

  // Sort Action
  const handleSort = (field: StoreSortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Modal Triggers
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedStore(null);
    setIsModalOpen(true);
  };

  const handleOpenUpdate = (store: StoreRecord) => {
    setModalMode('update');
    setSelectedStore(store);
    setIsModalOpen(true);
  };

  const handleSaveStore = (saved: StoreRecord) => {
    if (modalMode === 'create') {
      setStores((prev) => [saved, ...prev]);
    } else {
      setStores((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
    }
  };

  // Import File Handler
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await parseStoreImportXlsx(file);
      if (imported.length > 0) {
        setStores((prev) => {
          const existingCodes = new Set(prev.map((s) => s.storeCode.toLowerCase()));
          const nonDupes = imported.filter((n) => !existingCodes.has(n.storeCode.toLowerCase()));
          return [...nonDupes, ...prev];
        });
        alert(`Successfully imported ${imported.length} stores!`);
      }
    } catch (err: any) {
      alert(err.message || 'Error parsing StoreList.xlsx file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filtered dataset
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      // Status behavior:
      // When inactiveOnly is true -> status === 'Inactive'
      // When inactiveOnly is false -> status === 'Active' (or all, but spec Section 3.1 states "Unchecked by default: displays status === 'Active' stores")
      if (appliedFilters.inactiveOnly) {
        if (s.status !== 'Inactive') return false;
      } else {
        if (s.status !== 'Active') return false;
      }

      // Search Card Criteria
      if (appliedFilters.channel && s.channelCode !== appliedFilters.channel) return false;
      if (appliedFilters.chain && s.accountCode !== appliedFilters.chain) return false;
      if (appliedFilters.area && s.area !== appliedFilters.area) return false;
      if (appliedFilters.province && s.province !== appliedFilters.province) return false;
      if (appliedFilters.storeCode && !s.storeCode.toLowerCase().includes(appliedFilters.storeCode.toLowerCase())) return false;
      if (appliedFilters.storeName && !s.storeName.toLowerCase().includes(appliedFilters.storeName.toLowerCase())) return false;
      if (appliedFilters.newProvince && s.newProvince !== appliedFilters.newProvince) return false;
      if (appliedFilters.newTown && s.newTown !== appliedFilters.newTown) return false;

      // Inline Quick-Filters
      if (inlineRegion && !s.area.toLowerCase().includes(inlineRegion.toLowerCase())) return false;
      if (inlineChannel && !(s.channelName || '').toLowerCase().includes(inlineChannel.toLowerCase())) return false;
      if (inlineChain && !(`${s.accountCode} ${s.accountName}`).toLowerCase().includes(inlineChain.toLowerCase())) return false;
      if (inlineStoreCode && !s.storeCode.toLowerCase().includes(inlineStoreCode.toLowerCase())) return false;
      if (inlineStoreName && !s.storeName.toLowerCase().includes(inlineStoreName.toLowerCase())) return false;
      if (inlineAddress && !s.address.toLowerCase().includes(inlineAddress.toLowerCase())) return false;
      if (inlineClosedDate && !(s.closedDate || '').includes(inlineClosedDate)) return false;
      if (inlineNewProvince && !(s.newProvince || '').toLowerCase().includes(inlineNewProvince.toLowerCase())) return false;
      if (inlineNewTown && !(s.newTown || '').toLowerCase().includes(inlineNewTown.toLowerCase())) return false;

      return true;
    });
  }, [
    stores,
    appliedFilters,
    inlineRegion,
    inlineChannel,
    inlineChain,
    inlineStoreCode,
    inlineStoreName,
    inlineAddress,
    inlineClosedDate,
    inlineNewProvince,
    inlineNewTown,
  ]);

  // Sorted dataset
  const sortedStores = useMemo(() => {
    if (!sortField) return filteredStores;
    return [...filteredStores].sort((a, b) => {
      const valA = String(a[sortField] || '').toLowerCase();
      const valB = String(b[sortField] || '').toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredStores, sortField, sortDirection]);

  // Paginated dataset
  const totalEntries = sortedStores.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalEntries, currentPage * pageSize);

  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedStores.slice(start, start + pageSize);
  }, [sortedStores, currentPage, pageSize]);

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
        {/* Header Bar */}
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

        {/* Card Body */}
        {!isSearchCollapsed && (
          <div style={{ padding: '16px' }}>
            {/* 4-Column Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {/* 1. Channel */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('store.channel', 'Channel')}
                </label>
                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">Select one</option>
                  {MOCK_CHANNELS.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              {/* 2. Chain */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('store.chain', 'Chain')}
                </label>
                <select
                  value={filterChain}
                  onChange={(e) => setFilterChain(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">Select chain</option>
                  {MOCK_ACCOUNTS.map((a) => (
                    <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>

              {/* 3. Region / Area */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('store.region', 'Region / Area')}
                </label>
                <select
                  value={filterArea}
                  onChange={(e) => {
                    setFilterArea(e.target.value);
                    setFilterProvince('');
                  }}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">Select region</option>
                  {areaOptions.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              {/* 4. Province/City */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('store.province', 'Province/City')}
                </label>
                <select
                  value={filterProvince}
                  onChange={(e) => setFilterProvince(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">Select province/city</option>
                  {provinceOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* 5. Store Code */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('store.store_code', 'Store Code')}
                </label>
                <input
                  type="text"
                  placeholder="Store code"
                  value={filterStoreCode}
                  onChange={(e) => setFilterStoreCode(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                />
              </div>

              {/* 6. Store Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('store.store_name', 'Store Name')}
                </label>
                <input
                  type="text"
                  placeholder="Store name"
                  value={filterStoreName}
                  onChange={(e) => setFilterStoreName(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                />
              </div>

              {/* 7. Province/City (New) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('store.new_province', 'Province/City (New)')}
                </label>
                <select
                  value={filterNewProvince}
                  onChange={(e) => {
                    setFilterNewProvince(e.target.value);
                    setFilterNewTown('');
                  }}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">Select province/city</option>
                  {newProvinceOptions.map((np) => (
                    <option key={np} value={np}>{np}</option>
                  ))}
                </select>
              </div>

              {/* 8. Ward/Commune (New) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('store.new_ward', 'Ward/Commune (New)')}
                </label>
                <select
                  value={filterNewTown}
                  onChange={(e) => setFilterNewTown(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">Select ward/commune</option>
                  {newTownOptions.map((ntw) => (
                    <option key={ntw} value={ntw}>{ntw}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Checkbox Row: Label "Status :" above checkbox "InActive" */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                Status :
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={filterInactiveOnly}
                  onChange={(e) => setFilterInactiveOnly(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                />
                <span>InActive</span>
              </label>
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
              {/* Left Group: Search, Export Report, Template File */}
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
                  onClick={() => exportStoresCsv(sortedStores)}
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
                <button
                  type="button"
                  onClick={generateStoreTemplateXlsx}
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
              </div>

              {/* Right Group: Import File, Clear */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportFile}
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
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
                  <Plus size={16} /> {t('shift.import_file', 'Import File')}
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear filters"
                  style={{
                    height: '32px',
                    width: '32px',
                    backgroundColor: 'var(--bg-canvas)',
                    color: 'var(--color-primary)',
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

      {/* 3.2 Store Data Table & Pagination Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Top Pagination Toolbar */}
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

        {/* Data Table with 2 Header Rows */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
            <thead>
              {/* Row 1: Headers */}
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ width: '45px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>
                  {t('table.no', 'No.')}
                </th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700 }}>
                  Overview
                </th>
                <th
                  onClick={() => handleSort('area')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'area' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('store.region', 'Region')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('channelName')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'channelName' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('store.channel', 'Channel')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('accountCode')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'accountCode' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('store.chain', 'Chain')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('storeCode')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'storeCode' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('store.store_code', 'Store Code')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('storeName')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'storeName' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('store.store_name', 'Store Name')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('address')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'address' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('store.address', 'Address')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('closedDate')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'closedDate' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('store.closed_date', 'Closed Date')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('newProvince')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'newProvince' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('store.new_province', 'Province/City (New)')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('newTown')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'newTown' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('store.new_ward', 'Ward/Commune (New)')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                {/* Rightmost action header contains Create button per SPEC-15 */}
                <th style={{ width: '80px', padding: '6px 4px' }}>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    style={{
                      padding: '4px 10px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: 700,
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    Create
                  </button>
                </th>
              </tr>

              {/* Row 2: Inline Quick-Filters */}
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '4px' }}></th>
                <th style={{ padding: '4px' }}></th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineRegion}
                    onChange={(e) => {
                      setInlineRegion(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineChannel}
                    onChange={(e) => {
                      setInlineChannel(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineChain}
                    onChange={(e) => {
                      setInlineChain(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineStoreCode}
                    onChange={(e) => {
                      setInlineStoreCode(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineStoreName}
                    onChange={(e) => {
                      setInlineStoreName(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineAddress}
                    onChange={(e) => {
                      setInlineAddress(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineClosedDate}
                    onChange={(e) => {
                      setInlineClosedDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="YYYY-MM-DD"
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineNewProvince}
                    onChange={(e) => {
                      setInlineNewProvince(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineNewTown}
                    onChange={(e) => {
                      setInlineNewTown(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedStores.length === 0 ? (
                <tr>
                  <td colSpan={12} style={{ padding: '32px 16px', color: 'var(--text-secondary)' }}>
                    No stores found.
                  </td>
                </tr>
              ) : (
                paginatedStores.map((row, index) => {
                  const seqNo = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-canvas)',
                      }}
                    >
                      {/* 1. No. */}
                      <td style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>{seqNo}</td>

                      {/* 2. Overview */}
                      <td style={{ padding: '8px 6px', color: 'var(--text-secondary)' }}>{row.overview || '-'}</td>

                      {/* 3. Region */}
                      <td style={{ padding: '8px 6px', fontWeight: 600 }}>{row.area}</td>

                      {/* 4. Channel */}
                      <td style={{ padding: '8px 6px' }}>{row.channelName || '-'}</td>

                      {/* 5. Chain (2-line cell: bold accountCode over accountName) */}
                      <td style={{ padding: '8px 6px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{row.accountCode}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{row.accountName}</span>
                        </div>
                      </td>

                      {/* 6. Store Code */}
                      <td style={{ padding: '8px 6px', fontWeight: 700 }}>{row.storeCode}</td>

                      {/* 7. Store Name */}
                      <td style={{ padding: '8px 6px', textAlign: 'left', fontWeight: 600 }}>{row.storeName}</td>

                      {/* 8. Address */}
                      <td style={{ padding: '8px 6px', textAlign: 'left' }}>{row.address}</td>

                      {/* 9. Closed Date */}
                      <td style={{ padding: '8px 6px', color: row.closedDate ? '#DC2626' : 'var(--text-secondary)' }}>
                        {row.closedDate || '-'}
                      </td>

                      {/* 10. Province/City (New) */}
                      <td style={{ padding: '8px 6px' }}>{row.newProvince || '-'}</td>

                      {/* 11. Ward/Commune (New) */}
                      <td style={{ padding: '8px 6px' }}>{row.newTown || '-'}</td>

                      {/* 12. Actions: Outline square icon button with Pencil */}
                      <td style={{ padding: '8px 4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenUpdate(row)}
                          title="Edit Store"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: 'var(--radius-sm)',
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

      {/* Store Form Modal */}
      <StoreFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        store={selectedStore}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStore}
      />
    </div>
  );
};
