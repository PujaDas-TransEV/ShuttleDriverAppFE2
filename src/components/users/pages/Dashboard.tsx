import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonAlert } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import NavbarSidebar from '../pages/Navbar';

import {
  UserCircleIcon,
  TruckIcon,
  IdentificationIcon,
  CurrencyRupeeIcon,
  MapIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  WalletIcon,
  BanknotesIcon,
  DocumentArrowDownIcon,
  CameraIcon,
  BellIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Helper function to check if token is expired
const isTokenExpired = async (): Promise<boolean> => {
  try {
    const { value: expiresAt } = await Preferences.get({ key: 'expires_at' });
    if (!expiresAt) return true;
    
    const expiryTime = new Date(expiresAt).getTime();
    const currentTime = new Date().getTime();
    
    // Add 5 minutes buffer to be safe
    return currentTime >= expiryTime - 5 * 60 * 1000;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
};

const getToken = async (): Promise<string | null> => {
  try {
    const expired = await isTokenExpired();
    if (expired) {
      // Clear expired tokens
      await Preferences.remove({ key: 'access_token' });
      await Preferences.remove({ key: 'refresh_token' });
      await Preferences.remove({ key: 'expires_at' });
      return null;
    }
    
    const { value } = await Preferences.get({ key: 'access_token' });
    return value || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// API wrapper with automatic logout on 401
const apiRequest = async (url: string, token: string | null, options: RequestInit = {}): Promise<Response> => {
  if (!token) {
    throw new Error('NO_TOKEN');
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  // If token expired or unauthorized
  if (response.status === 401) {
    // Clear all tokens
    await Preferences.remove({ key: 'access_token' });
    await Preferences.remove({ key: 'refresh_token' });
    await Preferences.remove({ key: 'expires_at' });
    throw new Error('TOKEN_EXPIRED');
  }
  
  return response;
};

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995572.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -15],
});

const LiveLocationUpdater = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 14, { duration: 1 });
  }, [position, map]);
  return null;
};

