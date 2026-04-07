// import React, { useState, useEffect } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import NavbarSidebar from "./Navbar";
// import { useHistory } from "react-router-dom";
// // import { useNavigate } from "react-router-dom";
// const API_BASE = "https://be.shuttleapp.transev.site";

// const CreateTripPage = () => {
//   const token = localStorage.getItem("access_token");
//   const history = useHistory();

//   const [routes, setRoutes] = useState<any[]>([]);
//   const [selectedRoute, setSelectedRoute] = useState<any>(null);
//   const [loading, setLoading] = useState(false);

//   const [newTrip, setNewTrip] = useState({
//     route_id: "",
//     route_name: "",
//     planned_start_at: "",
//     planned_end_at: "",
//     stop_times: {} as Record<string, string>,
//   });

//   // Fetch routes
//   const fetchRoutes = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/routes`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setRoutes(data);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to load routes");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRoutes();
//   }, []);

//   // Convert local time to UTC ISO string
//   const convertToUTC = (localDateTime: string) => {
//     if (!localDateTime) return "";
//     const date = new Date(localDateTime);
//     return date.toISOString();
//   };


  
//   const handleCreateTrip = async () => {
//   if (!newTrip.route_name || !newTrip.planned_start_at || !newTrip.planned_end_at) {
//     alert("Please select route and set start/end times");
//     return;
//   }

//   setLoading(true);

//   try {
//     // Convert planned times to UTC
//     const plannedStartUTC = convertToUTC(newTrip.planned_start_at);
//     const plannedEndUTC = convertToUTC(newTrip.planned_end_at);

//     // Convert stop times to UTC (keep the date from plannedStart)
//     const stopTimesUTC: Record<string, string> = {};
//     Object.entries(newTrip.stop_times).forEach(([stop, time]) => {
//       if (time) {
//         const date = new Date(newTrip.planned_start_at);
//         const [hours, minutes] = time.split(":").map(Number);
//         date.setHours(hours, minutes, 0, 0);
//         stopTimesUTC[stop] = date.toISOString();
//       }
//     });

//     const fd = new FormData();
//     fd.append("route_name", newTrip.route_name);
//     fd.append("planned_start_at", plannedStartUTC);
//     fd.append("planned_end_at", plannedEndUTC);
//     fd.append("stop_times", JSON.stringify(stopTimesUTC));

//     const res = await fetch(`${API_BASE}/driver/scheduled-trips/create`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: fd,
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       // Show backend error message directly
//       const errorMsg = data?.detail || JSON.stringify(data) || "Failed to create trip";
//       throw new Error(errorMsg);
//     }

//     alert("Trip Created Successfully!");
//     history.push(`/trip-management`);
//   } catch (err: any) {
//     console.error(err);
//     // Display backend error message to user
//     alert(err.message);
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans p-4">
//         <IonLoading isOpen={loading} message="Please wait..." />

//         {/* Create Trip Card */}
//         <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-10">
//           <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
//             Create New Trip
//           </h2>

//           {/* Route selection */}
//           <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Select Route</label>
//           <select
//             className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//             value={newTrip.route_id}
//             onChange={(e) => {
//               const route = routes.find((r) => r.route_id === e.target.value);
//               setNewTrip({
//                 ...newTrip,
//                 route_id: e.target.value,
//                 route_name: route?.name || "",
//                 stop_times: {},
//               });
//               setSelectedRoute(route);
//             }}
//           >
//             <option value="">Choose Route</option>
//             {routes.map((r) => (
//               <option key={r.route_id} value={r.route_id}>
//                 {r.name}
//               </option>
//             ))}
//           </select>

//           {/* Planned Start & End */}
//           <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Planned Start</label>
//           <input
//             type="datetime-local"
//             className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//             value={newTrip.planned_start_at}
//             onChange={(e) => setNewTrip({ ...newTrip, planned_start_at: e.target.value })}
//           />

//           <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Planned End</label>
//           <input
//             type="datetime-local"
//             className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//             value={newTrip.planned_end_at}
//             onChange={(e) => setNewTrip({ ...newTrip, planned_end_at: e.target.value })}
//           />

