// import React, { useState, useEffect } from 'react';
// import { IonPage, IonContent } from '@ionic/react';
// import { useHistory } from 'react-router-dom';
// import NavbarSidebar from '../../users/pages/Navbar';

// import {
//   UserCircleIcon,
//   TruckIcon,
//   IdentificationIcon,
//   CurrencyRupeeIcon,
//   MapIcon,
//   UsersIcon,
//   ClockIcon,
//   ExclamationTriangleIcon
// } from '@heroicons/react/24/outline';

// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// const LiveLocationUpdater = ({ position }: { position: [number, number] }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (position) {
//       map.setView(position, map.getZoom(), { animate: true });
//     }
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

//   // Dark mode listener
//   useEffect(() => {
//     const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
//     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
//     return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
//   }, []);

//   // Get driver location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       const updatePosition = () => {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
//           (err) => console.error('GPS error:', err),
//           { enableHighAccuracy: true }
//         );
//       };
//       updatePosition();
//       const interval = setInterval(updatePosition, 120000);
//       return () => clearInterval(interval);
//     }
//   }, []);

//   // Setup buttons logic based on verification status
//   const setupCards = driverVerified
//     ? [
//         { icon: <UserCircleIcon className="w-8 h-8 mb-2 text-blue-400" />, title: 'View Profile', path: '/profile-setup' },
    
//         { icon: <IdentificationIcon className="w-8 h-8 mb-2 text-purple-400" />, title: 'View KYC Details', path: '/kyc-verification' },
//            { icon: <TruckIcon className="w-8 h-8 mb-2 text-green-400" />, title: 'Add Vehicle', path: '/vehicle-registration' }
//       ]
//     : [
//         { icon: <UserCircleIcon className="w-8 h-8 mb-2 text-blue-400" />, title: 'Profile Setup', path: '/profile-setup' },
     
//         { icon: <IdentificationIcon className="w-8 h-8 mb-2 text-purple-400" />, title: 'KYC Verification', path: '/kyc-verification' },
//            { icon: <TruckIcon className="w-8 h-8 mb-2 text-green-400" />, title: 'Vehicle Registration', path: '/vehicle-registration' }
//       ];

//   const stats = [
//     { icon: <MapIcon className="w-5 h-5 text-blue-400" />, label: 'Trips', value: '5' },
//     { icon: <CurrencyRupeeIcon className="w-5 h-5 text-green-400" />, label: 'Earnings', value: '₹12,500' },
//     { icon: <UsersIcon className="w-5 h-5 text-purple-400" />, label: 'Passengers', value: '48' },
//     { icon: <ClockIcon className="w-5 h-5 text-orange-400" />, label: 'Active Trips', value: '3' },
//   ];

//   const quickActions = [
//     { label: '🚍 Start Trip', path: '/start-trip', color: 'bg-black' },
//     { label: '📍 Setup Route', path: '/setup-route', color: 'bg-gray-800' },
//     { label: '👥 Passenger List', path: '/passenger-list', color: 'bg-gray-700' },
//     { label: '💰 Earnings Report', path: '/earnings-report', color: 'bg-gray-900' },
//   ];

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className={`${isDark ? 'bg-gray-900' : 'bg-white'} pt-16`}>
//         <div className="p-5">
//           {/* HEADER */}
//           <div className="mb-6">
//             <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Driver Dashboard</h1>
//             <p className={`${isDark ? 'text-gray-500' : 'text-gray-600'} text-m`}>
//               Manage your trips & earnings efficiently
//             </p>
//           </div>

//           {/* ALERT - only show if not verified */}
//           {!driverVerified && (
//             <div className={`mb-6 p-3 rounded-xl flex items-center border ${isDark ? 'bg-yellow-800/20 border-yellow-400 text-white' : 'bg-yellow-100 border-yellow-500 text-black'}`}>
//               <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-400" />
//               Complete Profile, Vehicle & KYC to start trips
//             </div>
//           )}

//           {/* SETUP BUTTONS - always visible */}
//           <div className="grid grid-cols-3 gap-3 mb-6">
//             {setupCards.map((card, i) => (
//               <div
//                 key={i}
//                 onClick={() => history.push(card.path)}
//                 className={`p-3 rounded-xl text-center cursor-pointer transition hover:scale-105 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
//               >
//                 {card.icon}
//                 <p className="text-xs">{card.title}</p>
//               </div>
//             ))}
//           </div>

//           {/* STATS */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//             {stats.map((s, i) => (
//               <div key={i} className={`p-3 rounded-xl text-center transition ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}>
//                 <div className="flex justify-center mb-1">{s.icon}</div>
//                 <p className="text-xs text-gray-400">{s.label}</p>
//                 <p className="font-bold">{s.value}</p>
//               </div>
//             ))}
//           </div>

