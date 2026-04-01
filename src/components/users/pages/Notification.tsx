import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import NavbarSidebar from '../../users/pages/Navbar';
import { CheckCircleIcon, XCircleIcon, BellIcon } from '@heroicons/react/24/outline';

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    // Dark mode listener
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    // Example notifications, replace with API fetch
    setNotifications([
      { id: 1, title: 'New Booking', message: 'Passenger John Doe booked 2 seats', time: '5 min ago', read: false },
      { id: 2, title: 'Trip Completed', message: 'Trip to Airport completed successfully', time: '1 hour ago', read: true },
      { id: 3, title: 'Payment Received', message: '₹2,500 collected for City Shuttle 1', time: '2 hours ago', read: false },
      { id: 4, title: 'Maintenance Alert', message: 'AC system check due tomorrow', time: 'Yesterday', read: true },
    ]);
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className={`${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'} pt-16`}>
        <div className="p-5">

          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <BellIcon className="w-8 h-8 text-gray-500 dark:text-gray-300" />
            <h1 className="text-2xl font-bold">Notifications</h1>
          </div>

          {/* Notification List */}
          <div className="space-y-4">
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`p-4 rounded-xl shadow-md cursor-pointer transition hover:scale-102
                  ${notification.read
                    ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    : isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'
                  }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h2 className="font-semibold">{notification.title}</h2>
                  {notification.read ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm mb-2">{notification.message}</p>
                <p className="text-xs text-gray-400">{notification.time}</p>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NotificationsPage;