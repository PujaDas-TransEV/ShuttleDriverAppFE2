// import React, { useEffect, useState, useRef } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import NavbarSidebar from "./Navbar";
// import { BrowserMultiFormatReader } from "@zxing/browser";
// import {
//   FiCamera,
//   FiCheckCircle,
//   FiArrowRightCircle,
// } from "react-icons/fi";

// const API_BASE = "https://be.shuttleapp.transev.site";

// const CurrentTrip: React.FC = () => {
//   const token = localStorage.getItem("access_token") || "";

//   const [loading, setLoading] = useState(false);
//   const [trip, setTrip] = useState<any>(null);
//   const [route, setRoute] = useState<any>(null);

//   const [showScanner, setShowScanner] = useState(false);

//   // MODALS
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelReason, setCancelReason] = useState("");

//   const [showEmergencyModal, setShowEmergencyModal] = useState(false);
//   const [emergencyReason, setEmergencyReason] = useState("");
// const [routeDetails, setRouteDetails] = useState<any>(null);
// const [trips, setTrips] = useState<any[]>([]);
// const [cancelTripId, setCancelTripId] = useState<string | null>(null);
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const scannerRef = useRef<any>(null);
//   const fetchRouteDetails = async (routeId: string) => {
//     if (!routeId) {
//       setRouteDetails(null);
//       setTrips([]);
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/routes/${routeId}/trips/details`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setRouteDetails(data.route || null);

//       // Sort trips by status
//       const sorted = (data.trips || []).sort((a: any, b: any) => {
//         const order: Record<string, number> = { scheduled: 1, in_progress: 2, completed: 3 };
//         const aOrder = order[a.status as keyof typeof order] ?? 0;
//         const bOrder = order[b.status as keyof typeof order] ?? 0;
//         return aOrder - bOrder;
//       });

//       setTrips(sorted);
//     } catch (err) {
//       console.error(err);
//     }
//     setLoading(false);
//   };

// const fetchTripDetails = async () => {
//   setLoading(true);
//   try {
//     const res = await fetch(`${API_BASE}/driver/trips/current`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const data = await res.json();

//     // If API returns error like no_active_trip
//     if (data?.detail?.error === "no_active_trip") {
//       setTrip(null);
//       setRoute(null);
//       return;
//     }

//     const currentTrip = data?.trip;

//     if (!currentTrip) {
//       setTrip(null);
//       setRoute(null);
//       return;
//     }

//     const detailsRes = await fetch(
//       `${API_BASE}/driver/routes/${currentTrip.route_id}/trips/details`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const detailsData = await detailsRes.json();

//     const activeTrip = detailsData.trips.find(
//       (t: any) => t.status === "in_progress" || t.status === "scheduled"
//     );

//     setTrip(activeTrip || null);
//     setRoute(detailsData.route || null);
//   } catch (err: any) {
//     console.error(err);
//     alert("❌ Failed to fetch trip details: " + (err.message || "Unknown error"));
//   } finally {
//     setLoading(false);
//   }
// };

//   // ================= ACTIONS =================
 
//   const handleStopAction = async (stop_id: string, mode: any) => {
//     const fd = new FormData();
//     fd.append("stop_id", stop_id);
//     fd.append("mode", mode);

//     await fetch(`${API_BASE}/driver/trips/${trip.trip_id}/stop-action`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: fd,
//     });

//     fetchTripDetails();
//   };

//   // ================= SCANNER =================
//   const startScanner = () => {
//     if (!videoRef.current) return;

//     const reader = new BrowserMultiFormatReader();
//     scannerRef.current = reader;

//     reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
//       if (result) {
//         alert("Scanned: " + result.getText());
//         stopScanner();
//       }
//     });
//   };

//   const stopScanner = () => {
//     scannerRef.current?.reset?.();

//     if (videoRef.current?.srcObject) {
//       const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
//       tracks.forEach((t) => t.stop());
//       videoRef.current.srcObject = null;
//     }
//   };

//   useEffect(() => {
//     showScanner ? startScanner() : stopScanner();
//   }, [showScanner]);
//  const handleStartTrip = async (tripId: string) => {
//   if (!tripId || !routeDetails) return;

//   setLoading(true);
//   try {
//     const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/start`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ actual_start_at: new Date().toISOString() }),
//     });

