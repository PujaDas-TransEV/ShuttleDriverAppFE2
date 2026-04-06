
import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import NavbarSidebar from "./Navbar";
import { useHistory } from "react-router-dom";
// import { useNavigate } from "react-router-dom";



const API_BASE = "https://be.shuttleapp.transev.site";

const DriverTripManagement = () => {
  // const history = useHistory();
  const token = localStorage.getItem("access_token");

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
const history = useHistory();
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
  // 🔹 Handle Create Trip Navigation
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
  // 🔹 Cancel Trip (UPDATED API)
// Step 1: Open modal instead of window.confirm
const handleCancelTrip = (tripId: string) => {
  if (!tripId) return;
  setCancelTripId(tripId);
  setCancelReason("");
  setShowCancelModal(true);
};

// Step 2: Submit cancellation with reason
const submitCancelTrip = async () => {
  if (!cancelTripId || !cancelReason) return;

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append("reason", cancelReason);

    const res = await fetch(`${API_BASE}/driver/trips/${cancelTripId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      // Try to parse error message from API
      const errData = await res.json();
      const errMsg = errData?.detail || "Cancel trip failed";
      throw new Error(errMsg);
    }

    alert("Trip cancelled successfully!");
    setShowCancelModal(false);
    setCancelReason("");
    setCancelTripId(null);

    // Refresh route/trip data
    if (routeDetails?.id) fetchRouteDetails(routeDetails.id);

  } catch (err: any) {
    console.error(err);
    alert(`❌ ${err.message}`); // show API error
  } finally {
    setLoading(false);
  }
};
  //  const selectedTrip = trips[0];
  const selectedTrip = trips?.[0] || null;
  // State
const [showEmergencyModal, setShowEmergencyModal] = useState(false);
const [emergencyTripId, setEmergencyTripId] = useState<string | null>(null);
const [emergencyReason, setEmergencyReason] = useState("");

// Open modal


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
  className="w-full p-4 rounded-xl border mb-6 
             bg-white dark:bg-gray-800 
             border-gray-300 dark:border-gray-700 
             text-gray-900 dark:text-gray-100 
             text-base font-medium 
             focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
  onChange={(e) => fetchRouteDetails(e.target.value)}
>
  <option value="" className="text-gray-500 dark:text-gray-100">
    🚏 Select Route
  </option>
  {routes.map((r) => (
    <option
      key={r.route_id}
      value={r.route_id}
      className="text-gray-900 dark:text-gray-100"
    >
      {r.name}
    </option>
  ))}
</select>

{/* 🖤 White/Black Empty UI */}
{!routeDetails && (
  <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-2xl p-10 shadow-sm">
    
    {/* Icon */}
    <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-5">
      <span className="text-4xl">🛣️</span>
    </div>

    {/* Title */}
    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
      Select Your Route
    </h2>

    {/* Description */}
    <p className="text-base text-gray-700 dark:text-gray-300 max-w-sm leading-relaxed mb-4">
      Please select a route to manage your trips, view stops, and track journey details.
    </p>

    {/* Hint */}
    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
      ⬆️ Select a route from above
    </div>

  </div>
)}

    
               {/* ✅ BEAUTIFUL ROUTE STOPS */}
        {routeDetails?.stops && selectedTrip && (
  <div className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow mb-5">
    <h2 className="font-bold text-lg mb-4 dark:text-white">
      {routeDetails.name} Stops
    </h2>

    {/* 🔹 Stops Timeline */}
    <div className="border-l-2 border-gray-300 dark:border-gray-700 pl-4 space-y-6">
      {routeDetails.stops.map((stop: any, i: number) => {
        const tripStop = selectedTrip.stops.find(
          (s: any) => s.stop_id === stop.stop_id
        );

        return (
          <div key={stop.stop_id} className="relative">
            {/* Dot */}
            <div className="absolute -left-6 top-2 w-3 h-3 bg-black dark:bg-white rounded-full"></div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              
              {/* Stop Name */}
              <h3 className="font-semibold text-black dark:text-white text-base">
                {i + 1}. {stop.name}
              </h3>

              {/* Time */}
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                🕒 Planned: {formatTime(tripStop?.planned_arrival_time)}
              </div>

              {/* Actual Times */}
              <div className="text-xs text-gray-400 mt-1">
                Arrival: {formatTime(tripStop?.actual_arrival_time)} | 
                Departure: {formatTime(tripStop?.actual_departure_time)}
              </div>

              {/* Fares */}
              {tripStop?.fares?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {tripStop.fares.map((f: any) => (
                    <span
                      key={f.to_stop_id}
                      className="bg-black dark:bg-white text-white dark:text-black text-xs px-3 py-1 rounded-full shadow-sm"
                    >
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

        {/* {trips.map((trip) => ( */}
      {[...trips]
  .sort((a, b) => {
    const timeA = a.planned_start
      ? new Date(a.planned_start).getTime()
      : 0;
    const timeB = b.planned_start
      ? new Date(b.planned_start).getTime()
      : 0;

    return timeB - timeA;
  })
  .map((trip) => (
          <div
            key={trip.trip_id}
            className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow mb-4 border border-gray-200 dark:border-gray-700"
          >
        
<div className="flex justify-between items-center mb-4">
  {/* Trip ID */}
  <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">
    🚍 Trip ID: 
      <span className="font-mono text-indigo-600 dark:text-indigo-400 ml-1">
      {trip.trip_id}
    </span>
  </h3>

  {/* Date */}
  <span className="text-sm md:text-base text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg shadow-sm">
    📅 {new Date(trip.planned_start).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}
  </span>
</div>
          
            <div className="flex justify-between items-center text-sm mb-3 font-medium">
  <div className="flex flex-col">
    <span className="text-gray-500 dark:text-gray-400 text-xs">Planned Start</span>
    <span className="text-black dark:text-white font-semibold">
      📅 {new Date(trip.planned_start).toLocaleDateString("en-IN")}  
      {" "}
      🕒 {new Date(trip.planned_start).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
    </span>
  </div>

  <div className="flex flex-col text-right">
    <span className="text-gray-500 dark:text-gray-400 text-xs">Planned End</span>
    <span className="text-black dark:text-white font-semibold">
      📅 {new Date(trip.planned_end).toLocaleDateString("en-IN")}  
      {" "}
      🕒 {new Date(trip.planned_end).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}
    </span>
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

         
           <div className="flex justify-end mb-3">
  <span
    className={`px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide shadow-sm
    ${trip.status === "scheduled" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"}
    ${trip.status === "in_progress" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}
    ${trip.status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"}
    ${trip.status === "cancelled" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}
        ${trip.status === "premature_end" &&
              "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"}
            `}
  
  >
    {trip.status === "scheduled" && "🟡 Scheduled"}
    {trip.status === "in_progress" && "🚍 In Progress"}
    {trip.status === "completed" && "✅ Completed"}
    {trip.status === "cancelled" && "❌ Cancelled"}
      {trip.status === "premature_end" && "⚠️ Premature End"}
  </span>
</div>

{/* 🔹 Cancel Reason */}

{(trip.status === "cancelled" || trip.status === "premature_end") && (
  <div
    className={`text-sm p-3 rounded-xl mb-3 border-l-4
      ${trip.status === "cancelled" ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300" : ""}
      ${trip.status === "premature_end" ? "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300" : ""}
    `}
  >
    <strong>Reason:</strong>{" "}
    {trip.status === "cancelled"
      ? trip.cancel_reason || "No reason provided"
      : trip.premature_end_reason || "No reason provided"}
  </div>
)}

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
  onClick={() => {
    setCancelTripId(trip.trip_id);
    setShowCancelModal(true);
  }}
  className="flex-1 h-12 bg-red-600 text-white rounded-lg"
  disabled={loading}
>
  Cancel Trip
</button>
              </div>
            )}
          
            {/* Buttons */}
{trip.status === "in_progress" && (
  <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
    {/* End Trip Button */}
    <button
      onClick={() => handleEndTrip(trip.trip_id)}
      style={{
        flex: 1,
        height: "48px",
        backgroundColor: "#ef4444", // red-600
        color: "#ffffff",
        borderRadius: "8px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
      }}
    >
      End Trip
    </button>

    {/* Emergency Stop Button */}
    <button
      onClick={() => openEmergencyStopModal(trip.trip_id)}
      style={{
        flex: 1,
        height: "48px",
        backgroundColor: "#f59e0b", // yellow-600
        color: "#ffffff",
        borderRadius: "8px",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
      }}
    >
      🚨 Emergency End
    </button>
  </div>
)}

{showEmergencyModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
    
    <div className="bg-white dark:bg-gray-900 p-5 rounded-lg w-96 shadow-lg relative z-10000">
      
      <h2 className="font-bold text-lg mb-4 text-black dark:text-white">
        Emergency Stop
      </h2>

      <label className="block mb-2 text-gray-700 dark:text-gray-300">
        Reason for stopping trip:
      </label>

      <textarea
        className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white relative z-10001"
        rows={4}
        value={emergencyReason}
        onChange={(e) => setEmergencyReason(e.target.value)}
      />

      <div className="flex justify-end space-x-2">
        
        {/* Submit Button */}
        <button
          onClick={submitEmergencyStop}
          disabled={!emergencyReason || loading}
          style={{
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#d1fae5",
            color: "green",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: !emergencyReason || loading ? "not-allowed" : "pointer",
            zIndex: 10001, // 🔥 fix
          }}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => setShowEmergencyModal(false)}
          disabled={loading}
          style={{
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e5e7eb",
            color: "#374151",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            zIndex: 10001, // 🔥 fix
          }}
        >
          Cancel
        </button>

      </div>
    </div>
  </div>
)}

{showCancelModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999">
    <div className="bg-white dark:bg-gray-900 p-5 rounded-lg w-96 shadow-lg relative z-10000">
      
      <h2 className="font-bold text-lg mb-4 text-black dark:text-white">
        Cancel Trip
      </h2>

      <label className="block mb-2 text-gray-700 dark:text-gray-300">
        Reason for cancelling trip:
      </label>

      <textarea
        className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        rows={4}
        value={cancelReason}
        onChange={(e) => setCancelReason(e.target.value)}
      />

      <div className="flex justify-end space-x-2">
        
        {/* Submit Button */}
        <button
          onClick={submitCancelTrip}
          disabled={!cancelReason || loading}
          style={{
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fee2e2",
            color: "#b91c1c",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: !cancelReason || loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease-in-out",
            zIndex: 10001, // 🔥 added
          }}
        >
          {loading ? "Cancelling..." : "Submit"}
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => setShowCancelModal(false)}
          disabled={loading}
          style={{
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e5e7eb",
            color: "#374151",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease-in-out",
            zIndex: 10001, // 🔥 added
          }}
        >
          Cancel
        </button>

      </div>
    </div>
  </div>
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

