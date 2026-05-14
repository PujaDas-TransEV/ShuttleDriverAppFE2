// import React, { useState, useEffect } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import { Preferences } from '@capacitor/preferences'; // Add this import
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import NavbarSidebar from "./Navbar";
// import { useHistory } from "react-router-dom";
// import { 
//   Bus, 
//   Calendar, 
//   Clock, 
//   MapPin, 
//   Route as RouteIcon, 
//   Plus, 
//   X,
//   Navigation,
//   AlertCircle
// } from 'lucide-react';
// import { ExclamationTriangleIcon, XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// // Fix for Leaflet marker icons in React
// import L from 'leaflet';
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// let DefaultIcon = L.icon({
//   iconUrl: icon,
//   shadowUrl: iconShadow,
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// L.Marker.prototype.options.icon = DefaultIcon;

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

// interface Stop {
//   stop_id: string;
//   name: string;
//   sequence_no: number;
//   assume_time_diff_minutes: number | null;
//   boarding_allowed: boolean;
//   deboarding_allowed: boolean;
//   estimated_arrival?: string;
//   cumulative_minutes?: number;
// }

// interface Route {
//   route_id: string;
//   name: string;
//   code: string;
//   stops: Stop[];
// }

// const CreateTripPage = () => {
//   const [token, setToken] = useState<string | null>(null);
//   const history = useHistory();

//   const [routes, setRoutes] = useState<Route[]>([]);
//   const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [timeError, setTimeError] = useState<string>("");
//   const [errorMessage, setErrorMessage] = useState<string>("");
//   const [showErrorPopup, setShowErrorPopup] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);

//   const [newTrip, setNewTrip] = useState({
//     route_id: "",
//     route_name: "",
//     planned_start_at: "",
//     planned_end_at: "",
//     stop_times: {} as Record<string, string>,
//   });

//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//       if (!accessToken) {
//         showErrorModal("Authentication Error", "Please login again", false);
//       }
//     };
//     loadToken();
//   }, []);

//   // Fetch routes when token is available
//   useEffect(() => {
//     if (token) {
//       fetchRoutes();
//     }
//   }, [token]);

//   // Show error modal
//   const showErrorModal = (title: string, message: string, success: boolean = false) => {
//     setIsSuccess(success);
//     setErrorMessage(success ? message : `${title}: ${message}`);
//     setShowErrorPopup(true);
//     setTimeout(() => setShowErrorPopup(false), 5000);
//   };

//   // Format time with AM/PM
//   const formatTimeWithAmPm = (date: Date) => {
//     return date.toLocaleTimeString('en-US', { 
//       hour: 'numeric', 
//       minute: '2-digit',
//       hour12: true 
//     });
//   };

//   // Convert local time to UTC ISO string
//   const convertToUTC = (localDateTime: string) => {
//     if (!localDateTime) return "";
//     const date = new Date(localDateTime);
//     return date.toISOString();
//   };

//   // Fetch routes
//   const fetchRoutes = async () => {
//     if (!token) {
//       showErrorModal("Authentication Error", "Please login again", false);
//       return;
//     }
    
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/routes`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
      
//       if (!res.ok) {
//         let errorMsg = '';
//         if (data.detail?.message) {
//           errorMsg = data.detail.message;
//         } else if (data.detail?.error) {
//           errorMsg = data.detail.error;
//         } else if (typeof data.detail === 'string') {
//           errorMsg = data.detail;
//         } else if (data.message) {
//           errorMsg = data.message;
//         } else {
//           errorMsg = 'Failed to load routes';
//         }
//         showErrorModal("Route Fetch Failed", errorMsg, false);
//         return;
//       }
      
//       setRoutes(data);
//     } catch (err: any) {
//       console.error(err);
//       showErrorModal("Network Error", err.message || 'Failed to load routes', false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate estimated arrival times
//   const calculateArrivalTimes = (startDateTime: string, stops: Stop[]): Stop[] => {
//     if (!startDateTime || !stops || stops.length === 0) return stops;
    
//     const startDate = new Date(startDateTime);
//     let cumulativeMinutes = 0;
    
//     return stops.map((stop) => {
//       const timeDiff = stop.assume_time_diff_minutes || 0;
//       cumulativeMinutes += timeDiff;
//       const arrivalDate = new Date(startDate.getTime() + cumulativeMinutes * 60 * 1000);
      
//       return {
//         ...stop,
//         cumulative_minutes: cumulativeMinutes,
//         estimated_arrival: formatTimeWithAmPm(arrivalDate),
//       };
//     });
//   };

//   // Calculate total trip duration
//   const calculateTotalDuration = (stops: Stop[]): { totalMinutes: number; hours: number; minutes: number } => {
//     if (!stops || stops.length === 0) return { totalMinutes: 0, hours: 0, minutes: 0 };
//     const totalMinutes = stops.reduce((total, stop) => total + (stop.assume_time_diff_minutes || 0), 0);
//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;
//     return { totalMinutes, hours, minutes };
//   };

//   // Calculate estimated end time
//   const calculateEndTime = (startDateTime: string, stops: Stop[]): string => {
//     if (!startDateTime || !stops || stops.length === 0) return "";
//     const startDate = new Date(startDateTime);
//     const totalMinutes = stops.reduce((total, stop) => total + (stop.assume_time_diff_minutes || 0), 0);
//     const endDate = new Date(startDate.getTime() + totalMinutes * 60 * 1000);
    
//     // Format as YYYY-MM-DDThh:mm for datetime-local input
//     const year = endDate.getFullYear();
//     const month = String(endDate.getMonth() + 1).padStart(2, '0');
//     const day = String(endDate.getDate()).padStart(2, '0');
//     const hours = String(endDate.getHours()).padStart(2, '0');
//     const minutes = String(endDate.getMinutes()).padStart(2, '0');
    
//     return `${year}-${month}-${day}T${hours}:${minutes}`;
//   };

//   // Get formatted end time for display
//   const getFormattedEndTime = (startDateTime: string, stops: Stop[]): string => {
//     if (!startDateTime || !stops || stops.length === 0) return "";
//     const startDate = new Date(startDateTime);
//     const totalMinutes = stops.reduce((total, stop) => total + (stop.assume_time_diff_minutes || 0), 0);
//     const endDate = new Date(startDate.getTime() + totalMinutes * 60 * 1000);
//     return formatTimeWithAmPm(endDate);
//   };

//   // Handle route selection
//   const handleRouteSelect = (routeId: string) => {
//     const route = routes.find((r) => r.route_id === routeId);
//     if (route) {
//       setSelectedRoute(route);
//       setNewTrip({
//         ...newTrip,
//         route_id: routeId,
//         route_name: route.name,
//         planned_start_at: "",
//         planned_end_at: "",
//         stop_times: {},
//       });
//       setTimeError("");
//     }
//   };

//   // Handle start time change - automatically set calculated end time
//   const handleStartTimeChange = (startTime: string) => {
//     setNewTrip({ ...newTrip, planned_start_at: startTime });
    
//     if (selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0 && startTime) {
//       const calculatedEnd = calculateEndTime(startTime, selectedRoute.stops);
//       setNewTrip(prev => ({ ...prev, planned_end_at: calculatedEnd }));
//       setTimeError("");
//     }
//   };

//   // Handle end time change - driver can modify
//   const handleEndTimeChange = (endTime: string) => {
//     setNewTrip({ ...newTrip, planned_end_at: endTime });
    
//     if (selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0 && newTrip.planned_start_at) {
//       const calculatedEnd = calculateEndTime(newTrip.planned_start_at, selectedRoute.stops);
      
//       const selected = new Date(endTime);
//       const calculated = new Date(calculatedEnd);
      
//       const timeDiff = Math.abs(selected.getTime() - calculated.getTime());
//       const fiveMinutesInMs = 5 * 60 * 1000;
      
//       if (timeDiff > fiveMinutesInMs && selected < calculated) {
//         setTimeError(`⚠️ End time (${formatTimeWithAmPm(selected)}) is before calculated end time (${formatTimeWithAmPm(calculated)}). This may cause scheduling issues.`);
//       } else if (selected > calculated) {
//         const extraTime = Math.floor((selected.getTime() - calculated.getTime()) / (60 * 1000));
//         const extraHours = Math.floor(extraTime / 60);
//         const extraMinutes = extraTime % 60;
//         setTimeError(`ℹ️ You have added ${extraHours > 0 ? `${extraHours}h ` : ''}${extraMinutes > 0 ? `${extraMinutes}m ` : ''}buffer time to the trip. You can still create the trip.`);
//       } else {
//         setTimeError("");
//       }
//     }
//   };

//   const handleCreateTrip = async () => {
//     if (!token) {
//       showErrorModal("Authentication Error", "Please login again", false);
//       return;
//     }

//     if (!newTrip.route_name || !newTrip.planned_start_at || !newTrip.planned_end_at) {
//       showErrorModal("Incomplete Data", "Please select route and set start/end times", false);
//       return;
//     }

//     // Only block if it's a critical error (end time before calculated time)
//     if (timeError && timeError.includes("before calculated end time")) {
//       showErrorModal("Invalid Time", timeError, false);
//       return;
//     }

//     // Show confirmation if there's a warning
//     if (timeError && timeError.includes("buffer time")) {
//       const confirmBuffer = window.confirm(
//         `${timeError}\n\nDo you want to continue with this buffer time?`
//       );
//       if (!confirmBuffer) {
//         return;
//       }
//     }

//     setLoading(true);

//     try {
//       // Convert local times to UTC for database
//       const plannedStartUTC = convertToUTC(newTrip.planned_start_at);
//       const plannedEndUTC = convertToUTC(newTrip.planned_end_at);

//       console.log("Local Start Time:", newTrip.planned_start_at);
//       console.log("UTC Start Time:", plannedStartUTC);
//       console.log("Local End Time:", newTrip.planned_end_at);
//       console.log("UTC End Time:", plannedEndUTC);

//       const stopTimesUTC: Record<string, string> = {};
//       if (selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0 && newTrip.planned_start_at) {
//         const startDate = new Date(newTrip.planned_start_at);
//         let cumulativeMinutes = 0;
        
//         selectedRoute.stops.forEach((stop) => {
//           const timeDiff = stop.assume_time_diff_minutes || 0;
//           cumulativeMinutes += timeDiff;
//           const stopDate = new Date(startDate.getTime() + cumulativeMinutes * 60 * 1000);
//           // Convert each stop time to UTC
//           stopTimesUTC[stop.stop_id] = stopDate.toISOString();
//         });
//       }

//       const fd = new FormData();
//       fd.append("route_name", newTrip.route_name);
//       fd.append("planned_start_at", plannedStartUTC);
//       fd.append("planned_end_at", plannedEndUTC);
//       fd.append("stop_times", JSON.stringify(stopTimesUTC));

//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/create`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         let errorMsg = '';
//         if (data.detail?.message) {
//           errorMsg = data.detail.message;
//         } else if (data.detail?.error) {
//           errorMsg = data.detail.error;
//         } else if (typeof data.detail === 'string') {
//           errorMsg = data.detail;
//         } else if (data.message) {
//           errorMsg = data.message;
//         } else {
//           errorMsg = 'Failed to create trip';
//         }
//         showErrorModal("Trip Creation Failed", errorMsg, false);
//         return;
//       }

