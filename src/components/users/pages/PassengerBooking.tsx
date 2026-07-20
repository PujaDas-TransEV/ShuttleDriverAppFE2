// import React, { useState, useEffect } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import { Preferences } from '@capacitor/preferences';
// import NavbarSidebar from "./Navbar";
// import {
//   ClockIcon,
//   TruckIcon,
//   IdentificationIcon,
//   UserGroupIcon,
//   CurrencyRupeeIcon,
//   MapIcon,
//   TicketIcon,
//   ChevronDownIcon,
//   ChevronUpIcon,
//   UsersIcon,
//   CalendarIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   MapPinIcon,
//   CreditCardIcon,
//   ArrowPathIcon,
// } from "@heroicons/react/24/outline";
// import { BusIcon } from "lucide-react";

// const API_BASE = "https://be.shuttleapp.transev.site";

// // Helper function to get token from Preferences
// const getToken = async (): Promise<string | null> => {
//   try {
//     const { value } = await Preferences.get({ key: 'access_token' });
//     return value || null;
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return null;
//   }
// };

// interface DropEvent {
//   booking_id: string;
//   passenger: {
//     id: string;
//     email: string;
//   };
//   booked_drop: {
//     stop_id: string;
//     name: string;
//     sequence: number;
//   };
//   actual_drop: {
//     stop_id: string;
//     name: string;
//     sequence: number;
//   };
//   flags: {
//     early_drop: boolean;
//     exact_drop: boolean;
//   };
//   scan_info: {
//     lat: number;
//     lng: number;
//     within_radius: boolean;
//     scanned_at: string;
//   };
// }

// const BookingDetails: React.FC = () => {
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [routes, setRoutes] = useState<any[]>([]);
//   const [selectedRouteId, setSelectedRouteId] = useState<string>("");
//   const [routeDetails, setRouteDetails] = useState<any>(null);
//   const [selectedTripId, setSelectedTripId] = useState<string>("");
//   const [bookingDetails, setBookingDetails] = useState<any>(null);
//   const [vehicleData, setVehicleData] = useState<any>(null);
//   const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
//   const [sortedTrips, setSortedTrips] = useState<any[]>([]);
//   const [dropEvents, setDropEvents] = useState<Map<string, DropEvent>>(new Map());
//   const [loadingDropEvents, setLoadingDropEvents] = useState<Set<string>>(new Set());

//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//     };
//     loadToken();
//   }, []);

//   // Fetch all routes
//   useEffect(() => {
//     if (!token) return;
    
//     const fetchRoutes = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/driver/routes`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setRoutes(data || []);
//         if (data && data.length > 0) setSelectedRouteId(data[0].route_id);
//       } catch (err) {
//         console.error("Error fetching routes:", err);
//       }
//     };
//     fetchRoutes();
//   }, [token]);

//   // Fetch vehicle first
//   useEffect(() => {
//     if (!token) return;
    
//     const fetchVehicle = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`${API_BASE}/driver/vehicle/my-vehicle`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setVehicleData(data);
//       } catch (err) {
//         console.error("Error fetching vehicle:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchVehicle();
//   }, [token]);

//   // Fetch trips for selected route and sort them - MOST RECENT FIRST
//   useEffect(() => {
//     if (!selectedRouteId || !token) return;
    
//     const fetchRouteDetails = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${API_BASE}/driver/routes/${selectedRouteId}/trips/details`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const data = await res.json();
//         setRouteDetails(data);
        
//         if (data.trips && data.trips.length > 0) {
//           const sorted = [...data.trips].sort((a, b) => 
//             new Date(b.planned_start).getTime() - new Date(a.planned_start).getTime()
//           );
//           setSortedTrips(sorted);
//           setSelectedTripId(sorted[0].trip_id);
//         } else {
//           setSortedTrips([]);
//           setSelectedTripId("");
//           setBookingDetails(null);
//         }
//       } catch (err) {
//         console.error("Error fetching route details:", err);
//         setRouteDetails(null);
//         setSortedTrips([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRouteDetails();
//   }, [selectedRouteId, token]);

//   // Fetch booking details whenever selectedTripId changes
//   useEffect(() => {
//     if (!selectedTripId || !vehicleData || !token) return;
    
//     const fetchBookingDetails = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${API_BASE}/driver/trips/${selectedTripId}/booking-details`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const data = await res.json();
//         setBookingDetails(data);
//         // Clear drop events when changing trips
//         setDropEvents(new Map());
//       } catch (err) {
//         console.error("Error fetching booking details:", err);
//         setBookingDetails(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBookingDetails();
//   }, [selectedTripId, vehicleData, token]);

//   // Fetch drop events for a specific booking
//   const fetchDropEvents = async (bookingId: string) => {
//     if (!selectedTripId || !token) return;
    
//     setLoadingDropEvents(prev => new Set(prev).add(bookingId));
//     try {
//       const res = await fetch(
//         `${API_BASE}/driver/trips/${selectedTripId}/drop-events`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const data = await res.json();
      
//       if (data.data && Array.isArray(data.data)) {
//         const dropEventsMap = new Map(dropEvents);
//         data.data.forEach((event: DropEvent) => {
//           dropEventsMap.set(event.booking_id, event);
//         });
//         setDropEvents(dropEventsMap);
//       }
//     } catch (err) {
//       console.error(`Error fetching drop events for booking ${bookingId}:`, err);
//     } finally {
//       setLoadingDropEvents(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(bookingId);
//         return newSet;
//       });
//     }
//   };

//   // Fetch drop events when expanding a booking
//   const handleToggleBooking = async (bookingId: string) => {
//     if (expandedBooking === bookingId) {
//       setExpandedBooking(null);
//     } else {
//       setExpandedBooking(bookingId);
//       // Fetch drop events if not already fetched
//       if (!dropEvents.has(bookingId)) {
//         await fetchDropEvents(bookingId);
//       }
//     }
//   };

//   const availableSeats = vehicleData?.seat_count ?? 10;
//   const bookingCount = bookingDetails?.booking_count ?? 0;
//   const seatsLeft = availableSeats - bookingCount;
//   const bookings = bookingDetails?.bookings ?? [];

//   const formatDateTime = (dt: string) =>
//     dt
//       ? new Date(dt).toLocaleString("en-IN", {
//           hour12: true,
//           dateStyle: "medium",
//           timeStyle: "short",
//         })
//       : "--";

//   const formatDate = (dt: string) =>
//     dt ? new Date(dt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "--";

//   const formatTime = (dt: string) =>
//     dt ? new Date(dt).toLocaleTimeString("en-IN", { hour12: true, timeStyle: "short" }) : "--";

//   const isUpcomingTrip = (plannedStart: string) => {
//     return new Date(plannedStart) > new Date();
//   };

//   const isTodayTrip = (plannedStart: string) => {
//     const today = new Date();
//     const tripDate = new Date(plannedStart);
//     return tripDate.toDateString() === today.toDateString();
//   };

//   const formatTripDisplay = (trip: any) => {
//     const startDate = new Date(trip.planned_start);
//     const endDate = new Date(trip.planned_end);
//     const isUpcoming = isUpcomingTrip(trip.planned_start);
//     const isToday = isTodayTrip(trip.planned_start);
    
//     const formattedDate = startDate.toLocaleDateString("en-IN", { 
//       day: 'numeric', 
//       month: 'short', 
//       year: 'numeric' 
//     });
    
//     const startTime = startDate.toLocaleTimeString("en-IN", { 
//       hour: '2-digit', 
//       minute: '2-digit',
//       hour12: true 
//     });
    
//     const endTime = endDate.toLocaleTimeString("en-IN", { 
//       hour: '2-digit', 
//       minute: '2-digit',
//       hour12: true 
//     });
    
//     let icon = "🔵";
//     let statusText = "";
    
//     if (isToday) {
//       icon = "🟡";
//       statusText = " (Today)";
//     } else if (isUpcoming) {
//       icon = "🟢";
//       statusText = " (Upcoming)";
//     } else {
//       icon = "🔵";
//       statusText = " (Completed)";
//     }
    
//     return {
//       display: `${formattedDate} | ${startTime} - ${endTime}`,
//       icon,
//       statusText,
//       isUpcoming,
//       isToday,
//       date: startDate
//     };
//   };

//   // Get drop event for a booking
//   const getDropEventForBooking = (bookingId: string): DropEvent | undefined => {
//     return dropEvents.get(bookingId);
//   };

//   return (
//     <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
//       <NavbarSidebar />
      
//       <IonContent className="relative">
//         <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
//         <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-6xl mx-auto">
//           <IonLoading isOpen={loading} message="Loading booking details..." />

//           {/* Header Section */}
//           <div className="mb-8">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
//               <BusIcon className="w-4 h-4" />
//               <span>Booking Management</span>
//             </div>
//             <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-700 bg-clip-text text-transparent dark:text-gray-500">
//               Booking Details
//             </h1>
//             <p className="text-gray-500 dark:text-gray-400 mt-2">
//               View and manage passenger bookings with drop=off tracking
//             </p>
//           </div>

//           {/* Filters Card */}
//           <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
//             <div className="p-6 space-y-4">
//               {/* Route Selector */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                   Select Route
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={selectedRouteId}
//                     onChange={(e) => setSelectedRouteId(e.target.value)}
//                     style={{
//                       width: '100%',
//                       padding: '12px 16px',
//                       borderRadius: '12px',
//                       border: '2px solid',
//                       borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
//                       backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
//                       color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                       transition: 'all 0.2s ease',
//                       appearance: 'none',
//                       cursor: 'pointer',
//                       fontSize: '1rem',
//                       fontFamily: 'inherit',
//                     }}
//                     onFocus={(e) => {
//                       e.currentTarget.style.borderColor = '#3b82f6';
//                       e.currentTarget.style.outline = 'none';
//                       e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
//                     }}
//                     onBlur={(e) => {
//                       e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
//                       e.currentTarget.style.boxShadow = 'none';
//                     }}
//                   >
//                     {routes.map((r) => (
//                       <option 
//                         key={r.route_id} 
//                         value={r.route_id}
//                         style={{
//                           backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
//                           color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                           padding: '8px',
//                         }}
//                       >
//                         {r.name}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                     <ChevronDownIcon className="w-5 h-5 text-gray-400" />
//                   </div>
//                 </div>
//               </div>

