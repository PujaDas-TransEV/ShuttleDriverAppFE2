// import React, { useState, useEffect, ChangeEvent } from 'react';
// import { IonPage, IonContent, IonButton, IonLoading, IonToast } from '@ionic/react';
// import NavbarSidebar from '../users/pages/Navbar';
// import { UserCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// // ================================
// // ProtectedImage component (inline)
// // ================================
// type ProtectedImageProps = {
//   fileId: string;
//   token: string | null;
//   alt?: string;
//   className?: string;
// };
// const ProtectedImage: React.FC<ProtectedImageProps> = ({ fileId, token, alt = "", className }) => {
//   const [src, setSrc] = useState<string>("");

//   useEffect(() => {
//     if (!fileId || !token) return;

//     let objectUrl: string | null = null;
//     let cancelled = false;

//     const loadImage = async () => {
//       try {
//         const res = await fetch(`${API_BASE}/driver-profile/me/profile-pic`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (!res.ok) throw new Error(`Failed to load image: ${res.status}`);
//         const blob = await res.blob();
//         objectUrl = URL.createObjectURL(blob);
//         if (!cancelled) setSrc(objectUrl);
//       } catch (err) {
//         console.error(err);
//         if (!cancelled) setSrc("");
//       }
//     };

//     loadImage();
//     return () => {
//       cancelled = true;
//       if (objectUrl) URL.revokeObjectURL(objectUrl);
//     };
//   }, [fileId, token]);

//   if (!src) return null;
//   return <img src={src} alt={alt} className={className} />;
// };

// // ================================
// // ProfileSetup page
// // ================================
// const ProfileSetup: React.FC = () => {
//   const [profile, setProfile] = useState({
//     name: '',
   
//     phone: '',
  
//     profileFileId: '',
//   });

//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [isCreated, setIsCreated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');

//   const token = localStorage.getItem('access_token');

//   // ======================
//   // Fetch profile
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
//       if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
//       const data = await res.json();
//       setProfile({
//         name: data.full_name || '',
//         phone: data.phone || '',
//         profileFileId: data.profile_picture_path || '', // fileId from API
//       });
//       setIsCreated(true);
//     } catch (err) {
//       console.error(err);
//       setToastMsg("Failed to load profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   // ======================
//   // Handle form changes
//   // ======================
//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setProfile({ ...profile, [name]: value });
//   };

//   // ======================
//   // Handle image upload
//   // ======================
//   const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     setImageFile(file);

//     // preview local file immediately
//     const localPreview = URL.createObjectURL(file);
//     setProfile({ ...profile, profileFileId: localPreview });
//   };

//   // ======================
//   // Save or update profile
//   // ======================
//   const saveProfile = async () => {
//     if (!token) {
//       setToastMsg("No session. Please login again.");
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     formData.append("full_name", profile.name);
//     formData.append("phone", profile.phone);
   
//     if (imageFile) {
//       formData.append("profile_picture", imageFile);
//     }

//     try {
//       const res = await fetch(
//         isCreated ? `${API_BASE}/driver-profile/update` : `${API_BASE}/driver-profile`,
//         {
//           method: isCreated ? "PATCH" : "POST",
//           headers: { Authorization: `Bearer ${token}` },
//           body: formData,
//         }
//       );
//       const data = await res.json();
//       if (res.ok) {
//         setToastMsg(isCreated ? "Profile updated!" : "Profile created!");
//         setImageFile(null);
//         fetchProfile();
//       } else {
//         setToastMsg(data.detail?.message || data.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error(err);
//       setToastMsg("Failed to save profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />
//     <IonContent className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white pt-16">
//   <div className="max-w-3xl mx-auto p-5 mt-20">
//     {/* Card Container */}
//     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-10 border border-gray-200 dark:border-gray-700">
      
//       <h1 className="text-3xl font-bold mb-2 text-center">Driver Profile Setup</h1>
//       <p className="text-gray-500 dark:text-gray-300 mb-6 text-center">
//         Fill in your details to complete your Uber Shuttle driver profile.
//       </p>

