// import React, { useEffect, useState } from "react";
// import { IonPage, IonContent, IonLoading, IonToast } from "@ionic/react";
// import { Preferences } from '@capacitor/preferences'; // Add this import
// import NavbarSidebar from "./Navbar";
// import { 
//   FiCamera, 
//   FiCheckCircle, 
//   FiArrowRightCircle, 
//   FiX, 
//   FiAlertCircle,
//   FiMapPin,
//   FiClock,
//   FiCalendar,
//   FiTruck,
//   FiUserCheck,
//   FiNavigation,
//   FiStopCircle,
//   FiFlag,
//   FiPlay,
//   FiSquare
// } from "react-icons/fi";
// import QRScannerComponent from "../pages/ScannerComponent";

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

// interface StopWithTime {
//   stop_id: string;
//   name: string;
//   sequence: number;
//   assume_time_diff_minutes: number;
//   boarding_allowed: boolean;
//   deboarding_allowed: boolean;
//   estimated_arrival?: string;
//   cumulative_minutes?: number;
//   travel_time_from_prev: number;
//   arrival_time?: string | null;
//   departure_time?: string | null;
//   lat?: number;
//   lng?: number;
// }

// const CurrentTrip: React.FC = () => {
//   const [token, setToken] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [trip, setTrip] = useState<any>(null);
//   const [route, setRoute] = useState<any>(null);
//   const [calculatedStops, setCalculatedStops] = useState<StopWithTime[]>([]);
//   const [totalDuration, setTotalDuration] = useState({ totalMinutes: 0, hours: 0, minutes: 0 });
//   const [showScanner, setShowScanner] = useState(false);
//   const [scanResult, setScanResult] = useState<any>(null);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");
//   const [toastColor, setToastColor] = useState("success");
//   const [isDarkMode, setIsDarkMode] = useState(true);
  
//   // Beautiful Popup States
//   const [popup, setPopup] = useState<{
//     visible: boolean;
//     type: 'success' | 'error' | 'info' | 'warning';
//     title: string;
//     message: string;
//     details?: string;
//   }>({
//     visible: false,
//     type: 'success',
//     title: '',
//     message: '',
//     details: ''
//   });
  
//   // MODALS
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelReason, setCancelReason] = useState("");
//   const [cancelTripId, setCancelTripId] = useState<string | null>(null);
//   const [showEmergencyModal, setShowEmergencyModal] = useState(false);
//   const [emergencyReason, setEmergencyReason] = useState("");
//   const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);
  
//   // Character counter
//   const [cancelCharCount, setCancelCharCount] = useState(0);
//   const [emergencyCharCount, setEmergencyCharCount] = useState(0);

//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//       if (!accessToken) {
//         showPopup('error', 'Authentication Error', 'Please login again', 'Session expired');
//       }
//     };
//     loadToken();
//   }, []);

//   useEffect(() => {
//     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
//     setIsDarkMode(prefersDark);
//   }, []);

//   // Fetch trip details when token is available
//   useEffect(() => {
//     if (token) {
//       fetchTripDetails();
//     }
//   }, [token]);

//   // Show beautiful popup
//   const showPopup = (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string, details?: string) => {
//     setPopup({
//       visible: true,
//       type,
//       title,
//       message,
//       details
//     });
//     setTimeout(() => {
//       setPopup(prev => ({ ...prev, visible: false }));
//     }, 5000);
//   };

//   // Get current location
//   const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation not supported"));
//       } else {
//         navigator.geolocation.getCurrentPosition(
//           (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
//           (err) => reject(err),
//           { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//       }
//     });
//   };

//   // Format time with AM/PM
//   const formatTimeWithAmPm = (date: Date) => {
//     return date.toLocaleTimeString('en-US', { 
//       hour: 'numeric', 
//       minute: '2-digit',
//       hour12: true 
//     });
//   };

//   const formatDateWithAmPm = (dateString: string) => {
//     if (!dateString) return "-";
//     const date = new Date(dateString);
//     return formatTimeWithAmPm(date);
//   };

//   // Calculate cumulative times based on assume_time_diff_minutes
//   const calculateStopTimes = (stops: any[], tripStartTime: string): StopWithTime[] => {
//     if (!stops || stops.length === 0) return [];
    
//     let cumulativeMinutes = 0;
//     const startDate = new Date(tripStartTime);
    
//     return stops.map((stop, index) => {
//       const timeDiff = stop.assume_time_diff_minutes || 0;
//       cumulativeMinutes += timeDiff;
//       const travelTimeFromPrev = index === 0 ? 0 : timeDiff;
//       const arrivalDate = new Date(startDate.getTime() + cumulativeMinutes * 60 * 1000);
//       const estimatedArrival = formatTimeWithAmPm(arrivalDate);
      
//       return {
//         stop_id: stop.stop_id,
//         name: stop.name,
//         sequence: stop.sequence,
//         assume_time_diff_minutes: timeDiff,
//         boarding_allowed: stop.boarding_allowed || false,
//         deboarding_allowed: stop.deboarding_allowed || false,
//         cumulative_minutes: cumulativeMinutes,
//         travel_time_from_prev: travelTimeFromPrev,
//         estimated_arrival: estimatedArrival,
//         arrival_time: stop.arrival_time || null,
//         departure_time: stop.departure_time || null,
//         lat: stop.lat,
//         lng: stop.lng
//       };
//     });
//   };

//   // Calculate total trip duration
//   const calculateTotalDuration = (stops: StopWithTime[]) => {
//     if (!stops || stops.length === 0) return { totalMinutes: 0, hours: 0, minutes: 0 };
//     const totalMinutes = stops.reduce((total, stop) => total + (stop.assume_time_diff_minutes || 0), 0);
//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;
//     return { totalMinutes, hours, minutes };
//   };

//   const fetchTripDetails = async () => {
//     if (!token) return;
    
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/trips/current`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       console.log("Current trip response:", data);
      
//       if (data?.detail?.error === "no_active_trip") {
//         setTrip(null);
//         setRoute(null);
//         setCalculatedStops([]);
//         return;
//       }
      
//       // Handle both response structures
//       let tripData = data?.trip;
//       if (!tripData && data?.trip_id) {
//         tripData = data;
//       }
      
//       if (!tripData || !tripData.id) {
//         setTrip(null);
//         setRoute(null);
//         setCalculatedStops([]);
//         return;
//       }
      
//       const tripId = tripData.id;
//       console.log("Trip ID:", tripId, "Status:", tripData.status);
      
//       // For scheduled trips, just show basic info
//       if (tripData.status === "scheduled") {
//         setTrip(tripData);
//         setRoute(null);
//         setCalculatedStops([]);
//         setTotalDuration({ totalMinutes: 0, hours: 0, minutes: 0 });
//         setLoading(false);
//         return;
//       }
      
//       // For in_progress trips, fetch details with stops
//       try {
//         const detailsRes = await fetch(
//           `${API_BASE}/driver/trips/${tripId}/details`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
        
//         if (detailsRes.ok) {
//           const detailsData = await detailsRes.json();
//           console.log("Trip details:", detailsData);
          
//           if (detailsData) {
//             setTrip(detailsData);
//             setRoute(detailsData.route);
            
//             if (detailsData.route?.stops?.length > 0) {
//               const startTime = detailsData.planned_start_at || detailsData.planned_start;
//               const calculated = calculateStopTimes(detailsData.route.stops, startTime);
//               setCalculatedStops(calculated);
//               setTotalDuration(calculateTotalDuration(calculated));
//             }
//           }
//         } else {
//           setTrip(tripData);
//         }
//       } catch (err) {
//         console.error("Error fetching details:", err);
//         setTrip(tripData);
//       }
      
//     } catch (err: any) {
//       console.error(err);
//       showPopup('error', 'Connection Error', 'Failed to fetch trip details', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleScanSuccess = (data: any) => {
//     setScanResult(data);
//     if (data.error) {
//       showPopup('error', 'Scan Failed', data.error, 'Please try again');
//     } else {
//       showPopup('success', 'Success!', 'Passenger verified successfully!', 'Passenger has been added to the trip');
//     }
//     setTimeout(() => setScanResult(null), 5000);
//     fetchTripDetails();
//   };

//   const handleStopAction = async (stop_id: string, mode: "arrive" | "depart") => {
//     if (!trip || !token) return;
    
//     try {
//       const position = await getCurrentLocation();
      
//       const formData = new FormData();
//       formData.append("stop_id", stop_id);
//       formData.append("mode", mode);
//       formData.append("driver_lat", position.lat.toString());
//       formData.append("driver_lng", position.lng.toString());
      
//       console.log(`${mode} at stop:`, { stop_id, mode, lat: position.lat, lng: position.lng });
      
//       setLoading(true);
//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/${trip.trip_id || trip.id}/stop-action`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });
      
//       const data = await res.json();
      
//       if (!res.ok) {
//         throw new Error(data.detail || data.error || "Failed to update stop");
//       }
      
//       showPopup('success', 'Stop Updated', `${mode === "arrive" ? "Arrived at" : "Departed from"} stop successfully!`);
//       fetchTripDetails();
//     } catch (err: any) {
//       console.error("Stop action error:", err);
//       showPopup('error', 'Action Failed', err.message || 'Failed to update stop', 'Please try again');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStartTrip = async (tripId: string) => {
//     if (!tripId || !token) {
//       showPopup('error', 'Error', 'No trip ID found', 'Please refresh and try again');
//       return;
//     }
    
//     setLoading(true);
//     try {
//       showPopup('info', 'Getting Location', 'Please wait while we fetch your location...');
//       const position = await getCurrentLocation();
      
//       const formData = new FormData();
//       formData.append("lat", position.lat.toString());
//       formData.append("lng", position.lng.toString());
      
//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/start`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });
      
//       const data = await res.json();
      
//       if (!res.ok) {
//         throw new Error(data.detail || data.error || data.message || "Failed to start trip");
//       }
      
//       showPopup('success', 'Trip Started!', data.message || 'Trip started successfully!', 'Your journey has begun');
      
//       setTimeout(() => {
//         fetchTripDetails();
//       }, 1000);
      
//     } catch (err: any) {
//       console.error("Start trip error:", err);
//       showPopup('error', 'Start Failed', err.message || 'Unknown error', 'Please check your connection and try again');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEndTrip = async (tripId: string) => {
//     if (!tripId || !token) return;
//     setLoading(true);
//     try {
//       const position = await getCurrentLocation();
//       const formData = new FormData();
//       formData.append("actual_end_at", new Date().toISOString());
//       formData.append("lat", position.lat.toString());
//       formData.append("lng", position.lng.toString());
      
//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/end`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });
      
//       const data = await res.json();
      
//       if (!res.ok) throw new Error(data.detail || data.error || "Failed to end trip");
      
//       showPopup('success', 'Trip Ended!', 'Trip ended successfully!', 'Thank you for completing this journey');
//       setTimeout(() => {
//         fetchTripDetails();
//       }, 1000);
//     } catch (err: any) {
//       console.error("End trip error:", err);
//       showPopup('error', 'End Failed', err.message || 'Unknown error', 'Please try again');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openEmergencyStopModal = (tripId: string) => {
//     setEmergencyTripId(tripId);
//     setEmergencyReason("");
//     setEmergencyCharCount(0);
//     setShowEmergencyModal(true);
//   };

//   const submitEmergencyStop = async () => {
//     if (!emergencyTripId || !emergencyReason || !token) {
//       showPopup('error', 'Error', 'Please provide a reason for emergency stop!');
//       return;
//     }
    
//     if (emergencyReason.length < 5) {
//       showPopup('error', 'Invalid Reason', 'Reason must be at least 5 characters long!', `You have written ${emergencyReason.length} characters`);
//       return;
//     }
    
//     setLoading(true);
//     try {
//       const position = await getCurrentLocation();
//       const formData = new FormData();
//       formData.append("reason", emergencyReason);
//       formData.append("lat", position.lat.toString());
//       formData.append("lng", position.lng.toString());
//       formData.append("actual_end_at", new Date().toISOString());
      
//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/${emergencyTripId}/emergency-end`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });
      
//       const data = await res.json();
      
