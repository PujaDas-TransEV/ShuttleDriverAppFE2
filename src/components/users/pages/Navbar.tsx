import React, { useState, useEffect } from 'react';
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
  HomeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const NavbarSidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tripMenuOpen, setTripMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
    if (token) {
      fetchProfile();
    }
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
    { name: 'Analytics', icon: ChartBarIcon, path: '/analytics' },
    { name: 'Notifications', icon: BellIcon, path: '/notification' },
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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const token = localStorage.getItem("access_token");
    
    try {
      // Call logout API
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Clear local storage regardless of API response
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      
      // Clear any other app-specific data
      sessionStorage.clear();
      
      // Redirect to login page
      history.push('/login');
      setSidebarOpen(false);
      
      // Show success message (optional)
      if (response.ok) {
        console.log("Logged out successfully");
      } else {
        console.log("Logged out locally, but server logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local storage and redirect even if API fails
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_data");
      sessionStorage.clear();
      history.push('/login');
      setSidebarOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* ======================== MODERN NAVBAR ======================== */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        backgroundColor: '#0A0A0A',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid #1F1F1F',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F1F1F'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Bars3Icon style={{ width: '24px', height: '24px', color: '#FFFFFF' }} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '99px',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              padding: '2px',
            }}>
              <img
                src={driverImage || "https://i.ibb.co/4pDNDk1/default-profile.png"}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '99px',
                  objectFit: 'cover',
                  border: '2px solid #0A0A0A'
                }}
              />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '15px', margin: 0 }}>{driverName}</p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Driver / Owner</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => history.push('/notification')}
            style={{
              background: '#1A1A1A',
              border: 'none',
              borderRadius: '40px',
              padding: '10px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2A2A2A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1A1A1A'}
          >
            <BellIcon style={{ width: '22px', height: '22px', color: '#E5E7EB' }} />
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              backgroundColor: '#EF4444',
              borderRadius: '99px',
              border: '2px solid #1A1A1A'
            }}></span>
          </button>
        </div>
      </div>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 40,
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s'
          }}
        />
      )}

      {/* ======================== MODERN SIDEBAR ======================== */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        width: '300px',
        backgroundColor: '#0D0D0D',
        zIndex: 50,
        boxShadow: '8px 0 30px rgba(0,0,0,0.5)',
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1F1F1F'
      }}>
        
        {/* Sidebar Header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #1F1F1F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '99px',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              padding: '2px',
            }}>
              <img
                src={driverImage || "https://i.ibb.co/4pDNDk1/default-profile.png"}
                alt="Profile Pic"
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '99px',
                  objectFit: 'cover',
                  border: '2px solid #0D0D0D'
                }}
              />
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '16px', margin: 0 }}>{driverName}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <ShieldCheckIcon style={{ width: '12px', height: '12px', color: '#10B981' }} />
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>Verified Driver</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: '#1F1F1F',
              border: 'none',
              borderRadius: '10px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: '0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2F2F2F'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1F1F1F'}
          >
            <XMarkIcon style={{ width: '18px', height: '18px', color: '#9CA3AF' }} />
          </button>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = idx === activeIndex;
            return (
              <div key={idx}>
                <button
                  onClick={() => handleMenuClick(idx, item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    backgroundColor: isActive ? '#1F2A3A' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#181818';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <Icon style={{
                      width: '22px',
                      height: '22px',
                      color: isActive ? '#60A5FA' : '#6B7280',
                      transition: 'color 0.2s'
                    }} />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: isActive ? '#FFFFFF' : '#D1D5DB'
                    }}>{item.name}</span>
                  </div>
                  {item.submenu && (
                    tripMenuOpen ? <ChevronUpIcon style={{ width: '18px', height: '18px', color: '#9CA3AF' }} /> : <ChevronDownIcon style={{ width: '18px', height: '18px', color: '#9CA3AF' }} />
                  )}
                </button>

                {/* Submenu */}
                {item.submenu && tripMenuOpen && (
                  <div style={{
                    marginLeft: '32px',
                    marginTop: '4px',
                    paddingLeft: '12px',
                    borderLeft: '2px solid #2D2D2D',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {item.submenu.map((sub, sidx) => (
                      <button
                        key={sidx}
                        onClick={() => { history.push(sub.path); setSidebarOpen(false); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: '12px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: '0.2s',
                          width: '100%',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1A1A1A'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {sub.icon && <sub.icon style={{ width: '16px', height: '16px', color: '#6B7280' }} />}
                        <span style={{ fontSize: '13px', color: '#B0B0B0' }}>{sub.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Logout Button */}
        <div style={{ padding: '20px 16px 32px', borderTop: '1px solid #1F1F1F', marginTop: 'auto' }}>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '12px 0',
              borderRadius: '40px',
              backgroundColor: '#1A1A1A',
              border: '1px solid #2D2D2D',
              cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              fontWeight: 500,
              fontSize: '14px',
              color: '#F87171',
              opacity: isLoggingOut ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.backgroundColor = '#2A1A1A';
                e.currentTarget.style.borderColor = '#EF4444';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoggingOut) {
                e.currentTarget.style.backgroundColor = '#1A1A1A';
                e.currentTarget.style.borderColor = '#2D2D2D';
              }
            }}
          >
            <ArrowRightOnRectangleIcon style={{ width: '20px', height: '20px' }} />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default NavbarSidebar;