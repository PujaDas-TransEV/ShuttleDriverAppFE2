// import React, { useState, ChangeEvent, useEffect } from 'react';
// import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
// import { useHistory } from 'react-router-dom';
// import { Preferences } from '@capacitor/preferences';
// import NavbarSidebar from '../pages/Navbar';
// import { 
//   TruckIcon, 
//   UsersIcon, 
//   PencilIcon, 
//   CameraIcon, 
//   DocumentTextIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon,
//   MinusIcon,
//   PlusIcon,
//   CalendarIcon,
//   HomeIcon,
//   KeyIcon,
//   ArrowRightIcon,
//   DocumentDuplicateIcon,
//   XMarkIcon,
//   PhotoIcon,
//   CloudArrowUpIcon
// } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// // Helper function to get token from Preferences
// const getToken = async (): Promise<string | null> => {
//   try {
//     const { value } = await Preferences.get({ key: 'access_token' });
//     return value || null;
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return null;
//   }
// };

// // RC Number Validation Function
// const isValidRCNumber = (value: string): boolean => {
//   if (!value || typeof value !== 'string') return false;
  
//   const raw = value.trim().toUpperCase();
//   if (!raw) return false;
  
//   const normalized = raw.replace(/[\s-]/g, '');
//   const standardPattern = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/;
//   const bhPattern = /^\d{2}BH\d{4}[A-HJ-NP-Z]{1,2}$/;
  
//   return standardPattern.test(normalized) || bhPattern.test(normalized);
// };

// const VehicleRegistration: React.FC = () => {
//   const history = useHistory();
//   const [token, setToken] = useState<string | null>(null);

//   const [vehicle, setVehicle] = useState({
//     hasAc: '',
//     seat_count: 0,
//     color: '',
//     vehicle_model: '',
//     vehicle_name: '',
//     registration_number: '',
//     registration_valid_till: '',
//     ownership_type: '',
//   });

//   // Owner details for rented vehicles
//   const [ownerName, setOwnerName] = useState<string>('');
  
//   // File states
//   const [rearPhoto, setRearPhoto] = useState<File | null>(null);
//   const [rcFile, setRcFile] = useState<File | null>(null);
//   const [authorizationFile, setAuthorizationFile] = useState<File | null>(null);
//   const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
//   const [interiorPhoto, setInteriorPhoto] = useState<File | null>(null);
//   const [leftSidePhoto, setLeftSidePhoto] = useState<File | null>(null);
//   const [rightSidePhoto, setRightSidePhoto] = useState<File | null>(null);
//   const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
//   const [pollutionDocument, setPollutionDocument] = useState<File | null>(null);
//   const [ownerAadhaarCard, setOwnerAadhaarCard] = useState<File | null>(null);
  
//   // Preview states
//   const [rearPreview, setRearPreview] = useState<string | null>(null);
//   const [rcPreview, setRcPreview] = useState<string | null>(null);
//   const [authorizationPreview, setAuthorizationPreview] = useState<string | null>(null);
//   const [frontPreview, setFrontPreview] = useState<string | null>(null);
//   const [interiorPreview, setInteriorPreview] = useState<string | null>(null);
//   const [leftSidePreview, setLeftSidePreview] = useState<string | null>(null);
//   const [rightSidePreview, setRightSidePreview] = useState<string | null>(null);
//   const [insurancePreview, setInsurancePreview] = useState<string | null>(null);
//   const [pollutionPreview, setPollutionPreview] = useState<string | null>(null);
//   const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);

//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');
//   const [toastType, setToastType] = useState<'success' | 'error'>('success');
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [rcValidationError, setRcValidationError] = useState<string>('');
//   const [isRcValid, setIsRcValid] = useState<boolean>(false);
//   const [isHovered, setIsHovered] = useState(false);

//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//       if (!accessToken) {
//         setServerError("Session expired. Please login again.");
//         showToast("Session expired. Please login again.", 'error');
//       }
//     };
//     loadToken();
//   }, []);

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
    
//     if (name === 'registration_number') {
//       const formattedValue = value.toUpperCase();
//       setVehicle({ ...vehicle, registration_number: formattedValue });
      
//       if (formattedValue && formattedValue.trim()) {
//         const isValid = isValidRCNumber(formattedValue);
//         if (!isValid) {
//           setRcValidationError('Invalid registration number format');
//           setIsRcValid(false);
//         } else {
//           setRcValidationError('');
//           setIsRcValid(true);
//         }
//       } else {
//         setRcValidationError('');
//         setIsRcValid(false);
//       }
//     } else if (name === 'hasAc') {
//       setVehicle({ ...vehicle, hasAc: value });
//     } else {
//       setVehicle({ ...vehicle, [name]: name === 'seat_count' ? Number(value) : value });
//     }
//   };

//   const handleSeatCountChange = (increment: boolean) => {
//     setVehicle(prev => ({
//       ...prev,
//       seat_count: increment ? prev.seat_count + 1 : Math.max(0, prev.seat_count - 1)
//     }));
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: string) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       showToast('File size must be less than 5MB', 'error');
//       return;
//     }

//     const url = URL.createObjectURL(file);

//     switch(type) {
//       case 'rear':
//         setRearPhoto(file);
//         setRearPreview(url);
//         break;
//       case 'rc':
//         setRcFile(file);
//         setRcPreview(url);
//         break;
//       case 'authorization':
//         setAuthorizationFile(file);
//         setAuthorizationPreview(url);
//         break;
//       case 'front':
//         setFrontPhoto(file);
//         setFrontPreview(url);
//         break;
//       case 'interior':
//         setInteriorPhoto(file);
//         setInteriorPreview(url);
//         break;
//       case 'left':
//         setLeftSidePhoto(file);
//         setLeftSidePreview(url);
//         break;
//       case 'right':
//         setRightSidePhoto(file);
//         setRightSidePreview(url);
//         break;
//       case 'insurance':
//         setInsuranceDocument(file);
//         setInsurancePreview(url);
//         break;
//       case 'pollution':
//         setPollutionDocument(file);
//         setPollutionPreview(url);
//         break;
//       case 'aadhaar':
//         setOwnerAadhaarCard(file);
//         setAadhaarPreview(url);
//         break;
//     }
//   };

//   const showToast = (message: string, type: 'success' | 'error') => {
//     setToastType(type);
//     setToastMsg(message);
//   };

//   const removeFile = (type: string) => {
//     switch(type) {
//       case 'rear':
//         setRearPhoto(null);
//         setRearPreview(null);
//         break;
//       case 'rc':
//         setRcFile(null);
//         setRcPreview(null);
//         break;
//       case 'authorization':
//         setAuthorizationFile(null);
//         setAuthorizationPreview(null);
//         break;
//       case 'front':
//         setFrontPhoto(null);
//         setFrontPreview(null);
//         break;
//       case 'interior':
//         setInteriorPhoto(null);
//         setInteriorPreview(null);
//         break;
//       case 'left':
//         setLeftSidePhoto(null);
//         setLeftSidePreview(null);
//         break;
//       case 'right':
//         setRightSidePhoto(null);
//         setRightSidePreview(null);
//         break;
//       case 'insurance':
//         setInsuranceDocument(null);
//         setInsurancePreview(null);
//         break;
//       case 'pollution':
//         setPollutionDocument(null);
//         setPollutionPreview(null);
//         break;
//       case 'aadhaar':
//         setOwnerAadhaarCard(null);
//         setAadhaarPreview(null);
//         break;
//     }
//   };

//   const handleRegisterAndSubmit = async () => {
//     console.log("🚀 Register button clicked!");
//     setServerError(null);

//     if (!token) {
//       console.log("❌ No token found");
//       setServerError("Session expired. Please login again.");
//       showToast("Session expired. Please login again.", 'error');
//       return;
//     }

//     console.log("✅ Token found:", token);

//     // Basic validations
//     if (!vehicle.hasAc) {
//       console.log("❌ Vehicle type not selected");
//       setServerError("Please select vehicle type.");
//       showToast("Please select vehicle type.", 'error');
//       return;
//     }

//     if (!vehicle.vehicle_name) {
//       console.log("❌ Vehicle name not entered");
//       setServerError("Please enter vehicle name.");
//       showToast("Please enter vehicle name.", 'error');
//       return;
//     }

//     if (!vehicle.registration_number) {
//       console.log("❌ Registration number not entered");
//       setServerError("Please enter registration number.");
//       showToast("Please enter registration number.", 'error');
//       return;
//     }

//     if (!vehicle.vehicle_model) {
//       console.log("❌ Vehicle model not entered");
//       setServerError("Please enter vehicle model.");
//       showToast("Please enter vehicle model.", 'error');
//       return;
//     }

//     if (vehicle.seat_count <= 0) {
//       console.log("❌ Invalid seat count");
//       setServerError("Seat count must be greater than 0.");
//       showToast("Seat count must be greater than 0.", 'error');
//       return;
//     }

//     if (!vehicle.registration_valid_till) {
//       console.log("❌ Registration valid till date not selected");
//       setServerError("Registration valid till date is required.");
//       showToast("Please select registration valid till date.", 'error');
//       return;
//     }

//     if (!vehicle.ownership_type) {
//       console.log("❌ Ownership type not selected");
//       setServerError("Please select ownership type.");
//       showToast("Please select ownership type.", 'error');
//       return;
//     }

//     if (!isValidRCNumber(vehicle.registration_number)) {
//       console.log("❌ Invalid RC number format");
//       setServerError("Invalid registration number format.");
//       showToast("Invalid registration number format.", 'error');
//       return;
//     }

//     if (!rcFile) {
//       console.log("❌ RC document not uploaded");
//       setServerError("RC document is required.");
//       showToast("Please upload RC document.", 'error');
//       return;
//     }

//     if (!rearPhoto) {
//       console.log("❌ Rear photo not uploaded");
//       setServerError("Rear photo is required.");
//       showToast("Please upload rear photo.", 'error');
//       return;
//     }

//     // Rented vehicle validations
//     if (vehicle.ownership_type === 'rented') {
//       if (!ownerName) {
//         console.log("❌ Owner name not entered for rented vehicle");
//         setServerError("Owner name is required for rented vehicle.");
//         showToast("Please enter owner name.", 'error');
//         return;
//       }
//       if (!ownerAadhaarCard) {
//         console.log("❌ Owner Aadhaar not uploaded for rented vehicle");
//         setServerError("Owner Aadhaar card is required for rented vehicle.");
//         showToast("Please upload owner's Aadhaar card.", 'error');
//         return;
//       }
//       if (!authorizationFile) {
//         console.log("❌ Authorization document not uploaded for rented vehicle");
//         setServerError("Authorization document is required for rented vehicle.");
//         showToast("Please upload authorization document.", 'error');
//         return;
//       }
//     }

//     // Self-owned vehicle validation
//     if (vehicle.ownership_type === 'self' && authorizationFile) {
//       console.log("❌ Authorization file uploaded for self-owned vehicle");
//       setServerError("Authorization document should not be uploaded for self-owned vehicle.");
//       showToast("Authorization document not allowed for self-owned vehicle.", 'error');
//       return;
//     }

//     console.log("✅ All validations passed!");
//     setLoading(true);

//     try {
//       // Step 1: Register Vehicle with all documents
//       const formData = new FormData();
//       formData.append("has_ac", vehicle.hasAc);
//       formData.append("seat_count", String(vehicle.seat_count));
//       formData.append("color", vehicle.color || '');
//       formData.append("vehicle_model", vehicle.vehicle_model);
//       formData.append("vehicle_name", vehicle.vehicle_name);
//       formData.append("registration_number", vehicle.registration_number.toUpperCase());
//       formData.append("registration_valid_till", vehicle.registration_valid_till);
//       formData.append("ownership_type", vehicle.ownership_type);
      
//       if (ownerName) formData.append("owner_name", ownerName);
      
//       // Required files
//       formData.append("rear_photo", rearPhoto);
//       formData.append("rc_file", rcFile);
      
//       // Optional vehicle photos
//       if (frontPhoto) formData.append("front_photo", frontPhoto);
//       if (interiorPhoto) formData.append("interior_photo", interiorPhoto);
//       if (leftSidePhoto) formData.append("left_side_photo", leftSidePhoto);
//       if (rightSidePhoto) formData.append("right_side_photo", rightSidePhoto);
      
//       // Documents
//       if (authorizationFile && vehicle.ownership_type === 'rented') {
//         formData.append("authentication_file", authorizationFile);
//       }
//       if (insuranceDocument) formData.append("insurance_document", insuranceDocument);
//       if (pollutionDocument) formData.append("pollution_document", pollutionDocument);
//       if (ownerAadhaarCard && vehicle.ownership_type === 'rented') {
//         formData.append("owner_aadhaar_card", ownerAadhaarCard);
//       }

//       console.log("📝 Calling Register API: /driver/vehicle/register");
      
//       const registerRes = await fetch(`${API_BASE}/driver/vehicle/register`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const registerData = await registerRes.json();

//       if (!registerRes.ok) {
//         console.error("❌ Register API failed:", registerData);
//         setServerError(registerData.detail || "Vehicle registration failed.");
//         showToast(registerData.detail || "Vehicle registration failed.", 'error');
//         setLoading(false);
//         return;
//       }

//       console.log("✅ Register API success:", registerData);
//       showToast("Vehicle registered successfully! Submitting for approval...", 'success');

//       // Step 2: Submit Vehicle for approval
//       console.log("📝 Calling Submit API: /driver/vehicle/submit");
      
//       const submitRes = await fetch(`${API_BASE}/driver/vehicle/submit`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ registration_number: vehicle.registration_number.toUpperCase() }),
//       });

//       const submitData = await submitRes.json();

//       if (submitRes.ok) {
//         console.log("✅ Submit API success:", submitData);
//         showToast("Vehicle submitted for approval successfully! Redirecting...", 'success');
//         setTimeout(() => history.push("/bus-and-trip-management"), 1500);
//       } else {
//         console.error("❌ Submit API failed:", submitData);
//         setServerError(submitData.detail || "Vehicle submission failed.");
//         showToast(submitData.detail || "Vehicle submission failed.", 'error');
//       }
//     } catch (err) {
//       console.error("❌ Network Error:", err);
//       setServerError("Network error. Please check your connection and try again.");
//       showToast("Network error. Please check your connection and try again.", 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isFormValid = () => {
//     const baseValid = 
//       vehicle.hasAc &&
//       vehicle.vehicle_name &&
//       vehicle.registration_number &&
//       vehicle.vehicle_model &&
//       vehicle.seat_count > 0 &&
//       vehicle.registration_valid_till &&
//       vehicle.ownership_type &&
//       isRcValid &&
//       rcFile &&
//       rearPhoto;
    
//     if (vehicle.ownership_type === 'rented') {
//       return baseValid && ownerName && ownerAadhaarCard && authorizationFile;
//     }
    
//     return baseValid;
//   };

//   return (
//     <IonPage className="bg-white dark:bg-black">
//       <NavbarSidebar />
      
//       <IonContent className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
//         <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
          
//           {/* Header Section */}
//           <div className="text-center mb-8 animate-fadeInUp">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-blue-600 text-sm font-medium mb-4">
//               <TruckIcon className="w-4 h-4" />
//               <span>Vehicle Registration</span>
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-800 to-gray-800 dark:from-white dark:to-gray-600 bg-clip-text text-transparent mb-3">
//               Register Your Vehicle
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
//               Add your bus details and documents to register your vehicle for shuttle services
//             </p>
//           </div>

//           {/* Main Form Card */}
//           <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-fadeInUp animation-delay-200">
            
//             {/* Form Header */}
//             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-black dark:bg-white rounded-xl">
//                   <PencilIcon className="w-5 h-5 text-white dark:text-black" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                     Vehicle Information
//                   </h2>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Fill in all the required details below
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Form Body */}
//             <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
//               {/* Registration Number */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Registration Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="text"
//                     name="registration_number"
//                     value={vehicle.registration_number}
//                     onChange={handleChange}
//                     placeholder="e.g., WB01AB1234"
//                     className={`w-full px-4 py-3 pl-10 rounded-xl border-2 transition-all duration-200
//                              bg-white dark:bg-white-800 
//                              text-gray-900 dark:text-white uppercase
//                              placeholder:text-gray-400 dark:placeholder:text-gray-500
//                              focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              ${rcValidationError 
//                                ? 'border-red-500 focus:border-red-500' 
//                                : isRcValid && vehicle.registration_number
//                                  ? 'border-green-500 focus:border-green-500'
//                                  : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white'}`}
//                   />
//                 </div>
//                 {rcValidationError && (
//                   <div className="flex items-start gap-2 mt-1">
//                     <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5" />
//                     <p className="text-sm text-red-600 dark:text-red-400">{rcValidationError}</p>
//                   </div>
//                 )}
//               </div>

//               {/* Two Column Layout */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* Vehicle Type */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Vehicle Type <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="hasAc"
//                     value={vehicle.hasAc}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-white-800 
//                              text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200 cursor-pointer"
//                   >
//                     <option value="" disabled>Select type</option>
//                     <option value="true">❄️ AC Bus</option>
//                     <option value="false">☀️ Non-AC Bus</option>
//                   </select>
//                 </div>

//                 {/* Seat Count with Stepper */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Seat Count <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex items-center gap-3">
//                     <button
//                       type="button"
//                       onClick={() => handleSeatCountChange(false)}
//                       className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700
//                                transition-all duration-200 flex items-center justify-center
//                                disabled:opacity-50 disabled:cursor-not-allowed"
//                       disabled={vehicle.seat_count <= 0}
//                     >
//                       <MinusIcon className="w-5 h-5" />
//                     </button>
                    
