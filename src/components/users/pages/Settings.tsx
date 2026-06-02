// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   IonPage,
//   IonContent,
//   IonRefresher,
//   IonRefresherContent,
//   IonToast,
//   IonAlert,
//   IonLoading,
// } from '@ionic/react';
// import { Preferences } from '@capacitor/preferences';
// import { useHistory } from 'react-router-dom';
// import NavbarSidebar from '../pages/Navbar';

// // API Base URL
// const API_BASE = 'https://be.shuttleapp.transev.site';

// // Types
// interface Device {
//   session_id: string;
//   device_name: string | null;
//   device_family: string | null;
//   platform: string | null;
//   browser: string | null;
//   ip_address: string | null;
//   created_at: string;
//   last_used_at: string | null;
//   expires_at: string;
//   logged_in_for_seconds: number;
//   is_current_session: boolean;
// }

// interface DevicesResponse {
//   active_login_count: number;
//   devices: Device[];
// }

// // Helper function to get token
// const getToken = async (): Promise<string | null> => {
//   try {
//     const { value } = await Preferences.get({ key: 'access_token' });
//     return value || null;
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return null;
//   }
// };

// // Helper function to clear auth
// const clearAuth = async () => {
//   await Preferences.remove({ key: 'access_token' });
//   await Preferences.remove({ key: 'refresh_token' });
//   sessionStorage.clear();
// };

// // Helper function to format duration
// const formatDuration = (seconds: number): string => {
//   if (seconds < 60) return `${seconds} seconds ago`;
//   if (seconds < 3600) {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins}m ${secs}s ago`;
//   }
//   if (seconds < 86400) {
//     const hours = Math.floor(seconds / 3600);
//     const mins = Math.floor((seconds % 3600) / 60);
//     return `${hours}h ${mins}m ago`;
//   }
//   const days = Math.floor(seconds / 86400);
//   const hours = Math.floor((seconds % 86400) / 3600);
//   return `${days}d ${hours}h ago`;
// };

// // Helper function to format date
// const formatDate = (dateStr: string): string => {
//   const date = new Date(dateStr);
//   const now = new Date();
//   const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
//   if (diffDays === 0) {
//     return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
//   } else if (diffDays === 1) {
//     return `Yesterday at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
//   } else if (diffDays < 7) {
//     return `${date.toLocaleDateString('en-IN', { weekday: 'short' })} at ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
//   }
//   return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
// };

// // Get device icon based on browser/platform
// const getDeviceIcon = (device: Device) => {
//   const browser = (device.browser || '').toLowerCase();
//   const platform = (device.platform || '').toLowerCase();
//   const deviceName = (device.device_name || '').toLowerCase();
  
//   if (browser.includes('edge')) return '🌐';
//   if (browser.includes('chrome')) return '🌐';
//   if (browser.includes('firefox')) return '🦊';
//   if (browser.includes('safari')) return '🧭';
//   if (platform.includes('android')) return '📱';
//   if (platform.includes('ios')) return '📱';
//   if (platform.includes('windows')) return '💻';
//   if (platform.includes('mac')) return '🍎';
//   if (platform.includes('linux')) return '🐧';
//   return '💻';
// };

// // Get device color
// const getDeviceColor = (device: Device) => {
//   const browser = (device.browser || '').toLowerCase();
  
//   if (browser.includes('edge')) return '#3B82F6';
//   if (browser.includes('chrome')) return '#34D399';
//   if (browser.includes('firefox')) return '#F97316';
//   if (browser.includes('safari')) return '#06B6D4';
//   return '#8B5CF6';
// };

// // Get gradient based on browser
// const getDeviceGradient = (device: Device) => {
//   const browser = (device.browser || '').toLowerCase();
  
//   if (browser.includes('edge')) return 'linear-gradient(135deg, #3B82F6, #1D4ED8)';
//   if (browser.includes('chrome')) return 'linear-gradient(135deg, #34D399, #059669)';
//   if (browser.includes('firefox')) return 'linear-gradient(135deg, #F97316, #EA580C)';
//   if (browser.includes('safari')) return 'linear-gradient(135deg, #06B6D4, #0891B2)';
//   return 'linear-gradient(135deg, #8B5CF6, #6D28D9)';
// };

