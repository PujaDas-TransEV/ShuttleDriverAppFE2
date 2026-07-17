// import React, { useState, useEffect, ChangeEvent } from 'react';
// import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
// import { Preferences } from '@capacitor/preferences'; // Add this import
// import NavbarSidebar from '../pages/Navbar';
// import {
//   UserCircleIcon,
//   PhoneIcon,
//   IdentificationIcon,
//   DocumentTextIcon,
//   BanknotesIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClockIcon,
//   CloudArrowUpIcon,
//   EyeIcon
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

// const KYCRegistration: React.FC = () => {
//   const [token, setToken] = useState<string | null>(null);
//   const [form, setForm] = useState({
//     fullName: '',
//     phone: '',
//     aadhaar_number: '',
//     pan_number: '',
//     driving_license_number: '',
//     bank_account_number: '',
//     ifsc_code: '',
//     aadhaar_file_url: '',
//     pan_file_url: '',
//     dl_file_url: '',
//     passbook_file_url: '',
//   });

//   const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
//   const [panFile, setPanFile] = useState<File | null>(null);
//   const [dlFile, setDlFile] = useState<File | null>(null);
//   const [passbookFile, setPassbookFile] = useState<File | null>(null);

//   const [kycStatus, setKycStatus] = useState<string>('DRAFT');
//   const [rejectionReason, setRejectionReason] = useState<string>('');
//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');
//   const [popupMsg, setPopupMsg] = useState<string>('');
//   const [popupTitle, setPopupTitle] = useState<string>('');
//   const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('info');
//   const [redirectOnOk, setRedirectOnOk] = useState(false);

//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//       if (!accessToken) {
//         setPopupTitle("Authentication Error");
//         setPopupMsg("Please login again");
//         setPopupType('error');
//         setRedirectOnOk(true);
//       }
//     };
//     loadToken();
//   }, []);

//   // FETCH KYC STATUS when token is available
//   useEffect(() => {
//     if (token) {
//       fetchStatus();
//     }
//   }, [token]);

//   const fetchStatus = async () => {
//     if (!token) return;
    
//     try {
//       const res = await fetch(`${API_BASE}/driver/kyc/status`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();

//       if (res.status === 404 || data.detail === "Driver profile not found") {
//         setPopupTitle("Profile Required");
//         setPopupMsg("Driver profile not found. Please set up your profile first.");
//         setPopupType('info');
//         setRedirectOnOk(true);
//         return;
//       }

//       const status = data.status.toUpperCase();
//       setKycStatus(status);
//       setRejectionReason(data.rejection_reason || '');

//       setForm({
//         fullName: data.full_name || '',
//         phone: data.phone || '',
//         aadhaar_number: data.documents?.aadhaar_number || '',
//         pan_number: data.documents?.pan_number || '',
//         driving_license_number: data.documents?.driving_license_number || '',
//         bank_account_number: data.documents?.bank_account_number || '',
//         ifsc_code: data.documents?.ifsc_code || '',
//         aadhaar_file_url: data.documents?.aadhaar_card_file ? `${API_BASE}/${data.documents.aadhaar_card_file}` : '',
//         pan_file_url: data.documents?.pan_file ? `${API_BASE}/${data.documents.pan_file}` : '',
//         dl_file_url: data.documents?.driving_license_file ? `${API_BASE}/${data.documents.driving_license_file}` : '',
//         passbook_file_url: data.documents?.passbook_file_path ? `${API_BASE}/${data.documents.passbook_file_path}` : '',
//       });

//     } catch {
//       setToastMsg("Failed to load status");
//     }
//   };

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     let value = e.target.value;
//     const name = e.target.name;

//     // Format Aadhaar number (XXXX XXXX XXXX)
//     if (name === 'aadhaar_number') {
//       value = value.replace(/\D/g, '').slice(0, 12);
//       if (value.length > 8) {
//         value = value.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
//       } else if (value.length > 4) {
//         value = value.replace(/(\d{4})(\d{4})/, '$1 $2');
//       }
//     }

//     // Format PAN number (ABCDE1234F)
//     if (name === 'pan_number') {
//       value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
//       if (value.length === 10) {
//         value = value.replace(/([A-Z]{5})(\d{4})([A-Z]{1})/, '$1 $2 $3');
//       }
//     }

//     // Format Driving License (DL-0420230012345)
//     if (name === 'driving_license_number') {
//       value = value.toUpperCase();
//     }

//     // Format IFSC code (ABCD0123456)
//     if (name === 'ifsc_code') {
//       value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
//     }

//     setForm({ ...form, [name]: value });
//   };

//   const handleFile = (setter: any) => (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     if (file) {
//       const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
//       if (!validTypes.includes(file.type)) {
//         setToastMsg("Please upload PDF, JPG, or PNG files only");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         setToastMsg("File size should be less than 5MB");
//         return;
//       }
//     }
//     setter(file);
//   };

//   const uploadDocs = async () => {
//     if (!token) throw new Error("No authentication token");
    
//     const fd = new FormData();

//     if (aadhaarFile) fd.append('aadhaar_card', aadhaarFile);
//     if (panFile) fd.append('pan', panFile);
//     if (dlFile) fd.append('driving_license', dlFile);
//     if (passbookFile) fd.append('passbook_file', passbookFile);

//     fd.append('aadhaar_number', form.aadhaar_number.replace(/\s/g, ''));
//     fd.append('pan_number', form.pan_number.replace(/\s/g, ''));
//     fd.append('driving_license_number', form.driving_license_number);
//     fd.append('bank_account_number', form.bank_account_number);
//     fd.append('ifsc_code', form.ifsc_code);

//     const res = await fetch(`${API_BASE}/driver/kyc/upload-document`, {
//       method: 'PATCH',
//       headers: { Authorization: `Bearer ${token}` },
//       body: fd,
//     });

//     if (!res.ok) throw new Error("Upload failed");
//   };

//   const submitKyc = async () => {
//     if (!token) throw new Error("No authentication token");
    
//     const res = await fetch(`${API_BASE}/driver/kyc/submit`, {
//       method: 'POST',
//       headers: { Authorization: `Bearer ${token}` },
//     });

//     const data = await res.json();

//     if (res.status === 404 || data.detail === "Driver profile not found") {
//       throw new Error("Driver profile not found. Please complete your profile first.");
//     }

//     if (!res.ok) {
//       throw new Error(data.message || "Submit failed");
//     }

//     return data;
//   };

//   const handleSubmit = async () => {
//     // Validation
//     if (!form.fullName.trim()) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter your full name");
//       setPopupType('error');
//       return;
//     }

//     if (!form.phone.trim() || form.phone.length < 10) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter a valid 10-digit phone number");
//       setPopupType('error');
//       return;
//     }

//     if (!form.aadhaar_number || form.aadhaar_number.replace(/\s/g, '').length !== 12) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter a valid 12-digit Aadhaar number");
//       setPopupType('error');
//       return;
//     }

//     if (!form.pan_number || form.pan_number.replace(/\s/g, '').length !== 10) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter a valid 10-character PAN number");
//       setPopupType('error');
//       return;
//     }

//     if (!form.driving_license_number.trim()) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter your driving license number");
//       setPopupType('error');
//       return;
//     }

//     if (!form.bank_account_number.trim()) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter your bank account number");
//       setPopupType('error');
//       return;
//     }

//     if (!form.ifsc_code.trim() || form.ifsc_code.length !== 11) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter a valid 11-character IFSC code");
//       setPopupType('error');
//       return;
//     }

//     if (!aadhaarFile && !form.aadhaar_file_url) {
//       setPopupTitle("Missing Document");
//       setPopupMsg("Please upload your Aadhaar document");
//       setPopupType('error');
//       return;
//     }

//     if (!panFile && !form.pan_file_url) {
//       setPopupTitle("Missing Document");
//       setPopupMsg("Please upload your PAN document");
//       setPopupType('error');
//       return;
//     }

//     if (!dlFile && !form.dl_file_url) {
//       setPopupTitle("Missing Document");
//       setPopupMsg("Please upload your Driving License document");
//       setPopupType('error');
//       return;
//     }

//     if (!passbookFile && !form.passbook_file_url) {
//       setPopupTitle("Missing Document");
//       setPopupMsg("Please upload your Bank Passbook document");
//       setPopupType('error');
//       return;
//     }

//     setLoading(true);
//     try {
//       await uploadDocs();
//       await submitKyc();

//       setPopupTitle("Success!");
//       setPopupMsg("Your KYC has been submitted successfully! Our team will review your documents.");
//       setPopupType('success');
//       setRedirectOnOk(false);
//       fetchStatus();

//     } catch (e: any) {
//       console.error(e);
//       setPopupTitle("Submission Failed");
//       setPopupMsg(e.message || "Error submitting KYC. Please try again.");
//       setPopupType('error');
//       setRedirectOnOk(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePopupOk = () => {
//     setPopupMsg('');
//     setPopupTitle('');
//     if (redirectOnOk) {
//       window.location.href = '/profile-setup';
//     }
//   };

//   const isDisabled = kycStatus === 'PENDING' || kycStatus === 'VERIFIED';
//   const canSubmit = kycStatus === 'DRAFT' || kycStatus === 'REJECTED';