//                     <div className="flex-1 relative">
//                       <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="number"
//                         name="seat_count"
//                         value={vehicle.seat_count}
//                         onChange={handleChange}
//                         min="0"
//                         className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                  bg-white dark:bg-white-800 
//                                  text-gray-900 dark:text-white text-center text-lg font-semibold
//                                  focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                                  transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                       />
//                     </div>
                    
//                     <button
//                       type="button"
//                       onClick={() => handleSeatCountChange(true)}
//                       className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700
//                                transition-all duration-200 flex items-center justify-center"
//                     >
//                       <PlusIcon className="w-5 h-5" />
//                     </button>
//                   </div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                     Total number of seats including driver seat
//                   </p>
//                 </div>
//               </div>

//               {/* Vehicle Name & Model */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Vehicle Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       type="text"
//                       name="vehicle_name"
//                       value={vehicle.vehicle_name}
//                       onChange={handleChange}
//                       placeholder="e.g., City Shuttle"
//                       className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-white-800 
//                                text-gray-900 dark:text-white
//                                placeholder:text-gray-400 dark:placeholder:text-gray-500
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                                transition-all duration-200"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Vehicle Model <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="vehicle_model"
//                     value={vehicle.vehicle_model}
//                     onChange={handleChange}
//                     placeholder="e.g., 2024, BharatBenz"
//                     className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-white-800 
//                              text-gray-900 dark:text-white
//                              placeholder:text-gray-400 dark:placeholder:text-gray-500
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200"
//                   />
//                 </div>
//               </div>

//               {/* Color */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Vehicle Color <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex gap-3 items-center">
//                   <input
//                     type="text"
//                     name="color"
//                     value={vehicle.color}
//                     onChange={handleChange}
//                     placeholder="e.g., White, Red, Blue"
//                     className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-white-800 
//                              text-gray-900 dark:text-white
//                              placeholder:text-gray-400 dark:placeholder:text-gray-500
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200"
//                   />
//                   {vehicle.color && (
//                     <div 
//                       className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-inner"
//                       style={{ backgroundColor: vehicle.color.toLowerCase() }}
//                     />
//                   )}
//                 </div>
//               </div>

//               {/* Registration Valid Till Date */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Registration Valid Till <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="date"
//                     name="registration_valid_till"
//                     value={vehicle.registration_valid_till}
//                     onChange={handleChange}
//                     min={new Date().toISOString().split('T')[0]}
//                     className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-400 
//                              text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                   Select the date when your vehicle registration expires
//                 </p>
//               </div>

//               {/* Ownership Type Selection */}
//               <div className="space-y-3 pt-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Ownership Type <span className="text-red-500">*</span>
//                 </label>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <button
//                     type="button"
//                     onClick={() => setVehicle({ ...vehicle, ownership_type: 'self' })}
//                     className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
//                       ${vehicle.ownership_type === 'self' 
//                         ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-[1.02] ring-2 ring-green-500/20' 
//                         : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
//                       }`}
//                     style={{ minHeight: '120px' }}
//                   >
//                     <div className="flex items-start gap-3">
//                       <div className={`p-2.5 rounded-lg transition-all duration-200
//                         ${vehicle.ownership_type === 'self' 
//                           ? 'bg-green-500 dark:bg-green-600' 
//                           : 'bg-gray-100 dark:bg-gray-800'
//                         }`}>
//                         <HomeIcon className={`w-5 h-5 transition-all duration-200
//                           ${vehicle.ownership_type === 'self' 
//                             ? 'text-white' 
//                             : 'text-gray-600 dark:text-gray-400'
//                           }`} />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className={`font-semibold transition-all duration-200 text-base
//                           ${vehicle.ownership_type === 'self' 
//                             ? 'text-green-700 dark:text-green-400' 
//                             : 'text-gray-700 dark:text-gray-300'
//                           }`}>
//                           Self-Owned
//                         </h3>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                           Vehicle is personally owned by you. No additional authorization document required.
//                         </p>
//                       </div>
//                       {vehicle.ownership_type === 'self' && (
//                         <div className="bg-green-500 rounded-full p-1">
//                           <CheckCircleIcon className="w-5 h-5 text-white" />
//                         </div>
//                       )}
//                     </div>
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => setVehicle({ ...vehicle, ownership_type: 'rented' })}
//                     className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
//                       ${vehicle.ownership_type === 'rented' 
//                         ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-[1.02] ring-2 ring-green-500/20' 
//                         : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
//                       }`}
//                     style={{ minHeight: '120px' }}
//                   >
//                     <div className="flex items-start gap-3">
//                       <div className={`p-2.5 rounded-lg transition-all duration-200
//                         ${vehicle.ownership_type === 'rented' 
//                           ? 'bg-green-500 dark:bg-green-600' 
//                           : 'bg-gray-100 dark:bg-gray-800'
//                         }`}>
//                         <KeyIcon className={`w-5 h-5 transition-all duration-200
//                           ${vehicle.ownership_type === 'rented' 
//                             ? 'text-white' 
//                             : 'text-gray-600 dark:text-gray-400'
//                           }`} />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className={`font-semibold transition-all duration-200 text-base
//                           ${vehicle.ownership_type === 'rented' 
//                             ? 'text-green-700 dark:text-green-400' 
//                             : 'text-gray-700 dark:text-gray-300'
//                           }`}>
//                           Rented/Leased
//                         </h3>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                           Vehicle is rented or leased. Authorization document from owner is required.
//                         </p>
//                       </div>
//                       {vehicle.ownership_type === 'rented' && (
//                         <div className="bg-green-500 rounded-full p-1">
//                           <CheckCircleIcon className="w-5 h-5 text-white" />
//                         </div>
//                       )}
//                     </div>
//                   </button>
//                 </div>
//               </div>

//               {/* Rented Vehicle Additional Fields */}
//               {vehicle.ownership_type === 'rented' && (
//                 <div className="space-y-4 animate-fadeInUp">
//                   <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                     <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                       Owner Information <span className="text-red-500">*</span>
//                     </h3>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       Owner Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={ownerName}
//                       onChange={(e) => setOwnerName(e.target.value)}
//                       placeholder="Enter vehicle owner's full name"
//                       className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-200 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
//                                transition-all duration-200"
//                       style={{ height: '48px' }}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       Owner Aadhaar Card <span className="text-red-500">*</span>
//                     </label>
//                     {aadhaarPreview && (
//                       <div className="mb-2 relative inline-block">
//                         {aadhaarPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img src={aadhaarPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         ) : (
//                           <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                             <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                           </div>
//                         )}
//                         <button
//                           onClick={() => removeFile('aadhaar')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                       style={{ height: '44px', minWidth: '160px' }}
//                     >
//                       <CloudArrowUpIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Aadhaar Card</span>
//                       <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className="hidden" />
//                     </label>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upload owner's Aadhaar card (JPG, PNG, PDF - Max 5MB)</p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       Authorization Document <span className="text-red-500">*</span>
//                     </label>
//                     {authorizationPreview && (
//                       <div className="mb-2 relative inline-block">
//                         {authorizationPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img src={authorizationPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         ) : (
//                           <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                             <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                           </div>
//                         )}
//                         <button
//                           onClick={() => removeFile('authorization')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                       style={{ height: '44px', minWidth: '180px' }}
//                     >
//                       <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Authorization Letter</span>
//                       <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'authorization')} className="hidden" />
//                     </label>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upload rental agreement or authorization letter (JPG, PNG, PDF - Max 5MB)</p>
//                   </div>
//                 </div>
//               )}

//               {/* Vehicle Photos Section */}
//               <div className="space-y-4">
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                   <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                     Vehicle Photos <span className="text-red-500">*</span>
//                   </h3>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Front Photo
//                     </label>
//                     {frontPreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={frontPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('front')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Front Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="hidden" />
//                     </label>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Interior Photo
//                     </label>
//                     {interiorPreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={interiorPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('interior')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Interior Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'interior')} className="hidden" />
//                     </label>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Left Side Photo
//                     </label>
//                     {leftSidePreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={leftSidePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('left')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Left Side Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'left')} className="hidden" />
//                     </label>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Right Side Photo
//                     </label>
//                     {rightSidePreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={rightSidePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('right')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Right Side Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'right')} className="hidden" />
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               {/* Required Documents */}
//               <div className="space-y-4">
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                   <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                     Required Documents <span className="text-red-500">*</span>
//                   </h3>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <CameraIcon className="inline w-4 h-4 mr-2" />
//                     Rear Photo <span className="text-red-500">*</span>
//                   </label>
//                   {rearPreview && (
//                     <div className="mb-2 relative inline-block">
//                       <img src={rearPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       <button
//                         onClick={() => removeFile('rear')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '140px' }}
//                   >
//                     <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload Rear Photo</span>
//                     <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'rear')} className="hidden" />
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <DocumentTextIcon className="inline w-4 h-4 mr-2" />
//                     RC Document <span className="text-red-500">*</span>
//                   </label>
//                   {rcPreview && (
//                     <div className="mb-2 relative inline-block">
//                       {rcPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                         <img src={rcPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       ) : (
//                         <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                           <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                         </div>
//                       )}
//                       <button
//                         onClick={() => removeFile('rc')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '140px' }}
//                   >
//                     <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload RC Document</span>
//                     <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'rc')} className="hidden" />
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <DocumentTextIcon className="inline w-4 h-4 mr-2" />
//                     Insurance Document <span className="text-red-500">*</span>
//                   </label>
//                   {insurancePreview && (
//                     <div className="mb-2 relative inline-block">
//                       {insurancePreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                         <img src={insurancePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       ) : (
//                         <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                           <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                         </div>
//                       )}
//                       <button
//                         onClick={() => removeFile('insurance')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '160px' }}
//                   >
//                     <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload Insurance</span>
//                     <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'insurance')} className="hidden" />
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <DocumentTextIcon className="inline w-4 h-4 mr-2" />
//                     Pollution Certificate (Optional)
//                   </label>
//                   {pollutionPreview && (
//                     <div className="mb-2 relative inline-block">
//                       {pollutionPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                         <img src={pollutionPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       ) : (
//                         <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                           <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                         </div>
//                       )}
//                       <button
//                         onClick={() => removeFile('pollution')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '170px' }}
//                   >
//                     <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload Pollution Certificate</span>
//                     <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'pollution')} className="hidden" />
//                   </label>
//                 </div>
//               </div>

//               {/* Required Fields Note */}
//               <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2">
//                 <span className="text-red-500">*</span>
//                 <span>Required fields</span>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-4 pt-6">
//                 <button
//                   onClick={handleRegisterAndSubmit}
//                   disabled={!isFormValid() || loading}
//                   onMouseEnter={() => setIsHovered(true)}
//                   onMouseLeave={() => setIsHovered(false)}
//                   style={{
//                     height: '56px',
//                     width: '100%',
//                     borderRadius: '14px',
//                     background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
//                     color: '#ffffff',
//                     fontWeight: 600,
//                     fontSize: '16px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '12px',
//                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//                     boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
//                     cursor: (!isFormValid() || loading) ? 'not-allowed' : 'pointer',
//                     border: 'none',
//                     opacity: (!isFormValid() || loading) ? 0.6 : 1,
//                     transform: isHovered && isFormValid() && !loading ? 'translateY(-2px)' : 'translateY(0)'
//                   }}
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       <span>Registering Vehicle...</span>
//                     </>
//                   ) : (
//                     <>
//                       <TruckIcon className="w-5 h-5" />
//                       <span>Register Vehicle</span>
//                       <ArrowRightIcon className="w-4 h-4" style={{ transition: 'transform 0.3s ease', transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }} />
//                     </>
//                   )}
//                 </button>
                
//                 <button
//                   onClick={() => history.push("/bus-and-trip-management")}
//                   className="flex-1 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-700
//                            text-gray-700 dark:text-gray-300 font-semibold
//                            hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800
//                            transform hover:scale-[1.02] active:scale-98
//                            transition-all duration-200"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </IonContent>

//       <IonLoading isOpen={loading} message="Registering vehicle..." />
      
//       <IonToast
//         isOpen={!!toastMsg}
//         message={toastMsg}
//         duration={3000}
//         onDidDismiss={() => setToastMsg("")}
//         color={toastType === 'success' ? 'success' : 'danger'}
//         position="top"
//       />

//       <style>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         .animate-fadeInUp {
//           animation: fadeInUp 0.6s ease-out forwards;
//           opacity: 0;
//         }
        
//         .animation-delay-200 {
//           animation-delay: 0.2s;
//         }
        
//         .active\\:scale-98:active {
//           transform: scale(0.98);
//         }
        
//         @keyframes spin {
//           to {
//             transform: rotate(360deg);
//           }
//         }
        
//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }
        
//         /* Hide number input spinners */
//         input[type="number"]::-webkit-outer-spin-button,
//         input[type="number"]::-webkit-inner-spin-button {
//           -webkit-appearance: none;
//           margin: 0;
//         }
        
//         input[type="number"] {
//           -moz-appearance: textfield;
//         }
        
//         /* Custom scrollbar */
//         ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }
        
//         ::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb {
//           background: #888;
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb:hover {
//           background: #555;
//         }
        
//         .dark ::-webkit-scrollbar-track {
//           background: #1f2937;
//         }
        
//         .dark ::-webkit-scrollbar-thumb {
//           background: #4b5563;
//         }
        
//         .dark ::-webkit-scrollbar-thumb:hover {
//           background: #6b7280;
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default VehicleRegistration;

// import React, { useState, ChangeEvent, useEffect } from 'react';
// import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
// import { useHistory } from 'react-router-dom';
// import { Preferences } from '@capacitor/preferences';
// import NavbarSidebar from '../pages/Navbar';
// import { 
//   TruckIcon, 
//   UsersIcon, 
//   PencilIcon, 
//   CameraIcon, 
//   DocumentTextIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon,
//   MinusIcon,
//   PlusIcon,
//   CalendarIcon,
//   HomeIcon,
//   KeyIcon,
//   ArrowRightIcon,
//   DocumentDuplicateIcon,
//   XMarkIcon,
//   PhotoIcon,
//   CloudArrowUpIcon,
//   ShieldCheckIcon,
//   CpuChipIcon,
//   InformationCircleIcon
// } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// // Helper function to get token from Preferences
// const getToken = async (): Promise<string | null> => {
//   try {
//     const { value } = await Preferences.get({ key: 'access_token' });
//     return value || null;
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return null;
//   }
// };

// // RC Number Validation Function
// const isValidRCNumber = (value: string): boolean => {
//   if (!value || typeof value !== 'string') return false;
  
//   const raw = value.trim().toUpperCase();
//   if (!raw) return false;
  
//   const normalized = raw.replace(/[\s-]/g, '');
//   const standardPattern = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/;
//   const bhPattern = /^\d{2}BH\d{4}[A-HJ-NP-Z]{1,2}$/;
  
//   return standardPattern.test(normalized) || bhPattern.test(normalized);
// };

// const VehicleRegistration: React.FC = () => {
//   const history = useHistory();
//   const [token, setToken] = useState<string | null>(null);

//   const [vehicle, setVehicle] = useState({
//     hasAc: '',
//     seat_count: 0,
//     color: '',
//     vehicle_model: '',
//     vehicle_name: '',
//     registration_number: '',
//     registration_valid_till: '',
//     ownership_type: '',
//     default_rfid_reserved_seat_count: 0,
//     enable_rfid_reservation: false,
//   });

//   // Owner details for rented vehicles
//   const [ownerName, setOwnerName] = useState<string>('');
  
//   // File states
//   const [rearPhoto, setRearPhoto] = useState<File | null>(null);
//   const [rcFile, setRcFile] = useState<File | null>(null);
//   const [authorizationFile, setAuthorizationFile] = useState<File | null>(null);
//   const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
//   const [interiorPhoto, setInteriorPhoto] = useState<File | null>(null);
//   const [leftSidePhoto, setLeftSidePhoto] = useState<File | null>(null);
//   const [rightSidePhoto, setRightSidePhoto] = useState<File | null>(null);
//   const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
//   const [pollutionDocument, setPollutionDocument] = useState<File | null>(null);
//   const [ownerAadhaarCard, setOwnerAadhaarCard] = useState<File | null>(null);
  
//   // Preview states
//   const [rearPreview, setRearPreview] = useState<string | null>(null);
//   const [rcPreview, setRcPreview] = useState<string | null>(null);
//   const [authorizationPreview, setAuthorizationPreview] = useState<string | null>(null);
//   const [frontPreview, setFrontPreview] = useState<string | null>(null);
//   const [interiorPreview, setInteriorPreview] = useState<string | null>(null);
//   const [leftSidePreview, setLeftSidePreview] = useState<string | null>(null);
//   const [rightSidePreview, setRightSidePreview] = useState<string | null>(null);
//   const [insurancePreview, setInsurancePreview] = useState<string | null>(null);
//   const [pollutionPreview, setPollutionPreview] = useState<string | null>(null);
//   const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);

//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');
//   const [toastType, setToastType] = useState<'success' | 'error'>('success');
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [rcValidationError, setRcValidationError] = useState<string>('');
//   const [isRcValid, setIsRcValid] = useState<boolean>(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [showRfidInfo, setShowRfidInfo] = useState(false);

//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//       if (!accessToken) {
//         setServerError("Session expired. Please login again.");
//         showToast("Session expired. Please login again.", 'error');
//       }
//     };
//     loadToken();
//   }, []);

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
    
//     if (name === 'registration_number') {
//       const formattedValue = value.toUpperCase();
//       setVehicle({ ...vehicle, registration_number: formattedValue });
      
//       if (formattedValue && formattedValue.trim()) {
//         const isValid = isValidRCNumber(formattedValue);
//         if (!isValid) {
//           setRcValidationError('Invalid registration number format');
//           setIsRcValid(false);
//         } else {
//           setRcValidationError('');
//           setIsRcValid(true);
//         }
//       } else {
//         setRcValidationError('');
//         setIsRcValid(false);
//       }
//     } else if (name === 'hasAc') {
//       setVehicle({ ...vehicle, hasAc: value });
//     } else {
//       setVehicle({ ...vehicle, [name]: name === 'seat_count' || name === 'default_rfid_reserved_seat_count' ? Number(value) : value });
//     }
//   };

//   const handleSeatCountChange = (increment: boolean) => {
//     setVehicle(prev => ({
//       ...prev,
//       seat_count: increment ? prev.seat_count + 1 : Math.max(0, prev.seat_count - 1)
//     }));
//   };

//   const handleRfidSeatCountChange = (increment: boolean) => {
//     setVehicle(prev => ({
//       ...prev,
//       default_rfid_reserved_seat_count: increment 
//         ? Math.min(prev.seat_count, prev.default_rfid_reserved_seat_count + 1) 
//         : Math.max(0, prev.default_rfid_reserved_seat_count - 1)
//     }));
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: string) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       showToast('File size must be less than 5MB', 'error');
//       return;
//     }

