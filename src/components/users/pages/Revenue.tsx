// import React, { useEffect, useState } from "react";
// import { IonPage, IonContent } from "@ionic/react";
// import NavbarSidebar from "../../users/pages/Navbar";
// import {
//   CurrencyRupeeIcon,
//   UserIcon,
//   TruckIcon,
//   ClockIcon,
//   CalendarIcon,
// } from "@heroicons/react/24/outline";

// const BASE_URL = "https://be.shuttleapp.transev.site";

// async function getDriverPayoutDetails(token: string) {
//   const res = await fetch(`${BASE_URL}/driver/trips/payout-details`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   const data = await res.json();
//   if (!res.ok) throw new Error(data.detail || "Failed to fetch payout");
//   return data;
// }

// const DriverPayoutPage: React.FC = () => {
//   const [data, setData] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const token = localStorage.getItem("access_token");

//   const fetchData = async () => {
//     if (!token) return;
//     setLoading(true);
//     try {
//       const res = await getDriverPayoutDetails(token);
//       setData(res);
//     } catch (err: any) {
//       alert(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const isDark = document.body.classList.contains("dark");

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className={`${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-black"} pt-16`}>
//         <div className="p-5 mt-16">

//           {/* HEADER */}
//           <h1 className="text-3xl font-bold mb-1">💰 My Earnings</h1>
//           <p className={`mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
//             Track all trips, payouts & transfers
//           </p>

//           {loading && <p className="text-center py-5">Loading...</p>}

//           {/* DRIVER PROFILE */}
//           <div
//             className={`rounded-xl p-5 mb-6 shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}`}
//           >
//             <div className="flex items-center gap-2 mb-4">
//               <UserIcon className="w-6 h-6" />
//               <h2 className="text-lg font-bold">Driver Profile</h2>
//             </div>

//             {data?.driver_payout_profile ? (
//               <>
//                 <p><b>Name:</b> {data.driver_payout_profile.account_holder_name}</p>
//                 <p><b>Phone:</b> {data.driver_payout_profile.phone_number}</p>
//                 <p><b>Bank:</b> {data.driver_payout_profile.masked_bank_account_number}</p>
//                 <p><b>IFSC:</b> {data.driver_payout_profile.ifsc_code}</p>

//                 <p className="mt-2">
//                   Status: <span className="font-semibold">{data.driver_payout_profile.linked_account_status}</span>
//                 </p>

//                 <p
//                   className={`mt-2 font-semibold ${
//                     data.driver_payout_profile.is_payout_eligible ? "text-green-500" : "text-red-500"
//                   }`}
//                 >
//                   {data.driver_payout_profile.is_payout_eligible ? "Eligible for payout" : "Not eligible"}
//                 </p>
//               </>
//             ) : (
//               <p className="text-gray-400 italic">No driver profile available</p>
//             )}
//           </div>

//           {/* SUMMARY CARDS */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//             <SummaryCard title="Total Payout" value={data?.summary?.total_driver_payout_amount} icon={<CurrencyRupeeIcon />} />
//             <SummaryCard title="Paid" value={data?.summary?.total_paid_out_amount} green icon={<CurrencyRupeeIcon />} />
//             <SummaryCard title="Pending" value={data?.summary?.total_pending_payout_amount} red icon={<CurrencyRupeeIcon />} />
//           </div>

//           {/* TRIPS */}
//           {data?.items && data.items.length > 0 ? (
//             data.items.map((trip: any) => (
//               <div
//                 key={trip.trip_id}
//                 className={`rounded-xl p-5 mb-5 shadow ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}`}
//               >
//                 {/* Header */}
//                 <div className="flex justify-between items-center mb-2">
//                   <div>
//                     <h2 className="font-bold text-lg">{trip.route?.route_name || "Unnamed Route"}</h2>
//                     <p className="text-xs text-gray-400">{trip.planned_start_at ? new Date(trip.planned_start_at).toLocaleString() : "No start date"}</p>
//                   </div>
//                   <TruckIcon className="w-6 h-6 text-gray-500" />
//                 </div>