//           {/* LIVE DRIVER MAP */}
//           <div className="mb-6 rounded-xl overflow-hidden border border-gray-700" style={{ height: '300px', width: '100%' }}>
//             {driverPos ? (
//               <MapContainer center={driverPos} zoom={15} style={{ height: '100%', width: '100%' }}>
//                 <TileLayer
//                   attribution="&copy; OpenStreetMap contributors"
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />
//                 <LiveLocationUpdater position={driverPos} />
//                 <Marker position={driverPos}>
//                   <Popup>Your current location 🚍</Popup>
//                 </Marker>
//               </MapContainer>
//             ) : (
//               <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400 text-lg">
//                 Getting your location...
//               </div>
//             )}
//           </div>

//           {/* QUICK ACTIONS */}
//           <div className="grid grid-cols-2 gap-3">
//             {quickActions.map((a, i) => (
//               <button
//                 key={i}
//                 onClick={() => history.push(a.path)}
//                 className={`${a.color} h-14 rounded-xl text-white text-sm font-medium hover:scale-105 transition`}
//               >
//                 {a.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default Dashboard;

// import React, { useState, useEffect } from 'react';
// import { IonPage, IonContent } from '@ionic/react';
// import { useHistory } from 'react-router-dom';
// import NavbarSidebar from '../../users/pages/Navbar';

// import {
//   UserCircleIcon,
//   TruckIcon,
//   IdentificationIcon,
//   CurrencyRupeeIcon,
//   MapIcon,
//   UsersIcon,
//   ClockIcon,
//   ExclamationTriangleIcon
// } from '@heroicons/react/24/outline';

// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// const LiveLocationUpdater = ({ position }: { position: [number, number] }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (position) map.setView(position, map.getZoom(), { animate: true });
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

//   const [driverStats, setDriverStats] = useState<any>(null); // Store API response

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

//   // Dark mode listener
//   useEffect(() => {
//     const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
//     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
//     return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
//   }, []);

//   // Get driver location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       const updatePosition = () => {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
//           (err) => console.error('GPS error:', err),
//           { enableHighAccuracy: true }
//         );
//       };
//       updatePosition();
//       const interval = setInterval(updatePosition, 120000);
//       return () => clearInterval(interval);
//     }
//   }, []);

//   // Setup buttons logic based on verification status
//   const setupCards = driverVerified
//     ? [
//         { icon: <UserCircleIcon className="w-8 h-8 mb-2 text-blue-400" />, title: 'View Profile', path: '/profile-setup' },
//         { icon: <IdentificationIcon className="w-8 h-8 mb-2 text-purple-400" />, title: 'View KYC Details', path: '/kyc-verification' },
//         { icon: <TruckIcon className="w-8 h-8 mb-2 text-green-400" />, title: 'Add Vehicle', path: '/vehicle-registration' }
//       ]
//     : [
//         { icon: <UserCircleIcon className="w-8 h-8 mb-2 text-blue-400" />, title: 'Profile Setup', path: '/profile-setup' },
//         { icon: <IdentificationIcon className="w-8 h-8 mb-2 text-purple-400" />, title: 'KYC Verification', path: '/kyc-verification' },
//         { icon: <TruckIcon className="w-8 h-8 mb-2 text-green-400" />, title: 'Vehicle Registration', path: '/vehicle-registration' }
//       ];

//   // Map driverStats to dashboard cards
//   const stats = driverStats ? [
//     { icon: <MapIcon className="w-5 h-5 text-blue-400" />, label: 'Total Trips', value: driverStats.total_trips },
//     { icon: <ClockIcon className="w-5 h-5 text-orange-400" />, label: 'Completed Trips', value: driverStats.completed_trips },
//     { icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-400" />, label: 'Cancelled Trips', value: driverStats.cancelled_trips },
//     { icon: <CurrencyRupeeIcon className="w-5 h-5 text-green-400" />, label: 'Total Earnings', value: driverStats.trips.reduce((sum: number, t: any) => sum + t.earning, 0) },
//   ] : [];

//   const quickActions = [
//     { label: '🚍 Start Trip', path: '/start-trip', color: 'bg-black' },
//     { label: '📍 Setup Route', path: '/setup-route', color: 'bg-gray-800' },
//     { label: '👥 Passenger List', path: '/passenger-list', color: 'bg-gray-700' },
//     { label: '💰 Earnings Report', path: '/earnings-report', color: 'bg-gray-900' },
//   ];

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className={`${isDark ? 'bg-gray-900' : 'bg-white'} pt-16`}>
//         <div className="p-5">
//           <div className="mb-6">
//             <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Driver Dashboard</h1>
//             <p className={`${isDark ? 'text-gray-500' : 'text-gray-600'} text-m`}>
//               Manage your trips & earnings efficiently
//             </p>
//           </div>

//           {!driverVerified && (
//             <div className={`mb-6 p-3 rounded-xl flex items-center border ${isDark ? 'bg-yellow-800/20 border-yellow-400 text-white' : 'bg-yellow-100 border-yellow-500 text-black'}`}>
//               <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-400" />
//               Complete Profile, Vehicle & KYC to start trips
//             </div>
//           )}

