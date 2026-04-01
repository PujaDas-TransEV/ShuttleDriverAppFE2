// import React, { useState } from 'react';
// import { IonPage, IonContent, IonButton, IonModal } from '@ionic/react';
// import NavbarSidebar from './Navbar';
// import { TruckIcon, QrCodeIcon } from '@heroicons/react/24/outline';

// // Trip interface
// interface Trip {
//   id: number;
//   busName: string;
//   busNumber: string;
//   from: string;
//   to: string;
//   time: string;
//   bookedSeats: number;
//   passengersScanned: number;
//   status: 'scheduled' | 'ongoing' | 'completed';
// }

// const TripManagement: React.FC = () => {
//   const [trips, setTrips] = useState<Trip[]>([
//     {
//       id: 1,
//       busName: 'Volvo AC',
//       busNumber: 'AC-101',
//       from: 'Dhaka',
//       to: 'Chittagong',
//       time: '10:00 AM',
//       bookedSeats: 3,
//       passengersScanned: 0,
//       status: 'scheduled',
//     },
//     {
//       id: 2,
//       busName: 'Non-AC Shuttle',
//       busNumber: 'NAC-202',
//       from: 'Dhaka',
//       to: 'Sylhet',
//       time: '12:00 PM',
//       bookedSeats: 2,
//       passengersScanned: 0,
//       status: 'scheduled',
//     },
//   ]);

//   const [showScanner, setShowScanner] = useState(false);
//   const [currentTripId, setCurrentTripId] = useState<number | null>(null);

//   // Start trip
//   const startTrip = (id: number) => {
//     setTrips(prev =>
//       prev.map(t => (t.id === id ? { ...t, status: 'ongoing' } : t))
//     );
//   };

//   // Simulate scanning a passenger
//   const scanPassenger = (id: number) => {
//     setTrips(prev =>
//       prev.map(t =>
//         t.id === id && t.passengersScanned < t.bookedSeats
//           ? { ...t, passengersScanned: t.passengersScanned + 1 }
//           : t
//       )
//     );
//   };

//   // End trip
//   const endTrip = (id: number) => {
//     setTrips(prev =>
//       prev.map(t => (t.id === id ? { ...t, status: 'completed' } : t))
//     );
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-white dark:bg-gray-900 text-black dark:text-white pt-16">
//         <div className="max-w-4xl mx-auto p-5 space-y-6">
//           <h1 className="text-3xl font-bold text-center mb-3">Trip Management</h1>
//           <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
//             Manage your trips, scan passengers, and complete your routes efficiently
//           </p>

//           {/* Trip List */}
//           <div className="space-y-4">
//             {trips.map(trip => (
//               <div
//                 key={trip.id}
//                 className={`p-5 rounded-xl shadow flex flex-col md:flex-row justify-between items-start md:items-center transition ${
//                   trip.status === 'scheduled'
//                     ? 'bg-gray-100 dark:bg-gray-800'
//                     : trip.status === 'ongoing'
//                     ? 'bg-gray-200 dark:bg-gray-700'
//                     : 'bg-gray-300 dark:bg-gray-600'
//                 }`}
//               >
//                 <div className="flex items-center gap-4 mb-3 md:mb-0">
//                   <TruckIcon className="w-8 h-8 text-gray-600 dark:text-gray-300" />
//                   <div>
//                     <h3 className="font-semibold text-lg">
//                       {trip.busName} • {trip.busNumber}
//                     </h3>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       {trip.from} → {trip.to} • {trip.time}
//                     </p>
//                     {trip.status === 'ongoing' && (
//                       <p className="text-sm text-green-500 mt-1">
//                         Passengers scanned: {trip.passengersScanned}/{trip.bookedSeats}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* Buttons */}
//                 <div className="flex flex-col md:flex-row gap-2">
//                   {trip.status === 'scheduled' && (
//                     <IonButton
//                       className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl hover:scale-105 transition"
//                       onClick={() => startTrip(trip.id)}
//                     >
//                       Start Trip
//                     </IonButton>
//                   )}

//                   {trip.status === 'ongoing' && trip.passengersScanned < trip.bookedSeats && (
//                     <IonButton
//                       className="bg-blue-600 dark:bg-blue-400 text-white dark:text-black px-4 py-2 rounded-xl hover:scale-105 transition flex items-center gap-2"
//                       onClick={() => { setCurrentTripId(trip.id); setShowScanner(true); }}
//                     >
//                       <QrCodeIcon className="w-5 h-5" /> Scan Passenger
//                     </IonButton>
//                   )}

//                   {trip.status === 'ongoing' && trip.passengersScanned === trip.bookedSeats && (
//                     <IonButton
//                       className="bg-green-600 dark:bg-green-400 text-white dark:text-black px-4 py-2 rounded-xl hover:scale-105 transition"
//                       onClick={() => endTrip(trip.id)}
//                     >
//                       End Trip
//                     </IonButton>
//                   )}

