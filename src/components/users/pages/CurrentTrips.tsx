import React, { useEffect, useState } from "react";
import { IonPage, IonContent, IonLoading } from "@ionic/react";
import NavbarSidebar from "./Navbar";
import { QrCodeIcon } from "@heroicons/react/24/outline";

const API_BASE = "https://be.shuttleapp.transev.site";

interface Stop {
  sequence: number;
  stop_id: string;
  stop_name: string;
  planned_arrival_time: string;
  actual_arrival_time?: string | null;
  actual_departure_time?: string | null;
}

interface Trip {
  trip_id: string;
  status: string;
  planned_start: string;
  planned_end: string;
  actual_start?: string | null;
  actual_end?: string | null;
  stops: Stop[];
}

const CurrentTrip: React.FC = () => {
  const token = localStorage.getItem("access_token");
  const [loading, setLoading] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [isDark, setIsDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Fetch current trip
  const fetchCurrentTrip = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/driver/trips/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.trips && data.trips.length > 0) {
        const inProgress = data.trips.find((t: Trip) => t.status === "in-progress");
        if (inProgress) setCurrentTrip(inProgress);
      }
    } catch (err: any) {
      alert(err.message || "Failed to fetch current trip");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentTrip();
  }, []);

  // Stop action API
  const handleStopAction = async (stop_id: string, mode: "arrive" | "depart") => {
    if (!currentTrip || !token) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("stop_id", stop_id);
      formData.append("mode", mode);

      const res = await fetch(`${API_BASE}/driver/trips/${currentTrip.trip_id}/stop-action`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update stop action");
      // Refresh current trip data
      fetchCurrentTrip();
    } catch (err: any) {
      alert(err.message || "Error sending stop action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <NavbarSidebar />
      <IonContent
        style={{
          backgroundColor: isDark ? "#0f172a" : "#f4f4f5",
          paddingTop: "64px",
          color: isDark ? "#fff" : "#000",
        }}
      >
        <IonLoading isOpen={loading} message="Loading..." />
        <div className="p-5 max-w-lg mx-auto">
          {currentTrip ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6">
              {/* Trip Header */}
              <p className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-1">
                Trip ID: {currentTrip.trip_id}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Start: {currentTrip.planned_start} | Status: {currentTrip.status.toUpperCase()}
              </p>

              {/* QR Scanner */}
              <div className="flex flex-col items-center justify-center border-4 border-dashed border-indigo-400 dark:border-indigo-300 rounded-xl p-12 bg-indigo-50 dark:bg-indigo-900 mb-6">
                <QrCodeIcon className="w-16 h-16 text-indigo-500 dark:text-indigo-200 mb-3" />
                <p className="text-center text-indigo-700 dark:text-indigo-200 font-semibold">
                  Scan Passenger QR Here
                </p>
              </div>

              {/* Stops */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">
                  Stops
                </h3>
                {currentTrip.stops.map((stop) => (
                  <div
                    key={stop.stop_id}
                    className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-3 shadow-sm"
                  >
                    <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                      {stop.sequence}. {stop.stop_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                      Planned Arrival: {stop.planned_arrival_time}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                      Actual Arrival: {stop.actual_arrival_time || "-"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
                      Actual Departure: {stop.actual_departure_time || "-"}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => handleStopAction(stop.stop_id, "arrive")}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold"
                      >
                        Arrival
                      </button>
                      <button
                        onClick={() => handleStopAction(stop.stop_id, "depart")}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold"
                      >
                        Departure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-300">
              No active trips currently.
            </p>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CurrentTrip;