// import React, { useState } from "react";
// import {
//   IonPage,
//   IonContent,
// } from "@ionic/react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import NavbarSidebar from "./Navbar";

// // Sample route data with lat/lng for map
// const routesData = [
//   {
//     route_id: 1,
//     route_name: "Downtown to Airport",
//     planned_start_at: "08:00 AM",
//     planned_end_at: "09:30 AM",
//     stops: [
//       { name: "Main St", lat: 40.7128, lng: -74.006 },
//       { name: "Central Mall", lat: 40.715, lng: -74.015 },
//       { name: "Airport Terminal 1", lat: 40.730, lng: -74.020 },
//     ],
//   },
//   {
//     route_id: 2,
//     route_name: "Suburb to City Center",
//     planned_start_at: "09:00 AM",
//     planned_end_at: "10:15 AM",
//     stops: [
//       { name: "Suburb Station", lat: 40.735, lng: -74.025 },
//       { name: "Central Park", lat: 40.740, lng: -74.010 },
//       { name: "City Center Plaza", lat: 40.745, lng: -74.005 },
//     ],
//   },
// ];

// const DriverTripManagement = () => {
//   const [selectedRoute, setSelectedRoute] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [newTrip, setNewTrip] = useState({
//     route_id: "",
//     start_at: "",
//     end_at: "",
//   });

//   const handleCreateTrip = () => {
//     // Here you can handle API call or state update
//     alert(
//       `Trip Created!\nRoute: ${
//         routesData.find(r => r.route_id === parseInt(newTrip.route_id))?.route_name
//       }\nStart: ${newTrip.start_at}\nEnd: ${newTrip.end_at}`
//     );
//     setIsModalOpen(false);
//     setNewTrip({ route_id: "", start_at: "", end_at: "" });
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />

//       <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans p-4">

//         {/* Create Trip Button */}
//         <div className="mb-6 mt-20">
//          <button
//   style={{
//     backgroundColor: "#000", // black background
//     color: "#fff",           // white text
//     fontWeight: "bold",
//     height: "45px",          // custom height
//     width: "150px",          // custom width
//     borderRadius: "8px",     // rounded corners
//   }}
//   onClick={() => setIsModalOpen(true)}
// >
//   Create Trip
// </button>
//         </div>

//         {/* Route Selection */}
//         <div className="bg-white rounded shadow p-4">
//           <label className="block mb-2 text-gray-700 font-semibold text-lg">
//             Select Route
//           </label>
//           <select
//             className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium"
//             value={selectedRoute ? selectedRoute.route_id : ""}
//             onChange={(e) => {
//               const route = routesData.find(
//                 (r) => r.route_id === parseInt(e.target.value)
//               );
//               setSelectedRoute(route);
//             }}
//           >
//             <option value="">Choose your route</option>
//             {routesData.map((route) => (
//               <option key={route.route_id} value={route.route_id}>
//                 {route.route_name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Trip Details */}
//         {selectedRoute && (
//           <div className="bg-white rounded shadow p-4 space-y-4 mt-4">
//             {/* Planned Start/End */}
//             <div className="flex justify-between text-gray-800 font-medium text-base">
//               <div>
//                 <span className="font-semibold">Start:</span>{" "}
//                 {selectedRoute.planned_start_at}
//               </div>
//               <div>
//                 <span className="font-semibold">End:</span>{" "}
//                 {selectedRoute.planned_end_at}
//               </div>
//             </div>

//             {/* Stops List */}
//             <div>
//               <h2 className="text-gray-700 font-semibold mb-2 text-lg">Stops</h2>
//               <ul className="list-decimal list-inside space-y-1 text-gray-600">
//                 {selectedRoute.stops.map((stop, index) => (
//                   <li key={index} className="text-gray-800 font-medium">
//                     {stop.name}
//                   </li>
//                 ))}
//               </ul>
//             </div>