//     const url = URL.createObjectURL(file);

//     switch(type) {
//       case 'rear':
//         setRearPhoto(file);
//         setRearPreview(url);
//         break;
//       case 'rc':
//         setRcFile(file);
//         setRcPreview(url);
//         break;
//       case 'authorization':
//         setAuthorizationFile(file);
//         setAuthorizationPreview(url);
//         break;
//       case 'front':
//         setFrontPhoto(file);
//         setFrontPreview(url);
//         break;
//       case 'interior':
//         setInteriorPhoto(file);
//         setInteriorPreview(url);
//         break;
//       case 'left':
//         setLeftSidePhoto(file);
//         setLeftSidePreview(url);
//         break;
//       case 'right':
//         setRightSidePhoto(file);
//         setRightSidePreview(url);
//         break;
//       case 'insurance':
//         setInsuranceDocument(file);
//         setInsurancePreview(url);
//         break;
//       case 'pollution':
//         setPollutionDocument(file);
//         setPollutionPreview(url);
//         break;
//       case 'aadhaar':
//         setOwnerAadhaarCard(file);
//         setAadhaarPreview(url);
//         break;
//     }
//   };

//   const showToast = (message: string, type: 'success' | 'error') => {
//     setToastType(type);
//     setToastMsg(message);
//   };

//   const removeFile = (type: string) => {
//     switch(type) {
//       case 'rear':
//         setRearPhoto(null);
//         setRearPreview(null);
//         break;
//       case 'rc':
//         setRcFile(null);
//         setRcPreview(null);
//         break;
//       case 'authorization':
//         setAuthorizationFile(null);
//         setAuthorizationPreview(null);
//         break;
//       case 'front':
//         setFrontPhoto(null);
//         setFrontPreview(null);
//         break;
//       case 'interior':
//         setInteriorPhoto(null);
//         setInteriorPreview(null);
//         break;
//       case 'left':
//         setLeftSidePhoto(null);
//         setLeftSidePreview(null);
//         break;
//       case 'right':
//         setRightSidePhoto(null);
//         setRightSidePreview(null);
//         break;
//       case 'insurance':
//         setInsuranceDocument(null);
//         setInsurancePreview(null);
//         break;
//       case 'pollution':
//         setPollutionDocument(null);
//         setPollutionPreview(null);
//         break;
//       case 'aadhaar':
//         setOwnerAadhaarCard(null);
//         setAadhaarPreview(null);
//         break;
//     }
//   };

//   const handleRegisterAndSubmit = async () => {
//     console.log("🚀 Register button clicked!");
//     setServerError(null);

//     if (!token) {
//       console.log("❌ No token found");
//       setServerError("Session expired. Please login again.");
//       showToast("Session expired. Please login again.", 'error');
//       return;
//     }

//     console.log("✅ Token found:", token);

//     // Basic validations
//     if (!vehicle.hasAc) {
//       console.log("❌ Vehicle type not selected");
//       setServerError("Please select vehicle type.");
//       showToast("Please select vehicle type.", 'error');
//       return;
//     }

//     if (!vehicle.vehicle_name) {
//       console.log("❌ Vehicle name not entered");
//       setServerError("Please enter vehicle name.");
//       showToast("Please enter vehicle name.", 'error');
//       return;
//     }

//     if (!vehicle.registration_number) {
//       console.log("❌ Registration number not entered");
//       setServerError("Please enter registration number.");
//       showToast("Please enter registration number.", 'error');
//       return;
//     }

//     if (!vehicle.vehicle_model) {
//       console.log("❌ Vehicle model not entered");
//       setServerError("Please enter vehicle model.");
//       showToast("Please enter vehicle model.", 'error');
//       return;
//     }

//     if (vehicle.seat_count <= 0) {
//       console.log("❌ Invalid seat count");
//       setServerError("Seat count must be greater than 0.");
//       showToast("Seat count must be greater than 0.", 'error');
//       return;
//     }

//     if (!vehicle.registration_valid_till) {
//       console.log("❌ Registration valid till date not selected");
//       setServerError("Registration valid till date is required.");
//       showToast("Please select registration valid till date.", 'error');
//       return;
//     }

//     if (!vehicle.ownership_type) {
//       console.log("❌ Ownership type not selected");
//       setServerError("Please select ownership type.");
//       showToast("Please select ownership type.", 'error');
//       return;
//     }

//     if (!isValidRCNumber(vehicle.registration_number)) {
//       console.log("❌ Invalid RC number format");
//       setServerError("Invalid registration number format.");
//       showToast("Invalid registration number format.", 'error');
//       return;
//     }

//     // RFID Reservation Validation
//     if (vehicle.enable_rfid_reservation) {
//       if (vehicle.default_rfid_reserved_seat_count <= 0) {
//         console.log("❌ Invalid RFID reserved seat count");
//         setServerError("Please set RFID reserved seat count (minimum 1).");
//         showToast("Please set RFID reserved seat count.", 'error');
//         return;
//       }
//       if (vehicle.default_rfid_reserved_seat_count > vehicle.seat_count) {
//         console.log("❌ RFID reserved seats exceed total seats");
//         setServerError("RFID reserved seats cannot exceed total seat count.");
//         showToast("RFID reserved seats cannot exceed total seats.", 'error');
//         return;
//       }
//     }

//     if (!rcFile) {
//       console.log("❌ RC document not uploaded");
//       setServerError("RC document is required.");
//       showToast("Please upload RC document.", 'error');
//       return;
//     }

//     if (!rearPhoto) {
//       console.log("❌ Rear photo not uploaded");
//       setServerError("Rear photo is required.");
//       showToast("Please upload rear photo.", 'error');
//       return;
//     }

//     // Rented vehicle validations
//     if (vehicle.ownership_type === 'rented') {
//       if (!ownerName) {
//         console.log("❌ Owner name not entered for rented vehicle");
//         setServerError("Owner name is required for rented vehicle.");
//         showToast("Please enter owner name.", 'error');
//         return;
//       }
//       if (!ownerAadhaarCard) {
//         console.log("❌ Owner Aadhaar not uploaded for rented vehicle");
//         setServerError("Owner Aadhaar card is required for rented vehicle.");
//         showToast("Please upload owner's Aadhaar card.", 'error');
//         return;
//       }
//       if (!authorizationFile) {
//         console.log("❌ Authorization document not uploaded for rented vehicle");
//         setServerError("Authorization document is required for rented vehicle.");
//         showToast("Please upload authorization document.", 'error');
//         return;
//       }
//     }

//     // Self-owned vehicle validation
//     if (vehicle.ownership_type === 'self' && authorizationFile) {
//       console.log("❌ Authorization file uploaded for self-owned vehicle");
//       setServerError("Authorization document should not be uploaded for self-owned vehicle.");
//       showToast("Authorization document not allowed for self-owned vehicle.", 'error');
//       return;
//     }

//     console.log("✅ All validations passed!");
//     setLoading(true);

//     try {
//       // Step 1: Register Vehicle with all documents
//       const formData = new FormData();
//       formData.append("has_ac", vehicle.hasAc);
//       formData.append("seat_count", String(vehicle.seat_count));
//       formData.append("color", vehicle.color || '');
//       formData.append("vehicle_model", vehicle.vehicle_model);
//       formData.append("vehicle_name", vehicle.vehicle_name);
//       formData.append("registration_number", vehicle.registration_number.toUpperCase());
//       formData.append("registration_valid_till", vehicle.registration_valid_till);
//       formData.append("ownership_type", vehicle.ownership_type);
//       formData.append("enable_rfid_reservation", String(vehicle.enable_rfid_reservation));
      
//       if (vehicle.enable_rfid_reservation) {
//         formData.append("default_rfid_reserved_seat_count", String(vehicle.default_rfid_reserved_seat_count));
//       }
      
//       if (ownerName) formData.append("owner_name", ownerName);
      
//       // Required files
//       formData.append("rear_photo", rearPhoto);
//       formData.append("rc_file", rcFile);
      
//       // Optional vehicle photos
//       if (frontPhoto) formData.append("front_photo", frontPhoto);
//       if (interiorPhoto) formData.append("interior_photo", interiorPhoto);
//       if (leftSidePhoto) formData.append("left_side_photo", leftSidePhoto);
//       if (rightSidePhoto) formData.append("right_side_photo", rightSidePhoto);
      
//       // Documents
//       if (authorizationFile && vehicle.ownership_type === 'rented') {
//         formData.append("authentication_file", authorizationFile);
//       }
//       if (insuranceDocument) formData.append("insurance_document", insuranceDocument);
//       if (pollutionDocument) formData.append("pollution_document", pollutionDocument);
//       if (ownerAadhaarCard && vehicle.ownership_type === 'rented') {
//         formData.append("owner_aadhaar_card", ownerAadhaarCard);
//       }

//       console.log("📝 Calling Register API: /driver/vehicle/register");
      
//       const registerRes = await fetch(`${API_BASE}/driver/vehicle/register`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const registerData = await registerRes.json();

//       if (!registerRes.ok) {
//         console.error("❌ Register API failed:", registerData);
//         setServerError(registerData.detail || "Vehicle registration failed.");
//         showToast(registerData.detail || "Vehicle registration failed.", 'error');
//         setLoading(false);
//         return;
//       }

//       console.log("✅ Register API success:", registerData);
//       showToast("Vehicle registered successfully! Submitting for approval...", 'success');

//       // Step 2: Submit Vehicle for approval
//       console.log("📝 Calling Submit API: /driver/vehicle/submit");
      
//       const submitRes = await fetch(`${API_BASE}/driver/vehicle/submit`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ registration_number: vehicle.registration_number.toUpperCase() }),
//       });

//       const submitData = await submitRes.json();

//       if (submitRes.ok) {
//         console.log("✅ Submit API success:", submitData);
//         showToast("Vehicle submitted for approval successfully! Redirecting...", 'success');
//         setTimeout(() => history.push("/bus-and-trip-management"), 1500);
//       } else {
//         console.error("❌ Submit API failed:", submitData);
//         setServerError(submitData.detail || "Vehicle submission failed.");
//         showToast(submitData.detail || "Vehicle submission failed.", 'error');
//       }
//     } catch (err) {
//       console.error("❌ Network Error:", err);
//       setServerError("Network error. Please check your connection and try again.");
//       showToast("Network error. Please check your connection and try again.", 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isFormValid = () => {
//     const baseValid = 
//       vehicle.hasAc &&
//       vehicle.vehicle_name &&
//       vehicle.registration_number &&
//       vehicle.vehicle_model &&
//       vehicle.seat_count > 0 &&
//       vehicle.registration_valid_till &&
//       vehicle.ownership_type &&
//       isRcValid &&
//       rcFile &&
//       rearPhoto;
    
//     // RFID validation
//     let rfidValid = true;
//     if (vehicle.enable_rfid_reservation) {
//       rfidValid = vehicle.default_rfid_reserved_seat_count > 0 && 
//                   vehicle.default_rfid_reserved_seat_count <= vehicle.seat_count;
//     }
    
//     if (vehicle.ownership_type === 'rented') {
//       return baseValid && rfidValid && ownerName && ownerAadhaarCard && authorizationFile;
//     }
    
//     return baseValid && rfidValid;
//   };

//   return (
//     <IonPage className="bg-white dark:bg-black">
//       <NavbarSidebar />
      
//       <IonContent className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
//         <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
          
//           {/* Header Section */}
//           <div className="text-center mb-8 animate-fadeInUp">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-blue-600 text-sm font-medium mb-4">
//               <TruckIcon className="w-4 h-4" />
//               <span>Vehicle Registration</span>
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-800 to-gray-800 dark:from-white dark:to-gray-600 bg-clip-text text-transparent mb-3">
//               Register Your Vehicle
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
//               Add your bus details and documents to register your vehicle for shuttle services
//             </p>
//           </div>

//           {/* Main Form Card */}
//           <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-fadeInUp animation-delay-200">
            
//             {/* Form Header */}
//             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-black dark:bg-white rounded-xl">
//                   <PencilIcon className="w-5 h-5 text-white dark:text-black" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                     Vehicle Information
//                   </h2>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Fill in all the required details below
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Form Body */}
//             <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
//               {/* Registration Number */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Registration Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="text"
//                     name="registration_number"
//                     value={vehicle.registration_number}
//                     onChange={handleChange}
//                     placeholder="e.g., WB01AB1234"
//                     className={`w-full px-4 py-3 pl-10 rounded-xl border-2 transition-all duration-200
//                              bg-white dark:bg-white-800 
//                              text-gray-900 dark:text-white uppercase
//                              placeholder:text-gray-400 dark:placeholder:text-gray-500
//                              focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              ${rcValidationError 
//                                ? 'border-red-500 focus:border-red-500' 
//                                : isRcValid && vehicle.registration_number
//                                  ? 'border-green-500 focus:border-green-500'
//                                  : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white'}`}
//                   />
//                 </div>
//                 {rcValidationError && (
//                   <div className="flex items-start gap-2 mt-1">
//                     <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5" />
//                     <p className="text-sm text-red-600 dark:text-red-400">{rcValidationError}</p>
//                   </div>
//                 )}
//               </div>

//               {/* Two Column Layout */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* Vehicle Type */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Vehicle Type <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="hasAc"
//                     value={vehicle.hasAc}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-white-800 
//                              text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200 cursor-pointer"
//                   >
//                     <option value="" disabled>Select type</option>
//                     <option value="true">❄️ AC Bus</option>
//                     <option value="false">☀️ Non-AC Bus</option>
//                   </select>
//                 </div>

//                 {/* Seat Count with Stepper */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Seat Count <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex items-center gap-3">
//                     <button
//                       type="button"
//                       onClick={() => handleSeatCountChange(false)}
//                       className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700
//                                transition-all duration-200 flex items-center justify-center
//                                disabled:opacity-50 disabled:cursor-not-allowed"
//                       disabled={vehicle.seat_count <= 0}
//                     >
//                       <MinusIcon className="w-5 h-5" />
//                     </button>
                    
//                     <div className="flex-1 relative">
//                       <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="number"
//                         name="seat_count"
//                         value={vehicle.seat_count}
//                         onChange={handleChange}
//                         min="0"
//                         className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                  bg-white dark:bg-white-800 
//                                  text-gray-900 dark:text-white text-center text-lg font-semibold
//                                  focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                                  transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                       />
//                     </div>
                    
//                     <button
//                       type="button"
//                       onClick={() => handleSeatCountChange(true)}
//                       className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700
//                                transition-all duration-200 flex items-center justify-center"
//                     >
//                       <PlusIcon className="w-5 h-5" />
//                     </button>
//                   </div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                     Total number of seats including driver seat
//                   </p>
//                 </div>
//               </div>

//               {/* RFID Seat Reservation Section */}
//               <div className="space-y-4">
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center gap-2">
//                       <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//                       <h3 className="text-md font-semibold text-gray-900 dark:text-white">
//                         RFID Seat Reservation
//                       </h3>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setShowRfidInfo(!showRfidInfo)}
//                       className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
//                     >
//                       <InformationCircleIcon className="w-5 h-5" />
//                     </button>
//                   </div>
                  
//                   {showRfidInfo && (
//                     <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-fadeIn">
//                       <p className="text-xs text-blue-700 dark:text-blue-300">
//                         Enable RFID seat reservation to automatically reserve a specific number of seats for RFID card holders. 
//                         These seats will be pre-reserved for passengers with RFID cards on each trip.
//                       </p>
//                     </div>
//                   )}
                  
