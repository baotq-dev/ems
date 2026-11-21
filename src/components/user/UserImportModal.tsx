import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { User, Region, UserPosition, EmploymentStatus } from '@/types/user';
import { useI18n } from '@/context/I18nContext';

interface UserImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportUsers: (newUsers: User[]) => void;
}

export const UserImportModal: React.FC<UserImportModalProps> = ({
  isOpen,
  onClose,
  onImportUsers,
}) => {
  const { t } = useI18n();
  const [file, setFile] = useState<File | null>(null);
  const [parsedUsers, setParsedUsers] = useState<User[]>([]);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError(t('user.import_csv_error', 'Please select a valid .csv file.'));
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
        if (lines.length < 2) {
          setError(t('user.import_min_rows', 'CSV file must contain a header row and at least one data row.'));
          return;
        }

        const dataRows = lines.slice(1);
        const imported: User[] = dataRows.map((row, index) => {
          const cols = row.split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          const [
            employeeCode,
            lastName = '',
            firstName = '',
            username = '',
            phoneNumber = '',
            region = 'North',
            workProvince = '',
            newWorkProvince = '',
            position = 'PG-Inline',
            supervisorId = '',
            identityNumber = '',
            employmentStatus = 'Official',
            joinDate = new Date().toISOString().split('T')[0],
          ] = cols;

          const id = `usr-import-${Date.now()}-${index}`;
          const fullName = `${lastName} ${firstName}`.trim();

          return {
            id,
            employeeCode: employeeCode || `FD${Math.floor(100 + Math.random() * 900)}`,
            lastName,
            firstName,
            fullName: fullName || 'New User',
            username: username || `user${index}`,
            password: '123456',
            phoneNumber: phoneNumber || '0900000000',
            region: (region as Region) || 'North',
            workProvince: workProvince || 'Ha Noi',
            newWorkProvince: newWorkProvince || '',
            currentPosition: (position as UserPosition) || 'PG-Inline',
            currentSupervisorId: supervisorId || undefined,
            identityDocType: 'CCCD',
            identityNumber: identityNumber || `001${Date.now()}${index}`.slice(0, 12),
            accountStatus: 'Active',
            employmentStatus: (employmentStatus as EmploymentStatus) || 'Official',
            joinDate: joinDate || new Date().toISOString().split('T')[0],
            positionHistory: [
              {
                id: `ph-${id}`,
                position: (position as UserPosition) || 'PG-Inline',
                fromDate: joinDate || new Date().toISOString().split('T')[0],
              },
            ],
            supervisorHistory: [],
            statusHistory: [
              {
                id: `sh-${id}`,
                status: (employmentStatus as EmploymentStatus) || 'Official',
                fromDate: joinDate || new Date().toISOString().split('T')[0],
              },
            ],
          };
        });

        setParsedUsers(imported);
      } catch {
        setError(t('user.import_read_error', 'Error reading or parsing CSV file.'));
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleConfirmImport = () => {
    if (parsedUsers.length > 0) {
      onImportUsers(parsedUsers);
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
            <span>{t('user.import_title', 'Import User File (.csv)')}</span>
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
              id="import-csv-file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="import-csv-file" style={{ cursor: 'pointer', display: 'block' }}>
              <FileText size={36} style={{ color: 'var(--color-primary)', margin: '0 auto 8px' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {file ? file.name : t('user.import_drop_placeholder', 'Click to select or drop .csv file here')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('user.import_conforming', 'Conforming to template format (.csv)')}
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

          {parsedUsers.length > 0 && (
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
                <span>{t('user.import_success_parsed', 'Parsed records successfully:')} ({parsedUsers.length})</span>
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
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.employee_code', 'Code')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.full_name', 'Name')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.position', 'Position')}</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>{t('field.phone', 'Phone')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedUsers.map((u) => (
                      <tr key={u.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 600 }}>{u.employeeCode}</td>
                        <td style={{ padding: '6px 8px' }}>{u.fullName}</td>
                        <td style={{ padding: '6px 8px' }}>{u.currentPosition}</td>
                        <td style={{ padding: '6px 8px' }}>{u.phoneNumber}</td>
                      </tr>
                    ))}
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
            {t('action.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            disabled={parsedUsers.length === 0}
            onClick={handleConfirmImport}
            style={{
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: parsedUsers.length > 0 ? 'var(--color-primary)' : 'var(--border-color)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: parsedUsers.length > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            {t('user.confirm_import_btn', 'Confirm Import')} ({parsedUsers.length})
          </button>
        </div>
      </div>
    </div>
  );
};
