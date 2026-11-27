import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, ArrowRight } from 'lucide-react';
import { ProductRecord, ProductInactivePeriod } from '@/types/product';
import { INITIAL_CATEGORY_RECORDS } from '@/mocks/categoryMockData';
import { useI18n } from '@/context/I18nContext';

interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'update';
  product: ProductRecord | null;
  onClose: () => void;
  onSave: (product: ProductRecord) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  mode,
  product,
  onClose,
  onSave,
}) => {
  const { t } = useI18n();

  // Selected Category ID for top dropdown
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('');

  // Product specification fields
  const [division, setDivision] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [productGroup, setProductGroup] = useState<string>('');
  const [productCode, setProductCode] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [barcode, setBarcode] = useState<string>('');
  const [barrelBarcode, setBarrelBarcode] = useState<string>('');
  const [barrelSize, setBarrelSize] = useState<number>(0);
  const [unit, setUnit] = useState<string>('Case');
  const [packageSize, setPackageSize] = useState<string>('330ml');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

  // Inactive periods
  const [inactivePeriods, setInactivePeriods] = useState<ProductInactivePeriod[]>([]);
  const [newFromDate, setNewFromDate] = useState<string>('');
  const [newToDate, setNewToDate] = useState<string>('');

  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setFormError('');
      setNewFromDate('');
      setNewToDate('');

      if (mode === 'update' && product) {
        setSelectedCategoryKey(String(product.categoryId || ''));
        setDivision(product.division || '');
        setBrand(product.brand || '');
        setProductGroup(product.productGroup || '');
        setProductCode(product.productCode || '');
        setProductName(product.productName || '');
        setBarcode(product.barcode || '');
        setBarrelBarcode(product.barrelBarcode || '');
        setBarrelSize(product.barrelSize ?? 0);
        setUnit(product.unit || 'Case');
        setPackageSize(product.packageSize || '330ml');
        setSortOrder(product.sortOrder ?? 0);
        setPrice(product.price ?? 0);
        setInactivePeriods(product.inactivePeriods ? [...product.inactivePeriods] : []);
      } else {
        // Create mode defaults
        const defaultCat = INITIAL_CATEGORY_RECORDS[0];
        setSelectedCategoryKey(defaultCat ? defaultCat.id : '');
        setDivision(defaultCat ? defaultCat.division : 'Sabeco');
        setBrand(defaultCat ? defaultCat.brand : 'Sai Gon Lager');
        setProductGroup(defaultCat ? defaultCat.category : '');
        setProductCode('');
        setProductName('');
        setBarcode('');
        setBarrelBarcode('');
        setBarrelSize(24);
        setUnit('Case');
        setPackageSize('330ml');
        setSortOrder(0);
        setPrice(0);
        setInactivePeriods([]);
      }
    }
  }, [isOpen, mode, product]);

  if (!isOpen) return null;

  // Handle Category Selector Change
  const handleCategoryChange = (catId: string) => {
    setSelectedCategoryKey(catId);
    const found = INITIAL_CATEGORY_RECORDS.find((c) => c.id === catId);
    if (found) {
      setDivision(found.division);
      setBrand(found.brand);
      setProductGroup(found.category);
    }
  };

  // Add Inactive Period
  const handleAddInactivePeriod = () => {
    if (!newFromDate) return;
    const newPeriod: ProductInactivePeriod = {
      id: `pip-${Date.now()}`,
      fromDate: newFromDate,
      toDate: newToDate || undefined,
    };
    setInactivePeriods((prev) => [...prev, newPeriod]);
    setNewFromDate('');
    setNewToDate('');
  };

  // Delete Inactive Period
  const handleDeleteInactivePeriod = (id: string) => {
    setInactivePeriods((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!division.trim() || !brand.trim() || !productCode.trim() || !productName.trim()) {
      setFormError(t('product.error_required', 'Division/Brand, Product Code, and Product Name are required.'));
      return;
    }

    // Sync latest inactive dates
    let latestInactiveFrom: string | undefined = undefined;
    let latestInactiveTo: string | undefined = undefined;
    if (inactivePeriods.length > 0) {
      const latest = inactivePeriods[inactivePeriods.length - 1];
      latestInactiveFrom = latest.fromDate;
      latestInactiveTo = latest.toDate;
    }

    const updatedProduct: ProductRecord = {
      id: mode === 'update' && product ? product.id : `prod-${Date.now()}`,
      categoryId: selectedCategoryKey || 'cat-001',
      division: division.trim(),
      brand: brand.trim(),
      productGroup: productGroup.trim() || undefined,
      productCode: productCode.trim(),
      productName: productName.trim(),
      barcode: barcode.trim() || undefined,
      barrelBarcode: barrelBarcode.trim() || undefined,
      barrelSize: Number(barrelSize) || 0,
      unit: unit.trim() || 'Case',
      packageSize: packageSize.trim() || undefined,
      sortOrder: Number(sortOrder) || 0,
      price: Number(price) || 0,
      status: inactivePeriods.length > 0 ? 'Inactive' : 'Active',
      inactiveFrom: latestInactiveFrom,
      inactiveTo: latestInactiveTo,
      inactivePeriods,
      expiryDate: mode === 'update' && product ? product.expiryDate : undefined,
      createdAt: mode === 'update' && product ? product.createdAt : new Date().toISOString().split('T')[0],
    };

    onSave(updatedProduct);
    onClose();
  };

  const titleText = mode === 'create'
    ? t('product.insert_title', 'Insert')
    : t('product.update_title', 'Update');

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
          maxWidth: '960px',
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
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
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              {titleText}
            </h2>
            {mode === 'update' && product && (
              <span style={{ fontSize: '12px', opacity: 0.9 }}>- {product.productCode}</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formError && (
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
                {formError}
              </div>
            )}

            {/* 1. Top Full-Width Category / Division Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                {t('product.select_category_group', 'Select Category / Product Group')}
              </label>
              <select
                value={selectedCategoryKey}
                onChange={(e) => handleCategoryChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '34px',
                  padding: '0 10px',
                  fontSize: '13px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                }}
              >
                <option value="">Select division / category</option>
                {INITIAL_CATEGORY_RECORDS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.division} - {c.brand} - {c.category}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. 3-Column Product Specification Grid (3 cols x 3 rows) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Row 1: Product Code, Product Name, Barcode */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('product.product_code', 'Product Code')} *
                  </label>
                  <input
                    type="text"
                    value={productCode}
                    onChange={(e) => setProductCode(e.target.value)}
                    placeholder="e.g. P00001"
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
                    {t('product.product_name', 'Product Name')} *
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g. SAIGON LAGER x 24 lon"
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
                    {t('product.barcode', 'Barcode')}
                  </label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Retail barcode"
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

              {/* Row 2: Barrel Barcode, Barrel Size, Unit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('product.barrel_barcode', 'Barrel Barcode')}
                  </label>
                  <input
                    type="text"
                    value={barrelBarcode}
                    onChange={(e) => setBarrelBarcode(e.target.value)}
                    placeholder="Case barcode"
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
                    {t('product.barrel_size', 'Barrel Size')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={barrelSize}
                    onChange={(e) => setBarrelSize(Number(e.target.value))}
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
                    {t('product.unit', 'Unit')}
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Case, Can, Box..."
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

              {/* Row 3: Package Size, Order By, Price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('product.package_size', 'Package Size')}
                  </label>
                  <input
                    type="text"
                    value={packageSize}
                    onChange={(e) => setPackageSize(e.target.value)}
                    placeholder="e.g. 330ml"
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
                    {t('category.sort_order', 'Order By')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
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
                    {t('product.price', 'Price')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
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

            {/* 3. Sub-Card Section: Inactive Date Schedule */}
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                backgroundColor: 'var(--bg-canvas)',
              }}
            >
              <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-primary)' }}>
                {t('product.inactive_schedule', 'Inactive Date Schedule')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Left Controls (~40% width) */}
                <div className="md:col-span-5" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600 }}>
                    {t('product.from_to_date', 'From Date - To Date')}
                  </label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="date"
                      value={newFromDate}
                      onChange={(e) => setNewFromDate(e.target.value)}
                      style={{
                        flex: 1,
                        height: '32px',
                        padding: '0 6px',
                        fontSize: '12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    />
                    <span>-</span>
                    <input
                      type="date"
                      value={newToDate}
                      onChange={(e) => setNewToDate(e.target.value)}
                      style={{
                        flex: 1,
                        height: '32px',
                        padding: '0 6px',
                        fontSize: '12px',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-surface)',
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddInactivePeriod}
                    disabled={!newFromDate}
                    style={{
                      height: '32px',
                      padding: '0 14px',
                      backgroundColor: 'var(--color-primary)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: newFromDate ? 'pointer' : 'not-allowed',
                      opacity: newFromDate ? 1 : 0.6,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      alignSelf: 'flex-start',
                    }}
                  >
                    <ArrowRight size={14} />
                    <span>{t('product.add_period', '-> Add')}</span>
                  </button>
                </div>

                {/* Right Sub-Table (~60% width) */}
                <div className="md:col-span-7">
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'var(--bg-surface)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center' }}>
                      <thead style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)', color: 'var(--color-primary)', fontWeight: 700 }}>
                        <tr>
                          <th style={{ padding: '6px 4px', width: '40px' }}>No.</th>
                          <th style={{ padding: '6px 8px' }}>From Date</th>
                          <th style={{ padding: '6px 8px' }}>To Date</th>
                          <th style={{ padding: '6px 4px', width: '50px' }}>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inactivePeriods.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                              No results found
                            </td>
                          </tr>
                        ) : (
                          inactivePeriods.map((p, idx) => (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '6px 4px', color: 'var(--text-secondary)' }}>{idx + 1}</td>
                              <td style={{ padding: '6px 8px' }}>{p.fromDate}</td>
                              <td style={{ padding: '6px 8px' }}>{p.toDate || 'Open-ended'}</td>
                              <td style={{ padding: '6px 4px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInactivePeriod(p.id)}
                                  title="Delete period"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#DC2626',
                                    cursor: 'pointer',
                                    padding: '4px',
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '12px 20px',
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
              <X size={16} />
              <span>{t('action.cancel', 'Cancel')}</span>
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
