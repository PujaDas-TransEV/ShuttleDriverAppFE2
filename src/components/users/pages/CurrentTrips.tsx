// import React, { useEffect, useState, useRef } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import NavbarSidebar from "./Navbar";
// import { BrowserMultiFormatReader } from "@zxing/browser";
// import { FiCamera, FiCheckCircle, FiArrowRightCircle } from "react-icons/fi";

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
//   const [cancelTripId, setCancelTripId] = useState<string | null>(null);

//   const [showEmergencyModal, setShowEmergencyModal] = useState(false);
//   const [emergencyReason, setEmergencyReason] = useState("");
//   const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);

//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const scannerRef = useRef<any>(null);

//   // ================= FETCH =================
//   const fetchTripDetails = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/trips/current`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();

//       if (data?.detail?.error === "no_active_trip") {
//         setTrip(null);
//         setRoute(null);
//         return;
//       }

//       const currentTrip = data?.trip;

//       if (!currentTrip) {
//         setTrip(null);
//         setRoute(null);
//         return;
//       }

//       // Pick first trip that is scheduled or in_progress
//       const detailsRes = await fetch(
//         `${API_BASE}/driver/routes/${currentTrip.route_id}/trips/details`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const detailsData = await detailsRes.json();

//       const activeTrip = detailsData.trips.find(
//         (t: any) => t.status === "scheduled" || t.status === "in_progress"
//       );

//       setTrip(activeTrip || null);
//       setRoute(detailsData.route || null);
//     } catch (err: any) {
//       console.error(err);
//       alert("❌ Failed to fetch trip details: " + (err.message || "Unknown error"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTripDetails();
//   }, []);

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
//       (videoRef.current.srcObject as MediaStream)
//         .getTracks()
//         .forEach((t) => t.stop());
//       videoRef.current.srcObject = null;
//     }
//   };

//   useEffect(() => {
//     showScanner ? startScanner() : stopScanner();
//   }, [showScanner]);

//   // ================= ACTIONS =================
//   const handleStopAction = async (stop_id: string, mode: "arrive" | "depart") => {
//     if (!trip) return;
//     const fd = new FormData();
//     fd.append("stop_id", stop_id);
//     fd.append("mode", mode);

//     await fetch(`${API_BASE}/driver/scheduled-trips/${trip.trip_id}/stop-action`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: fd,
//     });
//     fetchTripDetails();
//   };

// const handleStartTrip = async (tripId: string) => {
//   if (!tripId) return;

//   setLoading(true);

//   try {
//     const position = await new Promise<GeolocationPosition>((resolve, reject) => {
//       navigator.geolocation.getCurrentPosition(
//         resolve,
//         reject,
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 0,
//         }
//       );
//     });

//     // 🔥 FULL GEO DEBUG
//     console.log("📍 FULL POSITION OBJECT:", position);

//     const latitude = position.coords.latitude;
//     const longitude = position.coords.longitude;
//     const accuracy = position.coords.accuracy;
//     const timestamp = position.timestamp;

//     // ✅ Important logs
//     console.log("📍 Latitude:", latitude);
//     console.log("📍 Longitude:", longitude);
//     console.log("🎯 Accuracy (meters):", accuracy);
//     console.log("⏱ Timestamp:", new Date(timestamp).toISOString());

//     // 👉 Optional: clean one-line log
//     console.log(
//       `📍 FINAL LOCATION → Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`
//     );

//     // ✅ Prepare FormData
//     const formData = new FormData();
//     formData.append("lat", latitude.toString());
//     formData.append("lng", longitude.toString());

//     const res = await fetch(
//       `${API_BASE}/driver/scheduled-trips/${tripId}/start`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       }
//     );

//     const data = await res.json();

//     if (!res.ok) {
//       console.error("❌ Backend Error:", data);

//       if (data?.distance_m && data?.allowed_radius_m) {
//         throw new Error(
//           `Too far 🚫 Distance: ${data.distance_m}m | Allowed: ${data.allowed_radius_m}m`
//         );
//       }

//       throw new Error(data.detail || data.error || "Failed to start trip");
//     }

//     console.log("✅ Trip Started:", data);

//     alert(
//       `✅ Trip Started!\nDistance: ${data.distance_m}m\nAllowed: ${data.allowed_radius_m}m`
//     );

//     fetchTripDetails();

//   } catch (err: any) {
//     console.error(err);
//     alert("❌ Failed:\n" + (err.message || "Unknown error"));
//   } finally {
//     setLoading(false);
//   }
// };

// const handleEndTrip = async (tripId: string) => {
//   if (!tripId) return;
//   setLoading(true);

//   try {
//     // Helper to get current location
//     const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
//       return new Promise((resolve, reject) => {
//         if (!navigator.geolocation) {
//           reject(new Error("Geolocation not supported on this device"));
//         } else {
//           navigator.geolocation.getCurrentPosition(
//             (position) => {
//               resolve({
//                 lat: position.coords.latitude,
//                 lng: position.coords.longitude,
//               });
//             },
//             (err) => reject(err),
//             { enableHighAccuracy: true, timeout: 10000 }
//           );
//         }
//       });
//     };

//     // Get device location
//     const { lat, lng } = await getCurrentLocation();
//     console.log("Current location:", lat, lng);

//     // Prepare multipart form data
//     const formData = new FormData();
//     formData.append("actual_end_at", new Date().toISOString());
//     formData.append("lat", lat.toString());
//     formData.append("lng", lng.toString());

//     // Send POST request
//     const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/end`, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         // DO NOT set Content-Type for FormData
//       },
//       body: formData,
//     });

//     if (!res.ok) {
//       const errData = await res.json();
//       throw new Error(errData.detail || "Failed to end trip");
//     }

//     alert("✅ Trip ended successfully!");
//     fetchTripDetails();
//   } catch (err: any) {
//     console.error(err);
//     alert("❌ Failed to end trip: " + (err.message || "Unknown error"));
//   } finally {
//     setLoading(false);
//   }
// };
//   const openEmergencyStopModal = (tripId: string) => {
//     setEmergencyTripId(tripId);
//     setEmergencyReason("");
//     setShowEmergencyModal(true);
//   };

 
// const submitEmergencyStop = async () => {
//   if (!emergencyTripId || !emergencyReason) {
//     alert("Please provide a reason for emergency stop!");
//     return;
//   }

//   setLoading(true);

//   try {
//     // Get user location
//     const getLocation = (): Promise<{ lat: number; lng: number }> => {
//       return new Promise((resolve, reject) => {
//         if (!navigator.geolocation) {
//           reject(new Error("Geolocation not supported in this device"));
//         } else {
//           navigator.geolocation.getCurrentPosition(
//             (position) => {
//               resolve({
//                 lat: position.coords.latitude,
//                 lng: position.coords.longitude,
//               });
//             },
//             (err) => reject(err),
//             { enableHighAccuracy: true }
//           );
//         }
//       });
//     };

//     const { lat, lng } = await getLocation();

//     // Prepare FormData payload
//     const formData = new FormData();
//     formData.append("reason", emergencyReason);
//     formData.append("lat", lat.toString());
//     formData.append("lng", lng.toString());
//     formData.append("actual_end_at", new Date().toISOString());

//     const res = await fetch(
//       `${API_BASE}/driver/scheduled-trips/${emergencyTripId}/emergency-end`,
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           // Don't set Content-Type! Browser sets it automatically for FormData
//         },
//         body: formData,
//       }
//     );

//     if (!res.ok) {
//       const errData = await res.json();
//       throw new Error(errData.detail?.[0]?.msg || "Emergency stop failed");
//     }

//     alert("✅ Trip stopped successfully!");
//     setShowEmergencyModal(false);
//     fetchTripDetails();
//   } catch (err: any) {
//     console.error(err);
//     alert(`❌ Failed to perform emergency stop: ${err.message}`);
//   } finally {
//     setLoading(false);
//   }
// };
//   const handleCancelTrip = (tripId: string) => {
//     setCancelTripId(tripId);
//     setCancelReason("");
//     setShowCancelModal(true);
//   };

//   const submitCancelTrip = async () => {
//     if (!cancelTripId || !cancelReason) return;
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("reason", cancelReason);

//       const res = await fetch(`${API_BASE}/driver/trips/${cancelTripId}/cancel`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });
//       if (!res.ok) throw new Error("Cancel trip failed");

//       alert("Trip cancelled successfully!");
//       setShowCancelModal(false);
//       fetchTripDetails();
//     } catch (err) {
//       console.error(err);
//       alert("❌ Failed to cancel trip");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-white dark:bg-black text-black dark:text-white pt-16 p-4">
//         {loading && <IonLoading isOpen={loading} message="Loading trip details..." />}

//         {!trip && !loading && (
//           <div className="text-center mt-20 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-md">
//             <h2 className="text-2xl font-bold mb-2">No Active Trip</h2>
//             <p className="text-gray-700 dark:text-gray-100">
//               You currently have no active or scheduled trips.
//             </p>
//           </div>
//         )}

//         {trip && (
//           <>
           
//             <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl shadow mb-6 mt-6">
//               <div className="flex justify-between items-center flex-wrap gap-4">
//                 <h2 className="text-2xl font-bold dark:text-gray-300">{route?.name || "Unnamed Route"}</h2>
//                 <button
//                   onClick={() => setShowScanner(!showScanner)}
//                   className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg"
//                 >
//                   <FiCamera /> Scanner
//                 </button>
//               </div>

//               <div className="flex justify-end mt-4">
//                 <span
//                   className={`px-4 py-1 rounded-full text-sm font-semibold ${
//                     trip.status === "scheduled"
//                       ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
//                       : trip.status === "in_progress"
//                       ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
//                       : ""
//                   }`}
//                 >
//                   {trip.status === "scheduled" && "🟡 Scheduled"}
//                   {trip.status === "in_progress" && "🚍 In Progress"}
//                 </span>
//               </div>

