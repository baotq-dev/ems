import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Save } from 'lucide-react';
import { ProductCategoryRecord, CategoryStatus } from '@/types/category';
import {
  MOCK_DIVISIONS,
  MOCK_BRANDS,
  MOCK_SUB_CATEGORIES,
} from '@/mocks/categoryMockData';
import { useI18n } from '@/context/I18nContext';

interface CategoryFormModalProps {
  isOpen: boolean;
  mode: 'insert' | 'update';
  categoryRecord: ProductCategoryRecord | null;
  nextSortOrder: number;
  onClose: () => void;
  onSave: (record: ProductCategoryRecord) => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  mode,
  categoryRecord,
  nextSortOrder,
  onClose,
  onSave,
}) => {
  const { t } = useI18n();

  // Full-screen / expand width state
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Form Fields
  const [division, setDivision] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [brandVn, setBrandVn] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [categoryVn, setCategoryVn] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [subCategoryVn, setSubCategoryVn] = useState<string>('');
  const [variant, setVariant] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<number>(nextSortOrder);
  const [status, setStatus] = useState<CategoryStatus>('Active');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (mode === 'update' && categoryRecord) {
        setDivision(categoryRecord.division || '');
        setBrand(categoryRecord.brand || '');
        setBrandVn(categoryRecord.brandVn || '');
        setCategory(categoryRecord.category || '');
        setCategoryVn(categoryRecord.categoryVn || '');
        setSubCategory(categoryRecord.subCategory || '');
        setSubCategoryVn(categoryRecord.subCategoryVn || '');
        setVariant(categoryRecord.variant || '');
        setSortOrder(categoryRecord.sortOrder ?? nextSortOrder);
        setStatus(categoryRecord.status || 'Active');
      } else {
        // Insert mode initialization
        setDivision('');
        setBrand('');
        setBrandVn('');
        setCategory('');
        setCategoryVn('');
        setSubCategory('');
        setSubCategoryVn('');
        setVariant('');
        setSortOrder(nextSortOrder);
        setStatus('Active');
      }
    }
  }, [isOpen, mode, categoryRecord, nextSortOrder]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!division.trim() || !brand.trim() || !category.trim()) {
      setErrorMsg(t('category.error_required', 'Division, Brand, and Category are required.'));
      return;
    }

    const savedRecord: ProductCategoryRecord = {
      id: mode === 'update' && categoryRecord ? categoryRecord.id : `cat-${Date.now()}`,
      division: division.trim(),
      brand: brand.trim(),
      brandVn: brandVn.trim(),
      category: category.trim(),
      categoryVn: categoryVn.trim(),
      subCategory: subCategory.trim() || undefined,
      subCategoryVn: subCategoryVn.trim() || undefined,
      variant: variant.trim() || undefined,
      sortOrder: Number(sortOrder) || 1,
      status,
    };

    onSave(savedRecord);
    onClose();
  };

  const titleText = mode === 'insert'
    ? (t('category.insert_title', 'INSERT'))
    : (t('category.update_title', 'UPDATE'));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: isExpanded ? '98vw' : '1050px',
          height: isExpanded ? '96vh' : 'auto',
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '0.5px' }}>
              {titleText}
            </h2>
            {mode === 'update' && categoryRecord && (
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                }}
              >
                {categoryRecord.category}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Minimize' : 'Maximize'}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body with Two Grouped Form Sections */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {errorMsg && (
              <div
                style={{
                  backgroundColor: 'var(--color-primary-soft-bg)',
                  color: 'var(--color-primary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  border: '1px solid var(--color-primary)',
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* GROUP 1: Category */}
            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  borderBottom: '2px solid var(--color-primary)',
                  paddingBottom: '4px',
                  marginBottom: '14px',
                }}
              >
                {t('category.category', 'Category')}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Row 1 (3-Column Grid): Division, Brand, Brand (VN) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Division (Editable combobox) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {t('category.division', 'Division')} *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        list="division-options"
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        placeholder="..."
                        style={{
                          width: '100%',
                          height: '32px',
                          padding: '0 8px',
                          fontSize: '13px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                        }}
                      />
                      <datalist id="division-options">
                        {MOCK_DIVISIONS.map((d) => (
                          <option key={d} value={d} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Brand (Editable combobox) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {t('category.brand', 'Brand')} *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        list="brand-options"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        placeholder="..."
                        style={{
                          width: '100%',
                          height: '32px',
                          padding: '0 8px',
                          fontSize: '13px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                        }}
                      />
                      <datalist id="brand-options">
                        {MOCK_BRANDS.map((b) => (
                          <option key={b} value={b} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Brand (VN) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {t('category.brand_vn', 'Brand (VN)')}
                    </label>
                    <input
                      type="text"
                      value={brandVn}
                      onChange={(e) => setBrandVn(e.target.value)}
                      placeholder="..."
                      style={{
                        width: '100%',
                        height: '32px',
                        padding: '0 8px',
                        fontSize: '13px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    />
                  </div>
                </div>

                {/* Row 2 (2-Column Grid spanning cols 1 & 2): Category, Category (VN) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {t('category.category', 'Category')} *
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="..."
                      style={{
                        width: '100%',
                        height: '32px',
                        padding: '0 8px',
                        fontSize: '13px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {t('category.category_vn', 'Category (VN)')}
                    </label>
                    <input
                      type="text"
                      value={categoryVn}
                      onChange={(e) => setCategoryVn(e.target.value)}
                      placeholder="..."
                      style={{
                        width: '100%',
                        height: '32px',
                        padding: '0 8px',
                        fontSize: '13px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GROUP 2: Other */}
            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  borderBottom: '2px solid var(--color-primary)',
                  paddingBottom: '4px',
                  marginBottom: '14px',
                }}
              >
                {t('category.other', 'Other')}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Row 1 (3-Column Grid): Sub Category, Sub Category (VN), Variant */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Sub Category (Editable combobox) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {t('category.sub_category', 'Sub Category')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        list="subcategory-options"
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        placeholder="..."
                        style={{
                          width: '100%',
                          height: '32px',
                          padding: '0 8px',
                          fontSize: '13px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                        }}
                      />
                      <datalist id="subcategory-options">
                        {MOCK_SUB_CATEGORIES.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Sub Category (VN) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {t('category.sub_category_vn', 'Sub Category (VN)')}
                    </label>
                    <input
                      type="text"
                      value={subCategoryVn}
                      onChange={(e) => setSubCategoryVn(e.target.value)}
                      placeholder="..."
                      style={{
                        width: '100%',
                        height: '32px',
                        padding: '0 8px',
                        fontSize: '13px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    />
                  </div>

                  {/* Variant */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {t('category.variant', 'Variant')}
                    </label>
                    <input
                      type="text"
                      value={variant}
                      onChange={(e) => setVariant(e.target.value)}
                      placeholder="..."
                      style={{
                        width: '100%',
                        height: '32px',
                        padding: '0 8px',
                        fontSize: '13px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    />
                  </div>
                </div>

                {/* Row 2 (2 Inputs aligned left): Order, Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Order */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {t('category.sort_order', 'Order')}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      placeholder="..."
                      style={{
                        width: '100%',
                        height: '32px',
                        padding: '0 8px',
                        fontSize: '13px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {t('field.status', 'Status')}
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as CategoryStatus)}
                      style={{
                        width: '100%',
                        height: '32px',
                        padding: '0 8px',
                        fontSize: '13px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    >
                      <option value="Active">{t('user.status_active', 'Active')}</option>
                      <option value="Inactive">{t('user.status_inactive', 'Inactive')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              backgroundColor: 'var(--bg-canvas)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <X size={16} color="#DC2626" />
              <span>{t('action.close', 'Close')}</span>
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 24px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: 'var(--color-success-accent)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Save size={16} />
              <span>{t('action.save', 'Save')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
