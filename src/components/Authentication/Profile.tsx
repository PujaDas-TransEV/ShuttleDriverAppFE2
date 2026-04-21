// import React, { useState, useEffect, ChangeEvent } from 'react';
// import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
// import { Preferences } from '@capacitor/preferences';
// import NavbarSidebar from '../users/pages/Navbar';
// import { 
//   UserCircleIcon, 
//   PhoneIcon,
//   StarIcon,
//   CheckBadgeIcon,
//   CameraIcon,
//   PencilSquareIcon,
//   XMarkIcon,
//   CheckIcon,
//   EnvelopeIcon,
//   TruckIcon,
//   ShieldCheckIcon,
//   ExclamationTriangleIcon,
//   ClockIcon,
//   CalendarIcon,
//   DocumentCheckIcon,
//   EyeIcon
// } from '@heroicons/react/24/outline';
// import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

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

// // Vehicle Inspection Status Interface
// interface VehicleInspection {
//   vehicle_id: string;
//   inspection_status: 'pending' | 'approved' | 'rejected' | 'expired';
//   inspection_reason: string | null;
//   inspection_created_at: string | null;
//   inspection_reviewed_at: string | null;
// }

// const ProfileSetup: React.FC = () => {
//   const [profile, setProfile] = useState({
//     id: '',
//     user_id: '',
//     name: '',
//     phone: '',
//     email: '',
//     profile_picture_path: '',
//     verification_status: '',
//     average_rating: null as number | null,
//     total_reviews: 0
//   });

//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [isCreated, setIsCreated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');
//   const [isEditing, setIsEditing] = useState(false);
//   const [imagePreview, setImagePreview] = useState<string>('');
//   const [profileImageUrl, setProfileImageUrl] = useState<string>('');
//   const [token, setToken] = useState<string | null>(null);
  
//   // Vehicle Inspection State
//   const [vehicleInspection, setVehicleInspection] = useState<VehicleInspection | null>(null);
//   const [loadingInspection, setLoadingInspection] = useState(false);
//   const [showInspectionDetails, setShowInspectionDetails] = useState(false);

//   // ======================
//   // Get token on component mount
//   // ======================
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//       if (!accessToken) {
//         setToastMsg("Session expired. Please login again.");
//       }
//     };
//     loadToken();
//   }, []);

//   // ======================
//   // Fetch profile when token is available
//   // ======================
//   useEffect(() => {
//     if (token) {
//       fetchProfile();
//       fetchVehicleInspection();
//     }
//   }, [token]);

//   // ======================
//   // Get full profile image URL
//   // ======================
//   const getFullImageUrl = (path: string) => {
//     if (!path) return '';
//     const normalizedPath = path.replace(/\\/g, '/');
//     if (normalizedPath.startsWith('http')) return normalizedPath;
//     return `${API_BASE}/${normalizedPath}`;
//   };

//   // ======================
//   // Fetch profile from /driver-profile/me
//   // ======================
//   const fetchProfile = async () => {
//     if (!token) {
//       setToastMsg("Session expired. Please login again.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver-profile/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
      
//       if (res.status === 404) {
//         setIsCreated(false);
//         setLoading(false);
//         return;
//       }
      
//       if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
//       const data = await res.json();
      
//       console.log("Fetched profile data:", data);
      
//       const profileData = {
//         id: data.id || '',
//         user_id: data.user_id || '',
//         name: data.full_name || '',
//         phone: data.phone || '',
//         email: data.email || '',
//         profile_picture_path: data.profile_picture_path || '',
//         verification_status: data.verification_status || 'pending',
//         average_rating: data.average_rating || null,
//         total_reviews: data.total_reviews || 0
//       };
      
//       setProfile(profileData);
      
//       if (profileData.profile_picture_path) {
//         const fullUrl = getFullImageUrl(profileData.profile_picture_path);
//         console.log("Profile image URL:", fullUrl);
//         setProfileImageUrl(fullUrl);
//       } else {
//         setProfileImageUrl('');
//       }
      
//       setIsCreated(true);
//     } catch (err) {
//       console.error(err);
//       if (err instanceof Error && !err.message.includes('404')) {
//         setToastMsg("Failed to load profile");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ======================
//   // Fetch Vehicle Inspection Status
//   // ======================
//   const fetchVehicleInspection = async () => {
//     if (!token) return;
    
