import React from 'react';
import { useI18n } from '@/context/I18nContext';

export const NotificationPage: React.FC = () => {
  const { t } = useI18n();
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
        {t('nav.notification', 'Notification')}
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
        {t('nav.notification', 'Notification')}
      </p>
    </div>
  );
};

export default NotificationPage;
