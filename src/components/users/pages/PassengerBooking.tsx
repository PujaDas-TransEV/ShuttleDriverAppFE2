import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import { Preferences } from '@capacitor/preferences';
import NavbarSidebar from "./Navbar";
import {
  ClockIcon,
  TruckIcon,
  IdentificationIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  MapIcon,
  TicketIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UsersIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  CreditCardIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { BusIcon } from "lucide-react";

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

interface DropEvent {
  booking_id: string;
  passenger: {
    id: string;
    email: string;
  };
  booked_drop: {
    stop_id: string;
    name: string;
    sequence: number;
  };
  actual_drop: {
    stop_id: string;
    name: string;
    sequence: number;
  };
  flags: {
    early_drop: boolean;
    exact_drop: boolean;
  };
  scan_info: {
    lat: number;
    lng: number;
    within_radius: boolean;
    scanned_at: string;
  };
}

const BookingDetails: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [sortedTrips, setSortedTrips] = useState<any[]>([]);
  const [dropEvents, setDropEvents] = useState<Map<string, DropEvent>>(new Map());
  const [loadingDropEvents, setLoadingDropEvents] = useState<Set<string>>(new Set());

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
    };
    loadToken();
  }, []);

  // Fetch all routes
  useEffect(() => {
    if (!token) return;
    
    const fetchRoutes = async () => {
      try {
        const res = await fetch(`${API_BASE}/driver/routes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRoutes(data || []);
        if (data && data.length > 0) setSelectedRouteId(data[0].route_id);
      } catch (err) {
        console.error("Error fetching routes:", err);
      }
    };
    fetchRoutes();
  }, [token]);

  // Fetch vehicle first
  useEffect(() => {
    if (!token) return;
    
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/driver/vehicle/my-vehicle`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setVehicleData(data);
      } catch (err) {
        console.error("Error fetching vehicle:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [token]);

  // Fetch trips for selected route and sort them - MOST RECENT FIRST
  useEffect(() => {
    if (!selectedRouteId || !token) return;
    
    const fetchRouteDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/driver/routes/${selectedRouteId}/trips/details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setRouteDetails(data);
        
        if (data.trips && data.trips.length > 0) {
          const sorted = [...data.trips].sort((a, b) => 
            new Date(b.planned_start).getTime() - new Date(a.planned_start).getTime()
          );
          setSortedTrips(sorted);
          setSelectedTripId(sorted[0].trip_id);
        } else {
          setSortedTrips([]);
          setSelectedTripId("");
          setBookingDetails(null);
        }
      } catch (err) {
        console.error("Error fetching route details:", err);
        setRouteDetails(null);
        setSortedTrips([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRouteDetails();
  }, [selectedRouteId, token]);

  // Fetch booking details whenever selectedTripId changes
  useEffect(() => {
    if (!selectedTripId || !vehicleData || !token) return;
    
    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/driver/trips/${selectedTripId}/booking-details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setBookingDetails(data);
        // Clear drop events when changing trips
        setDropEvents(new Map());
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setBookingDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [selectedTripId, vehicleData, token]);

  // Fetch drop events for a specific booking
  const fetchDropEvents = async (bookingId: string) => {
    if (!selectedTripId || !token) return;
    
    setLoadingDropEvents(prev => new Set(prev).add(bookingId));
    try {
      const res = await fetch(
        `${API_BASE}/driver/trips/${selectedTripId}/drop-events`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      
      if (data.data && Array.isArray(data.data)) {
        const dropEventsMap = new Map(dropEvents);
        data.data.forEach((event: DropEvent) => {
          dropEventsMap.set(event.booking_id, event);
        });
        setDropEvents(dropEventsMap);
      }
    } catch (err) {
      console.error(`Error fetching drop events for booking ${bookingId}:`, err);
    } finally {
      setLoadingDropEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  // Fetch drop events when expanding a booking
  const handleToggleBooking = async (bookingId: string) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(bookingId);
      // Fetch drop events if not already fetched
      if (!dropEvents.has(bookingId)) {
        await fetchDropEvents(bookingId);
      }
    }
  };

  const availableSeats = vehicleData?.seat_count ?? 10;
  const bookingCount = bookingDetails?.booking_count ?? 0;
  const seatsLeft = availableSeats - bookingCount;
  const bookings = bookingDetails?.bookings ?? [];

  const formatDateTime = (dt: string) =>
    dt
      ? new Date(dt).toLocaleString("en-IN", {
          hour12: true,
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "--";

  const formatDate = (dt: string) =>
    dt ? new Date(dt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "--";

  const formatTime = (dt: string) =>
    dt ? new Date(dt).toLocaleTimeString("en-IN", { hour12: true, timeStyle: "short" }) : "--";

  const isUpcomingTrip = (plannedStart: string) => {
    return new Date(plannedStart) > new Date();
  };

  const isTodayTrip = (plannedStart: string) => {
    const today = new Date();
    const tripDate = new Date(plannedStart);
    return tripDate.toDateString() === today.toDateString();
  };

  const formatTripDisplay = (trip: any) => {
    const startDate = new Date(trip.planned_start);
    const endDate = new Date(trip.planned_end);
    const isUpcoming = isUpcomingTrip(trip.planned_start);
    const isToday = isTodayTrip(trip.planned_start);
    
    const formattedDate = startDate.toLocaleDateString("en-IN", { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
    
    const startTime = startDate.toLocaleTimeString("en-IN", { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    const endTime = endDate.toLocaleTimeString("en-IN", { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    let icon = "🔵";
    let statusText = "";
    
    if (isToday) {
      icon = "🟡";
      statusText = " (Today)";
    } else if (isUpcoming) {
      icon = "🟢";
      statusText = " (Upcoming)";
    } else {
      icon = "🔵";
      statusText = " (Completed)";
    }
    
    return {
      display: `${formattedDate} | ${startTime} - ${endTime}`,
      icon,
      statusText,
      isUpcoming,
      isToday,
      date: startDate
    };
  };

  // Get drop event for a booking
  const getDropEventForBooking = (bookingId: string): DropEvent | undefined => {
    return dropEvents.get(bookingId);
  };

  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-6xl mx-auto">
          <IonLoading isOpen={loading} message="Loading booking details..." />

          {/* Header Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
              <BusIcon className="w-4 h-4" />
              <span>Booking Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-700 bg-clip-text text-transparent dark:text-gray-500">
              Booking Details
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              View and manage passenger bookings with drop=off tracking
            </p>
          </div>

          {/* Filters Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="p-6 space-y-4">
              {/* Route Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Select Route
                </label>
                <div className="relative">
                  <select
                    value={selectedRouteId}
                    onChange={(e) => setSelectedRouteId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                      backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
                      color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
                      transition: 'all 0.2s ease',
                      appearance: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.outline = 'none';
                      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {routes.map((r) => (
                      <option 
                        key={r.route_id} 
                        value={r.route_id}
                        style={{
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                          color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
                          padding: '8px',
                        }}
                      >
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Trip Selector */}
              {sortedTrips.length > 0 ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Trip
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '2px solid',
                        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
                        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
                        transition: 'all 0.2s ease',
                        appearance: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {sortedTrips.map((t: any) => {
                        const tripInfo = formatTripDisplay(t);
                        return (
                          <option 
                            key={t.trip_id} 
                            value={t.trip_id}
                            style={{
                              backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                              color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
                              padding: '8px',
                              fontWeight: tripInfo.isToday ? 'bold' : 'normal',
                            }}
                          >
                            {tripInfo.icon} {tripInfo.display}{tripInfo.statusText}
                          </option>
                        );
                      })}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      🟢 Upcoming | 🟡 Today | 🔵 Completed
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      📅 Showing all trips (most recent first)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-400 font-medium">
                    ⚠️ No trips created for this route. Please create a trip first.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          {bookingDetails && (
            <>
              {/* Trip Summary Card */}
              <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {bookingDetails.route?.name || "--"}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-500">
                        {formatDate(bookingDetails.planned_start)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                      Trip ID: {selectedTripId.slice(-8)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <ClockIcon className="w-6 h-6 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Journey Time</p>
                      <p className="text-sm font-medium">
                        {formatDateTime(bookingDetails.planned_start)} - {formatDateTime(bookingDetails.planned_end)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <TruckIcon className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
                      <p className="text-sm font-medium">
                        {vehicleData?.vehicle_name || "--"} ({vehicleData?.registration_number || "--"})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <IdentificationIcon className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Driver</p>
                      <p className="text-sm font-medium">{bookingDetails.driver?.email || "--"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <UserGroupIcon className="w-6 h-6 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Seats Status</p>
                      <p className="text-sm font-medium">
                        {bookingCount} / {availableSeats} booked
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <CurrencyRupeeIcon className="w-6 h-6 text-pink-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Fare</p>
                      <p className="text-sm font-medium">₹{bookingDetails.total_fare?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <CreditCardIcon className="w-6 h-6 text-indigo-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
                      <p className="text-sm font-medium">₹{bookingDetails.total_fare_paid?.toFixed(2) || "0.00"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seat Availability Alert */}
              {isUpcomingTrip(bookingDetails.planned_start) && (
                <div className={`mb-6 rounded-xl p-4 ${
                  seatsLeft <= 0
                    ? "bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700"
                    : seatsLeft <= 5
                    ? "bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700"
                    : "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
                }`}>
                  <div className="flex items-center gap-3">
                    <UsersIcon className={`w-6 h-6 ${
                      seatsLeft <= 0 ? "text-red-600" : seatsLeft <= 5 ? "text-orange-600" : "text-green-600"
                    }`} />
                    <div>
                      <p className={`font-semibold ${
                        seatsLeft <= 0 ? "text-red-800 dark:text-red-300" : 
                        seatsLeft <= 5 ? "text-orange-800 dark:text-orange-300" : 
                        "text-green-800 dark:text-green-300"
                      }`}>
                        {seatsLeft <= 0
                          ? "🚫 No seats available — Booking Closed"
                          : `🎟️ Seats Available: ${seatsLeft} remaining out of ${availableSeats}`}
                      </p>
                      {seatsLeft <= 5 && seatsLeft > 0 && (
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                          ⚠️ Only {seatsLeft} seats left! Limited availability.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Past Trip Note */}
              {!isUpcomingTrip(bookingDetails.planned_start) && (
                <div className="mb-6 rounded-xl p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-6 h-6 text-gray-500" />
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        📅 Past Trip
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">
                        This trip has already been completed. Showing historical booking data with drop-off tracking.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bookings List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Passenger Bookings ({bookings.length})
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {bookings.length} passengers
                  </span>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-200 font-medium">
                      No bookings have been made for this trip yet.
                    </p>
                  </div>
                ) : (
                  bookings.map((b: any, idx: number) => {
                    const dropEvent = getDropEventForBooking(b.booking_id);
                    const isLoadingDrop = loadingDropEvents.has(b.booking_id);
                    
                    return (
                      <div
                        key={idx}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
                      >
                        {/* Booking Header */}
                        <div
                          className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          onClick={() => handleToggleBooking(b.booking_id || idx.toString())}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                <span className="text-blue-700 dark:text-blue-400 font-semibold">
                                  {idx + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">
                                  {b.name || "Passenger"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Booking ID: {b.booking_id?.slice(-8) || "--"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              {/* Drop Event Status Badge */}
                              {dropEvent && (
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  dropEvent.flags.early_drop
                                    ? "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400"
                                    : dropEvent.flags.exact_drop
                                    ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                }`}>
                                  {dropEvent.flags.early_drop ? "Early Drop" : 
                                   dropEvent.flags.exact_drop ? "Exact Drop" : "Regular Drop"}
                                </div>
                              )}
                              
                              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                b.fare_paid === b.fare
                                  ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                                  : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                              }`}>
                                {b.fare_paid === b.fare ? (
                                  <span className="flex items-center gap-1">
                                    <CheckCircleIcon className="w-3 h-3" />
                                    Paid
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <XCircleIcon className="w-3 h-3" />
                                    Pending
                                  </span>
                                )}
                              </div>
                              
                              {expandedBooking === (b.booking_id || idx.toString()) ? (
                                <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedBooking === (b.booking_id || idx.toString()) && (
                          <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50">
                            {/* Original Booking Details */}
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                <TicketIcon className="w-4 h-4" />
                                Booking Details
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div className="flex items-start gap-2">
                                    <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Booked Pickup</p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {b.take_in || "--"}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <MapPinIcon className="w-5 h-5 text-red-500 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Booked Drop-off</p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {b.drop_off || "--"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-start gap-2">
                                    <ClockIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Pickup</p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {b.estimated_pickup_time ? new Date(b.estimated_pickup_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "--"}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-2">
                                    <ClockIcon className="w-5 h-5 text-purple-500 mt-0.5" />
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Drop-off</p>
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {b.estimated_drop_off_time ? new Date(b.estimated_drop_off_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "--"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Drop Event Details - Actual Drop Location */}
                            {isLoadingDrop ? (
                              <div className="flex items-center justify-center py-4">
                                <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
                                <span className="ml-2 text-sm text-gray-500">Loading drop events...</span>
                              </div>
                            ) : dropEvent ? (
                              <div className="mt-4 pt-4 border-t-2 border-blue-200 dark:border-blue-800">
                                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                                  <MapPinIcon className="w-4 h-4" />
                                  Actual Drop-off Information
                                  {dropEvent.scan_info.within_radius && (
                                    <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                                      Verified
                                    </span>
                                  )}
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                                      <MapPinIcon className="w-5 h-5 text-orange-500 mt-0.5" />
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Actual Drop Location</p>
                                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
                                          {dropEvent.actual_drop.name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          Sequence: {dropEvent.actual_drop.sequence}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                                      <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Booked Drop Location</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {dropEvent.booked_drop.name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                          Sequence: {dropEvent.booked_drop.sequence}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    <div className="flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                                      <ClockIcon className="w-5 h-5 text-purple-500 mt-0.5" />
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Scanned At</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          {formatDateTime(dropEvent.scan_info.scanned_at)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                                      <MapIcon className="w-5 h-5 text-green-500 mt-0.5" />
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Scan Location</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                          Lat: {dropEvent.scan_info.lat.toFixed(6)}, Lng: {dropEvent.scan_info.lng.toFixed(6)}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                          {dropEvent.scan_info.within_radius ? "✓ Within valid radius" : "✗ Outside valid radius"}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Early Drop Warning */}
                                {dropEvent.flags.early_drop && (
                                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                                      ⚠️ Early Drop-off Alert: Passenger was dropped off at "{dropEvent.actual_drop.name}" instead of "{dropEvent.booked_drop.name}"
                                    </p>
                                  </div>
                                )}

                                {/* Exact Drop Confirmation */}
                                {dropEvent.flags.exact_drop && (
                                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-sm text-green-800 dark:text-green-400 flex items-center gap-2">
                                      ✓ Drop-off confirmed at exact booked location "{dropEvent.booked_drop.name}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-center py-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No drop event recorded for this booking yet.
                                  </p>
                                  <button
                                    onClick={() => fetchDropEvents(b.booking_id)}
                                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto"
                                  >
                                    <ArrowPathIcon className="w-3 h-3" />
                                    Refresh
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Fare Details */}
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Fare:</span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  ₹{b.fare ?? "--"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Paid:</span>
                                <span className={`text-sm font-semibold ${
                                  b.fare_paid === b.fare
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}>
                                  ₹{b.fare_paid ?? "--"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </IonContent>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgb(243 244 246);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgb(156 163 175);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgb(107 114 128);
        }
        
        .dark ::-webkit-scrollbar-track {
          background: rgb(31 41 55);
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: rgb(75 85 99);
        }
        
        .bg-grid-gray-900\\/[0.02] {
          background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
        }
        
        .dark .bg-grid-white\\/[0.02] {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
        
        select option {
          background-color: #ffffff;
          color: #1f2937;
        }
        
        .dark select option {
          background-color: #1f2937 !important;
          color: #ffffff !important;
        }
        
        select {
          color-scheme: light;
        }
        
        .dark select {
          color-scheme: dark;
        }
      `}</style>
    </IonPage>
  );
};

export default BookingDetails;