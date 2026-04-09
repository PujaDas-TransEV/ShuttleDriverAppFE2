// import React, { useState, useEffect, ChangeEvent } from 'react';
// import { IonPage, IonContent, IonButton, IonLoading, IonToast } from '@ionic/react';
// import NavbarSidebar from '../pages/Navbar';
// import {
//   UserCircleIcon,
//   PhoneIcon,
//   IdentificationIcon,
//   DocumentTextIcon,
//   BanknotesIcon,
// } from '@heroicons/react/24/outline';

// const API_BASE = "https://be.shuttleapp.transev.site";

// const KYCRegistration: React.FC = () => {
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
// const [popupMsg, setPopupMsg] = useState<string>('');
// const [redirectOnOk, setRedirectOnOk] = useState(false);
//   const token = localStorage.getItem('access_token');

//   // FETCH KYC STATUS
//   const fetchStatus = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/driver/kyc/status`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       const data = await res.json();
// // Handle "Driver profile not found"
//     if (res.status === 404 || data.detail === "Driver profile not found") {
//       setPopupMsg("Driver profile not found. Please set up your profile first.");
//       setRedirectOnOk(true); // redirect when user clicks OK
//       return;
//     }
//       const status = data.status.toUpperCase(); // normalize status
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

//   useEffect(() => {
//     fetchStatus();
//   }, []);

//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleFile = (setter: any) => (e: ChangeEvent<HTMLInputElement>) => {
//     setter(e.target.files?.[0] || null);
//   };

//   // UPLOAD DOCUMENTS
//   const uploadDocs = async () => {
//     const fd = new FormData();

//     if (aadhaarFile) fd.append('aadhaar_card', aadhaarFile);
//     if (panFile) fd.append('pan', panFile);
//     if (dlFile) fd.append('driving_license', dlFile);
//     if (passbookFile) fd.append('passbook_file', passbookFile);

//     fd.append('aadhaar_number', form.aadhaar_number);
//     fd.append('pan_number', form.pan_number);
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

//   // SUBMIT KYC
//   // const submitKyc = async () => {
//   //   const res = await fetch(`${API_BASE}/driver/kyc/submit`, {
//   //     method: 'POST',
//   //     headers: { Authorization: `Bearer ${token}` },
//   //   });

//   //   if (!res.ok) throw new Error("Submit failed");
//   // };

//   // const handleSubmit = async () => {
//   //   setLoading(true);
//   //   try {
//   //     await uploadDocs();
//   //     await submitKyc();
//   //     setToastMsg("KYC Submitted ✅");
//   //     fetchStatus();
//   //   } catch (e: any) {
//   //     setToastMsg(e.message);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
// const submitKyc = async () => {
//   const res = await fetch(`${API_BASE}/driver/kyc/submit`, {
//     method: 'POST',
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   const data = await res.json();

//   // Handle driver profile not found
//   if (res.status === 404 || data.detail === "Driver profile not found") {
//     throw new Error("Driver profile not found. Please complete your profile first.");
//   }

//   if (!res.ok) {
//     throw new Error(data.message || "Submit failed");
//   }

//   return data;
// };

// const handleSubmit = async () => {
//   setLoading(true);
//   try {
//     // Upload documents first
//     await uploadDocs();

//     // Submit KYC
//     await submitKyc();

//     // Success
//     setPopupMsg("KYC Submitted ✅");
//     setRedirectOnOk(false); // no redirect needed
//     fetchStatus();

//   } catch (e: any) {
//     console.error(e);
//     // Show error in popup instead of toast
//     setPopupMsg(e.message || "Error submitting KYC");
//     setRedirectOnOk(true); // redirect if profile setup required
//   } finally {
//     setLoading(false);
//   }
// };
// const handlePopupOk = () => {
//   setPopupMsg('');
//   if (redirectOnOk) {
//     window.location.href = '/profile-setup'; // redirect to profile setup page
//   }
// };
//   const isDisabled = kycStatus === 'PENDING' || kycStatus === 'VERIFIED';
//   const canSubmit = kycStatus === 'DRAFT' || kycStatus === 'REJECTED';

//   const statusColor =
//     kycStatus === 'VERIFIED' ? 'text-green-500' :
//     kycStatus === 'REJECTED' ? 'text-red-500' :
//     'text-yellow-500';