//           {/* Stops */}
//           {selectedRoute?.stops?.length > 0 && (
//             <div className="mb-4">
//               <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Stops & Times</h3>
//               <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
//                 {selectedRoute.stops.map((stop: any, i: number) => (
//                   <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded shadow-sm">
//                     <span className="font-medium">{stop.name}</span>
//                     <input
//                       type="time"
//                       className="border p-2 rounded dark:bg-gray-800 text-gray-900 dark:text-white w-32"
//                       value={newTrip.stop_times[stop.name] || ""}
//                       onChange={(e) =>
//                         setNewTrip({
//                           ...newTrip,
//                           stop_times: { ...newTrip.stop_times, [stop.name]: e.target.value },
//                         })
//                       }
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Map */}
//           {selectedRoute?.stops?.length > 0 && (
//             <div style={{ height: 250 }} className="mb-4 rounded overflow-hidden shadow">
//               <MapContainer center={[22.57, 88.36]} zoom={12} style={{ height: "100%", width: "100%" }}>
//                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                 {selectedRoute.stops.map((stop: any, i: number) => (
//                   <Marker key={i} position={[22.57 + i * 0.01, 88.36 + i * 0.01]}>
//                     <Popup>{stop.name}</Popup>
//                   </Marker>
//                 ))}
//               </MapContainer>
//             </div>
//           )}

//           {/* Buttons */}
//           <div className="flex justify-between space-x-4 mt-4">
//             <button
//               onClick={handleCreateTrip}
//               className="h-12 flex-1 bg-green-700 text-white font-bold rounded-lg"
//             >
//               Create
//             </button>
//             <button
//               onClick={() => {
//                 setNewTrip({
//                   route_id: "",
//                   route_name: "",
//                   planned_start_at: "",
//                   planned_end_at: "",
//                   stop_times: {},
//                 });
//                 setSelectedRoute(null);
//               }}
//               className="h-12 flex-1 bg-red-600 text-white font-bold rounded-lg"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default CreateTripPage;

import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import NavbarSidebar from "./Navbar";
import { useHistory } from "react-router-dom";
import { 
  Bus, 
  Calendar, 
  Clock, 
  MapPin, 
  Route as RouteIcon, 
  Plus, 
  X,
  Navigation 
} from 'lucide-react';

const API_BASE = "https://be.shuttleapp.transev.site";

