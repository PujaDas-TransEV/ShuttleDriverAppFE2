// import React, { useState, useEffect } from 'react';
// import { IonPage, IonContent, IonAlert } from '@ionic/react';
// import { useHistory } from 'react-router-dom';
// import NavbarSidebar from '../../users/pages/Navbar';

// import {
//   UserCircleIcon,
//   TruckIcon,
//   IdentificationIcon,
//   CurrencyRupeeIcon,
//   MapIcon,
//   ClockIcon,
//   ExclamationTriangleIcon,
//   ArrowDownTrayIcon,
//   ChartBarIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   WalletIcon,
//   BanknotesIcon,
//   DocumentArrowDownIcon,
//   CameraIcon,
//   BellIcon,

//   MapPinIcon,

// } from '@heroicons/react/24/outline';

// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Capacitor Plugins
// import { Geolocation } from '@capacitor/geolocation';
// import { Camera } from '@capacitor/camera';
// import { LocalNotifications } from '@capacitor/local-notifications';
// import { Capacitor } from '@capacitor/core';

// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// // Custom driver icon
// const driverIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/1995/1995572.png",
//   iconSize: [35, 35],
//   iconAnchor: [17, 35],
//   popupAnchor: [0, -15],
// });

// const LiveLocationUpdater = ({ position }: { position: [number, number] }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (position) map.flyTo(position, 14, { duration: 1 });
//   }, [position, map]);
//   return null;
// };

// const API_BASE = "https://be.shuttleapp.transev.site";

// const Dashboard: React.FC = () => {
//   const history = useHistory();
//   const token = localStorage.getItem('access_token');

//   const [driverVerified, setDriverVerified] = useState(false);
//   const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
//   const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
//   const [driverStats, setDriverStats] = useState<any>(null);
//   const [payoutDetails, setPayoutDetails] = useState<any>(null);
//   const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
//   const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
//   const [showEarningsModal, setShowEarningsModal] = useState(false);
//   const [downloading, setDownloading] = useState(false);
//   const [selectedFilter, setSelectedFilter] = useState<'month' | 'year'>('month');

//   // Permission states
//   const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
//   const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
//   const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);
//   const [showPermissionAlert, setShowPermissionAlert] = useState(false);
//   const [currentPermissionRequest, setCurrentPermissionRequest] = useState<'location' | 'camera' | 'notification' | null>(null);
//   const [permissionMessage, setPermissionMessage] = useState('');
//   const [loadingLocation, setLoadingLocation] = useState(false);

//   const isNative = Capacitor.isNativePlatform();

//   // Available years
//   const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1];
  
//   const months = [
//     { value: '01', name: 'January' },
//     { value: '02', name: 'February' },
//     { value: '03', name: 'March' },
//     { value: '04', name: 'April' },
//     { value: '05', name: 'May' },
//     { value: '06', name: 'June' },
//     { value: '07', name: 'July' },
//     { value: '08', name: 'August' },
//     { value: '09', name: 'September' },
//     { value: '10', name: 'October' },
//     { value: '11', name: 'November' },
//     { value: '12', name: 'December' }
//   ];

//   // ======================
//   // Permission Handlers
//   // ======================
  