//             {/* Map Preview */}
//             <div
//               style={{ height: "300px", width: "100%" }}
//               className="rounded overflow-hidden shadow mt-2"
//             >
//               <MapContainer
//                 center={[
//                   selectedRoute.stops[0].lat,
//                   selectedRoute.stops[0].lng,
//                 ]}
//                 zoom={13}
//                 style={{ height: "100%", width: "100%" }}
//                 scrollWheelZoom={false}
//               >
//                 <TileLayer
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 />
//                 {selectedRoute.stops.map((stop, index) => (
//                   <Marker
//                     key={index}
//                     position={[stop.lat, stop.lng]}
//                   >
//                     <Popup>{stop.name}</Popup>
//                   </Marker>
//                 ))}
//               </MapContainer>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex justify-between mt-4 space-x-4">
//               <button
//                 style={{
//                   height: "45px",
//                   width: "48%",
//                   backgroundColor: "#000",
//                   color: "#fff",
//                   fontWeight: "bold",
//                 }}
//                 className="rounded hover:bg-gray-700 transition"
//                 onClick={() => alert("Trip Started!")}
//               >
//                 Start Trip
//               </button>
//               <button
//                 style={{
//                   height: "45px",
//                   width: "48%",
//                   backgroundColor: "#fff",
//                   color: "#000",
//                   fontWeight: "bold",
//                   border: "1px solid #000",
//                 }}
//                 className="rounded hover:bg-gray-200 transition"
//                 onClick={() => setSelectedRoute(null)}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Create Trip Modal */}
//         {isModalOpen && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
//               <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
//                 Create New Trip
//               </h2>

//               {/* Route Dropdown */}
//               <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
//                 Select Route
//               </label>
//               <select
//                 className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//                 value={newTrip.route_id}
//                 onChange={(e) =>
//                   setNewTrip({ ...newTrip, route_id: e.target.value })
//                 }
//               >
//                 <option value="">Choose Route</option>
//                 {routesData.map((route) => (
//                   <option key={route.route_id} value={route.route_id}>
//                     {route.route_name}
//                   </option>
//                 ))}
//               </select>

//               {/* Start Date/Time */}
//               <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
//                 Planned Start
//               </label>
//               <input
//                 type="datetime-local"
//                 className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//                 value={newTrip.start_at}
//                 onChange={(e) =>
//                   setNewTrip({ ...newTrip, start_at: e.target.value })
//                 }
//               />

//               {/* End Date/Time */}
//               <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
//                 Planned End
//               </label>
//               <input
//                 type="datetime-local"
//                 className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//                 value={newTrip.end_at}
//                 onChange={(e) =>
//                   setNewTrip({ ...newTrip, end_at: e.target.value })
//                 }
//               />

//               {/* Modal Buttons */}
//               <div className="flex justify-between mt-4 space-x-4">
//                <button
//   style={{
//     height: "45px",              // custom height
//     width: "100px",              // custom width (adjust as needed)
//     backgroundColor: "#00A000",  // green background
//     color: "#fff",               // white text
//     fontWeight: "bold",          // bold text
//     borderRadius: "8px",         // rounded corners
//     border: "none",              // remove default border
//     cursor: "pointer",           // pointer on hover
//   }}
//   onClick={handleCreateTrip}
// >
//   Create
// </button><button
//   style={{
//     height: "45px",             // custom height
//     width: "100px",             // custom width (adjust as needed)
//     backgroundColor: "#D00000", // red background
//     color: "#fff",              // white text
//     fontWeight: "bold",         // bold text
//     borderRadius: "8px",        // rounded corners
//     border: "none",             // remove default border
//     cursor: "pointer",          // pointer on hover
//   }}
//   onClick={() => setIsModalOpen(false)}
// >
//   Cancel
// </button>
//               </div>
//             </div>
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

// const API_BASE = "https://be.shuttleapp.transev.site"; // replace with your API base

// const DriverTripManagement = () => {
//   const token = localStorage.getItem("access_token");

//   const [routes, setRoutes] = useState<any[]>([]);
//   const [selectedRoute, setSelectedRoute] = useState<any>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [createdTrip, setCreatedTrip] = useState<any>(null);
//   const [tripStatus, setTripStatus] = useState<"idle" | "started" | "ended">("idle");

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
//       if (!res.ok) throw new Error(data.detail || "Failed to fetch routes");
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

//   // Create trip
//  const handleCreateTrip = async () => {
//   if (!newTrip.route_id || !newTrip.planned_start_at || !newTrip.planned_end_at) {
//     alert("Please select a route and set start/end times");
//     return;
//   }

//   setLoading(true);

//   try {
//     const fd = new FormData();
//     fd.append("route_id", newTrip.route_id);
//     fd.append("route_name", newTrip.route_name);
//     fd.append("planned_start_at", newTrip.planned_start_at);
//     fd.append("planned_end_at", newTrip.planned_end_at);
//     fd.append("stop_times", JSON.stringify(newTrip.stop_times));

//     const res = await fetch(`${API_BASE}/driver/scheduled-trips/create`, {
//       method: "POST",
//       headers: { Authorization: `Bearer ${token}` },
//       body: fd,
//     });