//       showErrorModal("Success", "✅ Trip Created Successfully!", true);
//       setTimeout(() => {
//         history.push(`/current-trips`);
//       }, 1500);
//     } catch (err: any) {
//       console.error(err);
//       showErrorModal("Network Error", err.message || 'Failed to create trip', false);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const totalDuration = selectedRoute && selectedRoute.stops ? calculateTotalDuration(selectedRoute.stops) : { totalMinutes: 0, hours: 0, minutes: 0 };
//   const calculatedStops = newTrip.planned_start_at && selectedRoute && selectedRoute.stops 
//     ? calculateArrivalTimes(newTrip.planned_start_at, selectedRoute.stops) 
//     : [];

//   const hasStops = selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0;
//   const formattedEndTime = newTrip.planned_start_at && selectedRoute && selectedRoute.stops
//     ? getFormattedEndTime(newTrip.planned_start_at, selectedRoute.stops)
//     : "";

//   // Show loading while getting token
//   if (token === null && loading) {
//     return (
//       <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
//         <NavbarSidebar />
//         <IonContent className="relative">
//           <div className="flex items-center justify-center h-screen">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400 mx-auto"></div>
//               <p className="mt-4 text-gray-600 dark:text-gray-400">Loading session...</p>
//             </div>
//           </div>
//         </IonContent>
//       </IonPage>
//     );
//   }

//   return (
//     <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
//       <NavbarSidebar />
      
//       <IonContent className="relative">
//         <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
//         <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-5xl mx-auto">
//           <IonLoading isOpen={loading} message="Creating your trip..." />

// {showErrorPopup && (
//   <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fadeIn">
//     <div className={`flex items-center gap-3 p-5 rounded-2xl shadow-2xl min-w-[320px] max-w-100 mx-4
//       ${isSuccess 
//         ? 'bg-green-50 dark:bg-green-900/95 border-2 border-green-200 dark:border-green-700' 
//         : 'bg-red-50 dark:bg-red-900/95 border-2 border-red-200 dark:border-red-700'}`}
//     >
//       <div className={`p-2.5 rounded-full shrink-0 ${
//         isSuccess
//           ? 'bg-green-100 dark:bg-green-800'
//           : 'bg-red-100 dark:bg-red-800'
//       }`}>
//         {isSuccess ? (
//           <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
//         ) : (
//           <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
//         )}
//       </div>
//       <div className="flex-1">
//         <p className={`text-base font-bold ${
//           isSuccess
//             ? 'text-green-800 dark:text-green-200'
//             : 'text-red-800 dark:text-red-200'
//         }`}>
//           {isSuccess ? 'Success!' : 'Error!'}
//         </p>
//         <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
//           {errorMessage.replace('Success: ', '').replace('✅ ', '')}
//         </p>
//       </div>
//       <button 
//         onClick={() => setShowErrorPopup(false)}
//         className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition shrink-0"
//       >
//         <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//       </button>
//     </div>
//   </div>
// )}
//           {/* Header Section */}
//           <div className="mb-8 text-center md:text-left">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
//               <Bus className="w-4 h-4" />
//               <span>New Journey</span>
//             </div>
//             <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-700 bg-clip-text text-transparent">
//               Create Trip
//             </h1>
//             <p className="text-gray-500 dark:text-gray-400 mt-2">
//               Set up your route, schedule stops, and plan your journey
//             </p>
//           </div>

//           {/* Main Form Card */}
//           <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
//                   <RouteIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                     Trip Details
//                   </h2>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Configure your route and schedule
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6 space-y-6">
//               {/* Route Selection */}
//               <div className="space-y-3">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Select Route
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={newTrip.route_id}
//                     onChange={(e) => handleRouteSelect(e.target.value)}
//                     className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              focus:border-emerald-500 dark:focus:border-emerald-400 
//                              focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20
//                              transition-all duration-200 appearance-none cursor-pointer
//                              hover:border-gray-300 dark:hover:border-gray-600"
//                     style={{
//                       color: '#ffffff',
//                       backgroundColor: '#111827',
//                     }}
//                   >
//                     <option value="" disabled style={{ color: '#9ca3af', backgroundColor: '#111827' }}>
//                       Choose a route
//                     </option>
//                     {routes.map((r) => (
//                       <option 
//                         key={r.route_id} 
//                         value={r.route_id}
//                         style={{
//                           backgroundColor: '#1f2937',
//                           color: '#ffffff',
//                         }}
//                       >
//                         {r.name} ({r.stops?.length || 0} stops)
//                       </option>
//                     ))}
//                   </select>
//                   <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
//                     <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   </div>
//                 </div>
//               </div>

