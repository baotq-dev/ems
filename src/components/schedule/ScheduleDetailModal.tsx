import React, { useState } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Trash2,
  ChevronDown,
  Save,
  Minus,
  Plus,
} from 'lucide-react';
import { User } from '@/types/user';
import {
  DailyScheduleRecord,
  AssignedShiftItem,
  ScheduleChangeRequestItem,
  StoreOption,
} from '@/types/shift';
import { MOCK_SHIFTS, MOCK_STORES } from '@/mocks/shiftMockData';

interface ScheduleDetailModalProps {
  isOpen: boolean;
  date: string; // YYYY-MM-DD
  employee: User;
  scheduleRecord: DailyScheduleRecord | undefined;
  onClose: () => void;
  onSaveSchedule: (date: string, assignedShifts: AssignedShiftItem[]) => void;
  onDeleteChangeRequests: (date: string, requestIds: string[]) => void;
}

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  isOpen,
  date,
  employee,
  scheduleRecord,
  onClose,
  onSaveSchedule,
  onDeleteChangeRequests,
}) => {
  // Modal size toggle
  const [isExpanded, setIsExpanded] = useState(false);

  // Collapsible cards state
  const [scheduleCardOpen, setScheduleCardOpen] = useState(true);
  const [changeReqCardOpen, setChangeReqCardOpen] = useState(true);
  const [addScheduleCardOpen, setAddScheduleCardOpen] = useState(true);

  // Staging state for "Add Working Schedule"
  const [selectedShiftId, setSelectedShiftId] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [stagedStores, setStagedStores] = useState<StoreOption[]>([]);
  const [formError, setFormError] = useState('');

  // Change request checkboxes
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const currentAssignedShifts: AssignedShiftItem[] = scheduleRecord ? scheduleRecord.assignedShifts : [];
  const currentChangeRequests: ScheduleChangeRequestItem[] = scheduleRecord ? scheduleRecord.changeRequests : [];

  // Stage a store
  const handleStageStore = () => {
    setFormError('');
    if (!selectedStoreId) return;
    const store = MOCK_STORES.find((s) => s.id === selectedStoreId);
    if (!store) return;

    if (stagedStores.some((s) => s.id === store.id)) {
      setFormError('Store is already staged in this list.');
      return;
    }

    setStagedStores([...stagedStores, store]);
    setSelectedStoreId('');
  };

  const handleRemoveStagedStore = (storeId: string) => {
    setStagedStores(stagedStores.filter((s) => s.id !== storeId));
  };

  // Unassign an existing shift
  const handleRemoveAssignedShift = (shiftItemId: string) => {
    const updated = currentAssignedShifts.filter((s) => s.id !== shiftItemId);
    onSaveSchedule(date, updated);
  };

  // Save new working schedule
  const handleSaveAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedShiftId) {
      setFormError('Please select a shift.');
      return;
    }

    if (stagedStores.length === 0) {
      setFormError('Please stage at least one store.');
      return;
    }

    const shiftDef = MOCK_SHIFTS.find((s) => s.id === selectedShiftId);
    if (!shiftDef) return;

    const newAssignedItems: AssignedShiftItem[] = stagedStores.map((st) => ({
      id: `as-${Date.now()}-${st.id}`,
      shiftId: shiftDef.id,
      shiftCode: shiftDef.code,
      shiftName: shiftDef.name,
      storeId: st.id,
      storeName: st.name,
      checkInStatus: 'Not Checked In',
      colorToken: shiftDef.colorToken,
    }));

    const merged = [...currentAssignedShifts, ...newAssignedItems];
    onSaveSchedule(date, merged);

    // Reset staging
    setSelectedShiftId('');
    setSelectedStoreId('');
    setStagedStores([]);
  };

  // Change Request Checkbox Handling
  const handleToggleRequestCheckbox = (id: string) => {
    if (selectedRequestIds.includes(id)) {
      setSelectedRequestIds(selectedRequestIds.filter((reqId) => reqId !== id));
    } else {
      setSelectedRequestIds([...selectedRequestIds, id]);
    }
  };

  const handleDeleteSelectedRequests = () => {
    if (selectedRequestIds.length === 0) return;
    onDeleteChangeRequests(date, selectedRequestIds);
    setSelectedRequestIds([]);
  };

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
          maxWidth: isExpanded ? '1350px' : '1050px',
          maxHeight: '92vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'max-width 0.2s ease',
        }}
      >
        {/* 5.1 Modal Header */}
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
          <div style={{ fontSize: '15px', fontWeight: 700 }}>
            {date} | {employee.username} - {employee.fullName} ({employee.currentPosition})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse width' : 'Expand width'}
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
              }}
            >
              {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close modal"
              style={{
                background: 'none',
                border: 'none',
                color: '#FFFFFF',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 5.2 Modal Body (2-Column Split Layout) */}
        <div
          style={{
            padding: '16px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Column (~62% width): Current Schedule & Change Requests */}
            <div style={{ flex: '1 1 62%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Card 1: Working Schedule */}
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  overflow: 'hidden',
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setScheduleCardOpen(!scheduleCardOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setScheduleCardOpen(!scheduleCardOpen);
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-primary-soft-bg)',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <span>Working Schedule</span>
                  {scheduleCardOpen ? <Minus size={16} /> : <Plus size={16} />}
                </div>

                {scheduleCardOpen && (
                  <div style={{ overflowX: 'auto', padding: '8px' }}>
                    <table
                      style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '12px',
                        textAlign: 'left',
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '6px 8px' }}>Shift</th>
                          <th style={{ padding: '6px 8px' }}>Store</th>
                          <th style={{ padding: '6px 8px' }}>Check-in</th>
                          <th style={{ padding: '6px 8px', textAlign: 'center', width: '60px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAssignedShifts.length === 0 ? (
                          <tr>
                            <td colSpan={4} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                              No results found
                            </td>
                          </tr>
                        ) : (
                          currentAssignedShifts.map((shift) => (
                            <tr key={shift.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '6px 8px', fontWeight: 600, color: 'var(--color-primary)' }}>
                                {shift.shiftCode} ({shift.shiftName})
                              </td>
                              <td style={{ padding: '6px 8px' }}>{shift.storeName}</td>
                              <td style={{ padding: '6px 8px' }}>
                                <span
                                  style={{
                                    padding: '2px 6px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '11px',
                                    fontWeight: 500,
                                    backgroundColor:
                                      shift.checkInStatus === 'Checked In'
                                        ? '#E8F5E9'
                                        : shift.checkInStatus === 'Late'
                                        ? '#FFEBEE'
                                        : 'var(--bg-canvas)',
                                    color:
                                      shift.checkInStatus === 'Checked In'
                                        ? '#2E7D32'
                                        : shift.checkInStatus === 'Late'
                                        ? '#C62828'
                                        : 'var(--text-secondary)',
                                  }}
                                >
                                  {shift.checkInStatus}
                                </span>
                              </td>
                              <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAssignedShift(shift.id)}
                                  title="Unassign shift"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-primary)',
                                    cursor: 'pointer',
                                    padding: 0,
                                  }}
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Card 2: Schedule Change Requests */}
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  overflow: 'hidden',
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setChangeReqCardOpen(!changeReqCardOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setChangeReqCardOpen(!changeReqCardOpen);
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-primary-soft-bg)',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <span>Schedule Change Requests</span>
                  {changeReqCardOpen ? <Minus size={16} /> : <Plus size={16} />}
                </div>

                {changeReqCardOpen && (
                  <div style={{ padding: '8px' }}>
                    {/* Toolbar above table */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                      <button
                        type="button"
                        disabled={selectedRequestIds.length === 0}
                        onClick={handleDeleteSelectedRequests}
                        style={{
                          height: '26px',
                          padding: '0 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: 'var(--bg-surface)',
                          color: selectedRequestIds.length > 0 ? 'var(--color-primary)' : 'var(--text-secondary)',
                          border: `1px solid ${selectedRequestIds.length > 0 ? 'var(--color-primary)' : 'var(--border-color)'}`,
                          borderRadius: 'var(--radius-sm)',
                          cursor: selectedRequestIds.length > 0 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        Delete Request ({selectedRequestIds.length})
                      </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '12px',
                          textAlign: 'left',
                        }}
                      >
                        <thead>
                          <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '6px 8px', width: '30px', textAlign: 'center' }}>[✓]</th>
                            <th style={{ padding: '6px 8px' }}>Default Shift</th>
                            <th style={{ padding: '6px 8px' }}>Changed Shift / Time</th>
                            <th style={{ padding: '6px 8px' }}>Reason</th>
                            <th style={{ padding: '6px 8px' }}>Approver</th>
                            <th style={{ padding: '6px 8px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentChangeRequests.length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No results found
                              </td>
                            </tr>
                          ) : (
                            currentChangeRequests.map((req) => {
                              const isChecked = selectedRequestIds.includes(req.id);
                              return (
                                <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleRequestCheckbox(req.id)}
                                      style={{ cursor: 'pointer' }}
                                    />
                                  </td>
                                  <td style={{ padding: '6px 8px' }}>{req.defaultShift}</td>
                                  <td style={{ padding: '6px 8px', fontWeight: 600 }}>{req.requestedShiftTime}</td>
                                  <td style={{ padding: '6px 8px' }}>{req.reason}</td>
                                  <td style={{ padding: '6px 8px' }}>{req.approverName}</td>
                                  <td style={{ padding: '6px 8px' }}>
                                    <span
                                      style={{
                                        padding: '2px 6px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        backgroundColor:
                                          req.status === 'Approved'
                                            ? '#E8F5E9'
                                            : req.status === 'Rejected'
                                            ? '#FFEBEE'
                                            : '#FFF8E1',
                                        color:
                                          req.status === 'Approved'
                                            ? '#2E7D32'
                                            : req.status === 'Rejected'
                                            ? '#C62828'
                                            : '#F57F17',
                                      }}
                                    >
                                      {req.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (~38% width): Add Working Schedule */}
            <div style={{ flex: '1 1 38%' }}>
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-surface)',
                  overflow: 'hidden',
                }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setAddScheduleCardOpen(!addScheduleCardOpen)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setAddScheduleCardOpen(!addScheduleCardOpen);
                    }
                  }}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-primary-soft-bg)',
                    color: 'var(--color-primary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                  }}
                >
                  <span>Add Working Schedule</span>
                  {addScheduleCardOpen ? <Minus size={16} /> : <Plus size={16} />}
                </div>

                {addScheduleCardOpen && (
                  <form onSubmit={handleSaveAddSchedule} style={{ padding: '16px' }}>
                    {formError && (
                      <div
                        style={{
                          backgroundColor: 'var(--color-primary-soft-bg)',
                          color: 'var(--color-primary)',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          marginBottom: '12px',
                          border: '1px solid var(--color-primary)',
                        }}
                      >
                        {formError}
                      </div>
                    )}

                    {/* 1. Shift Dropdown */}
                    <div style={{ marginBottom: '12px' }}>
                      <label
                        htmlFor="add-schedule-shift"
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                        }}
                      >
                        Shift
                      </label>
                      <select
                        id="add-schedule-shift"
                        value={selectedShiftId}
                        onChange={(e) => setSelectedShiftId(e.target.value)}
                        style={{
                          width: '100%',
                          height: '32px',
                          padding: '0 8px',
                          fontSize: '12px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                        }}
                      >
                        <option value="">Select shift</option>
                        {MOCK_SHIFTS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code} - {s.name} ({s.startTime} - {s.endTime})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Store Dropdown */}
                    <div style={{ marginBottom: '12px' }}>
                      <label
                        htmlFor="add-schedule-store"
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: '4px',
                        }}
                      >
                        Store
                      </label>
                      <select
                        id="add-schedule-store"
                        value={selectedStoreId}
                        onChange={(e) => setSelectedStoreId(e.target.value)}
                        style={{
                          width: '100%',
                          height: '32px',
                          padding: '0 8px',
                          fontSize: '12px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-surface)',
                        }}
                      >
                        <option value="">Select store</option>
                        {MOCK_STORES.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. Stage Store Button (ChevronDown) */}
                    <div style={{ marginBottom: '16px' }}>
                      <button
                        type="button"
                        onClick={handleStageStore}
                        style={{
                          width: '100%',
                          height: '32px',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-canvas)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <ChevronDown size={16} />
                        <span>Stage Store</span>
                      </button>
                    </div>

                    {/* 4. Staged Stores Table */}
                    <div style={{ marginBottom: '16px' }}>
                      <div
                        style={{
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                        }}
                      >
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead style={{ backgroundColor: 'var(--bg-canvas)' }}>
                            <tr>
                              <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>Store Name</th>
                              <th style={{ padding: '6px 8px', width: '30px', textAlign: 'center' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {stagedStores.length === 0 ? (
                              <tr>
                                <td colSpan={2} style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                  No results found
                                </td>
                              </tr>
                            ) : (
                              stagedStores.map((st) => (
                                <tr key={st.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '6px 8px' }}>{st.name}</td>
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveStagedStore(st.id)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-primary)',
                                        cursor: 'pointer',
                                        padding: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <X size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 5. Save Button */}
                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        height: '36px',
                        backgroundColor: 'var(--color-success-accent)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'var(--bg-canvas)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 16px',
              fontSize: '13px',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
