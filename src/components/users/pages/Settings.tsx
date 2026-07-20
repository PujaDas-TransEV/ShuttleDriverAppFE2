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
    | 'profile'
    | 'devices'
    | 'notifications'
    | 'appearance'
    | 'language'
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

  // Menu with gradients - Updated: "Driver Profile" instead of "Account Settings"
  const settingsMenu: SettingsMenuItem[] = [
    { id: 'profile', title: 'Driver Profile', icon: '👤', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
    { id: 'devices', title: 'Device Management', icon: '📱', badge: `${activeCount}/2 Active`, badgeColor: '#10B981', gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
    { id: 'notifications', title: 'Notifications', icon: '🔔', badge: 'Coming soon', badgeColor: '#6B7280', gradient: 'linear-gradient(135deg, #F59E0B, #D97706)' },
    { id: 'appearance', title: 'Appearance', icon: isDarkMode ? '🌙' : '☀️', badge: isDarkMode ? 'Dark' : 'Light', gradient: 'linear-gradient(135deg, #14B8A6, #0F766E)' },
    { id: 'language', title: 'Language', icon: '🌐', badge: languages.find((l) => l.code === selectedLanguage)?.name || 'English', gradient: 'linear-gradient(135deg, #EC4899, #BE185D)' },
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
      case 'profile':
        history.push('/profile-setup');
        break;
      case 'devices':
        await fetchDevices();
        setShowDeviceModal(true);
        break;
      case 'appearance':
        await toggleDarkMode();
        break;
      case 'language':
        setShowLanguageModal(true);
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

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent style={{ '--background': isDarkMode ? '#0D0F14' : '#F5F7FA' } as any}>
        <div style={{ minHeight: '100vh', paddingBottom: 24 }}>
          {/* Modern Header */}
          <div style={{
            paddingTop: 20,
            paddingLeft: 24,
            paddingRight: 24,
            paddingBottom: 20,
            background: isDarkMode 
              ? 'linear-gradient(135deg, #0D0F14 0%, #1A1F2E 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h1 style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  margin: 0,
                  letterSpacing: -0.5,
                }}>
                  Settings
                </h1>
                <p style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)',
                  marginTop: 4,
                }}>
                  Customize your app experience
                </p>
              </div>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                ⚙️
              </div>
            </div>
          </div>

          {/* Profile Card - Modern Glass Design */}
          <div 
            style={{
              margin: '-20px 20px 24px 20px',
              background: isDarkMode 
                ? 'rgba(26, 31, 46, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              borderRadius: 24,
              padding: 20,
              backdropFilter: 'blur(20px)',
              boxShadow: isDarkMode
                ? '0 20px 40px rgba(0,0,0,0.4)'
                : '0 20px 40px rgba(102, 126, 234, 0.15)',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onClick={() => history.push('/profile-setup')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 25px 50px rgba(0,0,0,0.5)'
                : '0 25px 50px rgba(102, 126, 234, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 20px 40px rgba(0,0,0,0.4)'
                : '0 20px 40px rgba(102, 126, 234, 0.15)';
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              color: '#fff',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
            }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: isDarkMode ? '#E8EDF5' : '#1A2332',
              }}>
                Driver Profile
              </div>
              <div style={{
                fontSize: 13,
                color: isDarkMode ? '#8A9BB0' : '#6A7A8A',
                marginTop: 2,
              }}>
                Tap to view and edit profile
              </div>
            </div>
            <div style={{
              fontSize: 20,
              color: isDarkMode ? '#4A5A6A' : '#8A9AAA',
            }}>
              →
            </div>
          </div>

          {/* Main Menu Sections */}
          <div style={{ padding: '0 20px' }}>
            {/* Quick Actions Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: isDarkMode ? '#6A7A8A' : '#8A9AAA',
                marginBottom: 12,
                paddingLeft: 4,
              }}>
                Quick Actions
              </div>
              <div style={{
                background: isDarkMode ? '#14181F' : '#FFFFFF',
                borderRadius: 20,
                border: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                overflow: 'hidden',
              }}>
                {/* Driver Profile - First item */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    borderBottom: `1px solid ${isDarkMode ? '#1E2632' : '#F0F2F5'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => handleMenuClick(settingsMenu[0])}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#1A202A' : '#F7F9FC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: settingsMenu[0].gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    {settingsMenu[0].icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      {settingsMenu[0].title}
                    </div>
                  </div>
                  <div style={{
                    fontSize: 16,
                    color: isDarkMode ? '#3A4A5A' : '#B0C0D0',
                  }}>
                    →
                  </div>
                </div>

                {/* Device Management */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    borderBottom: `1px solid ${isDarkMode ? '#1E2632' : '#F0F2F5'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => handleMenuClick(settingsMenu[1])}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#1A202A' : '#F7F9FC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: settingsMenu[1].gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    {settingsMenu[1].icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      {settingsMenu[1].title}
                    </div>
                    {settingsMenu[1].badge && (
                      <div style={{
                        fontSize: 12,
                        color: settingsMenu[1].badgeColor || (isDarkMode ? '#8A9BB0' : '#6A7A8A'),
                        marginTop: 2,
                      }}>
                        {settingsMenu[1].badge}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 16,
                    color: isDarkMode ? '#3A4A5A' : '#B0C0D0',
                  }}>
                    →
                  </div>
                </div>

                {/* Notifications */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => handleMenuClick(settingsMenu[2])}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#1A202A' : '#F7F9FC';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: settingsMenu[2].gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: '#fff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}>
                    {settingsMenu[2].icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      {settingsMenu[2].title}
                    </div>
                    {settingsMenu[2].badge && (
                      <div style={{
                        fontSize: 12,
                        color: settingsMenu[2].badgeColor || (isDarkMode ? '#8A9BB0' : '#6A7A8A'),
                        marginTop: 2,
                      }}>
                        {settingsMenu[2].badge}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 16,
                    color: isDarkMode ? '#3A4A5A' : '#B0C0D0',
                  }}>
                    →
                  </div>
                </div>
              </div>
            </div>

         {/* Support & Legal Section */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                color: isDarkMode ? '#6A7A8A' : '#8A9AAA',
                marginBottom: 12,
                paddingLeft: 4,
              }}>
                Support & Legal
              </div>
              <div style={{
                background: isDarkMode ? '#14181F' : '#FFFFFF',
                borderRadius: 20,
                border: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                overflow: 'hidden',
              }}>
                {settingsMenu.slice(5, 8).map((item, idx, arr) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '16px 18px',
                      borderBottom: idx === arr.length - 1 ? 'none' : `1px solid ${isDarkMode ? '#1E2632' : '#F0F2F5'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => handleMenuClick(item)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#1A202A' : '#F7F9FC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: item.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: isDarkMode ? '#E8EDF5' : '#1A2332',
                      }}>
                        {item.title}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 16,
                      color: isDarkMode ? '#3A4A5A' : '#B0C0D0',
                    }}>
                      →
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <div style={{ marginBottom: 32 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '16px 18px',
                  background: isDarkMode ? '#1A1418' : '#FFF5F5',
                  borderRadius: 20,
                  border: `1px solid ${isDarkMode ? '#3A1A1A' : '#FED7D7'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => handleLogout()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#2A1818' : '#FFEBEB';
                  e.currentTarget.style.borderColor = '#EF4444';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDarkMode ? '#1A1418' : '#FFF5F5';
                  e.currentTarget.style.borderColor = isDarkMode ? '#3A1A1A' : '#FED7D7';
                }}
              >
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                }}>
                  🚪
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#EF4444',
                  }}>
                    {loggingOut ? 'Logging out...' : 'Logout'}
                  </div>
                </div>
                <div style={{
                  fontSize: 16,
                  color: '#EF4444',
                }}>
                  →
                </div>
              </div>
            </div>
          </div>

          {/* Language Modal */}
          {showLanguageModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }} onClick={() => setShowLanguageModal(false)}>
              <div style={{
                width: '100%',
                maxWidth: 480,
                background: isDarkMode ? '#14181F' : '#FFFFFF',
                borderRadius: 24,
                border: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                overflow: 'hidden',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s ease',
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  borderBottom: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                }}>
                  <h2 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    color: isDarkMode ? '#E8EDF5' : '#1A2332',
                  }}>
                    Select Language
                  </h2>
                  <button
                    onClick={() => setShowLanguageModal(false)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: isDarkMode ? '#1E2632' : '#F0F2F5',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: isDarkMode ? '#8A9BB0' : '#6A7A8A',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#2A3242' : '#E0E4EA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#1E2632' : '#F0F2F5';
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  padding: 20,
                  overflow: 'auto',
                }}>
                  {languages.map((lang) => {
                    const selected = selectedLanguage === lang.code;
                    return (
                      <div
                        key={lang.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          padding: 16,
                          borderRadius: 16,
                          border: `2px solid ${selected ? '#10B981' : isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                          background: selected 
                            ? isDarkMode ? '#0A2018' : '#E6FFF6'
                            : isDarkMode ? '#0D1118' : '#FAFBFC',
                          marginBottom: 12,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => changeLanguage(lang.code)}
                        onMouseEnter={(e) => {
                          if (!selected) {
                            e.currentTarget.style.background = isDarkMode ? '#1A202A' : '#F5F7FA';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selected) {
                            e.currentTarget.style.background = isDarkMode ? '#0D1118' : '#FAFBFC';
                          }
                        }}
                      >
                        <span style={{ fontSize: 28 }}>{lang.flag}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: isDarkMode ? '#E8EDF5' : '#1A2332',
                          }}>
                            {lang.name}
                          </div>
                          <div style={{
                            fontSize: 11,
                            color: isDarkMode ? '#6A7A8A' : '#8A9AAA',
                          }}>
                            {lang.code.toUpperCase()}
                          </div>
                        </div>
                        {selected && (
                          <span style={{
                            color: '#10B981',
                            fontSize: 20,
                            fontWeight: 700,
                          }}>
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Device Modal */}
          {showDeviceModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }} onClick={() => setShowDeviceModal(false)}>
              <div style={{
                width: '100%',
                maxWidth: 480,
                background: isDarkMode ? '#14181F' : '#FFFFFF',
                borderRadius: 24,
                border: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                overflow: 'hidden',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s ease',
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  borderBottom: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                }}>
                  <h2 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    color: isDarkMode ? '#E8EDF5' : '#1A2332',
                  }}>
                    📱 Devices
                  </h2>
                  <button
                    onClick={() => setShowDeviceModal(false)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: isDarkMode ? '#1E2632' : '#F0F2F5',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: isDarkMode ? '#8A9BB0' : '#6A7A8A',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#2A3242' : '#E0E4EA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#1E2632' : '#F0F2F5';
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ padding: 20, overflow: 'auto' }}>
                  <div style={{
                    padding: 14,
                    borderRadius: 16,
                    background: isDarkMode ? '#0D2031' : '#EAF5FF',
                    color: isDarkMode ? '#9BD3FF' : '#174E91',
                    border: `1px solid ${isDarkMode ? '#123049' : '#CFE7FF'}`,
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 16,
                  }}>
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
                      <div key={d.session_id} style={{
                        background: isDarkMode ? '#0D1118' : '#F7F9FC',
                        border: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                        borderRadius: 18,
                        padding: 16,
                        marginBottom: 12,
                        transition: 'all 0.2s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: 14,
                            background: isDarkMode ? '#1A202A' : '#E8ECF2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                          }}>
                            {getDeviceEmoji(d)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: isDarkMode ? '#E8EDF5' : '#1A2332',
                            }}>
                              {primary}{' '}
                              {d.is_current_session && (
                                <span style={{
                                  marginLeft: 8,
                                  fontSize: 11,
                                  color: '#10B981',
                                  fontWeight: 600,
                                }}>
                                  ● Current
                                </span>
                              )}
                            </div>
                            <div style={{
                              fontSize: 12,
                              color: isDarkMode ? '#8A9BB0' : '#6A7A8A',
                              marginTop: 2,
                            }}>
                              {os} • IP {d.ip_address || 'N/A'}
                            </div>
                            <div style={{
                              marginTop: 8,
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: 6,
                              alignItems: 'center',
                            }}>
                              <span style={{
                                fontSize: 11,
                                padding: '4px 10px',
                                borderRadius: 999,
                                background: isDarkMode ? '#101C13' : '#EAF9F0',
                                color: isDarkMode ? '#60D394' : '#0D7A45',
                                border: `1px solid ${isDarkMode ? '#143421' : '#C7F0D9'}`,
                              }}>
                                📅 Added {created}
                              </span>
                              <span style={{
                                fontSize: 11,
                                padding: '4px 10px',
                                borderRadius: 999,
                                background: isDarkMode ? '#1A1820' : '#F5F0E8',
                                color: isDarkMode ? '#B08A6A' : '#7A5A3A',
                                border: `1px solid ${isDarkMode ? '#2A1A10' : '#E8D5C0'}`,
                              }}>
                                ⏱️ Last active {last}
                              </span>
                            </div>
                          </div>

                          {!d.is_current_session && (
                            <button
                              style={{
                                background: 'transparent',
                                border: `1px solid ${isDarkMode ? '#3A1A1A' : '#FED7D7'}`,
                                padding: '8px 14px',
                                borderRadius: 12,
                                color: '#EF4444',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                minWidth: 80,
                                transition: 'all 0.2s',
                              }}
                              disabled={removingId === d.session_id}
                              onClick={() => removeDevice(d)}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#EF444420';
                                e.currentTarget.style.borderColor = '#EF4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = isDarkMode ? '#3A1A1A' : '#FED7D7';
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
                    <div style={{
                      textAlign: 'center',
                      padding: '30px',
                      color: isDarkMode ? '#6A7A8A' : '#8A9AAA',
                    }}>
                      ✨ No active sessions found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FAQ Modal */}
          {showFaqModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }} onClick={() => setShowFaqModal(false)}>
              <div style={{
                width: '100%',
                maxWidth: 480,
                background: isDarkMode ? '#14181F' : '#FFFFFF',
                borderRadius: 24,
                border: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                overflow: 'hidden',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s ease',
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  borderBottom: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                }}>
                  <h2 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    color: isDarkMode ? '#E8EDF5' : '#1A2332',
                  }}>
                    ❓ FAQs
                  </h2>
                  <button
                    onClick={() => setShowFaqModal(false)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: isDarkMode ? '#1E2632' : '#F0F2F5',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: isDarkMode ? '#8A9BB0' : '#6A7A8A',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#2A3242' : '#E0E4EA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#1E2632' : '#F0F2F5';
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ padding: 20, overflow: 'auto' }}>
                  {faqs.map((f) => (
                    <div
                      key={f.id}
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        background: isDarkMode ? '#0D1118' : '#F7F9FC',
                        borderRadius: 16,
                        border: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                      }}
                    >
                      <div style={{
                        fontSize: 15,
                        fontWeight: 700,
                        marginBottom: 8,
                        color: isDarkMode ? '#E8EDF5' : '#1A2332',
                      }}>
                        ❓ {f.q}
                      </div>
                      <div style={{
                        fontSize: 14,
                        color: isDarkMode ? '#8A9BB0' : '#6A7A8A',
                        lineHeight: 1.55,
                      }}>
                        {f.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Privacy Policy Modal */}
          {showPrivacyModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }} onClick={() => setShowPrivacyModal(false)}>
              <div style={{
                width: '100%',
                maxWidth: 480,
                background: isDarkMode ? '#14181F' : '#FFFFFF',
                borderRadius: 24,
                border: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                overflow: 'hidden',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s ease',
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  borderBottom: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                }}>
                  <h2 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    color: isDarkMode ? '#E8EDF5' : '#1A2332',
                  }}>
                    📜 Privacy Policy
                  </h2>
                  <button
                    onClick={() => setShowPrivacyModal(false)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: isDarkMode ? '#1E2632' : '#F0F2F5',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: isDarkMode ? '#8A9BB0' : '#6A7A8A',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#2A3242' : '#E0E4EA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#1E2632' : '#F0F2F5';
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ padding: 20, overflow: 'auto' }}>
                  <div style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: isDarkMode ? '#B0C0D0' : '#4A5A6A',
                  }}>
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      🔒 Information We Collect
                    </h3>
                    <p>We collect information you provide directly, and telemetry required for safety and compliance.</p>

                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      📊 How We Use Your Information
                    </h3>
                    <p>To operate and improve services, process payouts, enhance safety, and provide support.</p>

                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      🛡️ Data Security
                    </h3>
                    <p>We implement industry-standard encryption, access controls, and continuous monitoring.</p>

                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      🤝 Third-Party Services
                    </h3>
                    <p>We may share strictly necessary data with service providers (maps, payments, analytics).</p>

                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      ✅ Your Rights
                    </h3>
                    <p>You can access, correct, or request deletion of your data subject to legal obligations.</p>

                    <p style={{ marginTop: 16 }}>
                      <strong>Last updated:</strong> January 1, 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Terms Modal */}
          {showTermsModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(12px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }} onClick={() => setShowTermsModal(false)}>
              <div style={{
                width: '100%',
                maxWidth: 480,
                background: isDarkMode ? '#14181F' : '#FFFFFF',
                borderRadius: 24,
                border: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                overflow: 'hidden',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s ease',
              }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 20px',
                  borderBottom: `1px solid ${isDarkMode ? '#1E2632' : '#E8ECF2'}`,
                }}>
                  <h2 style={{
                    fontSize: 20,
                    fontWeight: 700,
                    margin: 0,
                    color: isDarkMode ? '#E8EDF5' : '#1A2332',
                  }}>
                    ⚖️ Terms & Conditions
                  </h2>
                  <button
                    onClick={() => setShowTermsModal(false)}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: isDarkMode ? '#1E2632' : '#F0F2F5',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 18,
                      color: isDarkMode ? '#8A9BB0' : '#6A7A8A',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#2A3242' : '#E0E4EA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDarkMode ? '#1E2632' : '#F0F2F5';
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ padding: 20, overflow: 'auto' }}>
                  <div style={{
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: isDarkMode ? '#B0C0D0' : '#4A5A6A',
                  }}>
                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      📋 Acceptance of Terms
                    </h3>
                    <p>By using the driver app, you agree to these terms and any applicable policies.</p>

                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      🚗 Trips and Cancellations
                    </h3>
                    <p>Accept trips you can complete. Cancellations must follow policy and safety guidelines.</p>

                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      ⭐ Conduct
                    </h3>
                    <p>Maintain professional behavior, comply with traffic laws, and ensure rider safety.</p>

                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      ⚠️ Liability
                    </h3>
                    <p>Service is provided as-is subject to law. We are not liable for indirect or incidental losses.</p>

                    <h3 style={{
                      fontSize: 16,
                      fontWeight: 700,
                      marginTop: 16,
                      marginBottom: 8,
                      color: isDarkMode ? '#E8EDF5' : '#1A2332',
                    }}>
                      🏛️ Governing Law
                    </h3>
                    <p>These terms are governed by the laws of India.</p>

                    <p style={{ marginTop: 16 }}>
                      <strong>Last updated:</strong> January 1, 2025
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Toast + Loading */}
          <IonToast
            isOpen={toast.show}
            message={toast.message}
            duration={2400}
            color={toast.color as any}
            position="bottom"
          />
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
      `}</style>
    </IonPage>
  );
};

export default Settings;