//     // Check if API returned an error
//     if (!res.ok) {
//       const errorData = await res.json();
//       // Show the error message from API
//       alert(errorData.detail || "Failed to start trip");
//       return;
//     }

//     // Success: refresh route/trips data
//     fetchRouteDetails(routeDetails.id);
//   } catch (err: any) {
//     console.error(err);
//     alert("❌ Something went wrong while starting the trip");
//   } finally {
//     setLoading(false);
//   }
// };

 
// const handleEndTrip = async (tripId: string) => {
//   if (!tripId) return;

//   setLoading(true);
//   try {
//     const res = await fetch(
//       `${API_BASE}/driver/scheduled-trips/${tripId}/end`,
//       {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) throw new Error(data.detail || "End failed");

//     fetchTripDetails();
//   } catch (err: any) {
//     alert(err.message);
//   } finally {
//     setLoading(false);
//   }
// };
// const formatTime = (time: string | null) => {
//     if (!time) return "--:--";
//     return new Date(time).toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };
//   // 🔹 Cancel Trip (UPDATED API)
// // Step 1: Open modal instead of window.confirm
// const handleCancelTrip = (tripId: string) => {
//   if (!tripId) return;
//   setCancelTripId(tripId);
//   setCancelReason("");
//   setShowCancelModal(true);
// };

// // Step 2: Submit cancellation with reason
// const submitCancelTrip = async () => {
//   if (!cancelTripId || !cancelReason) return;

//   setLoading(true);

//   try {
//     const formData = new FormData();
//     formData.append("reason", cancelReason);

//     const res = await fetch(`${API_BASE}/driver/trips/${cancelTripId}/cancel`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     });

//     if (!res.ok) {
//       // Try to parse error message from API
//       const errData = await res.json();
//       const errMsg = errData?.detail || "Cancel trip failed";
//       throw new Error(errMsg);
//     }

//     alert("Trip cancelled successfully!");
//     setShowCancelModal(false);
//     setCancelReason("");
//     setCancelTripId(null);

//     // Refresh route/trip data
//     if (routeDetails?.id) fetchRouteDetails(routeDetails.id);

//   } catch (err: any) {
//     console.error(err);
//     alert(`❌ ${err.message}`); // show API error
//   } finally {
//     setLoading(false);
//   }
// };
//   //  const selectedTrip = trips[0];
//   const selectedTrip = trips?.[0] || null;
//   // State

// const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);


// // Open modal
// const openEmergencyStopModal = (tripId: string) => {
//   setEmergencyTripId(tripId);
//   setEmergencyReason("");
//   setShowEmergencyModal(true);
// };


// const submitEmergencyStop = async () => {
//   if (!emergencyTripId || !emergencyReason) return;
//   setLoading(true);

//   try {
//     const formData = new FormData();
//     formData.append("reason", emergencyReason);
//     formData.append("actual_end_at", new Date().toISOString());

//     const res = await fetch(
//       `${API_BASE}/driver/scheduled-trips/${emergencyTripId}/emergency-end`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           // Note: Do NOT set 'Content-Type' manually for multipart/form-data
//         },
//         body: formData,
//       }
//     );

//     if (!res.ok) throw new Error("Emergency stop failed");

//     alert("Trip stopped successfully!");
//     setShowEmergencyModal(false);
//     setEmergencyReason("");

//     if (routeDetails?.id) fetchRouteDetails(routeDetails.id);
//   } catch (err) {
//     console.error(err);
//     alert("❌ Failed to perform emergency stop");
//   } finally {
//     setLoading(false);
//   }
// };
//   // ================= UI =================
//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-white dark:bg-black text-black dark:text-white pt-16 p-4">
//         {/* <IonLoading isOpen={loading} message="Loading..." /> */}
//   {loading && <IonLoading isOpen={loading} message="Loading trip details..." />}

//     {!loading && !trip && (
//       <div className="text-center mt-20 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-md">
//         <h2 className="text-2xl font-bold mb-2">No Active Trip</h2>
//         <p className="text-gray-700 dark:text-gray-300">
//           You currently have no active or scheduled trips.
//         </p>
//         <p className="mt-2 text-sm text-gray-500">
//           Once a trip is assigned, it will appear here.
//         </p>
//       </div>
//     )}

//         {/* HEADER CARD */}
//         <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl shadow mb-6 mt-20">

