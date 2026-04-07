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

// import React, { useEffect, useState } from "react";
// import { IonPage, IonContent } from "@ionic/react";
// import NavbarSidebar from "../../users/pages/Navbar";
// import {
//   CurrencyRupeeIcon,
//   UserIcon,
//   TruckIcon,
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
//         <div className="p-5 mt-16 max-w-6xl mx-auto">

//           {/* HEADER */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold">💰 Earnings Dashboard</h1>
//             <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
//               Track your trips, payouts & performance
//             </p>
//           </div>

//           {loading && (
//             <div className="text-center py-10 animate-pulse text-lg">
//               Loading earnings...
//             </div>
//           )}

//           {/* DRIVER PROFILE */}
//           <div className={`rounded-2xl p-6 mb-6 shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
//             <div className="flex items-center gap-3 mb-4">
//               <UserIcon className="w-6 h-6 text-emerald-500" />
//               <h2 className="text-lg font-bold">Driver Profile</h2>
//             </div>

//             {data?.driver_payout_profile ? (
//               <div className="grid md:grid-cols-2 gap-3 text-sm">
//                 <p><b>Name:</b> {data.driver_payout_profile.account_holder_name}</p>
//                 <p><b>Phone:</b> {data.driver_payout_profile.phone_number}</p>
//                 <p><b>Bank:</b> {data.driver_payout_profile.masked_bank_account_number}</p>
//                 <p><b>IFSC:</b> {data.driver_payout_profile.ifsc_code}</p>

//                 <p>
//                   <b>Status:</b>{" "}
//                   <span className="font-semibold text-blue-500">
//                     {data.driver_payout_profile.linked_account_status}
//                   </span>
//                 </p>

//                 <p className={`font-semibold ${
//                   data.driver_payout_profile.is_payout_eligible
//                     ? "text-green-500"
//                     : "text-red-500"
//                 }`}>
//                   {data.driver_payout_profile.is_payout_eligible
//                     ? "Eligible for payout"
//                     : "Not eligible"}
//                 </p>
//               </div>
//             ) : (
//               <p className="text-gray-400 italic">No profile data available</p>
//             )}
//           </div>

//           {/* SUMMARY */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//             <SummaryCard title="Total Payout" value={data?.summary?.total_driver_payout_amount} />
//             <SummaryCard title="Paid" value={data?.summary?.total_paid_out_amount} green />
//             <SummaryCard title="Pending" value={data?.summary?.total_pending_payout_amount} red />
//           </div>

//           {/* TRIPS */}
//           {data?.items?.length > 0 ? (
//             data.items.map((trip: any) => (
//               <div
//                 key={trip.trip_id}
//                 className={`rounded-2xl p-6 mb-6 shadow-lg hover:shadow-xl transition ${isDark ? "bg-gray-800" : "bg-white"}`}
//               >
//                 {/* HEADER */}
//                 <div className="flex justify-between items-center mb-3">
//                   <div>
//                     <h2 className="text-lg font-bold text-emerald-500">
//                       {trip.route?.route_name || "Unnamed Route"}
//                     </h2>
//                     <p className="text-xs text-gray-400">
//                       {trip.planned_start_at
//                         ? new Date(trip.planned_start_at).toLocaleString()
//                         : "No date"}
//                     </p>
//                   </div>
//                   <TruckIcon className="w-6 h-6 text-gray-400" />
//                 </div>

//                 {/* VEHICLE */}
//                 <p className="text-xs text-gray-400 mb-2">
//                   🚗 {trip.vehicle?.vehicle_name || "-"} ({trip.vehicle?.registration_number || "-"})
//                 </p>

//                 {/* STATUS */}
//                 <p className="mb-3">
//                   Status: <span className="font-semibold">{trip.trip_status}</span>
//                 </p>

//                 {/* TOTALS */}
//                 <div className="grid grid-cols-3 text-center bg-gray-100 dark:bg-gray-700 rounded-xl p-3 mb-4">
//                   <TripStat label="Fare" value={trip.trip_totals?.fare_amount} />
//                   <TripStat label="Commission" value={trip.trip_totals?.commission_amount} />
//                   <TripStat label="Payout" value={trip.trip_totals?.driver_payout_amount} green />
//                 </div>

