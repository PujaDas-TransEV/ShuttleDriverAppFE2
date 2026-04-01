import React, { useEffect, useState } from "react";
import { IonPage, IonContent } from "@ionic/react";
import NavbarSidebar from "../pages/Navbar";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Smoothly pan map to driver position
const LiveLocationUpdater = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
};

// Approximate ETA calculation in minutes (avg speed 40 km/h)
const calculateETA = (driver: [number, number], passenger: [number, number]) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(passenger[0] - driver[0]);
  const dLon = toRad(passenger[1] - driver[1]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(driver[0])) *
      Math.cos(toRad(passenger[0])) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // km
  const avgSpeed = 40; // km/h
  const eta = (distance / avgSpeed) * 60; // minutes
  return Math.ceil(eta);
};

const DriverLiveTracking: React.FC = () => {
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);

  // Example passenger location (replace with real data)
  const passengerPos: [number, number] = [23.8103, 90.4125]; // Dhaka

  useEffect(() => {
    if (navigator.geolocation) {
      const updatePosition = () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setDriverPos([pos.coords.latitude, pos.coords.longitude]);
          },
          (err) => console.error("GPS error:", err),
          { enableHighAccuracy: true }
        );
      };

      updatePosition(); // initial fetch
      const interval = setInterval(updatePosition, 120000); // every 2 minutes
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <IonPage>
      <NavbarSidebar />

      <IonContent className="bg-white dark:bg-gray-900 text-black dark:text-white pt-16 overflow-y-auto">
        {/* Header */}
        <div className="text-center pb-6 mt-20">
          <h1 className="text-3xl md:text-4xl font-bold mb-1 text-gray-900 dark:text-white">
            Live Driver Tracking
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">
            Track your vehicle and see passenger pickup location
          </p>
        </div>

        {/* Map Container */}
        <div className="w-full h-[450px] md:h-[600px] rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 shadow-lg">
          {driverPos ? (
            <MapContainer
              center={driverPos}
              zoom={15}
              style={{ width: "100%", height: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              />

              {/* Smooth panning */}
              <LiveLocationUpdater position={driverPos} />

              {/* Driver marker */}
              <Marker position={driverPos}>
                <Popup className="text-sm md:text-base font-medium">
                  <div className="text-black dark:text-white">
                    <p>🚗 Driver Location</p>
                    <p>ETA to passenger: {calculateETA(driverPos, passengerPos)} min</p>
                  </div>
                </Popup>
              </Marker>

              {/* Passenger marker */}
              <Marker position={passengerPos}>
                <Popup className="text-sm md:text-base font-medium">
                  <div className="text-black dark:text-white">
                    <p>📍 Passenger Pickup</p>
                    <p>Waiting here</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400 text-lg">
              Getting your location...
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-4 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
            Driver location updates every 2 minutes
          </p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DriverLiveTracking;