//           {/* TOP */}
//           <div className="flex justify-between items-center flex-wrap gap-4">
//             <div>
//               <h2 className="text-2xl font-bold">{route?.name}</h2>
//             </div>

//             <button
//               onClick={() => setShowScanner(!showScanner)}
//               className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg"
//             >
//               <FiCamera />
//               Scanner
//             </button>
//           </div>

//           {/* STATUS BADGE */}
//           <div className="flex justify-end mt-4">
//             <span className="px-4 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
//               🚍 {trip?.status}
//             </span>
//           </div>

//           {/* DETAILS */}
//          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">

//      <div>
//        <p className="text-gray-500">Trip ID</p>
//        <p className="font-semibold break-all">{trip?.trip_id}</p>
//      </div>

//      <div>
//        <p className="text-gray-500">Planned Start</p>
//        <p className="font-semibold">
//          {trip?.planned_start
//           ? new Date(trip.planned_start).toLocaleTimeString()
//           : "-"}
//       </p>
//     </div>

//     <div>
//       <p className="text-gray-500">Planned End</p>
//       <p className="font-semibold">
//         {trip?.planned_end
//           ? new Date(trip.planned_end).toLocaleTimeString()
//           : "-"}
//       </p>
//     </div>

//     <div>
//       <p className="text-gray-500">Actual Start</p>
//       <p className="font-semibold">
//         {trip?.actual_start
//           ? new Date(trip.actual_start).toLocaleTimeString()
//           : "-"}
//       </p>
//     </div>

//     <div>
//       <p className="text-gray-500">Actual End</p>
//       <p className="font-semibold">
//         {trip?.actual_end
//           ? new Date(trip.actual_end).toLocaleTimeString()
//           : "-"}
//       </p>
//     </div>
//     </div>

//           {/* ACTION BUTTONS */}
//           {trip?.status === "scheduled" && (
//             <div className="flex gap-2 mt-4">
//               <button
//                 onClick={() => handleStartTrip(trip.trip_id)}
//                 className="flex-1 h-12 bg-black text-white rounded"
//               >
//                 Start Trip
//               </button>

//               <button
//                 onClick={() => setShowCancelModal(true)}
//                 className="flex-1 h-12 bg-red-600 text-white rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           )}

//           {trip?.status === "in_progress" && (
//             <div className="flex gap-2 mt-4">
//               <button
//                 onClick={() => handleEndTrip(trip.trip_id)}
//                 className="flex-1 h-12 bg-red-600 text-white rounded"
//               >
//                 End Trip
//               </button>

//               <button
//                 onClick={() => setShowEmergencyModal(true)}
//                 className="flex-1 h-12 bg-yellow-500 text-white rounded"
//               >
//                 Emergency
//               </button>
//             </div>
//           )}
//         </div>

//         {/* SCANNER */}
//         {showScanner && (
//           <video ref={videoRef} className="mb-6 w-full rounded-lg" />
//         )}

//         {/* STOPS */}
//         {trip?.stops?.map((stop: any) => (
//           <div
//             key={stop.stop_id}
//             className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl mb-4 shadow"
//           >
//             <h3 className="font-bold text-lg">
//               {stop.sequence}. {stop.stop_name}
//             </h3>

//             <p className="text-sm text-gray-500">
//               Planned: {new Date(stop.planned_arrival_time).toLocaleTimeString()}
//             </p>

//             <p>Arrival: {stop.actual_arrival_time ? new Date(stop.actual_arrival_time).toLocaleTimeString() : "-"}</p>
//             <p>Departure: {stop.actual_departure_time ? new Date(stop.actual_departure_time).toLocaleTimeString() : "-"}</p>

//             <div className="flex gap-3 mt-4">
//               <button
//                 onClick={() => handleStopAction(stop.stop_id, "arrive")}
//                 className="bg-green-600 text-white rounded flex items-center justify-center gap-2"
//                 style={{ width: 130, height: 42 }}
//               >
//                 <FiCheckCircle /> Arrive
//               </button>

//               <button
//                 onClick={() => handleStopAction(stop.stop_id, "depart")}
//                 className="bg-blue-600 text-white rounded flex items-center justify-center gap-2"
//                 style={{ width: 130, height: 42 }}
//               >
//                 <FiArrowRightCircle /> Depart
//               </button>
//             </div>
//             {showEmergencyModal && (
//   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
    
//     <div className="bg-white dark:bg-gray-900 p-5 rounded-lg w-96 shadow-lg relative z-10000">
      
