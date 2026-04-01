import React, { useState, ChangeEvent } from 'react';
import { IonPage, IonContent, IonButton, IonLoading, IonToast } from '@ionic/react';
import { UserCircleIcon, PhoneIcon, MapPinIcon, IdentificationIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const KYCRegistration: React.FC = () => {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    idType: '',
    idNumber: '',
  });

  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePic(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdDoc(file);
    setIdPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.idType || !form.idNumber) {
      setToastMsg('Please fill all fields');
      return;
    }
    if (!profilePic || !idDoc) {
      setToastMsg('Please upload profile picture and ID document');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('phone', form.phone);
      formData.append('address', form.address);
      formData.append('idType', form.idType);
      formData.append('idNumber', form.idNumber);
      formData.append('profilePic', profilePic);
      formData.append('idDoc', idDoc);

      // Example POST request (replace with your API)
      const res = await fetch('https://your-api.com/kyc/register', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Registration failed');
      setToastMsg('KYC registration successful!');
      setForm({ fullName: '', phone: '', address: '', idType: '', idNumber: '' });
      setProfilePic(null);
      setProfilePreview(null);
      setIdDoc(null);
      setIdPreview(null);
    } catch (err: any) {
      console.error(err);
      setToastMsg(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="bg-black text-white pt-16">
        <div className="max-w-lg mx-auto p-6">
          <h1 className="text-3xl font-bold mb-4 text-center">KYC Registration</h1>
          <p className="text-gray-400 mb-6 text-center">Complete your profile to get verified</p>

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-32 h-32 rounded-full overflow-hidden border-2 border-white cursor-pointer"
              onClick={() => document.getElementById('profileUpload')?.click()}
            >
              {profilePreview ? (
                <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircleIcon className="w-full h-full text-gray-500" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              id="profileUpload"
              onChange={handleProfileChange}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <div className="flex items-center border rounded-lg overflow-hidden bg-gray-800">
                <UserCircleIcon className="w-6 h-6 text-gray-400 ml-2" />
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full p-2 bg-transparent outline-none placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <div className="flex items-center border rounded-lg overflow-hidden bg-gray-800">
                <PhoneIcon className="w-6 h-6 text-gray-400 ml-2" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full p-2 bg-transparent outline-none placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <div className="flex items-center border rounded-lg overflow-hidden bg-gray-800">
                <MapPinIcon className="w-6 h-6 text-gray-400 ml-2" />
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                  className="w-full p-2 bg-transparent outline-none placeholder-gray-400 resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ID Type</label>
              <div className="flex items-center border rounded-lg overflow-hidden bg-gray-800">
                <IdentificationIcon className="w-6 h-6 text-gray-400 ml-2" />
                <select
                  name="idType"
                  value={form.idType}
                  onChange={handleChange}
                  className="w-full p-2 bg-transparent outline-none text-white placeholder-gray-400"
                >
                  <option value="" disabled>Select ID Type</option>
                  <option value="passport">Passport</option>
                  <option value="driver_license">Driver License</option>
                  <option value="national_id">National ID</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ID Number</label>
              <div className="flex items-center border rounded-lg overflow-hidden bg-gray-800">
                <DocumentTextIcon className="w-6 h-6 text-gray-400 ml-2" />
                <input
                  type="text"
                  name="idNumber"
                  value={form.idNumber}
                  onChange={handleChange}
                  placeholder="Enter your ID number"
                  className="w-full p-2 bg-transparent outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* ID Document Upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Upload ID Document</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleIdChange}
                className="w-full text-gray-200"
              />
              {idPreview && <img src={idPreview} className="mt-2 w-32 h-32 object-cover" />}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-center">
            <IonButton onClick={handleSubmit}>Submit KYC</IonButton>
          </div>

          {/* Loading & Toast */}
          <IonLoading isOpen={loading} message="Submitting..." />
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

export default KYCRegistration;