//                   {trip.status === 'completed' && (
//                     <span className="px-3 py-2 bg-gray-500 text-white rounded-xl text-sm font-semibold">
//                       Completed
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* QR Scanner Modal */}
//           <IonModal isOpen={showScanner} onDidDismiss={() => setShowScanner(false)}>
//             <div className="p-6 h-full flex flex-col justify-center items-center bg-white dark:bg-gray-900">
//               <h2 className="text-2xl font-bold mb-4">Scan Passenger</h2>
//               <p className="mb-6 text-gray-500 dark:text-gray-400">
//                 Simulating QR scanning for trip ID: {currentTripId}
//               </p>
//               <IonButton
//                 className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl hover:scale-105 transition mb-4"
//                 onClick={() => {
//                   if (currentTripId) scanPassenger(currentTripId);
//                 }}
//               >
//                 Scan Passenger
//               </IonButton>
//               <IonButton
//                 className="bg-gray-400 dark:bg-gray-600 text-black dark:text-white px-6 py-3 rounded-xl hover:scale-105 transition"
//                 onClick={() => setShowScanner(false)}
//               >
//                 Close
//               </IonButton>
//             </div>
//           </IonModal>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default TripManagement;

// import React, { useState } from "react";
// import {
//   IonPage,
//   IonContent,
//   IonModal,
//   IonSelect,
//   IonSelectOption,
// } from "@ionic/react";
// import NavbarSidebar from "./Navbar";
// import { TruckIcon } from "@heroicons/react/24/outline";
// import { QrReader } from "react-qr-reader";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
// import "leaflet/dist/leaflet.css";

// // Bus Interface
// interface Bus {
//   id: number;
//   name: string;
//   busNumber: string;
//   type: "AC" | "Non-AC";
// }

// // Passenger Interface
// interface Passenger {
//   id: number;
//   name: string;
//   paymentStatus: "Paid" | "Pending";
//   location: string;
//   tripStarted: boolean;
//   tripCompleted: boolean;
// }

// // Trip Interface
// interface Trip {
//   id: number;
//   bus: Bus;
//   from: string;
//   to: string;
//   time: string;
//   passengers: Passenger[];
// }

// const TripManagement: React.FC = () => {
//   // Sample buses
//   const buses: Bus[] = [
//     { id: 1, name: "Volvo AC", busNumber: "AC101", type: "AC" },
//     { id: 2, name: "Shuttle Non-AC", busNumber: "NA202", type: "Non-AC" },
//   ];

//   // Sample trips
//   const [trips, setTrips] = useState<Trip[]>([
//     {
//       id: 1,
//       bus: buses[0],
//       from: "Dhaka",
//       to: "Chittagong",
//       time: "10:00 AM",
//       passengers: [
//         {
//           id: 1,
//           name: "Alice",
//           paymentStatus: "Paid",
//           location: "Dhaka",
//           tripStarted: false,
//           tripCompleted: false,
//         },
//         {
//           id: 2,
//           name: "Bob",
//           paymentStatus: "Paid",
//           location: "Dhaka",
//           tripStarted: false,
//           tripCompleted: false,
//         },
//       ],
//     },
//     {
//       id: 2,
//       bus: buses[1],
//       from: "Dhaka",
//       to: "Sylhet",
//       time: "12:00 PM",
//       passengers: [
//         {
//           id: 3,
//           name: "Charlie",
//           paymentStatus: "Paid",
//           location: "Dhaka",
//           tripStarted: false,
//           tripCompleted: false,
//         },
//       ],
//     },
//   ]);

//   const [selectedBusType, setSelectedBusType] = useState<"AC" | "Non-AC" | "All">("All");
//   const [scannerOpen, setScannerOpen] = useState(false);
//   const [currentPassengerId, setCurrentPassengerId] = useState<number | null>(null);
//   const [currentTripId, setCurrentTripId] = useState<number | null>(null);

//   // Start passenger trip
//   const startPassengerTrip = (tripId: number, passengerId: number) => {
//     setCurrentPassengerId(passengerId);
//     setCurrentTripId(tripId);
//     setScannerOpen(true);
//   };

//   // Scan passenger
//   const scanPassenger = () => {
//     if (currentTripId && currentPassengerId) {
//       setTrips((prevTrips) =>
//         prevTrips.map((trip) => {
//           if (trip.id === currentTripId) {
//             return {
//               ...trip,
//               passengers: trip.passengers.map((p) =>
//                 p.id === currentPassengerId ? { ...p, tripStarted: true } : p
//               ),
//             };
//           }
//           return trip;
//         })
//       );
//       setScannerOpen(false);
//     }
//   };