//     const data = await res.json();
//     if (!res.ok) throw new Error(data.detail || "Failed to create trip");

//     alert("Trip Created Successfully!");
//     setCreatedTrip(data);
//     setIsModalOpen(false);
//     setTripStatus("idle");
//   } catch (err) {
//     console.error(err);
//     alert("Trip creation failed");
//   } finally {
//     setLoading(false);
//   }
// };
//   // Start trip
//   const handleStartTrip = async () => {
//     if (!createdTrip?.id) return;
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `${API_BASE}/driver/scheduled-trips/${createdTrip.id}/start`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//           body: JSON.stringify({ actual_start_at: new Date().toISOString() }),
//         }
//       );
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
//       const res = await fetch(
//         `${API_BASE}/driver/scheduled-trips/${createdTrip.id}/end`,
//         {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
//           body: JSON.stringify({ actual_end_at: new Date().toISOString() }),
//         }
//       );
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

//         {/* Route Selection */}
//         {!createdTrip && (
//           <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
//             <label className="block mb-2 text-gray-700 dark:text-gray-300 font-semibold text-lg">
//               Select Route
//             </label>
//             <select
//               className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-medium"
//               value={selectedRoute ? selectedRoute.route_id : ""}
//               onChange={(e) => {
//                 const route = routes.find((r) => r.route_id === e.target.value);
//                 setSelectedRoute(route);
//                 setNewTrip({ ...newTrip, route_id: e.target.value, stop_times: {} });
//               }}
//             >
//               <option value="">Choose your route</option>
//               {routes.map((route) => (
//                 <option key={route.route_id} value={route.route_id}>
//                   {route.name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         )}

//         {/* Trip Details */}
//         {selectedRoute && !createdTrip && (
//           <div className="bg-white dark:bg-gray-800 rounded shadow p-4 space-y-4 mt-4 text-gray-900 dark:text-white">
//             {/* Planned Start/End */}
//             <div className="flex justify-between gap-2">
//               <input
//                 type="datetime-local"
//                 className="border p-2 rounded w-1/2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//                 value={newTrip.planned_start_at}
//                 onChange={(e) =>
//                   setNewTrip({ ...newTrip, planned_start_at: e.target.value })
//                 }
//               />
//               <input
//                 type="datetime-local"
//                 className="border p-2 rounded w-1/2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
//                 value={newTrip.planned_end_at}
//                 onChange={(e) =>
//                   setNewTrip({ ...newTrip, planned_end_at: e.target.value })
//                 }
//               />
//             </div>

//             {/* Stops */}
//             <div>
//               <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
//                 Stops & Times
//               </h2>
//               {selectedRoute.stops.map((stop: any, index: number) => (
//                 <div
//                   key={index}
//                   className="flex items-center gap-4 mb-3 border p-2 rounded shadow-sm bg-gray-50 dark:bg-gray-700"
//                 >
//                   <span className="w-32 font-medium">{stop.name}</span>
//                   <input
//                     type="time"
//                     className="border p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
//                     value={newTrip.stop_times[stop.name] || ""}
//                     onChange={(e) =>
//                       setNewTrip({
//                         ...newTrip,
//                         stop_times: { ...newTrip.stop_times, [stop.name]: e.target.value },
//                       })
//                     }
//                   />
//                 </div>
//               ))}
//             </div>

//             {/* Map */}
//             {selectedRoute.stops[0]?.lat && selectedRoute.stops[0]?.lng && (
//               <div className="rounded overflow-hidden shadow mt-2" style={{ height: "300px" }}>
//                 <MapContainer
//                   center={[selectedRoute.stops[0].lat, selectedRoute.stops[0].lng]}
//                   zoom={13}
//                   style={{ height: "100%", width: "100%" }}
//                 >
//                   <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     attribution="&copy; OpenStreetMap contributors"
//                   />
//                   {selectedRoute.stops.map((stop: any, idx: number) => (
//                     <Marker key={idx} position={[stop.lat, stop.lng]}>
//                       <Popup>{stop.name}</Popup>
//                     </Marker>
//                   ))}
//                 </MapContainer>
//               </div>
//             )}

//             <button
//               onClick={handleCreateTrip}
//               className="bg-green-600 text-white font-bold p-3 rounded w-full"
//             >
//               Create Trip
//             </button>
//           </div>
//         )}

