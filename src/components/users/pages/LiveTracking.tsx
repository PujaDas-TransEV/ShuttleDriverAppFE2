// import React, { useEffect, useState } from "react";
// import { IonPage, IonContent } from "@ionic/react";
// import NavbarSidebar from "../pages/Navbar";
// import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// // Fix Leaflet default marker icons
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// // Smoothly pan map to driver position
// const LiveLocationUpdater = ({ position }: { position: [number, number] }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (position) {
//       map.setView(position, map.getZoom(), { animate: true });
//     }
//   }, [position, map]);
//   return null;
// };

// // Approximate ETA calculation in minutes (avg speed 40 km/h)
// const calculateETA = (driver: [number, number], passenger: [number, number]) => {
//   const toRad = (x: number) => (x * Math.PI) / 180;
//   const R = 6371; // Earth radius km
//   const dLat = toRad(passenger[0] - driver[0]);
//   const dLon = toRad(passenger[1] - driver[1]);
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(driver[0])) *
//       Math.cos(toRad(passenger[0])) *
//       Math.sin(dLon / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   const distance = R * c; // km
//   const avgSpeed = 40; // km/h
//   const eta = (distance / avgSpeed) * 60; // minutes
//   return Math.ceil(eta);
// };

// const DriverLiveTracking: React.FC = () => {
//   const [driverPos, setDriverPos] = useState<[number, number] | null>(null);

//   // Example passenger location (replace with real data)
//   const passengerPos: [number, number] = [23.8103, 90.4125]; // Dhaka

//   useEffect(() => {
//     if (navigator.geolocation) {
//       const updatePosition = () => {
//         navigator.geolocation.getCurrentPosition(
//           (pos) => {
//             setDriverPos([pos.coords.latitude, pos.coords.longitude]);
//           },
//           (err) => console.error("GPS error:", err),
//           { enableHighAccuracy: true }
//         );
//       };

//       updatePosition(); // initial fetch
//       const interval = setInterval(updatePosition, 120000); // every 2 minutes
//       return () => clearInterval(interval);
//     }
//   }, []);

//   return (
//     <IonPage>
//       <NavbarSidebar />

//       <IonContent className="bg-white dark:bg-gray-900 text-black dark:text-white pt-16 overflow-y-auto">
//         {/* Header */}
//         <div className="text-center pb-6 mt-20">
//           <h1 className="text-3xl md:text-4xl font-bold mb-1 text-gray-900 dark:text-white">
//             Live Driver Tracking
//           </h1>
//           <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
//             Track your vehicle and see passenger pickup location
//           </p>
//         </div>

//         {/* Map Container */}
//         <div className="w-full h-[450px] md:h-[600px] rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 shadow-lg">
//           {driverPos ? (
//             <MapContainer
//               center={driverPos}
//               zoom={15}
//               style={{ width: "100%", height: "100%" }}
//             >
//               <TileLayer
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
//               />

//               {/* Smooth panning */}
//               <LiveLocationUpdater position={driverPos} />

//               {/* Driver marker */}
//               <Marker position={driverPos}>
//                 <Popup className="text-sm md:text-base font-medium">
//                   <div className="text-black dark:text-white">
//                     <p>🚗 Driver Location</p>
//                     <p>ETA to passenger: {calculateETA(driverPos, passengerPos)} min</p>
//                   </div>
//                 </Popup>
//               </Marker>

//               {/* Passenger marker */}
//               <Marker position={passengerPos}>
//                 <Popup className="text-sm md:text-base font-medium">
//                   <div className="text-black dark:text-white">
//                     <p>📍 Passenger Pickup</p>
//                     <p>Waiting here</p>
//                   </div>
//                 </Popup>
//               </Marker>
//             </MapContainer>
//           ) : (
//             <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400 text-lg">
//               Getting your location...
//             </div>
//           )}
//         </div>

//         {/* Footer Info */}
//         <div className="mt-4 text-center">
//           <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
//             Driver location updates every 2 minutes
//           </p>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default DriverLiveTracking;

// import React, { useEffect, useState, useRef } from "react";
// import { IonPage, IonContent, IonLoading } from "@ionic/react";
// import NavbarSidebar from "../pages/Navbar";
// import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// // Fix Leaflet marker icons
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";

// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconUrl: markerIcon,
//   iconRetinaUrl: markerIcon2x,
//   shadowUrl: markerShadow,
// });

// const API_BASE = "https://be.shuttleapp.transev.site";

// // Component to update map view smoothly
// const LiveLocationUpdater = ({ bounds }: { bounds: L.LatLngBoundsExpression | null }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (bounds) {
//       map.fitBounds(bounds, { padding: [50, 50], animate: true });
//     }
//   }, [bounds, map]);
//   return null;
// };

// const DriverLiveTracking: React.FC = () => {
//   const token = localStorage.getItem("access_token");