//   // Request Location Permission
//   const requestLocationPermission = async () => {
//     if (!isNative) {
//       // Web fallback - use browser geolocation
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => {
//             setDriverPos([pos.coords.latitude, pos.coords.longitude]);
//             setLocationPermissionGranted(true);
//           },
//           (err) => {
//             console.error('Browser GPS error:', err);
//             setPermissionMessage('Please enable location access in your browser settings to use this feature.');
//             setShowPermissionAlert(true);
//           }
//         );
//       }
//       return;
//     }

//     setLoadingLocation(true);
//     try {
//       const permission = await Geolocation.checkPermissions();
      
//       if (permission.location === 'prompt') {
//         const result = await Geolocation.requestPermissions();
//         if (result.location === 'granted') {
//           setLocationPermissionGranted(true);
//           await getCurrentLocation();
//         } else {
//           setPermissionMessage('Location permission is required to track your trips and show your position on the map.');
//           setShowPermissionAlert(true);
//         }
//       } else if (permission.location === 'granted') {
//         setLocationPermissionGranted(true);
//         await getCurrentLocation();
//       } else {
//         setPermissionMessage('Location permission is required. Please enable it in app settings.');
//         setShowPermissionAlert(true);
//       }
//     } catch (error) {
//       console.error('Error requesting location permission:', error);
//       setPermissionMessage('Failed to get location permission. Please check your device settings.');
//       setShowPermissionAlert(true);
//     } finally {
//       setLoadingLocation(false);
//     }
//   };

//   // Get current location
//   const getCurrentLocation = async () => {
//     if (!isNative) {
//       return new Promise((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
//       }).then((pos: any) => {
//         setDriverPos([pos.coords.latitude, pos.coords.longitude]);
//       }).catch((err) => {
//         console.error('Browser GPS error:', err);
//       });
//     }

//     try {
//       const position = await Geolocation.getCurrentPosition({
//         enableHighAccuracy: true,
//         timeout: 15000,
//       });
//       setDriverPos([position.coords.latitude, position.coords.longitude]);
//     } catch (error) {
//       console.error('Error getting location:', error);
//     }
//   };

//   // Request Camera Permission
//   const requestCameraPermission = async () => {
//     if (!isNative) {
//       setCameraPermissionGranted(true);
//       return;
//     }

//     try {
//       const permission = await Camera.checkPermissions();
      
//       if (permission.camera === 'prompt') {
//         const result = await Camera.requestPermissions();
//         if (result.camera === 'granted') {
//           setCameraPermissionGranted(true);
//         } else {
//           setPermissionMessage('Camera permission is required to upload documents and profile pictures.');
//           setShowPermissionAlert(true);
//         }
//       } else if (permission.camera === 'granted') {
//         setCameraPermissionGranted(true);
//       } else {
//         setPermissionMessage('Camera permission is required. Please enable it in app settings.');
//         setShowPermissionAlert(true);
//       }
//     } catch (error) {
//       console.error('Error requesting camera permission:', error);
//     }
//   };

//   // Request Notification Permission
//   const requestNotificationPermission = async () => {
//     if (!isNative) {
//       setNotificationPermissionGranted(true);
//       return;
//     }

//     try {
//       const permission = await LocalNotifications.requestPermissions();
      
//       if (permission.display === 'granted') {
//         setNotificationPermissionGranted(true);
        
//         // Register for push notifications
//         await LocalNotifications.registerActionTypes({
//           types: [
//             {
//               id: 'trip_update',
//               actions: [
//                 { id: 'accept', title: 'Accept' },
//                 { id: 'reject', title: 'Reject', destructive: true }
//               ]
//             }
//           ]
//         });
//       } else {
//         setPermissionMessage('Notification permission is required to receive trip alerts and updates.');
//         setShowPermissionAlert(true);
//       }
//     } catch (error) {
//       console.error('Error requesting notification permission:', error);
//     }
//   };

//   // Show permission prompt
//   const showPermissionPrompt = (type: 'location' | 'camera' | 'notification') => {
//     setCurrentPermissionRequest(type);
//     let message = '';
//     let title = '';
    
//     switch(type) {
//       case 'location':
//         title = 'Location Access Required';
//         message = 'Shuttle needs your location to track your trips, show your position on the map, and provide accurate navigation. This helps us ensure safe and efficient service.';
//         break;
//       case 'camera':
//         title = 'Camera Access Required';
//         message = 'Shuttle needs camera access to capture your documents for KYC verification and update your profile picture.';
//         break;
//       case 'notification':
//         title = 'Notification Access Required';
//         message = 'Shuttle needs notification access to alert you about new trip requests, payment updates, and important announcements.';
//         break;
//     }
    
//     setPermissionMessage(message);
//     setShowPermissionAlert(true);
//   };

//   // Handle permission alert response
//   const handlePermissionAlert = async (action: 'allow' | 'deny') => {
//     setShowPermissionAlert(false);
    
//     if (action === 'allow') {
//       switch(currentPermissionRequest) {
//         case 'location':
//           await requestLocationPermission();
//           break;
//         case 'camera':
//           await requestCameraPermission();
//           break;
//         case 'notification':
//           await requestNotificationPermission();
//           break;
//       }
//     }
    
//     setCurrentPermissionRequest(null);
//   };

//   // Check all permissions on app start
//   const checkAllPermissions = async () => {
//     if (!isNative) {
//       // For web, just use browser geolocation
//       if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
//           (err) => console.error('GPS error:', err)
//         );
//       }
//       setLocationPermissionGranted(true);
//       setCameraPermissionGranted(true);
//       setNotificationPermissionGranted(true);
//       return;
//     }

//     // Check Location
//     const locationStatus = await Geolocation.checkPermissions();
//     if (locationStatus.location === 'granted') {
//       setLocationPermissionGranted(true);
//       await getCurrentLocation();
//     } else if (locationStatus.location === 'prompt') {
//       showPermissionPrompt('location');
//     }

//     // Check Camera
//     const cameraStatus = await Camera.checkPermissions();
//     if (cameraStatus.camera === 'granted') {
//       setCameraPermissionGranted(true);
//     } else if (cameraStatus.camera === 'prompt') {
//       showPermissionPrompt('camera');
//     }

//     // Check Notifications
//     const notificationStatus = await LocalNotifications.checkPermissions();
//     if (notificationStatus.display === 'granted') {
//       setNotificationPermissionGranted(true);
//     } else if (notificationStatus.display === 'prompt') {
//       showPermissionPrompt('notification');
//     }
//   };

//   // Start location tracking interval
//   const startLocationTracking = () => {
//     if (!locationPermissionGranted) return;
    
//     const updatePosition = async () => {
//       if (isNative && locationPermissionGranted) {
//         try {
//           const position = await Geolocation.getCurrentPosition({
//             enableHighAccuracy: true,
//             timeout: 10000,
//           });
//           setDriverPos([position.coords.latitude, position.coords.longitude]);
//         } catch (err) {
//           console.error('GPS error:', err);
//         }
//       } else if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
//           (err) => console.error('GPS error:', err),
//           { enableHighAccuracy: true }
//         );
//       }
//     };
    
//     updatePosition();
//     const interval = setInterval(updatePosition, 30000);
//     return () => clearInterval(interval);
//   };

//   // ======================
//   // Data Fetching
//   // ======================
  
//   // Fetch verification status
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/driver-profile/me`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setDriverVerified(data.verification_status === "verified");
//       } catch (err) {
//         console.error(err);
//         setDriverVerified(false);
//       }
//     };
//     fetchProfile();
//   }, [token]);

//   // Fetch driver stats
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/driver/stats`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setDriverStats(data);
//       } catch (err) {
//         console.error("Error fetching stats:", err);
//       }
//     };
//     fetchStats();
//   }, [token]);

//   // Fetch payout details
//   const fetchPayoutDetails = async (year: string, month: string, filterType: 'month' | 'year' = 'month') => {
//     try {
//       let url = `${API_BASE}/driver/trips/payout-details?`;
      
//       if (filterType === 'month') {
//         url += `from_month=${month}&from_year=${year}&to_month=${month}&to_year=${year}`;
//       } else {
//         url += `from_year=${year}&to_year=${year}`;
//       }
      
//       const res = await fetch(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setPayoutDetails(data);
//     } catch (err) {
//       console.error("Error fetching payout details:", err);
//     }
//   };

//   useEffect(() => {
//     if (driverVerified) {
//       fetchPayoutDetails(selectedYear, selectedMonth, selectedFilter);
//     }
//   }, [driverVerified, selectedYear, selectedMonth, selectedFilter]);

//   // Initialize permissions on mount
//   useEffect(() => {
//     checkAllPermissions();
//   }, []);

//   // Start location tracking when permission is granted
//   useEffect(() => {
//     if (locationPermissionGranted) {
//       const cleanup = startLocationTracking();
//       return cleanup;
//     }
//   }, [locationPermissionGranted]);

//   // Dark mode listener
//   useEffect(() => {
//     const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
//     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
//     return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
//   }, []);

//   // Download earnings report
//   const downloadEarningsReport = async () => {
//     setDownloading(true);
//     try {
//       let url = `${API_BASE}/driver/trips/payout-details?`;
      
//       if (selectedFilter === 'month') {
//         url += `from_month=${selectedMonth}&from_year=${selectedYear}&to_month=${selectedMonth}&to_year=${selectedYear}`;
//       } else {
//         url += `from_year=${selectedYear}&to_year=${selectedYear}`;
//       }
      
//       const response = await fetch(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await response.json();
      
//       const headers = ['Date', 'Trip ID', 'Fare Amount', 'Commission', 'Driver Payout', 'Status'];
//       const rows = data.items?.map((item: any) => [
//         item.trip_date || new Date().toLocaleDateString(),
//         item.trip_id?.slice(0, 8) || 'N/A',
//         item.fare_amount || 0,
//         item.commission_amount || 0,
//         item.driver_payout_amount || 0,
//         item.payout_status || 'Pending'
//       ]) || [];
      
//       const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
//       const blob = new Blob([csvContent], { type: 'text/csv' });
//       const url_blob = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url_blob;
//       a.download = `earnings_${selectedYear}_${selectedMonth}_report.csv`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       URL.revokeObjectURL(url_blob);
//     } catch (err) {
//       console.error("Error downloading report:", err);
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const summary = payoutDetails?.summary || {
//     trip_count: 0,
//     booking_count: 0,
//     total_fare_amount: 0,
//     total_commission_amount: 0,
//     total_driver_payout_amount: 0,
//     total_paid_out_amount: 0,
//     total_pending_payout_amount: 0
//   };

//   // Body scroll lock for modal
//   useEffect(() => {
//     if (showEarningsModal) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [showEarningsModal]);

//   const setupCards = driverVerified
//     ? [
//         { icon: <UserCircleIcon className="w-6 h-6" />, title: 'Profile', path: '/profile-setup', color: 'from-blue-500 to-blue-600' },
//         { icon: <IdentificationIcon className="w-6 h-6" />, title: 'KYC', path: '/kyc-verification', color: 'from-purple-500 to-purple-600' },
//         { icon: <TruckIcon className="w-6 h-6" />, title: 'Vehicle', path: '/vehicle-registration', color: 'from-green-500 to-green-600' }
//       ]
//     : [
//         { icon: <UserCircleIcon className="w-6 h-6" />, title: 'Profile Setup', path: '/profile-setup', color: 'from-blue-500 to-blue-600' },
//         { icon: <IdentificationIcon className="w-6 h-6" />, title: 'KYC', path: '/kyc-verification', color: 'from-purple-500 to-purple-600' },
//         { icon: <TruckIcon className="w-6 h-6" />, title: 'Vehicle', path: '/vehicle-registration', color: 'from-green-500 to-green-600' }
//       ];

//   const quickActions = [
//     { label: '🚍 Start Trip', path: '/start-trip', color: 'from-emerald-500 to-emerald-600', icon: '🚍' },
//     { label: '📍 Live Tracking', path: '/driver-tracking', color: 'from-blue-500 to-blue-600', icon: '📍' },
//     { label: '👥 Passengers', path: '/passenger-list', color: 'from-indigo-500 to-indigo-600', icon: '👥' },
//     { label: '💰 Earnings', path: '#', color: 'from-amber-500 to-amber-600', icon: '💰', onClick: () => setShowEarningsModal(true) },
//   ];

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
//         <div className="p-4 md:p-6 max-w-7xl mx-auto">
          
//           {/* Permission Status Bar */}
//           {isNative && (
//             <div className="mb-4 flex flex-wrap gap-2 justify-center">
//               <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
//                 locationPermissionGranted 
//                   ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
//                   : 'bg-red-500/20 text-red-600 dark:text-red-400'
//               }`}>
//                   <MapPinIcon className="w-3 h-3" />
//                 <span>Location {locationPermissionGranted ? '✓' : '✗'}</span>
//               </div>
//               <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
//                 cameraPermissionGranted 
//                   ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
//                   : 'bg-red-500/20 text-red-600 dark:text-red-400'
//               }`}>
//                 <CameraIcon className="w-3 h-3" />
//                 <span>Camera {cameraPermissionGranted ? '✓' : '✗'}</span>
//               </div>
//               <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
//                 notificationPermissionGranted 
//                   ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
//                   : 'bg-red-500/20 text-red-600 dark:text-red-400'
//               }`}>
//                 <BellIcon className="w-3 h-3" />
//                 <span>Notifications {notificationPermissionGranted ? '✓' : '✗'}</span>
//               </div>
//             </div>
//           )}

//           {/* Header */}
//           <div className="mb-6">
//             <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//               Welcome Back, Driver! 👋
//             </h1>
//             <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
//               Track your trips, earnings, and performance
//             </p>
//           </div>

//           {/* Verification Warning */}
//           {!driverVerified && (
//             <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center gap-3">
//               <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
//               <div>
//                 <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//                   Complete Your Profile
//                 </p>
//                 <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//                   Complete profile, vehicle & KYC to start earning
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Setup Cards */}
//           <div className="grid grid-cols-3 gap-3 mb-6">
//             {setupCards.map((card, i) => (
//               <div
//                 key={i}
//                 onClick={() => history.push(card.path)}
//                 className={`group relative overflow-hidden rounded-2xl bg-linear-to-r ${card.color} p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl`}
//               >
//                 <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
//                 <div className="relative z-10">
//                   <div className="text-white mb-2">{card.icon}</div>
//                   <p className="text-white text-xs font-medium">{card.title}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Stats Cards */}
//           {driverStats && (
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//               <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
//                 <div className="flex items-center justify-between mb-2">
//                   <MapIcon className="w-5 h-5 text-blue-500" />
//                   <span className="text-xs text-gray-400">Total</span>
//                 </div>
//                 <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{driverStats.total_trips || 0}</p>
//                 <p className="text-xs text-gray-500 mt-1">Total Trips</p>
//               </div>
              
//               <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
//                 <div className="flex items-center justify-between mb-2">
//                   <CheckCircleIcon className="w-5 h-5 text-green-500" />
//                   <span className="text-xs text-gray-400">Completed</span>
//                 </div>
//                 <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{driverStats.completed_trips || 0}</p>
//                 <p className="text-xs text-gray-500 mt-1">Completed Trips</p>
//               </div>
              
//               <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
//                 <div className="flex items-center justify-between mb-2">
//                   <XCircleIcon className="w-5 h-5 text-red-500" />
//                   <span className="text-xs text-gray-400">Cancelled</span>
//                 </div>
//                 <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{driverStats.cancelled_trips || 0}</p>
//                 <p className="text-xs text-gray-500 mt-1">Cancelled Trips</p>
//               </div>
              
//               <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
//                 <div className="flex items-center justify-between mb-2">
//                   <CurrencyRupeeIcon className="w-5 h-5 text-emerald-500" />
//                   <span className="text-xs text-gray-400">Earnings</span>
//                 </div>
//                 <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//                   ₹{driverStats.trips?.reduce((sum: number, t: any) => sum + (t.earning || 0), 0).toLocaleString() || 0}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
//               </div>
//             </div>
//           )}

//           {/* Payout Summary Cards */}
//           {driverVerified && summary.total_driver_payout_amount > 0 && (
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//               <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-emerald-500`}>
//                 <div className="flex items-center gap-2 mb-1">
//                   <BanknotesIcon className="w-4 h-4 text-emerald-500" />
//                   <p className="text-xs text-gray-500">Total Payout</p>
//                 </div>
//                 <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//                   ₹{summary.total_driver_payout_amount.toLocaleString()}
//                 </p>
//               </div>
              
//               <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-green-500`}>
//                 <div className="flex items-center gap-2 mb-1">
//                   <CheckCircleIcon className="w-4 h-4 text-green-500" />
//                   <p className="text-xs text-gray-500">Paid Out</p>
//                 </div>
//                 <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//                   ₹{summary.total_paid_out_amount.toLocaleString()}
//                 </p>
//               </div>
              
//               <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-yellow-500`}>
//                 <div className="flex items-center gap-2 mb-1">
//                   <ClockIcon className="w-4 h-4 text-yellow-500" />
//                   <p className="text-xs text-gray-500">Pending</p>
//                 </div>
//                 <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//                   ₹{summary.total_pending_payout_amount.toLocaleString()}
//                 </p>
//               </div>
              
//               <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-blue-500`}>
//                 <div className="flex items-center gap-2 mb-1">
//                   <WalletIcon className="w-4 h-4 text-blue-500" />
//                   <p className="text-xs text-gray-500">Total Trips</p>
//                 </div>
//                 <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//                   {summary.trip_count}
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* Map Section */}
//           <div className={`mb-6 rounded-2xl overflow-hidden shadow-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} relative group`} style={{ height: '360px', width: '100%' }}>
            
