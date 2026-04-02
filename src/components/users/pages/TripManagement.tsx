

// import React, { useState } from "react";
// import {
//   IonPage,
//   IonHeader,
//   IonToolbar,
//   IonTitle,
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

//   return (
//    <IonPage>
//       <NavbarSidebar />

//       <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans">

//       {/* Content */}
     
//         {/* Route Selection */}
//         <div className="bg-white rounded shadow p-4 mt-20">
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
//           <div className="bg-white rounded shadow p-4 space-y-4">
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
//       </IonContent>
//     </IonPage>
//   );
// };

// export default DriverTripManagement;

import React, { useState } from "react";
import {
  IonPage,
  IonContent,
} from "@ionic/react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import NavbarSidebar from "./Navbar";

// Sample route data with lat/lng for map
const routesData = [
  {
    route_id: 1,
    route_name: "Downtown to Airport",
    planned_start_at: "08:00 AM",
    planned_end_at: "09:30 AM",
    stops: [
      { name: "Main St", lat: 40.7128, lng: -74.006 },
      { name: "Central Mall", lat: 40.715, lng: -74.015 },
      { name: "Airport Terminal 1", lat: 40.730, lng: -74.020 },
    ],
  },
  {
    route_id: 2,
    route_name: "Suburb to City Center",
    planned_start_at: "09:00 AM",
    planned_end_at: "10:15 AM",
    stops: [
      { name: "Suburb Station", lat: 40.735, lng: -74.025 },
      { name: "Central Park", lat: 40.740, lng: -74.010 },
      { name: "City Center Plaza", lat: 40.745, lng: -74.005 },
    ],
  },
];

const DriverTripManagement = () => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    route_id: "",
    start_at: "",
    end_at: "",
  });

  const handleCreateTrip = () => {
    // Here you can handle API call or state update
    alert(
      `Trip Created!\nRoute: ${
        routesData.find(r => r.route_id === parseInt(newTrip.route_id))?.route_name
      }\nStart: ${newTrip.start_at}\nEnd: ${newTrip.end_at}`
    );
    setIsModalOpen(false);
    setNewTrip({ route_id: "", start_at: "", end_at: "" });
  };

  return (
    <IonPage>
      <NavbarSidebar />

      <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans p-4">

        {/* Create Trip Button */}
        <div className="mb-6 mt-20">
         <button
  style={{
    backgroundColor: "#000", // black background
    color: "#fff",           // white text
    fontWeight: "bold",
    height: "45px",          // custom height
    width: "150px",          // custom width
    borderRadius: "8px",     // rounded corners
  }}
  onClick={() => setIsModalOpen(true)}
>
  Create Trip
</button>
        </div>

        {/* Route Selection */}
        <div className="bg-white rounded shadow p-4">
          <label className="block mb-2 text-gray-700 font-semibold text-lg">
            Select Route
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium"
            value={selectedRoute ? selectedRoute.route_id : ""}
            onChange={(e) => {
              const route = routesData.find(
                (r) => r.route_id === parseInt(e.target.value)
              );
              setSelectedRoute(route);
            }}
          >
            <option value="">Choose your route</option>
            {routesData.map((route) => (
              <option key={route.route_id} value={route.route_id}>
                {route.route_name}
              </option>
            ))}
          </select>
        </div>

        {/* Trip Details */}
        {selectedRoute && (
          <div className="bg-white rounded shadow p-4 space-y-4 mt-4">
            {/* Planned Start/End */}
            <div className="flex justify-between text-gray-800 font-medium text-base">
              <div>
                <span className="font-semibold">Start:</span>{" "}
                {selectedRoute.planned_start_at}
              </div>
              <div>
                <span className="font-semibold">End:</span>{" "}
                {selectedRoute.planned_end_at}
              </div>
            </div>

            {/* Stops List */}
            <div>
              <h2 className="text-gray-700 font-semibold mb-2 text-lg">Stops</h2>
              <ul className="list-decimal list-inside space-y-1 text-gray-600">
                {selectedRoute.stops.map((stop, index) => (
                  <li key={index} className="text-gray-800 font-medium">
                    {stop.name}
                  </li>
                ))}
              </ul>
            </div>

            {/* Map Preview */}
            <div
              style={{ height: "300px", width: "100%" }}
              className="rounded overflow-hidden shadow mt-2"
            >
              <MapContainer
                center={[
                  selectedRoute.stops[0].lat,
                  selectedRoute.stops[0].lng,
                ]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {selectedRoute.stops.map((stop, index) => (
                  <Marker
                    key={index}
                    position={[stop.lat, stop.lng]}
                  >
                    <Popup>{stop.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between mt-4 space-x-4">
              <button
                style={{
                  height: "45px",
                  width: "48%",
                  backgroundColor: "#000",
                  color: "#fff",
                  fontWeight: "bold",
                }}
                className="rounded hover:bg-gray-700 transition"
                onClick={() => alert("Trip Started!")}
              >
                Start Trip
              </button>
              <button
                style={{
                  height: "45px",
                  width: "48%",
                  backgroundColor: "#fff",
                  color: "#000",
                  fontWeight: "bold",
                  border: "1px solid #000",
                }}
                className="rounded hover:bg-gray-200 transition"
                onClick={() => setSelectedRoute(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Create Trip Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Create New Trip
              </h2>

              {/* Route Dropdown */}
              <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Select Route
              </label>
              <select
                className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={newTrip.route_id}
                onChange={(e) =>
                  setNewTrip({ ...newTrip, route_id: e.target.value })
                }
              >
                <option value="">Choose Route</option>
                {routesData.map((route) => (
                  <option key={route.route_id} value={route.route_id}>
                    {route.route_name}
                  </option>
                ))}
              </select>

              {/* Start Date/Time */}
              <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Planned Start
              </label>
              <input
                type="datetime-local"
                className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={newTrip.start_at}
                onChange={(e) =>
                  setNewTrip({ ...newTrip, start_at: e.target.value })
                }
              />

              {/* End Date/Time */}
              <label className="block mb-2 text-gray-700 dark:text-gray-300 font-medium">
                Planned End
              </label>
              <input
                type="datetime-local"
                className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                value={newTrip.end_at}
                onChange={(e) =>
                  setNewTrip({ ...newTrip, end_at: e.target.value })
                }
              />

              {/* Modal Buttons */}
              <div className="flex justify-between mt-4 space-x-4">
               <button
  style={{
    height: "45px",              // custom height
    width: "100px",              // custom width (adjust as needed)
    backgroundColor: "#00A000",  // green background
    color: "#fff",               // white text
    fontWeight: "bold",          // bold text
    borderRadius: "8px",         // rounded corners
    border: "none",              // remove default border
    cursor: "pointer",           // pointer on hover
  }}
  onClick={handleCreateTrip}
>
  Create
</button><button
  style={{
    height: "45px",             // custom height
    width: "100px",             // custom width (adjust as needed)
    backgroundColor: "#D00000", // red background
    color: "#fff",              // white text
    fontWeight: "bold",         // bold text
    borderRadius: "8px",        // rounded corners
    border: "none",             // remove default border
    cursor: "pointer",          // pointer on hover
  }}
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