//   return (
//     <IonPage>
//       <NavbarSidebar />
//       <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16">
//         <div className="max-w-3xl mx-auto p-6 mt-10 space-y-6">
//           <h1 className="text-3xl font-bold text-center">KYC Registration</h1>

//           <p className="text-center">
//             Status: <span className={`font-bold ${statusColor}`}>{kycStatus}</span>
//           </p>

//           {kycStatus === 'REJECTED' && (
//             <p className="text-center text-red-500 text-sm">
//               Reason: {rejectionReason}
//             </p>
//           )}

//           {/* FORM */}
//           <div className="space-y-4">

         
//   <div className="space-y-4">
//   <label className="text-gray-600 mb-1 font-medium">
//     Full Name
//     <span className="text-sm text-gray-500 ml-2">(As per Aadhaar card)</span>
//   </label>
//   <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white">
//     <UserCircleIcon className="icon mr-2" />
//     {/* <input 
//       value={form.fullName} 
//       disabled placeholder="Full Name"
//       className="flex-1 outline-none bg-transparent" 
//     /> */}
//       <input
//   value={form.fullName}
//   name="fullName"
//   onChange={handleChange}
//   placeholder="Full Name"
//   className="flex-1 outline-none bg-transparent"
// />
//   </div>
// </div>


//             <label className="text-gray-600 mb-1 font-medium">Phone Number</label>
//             <div className="inputBox">
//               <PhoneIcon className="icon" />
         

// <input
//   value={form.phone}
//   name="phone"
//   onChange={handleChange}
//   placeholder="Phone Number"
//   className="flex-1 outline-none bg-transparent"
// />
//             </div>

//             <label className="text-gray-600 mb-1 font-medium">Aadhaar Number</label>
//             <div className="inputBox">
//               <IdentificationIcon className="icon" />
//               <input
//                 name="aadhaar_number"
//                 value={form.aadhaar_number}
//                 onChange={handleChange}
//                 disabled={isDisabled}
//                 placeholder="Aadhaar Number"
//               />
//             </div>

//             <label className="text-gray-600 mb-1 font-medium">PAN Number</label>
//             <div className="inputBox">
//               <DocumentTextIcon className="icon" />
//               <input
//                 name="pan_number"
//                 value={form.pan_number}
//                 onChange={handleChange}
//                 disabled={isDisabled}
//                 placeholder="PAN Number"
//               />
//             </div>

//             <label className="text-gray-600 mb-1 font-medium">Driving License Number</label>
//             <div className="inputBox">
//               <IdentificationIcon className="icon" />
//               <input
//                 name="driving_license_number"
//                 value={form.driving_license_number}
//                 onChange={handleChange}
//                 disabled={isDisabled}
//                 placeholder="Driving License"
//               />
//             </div>

//             <label className="text-gray-600 mb-1 font-medium">Bank Account Number</label>
//             <div className="inputBox">
//               <BanknotesIcon className="icon" />
//               <input
//                 name="bank_account_number"
//                 value={form.bank_account_number}
//                 onChange={handleChange}
//                 disabled={isDisabled}
//                 placeholder="Bank Account"
//               />
//             </div>

//             <label className="text-gray-600 mb-1 font-medium">IFSC Code</label>
//             <div className="inputBox">
//               <BanknotesIcon className="icon" />
//               <input
//                 name="ifsc_code"
//                 value={form.ifsc_code}
//                 onChange={handleChange}
//                 disabled={isDisabled}
//                 placeholder="IFSC Code"
//               />
//             </div>
//           </div>