//                   <div className="flex items-center justify-between p-4 rounded-xl bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
//                         <CpuChipIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//                       </div>
//                       <div>
//                         <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                           Enable RFID Seat Reservation
//                         </p>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">
//                           Reserve seats for RFID card holders
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setVehicle({ 
//                         ...vehicle, 
//                         enable_rfid_reservation: !vehicle.enable_rfid_reservation,
//                         default_rfid_reserved_seat_count: !vehicle.enable_rfid_reservation ? Math.floor(vehicle.seat_count / 4) : 0
//                       })}
//                       className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
//                         ${vehicle.enable_rfid_reservation ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
//                     >
//                       <span
//                         className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
//                           ${vehicle.enable_rfid_reservation ? 'translate-x-6' : 'translate-x-1'}`}
//                       />
//                     </button>
//                   </div>
//                 </div>

//                 {vehicle.enable_rfid_reservation && (
//                   <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 animate-fadeInUp">
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
//                       <div className="flex items-center gap-2">
//                         <ShieldCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                         <span>Default RFID Reserved Seats</span>
//                         <span className="text-red-500">*</span>
//                       </div>
//                     </label>
                    
//                     <div className="flex items-center gap-3">
//                       <button
//                         type="button"
//                         onClick={() => handleRfidSeatCountChange(false)}
//                         className="w-12 h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 
//                                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                  hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20
//                                  transition-all duration-200 flex items-center justify-center
//                                  disabled:opacity-50 disabled:cursor-not-allowed"
//                         disabled={vehicle.default_rfid_reserved_seat_count <= 0}
//                       >
//                         <MinusIcon className="w-5 h-5" />
//                       </button>
                      
//                       <div className="flex-1 relative">
//                         <ShieldCheckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
//                         <input
//                           type="number"
//                           name="default_rfid_reserved_seat_count"
//                           value={vehicle.default_rfid_reserved_seat_count}
//                           onChange={handleChange}
//                           min="0"
//                           max={vehicle.seat_count}
//                           className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-purple-200 dark:border-purple-700 
//                                    bg-white dark:bg-white-800 
//                                    text-gray-900 dark:text-white text-center text-lg font-semibold
//                                    focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20
//                                    transition-all duration-200 [appearance:textfield]"
//                         />
//                       </div>
                      
//                       <button
//                         type="button"
//                         onClick={() => handleRfidSeatCountChange(true)}
//                         className="w-12 h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 
//                                  bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                  hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20
//                                  transition-all duration-200 flex items-center justify-center"
//                       >
//                         <PlusIcon className="w-5 h-5" />
//                       </button>
//                     </div>
                    
//                     <div className="mt-3 grid grid-cols-2 gap-3">
//                       <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Total Seats</p>
//                         <p className="text-lg font-bold text-gray-900 dark:text-white">{vehicle.seat_count}</p>
//                       </div>
//                       <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
//                         <p className="text-xs text-purple-600 dark:text-purple-400">RFID Reserved</p>
//                         <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{vehicle.default_rfid_reserved_seat_count}</p>
//                       </div>
//                     </div>
                    
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//                       These seats will be automatically reserved for RFID card holders on every trip
//                     </p>
                    
//                     {vehicle.default_rfid_reserved_seat_count > vehicle.seat_count && (
//                       <p className="text-xs text-red-500 mt-2">
//                         ⚠️ RFID reserved seats cannot exceed total seat count
//                       </p>
//                     )}
                    
//                     {vehicle.default_rfid_reserved_seat_count > 0 && vehicle.default_rfid_reserved_seat_count <= vehicle.seat_count && (
//                       <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
//                         <p className="text-xs text-green-700 dark:text-green-300">
//                           ✓ {vehicle.default_rfid_reserved_seat_count} seat(s) will be reserved for RFID card holders on each trip
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Vehicle Name & Model */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Vehicle Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       type="text"
//                       name="vehicle_name"
//                       value={vehicle.vehicle_name}
//                       onChange={handleChange}
//                       placeholder="e.g., City Shuttle"
//                       className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-white-800 
//                                text-gray-900 dark:text-white
//                                placeholder:text-gray-400 dark:placeholder:text-gray-500
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                                transition-all duration-200"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Vehicle Model <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="vehicle_model"
//                     value={vehicle.vehicle_model}
//                     onChange={handleChange}
//                     placeholder="e.g., 2024, BharatBenz"
//                     className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-white-800 
//                              text-gray-900 dark:text-white
//                              placeholder:text-gray-400 dark:placeholder:text-gray-500
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200"
//                   />
//                 </div>
//               </div>

//               {/* Color */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Vehicle Color <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex gap-3 items-center">
//                   <input
//                     type="text"
//                     name="color"
//                     value={vehicle.color}
//                     onChange={handleChange}
//                     placeholder="e.g., White, Red, Blue"
//                     className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-white-800 
//                              text-gray-900 dark:text-white
//                              placeholder:text-gray-400 dark:placeholder:text-gray-500
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200"
//                   />
//                   {vehicle.color && (
//                     <div 
//                       className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-inner"
//                       style={{ backgroundColor: vehicle.color.toLowerCase() }}
//                     />
//                   )}
//                 </div>
//               </div>

//               {/* Registration Valid Till Date */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Registration Valid Till <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="date"
//                     name="registration_valid_till"
//                     value={vehicle.registration_valid_till}
//                     onChange={handleChange}
//                     min={new Date().toISOString().split('T')[0]}
//                     className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-400 
//                              text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                   Select the date when your vehicle registration expires
//                 </p>
//               </div>

//               {/* Ownership Type Selection */}
//               <div className="space-y-3 pt-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Ownership Type <span className="text-red-500">*</span>
//                 </label>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <button
//                     type="button"
//                     onClick={() => setVehicle({ ...vehicle, ownership_type: 'self' })}
//                     className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
//                       ${vehicle.ownership_type === 'self' 
//                         ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-[1.02] ring-2 ring-green-500/20' 
//                         : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
//                       }`}
//                     style={{ minHeight: '120px' }}
//                   >
//                     <div className="flex items-start gap-3">
//                       <div className={`p-2.5 rounded-lg transition-all duration-200
//                         ${vehicle.ownership_type === 'self' 
//                           ? 'bg-green-500 dark:bg-green-600' 
//                           : 'bg-gray-100 dark:bg-gray-800'
//                         }`}>
//                         <HomeIcon className={`w-5 h-5 transition-all duration-200
//                           ${vehicle.ownership_type === 'self' 
//                             ? 'text-white' 
//                             : 'text-gray-600 dark:text-gray-400'
//                           }`} />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className={`font-semibold transition-all duration-200 text-base
//                           ${vehicle.ownership_type === 'self' 
//                             ? 'text-green-700 dark:text-green-400' 
//                             : 'text-gray-700 dark:text-gray-300'
//                           }`}>
//                           Self-Owned
//                         </h3>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                           Vehicle is personally owned by you. No additional authorization document required.
//                         </p>
//                       </div>
//                       {vehicle.ownership_type === 'self' && (
//                         <div className="bg-green-500 rounded-full p-1">
//                           <CheckCircleIcon className="w-5 h-5 text-white" />
//                         </div>
//                       )}
//                     </div>
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => setVehicle({ ...vehicle, ownership_type: 'rented' })}
//                     className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
//                       ${vehicle.ownership_type === 'rented' 
//                         ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-[1.02] ring-2 ring-green-500/20' 
//                         : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
//                       }`}
//                     style={{ minHeight: '120px' }}
//                   >
//                     <div className="flex items-start gap-3">
//                       <div className={`p-2.5 rounded-lg transition-all duration-200
//                         ${vehicle.ownership_type === 'rented' 
//                           ? 'bg-green-500 dark:bg-green-600' 
//                           : 'bg-gray-100 dark:bg-gray-800'
//                         }`}>
//                         <KeyIcon className={`w-5 h-5 transition-all duration-200
//                           ${vehicle.ownership_type === 'rented' 
//                             ? 'text-white' 
//                             : 'text-gray-600 dark:text-gray-400'
//                           }`} />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className={`font-semibold transition-all duration-200 text-base
//                           ${vehicle.ownership_type === 'rented' 
//                             ? 'text-green-700 dark:text-green-400' 
//                             : 'text-gray-700 dark:text-gray-300'
//                           }`}>
//                           Rented/Leased
//                         </h3>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                           Vehicle is rented or leased. Authorization document from owner is required.
//                         </p>
//                       </div>
//                       {vehicle.ownership_type === 'rented' && (
//                         <div className="bg-green-500 rounded-full p-1">
//                           <CheckCircleIcon className="w-5 h-5 text-white" />
//                         </div>
//                       )}
//                     </div>
//                   </button>
//                 </div>
//               </div>

//               {/* Rented Vehicle Additional Fields */}
//               {vehicle.ownership_type === 'rented' && (
//                 <div className="space-y-4 animate-fadeInUp">
//                   <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                     <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                       Owner Information <span className="text-red-500">*</span>
//                     </h3>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       Owner Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={ownerName}
//                       onChange={(e) => setOwnerName(e.target.value)}
//                       placeholder="Enter vehicle owner's full name"
//                       className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-200 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
//                                transition-all duration-200"
//                       style={{ height: '48px' }}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       Owner Aadhaar Card <span className="text-red-500">*</span>
//                     </label>
//                     {aadhaarPreview && (
//                       <div className="mb-2 relative inline-block">
//                         {aadhaarPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img src={aadhaarPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         ) : (
//                           <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                             <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                           </div>
//                         )}
//                         <button
//                           onClick={() => removeFile('aadhaar')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                       style={{ height: '44px', minWidth: '160px' }}
//                     >
//                       <CloudArrowUpIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Aadhaar Card</span>
//                       <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className="hidden" />
//                     </label>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upload owner's Aadhaar card (JPG, PNG, PDF - Max 5MB)</p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       Authorization Document <span className="text-red-500">*</span>
//                     </label>
//                     {authorizationPreview && (
//                       <div className="mb-2 relative inline-block">
//                         {authorizationPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img src={authorizationPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         ) : (
//                           <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                             <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                           </div>
//                         )}
//                         <button
//                           onClick={() => removeFile('authorization')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                       style={{ height: '44px', minWidth: '180px' }}
//                     >
//                       <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Authorization Letter</span>
//                       <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'authorization')} className="hidden" />
//                     </label>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upload rental agreement or authorization letter (JPG, PNG, PDF - Max 5MB)</p>
//                   </div>
//                 </div>
//               )}

//               {/* Vehicle Photos Section */}
//               <div className="space-y-4">
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                   <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                     Vehicle Photos <span className="text-red-500">*</span>
//                   </h3>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Front Photo
//                     </label>
//                     {frontPreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={frontPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('front')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Front Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="hidden" />
//                     </label>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Interior Photo
//                     </label>
//                     {interiorPreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={interiorPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('interior')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Interior Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'interior')} className="hidden" />
//                     </label>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Left Side Photo
//                     </label>
//                     {leftSidePreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={leftSidePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('left')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Left Side Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'left')} className="hidden" />
//                     </label>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Right Side Photo
//                     </label>
//                     {rightSidePreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={rightSidePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('right')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Right Side Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'right')} className="hidden" />
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               {/* Required Documents */}
//               <div className="space-y-4">
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                   <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                     Required Documents <span className="text-red-500">*</span>
//                   </h3>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <CameraIcon className="inline w-4 h-4 mr-2" />
//                     Rear Photo <span className="text-red-500">*</span>
//                   </label>
//                   {rearPreview && (
//                     <div className="mb-2 relative inline-block">
//                       <img src={rearPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       <button
//                         onClick={() => removeFile('rear')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '140px' }}
//                   >
//                     <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload Rear Photo</span>
//                     <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'rear')} className="hidden" />
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <DocumentTextIcon className="inline w-4 h-4 mr-2" />
//                     RC Document <span className="text-red-500">*</span>
//                   </label>
//                   {rcPreview && (
//                     <div className="mb-2 relative inline-block">
//                       {rcPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                         <img src={rcPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       ) : (
//                         <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                           <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                         </div>
//                       )}
//                       <button
//                         onClick={() => removeFile('rc')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '140px' }}
//                   >
//                     <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload RC Document</span>
//                     <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'rc')} className="hidden" />
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <DocumentTextIcon className="inline w-4 h-4 mr-2" />
//                     Insurance Document <span className="text-red-500">*</span>
//                   </label>
//                   {insurancePreview && (
//                     <div className="mb-2 relative inline-block">
//                       {insurancePreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                         <img src={insurancePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       ) : (
//                         <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                           <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                         </div>
//                       )}
//                       <button
//                         onClick={() => removeFile('insurance')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '160px' }}
//                   >
//                     <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload Insurance</span>
//                     <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'insurance')} className="hidden" />
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <DocumentTextIcon className="inline w-4 h-4 mr-2" />
//                     Pollution Certificate (Optional)
//                   </label>
//                   {pollutionPreview && (
//                     <div className="mb-2 relative inline-block">
//                       {pollutionPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                         <img src={pollutionPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       ) : (
//                         <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                           <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                         </div>
//                       )}
//                       <button
//                         onClick={() => removeFile('pollution')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '170px' }}
//                   >
//                     <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload Pollution Certificate</span>
//                     <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'pollution')} className="hidden" />
//                   </label>
//                 </div>
//               </div>

//               {/* Required Fields Note */}
//               <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2">
//                 <span className="text-red-500">*</span>
//                 <span>Required fields</span>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-4 pt-6">
//                 <button
//                   onClick={handleRegisterAndSubmit}
//                   disabled={!isFormValid() || loading}
//                   onMouseEnter={() => setIsHovered(true)}
//                   onMouseLeave={() => setIsHovered(false)}
//                   style={{
//                     height: '56px',
//                     width: '100%',
//                     borderRadius: '14px',
//                     background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
//                     color: '#ffffff',
//                     fontWeight: 600,
//                     fontSize: '16px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '12px',
//                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//                     boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
//                     cursor: (!isFormValid() || loading) ? 'not-allowed' : 'pointer',
//                     border: 'none',
//                     opacity: (!isFormValid() || loading) ? 0.6 : 1,
//                     transform: isHovered && isFormValid() && !loading ? 'translateY(-2px)' : 'translateY(0)'
//                   }}
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       <span>Registering Vehicle...</span>
//                     </>
//                   ) : (
//                     <>
//                       <TruckIcon className="w-5 h-5" />
//                       <span>Register Vehicle</span>
//                       <ArrowRightIcon className="w-4 h-4" style={{ transition: 'transform 0.3s ease', transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }} />
//                     </>
//                   )}
//                 </button>
                
//                 <button
//                   onClick={() => history.push("/bus-and-trip-management")}
//                   className="flex-1 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-700
//                            text-gray-700 dark:text-gray-300 font-semibold
//                            hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800
//                            transform hover:scale-[1.02] active:scale-98
//                            transition-all duration-200"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </IonContent>

//       <IonLoading isOpen={loading} message="Registering vehicle..." />
      
//       <IonToast
//         isOpen={!!toastMsg}
//         message={toastMsg}
//         duration={3000}
//         onDidDismiss={() => setToastMsg("")}
//         color={toastType === 'success' ? 'success' : 'danger'}
//         position="top"
//       />

//       <style>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
        
//         .animate-fadeInUp {
//           animation: fadeInUp 0.6s ease-out forwards;
//           opacity: 0;
//         }
        
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out forwards;
//         }
        
//         .animation-delay-200 {
//           animation-delay: 0.2s;
//         }
        
//         .active\\:scale-98:active {
//           transform: scale(0.98);
//         }
        
//         @keyframes spin {
//           to {
//             transform: rotate(360deg);
//           }
//         }
        
//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }
        
//         /* Hide number input spinners */
//         input[type="number"]::-webkit-outer-spin-button,
//         input[type="number"]::-webkit-inner-spin-button {
//           -webkit-appearance: none;
//           margin: 0;
//         }
        
//         input[type="number"] {
//           -moz-appearance: textfield;
//         }
        
//         /* Custom scrollbar */
//         ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }
        
//         ::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb {
//           background: #888;
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb:hover {
//           background: #555;
//         }
        
//         .dark ::-webkit-scrollbar-track {
//           background: #1f2937;
//         }
        
//         .dark ::-webkit-scrollbar-thumb {
//           background: #4b5563;
//         }
        
//         .dark ::-webkit-scrollbar-thumb:hover {
//           background: #6b7280;
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default VehicleRegistration;

// import React, { useState, ChangeEvent, useEffect } from 'react';
// import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
// import { useHistory } from 'react-router-dom';
// import { Preferences } from '@capacitor/preferences';
// import NavbarSidebar from '../pages/Navbar';
// import { 
//   TruckIcon, 
//   UsersIcon, 
//   PencilIcon, 
//   CameraIcon, 
//   DocumentTextIcon,
//   CheckCircleIcon,
//   ExclamationTriangleIcon,
//   MinusIcon,
//   PlusIcon,
//   CalendarIcon,
//   HomeIcon,
//   KeyIcon,
//   ArrowRightIcon,
//   DocumentDuplicateIcon,
//   XMarkIcon,
//   PhotoIcon,
//   CloudArrowUpIcon,
//   ShieldCheckIcon,
//   CpuChipIcon,
//   InformationCircleIcon,
//   XCircleIcon
// } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// // Helper function to get token from Preferences
// const getToken = async (): Promise<string | null> => {
//   try {
//     const { value } = await Preferences.get({ key: 'access_token' });
//     return value || null;
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return null;
//   }
// };

// // RC Number Validation Function
// const isValidRCNumber = (value: string): boolean => {
//   if (!value || typeof value !== 'string') return false;
  
//   const raw = value.trim().toUpperCase();
//   if (!raw) return false;
  
//   const normalized = raw.replace(/[\s-]/g, '');
//   const standardPattern = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/;
//   const bhPattern = /^\d{2}BH\d{4}[A-HJ-NP-Z]{1,2}$/;
  
//   return standardPattern.test(normalized) || bhPattern.test(normalized);
// };

// interface RfidConfig {
//   allow_seat_reservation: boolean;
//   message?: string;
// }

// const VehicleRegistration: React.FC = () => {
//   const history = useHistory();
//   const [token, setToken] = useState<string | null>(null);

//   const [vehicle, setVehicle] = useState({
//     hasAc: '',
//     seat_count: 0,
//     color: '',
//     vehicle_model: '',
//     vehicle_name: '',
//     registration_number: '',
//     registration_valid_till: '',
//     ownership_type: '',
//     default_rfid_reserved_seat_count: 0,
//     enable_rfid_reservation: false,
//   });

//   // RFID Configuration from API
//   const [rfidConfig, setRfidConfig] = useState<RfidConfig | null>(null);
//   const [loadingRfidConfig, setLoadingRfidConfig] = useState(false);
//   const [rfidConfigError, setRfidConfigError] = useState<string | null>(null);

//   // Owner details for rented vehicles
//   const [ownerName, setOwnerName] = useState<string>('');
  
//   // File states
//   const [rearPhoto, setRearPhoto] = useState<File | null>(null);
//   const [rcFile, setRcFile] = useState<File | null>(null);
//   const [authorizationFile, setAuthorizationFile] = useState<File | null>(null);
//   const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
//   const [interiorPhoto, setInteriorPhoto] = useState<File | null>(null);
//   const [leftSidePhoto, setLeftSidePhoto] = useState<File | null>(null);
//   const [rightSidePhoto, setRightSidePhoto] = useState<File | null>(null);
//   const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
//   const [pollutionDocument, setPollutionDocument] = useState<File | null>(null);
//   const [ownerAadhaarCard, setOwnerAadhaarCard] = useState<File | null>(null);
  
//   // Preview states
//   const [rearPreview, setRearPreview] = useState<string | null>(null);
//   const [rcPreview, setRcPreview] = useState<string | null>(null);
//   const [authorizationPreview, setAuthorizationPreview] = useState<string | null>(null);
//   const [frontPreview, setFrontPreview] = useState<string | null>(null);
//   const [interiorPreview, setInteriorPreview] = useState<string | null>(null);
//   const [leftSidePreview, setLeftSidePreview] = useState<string | null>(null);
//   const [rightSidePreview, setRightSidePreview] = useState<string | null>(null);
//   const [insurancePreview, setInsurancePreview] = useState<string | null>(null);
//   const [pollutionPreview, setPollutionPreview] = useState<string | null>(null);
//   const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);

//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');
//   const [toastType, setToastType] = useState<'success' | 'error'>('success');
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [rcValidationError, setRcValidationError] = useState<string>('');
//   const [isRcValid, setIsRcValid] = useState<boolean>(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [showRfidInfo, setShowRfidInfo] = useState(false);

//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//       if (!accessToken) {
//         setServerError("Session expired. Please login again.");
//         showToast("Session expired. Please login again.", 'error');
//       } else {
//         // Fetch RFID configuration after token is loaded
//         fetchRfidConfig(accessToken);
//       }
//     };
//     loadToken();
//   }, []);

//   // Fetch RFID Configuration from API
//   const fetchRfidConfig = async (accessToken: string) => {
//     setLoadingRfidConfig(true);
//     setRfidConfigError(null);
    
//     try {
//       console.log("📡 Fetching RFID configuration...");
//       const response = await fetch(`${API_BASE}/driver/rfid/allow-seat-reservation`, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch RFID config: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log("✅ RFID Configuration:", data);
//       setRfidConfig(data);
      
//       // If RFID reservation is not allowed, disable it in the form
//       if (!data.allow_seat_reservation) {
//         setVehicle(prev => ({
//           ...prev,
//           enable_rfid_reservation: false,
//           default_rfid_reserved_seat_count: 0
//         }));
//       }
      
//     } catch (error) {
//       console.error("❌ Error fetching RFID config:", error);
//       setRfidConfigError(error instanceof Error ? error.message : "Failed to load RFID configuration");
//       // Default to not allowing RFID reservation if API fails
//       setRfidConfig({ allow_seat_reservation: false, message: "RFID feature unavailable" });
//     } finally {
//       setLoadingRfidConfig(false);
//     }
//   };

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
    
//     if (name === 'registration_number') {
//       const formattedValue = value.toUpperCase();
//       setVehicle({ ...vehicle, registration_number: formattedValue });
      
//       if (formattedValue && formattedValue.trim()) {
//         const isValid = isValidRCNumber(formattedValue);
//         if (!isValid) {
//           setRcValidationError('Invalid registration number format');
//           setIsRcValid(false);
//         } else {
//           setRcValidationError('');
//           setIsRcValid(true);
//         }
//       } else {
//         setRcValidationError('');
//         setIsRcValid(false);
//       }
//     } else if (name === 'hasAc') {
//       setVehicle({ ...vehicle, hasAc: value });
//     } else {
//       setVehicle({ ...vehicle, [name]: name === 'seat_count' || name === 'default_rfid_reserved_seat_count' ? Number(value) : value });
//     }
//   };

//   const handleSeatCountChange = (increment: boolean) => {
//     setVehicle(prev => ({
//       ...prev,
//       seat_count: increment ? prev.seat_count + 1 : Math.max(0, prev.seat_count - 1)
//     }));
//   };

//   const handleRfidSeatCountChange = (increment: boolean) => {
//     setVehicle(prev => ({
//       ...prev,
//       default_rfid_reserved_seat_count: increment 
//         ? Math.min(prev.seat_count, prev.default_rfid_reserved_seat_count + 1) 
//         : Math.max(0, prev.default_rfid_reserved_seat_count - 1)
//     }));
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: string) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       showToast('File size must be less than 5MB', 'error');
//       return;
//     }

//     const url = URL.createObjectURL(file);

//     switch(type) {
//       case 'rear':
//         setRearPhoto(file);
//         setRearPreview(url);
//         break;
//       case 'rc':
//         setRcFile(file);
//         setRcPreview(url);
//         break;
//       case 'authorization':
//         setAuthorizationFile(file);
//         setAuthorizationPreview(url);
//         break;
//       case 'front':
//         setFrontPhoto(file);
//         setFrontPreview(url);
//         break;
//       case 'interior':
//         setInteriorPhoto(file);
//         setInteriorPreview(url);
//         break;
//       case 'left':
//         setLeftSidePhoto(file);
//         setLeftSidePreview(url);
//         break;
//       case 'right':
//         setRightSidePhoto(file);
//         setRightSidePreview(url);
//         break;
//       case 'insurance':
//         setInsuranceDocument(file);
//         setInsurancePreview(url);
//         break;
//       case 'pollution':
//         setPollutionDocument(file);
//         setPollutionPreview(url);
//         break;
//       case 'aadhaar':
//         setOwnerAadhaarCard(file);
//         setAadhaarPreview(url);
//         break;
//     }
//   };

//   const showToast = (message: string, type: 'success' | 'error') => {
//     setToastType(type);
//     setToastMsg(message);
//   };

//   const removeFile = (type: string) => {
//     switch(type) {
//       case 'rear':
//         setRearPhoto(null);
//         setRearPreview(null);
//         break;
//       case 'rc':
//         setRcFile(null);
//         setRcPreview(null);
//         break;
//       case 'authorization':
//         setAuthorizationFile(null);
//         setAuthorizationPreview(null);
//         break;
//       case 'front':
//         setFrontPhoto(null);
//         setFrontPreview(null);
//         break;
//       case 'interior':
//         setInteriorPhoto(null);
//         setInteriorPreview(null);
//         break;
//       case 'left':
//         setLeftSidePhoto(null);
//         setLeftSidePreview(null);
//         break;
//       case 'right':
//         setRightSidePhoto(null);
//         setRightSidePreview(null);
//         break;
//       case 'insurance':
//         setInsuranceDocument(null);
//         setInsurancePreview(null);
//         break;
//       case 'pollution':
//         setPollutionDocument(null);
//         setPollutionPreview(null);
//         break;
//       case 'aadhaar':
//         setOwnerAadhaarCard(null);
//         setAadhaarPreview(null);
//         break;
//     }
//   };

//   const handleRegisterAndSubmit = async () => {
//     console.log("🚀 Register button clicked!");
//     setServerError(null);

//     if (!token) {
//       console.log("❌ No token found");
//       setServerError("Session expired. Please login again.");
//       showToast("Session expired. Please login again.", 'error');
//       return;
//     }

//     console.log("✅ Token found:", token);

//     // Basic validations
//     if (!vehicle.hasAc) {
//       console.log("❌ Vehicle type not selected");
//       setServerError("Please select vehicle type.");
//       showToast("Please select vehicle type.", 'error');
//       return;
//     }

//     if (!vehicle.vehicle_name) {
//       console.log("❌ Vehicle name not entered");
//       setServerError("Please enter vehicle name.");
//       showToast("Please enter vehicle name.", 'error');
//       return;
//     }

//     if (!vehicle.registration_number) {
//       console.log("❌ Registration number not entered");
//       setServerError("Please enter registration number.");
//       showToast("Please enter registration number.", 'error');
//       return;
//     }

//     if (!vehicle.vehicle_model) {
//       console.log("❌ Vehicle model not entered");
//       setServerError("Please enter vehicle model.");
//       showToast("Please enter vehicle model.", 'error');
//       return;
//     }

//     if (vehicle.seat_count <= 0) {
//       console.log("❌ Invalid seat count");
//       setServerError("Seat count must be greater than 0.");
//       showToast("Seat count must be greater than 0.", 'error');
//       return;
//     }

//     if (!vehicle.registration_valid_till) {
//       console.log("❌ Registration valid till date not selected");
//       setServerError("Registration valid till date is required.");
//       showToast("Please select registration valid till date.", 'error');
//       return;
//     }

//     if (!vehicle.ownership_type) {
//       console.log("❌ Ownership type not selected");
//       setServerError("Please select ownership type.");
//       showToast("Please select ownership type.", 'error');
//       return;
//     }

//     if (!isValidRCNumber(vehicle.registration_number)) {
//       console.log("❌ Invalid RC number format");
//       setServerError("Invalid registration number format.");
//       showToast("Invalid registration number format.", 'error');
//       return;
//     }

//     // RFID Reservation Validation - Only if enabled by API
//     if (rfidConfig?.allow_seat_reservation && vehicle.enable_rfid_reservation) {
//       if (vehicle.default_rfid_reserved_seat_count <= 0) {
//         console.log("❌ Invalid RFID reserved seat count");
//         setServerError("Please set RFID reserved seat count (minimum 1).");
//         showToast("Please set RFID reserved seat count.", 'error');
//         return;
//       }
//       if (vehicle.default_rfid_reserved_seat_count > vehicle.seat_count) {
//         console.log("❌ RFID reserved seats exceed total seats");
//         setServerError("RFID reserved seats cannot exceed total seat count.");
//         showToast("RFID reserved seats cannot exceed total seats.", 'error');
//         return;
//       }
//     }

//     if (!rcFile) {
//       console.log("❌ RC document not uploaded");
//       setServerError("RC document is required.");
//       showToast("Please upload RC document.", 'error');
//       return;
//     }

//     if (!rearPhoto) {
//       console.log("❌ Rear photo not uploaded");
//       setServerError("Rear photo is required.");
//       showToast("Please upload rear photo.", 'error');
//       return;
//     }

//     // Rented vehicle validations
//     if (vehicle.ownership_type === 'rented') {
//       if (!ownerName) {
//         console.log("❌ Owner name not entered for rented vehicle");
//         setServerError("Owner name is required for rented vehicle.");
//         showToast("Please enter owner name.", 'error');
//         return;
//       }
//       if (!ownerAadhaarCard) {
//         console.log("❌ Owner Aadhaar not uploaded for rented vehicle");
//         setServerError("Owner Aadhaar card is required for rented vehicle.");
//         showToast("Please upload owner's Aadhaar card.", 'error');
//         return;
//       }
//       if (!authorizationFile) {
//         console.log("❌ Authorization document not uploaded for rented vehicle");
//         setServerError("Authorization document is required for rented vehicle.");
//         showToast("Please upload authorization document.", 'error');
//         return;
//       }
//     }

//     // Self-owned vehicle validation
//     if (vehicle.ownership_type === 'self' && authorizationFile) {
//       console.log("❌ Authorization file uploaded for self-owned vehicle");
//       setServerError("Authorization document should not be uploaded for self-owned vehicle.");
//       showToast("Authorization document not allowed for self-owned vehicle.", 'error');
//       return;
//     }

//     console.log("✅ All validations passed!");
//     setLoading(true);

//     try {
//       // Step 1: Register Vehicle with all documents
//       const formData = new FormData();
//       formData.append("has_ac", vehicle.hasAc);
//       formData.append("seat_count", String(vehicle.seat_count));
//       formData.append("color", vehicle.color || '');
//       formData.append("vehicle_model", vehicle.vehicle_model);
//       formData.append("vehicle_name", vehicle.vehicle_name);
//       formData.append("registration_number", vehicle.registration_number.toUpperCase());
//       formData.append("registration_valid_till", vehicle.registration_valid_till);
//       formData.append("ownership_type", vehicle.ownership_type);
      
//       // Only send RFID data if API allows it
//       if (rfidConfig?.allow_seat_reservation) {
//         formData.append("enable_rfid_reservation", String(vehicle.enable_rfid_reservation));
//         if (vehicle.enable_rfid_reservation) {
//           formData.append("default_rfid_reserved_seat_count", String(vehicle.default_rfid_reserved_seat_count));
//         }
//       } else {
//         formData.append("enable_rfid_reservation", "false");
//         formData.append("default_rfid_reserved_seat_count", "0");
//       }
      
//       if (ownerName) formData.append("owner_name", ownerName);
      
//       // Required files
//       formData.append("rear_photo", rearPhoto);
//       formData.append("rc_file", rcFile);
      
//       // Optional vehicle photos
//       if (frontPhoto) formData.append("front_photo", frontPhoto);
//       if (interiorPhoto) formData.append("interior_photo", interiorPhoto);
//       if (leftSidePhoto) formData.append("left_side_photo", leftSidePhoto);
//       if (rightSidePhoto) formData.append("right_side_photo", rightSidePhoto);
      
//       // Documents
//       if (authorizationFile && vehicle.ownership_type === 'rented') {
//         formData.append("authentication_file", authorizationFile);
//       }
//       if (insuranceDocument) formData.append("insurance_document", insuranceDocument);
//       if (pollutionDocument) formData.append("pollution_document", pollutionDocument);
//       if (ownerAadhaarCard && vehicle.ownership_type === 'rented') {
//         formData.append("owner_aadhaar_card", ownerAadhaarCard);
//       }

//       console.log("📝 Calling Register API: /driver/vehicle/register");
      
//       const registerRes = await fetch(`${API_BASE}/driver/vehicle/register`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });

//       const registerData = await registerRes.json();

//       if (!registerRes.ok) {
//         console.error("❌ Register API failed:", registerData);
//         setServerError(registerData.detail || "Vehicle registration failed.");
//         showToast(registerData.detail || "Vehicle registration failed.", 'error');
//         setLoading(false);
//         return;
//       }

//       console.log("✅ Register API success:", registerData);
//       showToast("Vehicle registered successfully! Submitting for approval...", 'success');

//       // Step 2: Submit Vehicle for approval
//       console.log("📝 Calling Submit API: /driver/vehicle/submit");
      
//       const submitRes = await fetch(`${API_BASE}/driver/vehicle/submit`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ registration_number: vehicle.registration_number.toUpperCase() }),
//       });

//       const submitData = await submitRes.json();

//       if (submitRes.ok) {
//         console.log("✅ Submit API success:", submitData);
//         showToast("Vehicle submitted for approval successfully! Redirecting...", 'success');
//         setTimeout(() => history.push("/bus-and-trip-management"), 1500);
//       } else {
//         console.error("❌ Submit API failed:", submitData);
//         setServerError(submitData.detail || "Vehicle submission failed.");
//         showToast(submitData.detail || "Vehicle submission failed.", 'error');
//       }
//     } catch (err) {
//       console.error("❌ Network Error:", err);
//       setServerError("Network error. Please check your connection and try again.");
//       showToast("Network error. Please check your connection and try again.", 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isFormValid = () => {
//     const baseValid = 
//       vehicle.hasAc &&
//       vehicle.vehicle_name &&
//       vehicle.registration_number &&
//       vehicle.vehicle_model &&
//       vehicle.seat_count > 0 &&
//       vehicle.registration_valid_till &&
//       vehicle.ownership_type &&
//       isRcValid &&
//       rcFile &&
//       rearPhoto;
    
//     // RFID validation - only if API allows it
//     let rfidValid = true;
//     if (rfidConfig?.allow_seat_reservation && vehicle.enable_rfid_reservation) {
//       rfidValid = vehicle.default_rfid_reserved_seat_count > 0 && 
//                   vehicle.default_rfid_reserved_seat_count <= vehicle.seat_count;
//     }
    
//     if (vehicle.ownership_type === 'rented') {
//       return baseValid && rfidValid && ownerName && ownerAadhaarCard && authorizationFile;
//     }
    
//     return baseValid && rfidValid;
//   };

//   // Check if RFID feature is available
//   const isRfidAvailable = rfidConfig?.allow_seat_reservation === true;

//   return (
//     <IonPage className="bg-white dark:bg-black">
//       <NavbarSidebar />
      
//       <IonContent className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
//         <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
          
//           {/* Header Section */}
//           <div className="text-center mb-8 animate-fadeInUp">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-blue-600 text-sm font-medium mb-4">
//               <TruckIcon className="w-4 h-4" />
//               <span>Vehicle Registration</span>
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-800 to-gray-800 dark:from-white dark:to-gray-600 bg-clip-text text-transparent mb-3">
//               Register Your Vehicle
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
//               Add your bus details and documents to register your vehicle for shuttle services
//             </p>
//           </div>

//           {/* Main Form Card */}
//           <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-fadeInUp animation-delay-200">
            
//             {/* Form Header */}
//             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-black dark:bg-white rounded-xl">
//                   <PencilIcon className="w-5 h-5 text-white dark:text-black" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                     Vehicle Information
//                   </h2>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Fill in all the required details below
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Form Body */}
//             <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
//               {/* Loading RFID Config */}
//               {loadingRfidConfig && (
//                 <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-pulse">
//                   <div className="flex items-center gap-3">
//                     <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//                     <p className="text-sm text-blue-700 dark:text-blue-300">Loading RFID configuration...</p>
//                   </div>
//                 </div>
//               )}