//           <div className="grid grid-cols-3 gap-3 mb-6">
//             {setupCards.map((card, i) => (
//               <div
//                 key={i}
//                 onClick={() => history.push(card.path)}
//                 className={`p-3 rounded-xl text-center cursor-pointer transition hover:scale-105 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
//               >
//                 {card.icon}
//                 <p className="text-xs">{card.title}</p>
//               </div>
//             ))}
//           </div>

//           {/* STATS */}
//           {driverStats && (
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
//               {stats.map((s, i) => (
//                 <div key={i} className={`p-3 rounded-xl text-center transition ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}>
//                   <div className="flex justify-center mb-1">{s.icon}</div>
//                   <p className="text-xs text-gray-400">{s.label}</p>
//                   <p className="font-bold">{s.value}</p>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="mb-6 rounded-xl overflow-hidden border border-gray-700" style={{ height: '300px', width: '100%' }}>
//             {driverPos ? (
//               <MapContainer center={driverPos} zoom={15} style={{ height: '100%', width: '100%' }}>
//                 <TileLayer
//                   attribution="&copy; OpenStreetMap contributors"
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />
//                 <LiveLocationUpdater position={driverPos} />
//                 <Marker position={driverPos}>
//                   <Popup>Your current location 🚍</Popup>
//                 </Marker>
//               </MapContainer>
//             ) : (
//               <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400 text-lg">
//                 Getting your location...
//               </div>
//             )}
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             {quickActions.map((a, i) => (
//               <button
//                 key={i}
//                 onClick={() => history.push(a.path)}
//                 className={`${a.color} h-14 rounded-xl text-white text-sm font-medium hover:scale-105 transition`}
//               >
//                 {a.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
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
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  WalletIcon,
  BanknotesIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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
  const token = localStorage.getItem('access_token');

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

  // Get available years
  const availableYears = [new Date().getFullYear(), new Date().getFullYear() - 1];
  
  // Months list
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

  // Fetch verification status
  useEffect(() => {
    const fetchProfile = async () => {
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

  // Fetch payout details with month/year filters
  const fetchPayoutDetails = async (year: string, month: string, filterType: 'month' | 'year' = 'month') => {
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
    if (driverVerified) {
      fetchPayoutDetails(selectedYear, selectedMonth, selectedFilter);
    }
  }, [driverVerified, selectedYear, selectedMonth, selectedFilter]);

  // Dark mode listener
  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, []);

  // Get driver location
  useEffect(() => {
    if (navigator.geolocation) {
      const updatePosition = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
          (err) => console.error('GPS error:', err),
          { enableHighAccuracy: true }
        );
      };
      updatePosition();
      const interval = setInterval(updatePosition, 30000);
      return () => clearInterval(interval);
    }
  }, []);

  // Download earnings report as CSV
  const downloadEarningsReport = async () => {
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

  // Body scroll lock when modal is open
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
          
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-2xl md:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Welcome Back, Driver! 👋
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
        {/* Map Section - Colorful Modern Design */}
<div className={`mb-6 rounded-2xl overflow-hidden shadow-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} relative group`} style={{ height: '360px', width: '100%' }}>
  
  {/* Gradient Overlay for better visibility */}
  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent z-5 pointer-events-none rounded-2xl"></div>
  
  {/* Top Status Bar with Gradient */}
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

  {driverPos ? (
    <MapContainer 
      center={driverPos} 
      zoom={15} 
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      className="leaflet-container"
    >
      {/* Colorful Map Tile Layer - Satelite + Street Mix */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      <LiveLocationUpdater position={driverPos} />
      
      {/* Custom Animated Marker */}
      <Marker position={driverPos} icon={driverIcon}>
        <Popup>
          <div className="text-center min-w-[180px]">
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
      
      {/* Custom Zoom Controls */}
      <div className="leaflet-bottom leaflet-right">
        <div className="leaflet-control leaflet-control-zoom custom-zoom">
          <a className="leaflet-control-zoom-in" title="Zoom in">+</a>
          <a className="leaflet-control-zoom-out" title="Zoom out">−</a>
        </div>
      </div>
    </MapContainer>
  ) : (
    <div className="flex flex-col justify-center items-center h-full bg-linear-to-br from-slate-800 via-slate-900 to-slate-800">
      <div className="text-center">
        <div className="relative">
          {/* Animated Loading Circle */}
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-purple-500 border-b-pink-500 border-l-emerald-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-white font-semibold text-lg">Getting your location...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your position</p>
        </div>
      </div>
    </div>
  )}
  
  {/* Bottom Info Bar with Colors */}
  <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
    <div className="bg-linear-to-r from-black/70 to-black/50 backdrop-blur-md rounded-xl px-3 py-2 flex justify-between items-center border border-white/10">
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping absolute"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        </div>
        <span className="text-white text-xs font-medium">GPS Signal Strong</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-xs">📍</span>
          <span className="text-white/80 text-xs">High Accuracy</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-400 text-xs">🔄</span>
          <span className="text-white/60 text-xs">Auto-update</span>
        </div>
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

        {/* Earnings Modal - Fixed positioning */}
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
                            <p className="text-xs text-gray-500">{item.trip_date || 'Date not available'}</p>
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
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;

