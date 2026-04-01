// import React, { useState, ChangeEvent, useEffect } from 'react';
// import { IonPage, IonContent, IonButton } from '@ionic/react';
// import NavbarSidebar from '../pages/Navbar';
// import { TruckIcon, IdentificationIcon, DocumentTextIcon, PlusCircleIcon, UsersIcon } from '@heroicons/react/24/outline';

// interface Vehicle {
//   ownerName: string;
//   busNumber: string;
//   seats: number;
//   registrationDoc: string;
//   insuranceDoc: string;
//   permitDoc: string;
// }

// const VehicleRegistration: React.FC = () => {
//   const [vehicle, setVehicle] = useState<Vehicle>({
//     ownerName: '',
//     busNumber: '',
//     seats: 0,
//     registrationDoc: '',
//     insuranceDoc: '',
//     permitDoc: '',
//   });

//   const [regPreview, setRegPreview] = useState<string | null>(null);
//   const [insurancePreview, setInsurancePreview] = useState<string | null>(null);
//   const [permitPreview, setPermitPreview] = useState<string | null>(null);

//   // Load saved data
//   useEffect(() => {
//     const saved = JSON.parse(localStorage.getItem('vehicle') || '{}');
//     if (saved) setVehicle(saved);
//   }, []);

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setVehicle({ ...vehicle, [name]: name === 'seats' ? Number(value) : value });
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'registration' | 'insurance' | 'permit') => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const url = URL.createObjectURL(file);

//     if (type === 'registration') {
//       setVehicle({ ...vehicle, registrationDoc: url });
//       setRegPreview(url);
//     } else if (type === 'insurance') {
//       setVehicle({ ...vehicle, insuranceDoc: url });
//       setInsurancePreview(url);
//     } else {
//       setVehicle({ ...vehicle, permitDoc: url });
//       setPermitPreview(url);
//     }
//   };

//   const saveVehicle = () => {
//     localStorage.setItem('vehicle', JSON.stringify(vehicle));
//     alert('Vehicle details saved successfully!');
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-white dark:bg-gray-900 text-black dark:text-white pt-16">
//         <div className="max-w-3xl mx-auto p-5 space-y-6">
//           <h1 className="text-3xl font-bold mb-2">Vehicle Registration</h1>
//           <p className="text-gray-500 dark:text-gray-300 mb-6">
//             Register your bus with all required documents to start trips.
//           </p>

//           {/* Owner Name */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium">Owner Name</label>
//             <div className="flex items-center border rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
//               <TruckIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 ml-2" />
//               <input
//                 type="text"
//                 name="ownerName"
//                 value={vehicle.ownerName}
//                 onChange={handleChange}
//                 placeholder="Enter owner name"
//                 className="w-full p-2 bg-transparent outline-none text-black dark:text-white"
//               />
//             </div>
//           </div>

//           {/* Bus Number */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium">Bus Number</label>
//             <div className="flex items-center border rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
//               <TruckIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 ml-2" />
//               <input
//                 type="text"
//                 name="busNumber"
//                 value={vehicle.busNumber}
//                 onChange={handleChange}
//                 placeholder="Enter bus number"
//                 className="w-full p-2 bg-transparent outline-none text-black dark:text-white"
//               />
//             </div>
//           </div>

//           {/* Seats */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium">Number of Seats</label>
//             <div className="flex items-center border rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
//               <UsersIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 ml-2" />
//               <input
//                 type="number"
//                 name="seats"
//                 value={vehicle.seats}
//                 onChange={handleChange}
//                 placeholder="Enter total seats"
//                 className="w-full p-2 bg-transparent outline-none text-black dark:text-white"
//               />
//             </div>
//           </div>

//           {/* Registration Document */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium">Registration Document</label>
//             <div className="flex items-center gap-3">
//               <input
//                 type="file"
//                 accept="image/*,application/pdf"
//                 onChange={e => handleFileChange(e, 'registration')}
//                 className="text-sm text-gray-500 dark:text-gray-400"
//               />
//               {regPreview && (
//                 <span className="text-green-500 text-sm font-medium">Uploaded</span>
//               )}
//             </div>
//           </div>

//           {/* Insurance Document */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium">Insurance Document</label>
//             <div className="flex items-center gap-3">
//               <input
//                 type="file"
//                 accept="image/*,application/pdf"
//                 onChange={e => handleFileChange(e, 'insurance')}
//                 className="text-sm text-gray-500 dark:text-gray-400"
//               />
//               {insurancePreview && (
//                 <span className="text-green-500 text-sm font-medium">Uploaded</span>
//               )}
//             </div>
//           </div>

//           {/* Permit Document */}
//           <div className="space-y-2">
//             <label className="block text-sm font-medium">Permit Document</label>
//             <div className="flex items-center gap-3">
//               <input
//                 type="file"
//                 accept="image/*,application/pdf"
//                 onChange={e => handleFileChange(e, 'permit')}
//                 className="text-sm text-gray-500 dark:text-gray-400"
//               />
//               {permitPreview && (
//                 <span className="text-green-500 text-sm font-medium">Uploaded</span>
//               )}
//             </div>
//           </div>

