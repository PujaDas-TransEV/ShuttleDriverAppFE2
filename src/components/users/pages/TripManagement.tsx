
// import React, { useState, useEffect } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import NavbarSidebar from "./Navbar";

// const API_BASE = "https://be.shuttleapp.transev.site";

// const DriverTripManagement = () => {
//   const token = localStorage.getItem("access_token");

//   const [routes, setRoutes] = useState<any[]>([]);
//   const [selectedRoute, setSelectedRoute] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [createdTrip, setCreatedTrip] = useState<any>(null);
//   const [tripStatus, setTripStatus] = useState<"idle" | "started" | "ended">("idle");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const [newTrip, setNewTrip] = useState({
//     route_name: "",
//     planned_start_at: "",
//     planned_end_at: "",
//     stop_times: {} as Record<string, string>,
//   });

//   // ✅ Fetch routes
//   const fetchRoutes = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/routes`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setRoutes(data);
//     } catch (err) {
//       alert("Failed to load routes");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRoutes();
//   }, []);

//   // ✅ SELECT ROUTE FIX
//   const handleSelectRoute = (routeId: string) => {
//     const route = routes.find((r) => r.route_id === routeId);
//     setSelectedRoute(route);

//     setNewTrip({
//       ...newTrip,
//       route_name: route?.name || "",
//       stop_times: {},
//     });
//   };

//   // ✅ CREATE TRIP FIX (ONLY route_name)
//   const handleCreateTrip = async () => {
//     if (!newTrip.route_name || !newTrip.planned_start_at || !newTrip.planned_end_at) {
//       alert("All fields required");
//       return;
//     }

//     setLoading(true);

//     try {
//       const fd = new FormData();
//       fd.append("route_name", newTrip.route_name); // ✅ important
//       fd.append("planned_start_at", newTrip.planned_start_at);
//       fd.append("planned_end_at", newTrip.planned_end_at);
//       fd.append("stop_times", JSON.stringify(newTrip.stop_times));

//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/create`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error();

//       setCreatedTrip(data);
//       setTripStatus("idle");
//       setIsModalOpen(false);
//       alert("Trip Created!");
//     } catch {
//       alert("Trip creation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ START TRIP
//   const handleStartTrip = async () => {
//     setLoading(true);
//     try {
//       await fetch(`${API_BASE}/driver/scheduled-trips/${createdTrip.id}/start`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ actual_start_at: new Date().toISOString() }),
//       });

//       setTripStatus("started");
//     } catch {
//       alert("Start failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ END TRIP
//   const handleEndTrip = async () => {
//     setLoading(true);
//     try {
//       await fetch(`${API_BASE}/driver/scheduled-trips/${createdTrip.id}/end`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ actual_end_at: new Date().toISOString() }),
//       });

//       setTripStatus("ended");
//     } catch {
//       alert("End failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 p-4 text-gray-900 dark:text-white">
//         <IonLoading isOpen={loading} message="Please wait..." />

//         {/* Create Button */}
//         <div className="mt-20 mb-4">
//           <button
//             className="bg-black text-white px-4 py-2 rounded"
//             onClick={() => setIsModalOpen(true)}
//           >
//             Create Trip
//           </button>
//         </div>

//         {/* ROUTE SELECT */}
//         {!createdTrip && (
//           <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
//             <select
//               className="w-full p-2 border rounded dark:bg-gray-700"
//               onChange={(e) => handleSelectRoute(e.target.value)}
//             >
//               <option value="">Select Route</option>
//               {routes.map((r) => (
//                 <option key={r.route_id} value={r.route_id}>
//                   {r.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {/* ROUTE DETAILS */}
//         {selectedRoute && !createdTrip && (
//           <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
//             <h2 className="font-bold mb-2">{selectedRoute.name}</h2>