//       if (!res.ok) {
//         let errorMsg = data.detail?.message || data.detail?.error || data.error || "Emergency stop failed";
//         if (errorMsg.includes("100 characters")) {
//           errorMsg = "Reason must be at least 100 characters long!";
//         }
//         showPopup('error', 'Emergency Stop Failed', errorMsg);
//         return;
//       }
      
//       showPopup('success', 'Emergency Stop', 'Emergency stop completed successfully!', 'Safety protocols have been activated');
//       setShowEmergencyModal(false);
//       setTimeout(() => {
//         fetchTripDetails();
//       }, 1000);
//     } catch (err: any) {
//       console.error("Emergency stop error:", err);
//       showPopup('error', 'Emergency Stop Failed', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelTrip = (tripId: string) => {
//     setCancelTripId(tripId);
//     setCancelReason("");
//     setCancelCharCount(0);
//     setShowCancelModal(true);
//   };

//   const submitCancelTrip = async () => {
//     if (!cancelTripId || !cancelReason || !token) {
//       showPopup('error', 'Error', 'Please provide a reason for cancellation');
//       return;
//     }
    
//     if (cancelReason.length < 100) {
//       showPopup('error', 'Invalid Reason', 'Reason must be at least 100 characters long!', `You have written ${cancelReason.length} characters`);
//       return;
//     }
    
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("reason", cancelReason);
      
//       const res = await fetch(`${API_BASE}/driver/trips/${cancelTripId}/cancel`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });
      
//       const data = await res.json();
      
//       if (!res.ok) {
//         let errorMsg = data.detail?.message || data.detail?.error || data.error || "Cancel trip failed";
//         if (errorMsg.includes("100 characters")) {
//           errorMsg = "Reason must be at least 100 characters long!";
//         } else if (errorMsg.includes("less than 1 hour")) {
//           errorMsg = "Cannot cancel trip less than 1 hour before scheduled start time!";
//         }
//         showPopup('error', 'Cancel Failed', errorMsg);
//         return;
//       }
      
//       showPopup('success', 'Trip Cancelled', 'Trip cancelled successfully!');
//       setShowCancelModal(false);
//       setTimeout(() => {
//         fetchTripDetails();
//       }, 1000);
//     } catch (err: any) {
//       console.error("Cancel trip error:", err);
//       showPopup('error', 'Cancel Failed', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get popup styles based on type
//   const getPopupStyles = () => {
//     const baseStyle = {
//       position: 'fixed' as const,
//       top: '50%',
//       left: '50%',
//       transform: 'translate(-50%, -50%)',
//       zIndex: 1000,
//       animation: 'popupFadeIn 0.3s ease-out',
//       maxWidth: '400px',
//       width: 'calc(100% - 40px)',
//     };
    
//     switch(popup.type) {
//       case 'success':
//         return {
//           ...baseStyle,
//           background: isDarkMode 
//             ? 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)'
//             : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
//           borderLeft: '4px solid #10B981',
//           boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.4)',
//           borderRadius: '16px'
//         };
//       case 'error':
//         return {
//           ...baseStyle,
//           background: isDarkMode 
//             ? 'linear-gradient(135deg, #7F1D1D 0%, #991B1B 100%)'
//             : 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
//           borderLeft: '4px solid #EF4444',
//           boxShadow: '0 20px 40px -10px rgba(239, 68, 68, 0.4)',
//           borderRadius: '16px'
//         };
//       case 'warning':
//         return {
//           ...baseStyle,
//           background: isDarkMode 
//             ? 'linear-gradient(135deg, #78350F 0%, #92400E 100%)'
//             : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
//           borderLeft: '4px solid #F59E0B',
//           boxShadow: '0 20px 40px -10px rgba(245, 158, 11, 0.4)',
//           borderRadius: '16px'
//         };
//       case 'info':
//         return {
//           ...baseStyle,
//           background: isDarkMode 
//             ? 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)'
//             : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
//           borderLeft: '4px solid #3B82F6',
//           boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.4)',
//           borderRadius: '16px'
//         };
//       default:
//         return baseStyle;
//     }
//   };

//   const styles = getStyles(isDarkMode, trip);

//   // Show loading while getting token
//   if (token === null && loading) {
//     return (
//       <IonPage>
//         <NavbarSidebar />
//         <IonContent style={{ '--background': isDarkMode ? '#000000' : '#F8F9FA' } as any}>
//           <div style={styles.container}>
//             <div style={{ textAlign: 'center', padding: '60px 20px' }}>
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
//               <p style={{ color: isDarkMode ? '#9CA3AF' : '#6B7280', marginTop: '16px' }}>Loading session...</p>
//             </div>
//           </div>
//         </IonContent>
//       </IonPage>
//     );
//   }

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent style={{ '--background': isDarkMode ? '#000000' : '#F8F9FA' } as any}>
//         <div style={styles.container}>
          
//           {/* Beautiful Centered Popup */}
//           {popup.visible && (
//             <div style={getPopupStyles()}>
//               <div style={{
//                 padding: '20px',
//                 borderRadius: '16px',
//                 display: 'flex',
//                 alignItems: 'flex-start',
//                 gap: '14px'
//               }}>
//                 <div style={{
//                   width: '48px',
//                   height: '48px',
//                   borderRadius: '24px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   background: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
//                 }}>
//                   {popup.type === 'success' && <FiCheckCircle style={{ color: '#10B981', fontSize: '28px' }} />}
//                   {popup.type === 'error' && <FiAlertCircle style={{ color: '#EF4444', fontSize: '28px' }} />}
//                   {popup.type === 'warning' && <FiAlertCircle style={{ color: '#F59E0B', fontSize: '28px' }} />}
//                   {popup.type === 'info' && <FiNavigation style={{ color: '#3B82F6', fontSize: '28px' }} />}
//                 </div>
//                 <div style={{ flex: 1 }}>
//                   <h4 style={{
//                     fontSize: '18px',
//                     fontWeight: 'bold',
//                     margin: 0,
//                     marginBottom: '6px',
//                     color: isDarkMode ? '#FFFFFF' : (popup.type === 'success' ? '#064E3B' : popup.type === 'error' ? '#7F1D1D' : popup.type === 'warning' ? '#78350F' : '#1E3A8A')
//                   }}>
//                     {popup.title}
//                   </h4>
//                   <p style={{
//                     fontSize: '14px',
//                     margin: 0,
//                     marginBottom: popup.details ? '6px' : 0,
//                     color: isDarkMode ? '#D1D5DB' : (popup.type === 'success' ? '#065F46' : popup.type === 'error' ? '#991B1B' : popup.type === 'warning' ? '#92400E' : '#1E40AF')
//                   }}>
//                     {popup.message}
//                   </p>
//                   {popup.details && (
//                     <p style={{
//                       fontSize: '12px',
//                       margin: 0,
//                       color: isDarkMode ? '#9CA3AF' : (popup.type === 'success' ? '#047857' : popup.type === 'error' ? '#B91C1C' : popup.type === 'warning' ? '#B45309' : '#1D4ED8'),
//                       opacity: 0.8
//                     }}>
//                       {popup.details}
//                     </p>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => setPopup(prev => ({ ...prev, visible: false }))}
//                   style={{
//                     background: 'transparent',
//                     border: 'none',
//                     cursor: 'pointer',
//                     padding: '4px',
//                     borderRadius: '8px',
//                     color: isDarkMode ? '#9CA3AF' : '#6B7280'
//                   }}
//                 >
//                   <FiX size={20} />
//                 </button>
//               </div>
//             </div>
//           )}
          
//           <IonToast
//             isOpen={showToast}
//             onDidDismiss={() => setShowToast(false)}
//             message={toastMessage}
//             duration={3000}
//             color={toastColor}
//             position="top"
//           />
          
//           {loading && <IonLoading isOpen={loading} message="Processing..." />}
          
//           {!trip && !loading && (
//             <div style={styles.emptyState}>
//               <FiTruck style={styles.emptyIcon} />
//               <h2 style={styles.emptyTitle}>No Active Trip</h2>
//               <p style={styles.emptyText}>
//                 You currently have no active or scheduled trips.
//               </p>
//             </div>
//           )}
          
//           {trip && (
//             <>
//               {/* Trip Header Card */}
//               <div style={styles.tripCard}>
//                 <div style={styles.tripHeader}>
//                   <div>
//                     <div style={styles.routeBadge}>
//                       <FiMapPin style={styles.routeIcon} />
//                       <span style={styles.routeName}>
//                         {route?.name || trip.route?.name || trip.route_name || "Unnamed Route"}
//                       </span>
//                     </div>
//                     <div style={styles.statusBadge}>
//                       {trip.status === "scheduled" && <><FiClock style={styles.statusIcon} /> Scheduled</>}
//                       {trip.status === "in_progress" && <><FiNavigation style={styles.statusIcon} /> In Progress</>}
//                     </div>
//                   </div>
//                   <button onClick={() => setShowScanner(true)} style={styles.scanButton}>
//                     <FiCamera style={styles.scanIcon} />
//                     Scan QR
//                   </button>
//                 </div>
                
//                 <div style={styles.tripInfo}>
//                   <div style={styles.infoItem}>
//                     <FiCalendar style={styles.infoIcon} />
//                     <div>
//                       <p style={styles.infoLabel}>Trip ID</p>
//                       <p style={styles.infoValue}>
//                         {(trip.trip_id || trip.id)?.slice(0, 8)}...
//                       </p>
//                     </div>
//                   </div>
//                   <div style={styles.infoItem}>
//                     <FiClock style={styles.infoIcon} />
//                     <div>
//                       <p style={styles.infoLabel}>Planned Start</p>
//                       <p style={styles.infoValue}>
//                         {formatDateWithAmPm(trip.planned_start_at || trip.planned_start)}
//                       </p>
//                     </div>
//                   </div>
//                   <div style={styles.infoItem}>
//                     <FiFlag style={styles.infoIcon} />
//                     <div>
//                       <p style={styles.infoLabel}>Planned End</p>
//                       <p style={styles.infoValue}>
//                         {formatDateWithAmPm(trip.planned_end_at || trip.planned_end)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Vehicle Info Card */}
//                 {(trip.vehicle || trip.vehicle_id) && (
//                   <div style={styles.vehicleCard}>
//                     <div style={styles.vehicleInner}>
//                       <FiTruck style={{ color: '#10B981', fontSize: '20px' }} />
//                       <div>
//                         <p style={styles.vehicleLabel}>Vehicle</p>
//                         <p style={styles.vehicleValue}>
//                           {trip.vehicle?.name || trip.vehicle_name || "Vehicle Assigned"}
//                           {trip.vehicle?.registration_number && ` (${trip.vehicle.registration_number})`}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
                
//                 {/* Scheduled Trip Message */}
//                 {trip.status === "scheduled" && (
//                   <div style={styles.scheduledMessage}>
//                     <FiClock style={{ color: '#F59E0B', fontSize: '20px' }} />
//                     <div>
//                       <p style={styles.scheduledTitle}>Trip Scheduled</p>
//                       <p style={styles.scheduledText}>
//                         This trip is scheduled to start at {formatDateWithAmPm(trip.planned_start_at || trip.planned_start)}.
//                         Please wait for the start time to begin the journey.
//                       </p>
//                     </div>
//                   </div>
//                 )}
                
//                 {/* Total Trip Duration Card */}
//                 {totalDuration.totalMinutes > 0 && trip.status !== "scheduled" && (
//                   <div style={styles.totalDurationCard}>
//                     <div style={styles.totalDurationInner}>
//                       <FiClock style={{ color: '#10B981', fontSize: '20px' }} />
//                       <div>
//                         <p style={styles.totalDurationLabel}>Total Trip Duration</p>
//                         <p style={styles.totalDurationValue}>{totalDuration.hours}h {totalDuration.minutes}m</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
                