//             <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent z-5 pointer-events-none rounded-2xl"></div>
            
//             {/* Top Status Bar */}
//             <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none">
//               <div className="flex justify-between items-center">
//                 <div className="bg-linear-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-white/20">
//                   <div className="flex items-center gap-2">
//                     <div className="relative">
//                       <div className="w-2 h-2 bg-white rounded-full animate-ping absolute"></div>
//                       <div className="w-2 h-2 bg-white rounded-full"></div>
//                     </div>
//                     <span className="text-white text-xs font-bold tracking-wide">LIVE TRACKING</span>
//                   </div>
//                 </div>
//                 <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-white/10">
//                   <div className="flex items-center gap-1">
//                     <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
//                     <span className="text-white text-xs font-mono">
//                       {driverPos ? `${driverPos[0].toFixed(4)}°, ${driverPos[1].toFixed(4)}°` : 'Fetching...'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {loadingLocation ? (
//               <div className="flex flex-col justify-center items-center h-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-800">
//                 <div className="text-center">
//                   <div className="relative">
//                     <div className="w-20 h-20 mx-auto mb-4 relative">
//                       <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
//                       <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-emerald-500 animate-spin"></div>
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <MapPinIcon className="w-8 h-8 text-white" />
//                       </div>
//                     </div>
//                     <p className="text-white font-semibold text-lg">Requesting Location...</p>
//                     <p className="text-gray-400 text-sm mt-2">Please allow location access</p>
//                   </div>
//                 </div>
//               </div>
//             ) : driverPos ? (
//               <MapContainer 
//                 center={driverPos} 
//                 zoom={15} 
//                 style={{ height: '100%', width: '100%' }}
//                 zoomControl={true}
//                 className="leaflet-container"
//               >
//                 <TileLayer
//                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
//                   url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
//                 />
                
