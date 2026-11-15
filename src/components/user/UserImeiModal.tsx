import React from 'react';
import { X, Smartphone } from 'lucide-react';
import { User } from '@/types/user';

interface UserImeiModalProps {
  isOpen: boolean;
  users: User[];
  onClose: () => void;
}

export const UserImeiModal: React.FC<UserImeiModalProps> = ({ isOpen, users, onClose }) => {
  if (!isOpen) return null;

  // Filter active PG-Inline employees for device assignment summary
  const fieldUsers = users.filter((u) => u.currentPosition === 'PG-Inline' && u.accountStatus === 'Active');

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
          maxWidth: '700px',
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
            backgroundColor: 'var(--color-secondary-accent)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
            <Smartphone size={18} />
            <span>I_imei - Device & IMEI Assignment Summary</span>
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
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Summary of registered handheld and mobile devices assigned to active field staff (PG-Inline).
          </p>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12px',
              textAlign: 'left',
              border: '1px solid var(--border-color)',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-canvas)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '8px 12px' }}>No.</th>
                <th style={{ padding: '8px 12px' }}>Employee Code</th>
                <th style={{ padding: '8px 12px' }}>Full Name</th>
                <th style={{ padding: '8px 12px' }}>Work Province</th>
                <th style={{ padding: '8px 12px' }}>Assigned IMEI / Device ID</th>
                <th style={{ padding: '8px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {fieldUsers.map((u, i) => {
                const simulatedImei = `86542104${u.identityNumber.slice(-7)}`;
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px 12px' }}>{i + 1}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {u.employeeCode}
                    </td>
                    <td style={{ padding: '8px 12px' }}>{u.fullName}</td>
                    <td style={{ padding: '8px 12px' }}>{u.workProvince}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{simulatedImei}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span
                        style={{
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-primary-soft-bg)',
                          color: 'var(--color-primary)',
                          fontSize: '11px',
                          fontWeight: 500,
                        }}
                      >
                        Bound
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
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
