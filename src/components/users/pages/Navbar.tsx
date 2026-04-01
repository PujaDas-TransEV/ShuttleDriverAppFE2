import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
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
  HomeIcon
} from '@heroicons/react/24/outline';

const NavbarSidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const history = useHistory();

  const menuItems = [
     { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { name: 'Bus & Trip Management', icon: TruckIcon, path: '/bus-and-trip-management' },
    { name: 'Passenger Booking', icon: RectangleStackIcon, path: '/passenger-booking' },
    { name: 'Live Tracking', icon: MapIcon, path: '/live-tracking' },
    { name: 'Revenue & Payments', icon: CurrencyRupeeIcon, path: '/revenue-payments' },
    { name: 'Notifications', icon: BellIcon, path: '/notification' },
    { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
    { name: 'Support', icon: QuestionMarkCircleIcon, path: '/support' },
     { name: 'Profile', icon: UserCircleIcon, path: '/profile-setup' },
  ];

  return (
    <>
      {/* NAVBAR */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black z-50 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center space-x-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Bars3Icon className="w-6 h-6 text-white" />
          </button>

          <img
            src="https://images.unsplash.com/photo-1603415526960-f8f5f0a1f1b3?auto=format&fit=crop&w=64&q=80"
            alt="Profile"
            className="w-9 h-9 rounded-full border border-gray-600"
          />

          <span className="font-medium text-white">John Doe</span>
        </div>

        <div className="text-lg md:text-xl font-bold tracking-wide text-white">
          Shuttle Driver
        </div>

        <button
      className="relative"
      onClick={() => history.push('/notification')} // navigate to notifications page
    >
      <BellIcon className="w-6 h-6 text-white" />
      {/* Red dot for unread notifications */}
      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
    </button>
      </div>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-black z-50 shadow-2xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300`}
      >
        {/* PROFILE */}
        <div className="p-5 border-b border-gray-800 flex items-center space-x-3">
          <UserCircleIcon className="w-11 h-11 text-white" />
          <div>
            <p className="font-semibold text-white text-lg">John Doe</p>
            <p className="text-sm text-gray-400">Driver / Owner</p>
          </div>
        </div>

        {/* MENU */}
        <div className="mt-6 px-3 flex flex-col space-y-2">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIndex;

            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                  history.push(item.path);
                  setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-3 rounded-xl w-full text-left transition-all duration-200 group
                  ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
                `}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
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
            className="w-full flex items-center justify-center py-3 rounded-xl 
                       bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition"
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

