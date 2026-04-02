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
}

const DriverVehicle: React.FC = () => {
  const history = useHistory();
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formVehicle, setFormVehicle] = useState<any>({});
  const [rearPhoto, setRearPhoto] = useState<File | null>(null);
  const [rcFile, setRcFile] = useState<File | null>(null);

  const token = localStorage.getItem("access_token");

  // Fetch vehicle details
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
      setServerError(err.message || "Error fetching vehicle");
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'rear' | 'rc') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'rear') setRearPhoto(file);
    else setRcFile(file);
  };


const [messageType, setMessageType] = useState<'success' | 'error'>('error');

const handleUpdate = async () => {
  setLoading(true);
  setServerError(null);
  try {
    const fd = new FormData();
    fd.append("vehicle_name", formVehicle.vehicle_name);
    fd.append("vehicle_model", formVehicle.vehicle_model);
    fd.append("color", formVehicle.color);
    fd.append("seat_count", String(formVehicle.seat_count));
    fd.append("has_ac", formVehicle.has_ac);
    if (rearPhoto) fd.append("rear_photo", rearPhoto);
    if (rcFile) fd.append("rc_file", rcFile);

    const res = await fetch(`${API_BASE}/driver/vehicle/update`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || "Update failed");

    // Success
    setMessageType('success');
    setServerError("Vehicle updated successfully!");
    setIsEditing(false);

    // Fetch updated vehicle and redirect after short delay for user to see success
    await fetchVehicle();
    setTimeout(() => {
      history.push("/bus-and-trip-management");
    }, 1000); // 1 second delay
  } catch (err: any) {
    setMessageType('error');
    setServerError(err.message);
  } finally {
    setLoading(false);
  }
};

  const status = vehicleData?.verification_status?.toLowerCase();

  return (
    <IonPage>
      <NavbarSidebar />

      <IonContent className="bg-gray-50 dark:bg-gray-900 pt-16 text-gray-900 dark:text-white font-sans">
        <div className="max-w-4xl mx-auto p-6 space-y-6 mt-10">

          <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-6 tracking-tight">
            Vehicle Details
          </h1>

          {/* {serverError && (
            <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded-lg text-center font-semibold shadow">
              {serverError}
            </div>
          )} */}
          {serverError && (
  <div
    className={`p-3 rounded-lg text-center font-semibold shadow ${
      messageType === 'success'
        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
        : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
    }`}
  >
    {serverError}
  </div>
)}

          {loading && <IonLoading isOpen={loading} message={"Loading..."} />}

          {!vehicleData ? (
            <p className="text-center text-gray-500 dark:text-gray-400 text-lg">Loading vehicle details...</p>
          ) : (
            <>
              {!isEditing ? (
                // Vehicle Info Card
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl space-y-6 transition-all duration-300 hover:shadow-2xl">

                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Vehicle Info</h2>
                    {(status === "draft" || status === "pending" || status === "rejected") && (
                     
                      <button
  style={{ 
    backgroundColor: 'black', 
    color: 'white',
    width: '140px',     // button width
    height: '45px',     // button height
  }}
  className="flex items-center justify-center gap-2 rounded-xl shadow hover:scale-105 transition-transform font-medium"
  onClick={() => setIsEditing(true)}
>
  <PencilIcon className="w-5 h-5 inline" /> Edit
</button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700 dark:text-gray-300">
                    <p><span className="font-semibold">Registration:</span> {vehicleData.registration_number}</p>
                    <p><span className="font-semibold">Vehicle Name:</span> {vehicleData.vehicle_name}</p>
                    <p><span className="font-semibold">Model:</span> {vehicleData.vehicle_model}</p>
                    <p><span className="font-semibold">Color:</span> {vehicleData.color}</p>
                    <p><span className="font-semibold">Seats:</span> {vehicleData.seat_count}</p>
                    <p><span className="font-semibold">AC:</span> {vehicleData.has_ac ? "Yes" : "No"}</p>
                    <p><span className="font-semibold">Status:</span> {vehicleData.verification_status}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {vehicleData.rear_photo_file_path && (
                      <div className="border rounded-xl overflow-hidden shadow hover:shadow-2xl transition duration-300">
                        <p className="text-center text-sm bg-gray-100 dark:bg-gray-700 py-1 font-medium">Rear Photo</p>
                        <img
                          src={`${API_BASE}/${vehicleData.rear_photo_file_path}`}
                          alt="Rear"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    {vehicleData.rc_file_path && (
                      <div className="border rounded-xl overflow-hidden shadow hover:shadow-2xl transition duration-300">
                        <p className="text-center text-sm bg-gray-100 dark:bg-gray-700 py-1 font-medium">RC File</p>
                        <img
                          src={`${API_BASE}/${vehicleData.rc_file_path}`}
                          alt="RC"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Edit Form Card
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl space-y-6 transition-all duration-300 hover:shadow-2xl">

                  <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-4">Edit Vehicle</h2>

                  {[
                    { label: 'Registration Number', name: 'registration_number', type: 'text', readOnly: true },
                    { label: 'Vehicle Name', name: 'vehicle_name', type: 'text' },
                    { label: 'Vehicle Model', name: 'vehicle_model', type: 'text' },
                    { label: 'Color', name: 'color', type: 'text' },
                    { label: 'Seats', name: 'seat_count', type: 'number' },
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block font-medium mb-1 text-gray-900 dark:text-white">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={formVehicle[field.name]}
                        onChange={handleChange}
                        readOnly={field.readOnly || false}
                        className={`w-full p-3 border rounded-xl shadow-inner dark:bg-gray-700 text-black dark:text-white ${field.readOnly ? "bg-gray-200 dark:bg-gray-600 cursor-not-allowed" : ""}`}
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block font-medium mb-1 text-gray-900 dark:text-white">Type</label>
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
                    <div>
                      <label className="block font-medium mb-1 text-gray-900 dark:text-white">Rear Photo</label>
                      {vehicleData.rear_photo_file_path && !rearPhoto && (
                        <img
                          src={`${API_BASE}/${vehicleData.rear_photo_file_path}`}
                          alt="Rear"
                          className="w-32 h-32 object-cover rounded-lg mb-2 border shadow-sm"
                        />
                      )}
                      <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'rear')} />
                    </div>

                    <div>
                      <label className="block font-medium mb-1 text-gray-900 dark:text-white">RC File</label>
                      {vehicleData.rc_file_path && !rcFile && (
                        <img
                          src={`${API_BASE}/${vehicleData.rc_file_path}`}
                          alt="RC"
                          className="w-32 h-32 object-cover rounded-lg mb-2 border shadow-sm"
                        />
                      )}
                      <input type="file" accept="image/*,application/pdf" onChange={e => handleFileChange(e, 'rc')} />
                    </div>
                  </div>

                  <div className="flex justify-center mt-4">
                    <button
                      style={{ backgroundColor: 'black', color: 'white', 
    width: '140px',     // button width
    height: '45px',     // button height
  }} 
                      className="px-6 py-3 rounded-xl shadow hover:scale-105 transition-transform font-semibold"
                      onClick={handleUpdate}
                    >
                      💾 Save Changes
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