//               {/* RFID Unavailable Banner */}
//               {!loadingRfidConfig && rfidConfig && !rfidConfig.allow_seat_reservation && (
//                 <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                   <div className="flex items-center gap-3">
//                     <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg">
//                       <XCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
//                         RFID Seat Reservation Currently Unavailable
//                       </p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                         {rfidConfig.message || "This feature is not available at the moment. You can still register your vehicle without RFID reservation."}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Registration Number */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Registration Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="text"
//                     name="registration_number"
//                     value={vehicle.registration_number}
//                     onChange={handleChange}
//                     placeholder="e.g., WB01AB1234"
//                     className={`w-full px-4 py-3 pl-10 rounded-xl border-2 transition-all duration-200
//                              bg-white dark:bg-gray-800 
//                              text-gray-900 dark:text-white uppercase
//                              placeholder:text-gray-400 dark:placeholder:text-gray-500
//                              focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              ${rcValidationError 
//                                ? 'border-red-500 focus:border-red-500' 
//                                : isRcValid && vehicle.registration_number
//                                  ? 'border-green-500 focus:border-green-500'
//                                  : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white'}`}
//                   />
//                 </div>
//                 {rcValidationError && (
//                   <div className="flex items-start gap-2 mt-1">
//                     <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5" />
//                     <p className="text-sm text-red-600 dark:text-red-400">{rcValidationError}</p>
//                   </div>
//                 )}
//               </div>

