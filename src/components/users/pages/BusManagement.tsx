// import React, { useState, useEffect, ChangeEvent } from 'react';
// import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
// import { useHistory } from 'react-router-dom';
// import { Preferences } from '@capacitor/preferences';
// import NavbarSidebar from '../pages/Navbar';
// import { 
//   PencilIcon, 
//   CalendarIcon, 
//   ClockIcon, 
//   CheckCircleIcon, 
//   XCircleIcon, 
//   EyeIcon, 
//   DocumentTextIcon,
//   HomeIcon,
//   KeyIcon,
//   CameraIcon,
//   PhotoIcon,
//   DocumentDuplicateIcon,
//   XMarkIcon,
//   CloudArrowUpIcon,
//   TruckIcon,
//   UserIcon,
//   IdentificationIcon
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

// interface VehicleData {
//   id?: string;
//   registration_number: string;
//   vehicle_name: string;
//   vehicle_model: string;
//   color: string;
//   seat_count: number;
//   has_ac: boolean;
//   rc_file_path: string;
//   rear_photo_file_path: string;
//   verification_status: string;
//   rejection_reason?: string;
//   verification_requested_at?: string;
//   registration_valid_till?: string;
//   is_active?: boolean;
//   driver_user_id?: string;
//   reviewed_by_admin_id?: string | null;
//   reviewed_at?: string | null;
//   ownership_type?: string;
//   owner_name?: string;
//   authentication_file_path?: string;
//   front_photo_file_path?: string;
//   interior_photo_file_path?: string;
//   left_side_file_path?: string;
//   right_side_file_path?: string;
//   insurance_document?: string;
//   pollution_document?: string;
//   owner_aadhaar_card?: string;
// }

// const DriverVehicle: React.FC = () => {
//   const history = useHistory();
//   const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [serverMsg, setServerMsg] = useState<string | null>(null);
//   const [messageType, setMessageType] = useState<'success' | 'error'>('error');
//   const [isEditing, setIsEditing] = useState(false);
//   const [formVehicle, setFormVehicle] = useState<any>({});
  
//   // Existing files
//   const [rearPhoto, setRearPhoto] = useState<File | null>(null);
//   const [rcFile, setRcFile] = useState<File | null>(null);
  
//   // New files for update
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
  
//   const [registrationValidTill, setRegistrationValidTill] = useState<string>("");
//   const [token, setToken] = useState<string | null>(null);
//   const [ownershipType, setOwnershipType] = useState<string>('');
//   const [ownerName, setOwnerName] = useState<string>('');
  
//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//       if (!accessToken) {
//         setServerMsg("Session expired. Please login again.");
//         setMessageType('error');
//       }
//     };
//     loadToken();
//   }, []);

//   // Fetch vehicle when token is available
//   useEffect(() => {
//     if (token) {
//       fetchVehicle();
//     }
//   }, [token]);

//   // Fetch vehicle
//   const fetchVehicle = async () => {
//     if (!token) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver/vehicle/my-vehicle`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.detail || "Failed to load vehicle");
//       setVehicleData(data);
//       setFormVehicle({
//         registration_number: data.registration_number,
//         vehicle_name: data.vehicle_name,
//         vehicle_model: data.vehicle_model,
//         color: data.color,
//         seat_count: data.seat_count,
//         has_ac: data.has_ac.toString(),
//       });
//       setOwnershipType(data.ownership_type || '');
//       setOwnerName(data.owner_name || '');
//       if (data.registration_valid_till) {
//         setRegistrationValidTill(data.registration_valid_till.split('T')[0]);
//       }
//     } catch (err: any) {
//       setMessageType('error');
//       setServerMsg(err.message || "Error fetching vehicle");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormVehicle({ ...formVehicle, [name]: value });
//   };

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: string) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       setServerMsg("File size must be less than 5MB");
//       setMessageType('error');
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

//   // Update Vehicle PATCH
//   const handleUpdate = async () => {
//     if (!token) {
//       setServerMsg("Session expired. Please login again.");
//       setMessageType('error');
//       return;
//     }

//     setLoading(true);
//     setServerMsg(null);

//     try {
//       const fd = new FormData();
//       fd.append("vehicle_name", formVehicle.vehicle_name);
//       fd.append("vehicle_model", formVehicle.vehicle_model);
//       fd.append("color", formVehicle.color);
//       fd.append("seat_count", String(formVehicle.seat_count));
//       fd.append("has_ac", formVehicle.has_ac);
//       fd.append("ownership_type", ownershipType);
      
//       if (ownerName) fd.append("owner_name", ownerName);
      
//       if (registrationValidTill) fd.append("registration_valid_till", registrationValidTill);

//       // Existing files
//       if (rearPhoto) fd.append("rear_photo", rearPhoto);
//       if (rcFile) fd.append("rc_file", rcFile);
      
//       // New vehicle images
//       if (frontPhoto) fd.append("front_photo", frontPhoto);
//       if (interiorPhoto) fd.append("interior_photo", interiorPhoto);
//       if (leftSidePhoto) fd.append("left_side_photo", leftSidePhoto);
//       if (rightSidePhoto) fd.append("right_side_photo", rightSidePhoto);
      
//       // Documents
//       if (authorizationFile) fd.append("authentication_file", authorizationFile);
//       if (insuranceDocument) fd.append("insurance_document", insuranceDocument);
//       if (pollutionDocument) fd.append("pollution_document", pollutionDocument);
//       if (ownerAadhaarCard) fd.append("owner_aadhaar_card", ownerAadhaarCard);

//       const updateRes = await fetch(`${API_BASE}/driver/vehicle/update`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: fd,
//       });

//       const updateData = await updateRes.json();
//       if (!updateRes.ok) throw new Error(updateData.detail || "Update failed");

//       let finalData = updateData;

//       const currentStatus = vehicleData?.verification_status?.toUpperCase();

//       if (currentStatus === "REJECTED" || currentStatus === "DRAFT") {
//         const submitRes = await fetch(`${API_BASE}/driver/vehicle/submit`, {
//           method: "POST",
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         const submitData = await submitRes.json();
//         if (!submitRes.ok) throw new Error(submitData.detail || "Submit failed");

//         finalData = submitData;
//         setServerMsg("Vehicle updated & submitted successfully!");
//       } else {
//         setServerMsg("Vehicle updated successfully!");
//       }

//       setMessageType('success');
//       setIsEditing(false);
//       setVehicleData(finalData);
      
//       // Clear previews
//       setRearPreview(null);
//       setRcPreview(null);
//       setFrontPreview(null);
//       setInteriorPreview(null);
//       setLeftSidePreview(null);
//       setRightSidePreview(null);
//       setAuthorizationPreview(null);
//       setInsurancePreview(null);
//       setPollutionPreview(null);
//       setAadhaarPreview(null);
      
//       setRearPhoto(null);
//       setRcFile(null);
//       setFrontPhoto(null);
//       setInteriorPhoto(null);
//       setLeftSidePhoto(null);
//       setRightSidePhoto(null);
//       setAuthorizationFile(null);
//       setInsuranceDocument(null);
//       setPollutionDocument(null);
//       setOwnerAadhaarCard(null);

//       setTimeout(() => {
//         history.push("/bus-and-trip-management");
//       }, 1200);

//     } catch (err: any) {
//       setMessageType('error');
//       setServerMsg(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const status = vehicleData?.verification_status?.toUpperCase();
  
//   const getDisplayStatus = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "pending":
//         return "Submitted";
//       case "verified":
//         return "Approved";
//       case "rejected":
//         return "Rejected";
//       case "draft":
//         return "Draft";
//       default:
//         return status;
//     }
//   };

//   const getStatusStyle = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "pending":
//         return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
//       case "verified":
//         return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
//       case "rejected":
//         return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
//       default:
//         return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
//     }
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status?.toLowerCase()) {
//       case "pending":
//         return <ClockIcon className="w-4 h-4" />;
//       case "verified":
//         return <CheckCircleIcon className="w-4 h-4" />;
//       case "rejected":
//         return <XCircleIcon className="w-4 h-4" />;
//       default:
//         return <EyeIcon className="w-4 h-4" />;
//     }
//   };

//   const formatDate = (dateStr?: string | null) => {
//     if (!dateStr) return "N/A";
//     return new Date(dateStr).toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const formatDateOnly = (dateStr?: string) => {
//     if (!dateStr) return "N/A";
//     return new Date(dateStr).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const isRegistrationExpiring = () => {
//     if (!vehicleData?.registration_valid_till) return false;
//     const expiryDate = new Date(vehicleData.registration_valid_till);
//     const today = new Date();
//     const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
//     return daysLeft <= 30 && daysLeft > 0;
//   };

//   const isRegistrationExpired = () => {
//     if (!vehicleData?.registration_valid_till) return false;
//     const expiryDate = new Date(vehicleData.registration_valid_till);
//     const today = new Date();
//     return expiryDate < today;
//   };

//   // Show loading while getting token
//   if (token === null && loading) {
//     return (
//       <IonPage>
//         <NavbarSidebar />
//         <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans">
//           <div className="max-w-5xl mx-auto p-6 space-y-6 mt-10 text-center">
//             <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black dark:border-t-white"></div>
//             <p className="text-gray-500 dark:text-gray-400 mt-4">Loading session...</p>
//           </div>
//         </IonContent>
//       </IonPage>
//     );
//   }

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans">
//         <div className="max-w-5xl mx-auto p-6 space-y-6 mt-10">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-800 bg-clip-text text-transparent">
//               Vehicle Details
//             </h1>
//             <p className="text-gray-500 dark:text-gray-400 mt-2">
//               Complete vehicle information and verification status
//             </p>
//           </div>

//           {serverMsg && (
//             <div
//               className={`p-4 rounded-xl text-center font-semibold shadow-lg backdrop-blur-sm ${
//                 messageType === 'success'
//                   ? 'bg-green-50 dark:bg-green-900/80 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
//                   : 'bg-red-50 dark:bg-red-900/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
//               }`}
//             >
//               {serverMsg}
//             </div>
//           )}

//           {loading && <IonLoading isOpen={loading} message={"Loading..."} />}

//           {!vehicleData ? (
//             <div className="text-center py-12">
//               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
//                 <PencilIcon className="w-8 h-8 text-gray-400" />
//               </div>
//               <p className="text-gray-500 dark:text-gray-400 text-lg">Loading vehicle details...</p>
//             </div>
//           ) : (
//             <>
//               {!isEditing ? (
//                 <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
//                   {/* Header with Edit Button */}
//                   <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
//                     <div className="flex justify-between items-center flex-wrap gap-4">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2 bg-black dark:bg-white rounded-xl">
//                           <TruckIcon className="w-5 h-5 text-white dark:text-black" />
//                         </div>
//                         <div>
//                           <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
//                             Vehicle Information
//                           </h2>
//                           <p className="text-sm text-gray-500 dark:text-gray-400">
//                             ID: {vehicleData.id || 'N/A'}
//                           </p>
//                         </div>
//                       </div>
//                       {(status === "REJECTED" || status === "DRAFT") && (
//                         // <button
//                         //   onClick={() => setIsEditing(true)}
//                         //   className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg"
//                         // >
//                         //   <PencilIcon className="w-4 h-4" />
//                         //   Edit Vehicle
//                         // </button>
//                                    <button
//   onClick={() => setIsEditing(true)}
//   style={{
//     paddingLeft: '24px',
//     paddingRight: '24px',
//     paddingTop: '10px',
//     paddingBottom: '10px',
//     backgroundColor: '#000000',
//     color: '#ffffff',
//     borderRadius: '12px',
//     fontWeight: '500',
//     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
//     transition: 'all 0.2s ease',
//     cursor: 'pointer',
//     border: 'none',
//     fontSize: '14px',
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: '8px',
//     minWidth: '140px',
//     height: '45px',
//     justifyContent: 'center'
//   }}
//   onMouseEnter={(e) => {
//     e.currentTarget.style.backgroundColor = '#1f2937';
//     e.currentTarget.style.transform = 'scale(1.05)';
//   }}
//   onMouseLeave={(e) => {
//     e.currentTarget.style.backgroundColor = '#000000';
//     e.currentTarget.style.transform = 'scale(1)';
//   }}
// >
//   <PencilIcon style={{ width: '16px', height: '16px' }} />
//   Edit Vehicle
// </button>
//                       )}
//                     </div>
//                   </div>

//                   {/* Main Content */}
//                   <div className="p-6 space-y-6">
//                     {/* Status Banner */}
//                     <div className={`p-4 rounded-xl border-2 ${
//                       status === "VERIFIED" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
//                       status === "REJECTED" ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" :
//                       "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
//                     }`}>
//                       <div className="flex items-center gap-3 flex-wrap">
//                         <div className={`p-2 rounded-full ${
//                           status === "VERIFIED" ? "bg-green-100 dark:bg-green-800" :
//                           status === "REJECTED" ? "bg-red-100 dark:bg-red-800" :
//                           "bg-blue-100 dark:bg-blue-800"
//                         }`}>
//                           {getStatusIcon(vehicleData.verification_status)}
//                         </div>
//                         <div className="flex-1">
//                           <p className="text-sm font-semibold dark:text-gray-400">Verification Status</p>
//                           <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(vehicleData.verification_status)}`}>
//                             {getStatusIcon(vehicleData.verification_status)}
//                             {getDisplayStatus(vehicleData.verification_status)}
//                           </span>
//                         </div>
//                         {vehicleData.verification_requested_at && (
//                           <div className="text-right">
//                             <p className="text-xs text-gray-500 dark:text-gray-400">Submitted On</p>
//                             <p className="text-sm font-medium dark:text-gray-200">{formatDate(vehicleData.verification_requested_at)}</p>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Ownership Type Banner */}
//                     {vehicleData.ownership_type && (
//                       <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
//                         <div className="flex items-center gap-3">
//                           {vehicleData.ownership_type === 'self' ? (
//                             <HomeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//                           ) : (
//                             <KeyIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//                           )}
//                           <div>
//                             <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
//                               Ownership Type: {vehicleData.ownership_type === 'self' ? 'Self-Owned' : 'Rented/Leased'}
//                             </p>
//                             {vehicleData.owner_name && (
//                               <p className="text-sm text-purple-600 dark:text-purple-400">
//                                 Owner Name: {vehicleData.owner_name}
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Registration Valid Till Alert */}
//                     {vehicleData.registration_valid_till && (
//                       <div className={`p-4 rounded-xl border-2 ${
//                         isRegistrationExpired() ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" :
//                         isRegistrationExpiring() ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" :
//                         "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
//                       }`}>
//                         <div className="flex items-center gap-3">
//                           <CalendarIcon className={`w-5 h-5 ${
//                             isRegistrationExpired() ? "text-red-600" :
//                             isRegistrationExpiring() ? "text-yellow-600" :
//                             "text-green-600"
//                           }`} />
//                           <div className="flex-1">
//                             <p className="text-sm font-semibold dark:text-gray-300">Registration Valid Till</p>
//                             <p className="text-lg font-bold dark:text-gray-200">{formatDateOnly(vehicleData.registration_valid_till)}</p>
//                           </div>
//                           {isRegistrationExpired() && (
//                             <span className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
//                               EXPIRED
//                             </span>
//                           )}
//                           {isRegistrationExpiring() && !isRegistrationExpired() && (
//                             <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold">
//                               EXPIRING SOON
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* Vehicle Details Grid */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="space-y-4">
//                         <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
//                           <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                             Registration Number
//                           </label>
//                           <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
//                             {vehicleData.registration_number}
//                           </p>
//                         </div>

