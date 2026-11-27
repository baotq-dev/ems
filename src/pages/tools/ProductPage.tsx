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
import { ProductRecord } from '@/types/product';
import { INITIAL_PRODUCT_RECORDS } from '@/mocks/productMockData';
import { ProductFormModal } from '@/components/product/ProductFormModal';
import {
  generateProductTemplateXlsx,
  parseProductImportXlsx,
  exportProductsCsv,
} from '@/utils/excel';

type SortDirection = 'asc' | 'desc';

export const ProductPage: React.FC = () => {
  const { t } = useI18n();

  // Primary dataset
  const [products, setProducts] = useState<ProductRecord[]>(INITIAL_PRODUCT_RECORDS);

  // Search card collapsed
  const [isSearchCollapsed, setIsSearchCollapsed] = useState<boolean>(false);

  // Filter Card Inputs
  const [filterDivision, setFilterDivision] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterProductGroup, setFilterProductGroup] = useState<string>('');
  const [filterProductCode, setFilterProductCode] = useState<string>('');
  const [filterProductName, setFilterProductName] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('Active');
  const [filterFromDate, setFilterFromDate] = useState<string>('');
  const [filterToDate, setFilterToDate] = useState<string>('');

  // Applied Filter Card States
  const [appliedFilters, setAppliedFilters] = useState({
    division: '',
    brand: '',
    productGroup: '',
    productCode: '',
    productName: '',
    status: 'Active',
    fromDate: '',
    toDate: '',
  });

  // Inline Quick-Filters for every data column
  const [inlineDivision, setInlineDivision] = useState<string>('');
  const [inlineBrand, setInlineBrand] = useState<string>('');
  const [inlineProductCode, setInlineProductCode] = useState<string>('');
  const [inlineProductName, setInlineProductName] = useState<string>('');
  const [inlineUnit, setInlineUnit] = useState<string>('');
  const [inlineBarcode, setInlineBarcode] = useState<string>('');
  const [inlineStatus, setInlineStatus] = useState<string>('');
  const [inlineInactiveFrom, setInlineInactiveFrom] = useState<string>('');
  const [inlineInactiveTo, setInlineInactiveTo] = useState<string>('');

  // Sorting on Inactive From and Inactive To
  const [sortField, setSortField] = useState<'inactiveFrom' | 'inactiveTo' | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination (defaults to 20 per spec)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [selectedProduct, setSelectedProduct] = useState<ProductRecord | null>(null);

  // File import ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Unique options for search card dropdowns
  const divisionOptions = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.division))).sort();
  }, [products]);

  const brandOptions = useMemo(() => {
    const list = filterDivision
      ? products.filter((p) => p.division === filterDivision)
      : products;
    return Array.from(new Set(list.map((p) => p.brand))).sort();
  }, [products, filterDivision]);

  const productGroupOptions = useMemo(() => {
    return Array.from(
      new Set(products.map((p) => p.productGroup).filter(Boolean))
    ).sort() as string[];
  }, [products]);

  // Search Action
  const handleSearch = () => {
    setAppliedFilters({
      division: filterDivision,
      brand: filterBrand,
      productGroup: filterProductGroup,
      productCode: filterProductCode,
      productName: filterProductName,
      status: filterStatus,
      fromDate: filterFromDate,
      toDate: filterToDate,
    });
    setCurrentPage(1);
  };

  // Clear Action
  const handleClear = () => {
    setFilterDivision('');
    setFilterBrand('');
    setFilterProductGroup('');
    setFilterProductCode('');
    setFilterProductName('');
    setFilterStatus('');
    setFilterFromDate('');
    setFilterToDate('');
    setAppliedFilters({
      division: '',
      brand: '',
      productGroup: '',
      productCode: '',
      productName: '',
      status: '',
      fromDate: '',
      toDate: '',
    });
    setInlineDivision('');
    setInlineBrand('');
    setInlineProductCode('');
    setInlineProductName('');
    setInlineUnit('');
    setInlineBarcode('');
    setInlineStatus('');
    setInlineInactiveFrom('');
    setInlineInactiveTo('');
    setCurrentPage(1);
  };

  // Sort Action
  const handleSort = (field: 'inactiveFrom' | 'inactiveTo') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Modal Actions
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenUpdate = (product: ProductRecord) => {
    setModalMode('update');
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (saved: ProductRecord) => {
    if (modalMode === 'create') {
      setProducts((prev) => [saved, ...prev]);
    } else {
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
    }
  };

  // Import File Handler
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await parseProductImportXlsx(file);
      if (imported.length > 0) {
        setProducts((prev) => {
          const existingCodes = new Set(prev.map((p) => p.productCode.toLowerCase()));
          const newOnes = imported.filter((n) => !existingCodes.has(n.productCode.toLowerCase()));
          return [...newOnes, ...prev];
        });
        alert(`Successfully imported ${imported.length} products!`);
      }
    } catch (err: any) {
      alert(err.message || 'Error importing Excel file.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filtered dataset
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search card criteria
      if (appliedFilters.division && p.division !== appliedFilters.division) return false;
      if (appliedFilters.brand && p.brand !== appliedFilters.brand) return false;
      if (appliedFilters.productGroup && p.productGroup !== appliedFilters.productGroup) return false;
      if (appliedFilters.productCode && !p.productCode.toLowerCase().includes(appliedFilters.productCode.toLowerCase())) return false;
      if (appliedFilters.productName && !p.productName.toLowerCase().includes(appliedFilters.productName.toLowerCase())) return false;
      if (appliedFilters.status && p.status !== appliedFilters.status) return false;
      if (appliedFilters.fromDate && p.createdAt < appliedFilters.fromDate) return false;
      if (appliedFilters.toDate && p.createdAt > appliedFilters.toDate) return false;

      // Inline table quick-filters
      if (inlineDivision && !p.division.toLowerCase().includes(inlineDivision.toLowerCase())) return false;
      if (inlineBrand && !p.brand.toLowerCase().includes(inlineBrand.toLowerCase())) return false;
      if (inlineProductCode && !p.productCode.toLowerCase().includes(inlineProductCode.toLowerCase())) return false;
      if (inlineProductName && !p.productName.toLowerCase().includes(inlineProductName.toLowerCase())) return false;
      if (inlineUnit && !p.unit.toLowerCase().includes(inlineUnit.toLowerCase())) return false;
      if (inlineBarcode && !(p.barcode || '').toLowerCase().includes(inlineBarcode.toLowerCase())) return false;
      if (inlineStatus && p.status.toLowerCase() !== inlineStatus.toLowerCase()) return false;
      if (inlineInactiveFrom && !(p.inactiveFrom || '').includes(inlineInactiveFrom)) return false;
      if (inlineInactiveTo && !(p.inactiveTo || '').includes(inlineInactiveTo)) return false;

      return true;
    });
  }, [
    products,
    appliedFilters,
    inlineDivision,
    inlineBrand,
    inlineProductCode,
    inlineProductName,
    inlineUnit,
    inlineBarcode,
    inlineStatus,
    inlineInactiveFrom,
    inlineInactiveTo,
  ]);

  // Sorted dataset
  const sortedProducts = useMemo(() => {
    if (!sortField) return filteredProducts;
    return [...filteredProducts].sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProducts, sortField, sortDirection]);

  // Paginated dataset
  const totalEntries = sortedProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalEntries, currentPage * pageSize);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

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
              {/* 1. Division */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('category.division', 'Division')}
                </label>
                <select
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">Select division</option>
                  {divisionOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* 2. Brand */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('category.brand', 'Brand')}
                </label>
                <select
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">Select brand</option>
                  {brandOptions.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* 3. Product Group */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('product.product_group', 'Product Group')}
                </label>
                <select
                  value={filterProductGroup}
                  onChange={(e) => setFilterProductGroup(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">Select product group</option>
                  {productGroupOptions.map((pg) => (
                    <option key={pg} value={pg}>{pg}</option>
                  ))}
                </select>
              </div>

              {/* 4. Product Code */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('product.product_code', 'Product Code')}
                </label>
                <input
                  type="text"
                  placeholder="Product code"
                  value={filterProductCode}
                  onChange={(e) => setFilterProductCode(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                />
              </div>

              {/* 5. Product Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('product.product_name', 'Product Name')}
                </label>
                <input
                  type="text"
                  placeholder="Product name"
                  value={filterProductName}
                  onChange={(e) => setFilterProductName(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                />
              </div>

              {/* 6. Status */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('field.status', 'Status')}
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* 7. Date Range */}
              <div className="sm:col-span-2">
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  {t('field.date_range', 'Date Range (From Date - To Date)')}
                </label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={filterFromDate}
                    onChange={(e) => setFilterFromDate(e.target.value)}
                    style={{ flex: 1, height: '32px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                  <span>-</span>
                  <input
                    type="date"
                    value={filterToDate}
                    onChange={(e) => setFilterToDate(e.target.value)}
                    style={{ flex: 1, height: '32px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>
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
              {/* Left Group */}
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
                  onClick={generateProductTemplateXlsx}
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
                  onClick={() => exportProductsCsv(sortedProducts)}
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

              {/* Right Group */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleOpenCreate}
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
                  <Plus size={16} /> {t('action.add', 'Create')}
                </button>

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

      {/* 3.2 Product Data Table & Pagination */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        {/* Top Pagination Controls */}
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

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
            <thead>
              {/* Row 1: Headers */}
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ width: '45px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('table.no', 'No.')}</th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('category.division', 'Division')}</th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('category.brand', 'Brand')}</th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('product.product_code', 'Product Code')}</th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700, textAlign: 'left' }}>{t('product.product_name', 'Product Name')}</th>
                <th style={{ width: '65px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('product.unit', 'Unit')}</th>
                <th style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('product.barcode', 'Product Barcode')}</th>
                <th style={{ width: '75px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('field.status', 'Status')}</th>
                {/* Sortable Inactive From */}
                <th
                  onClick={() => handleSort('inactiveFrom')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'inactiveFrom' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('product.inactive_from', 'Inactive From')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                {/* Sortable Inactive To */}
                <th
                  onClick={() => handleSort('inactiveTo')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'inactiveTo' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('product.inactive_to', 'Inactive To')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th style={{ width: '65px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>{t('action.actions', 'Actions')}</th>
              </tr>

              {/* Row 2: Inline Quick-Filters */}
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '4px' }}></th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineDivision}
                    onChange={(e) => {
                      setInlineDivision(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineBrand}
                    onChange={(e) => {
                      setInlineBrand(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineProductCode}
                    onChange={(e) => {
                      setInlineProductCode(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineProductName}
                    onChange={(e) => {
                      setInlineProductName(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineUnit}
                    onChange={(e) => {
                      setInlineUnit(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineBarcode}
                    onChange={(e) => {
                      setInlineBarcode(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineStatus}
                    onChange={(e) => {
                      setInlineStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Active..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineInactiveFrom}
                    onChange={(e) => {
                      setInlineInactiveFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="YYYY-MM-DD"
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineInactiveTo}
                    onChange={(e) => {
                      setInlineInactiveTo(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="YYYY-MM-DD"
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>
                <th style={{ padding: '4px' }}></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '32px 16px', color: 'var(--text-secondary)' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((row, index) => {
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
                      <td style={{ padding: '8px 6px', fontWeight: 600 }}>{row.division}</td>
                      <td style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 600 }}>{row.brand}</td>
                      <td style={{ padding: '8px 6px', fontWeight: 600 }}>{row.productCode}</td>
                      <td style={{ padding: '8px 6px', textAlign: 'left' }}>{row.productName}</td>
                      <td style={{ padding: '8px 4px' }}>{row.unit}</td>
                      <td style={{ padding: '8px 6px', color: 'var(--text-secondary)' }}>{row.barcode || '-'}</td>
                      <td style={{ padding: '8px 4px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: row.status === 'Active' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            color: row.status === 'Active' ? 'var(--color-success-accent)' : '#6B7280',
                            border: `1px solid ${row.status === 'Active' ? 'var(--color-success-accent)' : '#9CA3AF'}`,
                          }}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px 6px' }}>{row.inactiveFrom || '-'}</td>
                      <td style={{ padding: '8px 6px' }}>{row.inactiveTo || '-'}</td>
                      <td style={{ padding: '8px 4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenUpdate(row)}
                          title="Edit Product"
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

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        product={selectedProduct}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />
    </div>
  );
};
