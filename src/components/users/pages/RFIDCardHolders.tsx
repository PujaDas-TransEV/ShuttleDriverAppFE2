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
} from '@heroicons/react/24/outline';

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

interface RFIDPassenger {
  id: string;
  passenger_name: string;
  passenger_email?: string;
  passenger_phone?: string;
  rfid_card_number: string;
  boarding_stop?: string;
  boarding_time?: string;
  deboarding_stop?: string;
  deboarding_time?: string;
  seat_number?: string;
  status: 'boarded' | 'deboarded' | 'no_show';
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
  const [passengers, setPassengers] = useState<RFIDPassenger[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('');

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
    setPassengers([]);
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
      
      // Extract trips from the response structure
      const tripsData = data.trips || [];
      
      // Map the trips to our Trip interface
      const mappedTrips: Trip[] = tripsData.map((trip: any) => ({
        trip_id: trip.trip_id,
        status: trip.status || 'scheduled',
        planned_start: trip.planned_start,
        planned_end: trip.planned_end,
        actual_start: trip.actual_start || null,
        actual_end: trip.actual_end || null,
      }));
      
      // Sort trips by date descending (most recent first)
      const sortedTrips = mappedTrips.sort(
        (a: Trip, b: Trip) =>
          new Date(b.planned_start).getTime() - new Date(a.planned_start).getTime()
      );
      setTrips(sortedTrips);
      
      // Set route name from the response
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

  // Fetch RFID passenger details for selected trip
  const fetchRFIDPassengers = useCallback(async (tripId: string) => {
    if (!token || !tripId) return;
    setLoadingPassengers(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE}/driver/rfid/scan-details?scheduled_trip_id=${tripId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        const errorMsg = parseErrorResponse(data);
        
        if (data?.detail?.error === 'scheduled_trip_not_found') {
          showError('Trip Not Found', 'This scheduled trip could not be found. It may have been deleted or you may not have access.');
        } else if (data?.detail?.error === 'no_scan_data') {
          showError('No RFID Data', 'No RFID card scans found for this trip yet.');
          setPassengers([]);
          return;
        } else {
          showError('Failed to Load Passengers', errorMsg);
        }
        throw new Error(errorMsg);
      }
      
      setPassengers(data.passengers || []);
      
      if (data.passengers?.length === 0) {
        showError('No RFID Passengers', 'No passengers have scanned RFID cards on this trip yet.');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading passenger data');
      setPassengers([]);
    } finally {
      setLoadingPassengers(false);
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
      setPassengers([]);
      setSelectedRouteName('');
    }
  };

  // Handle trip selection
  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    if (tripId) {
      fetchRFIDPassengers(tripId);
    } else {
      setPassengers([]);
    }
  };

  // Refresh handler
  const handleRefresh = async (event: CustomEvent) => {
    if (selectedRouteId) {
      await fetchTrips(selectedRouteId);
      if (selectedTripId) {
        await fetchRFIDPassengers(selectedTripId);
      }
    } else if (token) {
      await fetchRoutes(token);
    }
    event.detail.complete();
  };

  // Filter passengers based on search term
  const filteredPassengers = passengers.filter(
    (p) =>
      p.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rfid_card_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.passenger_phone && p.passenger_phone.includes(searchTerm))
  );

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'boarded':
        return <CheckBadgeIcon className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'deboarded':
        return <ArrowPathIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
      default:
        return <NoSymbolIcon className="w-4 h-4 text-red-500 dark:text-red-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'boarded':
        return 'On Board';
      case 'deboarded':
        return 'Deboarded';
      default:
        return 'No Show';
    }
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

          {/* Header */}
          <div className="pt-20 pb-6 px-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <CreditCardIcon className="w-7 h-7 text-gray-700 dark:text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                RFID Passengers
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              View passengers who scanned RFID cards on your trips
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
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Selected Route</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedRouteName}</p>
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

          {/* Search Bar */}
          {selectedTripId && passengers.length > 0 && (
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name, RFID card or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 transition-colors"
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
                    if (selectedTripId) fetchRFIDPassengers(selectedTripId);
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
            {loadingPassengers && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400"></div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">Loading passenger data...</p>
              </div>
            )}

            {/* No Passengers State */}
            {!loadingPassengers && selectedTripId && passengers.length === 0 && !error && (
              <div className="text-center py-12">
                <UserCircleIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No RFID passengers found for this trip</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                  Passengers who scanned RFID cards will appear here
                </p>
              </div>
            )}

            {/* Passenger Cards */}
            {!loadingPassengers && filteredPassengers.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {filteredPassengers.length} passenger{filteredPassengers.length !== 1 ? 's' : ''}
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

                {filteredPassengers.map((passenger, idx) => (
                  <div
                    key={passenger.id || idx}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCircleIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                          <div>
                            <h3 className="text-gray-900 dark:text-white font-semibold text-base">
                              {passenger.passenger_name}
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <CreditCardIcon className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                              <p className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                                {passenger.rfid_card_number}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                          {passenger.boarding_stop && (
                            <div className="flex items-center gap-1.5">
                              <MapPinIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Boarding</p>
                                <p className="text-gray-700 dark:text-gray-300">{passenger.boarding_stop}</p>
                                {passenger.boarding_time && (
                                  <p className="text-gray-400 dark:text-gray-500 text-[11px]">
                                    {formatTime(passenger.boarding_time)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {passenger.deboarding_stop && (
                            <div className="flex items-center gap-1.5">
                              <MapPinIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Deboarding</p>
                                <p className="text-gray-700 dark:text-gray-300">{passenger.deboarding_stop}</p>
                                {passenger.deboarding_time && (
                                  <p className="text-gray-400 dark:text-gray-500 text-[11px]">
                                    {formatTime(passenger.deboarding_time)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {passenger.seat_number && (
                            <div className="flex items-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Seat</p>
                                <p className="text-gray-700 dark:text-gray-300">{passenger.seat_number}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1.5">
                          {getStatusIcon(passenger.status)}
                          <span className={`text-xs font-medium ${
                            passenger.status === 'boarded' ? 'text-green-600 dark:text-green-400' :
                            passenger.status === 'deboarded' ? 'text-gray-500 dark:text-gray-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {getStatusText(passenger.status)}
                          </span>
                        </div>
                        {passenger.boarding_time && passenger.status === 'boarded' && (
                          <div className="flex items-center gap-1 mt-1">
                            <ClockIcon className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-[11px] text-gray-500 dark:text-gray-400">
                              Since {formatTime(passenger.boarding_time)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Initial State */}
            {!selectedTripId && !loadingRoutes && !loadingTrips && routes.length > 0 && (
              <div className="text-center py-12">
                <CreditCardIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Select a route and trip to view RFID passengers</p>
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