// // Get status color
// const getStatusColor = (device: Device) => {
//   if (device.is_current_session) return '#10B981';
//   if (device.last_used_at) {
//     const lastUsed = new Date(device.last_used_at);
//     const now = new Date();
//     const hoursDiff = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
//     if (hoursDiff < 1) return '#3B82F6';
//     if (hoursDiff < 24) return '#F59E0B';
//   }
//   return '#6B7280';
// };

// // Get status text
// const getStatusText = (device: Device): string => {
//   if (device.is_current_session) return 'Current Session';
//   if (device.last_used_at) {
//     const lastUsed = new Date(device.last_used_at);
//     const now = new Date();
//     const hoursDiff = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
//     if (hoursDiff < 1) return 'Active Now';
//     if (hoursDiff < 24) return `Last active ${Math.floor(hoursDiff)} hours ago`;
//   }
//   return 'Inactive';
// };

// const DeviceManagement: React.FC = () => {
//   const history = useHistory();
//   const [devices, setDevices] = useState<Device[]>([]);
//   const [activeCount, setActiveCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [removingId, setRemovingId] = useState<string | null>(null);
//   const [showRemoveAlert, setShowRemoveAlert] = useState<{ show: boolean; device: Device | null }>({
//     show: false,
//     device: null,
//   });
//   const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
//     show: false,
//     message: '',
//     color: 'success',
//   });
//   const [isDark, setIsDark] = useState(true);

//   // Dark mode listener
//   useEffect(() => {
//     const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
//     darkModeMediaQuery.addEventListener('change', listener);
//     return () => darkModeMediaQuery.removeEventListener('change', listener);
//   }, []);

//   const showToastMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
//     setToast({ show: true, message, color });
//     setTimeout(() => setToast({ show: false, message: '', color: 'success' }), 3000);
//   };

//   // Fetch devices
//   const fetchDevices = async (showLoading = true) => {
//     try {
//       const token = await getToken();
//       if (!token) {
//         history.push('/login');
//         return;
//       }

//       if (showLoading) setLoading(true);

//       const response = await fetch(`${API_BASE}/auth/devices`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.status === 401) {
//         await clearAuth();
//         history.push('/login');
//         return;
//       }

//       if (!response.ok) throw new Error('Failed to fetch devices');

//       const data: DevicesResponse = await response.json();
//       setDevices(data.devices || []);
//       setActiveCount(data.active_login_count || 0);
//     } catch (error) {
//       console.error('Error fetching devices:', error);
//       showToastMessage('Failed to load devices', 'danger');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Remove device
//   const removeDevice = async (device: Device) => {
//     setRemovingId(device.session_id);
//     try {
//       const token = await getToken();
//       if (!token) {
//         history.push('/login');
//         return;
//       }

//       const response = await fetch(`${API_BASE}/auth/devices/${device.session_id}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.status === 401) {
//         await clearAuth();
//         history.push('/login');
//         return;
//       }

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.detail?.message || 'Failed to remove device');
//       }

//       if (device.is_current_session) {
//         await clearAuth();
//         showToastMessage('Logged out from this device', 'success');
//         history.push('/login');
//       } else {
//         setDevices((prev) => prev.filter((d) => d.session_id !== device.session_id));
//         setActiveCount((prev) => prev - 1);
//         showToastMessage('Device removed successfully', 'success');
//       }
//     } catch (error: any) {
//       console.error('Error removing device:', error);
//       showToastMessage(error.message || 'Failed to remove device', 'danger');
//       await fetchDevices(false);
//     } finally {
//       setRemovingId(null);
//       setShowRemoveAlert({ show: false, device: null });
//     }
//   };

//   // Handle refresh
//   const handleRefresh = async (event: CustomEvent) => {
//     setRefreshing(true);
//     await fetchDevices(false);
//     event.detail.complete();
//   };

//   // Initial load
//   useEffect(() => {
//     fetchDevices();
//   }, []);