//   const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
//   const [routes, setRoutes] = useState<any[]>([]);
//   const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
//   const [routeDetails, setRouteDetails] = useState<any>(null);
//   const [trips, setTrips] = useState<any[]>([]);
//   const [sheetOpen, setSheetOpen] = useState(true);
//   const [loading, setLoading] = useState(false);

//   const mapRef = useRef<L.Map | null>(null);

//   // Fetch all routes
//   useEffect(() => {
//     fetch(`${API_BASE}/driver/routes`, { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => res.json())
//       .then(setRoutes)
//       .catch(console.error);
//   }, [token]);

//   // Fetch driver location every 10 sec
//   useEffect(() => {
//     if (!navigator.geolocation) return;

//     const update = () => {
//       navigator.geolocation.getCurrentPosition(
//         pos => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
//         err => console.error(err),
//         { enableHighAccuracy: true }
//       );
//     };

//     update();
//     const interval = setInterval(update, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   // Fetch route details and trips
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

//       const sorted = (data.trips || []).sort((a: any, b: any) => {
//         const order: Record<string, number> = { scheduled: 1, in_progress: 2, completed: 3 };
//         return (order[a.status as keyof typeof order] ?? 0) - (order[b.status as keyof typeof order] ?? 0);
//       });
//       setTrips(sorted);
//     } catch (err) {
//       console.error(err);
//     }
//     setLoading(false);
//   };

//   // Compute bounds to show driver + all stops
//   const mapBounds = (() => {
//     const points: [number, number][] = [];
//     if (driverPos) points.push(driverPos);
//     if (routeDetails?.stops?.length > 0) {
//       routeDetails.stops
//         .filter((s: any) => s.latitude != null && s.longitude != null)
//         .forEach((s: any) => points.push([s.latitude, s.longitude]));
//     }
//     return points.length > 0 ? L.latLngBounds(points) : null;
//   })();

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="relative bg-black text-white">

//         <IonLoading isOpen={loading} message="Loading..." />

//         {/* FULL SCREEN MAP */}
//         <div className="h-screen w-full">
//           <MapContainer
//             center={driverPos || [22.57, 88.36]}
//             zoom={13}
//             style={{ height: "100%", width: "100%" }}
//             whenCreated={map => (mapRef.current = map)}
//           >
//             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

//             {/* Fit map to driver + stops */}
//             <LiveLocationUpdater bounds={mapBounds} />

//             {/* Driver Marker */}
//             {driverPos && (
//               <Marker position={driverPos}>
//                 <Popup>🚗 You (Driver)</Popup>
//               </Marker>
//             )}

//             {/* Route stops */}
//             {routeDetails?.stops
//               ?.filter((s: any) => s.latitude != null && s.longitude != null)
//               .map((s: any, i: number) => (
//                 <Marker key={i} position={[s.latitude, s.longitude]}>
//                   <Popup>📍 {s.stop_name}</Popup>
//                 </Marker>
//               ))}

//             {/* Route Polyline */}
//             {routeDetails?.stops?.length > 1 && (
//               <Polyline
//                 positions={routeDetails.stops
//                   .filter((s: any) => s.latitude != null && s.longitude != null)
//                   .map((s: any) => [s.latitude, s.longitude])}
//                 color="yellow"
//                 weight={5}
//               />
//             )}
//           </MapContainer>
//         </div>

//         {/* BOTTOM SHEET */}
//         <div
//           className={`fixed bottom-0 left-0 w-full bg-white text-black rounded-t-3xl shadow-xl transition-all duration-300 ${
//             sheetOpen ? "h-80" : "h-[70px]"
//           }`}
//         >
//           {/* Drag handle */}
//           <div
//             className="flex justify-center py-2 cursor-pointer"
//             onClick={() => setSheetOpen(!sheetOpen)}
//           >
//             <div className="w-12 h-1.5 bg-gray-400 rounded-full"></div>
//           </div>

//           {sheetOpen && (
//             <div className="p-4 overflow-y-auto h-full">
//               <h2 className="text-lg font-bold mb-3">Select Route</h2>
//               <div className="space-y-2">
//                 {routes.map(r => (
//                   <div
//                     key={r.route_id}
//                     onClick={() => {
//                       setSelectedRouteId(r.route_id);
//                       fetchRouteDetails(r.route_id);
//                     }}
//                     className={`p-3 rounded-xl border cursor-pointer hover:bg-gray-100 ${
//                       selectedRouteId === r.route_id ? "border-blue-500 bg-blue-100" : ""
//                     }`}
//                   >
//                     <p className="font-semibold">{r.name}</p>
//                   </div>
//                 ))}
//               </div>

