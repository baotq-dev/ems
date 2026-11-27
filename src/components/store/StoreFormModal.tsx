import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Maximize2, Minimize2, ImagePlus, Image as ImageIcon } from 'lucide-react';
import { StoreRecord } from '@/types/store';
import {
  MOCK_CHANNELS,
  MOCK_ACCOUNTS,
  MOCK_SUPPLIERS,
  MOCK_STORE_TYPES,
  MOCK_PROVINCE_HIERARCHY,
  MOCK_NEW_PROVINCES,
} from '@/mocks/storeMockData';
import { useI18n } from '@/context/I18nContext';

interface StoreFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'update';
  store: StoreRecord | null;
  onClose: () => void;
  onSave: (store: StoreRecord) => void;
}

export const StoreFormModal: React.FC<StoreFormModalProps> = ({
  isOpen,
  mode,
  store,
  onClose,
  onSave,
}) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Expand modal width toggle
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Store photo banner
  const [storeImageUrl, setStoreImageUrl] = useState<string>('');

  // Row 1: Channel, Chain, Supplier, Store Type
  const [channelCode, setChannelCode] = useState<string>('');
  const [accountCode, setAccountCode] = useState<string>('CUS001');
  const [supplierCode, setSupplierCode] = useState<string>('');
  const [storeType, setStoreType] = useState<string>('');

  // Row 2: Store Code *, Store Name *, Address *
  const [storeCode, setStoreCode] = useState<string>('');
  const [storeName, setStoreName] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  // Row 3: Cascading Location (Region/Area -> Province -> District -> Town)
  const [area, setArea] = useState<string>('Mien Dong');
  const [province, setProvince] = useState<string>('Ho Chi Minh City');
  const [district, setDistrict] = useState<string>('District 1');
  const [town, setTown] = useState<string>('Ben Nghe Ward');

  // Row 4: Dates & Latitude
  const [activeDate, setActiveDate] = useState<string>('');
  const [closedDate, setClosedDate] = useState<string>('');
  const [districtTownNote, setDistrictTownNote] = useState<string>('');
  const [latitude, setLatitude] = useState<string>('');

  // Row 5: Coordinates & Legacy Code
  const [longitude, setLongitude] = useState<string>('');
  const [accuracy, setAccuracy] = useState<string>('');
  const [coordinateSource, setCoordinateSource] = useState<string>('');
  const [oldStoreCode, setOldStoreCode] = useState<string>('');

  // Row 6: Contact & Visit Frequency
  const [codeChangeNote, setCodeChangeNote] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [frequency, setFrequency] = useState<number>(1);

  // Row 7: New Administrative Mapping & Location Codes
  const [locationCode, setLocationCode] = useState<string>('');
  const [newProvince, setNewProvince] = useState<string>('Ho Chi Minh City');
  const [newTown, setNewTown] = useState<string>('Ben Nghe Ward');
  const [unitCode, setUnitCode] = useState<string>('');

  const [formError, setFormError] = useState<string>('');

  // Cascading options derived from MOCK_PROVINCE_HIERARCHY
  const regionOptions = Array.from(new Set(MOCK_PROVINCE_HIERARCHY.map((p) => p.area)));

  const provinceOptions = MOCK_PROVINCE_HIERARCHY
    .filter((p) => p.area === area)
    .map((p) => p.province);

  const currentProvinceObj = MOCK_PROVINCE_HIERARCHY.find(
    (p) => p.area === area && p.province === province
  );

  const districtOptions = currentProvinceObj
    ? currentProvinceObj.districts.map((d) => d.name)
    : [];

  const currentDistrictObj = currentProvinceObj?.districts.find((d) => d.name === district);

  const townOptions = currentDistrictObj ? currentDistrictObj.towns : [];

  // Cascading options for New Province / Ward
  const newProvinceOptions = MOCK_NEW_PROVINCES.map((np) => np.province);
  const currentNewProvinceObj = MOCK_NEW_PROVINCES.find((np) => np.province === newProvince);
  const newTownOptions = currentNewProvinceObj ? currentNewProvinceObj.wards : [];

  useEffect(() => {
    if (isOpen) {
      setFormError('');
      if (mode === 'update' && store) {
        setStoreImageUrl(store.storeImageUrl || '');
        setChannelCode(store.channelCode || '');
        setAccountCode(store.accountCode || 'CUS001');
        setSupplierCode(store.supplierCode || '');
        setStoreType(store.storeType || '');
        setStoreCode(store.storeCode || '');
        setStoreName(store.storeName || '');
        setAddress(store.address || '');
        setArea(store.area || 'Mien Dong');
        setProvince(store.province || 'Ho Chi Minh City');
        setDistrict(store.district || '');
        setTown(store.town || '');
        setActiveDate(store.activeDate || '');
        setClosedDate(store.closedDate || '');
        setDistrictTownNote(store.districtTownNote || '');
        setLatitude(store.latitude !== undefined ? String(store.latitude) : '');
        setLongitude(store.longitude !== undefined ? String(store.longitude) : '');
        setAccuracy(store.accuracy !== undefined ? String(store.accuracy) : '');
        setCoordinateSource(store.coordinateSource || '');
        setOldStoreCode(store.oldStoreCode || '');
        setCodeChangeNote(store.codeChangeNote || '');
        setMobile(store.mobile || '');
        setEmail(store.email || '');
        setFrequency(store.frequency ?? 1);
        setLocationCode(store.locationCode || '');
        setNewProvince(store.newProvince || 'Ho Chi Minh City');
        setNewTown(store.newTown || '');
        setUnitCode(store.unitCode || '');
      } else {
        // Create mode defaults
        setStoreImageUrl('');
        setChannelCode('Super');
        setAccountCode('CUS001');
        setSupplierCode('SUP001');
        setStoreType('Supermarket');
        setStoreCode('');
        setStoreName('');
        setAddress('');
        setArea('Mien Dong');
        setProvince('Ho Chi Minh City');
        setDistrict('District 1');
        setTown('Ben Nghe Ward');
        setActiveDate(new Date().toISOString().split('T')[0]);
        setClosedDate('');
        setDistrictTownNote('');
        setLatitude('');
        setLongitude('');
        setAccuracy('5');
        setCoordinateSource('GPS Device');
        setOldStoreCode('');
        setCodeChangeNote('');
        setMobile('');
        setEmail('');
        setFrequency(1);
        setLocationCode('');
        setNewProvince('Ho Chi Minh City');
        setNewTown('Ben Nghe Ward');
        setUnitCode('');
      }
    }
  }, [isOpen, mode, store]);

  if (!isOpen) return null;

  // Handle local image upload preview
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setStoreImageUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!storeCode.trim() || !storeName.trim() || !address.trim() || frequency < 1) {
      setFormError(t('store.error_required', 'Store Code, Store Name, Address, and Frequency >= 1 are required.'));
      return;
    }

    const matchedAccount = MOCK_ACCOUNTS.find((a) => a.code === accountCode);
    const matchedChannel = MOCK_CHANNELS.find((c) => c.code === channelCode);
    const matchedSupplier = MOCK_SUPPLIERS.find((s) => s.code === supplierCode);

    const savedStore: StoreRecord = {
      id: mode === 'update' && store ? store.id : `str-${Date.now()}`,
      storeImageUrl: storeImageUrl.trim() || undefined,
      channelCode,
      channelName: matchedChannel?.name || channelCode,
      accountCode,
      accountName: matchedAccount?.name || accountCode,
      supplierCode,
      supplierName: matchedSupplier?.name || supplierCode,
      storeType,
      storeCode: storeCode.trim(),
      storeName: storeName.trim(),
      address: address.trim(),
      area,
      province,
      district,
      town,
      activeDate: activeDate || undefined,
      closedDate: closedDate || undefined,
      districtTownNote: districtTownNote.trim() || undefined,
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      accuracy: accuracy ? Number(accuracy) : undefined,
      coordinateSource: coordinateSource.trim() || undefined,
      oldStoreCode: oldStoreCode.trim() || undefined,
      codeChangeNote: codeChangeNote.trim() || undefined,
      mobile: mobile.trim() || undefined,
      email: email.trim() || undefined,
      frequency: Number(frequency) || 1,
      locationCode: locationCode.trim() || undefined,
      newProvince,
      newTown,
      unitCode: unitCode.trim() || undefined,
      status: closedDate ? 'Inactive' : 'Active',
      overview: mode === 'update' && store ? store.overview : undefined,
      createdAt: mode === 'update' && store ? store.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onSave(savedStore);
    onClose();
  };

  const titleText = mode === 'create'
    ? t('store.insert_title', 'Insert')
    : t('store.update_title', 'Update');

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
          maxWidth: isExpanded ? '98vw' : '1180px',
          height: isExpanded ? '96vh' : 'auto',
          maxHeight: '94vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'all 0.2s ease-in-out',
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
            {mode === 'update' && store && (
              <span style={{ fontSize: '12px', opacity: 0.9 }}>- {store.storeCode} ({store.storeName})</span>
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
              }}
            >
              <X size={20} />
            </button>
          </div>
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

            {/* 1. Top Store Photo Banner Box (150px height) */}
            <div
              style={{
                width: '100%',
                height: '150px',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-canvas)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {storeImageUrl ? (
                <img
                  src={storeImageUrl}
                  alt="Store storefront"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-secondary)' }}>
                  <ImageIcon size={36} style={{ opacity: 0.5, marginBottom: '4px' }} />
                  <span style={{ fontSize: '13px' }}>No store image</span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  padding: '6px 14px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <ImagePlus size={15} />
                <span>{t('store.choose_image', 'Choose Image')}</span>
              </button>
            </div>

            {/* 2. 4-Column Store Detail Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Row 1: Channel, Chain, Supplier, Store Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.channel', 'Channel')}
                  </label>
                  <select
                    value={channelCode}
                    onChange={(e) => setChannelCode(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    <option value="">Select one</option>
                    {MOCK_CHANNELS.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.chain', 'Chain')}
                  </label>
                  <select
                    value={accountCode}
                    onChange={(e) => setAccountCode(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    <option value="">Select chain</option>
                    {MOCK_ACCOUNTS.map((a) => (
                      <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.supplier', 'Supplier')}
                  </label>
                  <select
                    value={supplierCode}
                    onChange={(e) => setSupplierCode(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    <option value="">Select one</option>
                    {MOCK_SUPPLIERS.map((s) => (
                      <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.store_type', 'Store Type')}
                  </label>
                  <select
                    value={storeType}
                    onChange={(e) => setStoreType(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    <option value="">Select one</option>
                    {MOCK_STORE_TYPES.map((st) => (
                      <option key={st.code} value={st.code}>{st.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Store Code *, Store Name *, Address * (spans 2 cols) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.store_code', 'Store Code')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={storeCode}
                      onChange={(e) => setStoreCode(e.target.value)}
                      placeholder="e.g. A103"
                      style={{ width: '100%', height: '32px', padding: '0 26px 0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                    />
                    {storeCode && (
                      <button
                        type="button"
                        onClick={() => setStoreCode('')}
                        style={{ position: 'absolute', right: '6px', top: '7px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.store_name', 'Store Name')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Mega Vung Tau"
                      style={{ width: '100%', height: '32px', padding: '0 26px 0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                    />
                    {storeName && (
                      <button
                        type="button"
                        onClick={() => setStoreName('')}
                        style={{ position: 'absolute', right: '6px', top: '7px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.address', 'Address')} *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Full street address"
                      style={{ width: '100%', height: '32px', padding: '0 26px 0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                    />
                    {address && (
                      <button
                        type="button"
                        onClick={() => setAddress('')}
                        style={{ position: 'absolute', right: '6px', top: '7px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 3: Cascading Location (Region -> Province -> District -> Ward) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.region', 'Region / Area')}
                  </label>
                  <select
                    value={area}
                    onChange={(e) => {
                      setArea(e.target.value);
                      const firstP = MOCK_PROVINCE_HIERARCHY.find((p) => p.area === e.target.value);
                      if (firstP) {
                        setProvince(firstP.province);
                        const firstD = firstP.districts[0];
                        setDistrict(firstD ? firstD.name : '');
                        setTown(firstD?.towns[0] || '');
                      }
                    }}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    {regionOptions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.province', 'Province/City')}
                  </label>
                  <select
                    value={province}
                    onChange={(e) => {
                      setProvince(e.target.value);
                      const pObj = MOCK_PROVINCE_HIERARCHY.find((p) => p.area === area && p.province === e.target.value);
                      const firstD = pObj?.districts[0];
                      setDistrict(firstD ? firstD.name : '');
                      setTown(firstD?.towns[0] || '');
                    }}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    {provinceOptions.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.district', 'District')}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      const dObj = currentProvinceObj?.districts.find((d) => d.name === e.target.value);
                      setTown(dObj?.towns[0] || '');
                    }}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    {districtOptions.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.ward', 'Ward/Commune')}
                  </label>
                  <select
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    {townOptions.map((tw) => (
                      <option key={tw} value={tw}>{tw}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Active Date, Closed Date, District/Town Note, Latitude */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.active_date', 'Active Date')}
                  </label>
                  <input
                    type="date"
                    value={activeDate}
                    onChange={(e) => setActiveDate(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.closed_date', 'Closed Date')}
                  </label>
                  <input
                    type="date"
                    value={closedDate}
                    onChange={(e) => setClosedDate(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 6px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    District / Town Note
                  </label>
                  <input
                    type="text"
                    value={districtTownNote}
                    onChange={(e) => setDistrictTownNote(e.target.value)}
                    placeholder="Note..."
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 10.3759"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>
              </div>

              {/* Row 5: Longitude, Accuracy, Coordinate Source, Old Store Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 107.1234"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Accuracy (m)
                  </label>
                  <input
                    type="number"
                    value={accuracy}
                    onChange={(e) => setAccuracy(e.target.value)}
                    placeholder="10"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Coordinate Source
                  </label>
                  <input
                    type="text"
                    value={coordinateSource}
                    onChange={(e) => setCoordinateSource(e.target.value)}
                    placeholder="GPS / Google Map"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Old Store Code
                  </label>
                  <input
                    type="text"
                    value={oldStoreCode}
                    onChange={(e) => setOldStoreCode(e.target.value)}
                    placeholder="Legacy code"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>
              </div>

              {/* Row 6: Code Change Note, Mobile, Email, Frequency * (with slider) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Code Change Note
                  </label>
                  <input
                    type="text"
                    value={codeChangeNote}
                    onChange={(e) => setCodeChangeNote(e.target.value)}
                    placeholder="Change history"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Mobile
                  </label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="090..."
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="store@domain.com"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600 }}>
                      {t('store.frequency', 'Frequency')} *
                    </label>
                    <span
                      style={{
                        padding: '1px 6px',
                        backgroundColor: 'var(--color-success-accent)',
                        color: '#FFFFFF',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {frequency} / wk
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={frequency}
                      onChange={(e) => setFrequency(Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                    />
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={frequency}
                      onChange={(e) => setFrequency(Number(e.target.value))}
                      style={{ width: '45px', height: '30px', textAlign: 'center', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 7: Location Code, Province/City (New), Ward/Commune (New), Unit Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Location Code
                  </label>
                  <input
                    type="text"
                    value={locationCode}
                    onChange={(e) => setLocationCode(e.target.value)}
                    placeholder="e.g. LOC-01"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.new_province', 'Province/City (New)')}
                  </label>
                  <select
                    value={newProvince}
                    onChange={(e) => {
                      setNewProvince(e.target.value);
                      const npObj = MOCK_NEW_PROVINCES.find((np) => np.province === e.target.value);
                      setNewTown(npObj?.wards[0] || '');
                    }}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    {newProvinceOptions.map((np) => (
                      <option key={np} value={np}>{np}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    {t('store.new_ward', 'Ward/Commune (New)')}
                  </label>
                  <select
                    value={newTown}
                    onChange={(e) => setNewTown(e.target.value)}
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  >
                    {newTownOptions.map((ntw) => (
                      <option key={ntw} value={ntw}>{ntw}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Unit Code
                  </label>
                  <input
                    type="text"
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value)}
                    placeholder="e.g. UNIT-VT"
                    style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)' }}
                  />
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
              <Check size={16} />
              <span>{mode === 'create' ? t('action.add', 'Insert') : t('action.edit', 'Update')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