//             {/* Stops */}
//             {selectedRoute.stops.map((stop: any, i: number) => (
//               <div key={i} className="flex gap-2 mb-2">
//                 <span className="w-40">{stop.name}</span>
//                 <input
//                   type="time"
//                   className="border p-1 rounded w-full"
//                   onChange={(e) =>
//                     setNewTrip({
//                       ...newTrip,
//                       stop_times: {
//                         ...newTrip.stop_times,
//                         [stop.name]: e.target.value,
//                       },
//                     })
//                   }
//                 />
//               </div>
//             ))}

//             {/* MAP (dummy positions if no lat/lng) */}
//             <div style={{ height: 300 }} className="mt-3">
//               <MapContainer center={[22.57, 88.36]} zoom={12} style={{ height: "100%" }}>
//                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                 {selectedRoute.stops.map((stop: any, i: number) => (
//                   <Marker key={i} position={[22.57 + i * 0.01, 88.36 + i * 0.01]}>
//                     <Popup>{stop.name}</Popup>
//                   </Marker>
//                 ))}
//               </MapContainer>
//             </div>

//             <button
//               onClick={handleCreateTrip}
//               className="mt-4 bg-green-600 text-white p-2 w-full rounded"
//             >
//               Create Trip
//             </button>
//           </div>
//         )}

//         {/* CREATED TRIP */}
//         {createdTrip && (
//           <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded shadow">
//             <h2 className="font-bold">{createdTrip.route_name}</h2>

//             {tripStatus === "idle" && (
//               <button onClick={handleStartTrip} className="bg-black text-white p-2 mt-3 w-full">
//                 Start Trip
//               </button>
//             )}

//             {tripStatus === "started" && (
//               <button onClick={handleEndTrip} className="bg-red-600 text-white p-2 mt-3 w-full">
//                 End Trip
//               </button>
//             )}
//           </div>
//         )}
//       </IonContent>
//     </IonPage>
//   );
// };

// export default DriverTripManagement;

// import React, { useState, useEffect } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import NavbarSidebar from "./Navbar";

// const API_BASE = "https://be.shuttleapp.transev.site";

// const DriverTripManagement = () => {
//   const token = localStorage.getItem("access_token");

//   const [routes, setRoutes] = useState<any[]>([]);
//   const [selectedRoute, setSelectedRoute] = useState<any>(null);
//   const [createdTrip, setCreatedTrip] = useState<any>(null);
//   const [tripStatus, setTripStatus] = useState<"idle" | "started" | "ended">("idle");
//   const [loading, setLoading] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);

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

//   // Fetch trip details
//   const fetchTripDetails = async (tripId: string) => {
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/trips/${tripId}/details`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       setCreatedTrip(data);
//       setTripStatus(data.actual_start_at ? (data.actual_end_at ? "ended" : "started") : "idle");
//     } catch {
//       alert("Failed to load trip details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create trip
//   const handleCreateTrip = async () => {
//     if (!newTrip.route_name || !newTrip.planned_start_at || !newTrip.planned_end_at) {
//       alert("Please select route and set start/end times");
//       return;
//     }
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append("route_name", newTrip.route_name);
//       fd.append("planned_start_at", newTrip.planned_start_at);
//       fd.append("planned_end_at", newTrip.planned_end_at);
//       fd.append("stop_times", JSON.stringify(newTrip.stop_times));

//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/create`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Failed to create trip");

//       alert("Trip Created Successfully!");
//       fetchTripDetails(data.id);
//       setIsModalOpen(false);
//     } catch (err) {
//       console.error(err);
//       alert("Trip creation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Start trip
//   const handleStartTrip = async () => {
//     if (!createdTrip?.id) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/${createdTrip.id}/start`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         body: JSON.stringify({ actual_start_at: new Date().toISOString() }),
//       });
//       if (!res.ok) throw new Error("Failed to start trip");
//       setTripStatus("started");
//       alert("Trip Started!");
//     } catch (err) {
//       alert("Could not start trip");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // End trip
//   const handleEndTrip = async () => {
//     if (!createdTrip?.id) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/scheduled-trips/${createdTrip.id}/end`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//         body: JSON.stringify({ actual_end_at: new Date().toISOString() }),
//       });
//       if (!res.ok) throw new Error("Failed to end trip");
//       setTripStatus("ended");
//       alert("Trip Ended!");
//     } catch (err) {
//       alert("Could not end trip");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans p-4">
//         <IonLoading isOpen={loading} message="Please wait..." />

