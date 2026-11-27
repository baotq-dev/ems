import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  SlidersHorizontal,
  CalendarDays,
  FileBarChart,
  Settings,
  Home,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { ACTIVE_BRAND_CONFIG } from '@/config/brandConfig';
import { NAVIGATION_MENU } from '@/config/navigation';
import { NavMenuItem } from '@/types/navigation';
import { ThemeSwitcherDropdown } from '@/components/theme/ThemeSwitcherDropdown';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  SlidersHorizontal,
  CalendarDays,
  FolderBarChart: FileBarChart,
  FileBarChart,
  Settings,
  Wrench,
};

const NAV_TRANSLATION_MAP: Record<string, string> = {
  dashboard: 'nav.dashboard',
  'dashboard-summary': 'nav.dashboard_summary',
  'attendant-summary': 'nav.attendant_summary',
  'inventory-summary': 'nav.inventory_summary',
  'out-of-stock-summary': 'nav.out_of_stock_summary',
  'operation-config': 'nav.operation_config',
  'user-list': 'nav.user_list',
  'exam-list': 'nav.exam_list',
  planning: 'nav.planning',
  'work-schedule': 'nav.work_schedule',
  tools: 'nav.tools',
  'working-shift': 'nav.working_shift',
  category: 'nav.category',
  product: 'nav.product',
  store: 'nav.store',
  report: 'nav.report',
  attendant: 'nav.attendant',
  timesheet: 'nav.timesheet',
  'exam-result': 'nav.exam_result',
  'sell-out-pa': 'nav.sell_out_pa',
  system: 'nav.system',
  notification: 'nav.notification',
};