//                 {/* Vehicle */}
//                 <p className="text-xs text-gray-400 mb-2">
//                   {trip.vehicle?.vehicle_name || "-"} ({trip.vehicle?.registration_number || "-"})
//                 </p>

//                 {/* Trip Status */}
//                 <p className="text-sm mb-2">
//                   Status: <b>{trip.trip_status || "No status"}</b>
//                 </p>

//                 {/* Totals */}
//                 <div className="grid grid-cols-3 text-center mb-3">
//                   <TripStat label="Fare" value={trip.trip_totals?.fare_amount || 0} />
//                   <TripStat label="Commission" value={trip.trip_totals?.commission_amount || 0} />
//                   <TripStat label="Payout" value={trip.trip_totals?.driver_payout_amount || 0} green />
//                 </div>

//                 {/* Bookings */}
//                 {trip.bookings && trip.bookings.length > 0 ? (
//                   trip.bookings.map((b: any) => (
//                     <div key={b.booking_id} className="border-t py-3 text-sm">
//                       <div className="flex justify-between">
//                         <div>
//                           <p className="font-semibold">{b.passenger_name || "Unknown Passenger"}</p>
//                           <p className="text-xs text-gray-400">{b.pickup_stop?.name || "-"} → {b.dropoff_stop?.name || "-"}</p>
//                         </div>
//                         <div className="text-right">
//                           <p className="font-bold">₹{b.driver_payout_amount || 0}</p>
//                           <p className={`text-xs ${
//                             b.payout_status === "paid" ? "text-green-500" : b.payout_status === "reversed" ? "text-yellow-500" : "text-red-500"
//                           }`}>
//                             {b.payout_status || "pending"}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-400 italic mt-2">No bookings available</p>
//                 )}
//               </div>
//             ))
//           ) : (
//             <p className="text-center text-gray-400 italic">No trips available</p>
//           )}
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// /* SUMMARY CARD */
// const SummaryCard = ({ title, value, green, red, icon }: any) => (
//   <div className={`rounded-xl p-4 shadow flex items-center gap-3 ${green ? "bg-green-50 text-green-700" : red ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"}`}>
//     {icon && <span className="w-6 h-6">{icon}</span>}
//     <div>
//       <p className="text-sm">{title}</p>
//       <h2 className="text-xl font-bold">₹{value ?? 0}</h2>
//     </div>
//   </div>
// );

// /* TRIP STAT */
// const TripStat = ({ label, value, green }: any) => (
//   <div>
//     <p className="text-xs">{label}</p>
//     <p className={`font-bold ${green ? "text-green-500" : ""}`}>₹{value ?? 0}</p>
//   </div>
// );

// export default DriverPayoutPage;