//                 {/* Actual Times Section */}
//                 {(trip.actual_start_at || trip.actual_start || trip.actual_end_at || trip.actual_end) && (
//                   <div style={styles.actualTimesSection}>
//                     <div style={styles.actualTimesHeader}>
//                       <FiNavigation style={styles.actualIcon} />
//                       <span style={styles.actualTitle}>Actual Times</span>
//                     </div>
//                     <div style={styles.actualTimesGrid}>
//                       <div style={styles.actualTimeItem}>
//                         <p style={styles.actualLabel}>Actual Start</p>
//                         <p style={styles.actualValue}>
//                           {(trip.actual_start_at || trip.actual_start) ? new Date(trip.actual_start_at || trip.actual_start).toLocaleString([], { 
//                             day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true 
//                           }) : "-"}
//                         </p>
//                       </div>
//                       <div style={styles.actualTimeItem}>
//                         <p style={styles.actualLabel}>Actual End</p>
//                         <p style={styles.actualValue}>
//                           {(trip.actual_end_at || trip.actual_end) ? new Date(trip.actual_end_at || trip.actual_end).toLocaleString([], { 
//                             day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true 
//                           }) : trip.status === "in_progress" ? "In Progress" : "-"}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
                
//                 {/* Action Buttons */}
//                 <div style={styles.actionButtons}>
//                   {trip.status === "scheduled" && (
//                     <>
//                       <button onClick={() => handleStartTrip(trip.trip_id || trip.id)} style={styles.startButton} disabled={loading}>
//                         <FiPlay style={styles.buttonIcon} />
//                         {loading ? "Starting..." : "Start Trip"}
//                       </button>
//                       <button onClick={() => handleCancelTrip(trip.trip_id || trip.id)} style={styles.cancelButton} disabled={loading}>
//                         <FiX style={styles.buttonIcon} />
//                         Cancel Trip
//                       </button>
//                     </>
//                   )}
//                   {trip.status === "in_progress" && (
//                     <>
//                       <button onClick={() => handleEndTrip(trip.trip_id || trip.id)} style={styles.endButton} disabled={loading}>
//                         <FiSquare style={styles.buttonIcon} />
//                         {loading ? "Ending..." : "End Trip"}
//                       </button>
//                       <button onClick={() => openEmergencyStopModal(trip.trip_id || trip.id)} style={styles.emergencyButton} disabled={loading}>
//                         <FiAlertCircle style={styles.buttonIcon} />
//                         Emergency
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
              
//               {/* Stops Section with Time Calculations - Only for in_progress trips */}
//               {trip.status === "in_progress" && calculatedStops.length > 0 && (
//                 <div style={styles.stopsSection}>
//                   <div style={styles.stopsHeader}>
//                     <div style={styles.stopsHeaderLeft}>
//                       <FiMapPin style={{ color: '#10B981', fontSize: '20px' }} />
//                       <h3 style={styles.stopsTitle}>Route Stops with Time Calculations</h3>
//                     </div>
//                     <span style={styles.stopCount}>{calculatedStops.length} stops</span>
//                   </div>

//                   <div style={styles.stopsList}>
//                     {calculatedStops.map((stop, index) => {
//                       const isArrived = stop.arrival_time;
//                       const isDeparted = stop.departure_time;
//                       const isFirstStop = index === 0;
//                       const isLastStop = index === calculatedStops.length - 1;
//                       const isCurrent = !isArrived && isFirstStop;
                      
//                       return (
//                         <div key={stop.stop_id} style={styles.stopCard}>
//                           <div style={styles.stopCardInner}>
//                             <div style={styles.stopNumberBadge}>
//                               <span style={{
//                                 ...styles.stopNumber,
//                                 background: isDeparted ? '#10B981' : isArrived ? '#3B82F6' : isCurrent ? '#F59E0B' : (isDarkMode ? '#1F1F1F' : '#E5E7EB'),
//                                 color: (isDeparted || isArrived || isCurrent) ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#111827')
//                               }}>{stop.sequence}</span>
//                             </div>

//                             <div style={styles.stopDetails}>
//                               <p style={styles.stopName}>{stop.name}</p>
                              
//                               <div style={styles.timeGrid}>
//                                 {/* Travel Time from Previous Stop */}
//                                 {index > 0 && stop.travel_time_from_prev > 0 && (
//                                   <div style={styles.timeBadge}>
//                                     <div style={{ ...styles.timeDot, backgroundColor: '#F59E0B' }} />
//                                     <span style={styles.timeLabel}>Travel Time:</span>
//                                     <span style={styles.timeValue}>+{stop.travel_time_from_prev} min</span>
//                                   </div>
//                                 )}
                                
//                                 {/* Cumulative Time from Start */}
//                                 {stop.cumulative_minutes && stop.cumulative_minutes > 0 && (
//                                   <div style={styles.timeBadge}>
//                                     <div style={{ ...styles.timeDot, backgroundColor: '#3B82F6' }} />
//                                     <span style={styles.timeLabel}>From Start:</span>
//                                     <span style={styles.timeValue}>
//                                       {Math.floor(stop.cumulative_minutes / 60)}h {stop.cumulative_minutes % 60}m
//                                     </span>
//                                   </div>
//                                 )}
                                
//                                 {/* Estimated Arrival Time */}
//                                 {stop.estimated_arrival && (
//                                   <div style={styles.timeBadge}>
//                                     <div style={{ ...styles.timeDot, backgroundColor: '#10B981' }} />
//                                     <span style={styles.timeLabel}>Est. Arrival:</span>
//                                     <span style={styles.timeValue}>{stop.estimated_arrival}</span>
//                                   </div>
//                                 )}
                                
//                                 {/* Stop Duration */}
//                                 {stop.assume_time_diff_minutes > 0 && (
//                                   <div style={styles.timeBadge}>
//                                     <div style={{ ...styles.timeDot, backgroundColor: '#8B5CF6' }} />
//                                     <span style={styles.timeLabel}>Stop Duration:</span>
//                                     <span style={styles.timeValue}>{stop.assume_time_diff_minutes} min</span>
//                                   </div>
//                                 )}
//                               </div>

//                               {/* Actual Arrival/Departure Times */}
//                               <div style={styles.actualStopTimes}>
//                                 {stop.arrival_time && (
//                                   <div style={styles.actualTimeBadge}>
//                                     <FiStopCircle style={{ fontSize: '10px', color: '#3B82F6' }} />
//                                     <span style={styles.actualTimeLabel}>Arrived:</span>
//                                     <span style={styles.actualTimeValue}>{formatDateWithAmPm(stop.arrival_time)}</span>
//                                   </div>
//                                 )}
//                                 {stop.departure_time && (
//                                   <div style={styles.actualTimeBadge}>
//                                     <FiCheckCircle style={{ fontSize: '10px', color: '#10B981' }} />
//                                     <span style={styles.actualTimeLabel}>Departed:</span>
//                                     <span style={styles.actualTimeValue}>{formatDateWithAmPm(stop.departure_time)}</span>
//                                   </div>
//                                 )}
//                               </div>

//                               <div style={styles.statusBadges}>
//                                 {stop.boarding_allowed && <span style={styles.boardingBadge}>✓ Boarding Allowed</span>}
//                                 {stop.deboarding_allowed && <span style={styles.deboardingBadge}>✓ Deboarding Allowed</span>}
//                                 {isArrived && !isDeparted && <span style={styles.arrivedBadge}>📍 Arrived</span>}
//                                 {isDeparted && <span style={styles.completedBadge}>✓ Completed</span>}
//                               </div>
                              
//                               {/* Action Buttons - Modified Logic */}
//                               {!isDeparted && (
//                                 <div style={styles.stopActionButtons}>
//                                   {/* Arrival button - Don't show for first stop */}
//                                   {!isFirstStop && !isArrived && (
//                                     <button onClick={() => handleStopAction(stop.stop_id, "arrive")} style={styles.arriveStopButton} disabled={loading}>
//                                       <FiCheckCircle />
//                                       Mark Arrival
//                                     </button>
//                                   )}
                                  
//                                   {/* Departure button - Don't show for last stop */}
//                                   {!isLastStop && isArrived && !isDeparted && (
//                                     <button onClick={() => handleStopAction(stop.stop_id, "depart")} style={styles.departStopButton} disabled={loading}>
//                                       <FiArrowRightCircle />
//                                       Mark Departure
//                                     </button>
//                                   )}
                                  
//                                   {/* For first stop, show Start Journey button instead */}
//                                   {isFirstStop && !isArrived && !isDeparted && (
//                                     <button onClick={() => handleStopAction(stop.stop_id, "arrive")} style={styles.startJourneyButton} disabled={loading}>
//                                       <FiPlay />
//                                       Start Journey
//                                     </button>
//                                   )}
                                  
//                                   {/* For last stop, show Complete Trip button instead of departure */}
//                                   {isLastStop && isArrived && !isDeparted && (
//                                     <button onClick={() => handleStopAction(stop.stop_id, "depart")} style={styles.completeTripButton} disabled={loading}>
//                                       <FiFlag />
//                                       Complete Trip
//                                     </button>
//                                   )}
//                                 </div>
//                               )}
//                             </div>

//                             {stop.cumulative_minutes && stop.cumulative_minutes > 0 && (
//                               <div style={styles.cumulativeBadge}>
//                                 <p style={styles.cumulativeLabel}>Cumulative</p>
//                                 <p style={styles.cumulativeValue}>
//                                   {Math.floor(stop.cumulative_minutes / 60)}h {stop.cumulative_minutes % 60}m
//                                 </p>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* Journey Summary */}
//                   <div style={styles.journeySummary}>
//                     <div style={styles.summaryInner}>
//                       <FiNavigation style={{ width: '24px', height: '24px', color: '#10B981' }} />
//                       <div style={styles.summaryContent}>
//                         <p style={styles.summaryTitle}>Journey Summary</p>
//                         <p style={styles.summaryText}>
//                           {calculatedStops.length} stops • Total travel time: {totalDuration.hours}h {totalDuration.minutes}m
//                         </p>
//                       </div>
//                       <div style={styles.summaryTimes}>
//                         <div style={styles.summaryTimeItem}>
//                           <p style={styles.summaryTimeLabel}>Start Time</p>
//                           <p style={styles.summaryTimeValue}>{formatDateWithAmPm(trip.planned_start_at || trip.planned_start)}</p>
//                         </div>
//                         <div style={styles.summaryTimeItem}>
//                           <p style={styles.summaryTimeLabel}>End Time</p>
//                           <p style={styles.summaryTimeValue}>{formatDateWithAmPm(trip.planned_end_at || trip.planned_end)}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
          
//           {/* Scan Result Toast */}
//           {scanResult && (
//             <div style={styles.scanResultCard}>
//               <div style={{
//                 ...styles.scanResultContent,
//                 background: scanResult.error ? (isDarkMode ? '#7F1D1D' : '#FEE2E2') : (isDarkMode ? '#064E3B' : '#D1FAE5')
//               }}>
//                 {scanResult.error ? <FiAlertCircle style={{ color: '#EF4444', fontSize: '24px' }} /> : <FiUserCheck style={{ color: '#10B981', fontSize: '24px' }} />}
//                 <div>
//                   <p style={styles.scanResultTitle}>{scanResult.error ? "Verification Failed" : "Passenger Verified"}</p>
//                   <p style={styles.scanResultText}>{scanResult.error ? scanResult.error : "Passenger has been successfully verified"}</p>
//                 </div>
//                 <button onClick={() => setScanResult(null)} style={styles.scanResultClose}><FiX /></button>
//               </div>
//             </div>
//           )}
          
//           {/* QR Scanner Modal */}
//           {showScanner && trip && token && (
//             <QRScannerComponent
//               onClose={() => setShowScanner(false)}
//               onScanSuccess={handleScanSuccess}
//               tripId={trip.trip_id || trip.id}
//               token={token}
//             />
//           )}
          
