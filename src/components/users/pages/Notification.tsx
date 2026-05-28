import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IonPage, IonContent, IonRefresher, IonRefresherContent, IonToast, IonLoading } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import NavbarSidebar from '../../users/pages/Navbar';
import { useNotificationSession } from './NotificationSessionProvider';
import { 
  CheckCircleIcon, 
  BellIcon, 
  XCircleIcon,
  InboxIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface NotificationData {
  booking_id?: string;
  scheduled_trip_id?: string;
  refresh?: string[];
  [key: string]: unknown;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
}

interface NotificationsListResponse {
  items: Notification[];
  count: number;
}

const API_BASE = "https://be.shuttleapp.transev.site";
const WS_BASE = "wss://be.shuttleapp.transev.site";

// Helper function to get token from Preferences
const getToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'access_token' });
    return value || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'error' | 'info'>('success');
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [limit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);
  const processedNotificationIdsRef = useRef<Set<string>>(new Set());
  
  // Use the notification session context
  const { 
    unreadCount, 
    refreshUnreadCount 
  } = useNotificationSession();
  
  const isComponentMounted = useRef(true);

  useEffect(() => {
    // Dark mode listener
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    darkModeMediaQuery.addEventListener('change', listener);
    return () => darkModeMediaQuery.removeEventListener('change', listener);
  }, []);

  const showToast = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
    setToastMsg(message);
    setToastColor(color);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Clean up WebSocket connection
  const cleanupWebSocket = useCallback(() => {
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      
      if (wsRef.current.readyState === WebSocket.OPEN || 
          wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback(async () => {
    const token = await getToken();
    
    if (!token) {
      return;
    }
    
    // Clean up existing connection
    cleanupWebSocket();
    shouldReconnectRef.current = true;
    
    const wsUrl = `${WS_BASE}/notifications/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('🔌 Notifications page WebSocket connected');
      
      // Start ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      
      pingIntervalRef.current = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };
    
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        // Handle ping from server
        if (payload?.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }
        
        // Handle authentication success
        if (payload?.message === 'WebSocket authenticated successfully.') {
          console.log('🔐 Notifications page WebSocket authenticated');
          return;
        }
        
        // Handle mark-read acknowledgment
        if (payload?.message === 'Notification marked as read.') {
          console.log('✅ Mark read acknowledged:', payload.notification_id);
          return;
        }
        
        // Handle new notification
        if (payload?.id && payload?.title) {
          // Check for duplicates
          if (processedNotificationIdsRef.current.has(payload.id)) {
            console.log('Duplicate notification ignored:', payload.id);
            return;
          }
          
          // Add to processed set
          processedNotificationIdsRef.current.add(payload.id);
          
          // Limit the size of processed set
          if (processedNotificationIdsRef.current.size > 100) {
            const idsArray = Array.from(processedNotificationIdsRef.current);
            const idsToKeep = idsArray.slice(-50);
            processedNotificationIdsRef.current = new Set(idsToKeep);
          }
          
          const newNotification: Notification = {
            id: payload.id,
            title: payload.title,
            message: payload.message || '',
            data: payload.data || {},
            read_at: null,
            created_at: payload.created_at || new Date().toISOString()
          };
          
          // Add to notifications list at the top
          if (isComponentMounted.current) {
            setNotifications(prev => [newNotification, ...prev]);
            refreshUnreadCount();
            showToast(`New: ${payload.title}`, 'info');
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('❌ Notifications page WebSocket error:', error);
    };
    
    ws.onclose = (event) => {
      console.log('🔌 Notifications page WebSocket disconnected, code:', event.code);
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      
      // Attempt reconnect if component is still mounted
      if (shouldReconnectRef.current && isComponentMounted.current) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, 5000);
      }
    };
  }, [cleanupWebSocket, refreshUnreadCount]);

  // Fetch notifications from API
  const fetchNotifications = async (isLoadMore = false) => {
    try {
      const token = await getToken();
      if (!token) return;

      const currentOffset = isLoadMore ? offset : 0;
      const url = `${API_BASE}/notifications?limit=${limit}&offset=${currentOffset}&unread_only=false`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data: NotificationsListResponse = await response.json();
      
      // Add existing notification IDs to processed set to prevent duplicates
      data.items.forEach(notification => {
        processedNotificationIdsRef.current.add(notification.id);
      });
      
      if (isLoadMore) {
        setNotifications(prev => [...prev, ...data.items]);
        setOffset(prev => prev + limit);
        setHasMore(data.items.length === limit);
      } else {
        setNotifications(data.items);
        setOffset(limit);
        setHasMore(data.items.length === limit);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showToast('Failed to load notifications', 'error');
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const token = await getToken();
      if (!token) return;

      // Send via WebSocket for real-time
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'mark_read',
          notification_id: id
        }));
      }

      // Also call HTTP endpoint
      const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        );
        refreshUnreadCount();
        showToast('Notification marked as read', 'success');
      } else {
        showToast('Failed to mark as read', 'error');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast('Failed to mark as read', 'error');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
        );
        refreshUnreadCount();
        showToast('All notifications marked as read', 'success');
      } else {
        showToast('Failed to mark all as read', 'error');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      showToast('Failed to mark all as read', 'error');
    }
  };

  // Load initial data
  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([
      fetchNotifications(false),
      refreshUnreadCount()
    ]);
    setLoading(false);
  };

  // Load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(true);
    }
  };

  // Handle pull to refresh
  const handleRefresh = async (event: CustomEvent) => {
    setRefreshing(true);
    await Promise.all([
      fetchNotifications(false),
      refreshUnreadCount()
    ]);
    setRefreshing(false);
    event.detail.complete();
  };

  // Format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  // Initialize WebSocket on mount
  useEffect(() => {
    isComponentMounted.current = true;
    connectWebSocket();
    loadInitialData();

    // Refresh data periodically
    const interval = setInterval(() => {
      if (isComponentMounted.current) {
        refreshUnreadCount();
      }
    }, 30000);

    return () => {
      isComponentMounted.current = false;
      shouldReconnectRef.current = false;
      clearInterval(interval);
      cleanupWebSocket();
    };
  }, [connectWebSocket, refreshUnreadCount, cleanupWebSocket]);

  const styles = getStyles(isDark);

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div style={styles.container}>
          
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.iconContainer}>
                <BellIcon style={styles.headerIcon} />
              </div>
              <div>
                <h1 style={styles.headerTitle}>Notifications</h1>
                <p style={styles.headerSubtitle}>Stay updated with your latest activities</p>
              </div>
            </div>
            
            <div style={styles.headerRight}>
              {unreadCount > 0 && (
                <div style={styles.unreadBadge}>
                  <span style={styles.unreadCount}>{unreadCount}</span>
                  <span style={styles.unreadText}>unread</span>
                </div>
              )}
              <button 
                onClick={handleMarkAllAsRead}
                style={styles.markAllButton}
                disabled={unreadCount === 0}
              >
                <EyeIcon style={styles.markAllIcon} />
                <span>Mark all read</span>
              </button>
            </div>
          </div>

          {/* Pull to Refresh */}
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent />
          </IonRefresher>

          {/* Notifications List */}
          {loading && notifications.length === 0 ? (
            <div style={styles.loadingContainer}>
              <div style={styles.loadingSpinner} />
              <p style={styles.loadingText}>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div style={styles.emptyContainer}>
              <InboxIcon style={styles.emptyIcon} />
              <h3 style={styles.emptyTitle}>No notifications yet</h3>
              <p style={styles.emptyText}>When you receive notifications, they'll appear here</p>
            </div>
          ) : (
            <div style={styles.notificationsList}>
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read_at && handleMarkAsRead(notification.id)}
                  style={{
                    ...styles.notificationCard,
                    ...(!notification.read_at && styles.notificationCardUnread),
                    ...(index === notifications.length - 1 && hasMore && styles.notificationCardLast)
                  }}
                >
                  <div style={styles.notificationContent}>
                    <div style={styles.notificationHeader}>
                      <div style={styles.notificationTitleSection}>
                        <h3 style={styles.notificationTitle}>{notification.title}</h3>
                        {!notification.read_at && <div style={styles.unreadDot} />}
                      </div>
                      {notification.read_at ? (
                        <CheckCircleIcon style={styles.readIcon} />
                      ) : (
                        <XCircleIcon style={styles.unreadIcon} />
                      )}
                    </div>
                    <p style={styles.notificationMessage}>{notification.message}</p>
                    <div style={styles.notificationFooter}>
                      <span style={styles.notificationTime}>
                        {formatTime(notification.created_at)}
                      </span>
                      {notification.data.booking_id && (
                        <span style={styles.notificationBadge}>
                          Booking #{String(notification.data.booking_id).slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Load more trigger */}
              {hasMore && notifications.length >= limit && (
                <div style={styles.loadMoreContainer}>
                  <button onClick={loadMore} style={styles.loadMoreButton}>
                    <ArrowPathIcon style={styles.loadMoreIcon} />
                    <span>Load more</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={3000}
          color={toastColor}
          position="top"
        />
        <IonLoading isOpen={loading && notifications.length === 0} message="Loading notifications..." />
      </IonContent>
    </IonPage>
  );
};

const getStyles = (isDark: boolean) => ({
  container: {
    minHeight: '100vh',
    padding: '80px 24px 24px 24px',
    background: isDark ? '#0A0A0A' : '#F8F9FA'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap' as const,
    gap: '16px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    background: isDark ? '#1A1A1A' : '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: isDark 
      ? '0 4px 12px rgba(0, 0, 0, 0.3)'
      : '0 4px 12px rgba(0, 0, 0, 0.05)'
  },
  headerIcon: {
    width: '28px',
    height: '28px',
    color: isDark ? '#FFFFFF' : '#000000'
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#000000',
    margin: 0
  },
  headerSubtitle: {
    fontSize: '14px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    margin: '4px 0 0 0'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  unreadBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: isDark ? '#1A1A1A' : '#FFFFFF',
    borderRadius: '40px',
    border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`
  },
  unreadCount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#000000'
  },
  unreadText: {
    fontSize: '13px',
    color: isDark ? '#9CA3AF' : '#6B7280'
  },
  markAllButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: isDark ? '#1A1A1A' : '#FFFFFF',
    border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
    borderRadius: '40px',
    color: isDark ? '#FFFFFF' : '#000000',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  markAllIcon: {
    width: '18px',
    height: '18px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
    borderTopColor: isDark ? '#FFFFFF' : '#000000',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    color: isDark ? '#9CA3AF' : '#6B7280'
  },
  emptyContainer: {
    textAlign: 'center' as const,
    padding: '60px 20px'
  },
  emptyIcon: {
    width: '80px',
    height: '80px',
    margin: '0 auto 24px',
    color: isDark ? '#2A2A2A' : '#D1D5DB'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    marginBottom: '8px'
  },
  emptyText: {
    fontSize: '14px',
    color: isDark ? '#9CA3AF' : '#6B7280'
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px'
  },
  notificationCard: {
    padding: '20px',
    borderRadius: '16px',
    background: isDark ? '#111111' : '#FFFFFF',
    border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  notificationCardUnread: {
    background: isDark ? '#1A1A1A' : '#F9FAFB',
    borderLeft: `4px solid ${isDark ? '#FFFFFF' : '#000000'}`
  },
  notificationCardLast: {
    marginBottom: '0'
  },
  notificationContent: {
    flex: 1
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  notificationTitleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1
  },
  notificationTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#000000',
    margin: 0
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '4px',
    background: isDark ? '#FFFFFF' : '#000000'
  },
  readIcon: {
    width: '20px',
    height: '20px',
    color: isDark ? '#10B981' : '#059669'
  },
  unreadIcon: {
    width: '20px',
    height: '20px',
    color: isDark ? '#EF4444' : '#DC2626'
  },
  notificationMessage: {
    fontSize: '14px',
    color: isDark ? '#D1D5DB' : '#4B5563',
    marginBottom: '12px',
    lineHeight: '1.5'
  },
  notificationFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const
  },
  notificationTime: {
    fontSize: '12px',
    color: isDark ? '#6B7280' : '#9CA3AF'
  },
  notificationBadge: {
    fontSize: '11px',
    padding: '4px 8px',
    borderRadius: '6px',
    background: isDark ? '#1F1F1F' : '#F3F4F6',
    color: isDark ? '#9CA3AF' : '#6B7280'
  },
  loadMoreContainer: {
    textAlign: 'center' as const,
    padding: '20px'
  },
  loadMoreButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'transparent',
    border: `1px solid ${isDark ? '#2A2A2A' : '#E5E7EB'}`,
    borderRadius: '40px',
    color: isDark ? '#FFFFFF' : '#000000',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  loadMoreIcon: {
    width: '16px',
    height: '16px'
  }
});

// Add CSS animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default NotificationsPage;