//   const getStatusConfig = () => {
//     switch (kycStatus) {
//       case 'VERIFIED':
//         return { color: '#10b981', bg: '#d1fae5', icon: CheckCircleIcon, text: 'Verified' };
//       case 'PENDING':
//         return { color: '#f59e0b', bg: '#fed7aa', icon: ClockIcon, text: 'Pending Review' };
//       case 'REJECTED':
//         return { color: '#ef4444', bg: '#fee2e2', icon: XCircleIcon, text: 'Rejected' };
//       default:
//         return { color: '#6b7280', bg: '#f3f4f6', icon: DocumentTextIcon, text: 'Draft' };
//     }
//   };

//   const statusConfig = getStatusConfig();
//   const StatusIcon = statusConfig.icon;

//   return (
//     <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
//       <NavbarSidebar />
      
//       <IonContent className="relative">
//         <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
//         <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-4xl mx-auto">
          
//           {/* Header Section */}
//           <div className="mb-8 text-center">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-blue-600 text-sm font-medium mb-4">
//               <IdentificationIcon className="w-4 h-4" />
//               <span>KYC Verification</span>
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-800 bg-clip-text text-transparent mb-3">
//               KYC Registration
//             </h1>
//             <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
//               Complete your verification to start earning with Shuttle
//             </p>
//           </div>

//           {/* Status Card */}
//           <div className="mb-6 p-5 rounded-2xl border transition-all duration-300"
//             style={{
//               backgroundColor: statusConfig.bg,
//               borderColor: statusConfig.color + '40',
//             }}
//           >
//             <div className="flex items-center justify-between flex-wrap gap-3">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-full flex items-center justify-center"
//                   style={{ backgroundColor: statusConfig.color + '20' }}
//                 >
//                   <StatusIcon className="w-6 h-6" style={{ color: statusConfig.color }} />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
//                   <p className="text-xl font-bold" style={{ color: statusConfig.color }}>
//                     {statusConfig.text}
//                   </p>
//                 </div>
//               </div>
//               {kycStatus === 'REJECTED' && rejectionReason && (
//                 <div className="px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50">
//                   <p className="text-sm text-gray-600 dark:text-gray-400">Reason:</p>
//                   <p className="text-sm font-medium text-red-600 dark:text-red-400">{rejectionReason}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Main Form Card */}
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
//             {/* Form Header */}
//             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-black dark:bg-white rounded-xl">
//                   <DocumentTextIcon className="w-5 h-5 text-white dark:text-black" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                     Document Verification
//                   </h2>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Please provide accurate information as per your documents
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Form Body */}
//             <div className="p-6 space-y-6">
              
//               {/* Full Name */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Full Name <span className="text-red-500">*</span>
//                   <span className="text-xs text-gray-400 ml-2 font-normal">(As per Aadhaar card)</span>
//                 </label>
//                 <div className="relative">
//                   <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     name="fullName"
//                     value={form.fullName}
//                     onChange={handleChange}
//                     disabled={isDisabled}
//                     placeholder="e.g., Rajesh Kumar Sharma"
//                     className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                   />
//                 </div>
//               </div>

//               {/* Phone Number */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     name="phone"
//                     value={form.phone}
//                     onChange={handleChange}
//                     disabled={isDisabled}
//                     placeholder="e.g., 9876543210"
//                     maxLength={10}
//                     className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-400">Enter 10-digit mobile number</p>
//               </div>

//               {/* Two Column Layout */}
//               <div className="grid md:grid-cols-2 gap-5">
//                 {/* Aadhaar Number */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Aadhaar Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       name="aadhaar_number"
//                       value={form.aadhaar_number}
//                       onChange={handleChange}
//                       disabled={isDisabled}
//                       placeholder="1234 5678 9012"
//                       className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400">12-digit Aadhaar number</p>
//                 </div>

//                 {/* PAN Number */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     PAN Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       name="pan_number"
//                       value={form.pan_number}
//                       onChange={handleChange}
//                       disabled={isDisabled}
//                       placeholder="ABCDE 1234 F"
//                       className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400">10-character PAN (5 letters, 4 digits, 1 letter)</p>
//                 </div>
//               </div>

//               {/* Driving License */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Driving License Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     name="driving_license_number"
//                     value={form.driving_license_number}
//                     onChange={handleChange}
//                     disabled={isDisabled}
//                     placeholder="DL-0420230012345"
//                     className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                   />
//                 </div>
//               </div>

//               {/* Bank Details */}
//               <div className="grid md:grid-cols-2 gap-5">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Bank Account Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       name="bank_account_number"
//                       value={form.bank_account_number}
//                       onChange={handleChange}
//                       disabled={isDisabled}
//                       placeholder="e.g., 1234567890123456"
//                       className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     IFSC Code <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       name="ifsc_code"
//                       value={form.ifsc_code}
//                       onChange={handleChange}
//                       disabled={isDisabled}
//                       placeholder="SBIN0001234"
//                       maxLength={11}
//                       className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400">11-character IFSC code (4 letters + 7 digits)</p>
//                 </div>
//               </div>

//               {/* Document Uploads Section */}
//               <div className="space-y-4 pt-4">
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                   <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                     Upload Documents
//                   </h3>
//                 </div>