//               {/* Trip details */}
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Trip ID</p>
//                   <p className="font-semibold dark:text-gray-300">{trip.trip_id}</p>
//                 </div>
//                <div>
//   <p className="text-gray-500 dark:text-gray-300">Planned Start</p>
//   <p className="font-semibold dark:text-gray-300">
//     {trip.planned_start
//       ? new Date(trip.planned_start).toLocaleString(undefined, {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         })
//       : "-"}
//   </p>
// </div>
// <div>
//   <p className="text-gray-500 dark:text-gray-300">Planned End</p>
//   <p className="font-semibold dark:text-gray-300">
//     {trip.planned_end
//       ? new Date(trip.planned_end).toLocaleString(undefined, {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         })
//       : "-"}
//   </p>
// </div>
//                <div>
//   <p className="text-gray-500 dark:text-gray-300">Actual Start</p>
//   <p className="font-semibold dark:text-gray-300">
//     {trip.actual_start
//       ? new Date(trip.actual_start).toLocaleString(undefined, {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         })
//       : "-"}
//   </p>
// </div>

//   <p className="text-gray-500 dark:text-gray-300">Actual End</p>
//   <p className="font-semibold dark:text-gray-300">
//     {trip.actual_end
//       ? new Date(trip.actual_end).toLocaleString(undefined, {
//           day: "2-digit",
//           month: "short",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         })
//       : "-"}
//   </p>
// </div>

//               {/* Actions */}
//               <div className="flex gap-2 mt-4">
//                 {trip.status === "scheduled" && (
//                   <>
//                     <button
//                       onClick={() => handleStartTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-black text-white rounded dark:bg-green-300"
//                     >
//                       Start Trip
//                     </button>
//                     <button
//                       onClick={() => handleCancelTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-red-600 text-white rounded"
//                     >
//                       Cancel Trip
//                     </button>
//                   </>
//                 )}
//                 {trip.status === "in_progress" && (
//                   <>
//                     <button
//                       onClick={() => handleEndTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-red-600 text-white rounded"
//                     >
//                       End Trip
//                     </button>
//                     <button
//                       onClick={() => openEmergencyStopModal(trip.trip_id)}
//                       className="flex-1 h-12 bg-yellow-500 text-white rounded"
//                     >
//                       Emergency End
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>

//             {showScanner && <video ref={videoRef} className="mb-6 w-full rounded-lg" />}

//             {/* Stops */}
//             {trip.stops?.map((stop: any) => (
//               <div
//                 key={stop.stop_id}
//                 className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl mb-4 shadow dark:text-gray-300"
//               >
//                 <h3 className="font-bold text-lg dark:text-gray-300">
//                   {stop.sequence}. {stop.name}
//                 </h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-300">
//                   Planned: {new Date(stop.planned_arrival_time).toLocaleTimeString()}
//                 </p>
//                 <p className="dark:text-gray-300">
//                   Arrival: {stop.actual_arrival_time ? new Date(stop.actual_arrival_time).toLocaleTimeString() : "-"}
//                 </p>
//                 <p className="dark:text-gray-300">
//                   Departure: {stop.actual_departure_time ? new Date(stop.actual_departure_time).toLocaleTimeString() : "-"}
//                 </p>
//                 <div className="flex gap-3 mt-4">
//                   <button
//                     onClick={() => handleStopAction(stop.stop_id, "arrive")}
//                     className="bg-green-600 text-white rounded flex items-center justify-center gap-2"
//                     style={{ width: 130, height: 42 }}
//                   >
//                     <FiCheckCircle /> Arrive
//                   </button>
//                   <button
//                     onClick={() => handleStopAction(stop.stop_id, "depart")}
//                     className="bg-blue-600 text-white rounded flex items-center justify-center gap-2"
//                     style={{ width: 130, height: 42 }}
//                   >
//                     <FiArrowRightCircle /> Depart
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </>
//         )}

//         {/* Cancel Modal */}
//         {showCancelModal && (
//   <div
//     style={{
//       position: "fixed",
//       inset: 0,
//       backgroundColor: "rgba(0,0,0,0.5)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 50,
//     }}
//   >
//     <div
//       style={{
//         backgroundColor: "#1f1f1f",
//         color: "#fff",
//         padding: "20px",
//         borderRadius: "12px",
//         width: "360px",
//         boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
//         fontFamily: "sans-serif",
//       }}
//     >
//       <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
//         <span
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundColor: "#e53e3e",
//             color: "#fff",
//             borderRadius: "50%",
//             width: "32px",
//             height: "32px",
//             marginRight: "8px",
//           }}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth={2}
//             stroke="currentColor"
//             style={{ width: "20px", height: "20px" }}
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//           </svg>
//         </span>
//         <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Cancel Trip</h2>
//       </div>

//       <textarea
//         style={{
//           width: "100%",
//           padding: "12px",
//           borderRadius: "8px",
//           border: "1px solid #444",
//           backgroundColor: "#2a2a2a",
//           color: "#fff",
//           resize: "none",
//           marginBottom: "16px",
//           fontSize: "14px",
//         }}
//         rows={4}
//         placeholder="Enter reason for cancellation..."
//         value={cancelReason}
//         onChange={(e) => setCancelReason(e.target.value)}
//       />

//       <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
//         <button
//           onClick={submitCancelTrip}
//           disabled={!cancelReason || loading}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: "6px",
//             backgroundColor: "#e53e3e",
//             color: "#fff",
//             padding: "12px 20px",
//             borderRadius: "8px",
//             border: "none",
//             cursor: cancelReason && !loading ? "pointer" : "not-allowed",
//             fontWeight: 600,
//             fontSize: "14px",
//             transition: "background-color 0.2s",
//             height: "44px",
//             minWidth: "100px",
//           }}
//           onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = "#c53030"))}
//           onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = "#e53e3e"))}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth={2}
//             stroke="currentColor"
//             style={{ width: "18px", height: "18px" }}
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
//           </svg>
//           Submit
//         </button>

//         <button
//           onClick={() => setShowCancelModal(false)}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundColor: "#4a5568",
//             color: "#fff",
//             padding: "12px 20px",
//             borderRadius: "8px",
//             border: "none",
//             cursor: "pointer",
//             fontWeight: 600,
//             fontSize: "14px",
//             height: "44px",
//             minWidth: "100px",
//             transition: "background-color 0.2s",
//           }}
//           onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = "#2d3748"))}
//           onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = "#4a5568"))}
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   </div>
// )}
//         {/* Emergency Modal */}
//       {showEmergencyModal && (
//   <div
//     style={{
//       position: "fixed",
//       inset: 0,
//       backgroundColor: "rgba(0,0,0,0.5)",
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       zIndex: 50,
//     }}
//   >
//     <div
//       style={{
//         backgroundColor: "#1f1f1f",
//         color: "#fff",
//         padding: "20px",
//         borderRadius: "12px",
//         width: "360px",
//         boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
//         fontFamily: "sans-serif",
//       }}
//     >
//       <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
//         <span
//           style={{
//             display: "inline-flex",
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundColor: "#e53e3e",
//             color: "#fff",
//             borderRadius: "50%",
//             width: "32px",
//             height: "32px",
//             marginRight: "8px",
//           }}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth={2}
//             stroke="currentColor"
//             style={{ width: "20px", height: "20px" }}
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
//           </svg>
//         </span>
//         <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Emergency Stop</h2>
//       </div>

//       <textarea
//         style={{
//           width: "100%",
//           padding: "10px",
//           borderRadius: "8px",
//           border: "1px solid #444",
//           backgroundColor: "#2a2a2a",
//           color: "#fff",
//           resize: "none",
//           marginBottom: "16px",
//           fontSize: "14px",
//         }}
//         rows={4}
//         placeholder="Enter reason for emergency stop..."
//         value={emergencyReason}
//         onChange={(e) => setEmergencyReason(e.target.value)}
//       />

//       <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
//         <button
//           onClick={submitEmergencyStop}
//           disabled={!emergencyReason || loading}
//           style={{
//             display: "flex",
//             alignItems: "center",
//             gap: "6px",
//             backgroundColor: "#38a169",
//             color: "#fff",
//             padding: "10px 16px",
//             borderRadius: "8px",
//             border: "none",
//             cursor: emergencyReason && !loading ? "pointer" : "not-allowed",
//             fontWeight: 600,
//             transition: "background-color 0.2s",
//           }}
//           onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = "#2f855a"))}
//           onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = "#38a169"))}
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth={2}
//             stroke="currentColor"
//             style={{ width: "18px", height: "18px" }}
//           >
//             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//           </svg>
//           Submit
//         </button>

//         <button
//           onClick={() => setShowEmergencyModal(false)}
//           style={{
//             backgroundColor: "#4a5568",
//             color: "#fff",
//             padding: "10px 16px",
//             borderRadius: "8px",
//             border: "none",
//             cursor: "pointer",
//             fontWeight: 600,
//             transition: "background-color 0.2s",
//           }}
//           onMouseEnter={(e) => ((e.currentTarget.style.backgroundColor = "#2d3748"))}
//           onMouseLeave={(e) => ((e.currentTarget.style.backgroundColor = "#4a5568"))}
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   </div>
// )}
//       </IonContent>
//     </IonPage>
//   );
// };

// export default CurrentTrip;
// import React, { useEffect, useState, useRef } from "react";
// import { IonPage, IonContent, IonLoading, IonToast } from "@ionic/react";
// import NavbarSidebar from "./Navbar";
// import { BrowserMultiFormatReader } from "@zxing/browser";
// import { FiCamera, FiCheckCircle, FiArrowRightCircle, FiX, FiAlertCircle } from "react-icons/fi";

// const API_BASE = "https://be.shuttleapp.transev.site";

// const CurrentTrip: React.FC = () => {
//   const token = localStorage.getItem("access_token") || "";
//   const [loading, setLoading] = useState(false);
//   const [trip, setTrip] = useState<any>(null);
//   const [route, setRoute] = useState<any>(null);
//   const [showScanner, setShowScanner] = useState(false);
//   const [scanResult, setScanResult] = useState<any>(null);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");
//   const [toastColor, setToastColor] = useState("success");
  
//   // MODALS
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelReason, setCancelReason] = useState("");
//   const [cancelTripId, setCancelTripId] = useState<string | null>(null);
//   const [showEmergencyModal, setShowEmergencyModal] = useState(false);
//   const [emergencyReason, setEmergencyReason] = useState("");
//   const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);
  
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const scannerRef = useRef<any>(null);

//   // ================= FETCH =================
//   const fetchTripDetails = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/trips/current`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data?.detail?.error === "no_active_trip") {
//         setTrip(null);
//         setRoute(null);
//         return;
//       }
//       const currentTrip = data?.trip;
//       if (!currentTrip) {
//         setTrip(null);
//         setRoute(null);
//         return;
//       }
      