//     setLoadingInspection(true);
//     try {
//       const response = await fetch(`${API_BASE}/driver/vehicle/inspection-status`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       if (response.status === 404) {
//         console.log("No vehicle inspection data found");
//         setVehicleInspection(null);
//         return;
//       }
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch inspection status: ${response.status}`);
//       }
      
//       const data = await response.json();
//       console.log("Vehicle inspection data:", data);
//       setVehicleInspection(data);
      
//     } catch (error) {
//       console.error("Error fetching vehicle inspection:", error);
//       // Don't show toast for this as it's not critical
//     } finally {
//       setLoadingInspection(false);
//     }
//   };

//   // ======================
//   // Handle form changes
//   // ======================
//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setProfile({ ...profile, [name]: value });
//   };

//   // ======================
//   // Handle image upload
//   // ======================
//   const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
    
//     if (!file.type.startsWith('image/')) {
//       setToastMsg("Please select an image file");
//       return;
//     }
    
//     if (file.size > 5 * 1024 * 1024) {
//       setToastMsg("Image size should be less than 5MB");
//       return;
//     }
    
//     setImageFile(file);
//     const previewUrl = URL.createObjectURL(file);
//     setImagePreview(previewUrl);
//   };

//   // ======================
//   // Create profile using /driver-profile
//   // ======================
//   const createProfile = async () => {
//     if (!token) {
//       setToastMsg("No session. Please login again.");
//       return;
//     }

//     if (!profile.name.trim()) {
//       setToastMsg("Please enter your full name");
//       return;
//     }

//     if (!profile.phone.trim()) {
//       setToastMsg("Please enter your phone number");
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     formData.append("full_name", profile.name);
//     formData.append("phone", profile.phone);
    
//     if (imageFile) {
//       formData.append("profile_pic", imageFile);
//     }

//     try {
//       const url = `${API_BASE}/driver-profile`;
//       console.log("Creating profile at:", url);
      
//       const res = await fetch(url, {
//         method: "POST",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });
      
//       const data = await res.json();
//       console.log("Create response:", data);
      
//       if (res.ok) {
//         setToastMsg("Profile created successfully!");
//         setImageFile(null);
//         setImagePreview('');
//         setIsEditing(false);
//         setTimeout(() => {
//           fetchProfile();
//           fetchVehicleInspection();
//         }, 500);
//       } else {
//         setToastMsg(data.detail?.message || data.message || "Failed to create profile");
//       }
//     } catch (err) {
//       console.error("Error creating profile:", err);
//       setToastMsg("Failed to create profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ======================
//   // Update profile using /driver-profile/update
//   // ======================
//   const updateProfile = async () => {
//     if (!token) {
//       setToastMsg("No session. Please login again.");
//       return;
//     }

//     if (!profile.name.trim()) {
//       setToastMsg("Please enter your full name");
//       return;
//     }

//     if (!profile.phone.trim()) {
//       setToastMsg("Please enter your phone number");
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     formData.append("full_name", profile.name);
//     formData.append("phone", profile.phone);

//     if (imageFile) {
//       formData.append("profile_pic", imageFile);
//     }

//     try {
//       const url = `${API_BASE}/driver-profile/update`;
//       console.log("Updating profile at:", url);
      
//       const res = await fetch(url, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       });
      
//       const data = await res.json();
//       console.log("Update response:", data);
      
//       if (res.ok) {
//         setToastMsg("Profile updated successfully!");
//         setImageFile(null);
//         setImagePreview('');
//         setIsEditing(false);
//         setTimeout(() => {
//           fetchProfile();
//           fetchVehicleInspection();
//         }, 500);
//       } else {
//         setToastMsg(data.detail?.message || data.message || "Failed to update profile");
//       }
//     } catch (err) {
//       console.error("Error updating profile:", err);
//       setToastMsg("Failed to update profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ======================
//   // Save profile (create or update based on state)
//   // ======================
//   const saveProfile = async () => {
//     if (isCreated) {
//       await updateProfile();
//     } else {
//       await createProfile();
//     }
//   };

//   // ======================
//   // Calculate next inspection due date (15 days after inspection_reviewed_at)
//   // ======================
//   const getNextInspectionDueDate = (): string | null => {
//     if (!vehicleInspection?.inspection_reviewed_at) return null;
    
//     const reviewedDate = new Date(vehicleInspection.inspection_reviewed_at);
//     const nextDueDate = new Date(reviewedDate);
//     nextDueDate.setDate(reviewedDate.getDate() + 15);
    
//     return nextDueDate.toISOString();
//   };

//   // ======================
//   // Get Days Until Due
//   // ======================
//   const getDaysUntilDue = (): number | null => {
//     const nextDueDateStr = getNextInspectionDueDate();
//     if (!nextDueDateStr) return null;
    
//     const dueDate = new Date(nextDueDateStr);
//     const today = new Date();
//     // Reset time part for accurate day calculation
//     today.setHours(0, 0, 0, 0);
//     dueDate.setHours(0, 0, 0, 0);
    
//     const diffTime = dueDate.getTime() - today.getTime();
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
//     return diffDays;
//   };

//   // ======================
//   // Get Inspection Status Badge
//   // ======================
//   const getInspectionStatusBadge = () => {
//     if (!vehicleInspection) {
//       return { 
//         color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', 
//         icon: null, 
//         text: 'No Vehicle Assigned',
//         borderColor: 'border-gray-300 dark:border-gray-600'
//       };
//     }
    
//     switch(vehicleInspection.inspection_status) {
//       case 'approved':
//         return { 
//           color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', 
//           icon: ShieldCheckIcon, 
//           text: 'Inspection Approved',
//           borderColor: 'border-green-500 dark:border-green-400'
//         };
//       case 'pending':
//         return { 
//           color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', 
//           icon: ClockIcon, 
//           text: 'Inspection Pending',
//           borderColor: 'border-yellow-500 dark:border-yellow-400'
//         };
//       case 'rejected':
//         return { 
//           color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', 
//           icon: ExclamationTriangleIcon, 
//           text: 'Inspection Rejected',
//           borderColor: 'border-red-500 dark:border-red-400'
//         };
//       case 'expired':
//         return { 
//           color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', 
//           icon: ExclamationTriangleIcon, 
//           text: 'Inspection Expired',
//           borderColor: 'border-orange-500 dark:border-orange-400'
//         };
//       default:
//         return { 
//           color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', 
//           icon: null, 
//           text: 'Unknown Status',
//           borderColor: 'border-gray-300 dark:border-gray-600'
//         };
//     }
//   };

//   // ======================
//   // Format Date
//   // ======================
//   const formatDate = (dateString: string | null | undefined): string => {
//     if (!dateString) return 'Not scheduled';
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date.getTime())) return 'Invalid date';
//       return date.toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long', 
//         day: 'numeric' 
//       });
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   const getVerificationBadge = () => {
//     switch(profile.verification_status) {
//       case 'verified':
//         return { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckBadgeIcon, text: 'Verified Driver' };
//       case 'pending':
//         return { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: null, text: 'Pending Verification' };
//       default:
//         return { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: null, text: 'Unverified' };
//     }
//   };

//   const verificationBadge = getVerificationBadge();
//   const inspectionBadge = getInspectionStatusBadge();
//   const daysUntilDue = getDaysUntilDue();
//   const nextInspectionDate = getNextInspectionDueDate();
//   const isExpired = daysUntilDue !== null && daysUntilDue < 0;
//   const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 15;

//   const displayImage = imagePreview || profileImageUrl;

//   // Show loading while getting token
//   if (token === null) {
//     return (
//       <IonPage>
//         <IonContent className="flex items-center justify-center">
//           <div className="flex items-center justify-center h-full">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
//               <p className="mt-4 text-gray-600 dark:text-gray-400">Loading session...</p>
//             </div>
//           </div>
//         </IonContent>
//       </IonPage>
//     );
//   }

//   return (
//     <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
//       <NavbarSidebar />
      
//       <IonContent className="relative">
//         <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
//         <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-4xl mx-auto">
//           {/* Header Section */}
//           <div className="mb-8 text-center md:text-left">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium mb-4">
//               <UserCircleIcon className="w-4 h-4" />
//               <span>Driver Profile</span>
//             </div>
//             <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-700 bg-clip-text text-transparent">
//               {isCreated ? "My Profile" : "Complete Your Profile"}
//             </h1>
//             <p className="text-gray-500 dark:text-gray-400 mt-2">
//               {isCreated ? "View and manage your driver information" : "Fill in your details to get started"}
//             </p>
//           </div>

//           {/* Vehicle Inspection Card - Only show when profile is created and vehicle assigned */}
//        {isCreated && vehicleInspection && vehicleInspection.vehicle_id && (
//   <div className={`mb-6 rounded-2xl border-2 ${inspectionBadge.borderColor} overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl`}>
//     <div className={`p-5 ${inspectionBadge.color.replace('text', 'bg').replace('dark:text', 'dark:bg')} bg-opacity-10 dark:bg-opacity-10`}>
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div className="flex items-center gap-3">
//           <div className={`w-12 h-12 rounded-full ${inspectionBadge.color} flex items-center justify-center shadow-md`}>
//             {inspectionBadge.icon ? (
//               <inspectionBadge.icon className="w-6 h-6" />
//             ) : (
//               <TruckIcon className="w-6 h-6" />
//             )}
//           </div>
//           <div>
//             <h3 className="text-lg font-bold text-gray-900 dark:text-white">
//               Vehicle Inspection Status
//             </h3>
//             <div className="flex items-center gap-2 mt-1 flex-wrap">
//               <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${inspectionBadge.color}`}>
//                 {inspectionBadge.text}
//               </span>
//               {!isExpired && daysUntilDue !== null && daysUntilDue <= 15 && daysUntilDue > 0 && (
//                 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
//                   <ClockIcon className="w-3 h-3" />
//                   Due in {daysUntilDue} days
//                 </span>
//               )}
//               {isExpired && (
//                 <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
//                   <ExclamationTriangleIcon className="w-3 h-3" />
//                   Overdue by {Math.abs(daysUntilDue!)} days
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowInspectionDetails(!showInspectionDetails)}
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: '8px',
//             padding: '10px 20px',
//             height: '42px',
//             background: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
//             color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
//             fontWeight: '600',
//             fontSize: '14px',
//             borderRadius: '12px',
//             border: `1px solid ${document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'}`,
//             cursor: 'pointer',
//             transition: 'all 0.3s ease',
//             boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
//           }}
//           onMouseEnter={(e) => {
//             const isDark = document.documentElement.classList.contains('dark');
//             e.currentTarget.style.background = isDark ? '#4b5563' : '#e5e7eb';
//             e.currentTarget.style.transform = 'translateY(-1px)';
//             e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
//           }}
//           onMouseLeave={(e) => {
//             const isDark = document.documentElement.classList.contains('dark');
//             e.currentTarget.style.background = isDark ? '#374151' : '#f3f4f6';
//             e.currentTarget.style.transform = 'translateY(0)';
//             e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
//           }}
//         >
//           <EyeIcon style={{ width: '18px', height: '18px' }} />
//           {showInspectionDetails ? "Hide Details" : "View Details"}
//         </button>
//       </div>
//     </div>
    