//               {/* Date & Time Section */}
//               {selectedRoute && (
//                 <>
//                   <div className="grid md:grid-cols-2 gap-4">
//                     <div className="space-y-3">
//                       <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                         <div className="flex items-center gap-2">
//                           <Calendar className="w-4 h-4" />
//                           <span>Planned Start</span>
//                         </div>
//                       </label>
//                       <input
//                         type="datetime-local"
//                         className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
//                                  bg-white dark:bg-white-800 
//                                  text-gray-900 dark:text-white
//                                  border-gray-300 dark:border-gray-600
//                                  focus:border-emerald-500 dark:focus:border-emerald-400 
//                                  focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20
//                                  hover:border-gray-400 dark:hover:border-gray-500"
//                         value={newTrip.planned_start_at}
//                         onChange={(e) => handleStartTimeChange(e.target.value)}
//                         style={{
//                           colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
//                         }}
//                       />
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                         Select when the journey begins
//                       </p>
//                       {newTrip.planned_start_at && (
//                         <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
//                           <p className="text-xs text-gray-600 dark:text-gray-300">
//                             📅 Local time: {new Date(newTrip.planned_start_at).toLocaleString()}
//                           </p>
//                           <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
//                             🌍 UTC time (saved to database): {new Date(newTrip.planned_start_at).toISOString()}
//                           </p>
//                         </div>
//                       )}
//                     </div>

//                     <div className="space-y-3">
//                       <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                         <div className="flex items-center gap-2">
//                           <Calendar className="w-4 h-4" />
//                           <span>Planned End</span>
//                         </div>
//                       </label>
//                       <input
//                         type="datetime-local"
//                         className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
//                                  bg-white dark:bg-white-800 
//                                  text-gray-900 dark:text-white
//                                  border-gray-300 dark:border-gray-600
//                                  focus:border-emerald-500 dark:focus:border-emerald-400 
//                                  focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20
//                                  hover:border-gray-400 dark:hover:border-gray-500"
//                         value={newTrip.planned_end_at}
//                         onChange={(e) => handleEndTimeChange(e.target.value)}
//                         min={newTrip.planned_start_at}
//                         style={{
//                           colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
//                         }}
//                       />
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                         Calculated end time: {formattedEndTime || "Select start time first"}
//                       </p>
//                       {newTrip.planned_end_at && (
//                         <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
//                           <p className="text-xs text-gray-600 dark:text-gray-300">
//                             📅 Local time: {new Date(newTrip.planned_end_at).toLocaleString()}
//                           </p>
//                           <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
//                             🌍 UTC time (saved to database): {new Date(newTrip.planned_end_at).toISOString()}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Time Error/Warning Display */}
//                   {timeError && (
//                     <div className={`p-3 rounded-lg border ${
//                       timeError.includes("⚠️") 
//                         ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
//                         : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
//                     }`}>
//                       <div className="flex items-center gap-2">
//                         {timeError.includes("⚠️") ? (
//                           <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
//                         ) : (
//                           <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
//                         )}
//                         <p className={`text-sm ${
//                           timeError.includes("⚠️") 
//                             ? 'text-red-700 dark:text-red-300'
//                             : 'text-yellow-700 dark:text-yellow-300'
//                         }`}>
//                           {timeError}
//                         </p>
//                       </div>
//                     </div>
//                   )}

//                   {/* Trip Duration Info */}
//                   {totalDuration.totalMinutes > 0 && newTrip.planned_start_at && (
//                     <div className="p-4 rounded-xl bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
//                       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
//                         <div className="flex items-center gap-2">
//                           <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                           <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
//                             Trip Timeline
//                           </span>
//                         </div>
//                         <div className="flex flex-wrap items-center gap-4">
//                           <div className="text-center">
//                             <p className="text-xs text-gray-500 dark:text-gray-400">Start Time</p>
//                             <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
//                               {newTrip.planned_start_at ? formatTimeWithAmPm(new Date(newTrip.planned_start_at)) : '--:--'}
//                             </p>
//                           </div>
//                           <div className="text-center">
//                             <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
//                             <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
//                               {totalDuration.hours}h {totalDuration.minutes}m
//                             </p>
//                           </div>
//                           <div className="text-center">
//                             <p className="text-xs text-gray-500 dark:text-gray-400">End Time</p>
//                             <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
//                               {formattedEndTime || "Not calculated"}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}

//               {/* Stops Section with Time Calculations */}
//               {hasStops && (
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-2">
//                       <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
//                       <h3 className="text-md font-semibold text-gray-900 dark:text-white">
//                         Route Stops with Time Calculations
//                       </h3>
//                     </div>
//                     <span className="text-xs text-gray-500 dark:text-gray-400">
//                       {selectedRoute?.stops?.length || 0} stops
//                     </span>
//                   </div>

//                   <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
//                     {calculatedStops.map((stop, index) => {
//                       const prevCumulative = index > 0 ? calculatedStops[index - 1].cumulative_minutes || 0 : 0;
//                       const timeFromPrev = (stop.cumulative_minutes || 0) - prevCumulative;
                      
//                       return (
//                         <div
//                           key={stop.stop_id}
//                           className="group relative p-4 rounded-xl 
//                                    bg-gray-50 dark:bg-gray-900/50 
//                                    border border-gray-200 dark:border-gray-700
//                                    hover:border-emerald-300 dark:hover:border-emerald-500
//                                    hover:shadow-lg transition-all duration-200"
//                         >
//                           <div className="flex items-start gap-4">
//                             {/* Stop Number Badge */}
//                             <div className="shrink-0">
//                               <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 
//                                             text-emerald-700 dark:text-emerald-400 
//                                             flex items-center justify-center font-semibold text-sm">
//                                 {index + 1}
//                               </div>
//                             </div>

//                             {/* Stop Details */}
//                             <div className="flex-1">
//                               <p className="font-semibold text-gray-900 dark:text-white">
//                                 {stop.name}
//                               </p>
                              
//                               {/* Time Information Grid */}
//                               <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
//                                 {index > 0 && timeFromPrev > 0 && (
//                                   <div className="flex items-center gap-1.5 text-xs">
//                                     <div className="w-2 h-2 rounded-full bg-orange-500"></div>
//                                     <span className="text-gray-600 dark:text-gray-400">Travel:</span>
//                                     <span className="font-medium text-gray-900 dark:text-white">{timeFromPrev} min</span>
//                                   </div>
//                                 )}
                                
//                                 {stop.cumulative_minutes && stop.cumulative_minutes > 0 && (
//                                   <div className="flex items-center gap-1.5 text-xs">
//                                     <div className="w-2 h-2 rounded-full bg-blue-500"></div>
//                                     <span className="text-gray-600 dark:text-gray-400">From Start:</span>
//                                     <span className="font-medium text-gray-900 dark:text-white">{stop.cumulative_minutes} min</span>
//                                   </div>
//                                 )}
                                
//                                 {stop.estimated_arrival && (
//                                   <div className="flex items-center gap-1.5 text-xs">
//                                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
//                                     <span className="text-gray-600 dark:text-gray-400">Arrival:</span>
//                                     <span className="font-medium text-emerald-600 dark:text-emerald-400">{stop.estimated_arrival}</span>
//                                   </div>
//                                 )}
                                
//                                 {stop.assume_time_diff_minutes !== null && stop.assume_time_diff_minutes > 0 && (
//                                   <div className="flex items-center gap-1.5 text-xs">
//                                     <div className="w-2 h-2 rounded-full bg-purple-500"></div>
//                                     <span className="text-gray-600 dark:text-gray-400">Duration:</span>
//                                     <span className="font-medium text-gray-900 dark:text-white">{stop.assume_time_diff_minutes} min</span>
//                                   </div>
//                                 )}
//                               </div>

//                               {/* Boarding/Deboarding Info */}
//                               <div className="mt-3 flex flex-wrap gap-2">
//                                 {stop.boarding_allowed && (
//                                   <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
//                                     ✓ Boarding Allowed
//                                   </span>
//                                 )}
//                                 {stop.deboarding_allowed && (
//                                   <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
//                                     ✓ Deboarding Allowed
//                                   </span>
//                                 )}
//                               </div>
//                             </div>

