import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  IonAlert,
  IonLoading,
} from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { useHistory } from 'react-router-dom';
import NavbarSidebar from '../pages/Navbar';

// API Base URL
const API_BASE = 'https://be.shuttleapp.transev.site';

// Types
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

interface DevicesResponse {
  active_login_count: number;
  devices: Device[];
}

// Helper function to get token
const getToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'access_token' });
    return value || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Helper function to clear auth
const clearAuth = async () => {
  await Preferences.remove({ key: 'access_token' });
  await Preferences.remove({ key: 'refresh_token' });
  sessionStorage.clear();
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m ago`;
  }
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return `${days}d ${hours}h ago`;
};

// Helper function to format date
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return `${date.toLocaleDateString('en-IN', { weekday: 'short' })} at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Get device icon based on browser/platform
const getDeviceIcon = (device: Device) => {
  const browser = (device.browser || '').toLowerCase();
  const platform = (device.platform || '').toLowerCase();
  const deviceName = (device.device_name || '').toLowerCase();
  
  if (browser.includes('edge')) return '🌐';
  if (browser.includes('chrome')) return '🌐';
  if (browser.includes('firefox')) return '🦊';
  if (browser.includes('safari')) return '🧭';
  if (platform.includes('android')) return '📱';
  if (platform.includes('ios')) return '📱';
  if (platform.includes('windows')) return '💻';
  if (platform.includes('mac')) return '🍎';
  if (platform.includes('linux')) return '🐧';
  return '💻';
};

// Get device color
const getDeviceColor = (device: Device) => {
  const browser = (device.browser || '').toLowerCase();
  
  if (browser.includes('edge')) return '#3B82F6';
  if (browser.includes('chrome')) return '#34D399';
  if (browser.includes('firefox')) return '#F97316';
  if (browser.includes('safari')) return '#06B6D4';
  return '#8B5CF6';
};

// Get gradient based on browser
const getDeviceGradient = (device: Device) => {
  const browser = (device.browser || '').toLowerCase();
  
  if (browser.includes('edge')) return 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
  if (browser.includes('chrome')) return 'linear-gradient(135deg, #34D399, #059669)';
  if (browser.includes('firefox')) return 'linear-gradient(135deg, #F97316, #EA580C)';
  if (browser.includes('safari')) return 'linear-gradient(135deg, #06B6D4, #0891B2)';
  return 'linear-gradient(135deg, #8B5CF6, #6D28D9)';
};

// Get status color
const getStatusColor = (device: Device) => {
  if (device.is_current_session) return '#10B981';
  if (device.last_used_at) {
    const lastUsed = new Date(device.last_used_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
    if (hoursDiff < 1) return '#3B82F6';
    if (hoursDiff < 24) return '#F59E0B';
  }
  return '#6B7280';
};

// Get status text
const getStatusText = (device: Device): string => {
  if (device.is_current_session) return 'Current Session';
  if (device.last_used_at) {
    const lastUsed = new Date(device.last_used_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
    if (hoursDiff < 1) return 'Active Now';
    if (hoursDiff < 24) return `Last active ${Math.floor(hoursDiff)} hours ago`;
  }
  return 'Inactive';
};

const DeviceManagement: React.FC = () => {
  const history = useHistory();
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showRemoveAlert, setShowRemoveAlert] = useState<{ show: boolean; device: Device | null }>({
    show: false,
    device: null,
  });
  const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
    show: false,
    message: '',
    color: 'success',
  });
  const [isDark, setIsDark] = useState(true);

  // Dark mode listener
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeMediaQuery.addEventListener('change', listener);
    return () => darkModeMediaQuery.removeEventListener('change', listener);
  }, []);

  const showToastMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    setToast({ show: true, message, color });
    setTimeout(() => setToast({ show: false, message: '', color: 'success' }), 3000);
  };

  // Fetch devices
  const fetchDevices = async (showLoading = true) => {
    try {
      const token = await getToken();
      if (!token) {
        history.push('/login');
        return;
      }

      if (showLoading) setLoading(true);

      const response = await fetch(`${API_BASE}/auth/devices`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        await clearAuth();
        history.push('/login');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch devices');

      const data: DevicesResponse = await response.json();
      setDevices(data.devices || []);
      setActiveCount(data.active_login_count || 0);
    } catch (error) {
      console.error('Error fetching devices:', error);
      showToastMessage('Failed to load devices', 'danger');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Remove device
  const removeDevice = async (device: Device) => {
    setRemovingId(device.session_id);
    try {
      const token = await getToken();
      if (!token) {
        history.push('/login');
        return;
      }

      const response = await fetch(`${API_BASE}/auth/devices/${device.session_id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        await clearAuth();
        history.push('/login');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail?.message || 'Failed to remove device');
      }

      if (device.is_current_session) {
        await clearAuth();
        showToastMessage('Logged out from this device', 'success');
        history.push('/login');
      } else {
        setDevices((prev) => prev.filter((d) => d.session_id !== device.session_id));
        setActiveCount((prev) => prev - 1);
        showToastMessage('Device removed successfully', 'success');
      }
    } catch (error: any) {
      console.error('Error removing device:', error);
      showToastMessage(error.message || 'Failed to remove device', 'danger');
      await fetchDevices(false);
    } finally {
      setRemovingId(null);
      setShowRemoveAlert({ show: false, device: null });
    }
  };

  // Handle refresh
  const handleRefresh = async (event: CustomEvent) => {
    setRefreshing(true);
    await fetchDevices(false);
    event.detail.complete();
  };

  // Initial load
  useEffect(() => {
    fetchDevices();
  }, []);

  const styles = {
    container: {
      minHeight: '100vh',
      background: isDark ? '#0A0A0A' : '#F8F9FA',
    },
    header: {
      marginTop: '60px',
      padding: '32px 24px',
      background: isDark 
        ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderBottomLeftRadius: '32px',
      borderBottomRightRadius: '32px',
      position: 'relative' as const,
      overflow: 'hidden',
    },
    headerBgCircle: {
      position: 'absolute' as const,
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: 75,
      background: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: '8px',
    },
    headerSubtitle: {
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    statsBadge: {
      position: 'absolute' as const,
      top: '24px',
      right: '24px',
      background: 'rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      padding: '8px 16px',
      textAlign: 'center' as const,
      zIndex: 10,
    },
    statsNumber: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      lineHeight: 1,
    },
    statsText: {
      fontSize: '10px',
      color: 'rgba(255, 255, 255, 0.9)',
    },
    securityBanner: {
      margin: '20px 16px',
      padding: '14px 16px',
      background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
      borderRadius: '16px',
      border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
    },
    securityIcon: {
      fontSize: '20px',
    },
    securityTitle: {
      fontWeight: 600,
      fontSize: '13px',
      color: '#3B82F6',
      marginBottom: '4px',
    },
    securityText: {
      fontSize: '11px',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    deviceCard: {
      margin: '16px',
      padding: '0',
      background: isDark ? '#1F2937' : '#FFFFFF',
      borderRadius: '24px',
      boxShadow: isDark
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
    },
    currentCard: {
      border: `2px solid ${getDeviceColor(devices[0] || { browser: null })}`,
    },
    cardHeader: {
      padding: '20px',
      background: isDark ? '#1F2937' : '#FFFFFF',
      borderBottom: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
    },
    deviceHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    },
    deviceIconWrapper: {
      width: '56px',
      height: '56px',
      borderRadius: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '28px',
    },
    deviceInfo: {
      flex: 1,
    },
    deviceNameRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap' as const,
      marginBottom: '6px',
    },
    deviceName: {
      fontSize: '18px',
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
    },
    currentBadge: {
      background: '#10B981',
      color: '#FFFFFF',
      fontSize: '10px',
      padding: '2px 10px',
      borderRadius: '20px',
      fontWeight: 500,
    },
    deviceMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap' as const,
    },
    deviceType: {
      fontSize: '12px',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '4px',
      display: 'inline-block',
      marginRight: '6px',
    },
    statusText: {
      fontSize: '12px',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    removeButton: {
      background: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '10px',
      borderRadius: '12px',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardBody: {
      padding: '20px',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '20px',
    },
    infoItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
    },
    infoLabel: {
      fontSize: '11px',
      fontWeight: '600',
      color: isDark ? '#9CA3AF' : '#6B7280',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: isDark ? '#F3F4F6' : '#1F2937',
      wordBreak: 'break-all' as const,
    },
    tagsContainer: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap' as const,
      marginTop: '16px',
      paddingTop: '16px',
      borderTop: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
    },
    tag: {
      fontSize: '11px',
      padding: '4px 12px',
      background: isDark ? '#374151' : '#F3F4F6',
      borderRadius: '20px',
      color: isDark ? '#D1D5DB' : '#4B5563',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    sessionId: {
      marginTop: '16px',
      padding: '12px',
      background: isDark ? '#111827' : '#F9FAFB',
      borderRadius: '12px',
      fontSize: '11px',
      color: isDark ? '#6B7280' : '#9CA3AF',
      fontFamily: 'monospace',
      wordBreak: 'break-all' as const,
    },
    sessionLabel: {
      fontWeight: 600,
      marginBottom: '4px',
      display: 'block',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 20px',
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: `3px solid ${isDark ? '#374151' : '#E5E7EB'}`,
      borderTopColor: '#8B5CF6',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    loadingText: {
      marginTop: '16px',
      color: isDark ? '#9CA3AF' : '#6B7280',
      fontSize: '14px',
    },
    emptyContainer: {
      textAlign: 'center' as const,
      padding: '60px 20px',
    },
    emptyIcon: {
      fontSize: '64px',
      marginBottom: '16px',
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1F2937',
      marginBottom: '8px',
    },
    emptyText: {
      fontSize: '14px',
      color: isDark ? '#9CA3AF' : '#6B7280',
    },
    footer: {
      textAlign: 'center' as const,
      padding: '24px 20px',
    },
    footerText: {
      fontSize: '12px',
      color: isDark ? '#6B7280' : '#9CA3AF',
    },
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent style={{ '--background': isDark ? '#0A0A0A' : '#F8F9FA' } as any}>
        <div style={styles.container}>
          
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.statsBadge}>
              <div style={styles.statsNumber}>{activeCount}</div>
              <div style={styles.statsText}>Active</div>
            </div>
            <div style={styles.headerBgCircle} />
            <h1 style={styles.headerTitle}>Device Management</h1>
            <p style={styles.headerSubtitle}>Manage your active login sessions</p>
          </div>

          {/* Security Banner */}
          <div style={styles.securityBanner}>
            <div style={styles.securityIcon}>🔒</div>
            <div style={{ flex: 1 }}>
              <div style={styles.securityTitle}>Secure Your Account</div>
              <div style={styles.securityText}>
                Remove any device you don't recognize. Removing a device will log it out immediately.
              </div>
            </div>
          </div>

          {/* Pull to Refresh */}
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          {/* Loading State */}
          {loading && devices.length === 0 ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading your devices...</p>
            </div>
          ) : devices.length === 0 ? (
            <div style={styles.emptyContainer}>
              <div style={styles.emptyIcon}>📱</div>
              <h3 style={styles.emptyTitle}>No Devices Found</h3>
              <p style={styles.emptyText}>Your active devices will appear here</p>
            </div>
          ) : (
            <div>
              {devices.map((device) => {
                const deviceIcon = getDeviceIcon(device);
                const deviceColor = getDeviceColor(device);
                const deviceGradient = getDeviceGradient(device);
                const isRemoving = removingId === device.session_id;
                const isCurrent = device.is_current_session;
                const statusColor = getStatusColor(device);
                const statusText = getStatusText(device);
                
                return (
                  <div
                    key={device.session_id}
                    style={{
                      ...styles.deviceCard,
                      ...(isCurrent && styles.currentCard),
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = isDark 
                        ? '0 10px 20px -5px rgba(0, 0, 0, 0.4)'
                        : '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = isDark
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                        : '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    {/* Card Header */}
                    <div style={styles.cardHeader}>
                      <div style={styles.deviceHeader}>
                        <div style={{ ...styles.deviceIconWrapper, background: `${deviceColor}15` }}>
                          <span>{deviceIcon}</span>
                        </div>
                        <div style={styles.deviceInfo}>
                          <div style={styles.deviceNameRow}>
                            <span style={styles.deviceName}>
                              {device.browser || device.device_family || 'Device'}
                            </span>
                            {isCurrent && <span style={styles.currentBadge}>Current</span>}
                          </div>
                          <div style={styles.deviceMeta}>
                            <span style={styles.deviceType}>
                              {device.platform || 'Unknown OS'}
                            </span>
                            <span>
                              <span style={{ ...styles.statusDot, backgroundColor: statusColor }} />
                              <span style={styles.statusText}>{statusText}</span>
                            </span>
                          </div>
                        </div>
                        {!isCurrent && (
                          <button
                            onClick={() => setShowRemoveAlert({ show: true, device })}
                            disabled={isRemoving}
                            style={styles.removeButton}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = isDark ? '#EF444410' : '#FEE2E2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            {isRemoving ? (
                              <div style={{ width: '20px', height: '20px', border: '2px solid #EF4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={styles.cardBody}>
                      {/* Device Details Grid */}
                      <div style={styles.infoGrid}>
                        {/* Device Name */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>
                            <span>🖥️</span> Device Name
                          </div>
                          <div style={styles.infoValue}>{device.device_name || 'N/A'}</div>
                        </div>

                        {/* Device Family */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>
                            <span>📦</span> Device Family
                          </div>
                          <div style={styles.infoValue}>{device.device_family || 'N/A'}</div>
                        </div>

                        {/* Platform */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>
                            <span>⚙️</span> Platform
                          </div>
                          <div style={styles.infoValue}>{device.platform || 'N/A'}</div>
                        </div>

                        {/* Browser */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>
                            <span>🌐</span> Browser
                          </div>
                          <div style={styles.infoValue}>{device.browser || 'N/A'}</div>
                        </div>

                        {/* IP Address */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>
                            <span>📍</span> IP Address
                          </div>
                          <div style={styles.infoValue}>{device.ip_address || 'N/A'}</div>
                        </div>

                        {/* Logged In Duration */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>
                            <span>⏱️</span> Session Duration
                          </div>
                          <div style={styles.infoValue}>{formatDuration(device.logged_in_for_seconds)}</div>
                        </div>

                        {/* Created At */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>
                            <span>📅</span> Created At
                          </div>
                          <div style={styles.infoValue}>{formatDate(device.created_at)}</div>
                        </div>

                        {/* Last Used */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>
                            <span>🕐</span> Last Active
                          </div>
                          <div style={styles.infoValue}>
                            {device.last_used_at ? formatDate(device.last_used_at) : 'N/A'}
                          </div>
                        </div>

                        {/* Expires At */}
                        <div style={styles.infoItem}>
                          <div style={styles.infoLabel}>
                            <span>⏰</span> Expires On
                          </div>
                          <div style={styles.infoValue}>{formatDate(device.expires_at)}</div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={styles.tagsContainer}>
                        {device.browser && (
                          <span style={styles.tag}>
                            <span>🌐</span> {device.browser}
                          </span>
                        )}
                        {device.platform && (
                          <span style={styles.tag}>
                            <span>💻</span> {device.platform}
                          </span>
                        )}
                        {device.device_family && (
                          <span style={styles.tag}>
                            <span>📱</span> {device.device_family}
                          </span>
                        )}
                        {device.is_current_session && (
                          <span style={{ ...styles.tag, background: '#10B98120', color: '#10B981' }}>
                            <span>✅</span> Current Session
                          </span>
                        )}
                      </div>

                      {/* Session ID */}
                      <div style={styles.sessionId}>
                        <span style={styles.sessionLabel}>🔑 Session ID</span>
                        {device.session_id}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div style={styles.footer}>
            <p style={styles.footerText}>
              {activeCount > 2 
                ? `⚠️ You have exceeded the limit of 2 active devices. Please remove some devices.`
                : `You have ${activeCount} active device${activeCount !== 1 ? 's' : ''} out of 2 allowed`}
            </p>
          </div>

          {/* Confirmation Alert */}
          <IonAlert
            isOpen={showRemoveAlert.show}
            onDidDismiss={() => setShowRemoveAlert({ show: false, device: null })}
            header={showRemoveAlert.device?.is_current_session ? 'Logout Current Device?' : 'Remove Device?'}
            message={
              showRemoveAlert.device?.is_current_session
                ? 'This will log you out of this device. You will need to login again.'
                : `Remove "${showRemoveAlert.device?.browser || 'this device'}" from your active sessions? This will log it out immediately.`
            }
            buttons={[
              {
                text: 'Cancel',
                role: 'cancel',
                cssClass: 'secondary',
              },
              {
                text: showRemoveAlert.device?.is_current_session ? 'Logout' : 'Remove',
                handler: () => {
                  if (showRemoveAlert.device) {
                    removeDevice(showRemoveAlert.device);
                  }
                },
                cssClass: showRemoveAlert.device?.is_current_session ? 'danger' : 'primary',
              },
            ]}
          />

          {/* Toast */}
          <IonToast
            isOpen={toast.show}
            message={toast.message}
            duration={3000}
            color={toast.color as any}
            position="bottom"
          />

          {/* Loading */}
          <IonLoading isOpen={loading && devices.length === 0} message="Loading devices..." />
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default DeviceManagement;