//                 {/* BOOKINGS */}
//                 {trip.bookings?.length > 0 ? (
//                   trip.bookings.map((b: any) => (
//                     <div
//                       key={b.booking_id}
//                       className="flex justify-between items-center border-t py-3 text-sm"
//                     >
//                       <div>
//                         <p className="font-semibold">{b.passenger_name || "Passenger"}</p>
//                         <p className="text-xs text-gray-400">
//                           {b.pickup_stop?.name} → {b.dropoff_stop?.name}
//                         </p>
//                       </div>

//                       <div className="text-right">
//                         <p className="font-bold text-emerald-500">
//                           ₹{b.driver_payout_amount || 0}
//                         </p>
//                         <p className={`text-xs ${
//                           b.payout_status === "paid"
//                             ? "text-green-500"
//                             : b.payout_status === "reversed"
//                             ? "text-yellow-500"
//                             : "text-red-500"
//                         }`}>
//                           {b.payout_status}
//                         </p>
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-400 italic mt-2">No bookings</p>
//                 )}
//               </div>
//             ))
//           ) : (
//             <p className="text-center text-gray-400 italic">
//               No trips found
//             </p>
//           )}
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// /* SUMMARY CARD */
// const SummaryCard = ({ title, value, green, red }: any) => (
//   <div className={`rounded-2xl p-5 shadow-lg flex items-center gap-3 transition hover:scale-105 ${
//     green
//       ? "bg-green-100 text-green-700"
//       : red
//       ? "bg-red-100 text-red-700"
//       : "bg-white dark:bg-gray-800"
//   }`}>
//     <CurrencyRupeeIcon className="w-6 h-6" />
//     <div>
//       <p className="text-sm">{title}</p>
//       <h2 className="text-xl font-bold">₹{value ?? 0}</h2>
//     </div>
//   </div>
// );

