import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import NavbarSidebar from "./Navbar";
import {
  ClockIcon,
  TruckIcon,
  IdentificationIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  MapIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";

const API_BASE = "https://be.shuttleapp.transev.site";

const BookingDetails: React.FC = () => {
  const token = localStorage.getItem("access_token");

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [vehicleData, setVehicleData] = useState<any>(null);

  // Fetch all routes
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch(`${API_BASE}/driver/routes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRoutes(data || []);
        if (data && data.length > 0) setSelectedRouteId(data[0].route_id);
      } catch (err) {
        console.error("Error fetching routes:", err);
      }
    };
    fetchRoutes();
  }, [token]);

  // Fetch vehicle first
  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/driver/vehicle/my-vehicle`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setVehicleData(data);
      } catch (err) {
        console.error("Error fetching vehicle:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [token]);

  // Fetch trips for selected route
  useEffect(() => {
    if (!selectedRouteId) return;
    const fetchRouteDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/driver/routes/${selectedRouteId}/trips/details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setRouteDetails(data);
        if (data.trips && data.trips.length > 0) {
          setSelectedTripId(data.trips[0].trip_id);
        } else {
          setSelectedTripId("");
          setBookingDetails(null);
        }
      } catch (err) {
        console.error("Error fetching route details:", err);
        setRouteDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRouteDetails();
  }, [selectedRouteId, token]);

  // Fetch booking details **after vehicle is loaded**
  useEffect(() => {
    if (!selectedTripId || !vehicleData) return;
    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/driver/trips/${selectedTripId}/booking-details`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setBookingDetails(data);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setBookingDetails(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [selectedTripId, vehicleData, token]);

  const availableSeats = vehicleData?.seat_count ?? 10; // default 10 if not provided
  const bookingCount = bookingDetails?.booking_count ?? 0;
  const seatsLeft = availableSeats - bookingCount;
  const bookings = bookingDetails?.bookings ?? [];

  const formatDateTime = (dt: string) =>
    dt
      ? new Date(dt).toLocaleString("en-IN", {
          hour12: true,
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "--";

  const formatDate = (dt: string) =>
    dt ? new Date(dt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "--";

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white pt-16 pb-8">
        <div className="max-w-5xl mx-auto px-6 mt-20">
          <h1 className="text-3xl font-extrabold mb-6 text-gray-800 dark:text-white">
            🚍 Booking Details
          </h1>

          <IonLoading isOpen={loading} message="Loading..." />

          {/* Route Selector */}
          <div className="mb-6">
            <label className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
              Select Route
            </label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              value={selectedRouteId}
              onChange={(e) => setSelectedRouteId(e.target.value)}
            >
              {routes.map((r) => (
                <option key={r.route_id} value={r.route_id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Trip Selector */}
          {routeDetails?.trips?.length > 0 ? (
            <div className="mb-6">
              <label className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">
                Select Trip
              </label>
              <select
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600"
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
              >
                {routeDetails.trips.map((t: any) => (
                  <option key={t.trip_id} value={t.trip_id}>
                    {formatDateTime(t.planned_start)} - {formatDateTime(t.planned_end)}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mb-6 text-center font-semibold text-gray-500 dark:text-gray-400">
              ⚠️ No trips created for this route.
            </div>
          )}

          {/* Booking Details Card */}
          {bookingDetails && (
            <>
              <div className="bg-linear-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {bookingDetails.route?.name || "--"}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(bookingDetails.planned_start)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-blue-500" />
                    {formatDateTime(bookingDetails.planned_start)} - {formatDateTime(bookingDetails.planned_end)}
                  </div>

                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-6 h-6 text-green-500" />
                    {vehicleData?.vehicle_name || "--"} ({vehicleData?.registration_number || "--"})
                  </div>

                  <div className="flex items-center gap-2">
                    <IdentificationIcon className="w-6 h-6 text-yellow-500" />
                    Driver: {bookingDetails.driver?.email || "--"}
                  </div>

                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-6 h-6 text-purple-500" />
                    Seats Booked: {bookingCount} / {availableSeats}
                  </div>

                  <div className="flex items-center gap-2">
                    <CurrencyRupeeIcon className="w-6 h-6 text-pink-500" />
                    Total Fare: ₹{bookingDetails.total_fare?.toFixed(2) || "0.00"}
                  </div>

                  <div className="flex items-center gap-2">
                    <CurrencyRupeeIcon className="w-6 h-6 text-indigo-500" />
                    Total Paid: ₹{bookingDetails.total_fare_paid?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>

              {/* Seat Availability */}
              <div
                className={`p-4 rounded-lg mb-6 text-center font-semibold text-lg ${
                  seatsLeft <= 0
                    ? "bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200"
                    : "bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200"
                }`}
              >
                {seatsLeft <= 0
                  ? "🚫 No seats available — booking closed"
                  : `🎟 Seats available: ${seatsLeft} remaining`}
              </div>

              {/* Bookings List */}
              <div className="space-y-4">
   {bookings.length === 0 ? (
    <div className="text-center text-gray-500 dark:text-gray-400 font-medium">
      ⚠️ No bookings have been made for this trip.
    </div>
  ) : (
    bookings.map((b: any, idx: number) => (
      <div
        key={idx}
        className="bg-linear-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
      >
        {/* Passenger Name */}
        <div className="flex justify-between items-center mb-3">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            👤 Passenger: {b.name || "--"}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Booking ID: {b.booking_id || "--"}
          </span>
        </div>

        {/* Pickup / Drop-off */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-blue-400" />
            Pickup: {b.take_in || "--"}
          </div>
          <div className="flex items-center gap-2">
            <MapIcon className="w-5 h-5 text-red-400" />
            Drop-off: {b.drop_off || "--"}
          </div>
        </div>

        {/* Estimated Times */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-blue-500" />
            Estimated Pickup: {b.estimated_pickup_time ? new Date(b.estimated_pickup_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "--"}
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-purple-500" />
            Estimated Drop-off: {b.estimated_drop_off_time ? new Date(b.estimated_drop_off_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "--"}
          </div>
        </div>

        {/* Fare and Status */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-center text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <CurrencyRupeeIcon className="w-5 h-5 text-green-500" />
            Fare: ₹{b.fare ?? "--"}
          </div>
          <div className="flex items-center gap-2">
            <CurrencyRupeeIcon className="w-5 h-5 text-indigo-500" />
            Paid: ₹{b.fare_paid ?? "--"}
          </div>
          <div className={`flex items-center gap-2 font-semibold ${
            b.fare_paid === b.fare
              ? "text-green-700 dark:text-green-300"
              : "text-red-700 dark:text-red-300"
          }`}>
            <TicketIcon className="w-5 h-5" />
            {b.fare_paid === b.fare ? "✅ Paid" : "❌ Pending"}
          </div>
        </div>
      </div>
    ))
  )}
</div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default BookingDetails;