//               {/* Trip Selector */}
//               {sortedTrips.length > 0 ? (
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     Select Trip
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={selectedTripId}
//                       onChange={(e) => setSelectedTripId(e.target.value)}
//                       style={{
//                         width: '100%',
//                         padding: '12px 16px',
//                         borderRadius: '12px',
//                         border: '2px solid',
//                         borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
//                         backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
//                         color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                         transition: 'all 0.2s ease',
//                         appearance: 'none',
//                         cursor: 'pointer',
//                         fontSize: '1rem',
//                         fontFamily: 'inherit',
//                       }}
//                       onFocus={(e) => {
//                         e.currentTarget.style.borderColor = '#3b82f6';
//                         e.currentTarget.style.outline = 'none';
//                         e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
//                       }}
//                       onBlur={(e) => {
//                         e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
//                         e.currentTarget.style.boxShadow = 'none';
//                       }}
//                     >
//                       {sortedTrips.map((t: any) => {
//                         const tripInfo = formatTripDisplay(t);
//                         return (
//                           <option 
//                             key={t.trip_id} 
//                             value={t.trip_id}
//                             style={{
//                               backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
//                               color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                               padding: '8px',
//                               fontWeight: tripInfo.isToday ? 'bold' : 'normal',
//                             }}
//                           >
//                             {tripInfo.icon} {tripInfo.display}{tripInfo.statusText}
//                           </option>
//                         );
//                       })}
//                     </select>
//                     <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                       <ChevronDownIcon className="w-5 h-5 text-gray-400" />
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between mt-2">
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       🟢 Upcoming | 🟡 Today | 🔵 Completed
//                     </p>
//                     <p className="text-xs text-blue-600 dark:text-blue-400">
//                       📅 Showing all trips (most recent first)
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
//                   <p className="text-yellow-800 dark:text-yellow-400 font-medium">
//                     ⚠️ No trips created for this route. Please create a trip first.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Booking Details */}
//           {bookingDetails && (
//             <>
//               {/* Trip Summary Card */}
//               <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                       {bookingDetails.route?.name || "--"}
//                     </h2>
//                     <div className="flex items-center gap-2 mt-1">
//                       <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
//                       <span className="text-sm text-gray-600 dark:text-gray-500">
//                         {formatDate(bookingDetails.planned_start)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="mt-2 md:mt-0 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
//                     <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
//                       Trip ID: {selectedTripId.slice(-8)}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <ClockIcon className="w-6 h-6 text-blue-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Journey Time</p>
//                       <p className="text-sm font-medium">
//                         {formatDateTime(bookingDetails.planned_start)} - {formatDateTime(bookingDetails.planned_end)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <TruckIcon className="w-6 h-6 text-green-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
//                       <p className="text-sm font-medium">
//                         {vehicleData?.vehicle_name || "--"} ({vehicleData?.registration_number || "--"})
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <IdentificationIcon className="w-6 h-6 text-yellow-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Driver</p>
//                       <p className="text-sm font-medium">{bookingDetails.driver?.email || "--"}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <UserGroupIcon className="w-6 h-6 text-purple-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Seats Status</p>
//                       <p className="text-sm font-medium">
//                         {bookingCount} / {availableSeats} booked
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <CurrencyRupeeIcon className="w-6 h-6 text-pink-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Total Fare</p>
//                       <p className="text-sm font-medium">₹{bookingDetails.total_fare?.toFixed(2) || "0.00"}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <CreditCardIcon className="w-6 h-6 text-indigo-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
//                       <p className="text-sm font-medium">₹{bookingDetails.total_fare_paid?.toFixed(2) || "0.00"}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Seat Availability Alert */}
//               {isUpcomingTrip(bookingDetails.planned_start) && (
//                 <div className={`mb-6 rounded-xl p-4 ${
//                   seatsLeft <= 0
//                     ? "bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700"
//                     : seatsLeft <= 5
//                     ? "bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700"
//                     : "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
//                 }`}>
//                   <div className="flex items-center gap-3">
//                     <UsersIcon className={`w-6 h-6 ${
//                       seatsLeft <= 0 ? "text-red-600" : seatsLeft <= 5 ? "text-orange-600" : "text-green-600"
//                     }`} />
//                     <div>
//                       <p className={`font-semibold ${
//                         seatsLeft <= 0 ? "text-red-800 dark:text-red-300" : 
//                         seatsLeft <= 5 ? "text-orange-800 dark:text-orange-300" : 
//                         "text-green-800 dark:text-green-300"
//                       }`}>
//                         {seatsLeft <= 0
//                           ? "🚫 No seats available — Booking Closed"
//                           : `🎟️ Seats Available: ${seatsLeft} remaining out of ${availableSeats}`}
//                       </p>
//                       {seatsLeft <= 5 && seatsLeft > 0 && (
//                         <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
//                           ⚠️ Only {seatsLeft} seats left! Limited availability.
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Past Trip Note */}
//               {!isUpcomingTrip(bookingDetails.planned_start) && (
//                 <div className="mb-6 rounded-xl p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700">
//                   <div className="flex items-center gap-3">
//                     <ClockIcon className="w-6 h-6 text-gray-500" />
//                     <div>
//                       <p className="font-semibold text-gray-700 dark:text-gray-300">
//                         📅 Past Trip
//                       </p>
//                       <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">
//                         This trip has already been completed. Showing historical booking data with drop-off tracking.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Bookings List */}
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//                     Passenger Bookings ({bookings.length})
//                   </h3>
//                   <span className="text-xs text-gray-500 dark:text-gray-400">
//                     {bookings.length} passengers
//                   </span>
//                 </div>

//                 {bookings.length === 0 ? (
//                   <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
//                     <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-500 dark:text-gray-200 font-medium">
//                       No bookings have been made for this trip yet.
//                     </p>
//                   </div>
//                 ) : (
//                   bookings.map((b: any, idx: number) => {
//                     const dropEvent = getDropEventForBooking(b.booking_id);
//                     const isLoadingDrop = loadingDropEvents.has(b.booking_id);
                    
//                     return (
//                       <div
//                         key={idx}
//                         className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
//                       >
//                         {/* Booking Header */}
//                         <div
//                           className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
//                           onClick={() => handleToggleBooking(b.booking_id || idx.toString())}
//                         >
//                           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//                             <div className="flex items-center gap-3">
//                               <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
//                                 <span className="text-blue-700 dark:text-blue-400 font-semibold">
//                                   {idx + 1}
//                                 </span>
//                               </div>
//                               <div>
//                                 <p className="font-semibold text-gray-900 dark:text-white">
//                                   {b.name || "Passenger"}
//                                 </p>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                                   Booking ID: {b.booking_id?.slice(-8) || "--"}
//                                 </p>
//                               </div>
//                             </div>
                            
//                             <div className="flex items-center gap-3">
//                               {/* Drop Event Status Badge */}
//                               {dropEvent && (
//                                 <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                   dropEvent.flags.early_drop
//                                     ? "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400"
//                                     : dropEvent.flags.exact_drop
//                                     ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
//                                     : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
//                                 }`}>
//                                   {dropEvent.flags.early_drop ? "Early Drop" : 
//                                    dropEvent.flags.exact_drop ? "Exact Drop" : "Regular Drop"}
//                                 </div>
//                               )}
                              
//                               <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                 b.fare_paid === b.fare
//                                   ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
//                                   : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
//                               }`}>
//                                 {b.fare_paid === b.fare ? (
//                                   <span className="flex items-center gap-1">
//                                     <CheckCircleIcon className="w-3 h-3" />
//                                     Paid
//                                   </span>
//                                 ) : (
//                                   <span className="flex items-center gap-1">
//                                     <XCircleIcon className="w-3 h-3" />
//                                     Pending
//                                   </span>
//                                 )}
//                               </div>
                              
//                               {expandedBooking === (b.booking_id || idx.toString()) ? (
//                                 <ChevronUpIcon className="w-5 h-5 text-gray-400" />
//                               ) : (
//                                 <ChevronDownIcon className="w-5 h-5 text-gray-400" />
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Expanded Details */}
//                         {expandedBooking === (b.booking_id || idx.toString()) && (
//                           <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50">
//                             {/* Original Booking Details */}
//                             <div className="mb-4">
//                               <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
//                                 <TicketIcon className="w-4 h-4" />
//                                 Booking Details
//                               </h4>
//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-3">
//                                   <div className="flex items-start gap-2">
//                                     <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
//                                     <div>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">Booked Pickup</p>
//                                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                         {b.take_in || "--"}
//                                       </p>
//                                     </div>
//                                   </div>
                                  
//                                   <div className="flex items-start gap-2">
//                                     <MapPinIcon className="w-5 h-5 text-red-500 mt-0.5" />
//                                     <div>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">Booked Drop-off</p>
//                                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                         {b.drop_off || "--"}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 </div>

//                                 <div className="space-y-3">
//                                   <div className="flex items-start gap-2">
//                                     <ClockIcon className="w-5 h-5 text-blue-500 mt-0.5" />
//                                     <div>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Pickup</p>
//                                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                         {b.estimated_pickup_time ? new Date(b.estimated_pickup_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "--"}
//                                       </p>
//                                     </div>
//                                   </div>
                                  
//                                   <div className="flex items-start gap-2">
//                                     <ClockIcon className="w-5 h-5 text-purple-500 mt-0.5" />
//                                     <div>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Drop-off</p>
//                                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                         {b.estimated_drop_off_time ? new Date(b.estimated_drop_off_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "--"}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Drop Event Details - Actual Drop Location */}
//                             {isLoadingDrop ? (
//                               <div className="flex items-center justify-center py-4">
//                                 <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
//                                 <span className="ml-2 text-sm text-gray-500">Loading drop events...</span>
//                               </div>
//                             ) : dropEvent ? (
//                               <div className="mt-4 pt-4 border-t-2 border-blue-200 dark:border-blue-800">
//                                 <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
//                                   <MapPinIcon className="w-4 h-4" />
//                                   Actual Drop-off Information
//                                   {dropEvent.scan_info.within_radius && (
//                                     <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
//                                       Verified
//                                     </span>
//                                   )}
//                                 </h4>
                                
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                   <div className="space-y-3">
//                                     <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
//                                       <MapPinIcon className="w-5 h-5 text-orange-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Actual Drop Location</p>
//                                         <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
//                                           {dropEvent.actual_drop.name}
//                                         </p>
//                                         <p className="text-xs text-gray-400 mt-1">
//                                           Sequence: {dropEvent.actual_drop.sequence}
//                                         </p>
//                                       </div>
//                                     </div>

//                                     <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
//                                       <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Booked Drop Location</p>
//                                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                           {dropEvent.booked_drop.name}
//                                         </p>
//                                         <p className="text-xs text-gray-400 mt-1">
//                                           Sequence: {dropEvent.booked_drop.sequence}
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </div>

//                                   <div className="space-y-3">
//                                     <div className="flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
//                                       <ClockIcon className="w-5 h-5 text-purple-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Scanned At</p>
//                                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                           {formatDateTime(dropEvent.scan_info.scanned_at)}
//                                         </p>
//                                       </div>
//                                     </div>

//                                     <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
//                                       <MapIcon className="w-5 h-5 text-green-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Scan Location</p>
//                                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                           Lat: {dropEvent.scan_info.lat.toFixed(6)}, Lng: {dropEvent.scan_info.lng.toFixed(6)}
//                                         </p>
//                                         <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//                                           {dropEvent.scan_info.within_radius ? "✓ Within valid radius" : "✗ Outside valid radius"}
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>

//                                 {/* Early Drop Warning */}
//                                 {dropEvent.flags.early_drop && (
//                                   <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
//                                     <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
//                                       ⚠️ Early Drop-off Alert: Passenger was dropped off at "{dropEvent.actual_drop.name}" instead of "{dropEvent.booked_drop.name}"
//                                     </p>
//                                   </div>
//                                 )}

//                                 {/* Exact Drop Confirmation */}
//                                 {dropEvent.flags.exact_drop && (
//                                   <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
//                                     <p className="text-sm text-green-800 dark:text-green-400 flex items-center gap-2">
//                                       ✓ Drop-off confirmed at exact booked location "{dropEvent.booked_drop.name}"
//                                     </p>
//                                   </div>
//                                 )}
//                               </div>
//                             ) : (
//                               <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                                 <div className="text-center py-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
//                                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                                     No drop event recorded for this booking yet.
//                                   </p>
//                                   <button
//                                     onClick={() => fetchDropEvents(b.booking_id)}
//                                     className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto"
//                                   >
//                                     <ArrowPathIcon className="w-3 h-3" />
//                                     Refresh
//                                   </button>
//                                 </div>
//                               </div>
//                             )}

//                             {/* Fare Details */}
//                             <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                               <div className="flex items-center justify-between">
//                                 <span className="text-sm text-gray-600 dark:text-gray-400">Fare:</span>
//                                 <span className="text-sm font-semibold text-gray-900 dark:text-white">
//                                   ₹{b.fare ?? "--"}
//                                 </span>
//                               </div>
//                               <div className="flex items-center justify-between">
//                                 <span className="text-sm text-gray-600 dark:text-gray-400">Paid:</span>
//                                 <span className={`text-sm font-semibold ${
//                                   b.fare_paid === b.fare
//                                     ? "text-green-600 dark:text-green-400"
//                                     : "text-red-600 dark:text-red-400"
//                                 }`}>
//                                   ₹{b.fare_paid ?? "--"}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </IonContent>

//       <style>{`
//         ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }
        