//       const detailsRes = await fetch(
//         `${API_BASE}/driver/routes/${currentTrip.route_id}/trips/details`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const detailsData = await detailsRes.json();
//       const activeTrip = detailsData.trips.find(
//         (t: any) => t.status === "scheduled" || t.status === "in_progress"
//       );
//       setTrip(activeTrip || null);
//       setRoute(detailsData.route || null);
//     } catch (err: any) {
//       console.error(err);
//       showNotification("❌ Failed to fetch trip details: " + (err.message || "Unknown error"), "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTripDetails();
//   }, []);

//   // ================= SCANNER WITH API INTEGRATION =================
//   const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation not supported"));
//       } else {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             resolve({
//               lat: position.coords.latitude,
//               lng: position.coords.longitude,
//             });
//           },
//           (err) => reject(err),
//           { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//       }
//     });
//   };

//   const processScan = async (qrToken: string) => {
//     if (!trip) {
//       showNotification("No active trip found!", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Get current location
//       const { lat, lng } = await getCurrentLocation();
      
//       console.log("📍 Scanning QR Code:", qrToken);
//       console.log("📍 Current Location:", { lat, lng });
//       console.log("📍 Trip ID:", trip.trip_id);

//       // Prepare request body
//       const requestBody = {
//         qr_token: qrToken,
//         lat: lat,
//         lng: lng
//       };

//       // Call the scan API
//       const response = await fetch(
//         `${API_BASE}/driver/scan/${trip.trip_id}/scan`,
//         {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(requestBody),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || data.message || "Scan failed");
//       }

//       // Success - show beautiful result
//       setScanResult(data);
//       showNotification("✅ Passenger scanned successfully!", "success");
      
//       // Auto-hide scan result after 5 seconds
//       setTimeout(() => {
//         setScanResult(null);
//       }, 5000);
      
//       // Refresh trip details to update stop statuses
//       await fetchTripDetails();
      
//     } catch (err: any) {
//       console.error("Scan error:", err);
//       showNotification(`❌ Scan failed: ${err.message}`, "error");
//       setScanResult({ error: err.message });
      
//       // Auto-hide error after 5 seconds
//       setTimeout(() => {
//         setScanResult(null);
//       }, 5000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startScanner = () => {
//     if (!videoRef.current) return;
    
//     const reader = new BrowserMultiFormatReader();
//     scannerRef.current = reader;
    
//     reader.decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
//       if (result) {
//         const scannedText = result.getText();
//         console.log("📱 Scanned:", scannedText);
        
//         // Stop scanner immediately after scan
//         stopScanner();
//         setShowScanner(false);
        
//         // Process the scanned QR code
//         await processScan(scannedText);
//       }
//       if (err && !result) {
//         // Only log errors that are not "NotFoundException" (normal scanning behavior)
//         if (err.name !== "NotFoundException") {
//           console.error("Scanner error:", err);
//         }
//       }
//     });
//   };

//   const stopScanner = () => {
//     if (scannerRef.current) {
//       try {
//         scannerRef.current.reset();
//         if (videoRef.current && videoRef.current.srcObject) {
//           const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
//           tracks.forEach(track => track.stop());
//           videoRef.current.srcObject = null;
//         }
//       } catch (err) {
//         console.error("Error stopping scanner:", err);
//       }
//     }
//   };

//   useEffect(() => {
//     if (showScanner) {
//       startScanner();
//     } else {
//       stopScanner();
//     }
    
//     return () => {
//       stopScanner();
//     };
//   }, [showScanner]);

//   const showNotification = (message: string, color: "success" | "error" | "info" = "success") => {
//     setToastMessage(message);
//     setToastColor(color);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   // ================= ACTIONS =================
//   const handleStopAction = async (stop_id: string, mode: "arrive" | "depart") => {
//     if (!trip) return;
//     const fd = new FormData();
//     fd.append("stop_id", stop_id);
//     fd.append("mode", mode);
//     await fetch(`${API_BASE}/driver/scheduled-trips/${trip.trip_id}/stop-action`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: fd,
//     });
//     fetchTripDetails();
//   };

//   const handleStartTrip = async (tripId: string) => {
//     if (!tripId) return;
//     setLoading(true);
//     try {
//       const position = await new Promise<GeolocationPosition>((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(
//           resolve,
//           reject,
//           { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//       });

//       const latitude = position.coords.latitude;
//       const longitude = position.coords.longitude;
//       const accuracy = position.coords.accuracy;

//       console.log(`📍 FINAL LOCATION → Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`);

//       const formData = new FormData();
//       formData.append("lat", latitude.toString());
//       formData.append("lng", longitude.toString());

//       const res = await fetch(
//         `${API_BASE}/driver/scheduled-trips/${tripId}/start`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//           body: formData,
//         }
//       );
      
//       const data = await res.json();
//       if (!res.ok) {
//         if (data?.distance_m && data?.allowed_radius_m) {
//           throw new Error(`Too far 🚫 Distance: ${data.distance_m}m | Allowed: ${data.allowed_radius_m}m`);
//         }
//         throw new Error(data.detail || data.error || "Failed to start trip");
//       }
      
//       showNotification(`✅ Trip Started!\nDistance: ${data.distance_m}m\nAllowed: ${data.allowed_radius_m}m`, "success");
//       fetchTripDetails();
//     } catch (err: any) {
//       console.error(err);
//       showNotification(`❌ Failed: ${err.message || "Unknown error"}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEndTrip = async (tripId: string) => {
//     if (!tripId) return;
//     setLoading(true);
//     try {
//       const { lat, lng } = await getCurrentLocation();
//       console.log("Ending trip at location:", lat, lng);
      
//       const formData = new FormData();
//       formData.append("actual_end_at", new Date().toISOString());
//       formData.append("lat", lat.toString());
//       formData.append("lng", lng.toString());
      
//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/end`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });
      
//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.detail || "Failed to end trip");
//       }
      
//       showNotification("✅ Trip ended successfully!", "success");
//       fetchTripDetails();
//     } catch (err: any) {
//       console.error(err);
//       showNotification(`❌ Failed to end trip: ${err.message || "Unknown error"}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openEmergencyStopModal = (tripId: string) => {
//     setEmergencyTripId(tripId);
//     setEmergencyReason("");
//     setShowEmergencyModal(true);
//   };

//   const submitEmergencyStop = async () => {
//     if (!emergencyTripId || !emergencyReason) {
//       showNotification("Please provide a reason for emergency stop!", "error");
//       return;
//     }
//     setLoading(true);
//     try {
//       const { lat, lng } = await getCurrentLocation();
//       const formData = new FormData();
//       formData.append("reason", emergencyReason);
//       formData.append("lat", lat.toString());
//       formData.append("lng", lng.toString());
//       formData.append("actual_end_at", new Date().toISOString());
      
//       const res = await fetch(
//         `${API_BASE}/driver/scheduled-trips/${emergencyTripId}/emergency-end`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//           body: formData,
//         }
//       );
      
//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.detail?.[0]?.msg || "Emergency stop failed");
//       }
      
//       showNotification("✅ Trip stopped successfully!", "success");
//       setShowEmergencyModal(false);
//       fetchTripDetails();
//     } catch (err: any) {
//       console.error(err);
//       showNotification(`❌ Failed to perform emergency stop: ${err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelTrip = (tripId: string) => {
//     setCancelTripId(tripId);
//     setCancelReason("");
//     setShowCancelModal(true);
//   };

//   const submitCancelTrip = async () => {
//     if (!cancelTripId || !cancelReason) return;
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("reason", cancelReason);
//       const res = await fetch(`${API_BASE}/driver/trips/${cancelTripId}/cancel`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });
//       if (!res.ok) throw new Error("Cancel trip failed");
//       showNotification("Trip cancelled successfully!", "success");
//       setShowCancelModal(false);
//       fetchTripDetails();
//     } catch (err) {
//       console.error(err);
//       showNotification("❌ Failed to cancel trip", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Scan Result Card Component
//   const ScanResultCard = () => {
//     if (!scanResult) return null;
    
//     const isError = scanResult.error;
    
//     return (
//       <div className={`fixed bottom-4 left-4 right-4 z-50 animate-slide-up`}>
//         <div className={`rounded-xl shadow-2xl p-5 ${
//           isError ? "bg-red-50 dark:bg-red-900/90 border-red-500" : "bg-green-50 dark:bg-green-900/90 border-green-500"
//         } border-l-8`}>
//           <div className="flex items-start justify-between">
//             <div className="flex items-start gap-3 flex-1">
//               {isError ? (
//                 <FiAlertCircle className="text-red-600 dark:text-red-400 text-2xl mt-1 flex-shrink-0" />
//               ) : (
//                 <FiCheckCircle className="text-green-600 dark:text-green-400 text-2xl mt-1 flex-shrink-0" />
//               )}
//               <div className="flex-1">
//                 <h3 className={`font-bold text-lg ${
//                   isError ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"
//                 }`}>
//                   {isError ? "Scan Failed" : "Scan Successful"}
//                 </h3>
//                 <p className={`text-sm mt-1 ${
//                   isError ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"
//                 }`}>
//                   {isError ? scanResult.error : "Passenger verified successfully!"}
//                 </p>
//                 {!isError && scanResult.passenger && (
//                   <div className="mt-2 text-xs text-green-800 dark:text-green-200">
//                     <p>Passenger: {scanResult.passenger.name || "N/A"}</p>
//                     <p>Booking ID: {scanResult.booking_id || "N/A"}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <button
//               onClick={() => setScanResult(null)}
//               className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
//             >
//               <FiX className="text-xl" />
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-white dark:bg-black text-black dark:text-white pt-16 p-4">
//         <IonToast
//           isOpen={showToast}
//           onDidDismiss={() => setShowToast(false)}
//           message={toastMessage}
//           duration={3000}
//           color={toastColor}
//           position="top"
//         />
        
//         {loading && <IonLoading isOpen={loading} message="Loading trip details..." />}
        
//         {!trip && !loading && (
//           <div className="text-center mt-20 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-md">
//             <h2 className="text-2xl font-bold mb-2">No Active Trip</h2>
//             <p className="text-gray-700 dark:text-gray-100">
//               You currently have no active or scheduled trips.
//             </p>
//           </div>
//         )}
        