//   const styles = {
//     container: {
//       minHeight: '100vh',
//       background: isDark ? '#0A0A0A' : '#F8F9FA',
//     },
//     header: {
//       marginTop: '60px',
//       padding: '32px 24px',
//       background: isDark 
//         ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
//         : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//       borderBottomLeftRadius: '32px',
//       borderBottomRightRadius: '32px',
//       position: 'relative' as const,
//       overflow: 'hidden',
//     },
//     headerBgCircle: {
//       position: 'absolute' as const,
//       top: -50,
//       right: -50,
//       width: 150,
//       height: 150,
//       borderRadius: 75,
//       background: 'rgba(255,255,255,0.1)',
//     },
//     headerTitle: {
//       fontSize: '28px',
//       fontWeight: 'bold',
//       color: '#FFFFFF',
//       marginBottom: '8px',
//     },
//     headerSubtitle: {
//       fontSize: '14px',
//       color: 'rgba(255, 255, 255, 0.8)',
//     },
//     statsBadge: {
//       position: 'absolute' as const,
//       top: '24px',
//       right: '24px',
//       background: 'rgba(255, 255, 255, 0.2)',
//       backdropFilter: 'blur(10px)',
//       borderRadius: '20px',
//       padding: '8px 16px',
//       textAlign: 'center' as const,
//       zIndex: 10,
//     },
//     statsNumber: {
//       fontSize: '24px',
//       fontWeight: 'bold',
//       color: '#FFFFFF',
//       lineHeight: 1,
//     },
//     statsText: {
//       fontSize: '10px',
//       color: 'rgba(255, 255, 255, 0.9)',
//     },
//     securityBanner: {
//       margin: '20px 16px',
//       padding: '14px 16px',
//       background: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
//       borderRadius: '16px',
//       border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
//       display: 'flex',
//       gap: '12px',
//       alignItems: 'flex-start',
//     },
//     securityIcon: {
//       fontSize: '20px',
//     },
//     securityTitle: {
//       fontWeight: 600,
//       fontSize: '13px',
//       color: '#3B82F6',
//       marginBottom: '4px',
//     },
//     securityText: {
//       fontSize: '11px',
//       color: isDark ? '#9CA3AF' : '#6B7280',
//     },
//     deviceCard: {
//       margin: '16px',
//       padding: '0',
//       background: isDark ? '#1F2937' : '#FFFFFF',
//       borderRadius: '24px',
//       boxShadow: isDark
//         ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
//         : '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
//       overflow: 'hidden',
//       transition: 'transform 0.2s, box-shadow 0.2s',
//     },
//     currentCard: {
//       border: `2px solid ${getDeviceColor(devices[0] || { browser: null })}`,
//     },
//     cardHeader: {
//       padding: '20px',
//       background: isDark ? '#1F2937' : '#FFFFFF',
//       borderBottom: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
//     },
//     deviceHeader: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '16px',
//     },
//     deviceIconWrapper: {
//       width: '56px',
//       height: '56px',
//       borderRadius: '28px',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       fontSize: '28px',
//     },
//     deviceInfo: {
//       flex: 1,
//     },
//     deviceNameRow: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       flexWrap: 'wrap' as const,
//       marginBottom: '6px',
//     },
//     deviceName: {
//       fontSize: '18px',
//       fontWeight: '600',
//       color: isDark ? '#FFFFFF' : '#1F2937',
//     },
//     currentBadge: {
//       background: '#10B981',
//       color: '#FFFFFF',
//       fontSize: '10px',
//       padding: '2px 10px',
//       borderRadius: '20px',
//       fontWeight: 500,
//     },
//     deviceMeta: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '12px',
//       flexWrap: 'wrap' as const,
//     },
//     deviceType: {
//       fontSize: '12px',
//       color: isDark ? '#9CA3AF' : '#6B7280',
//     },
//     statusDot: {
//       width: '8px',
//       height: '8px',
//       borderRadius: '4px',
//       display: 'inline-block',
//       marginRight: '6px',
//     },
//     statusText: {
//       fontSize: '12px',
//       color: isDark ? '#9CA3AF' : '#6B7280',
//     },
//     removeButton: {
//       background: 'transparent',
//       border: 'none',
//       cursor: 'pointer',
//       padding: '10px',
//       borderRadius: '12px',
//       transition: 'all 0.2s',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//     },
//     cardBody: {
//       padding: '20px',
//     },
//     infoGrid: {
//       display: 'grid',
//       gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//       gap: '16px',
//       marginBottom: '20px',
//     },
//     infoItem: {
//       display: 'flex',
//       flexDirection: 'column' as const,
//       gap: '6px',
//     },
//     infoLabel: {
//       fontSize: '11px',
//       fontWeight: '600',
//       color: isDark ? '#9CA3AF' : '#6B7280',
//       textTransform: 'uppercase' as const,
//       letterSpacing: '0.5px',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '6px',
//     },
//     infoValue: {
//       fontSize: '14px',
//       fontWeight: '500',
//       color: isDark ? '#F3F4F6' : '#1F2937',
//       wordBreak: 'break-all' as const,
//     },
//     tagsContainer: {
//       display: 'flex',
//       gap: '8px',
//       flexWrap: 'wrap' as const,
//       marginTop: '16px',
//       paddingTop: '16px',
//       borderTop: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
//     },
//     tag: {
//       fontSize: '11px',
//       padding: '4px 12px',
//       background: isDark ? '#374151' : '#F3F4F6',
//       borderRadius: '20px',
//       color: isDark ? '#D1D5DB' : '#4B5563',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '6px',
//     },
//     sessionId: {
//       marginTop: '16px',
//       padding: '12px',
//       background: isDark ? '#111827' : '#F9FAFB',
//       borderRadius: '12px',
//       fontSize: '11px',
//       color: isDark ? '#6B7280' : '#9CA3AF',
//       fontFamily: 'monospace',
//       wordBreak: 'break-all' as const,
//     },
//     sessionLabel: {
//       fontWeight: 600,
//       marginBottom: '4px',
//       display: 'block',
//     },
//     loadingContainer: {
//       display: 'flex',
//       flexDirection: 'column' as const,
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '60px 20px',
//     },
//     spinner: {
//       width: '40px',
//       height: '40px',
//       border: `3px solid ${isDark ? '#374151' : '#E5E7EB'}`,
//       borderTopColor: '#8B5CF6',
//       borderRadius: '50%',
//       animation: 'spin 1s linear infinite',
//     },
//     loadingText: {
//       marginTop: '16px',
//       color: isDark ? '#9CA3AF' : '#6B7280',
//       fontSize: '14px',
//     },
//     emptyContainer: {
//       textAlign: 'center' as const,
//       padding: '60px 20px',
//     },
//     emptyIcon: {
//       fontSize: '64px',
//       marginBottom: '16px',
//     },
//     emptyTitle: {
//       fontSize: '18px',
//       fontWeight: '600',
//       color: isDark ? '#FFFFFF' : '#1F2937',
//       marginBottom: '8px',
//     },
//     emptyText: {
//       fontSize: '14px',
//       color: isDark ? '#9CA3AF' : '#6B7280',
//     },
//     footer: {
//       textAlign: 'center' as const,
//       padding: '24px 20px',
//     },
//     footerText: {
//       fontSize: '12px',
//       color: isDark ? '#6B7280' : '#9CA3AF',
//     },
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent style={{ '--background': isDark ? '#0A0A0A' : '#F8F9FA' } as any}>
//         <div style={styles.container}>
          
