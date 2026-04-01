import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import NavbarSidebar from '../../users/pages/Navbar';
import { TruckIcon, CurrencyRupeeIcon, UsersIcon, ClockIcon } from '@heroicons/react/24/outline';

interface Bus {
  id: number;
  name: string;
  type: 'AC' | 'Non-AC';
  trips: number;
  passengers: number;
  revenue: number; // in ₹
  paymentsCollected: number; // in ₹
  paymentsPending: number; // in ₹
}

const RevenuePaymentsDashboard: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [isDark, setIsDark] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    // Dark mode listener
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    // Fetch bus data (example static data, replace with API)
    setBuses([
      { id: 1, name: 'City Shuttle 1', type: 'AC', trips: 5, passengers: 48, revenue: 12500, paymentsCollected: 10000, paymentsPending: 2500 },
      { id: 2, name: 'City Shuttle 2', type: 'Non-AC', trips: 3, passengers: 32, revenue: 8000, paymentsCollected: 6000, paymentsPending: 2000 },
      { id: 3, name: 'City Shuttle 3', type: 'AC', trips: 6, passengers: 60, revenue: 15000, paymentsCollected: 12000, paymentsPending: 3000 },
    ]);
  }, []);

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent className={`${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'} pt-16`}>
        <div className="p-5">

          {/* Header */}
          <div className="mb-6 mt-20">
            <h1 className="text-3xl font-bold">Revenue & Payments</h1>
            <p className="text-gray-500 dark:text-gray-400">View each bus’s earnings, trips, and payment status</p>
          </div>

          {/* Bus Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {buses.map(bus => (
              <div
                key={bus.id}
                className={`p-4 rounded-xl shadow-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'} transition hover:scale-105`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h2 className="font-semibold text-lg">{bus.name}</h2>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bus.type === 'AC' ? 'bg-blue-600 text-white' : 'bg-gray-500 text-white'}`}>
                      {bus.type}
                    </span>
                  </div>
                  <TruckIcon className="w-8 h-8 text-green-400" />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-xl flex flex-col items-center">
                    <CurrencyRupeeIcon className="w-5 h-5 text-green-400 mb-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Revenue</span>
                    <span className="font-bold text-lg">₹{bus.revenue}</span>
                  </div>
                  <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-xl flex flex-col items-center">
                    <UsersIcon className="w-5 h-5 text-purple-400 mb-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Passengers</span>
                    <span className="font-bold text-lg">{bus.passengers}</span>
                  </div>
                  <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-xl flex flex-col items-center">
                    <CurrencyRupeeIcon className="w-5 h-5 text-green-600 mb-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Collected</span>
                    <span className="font-bold text-lg">₹{bus.paymentsCollected}</span>
                  </div>
                  <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-xl flex flex-col items-center">
                    <CurrencyRupeeIcon className="w-5 h-5 text-red-500 mb-1" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Pending</span>
                    <span className="font-bold text-lg">₹{bus.paymentsPending}</span>
                  </div>
                </div>

                {/* Trips */}
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Trips</div>
                  <ClockIcon className="w-5 h-5 text-orange-400" />
                  <div className="font-bold">{bus.trips}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default RevenuePaymentsDashboard;