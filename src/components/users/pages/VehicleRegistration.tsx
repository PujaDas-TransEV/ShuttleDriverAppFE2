// import React, { useState, ChangeEvent } from 'react';
// import { IonPage, IonContent, IonButton, IonLoading, IonToast } from '@ionic/react';
// import NavbarSidebar from '../pages/Navbar';
// import {
//   TruckIcon,
//   UsersIcon,
//   DocumentTextIcon,
// } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// const VehicleRegistration: React.FC = () => {
//   const [vehicle, setVehicle] = useState({
//     hasAc: '',
//     seat_count: 0,
//     color: '',
//     vehicle_model: '',
//     vehicle_name: '',
//     registration_number: '',
//   });

//   const [rearPhoto, setRearPhoto] = useState<File | null>(null);
//   const [rcFile, setRcFile] = useState<File | null>(null);

//   const [rearPreview, setRearPreview] = useState<string | null>(null);
//   const [rcPreview, setRcPreview] = useState<string | null>(null);

//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');

//   const token = localStorage.getItem("access_token");

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setVehicle({ ...vehicle, [name]: name === 'seat_count' ? Number(value) : value });
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'rear' | 'rc') => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const url = URL.createObjectURL(file);
//     if (type === 'rear') {
//       setRearPhoto(file);
//       setRearPreview(url);
//     } else {
//       setRcFile(file);
//       setRcPreview(url);
//     }
//   };

//   const submitVehicle = async () => {
//     if (!token) {
//       setToastMsg("Session expired. Please login again.");
//       return;
//     }

//     if (!vehicle.hasAc || !vehicle.vehicle_name || !vehicle.registration_number || !vehicle.vehicle_model) {
//       setToastMsg("Please fill all required fields");
//       return;
//     }

//     setLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append("has_ac", vehicle.hasAc);
//       formData.append("seat_count", String(vehicle.seat_count));
//       formData.append("color", vehicle.color);
//       formData.append("vehicle_model", vehicle.vehicle_model);
//       formData.append("vehicle_name", vehicle.vehicle_name);
//       formData.append("registration_number", vehicle.registration_number);

//       if (rearPhoto) formData.append("rear_photo", rearPhoto);
//       if (rcFile) formData.append("rc_file", rcFile);

//       const res = await fetch(`${API_BASE}/driver/vehicle/register`, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setToastMsg("Vehicle registered successfully!");
//       } else {
//         setToastMsg(data.message || "Registration failed.");
//       }
//     } catch (err) {
//       console.error(err);
//       setToastMsg("Error submitting data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />

//       <IonContent className="bg-gray-100 dark:bg-black pt-16">
//         <div className="max-w-3xl mx-auto p-6 space-y-8">

//           {/* Header */}
//           <div className="text-center mt-10">
//             <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">Vehicle Registration</h1>
//             <p className="text-gray-600 dark:text-gray-300">
//               Add your bus details and documents to register your vehicle.
//             </p>
//           </div>

//           {/* Vehicle Form */}
//           <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg space-y-6">

//             {/* Registration Number */}
//             <div>
//               <label className="block text-sm font-medium mb-1 text-black dark:text-white">Registration Number</label>
//               <input
//                 type="text"
//                 name="registration_number"
//                 value={vehicle.registration_number}
//                 onChange={handleChange}
//                 placeholder="Enter registration number"
//                 className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-300"
//               />
//             </div>
//             {/* AC / Non‑AC */}
//             <div>
//               <label className="block text-sm font-medium mb-1 text-black dark:text-white">Vehicle Type</label>
//               <select
//                 name="hasAc"
//                 value={vehicle.hasAc}
//                 onChange={handleChange}
//                 className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white outline-none"
//               >
//                 <option value="" disabled>Select type</option>
//                 <option value="true">AC</option>
//                 <option value="false">Non‑AC</option>
//               </select>
//             </div>

//             {/* Seats */}
//             <div>
//               <label className="block text-sm font-medium mb-1 text-black dark:text-white">Seat Count</label>
//               <div className="flex items-center border rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
//                 <UsersIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 ml-3" />
//                 <input
//                   type="number"
//                   name="seat_count"
//                   value={vehicle.seat_count}
//                   onChange={handleChange}
//                   placeholder="Enter total seats"
//                   className="w-full p-3 bg-transparent text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-300"
//                 />
//               </div>
//             </div>