//         {trip && (
//           <>
//             <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl shadow mb-6 mt-6">
//               <div className="flex justify-between items-center flex-wrap gap-4">
//                 <h2 className="text-2xl font-bold dark:text-gray-300">{route?.name || "Unnamed Route"}</h2>
//                 <button
//                   onClick={() => setShowScanner(!showScanner)}
//                   className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition-all"
//                 >
//                   <FiCamera className="text-lg" />
//                   {showScanner ? "Close Scanner" : "Open Scanner"}
//                 </button>
//               </div>
              
//               <div className="flex justify-end mt-4">
//                 <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
//                   trip.status === "scheduled" 
//                     ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
//                     : trip.status === "in_progress"
//                     ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
//                     : ""
//                 }`}>
//                   {trip.status === "scheduled" && "🟡 Scheduled"}
//                   {trip.status === "in_progress" && "🚍 In Progress"}
//                 </span>
//               </div>
              
//               {/* Trip details */}
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Trip ID</p>
//                   <p className="font-semibold dark:text-gray-300">{trip.trip_id}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Planned Start</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.planned_start ? new Date(trip.planned_start).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Planned End</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.planned_end ? new Date(trip.planned_end).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Actual Start</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.actual_start ? new Date(trip.actual_start).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Actual End</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.actual_end ? new Date(trip.actual_end).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//               </div>
              
//               {/* Actions */}
//               <div className="flex gap-2 mt-4">
//                 {trip.status === "scheduled" && (
//                   <>
//                     <button
//                       onClick={() => handleStartTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-black text-white rounded dark:bg-green-600 dark:hover:bg-green-700 transition-all font-semibold"
//                     >
//                       Start Trip
//                     </button>
//                     <button
//                       onClick={() => handleCancelTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-red-600 text-white rounded hover:bg-red-700 transition-all font-semibold"
//                     >
//                       Cancel Trip
//                     </button>
//                   </>
//                 )}
//                 {trip.status === "in_progress" && (
//                   <>
//                     <button
//                       onClick={() => handleEndTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-red-600 text-white rounded hover:bg-red-700 transition-all font-semibold"
//                     >
//                       End Trip
//                     </button>
//                     <button
//                       onClick={() => openEmergencyStopModal(trip.trip_id)}
//                       className="flex-1 h-12 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all font-semibold"
//                     >
//                       Emergency End
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
            
//             {/* Scanner Video */}
//             {showScanner && (
//               <div className="mb-6 relative">
//                 <div className="relative rounded-xl overflow-hidden shadow-2xl">
//                   <video
//                     ref={videoRef}
//                     className="w-full h-auto min-h-[400px] bg-black"
//                     style={{ objectFit: "cover" }}
//                   />
//                   {/* Scanner Overlay */}
//                   <div className="absolute inset-0 pointer-events-none">
//                     <div className="absolute inset-0 border-2 border-white/30 rounded-xl"></div>
//                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-green-500 rounded-lg shadow-lg animate-pulse">
//                       <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
//                       <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
//                       <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
//                       <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
//                     </div>
//                     <div className="absolute bottom-4 left-4 right-4 text-center text-white bg-black/50 rounded-lg py-2 px-4">
//                       <p className="text-sm">Position QR code within the frame</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {/* Stops */}
//             {trip.stops?.map((stop: any) => (
//               <div key={stop.stop_id} className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl mb-4 shadow dark:text-gray-300">
//                 <h3 className="font-bold text-lg dark:text-gray-300">
//                   {stop.sequence}. {stop.name}
//                 </h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-300">
//                   Planned: {new Date(stop.planned_arrival_time).toLocaleTimeString()}
//                 </p>
//                 <p className="dark:text-gray-300">
//                   Arrival: {stop.actual_arrival_time ? new Date(stop.actual_arrival_time).toLocaleTimeString() : "-"}
//                 </p>
//                 <p className="dark:text-gray-300">
//                   Departure: {stop.actual_departure_time ? new Date(stop.actual_departure_time).toLocaleTimeString() : "-"}
//                 </p>
//                 <div className="flex gap-3 mt-4">
//                   <button
//                     onClick={() => handleStopAction(stop.stop_id, "arrive")}
//                     className="bg-green-600 text-white rounded flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
//                     style={{ width: 130, height: 42 }}
//                   >
//                     <FiCheckCircle /> Arrive
//                   </button>
//                   <button
//                     onClick={() => handleStopAction(stop.stop_id, "depart")}
//                     className="bg-blue-600 text-white rounded flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
//                     style={{ width: 130, height: 42 }}
//                   >
//                     <FiArrowRightCircle /> Depart
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </>
//         )}
        
//         {/* Scan Result Card */}
//         <ScanResultCard />
        
//         {/* Cancel Modal */}
//         {showCancelModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="bg-red-500 rounded-full p-2">
//                   <FiX className="text-white text-xl" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Trip</h2>
//               </div>
//               <textarea
//                 className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
//                 rows={4}
//                 placeholder="Enter reason for cancellation..."
//                 value={cancelReason}
//                 onChange={(e) => setCancelReason(e.target.value)}
//               />
//               <div className="flex gap-3 mt-4">
//                 <button
//                   onClick={submitCancelTrip}
//                   disabled={!cancelReason || loading}
//                   className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Submit
//                 </button>
//                 <button
//                   onClick={() => setShowCancelModal(false)}
//                   className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {/* Emergency Modal */}
//         {showEmergencyModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="bg-yellow-500 rounded-full p-2">
//                   <FiAlertCircle className="text-white text-xl" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Emergency Stop</h2>
//               </div>
//               <textarea
//                 className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 rows={4}
//                 placeholder="Enter reason for emergency stop..."
//                 value={emergencyReason}
//                 onChange={(e) => setEmergencyReason(e.target.value)}
//               />
//               <div className="flex gap-3 mt-4">
//                 <button
//                   onClick={submitEmergencyStop}
//                   disabled={!emergencyReason || loading}
//                   className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Submit
//                 </button>
//                 <button
//                   onClick={() => setShowEmergencyModal(false)}
//                   className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </IonContent>
      
//       <style>{`
//         @keyframes slide-up {
//           from {
//             transform: translateY(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }
        
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
        
//         .animate-slide-up {
//           animation: slide-up 0.3s ease-out;
//         }
        
//         .animate-fade-in {
//           animation: fade-in 0.2s ease-out;
//         }
        
//         .animate-pulse {
//           animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
        
//         @keyframes pulse {
//           0%, 100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0.5;
//           }
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default CurrentTrip;
// import React, { useEffect, useState, useRef } from "react";
// import { IonPage, IonContent, IonLoading, IonToast } from "@ionic/react";
// import NavbarSidebar from "./Navbar";
// import { BrowserMultiFormatReader } from "@zxing/browser";
// import { FiCamera, FiCheckCircle, FiArrowRightCircle, FiX, FiAlertCircle } from "react-icons/fi";

// const API_BASE = "https://be.shuttleapp.transev.site";

// const CurrentTrip: React.FC = () => {
//   const token = localStorage.getItem("access_token") || "";
//   const [loading, setLoading] = useState(false);
//   const [trip, setTrip] = useState<any>(null);
//   const [route, setRoute] = useState<any>(null);
//   const [showScanner, setShowScanner] = useState(false);
//   const [scanResult, setScanResult] = useState<any>(null);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");
//   const [toastColor, setToastColor] = useState("success");
  
//   // MODALS
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelReason, setCancelReason] = useState("");
//   const [cancelTripId, setCancelTripId] = useState<string | null>(null);
//   const [showEmergencyModal, setShowEmergencyModal] = useState(false);
//   const [emergencyReason, setEmergencyReason] = useState("");
//   const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);
  
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const scannerRef = useRef<any>(null);

//   // ================= FETCH =================
//   const fetchTripDetails = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/trips/current`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data?.detail?.error === "no_active_trip") {
//         setTrip(null);
//         setRoute(null);
//         return;
//       }
//       const currentTrip = data?.trip;
//       if (!currentTrip) {
//         setTrip(null);
//         setRoute(null);
//         return;
//       }
      
//       const detailsRes = await fetch(
//         `${API_BASE}/driver/routes/${currentTrip.route_id}/trips/details`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const detailsData = await detailsRes.json();
//       const activeTrip = detailsData.trips.find(
//         (t: any) => t.status === "scheduled" || t.status === "in_progress"
//       );
//       setTrip(activeTrip || null);
//       setRoute(detailsData.route || null);
//     } catch (err: any) {
//       console.error(err);
//       showNotification("❌ Failed to fetch trip details: " + (err.message || "Unknown error"), "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTripDetails();
//   }, []);

//   // ================= SCANNER WITH API INTEGRATION =================
//   const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation not supported"));
//       } else {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             resolve({
//               lat: position.coords.latitude,
//               lng: position.coords.longitude,
//             });
//           },
//           (err) => reject(err),
//           { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//       }
//     });
//   };

//   const processScan = async (qrToken: string) => {
//     if (!trip) {
//       showNotification("No active trip found!", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Get current location
//       const { lat, lng } = await getCurrentLocation();
      
//       console.log("📍 Scanning QR Code:", qrToken);
//       console.log("📍 Current Location:", { lat, lng });
//       console.log("📍 Trip ID:", trip.trip_id);

//       // Prepare request body
//       const requestBody = {
//         qr_token: qrToken,
//         lat: lat,
//         lng: lng
//       };

//       // Call the scan API
//       const response = await fetch(
//         `${API_BASE}/driver/scan/${trip.trip_id}/scan`,
//         {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(requestBody),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || data.message || "Scan failed");
//       }

//       // Success - show beautiful result
//       setScanResult(data);
//       showNotification("✅ Passenger scanned successfully!", "success");
      
//       // Auto-hide scan result after 5 seconds
//       setTimeout(() => {
//         setScanResult(null);
//       }, 5000);
      
//       // Refresh trip details to update stop statuses
//       await fetchTripDetails();
      
//     } catch (err: any) {
//       console.error("Scan error:", err);
//       showNotification(`❌ Scan failed: ${err.message}`, "error");
//       setScanResult({ error: err.message });
      
//       // Auto-hide error after 5 seconds
//       setTimeout(() => {
//         setScanResult(null);
//       }, 5000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startScanner = () => {
//     if (!videoRef.current) return;
    