//     {/* Inspection Details - Expandable */}
//     {showInspectionDetails && (
//       <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//           <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
//             <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
//               <CalendarIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//             </div>
//             <div>
//               <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Inspection Date</p>
//               <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
//                 {formatDate(vehicleInspection.inspection_reviewed_at)}
//               </p>
//               {vehicleInspection.inspection_reviewed_at && (
//                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
//                   <CheckBadgeIcon className="w-3 h-3" />
//                   Vehicle was inspected on this date
//                 </p>
//               )}
//             </div>
//           </div>
          
//           <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
//             <div className={`w-8 h-8 rounded-full ${isExpired ? 'bg-red-100 dark:bg-red-900/30' : isDueSoon ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'} flex items-center justify-center shrink-0`}>
//               <CalendarIcon className={`w-4 h-4 ${isExpired ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`} />
//             </div>
//             <div>
//               <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Next Inspection Due Date</p>
//               <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
//                 {formatDate(nextInspectionDate)}
//               </p>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Due 15 days after last inspection
//               </p>
//               {isDueSoon && daysUntilDue !== null && daysUntilDue > 0 && (
//                 <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
//                   <ClockIcon className="w-3 h-3" />
//                   ⚠️ Vehicle inspection due in {daysUntilDue} days. Please schedule an inspection.
//                 </p>
//               )}
//               {isExpired && daysUntilDue !== null && (
//                 <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
//                   <ExclamationTriangleIcon className="w-3 h-3" />
//                   ❌ Vehicle inspection is overdue by {Math.abs(daysUntilDue)} days! Please get your vehicle inspected immediately.
//                 </p>
//               )}
//               {vehicleInspection.inspection_status === 'approved' && !isDueSoon && !isExpired && daysUntilDue !== null && daysUntilDue > 15 && (
//                 <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
//                   <ShieldCheckIcon className="w-3 h-3" />
//                   ✅ Vehicle inspection is valid for {daysUntilDue} more days
//                 </p>
//               )}
//             </div>
//           </div>
          
//           {vehicleInspection.inspection_reason && (
//             <div className="flex items-start gap-3 md:col-span-2 p-3 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
//               <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
//                 <DocumentCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inspection Rejected Reason</p>
//                 <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
//                   {vehicleInspection.inspection_reason}
//                 </p>
//               </div>
//             </div>
//           )}
          
//           {vehicleInspection.inspection_created_at && (
//             <div className="flex items-start gap-3 md:col-span-2 p-3 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
//               <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
//                 <ClockIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
//               </div>
//               <div>
//                 <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inspection Request Date</p>
//                 <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
//                   {formatDate(vehicleInspection.inspection_created_at)}
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
        
      
//       </div>
//     )}
//   </div>
// )}

//           {/* No Vehicle Assigned Message */}
//           {isCreated && (!vehicleInspection || !vehicleInspection.vehicle_id) && !loadingInspection && (
//             <div className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 text-center">
//               <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Vehicle Assigned</h3>
//               <p className="text-sm text-gray-500 dark:text-gray-600">
//                 No vehicle has been assigned to you yet. Please contact the administrator.
//               </p>
//             </div>
//           )}

//           {/* Main Profile Card */}
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
//             {/* Profile Header with Gradient */}
//             <div className="relative">
//               <div className="h-24 bg-linear-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800"></div>
              
//               {/* Profile Image */}
//               <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 md:left-8 md:translate-x-0">
//                 <div className="relative">
//                   <div 
//                     className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl cursor-pointer group bg-white dark:bg-gray-700"
//                     onClick={() => document.getElementById('profileUpload')?.click()}
//                   >
//                     {displayImage ? (
//                       <img
//                         src={displayImage}
//                         alt="Profile"
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           console.error("Image failed to load:", displayImage);
//                           e.currentTarget.style.display = 'none';
//                           const parent = e.currentTarget.parentElement;
//                           if (parent) {
//                             const existingIcon = parent.querySelector('.fallback-icon');
//                             if (!existingIcon) {
//                               const icon = document.createElement('div');
//                               icon.className = 'fallback-icon w-full h-full flex items-center justify-center';
//                               icon.innerHTML = '<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
//                               parent.appendChild(icon);
//                             }
//                           }
//                         }}
//                       />
//                     ) : (
//                       <UserCircleIcon className="w-full h-full text-gray-400 dark:text-gray-500" />
//                     )}
//                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
//                       <CameraIcon className="w-6 h-6 text-white" />
//                     </div>
//                   </div>
//                   <input
//                     type="file"
//                     accept="image/*"
//                     id="profileUpload"
//                     onChange={handleImageChange}
//                     className="hidden"
//                   />
//                 </div>
//               </div>

//               {/* Edit Button */}
//               {isCreated && !isEditing && (
//                 <button
//                   onClick={() => setIsEditing(true)}
//                   className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
//                 >
//                   <PencilSquareIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
//                 </button>
//               )}
//             </div>