//           {/* Header */}
//           <div style={styles.header}>
//             <div style={styles.statsBadge}>
//               <div style={styles.statsNumber}>{activeCount}</div>
//               <div style={styles.statsText}>Active</div>
//             </div>
//             <div style={styles.headerBgCircle} />
//             <h1 style={styles.headerTitle}>Device Management</h1>
//             <p style={styles.headerSubtitle}>Manage your active login sessions</p>
//           </div>

//           {/* Security Banner */}
//           <div style={styles.securityBanner}>
//             <div style={styles.securityIcon}>🔒</div>
//             <div style={{ flex: 1 }}>
//               <div style={styles.securityTitle}>Secure Your Account</div>
//               <div style={styles.securityText}>
//                 Remove any device you don't recognize. Removing a device will log it out immediately.
//               </div>
//             </div>
//           </div>

//           {/* Pull to Refresh */}
//           <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
//             <IonRefresherContent />
//           </IonRefresher>

//           {/* Loading State */}
//           {loading && devices.length === 0 ? (
//             <div style={styles.loadingContainer}>
//               <div style={styles.spinner}></div>
//               <p style={styles.loadingText}>Loading your devices...</p>
//             </div>
//           ) : devices.length === 0 ? (
//             <div style={styles.emptyContainer}>
//               <div style={styles.emptyIcon}>📱</div>
//               <h3 style={styles.emptyTitle}>No Devices Found</h3>
//               <p style={styles.emptyText}>Your active devices will appear here</p>
//             </div>
//           ) : (
//             <div>
//               {devices.map((device) => {
//                 const deviceIcon = getDeviceIcon(device);
//                 const deviceColor = getDeviceColor(device);
//                 const deviceGradient = getDeviceGradient(device);
//                 const isRemoving = removingId === device.session_id;
//                 const isCurrent = device.is_current_session;
//                 const statusColor = getStatusColor(device);
//                 const statusText = getStatusText(device);
                