const API_BASE = "https://be.shuttleapp.transev.site";

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [showSessionExpiredAlert, setShowSessionExpiredAlert] = useState(false);
  
  const [driverVerified, setDriverVerified] = useState(false);
  const [driverStats, setDriverStats] = useState<any>({
    total_trips: 0,
    completed_trips: 0,
    cancelled_trips: 0,
    trips: []
  });
  const [payoutDetails, setPayoutDetails] = useState<any>(null);
  
  // Permission states
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Location
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // Earnings modal states
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'month' | 'year'>('month');

  const isNative = Capacitor.isNativePlatform();
  const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1];
  
  const months = [
    { value: '01', name: 'January' }, { value: '02', name: 'February' },
    { value: '03', name: 'March' }, { value: '04', name: 'April' },
    { value: '05', name: 'May' }, { value: '06', name: 'June' },
    { value: '07', name: 'July' }, { value: '08', name: 'August' },
    { value: '09', name: 'September' }, { value: '10', name: 'October' },
    { value: '11', name: 'November' }, { value: '12', name: 'December' }
  ];

  // Check token validity on mount and redirect if expired
  useEffect(() => {
    const validateToken = async () => {
      const expired = await isTokenExpired();
      const accessToken = await getToken();
      
      if (expired || !accessToken) {
        console.log('Token expired or not found, redirecting to login');
        setShowSessionExpiredAlert(true);
        setTimeout(() => {
          history.replace('/login?session=expired');
        }, 2000);
        return;
      }
      
      setToken(accessToken);
      setTokenChecked(true);
    };
    
    validateToken();
  }, [history]);

  // Fetch verification status
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!token || !tokenChecked) return;
      
      try {
        const res = await apiRequest(`${API_BASE}/driver-profile/me`, token);
        const data = await res.json();
        setDriverVerified(data.verification_status === "verified");
      } catch (err: any) {
        if (err.message === 'TOKEN_EXPIRED' || err.message === 'NO_TOKEN') {
          setShowSessionExpiredAlert(true);
          setTimeout(() => {
            history.replace('/login?session=expired');
          }, 2000);
        } else {
          console.error("Error fetching verification:", err);
        }
      }
    };
    
    fetchVerificationStatus();
  }, [token, tokenChecked, history]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!token || !tokenChecked) return;
      
      try {
        const res = await apiRequest(`${API_BASE}/driver/stats`, token);
        const data = await res.json();
        setDriverStats(data);
      } catch (err: any) {
        if (err.message === 'TOKEN_EXPIRED' || err.message === 'NO_TOKEN') {
          setShowSessionExpiredAlert(true);
          setTimeout(() => {
            history.replace('/login?session=expired');
          }, 2000);
        } else {
          console.error("Error fetching stats:", err);
        }
      }
    };
    
    fetchStats();
  }, [token, tokenChecked, history]);

  const fetchPayoutDetails = async (year: string, month: string, filterType: 'month' | 'year' = 'month') => {
    if (!token || !tokenChecked) return;
    
    try {
      let url = `${API_BASE}/driver/trips/payout-details?`;
      
      if (filterType === 'month') {
        url += `from_month=${month}&from_year=${year}&to_month=${month}&to_year=${year}`;
      } else {
        url += `from_year=${year}&to_year=${year}`;
      }
      
      const res = await apiRequest(url, token);
      const data = await res.json();
      setPayoutDetails(data);
    } catch (err: any) {
      if (err.message === 'TOKEN_EXPIRED' || err.message === 'NO_TOKEN') {
        setShowSessionExpiredAlert(true);
        setTimeout(() => {
          history.replace('/login?session=expired');
        }, 2000);
      } else {
        console.error("Error fetching payout details:", err);
      }
    }
  };

  useEffect(() => {
    if (driverVerified && token && tokenChecked) {
      fetchPayoutDetails(selectedYear, selectedMonth, selectedFilter);
    }
  }, [driverVerified, selectedYear, selectedMonth, selectedFilter, token, tokenChecked]);

  const checkLocationPermissionSilently = async () => {
    if (!token || !tokenChecked) return;
    
    if (!isNative) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setDriverPos([pos.coords.latitude, pos.coords.longitude]);
            setLocationPermissionGranted(true);
          },
          (err) => {
            console.log('Location not granted yet:', err);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
      return;
    }
    
    try {
      const permission = await Geolocation.checkPermissions();
      if (permission.location === 'granted') {
        setLocationPermissionGranted(true);
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        setDriverPos([position.coords.latitude, position.coords.longitude]);
      }
    } catch (error) {
      console.error('Error checking location:', error);
    }
  };
  
  const requestLocationPermission = async () => {
    if (!token || !tokenChecked) return;
    
    if (!isNative) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setDriverPos([pos.coords.latitude, pos.coords.longitude]);
            setLocationPermissionGranted(true);
            setLocationError(null);
          },
          (err) => {
            console.error('Browser GPS error:', err);
            setLocationError('Please enable location access in your browser settings.');
          },
          { enableHighAccuracy: true }
        );
      }
      return;
    }
    
    setLoadingLocation(true);
    try {
      const permission = await Geolocation.checkPermissions();
      
      if (permission.location === 'granted') {
        setLocationPermissionGranted(true);
        setLocationError(null);
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });
        setDriverPos([position.coords.latitude, position.coords.longitude]);
      } 
      else if (permission.location === 'prompt') {
        const result = await Geolocation.requestPermissions();
        if (result.location === 'granted') {
          setLocationPermissionGranted(true);
          setLocationError(null);
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
          });
          setDriverPos([position.coords.latitude, position.coords.longitude]);
        } else {
          setLocationError('Location permission denied. Please enable it in settings.');
        }
      }
      else if (permission.location === 'denied') {
        setLocationError('Location permission denied. Please enable it in settings.');
      }
    } catch (error) {
      console.error('Error requesting location:', error);
      setLocationError('Failed to get location permission');
    } finally {
      setLoadingLocation(false);
    }
  };
  
  useEffect(() => {
    if (!token || !tokenChecked) return;
    
    checkLocationPermissionSilently();
    
    const checkCamera = async () => {
      if (isNative) {
        try {
          const cameraStatus = await Camera.checkPermissions();
          setCameraPermissionGranted(cameraStatus.camera === 'granted');
        } catch (e) {}
      } else {
        setCameraPermissionGranted(true);
      }
    };
    
    const checkNotification = async () => {
      if (isNative) {
        try {
          const notifStatus = await LocalNotifications.checkPermissions();
          setNotificationPermissionGranted(notifStatus.display === 'granted');
        } catch (e) {}
      } else {
        setNotificationPermissionGranted(true);
      }
    };
    
    checkCamera();
    checkNotification();
  }, [token, tokenChecked, isNative]);

  useEffect(() => {
    if (!locationPermissionGranted || !token || !tokenChecked) return;
    
    const updatePosition = async () => {
      if (isNative) {
        try {
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
          });
          setDriverPos([position.coords.latitude, position.coords.longitude]);
        } catch (err) {
          console.error('GPS error:', err);
        }
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
          (err) => console.error('GPS error:', err),
          { enableHighAccuracy: true }
        );
      }
    };
    
    updatePosition();
    const interval = setInterval(updatePosition, 30000);
    return () => clearInterval(interval);
  }, [locationPermissionGranted, isNative, token, tokenChecked]);

  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, []);

  const downloadEarningsReport = async () => {
    if (!token || !tokenChecked) return;
    
    setDownloading(true);
    try {
      let url = `${API_BASE}/driver/trips/payout-details?`;
      
      if (selectedFilter === 'month') {
        url += `from_month=${selectedMonth}&from_year=${selectedYear}&to_month=${selectedMonth}&to_year=${selectedYear}`;
      } else {
        url += `from_year=${selectedYear}&to_year=${selectedYear}`;
      }
      
      const response = await apiRequest(url, token);
      const data = await response.json();
      
      const headers = ['Date', 'Trip ID', 'Fare Amount', 'Commission', 'Driver Payout', 'Status'];
      const rows = data.items?.map((item: any) => [
        item.trip_date || new Date().toLocaleDateString(),
        item.trip_id?.slice(0, 8) || 'N/A',
        item.fare_amount || 0,
        item.commission_amount || 0,
        item.driver_payout_amount || 0,
        item.payout_status || 'Pending'
      ]) || [];
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url_blob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_blob;
      a.download = `earnings_${selectedYear}_${selectedMonth}_report.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url_blob);
    } catch (err: any) {
      if (err.message === 'TOKEN_EXPIRED' || err.message === 'NO_TOKEN') {
        setShowSessionExpiredAlert(true);
        setTimeout(() => {
          history.replace('/login?session=expired');
        }, 2000);
      } else {
        console.error("Error downloading report:", err);
      }
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (showEarningsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showEarningsModal]);

  // Don't render anything while checking token
  if (!tokenChecked) {
    return (
      <IonPage>
        <IonContent className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>Checking session...</p>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const summary = payoutDetails?.summary || {
    trip_count: 0,
    booking_count: 0,
    total_fare_amount: 0,
    total_commission_amount: 0,
    total_driver_payout_amount: 0,
    total_paid_out_amount: 0,
    total_pending_payout_amount: 0
  };

  const setupCards = driverVerified
    ? [
        { icon: <UserCircleIcon className="w-6 h-6" />, title: 'Profile', path: '/profile-setup', color: 'from-blue-500 to-blue-600' },
        { icon: <IdentificationIcon className="w-6 h-6" />, title: 'Identity Check', path: '/kyc-verification', color: 'from-purple-500 to-purple-600' },
        { icon: <TruckIcon className="w-6 h-6" />, title: 'Vehicle', path: '/vehicle-registration', color: 'from-green-500 to-green-600' }
      ]
    : [
        { icon: <UserCircleIcon className="w-6 h-6" />, title: 'Profile Setup', path: '/profile-setup', color: 'from-blue-500 to-blue-600' },
        { icon: <IdentificationIcon className="w-6 h-6" />, title: 'Identity Check', path: '/kyc-verification', color: 'from-purple-500 to-purple-600' },
        { icon: <TruckIcon className="w-6 h-6" />, title: 'Vehicle', path: '/vehicle-registration', color: 'from-green-500 to-green-600' }
      ];

  return (
    <IonPage>
      <NavbarSidebar />
      
      {/* Session Expired Alert */}
      <IonAlert
        isOpen={showSessionExpiredAlert}
        onDidDismiss={() => setShowSessionExpiredAlert(false)}
        header="Session Expired"
        message="Your session has expired. Please login again to continue."
        buttons={[
          {
            text: 'OK',
            handler: () => {
              history.replace('/login?session=expired');
            }
          }
        ]}
      />
      
      <IonContent className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          
          {/* Permission Status Bar */}
          {isNative && (
            <div className="mb-4 flex flex-wrap gap-2 justify-center">
              <div 
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs cursor-pointer transition ${
                  locationPermissionGranted 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`} 
                onClick={() => !locationPermissionGranted && requestLocationPermission()}
              >
                <MapPinIcon className="w-3 h-3" />
                <span>Location {locationPermissionGranted ? '✓' : '✗'}</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                cameraPermissionGranted 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <CameraIcon className="w-3 h-3" />
                <span>Camera {cameraPermissionGranted ? '✓' : '✗'}</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                notificationPermissionGranted 
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                <BellIcon className="w-3 h-3" />
                <span>Notifications {notificationPermissionGranted ? '✓' : '✗'}</span>
              </div>
            </div>
          )}

          {/* Location Error Banner */}
          {locationError && (
            <div className="mb-4 p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400 flex-1">{locationError}</p>
              <button
                onClick={requestLocationPermission}
                className="relative overflow-hidden group flex items-center justify-center gap-2 font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                style={{
                  width: '130px',
                  height: '36px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#ffffff',
                  fontSize: '12px',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <MapPinIcon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110" />
                <span>Enable Location</span>
              </button>
            </div>
          )}

          {/* Header */}
          <div className="mb-4 mt-17">
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-pink-300' : 'text-gray-800'}`}>
              Welcome! 👋
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
              Track your trips, earnings, and performance
            </p>
          </div>

          {/* Rest of your dashboard content remains the same */}
          {/* Verification Warning */}
          {!driverVerified && (
            <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Complete Your Profile
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Complete profile, vehicle & Identity Check to start earning
                </p>
              </div>
            </div>
          )}

          {/* Setup Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {setupCards.map((card, i) => (
              <div
                key={i}
                onClick={() => history.push(card.path)}
                className={`group relative overflow-hidden rounded-2xl bg-linear-to-r ${card.color} p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="text-white mb-2">{card.icon}</div>
                  <p className="text-white text-xs font-medium">{card.title}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <MapIcon className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{driverStats?.total_trips || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total Trips</p>
            </div>
            
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-400">Completed</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{driverStats?.completed_trips || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Completed Trips</p>
            </div>
            
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <XCircleIcon className="w-5 h-5 text-red-500" />
                <span className="text-xs text-gray-400">Cancelled</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{driverStats?.cancelled_trips || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Cancelled Trips</p>
            </div>
            
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <CurrencyRupeeIcon className="w-5 h-5 text-emerald-500" />
                <span className="text-xs text-gray-400">Earnings</span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                ₹{driverStats?.trips?.reduce((sum: number, t: any) => sum + (t.earning || 0), 0).toLocaleString() || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
            </div>
          </div>

          {/* Payout Summary Cards */}
          {driverVerified && summary.total_driver_payout_amount > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-emerald-500`}>
                <div className="flex items-center gap-2 mb-1">
                  <BanknotesIcon className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs text-gray-500">Total Payout</p>
                </div>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  ₹{summary.total_driver_payout_amount.toLocaleString()}
                </p>
              </div>
              
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-green-500`}>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-gray-500">Paid Out</p>
                </div>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  ₹{summary.total_paid_out_amount.toLocaleString()}
                </p>
              </div>
              
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-yellow-500`}>
                <div className="flex items-center gap-2 mb-1">
                  <ClockIcon className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  ₹{summary.total_pending_payout_amount.toLocaleString()}
                </p>
              </div>
              
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-blue-500`}>
                <div className="flex items-center gap-2 mb-1">
                  <WalletIcon className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-gray-500">Total Trips</p>
                </div>
                <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {summary.trip_count}
                </p>
              </div>
            </div>
          )}

          {/* Map Section */}
          <div 
            className={`mb-6 rounded-2xl overflow-hidden shadow-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} relative group`} 
            style={{ height: '360px', width: '100%' }}
          >
            {!locationPermissionGranted ? (
              <div className="flex flex-col justify-center items-center h-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-800">
                <div className="text-center p-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                    <MapPinIcon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-white font-semibold text-lg mb-2">Location Access Required</p>
                  <p className="text-gray-400 text-sm mb-4 max-w-xs mx-auto">
                    Allow location access to see your live position on the map and track your trips.
                  </p>
                  <button
                    onClick={requestLocationPermission}
                    disabled={loadingLocation}
                    className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition flex items-center gap-2 mx-auto"
                  >
                    {loadingLocation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPinIcon className="w-4 h-4" />
                        Enable Location
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : driverPos ? (
              <MapContainer 
                center={driverPos} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                className="leaflet-container"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                
                <LiveLocationUpdater position={driverPos} />
                
                <Marker position={driverPos} icon={driverIcon}>
                  <Popup>
                    <div className="text-center min-w-45">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                          <span className="text-xl">🚗</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">Your Location</p>
                          <p className="text-xs text-emerald-600 font-semibold">Active Now</p>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-2 text-xs text-gray-500">
                        <p>📍 Lat: {driverPos[0].toFixed(6)}</p>
                        <p>📍 Lng: {driverPos[1].toFixed(6)}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : loadingLocation ? (
              <div className="flex flex-col justify-center items-center h-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-800">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                  <p className="text-white font-medium">Getting your location...</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center h-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-800">
                <div className="text-center">
                  <MapPinIcon className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-white font-medium">Location not available</p>
                  <button
                    onClick={requestLocationPermission}
                    disabled={loadingLocation}
                    className="mt-3 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      width: 'auto',
                      minWidth: '200px',
                      height: '48px',
                      marginTop: '16px',
                      backgroundColor: loadingLocation ? '#6ee7b7' : '#10b981',
                      color: '#ffffff',
                      padding: '0 24px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '14px',
                      border: 'none',
                      cursor: loadingLocation ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      if (!loadingLocation) {
                        e.currentTarget.style.backgroundColor = '#059669';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loadingLocation) {
                        e.currentTarget.style.backgroundColor = '#10b981';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(16, 185, 129, 0.2)';
                      }
                    }}
                  >
                    {loadingLocation ? (
                      <>
                        <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Getting Location...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Enable Location</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Earnings Report Card */}
          {driverVerified && (
            <div className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              
              {/* Header with Period Display */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <ChartBarIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Earnings Overview</h3>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                        📅 {selectedFilter === 'month' 
                          ? `${months.find(m => m.value === selectedMonth)?.name} ${selectedYear}`
                          : `Year ${selectedYear}`}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowEarningsModal(true)}
                  className="group relative overflow-hidden flex items-center justify-center gap-2 bg-emerald-500 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: '0.3s'
                  }}
                >
                  <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  
                  <DocumentArrowDownIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                  <span>View Details</span>
                </button>
              </div>
              
              {/* This Month Highlight */}
              {selectedFilter === 'month' && (
                <div className="mb-3 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                        <span className="text-white text-xs">📆</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          {months.find(m => m.value === selectedMonth)?.name} {selectedYear}
                        </p>
                        <p className="text-[10px] text-gray-500">Current period earnings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{summary.total_driver_payout_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                  <p className="text-xs text-gray-500">Total Earnings</p>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{summary.total_driver_payout_amount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <p className="text-xs text-gray-500">Total Trips</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {summary.trip_count}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Earnings Modal */}
        {showEarningsModal && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9999 p-4" 
            onClick={() => setShowEarningsModal(false)}
          >
            <div 
              className={`max-w-3xl w-full rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl max-h-[85vh] overflow-hidden`} 
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} z-10`}>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Earnings Report</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Detailed breakdown of your earnings</p>
                </div>
                <button 
                  onClick={() => setShowEarningsModal(false)} 
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
                {/* Filter Controls */}
                <div className="mb-6">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setSelectedFilter('month')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: '0.3s',
                        backgroundColor: selectedFilter === 'month'
                          ? '#10b981'
                          : (isDark ? '#374151' : '#f3f4f6'),
                        color: selectedFilter === 'month'
                          ? '#ffffff'
                          : (isDark ? '#d1d5db' : '#4b5563'),
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Monthly View
                    </button>
                    <button
                      onClick={() => setSelectedFilter('year')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: '0.3s',
                        backgroundColor: selectedFilter === 'year'
                          ? '#10b981'
                          : (isDark ? '#374151' : '#f3f4f6'),
                        color: selectedFilter === 'year'
                          ? '#ffffff'
                          : (isDark ? '#d1d5db' : '#4b5563'),
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Yearly View
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Select Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                      >
                        {availableYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedFilter === 'month' && (
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Select Month</label>
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
                        >
                          {months.map(month => (
                            <option key={month.value} value={month.value}>{month.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => fetchPayoutDetails(selectedYear, selectedMonth, selectedFilter)}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      padding: '10px 0',
                      borderRadius: '8px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Apply Filters
                  </button>
                </div>
                
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs text-gray-500">Total Trips</p>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{summary.trip_count}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs text-gray-500">Total Bookings</p>
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{summary.booking_count}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs text-gray-500">Total Fare</p>
                    <p className={`text-xl font-bold text-emerald-500`}>₹{summary.total_fare_amount.toLocaleString()}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs text-gray-500">Commission</p>
                    <p className={`text-xl font-bold text-orange-500`}>₹{summary.total_commission_amount.toLocaleString()}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs text-gray-500">Driver Payout</p>
                    <p className={`text-xl font-bold text-emerald-500`}>₹{summary.total_driver_payout_amount.toLocaleString()}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <p className="text-xs text-gray-500">Pending Payout</p>
                    <p className={`text-xl font-bold text-yellow-500`}>₹{summary.total_pending_payout_amount.toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Items List */}
                {payoutDetails?.items && payoutDetails.items.length > 0 ? (
                  <div className="space-y-2">
                    <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Trip Details</p>
                    {payoutDetails.items.map((item: any, idx: number) => (
                      <div key={idx} className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              Trip #{item.trip_id?.slice(0, 8) || 'N/A'}
                            </p>
                            {item.planned_start_at && (
                              <p className="text-xs text-gray-500">
                                📅 {new Date(item.planned_start_at).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })} • 🕒 {new Date(item.planned_start_at).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-emerald-500">₹{item.driver_payout_amount || 0}</p>
                            <p className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                              item.payout_status === 'paid' 
                                ? 'bg-green-500/20 text-green-600' 
                                : 'bg-yellow-500/20 text-yellow-600'
                            }`}>
                              {item.payout_status === 'paid' ? 'Paid ✓' : 'Pending'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No trips found for this period</p>
                  </div>
                )}
              </div>
              
              <div className={`p-5 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex gap-3 sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                  onClick={downloadEarningsReport}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    padding: '10px 0',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  disabled={downloading}
                  className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 inline mr-2" />
                  {downloading ? 'Downloading...' : 'Download Report'}
                </button>
                <button
                  onClick={() => setShowEarningsModal(false)}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    padding: '10px 0',
                    borderRadius: '8px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  className={`flex-1 py-2 rounded-xl font-semibold transition ${
                    isDark 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;