import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage,
  IonContent,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import NavbarSidebar from '../pages/Navbar';
import {
  CreditCardIcon,
  UserCircleIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  NoSymbolIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  QrCodeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { BusIcon } from 'lucide-react';

const API_BASE = 'https://be.shuttleapp.transev.site';

// Helper to get token
const getToken = async (): Promise<string | null> => {
  const { value } = await Preferences.get({ key: 'access_token' });
  return value || null;
};

interface Route {
  route_id: string;
  name: string;
  code: string;
}

interface Trip {
  trip_id: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  planned_start: string;
  planned_end: string;
  actual_start: string | null;
  actual_end: string | null;
}

// Updated interface for scan events with fare details
interface ScanEvent {
  scan_event_id: string;
  scan_type: 'board' | 'drop';
  passenger_name: string;
  board_stop_name: string | null;
  drop_stop_name: string | null;
  route_name: string;
  accepted: boolean;
  rejection_reason: string | null;
  ride_status: string;
  hold_amount: number;
  fare_amount: number;
  commission_amount: number;
  driver_payout_amount: number;
  platform_amount: number;
  scan_lat: number;
  scan_lng: number;
  distance_from_stop_meters: number;
  within_radius: boolean;
  scanned_at: string;
}

interface ScanResponse {
  scheduled_trip_id: string;
  page: number;
  page_size: number;
  count: number;
  items: ScanEvent[];
}

interface ErrorResponse {
  detail?: {
    error?: string;
    message?: string;
  } | string;
}

const RfidPassengers: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedRouteName, setSelectedRouteName] = useState<string>('');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [scanEvents, setScanEvents] = useState<ScanEvent[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingScans, setLoadingScans] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');
  const [stats, setStats] = useState({ board: 0, drop: 0, passengers: 0, totalFare: 0 });

  // Load token and routes on mount
  useEffect(() => {
    const init = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
      if (accessToken) {
        fetchRoutes(accessToken);
      }
    };
    init();
  }, []);

  // Show error popup
  const showError = (title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorPopup(true);
    setTimeout(() => setShowErrorPopup(false), 5000);
  };

  // Parse error response
  const parseErrorResponse = (error: any): string => {
    if (error?.detail?.message) {
      return error.detail.message;
    }
    if (error?.detail?.error) {
      return error.detail.error;
    }
    if (typeof error?.detail === 'string') {
      return error.detail;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  };

  // Fetch all routes for the driver
  const fetchRoutes = async (accessToken: string) => {
    setLoadingRoutes(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/driver/routes`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = parseErrorResponse(data);
        showError('Failed to Load Routes', errorMsg);
        throw new Error(errorMsg);
      }
      
      setRoutes(data);
    } catch (err: any) {
      setError(err.message || 'Error loading routes');
      if (!errorMessage) {
        showError('Connection Error', 'Unable to fetch routes. Please check your internet connection.');
      }
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Fetch trips for selected route
  const fetchTrips = useCallback(async (routeId: string) => {
    if (!token || !routeId) return;
    setLoadingTrips(true);
    setError(null);
    setSelectedTripId('');
    setScanEvents([]);
    try {
      const response = await fetch(`${API_BASE}/driver/routes/${routeId}/trips/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = parseErrorResponse(data);
        showError('Failed to Load Trips', errorMsg);
        throw new Error(errorMsg);
      }
      
      const tripsData = data.trips || [];
      
      const mappedTrips: Trip[] = tripsData.map((trip: any) => ({
        trip_id: trip.trip_id,
        status: trip.status || 'scheduled',
        planned_start: trip.planned_start,
        planned_end: trip.planned_end,
        actual_start: trip.actual_start || null,
        actual_end: trip.actual_end || null,
      }));
      
      const sortedTrips = mappedTrips.sort(
        (a: Trip, b: Trip) =>
          new Date(b.planned_start).getTime() - new Date(a.planned_start).getTime()
      );
      setTrips(sortedTrips);
      
      if (data.route?.name) {
        setSelectedRouteName(data.route.name);
      }
      
      if (sortedTrips.length === 0) {
        showError('No Trips Found', 'No trips available for this route. Please create a trip first.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading trips');
      setTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  }, [token]);

  // Fetch scan events for selected trip
  const fetchScanEvents = useCallback(async (tripId: string) => {
    if (!token || !tripId) return;
    setLoadingScans(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/driver/rfid/scan-details?scheduled_trip_id=${tripId}&page=1&page_size=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data: ScanResponse | ErrorResponse = await response.json();
      
      if (!response.ok) {
        const errorMsg = parseErrorResponse(data);
        const errorData = data as ErrorResponse;
        
        if (errorData?.detail && typeof errorData.detail === 'object' && 'error' in errorData.detail && errorData.detail.error === 'scheduled_trip_not_found') {
          showError('Trip Not Found', 'This scheduled trip could not be found. It may have been deleted or you may not have access.');
        } else if (errorData?.detail && typeof errorData.detail === 'object' && 'error' in errorData.detail && errorData.detail.error === 'no_scan_data') {
          showError('No Scan Data', 'No RFID card scans found for this trip yet.');
          setScanEvents([]);
          return;
        } else {
          showError('Failed to Load Scan Events', errorMsg);
        }
        throw new Error(errorMsg);
      }
      
      const scanData = data as ScanResponse;
      const items = scanData.items || [];
      setScanEvents(items);
      
      // Calculate statistics
      const boardCount = items.filter(item => item.scan_type === 'board' && item.accepted).length;
      const dropCount = items.filter(item => item.scan_type === 'drop' && item.accepted).length;
      const uniquePassengers = new Set(items.map(item => item.passenger_name)).size;
      const totalFare = items.reduce((sum, item) => sum + (item.fare_amount || 0), 0) / 2; // Divide by 2 because each passenger has board and drop events
      
      setStats({
        board: boardCount,
        drop: dropCount,
        passengers: uniquePassengers,
        totalFare: totalFare
      });
      
      if (items.length === 0) {
        showError('No Scan Events', 'No RFID card scans found for this trip yet.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading scan data');
      setScanEvents([]);
    } finally {
      setLoadingScans(false);
    }
  }, [token]);

  // Handle route selection
  const handleRouteChange = (routeId: string) => {
    const selectedRoute = routes.find(r => r.route_id === routeId);
    setSelectedRouteId(routeId);
    setSelectedRouteName(selectedRoute?.name || '');
    if (routeId) {
      fetchTrips(routeId);
    } else {
      setTrips([]);
      setSelectedTripId('');
      setScanEvents([]);
      setSelectedRouteName('');
    }
  };

  // Handle trip selection
  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    if (tripId) {
      fetchScanEvents(tripId);
    } else {
      setScanEvents([]);
    }
  };

  // Refresh handler
  const handleRefresh = async (event: CustomEvent) => {
    if (selectedRouteId) {
      await fetchTrips(selectedRouteId);
      if (selectedTripId) {
        await fetchScanEvents(selectedTripId);
      }
    } else if (token) {
      await fetchRoutes(token);
    }
    event.detail.complete();
  };

  // Group scan events by passenger
  const groupScansByPassenger = () => {
    const passengerMap = new Map<string, { board: ScanEvent | null; drop: ScanEvent | null }>();
    
    scanEvents.forEach(scan => {
      if (!passengerMap.has(scan.passenger_name)) {
        passengerMap.set(scan.passenger_name, { board: null, drop: null });
      }
      
      const passenger = passengerMap.get(scan.passenger_name)!;
      if (scan.scan_type === 'board') {
        passenger.board = scan;
      } else if (scan.scan_type === 'drop') {
        passenger.drop = scan;
      }
    });
    
    return passengerMap;
  };

  // Filter passengers based on search term
  const filteredPassengers = () => {
    const passengerMap = groupScansByPassenger();
    const passengers = Array.from(passengerMap.entries()).map(([name, scans]) => ({
      passenger_name: name,
      board_event: scans.board,
      drop_event: scans.drop,
      has_boarded: !!scans.board,
      has_dropped: !!scans.drop,
      scanned_at: scans.board?.scanned_at || scans.drop?.scanned_at || '',
      fare_amount: scans.drop?.fare_amount || scans.board?.fare_amount || 0,
      driver_payout: scans.drop?.driver_payout_amount || scans.board?.driver_payout_amount || 0,
      hold_amount: scans.drop?.hold_amount || scans.board?.hold_amount || 0,
      ride_status: scans.drop?.ride_status || scans.board?.ride_status || ''
    }));
    
    return passengers.filter(p => 
      p.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.board_event?.board_stop_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.drop_event?.drop_stop_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTripStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ongoing':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTripStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <CalendarIcon className="w-3.5 h-3.5" />;
      case 'ongoing':
        return <ArrowPathIcon className="w-3.5 h-3.5" />;
      case 'completed':
        return <CheckCircleIcon className="w-3.5 h-3.5" />;
      case 'cancelled':
        return <XMarkIcon className="w-3.5 h-3.5" />;
      default:
        return <InformationCircleIcon className="w-3.5 h-3.5" />;
    }
  };

  const getPassengerStatus = (hasBoarded: boolean, hasDropped: boolean) => {
    if (hasDropped) return { text: 'Completed Trip', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', icon: <CheckCircleIcon className="w-4 h-4" /> };
    if (hasBoarded) return { text: 'On Board', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', icon: <CheckBadgeIcon className="w-4 h-4" /> };
    return { text: 'Not Boarded', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', icon: <XMarkIcon className="w-4 h-4" /> };
  };

  const filteredPassengerList = filteredPassengers();

  return (
    <IonPage className="bg-white dark:bg-black">
      <NavbarSidebar />
      <IonContent className="bg-white dark:bg-black">
        <div className="min-h-screen bg-white dark:bg-black">
          {/* Error Popup Modal */}
          {showErrorPopup && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fadeIn">
              <div className="flex items-center gap-3 p-5 rounded-2xl shadow-2xl min-w-[320px] max-w-[90%] mx-4 bg-red-50 dark:bg-red-900/95 border-2 border-red-200 dark:border-red-700">
                <div className="p-2.5 rounded-full shrink-0 bg-red-100 dark:bg-red-800">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-red-800 dark:text-red-200">
                    {errorTitle}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
                <button 
                  onClick={() => setShowErrorPopup(false)}
                  className="p-1.5 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition shrink-0"
                >
                  <XMarkIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="pt-20 pb-6 px-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <QrCodeIcon className="w-7 h-7 text-gray-700 dark:text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                RFID Passenger Tracking
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Track passenger boarding, drop-off events and fare details in real-time
            </p>
          </div>

          {/* Filters Section */}
          <div className="p-4 space-y-4 border-b border-gray-200 dark:border-gray-800">
            {/* Route Select */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Select Route
              </label>
              <div className="relative">
                <select
                  value={selectedRouteId}
                  onChange={(e) => handleRouteChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white appearance-none focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
                  disabled={loadingRoutes}
                >
                  <option value="">Select a route</option>
                  {routes.map((route) => (
                    <option key={route.route_id} value={route.route_id}>
                      {route.name} ({route.code})
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              </div>
              {loadingRoutes && (
                <div className="flex items-center justify-center mt-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 dark:border-gray-400"></div>
                </div>
              )}
            </div>

            {/* Selected Route Info */}
            {selectedRouteName && (
              <div className="p-3 rounded-lg bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Selected Route</p>
                <div className="flex items-center gap-2 mt-1">
                  <BusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRouteName}</p>
                </div>
              </div>
            )}

            {/* Trip Select */}
            {selectedRouteId && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                  Select Trip
                </label>
                <div className="relative">
                  <select
                    value={selectedTripId}
                    onChange={(e) => handleTripChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white appearance-none focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
                    disabled={loadingTrips}
                  >
                    <option value="">Select a trip</option>
                    {trips.map((trip) => (
                      <option key={trip.trip_id} value={trip.trip_id}>
                        {formatDate(trip.planned_start)} • {formatTime(trip.planned_start)} • {trip.status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
                
                {/* Trip Details Card */}
                {selectedTripId && !loadingTrips && trips.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    {trips.filter(t => t.trip_id === selectedTripId).map((trip) => (
                      <div key={trip.trip_id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTripStatusColor(trip.status)}`}>
                              {getTripStatusIcon(trip.status)}
                              <span>{trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}</span>
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                            ID: {trip.trip_id.slice(0, 8)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {formatDate(trip.planned_start)}
                          </span>
                          <ClockIcon className="w-3.5 h-3.5 text-gray-400 ml-2" />
                          <span className="text-gray-600 dark:text-gray-300">
                            {formatTime(trip.planned_start)} - {formatTime(trip.planned_end)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {loadingTrips && (
                  <div className="flex items-center justify-center mt-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 dark:border-gray-400"></div>
                  </div>
                )}
                {trips.length === 0 && !loadingTrips && selectedRouteId && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    No trips found for this route. Create a trip first.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Stats Cards */}
          {selectedTripId && scanEvents.length > 0 && (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-gray-200 dark:border-gray-800">
              <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 text-center border border-green-200 dark:border-green-800">
                <CheckBadgeIcon className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.board}</p>
                <p className="text-xs text-green-600 dark:text-green-500">Boarding Events</p>
              </div>
              <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3 text-center border border-blue-200 dark:border-blue-800">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.drop}</p>
                <p className="text-xs text-blue-600 dark:text-blue-500">Drop-off Events</p>
              </div>
              <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 text-center border border-purple-200 dark:border-purple-800">
                <UserCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.passengers}</p>
                <p className="text-xs text-purple-600 dark:text-purple-500">Unique Passengers</p>
              </div>
              <div className="bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-3 text-center border border-yellow-200 dark:border-yellow-800">
                <CreditCardIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">₹{stats.totalFare.toFixed(2)}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500">Total Fare</p>
              </div>
            </div>
          )}

          {/* Search Bar */}
          {selectedTripId && scanEvents.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by passenger name or stop name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-200 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Passenger List */}
          <div className="p-4">
            {/* Error Display */}
            {error && !showErrorPopup && (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-3" />
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                <button
                  onClick={() => {
                    if (selectedTripId) fetchScanEvents(selectedTripId);
                    else if (selectedRouteId) fetchTrips(selectedRouteId);
                    else if (token) fetchRoutes(token);
                  }}
                  className="mt-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Loading State */}
            {loadingScans && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">Loading scan events...</p>
              </div>
            )}

            {/* No Scans State */}
            {!loadingScans && selectedTripId && scanEvents.length === 0 && !error && (
              <div className="text-center py-12">
                <QrCodeIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No scan events found for this trip</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  When passengers scan their RFID cards, their boarding/drop-off will appear here
                </p>
              </div>
            )}

            {/* Passenger Cards */}
            {!loadingScans && filteredPassengerList.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {filteredPassengerList.length} passenger{filteredPassengerList.length !== 1 ? 's' : ''} found
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition"
                    >
                      Clear search
                    </button>
                  )}
                </div>

                {filteredPassengerList.map((passenger, idx) => {
                  const status = getPassengerStatus(passenger.has_boarded, passenger.has_dropped);
                  return (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 shadow-sm"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          {/* Header with passenger name and status */}
                          <div className="flex items-center flex-wrap gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <UserCircleIcon className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                              <div>
                                <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                                  {passenger.passenger_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                    {status.icon}
                                    <span>{status.text}</span>
                                  </span>
                                  
                                  {/* Fare Badge */}
                                  {passenger.fare_amount > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                      <CreditCardIcon className="w-3 h-3" />
                                      <span>₹{passenger.fare_amount.toFixed(2)}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Journey Timeline */}
                          <div className="space-y-3 mt-4">
                            {/* Boarding Section */}
                            {passenger.board_event ? (
                              <div className="flex items-start gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5"></div>
                                  {!passenger.drop_event && <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-700 mt-1"></div>}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CheckBadgeIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    <span className="text-xs font-medium text-green-700 dark:text-green-400">BOARDING</span>
                                    <span className="text-xs text-gray-400">{formatDateTime(passenger.board_event.scanned_at)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {passenger.board_event.board_stop_name || 'Unknown stop'}
                                    </p>
                                  </div>
                                  {passenger.board_event.within_radius ? (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                      ✓ Scanned within stop radius ({passenger.board_event.distance_from_stop_meters.toFixed(0)}m)
                                    </p>
                                  ) : (
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                      ⚠ Scanned {passenger.board_event.distance_from_stop_meters.toFixed(0)}m from stop
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start gap-3 opacity-50">
                                <div className="w-2.5 h-2.5 rounded-full bg-gray-400 mt-1.5"></div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <ClockIcon className="w-4 h-4 text-gray-400" />
                                    <span className="text-xs font-medium text-gray-500">BOARDING</span>
                                  </div>
                                  <p className="text-sm text-gray-500">Not yet boarded</p>
                                </div>
                              </div>
                            )}

                            {/* Drop-off Section */}
                            {passenger.drop_event ? (
                              <div className="flex items-start gap-3">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5"></div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <ShieldCheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-blue-700 dark:text-blue-400">DROP-OFF</span>
                                    <span className="text-xs text-gray-400">{formatDateTime(passenger.drop_event.scanned_at)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {passenger.drop_event.drop_stop_name || 'Unknown stop'}
                                    </p>
                                  </div>
                                  {passenger.drop_event.within_radius ? (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                      ✓ Scanned within stop radius ({passenger.drop_event.distance_from_stop_meters.toFixed(0)}m)
                                    </p>
                                  ) : (
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                      ⚠ Scanned {passenger.drop_event.distance_from_stop_meters.toFixed(0)}m from stop
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              passenger.has_boarded && (
                                <div className="flex items-start gap-3 opacity-50">
                                  <div className="w-2.5 h-2.5 rounded-full bg-gray-400 mt-1.5"></div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <ClockIcon className="w-4 h-4 text-gray-400" />
                                      <span className="text-xs font-medium text-gray-500">DROP-OFF</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Awaiting drop-off scan</p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>

                          {/* Fare Details Card - Show only if drop event exists */}
                          {passenger.drop_event && (
                            <div className="mt-4 p-3 rounded-lg bg-linear-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Fare Amount</p>
                                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                    ₹{passenger.fare_amount.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Driver Payout</p>
                                  <p className="text-md font-semibold text-blue-600 dark:text-blue-400">
                                    ₹{passenger.driver_payout.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Hold Amount</p>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    ₹{passenger.hold_amount.toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Ride Status</p>
                                  <p className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">
                                    {passenger.ride_status}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right side - Route Info */}
                        <div className="lg:text-right">
                          <div className="flex items-center lg:justify-end gap-2 mb-2">
                            <BusIcon className="w-4 h-4 text-gray-400" />
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {passenger.board_event?.route_name || passenger.drop_event?.route_name || 'Unknown route'}
                            </p>
                          </div>
                          {passenger.board_event && (
                            <div className="flex items-center lg:justify-end gap-1 text-xs text-gray-500">
                              <ClockIcon className="w-3 h-3" />
                              <span>Boarded: {formatTime(passenger.board_event.scanned_at)}</span>
                            </div>
                          )}
                          {passenger.drop_event && (
                            <div className="flex items-center lg:justify-end gap-1 text-xs text-gray-500 mt-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>Dropped: {formatTime(passenger.drop_event.scanned_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Initial State */}
            {!selectedTripId && !loadingRoutes && !loadingTrips && routes.length > 0 && (
              <div className="text-center py-12">
                <QrCodeIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Select a route and trip to view passenger RFID scans</p>
              </div>
            )}

            {/* No Routes State */}
            {!loadingRoutes && routes.length === 0 && !error && (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No routes assigned to you</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Please contact admin to get routes assigned
                </p>
              </div>
            )}
          </div>

          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent className="text-gray-600 dark:text-gray-400" />
          </IonRefresher>
        </div>
      </IonContent>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        .dark ::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #404040;
        }
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #555555;
        }
      `}</style>
    </IonPage>
  );
};

export default RfidPassengers;