//                 return (
//                   <div
//                     key={device.session_id}
//                     style={{
//                       ...styles.deviceCard,
//                       ...(isCurrent && styles.currentCard),
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.transform = 'translateY(-2px)';
//                       e.currentTarget.style.boxShadow = isDark 
//                         ? '0 10px 20px -5px rgba(0, 0, 0, 0.4)'
//                         : '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = 'translateY(0)';
//                       e.currentTarget.style.boxShadow = isDark
//                         ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
//                         : '0 10px 15px -3px rgba(0, 0, 0, 0.05)';
//                     }}
//                   >
//                     {/* Card Header */}
//                     <div style={styles.cardHeader}>
//                       <div style={styles.deviceHeader}>
//                         <div style={{ ...styles.deviceIconWrapper, background: `${deviceColor}15` }}>
//                           <span>{deviceIcon}</span>
//                         </div>
//                         <div style={styles.deviceInfo}>
//                           <div style={styles.deviceNameRow}>
//                             <span style={styles.deviceName}>
//                               {device.browser || device.device_family || 'Device'}
//                             </span>
//                             {isCurrent && <span style={styles.currentBadge}>Current</span>}
//                           </div>
//                           <div style={styles.deviceMeta}>
//                             <span style={styles.deviceType}>
//                               {device.platform || 'Unknown OS'}
//                             </span>
//                             <span>
//                               <span style={{ ...styles.statusDot, backgroundColor: statusColor }} />
//                               <span style={styles.statusText}>{statusText}</span>
//                             </span>
//                           </div>
//                         </div>
//                         {!isCurrent && (
//                           <button
//                             onClick={() => setShowRemoveAlert({ show: true, device })}
//                             disabled={isRemoving}
//                             style={styles.removeButton}
//                             onMouseEnter={(e) => {
//                               e.currentTarget.style.background = isDark ? '#EF444410' : '#FEE2E2';
//                             }}
//                             onMouseLeave={(e) => {
//                               e.currentTarget.style.background = 'transparent';
//                             }}
//                           >
//                             {isRemoving ? (
//                               <div style={{ width: '20px', height: '20px', border: '2px solid #EF4444', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
//                             ) : (
//                               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                                 <path d="M3 6h18" />
//                                 <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
//                               </svg>
//                             )}
//                           </button>
//                         )}
//                       </div>
//                     </div>

//                     {/* Card Body */}
//                     <div style={styles.cardBody}>
//                       {/* Device Details Grid */}
//                       <div style={styles.infoGrid}>
//                         {/* Device Name */}
//                         <div style={styles.infoItem}>
//                           <div style={styles.infoLabel}>
//                             <span>🖥️</span> Device Name
//                           </div>
//                           <div style={styles.infoValue}>{device.device_name || 'N/A'}</div>
//                         </div>

//                         {/* Device Family */}
//                         <div style={styles.infoItem}>
//                           <div style={styles.infoLabel}>
//                             <span>📦</span> Device Family
//                           </div>
//                           <div style={styles.infoValue}>{device.device_family || 'N/A'}</div>
//                         </div>

//                         {/* Platform */}
//                         <div style={styles.infoItem}>
//                           <div style={styles.infoLabel}>
//                             <span>⚙️</span> Platform
//                           </div>
//                           <div style={styles.infoValue}>{device.platform || 'N/A'}</div>
//                         </div>

//                         {/* Browser */}
//                         <div style={styles.infoItem}>
//                           <div style={styles.infoLabel}>
//                             <span>🌐</span> Browser
//                           </div>
//                           <div style={styles.infoValue}>{device.browser || 'N/A'}</div>
//                         </div>