//               {routeDetails && (
//                 <div className="mt-4">
//                   <h3 className="font-semibold mb-2">Stops</h3>
//                   <div className="space-y-2">
//                     {routeDetails.stops.map((s: any, i: number) => (
//                       <div key={i} className="p-2 bg-gray-100 rounded-lg text-sm">
//                         {i + 1}. {s.stop_name}
//                       </div>
//                     ))}
//                   </div>

//                   <h3 className="font-semibold mt-4 mb-2">Trips</h3>
//                   <div className="space-y-1 max-h-28 overflow-y-auto">
//                     {trips.map((t, idx) => (
//                       <div key={idx} className="p-2 bg-gray-200 rounded-lg text-sm flex justify-between">
//                         <span>{t.passenger_name}</span>
//                         <span className="font-semibold">{t.status}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//       </IonContent>
//     </IonPage>
//   );
// };

// export default DriverLiveTracking;

import React, { useEffect, useState, useRef } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import NavbarSidebar from "../pages/Navbar";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const API_BASE = "https://be.shuttleapp.transev.site";

// Smoothly pan map to driver position
const LiveLocationUpdater = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true });
  }, [position, map]);
  return null;
};

const DriverLiveTracking: React.FC = () => {
  const token = localStorage.getItem("access_token");

  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef<L.Map | null>(null);

  // 🔹 Fetch all routes
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/driver/routes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then(setRoutes)
      .catch(console.error);
  }, [token]);

  // 🔹 Fetch driver location every 10s
  useEffect(() => {
    if (!navigator.geolocation) return;

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => setDriverPos([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    };

    updateLocation();
    const interval = setInterval(updateLocation, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Fetch route details and trips
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

      const sortedTrips = (data.trips || []).sort((a: any, b: any) => {
        const order: Record<string, number> = { scheduled: 1, in_progress: 2, completed: 3 };
        return (order[a.status] ?? 0) - (order[b.status] ?? 0);
      });
      setTrips(sortedTrips);

      // Center map on first stop
      if (data.route?.stops?.length && mapRef.current) {
        const firstStop = data.route.stops[0];
        if (firstStop.latitude && firstStop.longitude) {
          mapRef.current.setView([firstStop.latitude, firstStop.longitude], 14, { animate: true });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const mapCenter =
    routeDetails?.stops?.length
      ? [routeDetails.stops[0].latitude, routeDetails.stops[0].longitude]
      : driverPos || [22.57, 88.36];

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="relative bg-black text-white">
        <IonLoading isOpen={loading} message="Loading..." />

        {/* 🔹 Full-screen map */}
        <div className="h-screen w-full relative">
          <MapContainer
            center={mapCenter as [number, number]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {driverPos && <Marker position={driverPos}><Popup>🚗 You (Driver)</Popup></Marker>}

            {routeDetails?.stops
              ?.filter((s: any) => s.latitude && s.longitude)
              .map((s: any, i: number) => (
                <Marker key={i} position={[s.latitude, s.longitude]}>
                  <Popup>📍 {s.stop_name}</Popup>
                </Marker>
              ))}

            {routeDetails?.stops?.length > 1 && (
              <Polyline
                positions={routeDetails.stops
                  .filter((s: any) => s.latitude && s.longitude)
                  .map((s: any) => [s.latitude, s.longitude])}
                color="yellow"
                weight={5}
              />
            )}

            <LiveLocationUpdater position={driverPos} />
          </MapContainer>

          {/* 🔹 Bottom sheet */}
          <div
            className={`fixed bottom-0 left-0 w-full bg-white text-black rounded-t-3xl shadow-xl transition-all duration-300 ${
              sheetOpen ? "h-80" : "h-16"
            }`}
          >
            {/* 🔹 Pull handle */}
            <div
              className="flex justify-center py-2 cursor-pointer"
              onClick={() => setSheetOpen(!sheetOpen)}
            >
              <div className="w-12 h-1.5 bg-gray-400 rounded-full"></div>
            </div>

            {sheetOpen && (
              <div className="p-4 overflow-y-auto h-full">
                <h2 className="text-lg font-bold mb-3">Select Route</h2>
                <div className="space-y-2">
                  {routes.map((r) => (
                    <div
                      key={r.route_id}
                      onClick={() => {
                        setSelectedRouteId(r.route_id);
                        fetchRouteDetails(r.route_id);
                      }}
                      className={`p-3 rounded-xl border cursor-pointer hover:bg-gray-100 ${
                        selectedRouteId === r.route_id ? "border-blue-500 bg-blue-100" : ""
                      }`}
                    >
                      <p className="font-semibold">{r.name}</p>
                    </div>
                  ))}
                </div>

                {routeDetails && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Stops</h3>
                    <div className="space-y-2">
                      {routeDetails.stops.map((s: any, i: number) => (
                        <div key={i} className="p-2 bg-gray-100 rounded-lg text-sm">
                          {i + 1}. {s.name}
                        </div>
                      ))}
                    </div>

                  
                 
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DriverLiveTracking;