//                 <LiveLocationUpdater position={driverPos} />
                
//                 <Marker position={driverPos} icon={driverIcon}>
//                   <Popup>
//                     <div className="text-center min-w-[180px]">
//                       <div className="flex items-center justify-center gap-2 mb-2">
//                         <div className="w-10 h-10 bg-linear-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
//                           <span className="text-xl">🚗</span>
//                         </div>
//                         <div>
//                           <p className="font-bold text-gray-800">Your Location</p>
//                           <p className="text-xs text-emerald-600 font-semibold">Active Now</p>
//                         </div>
//                       </div>
//                       <div className="border-t border-gray-200 pt-2 text-xs text-gray-500">
//                         <p>📍 Lat: {driverPos[0].toFixed(6)}</p>
//                         <p>📍 Lng: {driverPos[1].toFixed(6)}</p>
//                       </div>
//                     </div>
//                   </Popup>
//                 </Marker>
//               </MapContainer>
//             ) : (
//               <div className="flex flex-col justify-center items-center h-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-800">
//                 <div className="text-center">
//                   <div className="relative">
//                     <div className="w-20 h-20 mx-auto mb-4 relative">
//                       <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
//                       <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-emerald-500 animate-spin"></div>
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <MapPinIcon className="w-8 h-8 text-white" />
//                       </div>
//                     </div>
//                     <p className="text-white font-semibold text-lg">Getting your location...</p>
//                     <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your position</p>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {/* Bottom Info Bar */}
//             <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
//               <div className="bg-linear-to-r from-black/70 to-black/50 backdrop-blur-md rounded-xl px-3 py-2 flex justify-between items-center border border-white/10">
//                 <div className="flex items-center gap-2">
//                   <div className="relative">
//                     <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute"></div>
//                     <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                   </div>
//                   <span className="text-white text-xs font-medium">
//                     {locationPermissionGranted ? 'GPS Signal Strong' : 'Location Disabled'}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   {!locationPermissionGranted && (
//                     <button
//                       onClick={() => showPermissionPrompt('location')}
//                       style={{
//                         background: '#10b981',
//                         color: 'white',
//                         border: 'none',
//                         borderRadius: '20px',
//                         padding: '4px 12px',
//                         fontSize: '10px',
//                         fontWeight: '500',
//                         cursor: 'pointer'
//                       }}
//                     >
//                       Enable Location
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Earnings Report Card */}
//           {driverVerified && (
//             <div className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
//               <div className="flex items-center justify-between mb-4">
//                 <div className="flex items-center gap-2">
//                   <ChartBarIcon className="w-5 h-5 text-emerald-500" />
//                   <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Earnings Overview</h3>
//                 </div>
//                 <button
//                   onClick={() => setShowEarningsModal(true)}
//                   style={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     gap: '8px',
//                     padding: '6px 12px',
//                     backgroundColor: '#10b981',
//                     color: '#ffffff',
//                     borderRadius: '8px',
//                     fontSize: '12px',
//                     fontWeight: '600',
//                     border: 'none',
//                     cursor: 'pointer',
//                     transition: '0.3s'
//                   }}
//                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
//                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
//                 >
//                   <DocumentArrowDownIcon style={{ width: '16px', height: '16px' }} />
//                   View Details
//                 </button>
//               </div>
              
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center p-3 rounded-xl bg-emerald-500/10">
//                   <p className="text-xs text-gray-500">Total Earnings</p>
//                   <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//                     ₹{summary.total_driver_payout_amount.toLocaleString()}
//                   </p>
//                 </div>
//                 <div className="text-center p-3 rounded-xl bg-blue-500/10">
//                   <p className="text-xs text-gray-500">Total Trips</p>
//                   <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
//                     {summary.trip_count}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Earnings Modal */}
//         {showEarningsModal && (
//           <div 
//             className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-9999 p-4" 
//             onClick={() => setShowEarningsModal(false)}
//             style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
//           >
//             <div 
//               className={`max-w-3xl w-full rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl max-h-[85vh] overflow-hidden`} 
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className={`p-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center sticky top-0 ${isDark ? 'bg-gray-800' : 'bg-white'} z-10`}>
//                 <div>
//                   <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Earnings Report</h2>
//                   <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Detailed breakdown of your earnings</p>
//                 </div>
//                 <button 
//                   onClick={() => setShowEarningsModal(false)} 
//                   className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition"
//                 >
//                   ✕
//                 </button>
//               </div>
              