//                         {/* IP Address */}
//                         <div style={styles.infoItem}>
//                           <div style={styles.infoLabel}>
//                             <span>📍</span> IP Address
//                           </div>
//                           <div style={styles.infoValue}>{device.ip_address || 'N/A'}</div>
//                         </div>

//                         {/* Logged In Duration */}
//                         <div style={styles.infoItem}>
//                           <div style={styles.infoLabel}>
//                             <span>⏱️</span> Session Duration
//                           </div>
//                           <div style={styles.infoValue}>{formatDuration(device.logged_in_for_seconds)}</div>
//                         </div>

//                         {/* Created At */}
//                         <div style={styles.infoItem}>
//                           <div style={styles.infoLabel}>
//                             <span>📅</span> Created At
//                           </div>
//                           <div style={styles.infoValue}>{formatDate(device.created_at)}</div>
//                         </div>

//                         {/* Last Used */}
//                         <div style={styles.infoItem}>
//                           <div style={styles.infoLabel}>
//                             <span>🕐</span> Last Active
//                           </div>
//                           <div style={styles.infoValue}>
//                             {device.last_used_at ? formatDate(device.last_used_at) : 'N/A'}
//                           </div>
//                         </div>

//                         {/* Expires At */}
//                         <div style={styles.infoItem}>
//                           <div style={styles.infoLabel}>
//                             <span>⏰</span> Expires On
//                           </div>
//                           <div style={styles.infoValue}>{formatDate(device.expires_at)}</div>
//                         </div>
//                       </div>

//                       {/* Tags */}
//                       <div style={styles.tagsContainer}>
//                         {device.browser && (
//                           <span style={styles.tag}>
//                             <span>🌐</span> {device.browser}
//                           </span>
//                         )}
//                         {device.platform && (
//                           <span style={styles.tag}>
//                             <span>💻</span> {device.platform}
//                           </span>
//                         )}
//                         {device.device_family && (
//                           <span style={styles.tag}>
//                             <span>📱</span> {device.device_family}
//                           </span>
//                         )}
//                         {device.is_current_session && (
//                           <span style={{ ...styles.tag, background: '#10B98120', color: '#10B981' }}>
//                             <span>✅</span> Current Session
//                           </span>
//                         )}
//                       </div>

//                       {/* Session ID */}
//                       <div style={styles.sessionId}>
//                         <span style={styles.sessionLabel}>🔑 Session ID</span>
//                         {device.session_id}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Footer */}
//           <div style={styles.footer}>
//             <p style={styles.footerText}>
//               {activeCount > 2 
//                 ? `⚠️ You have exceeded the limit of 2 active devices. Please remove some devices.`
//                 : `You have ${activeCount} active device${activeCount !== 1 ? 's' : ''} out of 2 allowed`}
//             </p>
//           </div>

//           {/* Confirmation Alert */}
//           <IonAlert
//             isOpen={showRemoveAlert.show}
//             onDidDismiss={() => setShowRemoveAlert({ show: false, device: null })}
//             header={showRemoveAlert.device?.is_current_session ? 'Logout Current Device?' : 'Remove Device?'}
//             message={
//               showRemoveAlert.device?.is_current_session
//                 ? 'This will log you out of this device. You will need to login again.'
//                 : `Remove "${showRemoveAlert.device?.browser || 'this device'}" from your active sessions? This will log it out immediately.`
//             }
//             buttons={[
//               {
//                 text: 'Cancel',
//                 role: 'cancel',
//                 cssClass: 'secondary',
//               },
//               {
//                 text: showRemoveAlert.device?.is_current_session ? 'Logout' : 'Remove',
//                 handler: () => {
//                   if (showRemoveAlert.device) {
//                     removeDevice(showRemoveAlert.device);
//                   }
//                 },
//                 cssClass: showRemoveAlert.device?.is_current_session ? 'danger' : 'primary',
//               },
//             ]}
//           />

//           {/* Toast */}
//           <IonToast
//             isOpen={toast.show}
//             message={toast.message}
//             duration={3000}
//             color={toast.color as any}
//             position="bottom"
//           />

//           {/* Loading */}
//           <IonLoading isOpen={loading && devices.length === 0} message="Loading devices..." />
//         </div>

//         <style>{`
//           @keyframes spin {
//             to { transform: rotate(360deg); }
//           }
//         `}</style>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default DeviceManagement;

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
        history.push('/profile');
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