//         {/* Created Trip */}
//         {createdTrip && (
//           <div className="bg-white dark:bg-gray-800 rounded shadow p-4 space-y-4 mt-4 text-gray-900 dark:text-white">
//             <h2 className="text-xl font-semibold text-center">Trip ID: {createdTrip.id}</h2>
//             <p>Route: <b>{createdTrip.route_name}</b></p>
//             <p>Planned Start: <b>{createdTrip.planned_start_at}</b></p>
//             <p>Planned End: <b>{createdTrip.planned_end_at}</b></p>

//             <h3 className="font-semibold">Stops & Times</h3>
//             {Object.entries(createdTrip.stop_times || {}).map(([stop, time], idx) => (
//               <p key={idx}>
//                 {stop}: <b>{time}</b>
//               </p>
//             ))}

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
//                 onChange={(e) => setNewTrip({ ...newTrip, route_id: e.target.value })}
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

import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import NavbarSidebar from "./Navbar";

const API_BASE = "https://be.shuttleapp.transev.site";

const DriverTripManagement = () => {
  const token = localStorage.getItem("access_token");

  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [createdTrip, setCreatedTrip] = useState<any>(null);
  const [tripStatus, setTripStatus] = useState<"idle" | "started" | "ended">("idle");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Fetch trip details
  const fetchTripDetails = async (tripId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/trips/${tripId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCreatedTrip(data);
      setTripStatus(data.actual_start_at ? (data.actual_end_at ? "ended" : "started") : "idle");
    } catch {
      alert("Failed to load trip details");
    } finally {
      setLoading(false);
    }
  };

  // Create trip
  const handleCreateTrip = async () => {
    if (!newTrip.route_name || !newTrip.planned_start_at || !newTrip.planned_end_at) {
      alert("Please select route and set start/end times");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("route_name", newTrip.route_name);
      fd.append("planned_start_at", newTrip.planned_start_at);
      fd.append("planned_end_at", newTrip.planned_end_at);
      fd.append("stop_times", JSON.stringify(newTrip.stop_times));

      const res = await fetch(`${API_BASE}/driver/scheduled-trips/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create trip");

      alert("Trip Created Successfully!");
      fetchTripDetails(data.id);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Trip creation failed");
    } finally {
      setLoading(false);
    }
  };

  // Start trip
  const handleStartTrip = async () => {
    if (!createdTrip?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/scheduled-trips/${createdTrip.id}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ actual_start_at: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("Failed to start trip");
      setTripStatus("started");
      alert("Trip Started!");
    } catch (err) {
      alert("Could not start trip");
    } finally {
      setLoading(false);
    }
  };

  // End trip
  const handleEndTrip = async () => {
    if (!createdTrip?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/scheduled-trips/${createdTrip.id}/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ actual_end_at: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("Failed to end trip");
      setTripStatus("ended");
      alert("Trip Ended!");
    } catch (err) {
      alert("Could not end trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans p-4">
        <IonLoading isOpen={loading} message="Please wait..." />

        {/* Create Trip Button */}
        <div className="mb-6 mt-20">
          <button
            className="bg-black text-white font-bold h-12 w-36 rounded-lg"
            onClick={() => setIsModalOpen(true)}
          >
            Create Trip
          </button>
        </div>

        {/* Route Selection & Trip Creation */}
        {!createdTrip && (
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 mb-4">
            <label className="block mb-2 text-gray-700 dark:text-gray-300 font-semibold text-lg">
              Select Route
            </label>
            <select
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-medium"
              value={selectedRoute?.route_id || ""}
              onChange={(e) => {
                const route = routes.find((r) => r.route_id === e.target.value);
                setSelectedRoute(route);
                setNewTrip({
                  ...newTrip,
                  route_id: e.target.value,
                  route_name: route?.name || "",
                  stop_times: {},
                });
              }}
            >
              <option value="">Choose your route</option>
              {routes.map((route) => (
                <option key={route.route_id} value={route.route_id}>
                  {route.name}
                </option>
              ))}
            </select>

            {selectedRoute && (
              <div className="mt-4 space-y-4 text-gray-900 dark:text-white">
                {/* Planned Start/End */}
                <div className="flex justify-between gap-2">
                  <input
                    type="datetime-local"
                    className="border p-2 rounded w-1/2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    value={newTrip.planned_start_at}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, planned_start_at: e.target.value })
                    }
                  />
                  <input
                    type="datetime-local"
                    className="border p-2 rounded w-1/2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                    value={newTrip.planned_end_at}
                    onChange={(e) =>
                      setNewTrip({ ...newTrip, planned_end_at: e.target.value })
                    }
                  />
                </div>

                {/* Stops */}
                <div>
                  <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Stops & Times
                  </h2>
                  {selectedRoute.stops.map((stop: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 mb-3 border p-2 rounded shadow-sm bg-gray-50 dark:bg-gray-700"
                    >
                      <span className="w-32 font-medium">{stop.name}</span>
                      <input
                        type="time"
                        className="border p-2 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        value={newTrip.stop_times[stop.name] || ""}
                        onChange={(e) =>
                          setNewTrip({
                            ...newTrip,
                            stop_times: { ...newTrip.stop_times, [stop.name]: e.target.value },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>

                {/* Map */}
             {/* MAP (dummy positions if no lat/lng) */}
             <div style={{ height: 300 }} className="mt-3">
               <MapContainer center={[22.57, 88.36]} zoom={12} style={{ height: "100%" }}>
                 <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                 {selectedRoute.stops.map((stop: any, i: number) => (
                   <Marker key={i} position={[22.57 + i * 0.01, 88.36 + i * 0.01]}>
                     <Popup>{stop.name}</Popup>
                   </Marker>
                 ))}
               </MapContainer>
             </div>
                <button
                  onClick={handleCreateTrip}
                  className="bg-green-600 text-white font-bold p-3 rounded w-full"
                >
                  Create Trip
                </button>
              </div>
            )}
          </div>
        )}

        {/* Created Trip Details */}
        {createdTrip && (
          <div className="bg-white dark:bg-gray-800 rounded shadow p-4 space-y-4 mt-4 text-gray-900 dark:text-white">
            <h2 className="text-xl font-semibold text-center">Trip ID: {createdTrip.id}</h2>
            <p>Route: <b>{createdTrip.route_name}</b></p>
            <p>Planned Start: <b>{createdTrip.planned_start_at}</b></p>
            <p>Planned End: <b>{createdTrip.planned_end_at}</b></p>
            <p>Actual Start: <b>{createdTrip.actual_start_at || "Not started"}</b></p>
            <p>Actual End: <b>{createdTrip.actual_end_at || "Not ended"}</b></p>

            <h3 className="font-semibold">Stops & Times</h3>
            {createdTrip.stops?.map((stop: any, idx: number) => (
              <p key={idx}>
                {stop.name}: <b>{stop.time}</b>
              </p>
            ))}

            {/* Map */}
            {createdTrip.stops?.[0]?.lat && createdTrip.stops?.[0]?.lng && (
              <div className="rounded overflow-hidden shadow mt-2" style={{ height: "300px" }}>
                <MapContainer
                  center={[createdTrip.stops[0].lat, createdTrip.stops[0].lng]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  {createdTrip.stops.map((stop: any, idx: number) => (
                    <Marker key={idx} position={[stop.lat, stop.lng]}>
                      <Popup>{stop.name}: {stop.time}</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}

            {tripStatus === "idle" && (
              <button
                onClick={handleStartTrip}
                className="bg-black text-white font-bold p-3 rounded w-full"
              >
                Start Trip
              </button>
            )}
            {tripStatus === "started" && (
              <button
                onClick={handleEndTrip}
                className="bg-red-600 text-white font-bold p-3 rounded w-full"
              >
                End Trip
              </button>
            )}
            {tripStatus === "ended" && (
              <p className="text-center text-green-600 font-semibold">Trip Completed!</p>
            )}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md text-gray-900 dark:text-white">
              <h2 className="text-xl font-bold mb-4">Create New Trip</h2>
              <label className="block mb-2 font-medium">Select Route</label>
              <select
                className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
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
              >
                <option value="">Choose Route</option>
                {routes.map((r) => (
                  <option key={r.route_id} value={r.route_id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <label className="block mb-2 font-medium">Planned Start</label>
              <input
                type="datetime-local"
                className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={newTrip.planned_start_at}
                onChange={(e) => setNewTrip({ ...newTrip, planned_start_at: e.target.value })}
              />

              <label className="block mb-2 font-medium">Planned End</label>
              <input
                type="datetime-local"
                className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={newTrip.planned_end_at}
                onChange={(e) => setNewTrip({ ...newTrip, planned_end_at: e.target.value })}
              />

              <div className="flex justify-between mt-4 space-x-4">
                <button
                  className="h-12 w-24 bg-green-700 text-white font-bold rounded-lg"
                  onClick={handleCreateTrip}
                >
                  Create
                </button>
                <button
                  className="h-12 w-24 bg-red-600 text-white font-bold rounded-lg"
                  onClick={() => setIsModalOpen(false)}
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

export default DriverTripManagement;