//       {/* Profile Image */}
//       <div className="flex flex-col items-center mb-6 relative">
//         <div
//           className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300 dark:border-gray-600 cursor-pointer shadow-lg hover:scale-105 transition-transform"
//           onClick={() => document.getElementById('profileUpload')?.click()}
//         >
//           {profile.profileFileId ? (
//             <ProtectedImage
//               fileId={profile.profileFileId}
//               token={token}
//               alt="Profile"
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <UserCircleIcon className="w-full h-full text-gray-400 dark:text-gray-600" />
//           )}
//         </div>
//         <input
//           type="file"
//           accept="image/*"
//           id="profileUpload"
//           onChange={handleImageChange}
//           className="hidden"
//         />
//       </div>

//       {/* Form */}
//       <div className="space-y-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Full Name</label>
//           <div className="flex items-center border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition">
//             <UserCircleIcon className="w-6 h-6 text-gray-400 dark:text-gray-300 ml-2" />
//             <input
//               type="text"
//               name="name"
//               value={profile.name}
//               onChange={handleChange}
//               placeholder="Enter your full name"
//               className="w-full p-2 bg-transparent outline-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//             />
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Phone Number</label>
//           <div className="flex items-center border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shadow-sm focus-within:ring-2 focus-within:ring-black dark:focus-within:ring-white transition">
//             <PhoneIcon className="w-6 h-6 text-gray-400 dark:text-gray-300 ml-2" />
//             <input
//               type="tel"
//               name="phone"
//               value={profile.phone}
//               onChange={handleChange}
//               placeholder="Enter your phone number"
//               className="w-full p-2 bg-transparent outline-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Save Button */}
//       <div className="mt-8 flex justify-center">
//         <IonButton
//           onClick={saveProfile}
//           style={{
//             width: '200px',
//             height: '50px',
//             backgroundColor: 'black',
//             color: 'white',
//             fontWeight: 'bold',
//             borderRadius: '12px'
//           }}
//         >
//           {isCreated ? 'Update Profile' : 'Create Profile'}
//         </IonButton>
//       </div>

//       {/* Loading & Toast */}
//       <IonLoading isOpen={loading} message="Saving profile..." />
//       <IonToast
//         isOpen={!!toastMsg}
//         message={toastMsg}
//         duration={2500}
//         onDidDismiss={() => setToastMsg('')}
//       />
//     </div>
//   </div>
// </IonContent>
      
//     </IonPage>
//   );
// };

// export default ProfileSetup;

import React, { useState, useEffect, ChangeEvent } from 'react';
import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
import NavbarSidebar from '../users/pages/Navbar';
import { 
  UserCircleIcon, 
  PhoneIcon,
  StarIcon,
  CheckBadgeIcon,
  CameraIcon,
  PencilSquareIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const API_BASE = "https://be.shuttleapp.transev.site";

// ================================
// Star Rating Component
// ================================
const StarRating: React.FC<{ rating: number | null; totalReviews: number }> = ({ rating, totalReviews }) => {
  const displayRating = rating || 0;
  const fullStars = Math.floor(displayRating);
  const hasHalfStar = displayRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <StarSolidIcon key={`full-${i}`} className="w-5 h-5 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <StarSolidIcon className="w-5 h-5 text-yellow-400 opacity-50" />
            <StarSolidIcon className="w-5 h-5 text-yellow-400 absolute top-0 left-0" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <StarIcon key={`empty-${i}`} className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        ))}
      </div>
      <div className="mt-1 text-center">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {displayRating.toFixed(1)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </p>
      </div>
    </div>
  );
};

