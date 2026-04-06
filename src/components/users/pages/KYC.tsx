import React, { useState, useEffect, ChangeEvent } from 'react';
import { IonPage, IonContent, IonButton, IonLoading, IonToast } from '@ionic/react';
import NavbarSidebar from '../pages/Navbar';
import {
  UserCircleIcon,
  PhoneIcon,
  IdentificationIcon,
  DocumentTextIcon,
  BanknotesIcon,
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
const [redirectOnOk, setRedirectOnOk] = useState(false);
  const token = localStorage.getItem('access_token');

  // FETCH KYC STATUS
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/driver/kyc/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
// Handle "Driver profile not found"
    if (res.status === 404 || data.detail === "Driver profile not found") {
      setPopupMsg("Driver profile not found. Please set up your profile first.");
      setRedirectOnOk(true); // redirect when user clicks OK
      return;
    }
      const status = data.status.toUpperCase(); // normalize status
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (setter: any) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.files?.[0] || null);
  };

  // UPLOAD DOCUMENTS
  const uploadDocs = async () => {
    const fd = new FormData();

    if (aadhaarFile) fd.append('aadhaar_card', aadhaarFile);
    if (panFile) fd.append('pan', panFile);
    if (dlFile) fd.append('driving_license', dlFile);
    if (passbookFile) fd.append('passbook_file', passbookFile);

    fd.append('aadhaar_number', form.aadhaar_number);
    fd.append('pan_number', form.pan_number);
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

  // SUBMIT KYC
  // const submitKyc = async () => {
  //   const res = await fetch(`${API_BASE}/driver/kyc/submit`, {
  //     method: 'POST',
  //     headers: { Authorization: `Bearer ${token}` },
  //   });

  //   if (!res.ok) throw new Error("Submit failed");
  // };

  // const handleSubmit = async () => {
  //   setLoading(true);
  //   try {
  //     await uploadDocs();
  //     await submitKyc();
  //     setToastMsg("KYC Submitted ✅");
  //     fetchStatus();
  //   } catch (e: any) {
  //     setToastMsg(e.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const submitKyc = async () => {
  const res = await fetch(`${API_BASE}/driver/kyc/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  // Handle driver profile not found
  if (res.status === 404 || data.detail === "Driver profile not found") {
    throw new Error("Driver profile not found. Please complete your profile first.");
  }

  if (!res.ok) {
    throw new Error(data.message || "Submit failed");
  }

  return data;
};

const handleSubmit = async () => {
  setLoading(true);
  try {
    // Upload documents first
    await uploadDocs();

    // Submit KYC
    await submitKyc();

    // Success
    setPopupMsg("KYC Submitted ✅");
    setRedirectOnOk(false); // no redirect needed
    fetchStatus();

  } catch (e: any) {
    console.error(e);
    // Show error in popup instead of toast
    setPopupMsg(e.message || "Error submitting KYC");
    setRedirectOnOk(true); // redirect if profile setup required
  } finally {
    setLoading(false);
  }
};
const handlePopupOk = () => {
  setPopupMsg('');
  if (redirectOnOk) {
    window.location.href = '/profile-setup'; // redirect to profile setup page
  }
};
  const isDisabled = kycStatus === 'PENDING' || kycStatus === 'VERIFIED';
  const canSubmit = kycStatus === 'DRAFT' || kycStatus === 'REJECTED';

  const statusColor =
    kycStatus === 'VERIFIED' ? 'text-green-500' :
    kycStatus === 'REJECTED' ? 'text-red-500' :
    'text-yellow-500';

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-3xl mx-auto p-6 mt-10 space-y-6">
          <h1 className="text-3xl font-bold text-center">KYC Registration</h1>

          <p className="text-center">
            Status: <span className={`font-bold ${statusColor}`}>{kycStatus}</span>
          </p>

          {kycStatus === 'REJECTED' && (
            <p className="text-center text-red-500 text-sm">
              Reason: {rejectionReason}
            </p>
          )}

          {/* FORM */}
          <div className="space-y-4">

         
  <div className="space-y-4">
  <label className="text-gray-600 mb-1 font-medium">
    Full Name
    <span className="text-sm text-gray-500 ml-2">(As per Aadhaar card)</span>
  </label>
  <div className="flex items-center border border-gray-300 rounded-lg p-2 bg-white">
    <UserCircleIcon className="icon mr-2" />
    {/* <input 
      value={form.fullName} 
      disabled placeholder="Full Name"
      className="flex-1 outline-none bg-transparent" 
    /> */}
      <input
  value={form.fullName}
  name="fullName"
  onChange={handleChange}
  placeholder="Full Name"
  className="flex-1 outline-none bg-transparent"
/>
  </div>
</div>


            <label className="text-gray-600 mb-1 font-medium">Phone Number</label>
            <div className="inputBox">
              <PhoneIcon className="icon" />
         

<input
  value={form.phone}
  name="phone"
  onChange={handleChange}
  placeholder="Phone Number"
  className="flex-1 outline-none bg-transparent"
/>
            </div>

            <label className="text-gray-600 mb-1 font-medium">Aadhaar Number</label>
            <div className="inputBox">
              <IdentificationIcon className="icon" />
              <input
                name="aadhaar_number"
                value={form.aadhaar_number}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="Aadhaar Number"
              />
            </div>

            <label className="text-gray-600 mb-1 font-medium">PAN Number</label>
            <div className="inputBox">
              <DocumentTextIcon className="icon" />
              <input
                name="pan_number"
                value={form.pan_number}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="PAN Number"
              />
            </div>

            <label className="text-gray-600 mb-1 font-medium">Driving License Number</label>
            <div className="inputBox">
              <IdentificationIcon className="icon" />
              <input
                name="driving_license_number"
                value={form.driving_license_number}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="Driving License"
              />
            </div>

            <label className="text-gray-600 mb-1 font-medium">Bank Account Number</label>
            <div className="inputBox">
              <BanknotesIcon className="icon" />
              <input
                name="bank_account_number"
                value={form.bank_account_number}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="Bank Account"
              />
            </div>

            <label className="text-gray-600 mb-1 font-medium">IFSC Code</label>
            <div className="inputBox">
              <BanknotesIcon className="icon" />
              <input
                name="ifsc_code"
                value={form.ifsc_code}
                onChange={handleChange}
                disabled={isDisabled}
                placeholder="IFSC Code"
              />
            </div>
          </div>

          {/* FILE UPLOADS */}
          <div className="space-y-6 mt-6">
            {[
              { label: 'Aadhaar Document', file: aadhaarFile, setter: setAadhaarFile, url: form.aadhaar_file_url },
              { label: 'PAN Document', file: panFile, setter: setPanFile, url: form.pan_file_url },
              { label: 'Driving License', file: dlFile, setter: setDlFile, url: form.dl_file_url },
              { label: 'Passbook / Bank Document', file: passbookFile, setter: setPassbookFile, url: form.passbook_file_url },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between border border-gray-600 rounded-lg p-3 bg-black text-white">
                <span className="font-medium">{item.label}</span>
                <div className="flex items-center space-x-4">
                  {item.url && !item.file && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-300 underline">
                      View
                    </a>
                  )}
                  {item.file && <span className="text-gray-300">{item.file.name}</span>}
                  {!isDisabled && (
                    <label className="cursor-pointer px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition">
                      {item.file ? 'Change' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => item.setter(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>

         {/* SUBMIT BUTTON */}
{canSubmit && (
  <div className="flex justify-center mt-4">
    <IonButton onClick={handleSubmit}>
      Submit KYC
    </IonButton>
  </div>
)}
          <IonLoading isOpen={loading} message="Processing..." />
          <IonToast isOpen={!!toastMsg} message={toastMsg} duration={2000} onDidDismiss={() => setToastMsg('')} />
        </div>

        <style>{`
          .inputBox {
            display:flex;
            align-items:center;
            border:1px solid #ccc;
            border-radius:10px;
            padding:8px;
            background:white;
          }
          .icon {
            width:20px;
            margin-right:8px;
            color:gray;
          }
          input {
            width:100%;
            outline:none;
            background:transparent;
          }
        `}</style>
     {/* Popup Modal */}
{popupMsg && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-xl text-center border border-gray-200 dark:border-gray-700">
      {/* Message */}
      <p className="text-gray-900 dark:text-white text-lg font-semibold mb-6">{popupMsg}</p>

      {/* OK Button */}
      {/* <button
  className="bg-linear-to-r from-gray-900 to-black text-white px-6 py-2 rounded-xl shadow-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 transform hover:scale-105 mx-auto block"
  onClick={handlePopupOk}
>
  OK
</button> */}
<button
  onClick={handlePopupOk}
  style={{
    background: 'linear-gradient(to right, #1f2937, #000000)', // gradient
    color: '#ffffff',
    padding: '8px 24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    border: 'none',
    cursor: 'pointer',
    display: 'block',
    margin: '0 auto',
    transition: 'all 0.3s ease',
    transform: 'scale(1)',
  }}
  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
>
  OK
</button>
    </div>
  </div>
)}
      </IonContent>
    </IonPage>
  );
};

export default KYCRegistration;