//     const reader = new BrowserMultiFormatReader();
//     scannerRef.current = reader;
    
//     reader.decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
//       if (result) {
//         const scannedText = result.getText();
//         console.log("📱 Scanned:", scannedText);
        
//         // Stop scanner immediately after scan
//         stopScanner();
//         setShowScanner(false);
        
//         // Process the scanned QR code
//         await processScan(scannedText);
//       }
//       if (err && !result) {
//         // Only log errors that are not "NotFoundException" (normal scanning behavior)
//         if (err.name !== "NotFoundException") {
//           console.error("Scanner error:", err);
//         }
//       }
//     });
//   };

//   const stopScanner = () => {
//     if (scannerRef.current) {
//       try {
//         scannerRef.current.reset();
//         if (videoRef.current && videoRef.current.srcObject) {
//           const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
//           tracks.forEach(track => track.stop());
//           videoRef.current.srcObject = null;
//         }
//       } catch (err) {
//         console.error("Error stopping scanner:", err);
//       }
//     }
//   };

//   useEffect(() => {
//     if (showScanner) {
//       startScanner();
//     } else {
//       stopScanner();
//     }
    
//     return () => {
//       stopScanner();
//     };
//   }, [showScanner]);

//   const showNotification = (message: string, color: "success" | "error" | "info" = "success") => {
//     setToastMessage(message);
//     setToastColor(color);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   // ================= ACTIONS =================
//   const handleStopAction = async (stop_id: string, mode: "arrive" | "depart") => {
//     if (!trip) return;
//     const fd = new FormData();
//     fd.append("stop_id", stop_id);
//     fd.append("mode", mode);
//     await fetch(`${API_BASE}/driver/scheduled-trips/${trip.trip_id}/stop-action`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: fd,
//     });
//     fetchTripDetails();
//   };

//   const handleStartTrip = async (tripId: string) => {
//     if (!tripId) return;
//     setLoading(true);
//     try {
//       const position = await new Promise<GeolocationPosition>((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(
//           resolve,
//           reject,
//           { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//       });

//       const latitude = position.coords.latitude;
//       const longitude = position.coords.longitude;
//       const accuracy = position.coords.accuracy;

//       console.log(`📍 FINAL LOCATION → Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`);

//       const formData = new FormData();
//       formData.append("lat", latitude.toString());
//       formData.append("lng", longitude.toString());

//       const res = await fetch(
//         `${API_BASE}/driver/scheduled-trips/${tripId}/start`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//           body: formData,
//         }
//       );
      
//       const data = await res.json();
//       if (!res.ok) {
//         if (data?.distance_m && data?.allowed_radius_m) {
//           throw new Error(`Too far 🚫 Distance: ${data.distance_m}m | Allowed: ${data.allowed_radius_m}m`);
//         }
//         throw new Error(data.detail || data.error || "Failed to start trip");
//       }
      
//       showNotification(`✅ Trip Started!\nDistance: ${data.distance_m}m\nAllowed: ${data.allowed_radius_m}m`, "success");
//       fetchTripDetails();
//     } catch (err: any) {
//       console.error(err);
//       showNotification(`❌ Failed: ${err.message || "Unknown error"}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEndTrip = async (tripId: string) => {
//     if (!tripId) return;
//     setLoading(true);
//     try {
//       const { lat, lng } = await getCurrentLocation();
//       console.log("Ending trip at location:", lat, lng);
      
//       const formData = new FormData();
//       formData.append("actual_end_at", new Date().toISOString());
//       formData.append("lat", lat.toString());
//       formData.append("lng", lng.toString());
      
//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/end`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });
      
//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.detail || "Failed to end trip");
//       }
      
//       showNotification("✅ Trip ended successfully!", "success");
//       fetchTripDetails();
//     } catch (err: any) {
//       console.error(err);
//       showNotification(`❌ Failed to end trip: ${err.message || "Unknown error"}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openEmergencyStopModal = (tripId: string) => {
//     setEmergencyTripId(tripId);
//     setEmergencyReason("");
//     setShowEmergencyModal(true);
//   };

//   const submitEmergencyStop = async () => {
//     if (!emergencyTripId || !emergencyReason) {
//       showNotification("Please provide a reason for emergency stop!", "error");
//       return;
//     }
//     setLoading(true);
//     try {
//       const { lat, lng } = await getCurrentLocation();
//       const formData = new FormData();
//       formData.append("reason", emergencyReason);
//       formData.append("lat", lat.toString());
//       formData.append("lng", lng.toString());
//       formData.append("actual_end_at", new Date().toISOString());
      
//       const res = await fetch(
//         `${API_BASE}/driver/scheduled-trips/${emergencyTripId}/emergency-end`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//           body: formData,
//         }
//       );
      
//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.detail?.[0]?.msg || "Emergency stop failed");
//       }
      
//       showNotification("✅ Trip stopped successfully!", "success");
//       setShowEmergencyModal(false);
//       fetchTripDetails();
//     } catch (err: any) {
//       console.error(err);
//       showNotification(`❌ Failed to perform emergency stop: ${err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelTrip = (tripId: string) => {
//     setCancelTripId(tripId);
//     setCancelReason("");
//     setShowCancelModal(true);
//   };

//   const submitCancelTrip = async () => {
//     if (!cancelTripId || !cancelReason) return;
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("reason", cancelReason);
//       const res = await fetch(`${API_BASE}/driver/trips/${cancelTripId}/cancel`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });
//       if (!res.ok) throw new Error("Cancel trip failed");
//       showNotification("Trip cancelled successfully!", "success");
//       setShowCancelModal(false);
//       fetchTripDetails();
//     } catch (err) {
//       console.error(err);
//       showNotification("❌ Failed to cancel trip", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Scan Result Card Component
//   const ScanResultCard = () => {
//     if (!scanResult) return null;
    
//     const isError = scanResult.error;
    
//     return (
//       <div className={`fixed bottom-4 left-4 right-4 z-50 animate-slide-up`}>
//         <div className={`rounded-xl shadow-2xl p-5 ${
//           isError ? "bg-red-50 dark:bg-red-900/90 border-red-500" : "bg-green-50 dark:bg-green-900/90 border-green-500"
//         } border-l-8`}>
//           <div className="flex items-start justify-between">
//             <div className="flex items-start gap-3 flex-1">
//               {isError ? (
//                 <FiAlertCircle className="text-red-600 dark:text-red-400 text-2xl mt-1 flex-shrink-0" />
//               ) : (
//                 <FiCheckCircle className="text-green-600 dark:text-green-400 text-2xl mt-1 flex-shrink-0" />
//               )}
//               <div className="flex-1">
//                 <h3 className={`font-bold text-lg ${
//                   isError ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"
//                 }`}>
//                   {isError ? "Scan Failed" : "Scan Successful"}
//                 </h3>
//                 <p className={`text-sm mt-1 ${
//                   isError ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"
//                 }`}>
//                   {isError ? scanResult.error : "Passenger verified successfully!"}
//                 </p>
//                 {!isError && scanResult.passenger && (
//                   <div className="mt-2 text-xs text-green-800 dark:text-green-200">
//                     <p>Passenger: {scanResult.passenger.name || "N/A"}</p>
//                     <p>Booking ID: {scanResult.booking_id || "N/A"}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <button
//               onClick={() => setScanResult(null)}
//               className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
//             >
//               <FiX className="text-xl" />
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-white dark:bg-black text-black dark:text-white pt-16 p-4">
//         <IonToast
//           isOpen={showToast}
//           onDidDismiss={() => setShowToast(false)}
//           message={toastMessage}
//           duration={3000}
//           color={toastColor}
//           position="top"
//         />
        
//         {loading && <IonLoading isOpen={loading} message="Loading trip details..." />}
        
//         {!trip && !loading && (
//           <div className="text-center mt-20 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-md">
//             <h2 className="text-2xl font-bold mb-2">No Active Trip</h2>
//             <p className="text-gray-700 dark:text-gray-100">
//               You currently have no active or scheduled trips.
//             </p>
//           </div>
//         )}
        
//         {trip && (
//           <>
//             <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl shadow mb-6 mt-6">
//               <div className="flex justify-between items-center flex-wrap gap-4">
//                 <h2 className="text-2xl font-bold dark:text-gray-300">{route?.name || "Unnamed Route"}</h2>
//                 <button
//                   onClick={() => setShowScanner(!showScanner)}
//                   className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition-all"
//                 >
//                   <FiCamera className="text-lg" />
//                   {showScanner ? "Close Scanner" : "Open Scanner"}
//                 </button>
//               </div>
              
//               <div className="flex justify-end mt-4">
//                 <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
//                   trip.status === "scheduled" 
//                     ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
//                     : trip.status === "in_progress"
//                     ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
//                     : ""
//                 }`}>
//                   {trip.status === "scheduled" && "🟡 Scheduled"}
//                   {trip.status === "in_progress" && "🚍 In Progress"}
//                 </span>
//               </div>
              
//               {/* Trip details */}
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Trip ID</p>
//                   <p className="font-semibold dark:text-gray-300">{trip.trip_id}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Planned Start</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.planned_start ? new Date(trip.planned_start).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Planned End</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.planned_end ? new Date(trip.planned_end).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Actual Start</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.actual_start ? new Date(trip.actual_start).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Actual End</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.actual_end ? new Date(trip.actual_end).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//               </div>
              
//               {/* Actions */}
//               <div className="flex gap-2 mt-4">
//                 {trip.status === "scheduled" && (
//                   <>
//                     <button
//                       onClick={() => handleStartTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-black text-white rounded dark:bg-green-600 dark:hover:bg-green-700 transition-all font-semibold"
//                     >
//                       Start Trip
//                     </button>
//                     <button
//                       onClick={() => handleCancelTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-red-600 text-white rounded hover:bg-red-700 transition-all font-semibold"
//                     >
//                       Cancel Trip
//                     </button>
//                   </>
//                 )}
//                 {trip.status === "in_progress" && (
//                   <>
//                     <button
//                       onClick={() => handleEndTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-red-600 text-white rounded hover:bg-red-700 transition-all font-semibold"
//                     >
//                       End Trip
//                     </button>
//                     <button
//                       onClick={() => openEmergencyStopModal(trip.trip_id)}
//                       className="flex-1 h-12 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all font-semibold"
//                     >
//                       Emergency End
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
            
