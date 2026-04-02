
// import React, { useState, useEffect, ChangeEvent } from 'react';
// import { IonPage, IonContent, IonButton, IonLoading, IonToast } from '@ionic/react';
// import NavbarSidebar from '../users/pages/Navbar';
// import { UserCircleIcon, PhoneIcon, MapPinIcon, TruckIcon } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// const ProfileSetup: React.FC = () => {
//   const [profile, setProfile] = useState({
//     name: '',
//     address: '',
//     phone: '',
//     busNumber: '',
//   });

//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [isCreated, setIsCreated] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');

//   const token = localStorage.getItem('access_token');

//   // ✅ Fetch profile data including profile picture as blob
//   const fetchProfile = async () => {
//     if (!token) {
//       setToastMsg("Session expired. Please login again.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/driver-profile/me`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (res.status === 401) {
//         setToastMsg("Invalid session. Please login again.");
//         return;
//       }

//       if (!res.ok) return;

//       const data = await res.json();
//       setProfile({
//         name: data.full_name || '',
//         phone: data.phone || '',
//         address: data.address || '',
//         busNumber: data.busNumber || '',
//       });

//       setIsCreated(true);

//       // ✅ Fetch profile picture as blob if exists
//       if (data.profile_picture_path) {
//         const picRes = await fetch(`${API_BASE}/driver-profile/me/profile-pic`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (picRes.ok) {
//           const blob = await picRes.blob();
//           setImagePreview(URL.createObjectURL(blob));
//         }
//       }
//     } catch (err) {
//       console.error("Fetch profile error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfile();
//   }, []);

//   // ✅ Handle input changes
//   const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setProfile({ ...profile, [name]: value });
//   };

//   // ✅ Handle image change (preview + upload)
//   const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setImageFile(file);
//     setImagePreview(URL.createObjectURL(file));
//   };

//   // ✅ Save or update profile
//   const saveProfile = async () => {
//     if (!token) {
//       setToastMsg("No session. Please login again.");
//       return;
//     }

//     setLoading(true);
//     const formData = new FormData();
//     formData.append("full_name", profile.name);
//     formData.append("phone", profile.phone);
//     formData.append("address", profile.address);
//     formData.append("busNumber", profile.busNumber);

//     // Only append image file if user selected a new one
//     if (imageFile) {
//       formData.append("profile_picture", imageFile);
//     }

//     try {
//       const res = await fetch(
//         isCreated ? `${API_BASE}/driver-profile/update` : `${API_BASE}/driver-profile`,
//         {
//           method: isCreated ? 'PATCH' : 'POST',
//           headers: { Authorization: `Bearer ${token}` },
//           body: formData
//         }
//       );

//       const data = await res.json();

//       if (res.ok) {
//         setToastMsg(isCreated ? "Profile updated!" : "Profile created!");
//         setImageFile(null); // clear selected file after upload
//         fetchProfile(); // re-fetch to get updated image from API
//       } else {
//         setToastMsg(data.detail?.message || data.message || "Failed to save profile");
//       }
//     } catch (err) {
//       console.error("Save profile error:", err);
//       setToastMsg("Failed to save profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <IonPage>
//       <NavbarSidebar />

//       <IonContent className="bg-white dark:bg-gray-900 text-black dark:text-white pt-16">
//         <div className="max-w-3xl mx-auto p-5 mt-10">
//           <h1 className="text-3xl font-bold mb-2 mt-6">Driver Profile Setup</h1>
//           <p className="text-gray-500 dark:text-gray-300 mb-6">
//             Fill in your details to complete your Uber Shuttle driver profile.
//           </p>

//           {/* Profile Image */}
//           <div className="flex flex-col items-center mb-6 relative">
//             <div
//               className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 cursor-pointer relative"
//               onClick={() => document.getElementById('profileUpload')?.click()}
//             >
//               {imagePreview ? (
//                 <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
//               ) : (
//                 <UserCircleIcon className="w-full h-full text-gray-400 dark:text-gray-600" />
//               )}
//             </div>
//             <input
//               type="file"
//               accept="image/*"
//               id="profileUpload"
//               onChange={handleImageChange}
//               className="hidden"
//             />
//           </div>