//           {/* Cancel Modal */}
//           {showCancelModal && (
//             <div style={styles.modalOverlay}>
//               <div style={styles.modalContent}>
//                 <div style={styles.modalHeader}>
//                   <div style={styles.modalIconCancel}><FiX style={{ color: '#FFFFFF' }} /></div>
//                   <h2 style={styles.modalTitle}>Cancel Trip</h2>
//                 </div>
//                 <textarea
//                   style={styles.textarea}
//                   rows={4}
//                   placeholder="Enter reason for cancellation (minimum 100 characters)..."
//                   value={cancelReason}
//                   onChange={(e) => { setCancelReason(e.target.value); setCancelCharCount(e.target.value.length); }}
//                 />
//                 <div style={styles.charCounter}>
//                   <span style={{ ...styles.charCountText, color: cancelCharCount >= 100 ? '#10B981' : cancelCharCount > 0 ? '#F59E0B' : '#EF4444' }}>
//                     {cancelCharCount} / 100 characters
//                   </span>
//                   {cancelCharCount >= 100 && <FiCheckCircle style={{ color: '#10B981', fontSize: '14px' }} />}
//                 </div>
//                 <div style={styles.modalButtons}>
//                   <button onClick={submitCancelTrip} disabled={!cancelReason || cancelCharCount < 100 || loading} style={{ ...styles.submitButton, opacity: (!cancelReason || cancelCharCount < 100 || loading) ? 0.5 : 1 }}>
//                     {loading ? "Processing..." : "Submit"}
//                   </button>
//                   <button onClick={() => setShowCancelModal(false)} style={styles.cancelModalButton}>Cancel</button>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           {/* Emergency Modal */}
//           {showEmergencyModal && (
//             <div style={styles.modalOverlay}>
//               <div style={styles.modalContent}>
//                 <div style={styles.modalHeader}>
//                   <div style={styles.modalIconEmergency}><FiAlertCircle style={{ color: '#FFFFFF' }} /></div>
//                   <h2 style={styles.modalTitle}>Emergency Stop</h2>
//                 </div>
//                 <textarea
//                   style={styles.textarea}
//                   rows={4}
//                   placeholder="Enter reason for emergency stop (minimum 5 characters)..."
//                   value={emergencyReason}
//                   onChange={(e) => { setEmergencyReason(e.target.value); setEmergencyCharCount(e.target.value.length); }}
//                 />
//                 <div style={styles.charCounter}>
//                   <span style={{ ...styles.charCountText, color: emergencyCharCount >= 5 ? '#10B981' : emergencyCharCount > 0 ? '#F59E0B' : '#EF4444' }}>
//                     {emergencyCharCount} / 5 characters
//                   </span>
//                   {emergencyCharCount >= 5 && <FiCheckCircle style={{ color: '#10B981', fontSize: '14px' }} />}
//                 </div>
//                 <div style={styles.modalButtons}>
//                   <button onClick={submitEmergencyStop} disabled={!emergencyReason || emergencyCharCount < 5 || loading} style={{ ...styles.emergencySubmitButton, opacity: (!emergencyReason || emergencyCharCount < 5 || loading) ? 0.5 : 1 }}>
//                     {loading ? "Processing..." : "Submit"}
//                   </button>
//                   <button onClick={() => setShowEmergencyModal(false)} style={styles.cancelModalButton}>Cancel</button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </IonContent>

//       <style>{`
//         @keyframes popupFadeIn {
//           from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
//           to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// const getStyles = (isDark: boolean, trip: any) => ({
//   container: {
//     paddingTop: '80px',
//     paddingLeft: '16px',
//     paddingRight: '16px',
//     paddingBottom: '32px',
//     maxWidth: '600px',
//     margin: '0 auto',
//     minHeight: '100vh',
//     background: isDark ? '#000000' : '#F8F9FA'
//   },
//   emptyState: {
//     textAlign: 'center' as const,
//     padding: '60px 20px',
//     background: isDark ? '#111111' : '#FFFFFF',
//     borderRadius: '24px',
//     border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`
//   },
//   emptyIcon: { fontSize: '64px', color: isDark ? '#374151' : '#9CA3AF', marginBottom: '16px' },
//   emptyTitle: { fontSize: '20px', fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827', marginBottom: '8px' },
//   emptyText: { fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280' },
//   tripCard: {
//     background: isDark ? '#111111' : '#FFFFFF',
//     borderRadius: '24px',
//     padding: '20px',
//     marginBottom: '20px',
//     border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
//     boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)'
//   },
//   tripHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap' as const, gap: '12px' },
//   routeBadge: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
//   routeIcon: { color: '#10B981', fontSize: '16px' },
//   routeName: { fontSize: '16px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
//   statusBadge: {
//     display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
//     background: trip?.status === 'scheduled' ? (isDark ? '#F59E0B20' : '#FEF3C7') : (isDark ? '#3B82F620' : '#DBEAFE'),
//     color: trip?.status === 'scheduled' ? '#F59E0B' : '#3B82F6'
//   },
//   statusIcon: { fontSize: '12px' },
//   scanButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#000000', border: 'none', borderRadius: '40px', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
//   scanIcon: { fontSize: '18px' },
//   tripInfo: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px 0', borderTop: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, borderBottom: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, marginBottom: '16px' },
//   infoItem: { display: 'flex', alignItems: 'center', gap: '10px' },
//   infoIcon: { fontSize: '18px', color: isDark ? '#6B7280' : '#9CA3AF' },
//   infoLabel: { fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF', marginBottom: '2px' },
//   infoValue: { fontSize: '13px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
//   vehicleCard: { background: isDark ? '#0A0A0A' : '#F9FAFB', borderRadius: '16px', padding: '12px', marginBottom: '16px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}` },
//   vehicleInner: { display: 'flex', alignItems: 'center', gap: '12px' },
//   vehicleLabel: { fontSize: '10px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '2px' },
//   vehicleValue: { fontSize: '13px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
//   scheduledMessage: {
//     marginTop: '16px',
//     padding: '16px',
//     background: isDark ? '#F59E0B10' : '#FEF3C7',
//     borderRadius: '16px',
//     border: `1px solid ${isDark ? '#F59E0B30' : '#FBBF24'}`,
//     display: 'flex',
//     alignItems: 'center',
//     gap: '12px'
//   },
//   scheduledTitle: {
//     fontSize: '14px',
//     fontWeight: '600',
//     color: isDark ? '#F59E0B' : '#92400E',
//     marginBottom: '4px'
//   },
//   scheduledText: {
//     fontSize: '12px',
//     color: isDark ? '#F59E0BCC' : '#B45309',
//     margin: 0,
//     lineHeight: '1.4'
//   },
//   totalDurationCard: { background: isDark ? '#0A0A0A' : '#F9FAFB', borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}` },
//   totalDurationInner: { display: 'flex', alignItems: 'center', gap: '12px' },
//   totalDurationLabel: { fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '2px' },
//   totalDurationValue: { fontSize: '18px', fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827' },
//   actualTimesSection: { marginTop: '16px', padding: '16px', background: isDark ? '#0A0A0A' : '#F9FAFB', borderRadius: '16px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, marginBottom: '16px' },
//   actualTimesHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
//   actualIcon: { fontSize: '16px', color: '#10B981' },
//   actualTitle: { fontSize: '13px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
//   actualTimesGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
//   actualTimeItem: { flex: 1 },
//   actualLabel: { fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF', marginBottom: '4px' },
//   actualValue: { fontSize: '13px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
//   actionButtons: { display: 'flex', gap: '12px' },
//   startButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#10B981', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
//   cancelButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#EF4444', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
//   endButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#EF4444', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
//   emergencyButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#F59E0B', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
//   buttonIcon: { fontSize: '16px' },
//   stopsSection: { background: isDark ? '#111111' : '#FFFFFF', borderRadius: '24px', padding: '20px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}` },
//   stopsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
//   stopsHeaderLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
//   stopsTitle: { fontSize: '18px', fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827', margin: 0 },
//   stopCount: { fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' },
//   stopsList: { display: 'flex', flexDirection: 'column' as const, gap: '16px', maxHeight: '500px', overflowY: 'auto' as const, paddingRight: '8px' },
//   stopCard: { background: isDark ? '#0A0A0A' : '#F9FAFB', borderRadius: '16px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, transition: 'all 0.2s' },
//   stopCardInner: { display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px' },
//   stopNumberBadge: { flexShrink: 0 },
//   stopNumber: { width: '44px', height: '44px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' },
//   stopDetails: { flex: 1 },
//   stopName: { fontSize: '16px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827', marginBottom: '10px' },
//   timeGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginBottom: '10px' },
//   timeBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: isDark ? '#1F1F1F' : '#FFFFFF', borderRadius: '20px', fontSize: '12px' },
//   timeDot: { width: '8px', height: '8px', borderRadius: '4px' },
//   timeLabel: { fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280' },
//   timeValue: { fontSize: '12px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
//   actualStopTimes: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginBottom: '10px' },
//   actualTimeBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: isDark ? '#1F1F1F' : '#FFFFFF', borderRadius: '20px', fontSize: '12px' },
//   actualTimeLabel: { fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280' },
//   actualTimeValue: { fontSize: '12px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
//   statusBadges: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginBottom: '10px' },
//   boardingBadge: { fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: '#10B98120', color: '#10B981', fontWeight: '500' },
//   deboardingBadge: { fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: '#3B82F620', color: '#3B82F6', fontWeight: '500' },
//   arrivedBadge: { fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: '#3B82F620', color: '#3B82F6', fontWeight: '500' },
//   completedBadge: { fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: '#10B98120', color: '#10B981', fontWeight: '500' },
//   stopActionButtons: { display: 'flex', gap: '8px' },
//   arriveStopButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#10B981', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
//   departStopButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#3B82F6', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
//   startJourneyButton: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '6px',
//     padding: '8px 16px',
//     background: '#10B981',
//     border: 'none',
//     borderRadius: '8px',
//     color: '#FFFFFF',
//     fontSize: '13px',
//     fontWeight: '500',
//     cursor: 'pointer',
//     transition: 'all 0.2s'
//   },
//   completeTripButton: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '6px',
//     padding: '8px 16px',
//     background: '#8B5CF6',
//     border: 'none',
//     borderRadius: '8px',
//     color: '#FFFFFF',
//     fontSize: '13px',
//     fontWeight: '500',
//     cursor: 'pointer',
//     transition: 'all 0.2s'
//   },
//   cumulativeBadge: { textAlign: 'right' as const, flexShrink: 0, minWidth: '80px' },
//   cumulativeLabel: { fontSize: '10px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '2px' },
//   cumulativeValue: { fontSize: '14px', fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827' },
//   journeySummary: { marginTop: '20px', padding: '16px', background: isDark ? '#0A0A0A' : '#F9FAFB', borderRadius: '16px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}` },
//   summaryInner: { display: 'flex', flexDirection: 'column' as const, gap: '12px' },
//   summaryContent: { flex: 1 },
//   summaryTitle: { fontSize: '14px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827', marginBottom: '4px' },
//   summaryText: { fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' },
//   summaryTimes: { display: 'flex', gap: '16px', justifyContent: 'flex-end' },
//   summaryTimeItem: { textAlign: 'center' as const },
//   summaryTimeLabel: { fontSize: '10px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '2px' },
//   summaryTimeValue: { fontSize: '14px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
//   scanResultCard: { position: 'fixed' as const, bottom: '20px', left: '16px', right: '16px', zIndex: 100, animation: 'slideUp 0.3s ease-out' },
//   scanResultContent: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' },
//   scanResultTitle: { fontSize: '14px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827', marginBottom: '2px' },
//   scanResultText: { fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280', margin: 0 },
//   scanResultClose: { background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 'auto', color: isDark ? '#9CA3AF' : '#6B7280' },
//   modalOverlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' },
//   modalContent: { background: isDark ? '#111111' : '#FFFFFF', borderRadius: '24px', padding: '24px', width: '90%', maxWidth: '450px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}` },
//   modalHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
//   modalIconCancel: { width: '48px', height: '48px', borderRadius: '24px', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' },
//   modalIconEmergency: { width: '48px', height: '48px', borderRadius: '24px', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' },
//   modalTitle: { fontSize: '22px', fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827', margin: 0 },
//   textarea: { width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, background: isDark ? '#0A0A0A' : '#F9FAFB', color: isDark ? '#FFFFFF' : '#111827', fontSize: '14px', resize: 'vertical' as const, marginBottom: '8px', fontFamily: 'inherit' },
//   charCounter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
//   charCountText: { fontSize: '12px', fontWeight: '500' },
//   modalButtons: { display: 'flex', gap: '12px' },
//   submitButton: { flex: 1, padding: '12px', background: '#EF4444', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
//   emergencySubmitButton: { flex: 1, padding: '12px', background: '#F59E0B', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
//   cancelModalButton: { flex: 1, padding: '12px', background: isDark ? '#1F1F1F' : '#F3F4F6', border: 'none', borderRadius: '12px', color: isDark ? '#FFFFFF' : '#111827', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
// });