//               {/* Two Column Layout */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* Vehicle Type */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Vehicle Type <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     name="hasAc"
//                     value={vehicle.hasAc}
//                     onChange={handleChange}
//                     className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-800 
//                              text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200 cursor-pointer"
//                   >
//                     <option value="" disabled>Select type</option>
//                     <option value="true">❄️ AC Bus</option>
//                     <option value="false">☀️ Non-AC Bus</option>
//                   </select>
//                 </div>

//                 {/* Seat Count with Stepper */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Seat Count <span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex items-center gap-3">
//                     <button
//                       type="button"
//                       onClick={() => handleSeatCountChange(false)}
//                       className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700
//                                transition-all duration-200 flex items-center justify-center
//                                disabled:opacity-50 disabled:cursor-not-allowed"
//                       disabled={vehicle.seat_count <= 0}
//                     >
//                       <MinusIcon className="w-5 h-5" />
//                     </button>
                    
//                     <div className="flex-1 relative">
//                       <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                       <input
//                         type="number"
//                         name="seat_count"
//                         value={vehicle.seat_count}
//                         onChange={handleChange}
//                         min="0"
//                         className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                  bg-white dark:bg-gray-800 
//                                  text-gray-900 dark:text-white text-center text-lg font-semibold
//                                  focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                                  transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                       />
//                     </div>
                    
//                     <button
//                       type="button"
//                       onClick={() => handleSeatCountChange(true)}
//                       className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700
//                                transition-all duration-200 flex items-center justify-center"
//                     >
//                       <PlusIcon className="w-5 h-5" />
//                     </button>
//                   </div>
//                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                     Total number of seats including driver seat
//                   </p>
//                 </div>
//               </div>

//               {/* RFID Seat Reservation Section - Only show if API allows it */}
//               {isRfidAvailable && (
//                 <div className="space-y-4">
//                   <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                     <div className="flex items-center justify-between mb-4">
//                       <div className="flex items-center gap-2">
//                         <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//                         <h3 className="text-md font-semibold text-gray-900 dark:text-white">
//                           RFID Seat Reservation
//                         </h3>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => setShowRfidInfo(!showRfidInfo)}
//                         className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
//                       >
//                         <InformationCircleIcon className="w-5 h-5" />
//                       </button>
//                     </div>
                    
//                     {showRfidInfo && (
//                       <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-fadeIn">
//                         <p className="text-xs text-blue-700 dark:text-blue-300">
//                           Enable RFID seat reservation to automatically reserve a specific number of seats for RFID card holders. 
//                           These seats will be pre-reserved for passengers with RFID cards on each trip.
//                         </p>
//                       </div>
//                     )}
                    
//                     <div className="flex items-center justify-between p-4 rounded-xl bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
//                           <CpuChipIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-semibold text-gray-900 dark:text-white">
//                             Enable RFID Seat Reservation
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">
//                             Reserve seats for RFID card holders
//                           </p>
//                         </div>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => setVehicle({ 
//                           ...vehicle, 
//                           enable_rfid_reservation: !vehicle.enable_rfid_reservation,
//                           default_rfid_reserved_seat_count: !vehicle.enable_rfid_reservation ? Math.floor(vehicle.seat_count / 4) : 0
//                         })}
//                         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
//                           ${vehicle.enable_rfid_reservation ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
//                       >
//                         <span
//                           className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
//                             ${vehicle.enable_rfid_reservation ? 'translate-x-6' : 'translate-x-1'}`}
//                         />
//                       </button>
//                     </div>
//                   </div>

//                   {vehicle.enable_rfid_reservation && (
//                     <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 animate-fadeInUp">
//                       <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
//                         <div className="flex items-center gap-2">
//                           <ShieldCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//                           <span>Default RFID Reserved Seats</span>
//                           <span className="text-red-500">*</span>
//                         </div>
//                       </label>
                      
//                       <div className="flex items-center gap-3">
//                         <button
//                           type="button"
//                           onClick={() => handleRfidSeatCountChange(false)}
//                           className="w-12 h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 
//                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                    hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20
//                                    transition-all duration-200 flex items-center justify-center
//                                    disabled:opacity-50 disabled:cursor-not-allowed"
//                           disabled={vehicle.default_rfid_reserved_seat_count <= 0}
//                         >
//                           <MinusIcon className="w-5 h-5" />
//                         </button>
                        
//                         <div className="flex-1 relative">
//                           <ShieldCheckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
//                           <input
//                             type="number"
//                             name="default_rfid_reserved_seat_count"
//                             value={vehicle.default_rfid_reserved_seat_count}
//                             onChange={handleChange}
//                             min="0"
//                             max={vehicle.seat_count}
//                             className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-purple-200 dark:border-purple-700 
//                                      bg-white dark:bg-gray-800 
//                                      text-gray-900 dark:text-white text-center text-lg font-semibold
//                                      focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20
//                                      transition-all duration-200 [appearance:textfield]"
//                           />
//                         </div>
                        
//                         <button
//                           type="button"
//                           onClick={() => handleRfidSeatCountChange(true)}
//                           className="w-12 h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 
//                                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                    hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20
//                                    transition-all duration-200 flex items-center justify-center"
//                         >
//                           <PlusIcon className="w-5 h-5" />
//                         </button>
//                       </div>
                      
//                       <div className="mt-3 grid grid-cols-2 gap-3">
//                         <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
//                           <p className="text-xs text-gray-500 dark:text-gray-400">Total Seats</p>
//                           <p className="text-lg font-bold text-gray-900 dark:text-white">{vehicle.seat_count}</p>
//                         </div>
//                         <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
//                           <p className="text-xs text-purple-600 dark:text-purple-400">RFID Reserved</p>
//                           <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{vehicle.default_rfid_reserved_seat_count}</p>
//                         </div>
//                       </div>
                      
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
//                         These seats will be automatically reserved for RFID card holders on every trip
//                       </p>
                      
//                       {vehicle.default_rfid_reserved_seat_count > vehicle.seat_count && (
//                         <p className="text-xs text-red-500 mt-2">
//                           ⚠️ RFID reserved seats cannot exceed total seat count
//                         </p>
//                       )}
                      
//                       {vehicle.default_rfid_reserved_seat_count > 0 && vehicle.default_rfid_reserved_seat_count <= vehicle.seat_count && (
//                         <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
//                           <p className="text-xs text-green-700 dark:text-green-300">
//                             ✓ {vehicle.default_rfid_reserved_seat_count} seat(s) will be reserved for RFID card holders on each trip
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* Vehicle Name & Model */}
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Vehicle Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       type="text"
//                       name="vehicle_name"
//                       value={vehicle.vehicle_name}
//                       onChange={handleChange}
//                       placeholder="e.g., City Shuttle"
//                       className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-800 
//                                text-gray-900 dark:text-white
//                                placeholder:text-gray-400 dark:placeholder:text-gray-500
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                                transition-all duration-200"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Vehicle Model <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="vehicle_model"
//                     value={vehicle.vehicle_model}
//                     onChange={handleChange}
//                     placeholder="e.g., 2024, BharatBenz"
//                     className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-800 
//                              text-gray-900 dark:text-white
//                              placeholder:text-gray-400 dark:placeholder:text-gray-500
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200"
//                   />
//                 </div>
//               </div>

//               {/* Color */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Vehicle Color <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex gap-3 items-center">
//                   <input
//                     type="text"
//                     name="color"
//                     value={vehicle.color}
//                     onChange={handleChange}
//                     placeholder="e.g., White, Red, Blue"
//                     className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-800 
//                              text-gray-900 dark:text-white
//                              placeholder:text-gray-400 dark:placeholder:text-gray-500
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200"
//                   />
//                   {vehicle.color && (
//                     <div 
//                       className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-inner"
//                       style={{ backgroundColor: vehicle.color.toLowerCase() }}
//                     />
//                   )}
//                 </div>
//               </div>

//               {/* Registration Valid Till Date */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Registration Valid Till <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="date"
//                     name="registration_valid_till"
//                     value={vehicle.registration_valid_till}
//                     onChange={handleChange}
//                     min={new Date().toISOString().split('T')[0]}
//                     className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-800 
//                              text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
//                              transition-all duration-200"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                   Select the date when your vehicle registration expires
//                 </p>
//               </div>

//               {/* Ownership Type Selection */}
//               <div className="space-y-3 pt-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Ownership Type <span className="text-red-500">*</span>
//                 </label>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <button
//                     type="button"
//                     onClick={() => setVehicle({ ...vehicle, ownership_type: 'self' })}
//                     className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
//                       ${vehicle.ownership_type === 'self' 
//                         ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-[1.02] ring-2 ring-green-500/20' 
//                         : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
//                       }`}
//                     style={{ minHeight: '120px' }}
//                   >
//                     <div className="flex items-start gap-3">
//                       <div className={`p-2.5 rounded-lg transition-all duration-200
//                         ${vehicle.ownership_type === 'self' 
//                           ? 'bg-green-500 dark:bg-green-600' 
//                           : 'bg-gray-100 dark:bg-gray-800'
//                         }`}>
//                         <HomeIcon className={`w-5 h-5 transition-all duration-200
//                           ${vehicle.ownership_type === 'self' 
//                             ? 'text-white' 
//                             : 'text-gray-600 dark:text-gray-400'
//                           }`} />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className={`font-semibold transition-all duration-200 text-base
//                           ${vehicle.ownership_type === 'self' 
//                             ? 'text-green-700 dark:text-green-400' 
//                             : 'text-gray-700 dark:text-gray-300'
//                           }`}>
//                           Self-Owned
//                         </h3>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                           Vehicle is personally owned by you. No additional authorization document required.
//                         </p>
//                       </div>
//                       {vehicle.ownership_type === 'self' && (
//                         <div className="bg-green-500 rounded-full p-1">
//                           <CheckCircleIcon className="w-5 h-5 text-white" />
//                         </div>
//                       )}
//                     </div>
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => setVehicle({ ...vehicle, ownership_type: 'rented' })}
//                     className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
//                       ${vehicle.ownership_type === 'rented' 
//                         ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-[1.02] ring-2 ring-green-500/20' 
//                         : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
//                       }`}
//                     style={{ minHeight: '120px' }}
//                   >
//                     <div className="flex items-start gap-3">
//                       <div className={`p-2.5 rounded-lg transition-all duration-200
//                         ${vehicle.ownership_type === 'rented' 
//                           ? 'bg-green-500 dark:bg-green-600' 
//                           : 'bg-gray-100 dark:bg-gray-800'
//                         }`}>
//                         <KeyIcon className={`w-5 h-5 transition-all duration-200
//                           ${vehicle.ownership_type === 'rented' 
//                             ? 'text-white' 
//                             : 'text-gray-600 dark:text-gray-400'
//                           }`} />
//                       </div>
//                       <div className="flex-1">
//                         <h3 className={`font-semibold transition-all duration-200 text-base
//                           ${vehicle.ownership_type === 'rented' 
//                             ? 'text-green-700 dark:text-green-400' 
//                             : 'text-gray-700 dark:text-gray-300'
//                           }`}>
//                           Rented/Leased
//                         </h3>
//                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                           Vehicle is rented or leased. Authorization document from owner is required.
//                         </p>
//                       </div>
//                       {vehicle.ownership_type === 'rented' && (
//                         <div className="bg-green-500 rounded-full p-1">
//                           <CheckCircleIcon className="w-5 h-5 text-white" />
//                         </div>
//                       )}
//                     </div>
//                   </button>
//                 </div>
//               </div>

//               {/* Rented Vehicle Additional Fields */}
//               {vehicle.ownership_type === 'rented' && (
//                 <div className="space-y-4 animate-fadeInUp">
//                   <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                     <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                       Owner Information <span className="text-red-500">*</span>
//                     </h3>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       Owner Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={ownerName}
//                       onChange={(e) => setOwnerName(e.target.value)}
//                       placeholder="Enter vehicle owner's full name"
//                       className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-800 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
//                                transition-all duration-200"
//                       style={{ height: '48px' }}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       Owner Aadhaar Card <span className="text-red-500">*</span>
//                     </label>
//                     {aadhaarPreview && (
//                       <div className="mb-2 relative inline-block">
//                         {aadhaarPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img src={aadhaarPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         ) : (
//                           <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                             <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                           </div>
//                         )}
//                         <button
//                           onClick={() => removeFile('aadhaar')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                       style={{ height: '44px', minWidth: '160px' }}
//                     >
//                       <CloudArrowUpIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Aadhaar Card</span>
//                       <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className="hidden" />
//                     </label>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upload owner's Aadhaar card (JPG, PNG, PDF - Max 5MB)</p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                       Authorization Document <span className="text-red-500">*</span>
//                     </label>
//                     {authorizationPreview && (
//                       <div className="mb-2 relative inline-block">
//                         {authorizationPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                           <img src={authorizationPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         ) : (
//                           <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                             <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                           </div>
//                         )}
//                         <button
//                           onClick={() => removeFile('authorization')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                       style={{ height: '44px', minWidth: '180px' }}
//                     >
//                       <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Authorization Letter</span>
//                       <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'authorization')} className="hidden" />
//                     </label>
//                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upload rental agreement or authorization letter (JPG, PNG, PDF - Max 5MB)</p>
//                   </div>
//                 </div>
//               )}

//               {/* Vehicle Photos Section */}
//               <div className="space-y-4">
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                   <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                     Vehicle Photos <span className="text-red-500">*</span>
//                   </h3>
//                 </div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Front Photo
//                     </label>
//                     {frontPreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={frontPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('front')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Front Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="hidden" />
//                     </label>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Interior Photo
//                     </label>
//                     {interiorPreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={interiorPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('interior')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Interior Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'interior')} className="hidden" />
//                     </label>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Left Side Photo
//                     </label>
//                     {leftSidePreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={leftSidePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('left')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Left Side Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'left')} className="hidden" />
//                     </label>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                       <CameraIcon className="inline w-4 h-4 mr-2" />
//                       Right Side Photo
//                     </label>
//                     {rightSidePreview && (
//                       <div className="mb-2 relative inline-block">
//                         <img src={rightSidePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                         <button
//                           onClick={() => removeFile('right')}
//                           className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                           style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                         >
//                           <XMarkIcon className="w-3 h-3" />
//                         </button>
//                       </div>
//                     )}
//                     <label
//                       className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
//                       style={{ height: '44px' }}
//                     >
//                       <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                       <span className="text-sm text-gray-700 dark:text-gray-200">Upload Right Side Photo</span>
//                       <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'right')} className="hidden" />
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               {/* Required Documents */}
//               <div className="space-y-4">
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                   <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                     Required Documents <span className="text-red-500">*</span>
//                   </h3>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <CameraIcon className="inline w-4 h-4 mr-2" />
//                     Rear Photo <span className="text-red-500">*</span>
//                   </label>
//                   {rearPreview && (
//                     <div className="mb-2 relative inline-block">
//                       <img src={rearPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       <button
//                         onClick={() => removeFile('rear')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '140px' }}
//                   >
//                     <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload Rear Photo</span>
//                     <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'rear')} className="hidden" />
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <DocumentTextIcon className="inline w-4 h-4 mr-2" />
//                     RC Document <span className="text-red-500">*</span>
//                   </label>
//                   {rcPreview && (
//                     <div className="mb-2 relative inline-block">
//                       {rcPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                         <img src={rcPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       ) : (
//                         <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                           <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                         </div>
//                       )}
//                       <button
//                         onClick={() => removeFile('rc')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '140px' }}
//                   >
//                     <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload RC Document</span>
//                     <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'rc')} className="hidden" />
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <DocumentTextIcon className="inline w-4 h-4 mr-2" />
//                     Insurance Document <span className="text-red-500">*</span>
//                   </label>
//                   {insurancePreview && (
//                     <div className="mb-2 relative inline-block">
//                       {insurancePreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                         <img src={insurancePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       ) : (
//                         <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                           <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                         </div>
//                       )}
//                       <button
//                         onClick={() => removeFile('insurance')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '160px' }}
//                   >
//                     <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload Insurance</span>
//                     <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'insurance')} className="hidden" />
//                   </label>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     <DocumentTextIcon className="inline w-4 h-4 mr-2" />
//                     Pollution Certificate (Optional)
//                   </label>
//                   {pollutionPreview && (
//                     <div className="mb-2 relative inline-block">
//                       {pollutionPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                         <img src={pollutionPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
//                       ) : (
//                         <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
//                           <DocumentTextIcon className="w-8 h-8 text-gray-400" />
//                         </div>
//                       )}
//                       <button
//                         onClick={() => removeFile('pollution')}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
//                         style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                       >
//                         <XMarkIcon className="w-3 h-3" />
//                       </button>
//                     </div>
//                   )}
//                   <label
//                     className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
//                     style={{ height: '44px', minWidth: '170px' }}
//                   >
//                     <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
//                     <span className="text-sm text-gray-700 dark:text-gray-200">Upload Pollution Certificate</span>
//                     <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'pollution')} className="hidden" />
//                   </label>
//                 </div>
//               </div>