//             {/* Vehicle Name */}
//             <div>
//               <label className="block text-sm font-medium mb-1 text-black dark:text-white">Vehicle Name</label>
//               <div className="flex items-center border rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
//                 <TruckIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 ml-3" />
//                 <input
//                   type="text"
//                   name="vehicle_name"
//                   value={vehicle.vehicle_name}
//                   onChange={handleChange}
//                   placeholder="Enter vehicle name"
//                   className="w-full p-3 bg-transparent text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-300"
//                 />
//               </div>
//             </div>

//             {/* Vehicle Model */}
//             <div>
//               <label className="block text-sm font-medium mb-1 text-black dark:text-white">Vehicle Model</label>
//               <input
//                 type="text"
//                 name="vehicle_model"
//                 value={vehicle.vehicle_model}
//                 onChange={handleChange}
//                 placeholder="Enter model"
//                 className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-300"
//               />
//             </div>

//             {/* Color */}
//             <div>
//               <label className="block text-sm font-medium mb-1 text-black dark:text-white">Color</label>
//               <input
//                 type="text"
//                 name="color"
//                 value={vehicle.color}
//                 onChange={handleChange}
//                 placeholder="Enter color"
//                 className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-300"
//               />
//             </div>


//             {/* Documents */}
//           {/* Rear Photo */}
// <div className="space-y-3">
//   <label className="block text-sm font-medium text-black dark:text-white">Rear Photo</label>
//   <div className="flex items-center gap-4">
//     <input
//       type="file"
//       accept="image/*"
//       onChange={(e) => handleFileChange(e, "rear")}
//       className="text-sm text-gray-500 dark:text-gray-300"
//     />
//     {/* Always show preview if selected */}
//     <div className="w-20 h-20 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
//       {rearPreview ? (
//         <img
//           src={rearPreview}
//           className="w-full h-full object-cover"
//           alt="Rear preview"
//         />
//       ) : (
//         <span className="text-gray-400 dark:text-gray-500 text-xs">Preview</span>
//       )}
//     </div>
//   </div>
// </div>

// {/* RC Document */}
// <div className="space-y-3">
//   <label className="block text-sm font-medium text-black dark:text-white">RC Document</label>
//   <div className="flex items-center gap-4">
//     <input
//       type="file"
//       accept="image/*,application/pdf"
//       onChange={(e) => handleFileChange(e, "rc")}
//       className="text-sm text-gray-500 dark:text-gray-300"
//     />
//     {/* Show file selected text */}
//     <div className="text-xs text-green-500 font-semibold">
//       {rcPreview ? "File selected" : "No file selected"}
//     </div>
//   </div>
// </div>

//             {/* Submit */}
//             <div className="flex justify-center mt-4">
//               <IonButton
//                 onClick={submitVehicle}
//                 className="bg-black dark:bg-white text-white dark:text-black w-48 h-14 rounded-xl shadow-lg hover:scale-105 transition"
//               >
//                 Register Vehicle
//               </IonButton>
//             </div>
//           </div>
//         </div>

//         <IonLoading isOpen={loading} message="Registering vehicle..." />
//         <IonToast
//           isOpen={!!toastMsg}
//           message={toastMsg}
//           duration={2500}
//           onDidDismiss={() => setToastMsg("")}
//         />
//       </IonContent>
//     </IonPage>
//   );
// };

// export default VehicleRegistration;