//                             {/* Cumulative Time Badge */}
//                             {stop.cumulative_minutes && stop.cumulative_minutes > 0 && (
//                               <div className="shrink-0 text-right">
//                                 <div className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
//                                   <p className="text-xs text-gray-500 dark:text-gray-400">Cumulative</p>
//                                   <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
//                                     {Math.floor(stop.cumulative_minutes / 60)}h {stop.cumulative_minutes % 60}m
//                                   </p>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Journey Summary */}
//                   <div className="mt-4 p-5 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 
//                                 dark:from-emerald-900/20 dark:to-teal-900/20 
//                                 border border-emerald-200 dark:border-emerald-800">
//                     <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//                       <div className="flex items-center gap-3">
//                         <Navigation className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
//                         <div>
//                           <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                             Journey Summary
//                           </p>
//                           <p className="text-xs text-gray-600 dark:text-gray-400">
//                             {selectedRoute?.stops?.length || 0} stops • Total travel time: {totalDuration.hours}h {totalDuration.minutes}m
//                           </p>
//                         </div>
//                       </div>
//                       <div className="flex gap-6">
//                         <div className="text-center">
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Start Time</p>
//                           <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
//                             {newTrip.planned_start_at ? formatTimeWithAmPm(new Date(newTrip.planned_start_at)) : 'Not set'}
//                           </p>
//                         </div>
//                         <div className="text-center">
//                           <p className="text-xs text-gray-500 dark:text-gray-400">End Time</p>
//                           <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
//                             {formattedEndTime || 'Not set'}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Map Section */}
//               {hasStops && (
//                 <div className="space-y-3">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Route Map Preview
//                   </label>
//                   <div className="rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg">
//                     <div style={{ height: 280 }}>
//                       <MapContainer 
//                         center={[22.57, 88.36]} 
//                         zoom={12} 
//                         style={{ height: "100%", width: "100%" }}
//                         className="z-0"
//                       >
//                         <TileLayer 
//                           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
//                         />
//                         {selectedRoute && selectedRoute.stops && selectedRoute.stops.map((stop: Stop, i: number) => (
//                           <Marker 
//                             key={stop.stop_id || i} 
//                             position={[22.57 + i * 0.01, 88.36 + i * 0.01]}
//                           >
//                             <Popup>
//                               <div className="text-sm font-medium">{stop.name}</div>
//                               <div className="text-xs text-gray-500">Stop {i + 1}</div>
//                               {calculatedStops && calculatedStops[i] && calculatedStops[i]?.estimated_arrival && (
//                                 <div className="text-xs text-emerald-600 mt-1">
//                                   Est. Arrival: {calculatedStops[i].estimated_arrival}
//                                 </div>
//                               )}
//                             </Popup>
//                           </Marker>
//                         ))}
//                       </MapContainer>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex flex-row gap-3 pt-4">
//                 <button
//                   onClick={handleCreateTrip}
//                   disabled={!newTrip.planned_start_at || !newTrip.planned_end_at}
//                   className={`flex-1 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200
//                     ${(newTrip.planned_start_at && newTrip.planned_end_at)
//                       ? 'bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:scale-102'
//                       : 'bg-gray-400 cursor-not-allowed text-gray-200'
//                     }`}
//                 >
//                   <Plus className="w-5 h-5" />
//                   Create Trip
//                 </button>
                
//                 <button
//                   onClick={() => {
//                     setNewTrip({
//                       route_id: "",
//                       route_name: "",
//                       planned_start_at: "",
//                       planned_end_at: "",
//                       stop_times: {},
//                     });
//                     setSelectedRoute(null);
//                     setTimeError("");
//                   }}
//                   className="flex-1 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 
//                            bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
//                            border border-gray-300 dark:border-gray-600
//                            hover:bg-gray-200 dark:hover:bg-gray-600 
//                            transform hover:scale-102 transition-all duration-200"
//                 >
//                   <X className="w-5 h-5" />
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </IonContent>

//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 6px;
//         }
        
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgb(243 244 246);
//           borderRadius: 10px;
//         }
        
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgb(156 163 175);
//           borderRadius: 10px;
//         }
        
//         .dark .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgb(31 41 55);
//         }
        
//         .dark .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgb(75 85 99);
//         }
        
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: rgb(107 114 128);
//         }
        
//         .bg-grid-gray-900\\/[0.02] {
//           background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
//                             linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
//         }
        
//         .dark .bg-grid-white\\/[0.02] {
//           background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
//                             linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
//         }
        
//         @keyframes slideDown {
//           from {
//             opacity: 0;
//             transform: translateX(-50%) translateY(-20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateX(-50%) translateY(0);
//           }
//         }
        
//         .animate-slideDown {
//           animation: slideDown 0.3s ease-out;
//         }
        
//         .hover\\:scale-102:hover {
//           transform: scale(1.02);
//         }
        
//         /* Fix for datetime input in dark mode */
//         input[type="datetime-local"] {
//           color-scheme: light;
//         }
        
//         .dark input[type="datetime-local"] {
//           color-scheme: dark;
//           color: #ffffff !important;
//           background-color: #1f2937 !important;
//         }
        
//         .dark input[type="datetime-local"]::-webkit-calendar-picker-indicator {
//           filter: invert(1);
//           cursor: pointer;
//         }
        
//         .dark input[type="datetime-local"]::-webkit-datetime-edit {
//           color: #ffffff !important;
//         }
        
//         .dark input[type="datetime-local"]::-webkit-datetime-edit-fields-wrapper {
//           color: #ffffff !important;
//         }
        
//         .dark input[type="datetime-local"]::-webkit-datetime-edit-text {
//           color: #9ca3af !important;
//         }
        
//         .dark input[type="datetime-local"]::-webkit-datetime-edit-month-field {
//           color: #ffffff !important;
//         }
        
//         .dark input[type="datetime-local"]::-webkit-datetime-edit-day-field {
//           color: #ffffff !important;
//         }
        
//         .dark input[type="datetime-local"]::-webkit-datetime-edit-year-field {
//           color: #ffffff !important;
//         }
        
//         .dark input[type="datetime-local"]::-webkit-datetime-edit-hour-field {
//           color: #ffffff !important;
//         }
        
//         .dark input[type="datetime-local"]::-webkit-datetime-edit-minute-field {
//           color: #ffffff !important;
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default CreateTripPage;