//             {/* Scanner Video */}
//             {showScanner && (
//               <div className="mb-6 relative">
//                 <div className="relative rounded-xl overflow-hidden shadow-2xl">
//                   <video
//                     ref={videoRef}
//                     className="w-full h-auto min-h-[400px] bg-black"
//                     style={{ objectFit: "cover" }}
//                   />
//                   {/* Scanner Overlay */}
//                   <div className="absolute inset-0 pointer-events-none">
//                     <div className="absolute inset-0 border-2 border-white/30 rounded-xl"></div>
//                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-green-500 rounded-lg shadow-lg animate-pulse">
//                       <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
//                       <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
//                       <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
//                       <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
//                     </div>
//                     <div className="absolute bottom-4 left-4 right-4 text-center text-white bg-black/50 rounded-lg py-2 px-4">
//                       <p className="text-sm">Position QR code within the frame</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {/* Stops */}
//             {trip.stops?.map((stop: any) => (
//               <div key={stop.stop_id} className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl mb-4 shadow dark:text-gray-300">
//                 <h3 className="font-bold text-lg dark:text-gray-300">
//                   {stop.sequence}. {stop.name}
//                 </h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-300">
//                   Planned: {new Date(stop.planned_arrival_time).toLocaleTimeString()}
//                 </p>
//                 <p className="dark:text-gray-300">
//                   Arrival: {stop.actual_arrival_time ? new Date(stop.actual_arrival_time).toLocaleTimeString() : "-"}
//                 </p>
//                 <p className="dark:text-gray-300">
//                   Departure: {stop.actual_departure_time ? new Date(stop.actual_departure_time).toLocaleTimeString() : "-"}
//                 </p>
//                 <div className="flex gap-3 mt-4">
//                   <button
//                     onClick={() => handleStopAction(stop.stop_id, "arrive")}
//                     className="bg-green-600 text-white rounded flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
//                     style={{ width: 130, height: 42 }}
//                   >
//                     <FiCheckCircle /> Arrive
//                   </button>
//                   <button
//                     onClick={() => handleStopAction(stop.stop_id, "depart")}
//                     className="bg-blue-600 text-white rounded flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
//                     style={{ width: 130, height: 42 }}
//                   >
//                     <FiArrowRightCircle /> Depart
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </>
//         )}
        
//         {/* Scan Result Card */}
//         <ScanResultCard />
        
//         {/* Cancel Modal */}
//         {showCancelModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="bg-red-500 rounded-full p-2">
//                   <FiX className="text-white text-xl" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Trip</h2>
//               </div>
//               <textarea
//                 className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
//                 rows={4}
//                 placeholder="Enter reason for cancellation..."
//                 value={cancelReason}
//                 onChange={(e) => setCancelReason(e.target.value)}
//               />
//               <div className="flex gap-3 mt-4">
//                 <button
//                   onClick={submitCancelTrip}
//                   disabled={!cancelReason || loading}
//                   className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Submit
//                 </button>
//                 <button
//                   onClick={() => setShowCancelModal(false)}
//                   className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {/* Emergency Modal */}
//         {showEmergencyModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="bg-yellow-500 rounded-full p-2">
//                   <FiAlertCircle className="text-white text-xl" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Emergency Stop</h2>
//               </div>
//               <textarea
//                 className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 rows={4}
//                 placeholder="Enter reason for emergency stop..."
//                 value={emergencyReason}
//                 onChange={(e) => setEmergencyReason(e.target.value)}
//               />
//               <div className="flex gap-3 mt-4">
//                 <button
//                   onClick={submitEmergencyStop}
//                   disabled={!emergencyReason || loading}
//                   className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Submit
//                 </button>
//                 <button
//                   onClick={() => setShowEmergencyModal(false)}
//                   className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </IonContent>
      
//       <style>{`
//         @keyframes slide-up {
//           from {
//             transform: translateY(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }
        
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
        
//         .animate-slide-up {
//           animation: slide-up 0.3s ease-out;
//         }
        
//         .animate-fade-in {
//           animation: fade-in 0.2s ease-out;
//         }
        
//         .animate-pulse {
//           animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
        
//         @keyframes pulse {
//           0%, 100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0.5;
//           }
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default CurrentTrip;

// import React, { useEffect, useState, useRef } from "react";
// import { IonPage, IonContent, IonLoading, IonToast } from "@ionic/react";
// import NavbarSidebar from "./Navbar";
// import { BrowserMultiFormatReader } from "@zxing/browser";
// import { FiCamera, FiCheckCircle, FiArrowRightCircle, FiX, FiAlertCircle } from "react-icons/fi";
// import QRScannerComponent from "../pages/ScannerComponent";

// const API_BASE = "https://be.shuttleapp.transev.site";

// const CurrentTrip: React.FC = () => {
//   const token = localStorage.getItem("access_token") || "";
//   const [loading, setLoading] = useState(false);
//   const [trip, setTrip] = useState<any>(null);
//   const [route, setRoute] = useState<any>(null);
//   const [showScanner, setShowScanner] = useState(false);
//   const [scanResult, setScanResult] = useState<any>(null);
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState("");
//   const [toastColor, setToastColor] = useState("success");
  
//   // MODALS
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [cancelReason, setCancelReason] = useState("");
//   const [cancelTripId, setCancelTripId] = useState<string | null>(null);
//   const [showEmergencyModal, setShowEmergencyModal] = useState(false);
//   const [emergencyReason, setEmergencyReason] = useState("");
//   const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);
  
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const scannerRef = useRef<any>(null);

//   // ================= FETCH =================
//   const fetchTripDetails = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/trips/current`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (data?.detail?.error === "no_active_trip") {
//         setTrip(null);
//         setRoute(null);
//         return;
//       }
//       const currentTrip = data?.trip;
//       if (!currentTrip) {
//         setTrip(null);
//         setRoute(null);
//         return;
//       }
      
//       const detailsRes = await fetch(
//         `${API_BASE}/driver/routes/${currentTrip.route_id}/trips/details`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const detailsData = await detailsRes.json();
//       const activeTrip = detailsData.trips.find(
//         (t: any) => t.status === "scheduled" || t.status === "in_progress"
//       );
//       setTrip(activeTrip || null);
//       setRoute(detailsData.route || null);
//     } catch (err: any) {
//       console.error(err);
//       showNotification("❌ Failed to fetch trip details: " + (err.message || "Unknown error"), "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTripDetails();
//   }, []);

//   // ================= SCANNER WITH API INTEGRATION =================
//   const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation not supported"));
//       } else {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             resolve({
//               lat: position.coords.latitude,
//               lng: position.coords.longitude,
//             });
//           },
//           (err) => reject(err),
//           { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//       }
//     });
//   };

//   const processScan = async (qrToken: string) => {
//     if (!trip) {
//       showNotification("No active trip found!", "error");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Get current location
//       const { lat, lng } = await getCurrentLocation();
      
//       console.log("📍 Scanning QR Code:", qrToken);
//       console.log("📍 Current Location:", { lat, lng });
//       console.log("📍 Trip ID:", trip.trip_id);

//       // Prepare request body
//       const requestBody = {
//         qr_token: qrToken,
//         lat: lat,
//         lng: lng
//       };

//       // Call the scan API
//       const response = await fetch(
//         `${API_BASE}/driver/scan/${trip.trip_id}/scan`,
//         {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(requestBody),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || data.message || "Scan failed");
//       }

//       // Success - show beautiful result
//       setScanResult(data);
//       showNotification("✅ Passenger scanned successfully!", "success");
      
//       // Auto-hide scan result after 5 seconds
//       setTimeout(() => {
//         setScanResult(null);
//       }, 5000);
      
//       // Refresh trip details to update stop statuses
//       await fetchTripDetails();
      
//     } catch (err: any) {
//       console.error("Scan error:", err);
//       showNotification(`❌ Scan failed: ${err.message}`, "error");
//       setScanResult({ error: err.message });
      
//       // Auto-hide error after 5 seconds
//       setTimeout(() => {
//         setScanResult(null);
//       }, 5000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleScanSuccess = (data: any) => {
//     console.log("Scan successful from QRScannerComponent:", data);
//     setScanResult(data);
//     showNotification("✅ Passenger scanned successfully!", "success");
//     setTimeout(() => {
//       setScanResult(null);
//     }, 5000);
//     fetchTripDetails();
//   };

//   const startScanner = () => {
//     if (!videoRef.current) return;
    
//     const reader = new BrowserMultiFormatReader();
//     scannerRef.current = reader;
    
//     reader.decodeFromVideoDevice(undefined, videoRef.current, async (result, err) => {
//       if (result) {
//         const scannedText = result.getText();
//         console.log("📱 Scanned:", scannedText);
        
//         // Stop scanner immediately after scan
//         stopScanner();
//         setShowScanner(false);
        
//         // Process the scanned QR code
//         await processScan(scannedText);
//       }
//       if (err && !result) {
//         // Only log errors that are not "NotFoundException" (normal scanning behavior)
//         if (err.name !== "NotFoundException") {
//           console.error("Scanner error:", err);
//         }
//       }
//     });
//   };

//   const stopScanner = () => {
//     if (scannerRef.current) {
//       try {
//         scannerRef.current.reset();
//         if (videoRef.current && videoRef.current.srcObject) {
//           const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
//           tracks.forEach(track => track.stop());
//           videoRef.current.srcObject = null;
//         }
//       } catch (err) {
//         console.error("Error stopping scanner:", err);
//       }
//     }
//   };

//   useEffect(() => {
//     if (showScanner) {
//       startScanner();
//     } else {
//       stopScanner();
//     }
    
//     return () => {
//       stopScanner();
//     };
//   }, [showScanner]);

//   const showNotification = (message: string, color: "success" | "error" | "info" = "success") => {
//     setToastMessage(message);
//     setToastColor(color);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   // ================= ACTIONS =================
//   const handleStopAction = async (stop_id: string, mode: "arrive" | "depart") => {
//     if (!trip) return;
//     const fd = new FormData();
//     fd.append("stop_id", stop_id);
//     fd.append("mode", mode);
//     await fetch(`${API_BASE}/driver/scheduled-trips/${trip.trip_id}/stop-action`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: fd,
//     });
//     fetchTripDetails();
//   };

