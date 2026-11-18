import React from 'react';
import { useI18n } from '@/context/I18nContext';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: '34px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-sm, 4px)',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      {/* VI Segment */}
      <button
        type="button"
        onClick={() => setLocale('vi')}
        style={{
          height: '100%',
          padding: '0 12px',
          border: 'none',
          backgroundColor: locale === 'vi' ? 'var(--color-primary)' : 'var(--bg-surface)',
          color: locale === 'vi' ? '#FFFFFF' : 'var(--text-primary)',
          fontWeight: locale === 'vi' ? 600 : 500,
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
      >
        VI
      </button>

      {/* EN Segment */}
      <button
        type="button"
        onClick={() => setLocale('en')}
        style={{
          height: '100%',
          padding: '0 12px',
          border: 'none',
          borderLeft: '1px solid var(--border-color)',
          backgroundColor: locale === 'en' ? 'var(--color-primary)' : 'var(--bg-surface)',
          color: locale === 'en' ? '#FFFFFF' : 'var(--text-primary)',
          fontWeight: locale === 'en' ? 600 : 500,
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
      >
        EN
      </button>
    </div>
  );
};
export default LanguageSwitcher;
