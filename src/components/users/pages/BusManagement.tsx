import React, { useState, useEffect, ChangeEvent } from 'react';
import { IonPage, IonContent, IonLoading } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences'; // Add this import
import NavbarSidebar from '../pages/Navbar';
import { PencilIcon, CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, EyeIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

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
}

const DriverVehicle: React.FC = () => {
  const history = useHistory();
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [isEditing, setIsEditing] = useState(false);
  const [formVehicle, setFormVehicle] = useState<any>({});
  const [rearPhoto, setRearPhoto] = useState<File | null>(null);
  const [rcFile, setRcFile] = useState<File | null>(null);
  const [registrationValidTill, setRegistrationValidTill] = useState<string>("");
  const [token, setToken] = useState<string | null>(null);

  const [rearPreview, setRearPreview] = useState<string | null>(null);
  const [rcPreview, setRcPreview] = useState<string | null>(null);
  
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
      // Set registration valid till date if exists
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'rear' | 'rc') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (type === 'rear') {
      setRearPhoto(file);
      setRearPreview(previewUrl);
    } else {
      setRcFile(file);
      setRcPreview(previewUrl);
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
      
      // Add registration_valid_till to FormData
      if (registrationValidTill) {
        fd.append("registration_valid_till", registrationValidTill);
      }

      if (rearPhoto) fd.append("rear_photo", rearPhoto);
      if (rcFile) fd.append("rc_file", rcFile);

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
                          <PencilIcon className="w-5 h-5 text-white dark:text-black" />
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
                      {status === "REJECTED" && (
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
                              style={{ backgroundColor: vehicleData.color.toLowerCase() }}
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
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Edit Form
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Vehicle</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Update your vehicle information</p>
                  </div>

                  <div className="p-6 space-y-6">
                    {['vehicle_name', 'vehicle_model', 'color', 'seat_count'].map(field => (
                      <div key={field}>
                        <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">
                          {field.replace('_', ' ').toUpperCase()}
                        </label>
                        <input
                          type={field === 'seat_count' ? 'number' : 'text'}
                          name={field}
                          value={formVehicle[field]}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                                   transition-all duration-200"
                        />
                      </div>
                    ))}
                    
                    <div>
                      <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Vehicle Type</label>
                      <select
                        name="has_ac"
                        value={formVehicle.has_ac}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
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
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                                 transition-all duration-200"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">Rear Photo</label>
                        {rearPreview ? (
                          <img src={rearPreview} className="w-32 h-32 object-cover rounded-lg mb-2 border-2" alt="Preview" />
                        ) : vehicleData?.rear_photo_file_path ? (
                          <img src={`${API_BASE}/${vehicleData.rear_photo_file_path}`} className="w-32 h-32 object-cover rounded-lg mb-2 border-2" alt="Current" />
                        ) : null}
                        <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'rear')} className="mt-2" />
                      </div>

                      <div>
                        <label className="block font-medium mb-2 text-gray-700 dark:text-gray-300">RC Document</label>
                        {rcPreview ? (
                          rcPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img src={rcPreview} className="w-32 h-32 object-cover rounded-lg mb-2 border-2" alt="Preview" />
                          ) : (
                            <div className="w-32 h-32 rounded-lg mb-2 border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                              <span className="text-xs">PDF File</span>
                            </div>
                          )
                        ) : vehicleData?.rc_file_path ? (
                          vehicleData.rc_file_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <img src={`${API_BASE}/${vehicleData.rc_file_path}`} className="w-32 h-32 object-cover rounded-lg mb-2 border-2" alt="Current" />
                          ) : (
                            <div className="w-32 h-32 rounded-lg mb-2 border-2 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                              <span className="text-xs">PDF File</span>
                            </div>
                          )
                        ) : null}
                        <input type="file" accept="image/*,application/pdf" onChange={e => handleFileChange(e, 'rc')} className="mt-2" />
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
    setRearPhoto(null);
    setRcFile(null);
    if (vehicleData?.registration_valid_till) {
      setRegistrationValidTill(vehicleData.registration_valid_till.split('T')[0]);
    }
  }}
  style={{
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingTop: '12px',
    paddingBottom: '12px',
    backgroundColor: '#6b7280',
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
    e.currentTarget.style.backgroundColor = '#4b5563';
    e.currentTarget.style.transform = 'scale(1.05)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = '#6b7280';
    e.currentTarget.style.transform = 'scale(1)';
  }}
>
  ❌ Cancel
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