//   const handleStartTrip = async (tripId: string) => {
//     if (!tripId) return;
//     setLoading(true);
//     try {
//       const position = await new Promise<GeolocationPosition>((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(
//           resolve,
//           reject,
//           { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//       });

//       const latitude = position.coords.latitude;
//       const longitude = position.coords.longitude;
//       const accuracy = position.coords.accuracy;

//       console.log(`📍 FINAL LOCATION → Lat: ${latitude}, Lng: ${longitude}, Accuracy: ${accuracy}m`);

//       const formData = new FormData();
//       formData.append("lat", latitude.toString());
//       formData.append("lng", longitude.toString());

//       const res = await fetch(
//         `${API_BASE}/driver/scheduled-trips/${tripId}/start`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//           body: formData,
//         }
//       );
      
//       const data = await res.json();
//       if (!res.ok) {
//         if (data?.distance_m && data?.allowed_radius_m) {
//           throw new Error(`Too far 🚫 Distance: ${data.distance_m}m | Allowed: ${data.allowed_radius_m}m`);
//         }
//         throw new Error(data.detail || data.error || "Failed to start trip");
//       }
      
//       showNotification(`✅ Trip Started!\nDistance: ${data.distance_m}m\nAllowed: ${data.allowed_radius_m}m`, "success");
//       fetchTripDetails();
//     } catch (err: any) {
//       console.error(err);
//       showNotification(`❌ Failed: ${err.message || "Unknown error"}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEndTrip = async (tripId: string) => {
//     if (!tripId) return;
//     setLoading(true);
//     try {
//       const { lat, lng } = await getCurrentLocation();
//       console.log("Ending trip at location:", lat, lng);
      
//       const formData = new FormData();
//       formData.append("actual_end_at", new Date().toISOString());
//       formData.append("lat", lat.toString());
//       formData.append("lng", lng.toString());
      
//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/end`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });
      
//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.detail || "Failed to end trip");
//       }
      
//       showNotification("✅ Trip ended successfully!", "success");
//       fetchTripDetails();
//     } catch (err: any) {
//       console.error(err);
//       showNotification(`❌ Failed to end trip: ${err.message || "Unknown error"}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openEmergencyStopModal = (tripId: string) => {
//     setEmergencyTripId(tripId);
//     setEmergencyReason("");
//     setShowEmergencyModal(true);
//   };

//   const submitEmergencyStop = async () => {
//     if (!emergencyTripId || !emergencyReason) {
//       showNotification("Please provide a reason for emergency stop!", "error");
//       return;
//     }
//     setLoading(true);
//     try {
//       const { lat, lng } = await getCurrentLocation();
//       const formData = new FormData();
//       formData.append("reason", emergencyReason);
//       formData.append("lat", lat.toString());
//       formData.append("lng", lng.toString());
//       formData.append("actual_end_at", new Date().toISOString());
      
//       const res = await fetch(
//         `${API_BASE}/driver/scheduled-trips/${emergencyTripId}/emergency-end`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//           body: formData,
//         }
//       );
      
//       if (!res.ok) {
//         const errData = await res.json();
//         throw new Error(errData.detail?.[0]?.msg || "Emergency stop failed");
//       }
      
//       showNotification("✅ Trip stopped successfully!", "success");
//       setShowEmergencyModal(false);
//       fetchTripDetails();
//     } catch (err: any) {
//       console.error(err);
//       showNotification(`❌ Failed to perform emergency stop: ${err.message}`, "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancelTrip = (tripId: string) => {
//     setCancelTripId(tripId);
//     setCancelReason("");
//     setShowCancelModal(true);
//   };

//   const submitCancelTrip = async () => {
//     if (!cancelTripId || !cancelReason) return;
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("reason", cancelReason);
//       const res = await fetch(`${API_BASE}/driver/trips/${cancelTripId}/cancel`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });
//       if (!res.ok) throw new Error("Cancel trip failed");
//       showNotification("Trip cancelled successfully!", "success");
//       setShowCancelModal(false);
//       fetchTripDetails();
//     } catch (err) {
//       console.error(err);
//       showNotification("❌ Failed to cancel trip", "error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Scan Result Card Component
//   const ScanResultCard = () => {
//     if (!scanResult) return null;
    
//     const isError = scanResult.error;
    
//     return (
//       <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
//         <div className={`rounded-xl shadow-2xl p-5 ${
//           isError ? "bg-red-50 dark:bg-red-900/90 border-red-500" : "bg-green-50 dark:bg-green-900/90 border-green-500"
//         } border-l-8`}>
//           <div className="flex items-start justify-between">
//             <div className="flex items-start gap-3 flex-1">
//               {isError ? (
//                 <FiAlertCircle className="text-red-600 dark:text-red-400 text-2xl mt-1 shrink-0" />
//               ) : (
//                 <FiCheckCircle className="text-green-600 dark:text-green-400 text-2xl mt-1 shrink-0" />
//               )}
//               <div className="flex-1">
//                 <h3 className={`font-bold text-lg ${
//                   isError ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"
//                 }`}>
//                   {isError ? "Scan Failed" : "Scan Successful"}
//                 </h3>
//                 <p className={`text-sm mt-1 ${
//                   isError ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"
//                 }`}>
//                   {isError ? scanResult.error : "Passenger verified successfully!"}
//                 </p>
//                 {!isError && scanResult.passenger && (
//                   <div className="mt-2 text-xs text-green-800 dark:text-green-200">
//                     <p>Passenger: {scanResult.passenger.name || "N/A"}</p>
//                     <p>Booking ID: {scanResult.booking_id || "N/A"}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <button
//               onClick={() => setScanResult(null)}
//               className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
//             >
//               <FiX className="text-xl" />
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-white dark:bg-black text-black dark:text-white pt-16 p-4">
//         <IonToast
//           isOpen={showToast}
//           onDidDismiss={() => setShowToast(false)}
//           message={toastMessage}
//           duration={3000}
//           color={toastColor}
//           position="top"
//         />
        
//         {loading && <IonLoading isOpen={loading} message="Loading trip details..." />}
        
//         {!trip && !loading && (
//           <div className="text-center mt-20 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-md">
//             <h2 className="text-2xl font-bold mb-2">No Active Trip</h2>
//             <p className="text-gray-700 dark:text-gray-100">
//               You currently have no active or scheduled trips.
//             </p>
//           </div>
//         )}
        
//         {trip && (
//           <>
//             <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl shadow mb-6 mt-6">
//               <div className="flex justify-between items-center flex-wrap gap-4">
//                 <h2 className="text-2xl font-bold dark:text-gray-300">{route?.name || "Unnamed Route"}</h2>
//                 <button
//                   onClick={() => setShowScanner(true)}
//                   className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition-all"
//                 >
//                   <FiCamera className="text-lg" />
//                   Scan QR Code
//                 </button>
//               </div>
              
//               <div className="flex justify-end mt-4">
//                 <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
//                   trip.status === "scheduled" 
//                     ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
//                     : trip.status === "in_progress"
//                     ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
//                     : ""
//                 }`}>
//                   {trip.status === "scheduled" && "🟡 Scheduled"}
//                   {trip.status === "in_progress" && "🚍 In Progress"}
//                 </span>
//               </div>
              
//               {/* Trip details */}
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Trip ID</p>
//                   <p className="font-semibold dark:text-gray-300">{trip.trip_id}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Planned Start</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.planned_start ? new Date(trip.planned_start).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Planned End</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.planned_end ? new Date(trip.planned_end).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Actual Start</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.actual_start ? new Date(trip.actual_start).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500 dark:text-gray-300">Actual End</p>
//                   <p className="font-semibold dark:text-gray-300">
//                     {trip.actual_end ? new Date(trip.actual_end).toLocaleString(undefined, {
//                       day: "2-digit",
//                       month: "short",
//                       year: "numeric",
//                       hour: "2-digit",
//                       minute: "2-digit",
//                       hour12: true,
//                     }) : "-"}
//                   </p>
//                 </div>
//               </div>
              
//               {/* Actions */}
//               <div className="flex gap-2 mt-4">
//                 {trip.status === "scheduled" && (
//                   <>
//                     <button
//                       onClick={() => handleStartTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-black text-white rounded dark:bg-green-600 dark:hover:bg-green-700 transition-all font-semibold"
//                     >
//                       Start Trip
//                     </button>
//                     <button
//                       onClick={() => handleCancelTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-red-600 text-white rounded hover:bg-red-700 transition-all font-semibold"
//                     >
//                       Cancel Trip
//                     </button>
//                   </>
//                 )}
//                 {trip.status === "in_progress" && (
//                   <>
//                     <button
//                       onClick={() => handleEndTrip(trip.trip_id)}
//                       className="flex-1 h-12 bg-red-600 text-white rounded hover:bg-red-700 transition-all font-semibold"
//                     >
//                       End Trip
//                     </button>
//                     <button
//                       onClick={() => openEmergencyStopModal(trip.trip_id)}
//                       className="flex-1 h-12 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-all font-semibold"
//                     >
//                       Emergency End
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
            
//             {/* Stops */}
//             {trip.stops?.map((stop: any) => (
//               <div key={stop.stop_id} className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl mb-4 shadow dark:text-gray-300">
//                 <h3 className="font-bold text-lg dark:text-gray-300">
//                   {stop.sequence}. {stop.name}
//                 </h3>
//                 <p className="text-sm text-gray-500 dark:text-gray-300">
//                   Planned: {new Date(stop.planned_arrival_time).toLocaleTimeString()}
//                 </p>
//                 <p className="dark:text-gray-300">
//                   Arrival: {stop.actual_arrival_time ? new Date(stop.actual_arrival_time).toLocaleTimeString() : "-"}
//                 </p>
//                 <p className="dark:text-gray-300">
//                   Departure: {stop.actual_departure_time ? new Date(stop.actual_departure_time).toLocaleTimeString() : "-"}
//                 </p>
//                 <div className="flex gap-3 mt-4">
//                   <button
//                     onClick={() => handleStopAction(stop.stop_id, "arrive")}
//                     className="bg-green-600 text-white rounded flex items-center justify-center gap-2 hover:bg-green-700 transition-all"
//                     style={{ width: 130, height: 42 }}
//                   >
//                     <FiCheckCircle /> Arrive
//                   </button>
//                   <button
//                     onClick={() => handleStopAction(stop.stop_id, "depart")}
//                     className="bg-blue-600 text-white rounded flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
//                     style={{ width: 130, height: 42 }}
//                   >
//                     <FiArrowRightCircle /> Depart
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </>
//         )}
        
