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
  CurrencyDollarIcon,
  ArrowLeftIcon,
  ArrowsPointingOutIcon
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

// Initial profile state - all fields empty
const initialProfileState = {
  id: '',
  user_id: '',
  name: '',
  phone: '',
  email: '',
  profile_picture_path: '',
  verification_status: '',
  average_rating: null as number | null,
  total_reviews: 0,
  residential_street_line_1: '',
  residential_street_line_2: '',
  residential_city: '',
  residential_state: '',
  residential_postal_code: '',
  residential_country: ''
};

const ProfileSetup: React.FC = () => {
  const [profile, setProfile] = useState(initialProfileState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCreated, setIsCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  
  // New state for image viewer modal
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  
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
    
    // Cleanup function - reset all form data when component unmounts
    return () => {
      resetForm();
    };
  }, [token]);

  // ======================
  // Reset form to initial state
  // ======================
  const resetForm = () => {
    setProfile(initialProfileState);
    setImageFile(null);
    setImagePreview('');
    setProfileImageUrl('');
    setIsCreated(false);
    setIsEditing(false);
  };

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
        // Profile not found - reset form to initial state
        setIsCreated(false);
        resetForm();
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
    } finally {
      setLoadingInspection(false);
    }
  };

  // ======================
  // Handle form changes
  // ======================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

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
    // Close the viewer after selecting new image
    setIsImageViewerOpen(false);
  };

  // ======================
  // Handle image click - open full viewer
  // ======================
  const handleImageClick = () => {
    // Only open viewer if there's an image to show
    const currentImage = imagePreview || profileImageUrl;
    if (currentImage) {
      setIsImageViewerOpen(true);
    }
  };

  // ======================
  // Handle image remove
  // ======================
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setProfileImageUrl('');
    setIsImageViewerOpen(false);
    // Clear the file input
    const fileInput = document.getElementById('profileUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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

    // Make Street Address Line 2 mandatory
    if (!profile.residential_street_line_2.trim()) {
      setToastMsg("Please enter your street address line 2 (Apartment, suite, unit, etc.)");
      return;
    }

    // Validate all residential address fields
    if (!profile.residential_street_line_1.trim()) {
      setToastMsg("Please enter your street address line 1");
      return;
    }

    if (!profile.residential_city.trim()) {
      setToastMsg("Please enter your city");
      return;
    }

    if (!profile.residential_state.trim()) {
      setToastMsg("Please enter your state/province");
      return;
    }

    if (!profile.residential_postal_code.trim()) {
      setToastMsg("Please enter your postal code");
      return;
    }

    if (!profile.residential_country.trim()) {
      setToastMsg("Please select your country");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("full_name", profile.name);
    formData.append("phone", profile.phone);
    
    // Append residential address fields - ALL MANDATORY
    formData.append("residential_street_line_1", profile.residential_street_line_1);
    formData.append("residential_street_line_2", profile.residential_street_line_2);
    formData.append("residential_city", profile.residential_city);
    formData.append("residential_state", profile.residential_state);
    formData.append("residential_postal_code", profile.residential_postal_code);
    formData.append("residential_country", profile.residential_country);
    
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
        // Reset form after successful creation
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

    // Make Street Address Line 2 mandatory for update as well
    if (!profile.residential_street_line_2.trim()) {
      setToastMsg("Please enter your street address line 2 (Apartment, suite, unit, etc.)");
      return;
    }

    // Validate all residential address fields
    if (!profile.residential_street_line_1.trim()) {
      setToastMsg("Please enter your street address line 1");
      return;
    }

    if (!profile.residential_city.trim()) {
      setToastMsg("Please enter your city");
      return;
    }

    if (!profile.residential_state.trim()) {
      setToastMsg("Please enter your state/province");
      return;
    }

    if (!profile.residential_postal_code.trim()) {
      setToastMsg("Please enter your postal code");
      return;
    }

    if (!profile.residential_country.trim()) {
      setToastMsg("Please select your country");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("full_name", profile.name);
    formData.append("phone", profile.phone);
    
    // Append residential address fields - ALL MANDATORY
    formData.append("residential_street_line_1", profile.residential_street_line_1);
    formData.append("residential_street_line_2", profile.residential_street_line_2);
    formData.append("residential_city", profile.residential_city);
    formData.append("residential_state", profile.residential_state);
    formData.append("residential_postal_code", profile.residential_postal_code);
    formData.append("residential_country", profile.residential_country);

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

  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        {/* CHANGED: Reduced pt-20 to pt-14 to move header lower */}
        <div className="relative z-10 pt-22 pb-8 px-4 md:px-6 max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 text-center md:text-left">
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

          {/* Main Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Profile Header with Gradient */}
            <div className="relative">
              <div className="h-24 bg-linear-to-r from-gray-700 to-gray-900 dark:from-gray-600 dark:to-gray-800"></div>
              
              {/* Profile Image */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 md:left-8 md:translate-x-0">
                <div className="relative">
                  {/* Image Click Area - Opens viewer */}
                  <div 
                    className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl cursor-pointer group bg-white dark:bg-gray-700 relative"
                    onClick={handleImageClick}
                  >
                    {displayImage ? (
                      <>
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
                        {/* Hover overlay for viewer */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                          <ArrowsPointingOutIcon className="w-6 h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <UserCircleIcon className="w-full h-full text-gray-400 dark:text-gray-500" />
                    )}
                  </div>

                  {/* Camera button for upload - positioned next to the profile image */}
                  <div className="absolute -bottom-1 -right-1">
                    <label
                      htmlFor="profileUpload"
                      className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-200 cursor-pointer flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800 transition-all duration-200"
                      title="Upload new profile picture"
                    >
                      <CameraIcon className="w-4 h-4 text-white dark:text-gray-900" />
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      id="profileUpload"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
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
                        Residential Address <span className="text-red-500">*</span>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        This address must match the address linked to your bank account.
                      </p>
                    </div>
                    
                    <div className="space-y-4 mt-4">
                      {/* Street Line 1 */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          Street Address Line 1 <span className="text-red-500">*</span>
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

                      {/* Street Line 2 - NOW MANDATORY */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                          Street Address Line 2 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                          <input
                            type="text"
                            name="residential_street_line_2"
                            value={profile.residential_street_line_2}
                            onChange={handleChange}
                            placeholder="Apartment, suite, unit, etc. (Required)"
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Apartment number, suite, floor, or building name
                        </p>
                      </div>

                      {/* City and State Row */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            City <span className="text-red-500">*</span>
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
                            State / Province <span className="text-red-500">*</span>
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
                            Postal Code <span className="text-red-500">*</span>
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
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            Country <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <select
                              name="residential_country"
                              value={profile.residential_country}
                              onChange={handleChange}
                              className="w-full pl-11 pr-4 py-3 rounded-xl 
                                         border border-gray-300 dark:border-gray-600 
                                         bg-white dark:bg-gray-700 
                                         text-gray-900 dark:text-gray-100 
                                         focus:outline-none
                                         focus:border-gray-500 dark:focus:border-gray-400
                                         focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20
                                         transition-all duration-200
                                         appearance-none"
                            >
                              <option value="">Select Country</option>
                              <option value="IN">India (IN)</option>
                              <option value="US">United States (US)</option>
                              <option value="GB">United Kingdom (GB)</option>
                              <option value="CA">Canada (CA)</option>
                              <option value="AU">Australia (AU)</option>
                              <option value="DE">Germany (DE)</option>
                              <option value="FR">France (FR)</option>
                              <option value="JP">Japan (JP)</option>
                              <option value="BR">Brazil (BR)</option>
                              <option value="MX">Mexico (MX)</option>
                              <option value="ES">Spain (ES)</option>
                              <option value="IT">Italy (IT)</option>
                              <option value="KR">South Korea (KR)</option>
                              <option value="NL">Netherlands (NL)</option>
                              <option value="SE">Sweden (SE)</option>
                              <option value="NO">Norway (NO)</option>
                              <option value="DK">Denmark (DK)</option>
                              <option value="FI">Finland (FI)</option>
                              <option value="SG">Singapore (SG)</option>
                              <option value="MY">Malaysia (MY)</option>
                              <option value="TH">Thailand (TH)</option>
                              <option value="VN">Vietnam (VN)</option>
                              <option value="PH">Philippines (PH)</option>
                              <option value="ID">Indonesia (ID)</option>
                              <option value="PK">Pakistan (PK)</option>
                              <option value="BD">Bangladesh (BD)</option>
                              <option value="LK">Sri Lanka (LK)</option>
                              <option value="NP">Nepal (NP)</option>
                              <option value="AE">United Arab Emirates (AE)</option>
                              <option value="SA">Saudi Arabia (SA)</option>
                              <option value="QA">Qatar (QA)</option>
                              <option value="KW">Kuwait (KW)</option>
                              <option value="OM">Oman (OM)</option>
                              <option value="BH">Bahrain (BH)</option>
                              <option value="ZA">South Africa (ZA)</option>
                              <option value="NG">Nigeria (NG)</option>
                              <option value="KE">Kenya (KE)</option>
                              <option value="EG">Egypt (EG)</option>
                              <option value="MA">Morocco (MA)</option>
                            </select>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Select your country (2-letter country code will be sent)
                          </p>
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
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {profile.residential_country === "IN" && "India"}
                            {profile.residential_country === "US" && "United States"}
                            {profile.residential_country === "GB" && "United Kingdom"}
                            {profile.residential_country === "CA" && "Canada"}
                            {profile.residential_country === "AU" && "Australia"}
                            {profile.residential_country === "DE" && "Germany"}
                            {profile.residential_country === "FR" && "France"}
                            {profile.residential_country === "JP" && "Japan"}
                            {!["IN","US","GB","CA","AU","DE","FR","JP"].includes(profile.residential_country) && profile.residential_country}
                          </p>
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

        {/* ============================================ */}
        {/* FULL IMAGE VIEWER MODAL */}
        {/* ============================================ */}
        {isImageViewerOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg animate-fadeIn"
            onClick={() => setIsImageViewerOpen(false)}
          >
            <div 
              className="relative max-w-4xl max-h-[90vh] w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsImageViewerOpen(false)}
                className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors p-2"
              >
                <XMarkIcon className="w-8 h-8" />
              </button>

              {/* Image Container */}
              <div className="relative bg-black/50 rounded-2xl overflow-hidden">
                <img
                  src={displayImage}
                  alt="Profile Full View"
                  className="w-full h-auto max-h-[80vh] object-contain"
                  onError={(e) => {
                    console.error("Full image failed to load:", displayImage);
                    e.currentTarget.style.display = 'none';
                  }}
                />

                {/* Action Buttons Overlay at Bottom */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-full px-4 py-3 border border-white/10">
                  {/* Upload New Image Button */}
                  <label
                    htmlFor="profileUploadViewer"
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full cursor-pointer transition-all duration-200 text-sm font-medium"
                  >
                    <CameraIcon className="w-5 h-5" />
                    Change Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="profileUploadViewer"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {/* Remove Image Button - Only show when editing or creating */}
                  {(isEditing || !isCreated) && displayImage && (
                    <button
                      onClick={handleRemoveImage}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-all duration-200 text-sm font-medium"
                    >
                      <XMarkIcon className="w-5 h-5" />
                      Remove
                    </button>
                  )}

                  {/* Close Button */}
                  <button
                    onClick={() => setIsImageViewerOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 text-sm font-medium"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .z-50 {
          z-index: 50;
        }
      `}</style>
    </IonPage>
  );
};

export default ProfileSetup;