//           {/* Save Button */}
//           <div className="mt-6 flex justify-center">
//             <IonButton
//               onClick={saveVehicle}
//               className="bg-black dark:bg-white text-white dark:text-black w-48 h-12 rounded-xl shadow-lg hover:scale-105 transition"
//             >
//               Save Vehicle
//             </IonButton>
//           </div>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default VehicleRegistration;

import React, { useState, ChangeEvent, useEffect } from 'react';
import { IonPage, IonContent, IonButton } from '@ionic/react';
import NavbarSidebar from '../pages/Navbar';
import {
  TruckIcon,
  UsersIcon,
  DocumentTextIcon,
  IdentificationIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

interface Vehicle {
  ownerName: string;
  busNumber: string;
  seats: number;
  registrationDoc: string;
  insuranceDoc: string;
  permitDoc: string;
}

const VehicleRegistration: React.FC = () => {
  const [vehicle, setVehicle] = useState<Vehicle>({
    ownerName: '',
    busNumber: '',
    seats: 0,
    registrationDoc: '',
    insuranceDoc: '',
    permitDoc: '',
  });

  const [regPreview, setRegPreview] = useState<string | null>(null);
  const [insurancePreview, setInsurancePreview] = useState<string | null>(null);
  const [permitPreview, setPermitPreview] = useState<string | null>(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('vehicle') || '{}');
    if (saved) setVehicle(saved);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVehicle({ ...vehicle, [name]: name === 'seats' ? Number(value) : value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'registration' | 'insurance' | 'permit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (type === 'registration') {
      setVehicle({ ...vehicle, registrationDoc: url });
      setRegPreview(url);
    } else if (type === 'insurance') {
      setVehicle({ ...vehicle, insuranceDoc: url });
      setInsurancePreview(url);
    } else {
      setVehicle({ ...vehicle, permitDoc: url });
      setPermitPreview(url);
    }
  };

  const saveVehicle = () => {
    localStorage.setItem('vehicle', JSON.stringify(vehicle));
    alert('Vehicle details saved successfully!');
  };

  return (
    <IonPage>
      {/* Navbar stays at the top */}
      <NavbarSidebar />

      <IonContent className="bg-white dark:bg-gray-900 text-black dark:text-white pt-20">
        <div className="max-w-3xl mx-auto p-6 space-y-8">

          {/* Header */}
     <div className="text-center mt-20">
  <h1 className="text-3xl font-bold mb-2">Vehicle Registration</h1>
  <p className="text-gray-500 dark:text-gray-300">
    Add your bus details and required documents to manage trips.
  </p>
</div>

          {/* Vehicle Info Section */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-5">
            <div className="space-y-3">
              <label className="block text-sm font-medium">Owner Name</label>
              <div className="flex items-center border rounded-xl bg-white dark:bg-gray-700 overflow-hidden">
                <TruckIcon className="w-6 h-6 text-gray-400 dark:text-gray-400 ml-3" />
                <input
                  type="text"
                  name="ownerName"
                  value={vehicle.ownerName}
                  onChange={handleChange}
                  placeholder="Enter owner name"
                  className="w-full p-3 bg-transparent outline-none text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Bus Number</label>
              <div className="flex items-center border rounded-xl bg-white dark:bg-gray-700 overflow-hidden">
                <TruckIcon className="w-6 h-6 text-gray-400 dark:text-gray-400 ml-3" />
                <input
                  type="text"
                  name="busNumber"
                  value={vehicle.busNumber}
                  onChange={handleChange}
                  placeholder="Enter bus number"
                  className="w-full p-3 bg-transparent outline-none text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Number of Seats</label>
              <div className="flex items-center border rounded-xl bg-white dark:bg-gray-700 overflow-hidden">
                <UsersIcon className="w-6 h-6 text-gray-400 dark:text-gray-400 ml-3" />
                <input
                  type="number"
                  name="seats"
                  value={vehicle.seats}
                  onChange={handleChange}
                  placeholder="Enter total seats"
                  className="w-full p-3 bg-transparent outline-none text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-lg space-y-5">
            <h2 className="text-lg font-semibold mb-3">Required Documents</h2>

            {/* Registration */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Registration Document</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => handleFileChange(e, 'registration')}
                  className="text-sm text-gray-500 dark:text-gray-400"
                />
                {regPreview && <span className="text-green-500 text-sm font-medium">Uploaded</span>}
              </div>
            </div>

            {/* Insurance */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Insurance Document</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => handleFileChange(e, 'insurance')}
                  className="text-sm text-gray-500 dark:text-gray-400"
                />
                {insurancePreview && <span className="text-green-500 text-sm font-medium">Uploaded</span>}
              </div>
            </div>

            {/* Permit */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Permit Document</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={e => handleFileChange(e, 'permit')}
                  className="text-sm text-gray-500 dark:text-gray-400"
                />
                {permitPreview && <span className="text-green-500 text-sm font-medium">Uploaded</span>}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-4">
            <IonButton
              onClick={saveVehicle}
              className="bg-black dark:bg-white text-white dark:text-black w-48 h-14 rounded-xl shadow-lg hover:scale-105 transition"
            >
              Save Vehicle
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VehicleRegistration;