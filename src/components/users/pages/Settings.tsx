import React, { useEffect, useMemo, useState } from 'react';
import { IonPage, IonContent, IonToast, IonLoading } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { useHistory } from 'react-router-dom';
import NavbarSidebar from '../pages/Navbar';

// =======================
// Config
// =======================
const API_BASE = 'https://be.shuttleapp.transev.site';

// =======================
// Types
// =======================
interface Device {
  session_id: string;
  device_name: string | null;
  device_family: string | null;
  platform: string | null;
  browser: string | null;
  ip_address: string | null;
  created_at: string;
  last_used_at: string | null;
  expires_at: string;
  logged_in_for_seconds: number;
  is_current_session: boolean;
}

interface SettingsMenuItem {
  id:
    | 'account'
    | 'devices'
    | 'notifications'
    | 'privacy'
    | 'language'
    | 'appearance'
    | 'faq'
    | 'privacy-policy'
    | 'terms'
    | 'logout';
  title: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  danger?: boolean;
  gradient?: string;
}

// =======================
// Helpers
// =======================
const getToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'access_token' });
    return value || null;
  } catch (e) {
    console.error('Error getting token:', e);
    return null;
  }
};

const clearAuth = async () => {
  await Preferences.remove({ key: 'access_token' });
  await Preferences.remove({ key: 'refresh_token' });
  sessionStorage.clear();
  localStorage.removeItem('persist:root');
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDuration = (seconds: number): string => {
  if (!seconds && seconds !== 0) return 'N/A';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const getDeviceEmoji = (d: Device) => {
  const b = (d.browser || '').toLowerCase();
  const p = (d.platform || '').toLowerCase();
  if (p.includes('android') || p.includes('ios') || b.includes('mobile')) return '📱';
  if (b.includes('chrome')) return '🌐';
  if (b.includes('firefox')) return '🦊';
  if (b.includes('safari')) return '🧭';
  if (b.includes('edge')) return '🪟';
  return '💻';
};

// =======================
// Component
// =======================
const Settings: React.FC = () => {
  const history = useHistory();

  // Theme + Locale
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'bn' | 'ta' | 'te'>('en');
  const [scrolled, setScrolled] = useState(false);

  // UI Modals
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Toast + Loading
  const [toast, setToast] = useState<{ show: boolean; message: string; color: 'success' | 'danger' | 'warning' | 'medium' }>({
    show: false,
    message: '',
    color: 'success',
  });
  const [loading, setLoading] = useState(false);

  // Devices
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Logout state
  const [loggingOut, setLoggingOut] = useState(false);

  // FAQs
  const faqs = useMemo(
    () => [
      {
        id: 1,
        q: 'How do I start receiving ride requests?',
        a: "Go online from the home screen's status toggle. You'll start receiving pings when you're within coverage areas.",
      },
      {
        id: 2,
        q: 'How do I track my earnings?',
        a: "Visit the Earnings tab to see today's rides, weekly summary, and pending payouts.",
      },
      {
        id: 3,
        q: 'Can I cancel a ride?',
        a: 'Yes, within the safety and cancellation policy. Tap the active ride card and select Cancel with a reason.',
      },
      {
        id: 4,
        q: 'How do I contact support?',
        a: 'Email support@shuttleapp.com or call +91 1234567890 from 9am–9pm IST, Mon–Sat.',
      },
      {
        id: 5,
        q: 'Is my data secure?',
        a: 'We use encryption in transit and at rest, with strict access controls and monitoring.',
      },
    ],
    []
  );

  // Languages
  const languages = useMemo(
    () => [
      { code: 'en' as const, name: 'English', flag: '🇬🇧', color: '#3B82F6' },
      { code: 'hi' as const, name: 'हिन्दी', flag: '🇮🇳', color: '#F59E0B' },
      { code: 'bn' as const, name: 'বাংলা', flag: '🇧🇩', color: '#10B981' },
      { code: 'ta' as const, name: 'தமிழ்', flag: '🇮🇳', color: '#EF4444' },
      { code: 'te' as const, name: 'తెలుగు', flag: '🇮🇳', color: '#8B5CF6' },
    ],
    []
  );

  // Menu with gradients
  const settingsMenu: SettingsMenuItem[] = [
    { id: 'account', title: 'Account Settings', icon: '👤', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { id: 'devices', title: 'Device Management', icon: '📱', badge: `${activeCount}/2 Active`, badgeColor: '#10B981', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
    { id: 'notifications', title: 'Notifications', icon: '🔔', badge: 'Coming soon', badgeColor: '#6B7280', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
    { id: 'privacy', title: 'Privacy & Security', icon: '🔒', badge: 'Recommended', badgeColor: '#F59E0B', gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' },
    { id: 'language', title: 'Language', icon: '🌐', badge: languages.find((l) => l.code === selectedLanguage)?.name || 'English', gradient: 'linear-gradient(135deg, #EC4899, #BE185D)' },
    { id: 'appearance', title: 'Appearance', icon: isDarkMode ? '🌙' : '☀️', badge: isDarkMode ? 'Dark' : 'Light', gradient: 'linear-gradient(135deg, #14B8A6, #0F766E)' },
    { id: 'faq', title: 'FAQs', icon: '❓', gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)' },
    { id: 'privacy-policy', title: 'Privacy Policy', icon: '📜', gradient: 'linear-gradient(135deg, #6366F1, #4F46E5)' },
    { id: 'terms', title: 'Terms & Conditions', icon: '⚖️', gradient: 'linear-gradient(135deg, #F97316, #EA580C)' },
    { id: 'logout', title: 'Logout', icon: '🚪', danger: true, gradient: 'linear-gradient(135deg, #EF4444, #DC2626)' },
  ];

  // Load preferences on mount
  useEffect(() => {
    const loadPrefs = async () => {
      const darkPref = await Preferences.get({ key: 'dark_mode' });
      const langPref = await Preferences.get({ key: 'language' });

      const isDark = darkPref.value ? darkPref.value === 'true' : true;
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);

      if (langPref.value && ['en', 'hi', 'bn', 'ta', 'te'].includes(langPref.value)) {
        setSelectedLanguage(langPref.value as any);
      }
    };
    loadPrefs();
  }, []);

  // Scroll listener for header effect
  useEffect(() => {
    const content = document.querySelector('ion-content');
    const handleScroll = (e: any) => {
      const scrollTop = e.detail?.scrollTop || window.scrollY;
      setScrolled(scrollTop > 50);
    };
    if (content) {
      content.addEventListener('ionScroll', handleScroll);
      return () => content.removeEventListener('ionScroll', handleScroll);
    }
  }, []);

  // Actions
  const showToast = (message: string, color: 'success' | 'danger' | 'warning' | 'medium' = 'success') => {
    setToast({ show: true, message, color });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
  };

  const toggleDarkMode = async () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    await Preferences.set({ key: 'dark_mode', value: String(next) });
    showToast(next ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️', 'success');
  };

  const changeLanguage = async (lang: 'en' | 'hi' | 'bn' | 'ta' | 'te') => {
    setSelectedLanguage(lang);
    await Preferences.set({ key: 'language', value: lang });
    showToast(`Language changed to ${languages.find((l) => l.code === lang)?.name || 'English'} ✨`, 'success');
    setShowLanguageModal(false);
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        await clearAuth();
        history.replace('/login');
        return;
      }
      const res = await fetch(`${API_BASE}/auth/devices`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.status === 401) {
        await clearAuth();
        history.replace('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to load devices');
      const data = await res.json();
      setDevices(Array.isArray(data.devices) ? data.devices : []);
      setActiveCount(typeof data.active_login_count === 'number' ? data.active_login_count : 0);
    } catch (e) {
      console.error(e);
      showToast('Could not load devices', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const removeDevice = async (device: Device) => {
    setRemovingId(device.session_id);
    try {
      const token = await getToken();
      if (!token) {
        await clearAuth();
        history.replace('/login');
        return;
      }

      const res = await fetch(`${API_BASE}/auth/devices/${device.session_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (res.status === 401) {
        await clearAuth();
        history.replace('/login');
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail?.message || 'Failed to remove device');
      }

      if (device.is_current_session) {
        await clearAuth();
        showToast('Logged out on this device', 'success');
        history.replace('/login');
      } else {
        setDevices((prev) => prev.filter((d) => d.session_id !== device.session_id));
        setActiveCount((c) => Math.max(0, c - 1));
        showToast('Device removed successfully ✓', 'success');
      }
    } catch (e: any) {
      showToast(e?.message || 'Failed to remove device', 'danger');
      await fetchDevices();
    } finally {
      setRemovingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      const token = await getToken();
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }).catch(() => null);
      }
      await clearAuth();
      showToast('Logged out successfully', 'success');
      history.replace('/login');
    } catch (e) {
      await clearAuth();
      history.replace('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleMenuClick = async (item: SettingsMenuItem) => {
    switch (item.id) {
      case 'account':
        // Navigate to Profile page
        history.push('/profile-setup');
        break;
      case 'devices':
        await fetchDevices();
        setShowDeviceModal(true);
        break;
      case 'language':
        setShowLanguageModal(true);
        break;
      case 'appearance':
        await toggleDarkMode();
        break;
      case 'faq':
        setShowFaqModal(true);
        break;
      case 'privacy-policy':
        setShowPrivacyModal(true);
        break;
      case 'terms':
        setShowTermsModal(true);
        break;
      case 'logout':
        await handleLogout();
        break;
      default:
        showToast(`${item.title} coming soon ✨`, 'medium');
    }
  };

  // =======================
  // Styles (modern & colorful)
  // =======================
  const styles = {
    page: {
      '--background': isDarkMode ? '#0B0D12' : '#F6F7FB',
    } as React.CSSProperties & { [key: string]: any },
    container: {
      minHeight: '100vh',
      paddingBottom: 24,
    },
    headerWrap: {
      position: 'sticky' as const,
      top: 56,
      zIndex: 100,
      background: isDarkMode
        ? scrolled
          ? 'rgba(16, 24, 38, 0.95)'
          : 'linear-gradient(180deg, #101826 0%, #0B0D12 100%)'
        : scrolled
        ? 'rgba(110, 168, 255, 0.95)'
        : 'linear-gradient(180deg, #6EA8FF 0%, #7B6CFF 100%)',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      padding: scrolled ? '16px 20px' : '28px 20px 40px 20px',
      transition: 'all 0.3s ease',
      boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
    },
    headerTitle: {
      fontSize: scrolled ? 22 : 28,
      fontWeight: 800,
      color: '#FFFFFF',
      margin: 0,
      letterSpacing: 0.2,
      transition: 'all 0.3s ease',
    },
    headerSub: {
      marginTop: 6,
      color: 'rgba(255,255,255,0.85)',
      fontSize: scrolled ? 12 : 13,
      transition: 'all 0.3s ease',
    },
    profileCard: {
      margin: '-40px 16px 20px 16px',
      background: isDarkMode ? '#141A22' : '#FFFFFF',
      borderRadius: 24,
      padding: 20,
      boxShadow: isDarkMode
        ? '0 15px 30px rgba(0,0,0,0.4)'
        : '0 15px 30px rgba(21,31,48,0.12)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      border: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
      position: 'relative' as const,
      overflow: 'hidden',
    },
    profileCardGlow: {
      position: 'absolute' as const,
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: 75,
      background: 'linear-gradient(135deg, rgba(123,108,255,0.3), rgba(77,208,225,0.3))',
      filter: 'blur(40px)',
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 22,
      background: 'linear-gradient(135deg, #7B6CFF, #4DD0E1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 32,
      color: '#fff',
      boxShadow: '0 8px 20px rgba(123,108,255,0.3)',
    },
    profInfo: { flex: 1 },
    profName: {
      fontSize: 20,
      fontWeight: 700,
      color: isDarkMode ? '#EAF0F7' : '#1B2430',
    },
    profMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
      flexWrap: 'wrap' as const,
    },
    profEmail: {
      fontSize: 13,
      color: isDarkMode ? '#9FB0C2' : '#6A7584',
    },
    roleChip: {
      fontSize: 11,
      padding: '4px 12px',
      borderRadius: 999,
      background: isDarkMode ? '#0E3B2E' : '#E7F9F2',
      color: isDarkMode ? '#46E2B6' : '#0B8B64',
      border: `1px solid ${isDarkMode ? '#1B5C4A' : '#BDEFE0'}`,
      fontWeight: 600,
    },
    editIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      background: isDarkMode ? '#1F2937' : '#F3F4F6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: 16,
      transition: 'all 0.2s',
    },
    section: {
      margin: '20px 16px 12px 16px',
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
      color: isDarkMode ? '#778BA1' : '#8A96A6',
      margin: '0 6px 12px 6px',
    },
    card: {
      background: isDarkMode ? '#11161D' : '#FFFFFF',
      borderRadius: 20,
      border: `1px solid ${isDarkMode ? '#1C2531' : '#E8ECF2'}`,
      overflow: 'hidden',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 16px',
      borderBottom: `1px solid ${isDarkMode ? '#1C2531' : '#EFF3F8'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as React.CSSProperties,
    itemLast: {
      borderBottom: 'none',
    },
    itemIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22,
      transition: 'transform 0.2s ease',
    },
    itemMain: { flex: 1 },
    itemTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: isDarkMode ? '#E7EDF5' : '#162236',
    },
    itemBadge: {
      fontSize: 12,
      marginTop: 4,
      color: isDarkMode ? '#93A7BC' : '#6B7A8A',
    },
    itemArrow: {
      fontSize: 20,
      color: isDarkMode ? '#8093A7' : '#8DA1B3',
      transition: 'transform 0.2s ease',
    },
    dangerText: {
      color: '#EF4444',
    },
    // Modal styles
    modalOverlay: {
      position: 'fixed' as const,
      inset: 0,
      background: 'rgba(9, 12, 16, 0.8)',
      backdropFilter: 'blur(12px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    },
    modalContent: {
      width: '100%',
      maxWidth: 560,
      background: isDarkMode ? '#0F141B' : '#FFFFFF',
      borderRadius: 28,
      border: `1px solid ${isDarkMode ? '#1C2531' : '#E8ECF2'}`,
      overflow: 'hidden',
      maxHeight: '85vh',
      display: 'flex',
      flexDirection: 'column' as const,
      animation: 'slideUp 0.3s ease',
    },
    modalHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 20px',
      borderBottom: `1px solid ${isDarkMode ? '#1C2531' : '#EFF3F8'}`,
      background: isDarkMode ? '#0A0F15' : '#FAFBFF',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 700,
      background: 'linear-gradient(135deg, #7B6CFF, #4DD0E1)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      margin: 0,
    },
    modalClose: {
      width: 36,
      height: 36,
      borderRadius: 12,
      background: isDarkMode ? '#141C26' : '#F2F5FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: 18,
      color: isDarkMode ? '#9BB0C5' : '#3D5166',
      border: `1px solid ${isDarkMode ? '#1D2733' : '#E6EBF2'}`,
      transition: 'all 0.2s',
    },
    modalBody: {
      padding: 20,
      overflow: 'auto' as const,
    },
    deviceStat: {
      marginBottom: 16,
      padding: 14,
      borderRadius: 16,
      background: isDarkMode ? '#0D2031' : '#EAF5FF',
      color: isDarkMode ? '#9BD3FF' : '#174E91',
      border: `1px solid ${isDarkMode ? '#123049' : '#CFE7FF'}`,
      fontSize: 14,
      fontWeight: 500,
    },
    deviceCard: {
      background: isDarkMode ? '#0E141B' : '#F7FAFF',
      border: `1px solid ${isDarkMode ? '#1B2836' : '#E3ECF9'}`,
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      transition: 'all 0.2s',
    },
    deviceRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    },
    deviceIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      background: isDarkMode ? '#17212D' : '#EAF1F9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
    },
    deviceInfo: { flex: 1 },
    deviceName: {
      fontSize: 15,
      fontWeight: 700,
      color: isDarkMode ? '#E6EDF6' : '#1E2A39',
    },
    deviceMeta: {
      marginTop: 4,
      fontSize: 12,
      color: isDarkMode ? '#8FA4BA' : '#5A6C7D',
    },
    deviceChips: {
      marginTop: 8,
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: 6,
      alignItems: 'center',
    },
    chip: {
      fontSize: 11,
      padding: '4px 10px',
      borderRadius: 999,
      background: isDarkMode ? '#101C13' : '#EAF9F0',
      color: isDarkMode ? '#60D394' : '#0D7A45',
      border: `1px solid ${isDarkMode ? '#143421' : '#C7F0D9'}`,
    },
    removeBtn: {
      background: 'transparent',
      border: `1px solid ${isDarkMode ? '#342025' : '#F6D7DB'}`,
      padding: '8px 14px',
      borderRadius: 12,
      color: '#E5484D',
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      minWidth: 96,
      transition: 'all 0.2s',
    } as React.CSSProperties,
    langItem: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: 16,
      borderRadius: 16,
      border: `1px solid ${isDarkMode ? '#1C2531' : '#E8ECF2'}`,
      background: isDarkMode ? '#0F151C' : '#FAFBFD',
      marginBottom: 12,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    langSelected: {
      border: `2px solid #10B981`,
      background: isDarkMode ? '#082217' : '#E6FFF6',
    },
    check: {
      marginLeft: 'auto',
      color: '#10B981',
      fontWeight: 800,
      fontSize: 20,
    },
    policyText: {
      fontSize: 14,
      lineHeight: 1.65,
      color: isDarkMode ? '#C9D7E6' : '#425569',
    },
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent style={styles.page}>
        <div style={styles.container}>
          {/* Header with scroll effect */}
          <div style={styles.headerWrap}>
            <h1 style={styles.headerTitle}>Settings</h1>
            <div style={styles.headerSub}>Customize your experience</div>
          </div>

          {/* Profile Card - Clickable to go to Profile */}
          <div 
            style={styles.profileCard}
            onClick={() => history.push('/profile')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
           
            <div 
              style={styles.editIcon}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#374151' : '#E5E7EB';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isDarkMode ? '#1F2937' : '#F3F4F6';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✎
            </div>
          </div>

          {/* Preferences Section */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>⚡ Preferences</div>
            <div style={styles.card}>
              {settingsMenu.slice(0, 6).map((item, idx, arr) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.item,
                    ...(idx === arr.length - 1 ? styles.itemLast : {}),
                  }}
                  onClick={() => handleMenuClick(item)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = isDarkMode ? '#0D131A' : '#F7F9FC';
                    const iconDiv = (e.currentTarget as HTMLDivElement).querySelector('.menu-icon') as HTMLDivElement;
                    if (iconDiv) iconDiv.style.transform = 'scale(1.1)';
                    const arrowDiv = (e.currentTarget as HTMLDivElement).querySelector('.menu-arrow') as HTMLDivElement;
                    if (arrowDiv) arrowDiv.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    const iconDiv = (e.currentTarget as HTMLDivElement).querySelector('.menu-icon') as HTMLDivElement;
                    if (iconDiv) iconDiv.style.transform = 'scale(1)';
                    const arrowDiv = (e.currentTarget as HTMLDivElement).querySelector('.menu-arrow') as HTMLDivElement;
                    if (arrowDiv) arrowDiv.style.transform = 'translateX(0)';
                  }}
                >
                  <div 
                    className="menu-icon" 
                    style={{ ...styles.itemIcon, background: item.gradient, color: '#FFFFFF' }}
                  >
                    {item.icon}
                  </div>
                  <div style={styles.itemMain}>
                    <div style={styles.itemTitle}>{item.title}</div>
                    {item.badge && (
                      <div style={{ ...styles.itemBadge, color: item.badgeColor || (isDarkMode ? '#93A2B3' : '#6C7F92') }}>
                        {item.badge}
                      </div>
                    )}
                  </div>
                  <div className="menu-arrow" style={styles.itemArrow}>→</div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Section */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>🛡️ Support</div>
            <div style={styles.card}>
              {settingsMenu.slice(6, 9).map((item, idx, arr) => (
                <div
                  key={item.id}
                  style={{
                    ...styles.item,
                    ...(idx === arr.length - 1 ? styles.itemLast : {}),
                  }}
                  onClick={() => handleMenuClick(item)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = isDarkMode ? '#0D131A' : '#F7F9FC';
                    const iconDiv = (e.currentTarget as HTMLDivElement).querySelector('.menu-icon') as HTMLDivElement;
                    if (iconDiv) iconDiv.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                    const iconDiv = (e.currentTarget as HTMLDivElement).querySelector('.menu-icon') as HTMLDivElement;
                    if (iconDiv) iconDiv.style.transform = 'scale(1)';
                  }}
                >
                  <div 
                    className="menu-icon" 
                    style={{ ...styles.itemIcon, background: item.gradient, color: '#FFFFFF' }}
                  >
                    {item.icon}
                  </div>
                  <div style={styles.itemMain}>
                    <div style={styles.itemTitle}>{item.title}</div>
                    {item.badge && <div style={styles.itemBadge}>{item.badge}</div>}
                  </div>
                  <div style={styles.itemArrow}>→</div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div style={styles.section}>
            <div style={styles.sectionTitle}>🔐 Account</div>
            <div style={styles.card}>
              {settingsMenu.slice(9).map((item) => (
                <div
                  key={item.id}
                  style={{ ...styles.item }}
                  onClick={() => handleMenuClick(item)}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = isDarkMode ? '#1B1213' : '#FFF5F5';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                  }}
                >
                  <div 
                    className="menu-icon" 
                    style={{ ...styles.itemIcon, background: item.gradient, color: '#FFFFFF' }}
                  >
                    {item.icon}
                  </div>
                  <div style={styles.itemMain}>
                    <div style={{ ...styles.itemTitle, ...(item.danger ? styles.dangerText : {}) }}>{item.title}</div>
                  </div>
                  <div style={{ ...styles.itemArrow, ...(item.danger ? { color: '#EF4444' } : {}) }}>
                    {loggingOut ? '⋯' : '→'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Device Management Modal */}
          {showDeviceModal && (
            <div style={styles.modalOverlay} onClick={() => setShowDeviceModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>📱 Device Management</h2>
                  <div 
                    style={styles.modalClose} 
                    onClick={() => setShowDeviceModal(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#1F2937' : '#E5E7EB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#141C26' : '#F2F5FA';
                    }}
                  >
                    ✕
                  </div>
                </div>
                <div style={styles.modalBody}>
                  <div style={styles.deviceStat}>
                    <strong>Active Sessions: {activeCount}/2</strong>
                    {activeCount >= 2 && (
                      <div style={{ marginTop: 8 }}>⚠️ You've reached the maximum allowed devices</div>
                    )}
                  </div>

                  {devices.map((d) => {
                    const primary = d.browser || d.device_name || d.device_family || 'Unknown Device';
                    const os = d.platform || 'Unknown OS';
                    const created = formatDate(d.created_at);
                    const last = d.last_used_at ? formatDuration(d.logged_in_for_seconds) : 'N/A';
                    return (
                      <div key={d.session_id} style={styles.deviceCard}>
                        <div style={styles.deviceRow}>
                          <div style={styles.deviceIcon}>{getDeviceEmoji(d)}</div>
                          <div style={styles.deviceInfo}>
                            <div style={styles.deviceName}>
                              {primary}{' '}
                              {d.is_current_session && (
                                <span style={{ marginLeft: 8, fontSize: 11, color: '#10B981', fontWeight: 600 }}>● Current</span>
                              )}
                            </div>
                            <div style={styles.deviceMeta}>
                              {os} • IP {d.ip_address || 'N/A'}
                            </div>
                            <div style={styles.deviceChips}>
                              <span style={styles.chip}>📅 Added {created}</span>
                              <span style={styles.chip}>⏱️ Last active {last}</span>
                            </div>
                          </div>

                          {!d.is_current_session && (
                            <button
                              style={styles.removeBtn}
                              disabled={removingId === d.session_id}
                              onClick={() => removeDevice(d)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#E5484D20';
                                e.currentTarget.style.borderColor = '#E5484D';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = isDarkMode ? '#342025' : '#F6D7DB';
                              }}
                            >
                              {removingId === d.session_id ? 'Removing…' : 'Remove'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {devices.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px', color: isDarkMode ? '#97A9BC' : '#5D6C7E' }}>
                      ✨ No active sessions found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Language Modal */}
          {showLanguageModal && (
            <div style={styles.modalOverlay} onClick={() => setShowLanguageModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>🌐 Select Language</h2>
                  <div style={styles.modalClose} onClick={() => setShowLanguageModal(false)}>✕</div>
                </div>
                <div style={styles.modalBody}>
                  {languages.map((lang) => {
                    const selected = selectedLanguage === lang.code;
                    return (
                      <div
                        key={lang.code}
                        style={{ ...styles.langItem, ...(selected ? styles.langSelected : {}) }}
                        onClick={() => changeLanguage(lang.code)}
                        onMouseEnter={(e) => {
                          if (!selected) e.currentTarget.style.background = isDarkMode ? '#1A2330' : '#F0F4FA';
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) e.currentTarget.style.background = isDarkMode ? '#0F151C' : '#FAFBFD';
                        }}
                      >
                        <span style={{ fontSize: 28 }}>{lang.flag}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 15 }}>{lang.name}</div>
                          <div style={{ fontSize: 11, color: isDarkMode ? '#8EA1B7' : '#6C7A8B' }}>
                            {lang.code.toUpperCase()}
                          </div>
                        </div>
                        {selected && <span style={styles.check}>✓</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* FAQ Modal */}
          {showFaqModal && (
            <div style={styles.modalOverlay} onClick={() => setShowFaqModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>❓ FAQs</h2>
                  <div style={styles.modalClose} onClick={() => setShowFaqModal(false)}>✕</div>
                </div>
                <div style={styles.modalBody}>
                  {faqs.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        background: isDarkMode ? '#0E141B' : '#F6F9FF',
                        borderRadius: 18,
                        border: `1px solid ${isDarkMode ? '#1C2531' : '#E2EAF6'}`,
                      }}
                    >
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: isDarkMode ? '#E6EDF6' : '#1E2A39' }}>
                        ❓ {f.q}
                      </div>
                      <div style={{ fontSize: 14, color: isDarkMode ? '#9DB0C4' : '#475A6B', lineHeight: 1.55 }}>{f.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Policy Modal */}
          {showPrivacyModal && (
            <div style={styles.modalOverlay} onClick={() => setShowPrivacyModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>📜 Privacy Policy</h2>
                  <div style={styles.modalClose} onClick={() => setShowPrivacyModal(false)}>✕</div>
                </div>
                <div style={styles.modalBody}>
                  <div style={styles.policyText}>
                    <h3>🔒 Information We Collect</h3>
                    <p>We collect information you provide directly, and telemetry required for safety and compliance.</p>

                    <h3>📊 How We Use Your Information</h3>
                    <p>To operate and improve services, process payouts, enhance safety, and provide support.</p>

                    <h3>🛡️ Data Security</h3>
                    <p>We implement industry-standard encryption, access controls, and continuous monitoring.</p>

                    <h3>🤝 Third-Party Services</h3>
                    <p>We may share strictly necessary data with service providers (maps, payments, analytics).</p>

                    <h3>✅ Your Rights</h3>
                    <p>You can access, correct, or request deletion of your data subject to legal obligations.</p>

                    <p><strong>Last updated:</strong> January 1, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Terms Modal */}
          {showTermsModal && (
            <div style={styles.modalOverlay} onClick={() => setShowTermsModal(false)}>
              <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>⚖️ Terms & Conditions</h2>
                  <div style={styles.modalClose} onClick={() => setShowTermsModal(false)}>✕</div>
                </div>
                <div style={styles.modalBody}>
                  <div style={styles.policyText}>
                    <h3>📋 Acceptance of Terms</h3>
                    <p>By using the driver app, you agree to these terms and any applicable policies.</p>

                    <h3>🚗 Trips and Cancellations</h3>
                    <p>Accept trips you can complete. Cancellations must follow policy and safety guidelines.</p>

                    <h3>⭐ Conduct</h3>
                    <p>Maintain professional behavior, comply with traffic laws, and ensure rider safety.</p>

                    <h3>⚠️ Liability</h3>
                    <p>Service is provided as-is subject to law. We are not liable for indirect or incidental losses.</p>

                    <h3>🏛️ Governing Law</h3>
                    <p>These terms are governed by the laws of India.</p>

                    <p><strong>Last updated:</strong> January 1, 2025</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast + Loading */}
          <IonToast isOpen={toast.show} message={toast.message} duration={2400} color={toast.color as any} position="bottom" />
          <IonLoading isOpen={loading} message="Please wait..." />
        </div>
      </IonContent>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </IonPage>
  );
};

export default Settings;