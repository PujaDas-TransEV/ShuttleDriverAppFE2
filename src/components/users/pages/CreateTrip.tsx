// import React, { useState, useEffect } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import NavbarSidebar from "./Navbar";
// import { useHistory } from "react-router-dom";

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

//       // Navigate to Driver Trip Management with new trip ID
//       history.push(`/trip-management`);
//     } catch (err) {
//       console.error(err);
//       alert("Trip creation failed");
//     } finally {
//       setLoading(false);
//     }
//   };

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

const API_BASE = "https://be.shuttleapp.transev.site";

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

  // Create trip
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
      if (!res.ok) throw new Error(data.detail || "Failed to create trip");

      alert("Trip Created Successfully!");
      history.push(`/trip-management`);
    } catch (err) {
      console.error(err);
      alert("Trip creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans p-4">
        <IonLoading isOpen={loading} message="Please wait..." />

        {/* Create Trip Card */}
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-10">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Create New Trip
          </h2>

          {/* Route selection */}
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Select Route</label>
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

          {/* Planned Start & End */}
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Planned Start</label>
          <input
            type="datetime-local"
            className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={newTrip.planned_start_at}
            onChange={(e) => setNewTrip({ ...newTrip, planned_start_at: e.target.value })}
          />

          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Planned End</label>
          <input
            type="datetime-local"
            className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={newTrip.planned_end_at}
            onChange={(e) => setNewTrip({ ...newTrip, planned_end_at: e.target.value })}
          />

          {/* Stops */}
          {selectedRoute?.stops?.length > 0 && (
            <div className="mb-4">
              <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-2">Stops & Times</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedRoute.stops.map((stop: any, i: number) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-2 rounded shadow-sm">
                    <span className="font-medium">{stop.name}</span>
                    <input
                      type="time"
                      className="border p-2 rounded dark:bg-gray-800 text-gray-900 dark:text-white w-32"
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
            </div>
          )}

          {/* Map */}
          {selectedRoute?.stops?.length > 0 && (
            <div style={{ height: 250 }} className="mb-4 rounded overflow-hidden shadow">
              <MapContainer center={[22.57, 88.36]} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {selectedRoute.stops.map((stop: any, i: number) => (
                  <Marker key={i} position={[22.57 + i * 0.01, 88.36 + i * 0.01]}>
                    <Popup>{stop.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-between space-x-4 mt-4">
            <button
              onClick={handleCreateTrip}
              className="h-12 flex-1 bg-green-700 text-white font-bold rounded-lg"
            >
              Create
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
              className="h-12 flex-1 bg-red-600 text-white font-bold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CreateTripPage;