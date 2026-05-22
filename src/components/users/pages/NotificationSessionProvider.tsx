import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Preferences } from '@capacitor/preferences';

const API_BASE = 'https://be.shuttleapp.transev.site';
const WS_BASE = 'wss://be.shuttleapp.transev.site';

export const NOTIFICATION_SESSION_STARTED_EVENT = 'notification-session-started';
export const NOTIFICATION_SESSION_ENDED_EVENT = 'notification-session-ended';

export interface NotificationPayloadData {
  booking_id?: string;
  scheduled_trip_id?: string;
  refresh?: string[];
  [key: string]: unknown;
}

export interface AppNotificationMessage {
  id: string;
  title: string;
  message: string;
  data: NotificationPayloadData;
  created_at: string;
}

interface NotificationSessionContextValue {
  unreadCount: number;
  lastNotification: AppNotificationMessage | null;
  refreshUnreadCount: () => Promise<void>;
  sendMarkReadOverSocket: (notificationId: string) => void;
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
  markAllNotificationsAsRead: () => Promise<boolean>;
  endNotificationSession: () => void;
}

const NotificationSessionContext = createContext<NotificationSessionContextValue>({
  unreadCount: 0,
  lastNotification: null,
  refreshUnreadCount: async () => {},
  sendMarkReadOverSocket: () => {},
  markNotificationAsRead: async () => false,
  markAllNotificationsAsRead: async () => false,
  endNotificationSession: () => {},
});

const getToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'access_token' });
    return value || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const clearStoredSession = async (): Promise<void> => {
  try {
    await Preferences.remove({ key: 'access_token' });
    await Preferences.remove({ key: 'refresh_token' });
  } catch (error) {
    console.error('Error clearing stored session:', error);
  }
};