//             {/* Profile Content */}
//             <div className="pt-16 pb-6 px-6">
//               {/* Name and Verification */}
//               <div className="text-center md:text-left">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
//                   <div>
//                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
//                       {profile.name || "Driver Name"}
//                     </h2>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       Driver ID: {profile.id ? profile.id.slice(0, 8) : 'Not created'}...
//                     </p>
//                   </div>
//                   {isCreated && (
//                     <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${verificationBadge.color} w-fit mx-auto md:mx-0`}>
//                       {verificationBadge.icon && <verificationBadge.icon className="w-4 h-4" />}
//                       <span className="text-sm font-semibold">{verificationBadge.text}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Email Display - Non-editable */}
//               {isCreated && (
//                 <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
//                         <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
//                         <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.email || "Not provided"}</p>
//                       </div>
//                     </div>
//                     <div className="text-xs text-gray-400 dark:text-gray-500">
//                       <span className="inline-flex items-center gap-1">
//                         <CheckBadgeIcon className="w-3 h-3" />
//                         Verified
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Rating Section */}
//               {isCreated && (
//                 <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
//                         <StarSolidIcon className="w-6 h-6 text-yellow-500" />
//                       </div>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">
//                         Driver Rating
//                       </p>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-3xl font-bold text-gray-900 dark:text-white">
//                         {profile.average_rating ? profile.average_rating.toFixed(1) : "0.0"}
//                       </p>
//                       <div className="flex gap-1 justify-end mt-1">
//                         {[1,2,3,4,5].map((star) => (
//                           <StarSolidIcon
//                             key={star}
//                             className={`w-5 h-5 ${
//                               profile.average_rating && star <= Math.round(profile.average_rating)
//                                 ? "text-yellow-400"
//                                 : "text-gray-300 dark:text-gray-600"
//                             }`}
//                           />
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Form Fields - Only show when editing or creating */}
//               {(isEditing || !isCreated) && (
//                 <div className="mt-6 space-y-5">
//                   {/* Full Name */}
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
//                       Full Name <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
//                       <input
//                         type="text"
//                         name="name"
//                         value={profile.name}
//                         onChange={handleChange}
//                         placeholder="Enter your full name"
//                         className="w-full pl-11 pr-4 py-3 rounded-xl 
//                                    border border-gray-300 dark:border-gray-600 
//                                    bg-white dark:bg-gray-700 
//                                    text-gray-900 dark:text-gray-100 
//                                    placeholder-gray-400 dark:placeholder-gray-500
//                                    focus:outline-none
//                                    focus:border-gray-500 dark:focus:border-gray-400
//                                    focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
//                                    transition-all duration-200"
//                       />
//                     </div>
//                   </div>

//                   {/* Phone Number */}
//                   <div>
//                     <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
//                       Phone Number <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
//                       <input
//                         type="tel"
//                         name="phone"
//                         value={profile.phone}
//                         onChange={handleChange}
//                         placeholder="Enter your phone number"
//                         className="w-full pl-11 pr-4 py-3 rounded-xl 
//                                    border border-gray-300 dark:border-gray-600 
//                                    bg-white dark:bg-gray-700 
//                                    text-gray-900 dark:text-white 
//                                    placeholder-gray-400 dark:placeholder-gray-400
//                                    focus:outline-none
//                                    focus:border-gray-500 dark:focus:border-gray-400
//                                    focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
//                                    transition-all duration-200"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Read-only view when not editing */}
//               {isCreated && !isEditing && (
//                 <div className="mt-6">
//                   <div className="grid grid-cols-1 gap-4">
//                     <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
//                       <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
//                       <div className="flex items-center gap-2">
//                         <PhoneIcon className="w-4 h-4 text-gray-400" />
//                         <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.phone || "Not provided"}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
//                 {(isEditing || !isCreated) && (
//                   <>
//                     <button
//                       onClick={saveProfile}
//                       disabled={loading}
//                       style={{
//                         width: '200px',
//                         height: '50px',
//                         borderRadius: '14px',
//                         background: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
//                         color: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
//                         fontWeight: '600',
//                         fontSize: '15px',
//                         border: document.documentElement.classList.contains('dark') ? '1px solid #e5e7eb' : 'none',
//                         cursor: loading ? 'not-allowed' : 'pointer',
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         gap: '10px',
//                         transition: 'all 0.25s ease',
//                         boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
//                         opacity: loading ? 0.6 : 1,
//                       }}
//                       onMouseEnter={(e) => {
//                         if (loading) return;
//                         const isDark = document.documentElement.classList.contains('dark');
//                         e.currentTarget.style.background = isDark ? '#f3f4f6' : '#1f2937';
//                         e.currentTarget.style.transform = 'translateY(-2px)';
//                         e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
//                       }}
//                       onMouseLeave={(e) => {
//                         if (loading) return;
//                         const isDark = document.documentElement.classList.contains('dark');
//                         e.currentTarget.style.background = isDark ? '#ffffff' : '#111827';
//                         e.currentTarget.style.transform = 'translateY(0)';
//                         e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
//                       }}
//                     >
//                       <CheckIcon style={{ width: '20px', height: '20px' }} />
//                       {loading ? 'Saving...' : (isCreated ? 'Update Profile' : 'Create Profile')}
//                     </button>

//                     {isCreated && (
//                       <button
//                         onClick={() => {
//                           setIsEditing(false);
//                           setImagePreview('');
//                           setImageFile(null);
//                           fetchProfile();
//                         }}
//                         style={{
//                           width: '180px',
//                           height: '50px',
//                           borderRadius: '14px',
//                           background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f3f4f6',
//                           color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
//                           fontWeight: '600',
//                           fontSize: '15px',
//                           border: `1px solid ${document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'}`,
//                           cursor: 'pointer',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           gap: '10px',
//                           transition: 'all 0.25s ease',
//                         }}
//                         onMouseEnter={(e) => {
//                           const isDark = document.documentElement.classList.contains('dark');
//                           e.currentTarget.style.background = isDark ? '#374151' : '#e5e7eb';
//                           e.currentTarget.style.transform = 'translateY(-2px)';
//                           e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
//                         }}
//                         onMouseLeave={(e) => {
//                           const isDark = document.documentElement.classList.contains('dark');
//                           e.currentTarget.style.background = isDark ? '#1f2937' : '#f3f4f6';
//                           e.currentTarget.style.transform = 'translateY(0)';
//                           e.currentTarget.style.boxShadow = 'none';
//                         }}
//                       >
//                         <XMarkIcon style={{ width: '20px', height: '20px' }} />
//                         Cancel
//                       </button>
//                     )}
//                   </>
//                 )}