//   // Complete passenger trip
//   const completePassengerTrip = (tripId: number, passengerId: number) => {
//     setTrips((prevTrips) =>
//       prevTrips.map((trip) => {
//         if (trip.id === tripId) {
//           return {
//             ...trip,
//             passengers: trip.passengers.map((p) =>
//               p.id === passengerId ? { ...p, tripCompleted: true } : p
//             ),
//           };
//         }
//         return trip;
//       })
//     );
//   };

//   // Filter trips by bus type
//   const filteredTrips =
//     selectedBusType === "All" ? trips : trips.filter((t) => t.bus.type === selectedBusType);

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-white dark:bg-gray-900 text-black dark:text-white pt-16">
//         <div className="max-w-5xl mx-auto p-5 space-y-6">
//           <h1 className="text-3xl font-bold text-center mb-3">Trip & Passenger Management</h1>
//           <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
//             Track passengers, start trips, and complete trips efficiently
//           </p>

//           {/* Bus Filter */}
//           <div className="flex justify-center mb-6">
//             <IonSelect
//               value={selectedBusType}
//               onIonChange={(e) => setSelectedBusType(e.detail.value)}
//               placeholder="Filter by Bus Type"
//               className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-xl px-4 py-2 w-48"
//             >
//               <IonSelectOption value="All">All</IonSelectOption>
//               <IonSelectOption value="AC">AC</IonSelectOption>
//               <IonSelectOption value="Non-AC">Non-AC</IonSelectOption>
//             </IonSelect>
//           </div>

//           {/* Trips */}
//           <div className="space-y-4">
//             {filteredTrips.map((trip) => (
//               <div key={trip.id} className="p-5 bg-gray-100 dark:bg-gray-800 rounded-xl shadow space-y-4">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h2 className="font-semibold text-lg">{trip.bus.name} • {trip.bus.busNumber}</h2>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">{trip.from} → {trip.to} • {trip.time}</p>
//                   </div>
//                 </div>

//                 {/* Passenger List */}
//                 <div className="space-y-3">
//                   {trip.passengers.map((passenger) => (
//                     <div
//                       key={passenger.id}
//                       className={`p-3 rounded-xl flex justify-between items-center ${
//                         passenger.tripCompleted ? "bg-gray-400 dark:bg-gray-600" : "bg-white dark:bg-gray-700"
//                       }`}
//                     >
//                       <div>
//                         <p className="font-semibold">{passenger.name}</p>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">
//                           Payment: {passenger.paymentStatus} • Location: {passenger.location}
//                         </p>
//                       </div>
//                       <div className="flex gap-2">
//                         {!passenger.tripStarted && !passenger.tripCompleted && (
//                           <button
//                             style={{
//                               backgroundColor: "#000",
//                               color: "#fff",
//                               padding: "8px 16px",
//                               borderRadius: "8px",
//                               border: "none",
//                               cursor: "pointer",
//                             }}
//                             onClick={() => startPassengerTrip(trip.id, passenger.id)}
//                           >
//                             Start Trip
//                           </button>
//                         )}
//                         {passenger.tripStarted && !passenger.tripCompleted && (
//                           <button
//                             style={{
//                               backgroundColor: "#fff",
//                               color: "#000",
//                               padding: "8px 16px",
//                               borderRadius: "8px",
//                               border: "1px solid #000",
//                               cursor: "pointer",
//                             }}
//                             onClick={() => completePassengerTrip(trip.id, passenger.id)}
//                           >
//                             Complete Trip
//                           </button>
//                         )}
//                         {passenger.tripCompleted && (
//                           <span className="px-3 py-1 rounded-full bg-gray-500 text-white text-sm">
//                             Completed
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Scanner Modal */}
//           <IonModal isOpen={scannerOpen} onDidDismiss={() => setScannerOpen(false)}>
//             <div className="p-6 h-full flex flex-col justify-center items-center bg-white dark:bg-gray-900">
//               <h2 className="text-2xl font-bold mb-4">Scan Passenger</h2>
//               <p className="mb-6 text-gray-500 dark:text-gray-400">Scan QR for passenger to start trip</p>

//               {/* QR Scanner */}
//               <div style={{ width: "100%", maxWidth: "400px" }}>
//                 <QrReader
//   onResult={(result, error) => {
//     if (result) scanPassenger();
//     if (error) console.error(error);
//   }}
//   constraints={{ facingMode: "environment" }}

// />
//               </div>

//               <button
//                 style={{
//                   backgroundColor: "#000",
//                   color: "#fff",
//                   padding: "10px 20px",
//                   marginTop: "16px",
//                   borderRadius: "8px",
//                   border: "none",
//                   cursor: "pointer",
//                 }}
//                 onClick={() => setScannerOpen(false)}
//               >
//                 Close
//               </button>
//             </div>
//           </IonModal>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default TripManagement;