// Fix for Leaflet marker icons in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const CreateTripPage = () => {
  const token = localStorage.getItem("access_token");
  const history = useHistory();

  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [newTrip, setNewTrip] = useState({
    route_id: "",
    route_name: "",
    planned_start_at: "",
    planned_end_at: "",
    stop_times: {} as Record<string, string>,
  });

  // Fetch routes
  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/routes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRoutes(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load routes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Convert local time to UTC ISO string
  const convertToUTC = (localDateTime: string) => {
    if (!localDateTime) return "";
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  const handleCreateTrip = async () => {
    if (!newTrip.route_name || !newTrip.planned_start_at || !newTrip.planned_end_at) {
      alert("Please select route and set start/end times");
      return;
    }

    setLoading(true);

    try {
      // Convert planned times to UTC
      const plannedStartUTC = convertToUTC(newTrip.planned_start_at);
      const plannedEndUTC = convertToUTC(newTrip.planned_end_at);

      // Convert stop times to UTC (keep the date from plannedStart)
      const stopTimesUTC: Record<string, string> = {};
      Object.entries(newTrip.stop_times).forEach(([stop, time]) => {
        if (time) {
          const date = new Date(newTrip.planned_start_at);
          const [hours, minutes] = time.split(":").map(Number);
          date.setHours(hours, minutes, 0, 0);
          stopTimesUTC[stop] = date.toISOString();
        }
      });

      const fd = new FormData();
      fd.append("route_name", newTrip.route_name);
      fd.append("planned_start_at", plannedStartUTC);
      fd.append("planned_end_at", plannedEndUTC);
      fd.append("stop_times", JSON.stringify(stopTimesUTC));

      const res = await fetch(`${API_BASE}/driver/scheduled-trips/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        // Show backend error message directly
        const errorMsg = data?.detail || JSON.stringify(data) || "Failed to create trip";
        throw new Error(errorMsg);
      }

      alert("Trip Created Successfully!");
      history.push(`/trip-management`);
    } catch (err: any) {
      console.error(err);
      // Display backend error message to user
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-4xl mx-auto">
          <IonLoading isOpen={loading} message="Creating your trip..." />

          {/* Header Section */}
          <div className="mb-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
              <Bus className="w-4 h-4" />
              <span>New Journey</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Create Trip
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Set up your route, schedule stops, and plan your journey
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <RouteIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Trip Details
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Configure your route and schedule
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Route Selection Card */}
         <div className="space-y-3">
  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
    Select Route
  </label>
  <div className="relative">
    <select
      value={newTrip.route_id}
      onChange={(e) => {
        const route = routes.find((r) => r.route_id === e.target.value);
        setNewTrip({
          ...newTrip,
          route_id: e.target.value,
          route_name: route?.name || "",
          stop_times: {},
        });
        setSelectedRoute(route);
      }}
      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
               focus:border-emerald-500 dark:focus:border-emerald-400 
               focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20
               transition-all duration-200 appearance-none cursor-pointer
               hover:border-gray-300 dark:hover:border-gray-600"
      style={{
        color: '#ffffff',
        backgroundColor: '#111827',
      }}
    >
      <option value="" disabled style={{ color: '#9ca3af', backgroundColor: '#111827' }}>
        Choose a route
      </option>
      {routes.map((r) => (
        <option 
          key={r.route_id} 
          value={r.route_id}
          style={{
            backgroundColor: '#1f2937',
            color: '#ffffff',
          }}
        >
          {r.name}
        </option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
</div>
              {/* Date & Time Section */}
             <div className="grid md:grid-cols-2 gap-4">
  <div className="space-y-3">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span>Planned Start</span>
      </div>
    </label>
    <input
      type="datetime-local"
      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
               bg-white dark:bg-gray-900 
               focus:border-emerald-500 dark:focus:border-emerald-400 
               focus:ring-2 focus:ring-emerald-500/20
               transition-all duration-200"
      value={newTrip.planned_start_at}
      onChange={(e) => setNewTrip({ ...newTrip, planned_start_at: e.target.value })}
      style={{
        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
        backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
        colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '2px solid',
        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#10b981';
        e.currentTarget.style.outline = 'none';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  </div>

  <div className="space-y-3">
    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        <span>Planned End</span>
      </div>
    </label>
    <input
      type="datetime-local"
      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
               bg-white dark:bg-gray-900 
               focus:border-emerald-500 dark:focus:border-emerald-400 
               focus:ring-2 focus:ring-emerald-500/20
               transition-all duration-200"
      value={newTrip.planned_end_at}
      onChange={(e) => setNewTrip({ ...newTrip, planned_end_at: e.target.value })}
      style={{
        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
        backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
        colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        width: '100%',
        padding: '12px 16px',
        borderRadius: '12px',
        border: '2px solid',
        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = '#10b981';
        e.currentTarget.style.outline = 'none';
        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.2)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
        e.currentTarget.style.boxShadow = 'none';
      }}
    />
  </div>
</div>

{/* Add this script to handle calendar icon color in dark mode */}
<script dangerouslySetInnerHTML={{
  __html: `
    function updateDateTimeStyles() {
      const isDark = document.documentElement.classList.contains('dark');
      const inputs = document.querySelectorAll('input[type="datetime-local"]');
      inputs.forEach(input => {
        if (isDark) {
          input.style.color = '#ffffff';
          input.style.backgroundColor = '#111827';
          input.style.colorScheme = 'dark';
          // Style calendar picker icon
          const picker = input.querySelector('::-webkit-calendar-picker-indicator');
          if (picker) {
            picker.style.filter = 'invert(1)';
          }
        } else {
          input.style.color = '#1f2937';
          input.style.backgroundColor = '#ffffff';
          input.style.colorScheme = 'light';
        }
      });
    }
    
    // Run on page load and when dark mode changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          updateDateTimeStyles();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    updateDateTimeStyles();
  `
}} />
              {/* Stops Section - Without time inputs */}
              {selectedRoute?.stops?.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                        Route Stops
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedRoute.stops.length} stops
                    </span>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedRoute.stops.map((stop: any, index: number) => (
                      <div
                        key={index}
                        className="group relative flex items-center gap-4 p-3 rounded-xl 
                                 bg-gray-50 dark:bg-gray-900/50 
                                 border border-gray-200 dark:border-gray-700
                                 hover:border-emerald-300 dark:hover:border-emerald-500
                                 hover:shadow-md transition-all duration-200"
                      >
                        {/* Stop Number Badge */}
                        <div className="shrink-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 
                                        text-emerald-700 dark:text-emerald-400 
                                        flex items-center justify-center font-semibold text-sm">
                            {index + 1}
                          </div>
                        </div>

                        {/* Stop Details */}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stop.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Stop {index + 1} of {selectedRoute.stops.length}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Journey Summary */}
                  <div className="mt-4 p-4 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 
                                dark:from-emerald-900/20 dark:to-teal-900/20 
                                border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3">
                      <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Journey Summary
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {selectedRoute.stops.length} stops along this route
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Distance</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedRoute.stops.length * 2.5} km
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Map Section */}
              {selectedRoute?.stops?.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Route Map Preview
                  </label>
                  <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
                    <div style={{ height: 280 }}>
                      <MapContainer 
                        center={[22.57, 88.36]} 
                        zoom={12} 
                        style={{ height: "100%", width: "100%" }}
                        className="z-0"
                      >
                        <TileLayer 
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        />
                        {selectedRoute.stops.map((stop: any, i: number) => (
                          <Marker 
                            key={i} 
                            position={[22.57 + i * 0.01, 88.36 + i * 0.01]}
                          >
                            <Popup>
                              <div className="text-sm font-medium">{stop.name}</div>
                              <div className="text-xs text-gray-500">Stop {i + 1}</div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>
                  </div>
                </div>
              )}

          {/* Action Buttons */}
<div className="flex flex-row gap-3 pt-4">
  <button
    onClick={handleCreateTrip}
    style={{
      flex: 1,
      height: '48px',
      background: 'linear-gradient(to right, rgb(5 150 105), rgb(4 120 87))',
      color: 'white',
      fontWeight: '600',
      borderRadius: '12px',
      boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      padding: '0 24px'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'linear-gradient(to right, rgb(4 120 87), rgb(6 95 70))';
      e.currentTarget.style.transform = 'scale(1.02)';
      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(16, 185, 129, 0.35)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'linear-gradient(to right, rgb(5 150 105), rgb(4 120 87))';
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(16, 185, 129, 0.25)';
    }}
  >
    <Plus className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
    Create Trip
  </button>
  
  <button
    onClick={() => {
      setNewTrip({
        route_id: "",
        route_name: "",
        planned_start_at: "",
        planned_end_at: "",
        stop_times: {},
      });
      setSelectedRoute(null);
    }}
    style={{
      flex: 1,
      height: '48px',
      background: '#f3f4f6',
      color: '#374151',
      fontWeight: '600',
      borderRadius: '12px',
      border: '1px solid #d1d5db',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '0 24px'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#e5e7eb';
      e.currentTarget.style.transform = 'scale(1.02)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#f3f4f6';
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    <X className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
    Cancel
  </button>

              </div>
            </div>
          </div>
        </div>
      </IonContent>

      <style>{`
        /* Custom scrollbar for dark mode */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(243 244 246);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(156 163 175);
          border-radius: 10px;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(31 41 55);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(75 85 99);
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(107 114 128);
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
        
        /* Fix for Leaflet marker icons */
        .leaflet-default-icon-path {
          background-image: url(https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png);
        }
      `}</style>
    </IonPage>
  );
};

export default CreateTripPage;