import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading, IonModal } from "@ionic/react";
import { Preferences } from '@capacitor/preferences';
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
  Navigation,
  AlertCircle,
  CreditCard,
  AlertTriangle,
  Info
} from 'lucide-react';
import { ExclamationTriangleIcon, XMarkIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

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

interface Stop {
  stop_id: string;
  name: string;
  sequence_no: number;
  assume_time_diff_minutes: number | null;
  boarding_allowed: boolean;
  deboarding_allowed: boolean;
  estimated_arrival?: string;
  cumulative_minutes?: number;
}

interface Route {
  route_id: string;
  name: string;
  code: string;
  stops: Stop[];
}

interface RfidConfig {
  allow_driver_rfid_seat_reservation: boolean;
  message?: string;
}

interface VehicleData {
  registration_number: string;
  vehicle_name: string;
  vehicle_model: string;
  color: string;
  seat_count: number;
  has_ac: boolean;
  ownership_type?: string;
  owner_name?: string;
  registration_valid_till?: string;
  enable_rfid_reservation?: boolean;
  default_rfid_reserved_seat_count?: number;
}

const CreateTripPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const history = useHistory();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeError, setTimeError] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Vehicle related states
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  // RFID related states
  const [rfidConfig, setRfidConfig] = useState<RfidConfig>({ allow_driver_rfid_seat_reservation: false });
  const [loadingRfidConfig, setLoadingRfidConfig] = useState(false);
  const [rfidConfigError, setRfidConfigError] = useState<string | null>(null);
  const [enableRfidReservation, setEnableRfidReservation] = useState(false);
  const [rfidReservedSeatCount, setRfidReservedSeatCount] = useState<number>(0);
  const [rfidSeatError, setRfidSeatError] = useState<string>("");
  
  // Modal states
  const [showRfidConfirmModal, setShowRfidConfirmModal] = useState(false);
  const [pendingRfidState, setPendingRfidState] = useState<boolean>(false);
  
  // Vehicle info modal
  const [showVehicleInfoModal, setShowVehicleInfoModal] = useState(false);

  const [newTrip, setNewTrip] = useState({
    route_id: "",
    route_name: "",
    planned_start_at: "",
    planned_end_at: "",
    stop_times: {} as Record<string, string>,
    rfid_reserved_seat_count: 0,
  });

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
      if (!accessToken) {
        showErrorModal("Authentication Error", "Please login again", false);
      }
    };
    loadToken();
  }, []);

  // Fetch routes and vehicle when token is available
  useEffect(() => {
    if (token) {
      fetchRoutes();
      fetchRfidConfig(token);
      fetchVehicle();
    }
  }, [token]);

  // Show error modal
  const showErrorModal = (title: string, message: string, success: boolean = false) => {
    setIsSuccess(success);
    setErrorMessage(success ? message : `${title}: ${message}`);
    setShowErrorPopup(true);
    setTimeout(() => setShowErrorPopup(false), 5000);
  };

  // Format time with AM/PM
  const formatTimeWithAmPm = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Convert local time to UTC ISO string
  const convertToUTC = (localDateTime: string) => {
    if (!localDateTime) return "";
    const date = new Date(localDateTime);
    return date.toISOString();
  };

  // Fetch vehicle data
  const fetchVehicle = async () => {
    if (!token) return;
    setLoadingVehicle(true);
    setVehicleError(null);
    try {
      const res = await fetch(`${API_BASE}/driver/vehicle/my-vehicle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load vehicle");
      setVehicleData(data);
      
      // Set RFID data from vehicle registration
      const vehicleRfidEnabled = data.enable_rfid_reservation || false;
      const vehicleRfidSeatCount = data.default_rfid_reserved_seat_count || 0;
      
      setEnableRfidReservation(vehicleRfidEnabled);
      setRfidReservedSeatCount(vehicleRfidSeatCount);
      
      if (vehicleRfidEnabled && vehicleRfidSeatCount > 0) {
        setNewTrip(prev => ({
          ...prev,
          rfid_reserved_seat_count: vehicleRfidSeatCount
        }));
      }
      
      console.log("✅ Vehicle data loaded:", {
        seat_count: data.seat_count,
        rfid_enabled: vehicleRfidEnabled,
        rfid_seats: vehicleRfidSeatCount
      });
      
    } catch (err: any) {
      console.error("❌ Error fetching vehicle:", err);
      setVehicleError(err.message || "Error fetching vehicle");
      showErrorModal("Vehicle Error", err.message || "Failed to load vehicle data", false);
    } finally {
      setLoadingVehicle(false);
    }
  };

  // Fetch RFID configuration
  const fetchRfidConfig = async (accessToken: string) => {
    setLoadingRfidConfig(true);
    setRfidConfigError(null);
    
    try {
      console.log("📡 Fetching RFID configuration...");
      const response = await fetch(`${API_BASE}/driver/rfid/allow-seat-reservation`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RFID config: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ RFID Configuration received:", data);
      
      setRfidConfig({
        allow_driver_rfid_seat_reservation: data.allow_driver_rfid_seat_reservation || false,
        message: data.message
      });
      
    } catch (error) {
      console.error("❌ Error fetching RFID config:", error);
      setRfidConfigError(error instanceof Error ? error.message : "Failed to load RFID configuration");
      setRfidConfig({ allow_driver_rfid_seat_reservation: false, message: "RFID feature unavailable" });
    } finally {
      setLoadingRfidConfig(false);
    }
  };

  // Fetch routes
  const fetchRoutes = async () => {
    if (!token) {
      showErrorModal("Authentication Error", "Please login again", false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/routes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (!res.ok) {
        let errorMsg = '';
        if (data.detail?.message) {
          errorMsg = data.detail.message;
        } else if (data.detail?.error) {
          errorMsg = data.detail.error;
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (data.message) {
          errorMsg = data.message;
        } else {
          errorMsg = 'Failed to load routes';
        }
        showErrorModal("Route Fetch Failed", errorMsg, false);
        return;
      }
      
      setRoutes(data);
    } catch (err: any) {
      console.error(err);
      showErrorModal("Network Error", err.message || 'Failed to load routes', false);
    } finally {
      setLoading(false);
    }
  };

  // Calculate estimated arrival times
  const calculateArrivalTimes = (startDateTime: string, stops: Stop[]): Stop[] => {
    if (!startDateTime || !stops || stops.length === 0) return stops;
    
    const startDate = new Date(startDateTime);
    let cumulativeMinutes = 0;
    
    return stops.map((stop) => {
      const timeDiff = stop.assume_time_diff_minutes || 0;
      cumulativeMinutes += timeDiff;
      const arrivalDate = new Date(startDate.getTime() + cumulativeMinutes * 60 * 1000);
      
      return {
        ...stop,
        cumulative_minutes: cumulativeMinutes,
        estimated_arrival: formatTimeWithAmPm(arrivalDate),
      };
    });
  };

  // Calculate total trip duration
  const calculateTotalDuration = (stops: Stop[]): { totalMinutes: number; hours: number; minutes: number } => {
    if (!stops || stops.length === 0) return { totalMinutes: 0, hours: 0, minutes: 0 };
    const totalMinutes = stops.reduce((total, stop) => total + (stop.assume_time_diff_minutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { totalMinutes, hours, minutes };
  };

  // Calculate estimated end time
  const calculateEndTime = (startDateTime: string, stops: Stop[]): string => {
    if (!startDateTime || !stops || stops.length === 0) return "";
    const startDate = new Date(startDateTime);
    const totalMinutes = stops.reduce((total, stop) => total + (stop.assume_time_diff_minutes || 0), 0);
    const endDate = new Date(startDate.getTime() + totalMinutes * 60 * 1000);
    
    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const day = String(endDate.getDate()).padStart(2, '0');
    const hours = String(endDate.getHours()).padStart(2, '0');
    const minutes = String(endDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Get formatted end time for display
  const getFormattedEndTime = (startDateTime: string, stops: Stop[]): string => {
    if (!startDateTime || !stops || stops.length === 0) return "";
    const startDate = new Date(startDateTime);
    const totalMinutes = stops.reduce((total, stop) => total + (stop.assume_time_diff_minutes || 0), 0);
    const endDate = new Date(startDate.getTime() + totalMinutes * 60 * 1000);
    return formatTimeWithAmPm(endDate);
  };

  // Handle route selection
  const handleRouteSelect = (routeId: string) => {
    const route = routes.find((r) => r.route_id === routeId);
    if (route) {
      setSelectedRoute(route);
      setNewTrip({
        ...newTrip,
        route_id: routeId,
        route_name: route.name,
        planned_start_at: "",
        planned_end_at: "",
        stop_times: {},
        rfid_reserved_seat_count: (rfidConfig.allow_driver_rfid_seat_reservation && enableRfidReservation) ? rfidReservedSeatCount : 0,
      });
      setTimeError("");
      setRfidSeatError("");
    }
  };

  // Handle start time change
  const handleStartTimeChange = (startTime: string) => {
    setNewTrip({ ...newTrip, planned_start_at: startTime });
    
    if (selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0 && startTime) {
      const calculatedEnd = calculateEndTime(startTime, selectedRoute.stops);
      setNewTrip(prev => ({ ...prev, planned_end_at: calculatedEnd }));
      setTimeError("");
    }
  };

  // Handle end time change
  const handleEndTimeChange = (endTime: string) => {
    setNewTrip({ ...newTrip, planned_end_at: endTime });
    
    if (selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0 && newTrip.planned_start_at) {
      const calculatedEnd = calculateEndTime(newTrip.planned_start_at, selectedRoute.stops);
      
      const selected = new Date(endTime);
      const calculated = new Date(calculatedEnd);
      
      const timeDiff = Math.abs(selected.getTime() - calculated.getTime());
      const fiveMinutesInMs = 5 * 60 * 1000;
      
      if (timeDiff > fiveMinutesInMs && selected < calculated) {
        setTimeError(`⚠️ End time (${formatTimeWithAmPm(selected)}) is before calculated end time (${formatTimeWithAmPm(calculated)}). This may cause scheduling issues.`);
      } else if (selected > calculated) {
        const extraTime = Math.floor((selected.getTime() - calculated.getTime()) / (60 * 1000));
        const extraHours = Math.floor(extraTime / 60);
        const extraMinutes = extraTime % 60;
        setTimeError(`ℹ️ You have added ${extraHours > 0 ? `${extraHours}h ` : ''}${extraMinutes > 0 ? `${extraMinutes}m ` : ''}buffer time to the trip. You can still create the trip.`);
      } else {
        setTimeError("");
      }
    }
  };

  // Handle RFID toggle with confirmation modal
  const handleRfidToggleClick = (enabled: boolean) => {
    if (enabled && vehicleData) {
      if (vehicleData.seat_count <= 0) {
        setRfidSeatError("⚠️ Vehicle has no seats configured. Please update vehicle settings first.");
        return;
      }
      setPendingRfidState(enabled);
      setShowRfidConfirmModal(true);
    } else if (!enabled) {
      setPendingRfidState(enabled);
      setShowRfidConfirmModal(true);
    }
  };

  // Confirm RFID toggle
  const confirmRfidToggle = () => {
    const enabled = pendingRfidState;
    
    if (enabled && vehicleData) {
      // Check if vehicle has seats
      if (vehicleData.seat_count <= 0) {
        setRfidSeatError("⚠️ Vehicle has no seats configured. Please update vehicle settings first.");
        setShowRfidConfirmModal(false);
        return;
      }
      
      setEnableRfidReservation(true);
      // Default to 1 seat when enabling, not the vehicle's configured RFID seats
      const defaultSeatCount = Math.min(1, vehicleData.seat_count);
      setRfidReservedSeatCount(defaultSeatCount);
      setNewTrip(prev => ({
        ...prev,
        rfid_reserved_seat_count: defaultSeatCount
      }));
      setRfidSeatError("");
    } else {
      setEnableRfidReservation(false);
      setNewTrip(prev => ({
        ...prev,
        rfid_reserved_seat_count: 0
      }));
    }
    
    setShowRfidConfirmModal(false);
  };

  // Handle RFID seat count change - can go up to vehicle's total seat count
  const handleRfidSeatCountChange = (count: number) => {
    const maxSeats = vehicleData?.seat_count || 0;
    
    // Validate against vehicle's total seat count
    if (count > maxSeats) {
      setRfidSeatError(`⚠️ Cannot exceed vehicle's total seat capacity (${maxSeats} seats)`);
      return;
    }
    
    if (count < 1) {
      setRfidSeatError("⚠️ Minimum 1 seat required for RFID reservation");
      return;
    }
    
    setRfidSeatError("");
    setRfidReservedSeatCount(count);
    setNewTrip(prev => ({
      ...prev,
      rfid_reserved_seat_count: count
    }));
  };

  const handleCreateTrip = async () => {
    if (!token) {
      showErrorModal("Authentication Error", "Please login again", false);
      return;
    }

    if (!newTrip.route_name || !newTrip.planned_start_at || !newTrip.planned_end_at) {
      showErrorModal("Incomplete Data", "Please select route and set start/end times", false);
      return;
    }

    // Validate RFID seat count if enabled
    if (enableRfidReservation && newTrip.rfid_reserved_seat_count <= 0) {
      showErrorModal("Invalid RFID Configuration", "Please specify at least 1 RFID reserved seat", false);
      return;
    }

    // Validate RFID seats don't exceed vehicle capacity
    if (enableRfidReservation && vehicleData && newTrip.rfid_reserved_seat_count > vehicleData.seat_count) {
      showErrorModal("Invalid Seat Count", `RFID reserved seats (${newTrip.rfid_reserved_seat_count}) exceed vehicle capacity (${vehicleData.seat_count})`, false);
      return;
    }

    // Only block if it's a critical error (end time before calculated time)
    if (timeError && timeError.includes("before calculated end time")) {
      showErrorModal("Invalid Time", timeError, false);
      return;
    }

    // Show confirmation if there's a warning
    if (timeError && timeError.includes("buffer time")) {
      const confirmBuffer = window.confirm(
        `${timeError}\n\nDo you want to continue with this buffer time?`
      );
      if (!confirmBuffer) {
        return;
      }
    }

    setLoading(true);

    try {
      const plannedStartUTC = convertToUTC(newTrip.planned_start_at);
      const plannedEndUTC = convertToUTC(newTrip.planned_end_at);

      console.log("Local Start Time:", newTrip.planned_start_at);
      console.log("UTC Start Time:", plannedStartUTC);
      console.log("Local End Time:", newTrip.planned_end_at);
      console.log("UTC End Time:", plannedEndUTC);
      console.log("RFID Reserved Seat Count:", newTrip.rfid_reserved_seat_count);

      const stopTimesUTC: Record<string, string> = {};
      if (selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0 && newTrip.planned_start_at) {
        const startDate = new Date(newTrip.planned_start_at);
        let cumulativeMinutes = 0;
        
        selectedRoute.stops.forEach((stop) => {
          const timeDiff = stop.assume_time_diff_minutes || 0;
          cumulativeMinutes += timeDiff;
          const stopDate = new Date(startDate.getTime() + cumulativeMinutes * 60 * 1000);
          stopTimesUTC[stop.stop_id] = stopDate.toISOString();
        });
      }

      const fd = new FormData();
      fd.append("route_name", newTrip.route_name);
      fd.append("planned_start_at", plannedStartUTC);
      fd.append("planned_end_at", plannedEndUTC);
      fd.append("stop_times", JSON.stringify(stopTimesUTC));
      
      if (enableRfidReservation && newTrip.rfid_reserved_seat_count > 0) {
        fd.append("rfid_reserved_seat_count", newTrip.rfid_reserved_seat_count.toString());
      }

      const res = await fetch(`${API_BASE}/driver/scheduled-trips/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMsg = '';
        if (data.detail?.message) {
          errorMsg = data.detail.message;
        } else if (data.detail?.error) {
          errorMsg = data.detail.error;
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail;
        } else if (data.message) {
          errorMsg = data.message;
        } else {
          errorMsg = 'Failed to create trip';
        }
        showErrorModal("Trip Creation Failed", errorMsg, false);
        return;
      }

      showErrorModal("Success", "✅ Trip Created Successfully!", true);
      setTimeout(() => {
        history.push(`/current-trips`);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      showErrorModal("Network Error", err.message || 'Failed to create trip', false);
    } finally {
      setLoading(false);
    }
  };

  const totalDuration = selectedRoute && selectedRoute.stops ? calculateTotalDuration(selectedRoute.stops) : { totalMinutes: 0, hours: 0, minutes: 0 };
  const calculatedStops = newTrip.planned_start_at && selectedRoute && selectedRoute.stops 
    ? calculateArrivalTimes(newTrip.planned_start_at, selectedRoute.stops) 
    : [];

  const hasStops = selectedRoute && selectedRoute.stops && selectedRoute.stops.length > 0;
  const formattedEndTime = newTrip.planned_start_at && selectedRoute && selectedRoute.stops
    ? getFormattedEndTime(newTrip.planned_start_at, selectedRoute.stops)
    : "";

  const vehicleTotalSeats = vehicleData?.seat_count || 0;
  const vehicleConfiguredRfidSeats = vehicleData?.default_rfid_reserved_seat_count || 0;

  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-5xl mx-auto">
          <IonLoading isOpen={loading} message="Creating your trip..." />

          {/* RFID Confirmation Modal */}
          <IonModal isOpen={showRfidConfirmModal} onDidDismiss={() => setShowRfidConfirmModal(false)} className="ion-modal-auto-height">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl max-w-md mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {pendingRfidState ? "Enable RFID Reservation" : "Disable RFID Reservation"}
                </h3>
              </div>
              
              <div className="mb-6">
                {pendingRfidState ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      You are about to enable RFID seat reservation for this trip.
                    </p>
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        📍 Vehicle: {vehicleData?.vehicle_name} ({vehicleData?.registration_number})
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        🪑 Total Vehicle Seats: <strong className="font-bold">{vehicleTotalSeats}</strong> seats
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        💡 Default RFID Configured: {vehicleConfiguredRfidSeats} seats
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        ✨ You can reserve <strong>1 to {vehicleTotalSeats}</strong> seats for RFID on this trip
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      You are about to disable RFID seat reservation for this trip.
                    </p>
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        ⚠️ Disabling this will remove all RFID reserved seats from this trip.
                      </p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
    onClick={confirmRfidToggle}
    className="flex-1 h-11 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all duration-200"
    style={{ minWidth: '100px', maxWidth: '150px' }}
  >
    Confirm
  </button>
  <button
    onClick={() => setShowRfidConfirmModal(false)}
    className="flex-1 h-11 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold transition-all duration-200"
    style={{ minWidth: '100px', maxWidth: '150px' }}
  >
    Cancel
  </button>
              </div>
            </div>
          </IonModal>

          {/* Vehicle Info Modal */}
          <IonModal isOpen={showVehicleInfoModal} onDidDismiss={() => setShowVehicleInfoModal(false)} className="ion-modal-auto-height">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl max-w-md mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Bus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vehicle Details</h3>
                </div>
                <button onClick={() => setShowVehicleInfoModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {vehicleData && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Registration</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{vehicleData.registration_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Vehicle Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{vehicleData.vehicle_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Model</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{vehicleData.vehicle_model}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Color</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{vehicleData.color}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Seats</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">{vehicleData.seat_count} seats</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">AC Available</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{vehicleData.has_ac ? "Yes" : "No"}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">RFID Configuration</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">RFID Enabled</p>
                        <p className={`font-semibold ${vehicleData.enable_rfid_reservation ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {vehicleData.enable_rfid_reservation ? "Yes" : "No"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Default RFID Seats</p>
                        <p className="font-semibold text-purple-600 dark:text-purple-400">{vehicleConfiguredRfidSeats} seats</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      💡 You can adjust RFID seat count for each trip from <strong>1 to {vehicleTotalSeats}</strong> seats
                    </p>
                  </div>
                </div>
              )}
            </div>
          </IonModal>

          {showErrorPopup && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fadeIn">
              <div className={`flex items-center gap-3 p-5 rounded-2xl shadow-2xl min-w-[320px] max-w-100 mx-4
                ${isSuccess 
                  ? 'bg-green-50 dark:bg-green-900/95 border-2 border-green-200 dark:border-green-700' 
                  : 'bg-red-50 dark:bg-red-900/95 border-2 border-red-200 dark:border-red-700'}`}
              >
                <div className={`p-2.5 rounded-full shrink-0 ${
                  isSuccess
                    ? 'bg-green-100 dark:bg-green-800'
                    : 'bg-red-100 dark:bg-red-800'
                }`}>
                  {isSuccess ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-base font-bold ${
                    isSuccess
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }`}>
                    {isSuccess ? 'Success!' : 'Error!'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {errorMessage.replace('Success: ', '').replace('✅ ', '')}
                  </p>
                </div>
                <button 
                  onClick={() => setShowErrorPopup(false)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition shrink-0"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          )}
          
          {/* Header Section */}
          <div className="mb-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-4">
              <Bus className="w-4 h-4" />
              <span>New Journey</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-700 bg-clip-text text-transparent">
              Create Trip
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Set up your route, schedule stops, and plan your journey
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
              <div className="flex items-center justify-between">
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
                <button
                  onClick={() => setShowVehicleInfoModal(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
                >
                  <Info className="w-4 h-4" />
                  Vehicle Info
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Route Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Select Route
                </label>
                <div className="relative">
                  <select
                    value={newTrip.route_id}
                    onChange={(e) => handleRouteSelect(e.target.value)}
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
                        {r.name} ({r.stops?.length || 0} stops)
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
             

              {/* RFID Reservation Section - Only show if allowed by config */}
              {rfidConfig.allow_driver_rfid_seat_reservation && vehicleData && vehicleTotalSeats > 0 && (
                <div className="space-y-4 p-4 rounded-xl bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          RFID Seat Reservation
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Reserve seats for RFID card holders
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={enableRfidReservation}
                        onChange={(e) => handleRfidToggleClick(e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  {enableRfidReservation && (
                    <div className="space-y-3 pl-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Number of RFID Reserved Seats for this Trip
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleRfidSeatCountChange(Math.max(1, rfidReservedSeatCount - 1))}
                            disabled={rfidReservedSeatCount <= 1}
                            className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={vehicleTotalSeats}
                            value={rfidReservedSeatCount}
                            onChange={(e) => handleRfidSeatCountChange(Math.min(Math.max(1, parseInt(e.target.value) || 1), vehicleTotalSeats))}
                            className="w-24 px-3 py-2 text-center rounded-lg border-2 border-gray-300 dark:border-gray-600 
                                     bg-white dark:bg-gray-300 text-gray-900 dark:text-white
                                     focus:border-purple-500 dark:focus:border-purple-400 
                                     focus:ring-2 focus:ring-purple-500/20 dark:focus:ring-purple-400/20"
                          />
                          <button
                            type="button"
                            onClick={() => handleRfidSeatCountChange(Math.min(rfidReservedSeatCount + 1, vehicleTotalSeats))}
                            disabled={rfidReservedSeatCount >= vehicleTotalSeats}
                            className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Seat capacity info */}
                        <div className="mt-2 flex flex-wrap gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Vehicle total: <strong className="text-gray-900 dark:text-white">{vehicleTotalSeats}</strong> seats</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Default configured: <strong className="text-purple-600 dark:text-purple-400">{vehicleConfiguredRfidSeats}</strong> seats</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">For this trip: <strong className="text-blue-600 dark:text-blue-400">{rfidReservedSeatCount}</strong> seats</span>
                          </div>
                        </div>
                        
                        {/* Info message about flexibility */}
                        <div className="mt-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                          <p className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            💡 You can reserve <strong>1 to {vehicleTotalSeats}</strong> seats for RFID on this trip, regardless of the default configuration ({vehicleConfiguredRfidSeats} seats).
                          </p>
                        </div>
                        
                        {/* Warning if trying to reserve more than available */}
                        {rfidSeatError && (
                          <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <p className="text-xs text-red-700 dark:text-red-300">{rfidSeatError}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {rfidConfig.message && (
                    <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                      ℹ️ {rfidConfig.message}
                    </div>
                  )}
                </div>
              )}

              {/* Show message if RFID is not allowed or no seats */}
              {(!rfidConfig.allow_driver_rfid_seat_reservation || vehicleTotalSeats === 0) && rfidConfig.message && (
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <InformationCircleIcon className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vehicleTotalSeats === 0 ? "No seats configured for your vehicle. Please update vehicle settings." : rfidConfig.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Date & Time Section */}
              {selectedRoute && (
                <>
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
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                                 bg-white dark:bg-gray-300 
                                 text-gray-900 dark:text-white
                                 border-gray-300 dark:border-gray-600
                                 focus:border-emerald-500 dark:focus:border-emerald-400 
                                 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20
                                 hover:border-gray-400 dark:hover:border-gray-500"
                        value={newTrip.planned_start_at}
                        onChange={(e) => handleStartTimeChange(e.target.value)}
                        style={{
                          colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
                        }}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Select when the journey begins
                      </p>
                      {newTrip.planned_start_at && (
                        <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            📅 Local time: {new Date(newTrip.planned_start_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            🌍 UTC time (saved to database): {new Date(newTrip.planned_start_at).toISOString()}
                          </p>
                        </div>
                      )}
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
                        className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                                 bg-white dark:bg-gray-300 
                                 text-gray-900 dark:text-white
                                 border-gray-300 dark:border-gray-600
                                 focus:border-emerald-500 dark:focus:border-emerald-400 
                                 focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-400/20
                                 hover:border-gray-400 dark:hover:border-gray-500"
                        value={newTrip.planned_end_at}
                        onChange={(e) => handleEndTimeChange(e.target.value)}
                        min={newTrip.planned_start_at}
                        style={{
                          colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light'
                        }}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Calculated end time: {formattedEndTime || "Select start time first"}
                      </p>
                      {newTrip.planned_end_at && (
                        <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            📅 Local time: {new Date(newTrip.planned_end_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            🌍 UTC time (saved to database): {new Date(newTrip.planned_end_at).toISOString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Time Error/Warning Display */}
                  {timeError && (
                    <div className={`p-3 rounded-lg border ${
                      timeError.includes("⚠️") 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        {timeError.includes("⚠️") ? (
                          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        )}
                        <p className={`text-sm ${
                          timeError.includes("⚠️") 
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-yellow-700 dark:text-yellow-300'
                        }`}>
                          {timeError}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Trip Duration Info */}
                  {totalDuration.totalMinutes > 0 && newTrip.planned_start_at && (
                    <div className="p-4 rounded-xl bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                            Trip Timeline
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Start Time</p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              {newTrip.planned_start_at ? formatTimeWithAmPm(new Date(newTrip.planned_start_at)) : '--:--'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {totalDuration.hours}h {totalDuration.minutes}m
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400">End Time</p>
                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              {formattedEndTime || "Not calculated"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Stops Section with Time Calculations */}
              {hasStops && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                        Route Stops with Time Calculations
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedRoute?.stops?.length || 0} stops
                    </span>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {calculatedStops.map((stop, index) => {
                      const prevCumulative = index > 0 ? calculatedStops[index - 1].cumulative_minutes || 0 : 0;
                      const timeFromPrev = (stop.cumulative_minutes || 0) - prevCumulative;
                      
                      return (
                        <div
                          key={stop.stop_id}
                          className="group relative p-4 rounded-xl 
                                   bg-gray-50 dark:bg-gray-900/50 
                                   border border-gray-200 dark:border-gray-700
                                   hover:border-emerald-300 dark:hover:border-emerald-500
                                   hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-start gap-4">
                            {/* Stop Number Badge */}
                            <div className="shrink-0">
                              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 
                                            text-emerald-700 dark:text-emerald-400 
                                            flex items-center justify-center font-semibold text-sm">
                                {index + 1}
                              </div>
                            </div>

                            {/* Stop Details */}
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {stop.name}
                              </p>
                              
                              {/* Time Information Grid */}
                              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                {index > 0 && timeFromPrev > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Travel:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{timeFromPrev} min</span>
                                  </div>
                                )}
                                
                                {stop.cumulative_minutes && stop.cumulative_minutes > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="text-gray-600 dark:text-gray-400">From Start:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{stop.cumulative_minutes} min</span>
                                  </div>
                                )}
                                
                                {stop.estimated_arrival && (
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Arrival:</span>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{stop.estimated_arrival}</span>
                                  </div>
                                )}
                                
                                {stop.assume_time_diff_minutes !== null && stop.assume_time_diff_minutes > 0 && (
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{stop.assume_time_diff_minutes} min</span>
                                  </div>
                                )}
                              </div>

                              {/* Boarding/Deboarding Info */}
                              <div className="mt-3 flex flex-wrap gap-2">
                                {stop.boarding_allowed && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                    ✓ Boarding Allowed
                                  </span>
                                )}
                                {stop.deboarding_allowed && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                    ✓ Deboarding Allowed
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Cumulative Time Badge */}
                            {stop.cumulative_minutes && stop.cumulative_minutes > 0 && (
                              <div className="shrink-0 text-right">
                                <div className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Cumulative</p>
                                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                    {Math.floor(stop.cumulative_minutes / 60)}h {stop.cumulative_minutes % 60}m
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Journey Summary */}
                  <div className="mt-4 p-5 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 
                                dark:from-emerald-900/20 dark:to-teal-900/20 
                                border border-emerald-200 dark:border-emerald-800">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Navigation className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Journey Summary
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {selectedRoute?.stops?.length || 0} stops • Total travel time: {totalDuration.hours}h {totalDuration.minutes}m
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Start Time</p>
                          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {newTrip.planned_start_at ? formatTimeWithAmPm(new Date(newTrip.planned_start_at)) : 'Not set'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400">End Time</p>
                          <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            {formattedEndTime || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Map Section */}
              {hasStops && (
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
                        {selectedRoute && selectedRoute.stops && selectedRoute.stops.map((stop: Stop, i: number) => (
                          <Marker 
                            key={stop.stop_id || i} 
                            position={[22.57 + i * 0.01, 88.36 + i * 0.01]}
                          >
                            <Popup>
                              <div className="text-sm font-medium">{stop.name}</div>
                              <div className="text-xs text-gray-500">Stop {i + 1}</div>
                              {calculatedStops && calculatedStops[i] && calculatedStops[i]?.estimated_arrival && (
                                <div className="text-xs text-emerald-600 mt-1">
                                  Est. Arrival: {calculatedStops[i].estimated_arrival}
                                </div>
                              )}
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
                  disabled={!newTrip.planned_start_at || !newTrip.planned_end_at || (enableRfidReservation && newTrip.rfid_reserved_seat_count <= 0) || (enableRfidReservation && !!rfidSeatError)}
                  className={`flex-1 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200
                    ${(newTrip.planned_start_at && newTrip.planned_end_at && (!enableRfidReservation || (newTrip.rfid_reserved_seat_count > 0 && !rfidSeatError)))
                      ? 'bg-linear-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:scale-102'
                      : 'bg-gray-400 cursor-not-allowed text-gray-200'
                    }`}
                >
                  <Plus className="w-5 h-5" />
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
                      rfid_reserved_seat_count: 0,
                    });
                    setSelectedRoute(null);
                    setTimeError("");
                    setEnableRfidReservation(vehicleData?.enable_rfid_reservation || false);
                    setRfidReservedSeatCount(vehicleData?.default_rfid_reserved_seat_count || 0);
                    setRfidSeatError("");
                  }}
                  className="flex-1 h-12 rounded-xl font-semibold flex items-center justify-center gap-2 
                           bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                           border border-gray-300 dark:border-gray-600
                           hover:bg-gray-200 dark:hover:bg-gray-600 
                           transform hover:scale-102 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </IonContent>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(243 244 246);
          borderRadius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(156 163 175);
          borderRadius: 10px;
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
        
        .bg-grid-gray-900\\/[0.02] {
          background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
        }
        
        .dark .bg-grid-white\\/[0.02] {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        input[type="datetime-local"] {
          color-scheme: light;
        }
        
        .dark input[type="datetime-local"] {
          color-scheme: dark;
          color: #ffffff !important;
          background-color: #1f2937 !important;
        }
        
        .dark input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
        
        .dark input[type="datetime-local"]::-webkit-datetime-edit {
          color: #ffffff !important;
        }
        
        .dark input[type="datetime-local"]::-webkit-datetime-edit-fields-wrapper {
          color: #ffffff !important;
        }
        
        .dark input[type="datetime-local"]::-webkit-datetime-edit-text {
          color: #9ca3af !important;
        }
        
        .dark input[type="datetime-local"]::-webkit-datetime-edit-month-field {
          color: #ffffff !important;
        }
        
        .dark input[type="datetime-local"]::-webkit-datetime-edit-day-field {
          color: #ffffff !important;
        }
        
        .dark input[type="datetime-local"]::-webkit-datetime-edit-year-field {
          color: #ffffff !important;
        }
        
        .dark input[type="datetime-local"]::-webkit-datetime-edit-hour-field {
          color: #ffffff !important;
        }
        
        .dark input[type="datetime-local"]::-webkit-datetime-edit-minute-field {
          color: #ffffff !important;
        }
        
        .ion-modal-auto-height {
          --height: auto;
          --border-radius: 1rem;
        }
      `}</style>
    </IonPage>
  );
};

export default CreateTripPage;