//                 {[
//                   { 
//                     label: 'Aadhaar Document', 
//                     file: aadhaarFile, 
//                     setter: setAadhaarFile, 
//                     url: form.aadhaar_file_url,
//                     required: true
//                   },
//                   { 
//                     label: 'PAN Document', 
//                     file: panFile, 
//                     setter: setPanFile, 
//                     url: form.pan_file_url,
//                     required: true
//                   },
//                   { 
//                     label: 'Driving License', 
//                     file: dlFile, 
//                     setter: setDlFile, 
//                     url: form.dl_file_url,
//                     required: true
//                   },
//                   { 
//                     label: 'Bank Passbook', 
//                     file: passbookFile, 
//                     setter: setPassbookFile, 
//                     url: form.passbook_file_url,
//                     required: true
//                   },
//                 ].map((item, idx) => (
//                   <div key={idx} className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                           bg-gray-50 dark:bg-gray-900/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
//                     <div className="flex items-center gap-3">
//                       <DocumentTextIcon className="w-5 h-5 text-gray-500" />
//                       <span className="font-medium text-gray-700 dark:text-gray-300">
//                         {item.label} {item.required && <span className="text-red-500">*</span>}
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       {item.url && !item.file && (
//                         <a 
//                           href={item.url} 
//                           target="_blank" 
//                           rel="noopener noreferrer"
//                           style={{
//                             display: 'inline-flex',
//                             alignItems: 'center',
//                             gap: '4px',
//                             padding: '6px 12px',
//                             borderRadius: '8px',
//                             fontSize: '13px',
//                             color: '#3b82f6',
//                             textDecoration: 'none',
//                             transition: 'all 0.2s'
//                           }}
//                           onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
//                           onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
//                         >
//                           <EyeIcon className="w-4 h-4" />
//                           View
//                         </a>
//                       )}
//                       {item.file && (
//                         <span className="text-sm text-gray-600 dark:text-gray-400 max-w-37.5 truncate">
//                           {item.file.name}
//                         </span>
//                       )}
//                       {!isDisabled && (
//                         <label
//                           style={{
//                             cursor: 'pointer',
//                             padding: '8px 16px',
//                             borderRadius: '10px',
//                             background: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
//                             color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
//                             fontSize: '13px',
//                             fontWeight: 500,
//                             transition: 'all 0.2s ease',
//                             border: `1px solid ${document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db'}`
//                           }}
//                           onMouseEnter={(e) => {
//                             const isDark = document.documentElement.classList.contains('dark');
//                             e.currentTarget.style.background = isDark ? '#4b5563' : '#e5e7eb';
//                           }}
//                           onMouseLeave={(e) => {
//                             const isDark = document.documentElement.classList.contains('dark');
//                             e.currentTarget.style.background = isDark ? '#374151' : '#f3f4f6';
//                           }}
//                         >
//                           <CloudArrowUpIcon className="w-4 h-4 inline mr-1" />
//                           {item.file ? 'Change' : 'Upload'}
//                           <input
//                             type="file"
//                             accept="image/*,application/pdf"
//                             onChange={handleFile(item.setter)}
//                             className="hidden"
//                           />
//                         </label>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//                 <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, JPG, PNG (Max 5MB per file)</p>
//               </div>

//               {/* Submit Button */}
//               {canSubmit && (
//                 <div className="flex justify-center pt-6">
//                   <button
//                     onClick={handleSubmit}
//                     disabled={loading}
//                     style={{
//                       width: '220px',
//                       height: '52px',
//                       borderRadius: '14px',
//                       background: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
//                       color: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
//                       fontWeight: '600',
//                       fontSize: '16px',
//                       border: document.documentElement.classList.contains('dark') ? '1px solid #e5e7eb' : 'none',
//                       cursor: loading ? 'not-allowed' : 'pointer',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       gap: '10px',
//                       transition: 'all 0.3s ease',
//                       boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
//                       opacity: loading ? 0.6 : 1,
//                     }}
//                     onMouseEnter={(e) => {
//                       if (loading) return;
//                       const isDark = document.documentElement.classList.contains('dark');
//                       e.currentTarget.style.background = isDark ? '#f3f4f6' : '#1f2937';
//                       e.currentTarget.style.transform = 'translateY(-2px)';
//                       e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
//                     }}
//                     onMouseLeave={(e) => {
//                       if (loading) return;
//                       const isDark = document.documentElement.classList.contains('dark');
//                       e.currentTarget.style.background = isDark ? '#ffffff' : '#111827';
//                       e.currentTarget.style.transform = 'translateY(0)';
//                       e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
//                     }}
//                   >
//                     <CheckCircleIcon style={{ width: '20px', height: '20px' }} />
//                     {loading ? 'Submitting...' : 'Submit KYC'}
//                   </button>
//                 </div>
//               )}

//               {/* Disabled Message */}
//               {isDisabled && kycStatus !== 'VERIFIED' && (
//                 <div className="text-center py-4">
//                   <p className="text-sm text-yellow-600 dark:text-yellow-400">
//                     Your KYC is already submitted and pending review. You cannot edit the details.
//                   </p>
//                 </div>
//               )}

//               {kycStatus === 'VERIFIED' && (
//                 <div className="text-center py-4">
//                   <p className="text-sm text-green-600 dark:text-green-400">
//                     ✓ Your KYC is verified! You can now start accepting rides.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <IonLoading isOpen={loading} message="Processing KYC..." />
//         <IonToast
//           isOpen={!!toastMsg}
//           message={toastMsg}
//           duration={2500}
//           onDidDismiss={() => setToastMsg('')}
//           style={{
//             '--background': '#ef4444',
//             '--color': 'white',
//             '--border-radius': '12px',
//           }}
//         />

//         {/* Centered Popup Modal */}
//         {popupMsg && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
//             <div 
//               className="relative max-w-md w-full mx-4 transform transition-all duration-300 animate-scaleIn"
//               style={{
//                 borderRadius: '24px',
//                 background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
//                 boxShadow: popupType === 'success' 
//                   ? '0 25px 50px -12px rgba(16, 185, 129, 0.25)'
//                   : popupType === 'error'
//                   ? '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
//                   : '0 25px 50px -12px rgba(59, 130, 246, 0.25)'
//               }}
//             >
//               <div className="p-6 text-center">
//                 {/* Icon */}
//                 <div 
//                   className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
//                   style={{
//                     background: popupType === 'success' 
//                       ? 'linear-gradient(135deg, #10b981, #059669)'
//                       : popupType === 'error'
//                       ? 'linear-gradient(135deg, #ef4444, #dc2626)'
//                       : 'linear-gradient(135deg, #3b82f6, #2563eb)'
//                   }}
//                 >
//                   {popupType === 'success' ? (
//                     <CheckCircleIcon className="w-10 h-10 text-white" />
//                   ) : popupType === 'error' ? (
//                     <XCircleIcon className="w-10 h-10 text-white" />
//                   ) : (
//                     <ClockIcon className="w-10 h-10 text-white" />
//                   )}
//                 </div>

//                 {/* Title */}
//                 <h3 
//                   className="text-2xl font-bold mb-2"
//                   style={{
//                     color: popupType === 'success' 
//                       ? '#065f46'
//                       : popupType === 'error'
//                       ? '#991b1b'
//                       : '#1e40af'
//                   }}
//                 >
//                   {popupTitle}
//                 </h3>

//                 {/* Message */}
//                 <p className="text-gray-600 dark:text-gray-300 mb-6">
//                   {popupMsg}
//                 </p>

//                 {/* OK Button */}
//                 <button
//                   onClick={handlePopupOk}
//                   style={{
//                     width: '120px',
//                     height: '44px',
//                     borderRadius: '12px',
//                     background: popupType === 'success' 
//                       ? 'linear-gradient(135deg, #10b981, #059669)'
//                       : popupType === 'error'
//                       ? 'linear-gradient(135deg, #ef4444, #dc2626)'
//                       : 'linear-gradient(135deg, #3b82f6, #2563eb)',
//                     color: '#ffffff',
//                     fontWeight: 600,
//                     fontSize: '14px',
//                     border: 'none',
//                     cursor: 'pointer',
//                     display: 'block',
//                     margin: '0 auto',
//                     transition: 'all 0.3s ease',
//                     transform: 'scale(1)',
//                     boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                     e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = 'scale(1)';
//                     e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
//                   }}
//                 >
//                   OK
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </IonContent>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
        
//         @keyframes scaleIn {
//           from {
//             opacity: 0;
//             transform: scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }
        
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out;
//         }
        
//         .animate-scaleIn {
//           animation: scaleIn 0.3s ease-out;
//         }
        
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

// export default KYCRegistration;


// import React, { useState, useEffect, ChangeEvent } from 'react';
// import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
// import { Preferences } from '@capacitor/preferences';
// import { Capacitor } from '@capacitor/core';
// import { Browser } from '@capacitor/browser';
// import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
// import NavbarSidebar from '../pages/Navbar';
// import {
//   UserCircleIcon,
//   PhoneIcon,
//   IdentificationIcon,
//   DocumentTextIcon,
//   BanknotesIcon,
//   CheckCircleIcon,
//   XCircleIcon,
//   ClockIcon,
//   CloudArrowUpIcon,
//   EyeIcon,
//   ArrowDownTrayIcon,
//   DocumentIcon,
//   PhotoIcon
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

// // Helper function to check if running on native platform
// const isNative = Capacitor.isNativePlatform();

// const KYCRegistration: React.FC = () => {
//   const [token, setToken] = useState<string | null>(null);
//   const [form, setForm] = useState({
//     fullName: '',
//     phone: '',
//     aadhaar_number: '',
//     pan_number: '',
//     driving_license_number: '',
//     bank_account_number: '',
//     ifsc_code: '',
//     aadhaar_file_url: '',
//     pan_file_url: '',
//     dl_file_url: '',
//     passbook_file_url: '',
//   });

//   const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
//   const [panFile, setPanFile] = useState<File | null>(null);
//   const [dlFile, setDlFile] = useState<File | null>(null);
//   const [passbookFile, setPassbookFile] = useState<File | null>(null);

//   const [aadhaarFileName, setAadhaarFileName] = useState<string>('');
//   const [panFileName, setPanFileName] = useState<string>('');
//   const [dlFileName, setDlFileName] = useState<string>('');
//   const [passbookFileName, setPassbookFileName] = useState<string>('');

//   const [kycStatus, setKycStatus] = useState<string>('DRAFT');
//   const [rejectionReason, setRejectionReason] = useState<string>('');
//   const [loading, setLoading] = useState(false);
//   const [toastMsg, setToastMsg] = useState('');
//   const [popupMsg, setPopupMsg] = useState<string>('');
//   const [popupTitle, setPopupTitle] = useState<string>('');
//   const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('info');
//   const [redirectOnOk, setRedirectOnOk] = useState(false);
//   const [viewingFile, setViewingFile] = useState<string | null>(null);

//   // Load token on mount
//   useEffect(() => {
//     const loadToken = async () => {
//       const accessToken = await getToken();
//       setToken(accessToken);
//       if (!accessToken) {
//         setPopupTitle("Authentication Error");
//         setPopupMsg("Please login again");
//         setPopupType('error');
//         setRedirectOnOk(true);
//       }
//     };
//     loadToken();
//   }, []);

//   // FETCH KYC STATUS when token is available
//   useEffect(() => {
//     if (token) {
//       fetchStatus();
//     }
//   }, [token]);

//   const fetchStatus = async () => {
//     if (!token) return;
    
//     try {
//       const res = await fetch(`${API_BASE}/driver/kyc/status`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();

//       if (res.status === 404 || data.detail === "Driver profile not found") {
//         setPopupTitle("Profile Required");
//         setPopupMsg("Driver profile not found. Please set up your profile first.");
//         setPopupType('info');
//         setRedirectOnOk(true);
//         return;
//       }

//       const status = data.status.toUpperCase();
//       setKycStatus(status);
//       setRejectionReason(data.rejection_reason || '');

//       setForm({
//         fullName: data.full_name || '',
//         phone: data.phone || '',
//         aadhaar_number: data.documents?.aadhaar_number || '',
//         pan_number: data.documents?.pan_number || '',
//         driving_license_number: data.documents?.driving_license_number || '',
//         bank_account_number: data.documents?.bank_account_number || '',
//         ifsc_code: data.documents?.ifsc_code || '',
//         aadhaar_file_url: data.documents?.aadhaar_card_file ? `${API_BASE}/${data.documents.aadhaar_card_file}` : '',
//         pan_file_url: data.documents?.pan_file ? `${API_BASE}/${data.documents.pan_file}` : '',
//         dl_file_url: data.documents?.driving_license_file ? `${API_BASE}/${data.documents.driving_license_file}` : '',
//         passbook_file_url: data.documents?.passbook_file_path ? `${API_BASE}/${data.documents.passbook_file_path}` : '',
//       });

//     } catch (error) {
//       console.error('Fetch status error:', error);
//       setToastMsg("Failed to load status");
//     }
//   };

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     let value = e.target.value;
//     const name = e.target.name;

//     // Format Aadhaar number (XXXX XXXX XXXX)
//     if (name === 'aadhaar_number') {
//       value = value.replace(/\D/g, '').slice(0, 12);
//       if (value.length > 8) {
//         value = value.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
//       } else if (value.length > 4) {
//         value = value.replace(/(\d{4})(\d{4})/, '$1 $2');
//       }
//     }

//     // Format PAN number (ABCDE1234F)
//     if (name === 'pan_number') {
//       value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
//       if (value.length === 10) {
//         value = value.replace(/([A-Z]{5})(\d{4})([A-Z]{1})/, '$1 $2 $3');
//       }
//     }

//     // Format Driving License (DL-0420230012345)
//     if (name === 'driving_license_number') {
//       value = value.toUpperCase();
//     }

//     // Format IFSC code (ABCD0123456)
//     if (name === 'ifsc_code') {
//       value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
//     }

//     setForm({ ...form, [name]: value });
//   };

//   const handleFile = (setter: any, setNameSetter: any) => (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     if (file) {
//       const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
//       if (!validTypes.includes(file.type)) {
//         setToastMsg("Please upload PDF, JPG, or PNG files only");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         setToastMsg("File size should be less than 5MB");
//         return;
//       }
//       setter(file);
//       setNameSetter(file.name);
//     }
//   };

//   // ======================
//   // View File Function - Works on both Web and Android
//   // ======================
//   const viewFile = async (fileUrl: string, fileName: string) => {
//     if (!fileUrl) {
//       setToastMsg("No file to view");
//       return;
//     }

//     setViewingFile(fileName);

//     try {
//       if (isNative) {
//         // Android Native - Use Browser plugin to open file
//         await Browser.open({ url: fileUrl, presentationStyle: 'fullscreen' });
//       } else {
//         // Web - Open in new tab
//         window.open(fileUrl, '_blank');
//       }
//     } catch (error) {
//       console.error('Error viewing file:', error);
//       setToastMsg("Could not open file. Please try downloading it.");
//     } finally {
//       setViewingFile(null);
//     }
//   };

//   // ======================
//   // Download File Function for Android
//   // ======================
//   const downloadFile = async (fileUrl: string, fileName: string) => {
//     if (!fileUrl) {
//       setToastMsg("No file to download");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Fetch the file from the server
//       const response = await fetch(fileUrl, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!response.ok) {
//         throw new Error(`Failed to download: ${response.status}`);
//       }

//       const blob = await response.blob();

//       if (isNative) {
//         // Android Native - Save using Filesystem
//         const base64Data = await new Promise<string>((resolve) => {
//           const reader = new FileReader();
//           reader.onloadend = () => {
//             const base64 = (reader.result as string).split(',')[1];
//             resolve(base64);
//           };
//           reader.readAsDataURL(blob);
//         });

//         const savedFile = await Filesystem.writeFile({
//           path: fileName,
//           data: base64Data,
//           directory: Directory.Documents,
//           encoding: Encoding.UTF8,
//         });

//         // Open the downloaded file
//         const uri = savedFile.uri;
//         await Browser.open({ url: uri, presentationStyle: 'fullscreen' });
        
//         setToastMsg(`File downloaded: ${fileName}`);
//       } else {
//         // Web - Create download link
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = fileName;
//         document.body.appendChild(a);
//         a.click();
//         document.body.removeChild(a);
//         URL.revokeObjectURL(url);
//         setToastMsg(`Downloading: ${fileName}`);
//       }
//     } catch (error) {
//       console.error('Download error:', error);
//       setToastMsg("Failed to download file. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const uploadDocs = async () => {
//     if (!token) throw new Error("No authentication token");
    
//     const formData = new FormData();

//     // Append files if they exist
//     if (aadhaarFile) formData.append('aadhaar_card', aadhaarFile);
//     if (panFile) formData.append('pan', panFile);
//     if (dlFile) formData.append('driving_license', dlFile);
//     if (passbookFile) formData.append('passbook_file', passbookFile);

//     // Append form data
//     formData.append('aadhaar_number', form.aadhaar_number.replace(/\s/g, ''));
//     formData.append('pan_number', form.pan_number.replace(/\s/g, ''));
//     formData.append('driving_license_number', form.driving_license_number);
//     formData.append('bank_account_number', form.bank_account_number);
//     formData.append('ifsc_code', form.ifsc_code);

//     const res = await fetch(`${API_BASE}/driver/kyc/upload-document`, {
//       method: 'PATCH',
//       headers: { 
//         Authorization: `Bearer ${token}`,
//       },
//       body: formData,
//     });

//     const responseText = await res.text();

//     if (!res.ok) {
//       let errorMessage = "Upload failed";
//       try {
//         const errorData = JSON.parse(responseText);
//         errorMessage = errorData.message || errorData.detail || errorData.error || "Upload failed";
//       } catch (e) {
//         errorMessage = responseText || "Upload failed";
//       }
//       throw new Error(errorMessage);
//     }

//     return responseText;
//   };

//   const submitKyc = async () => {
//     if (!token) throw new Error("No authentication token");
    
//     const res = await fetch(`${API_BASE}/driver/kyc/submit`, {
//       method: 'POST',
//       headers: { 
//         Authorization: `Bearer ${token}`,
//         'Content-Type': 'application/json',
//       },
//     });

//     const data = await res.json();

//     if (res.status === 404 || data.detail === "Driver profile not found") {
//       throw new Error("Driver profile not found. Please complete your profile first.");
//     }

//     if (!res.ok) {
//       throw new Error(data.message || data.detail || "Submit failed");
//     }

//     return data;
//   };

//   const handleSubmit = async () => {
//     // Validation
//     if (!form.fullName.trim()) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter your full name");
//       setPopupType('error');
//       return;
//     }

//     if (!form.phone.trim() || form.phone.length < 10) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter a valid 10-digit phone number");
//       setPopupType('error');
//       return;
//     }

//     if (!form.aadhaar_number || form.aadhaar_number.replace(/\s/g, '').length !== 12) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter a valid 12-digit Aadhaar number");
//       setPopupType('error');
//       return;
//     }

//     if (!form.pan_number || form.pan_number.replace(/\s/g, '').length !== 10) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter a valid 10-character PAN number");
//       setPopupType('error');
//       return;
//     }

//     if (!form.driving_license_number.trim()) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter your driving license number");
//       setPopupType('error');
//       return;
//     }

//     if (!form.bank_account_number.trim()) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter your bank account number");
//       setPopupType('error');
//       return;
//     }

//     if (!form.ifsc_code.trim() || form.ifsc_code.length !== 11) {
//       setPopupTitle("Missing Information");
//       setPopupMsg("Please enter a valid 11-character IFSC code");
//       setPopupType('error');
//       return;
//     }

//     if (!aadhaarFile && !form.aadhaar_file_url) {
//       setPopupTitle("Missing Document");
//       setPopupMsg("Please upload your Aadhaar document");
//       setPopupType('error');
//       return;
//     }

//     if (!panFile && !form.pan_file_url) {
//       setPopupTitle("Missing Document");
//       setPopupMsg("Please upload your PAN document");
//       setPopupType('error');
//       return;
//     }

//     if (!dlFile && !form.dl_file_url) {
//       setPopupTitle("Missing Document");
//       setPopupMsg("Please upload your Driving License document");
//       setPopupType('error');
//       return;
//     }

//     if (!passbookFile && !form.passbook_file_url) {
//       setPopupTitle("Missing Document");
//       setPopupMsg("Please upload your Bank Passbook document");
//       setPopupType('error');
//       return;
//     }

//     setLoading(true);
//     try {
//       await uploadDocs();
//       await submitKyc();

//       setPopupTitle("Success!");
//       setPopupMsg("Your KYC has been submitted successfully! Our team will review your documents.");
//       setPopupType('success');
//       setRedirectOnOk(false);
      
//       await fetchStatus();

//     } catch (e: any) {
//       console.error('Submit error:', e);
//       setPopupTitle("Submission Failed");
//       setPopupMsg(e.message || "Error submitting KYC. Please try again.");
//       setPopupType('error');
//       setRedirectOnOk(true);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePopupOk = () => {
//     setPopupMsg('');
//     setPopupTitle('');
//     if (redirectOnOk) {
//       window.location.href = '/profile-setup';
//     }
//   };

//   const isDisabled = kycStatus === 'PENDING' || kycStatus === 'VERIFIED';
//   const canSubmit = kycStatus === 'DRAFT' || kycStatus === 'REJECTED';

//   const getStatusConfig = () => {
//     switch (kycStatus) {
//       case 'VERIFIED':
//         return { color: '#10b981', bg: '#d1fae5', icon: CheckCircleIcon, text: 'Verified' };
//       case 'PENDING':
//         return { color: '#f59e0b', bg: '#fed7aa', icon: ClockIcon, text: 'Pending Review' };
//       case 'REJECTED':
//         return { color: '#ef4444', bg: '#fee2e2', icon: XCircleIcon, text: 'Rejected' };
//       default:
//         return { color: '#6b7280', bg: '#f3f4f6', icon: DocumentTextIcon, text: 'Draft' };
//     }
//   };

//   const statusConfig = getStatusConfig();
//   const StatusIcon = statusConfig.icon;

//   // Document item component
//   const DocumentItem = ({ 
//     label, 
//     file, 
//     setter, 
//     nameSetter,
//     fileName,
//     url,
//     required,
//     id,
//     fileType
//   }: any) => {
//     const getFileIcon = () => {
//       if (fileType === 'image') {
//         return <PhotoIcon className="w-5 h-5 text-blue-500" />;
//       }
//       return <DocumentTextIcon className="w-5 h-5 text-gray-500" />;
//     };

//     return (
//       <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                       bg-gray-50 dark:bg-gray-900/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
//         <div className="flex items-center gap-3">
//           {getFileIcon()}
//           <span className="font-medium text-gray-700 dark:text-gray-300">
//             {label} {required && <span className="text-red-500">*</span>}
//           </span>
//         </div>
//         <div className="flex items-center gap-3">
//           {/* View Button */}
//           {url && !file && (
//             <>
//               <button
//                 onClick={() => viewFile(url, `${label}.pdf`)}
//                 disabled={viewingFile === label}
//                 style={{
//                   display: 'inline-flex',
//                   alignItems: 'center',
//                   gap: '4px',
//                   padding: '6px 12px',
//                   borderRadius: '8px',
//                   fontSize: '13px',
//                   color: '#3b82f6',
//                   background: 'transparent',
//                   border: '1px solid #3b82f640',
//                   cursor: 'pointer',
//                   transition: 'all 0.2s',
//                   opacity: viewingFile === label ? 0.6 : 1,
//                 }}
//                 onMouseEnter={(e) => { 
//                   e.currentTarget.style.backgroundColor = '#eff6ff';
//                   e.currentTarget.style.borderColor = '#3b82f6';
//                 }}
//                 onMouseLeave={(e) => { 
//                   e.currentTarget.style.backgroundColor = 'transparent';
//                   e.currentTarget.style.borderColor = '#3b82f640';
//                 }}
//               >
//                 <EyeIcon className="w-4 h-4" />
//                 {viewingFile === label ? 'Opening...' : 'View'}
//               </button>

//               {/* Download Button for Android */}
//               {isNative && (
//                 <button
//                   onClick={() => downloadFile(url, `${label}.pdf`)}
//                   style={{
//                     display: 'inline-flex',
//                     alignItems: 'center',
//                     gap: '4px',
//                     padding: '6px 12px',
//                     borderRadius: '8px',
//                     fontSize: '13px',
//                     color: '#10b981',
//                     background: 'transparent',
//                     border: '1px solid #10b98140',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s',
//                   }}
//                   onMouseEnter={(e) => { 
//                     e.currentTarget.style.backgroundColor = '#ecfdf5';
//                     e.currentTarget.style.borderColor = '#10b981';
//                   }}
//                   onMouseLeave={(e) => { 
//                     e.currentTarget.style.backgroundColor = 'transparent';
//                     e.currentTarget.style.borderColor = '#10b98140';
//                   }}
//                 >
//                   <ArrowDownTrayIcon className="w-4 h-4" />
//                   Download
//                 </button>
//               )}
//             </>
//           )}
          
//           {/* Uploaded file name */}
//           {file && (
//             <span className="text-sm text-gray-600 dark:text-gray-400 max-w-37.5 truncate">
//               {fileName || file.name}
//             </span>
//           )}
          
//           {/* Upload/Change button */}
//           {!isDisabled && (
//             <label
//               style={{
//                 cursor: 'pointer',
//                 padding: '8px 16px',
//                 borderRadius: '10px',
//                 background: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
//                 color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
//                 fontSize: '13px',
//                 fontWeight: 500,
//                 transition: 'all 0.2s ease',
//                 border: `1px solid ${document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db'}`
//               }}
//               onMouseEnter={(e) => {
//                 const isDark = document.documentElement.classList.contains('dark');
//                 e.currentTarget.style.background = isDark ? '#4b5563' : '#e5e7eb';
//               }}
//               onMouseLeave={(e) => {
//                 const isDark = document.documentElement.classList.contains('dark');
//                 e.currentTarget.style.background = isDark ? '#374151' : '#f3f4f6';
//               }}
//             >
//               <CloudArrowUpIcon className="w-4 h-4 inline mr-1" />
//               {file ? 'Change' : 'Upload'}
//               <input
//                 type="file"
//                 accept="image/*,application/pdf"
//                 onChange={handleFile(setter, nameSetter)}
//                 className="hidden"
//               />
//             </label>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
//       <NavbarSidebar />
      
//       <IonContent className="relative">
//         <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
//         <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-4xl mx-auto">
          
//           {/* Header Section */}
//           <div className="mb-8 text-center">
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-blue-600 text-sm font-medium mb-4">
//               <IdentificationIcon className="w-4 h-4" />
//               <span>KYC Verification</span>
//             </div>
//             <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-800 bg-clip-text text-transparent mb-3">
//               KYC Registration
//             </h1>
//             <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
//               Complete your verification to start earning with Shuttle
//             </p>
//           </div>

//           {/* Status Card */}
//           <div className="mb-6 p-5 rounded-2xl border transition-all duration-300"
//             style={{
//               backgroundColor: statusConfig.bg,
//               borderColor: statusConfig.color + '40',
//             }}
//           >
//             <div className="flex items-center justify-between flex-wrap gap-3">
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-full flex items-center justify-center"
//                   style={{ backgroundColor: statusConfig.color + '20' }}
//                 >
//                   <StatusIcon className="w-6 h-6" style={{ color: statusConfig.color }} />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
//                   <p className="text-xl font-bold" style={{ color: statusConfig.color }}>
//                     {statusConfig.text}
//                   </p>
//                 </div>
//               </div>
//               {kycStatus === 'REJECTED' && rejectionReason && (
//                 <div className="px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50">
//                   <p className="text-sm text-gray-600 dark:text-gray-400">Reason:</p>
//                   <p className="text-sm font-medium text-red-600 dark:text-red-400">{rejectionReason}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Main Form Card */}
//           <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
//             {/* Form Header */}
//             <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-black dark:bg-white rounded-xl">
//                   <DocumentTextIcon className="w-5 h-5 text-white dark:text-black" />
//                 </div>
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
//                     Document Verification
//                   </h2>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">
//                     Please provide accurate information as per your documents
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Form Body */}
//             <div className="p-6 space-y-6">
              
//               {/* Full Name */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Full Name <span className="text-red-500">*</span>
//                   <span className="text-xs text-gray-400 ml-2 font-normal">(As per Aadhaar card)</span>
//                 </label>
//                 <div className="relative">
//                   <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     name="fullName"
//                     value={form.fullName}
//                     onChange={handleChange}
//                     disabled={isDisabled}
//                     placeholder="e.g., Rajesh Kumar Sharma"
//                     className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                   />
//                 </div>
//               </div>

//               {/* Phone Number */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     name="phone"
//                     value={form.phone}
//                     onChange={handleChange}
//                     disabled={isDisabled}
//                     placeholder="e.g., 9876543210"
//                     maxLength={10}
//                     className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                   />
//                 </div>
//                 <p className="text-xs text-gray-400">Enter 10-digit mobile number</p>
//               </div>

//               {/* Two Column Layout */}
//               <div className="grid md:grid-cols-2 gap-5">
//                 {/* Aadhaar Number */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Aadhaar Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       name="aadhaar_number"
//                       value={form.aadhaar_number}
//                       onChange={handleChange}
//                       disabled={isDisabled}
//                       placeholder="1234 5678 9012"
//                       className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400">12-digit Aadhaar number</p>
//                 </div>

//                 {/* PAN Number */}
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     PAN Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       name="pan_number"
//                       value={form.pan_number}
//                       onChange={handleChange}
//                       disabled={isDisabled}
//                       placeholder="ABCDE 1234 F"
//                       className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400">10-character PAN (5 letters, 4 digits, 1 letter)</p>
//                 </div>
//               </div>

//               {/* Driving License */}
//               <div className="space-y-2">
//                 <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                   Driving License Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     name="driving_license_number"
//                     value={form.driving_license_number}
//                     onChange={handleChange}
//                     disabled={isDisabled}
//                     placeholder="DL-0420230012345"
//                     className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                              bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                              focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                              transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                   />
//                 </div>
//               </div>

//               {/* Bank Details */}
//               <div className="grid md:grid-cols-2 gap-5">
//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     Bank Account Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       name="bank_account_number"
//                       value={form.bank_account_number}
//                       onChange={handleChange}
//                       disabled={isDisabled}
//                       placeholder="e.g., 1234567890123456"
//                       className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                     IFSC Code <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       name="ifsc_code"
//                       value={form.ifsc_code}
//                       onChange={handleChange}
//                       disabled={isDisabled}
//                       placeholder="SBIN0001234"
//                       maxLength={11}
//                       className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
//                                bg-white dark:bg-gray-500 text-gray-900 dark:text-white
//                                focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
//                                transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
//                     />
//                   </div>
//                   <p className="text-xs text-gray-400">11-character IFSC code (4 letters + 7 digits)</p>
//                 </div>
//               </div>

//               {/* Document Uploads Section */}
//               <div className="space-y-4 pt-4">
//                 <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
//                   <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
//                     Upload Documents
//                   </h3>
//                 </div>

//                 <DocumentItem
//                   label="Aadhaar Document"
//                   file={aadhaarFile}
//                   setter={setAadhaarFile}
//                   nameSetter={setAadhaarFileName}
//                   fileName={aadhaarFileName}
//                   url={form.aadhaar_file_url}
//                   required={true}
//                   id="aadhaar"
//                   fileType="image"
//                 />

//                 <DocumentItem
//                   label="PAN Document"
//                   file={panFile}
//                   setter={setPanFile}
//                   nameSetter={setPanFileName}
//                   fileName={panFileName}
//                   url={form.pan_file_url}
//                   required={true}
//                   id="pan"
//                   fileType="image"
//                 />

//                 <DocumentItem
//                   label="Driving License"
//                   file={dlFile}
//                   setter={setDlFile}
//                   nameSetter={setDlFileName}
//                   fileName={dlFileName}
//                   url={form.dl_file_url}
//                   required={true}
//                   id="dl"
//                   fileType="image"
//                 />

//                 <DocumentItem
//                   label="Bank Passbook"
//                   file={passbookFile}
//                   setter={setPassbookFile}
//                   nameSetter={setPassbookFileName}
//                   fileName={passbookFileName}
//                   url={form.passbook_file_url}
//                   required={true}
//                   id="passbook"
//                   fileType="image"
//                 />

//                 <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, JPG, PNG (Max 5MB per file)</p>
//               </div>

//               {/* Submit Button */}
//               {canSubmit && (
//                 <div className="flex justify-center pt-6">
//                   <button
//                     onClick={handleSubmit}
//                     disabled={loading}
//                     style={{
//                       width: '220px',
//                       height: '52px',
//                       borderRadius: '14px',
//                       background: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
//                       color: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
//                       fontWeight: '600',
//                       fontSize: '16px',
//                       border: document.documentElement.classList.contains('dark') ? '1px solid #e5e7eb' : 'none',
//                       cursor: loading ? 'not-allowed' : 'pointer',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       gap: '10px',
//                       transition: 'all 0.3s ease',
//                       boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
//                       opacity: loading ? 0.6 : 1,
//                     }}
//                     onMouseEnter={(e) => {
//                       if (loading) return;
//                       const isDark = document.documentElement.classList.contains('dark');
//                       e.currentTarget.style.background = isDark ? '#f3f4f6' : '#1f2937';
//                       e.currentTarget.style.transform = 'translateY(-2px)';
//                       e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
//                     }}
//                     onMouseLeave={(e) => {
//                       if (loading) return;
//                       const isDark = document.documentElement.classList.contains('dark');
//                       e.currentTarget.style.background = isDark ? '#ffffff' : '#111827';
//                       e.currentTarget.style.transform = 'translateY(0)';
//                       e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
//                     }}
//                   >
//                     <CheckCircleIcon style={{ width: '20px', height: '20px' }} />
//                     {loading ? 'Submitting...' : 'Submit KYC'}
//                   </button>
//                 </div>
//               )}

//               {/* Disabled Message */}
//               {isDisabled && kycStatus !== 'VERIFIED' && (
//                 <div className="text-center py-4">
//                   <p className="text-sm text-yellow-600 dark:text-yellow-400">
//                     Your KYC is already submitted and pending review. You cannot edit the details.
//                   </p>
//                 </div>
//               )}

//               {kycStatus === 'VERIFIED' && (
//                 <div className="text-center py-4">
//                   <p className="text-sm text-green-600 dark:text-green-400">
//                     ✓ Your KYC is verified! You can now start accepting rides.
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <IonLoading isOpen={loading} message="Processing KYC..." />
//         <IonToast
//           isOpen={!!toastMsg}
//           message={toastMsg}
//           duration={2500}
//           onDidDismiss={() => setToastMsg('')}
//           style={{
//             '--background': '#ef4444',
//             '--color': 'white',
//             '--border-radius': '12px',
//           }}
//         />

//         {/* Centered Popup Modal */}
//         {popupMsg && (
//           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
//             <div 
//               className="relative max-w-md w-full mx-4 transform transition-all duration-300 animate-scaleIn"
//               style={{
//                 borderRadius: '24px',
//                 background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
//                 boxShadow: popupType === 'success' 
//                   ? '0 25px 50px -12px rgba(16, 185, 129, 0.25)'
//                   : popupType === 'error'
//                   ? '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
//                   : '0 25px 50px -12px rgba(59, 130, 246, 0.25)'
//               }}
//             >
//               <div className="p-6 text-center">
//                 {/* Icon */}
//                 <div 
//                   className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
//                   style={{
//                     background: popupType === 'success' 
//                       ? 'linear-gradient(135deg, #10b981, #059669)'
//                       : popupType === 'error'
//                       ? 'linear-gradient(135deg, #ef4444, #dc2626)'
//                       : 'linear-gradient(135deg, #3b82f6, #2563eb)'
//                   }}
//                 >
//                   {popupType === 'success' ? (
//                     <CheckCircleIcon className="w-10 h-10 text-white" />
//                   ) : popupType === 'error' ? (
//                     <XCircleIcon className="w-10 h-10 text-white" />
//                   ) : (
//                     <ClockIcon className="w-10 h-10 text-white" />
//                   )}
//                 </div>

//                 {/* Title */}
//                 <h3 
//                   className="text-2xl font-bold mb-2"
//                   style={{
//                     color: popupType === 'success' 
//                       ? '#065f46'
//                       : popupType === 'error'
//                       ? '#991b1b'
//                       : '#1e40af'
//                   }}
//                 >
//                   {popupTitle}
//                 </h3>

//                 {/* Message */}
//                 <p className="text-gray-600 dark:text-gray-300 mb-6">
//                   {popupMsg}
//                 </p>

//                 {/* OK Button */}
//                 <button
//                   onClick={handlePopupOk}
//                   style={{
//                     width: '120px',
//                     height: '44px',
//                     borderRadius: '12px',
//                     background: popupType === 'success' 
//                       ? 'linear-gradient(135deg, #10b981, #059669)'
//                       : popupType === 'error'
//                       ? 'linear-gradient(135deg, #ef4444, #dc2626)'
//                       : 'linear-gradient(135deg, #3b82f6, #2563eb)',
//                     color: '#ffffff',
//                     fontWeight: 600,
//                     fontSize: '14px',
//                     border: 'none',
//                     cursor: 'pointer',
//                     display: 'block',
//                     margin: '0 auto',
//                     transition: 'all 0.3s ease',
//                     transform: 'scale(1)',
//                     boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.transform = 'scale(1.05)';
//                     e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.transform = 'scale(1)';
//                     e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
//                   }}
//                 >
//                   OK
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </IonContent>

//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
        
//         @keyframes scaleIn {
//           from {
//             opacity: 0;
//             transform: scale(0.95);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }
        
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out;
//         }
        
//         .animate-scaleIn {
//           animation: scaleIn 0.3s ease-out;
//         }
        
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

// export default KYCRegistration;

import React, { useState, useEffect, ChangeEvent } from 'react';
import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import NavbarSidebar from '../pages/Navbar';
import {
  UserCircleIcon,
  PhoneIcon,
  IdentificationIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  PhotoIcon
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

// Helper function to check if running on native platform
const isNative = Capacitor.isNativePlatform();

const KYCRegistration: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    aadhaar_number: '',
    pan_number: '',
    driving_license_number: '',
    bank_account_number: '',
    ifsc_code: '',
    aadhaar_file_url: '',
    pan_file_url: '',
    dl_file_url: '',
    passbook_file_url: '',
  });

  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [passbookFile, setPassbookFile] = useState<File | null>(null);

  const [aadhaarFileName, setAadhaarFileName] = useState<string>('');
  const [panFileName, setPanFileName] = useState<string>('');
  const [dlFileName, setDlFileName] = useState<string>('');
  const [passbookFileName, setPassbookFileName] = useState<string>('');

  const [kycStatus, setKycStatus] = useState<string>('DRAFT');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [popupMsg, setPopupMsg] = useState<string>('');
  const [popupTitle, setPopupTitle] = useState<string>('');
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('info');
  const [redirectOnOk, setRedirectOnOk] = useState(false);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  // Load token on mount
  useEffect(() => {
    const loadToken = async () => {
      const accessToken = await getToken();
      setToken(accessToken);
      if (!accessToken) {
        setPopupTitle("Authentication Error");
        setPopupMsg("Please login again");
        setPopupType('error');
        setRedirectOnOk(true);
      }
    };
    loadToken();
  }, []);

  // FETCH KYC STATUS when token is available
  useEffect(() => {
    if (token) {
      fetchStatus();
    }
  }, [token]);

  const fetchStatus = async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${API_BASE}/driver/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.status === 404 || data.detail === "Driver profile not found") {
        setPopupTitle("Profile Required");
        setPopupMsg("Driver profile not found. Please set up your profile first.");
        setPopupType('info');
        setRedirectOnOk(true);
        return;
      }

      const status = data.status.toUpperCase();
      setKycStatus(status);
      setRejectionReason(data.rejection_reason || '');

      setForm({
        fullName: data.full_name || '',
        phone: data.phone || '',
        aadhaar_number: data.documents?.aadhaar_number || '',
        pan_number: data.documents?.pan_number || '',
        driving_license_number: data.documents?.driving_license_number || '',
        bank_account_number: data.documents?.bank_account_number || '',
        ifsc_code: data.documents?.ifsc_code || '',
        aadhaar_file_url: data.documents?.aadhaar_card_file ? `${API_BASE}/${data.documents.aadhaar_card_file}` : '',
        pan_file_url: data.documents?.pan_file ? `${API_BASE}/${data.documents.pan_file}` : '',
        dl_file_url: data.documents?.driving_license_file ? `${API_BASE}/${data.documents.driving_license_file}` : '',
        passbook_file_url: data.documents?.passbook_file_path ? `${API_BASE}/${data.documents.passbook_file_path}` : '',
      });

    } catch (error) {
      console.error('Fetch status error:', error);
      setToastMsg("Failed to load status");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    const name = e.target.name;

    // Format Aadhaar number (XXXX XXXX XXXX)
    if (name === 'aadhaar_number') {
      value = value.replace(/\D/g, '').slice(0, 12);
      if (value.length > 8) {
        value = value.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
      } else if (value.length > 4) {
        value = value.replace(/(\d{4})(\d{4})/, '$1 $2');
      }
    }

    // Format PAN number (ABCDE1234F)
    if (name === 'pan_number') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
      if (value.length === 10) {
        value = value.replace(/([A-Z]{5})(\d{4})([A-Z]{1})/, '$1 $2 $3');
      }
    }

    // Format Driving License (DL-0420230012345)
    if (name === 'driving_license_number') {
      value = value.toUpperCase();
    }

    // Format IFSC code (ABCD0123456)
    if (name === 'ifsc_code') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
    }

    setForm({ ...form, [name]: value });
  };

  const handleFile = (setter: any, setNameSetter: any) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setToastMsg("Please upload PDF, JPG, or PNG files only");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setToastMsg("File size should be less than 5MB");
        return;
      }
      setter(file);
      setNameSetter(file.name);
    }
  };

  // ======================
  // View File Function - Works on both Web and Android
  // ======================
  const viewFile = async (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      setToastMsg("No file to view");
      return;
    }

    setViewingFile(fileName);

    try {
      if (isNative) {
        // Android Native - Use Browser plugin to open file
        await Browser.open({ url: fileUrl, presentationStyle: 'fullscreen' });
      } else {
        // Web - Open in new tab
        window.open(fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      setToastMsg("Could not open file. Please try downloading it.");
    } finally {
      setViewingFile(null);
    }
  };

  // ======================
  // Download File Function for Android
  // ======================
  const downloadFile = async (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      setToastMsg("No file to download");
      return;
    }

    setLoading(true);
    try {
      // Fetch the file from the server
      const response = await fetch(fileUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to download: ${response.status}`);
      }

      const blob = await response.blob();

      if (isNative) {
        // Android Native - Save using Filesystem
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        });

        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
        });

        // Open the downloaded file
        const uri = savedFile.uri;
        await Browser.open({ url: uri, presentationStyle: 'fullscreen' });
        
        setToastMsg(`File downloaded: ${fileName}`);
      } else {
        // Web - Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setToastMsg(`Downloading: ${fileName}`);
      }
    } catch (error) {
      console.error('Download error:', error);
      setToastMsg("Failed to download file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const uploadDocs = async () => {
    if (!token) throw new Error("No authentication token");
    
    const formData = new FormData();

    // Append files if they exist
    if (aadhaarFile) formData.append('aadhaar_card', aadhaarFile);
    if (panFile) formData.append('pan', panFile);
    if (dlFile) formData.append('driving_license', dlFile);
    if (passbookFile) formData.append('passbook_file', passbookFile);

    // Append form data
    formData.append('aadhaar_number', form.aadhaar_number.replace(/\s/g, ''));
    formData.append('pan_number', form.pan_number.replace(/\s/g, ''));
    formData.append('driving_license_number', form.driving_license_number);
    formData.append('bank_account_number', form.bank_account_number);
    formData.append('ifsc_code', form.ifsc_code);

    const res = await fetch(`${API_BASE}/driver/kyc/upload-document`, {
      method: 'PATCH',
      headers: { 
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseText = await res.text();

    if (!res.ok) {
      let errorMessage = "Upload failed";
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.detail || errorData.error || "Upload failed";
      } catch (e) {
        errorMessage = responseText || "Upload failed";
      }
      throw new Error(errorMessage);
    }

    return responseText;
  };

  const submitKyc = async () => {
    if (!token) throw new Error("No authentication token");
    
    const res = await fetch(`${API_BASE}/driver/kyc/submit`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (res.status === 404 || data.detail === "Driver profile not found") {
      throw new Error("Driver profile not found. Please complete your profile first.");
    }

    if (!res.ok) {
      throw new Error(data.message || data.detail || "Submit failed");
    }

    return data;
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.fullName.trim()) {
      setPopupTitle("Missing Information");
      setPopupMsg("Please enter your full name");
      setPopupType('error');
      return;
    }

    if (!form.phone.trim() || form.phone.length < 10) {
      setPopupTitle("Missing Information");
      setPopupMsg("Please enter a valid 10-digit phone number");
      setPopupType('error');
      return;
    }

    if (!form.aadhaar_number || form.aadhaar_number.replace(/\s/g, '').length !== 12) {
      setPopupTitle("Missing Information");
      setPopupMsg("Please enter a valid 12-digit Aadhaar number");
      setPopupType('error');
      return;
    }

    if (!form.pan_number || form.pan_number.replace(/\s/g, '').length !== 10) {
      setPopupTitle("Missing Information");
      setPopupMsg("Please enter a valid 10-character PAN number");
      setPopupType('error');
      return;
    }

    if (!form.driving_license_number.trim()) {
      setPopupTitle("Missing Information");
      setPopupMsg("Please enter your driving license number");
      setPopupType('error');
      return;
    }

    if (!form.bank_account_number.trim()) {
      setPopupTitle("Missing Information");
      setPopupMsg("Please enter your bank account number");
      setPopupType('error');
      return;
    }

    if (!form.ifsc_code.trim() || form.ifsc_code.length !== 11) {
      setPopupTitle("Missing Information");
      setPopupMsg("Please enter a valid 11-character IFSC code");
      setPopupType('error');
      return;
    }

    if (!aadhaarFile && !form.aadhaar_file_url) {
      setPopupTitle("Missing Document");
      setPopupMsg("Please upload your Aadhaar document");
      setPopupType('error');
      return;
    }

    if (!panFile && !form.pan_file_url) {
      setPopupTitle("Missing Document");
      setPopupMsg("Please upload your PAN document");
      setPopupType('error');
      return;
    }

    if (!dlFile && !form.dl_file_url) {
      setPopupTitle("Missing Document");
      setPopupMsg("Please upload your Driving License document");
      setPopupType('error');
      return;
    }

    if (!passbookFile && !form.passbook_file_url) {
      setPopupTitle("Missing Document");
      setPopupMsg("Please upload your Bank Passbook document");
      setPopupType('error');
      return;
    }

    setLoading(true);
    try {
      await uploadDocs();
      await submitKyc();

      setPopupTitle("Success!");
      setPopupMsg("Your KYC has been submitted successfully! Our team will review your documents.");
      setPopupType('success');
      setRedirectOnOk(false);
      
      await fetchStatus();

    } catch (e: any) {
      console.error('Submit error:', e);
      setPopupTitle("Submission Failed");
      setPopupMsg(e.message || "Error submitting KYC. Please try again.");
      setPopupType('error');
      setRedirectOnOk(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePopupOk = () => {
    setPopupMsg('');
    setPopupTitle('');
    if (redirectOnOk) {
      window.location.href = '/profile-setup';
    }
  };

  const isDisabled = kycStatus === 'PENDING' || kycStatus === 'VERIFIED';
  const canSubmit = kycStatus === 'DRAFT' || kycStatus === 'REJECTED';

  const getStatusConfig = () => {
    switch (kycStatus) {
      case 'VERIFIED':
        return { color: '#10b981', bg: '#d1fae5', icon: CheckCircleIcon, text: 'Verified' };
      case 'PENDING':
        return { color: '#f59e0b', bg: '#fed7aa', icon: ClockIcon, text: 'Pending Review' };
      case 'REJECTED':
        return { color: '#ef4444', bg: '#fee2e2', icon: XCircleIcon, text: 'Rejected' };
      default:
        return { color: '#6b7280', bg: '#f3f4f6', icon: DocumentTextIcon, text: 'Draft' };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // Document item component - Mobile friendly
  const DocumentItem = ({ 
    label, 
    file, 
    setter, 
    nameSetter,
    fileName,
    url,
    required,
    id,
    fileType
  }: any) => {
    const getFileIcon = () => {
      if (fileType === 'image') {
        return <PhotoIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
      }
      return <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    };

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                      bg-gray-50 dark:bg-gray-900/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          {getFileIcon()}
          <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
            {label} {required && <span className="text-red-500">*</span>}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View Button */}
          {url && !file && (
            <>
              <button
                onClick={() => viewFile(url, `${label}.pdf`)}
                disabled={viewingFile === label}
                className="px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-blue-600 dark:text-blue-400 
                         bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 
                         rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-all duration-200 
                         disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
              >
                <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{viewingFile === label ? 'Opening...' : 'View'}</span>
              </button>

              {/* Download Button for Android
              {isNative && (
                <button
                  onClick={() => downloadFile(url, `${label}.pdf`)}
                  className="px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-green-600 dark:text-green-400 
                           bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 
                           rounded-lg hover:bg-green-100 dark:hover:bg-green-950/50 transition-all duration-200 
                           flex items-center gap-1 whitespace-nowrap"
                >
                  <ArrowDownTrayIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Download</span>
                </button>
              )} */}
            </>
          )}
          
          {/* Uploaded file name */}
          {file && (
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-25 sm:max-w-37.5 truncate">
              {fileName || file.name}
            </span>
          )}
          
          {/* Upload/Change button */}
          {!isDisabled && (
            <label
              className="px-2 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium rounded-lg 
                       bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                       hover:bg-gray-300 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 
                       transition-all duration-200 cursor-pointer flex items-center gap-1 whitespace-nowrap"
            >
              <CloudArrowUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{file ? 'Change' : 'Upload'}</span>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFile(setter, nameSetter)}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    );
  };

  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        <div className="relative z-10 pt-16 sm:pt-20 pb-6 sm:pb-8 px-3 sm:px-4 md:px-6 max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-blue-600 text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <IdentificationIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>KYC Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-800 dark:from-white dark:to-gray-800 bg-clip-text text-transparent mb-2 sm:mb-3">
              KYC Registration
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto px-2">
              Complete your verification to start earning with Shuttle
            </p>
          </div>

          {/* Status Card */}
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-2xl border transition-all duration-300"
            style={{
              backgroundColor: statusConfig.bg,
              borderColor: statusConfig.color + '40',
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: statusConfig.color + '20' }}
                >
                  <StatusIcon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: statusConfig.color }} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                  <p className="text-lg sm:text-xl font-bold" style={{ color: statusConfig.color }}>
                    {statusConfig.text}
                  </p>
                </div>
              </div>
              {kycStatus === 'REJECTED' && rejectionReason && (
                <div className="w-full sm:w-auto px-3 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Reason:</p>
                  <p className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 wrap-break-word">{rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Form Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-black dark:bg-white rounded-xl">
                  <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Document Verification
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Please provide accurate information as per your documents
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              
              {/* Full Name */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Full Name <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 ml-2 font-normal">(As per Aadhaar card)</span>
                </label>
                <div className="relative">
                  <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="e.g., Rajesh Kumar Sharma"
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl 
                             border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                             transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="e.g., 9876543210"
                    maxLength={10}
                    type="tel"
                    inputMode="numeric"
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl 
                             border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                             transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400">Enter 10-digit mobile number</p>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {/* Aadhaar Number */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      name="aadhaar_number"
                      value={form.aadhaar_number}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="1234 5678 9012"
                      maxLength={14}
                      inputMode="numeric"
                      className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl 
                               border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
                               placeholder:text-gray-400 dark:placeholder:text-gray-500
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                               transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400">12-digit Aadhaar number</p>
                </div>

                {/* PAN Number */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      name="pan_number"
                      value={form.pan_number}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="ABCDE 1234 F"
                      maxLength={14}
                      className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl 
                               border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
                               placeholder:text-gray-400 dark:placeholder:text-gray-500
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                               transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400">10-character PAN (5 letters, 4 digits, 1 letter)</p>
                </div>
              </div>

              {/* Driving License */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Driving License Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    name="driving_license_number"
                    value={form.driving_license_number}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="DL-0420230012345"
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl 
                             border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
                             placeholder:text-gray-400 dark:placeholder:text-gray-500
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                             transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bank Account Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      name="bank_account_number"
                      value={form.bank_account_number}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="e.g., 1234567890123456"
                      inputMode="numeric"
                      className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl 
                               border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
                               placeholder:text-gray-400 dark:placeholder:text-gray-500
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                               transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      name="ifsc_code"
                      value={form.ifsc_code}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="SBIN0001234"
                      maxLength={11}
                      className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl 
                               border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 
                               placeholder:text-gray-400 dark:placeholder:text-gray-500
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                               transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400">11-character IFSC code (4 letters + 7 digits)</p>
                </div>
              </div>

              {/* Document Uploads Section */}
              <div className="space-y-3 sm:space-y-4 pt-3 sm:pt-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                    Upload Documents
                  </h3>
                </div>

                <DocumentItem
                  label="Aadhaar Document"
                  file={aadhaarFile}
                  setter={setAadhaarFile}
                  nameSetter={setAadhaarFileName}
                  fileName={aadhaarFileName}
                  url={form.aadhaar_file_url}
                  required={true}
                  id="aadhaar"
                  fileType="image"
                />

                <DocumentItem
                  label="PAN Document"
                  file={panFile}
                  setter={setPanFile}
                  nameSetter={setPanFileName}
                  fileName={panFileName}
                  url={form.pan_file_url}
                  required={true}
                  id="pan"
                  fileType="image"
                />

                <DocumentItem
                  label="Driving License"
                  file={dlFile}
                  setter={setDlFile}
                  nameSetter={setDlFileName}
                  fileName={dlFileName}
                  url={form.dl_file_url}
                  required={true}
                  id="dl"
                  fileType="image"
                />

                <DocumentItem
                  label="Bank Passbook"
                  file={passbookFile}
                  setter={setPassbookFile}
                  nameSetter={setPassbookFileName}
                  fileName={passbookFileName}
                  url={form.passbook_file_url}
                  required={true}
                  id="passbook"
                  fileType="image"
                />

                <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, JPG, PNG (Max 5MB per file)</p>
              </div>

              {/* Submit Button */}
              {canSubmit && (
                <div className="flex justify-center pt-4 sm:pt-6">
                <button
  onClick={handleSubmit}
  disabled={loading}
  style={{
    height: '48px',
    minWidth: '180px',
    width: 'auto',
    padding: '0 28px',
    background: document.documentElement.classList.contains('dark') ? '#ffffff' : '#000000',
    color: document.documentElement.classList.contains('dark') ? '#000000' : '#ffffff',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '15px',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: '0 4px 14px -4px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: loading ? 0.6 : 1,
    transform: 'scale(1)',
  }}
  onMouseEnter={(e) => {
    if (!loading) {
      const isDark = document.documentElement.classList.contains('dark');
      e.currentTarget.style.background = isDark ? '#f3f4f6' : '#1a1a1a';
      e.currentTarget.style.transform = 'scale(1.03)';
      e.currentTarget.style.boxShadow = '0 8px 25px -4px rgba(0, 0, 0, 0.3)';
    }
  }}
  onMouseLeave={(e) => {
    if (!loading) {
      const isDark = document.documentElement.classList.contains('dark');
      e.currentTarget.style.background = isDark ? '#ffffff' : '#000000';
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 4px 14px -4px rgba(0, 0, 0, 0.2)';
    }
  }}
>
  <CheckCircleIcon style={{ width: '18px', height: '18px' }} />
  <span>{loading ? 'Submitting...' : 'Submit KYC'}</span>
</button>
                </div>
              )}

              {/* Disabled Message */}
              {isDisabled && kycStatus !== 'VERIFIED' && (
                <div className="text-center py-3 sm:py-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Your KYC is already submitted and pending review. You cannot edit the details.
                  </p>
                </div>
              )}

              {kycStatus === 'VERIFIED' && (
                <div className="text-center py-3 sm:py-4">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ Your KYC is verified! You can now start accepting rides.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Processing KYC..." />
        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2500}
          onDidDismiss={() => setToastMsg('')}
          style={{
            '--background': '#ef4444',
            '--color': 'white',
            '--border-radius': '12px',
          }}
        />

        {/* Centered Popup Modal */}
        {popupMsg && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
            <div 
              className="relative max-w-md w-full mx-4 transform transition-all duration-300 animate-scaleIn"
              style={{
                borderRadius: '24px',
                background: document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff',
                boxShadow: popupType === 'success' 
                  ? '0 25px 50px -12px rgba(16, 185, 129, 0.25)'
                  : popupType === 'error'
                  ? '0 25px 50px -12px rgba(239, 68, 68, 0.25)'
                  : '0 25px 50px -12px rgba(59, 130, 246, 0.25)'
              }}
            >
              <div className="p-5 sm:p-6 text-center">
                {/* Icon */}
                <div 
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: popupType === 'success' 
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : popupType === 'error'
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  }}
                >
                  {popupType === 'success' ? (
                    <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  ) : popupType === 'error' ? (
                    <XCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  ) : (
                    <ClockIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  )}
                </div>

                {/* Title */}
                <h3 
                  className="text-xl sm:text-2xl font-bold mb-2"
                  style={{
                    color: popupType === 'success' 
                      ? '#065f46'
                      : popupType === 'error'
                      ? '#991b1b'
                      : '#1e40af'
                  }}
                >
                  {popupTitle}
                </h3>

                {/* Message */}
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-600 mb-5 sm:mb-6">
                  {popupMsg}
                </p>

                {/* OK Button */}
              <button
  onClick={handlePopupOk}
  style={{
    height: '44px',
    minWidth: '120px',
    padding: '0 24px',
    background: popupType === 'success' 
      ? 'linear-gradient(135deg, #10b981, #059669)'
      : popupType === 'error'
      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
      : 'linear-gradient(135deg, #3b82f6, #2563eb)',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px -4px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'scale(1)',
  }}
  className="hover:scale-105 hover:shadow-lg active:scale-95"
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = '0 8px 25px -4px rgba(0, 0, 0, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = '0 4px 14px -4px rgba(0, 0, 0, 0.2)';
  }}
>
  OK
</button>
              </div>
            </div>
          </div>
        )}
      </IonContent>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .bg-grid-gray-900\\/[0.02] {
          background-image: linear-gradient(to right, rgba(17, 24, 39, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(17, 24, 39, 0.02) 1px, transparent 1px);
        }
        
        .dark .bg-grid-white\\/[0.02] {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
        }

        /* Better text contrast on inputs */
        input::placeholder {
          color: #9ca3af;
          opacity: 1;
        }
        
        .dark input::placeholder {
          color: #6b7280;
        }

        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Improve mobile touch targets */
        @media (max-width: 640px) {
          button, label, input, select {
            touch-action: manipulation;
          }
          
          input, select, textarea {
            font-size: 16px !important; /* Prevents iOS zoom */
          }
        }

        /* Scrollable form content */
        .scrollable-content {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </IonPage>
  );
};

export default KYCRegistration;