//         ::-webkit-scrollbar-track {
//           background: rgb(243 244 246);
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb {
//           background: rgb(156 163 175);
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb:hover {
//           background: rgb(107 114 128);
//         }
        
//         .dark ::-webkit-scrollbar-track {
//           background: rgb(31 41 55);
//         }
        
//         .dark ::-webkit-scrollbar-thumb {
//           background: rgb(75 85 99);
//         }
        
//         .bg-grid-gray-900\\/[0.02] {
//           background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
//                             linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
//         }
        
//         .dark .bg-grid-white\\/[0.02] {
//           background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
//                             linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
//         }
        
//         select option {
//           background-color: #ffffff;
//           color: #1f2937;
//         }
        
//         .dark select option {
//           background-color: #1f2937 !important;
//           color: #ffffff !important;
//         }
        
//         select {
//           color-scheme: light;
//         }
        
//         .dark select {
//           color-scheme: dark;
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default BookingDetails;

// import React, { useState, useEffect } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import { Preferences } from '@capacitor/preferences';
// import NavbarSidebar from "./Navbar";
// import {
//   ClockIcon,
//   TruckIcon,
//   IdentificationIcon,
//   UserGroupIcon,
//   CurrencyRupeeIcon,
//   MapIcon,
//   TicketIcon,
//   ChevronDownIcon,
//   ChevronUpIcon,
//   UsersIcon,
//   CalendarIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   MapPinIcon,
//   CreditCardIcon,
//   ArrowPathIcon,
// } from "@heroicons/react/24/outline";
// import { BusIcon } from "lucide-react";

// const API_BASE = "https://be.shuttleapp.transev.site";

// // Helper function to get token from Preferences
// const getToken = async (): Promise<string | null> => {
//   try {
//     const { value } = await Preferences.get({ key: 'access_token' });
//     return value || null;
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return null;
//   }
// };

// interface DropEvent {
//   booking_id: string;
//   passenger: {
//     id: string;
//     email: string;
//   };
//   booked_drop: {
//     stop_id: string;
//     name: string;
//     sequence: number;
//   };
//   actual_drop: {
//     stop_id: string;
//     name: string;
//     sequence: number;
//   };
//   flags: {
//     early_drop: boolean;
//     exact_drop: boolean;
//   };
//   scan_info: {
//     lat: number;
//     lng: number;
//     within_radius: boolean;
//     scanned_at: string;
//   };
// }

// // Updated Booking interface with seat_number
// interface Booking {
//   booking_id: string;
//   name?: string;
//   passenger_name?: string;
//   seat_number?: number;
//   fare?: number;
//   fare_paid?: number;
//   take_in?: string;
//   drop_off?: string;
//   estimated_pickup_time?: string;
//   estimated_drop_off_time?: string;
//   status?: string;
//   [key: string]: any;
// }

// // Seat Badge Component
// const SeatBadge: React.FC<{ seatNumber?: number | null }> = ({ seatNumber }) => {
//   if (!seatNumber || seatNumber <= 0) return null;
//   return (
//     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md">
//       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//       </svg>
//       Seat {seatNumber}
//     </span>
//   );
// };

// const BookingDetails: React.FC = () => {
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [routes, setRoutes] = useState<any[]>([]);
//   const [selectedRouteId, setSelectedRouteId] = useState<string>("");
//   const [routeDetails, setRouteDetails] = useState<any>(null);
//   const [selectedTripId, setSelectedTripId] = useState<string>("");
//   const [bookingDetails, setBookingDetails] = useState<any>(null);
//   const [vehicleData, setVehicleData] = useState<any>(null);
//   const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
//   const [sortedTrips, setSortedTrips] = useState<any[]>([]);
//   const [dropEvents, setDropEvents] = useState<Map<string, DropEvent>>(new Map());
//   const [loadingDropEvents, setLoadingDropEvents] = useState<Set<string>>(new Set());

//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//     };
//     loadToken();
//   }, []);

//   // Fetch all routes
//   useEffect(() => {
//     if (!token) return;
    
//     const fetchRoutes = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/driver/routes`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setRoutes(data || []);
//         if (data && data.length > 0) setSelectedRouteId(data[0].route_id);
//       } catch (err) {
//         console.error("Error fetching routes:", err);
//       }
//     };
//     fetchRoutes();
//   }, [token]);

//   // Fetch vehicle first
//   useEffect(() => {
//     if (!token) return;
    
//     const fetchVehicle = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`${API_BASE}/driver/vehicle/my-vehicle`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setVehicleData(data);
//       } catch (err) {
//         console.error("Error fetching vehicle:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchVehicle();
//   }, [token]);

//   // Fetch trips for selected route and sort them - MOST RECENT FIRST
//   useEffect(() => {
//     if (!selectedRouteId || !token) return;
    
//     const fetchRouteDetails = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${API_BASE}/driver/routes/${selectedRouteId}/trips/details`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const data = await res.json();
//         setRouteDetails(data);
        
//         if (data.trips && data.trips.length > 0) {
//           const sorted = [...data.trips].sort((a, b) => 
//             new Date(b.planned_start).getTime() - new Date(a.planned_start).getTime()
//           );
//           setSortedTrips(sorted);
//           setSelectedTripId(sorted[0].trip_id);
//         } else {
//           setSortedTrips([]);
//           setSelectedTripId("");
//           setBookingDetails(null);
//         }
//       } catch (err) {
//         console.error("Error fetching route details:", err);
//         setRouteDetails(null);
//         setSortedTrips([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRouteDetails();
//   }, [selectedRouteId, token]);

//   // Fetch booking details whenever selectedTripId changes
//   useEffect(() => {
//     if (!selectedTripId || !vehicleData || !token) return;
    
//     const fetchBookingDetails = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${API_BASE}/driver/trips/${selectedTripId}/booking-details`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const data = await res.json();
//         setBookingDetails(data);
//         // Clear drop events when changing trips
//         setDropEvents(new Map());
//       } catch (err) {
//         console.error("Error fetching booking details:", err);
//         setBookingDetails(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBookingDetails();
//   }, [selectedTripId, vehicleData, token]);

//   // Fetch drop events for a specific booking
//   const fetchDropEvents = async (bookingId: string) => {
//     if (!selectedTripId || !token) return;
    
//     setLoadingDropEvents(prev => new Set(prev).add(bookingId));
//     try {
//       const res = await fetch(
//         `${API_BASE}/driver/trips/${selectedTripId}/drop-events`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const data = await res.json();
      
//       if (data.data && Array.isArray(data.data)) {
//         const dropEventsMap = new Map(dropEvents);
//         data.data.forEach((event: DropEvent) => {
//           dropEventsMap.set(event.booking_id, event);
//         });
//         setDropEvents(dropEventsMap);
//       }
//     } catch (err) {
//       console.error(`Error fetching drop events for booking ${bookingId}:`, err);
//     } finally {
//       setLoadingDropEvents(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(bookingId);
//         return newSet;
//       });
//     }
//   };

//   // Fetch drop events when expanding a booking
//   const handleToggleBooking = async (bookingId: string) => {
//     if (expandedBooking === bookingId) {
//       setExpandedBooking(null);
//     } else {
//       setExpandedBooking(bookingId);
//       // Fetch drop events if not already fetched
//       if (!dropEvents.has(bookingId)) {
//         await fetchDropEvents(bookingId);
//       }
//     }
//   };

//   const availableSeats = vehicleData?.seat_count ?? 10;
//   const bookingCount = bookingDetails?.booking_count ?? 0;
//   const seatsLeft = availableSeats - bookingCount;
//   const bookings = bookingDetails?.bookings ?? [];

//   const formatDateTime = (dt: string) =>
//     dt
//       ? new Date(dt).toLocaleString("en-IN", {
//           hour12: true,
//           dateStyle: "medium",
//           timeStyle: "short",
//         })
//       : "--";

//   const formatDate = (dt: string) =>
//     dt ? new Date(dt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "--";

//   const formatTime = (dt: string) =>
//     dt ? new Date(dt).toLocaleTimeString("en-IN", { hour12: true, timeStyle: "short" }) : "--";

//   const isUpcomingTrip = (plannedStart: string) => {
//     return new Date(plannedStart) > new Date();
//   };

//   const isTodayTrip = (plannedStart: string) => {
//     const today = new Date();
//     const tripDate = new Date(plannedStart);
//     return tripDate.toDateString() === today.toDateString();
//   };

//   const formatTripDisplay = (trip: any) => {
//     const startDate = new Date(trip.planned_start);
//     const endDate = new Date(trip.planned_end);
//     const isUpcoming = isUpcomingTrip(trip.planned_start);
//     const isToday = isTodayTrip(trip.planned_start);
    
//     const formattedDate = startDate.toLocaleDateString("en-IN", { 
//       day: 'numeric', 
//       month: 'short', 
//       year: 'numeric' 
//     });
    
//     const startTime = startDate.toLocaleTimeString("en-IN", { 
//       hour: '2-digit', 
//       minute: '2-digit',
//       hour12: true 
//     });
    
//     const endTime = endDate.toLocaleTimeString("en-IN", { 
//       hour: '2-digit', 
//       minute: '2-digit',
//       hour12: true 
//     });
    
//     let icon = "🔵";
//     let statusText = "";
    
//     if (isToday) {
//       icon = "🟡";
//       statusText = " (Today)";
//     } else if (isUpcoming) {
//       icon = "🟢";
//       statusText = " (Upcoming)";
//     } else {
//       icon = "🔵";
//       statusText = " (Completed)";
//     }
    
//     return {
//       display: `${formattedDate} | ${startTime} - ${endTime}`,
//       icon,
//       statusText,
//       isUpcoming,
//       isToday,
//       date: startDate
//     };
//   };

//   // Get drop event for a booking
//   const getDropEventForBooking = (bookingId: string): DropEvent | undefined => {
//     return dropEvents.get(bookingId);
//   };

//   return (
//     <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
//       <NavbarSidebar />
      
//       <IonContent className="relative">
//         <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
//         <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-6xl mx-auto">
//           <IonLoading isOpen={loading} message="Loading booking details..." />

//           {/* Header Section */}
//           <div className="mb-8">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
//               <BusIcon className="w-4 h-4" />
//               <span>Booking Management</span>
//             </div>
//             <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-700 bg-clip-text text-transparent dark:text-gray-500">
//               Booking Details
//             </h1>
//             <p className="text-gray-500 dark:text-gray-400 mt-2">
//               View and manage passenger bookings with drop-off tracking and seat numbers
//             </p>
//           </div>

//           {/* Filters Card */}
//           <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
//             <div className="p-6 space-y-4">
//               {/* Route Selector */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                   Select Route
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={selectedRouteId}
//                     onChange={(e) => setSelectedRouteId(e.target.value)}
//                     style={{
//                       width: '100%',
//                       padding: '12px 16px',
//                       borderRadius: '12px',
//                       border: '2px solid',
//                       borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
//                       backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
//                       color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                       transition: 'all 0.2s ease',
//                       appearance: 'none',
//                       cursor: 'pointer',
//                       fontSize: '1rem',
//                       fontFamily: 'inherit',
//                     }}
//                     onFocus={(e) => {
//                       e.currentTarget.style.borderColor = '#3b82f6';
//                       e.currentTarget.style.outline = 'none';
//                       e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
//                     }}
//                     onBlur={(e) => {
//                       e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
//                       e.currentTarget.style.boxShadow = 'none';
//                     }}
//                   >
//                     {routes.map((r) => (
//                       <option 
//                         key={r.route_id} 
//                         value={r.route_id}
//                         style={{
//                           backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
//                           color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                           padding: '8px',
//                         }}
//                       >
//                         {r.name}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                     <ChevronDownIcon className="w-5 h-5 text-gray-400" />
//                   </div>
//                 </div>
//               </div>

//               {/* Trip Selector */}
//               {sortedTrips.length > 0 ? (
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     Select Trip
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={selectedTripId}
//                       onChange={(e) => setSelectedTripId(e.target.value)}
//                       style={{
//                         width: '100%',
//                         padding: '12px 16px',
//                         borderRadius: '12px',
//                         border: '2px solid',
//                         borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
//                         backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
//                         color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                         transition: 'all 0.2s ease',
//                         appearance: 'none',
//                         cursor: 'pointer',
//                         fontSize: '1rem',
//                         fontFamily: 'inherit',
//                       }}
//                       onFocus={(e) => {
//                         e.currentTarget.style.borderColor = '#3b82f6';
//                         e.currentTarget.style.outline = 'none';
//                         e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
//                       }}
//                       onBlur={(e) => {
//                         e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
//                         e.currentTarget.style.boxShadow = 'none';
//                       }}
//                     >
//                       {sortedTrips.map((t: any) => {
//                         const tripInfo = formatTripDisplay(t);
//                         return (
//                           <option 
//                             key={t.trip_id} 
//                             value={t.trip_id}
//                             style={{
//                               backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
//                               color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                               padding: '8px',
//                               fontWeight: tripInfo.isToday ? 'bold' : 'normal',
//                             }}
//                           >
//                             {tripInfo.icon} {tripInfo.display}{tripInfo.statusText}
//                           </option>
//                         );
//                       })}
//                     </select>
//                     <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                       <ChevronDownIcon className="w-5 h-5 text-gray-400" />
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between mt-2">
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       🟢 Upcoming | 🟡 Today | 🔵 Completed
//                     </p>
//                     <p className="text-xs text-blue-600 dark:text-blue-400">
//                       📅 Showing all trips (most recent first)
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
//                   <p className="text-yellow-800 dark:text-yellow-400 font-medium">
//                     ⚠️ No trips created for this route. Please create a trip first.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Booking Details */}
//           {bookingDetails && (
//             <>
//               {/* Trip Summary Card */}
//               <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                       {bookingDetails.route?.name || "--"}
//                     </h2>
//                     <div className="flex items-center gap-2 mt-1">
//                       <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
//                       <span className="text-sm text-gray-600 dark:text-gray-500">
//                         {formatDate(bookingDetails.planned_start)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="mt-2 md:mt-0 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
//                     <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
//                       Trip ID: {selectedTripId.slice(-8)}
//                     </span>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <ClockIcon className="w-6 h-6 text-blue-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Journey Time</p>
//                       <p className="text-sm font-medium">
//                         {formatDateTime(bookingDetails.planned_start)} - {formatDateTime(bookingDetails.planned_end)}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <TruckIcon className="w-6 h-6 text-green-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
//                       <p className="text-sm font-medium">
//                         {vehicleData?.vehicle_name || "--"} ({vehicleData?.registration_number || "--"})
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <IdentificationIcon className="w-6 h-6 text-yellow-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Driver</p>
//                       <p className="text-sm font-medium">{bookingDetails.driver?.email || "--"}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <UserGroupIcon className="w-6 h-6 text-purple-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Seats Status</p>
//                       <p className="text-sm font-medium">
//                         {bookingCount} / {availableSeats} booked
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <CurrencyRupeeIcon className="w-6 h-6 text-pink-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Total Fare</p>
//                       <p className="text-sm font-medium">₹{bookingDetails.total_fare?.toFixed(2) || "0.00"}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <CreditCardIcon className="w-6 h-6 text-indigo-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
//                       <p className="text-sm font-medium">₹{bookingDetails.total_fare_paid?.toFixed(2) || "0.00"}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Seat Availability Alert */}
//               {isUpcomingTrip(bookingDetails.planned_start) && (
//                 <div className={`mb-6 rounded-xl p-4 ${
//                   seatsLeft <= 0
//                     ? "bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700"
//                     : seatsLeft <= 5
//                     ? "bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700"
//                     : "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
//                 }`}>
//                   <div className="flex items-center gap-3">
//                     <UsersIcon className={`w-6 h-6 ${
//                       seatsLeft <= 0 ? "text-red-600" : seatsLeft <= 5 ? "text-orange-600" : "text-green-600"
//                     }`} />
//                     <div>
//                       <p className={`font-semibold ${
//                         seatsLeft <= 0 ? "text-red-800 dark:text-red-300" : 
//                         seatsLeft <= 5 ? "text-orange-800 dark:text-orange-300" : 
//                         "text-green-800 dark:text-green-300"
//                       }`}>
//                         {seatsLeft <= 0
//                           ? "🚫 No seats available — Booking Closed"
//                           : `🎟️ Seats Available: ${seatsLeft} remaining out of ${availableSeats}`}
//                       </p>
//                       {seatsLeft <= 5 && seatsLeft > 0 && (
//                         <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
//                           ⚠️ Only {seatsLeft} seats left! Limited availability.
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Past Trip Note */}
//               {!isUpcomingTrip(bookingDetails.planned_start) && (
//                 <div className="mb-6 rounded-xl p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700">
//                   <div className="flex items-center gap-3">
//                     <ClockIcon className="w-6 h-6 text-gray-500" />
//                     <div>
//                       <p className="font-semibold text-gray-700 dark:text-gray-300">
//                         📅 Past Trip
//                       </p>
//                       <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">
//                         This trip has already been completed. Showing historical booking data with drop-off tracking.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Bookings List */}
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//                     Passenger Bookings ({bookings.length})
//                   </h3>
//                   <span className="text-xs text-gray-500 dark:text-gray-400">
//                     {bookings.length} passengers
//                   </span>
//                 </div>

//                 {bookings.length === 0 ? (
//                   <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
//                     <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-500 dark:text-gray-200 font-medium">
//                       No bookings have been made for this trip yet.
//                     </p>
//                   </div>
//                 ) : (
//                   bookings.map((b: Booking, idx: number) => {
//                     const dropEvent = getDropEventForBooking(b.booking_id);
//                     const isLoadingDrop = loadingDropEvents.has(b.booking_id);
//                     const passengerName = b.name || b.passenger_name || "Passenger";
//                     const seatNumber = b.seat_number;
                    
//                     return (
//                       <div
//                         key={idx}
//                         className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
//                       >
//                         {/* Booking Header - UPDATED with Seat Number */}
//                         <div
//                           className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
//                           onClick={() => handleToggleBooking(b.booking_id || idx.toString())}
//                         >
//                           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//                             <div className="flex items-center gap-3">
//                               <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
//                                 <span className="text-white font-semibold text-sm">
//                                   {idx + 1}
//                                 </span>
//                               </div>
//                               <div>
//                                 <div className="flex items-center gap-2 flex-wrap">
//                                   <p className="font-semibold text-gray-900 dark:text-white">
//                                     {passengerName}
//                                   </p>
//                                   {/* ✅ ADDED: Seat Number Badge */}
//                                   <SeatBadge seatNumber={seatNumber} />
//                                 </div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                                   ID: {b.booking_id?.slice(-8) || "--"}
//                                 </p>
//                               </div>
//                             </div>
                            
//                             <div className="flex items-center gap-3">
//                               {/* Drop Event Status Badge */}
//                               {dropEvent && (
//                                 <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                   dropEvent.flags.early_drop
//                                     ? "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400"
//                                     : dropEvent.flags.exact_drop
//                                     ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
//                                     : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
//                                 }`}>
//                                   {dropEvent.flags.early_drop ? "Early Drop" : 
//                                    dropEvent.flags.exact_drop ? "Exact Drop" : "Regular Drop"}
//                                 </div>
//                               )}
                              
//                               <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                 b.fare_paid === b.fare
//                                   ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
//                                   : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
//                               }`}>
//                                 {b.fare_paid === b.fare ? (
//                                   <span className="flex items-center gap-1">
//                                     <CheckCircleIcon className="w-3 h-3" />
//                                     Paid
//                                   </span>
//                                 ) : (
//                                   <span className="flex items-center gap-1">
//                                     <XCircleIcon className="w-3 h-3" />
//                                     Pending
//                                   </span>
//                                 )}
//                               </div>
                              
//                               {expandedBooking === (b.booking_id || idx.toString()) ? (
//                                 <ChevronUpIcon className="w-5 h-5 text-gray-400" />
//                               ) : (
//                                 <ChevronDownIcon className="w-5 h-5 text-gray-400" />
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Expanded Details - UPDATED with Seat Number */}
//                         {expandedBooking === (b.booking_id || idx.toString()) && (
//                           <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50">
//                             {/* Passenger Info with Seat Number */}
//                             <div className="mb-4 p-3 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl">
//                               <div className="flex items-center justify-between flex-wrap gap-2">
//                                 <div className="flex items-center gap-2">
//                                   <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
//                                     Passenger:
//                                   </span>
//                                   <span className="font-medium text-gray-900 dark:text-white">
//                                     {passengerName}
//                                   </span>
//                                 </div>
//                                 {/* ✅ ADDED: Seat number in expanded view */}
//                                 {seatNumber && (
//                                   <div className="flex items-center gap-1 px-3 py-1.5 bg-linear-to-r from-indigo-600 to-purple-600 rounded-full shadow-md">
//                                     <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                     </svg>
//                                     <span className="text-sm font-bold text-white">Seat {seatNumber}</span>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>