//               <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
//                 {/* Filter Controls */}
//                 <div className="mb-6">
//                   <div className="flex gap-2 mb-4">
//                     <button
//                       onClick={() => setSelectedFilter('month')}
//                       style={{
//                         padding: '8px 16px',
//                         borderRadius: '8px',
//                         fontSize: '14px',
//                         fontWeight: '500',
//                         transition: '0.3s',
//                         backgroundColor: selectedFilter === 'month'
//                           ? '#10b981'
//                           : (isDark ? '#374151' : '#f3f4f6'),
//                         color: selectedFilter === 'month'
//                           ? '#ffffff'
//                           : (isDark ? '#d1d5db' : '#4b5563'),
//                         border: 'none',
//                         cursor: 'pointer'
//                       }}
//                     >
//                       Monthly View
//                     </button>
//                     <button
//                       onClick={() => setSelectedFilter('year')}
//                       style={{
//                         padding: '8px 16px',
//                         borderRadius: '8px',
//                         fontSize: '14px',
//                         fontWeight: '500',
//                         transition: '0.3s',
//                         backgroundColor: selectedFilter === 'year'
//                           ? '#10b981'
//                           : (isDark ? '#374151' : '#f3f4f6'),
//                         color: selectedFilter === 'year'
//                           ? '#ffffff'
//                           : (isDark ? '#d1d5db' : '#4b5563'),
//                         border: 'none',
//                         cursor: 'pointer'
//                       }}
//                     >
//                       Yearly View
//                     </button>
//                   </div>
                  
//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
//                         Select Year
//                       </label>
//                       <select
//                         value={selectedYear}
//                         onChange={(e) => setSelectedYear(e.target.value)}
//                         className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
//                       >
//                         {availableYears.map(year => (
//                           <option key={year} value={year}>{year}</option>
//                         ))}
//                       </select>
//                     </div>
                    
//                     {selectedFilter === 'month' && (
//                       <div>
//                         <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
//                           Select Month
//                         </label>
//                         <select
//                           value={selectedMonth}
//                           onChange={(e) => setSelectedMonth(e.target.value)}
//                           className={`w-full px-3 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
//                         >
//                           {months.map(month => (
//                             <option key={month.value} value={month.value}>{month.name}</option>
//                           ))}
//                         </select>
//                       </div>
//                     )}
//                   </div>
                  
//                   <button
//                     onClick={() => fetchPayoutDetails(selectedYear, selectedMonth, selectedFilter)}
//                     style={{
//                       width: '100%',
//                       marginTop: '12px',
//                       backgroundColor: '#10b981',
//                       color: '#ffffff',
//                       padding: '10px 0',
//                       borderRadius: '8px',
//                       fontWeight: '600',
//                       border: 'none',
//                       cursor: 'pointer'
//                     }}
//                   >
//                     Apply Filters
//                   </button>
//                 </div>
                
//                 {/* Summary Cards */}
//                 <div className="grid grid-cols-2 gap-3 mb-6">
//                   <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <p className="text-xs text-gray-500">Total Trips</p>
//                     <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{summary.trip_count}</p>
//                   </div>
//                   <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <p className="text-xs text-gray-500">Total Bookings</p>
//                     <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{summary.booking_count}</p>
//                   </div>
//                   <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <p className="text-xs text-gray-500">Total Fare</p>
//                     <p className={`text-xl font-bold text-emerald-500`}>₹{summary.total_fare_amount.toLocaleString()}</p>
//                   </div>
//                   <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <p className="text-xs text-gray-500">Commission</p>
//                     <p className={`text-xl font-bold text-orange-500`}>₹{summary.total_commission_amount.toLocaleString()}</p>
//                   </div>
//                   <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <p className="text-xs text-gray-500">Driver Payout</p>
//                     <p className={`text-xl font-bold text-emerald-500`}>₹{summary.total_driver_payout_amount.toLocaleString()}</p>
//                   </div>
//                   <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                     <p className="text-xs text-gray-500">Pending Payout</p>
//                     <p className={`text-xl font-bold text-yellow-500`}>₹{summary.total_pending_payout_amount.toLocaleString()}</p>
//                   </div>
//                 </div>
                
