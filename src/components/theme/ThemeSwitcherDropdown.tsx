import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useI18n } from '@/context/I18nContext';

export const ThemeSwitcherDropdown: React.FC = () => {
  const { activeThemeKey, setTheme, presets } = useTheme();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const standardPresets = presets.filter((p) => p.group === 'Standard');
  const darkAccentPresets = presets.filter((p) => p.group === 'Dark Accent');

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* 34px x 34px square button with Palette icon */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={t('theme.title', 'Theme Palette')}
        style={{
          width: '34px',
          height: '34px',
          borderRadius: 'var(--radius-sm, 4px)',
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 3px var(--color-primary-soft-bg)' : 'none',
          transition: 'all 0.15s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-primary)';
        }}
      >
        <Palette size={18} />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '6px',
            minWidth: '200px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md, 6px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            zIndex: 70,
            padding: '6px 0',
            overflow: 'hidden',
          }}
        >
          {/* Section: Standard */}
          <div
            style={{
              padding: '6px 14px 4px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-secondary)',
            }}
          >
            {t('theme.standard', 'Standard')}
          </div>
          {standardPresets.map((preset) => {
            const isActive = preset.key === activeThemeKey;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  setTheme(preset.key);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 14px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-primary-soft-bg)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-canvas)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: preset.primary,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span>{preset.label}</span>
                </div>
                {isActive && <Check size={15} color="var(--color-primary)" />}
              </button>
            );
          })}

          <div
            style={{
              height: '1px',
              backgroundColor: 'var(--border-color)',
              margin: '6px 0',
            }}
          />

          {/* Section: Dark Accent */}
          <div
            style={{
              padding: '6px 14px 4px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: 'var(--text-secondary)',
            }}
          >
            {t('theme.dark_accent', 'Dark Accent')}
          </div>
          {darkAccentPresets.map((preset) => {
            const isActive = preset.key === activeThemeKey;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  setTheme(preset.key);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 14px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-primary-soft-bg)' : 'transparent',
                  color: isActive ? 'var(--color-primary)' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-canvas)';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: preset.primary,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span>{preset.label}</span>
                </div>
                {isActive && <Check size={15} color="var(--color-primary)" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ThemeSwitcherDropdown;