// export default CurrentTrip;



import React, { useEffect, useState, useCallback, useRef } from "react";
import { IonPage, IonContent, IonLoading, IonToast } from "@ionic/react";
import { Preferences } from '@capacitor/preferences';
import NavbarSidebar from "./Navbar";
import { 
  FiCamera, 
  FiCheckCircle, 
  FiArrowRightCircle, 
  FiX, 
  FiAlertCircle,
  FiMapPin,
  FiClock,
  FiCalendar,
  FiTruck,
  FiUserCheck,
  FiNavigation,
  FiStopCircle,
  FiFlag,
  FiPlay,
  FiSquare,
  FiCompass,
  FiTarget,
  FiBell,
  FiInfo,
  FiKey,
  FiUserPlus
} from "react-icons/fi";
import QRScannerComponent from "../pages/ScannerComponent";

const API_BASE = "https://be.shuttleapp.transev.site";

const getToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'access_token' });
    return value || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

interface StopWithTime {
  stop_id: string;
  name: string;
  sequence: number;
  assume_time_diff_minutes: number;
  boarding_allowed: boolean;
  deboarding_allowed: boolean;
  estimated_arrival?: string;
  cumulative_minutes?: number;
  travel_time_from_prev: number;
  arrival_time?: string | null;
  departure_time?: string | null;
  lat?: number;
  lng?: number;
}

interface NearStopInfo {
  isNear: boolean;
  stop: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    radius_meters: number;
  } | null;
  distance_meters: number | null;
  message: string | null;
  hasNotified: boolean;
}

