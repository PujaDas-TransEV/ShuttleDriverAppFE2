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
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  PercentBadgeIcon,
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
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'in_progress' | 'premature_end';
  planned_start: string;
  planned_end: string;
  actual_start: string | null;
  actual_end: string | null;
}

// Complete interface matching your exact JSON response
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
  fare_reversed_amount: number;
  fare_net_amount: number;
  commission_amount: number;
  driver_payout_amount: number;
  driver_payout_reversed_amount: number;
  driver_payout_net_amount: number;
  platform_amount: number;
  platform_amount_reversed: number;
  platform_net_amount: number;
  transfer_status: 'withheld' | 'transferred' | 'pending';
  scan_lat: number | null;
  scan_lng: number | null;
  distance_from_stop_meters: number | null;
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
  const [stats, setStats] = useState({ 
    board: 0, 
    drop: 0, 
    passengers: 0, 
    totalFare: 0,
    totalDriverPayout: 0,
    totalPlatformAmount: 0,
    totalCommission: 0,
    totalHoldAmount: 0
  });
  const [noScanData, setNoScanData] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<ScanEvent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
    setNoScanData(false);
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
    setNoScanData(false);
    try {
      const response = await fetch(
        `${API_BASE}/driver/rfid/scan-details?scheduled_trip_id=${tripId}&page=1&page_size=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data: ScanResponse | ErrorResponse = await response.json();
      
      if (!response.ok) {
        const errorMsg = parseErrorResponse(data);
        const errorData = data as ErrorResponse;
        
        if (errorData?.detail && typeof errorData.detail === 'object' && 'error' in errorData.detail) {
          if (errorData.detail.error === 'scheduled_trip_not_found') {
            showError('Trip Not Found', 'This scheduled trip could not be found. It may have been deleted or you may not have access.');
            setScanEvents([]);
            return;
          } else if (errorData.detail.error === 'no_scan_data') {
            setNoScanData(true);
            setScanEvents([]);
            setStats({ 
              board: 0, 
              drop: 0, 
              passengers: 0, 
              totalFare: 0,
              totalDriverPayout: 0,
              totalPlatformAmount: 0,
              totalCommission: 0,
              totalHoldAmount: 0
            });
            return;
          }
        }
        
        showError('Failed to Load Scan Events', errorMsg);
        setScanEvents([]);
        return;
      }
      
      const scanData = data as ScanResponse;
      const items = scanData.items || [];
      setScanEvents(items);
      setNoScanData(items.length === 0);
      
      // Calculate statistics with all fare details - using drop events for accurate totals
      const boardCount = items.filter(item => item.scan_type === 'board' && item.accepted).length;
      const dropCount = items.filter(item => item.scan_type === 'drop' && item.accepted).length;
      const uniquePassengers = new Set(items.map(item => item.passenger_name)).size;
      
      // Calculate totals from drop events (since fare is finalized at drop)
      const dropEvents = items.filter(item => item.scan_type === 'drop' && item.accepted);
      
      const totalFare = dropEvents.reduce((sum, item) => sum + (item.fare_net_amount || 0), 0);
      const totalDriverPayout = dropEvents.reduce((sum, item) => sum + (item.driver_payout_net_amount || 0), 0);
      const totalPlatformAmount = dropEvents.reduce((sum, item) => sum + (item.platform_net_amount || 0), 0);
      const totalCommission = dropEvents.reduce((sum, item) => sum + (item.commission_amount || 0), 0);
      
      // Hold amount appears on both board and drop, so divide by 2 for total
      const totalHoldAmount = items.reduce((sum, item) => sum + (item.hold_amount || 0), 0) / 2;
      
      setStats({
        board: boardCount,
        drop: dropCount,
        passengers: uniquePassengers,
        totalFare,
        totalDriverPayout,
        totalPlatformAmount,
        totalCommission,
        totalHoldAmount
      });
      
      if (items.length === 0) {
        console.log('No scan events found for this trip');
      }
    } catch (err: any) {
      console.error('Error fetching scan events:', err);
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
      setNoScanData(false);
    }
  };

  // Handle trip selection
  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    setNoScanData(false);
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

  // Show event details modal
  const showEventDetails = (event: ScanEvent) => {
    setSelectedEventDetails(event);
    setShowDetailsModal(true);
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

  // Helper function to safely format numbers
  const safeToFixed = (value: number | null | undefined, digits: number = 2): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(digits);
  };

  // Get transfer status color and label
  const getTransferStatusInfo = (status: string) => {
    switch (status) {
      case 'transferred':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircleIcon className="w-3 h-3" />, label: 'Transferred' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <ClockIcon className="w-3 h-3" />, label: 'Pending' };
      case 'withheld':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <ExclamationTriangleIcon className="w-3 h-3" />, label: 'Withheld' };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', icon: <InformationCircleIcon className="w-3 h-3" />, label: 'Unknown' };
    }
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
      // Use drop event values for fare details (finalized amounts)
      hold_amount: scans.drop?.hold_amount ?? scans.board?.hold_amount ?? 0,
      fare_amount: scans.drop?.fare_amount ?? 0,
      fare_net_amount: scans.drop?.fare_net_amount ?? 0,
      fare_reversed_amount: scans.drop?.fare_reversed_amount ?? 0,
      commission_amount: scans.drop?.commission_amount ?? 0,
      driver_payout_amount: scans.drop?.driver_payout_amount ?? 0,
      driver_payout_net_amount: scans.drop?.driver_payout_net_amount ?? 0,
      platform_amount: scans.drop?.platform_amount ?? 0,
      platform_net_amount: scans.drop?.platform_net_amount ?? 0,
      ride_status: scans.drop?.ride_status || scans.board?.ride_status || '',
      transfer_status: scans.drop?.transfer_status || scans.board?.transfer_status || '',
    }));
    
    return passengers.filter(p => 
      p.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.board_event?.board_stop_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.drop_event?.drop_stop_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
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
      case 'in_progress':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'premature_end':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTripStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <CalendarIcon className="w-3.5 h-3.5" />;
      case 'ongoing':
      case 'in_progress':
        return <ArrowPathIcon className="w-3.5 h-3.5" />;
      case 'completed':
        return <CheckCircleIcon className="w-3.5 h-3.5" />;
      case 'cancelled':
        return <XMarkIcon className="w-3.5 h-3.5" />;
      case 'premature_end':
        return <ExclamationTriangleIcon className="w-3.5 h-3.5" />;
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

  // Details Modal Component
  const EventDetailsModal = () => {
    if (!selectedEventDetails) return null;
    const transferInfo = getTransferStatusInfo(selectedEventDetails.transfer_status);
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)}>
        <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Scan Event Details</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">{selectedEventDetails.scan_type?.toUpperCase()} Event</p>
            </div>
            <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="p-5 space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Passenger</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedEventDetails.passenger_name}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Route</p>
                <p className="font-semibold text-gray-900 dark:text-white">{selectedEventDetails.route_name}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Stop</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedEventDetails.scan_type === 'board' 
                    ? selectedEventDetails.board_stop_name || 'N/A'
                    : selectedEventDetails.drop_stop_name || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Scanned At</p>
                <p className="font-semibold text-gray-900 dark:text-white">{formatDateTime(selectedEventDetails.scanned_at)}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <p className={`font-semibold ${selectedEventDetails.accepted ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedEventDetails.accepted ? '✓ Accepted' : '✗ Rejected'}
                  {selectedEventDetails.rejection_reason && ` - ${selectedEventDetails.rejection_reason}`}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">Ride Status</p>
                <p className="font-semibold text-gray-900 dark:text-white capitalize">{selectedEventDetails.ride_status}</p>
              </div>
            </div>

            {/* Hold Amount Section */}
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BanknotesIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Hold Amount</span>
                </div>
                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">₹{safeToFixed(selectedEventDetails.hold_amount)}</p>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                Amount held temporarily from passenger's account
              </p>
            </div>

            {/* Fare Breakdown Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <CurrencyRupeeIcon className="w-4 h-4" />
                Fare Breakdown
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400">Fare Amount</p>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">₹{safeToFixed(selectedEventDetails.fare_amount)}</p>
                </div>
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">Fare Reversed</p>
                  <p className="text-lg font-bold text-red-700 dark:text-red-400">₹{safeToFixed(selectedEventDetails.fare_reversed_amount)}</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400">Net Fare</p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-400">₹{safeToFixed(selectedEventDetails.fare_net_amount)}</p>
                </div>
              </div>
            </div>

            {/* Commission & Platform Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <BuildingOfficeIcon className="w-4 h-4" />
                Platform & Commission
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PercentBadgeIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs text-purple-600 dark:text-purple-400">Commission</span>
                    </div>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-400">₹{safeToFixed(selectedEventDetails.commission_amount)}</p>
                  </div>
                </div>
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs text-indigo-600 dark:text-indigo-400">Platform Fee</span>
                    </div>
                    <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400">₹{safeToFixed(selectedEventDetails.platform_amount)}</p>
                  </div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Platform Reversed</p>
                  <p className="text-md font-semibold text-gray-700 dark:text-gray-300">₹{safeToFixed(selectedEventDetails.platform_amount_reversed)}</p>
                </div>
                <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <p className="text-xs text-teal-600 dark:text-teal-400">Net Platform</p>
                  <p className="text-md font-semibold text-teal-700 dark:text-teal-400">₹{safeToFixed(selectedEventDetails.platform_net_amount)}</p>
                </div>
              </div>
            </div>

            {/* Driver Payout Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <UserCircleIcon className="w-4 h-4" />
                Driver Payout
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Driver Payout</p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">₹{safeToFixed(selectedEventDetails.driver_payout_amount)}</p>
                </div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-xs text-orange-600 dark:text-orange-400">Payout Reversed</p>
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-400">₹{safeToFixed(selectedEventDetails.driver_payout_reversed_amount)}</p>
                </div>
                <div className="p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg col-span-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-teal-600 dark:text-teal-400">Net Driver Payout</p>
                    <p className="text-xl font-bold text-teal-700 dark:text-teal-400">₹{safeToFixed(selectedEventDetails.driver_payout_net_amount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer Status */}
            <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Transfer Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${transferInfo.color}`}>
                  {transferInfo.icon}
                  <span>{transferInfo.label}</span>
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {selectedEventDetails.transfer_status === 'withheld' && '💰 Payment is withheld and not yet transferred to driver'}
                {selectedEventDetails.transfer_status === 'pending' && '⏳ Payment transfer is pending processing'}
                {selectedEventDetails.transfer_status === 'transferred' && '✅ Payment has been transferred successfully'}
              </p>
            </div>

            {/* Location Details */}
            {(selectedEventDetails.scan_lat || selectedEventDetails.scan_lng) && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  Location Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Latitude</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{selectedEventDetails.scan_lat?.toFixed(6) || 'N/A'}</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Longitude</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{selectedEventDetails.scan_lng?.toFixed(6) || 'N/A'}</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Distance from Stop</p>
                    <p className={`font-semibold ${selectedEventDetails.within_radius ? 'text-green-600' : 'text-yellow-600'}`}>
                      {Math.abs(selectedEventDetails.distance_from_stop_meters || 0).toFixed(0)} meters 
                      {selectedEventDetails.within_radius ? ' ✓ Within radius' : ' ⚠ Outside radius'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-3">
              <p>Event ID: {selectedEventDetails.scan_event_id}</p>
            </div>
          </div>
          
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
            <button onClick={() => setShowDetailsModal(false)} className="w-full py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

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

          {/* Details Modal */}
          {showDetailsModal && <EventDetailsModal />}

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

          {/* Enhanced Stats Cards - 6 Cards including Commission & Platform */}
          {selectedTripId && scanEvents.length > 0 && (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 border-b border-gray-200 dark:border-gray-800">
              <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-3 text-center border border-green-200 dark:border-green-800">
                <CheckBadgeIcon className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.board}</p>
                <p className="text-xs text-green-600 dark:text-green-500">Boarding</p>
              </div>
              <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-3 text-center border border-blue-200 dark:border-blue-800">
                <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.drop}</p>
                <p className="text-xs text-blue-600 dark:text-blue-500">Drop-off</p>
              </div>
              <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 text-center border border-purple-200 dark:border-purple-800">
                <UserCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.passengers}</p>
                <p className="text-xs text-purple-600 dark:text-purple-500">Passengers</p>
              </div>
              <div className="bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-3 text-center border border-yellow-200 dark:border-yellow-800">
                <CurrencyRupeeIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">₹{safeToFixed(stats.totalFare)}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500">Net Fare</p>
              </div>
              <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-3 text-center border border-purple-200 dark:border-purple-800">
                <PercentBadgeIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-purple-700 dark:text-purple-400">₹{safeToFixed(stats.totalCommission)}</p>
                <p className="text-xs text-purple-600 dark:text-purple-500">Commission</p>
              </div>
              <div className="bg-linear-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-3 text-center border border-emerald-200 dark:border-emerald-800">
                <BanknotesIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">₹{safeToFixed(stats.totalDriverPayout)}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">Driver Payout</p>
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
            {!loadingScans && selectedTripId && noScanData && !error && (
              <div className="text-center py-12">
                <QrCodeIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No RFID Scan Data Available</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2 max-w-md mx-auto">
                  No passengers have scanned their RFID cards on this trip yet. 
                  Scans will appear here once passengers board or alight from the bus.
                </p>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg inline-block">
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    💡 Tip: RFID scans are recorded when passengers tap their cards at boarding/drop-off points
                  </p>
                </div>
              </div>
            )}

            {/* Passenger Cards */}
            {!loadingScans && filteredPassengerList.length > 0 && (
              <div className="space-y-4">
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
                  const transferInfo = getTransferStatusInfo(passenger.transfer_status);
                  
                  return (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="p-4">
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
                                  <div className="flex items-center flex-wrap gap-2 mt-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                      {status.icon}
                                      <span>{status.text}</span>
                                    </span>
                                    
                                    {passenger.fare_net_amount > 0 && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                        <CreditCardIcon className="w-3 h-3" />
                                        <span>₹{safeToFixed(passenger.fare_net_amount)}</span>
                                      </span>
                                    )}
                                    
                                    {passenger.transfer_status && (
                                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${transferInfo.color}`}>
                                        {transferInfo.icon}
                                        <span>{transferInfo.label}</span>
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
                                  <div className="flex-1 cursor-pointer" onClick={() => passenger.board_event && showEventDetails(passenger.board_event)}>
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
                                        ✓ Scanned within stop radius ({Math.abs(passenger.board_event.distance_from_stop_meters || 0).toFixed(0)}m)
                                      </p>
                                    ) : (
                                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                        ⚠ Scanned {Math.abs(passenger.board_event.distance_from_stop_meters || 0).toFixed(0)}m from stop
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
                                  <div className="flex-1 cursor-pointer" onClick={() => passenger.drop_event && showEventDetails(passenger.drop_event)}>
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
                                        ✓ Scanned within stop radius ({Math.abs(passenger.drop_event.distance_from_stop_meters || 0).toFixed(0)}m)
                                      </p>
                                    ) : (
                                      <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                                        ⚠ Scanned {Math.abs(passenger.drop_event.distance_from_stop_meters || 0).toFixed(0)}m from stop
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

                            {/* Fare Details Card - Complete breakdown */}
                            {passenger.drop_event && (
                              <div className="mt-4 p-3 rounded-lg bg-linear-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Hold Amount</p>
                                    <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                      ₹{safeToFixed(passenger.hold_amount)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Net Fare</p>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                      ₹{safeToFixed(passenger.fare_net_amount)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Commission</p>
                                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                      ₹{safeToFixed(passenger.commission_amount)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Platform Fee</p>
                                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                      ₹{safeToFixed(passenger.platform_net_amount)}
                                    </p>
                                  </div>
                                  <div className="col-span-2 sm:col-span-4 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Driver Payout</p>
                                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                        ₹{safeToFixed(passenger.driver_payout_net_amount)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => passenger.drop_event && showEventDetails(passenger.drop_event)}
                                  className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                >
                                  <DocumentTextIcon className="w-3 h-3" />
                                  View complete fare breakdown
                                </button>
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