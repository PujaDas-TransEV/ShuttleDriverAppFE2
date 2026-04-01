
import React, { useState } from 'react';
import { IonPage, IonContent, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import NavbarSidebar from '../pages/Navbar';
import { TruckIcon, PlusCircleIcon } from '@heroicons/react/24/outline';

interface Bus {
  id: number;
  name: string;
  busNumber: string;
  seats: number;
  type: 'AC' | 'Non-AC';
}

interface Trip {
  id: number;
  busId: number;
  from: string;
  to: string;
  time: string;
  bookedSeats: number;
}

const DriverDashboard: React.FC = () => {
  const history = useHistory();
  const [buses, setBuses] = useState<Bus[]>([
    { id: 1, name: 'City Express', busNumber: 'DHA-1234', seats: 40, type: 'AC' },
    { id: 2, name: 'Metro Shuttle', busNumber: 'DHA-5678', seats: 35, type: 'Non-AC' },
  ]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showAddTripForm, setShowAddTripForm] = useState(false);
  const [newTrip, setNewTrip] = useState({ busId: 0, from: '', to: '', time: '', bookedSeats: 0 });
  const [busFilter, setBusFilter] = useState<'All' | 'AC' | 'Non-AC'>('All');

  // Redirect to Vehicle Registration page
  const redirectToAddBus = () => history.push('/vehicle-registration');

  // Add new trip
  const handleAddTrip = () => {
    if (!newTrip.busId || !newTrip.from || !newTrip.to || !newTrip.time) {
      alert('Please fill all fields!');
      return;
    }
    const trip: Trip = { id: Date.now(), ...newTrip };
    setTrips([...trips, trip]);
    setNewTrip({ busId: 0, from: '', to: '', time: '', bookedSeats: 0 });
    setShowAddTripForm(false);
  };

  // Filtered buses based on type
  const filteredBuses = buses.filter(bus => busFilter === 'All' || bus.type === busFilter);

  return (
    <IonPage>
      <NavbarSidebar />

      <IonContent className="bg-white dark:bg-gray-900 text-black dark:text-white pt-16">
        <div className="max-w-6xl mx-auto p-6 space-y-10">

          {/* HEADER */}
          <div className="text-center mt-12">
            <h1 className="text-4xl font-bold mb-3">Driver Bus & Trip Management</h1>
            <p className="text-gray-500 dark:text-gray-300 text-lg">
              Manage your buses, schedule trips, and track bookings like a professional driver app.
            </p>
          </div>

          {/* Buses Section */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-xl">Your Buses</h2>
              <IonButton
                onClick={redirectToAddBus}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg shadow hover:scale-105 transition"
              >
                <PlusCircleIcon className="w-5 h-5" /> Add Bus
              </IonButton>
            </div>

            {/* Bus Filter Dropdown */}
            <div className="mb-4">
              <select
                value={busFilter}
                onChange={e => setBusFilter(e.target.value as 'All' | 'AC' | 'Non-AC')}
                className="w-48 p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white"
              >
                <option value="All">All Buses</option>
                <option value="AC">AC Buses</option>
                <option value="Non-AC">Non-AC Buses</option>
              </select>
            </div>

            {/* Bus List */}
            <div className="space-y-4">
              {filteredBuses.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No buses matching the selected filter.</p>
              ) : (
                filteredBuses.map(bus => (
                  <div key={bus.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow">
                    <div className="flex items-center gap-4">
                      <TruckIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                      <div>
                        <h3 className="font-semibold">{bus.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {bus.busNumber} • Seats: {bus.seats} • {bus.type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Trips Section */}
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-xl">Your Trips</h2>
              <IonButton
                onClick={() => setShowAddTripForm(!showAddTripForm)}
                className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg shadow hover:scale-105 transition"
              >
                <PlusCircleIcon className="w-5 h-5" /> Add Trip
              </IonButton>
            </div>

            {/* Add Trip Form */}
            {showAddTripForm && (
              <div className="space-y-3 p-5 bg-gray-200 dark:bg-gray-700 rounded-xl shadow">
                <select
                  value={newTrip.busId}
                  onChange={e => setNewTrip({ ...newTrip, busId: Number(e.target.value) })}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white"
                >
                  <option value={0}>Select Bus</option>
                  {buses.map(bus => (
                    <option key={bus.id} value={bus.id}>
                      {bus.name} ({bus.busNumber}) - {bus.type}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="From"
                  value={newTrip.from}
                  onChange={e => setNewTrip({ ...newTrip, from: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white"
                />

                <input
                  type="text"
                  placeholder="To"
                  value={newTrip.to}
                  onChange={e => setNewTrip({ ...newTrip, to: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white"
                />

                <input
                  type="time"
                  value={newTrip.time}
                  onChange={e => setNewTrip({ ...newTrip, time: e.target.value })}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent text-black dark:text-white"
                />

                <IonButton
                  onClick={handleAddTrip}
                  className="w-full bg-black dark:bg-white text-white dark:text-black mt-3 px-4 py-3 rounded-xl shadow hover:scale-105 transition"
                >
                  Save Trip
                </IonButton>
              </div>
            )}

            {/* Trip List */}
            <div className="space-y-4">
              {trips.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No trips scheduled yet.</p>
              ) : (
                trips.map(trip => {
                  const bus = buses.find(b => b.id === trip.busId);
                  return (
                    <div key={trip.id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-700 rounded-xl shadow">
                      <div className="flex items-center gap-4">
                        <TruckIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        <div>
                          <h3 className="font-semibold">{bus?.name} • {bus?.busNumber} ({bus?.type})</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {trip.from} → {trip.to} • {trip.time} • Booked: {trip.bookedSeats}/{bus?.seats}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default DriverDashboard;