//                 {isCreated && !isEditing && (
//                   <button
//                     onClick={() => setIsEditing(true)}
//                     style={{
//                       width: '180px',
//                       height: '48px',
//                       background: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
//                       color: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
//                       fontWeight: '600',
//                       fontSize: '14px',
//                       borderRadius: '12px',
//                       border: document.documentElement.classList.contains('dark') ? '1px solid #e5e7eb' : 'none',
//                       cursor: 'pointer',
//                       display: 'inline-flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       gap: '8px',
//                       transition: 'all 0.3s ease',
//                       boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
//                     }}
//                     onMouseEnter={(e) => {
//                       const isDark = document.documentElement.classList.contains('dark');
//                       e.currentTarget.style.background = isDark ? '#f9fafb' : '#1f2937';
//                       e.currentTarget.style.transform = 'translateY(-1px)';
//                       e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       const isDark = document.documentElement.classList.contains('dark');
//                       e.currentTarget.style.background = isDark ? '#ffffff' : '#111827';
//                       e.currentTarget.style.transform = 'translateY(0)';
//                       e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
//                     }}
//                   >
//                     <PencilSquareIcon style={{ width: '18px', height: '18px' }} />
//                     Edit Profile
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Stats Cards - Only show when profile is created */}
//           {isCreated && (
//             <div className="mt-6 grid grid-cols-2 gap-4">
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
//                 <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2">
//                   <UserCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {profile.name ? "Active" : "Incomplete"}
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">Profile Status</p>
//               </div>
//               <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
//                 <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2">
//                   <CheckBadgeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
//                 </div>
//                 <p className="text-2xl font-bold text-gray-900 dark:text-white">
//                   {profile.verification_status === "verified" ? "Approved" : "Pending"}
//                 </p>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">Verification</p>
//               </div>
//             </div>
//           )}
//         </div>

//         <IonLoading isOpen={loading || loadingInspection} message="Loading..." />
//         <IonToast
//           isOpen={!!toastMsg}
//           message={toastMsg}
//           duration={2500}
//           onDidDismiss={() => setToastMsg('')}
//           style={{
//             '--background': toastMsg.includes('success') || toastMsg.includes('successfully') ? '#10b981' : '#ef4444',
//             '--color': 'white',
//             '--border-radius': '12px',
//           }}
//         />
//       </IonContent>

//       <style>{`
//         .bg-grid-gray-900\\/[0.02] {
//           background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
//                             linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
//         }
//         .dark .bg-grid-white\\/[0.02] {
//           background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
//                             linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
//         }
//       `}</style>
//     </IonPage>
//   );
// };

// export default ProfileSetup;