export const NotificationSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotification, setLastNotification] = useState<AppNotificationMessage | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(false);
  const tokenRef = useRef<string | null>(null);
  const connectionGenerationRef = useRef(0);
  const processedNotificationIdsRef = useRef<Set<string>>(new Set());

  const cleanupConnection = useCallback(() => {
    shouldReconnectRef.current = false;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    const ws = wsRef.current;
    wsRef.current = null;

    if (ws) {
      ws.onopen = null;
      ws.onmessage = null;
      ws.onerror = null;
      ws.onclose = null;

      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    }
  }, []);

  const endNotificationSession = useCallback(() => {
    cleanupConnection();
    tokenRef.current = null;
    processedNotificationIdsRef.current.clear();
    setUnreadCount(0);
    setLastNotification(null);
  }, [cleanupConnection]);

  const refreshUnreadCount = useCallback(async () => {
    const token = tokenRef.current || await getToken();

    if (!token) {
      endNotificationSession();
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        await clearStoredSession();
        endNotificationSession();
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [endNotificationSession]);

  // Mark a single notification as read
  const markNotificationAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    const token = tokenRef.current || await getToken();
    
    if (!token) {
      console.error('No token available for marking notification as read');
      return false;
    }

    try {
      // Send via WebSocket for real-time update
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'mark_read',
          notification_id: notificationId,
        }));
      }

      // Also call HTTP endpoint to ensure it's marked on server
      const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Immediately decrease unread count locally without waiting for server
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        // Refresh from server to ensure accuracy (but don't show loading)
        setTimeout(() => {
          refreshUnreadCount();
        }, 500);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, [refreshUnreadCount]);

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(async (): Promise<boolean> => {
    const token = tokenRef.current || await getToken();
    
    if (!token) {
      console.error('No token available for marking all as read');
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Immediately set unread count to 0 locally
        setUnreadCount(0);
        
        // Refresh from server to ensure accuracy
        setTimeout(() => {
          refreshUnreadCount();
        }, 500);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }, [refreshUnreadCount]);

  const connectWebSocket = useCallback(async () => {
    const token = await getToken();

    if (!token) {
      endNotificationSession();
      return;
    }

    if (tokenRef.current !== token) {
      cleanupConnection();
      tokenRef.current = token;
      processedNotificationIdsRef.current.clear();
    }

    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    shouldReconnectRef.current = true;

    const generation = connectionGenerationRef.current + 1;
    connectionGenerationRef.current = generation;

    const wsUrl = `${WS_BASE}/notifications/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    const isCurrentConnection = () => {
      return (
        wsRef.current === ws &&
        tokenRef.current === token &&
        connectionGenerationRef.current === generation
      );
    };

    ws.onopen = () => {
      if (!isCurrentConnection()) {
        ws.close();
        return;
      }

      console.log('Notification WebSocket connected');

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
      if (!isCurrentConnection()) return;

      try {
        const payload = JSON.parse(event.data);

        if (payload?.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
          return;
        }

        if (payload?.message === 'WebSocket authenticated successfully.') {
          console.log('Notification WebSocket authenticated');
          return;
        }

        if (payload?.message === 'Notification marked as read.') {
          // When server confirms a notification was marked as read
          console.log('Server confirmed notification marked as read:', payload.notification_id);
          void refreshUnreadCount();
          return;
        }

        if (payload?.id && payload?.title) {
          if (processedNotificationIdsRef.current.has(payload.id)) {
            return;
          }

          processedNotificationIdsRef.current.add(payload.id);

          if (processedNotificationIdsRef.current.size > 100) {
            const idsToKeep = Array.from(processedNotificationIdsRef.current).slice(-50);
            processedNotificationIdsRef.current = new Set(idsToKeep);
          }

          const notification: AppNotificationMessage = {
            id: String(payload.id),
            title: String(payload.title),
            message: String(payload.message || ''),
            data:
              payload.data && typeof payload.data === 'object'
                ? payload.data
                : {},
            created_at: payload.created_at || new Date().toISOString(),
          };

          setLastNotification(notification);
          setUnreadCount((previous) => previous + 1);

          if ('Notification' in window && window.Notification.permission === 'granted') {
            new window.Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico',
            });
          }
        }
      } catch (error) {
        console.error('Error parsing notification WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      if (!isCurrentConnection()) return;
      console.error('Notification WebSocket error:', error);
    };

    ws.onclose = (event) => {
      if (!isCurrentConnection()) return;

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      if (wsRef.current === ws) {
        wsRef.current = null;
      }

      if (!shouldReconnectRef.current || tokenRef.current !== token) {
        return;
      }

      if (event.code === 1008 || event.code === 4001 || event.code === 4003) {
        void clearStoredSession();
        endNotificationSession();
        return;
      }

      reconnectTimeoutRef.current = window.setTimeout(() => {
        void connectWebSocket();
      }, 5000);
    };
  }, [cleanupConnection, endNotificationSession, refreshUnreadCount]);

  const sendMarkReadOverSocket = useCallback((notificationId: string) => {
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    ws.send(JSON.stringify({
      type: 'mark_read',
      notification_id: notificationId,
    }));
  }, []);

  useEffect(() => {
    void connectWebSocket();
    void refreshUnreadCount();

    if ('Notification' in window && window.Notification.permission === 'default') {
      void window.Notification.requestPermission();
    }

    const handleSessionStarted = () => {
      void connectWebSocket();
      void refreshUnreadCount();
    };

    const handleSessionEnded = () => {
      endNotificationSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void connectWebSocket();
        void refreshUnreadCount();
      }
    };

    window.addEventListener(NOTIFICATION_SESSION_STARTED_EVENT, handleSessionStarted);
    window.addEventListener(NOTIFICATION_SESSION_ENDED_EVENT, handleSessionEnded);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener(NOTIFICATION_SESSION_STARTED_EVENT, handleSessionStarted);
      window.removeEventListener(NOTIFICATION_SESSION_ENDED_EVENT, handleSessionEnded);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupConnection();
    };
  }, [connectWebSocket, refreshUnreadCount, endNotificationSession, cleanupConnection]);

  return (
    <NotificationSessionContext.Provider
      value={{
        unreadCount,
        lastNotification,
        refreshUnreadCount,
        sendMarkReadOverSocket,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        endNotificationSession,
      }}
    >
      {children}
    </NotificationSessionContext.Provider>
  );
};

export const useNotificationSession = () => {
  return useContext(NotificationSessionContext);
};