//       <h2 className="font-bold text-lg mb-4 text-black dark:text-white">
//         Emergency Stop
//       </h2>

//       <label className="block mb-2 text-gray-700 dark:text-gray-300">
//         Reason for stopping trip:
//       </label>

//       <textarea
//         className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white relative z-10001"
//         rows={4}
//         value={emergencyReason}
//         onChange={(e) => setEmergencyReason(e.target.value)}
//       />

//       <div className="flex justify-end space-x-2">
        
//         {/* Submit Button */}
//         <button
//           onClick={submitEmergencyStop}
//           disabled={!emergencyReason || loading}
//           style={{
//             height: "48px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "#d1fae5",
//             color: "green",
//             borderRadius: "8px",
//             fontWeight: "bold",
//             cursor: !emergencyReason || loading ? "not-allowed" : "pointer",
//             zIndex: 10001, // 🔥 fix
//           }}
//         >
//           {loading ? "Submitting..." : "Submit"}
//         </button>

//         {/* Cancel Button */}
//         <button
//           onClick={() => setShowEmergencyModal(false)}
//           disabled={loading}
//           style={{
//             height: "48px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "#e5e7eb",
//             color: "#374151",
//             borderRadius: "8px",
//             fontWeight: "bold",
//             cursor: loading ? "not-allowed" : "pointer",
//             zIndex: 10001, // 🔥 fix
//           }}
//         >
//           Cancel
//         </button>

//       </div>
//     </div>
//   </div>
// )}

// {showCancelModal && (
//   <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
//     <div className="bg-white dark:bg-gray-900 p-5 rounded-lg w-96 shadow-lg relative z-10000">
      
//       <h2 className="font-bold text-lg mb-4 text-black dark:text-white">
//         Cancel Trip
//       </h2>

//       <label className="block mb-2 text-gray-700 dark:text-gray-300">
//         Reason for cancelling trip:
//       </label>

//       <textarea
//         className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//         rows={4}
//         value={cancelReason}
//         onChange={(e) => setCancelReason(e.target.value)}
//       />

//       <div className="flex justify-end space-x-2">
        
//         {/* Submit Button */}
//         <button
//           onClick={submitCancelTrip}
//           disabled={!cancelReason || loading}
//           style={{
//             height: "48px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "#fee2e2",
//             color: "#b91c1c",
//             borderRadius: "8px",
//             fontWeight: "bold",
//             cursor: !cancelReason || loading ? "not-allowed" : "pointer",
//             transition: "all 0.2s ease-in-out",
//             zIndex: 10001, // 🔥 added
//           }}
//         >
//           {loading ? "Cancelling..." : "Submit"}
//         </button>

//         {/* Cancel Button */}
//         <button
//           onClick={() => setShowCancelModal(false)}
//           disabled={loading}
//           style={{
//             height: "48px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             background: "#e5e7eb",
//             color: "#374151",
//             borderRadius: "8px",
//             fontWeight: "bold",
//             cursor: loading ? "not-allowed" : "pointer",
//             transition: "all 0.2s ease-in-out",
//             zIndex: 10001, // 🔥 added
//           }}
//         >
//           Cancel
//         </button>

//       </div>
//     </div>
//   </div>
// )}
//             {trip.status === "completed" && (
//               <div
//                 style={{
//                   height: "48px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   background: "#d1fae5",
//                   color: "green",
//                   borderRadius: "8px",
//                   fontWeight: "bold",
//                 }}
//               >
//                 ✅ Completed
//               </div>
//             )}
//           </div>
//         ))}
    
//       </IonContent>
//     </IonPage>
//   );
// };

// export default CurrentTrip;

import React, { useEffect, useState, useRef } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import NavbarSidebar from "./Navbar";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { FiCamera, FiCheckCircle, FiArrowRightCircle } from "react-icons/fi";

const API_BASE = "https://be.shuttleapp.transev.site";

