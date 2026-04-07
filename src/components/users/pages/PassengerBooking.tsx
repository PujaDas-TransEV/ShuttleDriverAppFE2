// import React, { useState, useEffect } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import NavbarSidebar from "./Navbar";
// import {
//   ClockIcon,
//   TruckIcon,
//   IdentificationIcon,
//   UserGroupIcon,
//   CurrencyRupeeIcon,
//   MapIcon,
//   TicketIcon,
// } from "@heroicons/react/24/outline";

// const API_BASE = "https://be.shuttleapp.transev.site";

// const BookingDetails: React.FC = () => {
//   const token = localStorage.getItem("access_token");

//   const [loading, setLoading] = useState(false);
//   const [routes, setRoutes] = useState<any[]>([]);
//   const [selectedRouteId, setSelectedRouteId] = useState<string>("");
//   const [routeDetails, setRouteDetails] = useState<any>(null);
//   const [selectedTripId, setSelectedTripId] = useState<string>("");
//   const [bookingDetails, setBookingDetails] = useState<any>(null);
//   const [vehicleData, setVehicleData] = useState<any>(null);

//   // Fetch all routes
//   useEffect(() => {
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

//   // Fetch trips for selected route
//   useEffect(() => {
//     if (!selectedRouteId) return;
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
//           setSelectedTripId(data.trips[0].trip_id);
//         } else {
//           setSelectedTripId("");
//           setBookingDetails(null);
//         }
//       } catch (err) {
//         console.error("Error fetching route details:", err);
//         setRouteDetails(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchRouteDetails();
//   }, [selectedRouteId, token]);

//   // Fetch booking details **after vehicle is loaded**
//   useEffect(() => {
//     if (!selectedTripId || !vehicleData) return;
//     const fetchBookingDetails = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `${API_BASE}/driver/trips/${selectedTripId}/booking-details`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         const data = await res.json();
//         setBookingDetails(data);
//       } catch (err) {
//         console.error("Error fetching booking details:", err);
//         setBookingDetails(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBookingDetails();
//   }, [selectedTripId, vehicleData, token]);

//   const availableSeats = vehicleData?.seat_count ?? 10; // default 10 if not provided
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

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-16 pb-8">
//         <div className="max-w-5xl mx-auto px-6 mt-20">
//           <h1 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-white">
//             🚍 Booking Details
//           </h1>

//           <IonLoading isOpen={loading} message="Loading..." />

//           {/* Route Selector */}
//           <div className="mb-6">
//             <label className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
//               Select Route
//             </label>
//             <select
//               className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
//               value={selectedRouteId}
//               onChange={(e) => setSelectedRouteId(e.target.value)}
//             >
//               {routes.map((r) => (
//                 <option key={r.route_id} value={r.route_id}>
//                   {r.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Trip Selector */}
//           {routeDetails?.trips?.length > 0 ? (
//             <div className="mb-6">
//               <label className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
//                 Select Trip
//               </label>
//               <select
//                 className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
//                 value={selectedTripId}
//                 onChange={(e) => setSelectedTripId(e.target.value)}
//               >
//                 {routeDetails.trips.map((t: any) => (
//                   <option key={t.trip_id} value={t.trip_id}>
//                     {formatDateTime(t.planned_start)} - {formatDateTime(t.planned_end)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           ) : (
//             <div className="mb-6 text-center font-semibold text-gray-500 dark:text-gray-400">
//               ⚠️ No trips created for this route.
//             </div>
//           )}

//           {/* Booking Details Card */}
//           {bookingDetails && (
//             <>
//               <div className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <h2 className="text-xl font-bold text-gray-800 dark:text-white">
//                     {bookingDetails.route?.name || "--"}
//                   </h2>
//                   <span className="text-sm text-gray-500 dark:text-gray-400">
//                     {formatDate(bookingDetails.planned_start)}
//                   </span>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300 text-sm md:text-base">
//                   <div className="flex items-center gap-2">
//                     <ClockIcon className="w-6 h-6 text-blue-500" />
//                     {formatDateTime(bookingDetails.planned_start)} - {formatDateTime(bookingDetails.planned_end)}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <TruckIcon className="w-6 h-6 text-green-500" />
//                     {vehicleData?.vehicle_name || "--"} ({vehicleData?.registration_number || "--"})
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <IdentificationIcon className="w-6 h-6 text-yellow-500" />
//                     Driver: {bookingDetails.driver?.email || "--"}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <UserGroupIcon className="w-6 h-6 text-purple-500" />
//                     Seats Booked: {bookingCount} / {availableSeats}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <CurrencyRupeeIcon className="w-6 h-6 text-pink-500" />
//                     Total Fare: ₹{bookingDetails.total_fare?.toFixed(2) || "0.00"}
//                   </div>

//                   <div className="flex items-center gap-2">
//                     <CurrencyRupeeIcon className="w-6 h-6 text-indigo-500" />
//                     Total Paid: ₹{bookingDetails.total_fare_paid?.toFixed(2) || "0.00"}
//                   </div>
//                 </div>
//               </div>

//               {/* Seat Availability */}
//               <div
//                 className={`p-4 rounded-lg mb-6 text-center font-semibold text-lg ${
//                   seatsLeft <= 0
//                     ? "bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200"
//                     : "bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200"
//                 }`}
//               >
//                 {seatsLeft <= 0
//                   ? "🚫 No seats available — booking closed"
//                   : `🎟 Seats available: ${seatsLeft} remaining`}
//               </div>

