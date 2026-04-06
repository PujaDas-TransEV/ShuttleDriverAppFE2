// import React, { useState, useEffect } from 'react';
// import { useHistory } from 'react-router-dom';
// import {
//   Bars3Icon,
//   BellIcon,
//   UserCircleIcon,
//   TruckIcon,
//   RectangleStackIcon,
//   MapIcon,
//   CurrencyRupeeIcon,
//   Cog6ToothIcon,
//   QuestionMarkCircleIcon,
//   ArrowRightOnRectangleIcon,
//   HomeIcon
// } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// const NavbarSidebar: React.FC = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const history = useHistory();

//   const [driverName, setDriverName] = useState<string>("Driver");
//   const [driverImage, setDriverImage] = useState<string | null>(null);

//   const token = localStorage.getItem("access_token");

//   // 🔹 Fetch driver profile once
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/driver-profile/me`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();

//         if (data.full_name) setDriverName(data.full_name);
//         if (data.profile_picture_path)
//           setDriverImage(data.profile_picture_path);
//       } catch (err) {
//         console.error("Failed to load profile:", err);
//       }
//     };

//     fetchProfile();
//   }, [token]);

//   const menuItems = [
//     { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
//     { name: 'Vehicle Management', icon: TruckIcon, path: '/bus-and-trip-management' },
//     { name: 'Trip Management', icon: MapIcon, path: '/trip-management' },
//     { name: 'Booking', icon: RectangleStackIcon, path: '/passenger-booking' },
//     { name: 'Live Tracking', icon: MapIcon, path: '/live-tracking' },
//     { name: 'Revenue & Payments', icon: CurrencyRupeeIcon, path: '/revenue-payments' },
//     { name: 'Notifications', icon: BellIcon, path: '/notification' },
//     { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
//     { name: 'Support', icon: QuestionMarkCircleIcon, path: '/support' },
//     { name: 'Profile', icon: UserCircleIcon, path: '/profile-setup' },
//   ];

//   return (
//     <>
//       {/* NAVBAR */}
//       <div className="fixed top-0 left-0 right-0 h-16 bg-black z-50 flex items-center justify-between px-4 shadow-lg">

//         <div className="flex items-center space-x-3">
//           <button onClick={() => setSidebarOpen(true)}>
//             <Bars3Icon className="w-6 h-6 text-white" />
//           </button>

//           {/* Driver Profile Image */}
//           <img
//             src={
//               driverImage
//                 ? driverImage
//                 : "https://i.ibb.co/4pDNDk1/default-profile.png"
//             }
//             alt="Profile"
//             className="w-9 h-9 rounded-full border border-gray-600 object-cover"
//           />

//           <span className="font-medium text-white">{driverName}</span>
//         </div>

//         {/* <div className="text-lg md:text-xl font-bold tracking-wide text-white">
//           Shuttle Driver
//         </div> */}

//         <button
//           className="relative"
//           onClick={() => history.push('/notification')}
//         >
//           <BellIcon className="w-6 h-6 text-white" />
//           <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
//         </button>
//       </div>

//       {/* OVERLAY */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* SIDEBAR */}
//       <div
//         className={`fixed top-0 left-0 h-full w-72 bg-black z-50 shadow-2xl transform ${
//           sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         } transition-transform duration-300`}
//       >
//         {/* PROFILE */}
//         <div className="p-5 border-b border-gray-800 flex items-center space-x-3">
//           <img
//             src={
//               driverImage
//                 ? driverImage
//                 : "https://i.ibb.co/4pDNDk1/default-profile.png"
//             }
//             alt="Profile Pic"
//             className="w-11 h-11 rounded-full object-cover"
//           />
//           <div>
//             <p className="font-semibold text-white text-lg">{driverName}</p>
//             <p className="text-sm text-gray-400">Driver / Owner</p>
//           </div>
//         </div>

//         {/* MENU */}
//         <div className="mt-6 px-3 flex flex-col space-y-2">
//           {menuItems.map((item, idx) => {
//             const Icon = item.icon;
//             const isActive = idx === activeIndex;

//             return (
//               <button
//                 key={idx}
//                 onClick={() => {
//                   setActiveIndex(idx);
//                   history.push(item.path);
//                   setSidebarOpen(false);
//                 }}
//                 className={`flex items-center px-4 py-3 rounded-xl w-full text-left transition-all duration-200 group
//                   ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
//                 `}
//               >
//                 <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
//                 <span className="text-sm font-medium">{item.name}</span>
//               </button>
//             );
//           })}
//         </div>

//         {/* LOGOUT */}
//         <div className="absolute bottom-5 w-full px-4">
//           <button
//             onClick={() => {
//               history.push('/login');
//               setSidebarOpen(false);
//             }}
//             className="w-full flex items-center justify-center py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition"
//           >
//             <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
//             Logout
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default NavbarSidebar;

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
// import { useNavigate } from "react-router-dom";

// const navigate = useNavigate();

import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  TruckIcon,
  RectangleStackIcon,
  MapIcon,
  CurrencyRupeeIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const NavbarSidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tripMenuOpen, setTripMenuOpen] = useState(false);
  const history = useHistory();

  const [driverName, setDriverName] = useState<string>("Driver");
  const [driverImage, setDriverImage] = useState<string | null>(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/driver-profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.full_name) setDriverName(data.full_name);
        if (data.profile_picture_path) setDriverImage(data.profile_picture_path);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    fetchProfile();
  }, [token]);

  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { 
      name: 'Trip Management', 
      icon: MapIcon, 
      path: '/trip-management', 
      submenu: [
        { name: 'Current Trips', path: '/current-trips' },
          { name: 'Create Trip', path: '/create-trip', icon: PlusIcon },
        { name: 'Manage Trips', path: '/trip-management' },
      ] 
    },
    { name: 'Vehicle Management', icon: TruckIcon, path: '/bus-and-trip-management' },
    { name: 'Booking', icon: RectangleStackIcon, path: '/passenger-booking' },
    { name: 'Live Tracking', icon: MapIcon, path: '/live-tracking' },
    { name: 'Revenue & Payments', icon: CurrencyRupeeIcon, path: '/revenue-payments' },
    { name: 'Notifications', icon: BellIcon, path: '/notification' },
    { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
    { name: 'Support', icon: QuestionMarkCircleIcon, path: '/support' },
    { name: 'Profile', icon: UserCircleIcon, path: '/profile-setup' },
  ];

  const handleMenuClick = (idx: number, item: any) => {
    setActiveIndex(idx);
    if (item.submenu) {
      setTripMenuOpen(!tripMenuOpen);
    } else {
      history.push(item.path);
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black z-50 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-white" />
          </button>
          <img
            src={driverImage ? driverImage : "https://i.ibb.co/4pDNDk1/default-profile.png"}
            alt="Profile"
            className="w-9 h-9 rounded-full border border-gray-600 object-cover"
          />
          <span className="font-medium text-white">{driverName}</span>
        </div>
        <button className="relative" onClick={() => history.push('/notification')}>
          <BellIcon className="w-6 h-6 text-white" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* OVERLAY */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-black z-50 shadow-2xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
        {/* PROFILE */}
        <div className="p-5 border-b border-gray-800 flex items-center space-x-3">
          <img
            src={driverImage ? driverImage : "https://i.ibb.co/4pDNDk1/default-profile.png"}
            alt="Profile Pic"
            className="w-11 h-11 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-white text-lg">{driverName}</p>
            <p className="text-sm text-gray-400">Driver / Owner</p>
          </div>
        </div>

        {/* MENU */}
        <div className="mt-6 px-3 flex flex-col space-y-2">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIndex;
            return (
              <div key={idx}>
                <button
                  onClick={() => handleMenuClick(idx, item)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl w-full text-left transition-all duration-200 group
                    ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                >
                  <div className="flex items-center">
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.submenu && (tripMenuOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />)}
                </button>

                {/* SUBMENU */}
                {item.submenu && tripMenuOpen && (
                  <div className="ml-8 mt-1 flex flex-col space-y-1">
                    {item.submenu.map((sub, sidx) => (
                      <button
                        key={sidx}
                        onClick={() => { history.push(sub.path); setSidebarOpen(false); }}
                        className="flex items-center px-4 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white text-sm"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* LOGOUT */}
        <div className="absolute bottom-5 w-full px-4">
          <button
            onClick={() => {
              history.push('/login');
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default NavbarSidebar;