// ================================
// ProfileSetup page
// ================================
const ProfileSetup: React.FC = () => {
  const [profile, setProfile] = useState({
    id: '',
    user_id: '',
    name: '',
    phone: '',
    profile_picture_path: '',
    verification_status: '',
    average_rating: null as number | null,
    total_reviews: 0
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  const token = localStorage.getItem('access_token');

  // ======================
  // Fetch profile
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
      if (!res.ok) throw new Error(`Failed to fetch profile: ${res.status}`);
      const data = await res.json();
      setProfile({
        id: data.id || '',
        user_id: data.user_id || '',
        name: data.full_name || '',
        phone: data.phone || '',
        profile_picture_path: data.profile_picture_path || '',
        verification_status: data.verification_status || 'pending',
        average_rating: data.average_rating || null,
        total_reviews: data.total_reviews || 0
      });
      setIsCreated(true);
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ======================
  // Handle form changes
  // ======================
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // ======================
  // Handle image upload
  // ======================
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  // ======================
  // Get profile image URL
  // ======================
  const getProfileImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (profile.profile_picture_path) {
      // Extract filename from path
      const filename = profile.profile_picture_path.split('\\').pop() || profile.profile_picture_path.split('/').pop();
      return `${API_BASE}/uploads/upload_pic/${filename}`;
    }
    return null;
  };

  // ======================
  // Save or update profile
  // ======================
  const saveProfile = async () => {
    if (!token) {
      setToastMsg("No session. Please login again.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("full_name", profile.name);
    formData.append("phone", profile.phone);

    if (imageFile) {
      formData.append("profile_picture", imageFile);
    }

    try {
      const res = await fetch(
        isCreated ? `${API_BASE}/driver-profile/update` : `${API_BASE}/driver-profile`,
        {
          method: isCreated ? "PATCH" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (res.ok) {
        setToastMsg(isCreated ? "Profile updated successfully!" : "Profile created successfully!");
        setImageFile(null);
        setImagePreview('');
        setIsEditing(false);
        fetchProfile();
      } else {
        setToastMsg(data.detail?.message || data.message || "Failed to save profile");
      }
    } catch (err) {
      console.error(err);
      setToastMsg("Failed to save profile");
    } finally {
      setLoading(false);
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
  const profileImageUrl = getProfileImageUrl();

  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium mb-4">
              <UserCircleIcon className="w-4 h-4" />
              <span>Driver Profile</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {isCreated ? "My Profile" : "Complete Your Profile"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {isCreated ? "View and manage your driver information" : "Fill in your details to get started"}
            </p>
          </div>

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
                    {profileImageUrl ? (
                      <img
                        src={profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const icon = document.createElement('div');
                            icon.className = 'w-full h-full flex items-center justify-center';
                            icon.innerHTML = '<svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>';
                            parent.appendChild(icon);
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
                      Driver ID: {profile.id ? profile.id.slice(0, 8) : 'N/A'}...
                    </p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${verificationBadge.color} w-fit mx-auto md:mx-0`}>
                    {verificationBadge.icon && <verificationBadge.icon className="w-4 h-4" />}
                    <span className="text-sm font-semibold">{verificationBadge.text}</span>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
            {isCreated && (
  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
    
    <div className="flex items-center justify-between">
      
      {/* Left Side */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
          <StarSolidIcon className="w-6 h-6 text-yellow-500" />
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Driver Rating
        </p>
      </div>

      {/* Right Side (Only Rating) */}
      <div className="text-right">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {profile.average_rating ? profile.average_rating.toFixed(1) : "0.0"}
        </p>

        {/* Stars */}
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
        Full Name
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
                     bg-white dark:bg-gray-800 
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
        Phone Number
      </label>
      <div className="relative">
        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white" />
        
        <input
          type="tel"
          name="phone"
          value={profile.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
        className="w-full pl-11 pr-4 py-3 rounded-xl 
           border border-gray-300 dark:border-gray-600 
           bg-white dark:bg-gray-800 
           text-gray-900 dark:text-white 
           placeholder-gray-400 dark:placeholder-gray-400
           focus:outline-none
           focus:border-gray-500 dark:focus:border-gray-400
           focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
           transition-all duration-200"
        />
      </div>
    </div>

  </div>
)}

              {/* Read-only view when not editing */}
              {isCreated && !isEditing && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.phone || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
           <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
  {(isEditing || !isCreated) && (
    <>
      {/* Update/Create Button */}
      <button
        onClick={saveProfile}
        style={{
          width: '200px',
          height: '50px',
          borderRadius: '14px',
          background: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
          color: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
          fontWeight: '600',
          fontSize: '15px',
          border: document.documentElement.classList.contains('dark') ? '1px solid #e5e7eb' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.25s ease',
          boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        }}
        onMouseEnter={(e) => {
          const isDark = document.documentElement.classList.contains('dark');
          e.currentTarget.style.background = isDark ? '#f3f4f6' : '#1f2937';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          const isDark = document.documentElement.classList.contains('dark');
          e.currentTarget.style.background = isDark ? '#ffffff' : '#111827';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
        }}
      >
        <CheckIcon style={{ width: '20px', height: '20px' }} />
        {isCreated ? 'Update Profile' : 'Create Profile'}
      </button>

      {/* Cancel Button */}
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

          {/* Stats Cards */}
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

        <IonLoading isOpen={loading} message="Saving profile..." />
        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2500}
          onDidDismiss={() => setToastMsg('')}
          style={{
            '--background': toastMsg.includes('success') ? '#10b981' : '#ef4444',
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