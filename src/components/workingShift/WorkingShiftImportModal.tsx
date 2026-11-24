import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { WorkingShiftRecord } from '@/types/workingShift';
import { parseShiftImportXlsx } from '@/utils/excel';
import { useI18n } from '@/context/I18nContext';

interface WorkingShiftImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportShifts: (shifts: WorkingShiftRecord[]) => void;
}

export const WorkingShiftImportModal: React.FC<WorkingShiftImportModalProps> = ({
  isOpen,
  onClose,
  onImportShifts,
}) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<WorkingShiftRecord[]>([]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setLoading(true);

    try {
      const records = await parseShiftImportXlsx(selected);
      if (records.length === 0) {
        setError(t('shift.import_empty_error', 'No valid working shift records found in file!'));
        setParsedRows([]);
      } else {
        setParsedRows(records);
      }
    } catch (err: any) {
      setError(err.message || 'Error parsing Excel file. Please verify TemplateShiftList.xlsx format.');
      setParsedRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    onImportShifts(parsedRows);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setParsedRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
          maxWidth: '750px',
          maxHeight: '90vh',
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
            <FileSpreadsheet size={18} />
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
              {t('shift.import_modal_title', 'Import Working Shifts from Excel')}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
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

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
          {/* File Picker Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: file ? 'var(--color-primary-soft-bg)' : 'var(--bg-canvas)',
              transition: 'all 0.2s ease',
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
            />
            <div style={{ color: 'var(--color-primary)', marginBottom: '8px' }}>
              <Upload size={32} />
            </div>
            {file ? (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{file.name}</span>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {t('shift.drop_or_select_file', 'Click to select Excel file (.xlsx)')}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  {t('shift.support_template_notice', 'Please use TemplateShiftList.xlsx downloaded from system')}
                </p>
              </div>
            )}
          </div>

          {/* Feedback & Stats */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Parsing Excel workbook...
            </div>
          )}

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: 'var(--color-primary-soft-bg)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>Failed to process file</p>
                <p style={{ margin: '2px 0 0 0' }}>{error}</p>
              </div>
            </div>
          )}

          {parsedRows.length > 0 && !loading && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-success-accent)', fontWeight: 600, marginBottom: '8px' }}>
                <CheckCircle size={16} />
                <span>
                  {t('shift.parsed_success_count', `Successfully parsed ${parsedRows.length} shift rows`).replace('{count}', String(parsedRows.length))}
                </span>
              </div>

              {/* Preview Table */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflowX: 'auto', maxHeight: '180px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                  <thead style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)', color: 'var(--color-primary)', fontWeight: 700 }}>
                    <tr>
                      <th style={{ padding: '6px 8px' }}>Group</th>
                      <th style={{ padding: '6px 8px' }}>Shift Code</th>
                      <th style={{ padding: '6px 8px' }}>Shift Name</th>
                      <th style={{ padding: '6px 8px' }}>From - To</th>
                      <th style={{ padding: '6px 8px' }}>Ref Code</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>OT</th>
                      <th style={{ padding: '6px 8px', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{row.shiftGroup}</td>
                        <td style={{ padding: '6px 8px' }}>{row.shiftCode}</td>
                        <td style={{ padding: '6px 8px' }}>{row.shiftName}</td>
                        <td style={{ padding: '6px 8px' }}>{row.fromTime} - {row.toTime}</td>
                        <td style={{ padding: '6px 8px' }}>{row.refCode}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center' }}>{row.isOt ? 'Yes' : 'No'}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'center', color: row.isActive ? 'var(--color-success-accent)' : 'var(--text-secondary)' }}>
                          {row.isActive ? 'Active' : 'Inactive'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center', margin: '6px 0 0 0', fontStyle: 'italic' }}>
                  + {parsedRows.length - 10} more rows...
                </p>
              )}
            </div>
          )}
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
            onClick={() => {
              handleReset();
              onClose();
            }}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
            }}
          >
            {t('action.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0 || loading}
            style={{
              padding: '8px 24px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: 'var(--color-success-accent)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: parsedRows.length === 0 || loading ? 'not-allowed' : 'pointer',
              opacity: parsedRows.length === 0 || loading ? 0.6 : 1,
            }}
          >
            {t('shift.confirm_import', 'Confirm Import')}
          </button>
        </div>
      </div>
    </div>
  );
};
