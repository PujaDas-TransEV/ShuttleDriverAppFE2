// import React, { useState, ChangeEvent } from 'react';
// import { IonPage, IonContent, IonButton, IonLoading, IonToast } from '@ionic/react';
// import { useHistory } from 'react-router-dom';
// import NavbarSidebar from '../pages/Navbar';
// import { TruckIcon, UsersIcon } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// const VehicleRegistration: React.FC = () => {
//   const history = useHistory();

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
//   const [serverError, setServerError] = useState<string | null>(null);

//   const token = localStorage.getItem("access_token");

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setVehicle({ ...vehicle, [name]: name === 'seat_count' ? Number(value) : value });
//   };

//  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'rear' | 'rc') => {
//   const file = e.target.files?.[0];
//   if (!file) return;

//   const url = URL.createObjectURL(file);

//   if (type === 'rear') {
//     setRearPhoto(file);
//     setRearPreview(url);
//   } else {
//     setRcFile(file);
//     setRcPreview(url);
//   }
// };

//   const submitVehicle = async () => {
//     setServerError(null);

//     if (!token) {
//       setServerError("Session expired. Please login again.");
//       return;
//     }

//     if (!vehicle.hasAc || !vehicle.vehicle_name || !vehicle.registration_number || !vehicle.vehicle_model) {
//       setServerError("Please fill all required fields.");
//       return;
//     }

//     setLoading(true);

//     try {
//       // Step 1: PATCH request to update vehicle
//       const formData = new FormData();
//       formData.append("has_ac", vehicle.hasAc);
//       formData.append("seat_count", String(vehicle.seat_count));
//       formData.append("color", vehicle.color);
//       formData.append("vehicle_model", vehicle.vehicle_model);
//       formData.append("vehicle_name", vehicle.vehicle_name);
//       formData.append("registration_number", vehicle.registration_number);
//       if (rearPhoto) formData.append("rear_photo", rearPhoto);
//       if (rcFile) formData.append("rc_file", rcFile);

//       const patchRes = await fetch(`${API_BASE}/driver/vehicle/register`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const patchData = await patchRes.json();

//       if (!patchRes.ok) {
//         setServerError(patchData.detail || "Vehicle update failed. Complete KYC first.");
//         return;
//       }

//       // Step 2: POST request to submit vehicle
//       const postRes = await fetch(`${API_BASE}/driver/vehicle/submit`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ registration_number: vehicle.registration_number }),
//       });

//       const postData = await postRes.json();

//       if (postRes.ok) {
//         setToastMsg("Vehicle registered successfully!");
//         setTimeout(() => history.push("/bus-and-trip-management"), 1500);
//       } else {
//         setServerError(postData.detail || "Vehicle submission failed.");
//       }
//     } catch (err) {
//       console.error(err);
//       setServerError("Unexpected error occurred. Try again later.");
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

//           {/* Error Card */}
//           {serverError && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//               <strong className="font-bold">Error: </strong>
//               <span className="block sm:inline">{serverError}</span>
//               <span
//                 className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
//                 onClick={() => setServerError(null)}
//               >
//                 ✖
//               </span>
//             </div>
//           )}

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

//             {/* Vehicle Type */}
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

//             {/* Rear Photo */}
//             <div className="space-y-2">
//               <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">Rear Photo</label>
//               <div className="flex items-center gap-4">
//                 <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:border-gray-400 transition">
//                   <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "rear")} className="hidden" />
//                   {rearPreview ? <img src={rearPreview} className="w-full h-full object-cover rounded-md" alt="Rear preview" /> :
//                     <span className="text-gray-400 dark:text-gray-500 text-xs text-center">Click to Upload</span>}
//                 </label>
//               </div>
//             </div>