//               {/* Required Fields Note */}
//               <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-2">
//                 <span className="text-red-500">*</span>
//                 <span>Required fields</span>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-4 pt-6">
//                 <button
//                   onClick={handleRegisterAndSubmit}
//                   disabled={!isFormValid() || loading}
//                   onMouseEnter={() => setIsHovered(true)}
//                   onMouseLeave={() => setIsHovered(false)}
//                   style={{
//                     height: '56px',
//                     width: '100%',
//                     borderRadius: '14px',
//                     background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
//                     color: '#ffffff',
//                     fontWeight: 600,
//                     fontSize: '16px',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '12px',
//                     transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//                     boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
//                     cursor: (!isFormValid() || loading) ? 'not-allowed' : 'pointer',
//                     border: 'none',
//                     opacity: (!isFormValid() || loading) ? 0.6 : 1,
//                     transform: isHovered && isFormValid() && !loading ? 'translateY(-2px)' : 'translateY(0)'
//                   }}
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       <span>Registering Vehicle...</span>
//                     </>
//                   ) : (
//                     <>
//                       <TruckIcon className="w-5 h-5" />
//                       <span>Register Vehicle</span>
//                       <ArrowRightIcon className="w-4 h-4" style={{ transition: 'transform 0.3s ease', transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }} />
//                     </>
//                   )}
//                 </button>
                
//                 <button
//                   onClick={() => history.push("/bus-and-trip-management")}
//                   className="flex-1 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-700
//                            text-gray-700 dark:text-gray-300 font-semibold
//                            hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-800
//                            transform hover:scale-[1.02] active:scale-98
//                            transition-all duration-200"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </IonContent>

//       <IonLoading isOpen={loading} message="Registering vehicle..." />
      
//       <IonToast
//         isOpen={!!toastMsg}
//         message={toastMsg}
//         duration={3000}
//         onDidDismiss={() => setToastMsg("")}
//         color={toastType === 'success' ? 'success' : 'danger'}
//         position="top"
//       />

//       <style>{`
//         @keyframes fadeInUp {
//           from {
//             opacity: 0;
//             transform: translateY(30px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }
        
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
        
//         .animate-fadeInUp {
//           animation: fadeInUp 0.6s ease-out forwards;
//           opacity: 0;
//         }
        
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out forwards;
//         }
        
//         .animation-delay-200 {
//           animation-delay: 0.2s;
//         }
        
//         .active\\:scale-98:active {
//           transform: scale(0.98);
//         }
        
//         @keyframes spin {
//           to {
//             transform: rotate(360deg);
//           }
//         }
        
//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }
        
//         /* Hide number input spinners */
//         input[type="number"]::-webkit-outer-spin-button,
//         input[type="number"]::-webkit-inner-spin-button {
//           -webkit-appearance: none;
//           margin: 0;
//         }
        
//         input[type="number"] {
//           -moz-appearance: textfield;
//         }
        
//         /* Custom scrollbar */
//         ::-webkit-scrollbar {
//           width: 8px;
//           height: 8px;
//         }
        
//         ::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb {
//           background: #888;
//           border-radius: 10px;
//         }
        
//         ::-webkit-scrollbar-thumb:hover {
//           background: #555;
//         }
        
//         .dark ::-webkit-scrollbar-track {
//           background: #1f2937;
//         }
        
//         .dark ::-webkit-scrollbar-thumb {
//           background: #4b5563;
//         }
        
//         .dark ::-webkit-scrollbar-thumb:hover {
//           background: #6b7280;
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default VehicleRegistration;

import React, { useState, ChangeEvent, useEffect } from 'react';
import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
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
  PlusIcon,
  CalendarIcon,
  HomeIcon,
  KeyIcon,
  ArrowRightIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  InformationCircleIcon,
  XCircleIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

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

// RC Number Validation Function
const isValidRCNumber = (value: string): boolean => {
  if (!value || typeof value !== 'string') return false;
  
  const raw = value.trim().toUpperCase();
  if (!raw) return false;
  
  const normalized = raw.replace(/[\s-]/g, '');
  const standardPattern = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/;
  const bhPattern = /^\d{2}BH\d{4}[A-HJ-NP-Z]{1,2}$/;
  
  return standardPattern.test(normalized) || bhPattern.test(normalized);
};

interface RfidConfig {
  allow_driver_rfid_seat_reservation: boolean;  // Fixed field name
  message?: string;
}