import React, { useState, ChangeEvent } from 'react';
import { IonPage, IonContent, IonButton, IonLoading, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import NavbarSidebar from '../pages/Navbar';
import { TruckIcon, UsersIcon } from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const VehicleRegistration: React.FC = () => {
  const history = useHistory();

  const [vehicle, setVehicle] = useState({
    hasAc: '',
    seat_count: 0,
    color: '',
    vehicle_model: '',
    vehicle_name: '',
    registration_number: '',
  });

  const [rearPhoto, setRearPhoto] = useState<File | null>(null);
  const [rcFile, setRcFile] = useState<File | null>(null);
  const [rearPreview, setRearPreview] = useState<string | null>(null);
  const [rcPreview, setRcPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const token = localStorage.getItem("access_token");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicle({ ...vehicle, [name]: name === 'seat_count' ? Number(value) : value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'rear' | 'rc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (type === 'rear') {
      setRearPhoto(file);
      setRearPreview(url);
    } else {
      setRcFile(file);
      setRcPreview(url);
    }
  };

  const submitVehicle = async () => {
    setServerError(null);

    if (!token) {
      setServerError("Session expired. Please login again.");
      return;
    }

    if (!vehicle.hasAc || !vehicle.vehicle_name || !vehicle.registration_number || !vehicle.vehicle_model) {
      setServerError("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("has_ac", vehicle.hasAc);
      formData.append("seat_count", String(vehicle.seat_count));
      formData.append("color", vehicle.color);
      formData.append("vehicle_model", vehicle.vehicle_model);
      formData.append("vehicle_name", vehicle.vehicle_name);
      formData.append("registration_number", vehicle.registration_number);

      if (rearPhoto) formData.append("rear_photo", rearPhoto);
      if (rcFile) formData.append("rc_file", rcFile);

      const res = await fetch(`${API_BASE}/driver/vehicle/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setToastMsg("Vehicle registered successfully!");
        setTimeout(() => {
          history.push("/bus-and-trip-management"); // Redirect to bus and trip management page
        }, 1500);
      } else {
        setServerError(data.detail || "Registration failed. Complete KYC first.");
      }
    } catch (err) {
      console.error(err);
      setServerError("Unexpected error occurred. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-gray-100 dark:bg-black pt-16">
        <div className="max-w-3xl mx-auto p-6 space-y-8">

          {/* Header */}
          <div className="text-center mt-10">
            <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">Vehicle Registration</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Add your bus details and documents to register your vehicle.
            </p>
          </div>

          {/* Error Card */}
          {serverError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{serverError}</span>
              <span
                className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
                onClick={() => setServerError(null)}
              >
                ✖
              </span>
            </div>
          )}

          {/* Vehicle Form */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg space-y-6">

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-medium mb-1 text-black dark:text-white">Registration Number</label>
              <input
                type="text"
                name="registration_number"
                value={vehicle.registration_number}
                onChange={handleChange}
                placeholder="Enter registration number"
                className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-300"
              />
            </div>

            {/* AC / Non‑AC */}
            <div>
              <label className="block text-sm font-medium mb-1 text-black dark:text-white">Vehicle Type</label>
              <select
                name="hasAc"
                value={vehicle.hasAc}
                onChange={handleChange}
                className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white outline-none"
              >
                <option value="" disabled>Select type</option>
                <option value="true">AC</option>
                <option value="false">Non‑AC</option>
              </select>
            </div>

            {/* Seats */}
            <div>
              <label className="block text-sm font-medium mb-1 text-black dark:text-white">Seat Count</label>
              <div className="flex items-center border rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <UsersIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 ml-3" />
                <input
                  type="number"
                  name="seat_count"
                  value={vehicle.seat_count}
                  onChange={handleChange}
                  placeholder="Enter total seats"
                  className="w-full p-3 bg-transparent text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-300"
                />
              </div>
            </div>

            {/* Vehicle Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-black dark:text-white">Vehicle Name</label>
              <div className="flex items-center border rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <TruckIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 ml-3" />
                <input
                  type="text"
                  name="vehicle_name"
                  value={vehicle.vehicle_name}
                  onChange={handleChange}
                  placeholder="Enter vehicle name"
                  className="w-full p-3 bg-transparent text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-300"
                />
              </div>
            </div>

            {/* Vehicle Model */}
            <div>
              <label className="block text-sm font-medium mb-1 text-black dark:text-white">Vehicle Model</label>
              <input
                type="text"
                name="vehicle_model"
                value={vehicle.vehicle_model}
                onChange={handleChange}
                placeholder="Enter model"
                className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-300"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium mb-1 text-black dark:text-white">Color</label>
              <input
                type="text"
                name="color"
                value={vehicle.color}
                onChange={handleChange}
                placeholder="Enter color"
                className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white outline-none placeholder-gray-400 dark:placeholder-gray-300"
              />
            </div>

            {/* Rear Photo */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-black dark:text-white">Rear Photo</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "rear")}
                  className="text-sm text-gray-500 dark:text-gray-300"
                />
                <div className="w-20 h-20 border rounded-md overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                  {rearPreview ? (
                    <img src={rearPreview} className="w-full h-full object-cover" alt="Rear preview" />
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 text-xs">Preview</span>
                  )}
                </div>
              </div>
            </div>

            {/* RC Document */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-black dark:text-white">RC Document</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange(e, "rc")}
                  className="text-sm text-gray-500 dark:text-gray-300"
                />
                <div className="text-xs text-green-500 font-semibold">
                  {rcPreview ? "File selected" : "No file selected"}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-center mt-4">
              <IonButton
                onClick={submitVehicle}
                className="bg-black dark:bg-white text-white dark:text-black w-48 h-14 rounded-xl shadow-lg hover:scale-105 transition"
              >
                Register Vehicle
              </IonButton>
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Registering vehicle..." />
        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2500}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default VehicleRegistration;