//               {/* Bookings List */}
//               <div className="space-y-4">
//    {bookings.length === 0 ? (
//     <div className="text-center text-gray-500 dark:text-gray-400 font-medium">
//       ⚠️ No bookings have been made for this trip.
//     </div>
//   ) : (
//     bookings.map((b: any, idx: number) => (
//       <div
//         key={idx}
//         className="bg-linear-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
//       >
//         {/* Passenger Name */}
//         <div className="flex justify-between items-center mb-3">
//           <span className="text-lg font-semibold text-gray-900 dark:text-white">
//             👤 Passenger: {b.name || "--"}
//           </span>
//           <span className="text-sm text-gray-500 dark:text-gray-400">
//             Booking ID: {b.booking_id || "--"}
//           </span>
//         </div>

//         {/* Pickup / Drop-off */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-gray-700 dark:text-gray-300">
//           <div className="flex items-center gap-2">
//             <MapIcon className="w-5 h-5 text-blue-400" />
//             Pickup: {b.take_in || "--"}
//           </div>
//           <div className="flex items-center gap-2">
//             <MapIcon className="w-5 h-5 text-red-400" />
//             Drop-off: {b.drop_off || "--"}
//           </div>
//         </div>

//         {/* Estimated Times */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-gray-700 dark:text-gray-300">
//           <div className="flex items-center gap-2">
//             <ClockIcon className="w-5 h-5 text-blue-500" />
//             Estimated Pickup: {b.estimated_pickup_time ? new Date(b.estimated_pickup_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "--"}
//           </div>
//           <div className="flex items-center gap-2">
//             <ClockIcon className="w-5 h-5 text-purple-500" />
//             Estimated Drop-off: {b.estimated_drop_off_time ? new Date(b.estimated_drop_off_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "--"}
//           </div>
//         </div>

//         {/* Fare and Status */}
//         <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-center text-gray-700 dark:text-gray-300">
//           <div className="flex items-center gap-2">
//             <CurrencyRupeeIcon className="w-5 h-5 text-green-500" />
//             Fare: ₹{b.fare ?? "--"}
//           </div>
//           <div className="flex items-center gap-2">
//             <CurrencyRupeeIcon className="w-5 h-5 text-indigo-500" />
//             Paid: ₹{b.fare_paid ?? "--"}
//           </div>
//           <div className={`flex items-center gap-2 font-semibold ${
//             b.fare_paid === b.fare
//               ? "text-green-700 dark:text-green-300"
//               : "text-red-700 dark:text-red-300"
//           }`}>
//             <TicketIcon className="w-5 h-5" />
//             {b.fare_paid === b.fare ? "✅ Paid" : "❌ Pending"}
//           </div>
//         </div>
//       </div>
//     ))
//   )}
// </div>
//             </>
//           )}
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default BookingDetails;

import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
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
} from "@heroicons/react/24/outline";
import { BusIcon } from "lucide-react";

const API_BASE = "https://be.shuttleapp.transev.site";

const BookingDetails: React.FC = () => {
  const token = localStorage.getItem("access_token");

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

  // Fetch all routes
  useEffect(() => {
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

  // Fetch trips for selected route
  useEffect(() => {
    if (!selectedRouteId) return;
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
          setSelectedTripId(data.trips[0].trip_id);
        } else {
          setSelectedTripId("");
          setBookingDetails(null);
        }
      } catch (err) {
        console.error("Error fetching route details:", err);
        setRouteDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRouteDetails();
  }, [selectedRouteId, token]);

  // Fetch booking details **after vehicle is loaded**
  useEffect(() => {
    if (!selectedTripId || !vehicleData) return;
    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/driver/trips/${selectedTripId}/booking-details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setBookingDetails(data);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setBookingDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [selectedTripId, vehicleData, token]);

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

  const toggleBookingExpand = (bookingId: string) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(bookingId);
    }
  };

  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-6xl mx-auto">
          <IonLoading isOpen={loading} message="Loading booking details..." />

          {/* Header Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4">
              <BusIcon className="w-4 h-4" />
              <span>Booking Management</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 dark:text-yellow-600 bg-clip-text text-transparent">
              Booking Details
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              View and manage passenger bookings for your trips
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
    {routeDetails?.trips?.length > 0 ? (
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
        {/* Sort trips by planned_start date - most recent first */}
        {[...routeDetails.trips]
          .sort((a, b) => new Date(b.planned_start).getTime() - new Date(a.planned_start).getTime())
          .map((t: any) => (
            <option 
              key={t.trip_id} 
              value={t.trip_id}
              style={{
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
                padding: '8px',
              }}
            >
              {formatDateTime(t.planned_start)} - {formatDateTime(t.planned_end)}
            </option>
          ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
        <ChevronDownIcon className="w-5 h-5 text-gray-400" />
      </div>
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

<style>{`
  /* Ensure select options are visible in dark mode */
  select option {
    background-color: #ffffff;
    color: #1f2937;
  }
  
  .dark select option {
    background-color: #1f2937 !important;
    color: #ffffff !important;
  }
  
  /* For the selected value */
  select {
    color-scheme: light;
  }
  
  .dark select {
    color-scheme: dark;
  }
`}</style>
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">
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
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      No bookings have been made for this trip yet.
                    </p>
                  </div>
                ) : (
                  bookings.map((b: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-200"
                    >
                      {/* Booking Header */}
                      <div
                        className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={() => toggleBookingExpand(b.booking_id || idx.toString())}
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
                                Booking ID: {b.booking_id || "--"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
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
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Pickup Location</p>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {b.take_in || "--"}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-2">
                                <MapPinIcon className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Drop-off Location</p>
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
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </IonContent>

      <style>{`
        /* Custom scrollbar */
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
        
        /* Background grid pattern */
        .bg-grid-gray-900\\/[0.02] {
          background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
        }
        
        .dark .bg-grid-white\\/[0.02] {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
      `}</style>
    </IonPage>
  );
};

export default BookingDetails;