//           {/* Form */}
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Full Name</label>
//               <div className="flex items-center border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
//                 <UserCircleIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 ml-2" />
//                 <input
//                   type="text"
//                   name="name"
//                   value={profile.name}
//                   onChange={handleChange}
//                   placeholder="Enter your full name"
//                   className="w-full p-2 bg-transparent outline-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">Phone Number</label>
//               <div className="flex items-center border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
//                 <PhoneIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 ml-2" />
//                 <input
//                   type="tel"
//                   name="phone"
//                   value={profile.phone}
//                   onChange={handleChange}
//                   placeholder="Enter your phone number"
//                   className="w-full p-2 bg-transparent outline-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                 />
//               </div>
//             </div>

          
//           </div>

//           {/* Save Button */}
//           <div className="mt-6 flex justify-center">
//             <IonButton onClick={saveProfile}>{isCreated ? 'Update Profile' : 'Create Profile'}</IonButton>
//           </div>

//           <IonLoading isOpen={loading} message="Saving profile..." />
//           <IonToast
//             isOpen={!!toastMsg}
//             message={toastMsg}
//             duration={2500}
//             onDidDismiss={() => setToastMsg('')}
//           />
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default ProfileSetup;

import React, { useState, useEffect, ChangeEvent } from 'react';
import { IonPage, IonContent, IonButton, IonLoading, IonToast } from '@ionic/react';
import NavbarSidebar from '../users/pages/Navbar';
import { UserCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

// ================================
// ProtectedImage component (inline)
// ================================
type ProtectedImageProps = {
  fileId: string;
  token: string | null;
  alt?: string;
  className?: string;
};
const ProtectedImage: React.FC<ProtectedImageProps> = ({ fileId, token, alt = "", className }) => {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    if (!fileId || !token) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    const loadImage = async () => {
      try {
        const res = await fetch(`${API_BASE}/driver-profile/me/profile-pic`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Failed to load image: ${res.status}`);
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setSrc(objectUrl);
      } catch (err) {
        console.error(err);
        if (!cancelled) setSrc("");
      }
    };

    loadImage();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId, token]);

  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
};

// ================================
// ProfileSetup page
// ================================
const ProfileSetup: React.FC = () => {
  const [profile, setProfile] = useState({
    name: '',
    address: '',
    phone: '',
    busNumber: '',
    profileFileId: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

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
        name: data.full_name || '',
        phone: data.phone || '',
        address: data.address || '',
        busNumber: data.busNumber || '',
        profileFileId: data.profile_picture_path || '', // fileId from API
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
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    // preview local file immediately
    const localPreview = URL.createObjectURL(file);
    setProfile({ ...profile, profileFileId: localPreview });
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
    formData.append("address", profile.address);
    formData.append("busNumber", profile.busNumber);

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
        setToastMsg(isCreated ? "Profile updated!" : "Profile created!");
        setImageFile(null);
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

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-white dark:bg-gray-900 text-black dark:text-white pt-16">
        <div className="max-w-3xl mx-auto p-5 mt-10">
          <h1 className="text-3xl font-bold mb-2 mt-6">Driver Profile Setup</h1>
          <p className="text-gray-500 dark:text-gray-300 mb-6">
            Fill in your details to complete your Uber Shuttle driver profile.
          </p>

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6 relative">
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 cursor-pointer relative"
              onClick={() => document.getElementById('profileUpload')?.click()}
            >
              {profile.profileFileId ? (
                <ProtectedImage
                  fileId={profile.profileFileId}
                  token={token}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircleIcon className="w-full h-full text-gray-400 dark:text-gray-600" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              id="profileUpload"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <div className="flex items-center border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <UserCircleIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 ml-2" />
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full p-2 bg-transparent outline-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <div className="flex items-center border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <PhoneIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 ml-2" />
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full p-2 bg-transparent outline-none text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-center">
            <IonButton onClick={saveProfile}>{isCreated ? 'Update Profile' : 'Create Profile'}</IonButton>
          </div>

          <IonLoading isOpen={loading} message="Saving profile..." />
          <IonToast
            isOpen={!!toastMsg}
            message={toastMsg}
            duration={2500}
            onDidDismiss={() => setToastMsg('')}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ProfileSetup;