//           {/* FILE UPLOADS */}
//           <div className="space-y-6 mt-6">
//             {[
//               { label: 'Aadhaar Document', file: aadhaarFile, setter: setAadhaarFile, url: form.aadhaar_file_url },
//               { label: 'PAN Document', file: panFile, setter: setPanFile, url: form.pan_file_url },
//               { label: 'Driving License', file: dlFile, setter: setDlFile, url: form.dl_file_url },
//               { label: 'Passbook / Bank Document', file: passbookFile, setter: setPassbookFile, url: form.passbook_file_url },
//             ].map((item, idx) => (
//               <div key={idx} className="flex items-center justify-between border border-gray-600 rounded-lg p-3 bg-black text-white">
//                 <span className="font-medium">{item.label}</span>
//                 <div className="flex items-center space-x-4">
//                   {item.url && !item.file && (
//                     <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 underline">
//                       View
//                     </a>
//                   )}
//                   {item.file && <span className="text-gray-300">{item.file.name}</span>}
//                   {!isDisabled && (
//                     <label className="cursor-pointer px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition">
//                       {item.file ? 'Change' : 'Upload'}
//                       <input
//                         type="file"
//                         accept="image/*,application/pdf"
//                         onChange={(e) => item.setter(e.target.files?.[0] || null)}
//                         className="hidden"
//                       />
//                     </label>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>

//          {/* SUBMIT BUTTON */}
// {canSubmit && (
//   <div className="flex justify-center mt-4">
//     <IonButton onClick={handleSubmit}>
//       Submit KYC
//     </IonButton>
//   </div>
// )}
//           <IonLoading isOpen={loading} message="Processing..." />
//           <IonToast isOpen={!!toastMsg} message={toastMsg} duration={2000} onDidDismiss={() => setToastMsg('')} />
//         </div>

//         <style>{`
//           .inputBox {
//             display:flex;
//             align-items:center;
//             border:1px solid #ccc;
//             border-radius:10px;
//             padding:8px;
//             background:white;
//           }
//           .icon {
//             width:20px;
//             margin-right:8px;
//             color:gray;
//           }
//           input {
//             width:100%;
//             outline:none;
//             background:transparent;
//           }
//         `}</style>
//      {/* Popup Modal */}
// {popupMsg && (
//   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//     <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-xl text-center border border-gray-200 dark:border-gray-700">
//       {/* Message */}
//       <p className="text-gray-900 dark:text-white text-lg font-semibold mb-6">{popupMsg}</p>

//       {/* OK Button */}
//       {/* <button
//   className="bg-linear-to-r from-gray-900 to-black text-white px-6 py-2 rounded-xl shadow-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 transform hover:scale-105 mx-auto block"
//   onClick={handlePopupOk}
// >
//   OK
// </button> */}
// <button
//   onClick={handlePopupOk}
//   style={{
//     background: 'linear-gradient(to right, #1f2937, #000000)', // gradient
//     color: '#ffffff',
//     padding: '8px 24px',
//     borderRadius: '12px',
//     boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
//     border: 'none',
//     cursor: 'pointer',
//     display: 'block',
//     margin: '0 auto',
//     transition: 'all 0.3s ease',
//     transform: 'scale(1)',
//   }}
//   onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
//   onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
// >
//   OK
// </button>
//     </div>
//   </div>
// )}
//       </IonContent>
//     </IonPage>
//   );
// };

// export default KYCRegistration;

import React, { useState, useEffect, ChangeEvent } from 'react';
import { IonPage, IonContent, IonLoading, IonToast } from '@ionic/react';
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
  EyeIcon
} from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

