import React from 'react';

export const DashboardSummaryPage: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm)',
        padding: '24px',
      }}
    >
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 8px' }}>
        Dashboard Summary Module
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
        Dashboard Summary module placeholder.
      </p>
    </div>
  );
};

export default DashboardSummaryPage;
