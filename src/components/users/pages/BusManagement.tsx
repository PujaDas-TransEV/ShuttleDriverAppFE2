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
  UserIcon,
  IdentificationIcon
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
}

const DriverVehicle: React.FC = () => {
  const history = useHistory();
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isEditing, setIsEditing] = useState(false);
  const [formVehicle, setFormVehicle] = useState<any>({});
  
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
      }
    };
    loadToken();
  }, []);

  // Fetch vehicle when token is available
  useEffect(() => {
    if (token) {
      fetchVehicle();
    }
  }, [token]);

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

  // Update Vehicle PATCH
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

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                        // <button
                        //   onClick={() => setIsEditing(true)}
                        //   className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 shadow-lg"
                        // >
                        //   <PencilIcon className="w-4 h-4" />
                        //   Edit Vehicle
                        // </button>
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
                            <p className="text-sm font-medium dark:text-gray-200">{formatDate(vehicleData.verification_requested_at)}</p>
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

                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Seat Count
                          </label>
                          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                            {vehicleData.seat_count} Seats
                          </p>
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

                    {/* Reviewed Information */}
                    {vehicleData.reviewed_at && (
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3">
                          <EyeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <div>
                            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                              Reviewed by Admin
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400">
                              {formatDate(vehicleData.reviewed_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

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
                                   bg-white dark:bg-gray-400 text-gray-900 dark:text-white
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
                                   bg-white dark:bg-gray-400 text-gray-900 dark:text-white
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
                                   bg-white dark:bg-gray-400 text-gray-900 dark:text-white
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
                                   bg-white dark:bg-gray-400 text-gray-900 dark:text-white
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
                                   bg-white dark:bg-gray-400 text-gray-900 dark:text-white
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
                                   bg-white dark:bg-gray-400 text-gray-900 dark:text-white
                                   focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                                   transition-all duration-200"
                        />
                      </div>
                    </div>

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
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
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
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
    </button>
  </div>
</div>

{/* Rented Vehicle Fields */}
{ownershipType === 'rented' && (
  <div className="space-y-5 animate-slideDown">
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
                     bg-white dark:bg-gray-400 text-gray-900 dark:text-gray-100
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
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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

{/* Add this CSS to your global styles or component */}
<style>{`
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
`}</style>

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
  style={{
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingTop: '12px',
    paddingBottom: '12px',
    backgroundColor: '#000000',
    color: '#ffffff',
    borderRadius: '12px',
    fontWeight: '600',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '140px',
    height: '48px',
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
  }}
  className="group relative px-8 py-3 bg-linear-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:from-gray-600 hover:to-gray-700 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl overflow-hidden"
  style={{
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingTop: '12px',
    paddingBottom: '12px',
    borderRadius: '12px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    border: 'none',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '140px',
    height: '48px',
    justifyContent: 'center',
    position: 'relative'
  }}
>
  {/* Shine effect on hover */}
  <span className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
  
  {/* Icon with animation */}
  <svg 
    className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
  
  <span className="relative">Cancel</span>
</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DriverVehicle;