//             {/* RC Document */}
//             <div className="space-y-2 mt-4">
//               <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">RC Document</label>
//               <div className="flex items-center gap-4">
//                 <label className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 px-4 py-2 cursor-pointer hover:border-gray-400 transition flex items-center justify-between">
//                   <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, "rc")} className="hidden" />
//                   <span className="text-gray-500 dark:text-gray-300 text-sm">{rcPreview ? "File selected" : "Click to Upload"}</span>
//                   {rcPreview && <span className="text-green-500 font-semibold text-sm">✔</span>}
//                 </label>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="flex justify-center mt-6">
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
import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import NavbarSidebar from '../pages/Navbar';
import { 
  TruckIcon, 
  UsersIcon, 
  PencilIcon, 
  CameraIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

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
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [serverError, setServerError] = useState<string | null>(null);

  const token = localStorage.getItem("access_token");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setVehicle({ ...vehicle, [name]: name === 'seat_count' ? Number(value) : value });
  };

  const handleSeatCountChange = (increment: boolean) => {
    setVehicle(prev => ({
      ...prev,
      seat_count: increment ? prev.seat_count + 1 : Math.max(0, prev.seat_count - 1)
    }));
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

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastType(type);
    setToastMsg(message);
  };

  const submitVehicle = async () => {
    setServerError(null);

    if (!token) {
      setServerError("Session expired. Please login again.");
      showToast("Session expired. Please login again.", 'error');
      return;
    }

    if (!vehicle.hasAc || !vehicle.vehicle_name || !vehicle.registration_number || !vehicle.vehicle_model) {
      setServerError("Please fill all required fields.");
      showToast("Please fill all required fields.", 'error');
      return;
    }

    if (vehicle.seat_count <= 0) {
      setServerError("Seat count must be greater than 0.");
      showToast("Seat count must be greater than 0.", 'error');
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

      const patchRes = await fetch(`${API_BASE}/driver/vehicle/register`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const patchData = await patchRes.json();

      if (!patchRes.ok) {
        setServerError(patchData.detail || "Vehicle update failed. Complete KYC first.");
        showToast(patchData.detail || "Vehicle update failed. Complete KYC first.", 'error');
        return;
      }

      const postRes = await fetch(`${API_BASE}/driver/vehicle/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ registration_number: vehicle.registration_number }),
      });

      const postData = await postRes.json();

      if (postRes.ok) {
        showToast("Vehicle registered successfully! Redirecting...", 'success');
        setTimeout(() => history.push("/bus-and-trip-management"), 1500);
      } else {
        setServerError(postData.detail || "Vehicle submission failed.");
        showToast(postData.detail || "Vehicle submission failed.", 'error');
      }
    } catch (err) {
      console.error(err);
      setServerError("Unexpected error occurred. Try again later.");
      showToast("Unexpected error occurred. Try again later.", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage className="bg-white dark:bg-black">
      <NavbarSidebar />
      
      <IonContent className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
          
          {/* Header Section */}
          <div className="text-center mb-8 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white text-sm font-medium mb-4">
              <TruckIcon className="w-4 h-4" />
              <span>Vehicle Registration</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
              Register Your Vehicle
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              Add your bus details and documents to register your vehicle for shuttle services
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-fadeInUp animation-delay-200">
            
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black dark:bg-white rounded-xl">
                  <PencilIcon className="w-5 h-5 text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Vehicle Information
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Fill in all the required details below
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-6">
              
              {/* Registration Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registration_number"
                  value={vehicle.registration_number}
                  onChange={handleChange}
                  placeholder="e.g., WB 01 AB 1234"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                           transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Vehicle Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="hasAc"
                    value={vehicle.hasAc}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                             transition-all duration-200 cursor-pointer"
                  >
                    <option value="" disabled>Select type</option>
                    <option value="true">❄️ AC Bus</option>
                    <option value="false">☀️ Non-AC Bus</option>
                  </select>
                </div>

                {/* Seat Count with Stepper */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Seat Count <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSeatCountChange(false)}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700
                               transition-all duration-200 flex items-center justify-center
                               disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={vehicle.seat_count <= 0}
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="seat_count"
                        value={vehicle.seat_count}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center text-lg font-semibold
                                 focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                                 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleSeatCountChange(true)}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700
                               transition-all duration-200 flex items-center justify-center"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total number of seats including driver seat
                  </p>
                </div>
              </div>

              {/* Vehicle Name & Model */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Vehicle Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="vehicle_name"
                      value={vehicle.vehicle_name}
                      onChange={handleChange}
                      placeholder="e.g., City Shuttle"
                      className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                               transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Vehicle Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicle_model"
                    value={vehicle.vehicle_model}
                    onChange={handleChange}
                    placeholder="e.g., 2024, BharatBenz"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                             transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Vehicle Color
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    name="color"
                    value={vehicle.color}
                    onChange={handleChange}
                    placeholder="e.g., White, Red, Blue"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                             transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  />
                  {vehicle.color && (
                    <div 
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-inner"
                      style={{ backgroundColor: vehicle.color.toLowerCase() }}
                    />
                  )}
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4 pt-4">
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Document Uploads
                  </h3>
                </div>

                {/* Rear Photo */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <CameraIcon className="inline w-4 h-4 mr-2" />
                    Rear Photo
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="relative w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 
                                    rounded-xl bg-gray-50 dark:bg-gray-800/50 
                                    flex flex-col items-center justify-center cursor-pointer
                                    hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-gray-700
                                    transition-all duration-200 overflow-hidden group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, "rear")} 
                        className="hidden" 
                      />
                      {rearPreview ? (
                        <>
                          <img src={rearPreview} className="w-full h-full object-cover" alt="Rear preview" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium">Change</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <CameraIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                            Click to upload
                          </span>
                        </>
                      )}
                    </label>
                    {rearPreview && (
                      <button
                        onClick={() => {
                          setRearPhoto(null);
                          setRearPreview(null);
                        }}
                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* RC Document */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <DocumentTextIcon className="inline w-4 h-4 mr-2" />
                    RC Document
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="flex-1 max-w-md px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 
                                    rounded-xl bg-gray-50 dark:bg-gray-800/50 
                                    flex items-center justify-between cursor-pointer
                                    hover:border-black dark:hover:border-white hover:bg-gray-100 dark:hover:bg-gray-700
                                    transition-all duration-200 group">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={(e) => handleFileChange(e, "rc")} 
                        className="hidden" 
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {rcPreview ? "File selected: " + (rcFile?.name || "Document") : "Click to upload RC document"}
                      </span>
                      {rcPreview && (
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      )}
                    </label>
                    {rcPreview && (
                      <button
                        onClick={() => {
                          setRcFile(null);
                          setRcPreview(null);
                        }}
                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Supported formats: JPG, PNG, PDF (Max 5MB)
                  </p>
                </div>
              </div>

              {/* Required Fields Note */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2">
                <span className="text-red-500">*</span>
                <span>Required fields</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
  onClick={submitVehicle}
  style={{
    height: '56px',
    width: '100%',
    borderRadius: '12px',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
    cursor: 'pointer',
    border: 'none'
  }}
  className="dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 transform hover:scale-[1.02] active:scale-98"
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = '#1f2937';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = '#000000';
  }}
>
  <TruckIcon className="w-5 h-5" />
  Register Vehicle
</button>
                
                <button
                  onClick={() => history.push("/bus-and-trip-management")}
                  className="flex-1 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-700
                           text-gray-700 dark:text-gray-300 font-semibold
                           hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800
                           transform hover:scale-[1.02] active:scale-98
                           transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Registering vehicle..." />
        
        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={3000}
          onDidDismiss={() => setToastMsg("")}
          color={toastType === 'success' ? 'success' : 'danger'}
          position="top"
        />
      </IonContent>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
        
        /* Hide number input spinners */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </IonPage>
  );
};

export default VehicleRegistration;