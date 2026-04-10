import React, { useEffect, useState, useRef } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import { Preferences } from '@capacitor/preferences'; // Add this import
import NavbarSidebar from "../pages/Navbar";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

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

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const API_BASE = "https://be.shuttleapp.transev.site";

// Custom driver icon (Red)
const driverIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom stop icon (Green)
const stopIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom start icon (Blue)
const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom end icon (Purple)
const endIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Smoothly pan map to driver position
const LiveLocationUpdater = ({ position }: { position: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position && map) {
      map.setView(position, map.getZoom(), { animate: true, duration: 1 });
    }
  }, [position, map]);
  return null;
};

// Component to fit bounds to show all stops on map
const FitBounds = ({ stops }: { stops: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (stops && stops.length > 0 && map) {
      const validStops = stops.filter((s: any) => s.latitude && s.longitude);
      if (validStops.length > 0) {
        const bounds = L.latLngBounds(validStops.map((s: any) => [s.latitude, s.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
        console.log("📍 Map bounds set to show all stops:", validStops.length, "stops");
      }
    }
  }, [stops, map]);
  return null;
};

const DriverLiveTracking: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);

  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);
  const [stopsVisible, setStopsVisible] = useState(true);

  const mapRef = useRef<L.Map | null>(null);

  // Check if running on secure context
  const isSecureContext = window.isSecureContext || 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1';

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
      if (!accessToken) {
        setLocationError("Authentication failed. Please login again.");
      }
    };
    loadToken();
  }, []);

  // Fetch all routes when token is available
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/driver/routes`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then((res) => res.json())
      .then(setRoutes)
      .catch(console.error);
  }, [token]);

  // Fetch driver location with proper error handling
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    if (!isSecureContext) {
      setLocationError("Location requires HTTPS. Please use HTTPS connection.");
      return;
    }

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          console.log("📍 Driver location obtained:", pos.coords.latitude, pos.coords.longitude);
          setDriverPos([pos.coords.latitude, pos.coords.longitude]);
          setLocationError(null);
        },
        (err) => {
          console.error("Geolocation error:", err);
          let errorMsg = "";
          switch(err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = "Location permission denied. Please allow location access.";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg = "Location information is unavailable.";
              break;
            case err.TIMEOUT:
              errorMsg = "Location request timed out.";
              break;
            default:
              errorMsg = "An unknown error occurred.";
          }
          setLocationError(errorMsg);
          // Set default location (Kolkata)
          setDriverPos([22.5726, 88.3639]);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    };

    updateLocation();
    const interval = setInterval(updateLocation, 10000);
    return () => clearInterval(interval);
  }, [isSecureContext]);

  // Fetch route details and trips
  const fetchRouteDetails = async (routeId: string) => {
    if (!routeId || !token) {
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
      console.log("Route details with stops:", data);
      console.log("Number of stops:", data.route?.stops?.length || 0);
      data.route?.stops?.forEach((stop: any, index: number) => {
        console.log(`Stop ${index + 1}: ${stop.name} - Lat: ${stop.latitude}, Lng: ${stop.longitude}`);
      });
      
      setRouteDetails(data.route || null);

      const sortedTrips = (data.trips || []).sort((a: any, b: any) => {
        const order: Record<string, number> = { scheduled: 1, in_progress: 2, completed: 3 };
        return (order[a.status] ?? 0) - (order[b.status] ?? 0);
      });
      setTrips(sortedTrips);
      
      if (sortedTrips.length > 0) {
        setSelectedTrip(sortedTrips[0]);
      }

      // Center map on first stop after a short delay
      setTimeout(() => {
        if (mapRef.current && data.route?.stops?.length > 0) {
          const firstStop = data.route.stops[0];
          if (firstStop.latitude && firstStop.longitude) {
            mapRef.current.setView([firstStop.latitude, firstStop.longitude], 13, { animate: true });
            console.log("🗺️ Map centered on first stop:", firstStop.name);
          }
        }
      }, 200);
    } catch (err) {
      console.error(err);
      setMapError(true);
    } finally {
      setLoading(false);
    }
  };

  const mapCenter = (() => {
    if (routeDetails?.stops?.length > 0 && routeDetails.stops[0].latitude) {
      return [routeDetails.stops[0].latitude, routeDetails.stops[0].longitude];
    }
    if (driverPos) {
      return driverPos;
    }
    return [22.5726, 88.3639];
  })() as [number, number];

  const formatTime = (time: string | null) => {
    if (!time) return "--:--";
    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStopIcon = (index: number, total: number) => {
    if (index === 0) return startIcon;  // First stop - Blue
    if (index === total - 1) return endIcon;  // Last stop - Purple
    return stopIcon;  // Middle stops - Green
  };

  return (
    <IonPage className="bg-linear-to-br from-gray-900 to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        <IonLoading isOpen={loading} message="Loading route details..." />

        {/* Full-screen map container */}
        <div className="relative h-screen w-full">
          {/* Map Loading State */}
          {loading && !routeDetails && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white font-medium">Loading map...</p>
              </div>
            </div>
          )}

          {/* Map Container */}
          {!mapError ? (
            <MapContainer
              key={selectedRouteId || "default"}
              center={mapCenter}
              zoom={13}
              style={{ 
                height: "100%", 
                width: "100%",
                backgroundColor: "#1a1a2e",
                zIndex: 0
              }}
              ref={mapRef}
              className="z-0"
              zoomControl={true}
              scrollWheelZoom={true}
              doubleClickZoom={true}
            >
              {/* OpenStreetMap Tile Layer */}
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
                maxZoom={19}
                minZoom={3}
              />

              {/* Driver Marker */}
              {driverPos && driverPos[0] && driverPos[1] && (
                <Marker position={driverPos} icon={driverIcon}>
                  <Popup autoPan={true}>
                    <div className="text-center min-w-[140px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-lg">🚗</span>
                        </div>
                        <div>
                          <strong className="text-sm block">Driver Location</strong>
                          <span className="text-xs text-green-600 font-semibold">● Live</span>
                        </div>
                      </div>
                      <hr className="my-2" />
                      <div className="text-xs text-gray-600">
                        <p>Lat: {driverPos[0].toFixed(6)}</p>
                        <p>Lng: {driverPos[1].toFixed(6)}</p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Stop Markers - ALL STOPS WILL SHOW AS PINS HERE */}
              {routeDetails?.stops && routeDetails.stops.length > 0 && (
                <>
                  {routeDetails.stops
                    .filter((s: any) => s.latitude && s.longitude)
                    .map((stop: any, index: number) => {
                      const isFirst = index === 0;
                      const isLast = index === routeDetails.stops.length - 1;
                      const stopMarkerIcon = getStopIcon(index, routeDetails.stops.length);
                      
                      return (
                        <Marker 
                          key={stop.stop_id || index} 
                          position={[stop.latitude, stop.longitude]} 
                          icon={stopMarkerIcon}
                          eventHandlers={{
                            click: () => {
                              console.log(`📍 Stop clicked: ${stop.name}`);
                            }
                          }}
                        >
                          <Popup autoPan={true}>
                            <div className="min-w-[200px] p-2">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                  isFirst ? "bg-blue-100" : isLast ? "bg-purple-100" : "bg-green-100"
                                }`}>
                                  <span className="text-xl">
                                    {isFirst ? "🏁" : isLast ? "🏆" : "📍"}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <strong className="text-base block text-gray-900 dark:text-white">
                                    {stop.stop_name || stop.name}
                                  </strong>
                                  <span className="text-xs text-gray-500">
                                    Stop {index + 1} of {routeDetails.stops.length}
                                  </span>
                                </div>
                              </div>
                              
                              <hr className="my-2 border-gray-200 dark:border-gray-700" />
                              
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-gray-500">📍 Coordinates:</span>
                                  <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
                                    {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                                  </span>
                                </div>
                                
                                {selectedTrip && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-500">⏰ Estimated Arrival:</span>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                      {formatTime(selectedTrip.stops?.find((ts: any) => ts.stop_id === stop.stop_id)?.planned_arrival_time)}
                                    </span>
                                  </div>
                                )}
                                
                                {isFirst && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                      🚀 Trip Starting Point
                                    </span>
                                  </div>
                                )}
                                
                                {isLast && (
                                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                                      🏁 Trip End Point
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                </>
              )}

              {/* Route Polyline connecting all stops */}
              {routeDetails?.stops && routeDetails.stops.length > 1 && (
                <Polyline
                  positions={routeDetails.stops
                    .filter((s: any) => s.latitude && s.longitude)
                    .map((s: any) => [s.latitude, s.longitude])}
                  color="#10b981"
                  weight={5}
                  opacity={0.9}
                  dashArray="15, 10"
                  lineCap="round"
                  lineJoin="round"
                />
              )}

              {/* Auto fit bounds to show all stops on map */}
              {routeDetails?.stops && routeDetails.stops.length > 0 && (
                <FitBounds stops={routeDetails.stops} />
              )}

              <LiveLocationUpdater position={driverPos} />
            </MapContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-900">
              <div className="text-center p-6">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-white font-semibold mb-2">Map Failed to Load</p>
                <p className="text-gray-400 text-sm mb-4">Please check your internet connection</p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '10px 20px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Stops Count Indicator */}
          {routeDetails?.stops && routeDetails.stops.length > 0 && (
            <div className="absolute top-20 right-4 z-10 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-medium">
                  📍 {routeDetails.stops.length} Stops on Route
                </span>
                <button
                  onClick={() => {
                    if (mapRef.current && routeDetails.stops.length > 0) {
                      const validStops = routeDetails.stops.filter((s: any) => s.latitude && s.longitude);
                      if (validStops.length > 0) {
                        const bounds = L.latLngBounds(validStops.map((s: any) => [s.latitude, s.longitude]));
                        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                      }
                    }
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  View All
                </button>
              </div>
            </div>
          )}

          {/* Location Permission Banner */}
          {locationError && (
            <div className="absolute top-20 left-4 right-4 z-20 bg-yellow-500/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">📍</div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm mb-1">Location Access Required</p>
                  <p className="text-white/80 text-xs mb-3">{locationError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Header Overlay */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-linear-to-b from-black/80 to-transparent pointer-events-none">
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <h1 className="text-white font-bold text-lg">Live Tracking</h1>
                  <p className="text-white/70 text-xs">
                    {routeDetails ? routeDetails.name : "Select a route"}
                  </p>
                </div>
              </div>
              {driverPos && !locationError && (
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-white text-xs font-medium">Live</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Route Info Overlay */}
          {routeDetails && (
            <div className="absolute top-24 left-4 right-4 z-10 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-sm rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-white text-sm font-medium">
                      {routeDetails.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-blue-400 text-xs">🔵</span>
                      <span className="text-white text-xs">Start</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-green-400 text-xs">🟢</span>
                      <span className="text-white text-xs">Stop</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-purple-400 text-xs">🟣</span>
                      <span className="text-white text-xs">End</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Map Controls Help */}
          <div className="absolute bottom-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 pointer-events-none">
            <div className="flex items-center gap-3 text-white text-xs">
              <span>🔍 Scroll to zoom</span>
              <span>🖱️ Drag to move</span>
              <span>📍 Click markers for details</span>
            </div>
          </div>

          {/* Bottom Sheet */}
          <div
            className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl transition-all duration-500 z-20 ${
              sheetOpen ? "h-[75%]" : "h-auto"
            }`}
            style={{
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
            }}
          >
            {/* Pull Handle */}
            <div
              className="flex justify-center py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-t-3xl"
              onClick={() => setSheetOpen(!sheetOpen)}
            >
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>

            {/* Sheet Content */}
            <div className={`overflow-y-auto ${sheetOpen ? 'h-full' : 'max-h-0'} px-5 pb-6`}>
              {/* Route Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🚏</span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Select Route</h2>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {routes.map((r) => (
                    <div
                      key={r.route_id}
                      onClick={() => {
                        setSelectedRouteId(r.route_id);
                        fetchRouteDetails(r.route_id);
                        setSheetOpen(false);
                      }}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedRouteId === r.route_id
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">{r.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {r.stops?.length || 0} stops • Active route
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Route Details */}
              {routeDetails && (
                <>
                  {/* Trip Selection */}
                  {trips.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🚍</span>
                        <h3 className="text-md font-semibold text-gray-900 dark:text-white">Active Trips</h3>
                      </div>
                      <div className="space-y-2">
                        {trips.map((t) => (
                          <div
                            key={t.trip_id}
                            onClick={() => setSelectedTrip(t)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedTrip?.trip_id === t.trip_id
                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                : "border-gray-200 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  Trip ID: {t.trip_id?.slice(-8) || "N/A"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {formatTime(t.planned_start)} - {formatTime(t.planned_end)}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                t.status === "in_progress" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                                t.status === "scheduled" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" :
                                "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              }`}>
                                {t.status === "in_progress" ? "In Progress" : t.status === "scheduled" ? "Scheduled" : "Completed"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stops List */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">📍</span>
                      <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                        Route Stops ({routeDetails.stops?.length || 0})
                      </h3>
                    </div>
                    
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {routeDetails.stops.map((s: any, i: number) => (
                        <div
                          key={i}
                          className="relative pl-6 pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          onClick={() => {
                            if (mapRef.current && s.latitude && s.longitude) {
                              mapRef.current.setView([s.latitude, s.longitude], 15, { animate: true });
                              setSheetOpen(false);
                            }
                          }}
                          style={{
                            borderLeft: i !== routeDetails.stops.length - 1 ? '2px solid' : 'none',
                            borderColor: '#e5e7eb'
                          }}
                        >
                          <div className={`absolute -left-2 top-2 w-4 h-4 rounded-full ring-4 ring-white dark:ring-gray-900 ${
                            i === 0 ? "bg-blue-500" : i === routeDetails.stops.length - 1 ? "bg-purple-500" : "bg-emerald-500"
                          }`}></div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl ml-2">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {i + 1}. {s.stop_name || s.name}
                            </p>
                            {s.latitude && s.longitude && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                📍 {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}
                              </p>
                            )}
                            {selectedTrip && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                ⏰ {formatTime(selectedTrip.stops?.find((ts: any) => ts.stop_id === s.stop_id)?.planned_arrival_time)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-linear-to-r from-emerald-500 to-teal-500 rounded-xl p-3 text-white">
                      <p className="text-xs opacity-90">Total Stops</p>
                      <p className="text-2xl font-bold">{routeDetails.stops?.length || 0}</p>
                    </div>
                    <div className="bg-linear-to-r from-blue-500 to-indigo-500 rounded-xl p-3 text-white">
                      <p className="text-xs opacity-90">Active Trips</p>
                      <p className="text-2xl font-bold">{trips.filter((t: any) => t.status === "in_progress").length}</p>
                    </div>
                  </div>
                </>
              )}

              {/* No Route Selected State */}
              {!routeDetails && routes.length > 0 && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-3xl">🗺️</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Select a route to view stops on map</p>
                </div>
              )}
            </div>

            {/* Collapsed View */}
            {!sheetOpen && (
              <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <span className="text-lg">🚏</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedRouteId ? routeDetails?.name || "Route Selected" : "No Route Selected"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {routeDetails?.stops?.length || 0} stops on this route
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-lg">↑</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Driver Info Floating Card */}
          {driverPos && (
            <div className="absolute bottom-28 right-4 z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-3 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="text-xl">🚗</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Your Location</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {driverPos[0].toFixed(6)}, {driverPos[1].toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </IonContent>

      <style>{`
        .leaflet-container {
          background: #1a1a2e !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2) !important;
        }
        
        .leaflet-popup-content {
          margin: 12px !important;
          min-width: 200px !important;
        }
        
        .leaflet-popup-tip {
          box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1) !important;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
        }
        
        .leaflet-control-zoom a {
          background-color: white !important;
          color: #1f2937 !important;
          border-radius: 8px !important;
          margin: 4px !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
        }
        
        .dark .leaflet-control-zoom a {
          background-color: #1f2937 !important;
          color: white !important;
        }
        
        .leaflet-control-zoom a:hover {
          background-color: #f3f4f6 !important;
        }
        
        .dark .leaflet-control-zoom a:hover {
          background-color: #374151 !important;
        }
        
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.8) !important;
          font-size: 9px !important;
          padding: 2px 6px !important;
          border-radius: 8px !important;
          bottom: 8px !important;
          right: 8px !important;
        }
        
        .dark .leaflet-control-attribution {
          background: rgba(0, 0, 0, 0.7) !important;
          color: #9ca3af !important;
        }
        
        .dark .leaflet-control-attribution a {
          color: #60a5fa !important;
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        .dark ::-webkit-scrollbar-track {
          background: #1f2937;
        }
        
        .dark ::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
      `}</style>
    </IonPage>
  );
};

export default DriverLiveTracking;