const CurrentTrip: React.FC = () => {
  const token = localStorage.getItem("access_token") || "";

  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);

  const [showScanner, setShowScanner] = useState(false);

  // MODALS
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelTripId, setCancelTripId] = useState<string | null>(null);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<any>(null);

  // ================= FETCH =================
  const fetchTripDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/trips/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data?.detail?.error === "no_active_trip") {
        setTrip(null);
        setRoute(null);
        return;
      }

      const currentTrip = data?.trip;

      if (!currentTrip) {
        setTrip(null);
        setRoute(null);
        return;
      }

      // Pick first trip that is scheduled or in_progress
      const detailsRes = await fetch(
        `${API_BASE}/driver/routes/${currentTrip.route_id}/trips/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const detailsData = await detailsRes.json();

      const activeTrip = detailsData.trips.find(
        (t: any) => t.status === "scheduled" || t.status === "in_progress"
      );

      setTrip(activeTrip || null);
      setRoute(detailsData.route || null);
    } catch (err: any) {
      console.error(err);
      alert("❌ Failed to fetch trip details: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, []);

  // ================= SCANNER =================
  const startScanner = () => {
    if (!videoRef.current) return;
    const reader = new BrowserMultiFormatReader();
    scannerRef.current = reader;
    reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => {
      if (result) {
        alert("Scanned: " + result.getText());
        stopScanner();
      }
    });
  };

  const stopScanner = () => {
    scannerRef.current?.reset?.();
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream)
        .getTracks()
        .forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    showScanner ? startScanner() : stopScanner();
  }, [showScanner]);

  // ================= ACTIONS =================
  const handleStopAction = async (stop_id: string, mode: "arrive" | "depart") => {
    if (!trip) return;
    const fd = new FormData();
    fd.append("stop_id", stop_id);
    fd.append("mode", mode);

    await fetch(`${API_BASE}/driver/scheduled-trips/${trip.trip_id}/stop-action`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    fetchTripDetails();
  };

const handleStartTrip = async (tripId: string) => {
  if (!tripId) return;

  setLoading(true);

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });

    // 🔥 FULL GEO DEBUG
    console.log("📍 FULL POSITION OBJECT:", position);

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const accuracy = position.coords.accuracy;
    const timestamp = position.timestamp;

    // ✅ Important logs
    console.log("📍 Latitude:", latitude);
    console.log("📍 Longitude:", longitude);
    console.log("🎯 Accuracy (meters):", accuracy);
    console.log("⏱ Timestamp:", new Date(timestamp).toISOString());

    // 👉 Optional: clean one-line log
    console.log(
      `📍 FINAL LOCATION → Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`
    );

    // ✅ Prepare FormData
    const formData = new FormData();
    formData.append("lat", latitude.toString());
    formData.append("lng", longitude.toString());

    const res = await fetch(
      `${API_BASE}/driver/scheduled-trips/${tripId}/start`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Backend Error:", data);

      if (data?.distance_m && data?.allowed_radius_m) {
        throw new Error(
          `Too far 🚫 Distance: ${data.distance_m}m | Allowed: ${data.allowed_radius_m}m`
        );
      }

      throw new Error(data.detail || data.error || "Failed to start trip");
    }

    console.log("✅ Trip Started:", data);

    alert(
      `✅ Trip Started!\nDistance: ${data.distance_m}m\nAllowed: ${data.allowed_radius_m}m`
    );

    fetchTripDetails();

  } catch (err: any) {
    console.error(err);
    alert("❌ Failed:\n" + (err.message || "Unknown error"));
  } finally {
    setLoading(false);
  }
};

const handleEndTrip = async (tripId: string) => {
  if (!tripId) return;
  setLoading(true);

  try {
    // Helper to get current location
    const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported on this device"));
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        }
      });
    };

    // Get device location
    const { lat, lng } = await getCurrentLocation();
    console.log("Current location:", lat, lng);

    // Prepare multipart form data
    const formData = new FormData();
    formData.append("actual_end_at", new Date().toISOString());
    formData.append("lat", lat.toString());
    formData.append("lng", lng.toString());

    // Send POST request
    const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/end`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // DO NOT set Content-Type for FormData
      },
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || "Failed to end trip");
    }

    alert("✅ Trip ended successfully!");
    fetchTripDetails();
  } catch (err: any) {
    console.error(err);
    alert("❌ Failed to end trip: " + (err.message || "Unknown error"));
  } finally {
    setLoading(false);
  }
};
  const openEmergencyStopModal = (tripId: string) => {
    setEmergencyTripId(tripId);
    setEmergencyReason("");
    setShowEmergencyModal(true);
  };

 