//         {/* Create Trip Button */}
//         <div className="mb-6 mt-20">
//           <button
//             className="bg-black text-white font-bold h-12 w-36 rounded-lg"
//             onClick={() => setIsModalOpen(true)}
//           >
//             Create Trip
//           </button>
//         </div>

//         {/* Route Selection & Trip Creation */}
//         {!createdTrip && (
//           <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
//             <label className="block mb-2 text-gray-700 dark:text-gray-300 font-semibold text-lg">
//               Select Route
//             </label>
//             <select
//               className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-medium"
//               value={selectedRoute?.route_id || ""}
//               onChange={(e) => {
//                 const route = routes.find((r) => r.route_id === e.target.value);
//                 setSelectedRoute(route);
//                 setNewTrip({
//                   ...newTrip,
//                   route_id: e.target.value,
//                   route_name: route?.name || "",
//                   stop_times: {},
//                 });
//               }}
//             >
//               <option value="">Choose your route</option>
//               {routes.map((route) => (
//                 <option key={route.route_id} value={route.route_id}>
//                   {route.name}
//                 </option>
//               ))}
//             </select>

//             {selectedRoute && (
//               <div className="mt-4 space-y-4 text-gray-900 dark:text-white">
//                 {/* Planned Start/End */}
//                 <div className="flex justify-between gap-2">
//                   <input
//                     type="datetime-local"
//                     className="border p-2 rounded w-1/2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//                     value={newTrip.planned_start_at}
//                     onChange={(e) =>
//                       setNewTrip({ ...newTrip, planned_start_at: e.target.value })
//                     }
//                   />
//                   <input
//                     type="datetime-local"
//                     className="border p-2 rounded w-1/2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//                     value={newTrip.planned_end_at}
//                     onChange={(e) =>
//                       setNewTrip({ ...newTrip, planned_end_at: e.target.value })
//                     }
//                   />
//                 </div>

//                 {/* Stops */}
//                 <div>
//                   <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
//                     Stops & Times
//                   </h2>
//                   {selectedRoute.stops.map((stop: any, index: number) => (
//                     <div
//                       key={index}
//                       className="flex items-center gap-4 mb-3 border p-2 rounded shadow-sm bg-gray-50 dark:bg-gray-700"
//                     >
//                       <span className="w-32 font-medium">{stop.name}</span>
//                       <input
//                         type="time"
//                         className="border p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                         value={newTrip.stop_times[stop.name] || ""}
//                         onChange={(e) =>
//                           setNewTrip({
//                             ...newTrip,
//                             stop_times: { ...newTrip.stop_times, [stop.name]: e.target.value },
//                           })
//                         }
//                       />
//                     </div>
//                   ))}
//                 </div>

//                 {/* Map */}
//              {/* MAP (dummy positions if no lat/lng) */}
//              <div style={{ height: 300 }} className="mt-3">
//                <MapContainer center={[22.57, 88.36]} zoom={12} style={{ height: "100%" }}>
//                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//                  {selectedRoute.stops.map((stop: any, i: number) => (
//                    <Marker key={i} position={[22.57 + i * 0.01, 88.36 + i * 0.01]}>
//                      <Popup>{stop.name}</Popup>
//                    </Marker>
//                  ))}
//                </MapContainer>
//              </div>
//                 <button
//                   onClick={handleCreateTrip}
//                   className="bg-green-600 text-white font-bold p-3 rounded w-full"
//                 >
//                   Create Trip
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Created Trip Details */}
//         {createdTrip && (
//           <div className="bg-white dark:bg-gray-800 rounded shadow p-4 space-y-4 mt-4 text-gray-900 dark:text-white">
//             <h2 className="text-xl font-semibold text-center">Trip ID: {createdTrip.id}</h2>
//             <p>Route: <b>{createdTrip.route_name}</b></p>
//             <p>Planned Start: <b>{createdTrip.planned_start_at}</b></p>
//             <p>Planned End: <b>{createdTrip.planned_end_at}</b></p>
//             <p>Actual Start: <b>{createdTrip.actual_start_at || "Not started"}</b></p>
//             <p>Actual End: <b>{createdTrip.actual_end_at || "Not ended"}</b></p>