import React, { useState, useEffect, ChangeEvent } from 'react';
import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import NavbarSidebar from '../users/pages/Navbar';
import { 
  UserCircleIcon, 
  PhoneIcon,
  StarIcon,
  CheckBadgeIcon,
  CameraIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon,
  EnvelopeIcon,
  TruckIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarIcon,
  DocumentCheckIcon,
  EyeIcon,
  HomeIcon,
  MapPinIcon,
  GlobeAltIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

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

// Residential Address Interface
interface ResidentialAddress {
  residential_street_line_1: string;
  residential_street_line_2: string;
  residential_city: string;
  residential_state: string;
  residential_postal_code: string;
  residential_country: string;
}

const ProfileSetup: React.FC = () => {
  const [profile, setProfile] = useState({
    id: '',
    user_id: '',
    name: '',
    phone: '',
    email: '',
    profile_picture_path: '',
    verification_status: '',
    average_rating: null as number | null,
    total_reviews: 0,
    // Residential Address Fields
    residential_street_line_1: '',
    residential_street_line_2: '',
    residential_city: '',
    residential_state: '',
    residential_postal_code: '',
    residential_country: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  
  // Vehicle Inspection State
  const [vehicleInspection, setVehicleInspection] = useState<VehicleInspection | null>(null);
  const [loadingInspection, setLoadingInspection] = useState(false);
  const [showInspectionDetails, setShowInspectionDetails] = useState(false);

  // ======================
  // Get token on component mount
  // ======================
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
      if (!accessToken) {
        setToastMsg("Session expired. Please login again.");
      }
    };
    loadToken();
  }, []);

  // ======================
  // Fetch profile when token is available
  // ======================
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchVehicleInspection();
    }
  }, [token]);

  // ======================
  // Get full profile image URL
  // ======================
  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    const normalizedPath = path.replace(/\\/g, '/');
    if (normalizedPath.startsWith('http')) return normalizedPath;
    return `${API_BASE}/${normalizedPath}`;
  };

  // ======================
  // Fetch profile from /driver-profile/me
  // ======================
  const fetchProfile = async () => {
    if (!token) {
      setToastMsg("Session expired. Please login again.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver-profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 404) {
        setIsCreated(false);
        setLoading(false);
        return;
      }
      
      if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
      const data = await res.json();
      
      console.log("Fetched profile data:", data);
      
      const profileData = {
        id: data.id || '',
        user_id: data.user_id || '',
        name: data.full_name || '',
        phone: data.phone || '',
        email: data.email || '',
        profile_picture_path: data.profile_picture_path || '',
        verification_status: data.verification_status || 'pending',
        average_rating: data.average_rating || null,
        total_reviews: data.total_reviews || 0,
        // Residential Address Fields
        residential_street_line_1: data.residential_street_line_1 || '',
        residential_street_line_2: data.residential_street_line_2 || '',
        residential_city: data.residential_city || '',
        residential_state: data.residential_state || '',
        residential_postal_code: data.residential_postal_code || '',
        residential_country: data.residential_country || ''
      };
      
      setProfile(profileData);
      
      if (profileData.profile_picture_path) {
        const fullUrl = getFullImageUrl(profileData.profile_picture_path);
        console.log("Profile image URL:", fullUrl);
        setProfileImageUrl(fullUrl);
      } else {
        setProfileImageUrl('');
      }
      
      setIsCreated(true);
    } catch (err) {
      console.error(err);
      if (err instanceof Error && !err.message.includes('404')) {
        setToastMsg("Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // Fetch Vehicle Inspection Status
  // ======================
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
      // Don't show toast for this as it's not critical
    } finally {
      setLoadingInspection(false);
    }
  };

  // ======================
  // Handle form changes
  // ======================
 
  // ======================
  // Handle image upload
  // ======================
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setToastMsg("Please select an image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setToastMsg("Image size should be less than 5MB");
      return;
    }
    
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // ======================
  // Create profile using /driver-profile
  // ======================
  const createProfile = async () => {
    if (!token) {
      setToastMsg("No session. Please login again.");
      return;
    }

    if (!profile.name.trim()) {
      setToastMsg("Please enter your full name");
      return;
    }

    if (!profile.phone.trim()) {
      setToastMsg("Please enter your phone number");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("full_name", profile.name);
    formData.append("phone", profile.phone);
    
    // Append residential address fields
    if (profile.residential_street_line_1) formData.append("residential_street_line_1", profile.residential_street_line_1);
    if (profile.residential_street_line_2) formData.append("residential_street_line_2", profile.residential_street_line_2);
    if (profile.residential_city) formData.append("residential_city", profile.residential_city);
    if (profile.residential_state) formData.append("residential_state", profile.residential_state);
    if (profile.residential_postal_code) formData.append("residential_postal_code", profile.residential_postal_code);
    if (profile.residential_country) formData.append("residential_country", profile.residential_country);
    
    if (imageFile) {
      formData.append("profile_pic", imageFile);
    }

    try {
      const url = `${API_BASE}/driver-profile`;
      console.log("Creating profile at:", url);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      console.log("Create response:", data);
      
      if (res.ok) {
        setToastMsg("Profile created successfully!");
        setImageFile(null);
        setImagePreview('');
        setIsEditing(false);
        setTimeout(() => {
          fetchProfile();
          fetchVehicleInspection();
        }, 500);
      } else {
        setToastMsg(data.detail?.message || data.message || "Failed to create profile");
      }
    } catch (err) {
      console.error("Error creating profile:", err);
      setToastMsg("Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // Update profile using /driver-profile/update
  // ======================
  const updateProfile = async () => {
    if (!token) {
      setToastMsg("No session. Please login again.");
      return;
    }

    if (!profile.name.trim()) {
      setToastMsg("Please enter your full name");
      return;
    }

    if (!profile.phone.trim()) {
      setToastMsg("Please enter your phone number");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("full_name", profile.name);
    formData.append("phone", profile.phone);
    
    // Append residential address fields
    if (profile.residential_street_line_1) formData.append("residential_street_line_1", profile.residential_street_line_1);
    if (profile.residential_street_line_2) formData.append("residential_street_line_2", profile.residential_street_line_2);
    if (profile.residential_city) formData.append("residential_city", profile.residential_city);
    if (profile.residential_state) formData.append("residential_state", profile.residential_state);
    if (profile.residential_postal_code) formData.append("residential_postal_code", profile.residential_postal_code);
    if (profile.residential_country) formData.append("residential_country", profile.residential_country);

    if (imageFile) {
      formData.append("profile_pic", imageFile);
    }

    try {
      const url = `${API_BASE}/driver-profile/update`;
      console.log("Updating profile at:", url);
      
      const res = await fetch(url, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      console.log("Update response:", data);
      
      if (res.ok) {
        setToastMsg("Profile updated successfully!");
        setImageFile(null);
        setImagePreview('');
        setIsEditing(false);
        setTimeout(() => {
          fetchProfile();
          fetchVehicleInspection();
        }, 500);
      } else {
        setToastMsg(data.detail?.message || data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setToastMsg("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // ======================
  // Save profile (create or update based on state)
  // ======================
  const saveProfile = async () => {
    if (isCreated) {
      await updateProfile();
    } else {
      await createProfile();
    }
  };

  // ======================
  // Calculate next inspection due date (15 days after inspection_reviewed_at)
  // ======================
  const getNextInspectionDueDate = (): string | null => {
    if (!vehicleInspection?.inspection_reviewed_at) return null;
    
    const reviewedDate = new Date(vehicleInspection.inspection_reviewed_at);
    const nextDueDate = new Date(reviewedDate);
    nextDueDate.setDate(reviewedDate.getDate() + 15);
    
    return nextDueDate.toISOString();
  };

  // ======================
  // Get Days Until Due
  // ======================
  const getDaysUntilDue = (): number | null => {
    const nextDueDateStr = getNextInspectionDueDate();
    if (!nextDueDateStr) return null;
    
    const dueDate = new Date(nextDueDateStr);
    const today = new Date();
    // Reset time part for accurate day calculation
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // ======================
  // Get Inspection Status Badge
  // ======================
  const getInspectionStatusBadge = () => {
    if (!vehicleInspection) {
      return { 
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400', 
        icon: null, 
        text: 'No Vehicle Assigned',
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

  // ======================
  // Format Date
  // ======================
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

  const getVerificationBadge = () => {
    switch(profile.verification_status) {
      case 'verified':
        return { color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckBadgeIcon, text: 'Verified Driver' };
      case 'pending':
        return { color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: null, text: 'Pending Verification' };
      default:
        return { color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: null, text: 'Unverified' };
    }
  };

  const verificationBadge = getVerificationBadge();
  const inspectionBadge = getInspectionStatusBadge();
  const daysUntilDue = getDaysUntilDue();
  const nextInspectionDate = getNextInspectionDueDate();
  const isExpired = daysUntilDue !== null && daysUntilDue < 0;
  const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 15;

  const displayImage = imagePreview || profileImageUrl;

  // Show loading while getting token
  if (token === null) {
    return (
      <IonPage>
        <IonContent className="flex items-center justify-center">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading session...</p>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setProfile(prev => ({ ...prev, [name]: value }));
};
  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium mb-4">
              <UserCircleIcon className="w-4 h-4" />
              <span>Driver Profile</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-700 bg-clip-text text-transparent">
              {isCreated ? "My Profile" : "Complete Your Profile"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isCreated ? "View and manage your driver information" : "Fill in your details to get started"}
            </p>
          </div>

          {/* Vehicle Inspection Card - Only show when profile is created and vehicle assigned */}
          {isCreated && vehicleInspection && vehicleInspection.vehicle_id && (
            <div className={`mb-6 rounded-2xl border-2 ${inspectionBadge.borderColor} overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl`}>
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
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${inspectionBadge.color}`}>
                          {inspectionBadge.text}
                        </span>
                        {!isExpired && daysUntilDue !== null && daysUntilDue <= 15 && daysUntilDue > 0 && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-700">
                            <ClockIcon className="w-3 h-3" />
                            Due in {daysUntilDue} days
                          </span>
                        )}
                        {isExpired && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-700">
                            <ExclamationTriangleIcon className="w-3 h-3" />
                            Overdue by {Math.abs(daysUntilDue!)} days
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
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Last Inspection Date</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                          {formatDate(vehicleInspection.inspection_reviewed_at)}
                        </p>
                        {vehicleInspection.inspection_reviewed_at && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <CheckBadgeIcon className="w-3 h-3" />
                            Vehicle was inspected on this date
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
                      <div className={`w-8 h-8 rounded-full ${isExpired ? 'bg-red-100 dark:bg-red-900/30' : isDueSoon ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'} flex items-center justify-center shrink-0`}>
                        <CalendarIcon className={`w-4 h-4 ${isExpired ? 'text-red-600 dark:text-red-400' : isDueSoon ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Next Inspection Due Date</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                          {formatDate(nextInspectionDate)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Due 15 days after last inspection
                        </p>
                        {isDueSoon && daysUntilDue !== null && daysUntilDue > 0 && (
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            ⚠️ Vehicle inspection due in {daysUntilDue} days. Please schedule an inspection.
                          </p>
                        )}
                        {isExpired && daysUntilDue !== null && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1">
                            <ExclamationTriangleIcon className="w-3 h-3" />
                            ❌ Vehicle inspection is overdue by {Math.abs(daysUntilDue)} days! Please get your vehicle inspected immediately.
                          </p>
                        )}
                        {vehicleInspection.inspection_status === 'approved' && !isDueSoon && !isExpired && daysUntilDue !== null && daysUntilDue > 15 && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                            <ShieldCheckIcon className="w-3 h-3" />
                            ✅ Vehicle inspection is valid for {daysUntilDue} more days
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {vehicleInspection.inspection_reason && (
                      <div className="flex items-start gap-3 md:col-span-2 p-3 rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-sm">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                          <DocumentCheckIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Inspection Rejected Reason</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {vehicleInspection.inspection_reason}
                          </p>
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

          {/* No Vehicle Assigned Message */}
          {isCreated && (!vehicleInspection || !vehicleInspection.vehicle_id) && !loadingInspection && (
            <div className="mb-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-5 text-center">
              <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No Vehicle Assigned</h3>
              <p className="text-sm text-gray-500 dark:text-gray-600">
                No vehicle has been assigned to you yet. Please contact the administrator.
              </p>
            </div>
          )}

          {/* Main Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Profile Header with Gradient */}
            <div className="relative">
              <div className="h-24 bg-linear-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800"></div>
              
              {/* Profile Image */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 md:left-8 md:translate-x-0">
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl cursor-pointer group bg-white dark:bg-gray-700"
                    onClick={() => document.getElementById('profileUpload')?.click()}
                  >
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Image failed to load:", displayImage);
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const existingIcon = parent.querySelector('.fallback-icon');
                            if (!existingIcon) {
                              const icon = document.createElement('div');
                              icon.className = 'fallback-icon w-full h-full flex items-center justify-center';
                              icon.innerHTML = '<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                              parent.appendChild(icon);
                            }
                          }
                        }}
                      />
                    ) : (
                      <UserCircleIcon className="w-full h-full text-gray-400 dark:text-gray-500" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                      <CameraIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    id="profileUpload"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Edit Button */}
              {isCreated && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
                >
                  <PencilSquareIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              )}
            </div>

            {/* Profile Content */}
            <div className="pt-16 pb-6 px-6">
              {/* Name and Verification */}
              <div className="text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.name || "Driver Name"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Driver ID: {profile.id ? profile.id.slice(0, 8) : 'Not created'}...
                    </p>
                  </div>
                  {isCreated && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${verificationBadge.color} w-fit mx-auto md:mx-0`}>
                      {verificationBadge.icon && <verificationBadge.icon className="w-4 h-4" />}
                      <span className="text-sm font-semibold">{verificationBadge.text}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Display - Non-editable */}
              {isCreated && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <EnvelopeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.email || "Not provided"}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <CheckBadgeIcon className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating Section */}
              {isCreated && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <StarSolidIcon className="w-6 h-6 text-yellow-500" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Driver Rating
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {profile.average_rating ? profile.average_rating.toFixed(1) : "0.0"}
                      </p>
                      <div className="flex gap-1 justify-end mt-1">
                        {[1,2,3,4,5].map((star) => (
                          <StarSolidIcon
                            key={star}
                            className={`w-5 h-5 ${
                              profile.average_rating && star <= Math.round(profile.average_rating)
                                ? "text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields - Only show when editing or creating */}
              {(isEditing || !isCreated) && (
                <div className="mt-6 space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full pl-11 pr-4 py-3 rounded-xl 
                                   border border-gray-300 dark:border-gray-600 
                                   bg-white dark:bg-gray-700 
                                   text-gray-900 dark:text-gray-100 
                                   placeholder-gray-400 dark:placeholder-gray-500
                                   focus:outline-none
                                   focus:border-gray-500 dark:focus:border-gray-400
                                   focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
                                   transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        className="w-full pl-11 pr-4 py-3 rounded-xl 
                                   border border-gray-300 dark:border-gray-600 
                                   bg-white dark:bg-gray-700 
                                   text-gray-900 dark:text-white 
                                   placeholder-gray-400 dark:placeholder-gray-400
                                   focus:outline-none
                                   focus:border-gray-500 dark:focus:border-gray-400
                                   focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
                                   transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Residential Address Section */}
                  <div className="pt-4">
                   <div>
  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
    Residential Address
  </h3>
  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
    This address must match the address linked to your bank account.
  </p>
</div>
                    
                    <div className="space-y-4">
                      {/* Street Line 1 */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          Street Address Line 1
                        </label>
                        <div className="relative">
                          <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <input
                            type="text"
                            name="residential_street_line_1"
                            value={profile.residential_street_line_1}
                            onChange={handleChange}
                            placeholder="House number, street name"
                            className="w-full pl-11 pr-4 py-3 rounded-xl 
                                       border border-gray-300 dark:border-gray-600 
                                       bg-white dark:bg-gray-700 
                                       text-gray-900 dark:text-gray-100 
                                       placeholder-gray-400 dark:placeholder-gray-500
                                       focus:outline-none
                                       focus:border-gray-500 dark:focus:border-gray-400
                                       focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
                                       transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Street Line 2 */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          Street Address Line 2 <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                          <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <input
                            type="text"
                            name="residential_street_line_2"
                            value={profile.residential_street_line_2}
                            onChange={handleChange}
                            placeholder="Apartment, suite, unit, etc."
                            className="w-full pl-11 pr-4 py-3 rounded-xl 
                                       border border-gray-300 dark:border-gray-600 
                                       bg-white dark:bg-gray-700 
                                       text-gray-900 dark:text-gray-100 
                                       placeholder-gray-400 dark:placeholder-gray-500
                                       focus:outline-none
                                       focus:border-gray-500 dark:focus:border-gray-400
                                       focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
                                       transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* City and State Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            City
                          </label>
                          <div className="relative">
                            <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                              type="text"
                              name="residential_city"
                              value={profile.residential_city}
                              onChange={handleChange}
                              placeholder="City name"
                              className="w-full pl-11 pr-4 py-3 rounded-xl 
                                         border border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-gray-100 
                                         placeholder-gray-400 dark:placeholder-gray-500
                                         focus:outline-none
                                         focus:border-gray-500 dark:focus:border-gray-400
                                         focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
                                         transition-all duration-200"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            State / Province
                          </label>
                          <div className="relative">
                            <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                              type="text"
                              name="residential_state"
                              value={profile.residential_state}
                              onChange={handleChange}
                              placeholder="State or province"
                              className="w-full pl-11 pr-4 py-3 rounded-xl 
                                         border border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-gray-100 
                                         placeholder-gray-400 dark:placeholder-gray-500
                                         focus:outline-none
                                         focus:border-gray-500 dark:focus:border-gray-400
                                         focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
                                         transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Postal Code and Country Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Postal Code
                          </label>
                          <div className="relative">
                            <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                              type="text"
                              name="residential_postal_code"
                              value={profile.residential_postal_code}
                              onChange={handleChange}
                              placeholder="Postal / ZIP code"
                              className="w-full pl-11 pr-4 py-3 rounded-xl 
                                         border border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-gray-100 
                                         placeholder-gray-400 dark:placeholder-gray-500
                                         focus:outline-none
                                         focus:border-gray-500 dark:focus:border-gray-400
                                         focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
                                         transition-all duration-200"
                            />
                          </div>
                        </div>
                        {/* <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Country
                          </label>
                          <div className="relative">
                            <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input
                              type="text"
                              name="residential_country"
                              value={profile.residential_country}
                              onChange={handleChange}
                              placeholder="Country name"
                              className="w-full pl-11 pr-4 py-3 rounded-xl 
                                         border border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-gray-100 
                                         placeholder-gray-400 dark:placeholder-gray-500
                                         focus:outline-none
                                         focus:border-gray-500 dark:focus:border-gray-400
                                         focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
                                         transition-all duration-200"
                            />
                          </div>
                        </div> */}
                        <div>
  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
    Country
  </label>
  <div className="relative">
    <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
    <select
      name="residential_country"
      value={profile.residential_country}   // expects country code like "IN"
      onChange={handleChange}
      className="w-full pl-11 pr-4 py-3 rounded-xl 
                 border border-gray-300 dark:border-gray-600 
                 bg-white dark:bg-gray-700 
                 text-gray-900 dark:text-gray-100 
                 focus:outline-none
                 focus:border-gray-500 dark:focus:border-gray-400
                 focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
                 transition-all duration-200
                 appearance-none"   // removes default arrow if you want a custom one (optional)
    >
      <option value="IN">India (IN)</option>
      <option value="US">United States (US)</option>
      <option value="GB">United Kingdom (GB)</option>
      <option value="CA">Canada (CA)</option>
      <option value="AU">Australia (AU)</option>
      <option value="DE">Germany (DE)</option>
      <option value="FR">France (FR)</option>
      <option value="JP">Japan (JP)</option>
      {/* add more countries as needed */}
    </select>
  </div>
</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Read-only view when not editing */}
              {isCreated && !isEditing && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.phone || "Not provided"}</p>
                    </div>
                  </div>

                  {/* Residential Address Display - Read Only */}
                  {(profile.residential_street_line_1 || profile.residential_city || profile.residential_state) && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <HomeIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Residential Address</p>
                      </div>
                      <div className="space-y-2">
                        {profile.residential_street_line_1 && (
                          <p className="text-sm text-gray-900 dark:text-white">
                            {profile.residential_street_line_1}
                            {profile.residential_street_line_2 && `, ${profile.residential_street_line_2}`}
                          </p>
                        )}
                        {(profile.residential_city || profile.residential_state || profile.residential_postal_code) && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {[profile.residential_city, profile.residential_state].filter(Boolean).join(', ')}
                            {profile.residential_postal_code && ` - ${profile.residential_postal_code}`}
                          </p>
                        )}
                        {profile.residential_country && (
                          <p className="text-sm text-gray-700 dark:text-gray-300">{profile.residential_country}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                {(isEditing || !isCreated) && (
                  <>
                    <button
                      onClick={saveProfile}
                      disabled={loading}
                      style={{
                        width: '200px',
                        height: '50px',
                        borderRadius: '14px',
                        background: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
                        color: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
                        fontWeight: '600',
                        fontSize: '15px',
                        border: document.documentElement.classList.contains('dark') ? '1px solid #e5e7eb' : 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'all 0.25s ease',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                        opacity: loading ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (loading) return;
                        const isDark = document.documentElement.classList.contains('dark');
                        e.currentTarget.style.background = isDark ? '#f3f4f6' : '#1f2937';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        if (loading) return;
                        const isDark = document.documentElement.classList.contains('dark');
                        e.currentTarget.style.background = isDark ? '#ffffff' : '#111827';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
                      }}
                    >
                      <CheckIcon style={{ width: '20px', height: '20px' }} />
                      {loading ? 'Saving...' : (isCreated ? 'Update Profile' : 'Create Profile')}
                    </button>

                    {isCreated && (
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setImagePreview('');
                          setImageFile(null);
                          fetchProfile();
                        }}
                        style={{
                          width: '180px',
                          height: '50px',
                          borderRadius: '14px',
                          background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#f3f4f6',
                          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                          fontWeight: '600',
                          fontSize: '15px',
                          border: `1px solid ${document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          transition: 'all 0.25s ease',
                        }}
                        onMouseEnter={(e) => {
                          const isDark = document.documentElement.classList.contains('dark');
                          e.currentTarget.style.background = isDark ? '#374151' : '#e5e7eb';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          const isDark = document.documentElement.classList.contains('dark');
                          e.currentTarget.style.background = isDark ? '#1f2937' : '#f3f4f6';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <XMarkIcon style={{ width: '20px', height: '20px' }} />
                        Cancel
                      </button>
                    )}
                  </>
                )}

                {isCreated && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{
                      width: '180px',
                      height: '48px',
                      background: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
                      color: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
                      fontWeight: '600',
                      fontSize: '14px',
                      borderRadius: '12px',
                      border: document.documentElement.classList.contains('dark') ? '1px solid #e5e7eb' : 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseEnter={(e) => {
                      const isDark = document.documentElement.classList.contains('dark');
                      e.currentTarget.style.background = isDark ? '#f9fafb' : '#1f2937';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      const isDark = document.documentElement.classList.contains('dark');
                      e.currentTarget.style.background = isDark ? '#ffffff' : '#111827';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <PencilSquareIcon style={{ width: '18px', height: '18px' }} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards - Only show when profile is created */}
          {isCreated && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2">
                  <UserCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.name ? "Active" : "Incomplete"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Profile Status</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-2">
                  <CheckBadgeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.verification_status === "verified" ? "Approved" : "Pending"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Verification</p>
              </div>
            </div>
          )}
        </div>

        <IonLoading isOpen={loading || loadingInspection} message="Loading..." />
        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2500}
          onDidDismiss={() => setToastMsg('')}
          style={{
            '--background': toastMsg.includes('success') || toastMsg.includes('successfully') ? '#10b981' : '#ef4444',
            '--color': 'white',
            '--border-radius': '12px',
          }}
        />
      </IonContent>

      <style>{`
        .bg-grid-gray-900\\/[0.02] {
          background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
        }
        .dark .bg-grid-white\\/[0.02] {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }
      `}</style>
    </IonPage>
  );
};

export default ProfileSetup;