// /* TRIP STAT */
// const TripStat = ({ label, value, green }: any) => (
//   <div>
//     <p className="text-xs text-gray-400">{label}</p>
//     <p className={`font-bold ${green ? "text-green-500" : ""}`}>
//       ₹{value ?? 0}
//     </p>
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
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  IdentificationIcon,
  CreditCardIcon,
  ArrowPathIcon,
  ChartBarIcon
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
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
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

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      'completed': { bg: '#10B98120', color: '#10B981', icon: CheckCircleIcon, text: 'Completed' },
      'scheduled': { bg: '#3B82F620', color: '#3B82F6', icon: ClockIcon, text: 'Scheduled' },
      'cancelled': { bg: '#EF444420', color: '#EF4444', icon: XCircleIcon, text: 'Cancelled' },
      'premature_end': { bg: '#F59E0B20', color: '#F59E0B', icon: ArrowPathIcon, text: 'Premature End' },
      'booked': { bg: '#8B5CF620', color: '#8B5CF6', icon: CheckCircleIcon, text: 'Booked' }
    };
    return statusConfig[status] || { bg: '#6B728020', color: '#6B7280', icon: ClockIcon, text: status };
  };

  const getPayoutStatusStyle = (status: string) => {
    switch(status) {
      case 'paid': return { bg: '#10B98120', color: '#10B981', text: 'Paid' };
      case 'pending': return { bg: '#F59E0B20', color: '#F59E0B', text: 'Pending' };
      case 'reversed': return { bg: '#EF444420', color: '#EF4444', text: 'Reversed' };
      default: return { bg: '#6B728020', color: '#6B7280', text: status };
    }
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent style={{ '--background': '#0A0A0A' } as any}>
        <div style={{
          paddingTop: '80px',
          paddingLeft: '16px',
          paddingRight: '16px',
          paddingBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto',
          background: '#0A0A0A',
          minHeight: '100vh'
        }}>
          
          {/* Header Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BanknotesIcon style={{ width: '24px', height: '24px', color: '#FFFFFF' }} />
              </div>
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  marginBottom: '2px'
                }}>
                  Earnings Dashboard
                </h1>
                <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  Track your trips, payouts & performance
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#111111',
              borderRadius: '20px',
              border: '1px solid #1F1F1F'
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                border: '3px solid #1F1F1F',
                borderTopColor: '#10B981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }} />
              <p style={{ color: '#9CA3AF' }}>Loading earnings data...</p>
            </div>
          )}

          {/* Driver Profile Section */}
          {data?.driver_payout_profile && (
            <div style={{
              background: 'linear-gradient(135deg, #111111, #0D0D0D)',
              borderRadius: '24px',
              padding: '20px',
              marginBottom: '20px',
              border: '1px solid #1F1F1F',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserIcon style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF' }}>Driver Profile</h2>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Account & Payout Information</p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#0A0A0A',
                  borderRadius: '16px',
                  border: '1px solid #1A1A1A'
                }}>
                  <IdentificationIcon style={{ width: '20px', height: '20px', color: '#60A5FA' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Account Holder</p>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF' }}>
                      {data.driver_payout_profile.account_holder_name}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: '#0A0A0A',
                  borderRadius: '16px',
                  border: '1px solid #1A1A1A'
                }}>
                  <PhoneIcon style={{ width: '20px', height: '20px', color: '#60A5FA' }} />
                  <div>
                    <p style={{ fontSize: '11px', color: '#6B7280', marginBottom: '2px' }}>Phone Number</p>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#FFFFFF' }}>
                      {data.driver_payout_profile.phone_number}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <div style={{
                    padding: '12px',
                    background: '#0A0A0A',
                    borderRadius: '16px',
                    border: '1px solid #1A1A1A'
                  }}>
                    <CreditCardIcon style={{ width: '18px', height: '18px', color: '#60A5FA', marginBottom: '6px' }} />
                    <p style={{ fontSize: '10px', color: '#6B7280', marginBottom: '2px' }}>Bank Account</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>
                      {data.driver_payout_profile.masked_bank_account_number}
                    </p>
                  </div>
                  <div style={{
                    padding: '12px',
                    background: '#0A0A0A',
                    borderRadius: '16px',
                    border: '1px solid #1A1A1A'
                  }}>
                    <BuildingOfficeIcon style={{ width: '18px', height: '18px', color: '#60A5FA', marginBottom: '6px' }} />
                    <p style={{ fontSize: '10px', color: '#6B7280', marginBottom: '2px' }}>IFSC Code</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>
                      {data.driver_payout_profile.ifsc_code}
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: data.driver_payout_profile.is_payout_eligible ? '#064E3B' : '#7F1D1D',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: data.driver_payout_profile.is_payout_eligible ? '#10B981' : '#EF4444'
                  }}>
                    {data.driver_payout_profile.is_payout_eligible ? '✓ Eligible for Payout' : '✗ Not Eligible for Payout'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                    Status: {data.driver_payout_profile.linked_account_status}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          {data?.summary && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <SummaryCard 
                title="Total Payout" 
                value={data.summary.total_driver_payout_amount}
                icon={<CurrencyRupeeIcon style={{ width: '20px', height: '20px' }} />}
                gradient="linear-gradient(135deg, #3B82F6, #2563EB)"
              />
              <SummaryCard 
                title="Paid" 
                value={data.summary.total_paid_out_amount}
                icon={<CheckCircleIcon style={{ width: '20px', height: '20px' }} />}
                gradient="linear-gradient(135deg, #10B981, #059669)"
              />
              <SummaryCard 
                title="Pending" 
                value={data.summary.total_pending_payout_amount}
                icon={<ClockIcon style={{ width: '20px', height: '20px' }} />}
                gradient="linear-gradient(135deg, #F59E0B, #D97706)"
              />
            </div>
          )}

          {/* Trip Statistics */}
          {data?.summary && (
            <div style={{
              background: '#111111',
              borderRadius: '20px',
              padding: '16px',
              marginBottom: '20px',
              border: '1px solid #1F1F1F'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <ChartBarIcon style={{ width: '18px', height: '18px', color: '#10B981' }} />
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>Quick Stats</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981' }}>{data.summary.trip_count}</p>
                  <p style={{ fontSize: '11px', color: '#6B7280' }}>Total Trips</p>
                </div>
                <div style={{ width: '1px', background: '#1F1F1F' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981' }}>{data.summary.booking_count}</p>
                  <p style={{ fontSize: '11px', color: '#6B7280' }}>Bookings</p>
                </div>
                <div style={{ width: '1px', background: '#1F1F1F' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981' }}>₹{data.summary.total_fare_amount}</p>
                  <p style={{ fontSize: '11px', color: '#6B7280' }}>Total Fare</p>
                </div>
              </div>
            </div>
          )}

          {/* Trips List */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TruckIcon style={{ width: '20px', height: '20px', color: '#10B981' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF' }}>Trip History</h2>
            </div>

            {data?.items?.length > 0 ? (
              data.items.map((trip: any, idx: number) => {
                const statusConfig = getStatusBadge(trip.trip_status);
                const StatusIcon = statusConfig.icon;
                const isExpanded = selectedTrip === trip.trip_id;
                
                return (
                  <div
                    key={trip.trip_id}
                    style={{
                      background: '#111111',
                      borderRadius: '20px',
                      marginBottom: '12px',
                      border: '1px solid #1F1F1F',
                      overflow: 'hidden',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div
                      onClick={() => setSelectedTrip(isExpanded ? null : trip.trip_id)}
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#161616'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#111111'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#10B981', marginBottom: '4px' }}>
                            {trip.route?.route_name || 'Unnamed Route'}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <CalendarIcon style={{ width: '12px', height: '12px', color: '#6B7280' }} />
                            <p style={{ fontSize: '11px', color: '#6B7280' }}>
                              {trip.planned_start_at ? new Date(trip.planned_start_at).toLocaleString() : 'No date'}
                            </p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: '10px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              background: statusConfig.bg,
                              color: statusConfig.color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <StatusIcon style={{ width: '10px', height: '10px' }} />
                              {statusConfig.text}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              color: '#6B7280'
                            }}>
                              🚗 {trip.vehicle?.vehicle_name || '-'} ({trip.vehicle?.registration_number || '-'})
                            </span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981' }}>
                            ₹{trip.trip_totals?.driver_payout_amount || 0}
                          </p>
                          <p style={{ fontSize: '10px', color: '#6B7280' }}>
                            {trip.trip_totals?.booking_count || 0} bookings
                          </p>
                        </div>
                      </div>

                      {/* Trip Totals */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px',
                        padding: '10px',
                        background: '#0A0A0A',
                        borderRadius: '12px',
                        marginTop: '8px'
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '10px', color: '#6B7280' }}>Fare</p>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>₹{trip.trip_totals?.fare_amount || 0}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '10px', color: '#6B7280' }}>Commission</p>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>₹{trip.trip_totals?.commission_amount || 0}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ fontSize: '10px', color: '#6B7280' }}>Driver Payout</p>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: '#10B981' }}>₹{trip.trip_totals?.driver_payout_amount || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Bookings */}
                    {isExpanded && trip.bookings?.length > 0 && (
                      <div style={{
                        borderTop: '1px solid #1F1F1F',
                        padding: '16px',
                        background: '#0D0D0D'
                      }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#9CA3AF', marginBottom: '12px' }}>
                          Bookings ({trip.bookings.length})
                        </p>
                        {trip.bookings.map((booking: any, bidx: number) => {
                          const payoutStatus = getPayoutStatusStyle(booking.payout_status);
                          return (
                            <div
                              key={booking.booking_id}
                              style={{
                                padding: '12px',
                                background: '#0A0A0A',
                                borderRadius: '12px',
                                marginBottom: bidx < trip.bookings.length - 1 ? '8px' : '0',
                                border: '1px solid #1A1A1A'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div>
                                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF' }}>
                                    {booking.passenger_name || 'Passenger'}
                                  </p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                    <MapPinIcon style={{ width: '10px', height: '10px', color: '#6B7280' }} />
                                    <p style={{ fontSize: '10px', color: '#6B7280' }}>
                                      {booking.pickup_stop?.name} → {booking.dropoff_stop?.name}
                                    </p>
                                  </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <p style={{ fontSize: '15px', fontWeight: 'bold', color: '#10B981' }}>
                                    ₹{booking.driver_payout_amount || 0}
                                  </p>
                                  <span style={{
                                    fontSize: '9px',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: payoutStatus.bg,
                                    color: payoutStatus.color,
                                    display: 'inline-block',
                                    marginTop: '4px'
                                  }}>
                                    {payoutStatus.text}
                                  </span>
                                </div>
                              </div>
                              {booking.booking_status && (
                                <div style={{ marginTop: '6px' }}>
                                  <span style={{
                                    fontSize: '9px',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    background: '#1F1F1F',
                                    color: '#9CA3AF'
                                  }}>
                                    {booking.booking_status}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                background: '#111111',
                borderRadius: '20px',
                border: '1px solid #1F1F1F'
              }}>
                <p style={{ color: '#6B7280' }}>No trips found</p>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, icon, gradient }: any) => (
  <div style={{
    background: '#111111',
    borderRadius: '16px',
    padding: '14px',
    border: '1px solid #1F1F1F',
    transition: 'transform 0.2s'
  }}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '10px',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '10px'
    }}>
      {React.cloneElement(icon, { style: { width: '16px', height: '16px', color: '#FFFFFF' } })}
    </div>
    <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' }}>{title}</p>
    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF' }}>₹{value ?? 0}</p>
  </div>
);

export default DriverPayoutPage;