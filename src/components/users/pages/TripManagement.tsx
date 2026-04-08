import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import NavbarSidebar from "./Navbar";
import { useHistory } from "react-router-dom";
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

const API_BASE = "https://be.shuttleapp.transev.site";

const DriverTripManagement = () => {
  const token = localStorage.getItem("access_token");
  const history = useHistory();

  const [routes, setRoutes] = useState<any[]>([]);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [driverVerified, setDriverVerified] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelTripId, setCancelTripId] = useState<string | null>(null);
  const [trip, setTrip] = useState<any>(null);
  const [route, setRoute] = useState<any>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);
  const [emergencyReason, setEmergencyReason] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/driver-profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDriverVerified(data.verification_status === "verified");
      } catch (err) {
        console.error(err);
        setDriverVerified(false);
      }
    };
    fetchProfile();
  }, [token]);

  useEffect(() => {
    fetch(`${API_BASE}/driver/routes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setRoutes)
      .catch(console.error);
  }, [token]);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, []);

  const handleStartTrip = async (tripId: string) => {
    if (!tripId) return;
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const formData = new FormData();
      formData.append("lat", latitude.toString());
      formData.append("lng", longitude.toString());

      const res = await fetch(`${API_BASE}/driver/scheduled-trips/${tripId}/start`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Failed to start trip");

      alert("✅ Trip Started Successfully!");
      fetchTripDetails();
    } catch (err: any) {
      alert("❌ Failed: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = async (tripId: string) => {
    if (!tripId) return;
    setLoading(true);
    try {
      const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
          } else {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
              (err) => reject(err),
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }
        });
      };

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

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to end trip");
      }

      alert("✅ Trip ended successfully!");
      fetchTripDetails();
    } catch (err: any) {
      alert("❌ Failed: " + (err.message || "Unknown error"));
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
      const getLocation = (): Promise<{ lat: number; lng: number }> => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
          } else {
            navigator.geolocation.getCurrentPosition(
              (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
              (err) => reject(err),
              { enableHighAccuracy: true }
            );
          }
        });
      };

      const { lat, lng } = await getLocation();
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

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail?.[0]?.msg || "Emergency stop failed");
      }

      alert("✅ Trip stopped successfully!");
      setShowEmergencyModal(false);
      fetchTripDetails();
    } catch (err: any) {
      alert(`❌ Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = () => {
    if (driverVerified) {
      history.push("/create-trip");
    } else {
      alert("Your account is not verified. You cannot create trips.");
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "--:--";
    return new Date(time).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
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
      const formData = new FormData();
      formData.append("reason", cancelReason);
      const res = await fetch(`${API_BASE}/driver/trips/${cancelTripId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.detail || "Cancel trip failed");
      }
      alert("Trip cancelled successfully!");
      setShowCancelModal(false);
      setCancelReason("");
      setCancelTripId(null);
      if (routeDetails?.id) fetchRouteDetails(routeDetails.id);
    } catch (err: any) {
      alert(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedTrip = trips?.[0] || null;

  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-6xl mx-auto">
          <IonLoading isOpen={loading} message="Loading..." />

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium mb-3">
                <span>🚍</span>
                <span>Trip Management</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 dark:text-gray-400 bg-clip-text text-transparent">
                Manage Your Trips
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                View, start, and manage your scheduled trips
              </p>
            </div>
            
            <button
              onClick={handleCreateTrip}
              style={{
                height: '44px',
                padding: '0 24px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                fontWeight: '600',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 8px -1px rgba(99, 102, 241, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(99, 102, 241, 0.3)';
              }}
            >
              <span>+</span>
              Create Trip
            </button>
          </div>

          {/* Route Selector Card */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
            <div className="p-5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Route
              </label>
              <div className="relative">
                <select
                  onChange={(e) => fetchRouteDetails(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '14px',
                    border: '2px solid',
                    borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
                    color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
                    fontSize: '15px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.outline = 'none';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <option value="">🚏 Select a route</option>
                  {routes.map((r) => (
                    <option key={r.route_id} value={r.route_id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {!routeDetails && (
            <div className="flex flex-col items-center justify-center text-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-10 shadow-xl">
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '40px' }}>🛣️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Your Route</h2>
              <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                Please select a route to manage your trips, view stops, and track journey details.
              </p>
              <div className="mt-4 text-sm text-gray-400 dark:text-gray-500">⬆️ Select a route from above</div>
            </div>
          )}

          {/* Route Stops Section */}
          {routeDetails?.stops && selectedTrip && (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{routeDetails.name} - Stops</h2>
              </div>
              <div className="p-5">
                <div style={{ borderLeft: '2px solid', borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb', paddingLeft: '20px' }}>
                  {routeDetails.stops.map((stop: any, i: number) => {
                    const tripStop = selectedTrip.stops.find((s: any) => s.stop_id === stop.stop_id);
                    return (
                      <div key={stop.stop_id} style={{ position: 'relative', marginBottom: '20px' }}>
                        <div style={{
                          position: 'absolute',
                          left: '-28px',
                          top: '8px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000'
                        }}></div>
                        <div style={{
                          padding: '16px',
                          borderRadius: '12px',
                          backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f9fafb',
                          border: '1px solid',
                          borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'
                        }}>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-600">{i + 1}. {stop.name}</h3>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">🕒 Planned: {formatTime(tripStop?.planned_arrival_time)}</div>
                          {tripStop?.fares?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {tripStop.fares.map((f: any) => (
                                <span key={f.to_stop_id} style={{
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  backgroundColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                                  color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000'
                                }}>
                                  {f.to_stop_name} ₹{f.amount}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Map */}
                {routeDetails.stops.length > 0 && (
                  <div style={{ height: '260px', marginTop: '20px', borderRadius: '12px', overflow: 'hidden' }}>
                    <MapContainer center={[22.57, 88.36]} zoom={12} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {routeDetails.stops.map((s: any, i: number) => (
                        <Marker key={i} position={[s.latitude || 22.57 + i * 0.01, s.longitude || 88.36 + i * 0.01]}>
                          <Popup>{s.stop_name}</Popup>
                        </Marker>
                      ))}
                      <Polyline positions={routeDetails.stops.map((s: any, i: number) => [s.latitude || 22.57 + i * 0.01, s.longitude || 88.36 + i * 0.01])} color="#6366f1" />
                    </MapContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trips List */}
          {trips.length === 0 && routeDetails && (
            <div className="text-center py-12 bg-white/80 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No trips created yet for this route.</p>
            </div>
          )}

          {[...trips].sort((a, b) => new Date(b.planned_start).getTime() - new Date(a.planned_start).getTime()).map((trip) => (
            <div key={trip.trip_id} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-5">
              <div className="p-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    🚍 Trip ID: <span className="text-indigo-600 dark:text-indigo-400">{trip.trip_id.slice(-8)}</span>
                  </h3>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f3f4f6',
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                  }}>
                    📅 {new Date(trip.planned_start).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* Times */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Planned Start</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      📅 {new Date(trip.planned_start).toLocaleDateString("en-IN")} 🕒 {new Date(trip.planned_start).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Planned End</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      📅 {new Date(trip.planned_end).toLocaleDateString("en-IN")} 🕒 {new Date(trip.planned_end).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </p>
                  </div>
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
                {/* Status Badge */}
                <div className="flex justify-end mb-4">
                  <span style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: trip.status === "scheduled" ? "#fef3c7" : trip.status === "in_progress" ? "#dbeafe" : trip.status === "completed" ? "#d1fae5" : "#fee2e2",
                    color: trip.status === "scheduled" ? "#d97706" : trip.status === "in_progress" ? "#2563eb" : trip.status === "completed" ? "#059669" : "#dc2626"
                  }}>
                    {trip.status === "scheduled" && "🟡 Scheduled"}
                    {trip.status === "in_progress" && "🚍 In Progress"}
                    {trip.status === "completed" && "✅ Completed"}
                    {trip.status === "cancelled" && "❌ Cancelled"}
                    {trip.status === "premature_end" && "⚠️ Premature End"}
                  </span>
                </div>

                {/* Cancel Reason */}
                {(trip.status === "cancelled" || trip.status === "premature_end") && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    backgroundColor: document.documentElement.classList.contains('dark') ? '#450a0a' : '#fef2f2',
                    borderLeft: '4px solid #ef4444'
                  }}>
                    <strong className="text-sm text-red-700 dark:text-red-300">Reason:</strong> {trip.cancel_reason || trip.premature_end_reason || "No reason provided"}
                  </div>
                )}

                {/* Action Buttons */}
                {trip.status === "scheduled" && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleStartTrip(trip.trip_id)}
                      style={{
                        flex: 1,
                        height: '48px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        fontWeight: '600',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      🚀 Start Trip
                    </button>
                    <button
                      onClick={() => handleCancelTrip(trip.trip_id)}
                      style={{
                        flex: 1,
                        height: '48px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        fontWeight: '600',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      ❌ Cancel Trip
                    </button>
                  </div>
                )}

                {trip.status === "in_progress" && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => handleEndTrip(trip.trip_id)}
                      style={{
                        flex: 1,
                        height: '48px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        fontWeight: '600',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      🏁 End Trip
                    </button>
                    <button
                      onClick={() => openEmergencyStopModal(trip.trip_id)}
                      style={{
                        flex: 1,
                        height: '48px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        color: 'white',
                        fontWeight: '600',
                        borderRadius: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      🚨 Emergency End
                    </button>
                  </div>
                )}

                {trip.status === "completed" && (
                  <div style={{
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                    color: '#065f46',
                    fontWeight: '600',
                    borderRadius: '12px'
                  }}>
                    ✅ Trip Completed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </IonContent>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cancel Trip</h2>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for cancellation:</label>
            <textarea
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
                marginBottom: '20px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={submitCancelTrip}
                disabled={!cancelReason || loading}
                style={{
                  flex: 1,
                  height: '44px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: !cancelReason || loading ? 'not-allowed' : 'pointer',
                  opacity: !cancelReason || loading ? 0.6 : 1
                }}
              >
                {loading ? "Cancelling..." : "Submit"}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  flex: 1,
                  height: '44px',
                  background: '#e5e7eb',
                  color: '#374151',
                  fontWeight: '600',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-9999 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Emergency Stop</h2>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason for emergency stop:</label>
            <textarea
              rows={4}
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid',
                borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                backgroundColor: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1f2937',
                marginBottom: '20px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={submitEmergencyStop}
                disabled={!emergencyReason || loading}
                style={{
                  flex: 1,
                  height: '44px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: !emergencyReason || loading ? 'not-allowed' : 'pointer',
                  opacity: !emergencyReason || loading ? 0.6 : 1
                }}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
              <button
                onClick={() => setShowEmergencyModal(false)}
                style={{
                  flex: 1,
                  height: '44px',
                  background: '#e5e7eb',
                  color: '#374151',
                  fontWeight: '600',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bg-grid-gray-900\\/[0.02] {
          background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
        }
        .dark .bg-grid-white\\/[0.02] {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
      `}</style>
    </IonPage>
  );
};

export default DriverTripManagement;