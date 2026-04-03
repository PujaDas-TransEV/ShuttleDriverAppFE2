import React, { useState, useEffect, ChangeEvent } from 'react';
import { IonPage, IonContent, IonLoading } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import NavbarSidebar from '../pages/Navbar';
import { PencilIcon } from '@heroicons/react/24/outline';

const API_BASE = "https://be.shuttleapp.transev.site";

interface VehicleData {
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
   verification_requested_at?: string; // ✅ ADD
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

  const token = localStorage.getItem("access_token");
const [rearPreview, setRearPreview] = useState<string | null>(null);
const [rcPreview, setRcPreview] = useState<string | null>(null);
  // Fetch vehicle
  const fetchVehicle = async () => {
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
    } catch (err: any) {
      setMessageType('error');
      setServerMsg(err.message || "Error fetching vehicle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormVehicle({ ...formVehicle, [name]: value });
  };

  // const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'rear' | 'rc') => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   if (type === 'rear') setRearPhoto(file);
  //   else setRcFile(file);
  // };
const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'rear' | 'rc') => {
  const file = e.target.files?.[0];
  if (!file) return;

  const previewUrl = URL.createObjectURL(file);

  if (type === 'rear') {
    setRearPhoto(file);
    setRearPreview(previewUrl); // ✅ preview set
  } else {
    setRcFile(file);
    setRcPreview(previewUrl); // ✅ preview set
  }
};
  // Update Vehicle PATCH
 
const handleUpdate = async () => {
  setLoading(true);
  setServerMsg(null);

  try {
    // -------- PATCH UPDATE --------
    const fd = new FormData();
    fd.append("vehicle_name", formVehicle.vehicle_name);
    fd.append("vehicle_model", formVehicle.vehicle_model);
    fd.append("color", formVehicle.color);
    fd.append("seat_count", String(formVehicle.seat_count));
    fd.append("has_ac", formVehicle.has_ac);

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

    // ✅ ONLY submit if status is REJECTED or DRAFT
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

    // ✅ SUCCESS
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
 // Status text mapping
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

// Status color
const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-blue-100 text-blue-700";
    case "verified":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

// Date format
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString();
};
  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans">
        <div className="max-w-4xl mx-auto p-6 space-y-6 mt-10">
          <h1 className="text-4xl font-bold text-center mb-6 tracking-tight">Vehicle Details</h1>

          {serverMsg && (
            <div
              className={`p-3 rounded-lg text-center font-semibold shadow ${
                messageType === 'success'
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              }`}
            >
              {serverMsg}
            </div>
          )}

          {loading && <IonLoading isOpen={loading} message={"Loading..."} />}

          {!vehicleData ? (
            <p className="text-center text-gray-500 dark:text-gray-400 text-lg">Loading vehicle details...</p>
          ) : (
            <>
              {!isEditing ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Vehicle Info</h2>
                    {/* Only show Edit if REJECTED */}
                    {status === "REJECTED" && (
                      <button
                        style={{ backgroundColor: 'black', color: 'white', width: '140px', height: '45px' }}
                        className="flex items-center justify-center gap-2 rounded-xl shadow hover:scale-105 transition-transform font-medium"
                        onClick={() => setIsEditing(true)}
                      >
                        <PencilIcon className="w-5 h-5 inline" /> Edit
                      </button>
                    )}
                  </div>

                 
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
  <p><span className="font-semibold">Registration number:</span> {vehicleData.registration_number}</p>
  <p><span className="font-semibold">Vehicle Name:</span> {vehicleData.vehicle_name}</p>
  <p><span className="font-semibold">Model:</span> {vehicleData.vehicle_model}</p>
  <p><span className="font-semibold">Color:</span> {vehicleData.color}</p>
  <p><span className="font-semibold">Seats:</span> {vehicleData.seat_count}</p>
  <p><span className="font-semibold">AC:</span> {vehicleData.has_ac ? "Yes" : "No"}</p>

  {/* ✅ STATUS BADGE */}
  <p>
    <span className="font-semibold">Status:</span>{" "}
    <span
      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
        vehicleData.verification_status
      )}`}
    >
      {getDisplayStatus(vehicleData.verification_status)}
    </span>
  </p>
{status === "REJECTED" && vehicleData.rejection_reason && (
  <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 p-4 rounded-xl mt-4">
    <p className="font-semibold mb-1">❌ Rejection Reason:</p>
    <p className="text-sm">{vehicleData.rejection_reason}</p>
  </div>
)}
  {/* ✅ SUBMITTED TIME */}
  {vehicleData.verification_requested_at && (
    <p>
      <span className="font-semibold">Submitted At:</span>{" "}
      {formatDate(vehicleData.verification_requested_at)}
    </p>
  )}
</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {vehicleData.rear_photo_file_path && (
                      <div className="border rounded-xl overflow-hidden shadow">
                        <p className="text-center text-sm bg-gray-100 dark:bg-gray-700 py-1 font-medium">Rear Photo</p>
                        <img src={`${API_BASE}/${vehicleData.rear_photo_file_path}`} alt="Rear" className="w-full h-48 object-cover" />
                      </div>
                    )}
                    {vehicleData.rc_file_path && (
                      <div className="border rounded-xl overflow-hidden shadow">
                        <p className="text-center text-sm bg-gray-100 dark:bg-gray-700 py-1 font-medium">RC File</p>
                        <img src={`${API_BASE}/${vehicleData.rc_file_path}`} alt="RC" className="w-full h-48 object-cover" />
                      </div>
                    )}
                  </div>

              
                </div>
              ) : (
                // Edit Form
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl space-y-6">
                  <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-4">Edit Vehicle</h2>
                  {['vehicle_name','vehicle_model','color','seat_count'].map(field => (
                    <div key={field}>
                      <label className="block font-medium mb-1">{field.replace('_',' ').toUpperCase()}</label>
                      <input
                        type={field === 'seat_count' ? 'number' : 'text'}
                        name={field}
                        value={formVehicle[field]}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-xl shadow-inner dark:bg-gray-700 text-black dark:text-white"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block font-medium mb-1">Type</label>
                    <select
                      name="has_ac"
                      value={formVehicle.has_ac}
                      onChange={handleChange}
                      className="w-full p-3 border rounded-xl shadow-inner dark:bg-gray-700 text-black dark:text-white"
                    >
                      <option value="true">AC</option>
                      <option value="false">Non‑AC</option>
                    </select>
                  </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  
  {/* REAR PHOTO */}
  <div>
    <label className="block font-medium mb-1">Rear Photo</label>

    {/* ✅ NEW PREVIEW */}
    {rearPreview ? (
      <img
        src={rearPreview}
        className="w-32 h-32 object-cover rounded-lg mb-2 border"
      />
    ) : vehicleData?.rear_photo_file_path ? (
      <img
        src={`${API_BASE}/${vehicleData.rear_photo_file_path}`}
        className="w-32 h-32 object-cover rounded-lg mb-2 border"
      />
    ) : null}

    <input
      type="file"
      accept="image/*"
      onChange={e => handleFileChange(e, 'rear')}
    />
  </div>

  {/* RC FILE */}
  <div>
    <label className="block font-medium mb-1">RC File</label>

    {/* ✅ NEW PREVIEW */}
    {rcPreview ? (
      <img
        src={rcPreview}
        className="w-32 h-32 object-cover rounded-lg mb-2 border"
      />
    ) : vehicleData?.rc_file_path ? (
      <img
        src={`${API_BASE}/${vehicleData.rc_file_path}`}
        className="w-32 h-32 object-cover rounded-lg mb-2 border"
      />
    ) : null}

    <input
      type="file"
      accept="image/*,application/pdf"
      onChange={e => handleFileChange(e, 'rc')}
    />
  </div>

</div>
                  <div className="flex justify-center mt-4 gap-4">
                    <button
                      style={{ backgroundColor: 'black', color: 'white', width:'140px', height:'45px' }}
                      className="rounded-xl shadow hover:scale-105 transition-transform font-semibold"
                      onClick={handleUpdate}
                    >
                      💾 Save
                    </button>
                    <button
                      style={{ backgroundColor: 'gray', color: 'white', width:'140px', height:'45px' }}
                      className="rounded-xl shadow hover:scale-105 transition-transform font-semibold"
                      onClick={() => setIsEditing(false)}
                    >
                      ❌ Cancel
                    </button>
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