//             <h3 className="font-semibold">Stops & Times</h3>
//             {createdTrip.stops?.map((stop: any, idx: number) => (
//               <p key={idx}>
//                 {stop.name}: <b>{stop.time}</b>
//               </p>
//             ))}

//             {/* Map */}
//             {createdTrip.stops?.[0]?.lat && createdTrip.stops?.[0]?.lng && (
//               <div className="rounded overflow-hidden shadow mt-2" style={{ height: "300px" }}>
//                 <MapContainer
//                   center={[createdTrip.stops[0].lat, createdTrip.stops[0].lng]}
//                   zoom={13}
//                   style={{ height: "100%", width: "100%" }}
//                 >
//                   <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     attribution="&copy; OpenStreetMap contributors"
//                   />
//                   {createdTrip.stops.map((stop: any, idx: number) => (
//                     <Marker key={idx} position={[stop.lat, stop.lng]}>
//                       <Popup>{stop.name}: {stop.time}</Popup>
//                     </Marker>
//                   ))}
//                 </MapContainer>
//               </div>
//             )}

//             {tripStatus === "idle" && (
//               <button
//                 onClick={handleStartTrip}
//                 className="bg-black text-white font-bold p-3 rounded w-full"
//               >
//                 Start Trip
//               </button>
//             )}
//             {tripStatus === "started" && (
//               <button
//                 onClick={handleEndTrip}
//                 className="bg-red-600 text-white font-bold p-3 rounded w-full"
//               >
//                 End Trip
//               </button>
//             )}
//             {tripStatus === "ended" && (
//               <p className="text-center text-green-600 font-semibold">Trip Completed!</p>
//             )}
//           </div>
//         )}

//         {/* Modal */}
//         {isModalOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md text-gray-900 dark:text-white">
//               <h2 className="text-xl font-bold mb-4">Create New Trip</h2>
//               <label className="block mb-2 font-medium">Select Route</label>
//               <select
//                 className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//                 value={newTrip.route_id}
//                 onChange={(e) => {
//                   const route = routes.find((r) => r.route_id === e.target.value);
//                   setNewTrip({
//                     ...newTrip,
//                     route_id: e.target.value,
//                     route_name: route?.name || "",
//                     stop_times: {},
//                   });
//                   setSelectedRoute(route);
//                 }}
//               >
//                 <option value="">Choose Route</option>
//                 {routes.map((r) => (
//                   <option key={r.route_id} value={r.route_id}>
//                     {r.name}
//                   </option>
//                 ))}
//               </select>

//               <label className="block mb-2 font-medium">Planned Start</label>
//               <input
//                 type="datetime-local"
//                 className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//                 value={newTrip.planned_start_at}
//                 onChange={(e) => setNewTrip({ ...newTrip, planned_start_at: e.target.value })}
//               />

//               <label className="block mb-2 font-medium">Planned End</label>
//               <input
//                 type="datetime-local"
//                 className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//                 value={newTrip.planned_end_at}
//                 onChange={(e) => setNewTrip({ ...newTrip, planned_end_at: e.target.value })}
//               />

//               <div className="flex justify-between mt-4 space-x-4">
//                 <button
//                   className="h-12 w-24 bg-green-700 text-white font-bold rounded-lg"
//                   onClick={handleCreateTrip}
//                 >
//                   Create
//                 </button>
//                 <button
//                   className="h-12 w-24 bg-red-600 text-white font-bold rounded-lg"
//                   onClick={() => setIsModalOpen(false)}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </IonContent>
//     </IonPage>
//   );
// };

