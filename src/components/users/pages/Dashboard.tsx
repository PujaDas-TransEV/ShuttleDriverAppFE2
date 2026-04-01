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

// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // ES Modules Leaflet marker fix
// import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// import markerIcon from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// const Dashboard: React.FC = () => {
//   const history = useHistory();
//   const [profileCompleted, setProfileCompleted] = useState(false);

//   // Detect dark mode
//   const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     if (user?.profileCompleted) setProfileCompleted(true);

//     const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
//     window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
//     return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
//   }, []);

//   const position: [number, number] = [22.5726, 88.3639]; // Kolkata

//   const setupCards = [
//     { icon: <UserCircleIcon className="w-8 h-8 mb-2 text-blue-400" />, title: 'Profile Setup', path: '/profile-setup' },
//     { icon: <TruckIcon className="w-8 h-8 mb-2 text-green-400" />, title: 'Vehicle Registration', path: '/vehicle-registration' },
//     { icon: <IdentificationIcon className="w-8 h-8 mb-2 text-purple-400" />, title: 'KYC Verification', path: '/kyc-verification' },
//   ];

//   const stats = [
//     { icon: <MapIcon className="w-5 h-5 text-blue-400" />, label: 'Trips', value: '5' },
//     { icon: <CurrencyRupeeIcon className="w-5 h-5 text-green-400" />, label: 'Earnings', value: '₹12,500' },
//     { icon: <UsersIcon className="w-5 h-5 text-purple-400" />, label: 'Passengers', value: '48' },
//     { icon: <ClockIcon className="w-5 h-5 text-orange-400" />, label: 'Active Trips', value: '3' },
//   ];

  

//  const quickActions = [
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

//           {/* ALERT */}
//           {!profileCompleted && (
//             <div className={`mb-6 p-3 rounded-xl flex items-center border ${isDark ? 'bg-yellow-800/20 border-yellow-400 text-white' : 'bg-yellow-100 border-yellow-500 text-black'}`}>
//               <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-400" />
//               Complete Profile, Vehicle & KYC to start trips
//             </div>
//           )}

//           {/* SETUP CARDS */}
//           {!profileCompleted && (
//             <div className="grid grid-cols-3 gap-3 mb-6">
//               {setupCards.map((card, i) => (
//                 <div
//                   key={i}
//                   onClick={() => history.push(card.path)}
//                   className={`p-3 rounded-xl text-center cursor-pointer transition hover:scale-105 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
//                 >
//                   {card.icon}
//                   <p className="text-xs">{card.title}</p>
//                 </div>
//               ))}
//             </div>
//           )}

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

//           {/* MAP */}
//           <div className="mb-6 rounded-xl overflow-hidden border border-gray-700" style={{ height: '300px', width: '100%' }}>
//             <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
//               <TileLayer
//                 attribution="&copy; OpenStreetMap contributors"
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />
//               <Marker position={position}>
//                 <Popup>Your Bus 🚍 is here</Popup>
//               </Marker>
//             </MapContainer>
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
  UsersIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Component to smoothly pan the map
const LiveLocationUpdater = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
};

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);

  // Detect dark mode
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.profileCompleted) setProfileCompleted(true);

    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, []);

  // Get driver current location
  useEffect(() => {
    if (navigator.geolocation) {
      const updatePosition = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
          (err) => console.error('GPS error:', err),
          { enableHighAccuracy: true }
        );
      };
      updatePosition(); // initial fetch
      const interval = setInterval(updatePosition, 120000); // update every 2 min
      return () => clearInterval(interval);
    }
  }, []);

  const setupCards = [
    { icon: <UserCircleIcon className="w-8 h-8 mb-2 text-blue-400" />, title: 'Profile Setup', path: '/profile-setup' },
    { icon: <TruckIcon className="w-8 h-8 mb-2 text-green-400" />, title: 'Vehicle Registration', path: '/vehicle-registration' },
    { icon: <IdentificationIcon className="w-8 h-8 mb-2 text-purple-400" />, title: 'KYC Verification', path: '/kyc-verification' },
  ];

  const stats = [
    { icon: <MapIcon className="w-5 h-5 text-blue-400" />, label: 'Trips', value: '5' },
    { icon: <CurrencyRupeeIcon className="w-5 h-5 text-green-400" />, label: 'Earnings', value: '₹12,500' },
    { icon: <UsersIcon className="w-5 h-5 text-purple-400" />, label: 'Passengers', value: '48' },
    { icon: <ClockIcon className="w-5 h-5 text-orange-400" />, label: 'Active Trips', value: '3' },
  ];

  const quickActions = [
    { label: '🚍 Start Trip', path: '/start-trip', color: 'bg-black' },
    { label: '📍 Setup Route', path: '/setup-route', color: 'bg-gray-800' },
    { label: '👥 Passenger List', path: '/passenger-list', color: 'bg-gray-700' },
    { label: '💰 Earnings Report', path: '/earnings-report', color: 'bg-gray-900' },
  ];

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className={`${isDark ? 'bg-gray-900' : 'bg-white'} pt-16`}>
        <div className="p-5">
          {/* HEADER */}
          <div className="mb-6">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>Driver Dashboard</h1>
            <p className={`${isDark ? 'text-gray-500' : 'text-gray-600'} text-m`}>
              Manage your trips & earnings efficiently
            </p>
          </div>

          {/* ALERT */}
          {!profileCompleted && (
            <div className={`mb-6 p-3 rounded-xl flex items-center border ${isDark ? 'bg-yellow-800/20 border-yellow-400 text-white' : 'bg-yellow-100 border-yellow-500 text-black'}`}>
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-400" />
              Complete Profile, Vehicle & KYC to start trips
            </div>
          )}

          {/* SETUP CARDS */}
          {!profileCompleted && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {setupCards.map((card, i) => (
                <div
                  key={i}
                  onClick={() => history.push(card.path)}
                  className={`p-3 rounded-xl text-center cursor-pointer transition hover:scale-105 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}
                >
                  {card.icon}
                  <p className="text-xs">{card.title}</p>
                </div>
              ))}
            </div>
          )}

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {stats.map((s, i) => (
              <div key={i} className={`p-3 rounded-xl text-center transition ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}>
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* LIVE DRIVER MAP */}
          <div className="mb-6 rounded-xl overflow-hidden border border-gray-700" style={{ height: '300px', width: '100%' }}>
            {driverPos ? (
              <MapContainer center={driverPos} zoom={15} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LiveLocationUpdater position={driverPos} />
                <Marker position={driverPos}>
                  <Popup>Your current location 🚍</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400 text-lg">
                Getting your location...
              </div>
            )}
          </div>

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a, i) => (
              <button
                key={i}
                onClick={() => history.push(a.path)}
                className={`${a.color} h-14 rounded-xl text-white text-sm font-medium hover:scale-105 transition`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;