const KYCRegistration: React.FC = () => {
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

  const [kycStatus, setKycStatus] = useState<string>('DRAFT');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [popupMsg, setPopupMsg] = useState<string>('');
  const [popupTitle, setPopupTitle] = useState<string>('');
  const [popupType, setPopupType] = useState<'success' | 'error' | 'info'>('info');
  const [redirectOnOk, setRedirectOnOk] = useState(false);
  const token = localStorage.getItem('access_token');

  // FETCH KYC STATUS
  const fetchStatus = async () => {
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

    } catch {
      setToastMsg("Failed to load status");
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

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

  const handleFile = (setter: any) => (e: ChangeEvent<HTMLInputElement>) => {
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
    }
    setter(file);
  };

  const uploadDocs = async () => {
    const fd = new FormData();

    if (aadhaarFile) fd.append('aadhaar_card', aadhaarFile);
    if (panFile) fd.append('pan', panFile);
    if (dlFile) fd.append('driving_license', dlFile);
    if (passbookFile) fd.append('passbook_file', passbookFile);

    fd.append('aadhaar_number', form.aadhaar_number.replace(/\s/g, ''));
    fd.append('pan_number', form.pan_number.replace(/\s/g, ''));
    fd.append('driving_license_number', form.driving_license_number);
    fd.append('bank_account_number', form.bank_account_number);
    fd.append('ifsc_code', form.ifsc_code);

    const res = await fetch(`${API_BASE}/driver/kyc/upload-document`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    if (!res.ok) throw new Error("Upload failed");
  };

  const submitKyc = async () => {
    const res = await fetch(`${API_BASE}/driver/kyc/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.status === 404 || data.detail === "Driver profile not found") {
      throw new Error("Driver profile not found. Please complete your profile first.");
    }

    if (!res.ok) {
      throw new Error(data.message || "Submit failed");
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
      fetchStatus();

    } catch (e: any) {
      console.error(e);
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

  return (
    <IonPage className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <NavbarSidebar />
      
      <IonContent className="relative">
        <div className="absolute inset-0 bg-grid-gray-900/[0.02] dark:bg-grid-white/[0.02] bg-size-[20px_20px] pointer-events-none" />
        
        <div className="relative z-10 pt-20 pb-8 px-4 md:px-6 max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white text-sm font-medium mb-4">
              <IdentificationIcon className="w-4 h-4" />
              <span>KYC Verification</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent mb-3">
              KYC Registration
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Complete your verification to start earning with Shuttle
            </p>
          </div>

          {/* Status Card */}
          <div className="mb-6 p-5 rounded-2xl border transition-all duration-300"
            style={{
              backgroundColor: statusConfig.bg,
              borderColor: statusConfig.color + '40',
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: statusConfig.color + '20' }}
                >
                  <StatusIcon className="w-6 h-6" style={{ color: statusConfig.color }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                  <p className="text-xl font-bold" style={{ color: statusConfig.color }}>
                    {statusConfig.text}
                  </p>
                </div>
              </div>
              {kycStatus === 'REJECTED' && rejectionReason && (
                <div className="px-4 py-2 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reason:</p>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{rejectionReason}</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black dark:bg-white rounded-xl">
                  <DocumentTextIcon className="w-5 h-5 text-white dark:text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Document Verification
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Please provide accurate information as per your documents
                  </p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 space-y-6">
              
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Full Name <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 ml-2 font-normal">(As per Aadhaar card)</span>
                </label>
                <div className="relative">
                  <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="e.g., Rajesh Kumar Sharma"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                             transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="e.g., 9876543210"
                    maxLength={10}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                             transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-400">Enter 10-digit mobile number</p>
              </div>

              {/* Two Column Layout */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* Aadhaar Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="aadhaar_number"
                      value={form.aadhaar_number}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="1234 5678 9012"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                               transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400">12-digit Aadhaar number</p>
                </div>

                {/* PAN Number */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    PAN Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DocumentTextIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="pan_number"
                      value={form.pan_number}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="ABCDE 1234 F"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                               transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400">10-character PAN (5 letters, 4 digits, 1 letter)</p>
                </div>
              </div>

              {/* Driving License */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Driving License Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    name="driving_license_number"
                    value={form.driving_license_number}
                    onChange={handleChange}
                    disabled={isDisabled}
                    placeholder="DL-0420230012345"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                             transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bank Account Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="bank_account_number"
                      value={form.bank_account_number}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="e.g., 1234567890123456"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                               transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BanknotesIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="ifsc_code"
                      value={form.ifsc_code}
                      onChange={handleChange}
                      disabled={isDisabled}
                      placeholder="SBIN0001234"
                      maxLength={11}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                               bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                               focus:border-black dark:focus:border-white focus:ring-2 focus:ring-black/20
                               transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400">11-character IFSC code (4 letters + 7 digits)</p>
                </div>
              </div>

              {/* Document Uploads Section */}
              <div className="space-y-4 pt-4">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Upload Documents
                  </h3>
                </div>

                {[
                  { 
                    label: 'Aadhaar Document', 
                    file: aadhaarFile, 
                    setter: setAadhaarFile, 
                    url: form.aadhaar_file_url,
                    required: true
                  },
                  { 
                    label: 'PAN Document', 
                    file: panFile, 
                    setter: setPanFile, 
                    url: form.pan_file_url,
                    required: true
                  },
                  { 
                    label: 'Driving License', 
                    file: dlFile, 
                    setter: setDlFile, 
                    url: form.dl_file_url,
                    required: true
                  },
                  { 
                    label: 'Bank Passbook', 
                    file: passbookFile, 
                    setter: setPassbookFile, 
                    url: form.passbook_file_url,
                    required: true
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                                          bg-gray-50 dark:bg-gray-900/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all">
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {item.label} {item.required && <span className="text-red-500">*</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.url && !item.file && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            color: '#3b82f6',
                            textDecoration: 'none',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <EyeIcon className="w-4 h-4" />
                          View
                        </a>
                      )}
                      {item.file && (
                        <span className="text-sm text-gray-600 dark:text-gray-400 max-w-[150px] truncate">
                          {item.file.name}
                        </span>
                      )}
                      {!isDisabled && (
                        <label
                          style={{
                            cursor: 'pointer',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            background: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
                            color: document.documentElement.classList.contains('dark') ? '#f3f4f6' : '#374151',
                            fontSize: '13px',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                            border: `1px solid ${document.documentElement.classList.contains('dark') ? '#4b5563' : '#d1d5db'}`
                          }}
                          onMouseEnter={(e) => {
                            const isDark = document.documentElement.classList.contains('dark');
                            e.currentTarget.style.background = isDark ? '#4b5563' : '#e5e7eb';
                          }}
                          onMouseLeave={(e) => {
                            const isDark = document.documentElement.classList.contains('dark');
                            e.currentTarget.style.background = isDark ? '#374151' : '#f3f4f6';
                          }}
                        >
                          <CloudArrowUpIcon className="w-4 h-4 inline mr-1" />
                          {item.file ? 'Change' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFile(item.setter)}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, JPG, PNG (Max 5MB per file)</p>
              </div>

              {/* Submit Button */}
              {canSubmit && (
                <div className="flex justify-center pt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      width: '220px',
                      height: '52px',
                      borderRadius: '14px',
                      background: document.documentElement.classList.contains('dark') ? '#ffffff' : '#111827',
                      color: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
                      fontWeight: '600',
                      fontSize: '16px',
                      border: document.documentElement.classList.contains('dark') ? '1px solid #e5e7eb' : 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                      opacity: loading ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (loading) return;
                      const isDark = document.documentElement.classList.contains('dark');
                      e.currentTarget.style.background = isDark ? '#f3f4f6' : '#1f2937';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      if (loading) return;
                      const isDark = document.documentElement.classList.contains('dark');
                      e.currentTarget.style.background = isDark ? '#ffffff' : '#111827';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <CheckCircleIcon style={{ width: '20px', height: '20px' }} />
                    {loading ? 'Submitting...' : 'Submit KYC'}
                  </button>
                </div>
              )}

              {/* Disabled Message */}
              {isDisabled && kycStatus !== 'VERIFIED' && (
                <div className="text-center py-4">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    Your KYC is already submitted and pending review. You cannot edit the details.
                  </p>
                </div>
              )}

              {kycStatus === 'VERIFIED' && (
                <div className="text-center py-4">
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
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
              <div className="p-6 text-center">
                {/* Icon */}
                <div 
                  className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: popupType === 'success' 
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : popupType === 'error'
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                  }}
                >
                  {popupType === 'success' ? (
                    <CheckCircleIcon className="w-10 h-10 text-white" />
                  ) : popupType === 'error' ? (
                    <XCircleIcon className="w-10 h-10 text-white" />
                  ) : (
                    <ClockIcon className="w-10 h-10 text-white" />
                  )}
                </div>

                {/* Title */}
                <h3 
                  className="text-2xl font-bold mb-2"
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
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {popupMsg}
                </p>

                {/* OK Button */}
                <button
                  onClick={handlePopupOk}
                  style={{
                    width: '120px',
                    height: '44px',
                    borderRadius: '12px',
                    background: popupType === 'success' 
                      ? 'linear-gradient(135deg, #10b981, #059669)'
                      : popupType === 'error'
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'block',
                    margin: '0 auto',
                    transition: 'all 0.3s ease',
                    transform: 'scale(1)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
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
      `}</style>
    </IonPage>
  );
};

export default KYCRegistration;