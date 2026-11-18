import React, { useState, useMemo } from 'react';
import { X, RotateCw, Trash2, AlertCircle } from 'lucide-react';
import { ProductCatalogItem, SellOutReportRecord, SellOutLineItem } from '@/types/sellOut';
import { MOCK_PRODUCT_CATALOG } from '@/mocks/sellOutMockData';
import { MOCK_USERS } from '@/mocks/users';

interface StoreOptionItem {
  code: string;
  name: string;
  address: string;
  chain: string;
  channel: string;
  zoneCode: string;
  province: string;
}

const STORE_OPTIONS: StoreOptionItem[] = [
  {
    code: 'MCP_Q3',
    name: 'Co.opmart Nguyen Dinh Chieu',
    address: '168 Nguyen Dinh Chieu, Ward 6, District 3, HCMC',
    chain: 'Co.opmart',
    channel: 'MT',
    zoneCode: 'HCM03',
    province: 'Ho Chi Minh City',
  },
  {
    code: 'WM_LT',
    name: 'WinMart Le Thanh Ton',
    address: '72 Le Thanh Ton, Ben Nghe Ward, District 1, HCMC',
    chain: 'WinMart',
    channel: 'MT',
    zoneCode: 'HCM01',
    province: 'Ho Chi Minh City',
  },
  {
    code: 'EM_GV',
    name: 'Emart Go Vap Hypermarket',
    address: '366 Phan Van Tri, Ward 5, Go Vap District, HCMC',
    chain: 'Emart',
    channel: 'MT',
    zoneCode: 'HCM02',
    province: 'Ho Chi Minh City',
  },
  {
    code: 'LT_Q7',
    name: 'Lotte Mart South Saigon',
    address: '469 Nguyen Huu Tho, Tan Hung Ward, District 7, HCMC',
    chain: 'Lotte Mart',
    channel: 'MT',
    zoneCode: 'HCM01',
    province: 'Ho Chi Minh City',
  },
  {
    code: 'WM_TH',
    name: 'WinMart Times City',
    address: '458 Minh Khai, Hai Ba Trung, Hanoi',
    chain: 'WinMart',
    channel: 'MT',
    zoneCode: 'HN01',
    province: 'Hanoi',
  },
  {
    code: 'MCP_HD',
    name: 'Co.opmart Ha Dong',
    address: 'KM10 Nguyen Trai, Ha Dong, Hanoi',
    chain: 'Co.opmart',
    channel: 'MT',
    zoneCode: 'HN01',
    province: 'Hanoi',
  },
  {
    code: 'MCP_HP',
    name: 'Co.opmart Hai Phong',
    address: '1 Le Hong Phong, Ngo Quyen, Hai Phong',
    chain: 'Co.opmart',
    channel: 'GT',
    zoneCode: 'HP01',
    province: 'Hai Phong',
  },
  {
    code: 'WM_CL',
    name: 'WinMart Cong Luynh',
    address: '189 Cong Quynh, Nguyen Cu Trinh, District 1, HCMC',
    chain: 'WinMart',
    channel: 'MT',
    zoneCode: 'HCM03',
    province: 'Ho Chi Minh City',
  },
  {
    code: 'MCP_BT',
    name: 'Co.opmart Binh Trieu',
    address: '68/1 National Route 13, Hiep Binh Chanh, Thu Duc, HCMC',
    chain: 'Co.opmart',
    channel: 'MT',
    zoneCode: 'HCM02',
    province: 'Ho Chi Minh City',
  },
];

interface ProductRowState {
  item: ProductCatalogItem;
  quantity: number;
  note: string;
  osa: boolean;
  selected: boolean;
}

interface CreateSellOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: SellOutReportRecord) => void;
}