const CurrentTrip: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [calculatedStops, setCalculatedStops] = useState<StopWithTime[]>([]);
  const [totalDuration, setTotalDuration] = useState({ totalMinutes: 0, hours: 0, minutes: 0 });
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("success");
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  
  // Near Stop Detection State
  const [nearStopInfo, setNearStopInfo] = useState<NearStopInfo>({
    isNear: false,
    stop: null,
    distance_meters: null,
    message: null,
    hasNotified: false
  });
  const [checkingNearStop, setCheckingNearStop] = useState(false);
  const [lastCheckedLocation, setLastCheckedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastNotifiedStopIdRef = useRef<string | null>(null);
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelTripId, setCancelTripId] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);
  
  const [cancelCharCount, setCancelCharCount] = useState(0);
  const [emergencyCharCount, setEmergencyCharCount] = useState(0);

  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
    };
    loadToken();
  }, []);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (token) {
      fetchTripDetails();
    }
  }, [token]);

  useEffect(() => {
    if (trip?.status === "in_progress" && token) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    
    return () => {
      stopLocationTracking();
    };
  }, [trip?.status, token, trip?.trip_id, trip?.id]);

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  };

  const showToastNotification = (message: string, color: string = "warning") => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // OTP Verification Function
  const verifyOtp = async () => {
    const tripId = trip?.trip_id || trip?.id;
    if (!tripId || !token) {
      showToastNotification('No active trip found', "danger");
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      showToastNotification('Please enter a valid 6-digit OTP', "warning");
      return;
    }

    setVerifyingOtp(true);
    try {
      const position = await getCurrentLocation();
      
      const response = await fetch(`${API_BASE}/driver/otp/${tripId}/verify`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otp_code: otpCode,
          lat: position.lat,
          lng: position.lng
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || "OTP verification failed");
      }

      showToastNotification('✅ Passenger verified successfully!', "success");
      setShowOtpModal(false);
      setOtpCode("");
      fetchTripDetails();
      
    } catch (err: any) {
      console.error("OTP verification error:", err);
      showToastNotification(err.message || 'OTP verification failed', "danger");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const checkNearStop = async (lat: number, lng: number) => {
    const tripId = trip?.trip_id || trip?.id;
    if (!tripId || !token) return;
    
    setCheckingNearStop(true);
    try {
      const response = await fetch(
        `${API_BASE}/driver/trips/${tripId}/near-stop?lat=${lat}&lng=${lng}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      console.log("Near stop response:", data);
      
      if (response.ok && data.stop) {
        const currentStopId = data.stop.id;
        const distance = data.distance_meters || 0;
        const hasArrived = distance === 0;
        const isNewStop = lastNotifiedStopIdRef.current !== currentStopId;
        
        setNearStopInfo({
          isNear: true,
          stop: data.stop,
          distance_meters: distance,
          message: data.message || "You are near the stop",
          hasNotified: nearStopInfo.hasNotified
        });
        
        if (isNewStop && !hasArrived) {
          const distanceText = `${Math.round(distance)}m away`;
          showToastNotification(`📍 Approaching ${data.stop.name} - ${distanceText}`, "warning");
          lastNotifiedStopIdRef.current = currentStopId;
          setNearStopInfo(prev => ({ ...prev, hasNotified: true }));
        } 
        else if (hasArrived && lastNotifiedStopIdRef.current !== currentStopId) {
          showToastNotification(`✅ Arrived at ${data.stop.name}! Get ready to board/deboard passengers.`, "success");
          setNearStopInfo(prev => ({ ...prev, hasNotified: false }));
        }
      } else {
        if (nearStopInfo.isNear) {
          setNearStopInfo({
            isNear: false,
            stop: null,
            distance_meters: null,
            message: null,
            hasNotified: false
          });
        }
      }
    } catch (error) {
      console.error("Error checking near stop:", error);
    } finally {
      setCheckingNearStop(false);
    }
  };

  const startLocationTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
    
    getCurrentLocation()
      .then(({ lat, lng }) => {
        setLastCheckedLocation({ lat, lng });
        checkNearStop(lat, lng);
      })
      .catch(err => console.error("Initial location error:", err));
    
    locationIntervalRef.current = setInterval(() => {
      getCurrentLocation()
        .then(({ lat, lng }) => {
          if (lastCheckedLocation) {
            const distance = Math.sqrt(
              Math.pow(lat - lastCheckedLocation.lat, 2) + 
              Math.pow(lng - lastCheckedLocation.lng, 2)
            ) * 111000;
            if (distance < 10) return;
          }
          setLastCheckedLocation({ lat, lng });
          checkNearStop(lat, lng);
        })
        .catch(err => console.error("Location tracking error:", err));
    }, 5000);
  };

  const stopLocationTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setNearStopInfo({ isNear: false, stop: null, distance_meters: null, message: null, hasNotified: false });
    lastNotifiedStopIdRef.current = null;
  };

  const formatTimeWithAmPm = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDateWithAmPm = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return formatTimeWithAmPm(date);
  };

  const calculateStopTimes = (stops: any[], tripStartTime: string): StopWithTime[] => {
    if (!stops || stops.length === 0) return [];
    
    let cumulativeMinutes = 0;
    const startDate = new Date(tripStartTime);
    
    return stops.map((stop, index) => {
      const timeDiff = stop.assume_time_diff_minutes || 0;
      cumulativeMinutes += timeDiff;
      const travelTimeFromPrev = index === 0 ? 0 : timeDiff;
      const arrivalDate = new Date(startDate.getTime() + cumulativeMinutes * 60 * 1000);
      const estimatedArrival = formatTimeWithAmPm(arrivalDate);
      
      return {
        stop_id: stop.stop_id,
        name: stop.name,
        sequence: stop.sequence,
        assume_time_diff_minutes: timeDiff,
        boarding_allowed: stop.boarding_allowed || false,
        deboarding_allowed: stop.deboarding_allowed || false,
        cumulative_minutes: cumulativeMinutes,
        travel_time_from_prev: travelTimeFromPrev,
        estimated_arrival: estimatedArrival,
        arrival_time: stop.arrival_time || null,
        departure_time: stop.departure_time || null,
        lat: stop.lat,
        lng: stop.lng
      };
    });
  };

  const calculateTotalDuration = (stops: StopWithTime[]) => {
    if (!stops || stops.length === 0) return { totalMinutes: 0, hours: 0, minutes: 0 };
    const totalMinutes = stops.reduce((total, stop) => total + (stop.assume_time_diff_minutes || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { totalMinutes, hours, minutes };
  };

  const fetchTripDetails = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/trips/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("Current trip response:", data);
      
      if (data?.detail?.error === "no_active_trip") {
        setTrip(null);
        setRoute(null);
        setCalculatedStops([]);
        return;
      }
      
      let tripData = data?.trip;
      if (!tripData && data?.trip_id) {
        tripData = data;
      }
      
      if (!tripData || !tripData.id) {
        setTrip(null);
        setRoute(null);
        setCalculatedStops([]);
        return;
      }
      
      const tripId = tripData.id;
      console.log("Trip ID:", tripId, "Status:", tripData.status);
      
      if (tripData.status === "scheduled") {
        setTrip(tripData);
        setRoute(null);
        setCalculatedStops([]);
        setTotalDuration({ totalMinutes: 0, hours: 0, minutes: 0 });
        setLoading(false);
        return;
      }
      
      try {
        const detailsRes = await fetch(
          `${API_BASE}/driver/trips/${tripId}/details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          console.log("Trip details:", detailsData);
          
          if (detailsData) {
            setTrip(detailsData);
            setRoute(detailsData.route);
            
            if (detailsData.route?.stops?.length > 0) {
              const startTime = detailsData.planned_start_at || detailsData.planned_start;
              const calculated = calculateStopTimes(detailsData.route.stops, startTime);
              setCalculatedStops(calculated);
              setTotalDuration(calculateTotalDuration(calculated));
            }
          }
        } else {
          setTrip(tripData);
        }
      } catch (err) {
        console.error("Error fetching details:", err);
        setTrip(tripData);
      }
      
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (data: any) => {
    setScanResult(data);
    if (data.error) {
      showToastNotification(data.error, "danger");
    } else {
      showToastNotification("Passenger verified successfully!", "success");
    }
    setTimeout(() => setScanResult(null), 5000);
    fetchTripDetails();
  };

  const handleStopAction = async (stop_id: string, mode: "arrive" | "depart") => {
    if (!trip || !token) return;
    
    try {
      const position = await getCurrentLocation();
      
      const formData = new FormData();
      formData.append("stop_id", stop_id);
      formData.append("mode", mode);
      formData.append("driver_lat", position.lat.toString());
      formData.append("driver_lng", position.lng.toString());
      
      console.log(`${mode} at stop:`, { stop_id, mode, lat: position.lat, lng: position.lng });
      
      setLoading(true);
      const res = await fetch(`${API_BASE}/driver/scheduled-trips/${trip.trip_id || trip.id}/stop-action`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || data.error || "Failed to update stop");
      }
      
      showToastNotification(`${mode === "arrive" ? "Arrived at" : "Departed from"} stop successfully!`, "success");
      
      if (mode === "arrive") {
        lastNotifiedStopIdRef.current = null;
        setNearStopInfo(prev => ({ ...prev, hasNotified: false }));
      }
      
      fetchTripDetails();
    } catch (err: any) {
      console.error("Stop action error:", err);
      showToastNotification(err.message || 'Failed to update stop', "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrip = async (tripId: string) => {
    if (!tripId || !token) {
      showToastNotification('No trip ID found', "danger");
      return;
    }
    
    setLoading(true);
    try {
      const position = await getCurrentLocation();
      
      const formData = new FormData();
      formData.append("lat", position.lat.toString());
      formData.append("lng", position.lng.toString());
      
      const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || data.error || data.message || "Failed to start trip");
      }
      
      showToastNotification('Trip started successfully!', "success");
      
      setTimeout(() => {
        fetchTripDetails();
      }, 1000);
      
    } catch (err: any) {
      console.error("Start trip error:", err);
      showToastNotification(err.message || 'Unknown error', "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = async (tripId: string) => {
    if (!tripId || !token) return;
    setLoading(true);
    try {
      const position = await getCurrentLocation();
      const formData = new FormData();
      formData.append("actual_end_at", new Date().toISOString());
      formData.append("lat", position.lat.toString());
      formData.append("lng", position.lng.toString());
      
      const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || data.error || "Failed to end trip");
      
      showToastNotification('Trip ended successfully!', "success");
      setTimeout(() => {
        fetchTripDetails();
      }, 1000);
    } catch (err: any) {
      console.error("End trip error:", err);
      showToastNotification(err.message || 'Unknown error', "danger");
    } finally {
      setLoading(false);
    }
  };

  const openEmergencyStopModal = (tripId: string) => {
    setEmergencyTripId(tripId);
    setEmergencyReason("");
    setEmergencyCharCount(0);
    setShowEmergencyModal(true);
  };

  const submitEmergencyStop = async () => {
    if (!emergencyTripId || !emergencyReason || !token) {
      showToastNotification('Please provide a reason for emergency stop!', "danger");
      return;
    }
    
    if (emergencyReason.length < 5) {
      showToastNotification('Reason must be at least 5 characters long!', "danger");
      return;
    }
    
    setLoading(true);
    try {
      const position = await getCurrentLocation();
      const formData = new FormData();
      formData.append("reason", emergencyReason);
      formData.append("lat", position.lat.toString());
      formData.append("lng", position.lng.toString());
      formData.append("actual_end_at", new Date().toISOString());
      
      const res = await fetch(`${API_BASE}/driver/scheduled-trips/${emergencyTripId}/emergency-end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        let errorMsg = data.detail?.message || data.detail?.error || data.error || "Emergency stop failed";
        showToastNotification(errorMsg, "danger");
        return;
      }
      
      showToastNotification('Emergency stop completed successfully!', "success");
      setShowEmergencyModal(false);
      setTimeout(() => {
        fetchTripDetails();
      }, 1000);
    } catch (err: any) {
      console.error("Emergency stop error:", err);
      showToastNotification(err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrip = (tripId: string) => {
    setCancelTripId(tripId);
    setCancelReason("");
    setCancelCharCount(0);
    setShowCancelModal(true);
  };

  const submitCancelTrip = async () => {
    if (!cancelTripId || !cancelReason || !token) {
      showToastNotification('Please provide a reason for cancellation', "danger");
      return;
    }
    
    if (cancelReason.length < 100) {
      showToastNotification('Reason must be at least 100 characters long!', "danger");
      return;
    }
    
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("reason", cancelReason);
      
      const res = await fetch(`${API_BASE}/driver/trips/${cancelTripId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        let errorMsg = data.detail?.message || data.detail?.error || data.error || "Cancel trip failed";
        showToastNotification(errorMsg, "danger");
        return;
      }
      
      showToastNotification('Trip cancelled successfully!', "success");
      setShowCancelModal(false);
      setTimeout(() => {
        fetchTripDetails();
      }, 1000);
    } catch (err: any) {
      console.error("Cancel trip error:", err);
      showToastNotification(err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  const getDistanceText = (meters: number): string => {
    if (meters === 0) return "📍 You have arrived!";
    if (meters < 50) return `🔴 Very close - ${Math.round(meters)}m away`;
    if (meters < 100) return `🟠 Getting close - ${Math.round(meters)}m away`;
    if (meters < 200) return `🟡 Approaching - ${Math.round(meters)}m away`;
    return `⚪ ${Math.round(meters)}m away`;
  };

  const styles = getStyles(isDarkMode, trip, nearStopInfo);

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent style={{ '--background': isDarkMode ? '#000000' : '#F8F9FA' } as any}>
        <div style={styles.container}>
          
          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={4000}
            color={toastColor}
            position="top"
          />
          
          {loading && <IonLoading isOpen={loading} message="Processing..." />}
          
          {!trip && !loading && (
            <div style={styles.emptyState}>
              <FiTruck style={styles.emptyIcon} />
              <h2 style={styles.emptyTitle}>No Active Trip</h2>
              <p style={styles.emptyText}>
                You currently have no active or scheduled trips.
              </p>
            </div>
          )}
          
          {trip && (
            <>
              {/* Near Stop Detection Card */}
              {trip.status === "in_progress" && nearStopInfo.isNear && nearStopInfo.stop && (
                <div style={nearStopInfo.distance_meters === 0 ? styles.arrivedStopCard : styles.nearStopCard}>
                  <div style={styles.nearStopHeader}>
                    <div style={nearStopInfo.distance_meters === 0 ? styles.arrivedStopIcon : styles.nearStopIcon}>
                      {nearStopInfo.distance_meters === 0 ? (
                        <FiCheckCircle size={28} color="#10B981" />
                      ) : (
                        <FiTarget size={24} color="#F59E0B" />
                      )}
                    </div>
                    <div style={styles.nearStopContent}>
                      <div style={nearStopInfo.distance_meters === 0 ? styles.arrivedStopTitle : styles.nearStopTitle}>
                        {nearStopInfo.distance_meters === 0 ? (
                          <><FiCheckCircle size={12} /> Arrived at Stop</>
                        ) : (
                          <><FiBell size={14} /> Near By Stop</>
                        )}
                      </div>
                      <h3 style={nearStopInfo.distance_meters === 0 ? styles.arrivedStopName : styles.nearStopName}>
                        {nearStopInfo.stop.name}
                      </h3>
                      <p style={nearStopInfo.distance_meters === 0 ? styles.arrivedStopDistance : styles.nearStopDistance}>
                        {nearStopInfo.distance_meters !== null && getDistanceText(nearStopInfo.distance_meters)}
                      </p>
                      {nearStopInfo.distance_meters === 0 && (
                        <div style={styles.arrivalAlert}>
                          <FiCheckCircle size={16} />
                          <span>Ready to board/deboard passengers</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={styles.nearStopFooter}>
                    <div style={styles.radiusInfo}>
                      <FiCompass size={12} />
                      <span>Detection radius: {nearStopInfo.stop.radius_meters}m</span>
                    </div>
                    {checkingNearStop && (
                      <div style={styles.checkingBadge}>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        <span>Updating...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Trip Header Card */}
              <div style={styles.tripCard}>
                <div style={styles.tripHeader}>
                  <div>
                    <div style={styles.routeBadge}>
                      <FiMapPin style={styles.routeIcon} />
                      <span style={styles.routeName}>
                        {route?.name || trip.route?.name || trip.route_name || "Unnamed Route"}
                      </span>
                    </div>
                    <div style={styles.statusBadge}>
                      {trip.status === "scheduled" && <><FiClock style={styles.statusIcon} /> Scheduled</>}
                      {trip.status === "in_progress" && <><FiNavigation style={styles.statusIcon} /> In Progress</>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowOtpModal(true)} style={styles.otpButton}>
                      <FiKey style={styles.scanIcon} />
                      Enter OTP
                    </button>
                    <button onClick={() => setShowScanner(true)} style={styles.scanButton}>
                      <FiCamera style={styles.scanIcon} />
                      Scan QR
                    </button>
                  </div>
                </div>
                
                <div style={styles.tripInfo}>
                  <div style={styles.infoItem}>
                    <FiCalendar style={styles.infoIcon} />
                    <div>
                      <p style={styles.infoLabel}>Trip ID</p>
                      <p style={styles.infoValue}>
                        {(trip.trip_id || trip.id)?.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <FiClock style={styles.infoIcon} />
                    <div>
                      <p style={styles.infoLabel}>Planned Start</p>
                      <p style={styles.infoValue}>
                        {formatDateWithAmPm(trip.planned_start_at || trip.planned_start)}
                      </p>
                    </div>
                  </div>
                  <div style={styles.infoItem}>
                    <FiFlag style={styles.infoIcon} />
                    <div>
                      <p style={styles.infoLabel}>Planned End</p>
                      <p style={styles.infoValue}>
                        {formatDateWithAmPm(trip.planned_end_at || trip.planned_end)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {(trip.vehicle || trip.vehicle_id) && (
                  <div style={styles.vehicleCard}>
                    <div style={styles.vehicleInner}>
                      <FiTruck style={{ color: '#10B981', fontSize: '20px' }} />
                      <div>
                        <p style={styles.vehicleLabel}>Vehicle</p>
                        <p style={styles.vehicleValue}>
                          {trip.vehicle?.name || trip.vehicle_name || "Vehicle Assigned"}
                          {trip.vehicle?.registration_number && ` (${trip.vehicle.registration_number})`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {trip.status === "scheduled" && (
                  <div style={styles.scheduledMessage}>
                    <FiClock style={{ color: '#F59E0B', fontSize: '20px' }} />
                    <div>
                      <p style={styles.scheduledTitle}>Trip Scheduled</p>
                      <p style={styles.scheduledText}>
                        This trip is scheduled to start at {formatDateWithAmPm(trip.planned_start_at || trip.planned_start)}.
                        Please wait for the start time to begin the journey.
                      </p>
                    </div>
                  </div>
                )}
                
                {totalDuration.totalMinutes > 0 && trip.status !== "scheduled" && (
                  <div style={styles.totalDurationCard}>
                    <div style={styles.totalDurationInner}>
                      <FiClock style={{ color: '#10B981', fontSize: '20px' }} />
                      <div>
                        <p style={styles.totalDurationLabel}>Total Trip Duration</p>
                        <p style={styles.totalDurationValue}>{totalDuration.hours}h {totalDuration.minutes}m</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {(trip.actual_start_at || trip.actual_start || trip.actual_end_at || trip.actual_end) && (
                  <div style={styles.actualTimesSection}>
                    <div style={styles.actualTimesHeader}>
                      <FiNavigation style={styles.actualIcon} />
                      <span style={styles.actualTitle}>Actual Times</span>
                    </div>
                    <div style={styles.actualTimesGrid}>
                      <div style={styles.actualTimeItem}>
                        <p style={styles.actualLabel}>Actual Start</p>
                        <p style={styles.actualValue}>
                          {(trip.actual_start_at || trip.actual_start) ? new Date(trip.actual_start_at || trip.actual_start).toLocaleString([], { 
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true 
                          }) : "-"}
                        </p>
                      </div>
                      <div style={styles.actualTimeItem}>
                        <p style={styles.actualLabel}>Actual End</p>
                        <p style={styles.actualValue}>
                          {(trip.actual_end_at || trip.actual_end) ? new Date(trip.actual_end_at || trip.actual_end).toLocaleString([], { 
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true 
                          }) : trip.status === "in_progress" ? "In Progress" : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div style={styles.actionButtons}>
                  {trip.status === "scheduled" && (
                    <>
                      <button onClick={() => handleStartTrip(trip.trip_id || trip.id)} style={styles.startButton} disabled={loading}>
                        <FiPlay style={styles.buttonIcon} />
                        {loading ? "Starting..." : "Start Trip"}
                      </button>
                      <button onClick={() => handleCancelTrip(trip.trip_id || trip.id)} style={styles.cancelButton} disabled={loading}>
                        <FiX style={styles.buttonIcon} />
                        Cancel Trip
                      </button>
                    </>
                  )}
                  {trip.status === "in_progress" && (
                    <>
                      <button onClick={() => handleEndTrip(trip.trip_id || trip.id)} style={styles.endButton} disabled={loading}>
                        <FiSquare style={styles.buttonIcon} />
                        {loading ? "Ending..." : "End Trip"}
                      </button>
                      <button onClick={() => openEmergencyStopModal(trip.trip_id || trip.id)} style={styles.emergencyButton} disabled={loading}>
                        <FiAlertCircle style={styles.buttonIcon} />
                        Emergency
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              {trip.status === "in_progress" && calculatedStops.length > 0 && (
                <div style={styles.stopsSection}>
                  <div style={styles.stopsHeader}>
                    <div style={styles.stopsHeaderLeft}>
                      <FiMapPin style={{ color: '#10B981', fontSize: '20px' }} />
                      <h3 style={styles.stopsTitle}>Route Stops</h3>
                    </div>
                    <span style={styles.stopCount}>{calculatedStops.length} stops</span>
                  </div>

                  <div style={styles.stopsList}>
                    {calculatedStops.map((stop, index) => {
                      const isArrived = stop.arrival_time;
                      const isDeparted = stop.departure_time;
                      const isFirstStop = index === 0;
                      const isLastStop = index === calculatedStops.length - 1;
                      const isCurrent = !isArrived && isFirstStop;
                      const isNearThisStop = nearStopInfo.isNear && nearStopInfo.stop?.name === stop.name;
                      const hasArrivedAtStop = nearStopInfo.isNear && nearStopInfo.stop?.name === stop.name && nearStopInfo.distance_meters === 0;
                      
                      return (
                        <div 
                          key={stop.stop_id} 
                          style={{
                            ...styles.stopCard,
                            ...(isNearThisStop ? styles.stopCardNear : {}),
                            ...(hasArrivedAtStop ? styles.stopCardArrived : {})
                          }}
                        >
                          <div style={styles.stopCardInner}>
                            <div style={styles.stopNumberBadge}>
                              <span style={{
                                ...styles.stopNumber,
                                background: isDeparted ? '#10B981' : isArrived ? '#3B82F6' : isCurrent ? '#F59E0B' : (isDarkMode ? '#1F1F1F' : '#E5E7EB'),
                                color: (isDeparted || isArrived || isCurrent) ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#111827')
                              }}>{stop.sequence}</span>
                            </div>

                            <div style={styles.stopDetails}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' as const }}>
                                <p style={styles.stopName}>{stop.name}</p>
                                {isNearThisStop && !hasArrivedAtStop && (
                                  <span style={styles.approachingBadge}>
                                    <FiTarget size={10} />
                                    APPROACHING
                                  </span>
                                )}
                                {hasArrivedAtStop && (
                                  <span style={styles.arrivedBadgeNew}>
                                    <FiCheckCircle size={10} />
                                    ARRIVED
                                  </span>
                                )}
                              </div>
                              
                              <div style={styles.timeGrid}>
                                {index > 0 && stop.travel_time_from_prev > 0 && (
                                  <div style={styles.timeBadge}>
                                    <div style={{ ...styles.timeDot, backgroundColor: '#F59E0B' }} />
                                    <span style={styles.timeLabel}>Travel:</span>
                                    <span style={styles.timeValue}>+{stop.travel_time_from_prev} min</span>
                                  </div>
                                )}
                                
                                {stop.cumulative_minutes && stop.cumulative_minutes > 0 && (
                                  <div style={styles.timeBadge}>
                                    <div style={{ ...styles.timeDot, backgroundColor: '#3B82F6' }} />
                                    <span style={styles.timeLabel}>From Start:</span>
                                    <span style={styles.timeValue}>
                                      {Math.floor(stop.cumulative_minutes / 60)}h {stop.cumulative_minutes % 60}m
                                    </span>
                                  </div>
                                )}
                                
                                {stop.estimated_arrival && (
                                  <div style={styles.timeBadge}>
                                    <div style={{ ...styles.timeDot, backgroundColor: '#10B981' }} />
                                    <span style={styles.timeLabel}>Est. Arrival:</span>
                                    <span style={styles.timeValue}>{stop.estimated_arrival}</span>
                                  </div>
                                )}
                              </div>

                              <div style={styles.actualStopTimes}>
                                {stop.arrival_time && (
                                  <div style={styles.actualTimeBadge}>
                                    <FiStopCircle style={{ fontSize: '10px', color: '#3B82F6' }} />
                                    <span style={styles.actualTimeLabel}>Arrived:</span>
                                    <span style={styles.actualTimeValue}>{formatDateWithAmPm(stop.arrival_time)}</span>
                                  </div>
                                )}
                                {stop.departure_time && (
                                  <div style={styles.actualTimeBadge}>
                                    <FiCheckCircle style={{ fontSize: '10px', color: '#10B981' }} />
                                    <span style={styles.actualTimeLabel}>Departed:</span>
                                    <span style={styles.actualTimeValue}>{formatDateWithAmPm(stop.departure_time)}</span>
                                  </div>
                                )}
                              </div>

                              <div style={styles.statusBadges}>
                                {stop.boarding_allowed && <span style={styles.boardingBadge}>✓ Boarding</span>}
                                {stop.deboarding_allowed && <span style={styles.deboardingBadge}>✓ Deboarding</span>}
                                {isArrived && !isDeparted && <span style={styles.arrivedBadge}>📍 Arrived</span>}
                                {isDeparted && <span style={styles.completedBadge}>✓ Completed</span>}
                              </div>
                              
                              {!isDeparted && (
                                <div style={styles.stopActionButtons}>
                                  {!isFirstStop && !isArrived && (
                                    <button onClick={() => handleStopAction(stop.stop_id, "arrive")} style={styles.arriveStopButton} disabled={loading}>
                                      <FiCheckCircle />
                                      Mark Arrival
                                    </button>
                                  )}
                                  
                                  {!isLastStop && isArrived && !isDeparted && (
                                    <button onClick={() => handleStopAction(stop.stop_id, "depart")} style={styles.departStopButton} disabled={loading}>
                                      <FiArrowRightCircle />
                                      Mark Departure
                                    </button>
                                  )}
                                  
                                  {isFirstStop && !isArrived && !isDeparted && (
                                    <button onClick={() => handleStopAction(stop.stop_id, "arrive")} style={styles.startJourneyButton} disabled={loading}>
                                      <FiPlay />
                                      Start Journey
                                    </button>
                                  )}
                                  
                                  {isLastStop && isArrived && !isDeparted && (
                                    <button onClick={() => handleStopAction(stop.stop_id, "depart")} style={styles.completeTripButton} disabled={loading}>
                                      <FiFlag />
                                      Complete Trip
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            {stop.cumulative_minutes && stop.cumulative_minutes > 0 && (
                              <div style={styles.cumulativeBadge}>
                                <p style={styles.cumulativeLabel}>Cumulative</p>
                                <p style={styles.cumulativeValue}>
                                  {Math.floor(stop.cumulative_minutes / 60)}h {stop.cumulative_minutes % 60}m
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={styles.journeySummary}>
                    <div style={styles.summaryInner}>
                      <FiNavigation style={{ width: '24px', height: '24px', color: '#10B981' }} />
                      <div style={styles.summaryContent}>
                        <p style={styles.summaryTitle}>Journey Summary</p>
                        <p style={styles.summaryText}>
                          {calculatedStops.length} stops • Total travel time: {totalDuration.hours}h {totalDuration.minutes}m
                        </p>
                      </div>
                      <div style={styles.summaryTimes}>
                        <div style={styles.summaryTimeItem}>
                          <p style={styles.summaryTimeLabel}>Start Time</p>
                          <p style={styles.summaryTimeValue}>{formatDateWithAmPm(trip.planned_start_at || trip.planned_start)}</p>
                        </div>
                        <div style={styles.summaryTimeItem}>
                          <p style={styles.summaryTimeLabel}>End Time</p>
                          <p style={styles.summaryTimeValue}>{formatDateWithAmPm(trip.planned_end_at || trip.planned_end)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* OTP Verification Modal */}
          {showOtpModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                  <div style={styles.modalIconOtp}>
                    <FiKey style={{ color: '#FFFFFF', fontSize: '24px' }} />
                  </div>
                  <h2 style={styles.modalTitle}>Verify Passenger</h2>
                  <button 
                    onClick={() => setShowOtpModal(false)}
                    style={styles.modalCloseButton}
                  >
                    <FiX size={20} />
                  </button>
                </div>
                
                <p style={styles.otpDescription}>
                  Enter the 6-digit OTP provided by the passenger to verify their boarding.
                </p>
                
                <div style={styles.otpInputContainer}>
                  <input
                    type="text"
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="••••••"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setOtpCode(value);
                    }}
                    style={styles.otpInput}
                    autoFocus
                  />
                </div>
                
                <div style={styles.modalButtons}>
                  <button 
                    onClick={verifyOtp} 
                    disabled={!otpCode || otpCode.length !== 6 || verifyingOtp} 
                    style={{ 
                      ...styles.otpSubmitButton, 
                      opacity: (!otpCode || otpCode.length !== 6 || verifyingOtp) ? 0.5 : 1 
                    }}
                  >
                    {verifyingOtp ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FiUserCheck size={18} />
                        Verify Passenger
                      </>
                    )}
                  </button>
                  <button onClick={() => setShowOtpModal(false)} style={styles.cancelModalButton}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {scanResult && (
            <div style={styles.scanResultCard}>
              <div style={{
                ...styles.scanResultContent,
                background: scanResult.error ? (isDarkMode ? '#7F1D1D' : '#FEE2E2') : (isDarkMode ? '#064E3B' : '#D1FAE5')
              }}>
                {scanResult.error ? <FiAlertCircle style={{ color: '#EF4444', fontSize: '24px' }} /> : <FiUserCheck style={{ color: '#10B981', fontSize: '24px' }} />}
                <div>
                  <p style={styles.scanResultTitle}>{scanResult.error ? "Verification Failed" : "Passenger Verified"}</p>
                  <p style={styles.scanResultText}>{scanResult.error ? scanResult.error : "Passenger has been successfully verified"}</p>
                </div>
                <button onClick={() => setScanResult(null)} style={styles.scanResultClose}><FiX /></button>
              </div>
            </div>
          )}
          
          {showScanner && trip && token && (
            <QRScannerComponent
              onClose={() => setShowScanner(false)}
              onScanSuccess={handleScanSuccess}
              tripId={trip.trip_id || trip.id}
              token={token}
            />
          )}
          
          {showCancelModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                  <div style={styles.modalIconCancel}><FiX style={{ color: '#FFFFFF' }} /></div>
                  <h2 style={styles.modalTitle}>Cancel Trip</h2>
                </div>
                <textarea
                  style={styles.textarea}
                  rows={4}
                  placeholder="Enter reason for cancellation (minimum 100 characters)..."
                  value={cancelReason}
                  onChange={(e) => { setCancelReason(e.target.value); setCancelCharCount(e.target.value.length); }}
                />
                <div style={styles.charCounter}>
                  <span style={{ ...styles.charCountText, color: cancelCharCount >= 100 ? '#10B981' : cancelCharCount > 0 ? '#F59E0B' : '#EF4444' }}>
                    {cancelCharCount} / 100 characters
                  </span>
                  {cancelCharCount >= 100 && <FiCheckCircle style={{ color: '#10B981', fontSize: '14px' }} />}
                </div>
                <div style={styles.modalButtons}>
                  <button onClick={submitCancelTrip} disabled={!cancelReason || cancelCharCount < 100 || loading} style={{ ...styles.submitButton, opacity: (!cancelReason || cancelCharCount < 100 || loading) ? 0.5 : 1 }}>
                    {loading ? "Processing..." : "Submit"}
                  </button>
                  <button onClick={() => setShowCancelModal(false)} style={styles.cancelModalButton}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          
          {showEmergencyModal && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                  <div style={styles.modalIconEmergency}><FiAlertCircle style={{ color: '#FFFFFF' }} /></div>
                  <h2 style={styles.modalTitle}>Emergency Stop</h2>
                </div>
                <textarea
                  style={styles.textarea}
                  rows={4}
                  placeholder="Enter reason for emergency stop (minimum 5 characters)..."
                  value={emergencyReason}
                  onChange={(e) => { setEmergencyReason(e.target.value); setEmergencyCharCount(e.target.value.length); }}
                />
                <div style={styles.charCounter}>
                  <span style={{ ...styles.charCountText, color: emergencyCharCount >= 5 ? '#10B981' : emergencyCharCount > 0 ? '#F59E0B' : '#EF4444' }}>
                    {emergencyCharCount} / 5 characters
                  </span>
                  {emergencyCharCount >= 5 && <FiCheckCircle style={{ color: '#10B981', fontSize: '14px' }} />}
                </div>
                <div style={styles.modalButtons}>
                  <button onClick={submitEmergencyStop} disabled={!emergencyReason || emergencyCharCount < 5 || loading} style={{ ...styles.emergencySubmitButton, opacity: (!emergencyReason || emergencyCharCount < 5 || loading) ? 0.5 : 1 }}>
                    {loading ? "Processing..." : "Submit"}
                  </button>
                  <button onClick={() => setShowEmergencyModal(false)} style={styles.cancelModalButton}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>

      <style>{`
        @keyframes popupFadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 0 8px rgba(245, 158, 11, 0);
          }
        }
        
        @keyframes pulseGreen {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            transform: scale(1.02);
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
          }
        }
      `}</style>
    </IonPage>
  );
};

const getStyles = (isDark: boolean, trip: any, nearStopInfo: NearStopInfo) => ({
  container: {
    paddingTop: '80px',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: '32px',
    maxWidth: '600px',
    margin: '0 auto',
    minHeight: '100vh',
    background: isDark ? '#000000' : '#F8F9FA'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    background: isDark ? '#111111' : '#FFFFFF',
    borderRadius: '24px',
    border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`
  },
  emptyIcon: { fontSize: '64px', color: isDark ? '#374151' : '#9CA3AF', marginBottom: '16px' },
  emptyTitle: { fontSize: '20px', fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827', marginBottom: '8px' },
  emptyText: { fontSize: '14px', color: isDark ? '#9CA3AF' : '#6B7280' },
  nearStopCard: {
    background: isDark 
      ? 'linear-gradient(135deg, #78350F 0%, #92400E 100%)'
      : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '20px',
    border: `2px solid ${isDark ? '#F59E0B' : '#D97706'}`,
    boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  arrivedStopCard: {
    background: isDark 
      ? 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)'
      : 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '20px',
    border: `2px solid ${isDark ? '#10B981' : '#059669'}`,
    boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)',
    animation: 'pulseGreen 2s ease-in-out infinite'
  },
  nearStopHeader: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px'
  },
  nearStopIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    background: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  arrivedStopIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    background: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  nearStopContent: {
    flex: 1
  },
  nearStopTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: isDark ? '#FDE68A' : '#92400E',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  arrivedStopTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: isDark ? '#A7F3D0' : '#064E3B',
    marginBottom: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  nearStopName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#78350F',
    marginBottom: '8px'
  },
  arrivedStopName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: isDark ? '#FFFFFF' : '#064E3B',
    marginBottom: '8px'
  },
  nearStopDistance: {
    fontSize: '14px',
    fontWeight: '500',
    color: isDark ? '#FDE68A' : '#92400E',
    marginBottom: '8px'
  },
  arrivedStopDistance: {
    fontSize: '14px',
    fontWeight: '500',
    color: isDark ? '#A7F3D0' : '#065F46',
    marginBottom: '8px'
  },
  arrivalAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '500',
    color: isDark ? '#FFFFFF' : '#064E3B',
    marginTop: '8px'
  },
  nearStopFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '12px',
    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
  },
  radiusInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    color: isDark ? '#FDE68A' : '#78350F'
  },
  checkingBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    padding: '4px 8px',
    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)',
    borderRadius: '12px',
    color: isDark ? '#FFFFFF' : '#78350F'
  },
  tripCard: {
    background: isDark ? '#111111' : '#FFFFFF',
    borderRadius: '24px',
    padding: '20px',
    marginBottom: '20px',
    border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`,
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.05)'
  },
  tripHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap' as const, gap: '12px' },
  routeBadge: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  routeIcon: { color: '#10B981', fontSize: '16px' },
  routeName: { fontSize: '16px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500',
    background: trip?.status === 'scheduled' ? (isDark ? '#F59E0B20' : '#FEF3C7') : (isDark ? '#3B82F620' : '#DBEAFE'),
    color: trip?.status === 'scheduled' ? '#F59E0B' : '#3B82F6'
  },
  statusIcon: { fontSize: '12px' },
  scanButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#000000', border: 'none', borderRadius: '40px', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  otpButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#3B82F6', border: 'none', borderRadius: '40px', color: '#FFFFFF', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  scanIcon: { fontSize: '18px' },
  tripInfo: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px 0', borderTop: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, borderBottom: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, marginBottom: '16px' },
  infoItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  infoIcon: { fontSize: '18px', color: isDark ? '#6B7280' : '#9CA3AF' },
  infoLabel: { fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF', marginBottom: '2px' },
  infoValue: { fontSize: '13px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
  vehicleCard: { background: isDark ? '#0A0A0A' : '#F9FAFB', borderRadius: '16px', padding: '12px', marginBottom: '16px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}` },
  vehicleInner: { display: 'flex', alignItems: 'center', gap: '12px' },
  vehicleLabel: { fontSize: '10px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '2px' },
  vehicleValue: { fontSize: '13px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
  scheduledMessage: {
    marginTop: '16px',
    padding: '16px',
    background: isDark ? '#F59E0B10' : '#FEF3C7',
    borderRadius: '16px',
    border: `1px solid ${isDark ? '#F59E0B30' : '#FBBF24'}`,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  scheduledTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: isDark ? '#F59E0B' : '#92400E',
    marginBottom: '4px'
  },
  scheduledText: {
    fontSize: '12px',
    color: isDark ? '#F59E0BCC' : '#B45309',
    margin: 0,
    lineHeight: '1.4'
  },
  totalDurationCard: { background: isDark ? '#0A0A0A' : '#F9FAFB', borderRadius: '16px', padding: '16px', marginBottom: '16px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}` },
  totalDurationInner: { display: 'flex', alignItems: 'center', gap: '12px' },
  totalDurationLabel: { fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '2px' },
  totalDurationValue: { fontSize: '18px', fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827' },
  actualTimesSection: { marginTop: '16px', padding: '16px', background: isDark ? '#0A0A0A' : '#F9FAFB', borderRadius: '16px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, marginBottom: '16px' },
  actualTimesHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  actualIcon: { fontSize: '16px', color: '#10B981' },
  actualTitle: { fontSize: '13px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
  actualTimesGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
  actualTimeItem: { flex: 1 },
  actualLabel: { fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF', marginBottom: '4px' },
  actualValue: { fontSize: '13px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
  actionButtons: { display: 'flex', gap: '12px' },
  startButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#10B981', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  cancelButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#EF4444', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  endButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#EF4444', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  emergencyButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: '#F59E0B', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  buttonIcon: { fontSize: '16px' },
  stopsSection: { background: isDark ? '#111111' : '#FFFFFF', borderRadius: '24px', padding: '20px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}` },
  stopsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  stopsHeaderLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  stopsTitle: { fontSize: '18px', fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827', margin: 0 },
  stopCount: { fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' },
  stopsList: { display: 'flex', flexDirection: 'column' as const, gap: '16px', maxHeight: '500px', overflowY: 'auto' as const, paddingRight: '8px' },
  stopCard: { background: isDark ? '#0A0A0A' : '#F9FAFB', borderRadius: '16px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, transition: 'all 0.2s' },
  stopCardNear: { 
    border: `2px solid #F59E0B`,
    boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.2)',
    background: isDark ? '#78350F20' : '#FEF3C720'
  },
  stopCardArrived: { 
    border: `2px solid #10B981`,
    boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
    background: isDark ? '#064E3B20' : '#D1FAE520'
  },
  stopCardInner: { display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '16px' },
  stopNumberBadge: { flexShrink: 0 },
  stopNumber: { width: '44px', height: '44px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' },
  stopDetails: { flex: 1 },
  stopName: { fontSize: '16px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827', marginBottom: '10px' },
  approachingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    background: '#F59E0B',
    borderRadius: '12px',
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  arrivedBadgeNew: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    background: '#10B981',
    borderRadius: '12px',
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px'
  },
  timeGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginBottom: '10px' },
  timeBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: isDark ? '#1F1F1F' : '#FFFFFF', borderRadius: '20px', fontSize: '12px' },
  timeDot: { width: '8px', height: '8px', borderRadius: '4px' },
  timeLabel: { fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280' },
  timeValue: { fontSize: '12px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
  actualStopTimes: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', marginBottom: '10px' },
  actualTimeBadge: { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: isDark ? '#1F1F1F' : '#FFFFFF', borderRadius: '20px', fontSize: '12px' },
  actualTimeLabel: { fontSize: '11px', color: isDark ? '#9CA3AF' : '#6B7280' },
  actualTimeValue: { fontSize: '12px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
  statusBadges: { display: 'flex', flexWrap: 'wrap' as const, gap: '6px', marginBottom: '10px' },
  boardingBadge: { fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: '#10B98120', color: '#10B981', fontWeight: '500' },
  deboardingBadge: { fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: '#3B82F620', color: '#3B82F6', fontWeight: '500' },
  arrivedBadge: { fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: '#3B82F620', color: '#3B82F6', fontWeight: '500' },
  completedBadge: { fontSize: '10px', padding: '4px 8px', borderRadius: '12px', background: '#10B98120', color: '#10B981', fontWeight: '500' },
  stopActionButtons: { display: 'flex', gap: '8px', flexWrap: 'wrap' as const },
  arriveStopButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#10B981', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  departStopButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#3B82F6', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  startJourneyButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#10B981',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  completeTripButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: '#8B5CF6',
    border: 'none',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  cumulativeBadge: { textAlign: 'right' as const, flexShrink: 0, minWidth: '80px' },
  cumulativeLabel: { fontSize: '10px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '2px' },
  cumulativeValue: { fontSize: '14px', fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827' },
  journeySummary: { marginTop: '20px', padding: '16px', background: isDark ? '#0A0A0A' : '#F9FAFB', borderRadius: '16px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}` },
  summaryInner: { display: 'flex', flexDirection: 'column' as const, gap: '12px' },
  summaryContent: { flex: 1 },
  summaryTitle: { fontSize: '14px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827', marginBottom: '4px' },
  summaryText: { fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280' },
  summaryTimes: { display: 'flex', gap: '16px', justifyContent: 'flex-end' },
  summaryTimeItem: { textAlign: 'center' as const },
  summaryTimeLabel: { fontSize: '10px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '2px' },
  summaryTimeValue: { fontSize: '14px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827' },
  scanResultCard: { position: 'fixed' as const, bottom: '20px', left: '16px', right: '16px', zIndex: 100, animation: 'slideUp 0.3s ease-out' },
  scanResultContent: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' },
  scanResultTitle: { fontSize: '14px', fontWeight: '600', color: isDark ? '#FFFFFF' : '#111827', marginBottom: '2px' },
  scanResultText: { fontSize: '12px', color: isDark ? '#9CA3AF' : '#6B7280', margin: 0 },
  scanResultClose: { background: 'transparent', border: 'none', cursor: 'pointer', marginLeft: 'auto', color: isDark ? '#9CA3AF' : '#6B7280' },
  modalOverlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' },
  modalContent: { background: isDark ? '#111111' : '#FFFFFF', borderRadius: '24px', padding: '24px', width: '90%', maxWidth: '450px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, position: 'relative' as const },
  modalHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
  modalIconCancel: { width: '48px', height: '48px', borderRadius: '24px', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalIconEmergency: { width: '48px', height: '48px', borderRadius: '24px', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalIconOtp: { width: '48px', height: '48px', borderRadius: '24px', background: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalCloseButton: {
    position: 'absolute' as const,
    top: '20px',
    right: '20px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: isDark ? '#9CA3AF' : '#6B7280',
    padding: '4px'
  },
  modalTitle: { fontSize: '22px', fontWeight: 'bold', color: isDark ? '#FFFFFF' : '#111827', margin: 0 },
  otpDescription: {
    fontSize: '14px',
    color: isDark ? '#9CA3AF' : '#6B7280',
    marginBottom: '24px',
    textAlign: 'center' as const
  },
  otpInputContainer: {
    marginBottom: '24px',
    display: 'flex',
    justifyContent: 'center'
  },
  otpInput: {
    width: '200px',
    padding: '16px',
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    letterSpacing: '8px',
    borderRadius: '16px',
    border: `2px solid ${isDark ? '#3B82F6' : '#3B82F6'}`,
    background: isDark ? '#0A0A0A' : '#FFFFFF',
    color: isDark ? '#FFFFFF' : '#111827',
    outline: 'none',
    fontFamily: 'monospace'
  },
  otpSubmitButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#3B82F6',
    border: 'none',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  textarea: { width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${isDark ? '#1F1F1F' : '#E5E7EB'}`, background: isDark ? '#0A0A0A' : '#F9FAFB', color: isDark ? '#FFFFFF' : '#111827', fontSize: '14px', resize: 'vertical' as const, marginBottom: '8px', fontFamily: 'inherit' },
  charCounter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  charCountText: { fontSize: '12px', fontWeight: '500' },
  modalButtons: { display: 'flex', gap: '12px' },
  submitButton: { flex: 1, padding: '12px', background: '#EF4444', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  emergencySubmitButton: { flex: 1, padding: '12px', background: '#F59E0B', border: 'none', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  cancelModalButton: { flex: 1, padding: '12px', background: isDark ? '#1F1F1F' : '#F3F4F6', border: 'none', borderRadius: '12px', color: isDark ? '#FFFFFF' : '#111827', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }
});

// IMPORTANT: This is the default export - make sure this line exists!
export default CurrentTrip;