//                 {/* Items List */}
//                 {payoutDetails?.items && payoutDetails.items.length > 0 ? (
//                   <div className="space-y-2">
//                     <p className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Trip Details</p>
//                     {payoutDetails.items.map((item: any, idx: number) => (
//                       <div key={idx} className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
//                         <div className="flex justify-between items-center">
//                           <div>
//                             <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
//                               Trip #{item.trip_id?.slice(0, 8) || 'N/A'}
//                             </p>
//                             <p className="text-xs text-gray-500">{item.trip_date || 'Date not available'}</p>
//                           </div>
//                           <div className="text-right">
//                             <p className="text-lg font-bold text-emerald-500">₹{item.driver_payout_amount || 0}</p>
//                             <p className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
//                               item.payout_status === 'paid' 
//                                 ? 'bg-green-500/20 text-green-600' 
//                                 : 'bg-yellow-500/20 text-yellow-600'
//                             }`}>
//                               {item.payout_status === 'paid' ? 'Paid ✓' : 'Pending'}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <p className="text-gray-500">No trips found for this period</p>
//                   </div>
//                 )}
//               </div>
              
//               <div className={`p-5 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex gap-3 sticky bottom-0 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
//                 <button
//                   onClick={downloadEarningsReport}
//                   disabled={downloading}
//                   className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
//                 >
//                   <ArrowDownTrayIcon className="w-4 h-4 inline mr-2" />
//                   {downloading ? 'Downloading...' : 'Download Report'}
//                 </button>
//                 <button
//                   onClick={() => setShowEarningsModal(false)}
//                   style={{ height: '45px', width: '120px' }}
//                   className={`flex-1 py-2 rounded-xl font-semibold transition ${
//                     isDark 
//                       ? 'bg-gray-700 text-white hover:bg-gray-600' 
//                       : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
//                   }`}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Permission Alert Dialog */}
//         <IonAlert
//           isOpen={showPermissionAlert}
//           onDidDismiss={() => setShowPermissionAlert(false)}
//           header="Permission Required"
//           message={permissionMessage}
//           buttons={[
//             {
//               text: 'Deny',
//               role: 'cancel',
//               handler: () => handlePermissionAlert('deny')
//             },
//             {
//               text: 'Allow',
//               handler: () => handlePermissionAlert('allow')
//             }
//           ]}
//         />
//       </IonContent>
//     </IonPage>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { IonPage, IonContent, IonAlert } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences'; // Add this import
import NavbarSidebar from '../../users/pages/Navbar';

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