//                             {/* Original Booking Details */}
//                             <div className="mb-4">
//                               <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
//                                 <TicketIcon className="w-4 h-4" />
//                                 Booking Details
//                               </h4>
//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-3">
//                                   <div className="flex items-start gap-2">
//                                     <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
//                                     <div>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">Booked Pickup</p>
//                                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                         {b.take_in || "--"}
//                                       </p>
//                                     </div>
//                                   </div>
                                  
//                                   <div className="flex items-start gap-2">
//                                     <MapPinIcon className="w-5 h-5 text-red-500 mt-0.5" />
//                                     <div>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">Booked Drop-off</p>
//                                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                         {b.drop_off || "--"}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 </div>

//                                 <div className="space-y-3">
//                                   <div className="flex items-start gap-2">
//                                     <ClockIcon className="w-5 h-5 text-blue-500 mt-0.5" />
//                                     <div>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Pickup</p>
//                                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                         {b.estimated_pickup_time ? new Date(b.estimated_pickup_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "--"}
//                                       </p>
//                                     </div>
//                                   </div>
                                  
//                                   <div className="flex items-start gap-2">
//                                     <ClockIcon className="w-5 h-5 text-purple-500 mt-0.5" />
//                                     <div>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Drop-off</p>
//                                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                         {b.estimated_drop_off_time ? new Date(b.estimated_drop_off_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "--"}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Drop Event Details - Actual Drop Location */}
//                             {isLoadingDrop ? (
//                               <div className="flex items-center justify-center py-4">
//                                 <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
//                                 <span className="ml-2 text-sm text-gray-500">Loading drop events...</span>
//                               </div>
//                             ) : dropEvent ? (
//                               <div className="mt-4 pt-4 border-t-2 border-blue-200 dark:border-blue-800">
//                                 <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
//                                   <MapPinIcon className="w-4 h-4" />
//                                   Actual Drop-off Information
//                                   {dropEvent.scan_info.within_radius && (
//                                     <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
//                                       Verified
//                                     </span>
//                                   )}
//                                 </h4>
                                
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                   <div className="space-y-3">
//                                     <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
//                                       <MapPinIcon className="w-5 h-5 text-orange-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Actual Drop Location</p>
//                                         <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
//                                           {dropEvent.actual_drop.name}
//                                         </p>
//                                         <p className="text-xs text-gray-400 mt-1">
//                                           Sequence: {dropEvent.actual_drop.sequence}
//                                         </p>
//                                       </div>
//                                     </div>

//                                     <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
//                                       <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Booked Drop Location</p>
//                                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                           {dropEvent.booked_drop.name}
//                                         </p>
//                                         <p className="text-xs text-gray-400 mt-1">
//                                           Sequence: {dropEvent.booked_drop.sequence}
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </div>

//                                   <div className="space-y-3">
//                                     <div className="flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
//                                       <ClockIcon className="w-5 h-5 text-purple-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Scanned At</p>
//                                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                           {formatDateTime(dropEvent.scan_info.scanned_at)}
//                                         </p>
//                                       </div>
//                                     </div>