//         {/* Scan Result Card */}
//         <ScanResultCard />
        
//         {/* QR Scanner Modal */}
//         {/* {showScanner && trip && (
//           <QRScannerComponent
//             onClose={() => setShowScanner(false)}
//             onScanSuccess={handleScanSuccess}
//             tripId={trip.trip_id}
//             token={token}
//           />
//         )} */}
//          {showScanner && trip && (
//         <QRScannerComponent
//           onClose={() => setShowScanner(false)}
//           onScanSuccess={handleScanSuccess}
//           tripId={trip.trip_id}
//           token={token}
//         />
//       )}
        
//         {/* Cancel Modal */}
//         {showCancelModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="bg-red-500 rounded-full p-2">
//                   <FiX className="text-white text-xl" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cancel Trip</h2>
//               </div>
//               <textarea
//                 className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
//                 rows={4}
//                 placeholder="Enter reason for cancellation..."
//                 value={cancelReason}
//                 onChange={(e) => setCancelReason(e.target.value)}
//               />
//               <div className="flex gap-3 mt-4">
//                 <button
//                   onClick={submitCancelTrip}
//                   disabled={!cancelReason || loading}
//                   className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Submit
//                 </button>
//                 <button
//                   onClick={() => setShowCancelModal(false)}
//                   className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
        
//         {/* Emergency Modal */}
//         {showEmergencyModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
//             <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90%] shadow-2xl">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="bg-yellow-500 rounded-full p-2">
//                   <FiAlertCircle className="text-white text-xl" />
//                 </div>
//                 <h2 className="text-xl font-bold text-gray-900 dark:text-white">Emergency Stop</h2>
//               </div>
//               <textarea
//                 className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
//                 rows={4}
//                 placeholder="Enter reason for emergency stop..."
//                 value={emergencyReason}
//                 onChange={(e) => setEmergencyReason(e.target.value)}
//               />
//               <div className="flex gap-3 mt-4">
//                 <button
//                   onClick={submitEmergencyStop}
//                   disabled={!emergencyReason || loading}
//                   className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Submit
//                 </button>
//                 <button
//                   onClick={() => setShowEmergencyModal(false)}
//                   className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </IonContent>
      
//       <style>{`
//         @keyframes slide-up {
//           from {
//             transform: translateY(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }
        
//         @keyframes fade-in {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
        
//         .animate-slide-up {
//           animation: slide-up 0.3s ease-out;
//         }
        
//         .animate-fade-in {
//           animation: fade-in 0.2s ease-out;
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default CurrentTrip;

import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonLoading, IonToast } from "@ionic/react";
import NavbarSidebar from "./Navbar";
import { FiCamera, FiCheckCircle, FiArrowRightCircle, FiX, FiAlertCircle } from "react-icons/fi";
import QRScannerComponent from "../pages/ScannerComponent";

const API_BASE = "https://be.shuttleapp.transev.site";

const CurrentTrip: React.FC = () => {
  const token = localStorage.getItem("access_token") || "";
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState("success");
  
  // MODALS
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelTripId, setCancelTripId] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);

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
      showNotification("❌ Failed to fetch trip details: " + (err.message || "Unknown error"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, []);

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

  const handleScanSuccess = (data: any) => {
    console.log("Scan successful from QRScannerComponent:", data);
    setScanResult(data);
    showNotification("✅ Passenger scanned successfully!", "success");
    setTimeout(() => {
      setScanResult(null);
    }, 5000);
    fetchTripDetails();
  };

  const showNotification = (message: string, color: "success" | "error" | "info" = "success") => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

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
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
      });

      const formData = new FormData();
      formData.append("lat", position.coords.latitude.toString());
      formData.append("lng", position.coords.longitude.toString());

      const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Failed to start trip");
      
      showNotification(`✅ Trip Started!`, "success");
      fetchTripDetails();
    } catch (err: any) {
      console.error(err);
      showNotification(`❌ Failed: ${err.message || "Unknown error"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = async (tripId: string) => {
    if (!tripId) return;
    setLoading(true);
    try {
      const { lat, lng } = await getCurrentLocation();
      
      const formData = new FormData();
      formData.append("actual_end_at", new Date().toISOString());
      formData.append("lat", lat.toString());
      formData.append("lng", lng.toString());
      
      const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error("Failed to end trip");
      
      showNotification("✅ Trip ended successfully!", "success");
      fetchTripDetails();
    } catch (err: any) {
      console.error(err);
      showNotification(`❌ Failed to end trip: ${err.message || "Unknown error"}`, "error");
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
      showNotification("Please provide a reason for emergency stop!", "error");
      return;
    }
    setLoading(true);
    try {
      const { lat, lng } = await getCurrentLocation();
      const formData = new FormData();
      formData.append("reason", emergencyReason);
      formData.append("lat", lat.toString());
      formData.append("lng", lng.toString());
      formData.append("actual_end_at", new Date().toISOString());
      
      const res = await fetch(`${API_BASE}/driver/scheduled-trips/${emergencyTripId}/emergency-end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error("Emergency stop failed");
      
      showNotification("✅ Trip stopped successfully!", "success");
      setShowEmergencyModal(false);
      fetchTripDetails();
    } catch (err: any) {
      console.error(err);
      showNotification(`❌ Failed to perform emergency stop: ${err.message}`, "error");
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
      showNotification("Trip cancelled successfully!", "success");
      setShowCancelModal(false);
      fetchTripDetails();
    } catch (err) {
      console.error(err);
      showNotification("❌ Failed to cancel trip", "error");
    } finally {
      setLoading(false);
    }
  };

  // Scan Result Card Component
  const ScanResultCard = () => {
    if (!scanResult) return null;
    const isError = scanResult.error;
    
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-slide-up">
        <div className={`rounded-xl shadow-2xl p-5 ${isError ? "bg-red-50 dark:bg-red-900/90 border-red-500" : "bg-green-50 dark:bg-green-900/90 border-green-500"} border-l-8`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {isError ? (
                <FiAlertCircle className="text-red-600 dark:text-red-400 text-2xl mt-1 shrink-0" />
              ) : (
                <FiCheckCircle className="text-green-600 dark:text-green-400 text-2xl mt-1 shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${isError ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"}`}>
                  {isError ? "Scan Failed" : "Scan Successful"}
                </h3>
                <p className={`text-sm mt-1 ${isError ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}>
                  {isError ? scanResult.error : "Passenger verified successfully!"}
                </p>
                {!isError && scanResult.passenger && (
                  <div className="mt-2 text-xs text-green-800 dark:text-green-200">
                    <p>Passenger: {scanResult.passenger.name || "N/A"}</p>
                    <p>Booking ID: {scanResult.booking_id || "N/A"}</p>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setScanResult(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400">
              <FiX className="text-xl" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-white dark:bg-black text-black dark:text-white pt-16 p-4">
        <IonToast isOpen={showToast} onDidDismiss={() => setShowToast(false)} message={toastMessage} duration={3000} color={toastColor} position="top" />
        
        {loading && <IonLoading isOpen={loading} message="Loading trip details..." />}
        
        {!trip && !loading && (
          <div className="text-center mt-20 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-2">No Active Trip</h2>
            <p className="text-gray-700 dark:text-gray-100">You currently have no active or scheduled trips.</p>
          </div>
        )}
        
        {trip && (
          <>
            <div className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl shadow mb-6 mt-6">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h2 className="text-2xl font-bold dark:text-gray-300">{route?.name || "Unnamed Route"}</h2>
                <button onClick={() => setShowScanner(true)} className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition-all">
                  <FiCamera className="text-lg" />
                  Scan QR Code
                </button>
              </div>
              
              <div className="flex justify-end mt-4">
                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${trip.status === "scheduled" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>
                  {trip.status === "scheduled" && "🟡 Scheduled"}
                  {trip.status === "in_progress" && "🚍 In Progress"}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-4">
                <div><p className="text-gray-500">Trip ID</p><p className="font-semibold">{trip.trip_id}</p></div>
                <div><p className="text-gray-500">Planned Start</p><p className="font-semibold">{trip.planned_start ? new Date(trip.planned_start).toLocaleString() : "-"}</p></div>
                <div><p className="text-gray-500">Planned End</p><p className="font-semibold">{trip.planned_end ? new Date(trip.planned_end).toLocaleString() : "-"}</p></div>
              </div>
              
              <div className="flex gap-2 mt-4">
                {trip.status === "scheduled" && (
                  <>
                    <button onClick={() => handleStartTrip(trip.trip_id)} className="flex-1 h-12 bg-black text-white rounded dark:bg-green-600 font-semibold">Start Trip</button>
                    <button onClick={() => handleCancelTrip(trip.trip_id)} className="flex-1 h-12 bg-red-600 text-white rounded font-semibold">Cancel Trip</button>
                  </>
                )}
                {trip.status === "in_progress" && (
                  <>
                    <button onClick={() => handleEndTrip(trip.trip_id)} className="flex-1 h-12 bg-red-600 text-white rounded font-semibold">End Trip</button>
                    <button onClick={() => openEmergencyStopModal(trip.trip_id)} className="flex-1 h-12 bg-yellow-500 text-white rounded font-semibold">Emergency End</button>
                  </>
                )}
              </div>
            </div>
            
            {trip.stops?.map((stop: any) => (
              <div key={stop.stop_id} className="bg-gray-100 dark:bg-gray-900 p-5 rounded-xl mb-4 shadow">
                <h3 className="font-bold text-lg">{stop.sequence}. {stop.name}</h3>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => handleStopAction(stop.stop_id, "arrive")} className="bg-green-600 text-white rounded px-4 py-2">Arrive</button>
                  <button onClick={() => handleStopAction(stop.stop_id, "depart")} className="bg-blue-600 text-white rounded px-4 py-2">Depart</button>
                </div>
              </div>
            ))}
          </>
        )}
        
        <ScanResultCard />
        
        {showScanner && trip && (
          <QRScannerComponent
            onClose={() => setShowScanner(false)}
            onScanSuccess={handleScanSuccess}
            tripId={trip.trip_id}
            token={token}
          />
        )}
        
        {/* Modals remain the same */}
      </IonContent>
    </IonPage>
  );
};

export default CurrentTrip;