export const MainLayout: React.FC = () => {
  const { session, logout, switchRole } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMenuKey(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine current active parent and sub-menu from URL
  let currentParent: NavMenuItem | undefined;
  let currentSubItem: { key: string; label: string; path: string } | undefined;

  for (const parent of NAVIGATION_MENU) {
    const sub = parent.children.find((c) => location.pathname.startsWith(c.path));
    if (sub) {
      currentParent = parent;
      currentSubItem = sub;
      break;
    }
  }

  const handleSubNavigate = (path: string) => {
    navigate(path);
    setActiveMenuKey(null);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getLabel = (key: string, fallback: string) => {
    const transKey = NAV_TRANSLATION_MAP[key];
    return transKey ? t(transKey, fallback) : fallback;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Zone 1: Top Navigation Header (56px) */}
      <header
        style={{
          height: 'var(--header-height)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--bg-header-gradient)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        {/* Left: Brand Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link
            to="/dashboard/summary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            {ACTIVE_BRAND_CONFIG.logoUrl && !logoFailed ? (
              <img
                src={ACTIVE_BRAND_CONFIG.logoUrl}
                alt={ACTIVE_BRAND_CONFIG.appName}
                onError={() => setLogoFailed(true)}
                style={{ height: '32px', maxWidth: '120px', objectFit: 'contain' }}
              />
            ) : (
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {ACTIVE_BRAND_CONFIG.appName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span
              style={{
                fontWeight: 700,
                fontSize: '16px',
                color: 'var(--color-primary)',
                letterSpacing: '-0.3px',
              }}
            >
              {ACTIVE_BRAND_CONFIG.appName}
            </span>
          </Link>

          {/* Desktop Center Navigation Menus */}
          <nav
            ref={navRef}
            className="hidden lg:flex"
            style={{ alignItems: 'center', gap: '4px' }}
          >
            {NAVIGATION_MENU.map((item) => {
              const IconComp = ICON_MAP[item.icon] || SlidersHorizontal;
              const isParentActive = currentParent?.key === item.key;
              const isMenuOpen = activeMenuKey === item.key;

              return (
                <div key={item.key} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setActiveMenuKey(isMenuOpen ? null : item.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: isParentActive || isMenuOpen ? 'var(--color-primary-soft-bg)' : 'transparent',
                      color: isParentActive || isMenuOpen ? 'var(--color-primary)' : 'var(--text-primary)',
                      fontWeight: isParentActive ? 600 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <IconComp size={16} />
                    <span>{getLabel(item.key, item.label)}</span>
                    <ChevronDown size={14} style={{ opacity: 0.7 }} />
                  </button>

                  {/* Dropdown Menu */}
                  {isMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        marginTop: '4px',
                        minWidth: '200px',
                        backgroundColor: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                        border: '1px solid var(--border-color)',
                        padding: '4px 0',
                        zIndex: 60,
                      }}
                    >
                      {item.children.map((child) => {
                        const isSubActive = location.pathname.startsWith(child.path);
                        return (
                          <button
                            key={child.key}
                            type="button"
                            onClick={() => handleSubNavigate(child.path)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 16px',
                              fontSize: '13px',
                              border: 'none',
                              backgroundColor: isSubActive ? 'var(--color-primary-soft-bg)' : 'transparent',
                              color: isSubActive ? 'var(--color-primary)' : 'var(--text-primary)',
                              fontWeight: isSubActive ? 600 : 400,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                            onMouseOver={(e) => {
                              if (!isSubActive) e.currentTarget.style.backgroundColor = 'var(--bg-canvas)';
                            }}
                            onMouseOut={(e) => {
                              if (!isSubActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <span>{getLabel(child.key, child.label)}</span>
                            {isSubActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>


        {/* Right Section: User Avatar, Theme Switcher, Language Switcher, & Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

          {/* Theme Switcher Button */}
          <ThemeSwitcherDropdown />

          {/* Language Switcher (VI / EN Segmented Toggle) */}
          <LanguageSwitcher />

          {/* User Session Dropdown */}
          <div ref={userMenuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-soft-bg)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UserIcon size={14} />
              </div>
              <span>{session?.role || 'Admin'}</span>
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </button>

            {userDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '4px',
                  width: '220px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  border: '1px solid var(--border-color)',
                  padding: '8px 0',
                  zIndex: 60,
                }}
              >
                <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
                    {session?.fullName || 'System User'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    @{session?.username || 'user'} • {session?.role || 'User'}
                  </div>
                </div>

                {/* Role Switcher */}
                {switchRole && (
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t('header.switch_role', 'Switch Role Context:')}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {(['Admin', 'Supervisor', 'Employee'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            switchRole(r);
                            setUserDropdownOpen(false);
                          }}
                          style={{
                            flex: 1,
                            fontSize: '11px',
                            padding: '3px 4px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: session?.role === r ? 'var(--color-primary)' : 'var(--bg-canvas)',
                            color: session?.role === r ? '#FFFFFF' : 'var(--text-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 16px',
                    fontSize: '13px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-soft-bg)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut size={14} />
                  <span>{t('header.sign_out', 'Sign Out')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="lg:hidden flex"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden block"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-color)',
            padding: '8px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          {NAVIGATION_MENU.map((item) => (
            <div key={item.key} style={{ marginBottom: '8px' }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-primary)',
                  padding: '4px 0',
                }}
              >
                {getLabel(item.key, item.label)}
              </div>
              <div style={{ paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {item.children.map((child) => (
                  <button
                    key={child.key}
                    type="button"
                    onClick={() => handleSubNavigate(child.path)}
                    style={{
                      textAlign: 'left',
                      padding: '6px 8px',
                      fontSize: '13px',
                      border: 'none',
                      backgroundColor: location.pathname.startsWith(child.path)
                        ? 'var(--color-primary-soft-bg)'
                        : 'transparent',
                      color: location.pathname.startsWith(child.path)
                        ? 'var(--color-primary)'
                        : 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    {getLabel(child.key, child.label)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone 2: Breadcrumb Bar (40px) */}
      <div
        style={{
          height: 'var(--breadcrumb-height)',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
        }}
      >
        <Link
          to="/dashboard/summary"
          title="Home"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-primary)',
            textDecoration: 'none',
          }}
        >
          <Home size={15} />
        </Link>

        {currentParent && (
          <>
            <ChevronRight size={13} style={{ opacity: 0.5 }} />
            <span>{getLabel(currentParent.key, currentParent.label)}</span>
          </>
        )}

        {currentSubItem && (
          <>
            <ChevronRight size={13} style={{ opacity: 0.5 }} />
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              {getLabel(currentSubItem.key, currentSubItem.label)}
            </span>
          </>
        )}
      </div>

      {/* Zone 3: Main Canvas (Fluid Container with 16px padding) */}
      <main
        style={{
          flex: 1,
          padding: '16px',
          backgroundColor: 'var(--bg-canvas)',
          boxSizing: 'border-box',
        }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