//                                     <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
//                                       <MapIcon className="w-5 h-5 text-green-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Scan Location</p>
//                                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                           Lat: {dropEvent.scan_info.lat.toFixed(6)}, Lng: {dropEvent.scan_info.lng.toFixed(6)}
//                                         </p>
//                                         <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//                                           {dropEvent.scan_info.within_radius ? "✓ Within valid radius" : "✗ Outside valid radius"}
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>

//                                 {/* Early Drop Warning */}
//                                 {dropEvent.flags.early_drop && (
//                                   <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
//                                     <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
//                                       ⚠️ Early Drop-off Alert: Passenger was dropped off at "{dropEvent.actual_drop.name}" instead of "{dropEvent.booked_drop.name}"
//                                     </p>
//                                   </div>
//                                 )}

//                                 {/* Exact Drop Confirmation */}
//                                 {dropEvent.flags.exact_drop && (
//                                   <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
//                                     <p className="text-sm text-green-800 dark:text-green-400 flex items-center gap-2">
//                                       ✓ Drop-off confirmed at exact booked location "{dropEvent.booked_drop.name}"
//                                     </p>
//                                   </div>
//                                 )}
//                               </div>
//                             ) : (
//                               <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                                 <div className="text-center py-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
//                                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                                     No drop event recorded for this booking yet.
//                                   </p>
//                                   <button
//                                     onClick={() => fetchDropEvents(b.booking_id)}
//                                     className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto"
//                                   >
//                                     <ArrowPathIcon className="w-3 h-3" />
//                                     Refresh
//                                   </button>
//                                 </div>
//                               </div>
//                             )}

//                             {/* Fare Details */}
//                             <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                               <div className="flex items-center justify-between p-2">
//                                 <span className="text-sm text-gray-600 dark:text-gray-400">Fare:</span>
//                                 <span className="text-sm font-semibold text-gray-900 dark:text-white">
//                                   ₹{b.fare ?? "--"}
//                                 </span>
//                               </div>
//                               <div className="flex items-center justify-between p-2">
//                                 <span className="text-sm text-gray-600 dark:text-gray-400">Paid:</span>
//                                 <span className={`text-sm font-semibold ${
//                                   b.fare_paid === b.fare
//                                     ? "text-green-600 dark:text-green-400"
//                                     : "text-red-600 dark:text-red-400"
//                                 }`}>
//                                   ₹{b.fare_paid ?? "--"}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </IonContent>

//       <style>{`
//         ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }
        