// Capacitor Plugins
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom driver icon
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

  const [driverVerified, setDriverVerified] = useState(false);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [driverStats, setDriverStats] = useState<any>(null);
  const [payoutDetails, setPayoutDetails] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
  const [showEarningsModal, setShowEarningsModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'month' | 'year'>('month');

  // Permission states
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [currentPermissionRequest, setCurrentPermissionRequest] = useState<'location' | 'camera' | 'notification' | null>(null);
  const [permissionMessage, setPermissionMessage] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [permissionQueue, setPermissionQueue] = useState<Array<'location' | 'camera' | 'notification'>>([]);

  const isNative = Capacitor.isNativePlatform();

  // Available years
  const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1];
  
  const months = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' }
  ];

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
    };
    loadToken();
  }, []);

  // ======================
  // Permission Handlers with Queue System
  // ======================
  
  const processNextPermission = async () => {
    if (permissionQueue.length === 0) return;
    
    const nextPermission = permissionQueue[0];
    setCurrentPermissionRequest(nextPermission);
    
    let title = '';
    let message = '';
    
    switch(nextPermission) {
      case 'location':
        title = '📍 Location Access Required';
        message = 'Shuttle needs your location to track your trips, show your position on the map, and provide accurate navigation. This helps us ensure safe and efficient service.';
        break;
      case 'camera':
        title = '📸 Camera Access Required';
        message = 'Shuttle needs camera access to capture your documents for KYC verification and update your profile picture.';
        break;
      case 'notification':
        title = '🔔 Notification Access Required';
        message = 'Shuttle needs notification access to alert you about new trip requests, payment updates, and important announcements.';
        break;
    }
    
    setPermissionMessage(message);
    setShowPermissionAlert(true);
  };

  // Request Location Permission
  const requestLocationPermission = async () => {
    if (!isNative) {
      // Web fallback - use browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setDriverPos([pos.coords.latitude, pos.coords.longitude]);
            setLocationPermissionGranted(true);
          },
          (err) => {
            console.error('Browser GPS error:', err);
            setPermissionMessage('Please enable location access in your browser settings to use this feature.');
            setShowPermissionAlert(true);
          }
        );
      }
      return;
    }

    setLoadingLocation(true);
    try {
      const permission = await Geolocation.checkPermissions();
      
      if (permission.location === 'prompt') {
        const result = await Geolocation.requestPermissions();
        if (result.location === 'granted') {
          setLocationPermissionGranted(true);
          await getCurrentLocation();
        }
      } else if (permission.location === 'granted') {
        setLocationPermissionGranted(true);
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    } finally {
      setLoadingLocation(false);
      // Remove from queue and process next
      setPermissionQueue(prev => prev.slice(1));
      processNextPermission();
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    if (!isNative) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      }).then((pos: any) => {
        setDriverPos([pos.coords.latitude, pos.coords.longitude]);
      }).catch((err) => {
        console.error('Browser GPS error:', err);
      });
    }

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      setDriverPos([position.coords.latitude, position.coords.longitude]);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  // Request Camera Permission
  const requestCameraPermission = async () => {
    if (!isNative) {
      setCameraPermissionGranted(true);
      setPermissionQueue(prev => prev.slice(1));
      processNextPermission();
      return;
    }

    try {
      const permission = await Camera.checkPermissions();
      
      if (permission.camera === 'prompt') {
        const result = await Camera.requestPermissions();
        if (result.camera === 'granted') {
          setCameraPermissionGranted(true);
        }
      } else if (permission.camera === 'granted') {
        setCameraPermissionGranted(true);
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
    } finally {
      setPermissionQueue(prev => prev.slice(1));
      processNextPermission();
    }
  };

  // Request Notification Permission
  const requestNotificationPermission = async () => {
    if (!isNative) {
      setNotificationPermissionGranted(true);
      setPermissionQueue(prev => prev.slice(1));
      processNextPermission();
      return;
    }

    try {
      const permission = await LocalNotifications.checkPermissions();
      
      if (permission.display === 'prompt') {
        const result = await LocalNotifications.requestPermissions();
        if (result.display === 'granted') {
          setNotificationPermissionGranted(true);
          
          // Register for push notifications
          await LocalNotifications.registerActionTypes({
            types: [
              {
                id: 'trip_update',
                actions: [
                  { id: 'accept', title: 'Accept' },
                  { id: 'reject', title: 'Reject', destructive: true }
                ]
              }
            ]
          });
        }
      } else if (permission.display === 'granted') {
        setNotificationPermissionGranted(true);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    } finally {
      setPermissionQueue(prev => prev.slice(1));
      processNextPermission();
    }
  };

  // Show sequential permission prompts
  const showSequentialPermissions = () => {
    const permissionsToRequest: Array<'location' | 'camera' | 'notification'> = [];
    
    if (!locationPermissionGranted) permissionsToRequest.push('location');
    if (!cameraPermissionGranted) permissionsToRequest.push('camera');
    if (!notificationPermissionGranted) permissionsToRequest.push('notification');
    
    if (permissionsToRequest.length > 0) {
      setPermissionQueue(permissionsToRequest);
      processNextPermission();
    }
  };

  // Handle permission alert response
  const handlePermissionAlert = async (action: 'allow' | 'deny') => {
    setShowPermissionAlert(false);
    
    if (action === 'allow' && currentPermissionRequest) {
      switch(currentPermissionRequest) {
        case 'location':
          await requestLocationPermission();
          break;
        case 'camera':
          await requestCameraPermission();
          break;
        case 'notification':
          await requestNotificationPermission();
          break;
      }
    } else {
      // User denied, just move to next permission
      setPermissionQueue(prev => prev.slice(1));
      processNextPermission();
    }
    
    setCurrentPermissionRequest(null);
  };

  // Check all permissions on app start
  const checkAllPermissions = async () => {
    if (!isNative) {
      // For web, just use browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
          (err) => console.error('GPS error:', err)
        );
      }
      setLocationPermissionGranted(true);
      setCameraPermissionGranted(true);
      setNotificationPermissionGranted(true);
      return;
    }

    // Check Location
    const locationStatus = await Geolocation.checkPermissions();
    if (locationStatus.location === 'granted') {
      setLocationPermissionGranted(true);
      await getCurrentLocation();
    }

    // Check Camera
    const cameraStatus = await Camera.checkPermissions();
    if (cameraStatus.camera === 'granted') {
      setCameraPermissionGranted(true);
    }

    // Check Notifications
    const notificationStatus = await LocalNotifications.checkPermissions();
    if (notificationStatus.display === 'granted') {
      setNotificationPermissionGranted(true);
    }

    // Show sequential permissions for missing ones
    showSequentialPermissions();
  };

  // Start location tracking interval
  const startLocationTracking = () => {
    if (!locationPermissionGranted) return;
    
    const updatePosition = async () => {
      if (isNative && locationPermissionGranted) {
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
  };

  // ======================
  // Data Fetching
  // ======================
  
  // Fetch verification status
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/driver-profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDriverVerified(data.verification_status === "verified");
      } catch (err) {
        console.error(err);
        setDriverVerified(false);
      }
    };
    fetchProfile();
  }, [token]);

  // Fetch driver stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/driver/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDriverStats(data);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [token]);

  // Fetch payout details
  const fetchPayoutDetails = async (year: string, month: string, filterType: 'month' | 'year' = 'month') => {
    if (!token) return;
    try {
      let url = `${API_BASE}/driver/trips/payout-details?`;
      
      if (filterType === 'month') {
        url += `from_month=${month}&from_year=${year}&to_month=${month}&to_year=${year}`;
      } else {
        url += `from_year=${year}&to_year=${year}`;
      }
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPayoutDetails(data);
    } catch (err) {
      console.error("Error fetching payout details:", err);
    }
  };

  useEffect(() => {
    if (driverVerified && token) {
      fetchPayoutDetails(selectedYear, selectedMonth, selectedFilter);
    }
  }, [driverVerified, selectedYear, selectedMonth, selectedFilter, token]);

  // Initialize permissions on mount
  useEffect(() => {
    checkAllPermissions();
  }, []);

  // Start location tracking when permission is granted
  useEffect(() => {
    if (locationPermissionGranted) {
      const cleanup = startLocationTracking();
      return cleanup;
    }
  }, [locationPermissionGranted]);

  // Dark mode listener
  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, []);

  // Download earnings report
  const downloadEarningsReport = async () => {
    if (!token) return;
    setDownloading(true);
    try {
      let url = `${API_BASE}/driver/trips/payout-details?`;
      
      if (selectedFilter === 'month') {
        url += `from_month=${selectedMonth}&from_year=${selectedYear}&to_month=${selectedMonth}&to_year=${selectedYear}`;
      } else {
        url += `from_year=${selectedYear}&to_year=${selectedYear}`;
      }
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    } catch (err) {
      console.error("Error downloading report:", err);
    } finally {
      setDownloading(false);
    }
  };

  const summary = payoutDetails?.summary || {
    trip_count: 0,
    booking_count: 0,
    total_fare_amount: 0,
    total_commission_amount: 0,
    total_driver_payout_amount: 0,
    total_paid_out_amount: 0,
    total_pending_payout_amount: 0
  };

  // Body scroll lock for modal
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

  const setupCards = driverVerified
    ? [
        { icon: <UserCircleIcon className="w-6 h-6" />, title: 'Profile', path: '/profile-setup', color: 'from-blue-500 to-blue-600' },
        { icon: <IdentificationIcon className="w-6 h-6" />, title: 'KYC', path: '/kyc-verification', color: 'from-purple-500 to-purple-600' },
        { icon: <TruckIcon className="w-6 h-6" />, title: 'Vehicle', path: '/vehicle-registration', color: 'from-green-500 to-green-600' }
      ]
    : [
        { icon: <UserCircleIcon className="w-6 h-6" />, title: 'Profile Setup', path: '/profile-setup', color: 'from-blue-500 to-blue-600' },
        { icon: <IdentificationIcon className="w-6 h-6" />, title: 'KYC', path: '/kyc-verification', color: 'from-purple-500 to-purple-600' },
        { icon: <TruckIcon className="w-6 h-6" />, title: 'Vehicle', path: '/vehicle-registration', color: 'from-green-500 to-green-600' }
      ];

  const quickActions = [
    { label: '🚍 Start Trip', path: '/start-trip', color: 'from-emerald-500 to-emerald-600', icon: '🚍' },
    { label: '📍 Live Tracking', path: '/driver-tracking', color: 'from-blue-500 to-blue-600', icon: '📍' },
    { label: '👥 Passengers', path: '/passenger-list', color: 'from-indigo-500 to-indigo-600', icon: '👥' },
    { label: '💰 Earnings', path: '#', color: 'from-amber-500 to-amber-600', icon: '💰', onClick: () => setShowEarningsModal(true) },
  ];

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          
          {/* Permission Status Bar */}
          {isNative && (
            <div className="mb-4 flex flex-wrap gap-2 justify-center">
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                locationPermissionGranted 
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer'
              }`} onClick={() => !locationPermissionGranted && showSequentialPermissions()}>
                <MapPinIcon className="w-3 h-3" />
                <span>Location {locationPermissionGranted ? '✓' : '✗'}</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                cameraPermissionGranted 
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer'
              }`} onClick={() => !cameraPermissionGranted && showSequentialPermissions()}>
                <CameraIcon className="w-3 h-3" />
                <span>Camera {cameraPermissionGranted ? '✓' : '✗'}</span>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs ${
                notificationPermissionGranted 
                  ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                  : 'bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer'
              }`} onClick={() => !notificationPermissionGranted && showSequentialPermissions()}>
                <BellIcon className="w-3 h-3" />
                <span>Notifications {notificationPermissionGranted ? '✓' : '✗'}</span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-4">
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-black' : 'text-gray-800'}`}>
              Welcome, Driver! 👋
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
              Track your trips, earnings, and performance
            </p>
          </div>

          {/* Verification Warning */}
          {!driverVerified && (
            <div className="mb-6 p-4 rounded-2xl bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
              <div>
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Complete Your Profile
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Complete profile, vehicle & KYC to start earning
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

          {/* Stats Cards */}
          {driverStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <MapIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-xs text-gray-400">Total</span>
                </div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{driverStats.total_trips || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Total Trips</p>
              </div>
              
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="text-xs text-gray-400">Completed</span>
                </div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{driverStats.completed_trips || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Completed Trips</p>
              </div>
              
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                  <span className="text-xs text-gray-400">Cancelled</span>
                </div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{driverStats.cancelled_trips || 0}</p>
                <p className="text-xs text-gray-500 mt-1">Cancelled Trips</p>
              </div>
              
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <CurrencyRupeeIcon className="w-5 h-5 text-emerald-500" />
                  <span className="text-xs text-gray-400">Earnings</span>
                </div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  ₹{driverStats.trips?.reduce((sum: number, t: any) => sum + (t.earning || 0), 0).toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Total Earnings</p>
              </div>
            </div>
          )}

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
          <div className={`mb-6 rounded-2xl overflow-hidden shadow-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} relative group`} style={{ height: '360px', width: '100%' }}>
            
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent z-5 pointer-events-none rounded-2xl"></div>
            
            {/* Top Status Bar */}
            <div className="absolute top-3 left-3 right-3 z-10 pointer-events-none">
              <div className="flex justify-between items-center">
                <div className="bg-linear-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping absolute"></div>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-white text-xs font-bold tracking-wide">LIVE TRACKING</span>
                  </div>
                </div>
                <div className="bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 shadow-lg border border-white/10">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-mono">
                      {driverPos ? `${driverPos[0].toFixed(4)}°, ${driverPos[1].toFixed(4)}°` : 'Fetching...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {loadingLocation ? (
              <div className="flex flex-col justify-center items-center h-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-800">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-emerald-500 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPinIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-white font-semibold text-lg">Requesting Location...</p>
                    <p className="text-gray-400 text-sm mt-2">Please allow location access</p>
                  </div>
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
            ) : (
              <div className="flex flex-col justify-center items-center h-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-800">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-emerald-500 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MapPinIcon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-white font-semibold text-lg">Getting your location...</p>
                    <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your position</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bottom Info Bar */}
            <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
              <div className="bg-linear-to-r from-black/70 to-black/50 backdrop-blur-md rounded-xl px-3 py-2 flex justify-between items-center border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute"></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                  <span className="text-white text-xs font-medium">
                    {locationPermissionGranted ? 'GPS Signal Strong' : 'Location Disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {!locationPermissionGranted && (
                    <button
                      onClick={() => showSequentialPermissions()}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '10px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Enable Location
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Report Card */}
          {driverVerified && (
            <div className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-emerald-500" />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Earnings Overview</h3>
                </div>
                <button
                  onClick={() => setShowEarningsModal(true)}
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
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  <DocumentArrowDownIcon style={{ width: '16px', height: '16px' }} />
                  View Details
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl bg-emerald-500/10">
                  <p className="text-xs text-gray-500">Total Earnings</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    ₹{summary.total_driver_payout_amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-500/10">
                  <p className="text-xs text-gray-500">Total Trips</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
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
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
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
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Select Year
                      </label>
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
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Select Month
                        </label>
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
                         <div>
  {item.planned_start_at ? (
    <>
      <p className="text-xs text-gray-500">
        📅 {new Date(item.planned_start_at).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        🕒 {new Date(item.planned_start_at).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}
      </p>
    </>
  ) : (
    <p className="text-xs text-gray-500">Date not available</p>
  )}
</div>
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
                  disabled={downloading}
                  className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  <ArrowDownTrayIcon className="w-4 h-4 inline mr-2" />
                  {downloading ? 'Downloading...' : 'Download Report'}
                </button>
                <button
                  onClick={() => setShowEarningsModal(false)}
                  style={{ height: '45px', width: '120px' }}
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

        {/* Permission Alert Dialog */}
        <IonAlert
          isOpen={showPermissionAlert}
          onDidDismiss={() => setShowPermissionAlert(false)}
          header="Permission Required"
          message={permissionMessage}
          buttons={[
            {
              text: 'Deny',
              role: 'cancel',
              handler: () => handlePermissionAlert('deny')
            },
            {
              text: 'Allow',
              handler: () => handlePermissionAlert('allow')
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;