//                         <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
//                           <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                             Vehicle Name
//                           </label>
//                           <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
//                             {vehicleData.vehicle_name}
//                           </p>
//                         </div>

//                         <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
//                           <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                             Model
//                           </label>
//                           <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
//                             {vehicleData.vehicle_model}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="space-y-4">
//                         <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
//                           <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                             Color
//                           </label>
//                           <div className="flex items-center gap-2 mt-1">
//                             <div 
//                               className="w-6 h-6 rounded-full border-2 border-gray-300"
//                               style={{ backgroundColor: vehicleData.color?.toLowerCase() || '#ffffff' }}
//                             />
//                             <p className="text-lg font-bold text-gray-900 dark:text-white">
//                               {vehicleData.color}
//                             </p>
//                           </div>
//                         </div>

//                         <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
//                           <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                             Seat Count
//                           </label>
//                           <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
//                             {vehicleData.seat_count} Seats
//                           </p>
//                         </div>

//                         <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
//                           <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
//                             AC Type
//                           </label>
//                           <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
//                             {vehicleData.has_ac ? "❄️ AC Bus" : "☀️ Non-AC Bus"}
//                           </p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Vehicle Photos Section */}
//                     {(vehicleData.front_photo_file_path || vehicleData.interior_photo_file_path || 
//                       vehicleData.left_side_file_path || vehicleData.right_side_file_path) && (
//                       <div className="space-y-4">
//                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                           <div className="w-1 h-6 bg-black dark:bg-white rounded-full"></div>
//                           Vehicle Photos
//                         </h3>
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                           {vehicleData.front_photo_file_path && (
//                             <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//                               <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
//                                 Front View
//                               </p>
//                               <img 
//                                 src={`${API_BASE}/${vehicleData.front_photo_file_path}`} 
//                                 alt="Front" 
//                                 className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
//                               />
//                             </div>
//                           )}
//                           {vehicleData.interior_photo_file_path && (
//                             <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//                               <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
//                                 Interior
//                               </p>
//                               <img 
//                                 src={`${API_BASE}/${vehicleData.interior_photo_file_path}`} 
//                                 alt="Interior" 
//                                 className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
//                               />
//                             </div>
//                           )}
//                           {vehicleData.left_side_file_path && (
//                             <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//                               <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
//                                 Left Side
//                               </p>
//                               <img 
//                                 src={`${API_BASE}/${vehicleData.left_side_file_path}`} 
//                                 alt="Left Side" 
//                                 className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
//                               />
//                             </div>
//                           )}
//                           {vehicleData.right_side_file_path && (
//                             <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//                               <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
//                                 Right Side
//                               </p>
//                               <img 
//                                 src={`${API_BASE}/${vehicleData.right_side_file_path}`} 
//                                 alt="Right Side" 
//                                 className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
//                               />
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* Documents Section */}
//                     <div className="space-y-4">
//                       <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                         <div className="w-1 h-6 bg-black dark:bg-white rounded-full"></div>
//                         Documents
//                       </h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                         {vehicleData.rear_photo_file_path && (
//                           <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//                             <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
//                               Rear Photo
//                             </p>
//                             <img 
//                               src={`${API_BASE}/${vehicleData.rear_photo_file_path}`} 
//                               alt="Rear" 
//                               className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
//                             />
//                           </div>
//                         )}
//                         {vehicleData.rc_file_path && (
//                           <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//                             <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
//                               RC Document
//                             </p>
//                             {vehicleData.rc_file_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                               <img 
//                                 src={`${API_BASE}/${vehicleData.rc_file_path}`} 
//                                 alt="RC" 
//                                 className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
//                               />
//                             ) : (
//                               <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
//                                 <div className="text-center">
//                                   <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                                   <p className="text-sm text-gray-500">PDF Document</p>
//                                   <a 
//                                     href={`${API_BASE}/${vehicleData.rc_file_path}`}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="mt-2 inline-block px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
//                                   >
//                                     View PDF
//                                   </a>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                         {vehicleData.authentication_file_path && (
//                           <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//                             <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
//                               Authorization Document
//                             </p>
//                             {vehicleData.authentication_file_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                               <img 
//                                 src={`${API_BASE}/${vehicleData.authentication_file_path}`} 
//                                 alt="Authorization" 
//                                 className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
//                               />
//                             ) : (
//                               <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
//                                 <div className="text-center">
//                                   <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                                   <p className="text-sm text-gray-500">PDF Document</p>
//                                   <a 
//                                     href={`${API_BASE}/${vehicleData.authentication_file_path}`}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="mt-2 inline-block px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
//                                   >
//                                     View PDF
//                                   </a>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                         {vehicleData.insurance_document && (
//                           <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//                             <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
//                               Insurance Document
//                             </p>
//                             {vehicleData.insurance_document.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                               <img 
//                                 src={`${API_BASE}/${vehicleData.insurance_document}`} 
//                                 alt="Insurance" 
//                                 className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
//                               />
//                             ) : (
//                               <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
//                                 <div className="text-center">
//                                   <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                                   <p className="text-sm text-gray-500">PDF Document</p>
//                                   <a 
//                                     href={`${API_BASE}/${vehicleData.insurance_document}`}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="mt-2 inline-block px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
//                                   >
//                                     View PDF
//                                   </a>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                         {vehicleData.pollution_document && (
//                           <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//                             <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
//                               Pollution Certificate
//                             </p>
//                             {vehicleData.pollution_document.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                               <img 
//                                 src={`${API_BASE}/${vehicleData.pollution_document}`} 
//                                 alt="Pollution" 
//                                 className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
//                               />
//                             ) : (
//                               <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
//                                 <div className="text-center">
//                                   <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                                   <p className="text-sm text-gray-500">PDF Document</p>
//                                   <a 
//                                     href={`${API_BASE}/${vehicleData.pollution_document}`}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="mt-2 inline-block px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
//                                   >
//                                     View PDF
//                                   </a>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                         {vehicleData.owner_aadhaar_card && (
//                           <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
//                             <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
//                               Owner Aadhaar Card
//                             </p>
//                             {vehicleData.owner_aadhaar_card.match(/\.(jpg|jpeg|png|gif)$/i) ? (
//                               <img 
//                                 src={`${API_BASE}/${vehicleData.owner_aadhaar_card}`} 
//                                 alt="Aadhaar" 
//                                 className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
//                               />
//                             ) : (
//                               <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
//                                 <div className="text-center">
//                                   <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                                   <p className="text-sm text-gray-500">PDF Document</p>
//                                   <a 
//                                     href={`${API_BASE}/${vehicleData.owner_aadhaar_card}`}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="mt-2 inline-block px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
//                                   >
//                                     View PDF
//                                   </a>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Reviewed Information */}
//                     {vehicleData.reviewed_at && (
//                       <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
//                         <div className="flex items-center gap-3">
//                           <EyeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
//                           <div>
//                             <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
//                               Reviewed by Admin
//                             </p>
//                             <p className="text-sm text-purple-600 dark:text-purple-400">
//                               {formatDate(vehicleData.reviewed_at)}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Rejection Reason */}
//                     {status === "REJECTED" && vehicleData.rejection_reason && (
//                       <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
//                         <p className="font-semibold text-red-700 dark:text-red-300 mb-2">❌ Rejection Reason</p>
//                         <p className="text-sm text-red-600 dark:text-red-400">{vehicleData.rejection_reason}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               ) : (
//                 // Edit Form
//                 <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
//                   <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
//                     <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Vehicle</h2>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Update your vehicle information</p>
//                   </div>

//                   <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
//                     {/* Basic Information */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div>
//                         <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
//                           Vehicle Name <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           name="vehicle_name"
//                           value={formVehicle.vehicle_name || ''}
//                           onChange={handleChange}
//                           className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
//                                    bg-white dark:bg-gray-400 text-gray-900 dark:text-white
//                                    focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
//                                    transition-all duration-200"
//                         />
//                       </div>
//                       <div>
//                         <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
//                           Vehicle Model <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           name="vehicle_model"
//                           value={formVehicle.vehicle_model || ''}
//                           onChange={handleChange}
//                           className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
//                                    bg-white dark:bg-gray-400 text-gray-900 dark:text-white
//                                    focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
//                                    transition-all duration-200"
//                         />
//                       </div>
//                       <div>
//                         <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
//                           Color <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           name="color"
//                           value={formVehicle.color || ''}
//                           onChange={handleChange}
//                           className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
//                                    bg-white dark:bg-gray-400 text-gray-900 dark:text-white
//                                    focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
//                                    transition-all duration-200"
//                         />
//                       </div>
//                       <div>
//                         <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
//                           Seat Count <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="number"
//                           name="seat_count"
//                           value={formVehicle.seat_count || 0}
//                           onChange={handleChange}
//                           className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
//                                    bg-white dark:bg-gray-400 text-gray-900 dark:text-white
//                                    focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
//                                    transition-all duration-200"
//                         />
//                       </div>
//                       <div>
//                         <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
//                           Vehicle Type <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                           name="has_ac"
//                           value={formVehicle.has_ac || 'false'}
//                           onChange={handleChange}
//                           className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
//                                    bg-white dark:bg-gray-400 text-gray-900 dark:text-white
//                                    focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
//                                    transition-all duration-200 cursor-pointer"
//                         >
//                           <option value="true">❄️ AC Bus</option>
//                           <option value="false">☀️ Non-AC Bus</option>
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
//                           Registration Valid Till <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="date"
//                           value={registrationValidTill}
//                           onChange={(e) => setRegistrationValidTill(e.target.value)}
//                           min={new Date().toISOString().split('T')[0]}
//                           className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
//                                    bg-white dark:bg-gray-400 text-gray-900 dark:text-white
//                                    focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
//                                    transition-all duration-200"
//                         />
//                       </div>
//                     </div>

//                  {/* Ownership Type */}
// <div className="space-y-3">
//   <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
//     Ownership Type <span className="text-red-500">*</span>
//   </label>
//   <div className="grid md:grid-cols-2 gap-4">
//     <button
//       type="button"
//       onClick={() => setOwnershipType('self')}
//       className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left
//                 ${ownershipType === 'self' 
//                   ? 'border-green-500 bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-lg shadow-green-500/20' 
//                   : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md'}`}
//     >
//       <div className="flex items-start gap-3">
//         <div className={`p-2 rounded-lg transition-all duration-300 ${
//           ownershipType === 'self' 
//             ? 'bg-green-500 text-white' 
//             : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30'
//         }`}>
//           <HomeIcon className="w-5 h-5" />
//         </div>
//         <div className="flex-1">
//           <h3 className={`font-bold text-lg transition-colors duration-300 ${
//             ownershipType === 'self' 
//               ? 'text-green-700 dark:text-green-400' 
//               : 'text-gray-800 dark:text-gray-200'
//           }`}>
//             Self-Owned
//           </h3>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//             Vehicle is personally owned by you.
//           </p>
//         </div>
//         {ownershipType === 'self' && (
//           <div className="shrink-0">
//             <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
//               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
//           </div>
//         )}
//       </div>
//     </button>
    
//     <button
//       type="button"
//       onClick={() => setOwnershipType('rented')}
//       className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left
//                 ${ownershipType === 'rented' 
//                   ? 'border-green-500 bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-lg shadow-green-500/20' 
//                   : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md'}`}
//     >
//       <div className="flex items-start gap-3">
//         <div className={`p-2 rounded-lg transition-all duration-300 ${
//           ownershipType === 'rented' 
//             ? 'bg-green-500 text-white' 
//             : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30'
//         }`}>
//           <KeyIcon className="w-5 h-5" />
//         </div>
//         <div className="flex-1">
//           <h3 className={`font-bold text-lg transition-colors duration-300 ${
//             ownershipType === 'rented' 
//               ? 'text-green-700 dark:text-green-400' 
//               : 'text-gray-800 dark:text-gray-200'
//           }`}>
//             Rented/Leased
//           </h3>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//             Vehicle is rented or leased.
//           </p>
//         </div>
//         {ownershipType === 'rented' && (
//           <div className="shrink-0">
//             <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
//               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
//           </div>
//         )}
//       </div>
//     </button>
//   </div>
// </div>

// {/* Rented Vehicle Fields */}
// {ownershipType === 'rented' && (
//   <div className="space-y-5 animate-slideDown">
//     <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
//       <div className="space-y-5">
//         <div>
//           <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
//             Owner Name <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             value={ownerName}
//             onChange={(e) => setOwnerName(e.target.value)}
//             placeholder="Enter owner's full name"
//             className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
//                      bg-white dark:bg-gray-400 text-gray-900 dark:text-gray-100
//                      placeholder-gray-400 dark:placeholder-gray-500
//                      focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/20 
//                      transition-all duration-200"
//           />
//         </div>
        
//         <div>
//           <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
//             Owner Aadhaar Card
//             <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
//           </label>
//           <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:border-green-500 dark:hover:border-green-500 transition-all duration-200">
//             {aadhaarPreview ? (
//               <div className="relative inline-block">
//                 <img 
//                   src={aadhaarPreview} 
//                   className="w-28 h-28 object-cover rounded-lg border-2 border-green-500 shadow-lg" 
//                   alt="Aadhaar Preview" 
//                 />
//                 <button 
//                   onClick={() => removeFile('aadhaar')} 
//                   className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
//                 >
//                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             ) : (
//               <div className="text-center">
//                 <input 
//                   type="file" 
//                   accept="image/*,application/pdf" 
//                   onChange={(e) => handleFileChange(e, 'aadhaar')}
//                   className="w-full text-sm text-gray-500 dark:text-gray-400
//                            file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
//                            file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-950/30
//                            file:text-green-700 dark:file:text-green-400
//                            hover:file:bg-green-100 dark:hover:file:bg-green-900/50
//                            cursor-pointer transition-all duration-200"
//                 />
//                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
//                   Supported: JPG, PNG, PDF (Max 5MB)
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
        
//         <div>
//           <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
//             Authorization Document
//             <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
//           </label>
//           <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:border-green-500 dark:hover:border-green-500 transition-all duration-200">
//             {authorizationPreview ? (
//               <div className="relative inline-block">
//                 <img 
//                   src={authorizationPreview} 
//                   className="w-28 h-28 object-cover rounded-lg border-2 border-green-500 shadow-lg" 
//                   alt="Authorization Preview" 
//                 />
//                 <button 
//                   onClick={() => removeFile('authorization')} 
//                   className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
//                 >
//                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             ) : (
//               <div className="text-center">
//                 <input 
//                   type="file" 
//                   accept="image/*,application/pdf" 
//                   onChange={(e) => handleFileChange(e, 'authorization')}
//                   className="w-full text-sm text-gray-500 dark:text-gray-400
//                            file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
//                            file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-950/30
//                            file:text-green-700 dark:file:text-green-400
//                            hover:file:bg-green-100 dark:hover:file:bg-green-900/50
//                            cursor-pointer transition-all duration-200"
//                 />
//                 <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
//                   Supported: JPG, PNG, PDF (Max 5MB)
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// )}

// {/* Add this CSS to your global styles or component */}
// <style>{`
//   @keyframes slideDown {
//     from {
//       opacity: 0;
//       transform: translateY(-10px);
//     }
//     to {
//       opacity: 1;
//       transform: translateY(0);
//     }
//   }
//   .animate-slideDown {
//     animation: slideDown 0.3s ease-out;
//   }
// `}</style>

//                     {/* Vehicle Photos Upload */}
//                   <div className="space-y-6">
//   <div className="flex items-center gap-3">
//     <div className="w-1 h-8 bg-linear-to-b from-green-500 to-emerald-500 rounded-full"></div>
//     <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Photos</h3>
//   </div>
  
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//     {/* Front Photo */}
//     <div className="group">
//       <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
//         Front Photo
//         <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
//       </label>
//       <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
//         ${frontPreview 
//           ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
//           : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
//         {frontPreview ? (
//           <div className="relative inline-block">
//             <img 
//               src={frontPreview} 
//               className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
//               alt="Front Preview" 
//             />
//             <button 
//               onClick={() => removeFile('front')}
//               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
//             >
//               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <div className="text-center py-4">
//             <input 
//               type="file" 
//               accept="image/*" 
//               onChange={(e) => handleFileChange(e, 'front')}
//               className="w-full text-sm text-gray-600 dark:text-gray-400
//                        file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
//                        file:text-sm file:font-semibold 
//                        file:bg-linear-to-r file:from-green-500 file:to-emerald-500
//                        file:text-white file:shadow-md
//                        hover:file:from-green-600 hover:file:to-emerald-600
//                        hover:file:shadow-lg
//                        cursor-pointer transition-all duration-200
//                        file:cursor-pointer"
//             />
//             <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
//               JPG, PNG (Max 5MB)
//             </p>
//           </div>
//         )}
//       </div>
//     </div>

//     {/* Interior Photo */}
//     <div className="group">
//       <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
//         Interior Photo
//         <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
//       </label>
//       <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
//         ${interiorPreview 
//           ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
//           : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
//         {interiorPreview ? (
//           <div className="relative inline-block">
//             <img 
//               src={interiorPreview} 
//               className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
//               alt="Interior Preview" 
//             />
//             <button 
//               onClick={() => removeFile('interior')}
//               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
//             >
//               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <div className="text-center py-4">
//             <input 
//               type="file" 
//               accept="image/*" 
//               onChange={(e) => handleFileChange(e, 'interior')}
//               className="w-full text-sm text-gray-600 dark:text-gray-400
//                        file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
//                        file:text-sm file:font-semibold 
//                        file:bg-linear-to-r file:from-green-500 file:to-emerald-500
//                        file:text-white file:shadow-md
//                        hover:file:from-green-600 hover:file:to-emerald-600
//                        hover:file:shadow-lg
//                        cursor-pointer transition-all duration-200
//                        file:cursor-pointer"
//             />
//             <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
//               JPG, PNG (Max 5MB)
//             </p>
//           </div>
//         )}
//       </div>
//     </div>

//     {/* Left Side Photo */}
//     <div className="group">
//       <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
//         Left Side Photo
//         <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
//       </label>
//       <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
//         ${leftSidePreview 
//           ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
//           : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
//         {leftSidePreview ? (
//           <div className="relative inline-block">
//             <img 
//               src={leftSidePreview} 
//               className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
//               alt="Left Side Preview" 
//             />
//             <button 
//               onClick={() => removeFile('left')}
//               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
//             >
//               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <div className="text-center py-4">
//             <input 
//               type="file" 
//               accept="image/*" 
//               onChange={(e) => handleFileChange(e, 'left')}
//               className="w-full text-sm text-gray-600 dark:text-gray-400
//                        file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
//                        file:text-sm file:font-semibold 
//                        file:bg-linear-to-r file:from-green-500 file:to-emerald-500
//                        file:text-white file:shadow-md
//                        hover:file:from-green-600 hover:file:to-emerald-600
//                        hover:file:shadow-lg
//                        cursor-pointer transition-all duration-200
//                        file:cursor-pointer"
//             />
//             <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
//               JPG, PNG (Max 5MB)
//             </p>
//           </div>
//         )}
//       </div>
//     </div>

//     {/* Right Side Photo */}
//     <div className="group">
//       <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
//         Right Side Photo
//         <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
//       </label>
//       <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
//         ${rightSidePreview 
//           ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
//           : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
//         {rightSidePreview ? (
//           <div className="relative inline-block">
//             <img 
//               src={rightSidePreview} 
//               className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
//               alt="Right Side Preview" 
//             />
//             <button 
//               onClick={() => removeFile('right')}
//               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
//             >
//               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <div className="text-center py-4">
//             <input 
//               type="file" 
//               accept="image/*" 
//               onChange={(e) => handleFileChange(e, 'right')}
//               className="w-full text-sm text-gray-600 dark:text-gray-400
//                        file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
//                        file:text-sm file:font-semibold 
//                        file:bg-linear-to-r file:from-green-500 file:to-emerald-500
//                        file:text-white file:shadow-md
//                        hover:file:from-green-600 hover:file:to-emerald-600
//                        hover:file:shadow-lg
//                        cursor-pointer transition-all duration-200
//                        file:cursor-pointer"
//             />
//             <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
//               JPG, PNG (Max 5MB)
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// </div>

// {/* Required Documents Upload */}
// <div className="space-y-6 mt-8">
//   <div className="flex items-center gap-3">
//     <div className="w-1 h-8 bg-linear-to-b from-red-500 to-orange-500 rounded-full"></div>
//     <h3 className="text-xl font-bold text-gray-900 dark:text-white">Required Documents</h3>
//   </div>
  
//   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//     {/* Rear Photo */}
//     <div className="group">
//       <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
//         Rear Photo 
//         <span className="text-red-500 text-sm ml-1">*</span>
//       </label>
//       <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
//         ${rearPreview 
//           ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
//           : 'border-red-300 dark:border-red-800 hover:border-green-400 dark:hover:border-green-500 bg-red-50/10 dark:bg-red-950/10'}`}>
//         {rearPreview ? (
//           <div className="relative inline-block">
//             <img 
//               src={rearPreview} 
//               className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
//               alt="Rear Preview" 
//             />
//             <button 
//               onClick={() => removeFile('rear')}
//               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
//             >
//               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <div className="text-center py-4">
//             <input 
//               type="file" 
//               accept="image/*" 
//               onChange={(e) => handleFileChange(e, 'rear')}
//               className="w-full text-sm text-gray-600 dark:text-gray-400
//                        file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
//                        file:text-sm file:font-semibold 
//                        file:bg-linear-to-r file:from-red-500 file:to-orange-500
//                        file:text-white file:shadow-md
//                        hover:file:from-red-600 hover:file:to-orange-600
//                        hover:file:shadow-lg
//                        cursor-pointer transition-all duration-200
//                        file:cursor-pointer"
//             />
//             <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
//               JPG, PNG (Required)
//             </p>
//           </div>
//         )}
//       </div>
//     </div>

//     {/* RC Document */}
//     <div className="group">
//       <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
//         RC Document 
//         <span className="text-red-500 text-sm ml-1">*</span>
//       </label>
//       <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
//         ${rcPreview 
//           ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
//           : 'border-red-300 dark:border-red-800 hover:border-green-400 dark:hover:border-green-500 bg-red-50/10 dark:bg-red-950/10'}`}>
//         {rcPreview ? (
//           <div className="relative inline-block">
//             {rcPreview.match(/\.(jpg|jpeg|png)$/i) ? (
//               <img 
//                 src={rcPreview} 
//                 className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
//                 alt="RC Preview" 
//               />
//             ) : (
//               <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
//                 <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                 </svg>
//               </div>
//             )}
//             <button 
//               onClick={() => removeFile('rc')}
//               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
//             >
//               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <div className="text-center py-4">
//             <input 
//               type="file" 
//               accept="image/*,application/pdf" 
//               onChange={(e) => handleFileChange(e, 'rc')}
//               className="w-full text-sm text-gray-600 dark:text-gray-400
//                        file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
//                        file:text-sm file:font-semibold 
//                        file:bg-linear-to-r file:from-red-500 file:to-orange-500
//                        file:text-white file:shadow-md
//                        hover:file:from-red-600 hover:file:to-orange-600
//                        hover:file:shadow-lg
//                        cursor-pointer transition-all duration-200
//                        file:cursor-pointer"
//             />
//             <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
//               JPG, PNG, PDF (Required)
//             </p>
//           </div>
//         )}
//       </div>
//     </div>

//     {/* Insurance Document */}
//     <div className="group">
//       <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
//         Insurance Document
//         <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
//       </label>
//       <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
//         ${insurancePreview 
//           ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
//           : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
//         {insurancePreview ? (
//           <div className="relative inline-block">
//             {insurancePreview.match(/\.(jpg|jpeg|png)$/i) ? (
//               <img 
//                 src={insurancePreview} 
//                 className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
//                 alt="Insurance Preview" 
//               />
//             ) : (
//               <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
//                 <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                 </svg>
//               </div>
//             )}
//             <button 
//               onClick={() => removeFile('insurance')}
//               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
//             >
//               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <div className="text-center py-4">
//             <input 
//               type="file" 
//               accept="image/*,application/pdf" 
//               onChange={(e) => handleFileChange(e, 'insurance')}
//               className="w-full text-sm text-gray-600 dark:text-gray-400
//                        file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
//                        file:text-sm file:font-semibold 
//                        file:bg-linear-to-r file:from-blue-500 file:to-indigo-500
//                        file:text-white file:shadow-md
//                        hover:file:from-blue-600 hover:file:to-indigo-600
//                        hover:file:shadow-lg
//                        cursor-pointer transition-all duration-200
//                        file:cursor-pointer"
//             />
//             <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
//               JPG, PNG, PDF (Max 5MB)
//             </p>
//           </div>
//         )}
//       </div>
//     </div>

//     {/* Pollution Certificate */}
//     <div className="group">
//       <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
//         Pollution Certificate
//         <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
//       </label>
//       <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
//         ${pollutionPreview 
//           ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
//           : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
//         {pollutionPreview ? (
//           <div className="relative inline-block">
//             {pollutionPreview.match(/\.(jpg|jpeg|png)$/i) ? (
//               <img 
//                 src={pollutionPreview} 
//                 className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
//                 alt="Pollution Preview" 
//               />
//             ) : (
//               <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
//                 <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                 </svg>
//               </div>
//             )}
//             <button 
//               onClick={() => removeFile('pollution')}
//               className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
//             >
//               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         ) : (
//           <div className="text-center py-4">
//             <input 
//               type="file" 
//               accept="image/*,application/pdf" 
//               onChange={(e) => handleFileChange(e, 'pollution')}
//               className="w-full text-sm text-gray-600 dark:text-gray-400
//                        file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
//                        file:text-sm file:font-semibold 
//                        file:bg-linear-to-r file:from-purple-500 file:to-pink-500
//                        file:text-white file:shadow-md
//                        hover:file:from-purple-600 hover:file:to-pink-600
//                        hover:file:shadow-lg
//                        cursor-pointer transition-all duration-200
//                        file:cursor-pointer"
//             />
//             <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
//               JPG, PNG, PDF (Max 5MB)
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// </div>
//                     <div className="flex justify-center gap-4 pt-4">
//                           <button
//   onClick={handleUpdate}
//   style={{
//     paddingLeft: '32px',
//     paddingRight: '32px',
//     paddingTop: '12px',
//     paddingBottom: '12px',
//     backgroundColor: '#000000',
//     color: '#ffffff',
//     borderRadius: '12px',
//     fontWeight: '600',
//     boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
//     transition: 'all 0.2s ease',
//     cursor: 'pointer',
//     border: 'none',
//     fontSize: '14px',
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: '8px',
//     minWidth: '140px',
//     height: '48px',
//     justifyContent: 'center'
//   }}
//   onMouseEnter={(e) => {
//     e.currentTarget.style.backgroundColor = '#1f2937';
//     e.currentTarget.style.transform = 'scale(1.05)';
//   }}
//   onMouseLeave={(e) => {
//     e.currentTarget.style.backgroundColor = '#000000';
//     e.currentTarget.style.transform = 'scale(1)';
//   }}
// >
//   💾 Save Changes
// </button>

//                     <button
//   onClick={() => {
//     setIsEditing(false);
//     setRearPreview(null);
//     setRcPreview(null);
//     setFrontPreview(null);
//     setInteriorPreview(null);
//     setLeftSidePreview(null);
//     setRightSidePreview(null);
//     setAuthorizationPreview(null);
//     setInsurancePreview(null);
//     setPollutionPreview(null);
//     setAadhaarPreview(null);
//     setRearPhoto(null);
//     setRcFile(null);
//     setFrontPhoto(null);
//     setInteriorPhoto(null);
//     setLeftSidePhoto(null);
//     setRightSidePhoto(null);
//     setAuthorizationFile(null);
//     setInsuranceDocument(null);
//     setPollutionDocument(null);
//     setOwnerAadhaarCard(null);
//     if (vehicleData?.registration_valid_till) {
//       setRegistrationValidTill(vehicleData.registration_valid_till.split('T')[0]);
//     }
//     setOwnershipType(vehicleData?.ownership_type || '');
//     setOwnerName(vehicleData?.owner_name || '');
//   }}
//   className="group relative px-8 py-3 bg-linear-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl overflow-hidden"
//   style={{
//     paddingLeft: '32px',
//     paddingRight: '32px',
//     paddingTop: '12px',
//     paddingBottom: '12px',
//     borderRadius: '12px',
//     fontWeight: '600',
//     transition: 'all 0.3s ease',
//     cursor: 'pointer',
//     border: 'none',
//     fontSize: '14px',
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: '8px',
//     minWidth: '140px',
//     height: '48px',
//     justifyContent: 'center',
//     position: 'relative'
//   }}
// >
//   {/* Shine effect on hover */}
//   <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
  
//   {/* Icon with animation */}
//   <svg 
//     className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" 
//     fill="none" 
//     stroke="currentColor" 
//     viewBox="0 0 24 24"
//   >
//     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//   </svg>
  
//   <span className="relative">Cancel</span>
// </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default DriverVehicle;

import React, { useState, useEffect, ChangeEvent } from 'react';
import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import NavbarSidebar from '../pages/Navbar';
import { 
  PencilIcon, 
  CalendarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon, 
  DocumentTextIcon,
  HomeIcon,
  KeyIcon,
  CameraIcon,
  PhotoIcon,
  DocumentDuplicateIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  TruckIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  CpuChipIcon,
  InformationCircleIcon,
  MinusIcon,
  PlusIcon,
  WifiIcon,
  DevicePhoneMobileIcon
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

// Vehicle Inspection Status Interface
interface VehicleInspection {
  vehicle_id: string;
  inspection_status: 'pending' | 'approved' | 'rejected' | 'expired';
  inspection_reason: string | null;
  inspection_created_at: string | null;
  inspection_reviewed_at: string | null;
}

interface VehicleData {
  id?: string;
  registration_number: string;
  vehicle_name: string;
  vehicle_model: string;
  color: string;
  seat_count: number;
  has_ac: boolean;
  rc_file_path: string;
  rear_photo_file_path: string;
  verification_status: string;
  rejection_reason?: string;
  verification_requested_at?: string;
  registration_valid_till?: string;
  is_active?: boolean;
  driver_user_id?: string;
  reviewed_by_admin_id?: string | null;
  reviewed_at?: string | null;
  ownership_type?: string;
  owner_name?: string;
  authentication_file_path?: string;
  front_photo_file_path?: string;
  interior_photo_file_path?: string;
  left_side_file_path?: string;
  right_side_file_path?: string;
  insurance_document?: string;
  pollution_document?: string;
  owner_aadhaar_card?: string;
  enable_rfid_reservation?: boolean;
  default_rfid_reserved_seat_count?: number;
}

interface RfidConfig {
  allow_driver_rfid_seat_reservation: boolean;
  message?: string;
}

const DriverVehicle: React.FC = () => {
  const history = useHistory();
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isEditing, setIsEditing] = useState(false);
  const [formVehicle, setFormVehicle] = useState<any>({});
  
  // RFID Configuration from API
  const [rfidConfig, setRfidConfig] = useState<RfidConfig | null>(null);
  const [loadingRfidConfig, setLoadingRfidConfig] = useState(false);
  const [showRfidInfo, setShowRfidInfo] = useState(false);
  
  // RFID Edit States
  const [enableRfidReservation, setEnableRfidReservation] = useState(false);
  const [rfidReservedSeatCount, setRfidReservedSeatCount] = useState(0);
  
  // Vehicle Inspection State
  const [vehicleInspection, setVehicleInspection] = useState<VehicleInspection | null>(null);
  const [loadingInspection, setLoadingInspection] = useState(false);
  const [showInspectionDetails, setShowInspectionDetails] = useState(false);
  
  // Existing files
  const [rearPhoto, setRearPhoto] = useState<File | null>(null);
  const [rcFile, setRcFile] = useState<File | null>(null);
  
  // New files for update
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
  
  const [registrationValidTill, setRegistrationValidTill] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);
  const [ownershipType, setOwnershipType] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  
  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
      if (!accessToken) {
        setServerMsg("Session expired. Please login again.");
        setMessageType('error');
      } else {
        fetchRfidConfig(accessToken);
      }
    };
    loadToken();
  }, []);

  // Fetch RFID Configuration from API
  const fetchRfidConfig = async (accessToken: string) => {
    setLoadingRfidConfig(true);
    
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
      
      setRfidConfig({
        allow_driver_rfid_seat_reservation: data.allow_driver_rfid_seat_reservation || false,
        message: data.message
      });
      
    } catch (error) {
      console.error("❌ Error fetching RFID config:", error);
      setRfidConfig({ allow_driver_rfid_seat_reservation: false, message: "RFID feature unavailable" });
    } finally {
      setLoadingRfidConfig(false);
    }
  };

  // Fetch vehicle and inspection when token is available
  useEffect(() => {
    if (token) {
      fetchVehicle();
      fetchVehicleInspection();
    }
  }, [token]);

  // Fetch Vehicle Inspection Status
  const fetchVehicleInspection = async () => {
    if (!token) return;
    
    setLoadingInspection(true);
    try {
      const response = await fetch(`${API_BASE}/driver/vehicle/inspection-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 404) {
        console.log("No vehicle inspection data found");
        setVehicleInspection(null);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch inspection status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Vehicle inspection data:", data);
      setVehicleInspection(data);
      
    } catch (error) {
      console.error("Error fetching vehicle inspection:", error);
    } finally {
      setLoadingInspection(false);
    }
  };

  // Fetch vehicle
  const fetchVehicle = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/vehicle/my-vehicle`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load vehicle");
      setVehicleData(data);
      setFormVehicle({
        registration_number: data.registration_number,
        vehicle_name: data.vehicle_name,
        vehicle_model: data.vehicle_model,
        color: data.color,
        seat_count: data.seat_count,
        has_ac: data.has_ac.toString(),
      });
      setOwnershipType(data.ownership_type || '');
      setOwnerName(data.owner_name || '');
      
      // Set RFID data from vehicle
      setEnableRfidReservation(data.enable_rfid_reservation || false);
      setRfidReservedSeatCount(data.default_rfid_reserved_seat_count || 0);
      
      if (data.registration_valid_till) {
        setRegistrationValidTill(data.registration_valid_till.split('T')[0]);
      }
    } catch (err: any) {
      setMessageType('error');
      setServerMsg(err.message || "Error fetching vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormVehicle({ ...formVehicle, [name]: value });
    
    // When seat count changes, adjust RFID reserved seats if needed
    if (name === 'seat_count' && enableRfidReservation) {
      const newSeatCount = parseInt(value) || 0;
      if (rfidReservedSeatCount > newSeatCount) {
        setRfidReservedSeatCount(newSeatCount);
      }
    }
  };

  const handleRfidSeatCountChange = (increment: boolean) => {
    const seatCount = formVehicle.seat_count || vehicleData?.seat_count || 0;
    setRfidReservedSeatCount(prev => {
      if (increment) {
        return Math.min(seatCount, prev + 1);
      } else {
        return Math.max(0, prev - 1);
      }
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setServerMsg("File size must be less than 5MB");
      setMessageType('error');
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

//   // ======================
//   // Inspection Helper Functions
  // ======================
  const getNextInspectionDueDate = (): string | null => {
    if (!vehicleInspection?.inspection_reviewed_at) return null;
    
    const reviewedDate = new Date(vehicleInspection.inspection_reviewed_at);
    const nextDueDate = new Date(reviewedDate);
    nextDueDate.setDate(reviewedDate.getDate() + 15);
    
    return nextDueDate.toISOString();
  };

  const getDaysUntilDue = (): number | null => {
    const nextDueDateStr = getNextInspectionDueDate();
    if (!nextDueDateStr) return null;
    
    const dueDate = new Date(nextDueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getInspectionStatusBadge = () => {
    if (!vehicleInspection || !vehicleInspection.vehicle_id) {
      return { 
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', 
        icon: null, 
        text: 'No Inspection Record',
        borderColor: 'border-gray-300 dark:border-gray-600'
      };
    }
    
    switch(vehicleInspection.inspection_status) {
      case 'approved':
        return { 
          color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', 
          icon: ShieldCheckIcon, 
          text: 'Inspection Approved',
          borderColor: 'border-green-500 dark:border-green-400'
        };
      case 'pending':
        return { 
          color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', 
          icon: ClockIcon, 
          text: 'Inspection Pending',
          borderColor: 'border-yellow-500 dark:border-yellow-400'
        };
      case 'rejected':
        return { 
          color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', 
          icon: ExclamationTriangleIcon, 
          text: 'Inspection Rejected',
          borderColor: 'border-red-500 dark:border-red-400'
        };
      case 'expired':
        return { 
          color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', 
          icon: ExclamationTriangleIcon, 
          text: 'Inspection Expired',
          borderColor: 'border-orange-500 dark:border-orange-400'
        };
      default:
        return { 
          color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', 
          icon: null, 
          text: 'Unknown Status',
          borderColor: 'border-gray-300 dark:border-gray-600'
        };
    }
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Not scheduled';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Update Vehicle PATCH with RFID support
  const handleUpdate = async () => {
    if (!token) {
      setServerMsg("Session expired. Please login again.");
      setMessageType('error');
      return;
    }

    setLoading(true);
    setServerMsg(null);

    try {
      const fd = new FormData();
      fd.append("vehicle_name", formVehicle.vehicle_name);
      fd.append("vehicle_model", formVehicle.vehicle_model);
      fd.append("color", formVehicle.color);
      fd.append("seat_count", String(formVehicle.seat_count));
      fd.append("has_ac", formVehicle.has_ac);
      fd.append("ownership_type", ownershipType);
      
      // Send RFID data if API allows it
      if (rfidConfig?.allow_driver_rfid_seat_reservation) {
        fd.append("enable_rfid_reservation", String(enableRfidReservation));
        if (enableRfidReservation) {
          fd.append("default_rfid_reserved_seat_count", String(rfidReservedSeatCount));
        } else {
          fd.append("default_rfid_reserved_seat_count", "0");
        }
      }
      
      if (ownerName) fd.append("owner_name", ownerName);
      
      if (registrationValidTill) fd.append("registration_valid_till", registrationValidTill);

      // Existing files
      if (rearPhoto) fd.append("rear_photo", rearPhoto);
      if (rcFile) fd.append("rc_file", rcFile);
      
      // New vehicle images
      if (frontPhoto) fd.append("front_photo", frontPhoto);
      if (interiorPhoto) fd.append("interior_photo", interiorPhoto);
      if (leftSidePhoto) fd.append("left_side_photo", leftSidePhoto);
      if (rightSidePhoto) fd.append("right_side_photo", rightSidePhoto);
      
      // Documents
      if (authorizationFile) fd.append("authentication_file", authorizationFile);
      if (insuranceDocument) fd.append("insurance_document", insuranceDocument);
      if (pollutionDocument) fd.append("pollution_document", pollutionDocument);
      if (ownerAadhaarCard) fd.append("owner_aadhaar_card", ownerAadhaarCard);

      const updateRes = await fetch(`${API_BASE}/driver/vehicle/update`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok) throw new Error(updateData.detail || "Update failed");

      let finalData = updateData;

      const currentStatus = vehicleData?.verification_status?.toUpperCase();

      if (currentStatus === "REJECTED" || currentStatus === "DRAFT") {
        const submitRes = await fetch(`${API_BASE}/driver/vehicle/submit`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        const submitData = await submitRes.json();
        if (!submitRes.ok) throw new Error(submitData.detail || "Submit failed");

        finalData = submitData;
        setServerMsg("Vehicle updated & submitted successfully!");
      } else {
        setServerMsg("Vehicle updated successfully!");
      }

      setMessageType('success');
      setIsEditing(false);
      setVehicleData(finalData);
      
      // Clear previews
      setRearPreview(null);
      setRcPreview(null);
      setFrontPreview(null);
      setInteriorPreview(null);
      setLeftSidePreview(null);
      setRightSidePreview(null);
      setAuthorizationPreview(null);
      setInsurancePreview(null);
      setPollutionPreview(null);
      setAadhaarPreview(null);
      
      setRearPhoto(null);
      setRcFile(null);
      setFrontPhoto(null);
      setInteriorPhoto(null);
      setLeftSidePhoto(null);
      setRightSidePhoto(null);
      setAuthorizationFile(null);
      setInsuranceDocument(null);
      setPollutionDocument(null);
      setOwnerAadhaarCard(null);

      // Refresh inspection data
      fetchVehicleInspection();

      setTimeout(() => {
        history.push("/bus-and-trip-management");
      }, 1200);

    } catch (err: any) {
      setMessageType('error');
      setServerMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const status = vehicleData?.verification_status?.toUpperCase();
  
  const getDisplayStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Submitted";
      case "verified":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "verified":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <ClockIcon className="w-4 h-4" />;
      case "verified":
        return <CheckCircleIcon className="w-4 h-4" />;
      case "rejected":
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <EyeIcon className="w-4 h-4" />;
    }
  };

  const formatDateOnly = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isRegistrationExpiring = () => {
    if (!vehicleData?.registration_valid_till) return false;
    const expiryDate = new Date(vehicleData.registration_valid_till);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysLeft <= 30 && daysLeft > 0;
  };

  const isRegistrationExpired = () => {
    if (!vehicleData?.registration_valid_till) return false;
    const expiryDate = new Date(vehicleData.registration_valid_till);
    const today = new Date();
    return expiryDate < today;
  };

  const inspectionBadge = getInspectionStatusBadge();
  const daysUntilDue = getDaysUntilDue();
  const nextInspectionDate = getNextInspectionDueDate();
  const isExpired = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 15;
  const maxDays = 15;
  
  // Check if RFID edit is allowed
  const isRfidEditAllowed = rfidConfig?.allow_driver_rfid_seat_reservation === true;
  const hasRfidData = (vehicleData?.default_rfid_reserved_seat_count || 0) > 0;

  // Show loading while getting token
  if (token === null && loading) {
    return (
      <IonPage>
        <NavbarSidebar />
        <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans">
          <div className="max-w-5xl mx-auto p-6 space-y-6 mt-10 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black dark:border-t-white"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-4">Loading session...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans">
        <div className="max-w-5xl mx-auto p-6 space-y-6 mt-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-800 bg-clip-text text-transparent">
              Vehicle Details
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Complete vehicle information and verification status
            </p>
          </div>

          {serverMsg && (
            <div
              className={`p-4 rounded-xl text-center font-semibold shadow-lg backdrop-blur-sm ${
                messageType === 'success'
                  ? 'bg-green-50 dark:bg-green-900/80 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
              }`}
            >
              {serverMsg}
            </div>
          )}

          {loading && <IonLoading isOpen={loading} message={"Loading..."} />}

          {!vehicleData ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <PencilIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">Loading vehicle details...</p>
            </div>
          ) : (
            <>
               {/* ====================== VEHICLE INSPECTION SECTION ====================== */}
               {vehicleInspection && vehicleInspection.vehicle_id && (
                <div className={`rounded-2xl border-2 ${inspectionBadge.borderColor} overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl`}>
                  <div className={`p-5 ${inspectionBadge.color.replace('text', 'bg').replace('dark:text', 'dark:bg')} bg-opacity-10 dark:bg-opacity-10`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${inspectionBadge.color} flex items-center justify-center shadow-md`}>
                          {inspectionBadge.icon ? (
                            <inspectionBadge.icon className="w-6 h-6" />
                          ) : (
                            <TruckIcon className="w-6 h-6" />
                          )}
                        </div>
                        <div>
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white">
  Vehicle Inspection Status
</h3>
<div className="flex items-center gap-2 mt-1 flex-wrap">
  {/* Main Status Badge with New Colors */}
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
    vehicleInspection?.inspection_status === 'approved' 
      ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-700' 
      : vehicleInspection?.inspection_status === 'pending'
      ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-700'
      : vehicleInspection?.inspection_status === 'rejected'
      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-700'
      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
  }`}>
    {vehicleInspection?.inspection_status === 'approved' && <CheckCircleIcon className="w-3.5 h-3.5" />}
    {vehicleInspection?.inspection_status === 'pending' && <ClockIcon className="w-3.5 h-3.5" />}
    {vehicleInspection?.inspection_status === 'rejected' && <XCircleIcon className="w-3.5 h-3.5" />}
    {vehicleInspection?.inspection_status === 'expired' && <ExclamationTriangleIcon className="w-3.5 h-3.5" />}
    {inspectionBadge.text}
  </span>
  
  {/* Due Soon Warning - Purple/Violet Theme */}
  {!isExpired && daysUntilDue !== null && daysUntilDue <= 15 && daysUntilDue > 0 && (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-purple-100 to-fuchsia-100 dark:from-purple-900/40 dark:to-fuchsia-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-700 shadow-sm">
      <ClockIcon className="w-3.5 h-3.5 text-purple-500" />
      Due in {daysUntilDue} {daysUntilDue === 1 ? 'day' : 'days'}
    </span>
  )}
  
  {/* Overdue Warning - Crimson/Red Theme with Animation */}
  {isExpired && (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-crimson-100 to-red-500 dark:from-red-900/50 dark:to-crimson-900/40 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-700 shadow-sm animate-pulse">
      <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-500" />
      Overdue by {Math.abs(daysUntilDue!)} {Math.abs(daysUntilDue!) === 1 ? 'day' : 'days'}
    </span>
  )}
  
  {/* Additional: Just Added / New Status - Cyan Theme (if inspection just created) */}
  {vehicleInspection?.inspection_status === 'pending' && daysUntilDue === null && (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-700">
      <ClockIcon className="w-3.5 h-3.5" />
      Awaiting Review
    </span>
  )}
  
  {/* Additional: Approaching Expiry (16-30 days) - Indigo Theme */}
  {!isExpired && daysUntilDue !== null && daysUntilDue > 15 && daysUntilDue <= 30 && (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
      <CalendarIcon className="w-3.5 h-3.5" />
      Expires in {daysUntilDue} days
    </span>
  )}
  
  {/* Additional: Valid & Safe (31+ days) - Emerald Theme */}
  {!isExpired && daysUntilDue !== null && daysUntilDue > 30 && (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
      <ShieldCheckIcon className="w-3.5 h-3.5" />
      Valid for {daysUntilDue} days
    </span>
  )}

                          </div>
                        </div>
                      </div>
                     <button
                                         onClick={() => setShowInspectionDetails(!showInspectionDetails)}
                                         style={{
                                           display: 'flex',
                                           alignItems: 'center',
                                           gap: '8px',
                                           padding: '10px 20px',
                                           height: '42px',
                                           background: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
                                           color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
                                           fontWeight: '600',
                                           fontSize: '14px',
                                           borderRadius: '12px',
                                           border: `1px solid ${document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'}`,
                                           cursor: 'pointer',
                                           transition: 'all 0.3s ease',
                                           boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                         }}
                                         onMouseEnter={(e) => {
                                           const isDark = document.documentElement.classList.contains('dark');
                                           e.currentTarget.style.background = isDark ? '#4b5563' : '#e5e7eb';
                                           e.currentTarget.style.transform = 'translateY(-1px)';
                                           e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                                         }}
                                         onMouseLeave={(e) => {
                                           const isDark = document.documentElement.classList.contains('dark');
                                           e.currentTarget.style.background = isDark ? '#374151' : '#f3f4f6';
                                           e.currentTarget.style.transform = 'translateY(0)';
                                           e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                                         }}
                                       >
                                         <EyeIcon style={{ width: '18px', height: '18px' }} />
                                         {showInspectionDetails ? "Hide Details" : "View Details"}
                                       </button>
                                   
                    </div>
                  </div>
                  
                  {/* Inspection Details - Expandable */}
                  {showInspectionDetails && (
                    <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                        <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-xl group">
  {/* Animated Gradient Background */}
  <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 transition-all duration-500 group-hover:scale-105"></div>
  
  {/* Decorative Elements */}
  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-200/30 dark:bg-blue-500/10 blur-2xl"></div>
  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-purple-200/30 dark:bg-purple-500/10 blur-2xl"></div>
  
  {/* Top Accent Line with Animation */}
  <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-t-2xl transform origin-left transition-transform duration-500 group-hover:scale-x-100"></div>
  
  <div className="relative z-10">
    {/* Header with Icon */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {/* Animated Icon Container */}
        <div className="relative w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
          <CalendarIcon className="w-6 h-6 text-white" />
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-xl border-2 border-blue-400/50 animate-ping"></div>
        </div>
        
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            Last Inspection Date
          </p>
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">
            {formatDate(vehicleInspection.inspection_reviewed_at)}
          </p>
        </div>
      </div>
      
      {/* Verification Badge */}
      {vehicleInspection.inspection_reviewed_at && (
        <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-linear-to-r from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 shadow-sm flex items-center gap-1.5">
          <CheckBadgeIcon className="w-3.5 h-3.5" />
          Verified
        </div>
      )}
    </div>
    
    {/* Decorative Timeline Line */}
    <div className="relative mt-4 mb-4 ml-2">
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-linear-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
      <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-blue-500 -translate-x-0.75 animate-pulse"></div>
      <div className="absolute left-0 bottom-0 w-2 h-2 rounded-full bg-purple-500 -translate-x-0.75"></div>
    </div>
    
    {/* Info Card */}
    <div className="mt-4 p-4 rounded-xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-blue-100 dark:border-blue-900/50 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/80 dark:hover:bg-gray-800/60">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center">
            <CheckBadgeIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            Vehicle Inspection Record
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            Your vehicle was successfully inspected on <span className="font-bold text-blue-600 dark:text-blue-400">
              {formatDate(vehicleInspection.inspection_reviewed_at)}
            </span>
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-lg">
            <CheckBadgeIcon className="w-3 h-3" />
            Inspection completed
          </div>
        </div>
      </div>
    </div>
    
    {/* Additional Stats Row */}
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/30 text-center group-hover:bg-white/80 dark:group-hover:bg-gray-800/50 transition-all duration-300">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Days Since</p>
        <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
          {vehicleInspection.inspection_reviewed_at ? Math.floor((new Date().getTime() - new Date(vehicleInspection.inspection_reviewed_at).getTime()) / (1000 * 3600 * 24)) : 'N/A'} days
        </p>
      </div>
      <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/30 text-center group-hover:bg-white/80 dark:group-hover:bg-gray-800/50 transition-all duration-300">
        <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">Status</p>
        <p className="text-sm font-bold text-green-600 dark:text-green-400">Completed ✓</p>
      </div>
    </div>
  </div>
</div>
</div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
                          <div className={`w-8 h-8 rounded-full ${isExpired ? 'bg-red-100 dark:bg-red-900/30' : isDueSoon ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'} flex items-center justify-center shrink-0`}>
                            <CalendarIcon className={`w-4 h-4 ${isExpired ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`} />
                          </div>
                         <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-xl group">
  {/* Animated Gradient Background */}
  <div className={`
    absolute inset-0 bg-linear-to-br transition-all duration-500
    ${isExpired 
      ? 'bg-linear-to-br from-red-50 via-rose-50 to-orange-50 dark:from-red-950/40 dark:via-rose-950/40 dark:to-orange-950/40' 
      : isDueSoon 
      ? 'bg-linear-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/40 dark:via-orange-950/40 dark:to-yellow-950/40'
      : 'bg-linear-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950/40 dark:via-green-950/40 dark:to-teal-950/40'
    }
  `}></div>
  
  {/* Decorative Elements */}
  <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/30 dark:bg-white/5 blur-2xl"></div>
  <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/30 dark:bg-white/5 blur-2xl"></div>
  
  {/* Top Accent Line with Animation */}
  <div className={`
    absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl transition-all duration-500
    ${isExpired ? 'bg-linear-to-r from-red-500 via-rose-500 to-orange-500 animate-pulse' : 
      isDueSoon ? 'bg-linear-to-r from-amber-500 via-orange-500 to-yellow-500' : 
      'bg-linear-to-r from-emerald-500 via-green-500 to-teal-500'}
  `}></div>
  
  <div className="relative z-10">
    {/* Header with Icon */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {/* Animated Icon Container */}
        <div className={`
          relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:scale-110
          ${isExpired 
            ? 'bg-linear-to-br from-red-500 to-rose-600 shadow-red-500/30' 
            : isDueSoon 
            ? 'bg-linear-to-br from-amber-500 to-orange-600 shadow-amber-500/30 animate-pulse'
            : 'bg-linear-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
          }
        `}>
          {isExpired && <ExclamationTriangleIcon className="w-6 h-6 text-white" />}
          {isDueSoon && !isExpired && <ClockIcon className="w-6 h-6 text-white" />}
          {!isDueSoon && !isExpired && <ShieldCheckIcon className="w-6 h-6 text-white" />}
          
          {/* Ripple Effect for Expired/Due Soon */}
          {(isExpired || isDueSoon) && (
            <div className="absolute inset-0 rounded-xl border-2 border-white/30 animate-ping"></div>
          )}
        </div>
        
        <div>
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <CalendarIcon className="w-3.5 h-3.5" />
            Next Inspection Due Date
          </p>
          <p className="text-xl font-black text-gray-900 dark:text-white mt-1">
            {formatDate(nextInspectionDate)}
          </p>
        </div>
      </div>
      
      {/* Status Pill */}
      <div className={`
        px-3 py-1.5 rounded-full text-xs font-bold shadow-sm
        ${isExpired 
          ? 'bg-linear-to-r from-red-100 to-rose-100 dark:from-red-900/50 dark:to-rose-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' 
          : isDueSoon 
          ? 'bg-linear-to-r from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          : 'bg-linear-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
        }
      `}>
        {isExpired && `OVERDUE by ${Math.abs(daysUntilDue!)} day${Math.abs(daysUntilDue!) !== 1 ? 's' : ''}`}
        {isDueSoon && !isExpired && `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} remaining`}
        {!isDueSoon && !isExpired && daysUntilDue && daysUntilDue > 15 && `Valid for ${daysUntilDue} more days`}
      </div>
    </div>
    
    {/* Progress Bar Section */}
    <div className="mt-4 mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Validity Period</span>
        {daysUntilDue !== null && (
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Expired'}
          </span>
        )}
      </div>
      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`
            h-full rounded-full transition-all duration-1000 ease-out
            ${isExpired 
              ? 'bg-linear-to-r from-red-500 to-rose-500 w-full animate-shake' 
              : isDueSoon 
              ? 'bg-linear-to-r from-amber-500 to-orange-500' 
              : 'bg-linear-to-r from-emerald-500 to-teal-500'
            }
          `}
          style={{ 
            width: daysUntilDue !== null && !isExpired && maxDays !== null 
              ? `${Math.max(0, (daysUntilDue / maxDays) * 100)}%` 
              : '100%' 
          }}
        ></div>
      </div>
    </div>
    
    {/* Info Message with Card Design */}
    <div className={`
      mt-4 p-3 rounded-xl border shadow-sm transition-all duration-300 hover:shadow-md
      ${isExpired 
        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800' 
        : isDueSoon 
        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
        : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
      }
    `}>
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          {isExpired && <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />}
          {isDueSoon && !isExpired && <ClockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />}
          {!isDueSoon && !isExpired && <ShieldCheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        </div>
        
        {/* Message */}
        <div className="flex-1">
          {isExpired && (
            <>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                Inspection Overdue!
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                Vehicle inspection is overdue by <span className="font-bold">{Math.abs(daysUntilDue!)} days</span>. 
                Please get your vehicle inspected immediately to avoid penalties.
              </p>
            </>
          )}
          
          {isDueSoon && !isExpired && (
            <>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                Inspection Due Soon!
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Vehicle inspection is due in <span className="font-bold">{daysUntilDue} days</span>. 
                Please schedule an inspection as soon as possible.
              </p>
            </>
          )}
          
          {!isDueSoon && !isExpired && daysUntilDue !== null && daysUntilDue > 15 && (
            <>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Inspection Valid
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Vehicle inspection is valid for <span className="font-bold">{daysUntilDue} more days</span>. 
                No action needed at this time.
              </p>
            </>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-1 border-t border-gray-200 dark:border-gray-700">
            <span className="font-medium">Note:</span> Vehicle inspections are valid for 15 days from the date of last inspection.
          </p>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Add these animations to your global CSS */}
<style>{`
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  .animate-shake {
    animation: shake 0.5s ease-in-out infinite;
  }
`}</style>
                        </div>
                        
                        
                       {vehicleInspection.inspection_reason && (
  <div className="md:col-span-2">
    <div className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl group">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-rose-50 via-red-50 to-pink-50 dark:from-rose-950/40 dark:via-red-950/40 dark:to-pink-950/40 transition-all duration-500 group-hover:scale-105"></div>
      
      {/* Glowing Border Effect */}
      <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-rose-500 via-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
      
      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-rose-200/40 dark:bg-rose-500/10 blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-red-200/40 dark:bg-red-500/10 blur-3xl"></div>
      
      {/* Top Accent Line with Animation */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-rose-500 via-red-500 to-pink-500 rounded-t-2xl transform origin-left transition-transform duration-500 group-hover:scale-x-100"></div>
      
      {/* Shimmer Effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Animated Icon Container */}
            <div className="relative w-12 h-12 rounded-xl bg-linear-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30 transform transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
              <XCircleIcon className="w-6 h-6 text-white" />
              {/* Pulsing Ring */}
              <div className="absolute inset-0 rounded-xl border-2 border-rose-400/50 animate-ping"></div>
            </div>
            
            <div>
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                Action Required
              </p>
              <h4 className="text-lg font-black text-gray-900 dark:text-white mt-1">
                Rejection Reason
              </h4>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-linear-to-r from-rose-100 to-red-100 dark:from-rose-900/50 dark:to-red-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shadow-sm flex items-center gap-1.5 animate-pulse">
            <XCircleIcon className="w-3.5 h-3.5" />
            Rejected
          </div>
        </div>
        
        {/* Main Content Card */}
        <div className="mt-4 p-5 rounded-xl bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm border border-rose-200 dark:border-rose-800/50 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:bg-white/80 dark:group-hover:bg-gray-900/70">
          <div className="flex items-start gap-4">
            {/* Left Icon Section */}
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-rose-100 to-red-100 dark:from-rose-900/40 dark:to-red-900/40 flex items-center justify-center border border-rose-200 dark:border-rose-800">
                <DocumentTextIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            
            {/* Content Section */}
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300 mb-2">
                Inspector's Comments:
              </p>
              <div className="relative">
                {/* Quote decoration */}
                <div className="absolute -top-2 -left-2 text-4xl text-rose-300 dark:text-rose-700/50 font-serif opacity-50">"</div>
                <p className="text-base font-medium text-gray-800 dark:text-gray-200 leading-relaxed pl-4 py-2">
                  {vehicleInspection.inspection_reason}
                </p>
                <div className="absolute -bottom-2 -right-2 text-4xl text-rose-300 dark:text-rose-700/50 font-serif opacity-50 transform rotate-180">"</div>
              </div>
            </div>
          </div>
        </div>
        
       
        {/* Help Text */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4" />
            Please address the issues mentioned above and resubmit your vehicle for inspection.
          </p>
        </div>
      </div>
    </div>
  </div>
)}
                        
                        {vehicleInspection.inspection_created_at && (
                          <div className="flex items-start gap-3 md:col-span-2 p-3 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                              <ClockIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inspection Request Date</p>
                              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                                {formatDate(vehicleInspection.inspection_created_at)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* No Vehicle Inspection Record Message */}
              {(!vehicleInspection || !vehicleInspection.vehicle_id) && !loadingInspection && (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 text-center">
                  <ShieldCheckIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Inspection Record</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-600">
                    No vehicle inspection record found. Your vehicle will be inspected by admin after submission.
                  </p>
                </div>
              )}
       

              {!isEditing ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  {/* Header with Edit Button */}
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-black dark:bg-white rounded-xl">
                          <TruckIcon className="w-5 h-5 text-white dark:text-black" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Vehicle Information
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {vehicleData.id || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {(status === "REJECTED" || status === "DRAFT") && (
                         <button
  onClick={() => setIsEditing(true)}
  style={{
    paddingLeft: '24px',
    paddingRight: '24px',
    paddingTop: '10px',
    paddingBottom: '10px',
    backgroundColor: '#000000',
    color: '#ffffff',
    borderRadius: '12px',
    fontWeight: '500',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '140px',
    height: '45px',
    justifyContent: 'center'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = '#1f2937';
    e.currentTarget.style.transform = 'scale(1.05)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = '#000000';
    e.currentTarget.style.transform = 'scale(1)';
  }}
>
  <PencilIcon style={{ width: '16px', height: '16px' }} />
  Edit Vehicle
</button>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="p-6 space-y-6">
                    {/* Status Banner */}
                    <div className={`p-4 rounded-xl border-2 ${
                      status === "VERIFIED" ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" :
                      status === "REJECTED" ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" :
                      "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    }`}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className={`p-2 rounded-full ${
                          status === "VERIFIED" ? "bg-green-100 dark:bg-green-800" :
                          status === "REJECTED" ? "bg-red-100 dark:bg-red-800" :
                          "bg-blue-100 dark:bg-blue-800"
                        }`}>
                          {getStatusIcon(vehicleData.verification_status)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold dark:text-gray-400">Verification Status</p>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(vehicleData.verification_status)}`}>
                            {getStatusIcon(vehicleData.verification_status)}
                            {getDisplayStatus(vehicleData.verification_status)}
                          </span>
                        </div>
                        {vehicleData.verification_requested_at && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Submitted On</p>
                            <p className="text-sm font-medium dark:text-gray-200">{formatDateOnly(vehicleData.verification_requested_at)}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ownership Type Banner */}
                    {vehicleData.ownership_type && (
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3">
                          {vehicleData.ownership_type === 'self' ? (
                            <HomeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <KeyIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                              Ownership Type: {vehicleData.ownership_type === 'self' ? 'Self-Owned' : 'Rented/Leased'}
                            </p>
                            {vehicleData.owner_name && (
                              <p className="text-sm text-purple-600 dark:text-purple-400">
                                Owner Name: {vehicleData.owner_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Registration Valid Till Alert */}
                    {vehicleData.registration_valid_till && (
                      <div className={`p-4 rounded-xl border-2 ${
                        isRegistrationExpired() ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" :
                        isRegistrationExpiring() ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800" :
                        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      }`}>
                        <div className="flex items-center gap-3">
                          <CalendarIcon className={`w-5 h-5 ${
                            isRegistrationExpired() ? "text-red-600" :
                            isRegistrationExpiring() ? "text-yellow-600" :
                            "text-green-600"
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-semibold dark:text-gray-300">Registration Valid Till</p>
                            <p className="text-lg font-bold dark:text-gray-200">{formatDateOnly(vehicleData.registration_valid_till)}</p>
                          </div>
                          {isRegistrationExpired() && (
                            <span className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold">
                              EXPIRED
                            </span>
                          )}
                          {isRegistrationExpiring() && !isRegistrationExpired() && (
                            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold">
                              EXPIRING SOON
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Vehicle Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Registration Number
                          </label>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                            {vehicleData.registration_number}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Vehicle Name
                          </label>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                            {vehicleData.vehicle_name}
                          </p>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Model
                          </label>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                            {vehicleData.vehicle_model}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Color
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <div 
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: vehicleData.color?.toLowerCase() || '#ffffff' }}
                            />
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {vehicleData.color}
                            </p>
                          </div>
                        </div>

                        {/* Seat Configuration with RFID */}
                        <div className="p-4 rounded-xl bg-linear-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
                          <label className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                            <CpuChipIcon className="w-3 h-3" />
                            Seat Configuration
                          </label>
                          <div className="grid grid-cols-2 gap-3 mt-2">
                            <div>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">{vehicleData.seat_count}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Total Seats</p>
                            </div>
                            {(vehicleData.default_rfid_reserved_seat_count || 0) > 0 && (
                              <div className="border-l border-indigo-200 dark:border-indigo-700 pl-3">
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{vehicleData.default_rfid_reserved_seat_count}</p>
                                <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                  <WifiIcon className="w-3 h-3" />
                                  RFID Reserved
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            AC Type
                          </label>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                            {vehicleData.has_ac ? "❄️ AC Bus" : "☀️ Non-AC Bus"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RFID Info Card */}
                    {(vehicleData.default_rfid_reserved_seat_count || 0) > 0 && (
                      <div className="rounded-xl bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <WifiIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                                RFID Seat Reservation Active
                              </h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Pre-reserved seats for RFID card holders
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                              <CheckCircleIcon className="w-4 h-4" />
                              ✓ {vehicleData.default_rfid_reserved_seat_count} seat(s) will be reserved for RFID card holders on each trip
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vehicle Photos Section */}
                    {(vehicleData.front_photo_file_path || vehicleData.interior_photo_file_path || 
                      vehicleData.left_side_file_path || vehicleData.right_side_file_path) && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <div className="w-1 h-6 bg-black dark:bg-white rounded-full"></div>
                          Vehicle Photos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {vehicleData.front_photo_file_path && (
                            <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                              <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                                Front View
                              </p>
                              <img 
                                src={`${API_BASE}/${vehicleData.front_photo_file_path}`} 
                                alt="Front" 
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            </div>
                          )}
                          {vehicleData.interior_photo_file_path && (
                            <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                              <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                                Interior
                              </p>
                              <img 
                                src={`${API_BASE}/${vehicleData.interior_photo_file_path}`} 
                                alt="Interior" 
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            </div>
                          )}
                          {vehicleData.left_side_file_path && (
                            <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                              <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                                Left Side
                              </p>
                              <img 
                                src={`${API_BASE}/${vehicleData.left_side_file_path}`} 
                                alt="Left Side" 
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            </div>
                          )}
                          {vehicleData.right_side_file_path && (
                            <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                              <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                                Right Side
                              </p>
                              <img 
                                src={`${API_BASE}/${vehicleData.right_side_file_path}`} 
                                alt="Right Side" 
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                     {/* Documents Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                         <div className="w-1 h-6 bg-black dark:bg-white rounded-full"></div>
                         Documents
                      </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {vehicleData.rear_photo_file_path && (
                          <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                              Rear Photo
                            </p>
                            <img 
                              src={`${API_BASE}/${vehicleData.rear_photo_file_path}`} 
                              alt="Rear" 
                              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                          </div>
                        )}
                        {vehicleData.rc_file_path && (
                          <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                              RC Document
                            </p>
                            {vehicleData.rc_file_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <img 
                                src={`${API_BASE}/${vehicleData.rc_file_path}`} 
                                alt="RC" 
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <div className="text-center">
                                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">PDF Document</p>
                                  <a 
                                    href={`${API_BASE}/${vehicleData.rc_file_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
                                  >
                                    View PDF
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {vehicleData.authentication_file_path && (
                          <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                              Authorization Document
                            </p>
                            {vehicleData.authentication_file_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <img 
                                src={`${API_BASE}/${vehicleData.authentication_file_path}`} 
                                alt="Authorization" 
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <div className="text-center">
                                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">PDF Document</p>
                                  <a 
                                    href={`${API_BASE}/${vehicleData.authentication_file_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
                                  >
                                    View PDF
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {vehicleData.insurance_document && (
                          <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                              Insurance Document
                            </p>
                            {vehicleData.insurance_document.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <img 
                                src={`${API_BASE}/${vehicleData.insurance_document}`} 
                                alt="Insurance" 
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <div className="text-center">
                                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">PDF Document</p>
                                  <a 
                                    href={`${API_BASE}/${vehicleData.insurance_document}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
                                  >
                                    View PDF
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {vehicleData.pollution_document && (
                          <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                              Pollution Certificate
                            </p>
                            {vehicleData.pollution_document.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <img 
                                src={`${API_BASE}/${vehicleData.pollution_document}`} 
                                alt="Pollution" 
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <div className="text-center">
                                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">PDF Document</p>
                                  <a 
                                    href={`${API_BASE}/${vehicleData.pollution_document}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
                                  >
                                    View PDF
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {vehicleData.owner_aadhaar_card && (
                          <div className="group relative rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                            <p className="absolute top-2 left-2 z-10 text-xs bg-black/70 text-white px-2 py-1 rounded-md backdrop-blur-sm">
                              Owner Aadhaar Card
                            </p>
                            {vehicleData.owner_aadhaar_card.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <img 
                                src={`${API_BASE}/${vehicleData.owner_aadhaar_card}`} 
                                alt="Aadhaar" 
                                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                              />
                            ) : (
                              <div className="w-full h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                <div className="text-center">
                                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">PDF Document</p>
                                  <a 
                                    href={`${API_BASE}/${vehicleData.owner_aadhaar_card}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-block px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition"
                                  >
                                    View PDF
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                                 
                    {/* Rejection Reason */}
                    {status === "REJECTED" && vehicleData.rejection_reason && (
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
                        <p className="font-semibold text-red-700 dark:text-red-300 mb-2">❌ Rejection Reason</p>
                        <p className="text-sm text-red-600 dark:text-red-400">{vehicleData.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Edit Form
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Vehicle</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your vehicle information</p>
                  </div>
                  
                  <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Vehicle Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="vehicle_name"
                          value={formVehicle.vehicle_name || ''}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                   bg-white dark:bg-white-800 text-gray-900 dark:text-white
                                   focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                                   transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Vehicle Model <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="vehicle_model"
                          value={formVehicle.vehicle_model || ''}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                   bg-white dark:bg-white-800 text-gray-900 dark:text-white
                                   focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                                   transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Color <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="color"
                          value={formVehicle.color || ''}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                   bg-white dark:bg-white-800 text-gray-900 dark:text-white
                                   focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                                   transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Seat Count <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          name="seat_count"
                          value={formVehicle.seat_count || 0}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                   bg-white dark:bg-white-800 text-gray-900 dark:text-white
                                   focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                                   transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Vehicle Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="has_ac"
                          value={formVehicle.has_ac || 'false'}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                   bg-white dark:bg-white-800 text-gray-900 dark:text-white
                                   focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                                   transition-all duration-200 cursor-pointer"
                        >
                          <option value="true">❄️ AC Bus</option>
                          <option value="false">☀️ Non-AC Bus</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                          Registration Valid Till <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={registrationValidTill}
                          onChange={(e) => setRegistrationValidTill(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                   bg-white dark:bg-gray-300 text-gray-900 dark:text-white
                                   focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                                   transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* RFID Seat Reservation Section */}
                    {isRfidEditAllowed && (
                      <div className="space-y-4">
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <CpuChipIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
                            <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                Enable RFID seat reservation to automatically reserve a specific number of seats for RFID card holders. 
                                These seats will be pre-reserved for passengers with RFID cards on each trip.
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between p-4 rounded-xl bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <WifiIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
                              onClick={() => {
                                setEnableRfidReservation(!enableRfidReservation);
                                if (!enableRfidReservation) {
                                  const seatCount = formVehicle.seat_count || vehicleData?.seat_count || 0;
                                  setRfidReservedSeatCount(Math.floor(seatCount / 4));
                                } else {
                                  setRfidReservedSeatCount(0);
                                }
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                                ${enableRfidReservation ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                  ${enableRfidReservation ? 'translate-x-6' : 'translate-x-1'}`}
                              />
                            </button>
                          </div>
                        </div>

                        {enableRfidReservation && (
                          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              <div className="flex items-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span>Default RFID Reserved Seats</span>
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
                                disabled={rfidReservedSeatCount <= 0}
                              >
                                <MinusIcon className="w-5 h-5" />
                              </button>
                              
                              <div className="flex-1 relative">
                                <ShieldCheckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                                <input
                                  type="number"
                                  value={rfidReservedSeatCount}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    const seatCount = formVehicle.seat_count || vehicleData?.seat_count || 0;
                                    setRfidReservedSeatCount(Math.min(seatCount, Math.max(0, val)));
                                  }}
                                  min="0"
                                  max={formVehicle.seat_count || vehicleData?.seat_count || 0}
                                  className="w-full px-4 py-3 pl-10 rounded-xl border-2 border-purple-200 dark:border-purple-700 
                                           bg-white dark:bg-gray-300 
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
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {formVehicle.seat_count || vehicleData?.seat_count || 0}
                                </p>
                              </div>
                              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                                <p className="text-xs text-purple-600 dark:text-purple-400">RFID Reserved</p>
                                <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{rfidReservedSeatCount}</p>
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              These seats will be automatically reserved for RFID card holders on every trip
                            </p>
                            
                            {rfidReservedSeatCount > 0 && rfidReservedSeatCount <= (formVehicle.seat_count || vehicleData?.seat_count || 0) && (
                              <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                <p className="text-xs text-green-700 dark:text-green-300">
                                  ✓ {rfidReservedSeatCount} seat(s) will be reserved for RFID card holders on each trip
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                     {/* Ownership Type */}
                     <div className="space-y-3">
                       <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
                         Ownership Type <span className="text-red-500">*</span>
                       </label>
                       <div className="grid md:grid-cols-2 gap-4">
                        <button
                           type="button"
                          onClick={() => setOwnershipType('self')}
                          className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left
                                    ${ownershipType === 'self' 
                                      ? 'border-green-500 bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-lg shadow-green-500/20' 
                                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg transition-all duration-300 ${
                              ownershipType === 'self' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30'
                            }`}>
                              <HomeIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-bold text-lg transition-colors duration-300 ${
                                ownershipType === 'self' 
                                  ? 'text-green-700 dark:text-green-400' 
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}>
                                Self-Owned
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Vehicle is personally owned by you.
                              </p>
                            </div>
                            {ownershipType === 'self' && (
                              <div className="shrink-0">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                  <CheckCircleIcon className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setOwnershipType('rented')}
                          className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left
                                    ${ownershipType === 'rented' 
                                      ? 'border-green-500 bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-lg shadow-green-500/20' 
                                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg transition-all duration-300 ${
                              ownershipType === 'rented' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 group-hover:bg-green-100 dark:group-hover:bg-green-900/30'
                            }`}>
                              <KeyIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-bold text-lg transition-colors duration-300 ${
                                ownershipType === 'rented' 
                                  ? 'text-green-700 dark:text-green-400' 
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}>
                                Rented/Leased
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Vehicle is rented or leased.
                              </p>
                            </div>
                            {ownershipType === 'rented' && (
                              <div className="shrink-0">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                                  <CheckCircleIcon className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Rented Vehicle Fields */}
                    {ownershipType === 'rented' && (
                      <div className="space-y-5 animate-fadeIn">
                        <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                          <div className="space-y-5">
                            <div>
                              <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                Owner Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                                placeholder="Enter owner's full name"
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                         bg-white dark:bg-white-800 text-gray-900 dark:text-gray-100
                                         placeholder-gray-400 dark:placeholder-gray-500
                                         focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/20 
                                         transition-all duration-200"
                              />
                            </div>
                            
                            <div>
                              <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                Owner Aadhaar Card
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
                              </label>
                              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:border-green-500 dark:hover:border-green-500 transition-all duration-200">
                                {aadhaarPreview ? (
                                  <div className="relative inline-block">
                                    <img 
                                      src={aadhaarPreview} 
                                      className="w-28 h-28 object-cover rounded-lg border-2 border-green-500 shadow-lg" 
                                      alt="Aadhaar Preview" 
                                    />
                                    <button 
                                      onClick={() => removeFile('aadhaar')} 
                                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
                                    >
                                      <XMarkIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <input 
                                      type="file" 
                                      accept="image/*,application/pdf" 
                                      onChange={(e) => handleFileChange(e, 'aadhaar')}
                                      className="w-full text-sm text-gray-500 dark:text-gray-400
                                               file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                                               file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-950/30
                                               file:text-green-700 dark:file:text-green-400
                                               hover:file:bg-green-100 dark:hover:file:bg-green-900/50
                                               cursor-pointer transition-all duration-200"
                                    />
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                      Supported: JPG, PNG, PDF (Max 5MB)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
                                Authorization Document
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
                              </label>
                              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:border-green-500 dark:hover:border-green-500 transition-all duration-200">
                                {authorizationPreview ? (
                                  <div className="relative inline-block">
                                    <img 
                                      src={authorizationPreview} 
                                      className="w-28 h-28 object-cover rounded-lg border-2 border-green-500 shadow-lg" 
                                      alt="Authorization Preview" 
                                    />
                                    <button 
                                      onClick={() => removeFile('authorization')} 
                                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
                                    >
                                      <XMarkIcon className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center">
                                    <input 
                                      type="file" 
                                      accept="image/*,application/pdf" 
                                      onChange={(e) => handleFileChange(e, 'authorization')}
                                      className="w-full text-sm text-gray-500 dark:text-gray-400
                                               file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                                               file:text-sm file:font-semibold file:bg-green-50 dark:file:bg-green-950/30
                                               file:text-green-700 dark:file:text-green-400
                                               hover:file:bg-green-100 dark:hover:file:bg-green-900/50
                                               cursor-pointer transition-all duration-200"
                                    />
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                      Supported: JPG, PNG, PDF (Max 5MB)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                      {/* Vehicle Photos Upload */}
                   <div className="space-y-6">
  <div className="flex items-center gap-3">
    <div className="w-1 h-8 bg-linear-to-b from-green-500 to-emerald-500 rounded-full"></div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Vehicle Photos</h3>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Front Photo */}
    <div className="group">
      <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Front Photo
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
      </label>
      <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
        ${frontPreview 
          ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
        {frontPreview ? (
          <div className="relative inline-block">
            <img 
              src={frontPreview} 
              className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
              alt="Front Preview" 
            />
            <button 
              onClick={() => removeFile('front')}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'front')}
              className="w-full text-sm text-gray-600 dark:text-gray-400
                       file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold 
                       file:bg-linear-to-r file:from-green-500 file:to-emerald-500
                       file:text-white file:shadow-md
                       hover:file:from-green-600 hover:file:to-emerald-600
                       hover:file:shadow-lg
                       cursor-pointer transition-all duration-200
                       file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              JPG, PNG (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Interior Photo */}
    <div className="group">
      <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Interior Photo
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
      </label>
      <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
        ${interiorPreview 
          ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
        {interiorPreview ? (
          <div className="relative inline-block">
            <img 
              src={interiorPreview} 
              className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
              alt="Interior Preview" 
            />
            <button 
              onClick={() => removeFile('interior')}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'interior')}
              className="w-full text-sm text-gray-600 dark:text-gray-400
                       file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold 
                       file:bg-linear-to-r file:from-green-500 file:to-emerald-500
                       file:text-white file:shadow-md
                       hover:file:from-green-600 hover:file:to-emerald-600
                       hover:file:shadow-lg
                       cursor-pointer transition-all duration-200
                       file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              JPG, PNG (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Left Side Photo */}
    <div className="group">
      <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Left Side Photo
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
      </label>
      <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
        ${leftSidePreview 
          ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
        {leftSidePreview ? (
          <div className="relative inline-block">
            <img 
              src={leftSidePreview} 
              className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
              alt="Left Side Preview" 
            />
            <button 
              onClick={() => removeFile('left')}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'left')}
              className="w-full text-sm text-gray-600 dark:text-gray-400
                       file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold 
                       file:bg-linear-to-r file:from-green-500 file:to-emerald-500
                       file:text-white file:shadow-md
                       hover:file:from-green-600 hover:file:to-emerald-600
                       hover:file:shadow-lg
                       cursor-pointer transition-all duration-200
                       file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              JPG, PNG (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Right Side Photo */}
    <div className="group">
      <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Right Side Photo
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
      </label>
      <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
        ${rightSidePreview 
          ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
        {rightSidePreview ? (
          <div className="relative inline-block">
            <img 
              src={rightSidePreview} 
              className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
              alt="Right Side Preview" 
            />
            <button 
              onClick={() => removeFile('right')}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'right')}
              className="w-full text-sm text-gray-600 dark:text-gray-400
                       file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold 
                       file:bg-linear-to-r file:from-green-500 file:to-emerald-500
                       file:text-white file:shadow-md
                       hover:file:from-green-600 hover:file:to-emerald-600
                       hover:file:shadow-lg
                       cursor-pointer transition-all duration-200
                       file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              JPG, PNG (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>

{/* Required Documents Upload */}
<div className="space-y-6 mt-8">
  <div className="flex items-center gap-3">
    <div className="w-1 h-8 bg-linear-to-b from-red-500 to-orange-500 rounded-full"></div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Required Documents</h3>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Rear Photo */}
    <div className="group">
      <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Rear Photo 
        <span className="text-red-500 text-sm ml-1">*</span>
      </label>
      <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
        ${rearPreview 
          ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : 'border-red-300 dark:border-red-800 hover:border-green-400 dark:hover:border-green-500 bg-red-50/10 dark:bg-red-950/10'}`}>
        {rearPreview ? (
          <div className="relative inline-block">
            <img 
              src={rearPreview} 
              className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
              alt="Rear Preview" 
            />
            <button 
              onClick={() => removeFile('rear')}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, 'rear')}
              className="w-full text-sm text-gray-600 dark:text-gray-400
                       file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold 
                       file:bg-linear-to-r file:from-red-500 file:to-orange-500
                       file:text-white file:shadow-md
                       hover:file:from-red-600 hover:file:to-orange-600
                       hover:file:shadow-lg
                       cursor-pointer transition-all duration-200
                       file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              JPG, PNG (Required)
            </p>
          </div>
        )}
      </div>
    </div>

    {/* RC Document */}
    <div className="group">
      <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
        RC Document 
        <span className="text-red-500 text-sm ml-1">*</span>
      </label>
      <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
        ${rcPreview 
          ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : 'border-red-300 dark:border-red-800 hover:border-green-400 dark:hover:border-green-500 bg-red-50/10 dark:bg-red-950/10'}`}>
        {rcPreview ? (
          <div className="relative inline-block">
            {rcPreview.match(/\.(jpg|jpeg|png)$/i) ? (
              <img 
                src={rcPreview} 
                className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
                alt="RC Preview" 
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <button 
              onClick={() => removeFile('rc')}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={(e) => handleFileChange(e, 'rc')}
              className="w-full text-sm text-gray-600 dark:text-gray-400
                       file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold 
                       file:bg-linear-to-r file:from-red-500 file:to-orange-500
                       file:text-white file:shadow-md
                       hover:file:from-red-600 hover:file:to-orange-600
                       hover:file:shadow-lg
                       cursor-pointer transition-all duration-200
                       file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              JPG, PNG, PDF (Required)
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Insurance Document */}
    <div className="group">
      <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Insurance Document
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
      </label>
      <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
        ${insurancePreview 
          ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
        {insurancePreview ? (
          <div className="relative inline-block">
            {insurancePreview.match(/\.(jpg|jpeg|png)$/i) ? (
              <img 
                src={insurancePreview} 
                className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
                alt="Insurance Preview" 
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <button 
              onClick={() => removeFile('insurance')}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={(e) => handleFileChange(e, 'insurance')}
              className="w-full text-sm text-gray-600 dark:text-gray-400
                       file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold 
                       file:bg-linear-to-r file:from-blue-500 file:to-indigo-500
                       file:text-white file:shadow-md
                       hover:file:from-blue-600 hover:file:to-indigo-600
                       hover:file:shadow-lg
                       cursor-pointer transition-all duration-200
                       file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              JPG, PNG, PDF (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Pollution Certificate */}
    <div className="group">
      <label className="block font-semibold mb-2 text-gray-700 dark:text-gray-300">
        Pollution Certificate
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">(Optional)</span>
      </label>
      <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-300
        ${pollutionPreview 
          ? 'border-green-500 bg-green-50/30 dark:bg-green-950/20' 
          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 bg-gray-50/30 dark:bg-gray-800/30'}`}>
        {pollutionPreview ? (
          <div className="relative inline-block">
            {pollutionPreview.match(/\.(jpg|jpeg|png)$/i) ? (
              <img 
                src={pollutionPreview} 
                className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-white dark:border-gray-700" 
                alt="Pollution Preview" 
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <button 
              onClick={() => removeFile('pollution')}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200 hover:scale-110"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <input 
              type="file" 
              accept="image/*,application/pdf" 
              onChange={(e) => handleFileChange(e, 'pollution')}
              className="w-full text-sm text-gray-600 dark:text-gray-400
                       file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                       file:text-sm file:font-semibold 
                       file:bg-linear-to-r file:from-purple-500 file:to-pink-500
                       file:text-white file:shadow-md
                       hover:file:from-purple-600 hover:file:to-pink-600
                       hover:file:shadow-lg
                       cursor-pointer transition-all duration-200
                       file:cursor-pointer"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              JPG, PNG, PDF (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
</div>
                    <div className="flex justify-center gap-4 pt-4">
                      <button
                        onClick={handleUpdate}
                        className="px-8 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg"
                        style={{
                          minWidth: '140px',
                          height: '48px',
                          justifyContent: 'center'
                        }}
                      >
                        💾 Save Changes
                      </button>

                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setRearPreview(null);
                          setRcPreview(null);
                          setFrontPreview(null);
                          setInteriorPreview(null);
                          setLeftSidePreview(null);
                          setRightSidePreview(null);
                          setAuthorizationPreview(null);
                          setInsurancePreview(null);
                          setPollutionPreview(null);
                          setAadhaarPreview(null);
                          setRearPhoto(null);
                          setRcFile(null);
                          setFrontPhoto(null);
                          setInteriorPhoto(null);
                          setLeftSidePhoto(null);
                          setRightSidePhoto(null);
                          setAuthorizationFile(null);
                          setInsuranceDocument(null);
                          setPollutionDocument(null);
                          setOwnerAadhaarCard(null);
                          if (vehicleData?.registration_valid_till) {
                            setRegistrationValidTill(vehicleData.registration_valid_till.split('T')[0]);
                          }
                          setOwnershipType(vehicleData?.ownership_type || '');
                          setOwnerName(vehicleData?.owner_name || '');
                          setEnableRfidReservation(vehicleData?.enable_rfid_reservation || false);
                          setRfidReservedSeatCount(vehicleData?.default_rfid_reserved_seat_count || 0);
                        }}
                        className="px-8 py-3 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg"
                        style={{
                          minWidth: '140px',
                          height: '48px',
                          justifyContent: 'center'
                        }}
                      >
                        <XMarkIcon className="w-5 h-5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </IonContent>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
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

export default DriverVehicle;