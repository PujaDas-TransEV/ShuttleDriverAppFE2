import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import {
  NOTIFICATION_SESSION_ENDED_EVENT,
  useNotificationSession,
} from '../pages/NotificationSessionProvider';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  TruckIcon,
  RectangleStackIcon,
  MapIcon,
  CurrencyRupeeIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  XMarkIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UsersIcon,
  CreditCardIcon,
  CogIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

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

// Helper function to remove token from Preferences
const removeToken = async (): Promise<void> => {
  try {
    await Preferences.remove({ key: 'access_token' });
    await Preferences.remove({ key: 'refresh_token' });
    console.log('Tokens removed from Preferences');
  } catch (error) {
    console.error('Error removing tokens:', error);
  }
};

const NavbarSidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tripMenuOpen, setTripMenuOpen] = useState(false);
  const [fineMenuOpen, setFineMenuOpen] = useState(false);
  const [passengerMenuOpen, setPassengerMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { unreadCount, refreshUnreadCount } = useNotificationSession();
  const [token, setToken] = useState<string | null>(null);
  const history = useHistory();
  const location = useLocation();

  const [driverName, setDriverName] = useState<string>("Driver");
  const [driverImage, setDriverImage] = useState<string | null>(null);
  const [driverImageUrl, setDriverImageUrl] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [fineUnreadCount, setFineUnreadCount] = useState<number>(0);

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
    };
    loadToken();
  }, []);

  // ======================
  // Get full profile image URL
  // ======================
  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    const normalizedPath = path.replace(/\\/g, '/');
    if (normalizedPath.startsWith('http')) return normalizedPath;
    return `${API_BASE}/${normalizedPath}`;
  };

  // ======================
  // Fetch unread count from the single session-level notification handler
  // ======================
  const fetchUnreadCount = refreshUnreadCount;

  // ======================
  // Fetch profile from /driver-profile/me
  // ======================
  const fetchProfile = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/driver-profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
      
      const data = await res.json();
      console.log("Navbar fetched profile data:", data);
      
      if (data.full_name) setDriverName(data.full_name);
      if (data.verification_status) setVerificationStatus(data.verification_status);
      if (data.average_rating) setAverageRating(data.average_rating);
      
      if (data.profile_picture_path) {
        const fullUrl = getFullImageUrl(data.profile_picture_path);
        console.log("Navbar profile image URL:", fullUrl);
        setDriverImageUrl(fullUrl);
        setDriverImage(fullUrl);
      } else {
        setDriverImageUrl('');
        setDriverImage(null);
      }
    } catch (err) {
      console.error("Failed to load profile in navbar:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchUnreadCount();
    }
  }, [token, refreshUnreadCount]);

  // Refresh counts when returning to dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      if (token && document.visibilityState === 'visible') {
        fetchUnreadCount();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [token, fetchUnreadCount]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && token) {
        fetchUnreadCount();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [token, fetchUnreadCount]);

  const menuItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { name: 'Profile', icon: UserCircleIcon, path: '/profile-setup' },
    { name: 'Identity Check', icon: IdentificationIcon, path: '/kyc-verification' },
    { name: 'Vehicle Management', icon: TruckIcon, path: '/bus-and-trip-management' },
    { 
      name: 'Trip Management', 
      icon: MapIcon, 
      path: '/trip-management', 
      submenu: [
        { name: 'Current Trips', path: '/current-trips', icon: MapIcon },
        { name: 'Create Trip', path: '/create-trip', icon: PlusIcon },
        { name: 'Manage Trips', path: '/trip-management', icon: MapIcon },
      ] 
    },
    { 
      name: 'Passenger Management', 
      icon: UsersIcon,
      path: '/passenger-management',
      submenu: [
        { name: 'Passenger Bookings', path: '/passenger-booking', icon: RectangleStackIcon },
        { name: 'RFID Card Holders', path: '/rfid-cardsholders', icon: CreditCardIcon },
      ] 
    },
    { name: 'Live Tracking', icon: MapIcon, path: '/live-tracking' },
    { 
      name: 'Fine Management',
      icon: DocumentTextIcon,
      path: '/fines',
      hasBadge: true,
      badgeCount: fineUnreadCount,
    },
    { name: 'Revenue & Payments', icon: CurrencyRupeeIcon, path: '/revenue-payments' },
    { name: 'Analytics', icon: ChartBarIcon, path: '/analytics' },
    { name: 'Notifications', icon: BellIcon, path: '/notification' },
    { name: 'Support', icon: QuestionMarkCircleIcon, path: '/support' },
    { name: 'Settings', icon: CogIcon, path: '/settings' }
  ];

  // Check if a path matches the current location
  const isPathActive = (path: string): boolean => {
    return location.pathname === path;
  };

  // Check if any submenu item is active
  const isSubmenuActive = (submenu: any[]): boolean => {
    return submenu.some(sub => location.pathname === sub.path);
  };

  // Get the menu index for a given path
  const getMenuIndexForPath = (path: string): number | null => {
    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].path === path) return i;
      if (menuItems[i].submenu) {
        const found = menuItems[i].submenu!.some(sub => sub.path === path);
        if (found) return i;
      }
    }
    return null;
  };

  // ======================
  // Auto-open menus when on submenu page
  // ======================
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check if current path is in Trip Management submenu
    const tripSubmenuPaths = ['/current-trips', '/create-trip', '/trip-management'];
    if (tripSubmenuPaths.includes(currentPath)) {
      setTripMenuOpen(true);
      const idx = getMenuIndexForPath('/trip-management');
      if (idx !== null) setActiveIndex(idx);
    }
    
    // Check if current path is in Passenger Management submenu
    const passengerSubmenuPaths = ['/passenger-booking', '/rfid-cardsholders'];
    if (passengerSubmenuPaths.includes(currentPath)) {
      setPassengerMenuOpen(true);
      const idx = getMenuIndexForPath('/passenger-management');
      if (idx !== null) setActiveIndex(idx);
    }
    
    // Check if current path is in Fine Management
    if (currentPath === '/fines') {
      setFineMenuOpen(true);
      const idx = getMenuIndexForPath('/fines');
      if (idx !== null) setActiveIndex(idx);
    }
    
    // For other paths, set active index
    const idx = getMenuIndexForPath(currentPath);
    if (idx !== null && !tripSubmenuPaths.includes(currentPath) && 
        !passengerSubmenuPaths.includes(currentPath) && currentPath !== '/fines') {
      setActiveIndex(idx);
    }
  }, [location.pathname]);

  const handleMenuClick = (idx: number, item: any) => {
    setActiveIndex(idx);
    if (item.submenu) {
      if (item.name === 'Fine Management') {
        setFineMenuOpen(!fineMenuOpen);
        setTripMenuOpen(false);
        setPassengerMenuOpen(false);
      } else if (item.name === 'Trip Management') {
        setTripMenuOpen(!tripMenuOpen);
        setFineMenuOpen(false);
        setPassengerMenuOpen(false);
      } else if (item.name === 'Passenger Management') {
        setPassengerMenuOpen(!passengerMenuOpen);
        setTripMenuOpen(false);
        setFineMenuOpen(false);
      } else {
        setTripMenuOpen(false);
        setFineMenuOpen(false);
        setPassengerMenuOpen(false);
      }
    } else {
      history.push(item.path);
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const currentToken = token;
    
    try {
      if (currentToken) {
        const response = await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          console.log("Logged out successfully");
        } else {
          console.log("Logged out locally, but server logout failed");
        }
      }
      
      await removeToken();
      sessionStorage.clear();
      window.dispatchEvent(new Event(NOTIFICATION_SESSION_ENDED_EVENT));
      history.push('/login');
      setSidebarOpen(false);
      
    } catch (error) {
      console.error("Logout error:", error);
      await removeToken();
      sessionStorage.clear();
      window.dispatchEvent(new Event(NOTIFICATION_SESSION_ENDED_EVENT));
      history.push('/login');
      setSidebarOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getVerificationColor = () => {
    switch(verificationStatus) {
      case 'verified': return '#10B981';
      case 'pending': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  const getVerificationText = () => {
    switch(verificationStatus) {
      case 'verified': return 'Verified Driver';
      case 'pending': return 'Pending Verification';
      default: return 'Unverified';
    }
  };

  // Handle profile picture click - redirect to profile setup
  const handleProfileClick = () => {
    history.push('/profile-setup');
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Modern Navbar - Increased height for better spacing */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '84px',
        backgroundColor: '#0A0A0A',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: '1px solid #1F1F1F',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F1F1F'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Bars3Icon style={{ width: '26px', height: '26px', color: '#FFFFFF' }} />
          </button>
          
          {/* Profile Section - Clickable to redirect to profile setup */}
          <div 
            onClick={handleProfileClick}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px', 
              marginTop: '8px',
              cursor: 'pointer',
              padding: '4px 12px 4px 4px',
              borderRadius: '99px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1A1A1A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '99px',
              background: `linear-gradient(135deg, ${getVerificationColor()}, ${getVerificationColor()}88)`,
              padding: '2px',
            }}>
              {driverImageUrl ? (
                <img
                  src={driverImageUrl}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '99px',
                    objectFit: 'cover',
                    border: '2px solid #0A0A0A'
                  }}
                  onError={(e) => {
                    console.error("Navbar image failed to load:", driverImageUrl);
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const icon = document.createElement('div');
                      icon.style.width = '100%';
                      icon.style.height = '100%';
                      icon.style.display = 'flex';
                      icon.style.alignItems = 'center';
                      icon.style.justifyContent = 'center';
                      icon.style.backgroundColor = '#1F1F1F';
                      icon.style.borderRadius = '99px';
                      icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>';
                      parent.appendChild(icon);
                    }
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '99px',
                  backgroundColor: '#1F1F1F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCircleIcon style={{ width: '28px', height: '28px', color: '#6B7280' }} />
                </div>
              )}
            </div>
            <div>
              <p style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '16px', margin: 0 }}>{driverName}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '99px',
                  backgroundColor: getVerificationColor(),
                }} />
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{getVerificationText()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Icon - Positioned lower */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={() => history.push('/notification')}
            style={{
              background: '#1A1A1A',
              border: 'none',
              borderRadius: '40px',
              padding: '12px',
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
            <BellIcon style={{ width: '24px', height: '24px', color: '#E5E7EB' }} />
            
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                minWidth: '20px',
                height: '20px',
                backgroundColor: '#EF4444',
                borderRadius: '99px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 5px',
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#FFFFFF',
                border: '2px solid #1A1A1A',
                animation: unreadCount > 0 ? 'pulse 1.5s infinite' : 'none'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Overlay */}
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

      {/* Sidebar */}
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
        
        {/* Sidebar Header - Profile section clickable */}
        <div 
          onClick={handleProfileClick}
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid #1F1F1F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1A1A1A'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '99px',
              background: `linear-gradient(135deg, ${getVerificationColor()}, ${getVerificationColor()}88)`,
              padding: '2px',
            }}>
              {driverImageUrl ? (
                <img
                  src={driverImageUrl}
                  alt="Profile Pic"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '99px',
                    objectFit: 'cover',
                    border: '2px solid #0D0D0D'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const icon = document.createElement('div');
                      icon.style.width = '100%';
                      icon.style.height = '100%';
                      icon.style.display = 'flex';
                      icon.style.alignItems = 'center';
                      icon.style.justifyContent = 'center';
                      icon.style.backgroundColor = '#1F1F1F';
                      icon.style.borderRadius = '99px';
                      icon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>';
                      parent.appendChild(icon);
                    }
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '99px',
                  backgroundColor: '#1F1F1F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserCircleIcon style={{ width: '24px', height: '24px', color: '#6B7280' }} />
                </div>
              )}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '16px', margin: 0 }}>{driverName}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <ShieldCheckIcon style={{ width: '12px', height: '12px', color: getVerificationColor() }} />
                <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>{getVerificationText()}</p>
              </div>
              {averageRating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map((star) => (
                      <svg key={star} width="10" height="10" viewBox="0 0 24 24" fill={star <= Math.round(averageRating) ? '#F59E0B' : '#4B5563'} stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <p style={{ fontSize: '10px', color: '#6B7280', margin: 0 }}>{averageRating.toFixed(1)}</p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(false);
            }}
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
            // Check if this item or its submenu is active
            const isActive = location.pathname === item.path || 
                           (item.submenu && isSubmenuActive(item.submenu));
            const isFineMenu = item.name === 'Fine Management';
            const isTripMenu = item.name === 'Trip Management';
            const isPassengerMenu = item.name === 'Passenger Management';
            
            // Check if this menu should be open (for submenu items)
            const isMenuOpen = (isTripMenu && tripMenuOpen) || 
                              (isPassengerMenu && passengerMenuOpen) || 
                              (isFineMenu && fineMenuOpen);
            
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
                    marginBottom: '2px',
                    position: 'relative',
                    borderLeft: isActive ? '3px solid #60A5FA' : '3px solid transparent',
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
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#FFFFFF' : '#D1D5DB',
                      transition: 'color 0.2s'
                    }}>{item.name}</span>
                    
                    {item.hasBadge && fineUnreadCount > 0 && (
                      <span style={{
                        marginLeft: '8px',
                        minWidth: '18px',
                        height: '18px',
                        backgroundColor: '#EF4444',
                        borderRadius: '99px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                      }}>
                        {fineUnreadCount > 99 ? '99+' : fineUnreadCount}
                      </span>
                    )}
                  </div>
                  {item.submenu && (
                    isMenuOpen ? 
                      <ChevronUpIcon style={{ width: '18px', height: '18px', color: '#9CA3AF' }} /> : 
                      <ChevronDownIcon style={{ width: '18px', height: '18px', color: '#9CA3AF' }} />
                  )}
                </button>

                {item.submenu && isMenuOpen && (
                  <div style={{
                    marginLeft: '32px',
                    marginTop: '4px',
                    paddingLeft: '12px',
                    borderLeft: '2px solid #2D2D2D',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {item.submenu.map((sub, sidx) => {
                      const SubIcon = sub.icon;
                      const isSubActive = location.pathname === sub.path;
                      return (
                        <button
                          key={sidx}
                          onClick={() => { 
                            history.push(sub.path); 
                            setSidebarOpen(false);
                            if (sub.path === '/fines') {
                              setFineUnreadCount(0);
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 12px',
                            borderRadius: '12px',
                            background: isSubActive ? '#1A2A3A' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            transition: '0.2s',
                            width: '100%',
                            textAlign: 'left',
                            borderLeft: isSubActive ? '2px solid #60A5FA' : '2px solid transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubActive) e.currentTarget.style.backgroundColor = '#1A1A1A';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {SubIcon && <SubIcon style={{ 
                            width: '16px', 
                            height: '16px', 
                            color: isSubActive ? '#60A5FA' : '#6B7280' 
                          }} />}
                          <span style={{ 
                            fontSize: '13px', 
                            color: isSubActive ? '#FFFFFF' : '#B0B0B0',
                            fontWeight: isSubActive ? 600 : 400,
                          }}>
                            {sub.name}
                          </span>
                        </button>
                      );
                    })}
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

      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default NavbarSidebar;