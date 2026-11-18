import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ACTIVE_BRAND_CONFIG } from '@/config/brandConfig';
import { ThemeSwitcherDropdown } from '@/components/theme/ThemeSwitcherDropdown';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useI18n();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoFailed, setLogoFailed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const result = login(username, password);
    if (result.success) {
      navigate('/dashboard/summary', { replace: true });
    } else {
      setErrorMessage(result.error || t('login.error_invalid', 'Invalid username or password.'));
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-canvas)',
        padding: '16px',
        position: 'relative',
      }}
    >
      {/* Top Right Controls for Theme and Language */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <ThemeSwitcherDropdown />
        <LanguageSwitcher />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          borderTop: '4px solid var(--color-primary)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          borderLeft: '1px solid var(--border-color)',
          borderRight: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          padding: '32px 24px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          {ACTIVE_BRAND_CONFIG.logoUrl && !logoFailed ? (
            <img
              src={ACTIVE_BRAND_CONFIG.logoUrl}
              alt={ACTIVE_BRAND_CONFIG.appName}
              onError={() => setLogoFailed(true)}
              style={{
                height: '48px',
                maxWidth: '180px',
                objectFit: 'contain',
                margin: '0 auto 12px',
                display: 'block',
              }}
            />
          ) : (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary-soft-bg)',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: '20px',
                marginBottom: '12px',
              }}
            >
              {ACTIVE_BRAND_CONFIG.appName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              margin: '0 0 4px',
            }}
          >
            {ACTIVE_BRAND_CONFIG.appName}
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: 0,
            }}
          >
            {t('brand.subtitle', ACTIVE_BRAND_CONFIG.subtitle)}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: 'var(--color-primary-soft-bg)',
              color: 'var(--color-primary)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              marginBottom: '16px',
              border: '1px solid var(--color-primary)',
            }}
          >
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="login-username"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              {t('login.username', 'Username')}
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="login-username"
                type="text"
                required
                placeholder={t('login.username', 'Enter username')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '36px',
                  paddingRight: '12px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}
            >
              {t('login.password', 'Password')}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)',
                  pointerEvents: 'none',
                }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder={t('login.password', 'Enter password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  paddingLeft: '36px',
                  paddingRight: '36px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            style={{
              height: '40px',
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              marginTop: '8px',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
          >
            {t('login.button', 'Sign In')}
          </button>
        </form>

        {/* Quick Fill Demo Helper per SPEC-02 Section 3 */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Quick Fill Demo Accounts:
          </span>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', '123456')}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                backgroundColor: 'var(--color-primary-soft-bg)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              Admin: admin / 123456
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('sup01', '123456')}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                backgroundColor: 'var(--color-primary-soft-bg)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              Supervisor: sup01 / 123456
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('namlh', '123456')}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                backgroundColor: 'var(--color-primary-soft-bg)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              Employee: namlh / 123456
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
