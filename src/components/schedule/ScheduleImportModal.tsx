import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { DailyScheduleRecord, AssignedShiftItem } from '@/types/shift';
import { MOCK_SHIFTS, MOCK_STORES } from '@/mocks/shiftMockData';
import { User } from '@/types/user';

interface ScheduleImportModalProps {
  isOpen: boolean;
  employees: User[];
  onClose: () => void;
  onImportSchedules: (importedRecords: DailyScheduleRecord[]) => void;
}

export const ScheduleImportModal: React.FC<ScheduleImportModalProps> = ({
  isOpen,
  employees,
  onClose,
  onImportSchedules,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<DailyScheduleRecord[]>([]);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid .csv file.');
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          setError('CSV file must contain a header row and at least one data row.');
          return;
        }

        const dataRows = lines.slice(1);
        const map = new Map<string, DailyScheduleRecord>();

        dataRows.forEach((row, idx) => {
          const cols = row.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          const [employeeCode, date, shiftCode = 'MS', storeCode = 'STR001'] = cols;

          const matchedEmp = employees.find((emp) => emp.employeeCode === employeeCode);
          if (!matchedEmp || !date) return;

          const key = `${matchedEmp.id}_${date}`;
          const shiftDef = MOCK_SHIFTS.find((s) => s.code === shiftCode) || MOCK_SHIFTS[0];
          const storeDef = MOCK_STORES.find((st) => st.code === storeCode) || MOCK_STORES[0];

          const shiftItem: AssignedShiftItem = {
            id: `as-import-${Date.now()}-${idx}`,
            shiftId: shiftDef.id,
            shiftCode: shiftDef.code,
            shiftName: shiftDef.name,
            storeId: storeDef.id,
            storeName: storeDef.name,
            checkInStatus: 'Not Checked In',
            colorToken: shiftDef.colorToken,
          };

          if (!map.has(key)) {
            map.set(key, {
              userId: matchedEmp.id,
              date,
              assignedShifts: [shiftItem],
              changeRequests: [],
            });
          } else {
            map.get(key)!.assignedShifts.push(shiftItem);
          }
        });

        const list = Array.from(map.values());
        if (list.length === 0) {
          setError('No valid schedule rows found matching existing employee codes.');
        } else {
          setParsedRecords(list);
        }
      } catch {
        setError('Error reading or parsing schedule CSV file.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleConfirmImport = () => {
    if (parsedRecords.length > 0) {
      onImportSchedules(parsedRecords);
      onClose();
    }
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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '85vh',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
            <Upload size={18} />
            <span>Import Schedule File (.csv)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          <div
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-canvas)',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            <input
              type="file"
              accept=".csv"
              id="import-schedule-csv-file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="import-schedule-csv-file" style={{ cursor: 'pointer', display: 'block' }}>
              <FileText size={36} style={{ color: 'var(--color-primary)', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {file ? file.name : 'Click to select schedule .csv file'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Format: Employee Code, Date (YYYY-MM-DD), Shift Code, Store Code
              </div>
            </label>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'var(--color-primary-soft-bg)',
                color: 'var(--color-primary)',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          {parsedRecords.length > 0 && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-success-accent)',
                  marginBottom: '8px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Parsed {parsedRecords.length} daily schedule records successfully:</span>
              </div>
              <div
                style={{
                  maxHeight: '180px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: 'var(--bg-canvas)' }}>
                    <tr>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Employee</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Shifts Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRecords.map((r, i) => {
                      const emp = employees.find((e) => e.id === r.userId);
                      return (
                        <tr key={i} style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>{r.date}</td>
                          <td style={{ padding: '6px 8px' }}>
                            {emp ? `${emp.employeeCode} - ${emp.fullName}` : r.userId}
                          </td>
                          <td style={{ padding: '6px 8px' }}>{r.assignedShifts.length} shift(s)</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
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
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRecords.length === 0}
            onClick={handleConfirmImport}
            style={{
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: parsedRecords.length > 0 ? 'var(--color-primary)' : 'var(--border-color)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: parsedRecords.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Confirm Import ({parsedRecords.length})
          </button>
        </div>
      </div>
    </div>
  );
};