export const CreateSellOutModal: React.FC<CreateSellOutModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedStoreCode, setSelectedStoreCode] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Table rows initialized from MOCK_PRODUCT_CATALOG
  const [rows, setRows] = useState<ProductRowState[]>(() =>
    MOCK_PRODUCT_CATALOG.map((item) => ({
      item,
      quantity: 0,
      note: '',
      osa: true,
      selected: false,
    }))
  );

  // Inline filter states
  const [categoryFilter, setCategoryFilter] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');

  // Eligible employees (PG/PA/Field reps)
  const eligibleEmployees = useMemo(() => {
    return MOCK_USERS.filter((u) =>
      ['PG-D', 'PG-Inline', 'PA', 'Leader', 'Supervisor'].includes(u.currentPosition)
    );
  }, []);

  // Filtered rows for display
  const displayedRows = useMemo(() => {
    if (!selectedStoreCode) return [];
    return rows.filter((r) => {
      const matchCat = categoryFilter === '' || r.item.category.toLowerCase().includes(categoryFilter.toLowerCase());
      const matchGroup = groupFilter === '' || r.item.productGroup.toLowerCase().includes(groupFilter.toLowerCase());
      const matchCode = codeFilter === '' || r.item.productCode.toLowerCase().includes(codeFilter.toLowerCase());
      const matchName = nameFilter === '' || r.item.productName.toLowerCase().includes(nameFilter.toLowerCase());
      return matchCat && matchGroup && matchCode && matchName;
    });
  }, [rows, selectedStoreCode, categoryFilter, groupFilter, codeFilter, nameFilter]);

  if (!isOpen) return null;

  const handleResetFiltersAndQuantities = () => {
    setCategoryFilter('');
    setGroupFilter('');
    setCodeFilter('');
    setNameFilter('');
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        quantity: 0,
        note: '',
        osa: true,
        selected: false,
      }))
    );
  };

  const handleEmployeeChange = (empId: string) => {
    setSelectedEmployeeId(empId);
    if (!empId) {
      setSelectedStoreCode('');
    }
  };

  const handleQuantityChange = (itemId: string, qty: number) => {
    setRows((prev) =>
      prev.map((r) =>
        r.item.id === itemId ? { ...r, quantity: Math.max(0, qty) } : r
      )
    );
  };

  const handleNoteChange = (itemId: string, note: string) => {
    setRows((prev) =>
      prev.map((r) => (r.item.id === itemId ? { ...r, note } : r))
    );
  };

  const handleOsaChange = (itemId: string, osa: boolean) => {
    setRows((prev) =>
      prev.map((r) => (r.item.id === itemId ? { ...r, osa } : r))
    );
  };

  const handleToggleSelectRow = (itemId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.item.id === itemId ? { ...r, selected: !r.selected } : r
      )
    );
  };

  const handleSelectAllDisplayed = (checked: boolean) => {
    const displayedIds = new Set(displayedRows.map((r) => r.item.id));
    setRows((prev) =>
      prev.map((r) =>
        displayedIds.has(r.item.id) ? { ...r, selected: checked } : r
      )
    );
  };

  const handleBulkClear = () => {
    setRows((prev) =>
      prev.map((r) =>
        r.selected ? { ...r, quantity: 0, note: '', selected: false } : r
      )
    );
  };

  const handleSave = () => {
    if (!selectedDate) {
      setValidationError('Please select a report date.');
      return;
    }
    if (!selectedEmployeeId) {
      setValidationError('Please select an employee.');
      return;
    }
    if (!selectedStoreCode) {
      setValidationError('Please select a store.');
      return;
    }

    const itemsWithQty = rows.filter((r) => r.quantity > 0);
    if (itemsWithQty.length === 0) {
      setValidationError('Please enter quantity for at least one product.');
      return;
    }

    const employee = MOCK_USERS.find((u) => u.id === selectedEmployeeId);
    const store = STORE_OPTIONS.find((s) => s.code === selectedStoreCode);

    if (!employee || !store) {
      setValidationError('Selected employee or store information is incomplete.');
      return;
    }

    const totalQty = itemsWithQty.reduce((sum, r) => sum + r.quantity, 0);

    const lineItems: SellOutLineItem[] = itemsWithQty.map((r, idx) => ({
      id: `soi-${Date.now()}-${idx}`,
      category: r.item.category,
      productGroup: r.item.productGroup,
      productCode: r.item.productCode,
      productName: r.item.productName,
      totalQuantity: r.item.existingTotalQty + r.quantity,
      quantity: r.quantity,
      note: r.note.trim() ? r.note.trim() : undefined,
      osa: r.osa,
    }));

    const nowTime = new Date().toTimeString().slice(0, 5);
    const recordedAt = `${selectedDate} ${nowTime}`;

    const newRecord: SellOutReportRecord = {
      id: `so-${Date.now()}`,
      zoneCode: store.zoneCode,
      channel: store.channel,
      chain: store.chain,
      province: store.province,
      storeCode: store.code,
      storeName: store.name,
      storeAddress: store.address,
      supervisorId: employee.currentSupervisorId || 'usr-003',
      supervisorName: employee.currentSupervisorName || 'Le Thi Mai',
      userId: employee.id,
      employeeCode: employee.employeeCode,
      employeeName: employee.fullName,
      phoneNumber: employee.phoneNumber,
      position: employee.currentPosition,
      recordedAt,
      shiftCode: 'CA_AM',
      totalQuantity: totalQty,
      items: lineItems,
    };

    setValidationError(null);
    onSave(newRecord);
    onClose();
  };

  const isAllDisplayedSelected =
    displayedRows.length > 0 && displayedRows.every((r) => r.selected);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        backgroundColor: 'rgba(0, 0, 0, 0.48)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md, 8px)',
          width: '100%',
          maxWidth: '1150px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <h2
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Create Sell-Out Report
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Validation Alert */}
          {validationError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #f87171',
                borderRadius: '6px',
                color: '#b91c1c',
                fontSize: '13px',
              }}
            >
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Top Selection Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: selectedEmployeeId ? '1fr 1fr 1.2fr' : '1fr 1fr',
              gap: '16px',
              alignItems: 'flex-end',
              padding: '16px',
              backgroundColor: 'var(--bg-main, #f8fafc)',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              transition: 'all 0.25s ease',
            }}
          >
            {/* 1. Date */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Date <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '13px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* 2. Employee */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                Employee <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '13px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">Select employee</option>
                {eligibleEmployees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employeeCode} - {emp.fullName} ({emp.currentPosition})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Store (Conditional Rendering) */}
            {selectedEmployeeId !== '' && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      marginBottom: '6px',
                    }}
                  >
                    Store <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={selectedStoreCode}
                    onChange={(e) => setSelectedStoreCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      fontSize: '13px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">Select store</option>
                    {STORE_OPTIONS.map((st) => (
                      <option key={st.code} value={st.code}>
                        [{st.code}] {st.name} ({st.chain})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleResetFiltersAndQuantities}
                  title="Reset quantities & filters"
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '35px',
                  }}
                >
                  <RotateCw size={15} />
                </button>
              </div>
            )}
          </div>

          {/* Product Entry Table Section */}
          <div
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <div style={{ overflowX: 'auto', maxHeight: '420px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12.5px',
                  textAlign: 'left',
                }}
              >
                {/* Main Header */}
                <thead>
                  <tr
                    style={{
                      backgroundColor: 'var(--color-primary)',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '13px',
                    }}
                  >
                    <th style={{ padding: '8px 10px', width: '45px', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={handleBulkClear}
                        title="Bulk clear selected rows"
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: 'none',
                          color: '#ffffff',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          padding: '3px 5px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </th>
                    <th style={{ padding: '8px 10px', width: '40px', textAlign: 'center' }}>No.</th>
                    <th style={{ padding: '8px 10px', minWidth: '110px' }}>Category</th>
                    <th style={{ padding: '8px 10px', minWidth: '150px' }}>Product Group</th>
                    <th style={{ padding: '8px 10px', minWidth: '100px' }}>Product Code</th>
                    <th style={{ padding: '8px 10px', minWidth: '220px' }}>Product Name</th>
                    <th style={{ padding: '8px 10px', width: '100px', textAlign: 'center' }}>
                      Total Quantity
                    </th>
                    <th style={{ padding: '8px 10px', width: '100px', textAlign: 'center' }}>
                      Quantity
                    </th>
                    <th style={{ padding: '8px 10px', minWidth: '140px' }}>Note</th>
                    <th style={{ padding: '8px 10px', width: '60px', textAlign: 'center' }}>OSA</th>
                  </tr>

                  {/* Inline Filter Row */}
                  <tr style={{ backgroundColor: 'var(--bg-main, #f8fafc)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '4px 8px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isAllDisplayedSelected}
                        onChange={(e) => handleSelectAllDisplayed(e.target.checked)}
                        disabled={displayedRows.length === 0}
                        style={{ cursor: 'pointer' }}
                        title="Select all displayed"
                      />
                    </th>
                    <th style={{ padding: '4px 8px' }}></th>
                    <th style={{ padding: '4px 8px' }}>
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '3px 6px',
                          fontSize: '11.5px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '3px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </th>
                    <th style={{ padding: '4px 8px' }}>
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '3px 6px',
                          fontSize: '11.5px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '3px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </th>
                    <th style={{ padding: '4px 8px' }}>
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={codeFilter}
                        onChange={(e) => setCodeFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '3px 6px',
                          fontSize: '11.5px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '3px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </th>
                    <th style={{ padding: '4px 8px' }}>
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '3px 6px',
                          fontSize: '11.5px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '3px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </th>
                    <th colSpan={4} style={{ padding: '4px 8px' }}></th>
                  </tr>
                </thead>

                <tbody>
                  {!selectedStoreCode ? (
                    <tr>
                      <td
                        colSpan={10}
                        style={{
                          padding: '36px 16px',
                          textAlign: 'center',
                          color: 'var(--text-secondary)',
                          fontSize: '13px',
                        }}
                      >
                        {!selectedEmployeeId
                          ? 'Please select an employee and store to load product catalog.'
                          : 'Please select a store to load product catalog.'}
                      </td>
                    </tr>
                  ) : displayedRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        style={{
                          padding: '36px 16px',
                          textAlign: 'center',
                          color: 'var(--text-secondary)',
                          fontSize: '13px',
                        }}
                      >
                        No results found
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((r, idx) => {
                      const totalQty = r.item.existingTotalQty + r.quantity;
                      return (
                        <tr
                          key={r.item.id}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            backgroundColor: r.selected
                              ? 'var(--color-primary-soft-bg, rgba(29, 78, 216, 0.05))'
                              : 'transparent',
                          }}
                        >
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={r.selected}
                              onChange={() => handleToggleSelectRow(r.item.id)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-primary)' }}>
                            {r.item.category}
                          </td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-primary)' }}>
                            {r.item.productGroup}
                          </td>
                          <td style={{ padding: '8px 10px', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {r.item.productCode}
                          </td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-primary)' }}>
                            {r.item.productName}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>
                            {totalQty}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <input
                              type="number"
                              min={0}
                              value={r.quantity === 0 ? '' : r.quantity}
                              onChange={(e) =>
                                handleQuantityChange(r.item.id, parseInt(e.target.value, 10) || 0)
                              }
                              placeholder="0"
                              style={{
                                width: '70px',
                                padding: '4px 6px',
                                fontSize: '12.5px',
                                textAlign: 'center',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <input
                              type="text"
                              value={r.note}
                              onChange={(e) => handleNoteChange(r.item.id, e.target.value)}
                              placeholder="Note..."
                              style={{
                                width: '100%',
                                padding: '4px 8px',
                                fontSize: '12px',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={r.osa}
                              onChange={(e) => handleOsaChange(r.item.id, e.target.checked)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '7px 18px',
              fontSize: '13px',
              fontWeight: 500,
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm, 4px)',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '7px 20px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-sm, 4px)',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
export default CreateSellOutModal;