const VehicleRegistration: React.FC = () => {
  const history = useHistory();
  const [token, setToken] = useState<string | null>(null);

  const [vehicle, setVehicle] = useState({
    hasAc: '',
    seat_count: 0,
    color: '',
    vehicle_model: '',
    vehicle_name: '',
    registration_number: '',
    registration_valid_till: '',
    ownership_type: '',
    default_rfid_reserved_seat_count: 0,
    enable_rfid_reservation: false,
  });

  // RFID Configuration from API
  const [rfidConfig, setRfidConfig] = useState<RfidConfig | null>(null);
  const [loadingRfidConfig, setLoadingRfidConfig] = useState(false);
  const [rfidConfigError, setRfidConfigError] = useState<string | null>(null);

  // Owner details for rented vehicles
  const [ownerName, setOwnerName] = useState<string>('');
  
  // File states
  const [rearPhoto, setRearPhoto] = useState<File | null>(null);
  const [rcFile, setRcFile] = useState<File | null>(null);
  const [authorizationFile, setAuthorizationFile] = useState<File | null>(null);
  const [frontPhoto, setFrontPhoto] = useState<File | null>(null);
  const [interiorPhoto, setInteriorPhoto] = useState<File | null>(null);
  const [leftSidePhoto, setLeftSidePhoto] = useState<File | null>(null);
  const [rightSidePhoto, setRightSidePhoto] = useState<File | null>(null);
  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
  const [pollutionDocument, setPollutionDocument] = useState<File | null>(null);
  const [ownerAadhaarCard, setOwnerAadhaarCard] = useState<File | null>(null);
  
  // Preview states
  const [rearPreview, setRearPreview] = useState<string | null>(null);
  const [rcPreview, setRcPreview] = useState<string | null>(null);
  const [authorizationPreview, setAuthorizationPreview] = useState<string | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [interiorPreview, setInteriorPreview] = useState<string | null>(null);
  const [leftSidePreview, setLeftSidePreview] = useState<string | null>(null);
  const [rightSidePreview, setRightSidePreview] = useState<string | null>(null);
  const [insurancePreview, setInsurancePreview] = useState<string | null>(null);
  const [pollutionPreview, setPollutionPreview] = useState<string | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [serverError, setServerError] = useState<string | null>(null);
  const [rcValidationError, setRcValidationError] = useState<string>('');
  const [isRcValid, setIsRcValid] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showRfidInfo, setShowRfidInfo] = useState(false);

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
      if (!accessToken) {
        setServerError("Session expired. Please login again.");
        showToast("Session expired. Please login again.", 'error');
      } else {
        // Fetch RFID configuration after token is loaded
        fetchRfidConfig(accessToken);
      }
    };
    loadToken();
  }, []);

  // Fetch RFID Configuration from API
  const fetchRfidConfig = async (accessToken: string) => {
    setLoadingRfidConfig(true);
    setRfidConfigError(null);
    
    try {
      console.log("📡 Fetching RFID configuration...");
      const response = await fetch(`${API_BASE}/driver/rfid/allow-seat-reservation`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RFID config: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("✅ RFID Configuration received:", data);
      
      // Fixed: Use the correct field name from API
      setRfidConfig({
        allow_driver_rfid_seat_reservation: data.allow_driver_rfid_seat_reservation || false,
        message: data.message
      });
      
      // If RFID reservation is NOT allowed, disable it in the form
      if (!data.allow_driver_rfid_seat_reservation) {
        setVehicle(prev => ({
          ...prev,
          enable_rfid_reservation: false,
          default_rfid_reserved_seat_count: 0
        }));
      }
      
    } catch (error) {
      console.error("❌ Error fetching RFID config:", error);
      setRfidConfigError(error instanceof Error ? error.message : "Failed to load RFID configuration");
      // Default to not allowing RFID reservation if API fails
      setRfidConfig({ allow_driver_rfid_seat_reservation: false, message: "RFID feature unavailable" });
    } finally {
      setLoadingRfidConfig(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'registration_number') {
      const formattedValue = value.toUpperCase();
      setVehicle({ ...vehicle, registration_number: formattedValue });
      
      if (formattedValue && formattedValue.trim()) {
        const isValid = isValidRCNumber(formattedValue);
        if (!isValid) {
          setRcValidationError('Invalid registration number format');
          setIsRcValid(false);
        } else {
          setRcValidationError('');
          setIsRcValid(true);
        }
      } else {
        setRcValidationError('');
        setIsRcValid(false);
      }
    } else if (name === 'hasAc') {
      setVehicle({ ...vehicle, hasAc: value });
    } else {
      setVehicle({ ...vehicle, [name]: name === 'seat_count' || name === 'default_rfid_reserved_seat_count' ? Number(value) : value });
    }
  };

  const handleSeatCountChange = (increment: boolean) => {
    setVehicle(prev => ({
      ...prev,
      seat_count: increment ? prev.seat_count + 1 : Math.max(0, prev.seat_count - 1)
    }));
  };

  const handleRfidSeatCountChange = (increment: boolean) => {
    setVehicle(prev => ({
      ...prev,
      default_rfid_reserved_seat_count: increment 
        ? Math.min(prev.seat_count, prev.default_rfid_reserved_seat_count + 1) 
        : Math.max(0, prev.default_rfid_reserved_seat_count - 1)
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error');
      return;
    }

    const url = URL.createObjectURL(file);

    switch(type) {
      case 'rear':
        setRearPhoto(file);
        setRearPreview(url);
        break;
      case 'rc':
        setRcFile(file);
        setRcPreview(url);
        break;
      case 'authorization':
        setAuthorizationFile(file);
        setAuthorizationPreview(url);
        break;
      case 'front':
        setFrontPhoto(file);
        setFrontPreview(url);
        break;
      case 'interior':
        setInteriorPhoto(file);
        setInteriorPreview(url);
        break;
      case 'left':
        setLeftSidePhoto(file);
        setLeftSidePreview(url);
        break;
      case 'right':
        setRightSidePhoto(file);
        setRightSidePreview(url);
        break;
      case 'insurance':
        setInsuranceDocument(file);
        setInsurancePreview(url);
        break;
      case 'pollution':
        setPollutionDocument(file);
        setPollutionPreview(url);
        break;
      case 'aadhaar':
        setOwnerAadhaarCard(file);
        setAadhaarPreview(url);
        break;
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastType(type);
    setToastMsg(message);
  };

  const removeFile = (type: string) => {
    switch(type) {
      case 'rear':
        setRearPhoto(null);
        setRearPreview(null);
        break;
      case 'rc':
        setRcFile(null);
        setRcPreview(null);
        break;
      case 'authorization':
        setAuthorizationFile(null);
        setAuthorizationPreview(null);
        break;
      case 'front':
        setFrontPhoto(null);
        setFrontPreview(null);
        break;
      case 'interior':
        setInteriorPhoto(null);
        setInteriorPreview(null);
        break;
      case 'left':
        setLeftSidePhoto(null);
        setLeftSidePreview(null);
        break;
      case 'right':
        setRightSidePhoto(null);
        setRightSidePreview(null);
        break;
      case 'insurance':
        setInsuranceDocument(null);
        setInsurancePreview(null);
        break;
      case 'pollution':
        setPollutionDocument(null);
        setPollutionPreview(null);
        break;
      case 'aadhaar':
        setOwnerAadhaarCard(null);
        setAadhaarPreview(null);
        break;
    }
  };

  const handleRegisterAndSubmit = async () => {
    console.log("🚀 Register button clicked!");
    setServerError(null);

    if (!token) {
      console.log("❌ No token found");
      setServerError("Session expired. Please login again.");
      showToast("Session expired. Please login again.", 'error');
      return;
    }

    console.log("✅ Token found:", token);

    // Basic validations
    if (!vehicle.hasAc) {
      console.log("❌ Vehicle type not selected");
      setServerError("Please select vehicle type.");
      showToast("Please select vehicle type.", 'error');
      return;
    }

    if (!vehicle.vehicle_name) {
      console.log("❌ Vehicle name not entered");
      setServerError("Please enter vehicle name.");
      showToast("Please enter vehicle name.", 'error');
      return;
    }

    if (!vehicle.registration_number) {
      console.log("❌ Registration number not entered");
      setServerError("Please enter registration number.");
      showToast("Please enter registration number.", 'error');
      return;
    }

    if (!vehicle.vehicle_model) {
      console.log("❌ Vehicle model not entered");
      setServerError("Please enter vehicle model.");
      showToast("Please enter vehicle model.", 'error');
      return;
    }

    if (vehicle.seat_count <= 0) {
      console.log("❌ Invalid seat count");
      setServerError("Seat count must be greater than 0.");
      showToast("Seat count must be greater than 0.", 'error');
      return;
    }

    if (!vehicle.registration_valid_till) {
      console.log("❌ Registration valid till date not selected");
      setServerError("Registration valid till date is required.");
      showToast("Please select registration valid till date.", 'error');
      return;
    }

    if (!vehicle.ownership_type) {
      console.log("❌ Ownership type not selected");
      setServerError("Please select ownership type.");
      showToast("Please select ownership type.", 'error');
      return;
    }

    if (!isValidRCNumber(vehicle.registration_number)) {
      console.log("❌ Invalid RC number format");
      setServerError("Invalid registration number format.");
      showToast("Invalid registration number format.", 'error');
      return;
    }

    // RFID Reservation Validation - Only if API allows it
    if (rfidConfig?.allow_driver_rfid_seat_reservation && vehicle.enable_rfid_reservation) {
      if (vehicle.default_rfid_reserved_seat_count <= 0) {
        console.log("❌ Invalid RFID reserved seat count");
        setServerError("Please set RFID reserved seat count (minimum 1).");
        showToast("Please set RFID reserved seat count.", 'error');
        return;
      }
      if (vehicle.default_rfid_reserved_seat_count > vehicle.seat_count) {
        console.log("❌ RFID reserved seats exceed total seats");
        setServerError("RFID reserved seats cannot exceed total seat count.");
        showToast("RFID reserved seats cannot exceed total seats.", 'error');
        return;
      }
    }

    if (!rcFile) {
      console.log("❌ RC document not uploaded");
      setServerError("RC document is required.");
      showToast("Please upload RC document.", 'error');
      return;
    }

    if (!rearPhoto) {
      console.log("❌ Rear photo not uploaded");
      setServerError("Rear photo is required.");
      showToast("Please upload rear photo.", 'error');
      return;
    }

    // Rented vehicle validations
    if (vehicle.ownership_type === 'rented') {
      if (!ownerName) {
        console.log("❌ Owner name not entered for rented vehicle");
        setServerError("Owner name is required for rented vehicle.");
        showToast("Please enter owner name.", 'error');
        return;
      }
      if (!ownerAadhaarCard) {
        console.log("❌ Owner Aadhaar not uploaded for rented vehicle");
        setServerError("Owner Aadhaar card is required for rented vehicle.");
        showToast("Please upload owner's Aadhaar card.", 'error');
        return;
      }
      if (!authorizationFile) {
        console.log("❌ Authorization document not uploaded for rented vehicle");
        setServerError("Authorization document is required for rented vehicle.");
        showToast("Please upload authorization document.", 'error');
        return;
      }
    }

    // Self-owned vehicle validation
    if (vehicle.ownership_type === 'self' && authorizationFile) {
      console.log("❌ Authorization file uploaded for self-owned vehicle");
      setServerError("Authorization document should not be uploaded for self-owned vehicle.");
      showToast("Authorization document not allowed for self-owned vehicle.", 'error');
      return;
    }

    console.log("✅ All validations passed!");
    setLoading(true);

    try {
      // Step 1: Register Vehicle with all documents
      const formData = new FormData();
      formData.append("has_ac", vehicle.hasAc);
      formData.append("seat_count", String(vehicle.seat_count));
      formData.append("color", vehicle.color || '');
      formData.append("vehicle_model", vehicle.vehicle_model);
      formData.append("vehicle_name", vehicle.vehicle_name);
      formData.append("registration_number", vehicle.registration_number.toUpperCase());
      formData.append("registration_valid_till", vehicle.registration_valid_till);
      formData.append("ownership_type", vehicle.ownership_type);
      
      // Only send RFID data if API allows it
      if (rfidConfig?.allow_driver_rfid_seat_reservation) {
        formData.append("enable_rfid_reservation", String(vehicle.enable_rfid_reservation));
        if (vehicle.enable_rfid_reservation) {
          formData.append("default_rfid_reserved_seat_count", String(vehicle.default_rfid_reserved_seat_count));
        }
      } else {
        formData.append("enable_rfid_reservation", "false");
        formData.append("default_rfid_reserved_seat_count", "0");
      }
      
      if (ownerName) formData.append("owner_name", ownerName);
      
      // Required files
      formData.append("rear_photo", rearPhoto);
      formData.append("rc_file", rcFile);
      
      // Optional vehicle photos
      if (frontPhoto) formData.append("front_photo", frontPhoto);
      if (interiorPhoto) formData.append("interior_photo", interiorPhoto);
      if (leftSidePhoto) formData.append("left_side_photo", leftSidePhoto);
      if (rightSidePhoto) formData.append("right_side_photo", rightSidePhoto);
      
      // Documents
      if (authorizationFile && vehicle.ownership_type === 'rented') {
        formData.append("authentication_file", authorizationFile);
      }
      if (insuranceDocument) formData.append("insurance_document", insuranceDocument);
      if (pollutionDocument) formData.append("pollution_document", pollutionDocument);
      if (ownerAadhaarCard && vehicle.ownership_type === 'rented') {
        formData.append("owner_aadhaar_card", ownerAadhaarCard);
      }

      console.log("📝 Calling Register API: /driver/vehicle/register");
      
      const registerRes = await fetch(`${API_BASE}/driver/vehicle/register`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        console.error("❌ Register API failed:", registerData);
        setServerError(registerData.detail || "Vehicle registration failed.");
        showToast(registerData.detail || "Vehicle registration failed.", 'error');
        setLoading(false);
        return;
      }

      console.log("✅ Register API success:", registerData);
      showToast("Vehicle registered successfully! Submitting for approval...", 'success');

      // Step 2: Submit Vehicle for approval
      console.log("📝 Calling Submit API: /driver/vehicle/submit");
      
      const submitRes = await fetch(`${API_BASE}/driver/vehicle/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ registration_number: vehicle.registration_number.toUpperCase() }),
      });

      const submitData = await submitRes.json();

      if (submitRes.ok) {
        console.log("✅ Submit API success:", submitData);
        showToast("Vehicle submitted for approval successfully! Redirecting...", 'success');
        setTimeout(() => history.push("/bus-and-trip-management"), 1500);
      } else {
        console.error("❌ Submit API failed:", submitData);
        setServerError(submitData.detail || "Vehicle submission failed.");
        showToast(submitData.detail || "Vehicle submission failed.", 'error');
      }
    } catch (err) {
      console.error("❌ Network Error:", err);
      setServerError("Network error. Please check your connection and try again.");
      showToast("Network error. Please check your connection and try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    const baseValid = 
      vehicle.hasAc &&
      vehicle.vehicle_name &&
      vehicle.registration_number &&
      vehicle.vehicle_model &&
      vehicle.seat_count > 0 &&
      vehicle.registration_valid_till &&
      vehicle.ownership_type &&
      isRcValid &&
      rcFile &&
      rearPhoto;
    
    // RFID validation - only if API allows it
    let rfidValid = true;
    if (rfidConfig?.allow_driver_rfid_seat_reservation && vehicle.enable_rfid_reservation) {
      rfidValid = vehicle.default_rfid_reserved_seat_count > 0 && 
                  vehicle.default_rfid_reserved_seat_count <= vehicle.seat_count;
    }
    
    if (vehicle.ownership_type === 'rented') {
      return baseValid && rfidValid && ownerName && ownerAadhaarCard && authorizationFile;
    }
    
    return baseValid && rfidValid;
  };

  // Check if RFID feature is available
  const isRfidAvailable = rfidConfig?.allow_driver_rfid_seat_reservation === true;

  return (
    <IonPage className="bg-white dark:bg-black">
      <NavbarSidebar />
      
      <IonContent className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8 pt-20">
          
          {/* Header Section */}
          <div className="text-center mb-8 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-blue-600 text-sm font-medium mb-4">
              <TruckIcon className="w-4 h-4" />
              <span>Vehicle Registration</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-800 to-gray-800 dark:from-white dark:to-gray-600 bg-clip-text text-transparent mb-3">
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
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              
              {/* Loading RFID Config */}
              {loadingRfidConfig && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Loading RFID configuration...</p>
                  </div>
                </div>
              )}

              {/* RFID Available Banner - Shows when feature is ENABLED */}
              {!loadingRfidConfig && rfidConfig && rfidConfig.allow_driver_rfid_seat_reservation && (
                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-lg">
                      <CheckBadgeIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                        ✅ RFID Seat Reservation Available
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                        You can enable RFID seat reservation for this vehicle
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* RFID Unavailable Banner - Shows when feature is DISABLED */}
              {!loadingRfidConfig && rfidConfig && !rfidConfig.allow_driver_rfid_seat_reservation && (
                <div className="p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg">
                      <XCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        RFID Seat Reservation Currently Unavailable
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {rfidConfig.message || "This feature is not available at the moment. You can still register your vehicle without RFID reservation."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Registration Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="registration_number"
                    value={vehicle.registration_number}
                    onChange={handleChange}
                    placeholder="e.g., WB01AB1234"
                    className={`w-full px-4 py-3 pl-10 rounded-xl border-2 transition-all duration-200
                             bg-white dark:bg-white-600 
                             text-gray-900 dark:text-white uppercase
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                             ${rcValidationError 
                               ? 'border-red-500 focus:border-red-500' 
                               : isRcValid && vehicle.registration_number
                                 ? 'border-green-500 focus:border-green-500'
                                 : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white'}`}
                  />
                </div>
                {rcValidationError && (
                  <div className="flex items-start gap-2 mt-1">
                    <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5" />
                    <p className="text-sm text-red-600 dark:text-red-400">{rcValidationError}</p>
                  </div>
                )}
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
                             bg-white dark:bg-white-600 
                             text-gray-900 dark:text-white
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
                                 bg-white dark:bg-white-600 
                                 text-gray-900 dark:text-white text-center text-lg font-semibold
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

              {/* RFID Seat Reservation Section - Only show if API allows it */}
              {isRfidAvailable && (
                <div className="space-y-4">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                          RFID Seat Reservation
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRfidInfo(!showRfidInfo)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                      >
                        <InformationCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {showRfidInfo && (
                      <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-fadeIn">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Enable RFID seat reservation to automatically reserve a specific number of seats for RFID card holders. 
                          These seats will be pre-reserved for passengers with RFID cards on each trip.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-4 rounded-xl bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <CpuChipIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Enable RFID Seat Reservation
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Reserve seats for RFID card holders
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVehicle({ 
                          ...vehicle, 
                          enable_rfid_reservation: !vehicle.enable_rfid_reservation,
                          default_rfid_reserved_seat_count: !vehicle.enable_rfid_reservation ? Math.floor(vehicle.seat_count / 4) : 0
                        })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                          ${vehicle.enable_rfid_reservation ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${vehicle.enable_rfid_reservation ? 'translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  </div>

                  {vehicle.enable_rfid_reservation && (
                    <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 animate-fadeInUp">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span>Default RFID Reserved Seats</span>
                          <span className="text-red-500">*</span>
                        </div>
                      </label>
                      
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleRfidSeatCountChange(false)}
                          className="w-12 h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20
                                   transition-all duration-200 flex items-center justify-center
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={vehicle.default_rfid_reserved_seat_count <= 0}
                        >
                          <MinusIcon className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 relative">
                          <ShieldCheckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                          <input
                            type="number"
                            name="default_rfid_reserved_seat_count"
                            value={vehicle.default_rfid_reserved_seat_count}
                            onChange={handleChange}
                            min="0"
                            max={vehicle.seat_count}
                            className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-purple-200 dark:border-purple-700 
                                     bg-white dark:bg-white-600 
                                     text-gray-900 dark:text-white text-center text-lg font-semibold
                                     focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20
                                     transition-all duration-200 [appearance:textfield]"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleRfidSeatCountChange(true)}
                          className="w-12 h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20
                                   transition-all duration-200 flex items-center justify-center"
                        >
                          <PlusIcon className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total Seats</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{vehicle.seat_count}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                          <p className="text-xs text-purple-600 dark:text-purple-400">RFID Reserved</p>
                          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{vehicle.default_rfid_reserved_seat_count}</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        These seats will be automatically reserved for RFID card holders on every trip
                      </p>
                      
                      {vehicle.default_rfid_reserved_seat_count > vehicle.seat_count && (
                        <p className="text-xs text-red-500 mt-2">
                          ⚠️ RFID reserved seats cannot exceed total seat count
                        </p>
                      )}
                      
                      {vehicle.default_rfid_reserved_seat_count > 0 && vehicle.default_rfid_reserved_seat_count <= vehicle.seat_count && (
                        <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <p className="text-xs text-green-700 dark:text-green-300">
                            ✓ {vehicle.default_rfid_reserved_seat_count} seat(s) will be reserved for RFID card holders on each trip
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
                               bg-white dark:bg-white-600 
                               text-gray-900 dark:text-white
                               placeholder:text-gray-400 dark:placeholder:text-gray-500
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                               transition-all duration-200"
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
                             bg-white dark:bg-white-600 
                             text-gray-900 dark:text-white
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                             transition-all duration-200"
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Vehicle Color <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    name="color"
                    value={vehicle.color}
                    onChange={handleChange}
                    placeholder="e.g., White, Red, Blue"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-white-600 
                             text-gray-900 dark:text-white
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                             transition-all duration-200"
                  />
                  {vehicle.color && (
                    <div 
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-inner"
                      style={{ backgroundColor: vehicle.color.toLowerCase() }}
                    />
                  )}
                </div>
              </div>

              {/* Registration Valid Till Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Registration Valid Till <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    name="registration_valid_till"
                    value={vehicle.registration_valid_till}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-300 
                             text-gray-900 dark:text-white
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                             transition-all duration-200"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the date when your vehicle registration expires
                </p>
              </div>

              {/* Ownership Type Selection */}
              <div className="space-y-3 pt-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Ownership Type <span className="text-red-500">*</span>
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setVehicle({ ...vehicle, ownership_type: 'self' })}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
                      ${vehicle.ownership_type === 'self' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-[1.02] ring-2 ring-green-500/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                      }`}
                    style={{ minHeight: '120px' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg transition-all duration-200
                        ${vehicle.ownership_type === 'self' 
                          ? 'bg-green-500 dark:bg-green-600' 
                          : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        <HomeIcon className={`w-5 h-5 transition-all duration-200
                          ${vehicle.ownership_type === 'self' 
                            ? 'text-white' 
                            : 'text-gray-600 dark:text-gray-400'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold transition-all duration-200 text-base
                          ${vehicle.ownership_type === 'self' 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          Self-Owned
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Vehicle is personally owned by you. No additional authorization document required.
                        </p>
                      </div>
                      {vehicle.ownership_type === 'self' && (
                        <div className="bg-green-500 rounded-full p-1">
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicle({ ...vehicle, ownership_type: 'rented' })}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
                      ${vehicle.ownership_type === 'rented' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-[1.02] ring-2 ring-green-500/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                      }`}
                    style={{ minHeight: '120px' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-lg transition-all duration-200
                        ${vehicle.ownership_type === 'rented' 
                          ? 'bg-green-500 dark:bg-green-600' 
                          : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        <KeyIcon className={`w-5 h-5 transition-all duration-200
                          ${vehicle.ownership_type === 'rented' 
                            ? 'text-white' 
                            : 'text-gray-600 dark:text-gray-400'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold transition-all duration-200 text-base
                          ${vehicle.ownership_type === 'rented' 
                            ? 'text-green-700 dark:text-green-400' 
                            : 'text-gray-700 dark:text-gray-300'
                          }`}>
                          Rented/Leased
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Vehicle is rented or leased. Authorization document from owner is required.
                        </p>
                      </div>
                      {vehicle.ownership_type === 'rented' && (
                        <div className="bg-green-500 rounded-full p-1">
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Rented Vehicle Additional Fields */}
              {vehicle.ownership_type === 'rented' && (
                <div className="space-y-4 animate-fadeInUp">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Owner Information <span className="text-red-500">*</span>
                    </h3>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Owner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Enter vehicle owner's full name"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-100 text-gray-900 dark:text-white
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                               transition-all duration-200"
                      style={{ height: '48px' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Owner Aadhaar Card <span className="text-red-500">*</span>
                    </label>
                    {aadhaarPreview && (
                      <div className="mb-2 relative inline-block">
                        {aadhaarPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img src={aadhaarPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
                        ) : (
                          <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={() => removeFile('aadhaar')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      style={{ height: '44px', minWidth: '160px' }}
                    >
                      <CloudArrowUpIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">Upload Aadhaar Card</span>
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'aadhaar')} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upload owner's Aadhaar card (JPG, PNG, PDF - Max 5MB)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Authorization Document <span className="text-red-500">*</span>
                    </label>
                    {authorizationPreview && (
                      <div className="mb-2 relative inline-block">
                        {authorizationPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img src={authorizationPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
                        ) : (
                          <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                            <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={() => removeFile('authorization')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      style={{ height: '44px', minWidth: '180px' }}
                    >
                      <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">Upload Authorization Letter</span>
                      <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'authorization')} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Upload rental agreement or authorization letter (JPG, PNG, PDF - Max 5MB)</p>
                  </div>
                </div>
              )}

              {/* Vehicle Photos Section */}
              <div className="space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Vehicle Photos <span className="text-red-500">*</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <CameraIcon className="inline w-4 h-4 mr-2" />
                      Front Photo
                    </label>
                    {frontPreview && (
                      <div className="mb-2 relative inline-block">
                        <img src={frontPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
                        <button
                          onClick={() => removeFile('front')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
                      style={{ height: '44px' }}
                    >
                      <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">Upload Front Photo</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} className="hidden" />
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <CameraIcon className="inline w-4 h-4 mr-2" />
                      Interior Photo
                    </label>
                    {interiorPreview && (
                      <div className="mb-2 relative inline-block">
                        <img src={interiorPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
                        <button
                          onClick={() => removeFile('interior')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
                      style={{ height: '44px' }}
                    >
                      <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">Upload Interior Photo</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'interior')} className="hidden" />
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <CameraIcon className="inline w-4 h-4 mr-2" />
                      Left Side Photo
                    </label>
                    {leftSidePreview && (
                      <div className="mb-2 relative inline-block">
                        <img src={leftSidePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
                        <button
                          onClick={() => removeFile('left')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
                      style={{ height: '44px' }}
                    >
                      <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">Upload Left Side Photo</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'left')} className="hidden" />
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <CameraIcon className="inline w-4 h-4 mr-2" />
                      Right Side Photo
                    </label>
                    {rightSidePreview && (
                      <div className="mb-2 relative inline-block">
                        <img src={rightSidePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
                        <button
                          onClick={() => removeFile('right')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                          style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label
                      className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full"
                      style={{ height: '44px' }}
                    >
                      <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-200">Upload Right Side Photo</span>
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'right')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Required Documents <span className="text-red-500">*</span>
                  </h3>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <CameraIcon className="inline w-4 h-4 mr-2" />
                    Rear Photo <span className="text-red-500">*</span>
                  </label>
                  {rearPreview && (
                    <div className="mb-2 relative inline-block">
                      <img src={rearPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
                      <button
                        onClick={() => removeFile('rear')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    style={{ height: '44px', minWidth: '140px' }}
                  >
                    <PhotoIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Upload Rear Photo</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'rear')} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <DocumentTextIcon className="inline w-4 h-4 mr-2" />
                    RC Document <span className="text-red-500">*</span>
                  </label>
                  {rcPreview && (
                    <div className="mb-2 relative inline-block">
                      {rcPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img src={rcPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
                      ) : (
                        <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile('rc')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    style={{ height: '44px', minWidth: '140px' }}
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Upload RC Document</span>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'rc')} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <DocumentTextIcon className="inline w-4 h-4 mr-2" />
                    Insurance Document <span className="text-red-500">*</span>
                  </label>
                  {insurancePreview && (
                    <div className="mb-2 relative inline-block">
                      {insurancePreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img src={insurancePreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
                      ) : (
                        <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile('insurance')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    style={{ height: '44px', minWidth: '160px' }}
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Upload Insurance</span>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'insurance')} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <DocumentTextIcon className="inline w-4 h-4 mr-2" />
                    Pollution Certificate (Optional)
                  </label>
                  {pollutionPreview && (
                    <div className="mb-2 relative inline-block">
                      {pollutionPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                        <img src={pollutionPreview} className="w-24 h-24 object-cover rounded-lg border-2" alt="Preview" />
                      ) : (
                        <div className="w-24 h-24 rounded-lg border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                          <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile('pollution')}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                    style={{ height: '44px', minWidth: '170px' }}
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">Upload Pollution Certificate</span>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'pollution')} className="hidden" />
                  </label>
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
                  onClick={handleRegisterAndSubmit}
                  disabled={!isFormValid() || loading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    height: '56px',
                    width: '100%',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    cursor: (!isFormValid() || loading) ? 'not-allowed' : 'pointer',
                    border: 'none',
                    opacity: (!isFormValid() || loading) ? 0.6 : 1,
                    transform: isHovered && isFormValid() && !loading ? 'translateY(-2px)' : 'translateY(0)'
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Registering Vehicle...</span>
                    </>
                  ) : (
                    <>
                      <TruckIcon className="w-5 h-5" />
                      <span>Register Vehicle</span>
                      <ArrowRightIcon className="w-4 h-4" style={{ transition: 'transform 0.3s ease', transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }} />
                    </>
                  )}
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
      </IonContent>

      <IonLoading isOpen={loading} message="Registering vehicle..." />
      
      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg}
        duration={3000}
        onDidDismiss={() => setToastMsg("")}
        color={toastType === 'success' ? 'success' : 'danger'}
        position="top"
      />

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
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
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
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
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
        
        .dark ::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </IonPage>
  );
};

export default VehicleRegistration;