const submitEmergencyStop = async () => {
  if (!emergencyTripId || !emergencyReason) {
    alert("Please provide a reason for emergency stop!");
    return;
  }

  setLoading(true);

  try {
    // Get user location
    const getLocation = (): Promise<{ lat: number; lng: number }> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation not supported in this device"));
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (err) => reject(err),
            { enableHighAccuracy: true }
          );
        }
      });
    };

    const { lat, lng } = await getLocation();

    // Prepare FormData payload
    const formData = new FormData();
    formData.append("reason", emergencyReason);
    formData.append("lat", lat.toString());
    formData.append("lng", lng.toString());
    formData.append("actual_end_at", new Date().toISOString());

    const res = await fetch(
      `${API_BASE}/driver/scheduled-trips/${emergencyTripId}/emergency-end`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type! Browser sets it automatically for FormData
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail?.[0]?.msg || "Emergency stop failed");
    }

    alert("✅ Trip stopped successfully!");
    setShowEmergencyModal(false);
    fetchTripDetails();
  } catch (err: any) {
    console.error(err);
    alert(`❌ Failed to perform emergency stop: ${err.message}`);
  } finally {
    setLoading(false);
  }
};
  const handleCancelTrip = (tripId: string) => {
    setCancelTripId(tripId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const submitCancelTrip = async () => {
    if (!cancelTripId || !cancelReason) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("reason", cancelReason);

      const res = await fetch(`${API_BASE}/driver/trips/${cancelTripId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Cancel trip failed");

      alert("Trip cancelled successfully!");
      setShowCancelModal(false);
      fetchTripDetails();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to cancel trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-white dark:bg-black text-black dark:text-white pt-16 p-4">
        {loading && <IonLoading isOpen={loading} message="Loading trip details..." />}

        {!trip && !loading && (
          <div className="text-center mt-20 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-2">No Active Trip</h2>
            <p className="text-gray-700 dark:text-gray-100">
              You currently have no active or scheduled trips.
            </p>
          </div>
        )}

        {trip && (
          <>
           
            <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl shadow mb-6 mt-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold dark:text-gray-300">{route?.name || "Unnamed Route"}</h2>
                <button
                  onClick={() => setShowScanner(!showScanner)}
                  className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg"
                >
                  <FiCamera /> Scanner
                </button>
              </div>

              <div className="flex justify-end mt-4">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-semibold ${
                    trip.status === "scheduled"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : trip.status === "in_progress"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : ""
                  }`}
                >
                  {trip.status === "scheduled" && "🟡 Scheduled"}
                  {trip.status === "in_progress" && "🚍 In Progress"}
                </span>
              </div>

              {/* Trip details */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
                <div>
                  <p className="text-gray-500 dark:text-gray-300">Trip ID</p>
                  <p className="font-semibold dark:text-gray-300">{trip.trip_id}</p>
                </div>
               <div>
  <p className="text-gray-500 dark:text-gray-300">Planned Start</p>
  <p className="font-semibold dark:text-gray-300">
    {trip.planned_start
      ? new Date(trip.planned_start).toLocaleString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "-"}
  </p>
</div>
<div>
  <p className="text-gray-500 dark:text-gray-300">Planned End</p>
  <p className="font-semibold dark:text-gray-300">
    {trip.planned_end
      ? new Date(trip.planned_end).toLocaleString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "-"}
  </p>
</div>
               <div>
  <p className="text-gray-500 dark:text-gray-300">Actual Start</p>
  <p className="font-semibold dark:text-gray-300">
    {trip.actual_start
      ? new Date(trip.actual_start).toLocaleString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "-"}
  </p>
</div>

  <p className="text-gray-500 dark:text-gray-300">Actual End</p>
  <p className="font-semibold dark:text-gray-300">
    {trip.actual_end
      ? new Date(trip.actual_end).toLocaleString(undefined, {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "-"}
  </p>
</div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                {trip.status === "scheduled" && (
                  <>
                    <button
                      onClick={() => handleStartTrip(trip.trip_id)}
                      className="flex-1 h-12 bg-black text-white rounded dark:bg-green-300"
                    >
                      Start Trip
                    </button>
                    <button
                      onClick={() => handleCancelTrip(trip.trip_id)}
                      className="flex-1 h-12 bg-red-600 text-white rounded"
                    >
                      Cancel Trip
                    </button>
                  </>
                )}
                {trip.status === "in_progress" && (
                  <>
                    <button
                      onClick={() => handleEndTrip(trip.trip_id)}
                      className="flex-1 h-12 bg-red-600 text-white rounded"
                    >
                      End Trip
                    </button>
                    <button
                      onClick={() => openEmergencyStopModal(trip.trip_id)}
                      className="flex-1 h-12 bg-yellow-500 text-white rounded"
                    >
                      Emergency End
                    </button>
                  </>
                )}
              </div>
            </div>

            {showScanner && <video ref={videoRef} className="mb-6 w-full rounded-lg" />}

            {/* Stops */}
            {trip.stops?.map((stop: any) => (
              <div
                key={stop.stop_id}
                className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl mb-4 shadow dark:text-gray-300"
              >
                <h3 className="font-bold text-lg dark:text-gray-300">
                  {stop.sequence}. {stop.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Planned: {new Date(stop.planned_arrival_time).toLocaleTimeString()}
                </p>
                <p className="dark:text-gray-300">
                  Arrival: {stop.actual_arrival_time ? new Date(stop.actual_arrival_time).toLocaleTimeString() : "-"}
                </p>
                <p className="dark:text-gray-300">
                  Departure: {stop.actual_departure_time ? new Date(stop.actual_departure_time).toLocaleTimeString() : "-"}
                </p>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleStopAction(stop.stop_id, "arrive")}
                    className="bg-green-600 text-white rounded flex items-center justify-center gap-2"
                    style={{ width: 130, height: 42 }}
                  >
                    <FiCheckCircle /> Arrive
                  </button>
                  <button
                    onClick={() => handleStopAction(stop.stop_id, "depart")}
                    className="bg-blue-600 text-white rounded flex items-center justify-center gap-2"
                    style={{ width: 130, height: 42 }}
                  >
                    <FiArrowRightCircle /> Depart
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    }}
  >
    <div
      style={{
        backgroundColor: "#1f1f1f",
        color: "#fff",
        padding: "20px",
        borderRadius: "12px",
        width: "360px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e53e3e",
            color: "#fff",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            marginRight: "8px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            style={{ width: "20px", height: "20px" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Cancel Trip</h2>
      </div>

      <textarea
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #444",
          backgroundColor: "#2a2a2a",
          color: "#fff",
          resize: "none",
          marginBottom: "16px",
          fontSize: "14px",
        }}
        rows={4}
        placeholder="Enter reason for cancellation..."
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <button
          onClick={submitCancelTrip}
          disabled={!cancelReason || loading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            backgroundColor: "#e53e3e",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: cancelReason && !loading ? "pointer" : "not-allowed",
            fontWeight: 600,
            fontSize: "14px",
            transition: "background-color 0.2s",
            height: "44px",
            minWidth: "100px",
          }}
          onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = "#c53030"))}
          onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = "#e53e3e"))}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            style={{ width: "18px", height: "18px" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Submit
        </button>

        <button
          onClick={() => setShowCancelModal(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#4a5568",
            color: "#fff",
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
            height: "44px",
            minWidth: "100px",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = "#2d3748"))}
          onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = "#4a5568"))}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
        {/* Emergency Modal */}
      {showEmergencyModal && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    }}
  >
    <div
      style={{
        backgroundColor: "#1f1f1f",
        color: "#fff",
        padding: "20px",
        borderRadius: "12px",
        width: "360px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e53e3e",
            color: "#fff",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            marginRight: "8px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            style={{ width: "20px", height: "20px" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
          </svg>
        </span>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Emergency Stop</h2>
      </div>

      <textarea
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #444",
          backgroundColor: "#2a2a2a",
          color: "#fff",
          resize: "none",
          marginBottom: "16px",
          fontSize: "14px",
        }}
        rows={4}
        placeholder="Enter reason for emergency stop..."
        value={emergencyReason}
        onChange={(e) => setEmergencyReason(e.target.value)}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
        <button
          onClick={submitEmergencyStop}
          disabled={!emergencyReason || loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#38a169",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: emergencyReason && !loading ? "pointer" : "not-allowed",
            fontWeight: 600,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = "#2f855a"))}
          onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = "#38a169"))}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            style={{ width: "18px", height: "18px" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Submit
        </button>

        <button
          onClick={() => setShowEmergencyModal(false)}
          style={{
            backgroundColor: "#4a5568",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = "#2d3748"))}
          onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = "#4a5568"))}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      </IonContent>
    </IonPage>
  );
};

export default CurrentTrip;