import React, { useEffect, useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import NavbarSidebar from "../../users/pages/Navbar";
import {
  CurrencyRupeeIcon,
  UserIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";

const BASE_URL = "https://be.shuttleapp.transev.site";

async function getDriverPayoutDetails(token: string) {
  const res = await fetch(`${BASE_URL}/driver/trips/payout-details`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch payout");
  return data;
}

const DriverPayoutPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("access_token");

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getDriverPayoutDetails(token);
      setData(res);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isDark = document.body.classList.contains("dark");

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className={`${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-black"} pt-16`}>
        <div className="p-5 mt-16 max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">💰 Earnings Dashboard</h1>
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Track your trips, payouts & performance
            </p>
          </div>

          {loading && (
            <div className="text-center py-10 animate-pulse text-lg">
              Loading earnings...
            </div>
          )}

          {/* DRIVER PROFILE */}
          <div className={`rounded-2xl p-6 mb-6 shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center gap-3 mb-4">
              <UserIcon className="w-6 h-6 text-emerald-500" />
              <h2 className="text-lg font-bold">Driver Profile</h2>
            </div>

            {data?.driver_payout_profile ? (
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <p><b>Name:</b> {data.driver_payout_profile.account_holder_name}</p>
                <p><b>Phone:</b> {data.driver_payout_profile.phone_number}</p>
                <p><b>Bank:</b> {data.driver_payout_profile.masked_bank_account_number}</p>
                <p><b>IFSC:</b> {data.driver_payout_profile.ifsc_code}</p>

                <p>
                  <b>Status:</b>{" "}
                  <span className="font-semibold text-blue-500">
                    {data.driver_payout_profile.linked_account_status}
                  </span>
                </p>

                <p className={`font-semibold ${
                  data.driver_payout_profile.is_payout_eligible
                    ? "text-green-500"
                    : "text-red-500"
                }`}>
                  {data.driver_payout_profile.is_payout_eligible
                    ? "Eligible for payout"
                    : "Not eligible"}
                </p>
              </div>
            ) : (
              <p className="text-gray-400 italic">No profile data available</p>
            )}
          </div>

          {/* SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <SummaryCard title="Total Payout" value={data?.summary?.total_driver_payout_amount} />
            <SummaryCard title="Paid" value={data?.summary?.total_paid_out_amount} green />
            <SummaryCard title="Pending" value={data?.summary?.total_pending_payout_amount} red />
          </div>

          {/* TRIPS */}
          {data?.items?.length > 0 ? (
            data.items.map((trip: any) => (
              <div
                key={trip.trip_id}
                className={`rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl transition ${isDark ? "bg-gray-800" : "bg-white"}`}
              >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="text-lg font-bold text-emerald-500">
                      {trip.route?.route_name || "Unnamed Route"}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {trip.planned_start_at
                        ? new Date(trip.planned_start_at).toLocaleString()
                        : "No date"}
                    </p>
                  </div>
                  <TruckIcon className="w-6 h-6 text-gray-400" />
                </div>

                {/* VEHICLE */}
                <p className="text-xs text-gray-400 mb-2">
                  🚗 {trip.vehicle?.vehicle_name || "-"} ({trip.vehicle?.registration_number || "-"})
                </p>

                {/* STATUS */}
                <p className="mb-3">
                  Status: <span className="font-semibold">{trip.trip_status}</span>
                </p>

                {/* TOTALS */}
                <div className="grid grid-cols-3 text-center bg-gray-100 dark:bg-gray-700 rounded-xl p-3 mb-4">
                  <TripStat label="Fare" value={trip.trip_totals?.fare_amount} />
                  <TripStat label="Commission" value={trip.trip_totals?.commission_amount} />
                  <TripStat label="Payout" value={trip.trip_totals?.driver_payout_amount} green />
                </div>

                {/* BOOKINGS */}
                {trip.bookings?.length > 0 ? (
                  trip.bookings.map((b: any) => (
                    <div
                      key={b.booking_id}
                      className="flex justify-between items-center border-t py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{b.passenger_name || "Passenger"}</p>
                        <p className="text-xs text-gray-400">
                          {b.pickup_stop?.name} → {b.dropoff_stop?.name}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-emerald-500">
                          ₹{b.driver_payout_amount || 0}
                        </p>
                        <p className={`text-xs ${
                          b.payout_status === "paid"
                            ? "text-green-500"
                            : b.payout_status === "reversed"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}>
                          {b.payout_status}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 italic mt-2">No bookings</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 italic">
              No trips found
            </p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

/* SUMMARY CARD */
const SummaryCard = ({ title, value, green, red }: any) => (
  <div className={`rounded-2xl p-5 shadow-lg flex items-center gap-3 transition hover:scale-105 ${
    green
      ? "bg-green-100 text-green-700"
      : red
      ? "bg-red-100 text-red-700"
      : "bg-white dark:bg-gray-800"
  }`}>
    <CurrencyRupeeIcon className="w-6 h-6" />
    <div>
      <p className="text-sm">{title}</p>
      <h2 className="text-xl font-bold">₹{value ?? 0}</h2>
    </div>
  </div>
);

/* TRIP STAT */
const TripStat = ({ label, value, green }: any) => (
  <div>
    <p className="text-xs text-gray-400">{label}</p>
    <p className={`font-bold ${green ? "text-green-500" : ""}`}>
      ₹{value ?? 0}
    </p>
  </div>
);

export default DriverPayoutPage;

