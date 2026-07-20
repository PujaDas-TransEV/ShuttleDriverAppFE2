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
  CheckBadgeIcon,
  EyeIcon
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
  allow_driver_rfid_seat_reservation: boolean;
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

  // Owner details for rented vehicles
  const [ownerName, setOwnerName] = useState<string>('');
  
  // File states - Using File objects (works on both web and Android)
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
  
  // File name states for display
  const [rearFileName, setRearFileName] = useState<string>('');
  const [rcFileName, setRcFileName] = useState<string>('');
  const [authorizationFileName, setAuthorizationFileName] = useState<string>('');
  const [frontFileName, setFrontFileName] = useState<string>('');
  const [interiorFileName, setInteriorFileName] = useState<string>('');
  const [leftSideFileName, setLeftSideFileName] = useState<string>('');
  const [rightSideFileName, setRightSideFileName] = useState<string>('');
  const [insuranceFileName, setInsuranceFileName] = useState<string>('');
  const [pollutionFileName, setPollutionFileName] = useState<string>('');
  const [aadhaarFileName, setAadhaarFileName] = useState<string>('');
  
  // Preview states (for display)
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
      
      if (!data.allow_driver_rfid_seat_reservation) {
        setVehicle(prev => ({
          ...prev,
          enable_rfid_reservation: false,
          default_rfid_reserved_seat_count: 0
        }));
      }
      
    } catch (error) {
      console.error("❌ Error fetching RFID config:", error);
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
        setRearFileName(file.name);
        break;
      case 'rc':
        setRcFile(file);
        setRcPreview(url);
        setRcFileName(file.name);
        break;
      case 'authorization':
        setAuthorizationFile(file);
        setAuthorizationPreview(url);
        setAuthorizationFileName(file.name);
        break;
      case 'front':
        setFrontPhoto(file);
        setFrontPreview(url);
        setFrontFileName(file.name);
        break;
      case 'interior':
        setInteriorPhoto(file);
        setInteriorPreview(url);
        setInteriorFileName(file.name);
        break;
      case 'left':
        setLeftSidePhoto(file);
        setLeftSidePreview(url);
        setLeftSideFileName(file.name);
        break;
      case 'right':
        setRightSidePhoto(file);
        setRightSidePreview(url);
        setRightSideFileName(file.name);
        break;
      case 'insurance':
        setInsuranceDocument(file);
        setInsurancePreview(url);
        setInsuranceFileName(file.name);
        break;
      case 'pollution':
        setPollutionDocument(file);
        setPollutionPreview(url);
        setPollutionFileName(file.name);
        break;
      case 'aadhaar':
        setOwnerAadhaarCard(file);
        setAadhaarPreview(url);
        setAadhaarFileName(file.name);
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
        setRearFileName('');
        break;
      case 'rc':
        setRcFile(null);
        setRcPreview(null);
        setRcFileName('');
        break;
      case 'authorization':
        setAuthorizationFile(null);
        setAuthorizationPreview(null);
        setAuthorizationFileName('');
        break;
      case 'front':
        setFrontPhoto(null);
        setFrontPreview(null);
        setFrontFileName('');
        break;
      case 'interior':
        setInteriorPhoto(null);
        setInteriorPreview(null);
        setInteriorFileName('');
        break;
      case 'left':
        setLeftSidePhoto(null);
        setLeftSidePreview(null);
        setLeftSideFileName('');
        break;
      case 'right':
        setRightSidePhoto(null);
        setRightSidePreview(null);
        setRightSideFileName('');
        break;
      case 'insurance':
        setInsuranceDocument(null);
        setInsurancePreview(null);
        setInsuranceFileName('');
        break;
      case 'pollution':
        setPollutionDocument(null);
        setPollutionPreview(null);
        setPollutionFileName('');
        break;
      case 'aadhaar':
        setOwnerAadhaarCard(null);
        setAadhaarPreview(null);
        setAadhaarFileName('');
        break;
    }
  };

  // File Upload Component
  const FileUploadField = ({ 
    label, 
    required, 
    preview, 
    fileName, 
    onRemove, 
    onUpload, 
    accept = "image/*,application/pdf",
    id
  }: any) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        
        <div className="flex flex-wrap items-center gap-3">
          {preview && (
            <div className="relative inline-block">
              {preview.match(/\.(jpg|jpeg|png|gif)$/i) || preview.startsWith('data:image') ? (
                <img 
                  src={preview} 
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md" 
                  alt={label} 
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <button
                onClick={onRemove}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-lg"
                style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                type="button"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {fileName && (
            <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-37.5 sm:max-w-50">
              📎 {fileName}
            </p>
          )}
        </div>
        
        <label
          className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition w-full sm:w-auto"
          style={{ height: '44px', minWidth: '160px' }}
        >
          <CloudArrowUpIcon className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-300" />
          <span className="text-sm text-gray-700 dark:text-gray-200">
            {preview ? 'Change File' : 'Upload File'}
          </span>
          <input 
            type="file" 
            accept={accept} 
            onChange={(e) => onUpload(e)} 
            className="hidden" 
            id={id}
          />
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG, PDF (Max 5MB)</p>
      </div>
    );
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
      setServerError("Please select vehicle type.");
      showToast("Please select vehicle type.", 'error');
      return;
    }

    if (!vehicle.vehicle_name) {
      setServerError("Please enter vehicle name.");
      showToast("Please enter vehicle name.", 'error');
      return;
    }

    if (!vehicle.registration_number) {
      setServerError("Please enter registration number.");
      showToast("Please enter registration number.", 'error');
      return;
    }

    if (!vehicle.vehicle_model) {
      setServerError("Please enter vehicle model.");
      showToast("Please enter vehicle model.", 'error');
      return;
    }

    if (vehicle.seat_count <= 0) {
      setServerError("Seat count must be greater than 0.");
      showToast("Seat count must be greater than 0.", 'error');
      return;
    }

    if (!vehicle.registration_valid_till) {
      setServerError("Registration valid till date is required.");
      showToast("Please select registration valid till date.", 'error');
      return;
    }

    if (!vehicle.ownership_type) {
      setServerError("Please select ownership type.");
      showToast("Please select ownership type.", 'error');
      return;
    }

    if (!isValidRCNumber(vehicle.registration_number)) {
      setServerError("Invalid registration number format.");
      showToast("Invalid registration number format.", 'error');
      return;
    }

    if (rfidConfig?.allow_driver_rfid_seat_reservation && vehicle.enable_rfid_reservation) {
      if (vehicle.default_rfid_reserved_seat_count <= 0) {
        setServerError("Please set RFID reserved seat count (minimum 1).");
        showToast("Please set RFID reserved seat count.", 'error');
        return;
      }
      if (vehicle.default_rfid_reserved_seat_count > vehicle.seat_count) {
        setServerError("RFID reserved seats cannot exceed total seat count.");
        showToast("RFID reserved seats cannot exceed total seats.", 'error');
        return;
      }
    }

    if (!rcFile) {
      setServerError("RC document is required.");
      showToast("Please upload RC document.", 'error');
      return;
    }

    if (!rearPhoto) {
      setServerError("Rear photo is required.");
      showToast("Please upload rear photo.", 'error');
      return;
    }

    if (vehicle.ownership_type === 'rented') {
      if (!ownerName) {
        setServerError("Owner name is required for rented vehicle.");
        showToast("Please enter owner name.", 'error');
        return;
      }
      if (!ownerAadhaarCard) {
        setServerError("Owner Aadhaar card is required for rented vehicle.");
        showToast("Please upload owner's Aadhaar card.", 'error');
        return;
      }
      if (!authorizationFile) {
        setServerError("Authorization document is required for rented vehicle.");
        showToast("Please upload authorization document.", 'error');
        return;
      }
    }

    if (vehicle.ownership_type === 'self' && authorizationFile) {
      setServerError("Authorization document should not be uploaded for self-owned vehicle.");
      showToast("Authorization document not allowed for self-owned vehicle.", 'error');
      return;
    }

    console.log("✅ All validations passed!");
    setLoading(true);

    try {
      const formData = new FormData();
      
      // Append all form fields
      formData.append("has_ac", vehicle.hasAc);
      formData.append("seat_count", String(vehicle.seat_count));
      formData.append("color", vehicle.color || '');
      formData.append("vehicle_model", vehicle.vehicle_model);
      formData.append("vehicle_name", vehicle.vehicle_name);
      formData.append("registration_number", vehicle.registration_number.toUpperCase());
      formData.append("registration_valid_till", vehicle.registration_valid_till);
      formData.append("ownership_type", vehicle.ownership_type);
      
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
      
      // Append files - Make sure they are not null
      if (rearPhoto) formData.append("rear_photo", rearPhoto);
      if (rcFile) formData.append("rc_file", rcFile);
      if (frontPhoto) formData.append("front_photo", frontPhoto);
      if (interiorPhoto) formData.append("interior_photo", interiorPhoto);
      if (leftSidePhoto) formData.append("left_side_photo", leftSidePhoto);
      if (rightSidePhoto) formData.append("right_side_photo", rightSidePhoto);
      if (authorizationFile && vehicle.ownership_type === 'rented') {
        formData.append("authentication_file", authorizationFile);
      }
      if (insuranceDocument) formData.append("insurance_document", insuranceDocument);
      if (pollutionDocument) formData.append("pollution_document", pollutionDocument);
      if (ownerAadhaarCard && vehicle.ownership_type === 'rented') {
        formData.append("owner_aadhaar_card", ownerAadhaarCard);
      }

      // Log FormData contents for debugging
      console.log("📝 FormData contents:");
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}: ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      console.log("📡 Sending request to:", `${API_BASE}/driver/vehicle/register`);
      
      const registerRes = await fetch(`${API_BASE}/driver/vehicle/register`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData,
      });

      // Get response as text first for better error handling
      const responseText = await registerRes.text();
      console.log("📥 Response status:", registerRes.status);
      console.log("📥 Response body:", responseText);

      let registerData;
      try {
        registerData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error("❌ Failed to parse response:", e);
        throw new Error(`Server returned invalid response: ${responseText}`);
      }

      if (!registerRes.ok) {
        console.error("❌ Register API failed:", registerData);
        const errorMessage = registerData.detail || registerData.message || registerData.error || "Vehicle registration failed.";
        setServerError(errorMessage);
        showToast(errorMessage, 'error');
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
        const errorMessage = submitData.detail || submitData.message || "Vehicle submission failed.";
        setServerError(errorMessage);
        showToast(errorMessage, 'error');
      }
    } catch (err: any) {
      console.error("❌ Error during registration:", err);
      const errorMessage = err.message || "Network error. Please check your connection and try again.";
      setServerError(errorMessage);
      showToast(errorMessage, 'error');
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

  const isRfidAvailable = rfidConfig?.allow_driver_rfid_seat_reservation === true;

  return (
    <IonPage className="bg-white dark:bg-black">
      <NavbarSidebar />
      
      <IonContent className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-black dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 pt-16 sm:pt-20">
          
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8 animate-fadeInUp">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-blue-600 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <TruckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Vehicle Registration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-linear-to-r from-gray-800 to-gray-800 dark:from-white dark:to-gray-600 bg-clip-text text-transparent mb-2 sm:mb-3">
              Register Your Vehicle
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto px-2">
              Add your bus details and documents to register your vehicle for shuttle services
            </p>
          </div>

          {/* Error Message Display */}
          {serverError && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 animate-fadeIn">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">Registration Error</p>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-0.5">{serverError}</p>
                  <button
                    onClick={() => setServerError(null)}
                    className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-fadeInUp animation-delay-200">
            
            {/* Form Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-black dark:bg-white rounded-xl">
                  <PencilIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Vehicle Information
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Fill in all the required details below
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto scrollable-content">
              
              {/* Loading RFID Config */}
              {loadingRfidConfig && (
                <div className="p-3 sm:p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Loading RFID configuration...</p>
                  </div>
                </div>
              )}

              {/* RFID Available Banner */}
              {!loadingRfidConfig && rfidConfig && rfidConfig.allow_driver_rfid_seat_reservation && (
                <div className="p-3 sm:p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-green-100 dark:bg-green-800 rounded-lg">
                      <CheckBadgeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">
                        ✅ RFID Seat Reservation Available
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                        You can enable RFID seat reservation for this vehicle
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* RFID Unavailable Banner */}
              {!loadingRfidConfig && rfidConfig && !rfidConfig.allow_driver_rfid_seat_reservation && (
                <div className="p-3 sm:p-4 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg">
                      <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
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
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Registration Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    name="registration_number"
                    value={vehicle.registration_number}
                    onChange={handleChange}
                    placeholder="e.g., WB01AB1234"
                    className={`w-full px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-sm sm:text-base rounded-xl border-2 transition-all duration-200
                             bg-white dark:bg-gray-700 
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
                    <ExclamationTriangleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500 mt-0.5" />
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{rcValidationError}</p>
                  </div>
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Vehicle Type */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="hasAc"
                    value={vehicle.hasAc}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-700 
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
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Seat Count <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => handleSeatCountChange(false)}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700
                               transition-all duration-200 flex items-center justify-center
                               disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={vehicle.seat_count <= 0}
                    >
                      <MinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      <input
                        type="number"
                        name="seat_count"
                        value={vehicle.seat_count}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-sm sm:text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 
                                 bg-white dark:bg-gray-700 
                                 text-gray-900 dark:text-white text-center font-semibold
                                 focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                                 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleSeatCountChange(true)}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700
                               transition-all duration-200 flex items-center justify-center"
                    >
                      <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total number of seats excluding driver seat
                  </p>
                </div>
              </div>

              {/* RFID Seat Reservation Section */}
              {isRfidAvailable && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="text-sm sm:text-md font-semibold text-gray-900 dark:text-white">
                          RFID Seat Reservation
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRfidInfo(!showRfidInfo)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                      >
                        <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                    
                    {showRfidInfo && (
                      <div className="mb-3 sm:mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 animate-fadeIn">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Enable RFID seat reservation to automatically reserve a specific number of seats for RFID card holders. 
                          These seats will be pre-reserved for passengers with RFID cards on each trip.
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-linear-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <CpuChipIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
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
                        className={`relative inline-flex h-5 w-10 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                          ${vehicle.enable_rfid_reservation ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform
                            ${vehicle.enable_rfid_reservation ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>
                  </div>

                  {vehicle.enable_rfid_reservation && (
                    <div className="p-3 sm:p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 animate-fadeInUp">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
                          <span>Default RFID Reserved Seats</span>
                          <span className="text-red-500">*</span>
                        </div>
                      </label>
                      
                      <div className="flex items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => handleRfidSeatCountChange(false)}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20
                                   transition-all duration-200 flex items-center justify-center
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={vehicle.default_rfid_reserved_seat_count <= 0}
                        >
                          <MinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        
                        <div className="flex-1 relative">
                          <ShieldCheckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                          <input
                            type="number"
                            name="default_rfid_reserved_seat_count"
                            value={vehicle.default_rfid_reserved_seat_count}
                            onChange={handleChange}
                            min="0"
                            max={vehicle.seat_count}
                            className="w-full px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-sm sm:text-base rounded-xl border-2 border-purple-200 dark:border-purple-700 
                                     bg-white dark:bg-gray-700 
                                     text-gray-900 dark:text-white text-center font-semibold
                                     focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20
                                     transition-all duration-200 [appearance:textfield]"
                          />
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleRfidSeatCountChange(true)}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 
                                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                   hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20
                                   transition-all duration-200 flex items-center justify-center"
                        >
                          <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                      
                      <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total Seats</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{vehicle.seat_count}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                          <p className="text-xs text-purple-600 dark:text-purple-400">RFID Reserved</p>
                          <p className="text-base sm:text-lg font-bold text-purple-700 dark:text-purple-300">{vehicle.default_rfid_reserved_seat_count}</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Vehicle Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <TruckIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      name="vehicle_name"
                      value={vehicle.vehicle_name}
                      onChange={handleChange}
                      placeholder="e.g., City Shuttle"
                      className="w-full px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-sm sm:text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-700 
                               text-gray-900 dark:text-white
                               placeholder:text-gray-400 dark:placeholder:text-gray-500
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                               transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Vehicle Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicle_model"
                    value={vehicle.vehicle_model}
                    onChange={handleChange}
                    placeholder="e.g., 2024, BharatBenz"
                    className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-white
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                             transition-all duration-200"
                  />
                </div>
              </div>

              {/* Color */}
              <div className="space-y-1.5 sm:space-y-2">
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
                    className="flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-700 
                             text-gray-900 dark:text-white
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20
                             transition-all duration-200"
                  />
                  {vehicle.color && (
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-inner shrink-0"
                      style={{ backgroundColor: vehicle.color.toLowerCase() }}
                    />
                  )}
                </div>
              </div>

              {/* Registration Valid Till Date */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Registration Valid Till <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="date"
                    name="registration_valid_till"
                    value={vehicle.registration_valid_till}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 text-sm sm:text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-700 
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setVehicle({ ...vehicle, ownership_type: 'self' })}
                    className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
                      ${vehicle.ownership_type === 'self' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-[1.02] ring-2 ring-green-500/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                      }`}
                    style={{ minHeight: '100px' }}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={`p-2 rounded-lg transition-all duration-200
                        ${vehicle.ownership_type === 'self' 
                          ? 'bg-green-500 dark:bg-green-600' 
                          : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        <HomeIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200
                          ${vehicle.ownership_type === 'self' 
                            ? 'text-white' 
                            : 'text-gray-600 dark:text-gray-400'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold transition-all duration-200 text-sm sm:text-base
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
                          <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicle({ ...vehicle, ownership_type: 'rented' })}
                    className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all duration-300 text-left w-full
                      ${vehicle.ownership_type === 'rented' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg scale-[1.02] ring-2 ring-green-500/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                      }`}
                    style={{ minHeight: '100px' }}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={`p-2 rounded-lg transition-all duration-200
                        ${vehicle.ownership_type === 'rented' 
                          ? 'bg-green-500 dark:bg-green-600' 
                          : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                        <KeyIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200
                          ${vehicle.ownership_type === 'rented' 
                            ? 'text-white' 
                            : 'text-gray-600 dark:text-gray-400'
                          }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold transition-all duration-200 text-sm sm:text-base
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
                          <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Rented Vehicle Additional Fields */}
              {vehicle.ownership_type === 'rented' && (
                <div className="space-y-3 sm:space-y-4 animate-fadeInUp">
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                    <h3 className="text-sm sm:text-md font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                      Owner Information <span className="text-red-500">*</span>
                    </h3>
                  </div>
                  
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Owner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Enter vehicle owner's full name"
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20 
                               transition-all duration-200"
                    />
                  </div>

                  <FileUploadField
                    label="Owner Aadhaar Card"
                    required={true}
                    preview={aadhaarPreview}
                    fileName={aadhaarFileName}
                    onRemove={() => removeFile('aadhaar')}
                    onUpload={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'aadhaar')}
                    id="aadhaar-upload"
                  />

                  <FileUploadField
                    label="Authorization Document"
                    required={true}
                    preview={authorizationPreview}
                    fileName={authorizationFileName}
                    onRemove={() => removeFile('authorization')}
                    onUpload={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'authorization')}
                    id="auth-upload"
                  />
                </div>
              )}

              {/* Vehicle Photos Section */}
              <div className="space-y-3 sm:space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <h3 className="text-sm sm:text-md font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Vehicle Photos <span className="text-red-500">*</span>
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FileUploadField
                    label="Front Photo"
                    required={false}
                    preview={frontPreview}
                    fileName={frontFileName}
                    onRemove={() => removeFile('front')}
                    onUpload={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'front')}
                    id="front-upload"
                    accept="image/*"
                  />
                  
                  <FileUploadField
                    label="Rear Photo"
                    required={true}
                    preview={rearPreview}
                    fileName={rearFileName}
                    onRemove={() => removeFile('rear')}
                    onUpload={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'rear')}
                    id="rear-upload"
                    accept="image/*"
                  />
                  
                  <FileUploadField
                    label="Interior Photo"
                    required={false}
                    preview={interiorPreview}
                    fileName={interiorFileName}
                    onRemove={() => removeFile('interior')}
                    onUpload={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'interior')}
                    id="interior-upload"
                    accept="image/*"
                  />
                  
                  <FileUploadField
                    label="Left Side Photo"
                    required={false}
                    preview={leftSidePreview}
                    fileName={leftSideFileName}
                    onRemove={() => removeFile('left')}
                    onUpload={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'left')}
                    id="left-upload"
                    accept="image/*"
                  />
                  
                  <FileUploadField
                    label="Right Side Photo"
                    required={false}
                    preview={rightSidePreview}
                    fileName={rightSideFileName}
                    onRemove={() => removeFile('right')}
                    onUpload={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'right')}
                    id="right-upload"
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Required Documents */}
              <div className="space-y-3 sm:space-y-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <h3 className="text-sm sm:text-md font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Required Documents <span className="text-red-500">*</span>
                  </h3>
                </div>

                <FileUploadField
                  label="RC Document"
                  required={true}
                  preview={rcPreview}
                  fileName={rcFileName}
                  onRemove={() => removeFile('rc')}
                  onUpload={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'rc')}
                  id="rc-upload"
                />

                <FileUploadField
                  label="Insurance Document"
                  required={true}
                  preview={insurancePreview}
                  fileName={insuranceFileName}
                  onRemove={() => removeFile('insurance')}
                  onUpload={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'insurance')}
                  id="insurance-upload"
                />

                <FileUploadField
                  label="Pollution Certificate"
                  required={false}
                  preview={pollutionPreview}
                  fileName={pollutionFileName}
                  onRemove={() => removeFile('pollution')}
                  onUpload={(e: ChangeEvent<HTMLInputElement>) => handleFileChange(e, 'pollution')}
                  id="pollution-upload"
                />
              </div>

              {/* Required Fields Note */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-2">
                <span className="text-red-500">*</span>
                <span>Required fields</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button
                  onClick={handleRegisterAndSubmit}
                  disabled={!isFormValid() || loading}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    height: '48px',
                    width: '100%',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
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
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">Registering Vehicle...</span>
                    </>
                  ) : (
                    <>
                      <TruckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Register Vehicle</span>
                      <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ transition: 'transform 0.3s ease', transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }} />
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => history.push("/bus-and-trip-management")}
                  className="flex-1 h-12 rounded-xl border-2 border-gray-300 dark:border-gray-700
                           text-gray-700 dark:text-gray-300 font-semibold text-sm sm:text-base
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
        
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        input[type="number"] {
          -moz-appearance: textfield;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
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

        .scrollable-content {
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 640px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
      `}</style>
    </IonPage>
  );
};

export default VehicleRegistration;