// export default DriverTripManagement;

import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import NavbarSidebar from "./Navbar";
import { useHistory } from "react-router-dom";

const API_BASE = "https://be.shuttleapp.transev.site";

const DriverTripManagement = () => {
  const history = useHistory();
  const token = localStorage.getItem("access_token");

  const [routes, setRoutes] = useState<any[]>([]);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [driverVerified, setDriverVerified] = useState(false);

  // 🔹 Fetch Driver Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/driver-profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.verification_status === "verified") {
          setDriverVerified(true);
        } else {
          setDriverVerified(false);
        }
      } catch (err) {
        console.error(err);
        setDriverVerified(false);
      }
    };
    fetchProfile();
  }, [token]);

  // 🔹 Fetch Routes
  useEffect(() => {
    fetch(`${API_BASE}/driver/routes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setRoutes)
      .catch(console.error);
  }, [token]);

  // 🔹 Fetch Route Details
  const fetchRouteDetails = async (routeId: string) => {
    if (!routeId) {
      setRouteDetails(null);
      setTrips([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/routes/${routeId}/trips/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRouteDetails(data.route || null);

      // Sort trips by status
      const sorted = (data.trips || []).sort((a: any, b: any) => {
        const order: Record<string, number> = { scheduled: 1, in_progress: 2, completed: 3 };
        const aOrder = order[a.status as keyof typeof order] ?? 0;
        const bOrder = order[b.status as keyof typeof order] ?? 0;
        return aOrder - bOrder;
      });

      setTrips(sorted);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // 🔹 Start Trip
  const handleStartTrip = async (tripId: string) => {
    if (!tripId || !routeDetails) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ actual_start_at: new Date().toISOString() }),
      });
      fetchRouteDetails(routeDetails.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 End Trip
  const handleEndTrip = async (tripId: string) => {
    if (!tripId || !routeDetails) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ actual_end_at: new Date().toISOString() }),
      });
      fetchRouteDetails(routeDetails.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cancel Trip (only for scheduled trips)
  const handleCancelTrip = async (tripId: string) => {
    if (!tripId || !routeDetails) return;
    if (!window.confirm("Are you sure you want to cancel this trip?")) return;

    setLoading(true);
    try {
      await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      fetchRouteDetails(routeDetails.id);
    } catch (err) {
      console.error(err);
      alert("Failed to cancel trip");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle Create Trip Navigation
  const handleCreateTrip = () => {
    if (driverVerified) {
      history.push("/create-trip");
    } else {
      alert("Your account is not verified. You cannot create trips.");
    }
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-gray-100 dark:bg-black p-4 pt-20">
        <IonLoading isOpen={loading} message="Loading..." />

        {/* 🔹 Top bar */}
        <div className="flex justify-between items-center mb-5 mt-20">
          <h2 className="text-xl font-bold text-black dark:text-white">
            Trip Management
          </h2>

          <button
            onClick={handleCreateTrip}
            style={{
              height: "45px",
              width: "140px",
              background: "black",
              color: "white",
              borderRadius: "10px",
            }}
          >
            + Create Trip
          </button>
        </div>

        {/* 🔹 Route Selector */}
        <select
          className="w-full p-3 rounded-lg border mb-4 dark:bg-gray-800"
          onChange={(e) => fetchRouteDetails(e.target.value)}
        >
          <option value="">Select Route</option>
          {routes.map((r) => (
            <option key={r.route_id} value={r.route_id}>
              {r.name}
            </option>
          ))}
        </select>

        {/* 🔹 Route Stops */}
        {routeDetails?.stops?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow mb-5 border border-gray-200 dark:border-gray-700">
            <h2 className="font-bold text-lg mb-3 text-black dark:text-white">
              {routeDetails.name} Stops
            </h2>

            <div className="grid grid-cols-1 gap-3">
              {routeDetails.stops.map((s: any, i: number) => (
                <div
                  key={s.stop_id}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-3 rounded"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-black dark:text-white">
                      {i + 1}. {s.stop_name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Fare: {s.fare ? `₹${s.fare}` : "--"}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {s.time ? s.time : "--:--"}
                  </span>
                </div>
              ))}
            </div>

            {/* 🔹 Map */}
            {routeDetails.stops.length > 0 && (
              <MapContainer
                center={[22.57, 88.36]}
                zoom={12}
                style={{ height: 260 }}
                className="rounded-lg mt-4"
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {routeDetails.stops.map((s: any, i: number) => (
                  <Marker
                    key={i}
                    position={[
                      s.latitude ? s.latitude : 22.57 + i * 0.01,
                      s.longitude ? s.longitude : 88.36 + i * 0.01,
                    ]}
                  >
                    <Popup>
                      {s.stop_name} <br /> Fare: {s.fare ? `₹${s.fare}` : "--"}
                    </Popup>
                  </Marker>
                ))}
                <Polyline
                  positions={routeDetails.stops.map((s: any, i: number) => [
                    s.latitude ? s.latitude : 22.57 + i * 0.01,
                    s.longitude ? s.longitude : 88.36 + i * 0.01,
                  ])}
                  color="blue"
                />
              </MapContainer>
            )}
          </div>
        )}

        {/* 🔹 Trips */}
        {trips.length === 0 && routeDetails && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            No trips created yet for this route.
          </div>
        )}

        {trips.map((trip) => (
          <div
            key={trip.trip_id}
            className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow mb-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between mb-3 items-center">
              <h3 className="font-bold text-black dark:text-white">
                Trip ID: {trip.trip_id}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(trip.planned_start).toLocaleDateString()}
              </span>
            </div>

            {/* Planned */}
            <div className="flex justify-between text-sm mb-2 font-medium">
              <span>
                ⏱ Planned Start: {new Date(trip.planned_start).toLocaleTimeString()}
              </span>
              <span>
                ⏱ Planned End: {new Date(trip.planned_end).toLocaleTimeString()}
              </span>
            </div>

            {/* Actual */}
            <div className="flex justify-between text-xs text-gray-500 mb-3">
              <span>
                🟢 Actual Start:{" "}
                {trip.actual_start
                  ? new Date(trip.actual_start).toLocaleTimeString()
                  : "--"}
              </span>
              <span>
                🔴 Actual End:{" "}
                {trip.actual_end
                  ? new Date(trip.actual_end).toLocaleTimeString()
                  : "--"}
              </span>
            </div>

            {/* Status */}
            <div className="text-right font-semibold mb-3 capitalize text-black dark:text-white">
              {trip.status === "scheduled" && "Scheduled"}
              {trip.status === "in_progress" && "In Progress"}
              {trip.status === "completed" && "Completed"}
            </div>

            {/* Buttons */}
            {trip.status === "scheduled" && (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleStartTrip(trip.trip_id)}
                  className="flex-1 h-12 bg-black text-white rounded-lg"
                >
                  Start Trip
                </button>
                <button
                  onClick={() => handleCancelTrip(trip.trip_id)}
                  className="flex-1 h-12 bg-red-600 text-white rounded-lg"
                >
                  Cancel Trip
                </button>
              </div>
            )}
            {trip.status === "in_progress" && (
              <button
                onClick={() => handleEndTrip(trip.trip_id)}
                style={{
                  height: "48px",
                  width: "100%",
                  background: "red",
                  color: "white",
                  borderRadius: "8px",
                }}
              >
                End Trip
              </button>
            )}
            {trip.status === "completed" && (
              <div
                style={{
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#d1fae5",
                  color: "green",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                ✅ Completed
              </div>
            )}
          </div>
        ))}
      </IonContent>
    </IonPage>
  );
};

export default DriverTripManagement;