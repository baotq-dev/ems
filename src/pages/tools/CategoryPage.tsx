import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Download,
  Plus,
  ArrowUpDown,
  Pencil,
  CheckCircle2,
  XCircle,
  ChevronsLeft,
  ChevronLeft,
  ChevronsRight,
} from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { ProductCategoryRecord, CategoryStatus } from '@/types/category';
import { INITIAL_CATEGORY_RECORDS } from '@/mocks/categoryMockData';
import { CategoryFormModal } from '@/components/category/CategoryFormModal';
import { exportCategoriesCsv } from '@/utils/excel';

type SortField = keyof ProductCategoryRecord;
type SortDirection = 'asc' | 'desc';

export const CategoryPage: React.FC = () => {
  const { t } = useI18n();

  // Primary categories dataset
  const [categories, setCategories] = useState<ProductCategoryRecord[]>(INITIAL_CATEGORY_RECORDS);

  // Search card collapsed state
  const [isSearchCollapsed, setIsSearchCollapsed] = useState<boolean>(false);

  // Status Tab Switcher ('Active' | 'Inactive')
  const [activeTab, setActiveTab] = useState<CategoryStatus>('Active');

  // Applied status tab (updated when clicking Search or switching tab)
  const [appliedStatus, setAppliedStatus] = useState<CategoryStatus>('Active');

  // Inline Quick-Filters for columns
  const [inlineDivision, setInlineDivision] = useState<string>('');
  const [inlineBrand, setInlineBrand] = useState<string>('');
  const [inlineBrandVn, setInlineBrandVn] = useState<string>('');
  const [inlineCategory, setInlineCategory] = useState<string>('');
  const [inlineCategoryVn, setInlineCategoryVn] = useState<string>('');
  const [inlineSubCategory, setInlineSubCategory] = useState<string>('');
  const [inlineSubCategoryVn, setInlineSubCategoryVn] = useState<string>('');
  const [inlineVariant, setInlineVariant] = useState<string>('');
  const [inlineOrder, setInlineOrder] = useState<string>('');
  const [inlineStatus, setInlineStatus] = useState<string>('');

  // Sorting
  const [sortField, setSortField] = useState<SortField | null>('sortOrder');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination (defaults to 50)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(50);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'insert' | 'update'>('insert');
  const [selectedRecord, setSelectedRecord] = useState<ProductCategoryRecord | null>(null);

  // Tab change handler
  const handleTabChange = (status: CategoryStatus) => {
    setActiveTab(status);
    setAppliedStatus(status);
    setCurrentPage(1);
  };

  // Search Action
  const handleSearch = () => {
    setAppliedStatus(activeTab);
    setCurrentPage(1);
  };

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Add New Modal Trigger
  const handleOpenInsert = () => {
    setModalMode('insert');
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  // Edit Modal Trigger
  const handleOpenUpdate = (record: ProductCategoryRecord) => {
    setModalMode('update');
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  // Save Record (Create or Update)
  const handleSaveRecord = (record: ProductCategoryRecord) => {
    if (modalMode === 'insert') {
      setCategories((prev) => [record, ...prev]);
    } else {
      setCategories((prev) =>
        prev.map((item) => (item.id === record.id ? record : item))
      );
    }
  };

  // Next available sortOrder for insert mode
  const nextSortOrder = useMemo(() => {
    if (categories.length === 0) return 1;
    return Math.max(...categories.map((c) => c.sortOrder || 0)) + 1;
  }, [categories]);

  // Filtered dataset
  const filteredCategories = useMemo(() => {
    return categories.filter((item) => {
      // 1. Status Tab filter
      if (item.status !== appliedStatus) {
        return false;
      }

      // 2. Inline Column Filters
      if (inlineDivision && !item.division.toLowerCase().includes(inlineDivision.toLowerCase())) {
        return false;
      }
      if (inlineBrand && !item.brand.toLowerCase().includes(inlineBrand.toLowerCase())) {
        return false;
      }
      if (inlineBrandVn && !item.brandVn.toLowerCase().includes(inlineBrandVn.toLowerCase())) {
        return false;
      }
      if (inlineCategory && !item.category.toLowerCase().includes(inlineCategory.toLowerCase())) {
        return false;
      }
      if (inlineCategoryVn && !item.categoryVn.toLowerCase().includes(inlineCategoryVn.toLowerCase())) {
        return false;
      }
      if (inlineSubCategory && !(item.subCategory || '').toLowerCase().includes(inlineSubCategory.toLowerCase())) {
        return false;
      }
      if (inlineSubCategoryVn && !(item.subCategoryVn || '').toLowerCase().includes(inlineSubCategoryVn.toLowerCase())) {
        return false;
      }
      if (inlineVariant && !(item.variant || '').toLowerCase().includes(inlineVariant.toLowerCase())) {
        return false;
      }
      if (inlineOrder && !String(item.sortOrder).includes(inlineOrder)) {
        return false;
      }
      if (inlineStatus) {
        const isMatch = inlineStatus.toLowerCase() === item.status.toLowerCase();
        if (!isMatch) return false;
      }

      return true;
    });
  }, [
    categories,
    appliedStatus,
    inlineDivision,
    inlineBrand,
    inlineBrandVn,
    inlineCategory,
    inlineCategoryVn,
    inlineSubCategory,
    inlineSubCategoryVn,
    inlineVariant,
    inlineOrder,
    inlineStatus,
  ]);

  // Sorted dataset
  const sortedCategories = useMemo(() => {
    if (!sortField) return filteredCategories;
    return [...filteredCategories].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCategories, sortField, sortDirection]);

  // Paginated dataset
  const totalEntries = sortedCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const startIndex = totalEntries === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(totalEntries, currentPage * pageSize);

  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedCategories.slice(start, start + pageSize);
  }, [sortedCategories, currentPage, pageSize]);

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
            {/* Row 1: Status Tab Switcher (Segmented two-button toggle: Active | Inactive) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => handleTabChange('Active')}
                style={{
                  padding: '6px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  border: activeTab === 'Active' ? 'none' : '1px solid var(--border-color)',
                  backgroundColor: activeTab === 'Active' ? 'var(--color-primary)' : 'var(--bg-surface)',
                  color: activeTab === 'Active' ? '#FFFFFF' : 'var(--text-primary)',
                  boxShadow: activeTab === 'Active' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {t('user.status_active', 'Active')}
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('Inactive')}
                style={{
                  padding: '6px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  border: activeTab === 'Inactive' ? 'none' : '1px solid var(--border-color)',
                  backgroundColor: activeTab === 'Inactive' ? 'var(--color-primary)' : 'var(--bg-surface)',
                  color: activeTab === 'Inactive' ? '#FFFFFF' : 'var(--text-primary)',
                  boxShadow: activeTab === 'Inactive' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {t('user.status_inactive', 'Inactive')}
              </button>
            </div>

            {/* Row 2: Action Toolbar */}
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
                  onClick={() => exportCategoriesCsv(sortedCategories)}
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

              {/* Right Group: Add New */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleOpenInsert}
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
                  <Plus size={16} /> {t('category.add_new', 'Add New')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3.2 Pagination & Category Data Table Card */}
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
              {/* Row 1: Column Headers with Sort Controls */}
              <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                {/* 1. Division */}
                <th
                  onClick={() => handleSort('division')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'division' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('category.division', 'Division')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* 2. Brand */}
                <th
                  onClick={() => handleSort('brand')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'brand' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('category.brand', 'Brand')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* 3. Brand (VN) */}
                <th
                  onClick={() => handleSort('brandVn')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'brandVn' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('category.brand_vn', 'Brand (VN)')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* 4. Category */}
                <th
                  onClick={() => handleSort('category')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'category' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('category.category', 'Category')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* 5. Category (VN) */}
                <th
                  onClick={() => handleSort('categoryVn')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'categoryVn' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('category.category_vn', 'Category (VN)')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* 6. Sub Category */}
                <th
                  onClick={() => handleSort('subCategory')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'subCategory' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('category.sub_category', 'Sub Category')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* 7. Sub Category (VN) */}
                <th
                  onClick={() => handleSort('subCategoryVn')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'subCategoryVn' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('category.sub_category_vn', 'Sub Category (VN)')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* 8. Variant */}
                <th
                  onClick={() => handleSort('variant')}
                  style={{
                    padding: '8px 6px',
                    cursor: 'pointer',
                    color: sortField === 'variant' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('category.variant', 'Variant')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* 9. Order */}
                <th
                  onClick={() => handleSort('sortOrder')}
                  style={{
                    width: '65px',
                    padding: '8px 4px',
                    cursor: 'pointer',
                    color: sortField === 'sortOrder' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('category.sort_order', 'Order')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* 10. Status */}
                <th
                  onClick={() => handleSort('status')}
                  style={{
                    width: '75px',
                    padding: '8px 4px',
                    cursor: 'pointer',
                    color: sortField === 'status' ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                  }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{t('field.status', 'Status')}</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                {/* 11. Actions */}
                <th style={{ width: '65px', padding: '8px 4px', color: 'var(--color-primary)', fontWeight: 700 }}>
                  {t('action.actions', 'Actions')}
                </th>
              </tr>

              {/* Row 2: Inline Quick-Filter Row */}
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)' }}>
                {/* 1. Division filter */}
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

                {/* 2. Brand filter */}
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

                {/* 3. Brand (VN) filter */}
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineBrandVn}
                    onChange={(e) => {
                      setInlineBrandVn(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>

                {/* 4. Category filter */}
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineCategory}
                    onChange={(e) => {
                      setInlineCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>

                {/* 5. Category (VN) filter */}
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineCategoryVn}
                    onChange={(e) => {
                      setInlineCategoryVn(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>

                {/* 6. Sub Category filter */}
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineSubCategory}
                    onChange={(e) => {
                      setInlineSubCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>

                {/* 7. Sub Category (VN) filter */}
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineSubCategoryVn}
                    onChange={(e) => {
                      setInlineSubCategoryVn(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>

                {/* 8. Variant filter */}
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineVariant}
                    onChange={(e) => {
                      setInlineVariant(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search..."
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>

                {/* 9. Order filter */}
                <th style={{ padding: '4px' }}>
                  <input
                    type="text"
                    value={inlineOrder}
                    onChange={(e) => {
                      setInlineOrder(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Val"
                    style={{ width: '100%', height: '26px', fontSize: '11px', padding: '0 4px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                  />
                </th>

                {/* 10. Status filter */}
                <th style={{ padding: '4px' }}>
                  <select
                    value={inlineStatus}
                    onChange={(e) => {
                      setInlineStatus(e.target.value);
                      setCurrentPage(1);
                    }}
                    style={{ width: '100%', height: '26px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    <option value="">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </th>

                {/* 11. Actions */}
                <th style={{ padding: '4px' }}></th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedCategories.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: '32px 16px', color: 'var(--text-secondary)' }}>
                    No product category records found.
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((row, index) => {
                  return (
                    <tr
                      key={row.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: index % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-canvas)',
                      }}
                    >
                      {/* 1. Division */}
                      <td style={{ padding: '8px 6px', fontWeight: 600 }}>{row.division}</td>

                      {/* 2. Brand */}
                      <td style={{ padding: '8px 6px', color: 'var(--color-primary)', fontWeight: 600 }}>{row.brand}</td>

                      {/* 3. Brand (VN) */}
                      <td style={{ padding: '8px 6px' }}>{row.brandVn}</td>

                      {/* 4. Category */}
                      <td style={{ padding: '8px 6px', fontWeight: 600 }}>{row.category}</td>

                      {/* 5. Category (VN) */}
                      <td style={{ padding: '8px 6px' }}>{row.categoryVn}</td>

                      {/* 6. Sub Category */}
                      <td style={{ padding: '8px 6px' }}>{row.subCategory || '-'}</td>

                      {/* 7. Sub Category (VN) */}
                      <td style={{ padding: '8px 6px' }}>{row.subCategoryVn || '-'}</td>

                      {/* 8. Variant */}
                      <td style={{ padding: '8px 6px', color: 'var(--text-secondary)' }}>{row.variant || '-'}</td>

                      {/* 9. Order */}
                      <td style={{ padding: '8px 4px', fontWeight: 600 }}>{row.sortOrder}</td>

                      {/* 10. Status Indicator */}
                      <td style={{ padding: '8px 4px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {row.status === 'Active' ? (
                            <span title="Active" style={{ color: 'var(--color-success-accent)', display: 'flex', alignItems: 'center' }}>
                              <CheckCircle2 size={16} />
                            </span>
                          ) : (
                            <span title="Inactive" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', opacity: 0.6 }}>
                              <XCircle size={16} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 11. Actions: Outline circular icon button with Pencil */}
                      <td style={{ padding: '8px 4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenUpdate(row)}
                          title="Edit Category"
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

      {/* Insert & Update Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        mode={modalMode}
        categoryRecord={selectedRecord}
        nextSortOrder={nextSortOrder}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRecord}
      />
    </div>
  );
};
