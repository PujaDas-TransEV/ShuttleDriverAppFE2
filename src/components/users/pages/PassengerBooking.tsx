

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Bars3Icon,
  BellIcon,
 CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import NavbarSidebar from './Navbar';
import { IonPage } from '@ionic/react';

interface Bus {
  id: number;
  name: string;
  busNumber: string;
  seats: number;
}

interface Trip {
  id: number;
  busId: number;
  from: string;
  to: string;
  time: string;
  fare: number;
}

interface Booking {
  id: number;
  tripId: number;
  passengerName: string;
  seats: number[];
  status: 'pending' | 'accepted' | 'rejected';
  fare?: number;
}

const DriverBookingDashboard: React.FC = () => {
  const history = useHistory();
  const [buses] = useState<Bus[]>([
    { id: 1, name: 'City Shuttle', busNumber: 'AB-1234', seats: 12 },
  ]);

  const [trips] = useState<Trip[]>([
    { id: 1, busId: 1, from: 'Downtown', to: 'Airport', time: '08:30', fare: 150 },
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    { id: 1, tripId: 1, passengerName: 'John Doe', seats: [1, 2], status: 'pending', fare: 300 },
    { id: 2, tripId: 1, passengerName: 'Jane Smith', seats: [3], status: 'pending', fare: 150 },
  ]);

  const handleBooking = (id: number, action: 'accept' | 'reject') => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: action === 'accept' ? 'accepted' : 'rejected' } : b))
    );
  };

  const renderSeats = (tripId: number, totalSeats: number) => {
    const bookedSeats = bookings
      .filter(b => b.tripId === tripId && b.status === 'accepted')
      .flatMap(b => b.seats);

    const seatsArray = Array.from({ length: totalSeats }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-4 gap-3 mt-2">
        {seatsArray.map(seat => (
          <div
            key={seat}
            className={`flex items-center justify-center h-16 w-16 rounded-xl shadow-md cursor-pointer transition-transform duration-200 transform hover:scale-105
              ${bookedSeats.includes(seat) ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white'}
            `}
          >
            {seat}
          </div>
        ))}
      </div>
    );
  };

  return (
    <IonPage>
      <NavbarSidebar />

      {/* MAIN SCROLLABLE CONTENT */}
      <div className="flex-1 min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white pt-16 px-6 md:px-10 overflow-y-auto">
        {/* TOP NAVBAR */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-black z-40 flex items-center justify-between px-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <button>
              <Bars3Icon className="w-6 h-6 text-white" />
            </button>
            <span className="font-bold text-white text-xl">Shuttle Driver</span>
          </div>
          <div className="flex items-center space-x-4">
            <BellIcon className="w-6 h-6 text-white relative" />
          </div>
        </div>

        {/* HEADER */}
        <div className="mt-10 text-center">
          <h1 className="text-3xl font-bold mb-2">Passenger Bookings & Seat Map</h1>
          <p className="text-gray-500 dark:text-gray-300">Manage trips, accept bookings, and view booked seats</p>
        </div>

        {/* TRIPS & BOOKINGS */}
        <div className="space-y-8 mt-8 pb-10">
          {trips.map(trip => {
            const bus = buses.find(b => b.id === trip.busId);
            const tripBookings = bookings.filter(b => b.tripId === trip.id);

            return (
              <div key={trip.id} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-xl space-y-5">
                {/* Trip Info */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-lg">{bus?.name} ({bus?.busNumber})</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{trip.from} → {trip.to} | {trip.time} | Fare per seat: ₹{trip.fare}</p>
                  </div>
                </div>

                {/* Seat Map */}
                <div>
                  <h3 className="font-semibold mb-2">Seats</h3>
                  {bus && renderSeats(trip.id, bus.seats)}
                </div>

                {/* Booking Requests */}
                <div className="space-y-3 mt-4">
                  <h3 className="font-semibold">Passenger Requests</h3>
                  {tripBookings.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No bookings yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {tripBookings.map(b => (
                        <div key={b.id} className="p-4 bg-white dark:bg-gray-700 rounded-2xl shadow flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                          <div>
                            <p className="font-medium text-lg">{b.passengerName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Seats: {b.seats.join(', ')} | Fare: ₹{b.fare} | Status: 
                              <span className={
                                b.status === 'accepted' ? 'text-green-500 font-semibold ml-1' : 
                                b.status === 'rejected' ? 'text-red-500 font-semibold ml-1' : 
                                'text-yellow-500 font-semibold ml-1'
                              }>
                                {b.status}
                              </span>
                            </p>
                          </div>

                          {b.status === 'pending' && (
                            <div className="flex gap-4 mt-2 md:mt-0">
                              {/* Accept Button */}
                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
  {/* Accept Button */}
  <button
    onClick={() => handleBooking(b.id, 'accept')}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      minWidth: '120px',
      padding: '12px 24px',
      borderRadius: '9999px',
      backgroundColor: '#22c55e', // green
      color: '#ffffff',
      fontWeight: 600,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    }}
    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#22c55e')}
  >
    <CheckIcon style={{ width: '24px', height: '24px' }} />
    Accept
  </button>

  {/* Reject Button */}
  <button
    onClick={() => handleBooking(b.id, 'reject')}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      minWidth: '120px',
      padding: '12px 24px',
      borderRadius: '9999px',
      backgroundColor: '#ef4444', // red
      color: '#ffffff',
      fontWeight: 600,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    }}
    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#dc2626')}
    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ef4444')}
  >
    <XMarkIcon style={{ width: '24px', height: '24px' }} />
    Reject
  </button>
</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </IonPage>
  );
};

export default DriverBookingDashboard;