//         ::-webkit-scrollbar-track {
//           background: rgb(243 244 246);
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb {
//           background: rgb(156 163 175);
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb:hover {
//           background: rgb(107 114 128);
//         }
        
//         .dark ::-webkit-scrollbar-track {
//           background: rgb(31 41 55);
//         }
        
//         .dark ::-webkit-scrollbar-thumb {
//           background: rgb(75 85 99);
//         }
        
//         .bg-grid-gray-900\\/[0.02] {
//           background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
//                             linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
//         }
        
//         .dark .bg-grid-white\\/[0.02] {
//           background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
//                             linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
//         }
        
//         select option {
//           background-color: #ffffff;
//           color: #1f2937;
//         }
        
//         .dark select option {
//           background-color: #1f2937 !important;
//           color: #ffffff !important;
//         }
        
//         select {
//           color-scheme: light;
//         }
        
//         .dark select {
//           color-scheme: dark;
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default BookingDetails;

// import React, { useState, useEffect } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import { Preferences } from '@capacitor/preferences';
// import NavbarSidebar from "./Navbar";
// import {
//   ClockIcon,
//   TruckIcon,
//   IdentificationIcon,
//   UserGroupIcon,
//   CurrencyRupeeIcon,
//   MapIcon,
//   TicketIcon,
//   ChevronDownIcon,
//   ChevronUpIcon,
//   UsersIcon,
//   CalendarIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   MapPinIcon,
//   CreditCardIcon,
//   ArrowPathIcon,
//   PhoneIcon,
//   EnvelopeIcon,
// } from "@heroicons/react/24/outline";
// import { BusIcon } from "lucide-react";

// const API_BASE = "https://be.shuttleapp.transev.site";

// // Helper function to get token from Preferences
// const getToken = async (): Promise<string | null> => {
//   try {
//     const { value } = await Preferences.get({ key: 'access_token' });
//     return value || null;
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return null;
//   }
// };

// interface DropEvent {
//   booking_id: string;
//   passenger: {
//     id: string;
//     email: string;
//   };
//   booked_drop: {
//     stop_id: string;
//     name: string;
//     sequence: number;
//   };
//   actual_drop: {
//     stop_id: string;
//     name: string;
//     sequence: number;
//   };
//   flags: {
//     early_drop: boolean;
//     exact_drop: boolean;
//   };
//   scan_info: {
//     lat: number;
//     lng: number;
//     within_radius: boolean;
//     scanned_at: string;
//   };
// }

// // Updated Booking interface to match new expected response
// interface Booking {
//   booking_id: string;
//   seat_number: string;
//   name: string;
//   take_in: string;
//   drop_off: string;
//   estimated_pickup_time: string;
//   estimated_drop_off_time: string;
//   fare: number;
//   fare_paid: number;
//   booking_status: string;
//   boarded_at: string | null;
//   completed_at: string | null;
//   otp: string;
//   booking_session_id: string;
//   passenger_id: string;
//   account_owner_user_id: string;
//   booked_by_user_id: string;
//   passenger_name: string;
//   traveller_name: string;
//   traveller_phone: string;
//   traveller_email: string;
//   traveller_relationship_label: string;
//   account_owner_name: string;
// }

// // Trip Summary Response Interface
// interface TripSummaryResponse {
//   trip_id: string;
//   status: string;
//   planned_start: string;
//   planned_end: string;
//   actual_start: string | null;
//   actual_end: string | null;
//   driver: {
//     driver_id: string;
//     email: string;
//   };
//   vehicle: {
//     vehicle_id: string;
//     name: string;
//     model: string;
//     registration_number: string;
//   };
//   route: {
//     route_id: string;
//     name: string;
//   };
//   booking_count: number;
//   bookings: Booking[];
//   total_fare: number;
//   total_fare_paid: number;
// }

// // Seat Badge Component
// const SeatBadge: React.FC<{ seatNumber?: string | number | null }> = ({ seatNumber }) => {
//   if (!seatNumber) return null;
//   return (
//     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md">
//       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//       </svg>
//       Seat {seatNumber}
//     </span>
//   );
// };

// // Traveler Info Component
// const TravelerInfo: React.FC<{ booking: Booking }> = ({ booking }) => {
//   return (
//     <div className="p-3 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl mb-4">
//       <div className="space-y-2">
//         <div className="flex items-center justify-between flex-wrap gap-2">
//           <div className="flex items-center gap-2">
//             <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
//               Traveler:
//             </span>
//             <span className="font-medium text-gray-900 dark:text-white">
//               {booking.traveller_name || booking.passenger_name || booking.name}
//             </span>
//           </div>
//           {booking.traveller_relationship_label && (
//             <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full">
//               {booking.traveller_relationship_label}
//             </span>
//           )}
//         </div>
        
//         <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
//           {booking.traveller_phone && (
//             <div className="flex items-center gap-1.5">
//               <PhoneIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
//               <span className="text-sm text-gray-700 dark:text-gray-300">
//                 {booking.traveller_phone}
//               </span>
//             </div>
//           )}
//           {booking.traveller_email && (
//             <div className="flex items-center gap-1.5">
//               <EnvelopeIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
//               <span className="text-sm text-gray-700 dark:text-gray-300">
//                 {booking.traveller_email}
//               </span>
//             </div>
//           )}
//         </div>
        
//         <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//           Account Owner: {booking.account_owner_name || booking.passenger_name}
//         </div>
//       </div>
//     </div>
//   );
// };

// const BookingDetails: React.FC = () => {
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [routes, setRoutes] = useState<any[]>([]);
//   const [selectedRouteId, setSelectedRouteId] = useState<string>("");
//   const [routeDetails, setRouteDetails] = useState<any>(null);
//   const [selectedTripId, setSelectedTripId] = useState<string>("");
//   const [bookingDetails, setBookingDetails] = useState<TripSummaryResponse | null>(null);
//   const [vehicleData, setVehicleData] = useState<any>(null);
//   const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
//   const [sortedTrips, setSortedTrips] = useState<any[]>([]);
//   const [dropEvents, setDropEvents] = useState<Map<string, DropEvent>>(new Map());
//   const [loadingDropEvents, setLoadingDropEvents] = useState<Set<string>>(new Set());

//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//     };
//     loadToken();
//   }, []);

//   // Fetch all routes
//   useEffect(() => {
//     if (!token) return;
    
//     const fetchRoutes = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/driver/routes`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setRoutes(data || []);
//         if (data && data.length > 0) setSelectedRouteId(data[0].route_id);
//       } catch (err) {
//         console.error("Error fetching routes:", err);
//       }
//     };
//     fetchRoutes();
//   }, [token]);

//   // Fetch vehicle first
//   useEffect(() => {
//     if (!token) return;
    
//     const fetchVehicle = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(`${API_BASE}/driver/vehicle/my-vehicle`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         const data = await res.json();
//         setVehicleData(data);
//       } catch (err) {
//         console.error("Error fetching vehicle:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchVehicle();
//   }, [token]);

//   // Fetch trips for selected route and sort them - MOST RECENT FIRST
//   useEffect(() => {
//     if (!selectedRouteId || !token) return;
    
//     const fetchRouteDetails = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${API_BASE}/driver/routes/${selectedRouteId}/trips/details`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const data = await res.json();
//         setRouteDetails(data);
        
//         if (data.trips && data.trips.length > 0) {
//           const sorted = [...data.trips].sort((a, b) => 
//             new Date(b.planned_start).getTime() - new Date(a.planned_start).getTime()
//           );
//           setSortedTrips(sorted);
//           setSelectedTripId(sorted[0].trip_id);
//         } else {
//           setSortedTrips([]);
//           setSelectedTripId("");
//           setBookingDetails(null);
//         }
//       } catch (err) {
//         console.error("Error fetching route details:", err);
//         setRouteDetails(null);
//         setSortedTrips([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRouteDetails();
//   }, [selectedRouteId, token]);

//   // Fetch booking details whenever selectedTripId changes
//   useEffect(() => {
//     if (!selectedTripId || !vehicleData || !token) return;
    
//     const fetchBookingDetails = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${API_BASE}/driver/trips/${selectedTripId}/booking-details`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const data = await res.json();
//         setBookingDetails(data);
//         // Clear drop events when changing trips
//         setDropEvents(new Map());
//       } catch (err) {
//         console.error("Error fetching booking details:", err);
//         setBookingDetails(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBookingDetails();
//   }, [selectedTripId, vehicleData, token]);

//   // Fetch drop events for a specific booking
//   const fetchDropEvents = async (bookingId: string) => {
//     if (!selectedTripId || !token) return;
    
//     setLoadingDropEvents(prev => new Set(prev).add(bookingId));
//     try {
//       const res = await fetch(
//         `${API_BASE}/driver/trips/${selectedTripId}/drop-events`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const data = await res.json();
      
//       if (data.data && Array.isArray(data.data)) {
//         const dropEventsMap = new Map(dropEvents);
//         data.data.forEach((event: DropEvent) => {
//           dropEventsMap.set(event.booking_id, event);
//         });
//         setDropEvents(dropEventsMap);
//       }
//     } catch (err) {
//       console.error(`Error fetching drop events for booking ${bookingId}:`, err);
//     } finally {
//       setLoadingDropEvents(prev => {
//         const newSet = new Set(prev);
//         newSet.delete(bookingId);
//         return newSet;
//       });
//     }
//   };

//   // Fetch drop events when expanding a booking
//   const handleToggleBooking = async (bookingId: string) => {
//     if (expandedBooking === bookingId) {
//       setExpandedBooking(null);
//     } else {
//       setExpandedBooking(bookingId);
//       // Fetch drop events if not already fetched
//       if (!dropEvents.has(bookingId)) {
//         await fetchDropEvents(bookingId);
//       }
//     }
//   };

//   const availableSeats = vehicleData?.seat_count ?? 10;
//   const bookingCount = bookingDetails?.booking_count ?? 0;
//   const seatsLeft = availableSeats - bookingCount;
//   const bookings = bookingDetails?.bookings ?? [];

//   const formatDateTime = (dt: string) =>
//     dt
//       ? new Date(dt).toLocaleString("en-IN", {
//           hour12: true,
//           dateStyle: "medium",
//           timeStyle: "short",
//         })
//       : "--";

//   const formatDate = (dt: string) =>
//     dt ? new Date(dt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "--";

//   const formatTime = (dt: string) =>
//     dt ? new Date(dt).toLocaleTimeString("en-IN", { hour12: true, timeStyle: "short" }) : "--";

//   const isUpcomingTrip = (plannedStart: string) => {
//     return new Date(plannedStart) > new Date();
//   };

//   const isTodayTrip = (plannedStart: string) => {
//     const today = new Date();
//     const tripDate = new Date(plannedStart);
//     return tripDate.toDateString() === today.toDateString();
//   };

//   const formatTripDisplay = (trip: any) => {
//     const startDate = new Date(trip.planned_start);
//     const endDate = new Date(trip.planned_end);
//     const isUpcoming = isUpcomingTrip(trip.planned_start);
//     const isToday = isTodayTrip(trip.planned_start);
    
//     const formattedDate = startDate.toLocaleDateString("en-IN", { 
//       day: 'numeric', 
//       month: 'short', 
//       year: 'numeric' 
//     });
    
//     const startTime = startDate.toLocaleTimeString("en-IN", { 
//       hour: '2-digit', 
//       minute: '2-digit',
//       hour12: true 
//     });
    
//     const endTime = endDate.toLocaleTimeString("en-IN", { 
//       hour: '2-digit', 
//       minute: '2-digit',
//       hour12: true 
//     });
    
//     let icon = "🔵";
//     let statusText = "";
    
//     if (isToday) {
//       icon = "🟡";
//       statusText = " (Today)";
//     } else if (isUpcoming) {
//       icon = "🟢";
//       statusText = " (Upcoming)";
//     } else {
//       icon = "🔵";
//       statusText = " (Completed)";
//     }
    
//     return {
//       display: `${formattedDate} | ${startTime} - ${endTime}`,
//       icon,
//       statusText,
//       isUpcoming,
//       isToday,
//       date: startDate
//     };
//   };

//   // Get drop event for a booking
//   const getDropEventForBooking = (bookingId: string): DropEvent | undefined => {
//     return dropEvents.get(bookingId);
//   };

//   // Get booking status badge color
//   const getBookingStatusBadge = (status: string) => {
//     switch (status) {
//       case 'booked':
//         return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400';
//       case 'boarded':
//         return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400';
//       case 'completed':
//         return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400';
//       case 'cancelled':
//         return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400';
//       default:
//         return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
//     }
//   };

//   return (
//     <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
//       <NavbarSidebar />
      
//       <IonContent className="relative">
//         <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
//         <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-6xl mx-auto">
//           <IonLoading isOpen={loading} message="Loading booking details..." />

//           {/* Header Section */}
//           <div className="mb-8">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
//               <BusIcon className="w-4 h-4" />
//               <span>Booking Management</span>
//             </div>
//        <h1 className="text-3xl md:text-5xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
//   Booking Details
// </h1>
//             <p className="text-gray-500 dark:text-gray-400 mt-2">
//               View and manage passenger bookings with drop-off tracking and seat numbers
//             </p>
//           </div>

//           {/* Filters Card */}
//           <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
//             <div className="p-6 space-y-4">
//               {/* Route Selector */}
//               <div>
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                   Select Route
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={selectedRouteId}
//                     onChange={(e) => setSelectedRouteId(e.target.value)}
//                     style={{
//                       width: '100%',
//                       padding: '12px 16px',
//                       borderRadius: '12px',
//                       border: '2px solid',
//                       borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
//                       backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
//                       color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                       transition: 'all 0.2s ease',
//                       appearance: 'none',
//                       cursor: 'pointer',
//                       fontSize: '1rem',
//                       fontFamily: 'inherit',
//                     }}
//                     onFocus={(e) => {
//                       e.currentTarget.style.borderColor = '#3b82f6';
//                       e.currentTarget.style.outline = 'none';
//                       e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
//                     }}
//                     onBlur={(e) => {
//                       e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
//                       e.currentTarget.style.boxShadow = 'none';
//                     }}
//                   >
//                     {routes.map((r) => (
//                       <option 
//                         key={r.route_id} 
//                         value={r.route_id}
//                         style={{
//                           backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
//                           color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                           padding: '8px',
//                         }}
//                       >
//                         {r.name}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                     <ChevronDownIcon className="w-5 h-5 text-gray-400" />
//                   </div>
//                 </div>
//               </div>

//               {/* Trip Selector */}
//               {sortedTrips.length > 0 ? (
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     Select Trip
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={selectedTripId}
//                       onChange={(e) => setSelectedTripId(e.target.value)}
//                       style={{
//                         width: '100%',
//                         padding: '12px 16px',
//                         borderRadius: '12px',
//                         border: '2px solid',
//                         borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
//                         backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
//                         color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                         transition: 'all 0.2s ease',
//                         appearance: 'none',
//                         cursor: 'pointer',
//                         fontSize: '1rem',
//                         fontFamily: 'inherit',
//                       }}
//                       onFocus={(e) => {
//                         e.currentTarget.style.borderColor = '#3b82f6';
//                         e.currentTarget.style.outline = 'none';
//                         e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
//                       }}
//                       onBlur={(e) => {
//                         e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
//                         e.currentTarget.style.boxShadow = 'none';
//                       }}
//                     >
//                       {sortedTrips.map((t: any) => {
//                         const tripInfo = formatTripDisplay(t);
//                         return (
//                           <option 
//                             key={t.trip_id} 
//                             value={t.trip_id}
//                             style={{
//                               backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
//                               color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
//                               padding: '8px',
//                               fontWeight: tripInfo.isToday ? 'bold' : 'normal',
//                             }}
//                           >
//                             {tripInfo.icon} {tripInfo.display}{tripInfo.statusText}
//                           </option>
//                         );
//                       })}
//                     </select>
//                     <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                       <ChevronDownIcon className="w-5 h-5 text-gray-400" />
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between mt-2">
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       🟢 Upcoming | 🟡 Today | 🔵 Completed
//                     </p>
//                     <p className="text-xs text-blue-600 dark:text-blue-400">
//                       📅 Showing all trips (most recent first)
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-center py-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
//                   <p className="text-yellow-800 dark:text-yellow-400 font-medium">
//                     ⚠️ No trips created for this route. Please create a trip first.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Booking Details */}
//           {bookingDetails && (
//             <>
//               {/* Trip Summary Card - UPDATED with new response fields */}
//               <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-xl border border-blue-200 dark:border-blue-800 p-6 mb-6">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900 dark:text-white">
//                       {bookingDetails.route?.name || "--"}
//                     </h2>
//                     <div className="flex items-center gap-2 mt-1">
//                       <CalendarIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
//                       <span className="text-sm text-gray-600 dark:text-gray-500">
//                         {formatDate(bookingDetails.planned_start)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="mt-2 md:mt-0 flex items-center gap-2">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                       bookingDetails.status === 'in_progress' 
//                         ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
//                         : bookingDetails.status === 'scheduled'
//                         ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
//                         : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
//                     }`}>
//                       {bookingDetails.status === 'in_progress' ? '● In Progress' : 
//                        bookingDetails.status === 'scheduled' ? '○ Scheduled' : '■ Completed'}
//                     </span>
//                     <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
//                       <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
//                         Trip ID: {selectedTripId.slice(-8)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-gray-300">
//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <ClockIcon className="w-6 h-6 text-blue-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Journey Time</p>
//                       <p className="text-sm font-medium">
//                         {formatDateTime(bookingDetails.planned_start)} - {formatDateTime(bookingDetails.planned_end)}
//                       </p>
//                       {bookingDetails.actual_start && (
//                         <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//                           Actual start: {formatDateTime(bookingDetails.actual_start)}
//                         </p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <TruckIcon className="w-6 h-6 text-green-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
//                       <p className="text-sm font-medium">
//                         {bookingDetails.vehicle?.name || "--"} ({bookingDetails.vehicle?.registration_number || "--"})
//                       </p>
//                       <p className="text-xs text-gray-400">{bookingDetails.vehicle?.model || ""}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <IdentificationIcon className="w-6 h-6 text-yellow-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Driver</p>
//                       <p className="text-sm font-medium">{bookingDetails.driver?.email || "--"}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <UserGroupIcon className="w-6 h-6 text-purple-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Seats Status</p>
//                       <p className="text-sm font-medium">
//                         {bookingCount} / {availableSeats} booked
//                       </p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <CurrencyRupeeIcon className="w-6 h-6 text-pink-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Total Fare</p>
//                       <p className="text-sm font-medium">₹{bookingDetails.total_fare?.toFixed(2) || "0.00"}</p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
//                     <CreditCardIcon className="w-6 h-6 text-indigo-500" />
//                     <div>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
//                       <p className="text-sm font-medium">₹{bookingDetails.total_fare_paid?.toFixed(2) || "0.00"}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Seat Availability Alert */}
//               {isUpcomingTrip(bookingDetails.planned_start) && (
//                 <div className={`mb-6 rounded-xl p-4 ${
//                   seatsLeft <= 0
//                     ? "bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700"
//                     : seatsLeft <= 5
//                     ? "bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700"
//                     : "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700"
//                 }`}>
//                   <div className="flex items-center gap-3">
//                     <UsersIcon className={`w-6 h-6 ${
//                       seatsLeft <= 0 ? "text-red-600" : seatsLeft <= 5 ? "text-orange-600" : "text-green-600"
//                     }`} />
//                     <div>
//                       <p className={`font-semibold ${
//                         seatsLeft <= 0 ? "text-red-800 dark:text-red-300" : 
//                         seatsLeft <= 5 ? "text-orange-800 dark:text-orange-300" : 
//                         "text-green-800 dark:text-green-300"
//                       }`}>
//                         {seatsLeft <= 0
//                           ? "🚫 No seats available — Booking Closed"
//                           : `🎟️ Seats Available: ${seatsLeft} remaining out of ${availableSeats}`}
//                       </p>
//                       {seatsLeft <= 5 && seatsLeft > 0 && (
//                         <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
//                           ⚠️ Only {seatsLeft} seats left! Limited availability.
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Past Trip Note */}
//               {!isUpcomingTrip(bookingDetails.planned_start) && (
//                 <div className="mb-6 rounded-xl p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700">
//                   <div className="flex items-center gap-3">
//                     <ClockIcon className="w-6 h-6 text-gray-500" />
//                     <div>
//                       <p className="font-semibold text-gray-700 dark:text-gray-300">
//                         📅 Past Trip
//                       </p>
//                       <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">
//                         This trip has already been completed. Showing historical booking data with drop-off tracking.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Bookings List - UPDATED with new response structure */}
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//                     Passenger Bookings ({bookings.length})
//                   </h3>
//                   <span className="text-xs text-gray-500 dark:text-gray-400">
//                     {bookings.length} passengers
//                   </span>
//                 </div>

//                 {bookings.length === 0 ? (
//                   <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700">
//                     <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-500 dark:text-gray-200 font-medium">
//                       No bookings have been made for this trip yet.
//                     </p>
//                   </div>
//                 ) : (
//                   bookings.map((booking: Booking, idx: number) => {
//                     const dropEvent = getDropEventForBooking(booking.booking_id);
//                     const isLoadingDrop = loadingDropEvents.has(booking.booking_id);
//                     const displayName = booking.traveller_name || booking.passenger_name || booking.name;
                    
//                     return (
//                       <div
//                         key={booking.booking_id}
//                         className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
//                       >
//                         {/* Booking Header - UPDATED with new fields */}
//                         <div
//                           className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
//                           onClick={() => handleToggleBooking(booking.booking_id)}
//                         >
//                           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
//                             <div className="flex items-center gap-3">
//                               <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
//                                 <span className="text-white font-semibold text-sm">
//                                   {idx + 1}
//                                 </span>
//                               </div>
//                               <div>
//                                 <div className="flex items-center gap-2 flex-wrap">
//                                   <p className="font-semibold text-gray-900 dark:text-white">
//                                     {displayName}
//                                   </p>
//                                   {/* Seat Number Badge */}
//                                   <SeatBadge seatNumber={booking.seat_number} />
//                                   {/* Booking Status Badge */}
//                                   <span className={`text-xs px-2 py-0.5 rounded-full ${getBookingStatusBadge(booking.booking_status)}`}>
//                                     {booking.booking_status}
//                                   </span>
//                                 </div>
//                                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                                   ID: {booking.booking_id?.slice(-8) || "--"}
//                                 </p>
//                                 {/* OTP Display
//                                 {booking.otp && (
//                                   <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
//                                     OTP: {booking.otp}
//                                   </p>
//                                 )} */}
//                               </div>
//                             </div>
                            
//                             <div className="flex items-center gap-3">
//                               {/* Drop Event Status Badge */}
//                               {dropEvent && (
//                                 <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                   dropEvent.flags.early_drop
//                                     ? "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400"
//                                     : dropEvent.flags.exact_drop
//                                     ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
//                                     : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
//                                 }`}>
//                                   {dropEvent.flags.early_drop ? "Early Drop" : 
//                                    dropEvent.flags.exact_drop ? "Exact Drop" : "Regular Drop"}
//                                 </div>
//                               )}
                              
//                               <div className={`px-3 py-1 rounded-full text-xs font-medium ${
//                                 booking.fare_paid === booking.fare
//                                   ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
//                                   : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
//                               }`}>
//                                 {booking.fare_paid === booking.fare ? (
//                                   <span className="flex items-center gap-1">
//                                     <CheckCircleIcon className="w-3 h-3" />
//                                     Paid
//                                   </span>
//                                 ) : (
//                                   <span className="flex items-center gap-1">
//                                     <XCircleIcon className="w-3 h-3" />
//                                     Pending
//                                   </span>
//                                 )}
//                               </div>
                              
//                               {expandedBooking === booking.booking_id ? (
//                                 <ChevronUpIcon className="w-5 h-5 text-gray-400" />
//                               ) : (
//                                 <ChevronDownIcon className="w-5 h-5 text-gray-400" />
//                               )}
//                             </div>
//                           </div>
//                         </div>

//                         {/* Expanded Details - UPDATED with new fields */}
//                         {expandedBooking === booking.booking_id && (
//                           <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50">
//                             {/* Traveler Information - New Section */}
//                             <TravelerInfo booking={booking} />

//                             {/* Original Booking Details */}
//                             <div className="mb-4">
//                               <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
//                                 <TicketIcon className="w-4 h-4" />
//                                 Journey Details
//                               </h4>
//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div className="space-y-3">
//                                   <div className="flex items-start gap-2">
//                                     <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
//                                     <div>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">Pickup Stop</p>
//                                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                         {booking.take_in || "--"}
//                                       </p>
//                                       <p className="text-xs text-gray-400 mt-1">
//                                         Est. Pickup: {booking.estimated_pickup_time ? formatDateTime(booking.estimated_pickup_time) : "--"}
//                                       </p>
//                                       {booking.boarded_at && (
//                                         <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//                                           Boarded at: {formatDateTime(booking.boarded_at)}
//                                         </p>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>

//                                 <div className="space-y-3">
//                                   <div className="flex items-start gap-2">
//                                     <MapPinIcon className="w-5 h-5 text-red-500 mt-0.5" />
//                                     <div>
//                                       <p className="text-xs text-gray-500 dark:text-gray-400">Drop-off Stop</p>
//                                       <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                         {booking.drop_off || "--"}
//                                       </p>
//                                       <p className="text-xs text-gray-400 mt-1">
//                                         Est. Drop-off: {booking.estimated_drop_off_time ? formatDateTime(booking.estimated_drop_off_time) : "--"}
//                                       </p>
//                                       {booking.completed_at && (
//                                         <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
//                                           Completed at: {formatDateTime(booking.completed_at)}
//                                         </p>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>

//                             {/* Drop Event Details - Actual Drop Location */}
//                             {isLoadingDrop ? (
//                               <div className="flex items-center justify-center py-4">
//                                 <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
//                                 <span className="ml-2 text-sm text-gray-500">Loading drop events...</span>
//                               </div>
//                             ) : dropEvent ? (
//                               <div className="mt-4 pt-4 border-t-2 border-blue-200 dark:border-blue-800">
//                                 <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
//                                   <MapPinIcon className="w-4 h-4" />
//                                   Actual Drop-off Information
//                                   {dropEvent.scan_info.within_radius && (
//                                     <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
//                                       Verified
//                                     </span>
//                                   )}
//                                 </h4>
                                
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                   <div className="space-y-3">
//                                     <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
//                                       <MapPinIcon className="w-5 h-5 text-orange-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Actual Drop Location</p>
//                                         <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
//                                           {dropEvent.actual_drop.name}
//                                         </p>
//                                         <p className="text-xs text-gray-400 mt-1">
//                                           Sequence: {dropEvent.actual_drop.sequence}
//                                         </p>
//                                       </div>
//                                     </div>

//                                     <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
//                                       <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Booked Drop Location</p>
//                                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                           {dropEvent.booked_drop.name}
//                                         </p>
//                                         <p className="text-xs text-gray-400 mt-1">
//                                           Sequence: {dropEvent.booked_drop.sequence}
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </div>

//                                   <div className="space-y-3">
//                                     <div className="flex items-start gap-2 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
//                                       <ClockIcon className="w-5 h-5 text-purple-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Scanned At</p>
//                                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                           {formatDateTime(dropEvent.scan_info.scanned_at)}
//                                         </p>
//                                       </div>
//                                     </div>

//                                     <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
//                                       <MapIcon className="w-5 h-5 text-green-500 mt-0.5" />
//                                       <div>
//                                         <p className="text-xs text-gray-500 dark:text-gray-400">Scan Location</p>
//                                         <p className="text-sm font-medium text-gray-900 dark:text-white">
//                                           Lat: {dropEvent.scan_info.lat.toFixed(6)}, Lng: {dropEvent.scan_info.lng.toFixed(6)}
//                                         </p>
//                                         <p className={`text-xs mt-1 ${dropEvent.scan_info.within_radius ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
//                                           {dropEvent.scan_info.within_radius ? "✓ Within valid radius" : "✗ Outside valid radius"}
//                                         </p>
//                                       </div>
//                                     </div>
//                                   </div>
//                                 </div>

//                                 {/* Early Drop Warning */}
//                                 {dropEvent.flags.early_drop && (
//                                   <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
//                                     <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
//                                       ⚠️ Early Drop-off Alert: Passenger was dropped off at "{dropEvent.actual_drop.name}" instead of "{dropEvent.booked_drop.name}"
//                                     </p>
//                                   </div>
//                                 )}

//                                 {/* Exact Drop Confirmation */}
//                                 {dropEvent.flags.exact_drop && (
//                                   <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
//                                     <p className="text-sm text-green-800 dark:text-green-400 flex items-center gap-2">
//                                       ✓ Drop-off confirmed at exact booked location "{dropEvent.booked_drop.name}"
//                                     </p>
//                                   </div>
//                                 )}
//                               </div>
//                             ) : (
//                               <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                                 <div className="text-center py-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg">
//                                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                                     No drop event recorded for this booking yet.
//                                   </p>
//                                   <button
//                                     onClick={() => fetchDropEvents(booking.booking_id)}
//                                     className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto"
//                                   >
//                                     <ArrowPathIcon className="w-3 h-3" />
//                                     Refresh
//                                   </button>
//                                 </div>
//                               </div>
//                             )}

//                             {/* Fare Details */}
//                             <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//                               <div className="flex items-center justify-between p-2">
//                                 <span className="text-sm text-gray-600 dark:text-gray-400">Fare:</span>
//                                 <span className="text-sm font-semibold text-gray-900 dark:text-white">
//                                   ₹{booking.fare ?? "--"}
//                                 </span>
//                               </div>
//                               <div className="flex items-center justify-between p-2">
//                                 <span className="text-sm text-gray-600 dark:text-gray-400">Paid:</span>
//                                 <span className={`text-sm font-semibold ${
//                                   booking.fare_paid === booking.fare
//                                     ? "text-green-600 dark:text-green-400"
//                                     : "text-red-600 dark:text-red-400"
//                                 }`}>
//                                   ₹{booking.fare_paid ?? "--"}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </IonContent>

//       <style>{`
//         ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }
        
//         ::-webkit-scrollbar-track {
//           background: rgb(243 244 246);
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb {
//           background: rgb(156 163 175);
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb:hover {
//           background: rgb(107 114 128);
//         }
        
//         .dark ::-webkit-scrollbar-track {
//           background: rgb(31 41 55);
//         }
        
//         .dark ::-webkit-scrollbar-thumb {
//           background: rgb(75 85 99);
//         }
        
//         .bg-grid-gray-900\\/[0.02] {
//           background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
//                             linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
//         }
        
//         .dark .bg-grid-white\\/[0.02] {
//           background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
//                             linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
//         }
        
//         select option {
//           background-color: #ffffff;
//           color: #1f2937;
//         }
        
//         .dark select option {
//           background-color: #1f2937 !important;
//           color: #ffffff !important;
//         }
        
//         select {
//           color-scheme: light;
//         }
        
//         .dark select {
//           color-scheme: dark;
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default BookingDetails;


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
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  InformationCircleIcon,
  XMarkIcon,
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

interface Booking {
  booking_id: string;
  seat_number: string;
  name: string;
  take_in: string;
  drop_off: string;
  estimated_pickup_time: string;
  estimated_drop_off_time: string;
  fare: number;
  fare_paid: number;
  booking_status: string;
  boarded_at: string | null;
  completed_at: string | null;
  otp: string;
  booking_session_id: string;
  passenger_id: string;
  account_owner_user_id: string;
  booked_by_user_id: string;
  passenger_name: string;
  traveller_name: string;
  traveller_phone: string;
  traveller_email: string;
  traveller_relationship_label: string;
  account_owner_name: string;
}

interface TripSummaryResponse {
  trip_id: string;
  status: string;
  planned_start: string;
  planned_end: string;
  actual_start: string | null;
  actual_end: string | null;
  driver: {
    driver_id: string;
    email: string;
  };
  vehicle: {
    vehicle_id: string;
    name: string;
    model: string;
    registration_number: string;
  };
  route: {
    route_id: string;
    name: string;
  };
  booking_count: number;
  bookings: Booking[];
  total_fare: number;
  total_fare_paid: number;
}

// Seat Badge Component
const SeatBadge: React.FC<{ seatNumber?: string | number | null }> = ({ seatNumber }) => {
  if (!seatNumber) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      Seat {seatNumber}
    </span>
  );
};

// Traveler Info Component
const TravelerInfo: React.FC<{ booking: Booking }> = ({ booking }) => {
  return (
    <div className="p-3 bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl mb-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Traveler:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {booking.traveller_name || booking.passenger_name || booking.name}
            </span>
          </div>
          {booking.traveller_relationship_label && (
            <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full">
              {booking.traveller_relationship_label}
            </span>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          {booking.traveller_phone && (
            <div className="flex items-center gap-1.5">
              <PhoneIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {booking.traveller_phone}
              </span>
            </div>
          )}
          {booking.traveller_email && (
            <div className="flex items-center gap-1.5">
              <EnvelopeIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {booking.traveller_email}
              </span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Account Owner: {booking.account_owner_name || booking.passenger_name}
        </div>
      </div>
    </div>
  );
};

const BookingDetails: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [bookingDetails, setBookingDetails] = useState<TripSummaryResponse | null>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [sortedTrips, setSortedTrips] = useState<any[]>([]);
  const [dropEvents, setDropEvents] = useState<Map<string, DropEvent>>(new Map());
  const [loadingDropEvents, setLoadingDropEvents] = useState<Set<string>>(new Set());
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'vehicle' | 'routes' | 'general' | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
    };
    loadToken();
  }, []);

  // Fetch vehicle first - check if driver has vehicle
  useEffect(() => {
    if (!token) return;
    
    const fetchVehicle = async () => {
      setLoading(true);
      setError(null);
      setErrorType(null);
      try {
        const res = await fetch(`${API_BASE}/driver/vehicle/my-vehicle`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.status === 404) {
          setError("Driver vehicle not found. Please register a vehicle first.");
          setErrorType('vehicle');
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        
        if (!res.ok) {
          const data = await res.json();
          setError(data.detail?.message || data.detail || "Failed to fetch vehicle details");
          setErrorType('vehicle');
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        setVehicleData(data);
        setError(null);
        setErrorType(null);
        setShowErrorModal(false);
      } catch (err) {
        console.error("Error fetching vehicle:", err);
        setError("Failed to connect to server. Please try again.");
        setErrorType('general');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [token]);

  // Fetch all routes - only if vehicle exists
  useEffect(() => {
    if (!token || !vehicleData) return;
    
    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/driver/routes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.status === 400) {
          const data = await res.json();
          setError(data.detail || "No routes available for this driver.");
          setErrorType('routes');
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        
        if (!res.ok) {
          const data = await res.json();
          setError(data.detail?.message || data.detail || "Failed to fetch routes");
          setErrorType('routes');
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        
        const data = await res.json();
        setRoutes(data || []);
        if (data && data.length > 0) {
          setSelectedRouteId(data[0].route_id);
          setError(null);
          setErrorType(null);
          setShowErrorModal(false);
        } else {
          setError("No routes assigned to this driver. Please contact admin.");
          setErrorType('routes');
          setShowErrorModal(true);
        }
      } catch (err) {
        console.error("Error fetching routes:", err);
        setError("Failed to connect to server. Please try again.");
        setErrorType('general');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, [token, vehicleData]);

  // Fetch trips for selected route and sort them - MOST RECENT FIRST
  useEffect(() => {
    if (!selectedRouteId || !token || !vehicleData || errorType === 'vehicle' || errorType === 'routes') return;
    
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
  }, [selectedRouteId, token, vehicleData, errorType]);

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

  const handleToggleBooking = async (bookingId: string) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(bookingId);
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

  const getDropEventForBooking = (bookingId: string): DropEvent | undefined => {
    return dropEvents.get(bookingId);
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400';
      case 'boarded':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  // ======================
  // Modern Error Modal Component
  // ======================
  const ErrorModal = () => {
    if (!showErrorModal || !error) return null;

    const getErrorIcon = () => {
      if (errorType === 'vehicle') return ExclamationTriangleIcon;
      if (errorType === 'routes') return ShieldExclamationIcon;
      return InformationCircleIcon;
    };

    const getErrorColors = () => {
      if (errorType === 'vehicle') {
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          iconBg: 'bg-red-100 dark:bg-red-900/50',
          iconColor: 'text-red-600 dark:text-red-400',
          title: 'text-red-800 dark:text-red-300',
          button: 'bg-red-600 hover:bg-red-700',
        };
      }
      if (errorType === 'routes') {
        return {
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50',
          iconColor: 'text-amber-600 dark:text-amber-400',
          title: 'text-amber-800 dark:text-amber-300',
          button: 'bg-amber-600 hover:bg-amber-700',
        };
      }
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        iconColor: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-800 dark:text-blue-300',
        button: 'bg-blue-600 hover:bg-blue-700',
      };
    };

    const colors = getErrorColors();
    const IconComponent = getErrorIcon();

    const getTitle = () => {
      if (errorType === 'vehicle') return '🚫 Vehicle Not Found';
      if (errorType === 'routes') return '⚠️ No Routes Available';
      return '🔌 Connection Issue';
    };

    const getActionButtons = () => {
      if (errorType === 'vehicle') {
        return (
          <>
        <button
  onClick={() => window.location.href = '/bus-and-trip-management'}
  style={{
    padding: '8px 16px',
    height: '40px',
    background: colors.button || '#DC2626',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontWeight: '500',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    border: 'none',
    minWidth: '140px',
    lineHeight: '1',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';
  }}
>
  <TruckIcon style={{ width: '16px', height: '16px' }} />
  Register Vehicle
</button>

<button
  onClick={() => window.location.reload()}
  style={{
    padding: '8px 16px',
    height: '40px',
    background: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB',
    color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#374151',
    borderRadius: '12px',
    fontWeight: '500',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
    cursor: 'pointer',
    border: 'none',
    minWidth: '100px',
    lineHeight: '1',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)';
    const isDark = document.documentElement.classList.contains('dark');
    e.currentTarget.style.background = isDark ? '#4B5563' : '#D1D5DB';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)';
    const isDark = document.documentElement.classList.contains('dark');
    e.currentTarget.style.background = isDark ? '#374151' : '#E5E7EB';
  }}
>
  <ArrowPathIcon style={{ width: '16px', height: '16px' }} />
  Retry
</button>
          </>
        );
      }
      if (errorType === 'routes') {
        return (
          <>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className={`px-6 py-3 ${colors.button} text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-40`}
            >
              <MapIcon className="w-5 h-5" />
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-30"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Retry
            </button>
          </>
        );
      }
      return (
        <button
          onClick={() => window.location.reload()}
          className={`px-6 py-3 ${colors.button} text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 min-w-40`}
        >
          <ArrowPathIcon className="w-5 h-5" />
          Retry
        </button>
      );
    };

    const getHelpText = () => {
      if (errorType === 'vehicle') {
        return '💡 Please register your vehicle first to access booking management.';
      }
      if (errorType === 'routes') {
        return '💡 Contact your admin to assign routes to your driver account.';
      }
      return '💡 Check your internet connection and try again.';
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div 
          className={`relative w-full max-w-lg ${colors.bg} ${colors.border} border-2 rounded-3xl shadow-2xl overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowErrorModal(false)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Content */}
          <div className="p-8 pt-12 text-center">
            {/* Icon */}
            <div className={`w-24 h-24 ${colors.iconBg} rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg`}>
              <IconComponent className={`w-12 h-12 ${colors.iconColor}`} />
            </div>

            {/* Title */}
            <h2 className={`text-2xl font-bold ${colors.title} mb-3`}>
              {getTitle()}
            </h2>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {error}
            </p>

            {/* Help Text */}
            <div className="mb-8 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getHelpText()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {getActionButtons()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-6xl mx-auto">
          <IonLoading isOpen={loading} message="Loading booking details..." />

          {/* Error Modal */}
          <ErrorModal />

          {/* Header Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
              <BusIcon className="w-4 h-4" />
              <span>Booking Management</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Booking Details
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              View and manage passenger bookings with drop-off tracking and seat numbers
            </p>
          </div>

          {/* ====================== */}
          {/* MAIN CONTENT - Only show if no error */}
          {/* ====================== */}
          {!showErrorModal && (
            <>
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
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200 appearance-none cursor-pointer"
                      >
                        {routes.map((r) => (
                          <option 
                            key={r.route_id} 
                            value={r.route_id}
                            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-200 appearance-none cursor-pointer"
                        >
                          {sortedTrips.map((t: any) => {
                            const tripInfo = formatTripDisplay(t);
                            return (
                              <option 
                                key={t.trip_id} 
                                value={t.trip_id}
                                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                      <div className="mt-2 md:mt-0 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          bookingDetails.status === 'in_progress' 
                            ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400'
                            : bookingDetails.status === 'scheduled'
                            ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {bookingDetails.status === 'in_progress' ? '● In Progress' : 
                           bookingDetails.status === 'scheduled' ? '○ Scheduled' : '■ Completed'}
                        </span>
                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            Trip ID: {selectedTripId.slice(-8)}
                          </span>
                        </div>
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
                          {bookingDetails.actual_start && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Actual start: {formatDateTime(bookingDetails.actual_start)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                        <TruckIcon className="w-6 h-6 text-green-500" />
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle</p>
                          <p className="text-sm font-medium">
                            {bookingDetails.vehicle?.name || "--"} ({bookingDetails.vehicle?.registration_number || "--"})
                          </p>
                          <p className="text-xs text-gray-400">{bookingDetails.vehicle?.model || ""}</p>
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
                      bookings.map((booking: Booking, idx: number) => {
                        const dropEvent = getDropEventForBooking(booking.booking_id);
                        const isLoadingDrop = loadingDropEvents.has(booking.booking_id);
                        const displayName = booking.traveller_name || booking.passenger_name || booking.name;
                        
                        return (
                          <div
                            key={booking.booking_id}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
                          >
                            {/* Booking Header */}
                            <div
                              className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                              onClick={() => handleToggleBooking(booking.booking_id)}
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                                    <span className="text-white font-semibold text-sm">
                                      {idx + 1}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-semibold text-gray-900 dark:text-white">
                                        {displayName}
                                      </p>
                                      <SeatBadge seatNumber={booking.seat_number} />
                                      <span className={`text-xs px-2 py-0.5 rounded-full ${getBookingStatusBadge(booking.booking_status)}`}>
                                        {booking.booking_status}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      ID: {booking.booking_id?.slice(-8) || "--"}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
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
                                    booking.fare_paid === booking.fare
                                      ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400"
                                      : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400"
                                  }`}>
                                    {booking.fare_paid === booking.fare ? (
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
                                  
                                  {expandedBooking === booking.booking_id ? (
                                    <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                                  ) : (
                                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedBooking === booking.booking_id && (
                              <div className="border-t border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-800/50">
                                <TravelerInfo booking={booking} />

                                <div className="mb-4">
                                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                    <TicketIcon className="w-4 h-4" />
                                    Journey Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                      <div className="flex items-start gap-2">
                                        <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                                        <div>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">Pickup Stop</p>
                                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {booking.take_in || "--"}
                                          </p>
                                          <p className="text-xs text-gray-400 mt-1">
                                            Est. Pickup: {booking.estimated_pickup_time ? formatDateTime(booking.estimated_pickup_time) : "--"}
                                          </p>
                                          {booking.boarded_at && (
                                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                              Boarded at: {formatDateTime(booking.boarded_at)}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <div className="flex items-start gap-2">
                                        <MapPinIcon className="w-5 h-5 text-red-500 mt-0.5" />
                                        <div>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">Drop-off Stop</p>
                                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {booking.drop_off || "--"}
                                          </p>
                                          <p className="text-xs text-gray-400 mt-1">
                                            Est. Drop-off: {booking.estimated_drop_off_time ? formatDateTime(booking.estimated_drop_off_time) : "--"}
                                          </p>
                                          {booking.completed_at && (
                                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                              Completed at: {formatDateTime(booking.completed_at)}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Drop Event Details */}
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
                                            <p className={`text-xs mt-1 ${dropEvent.scan_info.within_radius ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                              {dropEvent.scan_info.within_radius ? "✓ Within valid radius" : "✗ Outside valid radius"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {dropEvent.flags.early_drop && (
                                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-400 flex items-center gap-2">
                                          ⚠️ Early Drop-off Alert: Passenger was dropped off at "{dropEvent.actual_drop.name}" instead of "{dropEvent.booked_drop.name}"
                                        </p>
                                      </div>
                                    )}

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
                                        onClick={() => fetchDropEvents(booking.booking_id)}
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
                                  <div className="flex items-center justify-between p-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Fare:</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                      ₹{booking.fare ?? "--"}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between p-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Paid:</span>
                                    <span className={`text-sm font-semibold ${
                                      booking.fare_paid === booking.fare
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400"
                                    }`}>
                                      ₹{booking.fare_paid ?? "--"}
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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </IonPage>
  );
};

export default BookingDetails;