// import React, { useState, useEffect, useRef } from 'react';
// import {
//   FaQrcode,
//   FaCheckCircle,
//   FaExclamationTriangle,
//   FaTimes,
//   FaSpinner,
// } from 'react-icons/fa';
// import {
//   BrowserMultiFormatReader,
//   NotFoundException,
//   DecodeHintType,
//   BarcodeFormat,
// } from '@zxing/library';
 
// interface QRScannerComponentProps {
//   onClose: () => void;
//   onScanSuccess?: (data: any) => void;
//   tripId?: string;
//   token?: string;
// }
 
// const QRScannerComponent: React.FC<QRScannerComponentProps> = ({
//   onClose,
//   onScanSuccess,
//   tripId,
//   token,
// }) => {
//   const [scannedData, setScannedData] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [cameraStarted, setCameraStarted] = useState(false);
 
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const readerRef = useRef<BrowserMultiFormatReader | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);
//   const scanningRef = useRef(true);
 
//   // 📍 Location
//   const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
//     return new Promise((resolve) => {
//       navigator.geolocation.getCurrentPosition(
//         (pos) =>
//           resolve({
//             lat: pos.coords.latitude,
//             lng: pos.coords.longitude,
//           }),
//         () => resolve({ lat: 0, lng: 0 }),
//         { enableHighAccuracy: true }
//       );
//     });
//   };
//   const [scanType, setScanType] = useState<"board" | "drop">("board");
//   // 🔁 Process Scan
//   const processScan = async (qrToken: string) => {
//     if (!tripId || !token || isProcessing) return;
 
//     setIsProcessing(true);
//     stopScanner();
 
//     try {
//       const { lat, lng } = await getCurrentLocation();
 
//       const res = await fetch(
//         `https://be.shuttleapp.transev.site/driver/scan/${tripId}/scan`,
//         {
//           method: 'POST',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             qr_token: qrToken,
//             lat,
//             lng,
//             scan_type: scanType, // ✅ REQUIRED
//           }),
//         }
//       );
 
//       const data = await res.json();
 
//       if (!res.ok) throw new Error(data.detail || 'Scan failed');
 
//       setScannedData(data);
//       onScanSuccess?.(data);
 
//       setTimeout(() => onClose(), 2500);
//     } catch (err: any) {
//       setError(
//         typeof err.message === "string"
//           ? err.message
//           : JSON.stringify(err.message)
//       );
//       setIsProcessing(false);
 
//       setTimeout(() => {
//         setError(null);
//         startScanner();
//       }, 2000);
//     }
//   };
 
//   const startScanner = async () => {
//     try {
//       // 🔥 IMPORTANT: STOP PREVIOUS FIRST
//       stopScanner();
 
//       if (!videoRef.current) return;
 
//       scanningRef.current = true;
 
//       const hints = new Map();
//       hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
 
//       const reader = new BrowserMultiFormatReader(hints);
//       readerRef.current = reader;
 
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: { ideal: "environment" }, // ✅ FIXED FOR iOS
//           width: { ideal: 640 },
//           height: { ideal: 480 },
//         },
//       });
 
//       streamRef.current = stream;
//       videoRef.current.srcObject = stream;
 
//       await videoRef.current.play();
 
//       setCameraStarted(true);
 
//       // ✅ START SCAN LOOP
//       const scanLoop = async () => {
//         if (!scanningRef.current || !videoRef.current || !readerRef.current) return;
 
//         try {
//           const result = await readerRef.current.decodeFromVideoElement(
//             videoRef.current
//           );
 
//           if (result && !isProcessing) {
//             processScan(result.getText());
//             return;
//           }
//         } catch (err) {
//           if (!(err instanceof NotFoundException)) {
//             console.error(err);
//           }
//         }
 
//         requestAnimationFrame(scanLoop);
//       };
 
//       scanLoop();
 
//     } catch (err: any) {
//       console.error(err);
 
//       // 🔥 iOS specific fallback message
//       if (err.name === "AbortError") {
//         setError("Camera interrupted. Please retry.");
//       } else if (err.name === "NotAllowedError") {
//         setError("Camera permission denied.");
//       } else {
//         setError("Camera error: " + err.message);
//       }
//     }
//   };
 
//   const stopScanner = () => {
//     scanningRef.current = false;
 
//     if (readerRef.current) {
//       readerRef.current.reset();
//       readerRef.current = null;
//     }
 
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
 
//     if (videoRef.current) {
//       videoRef.current.pause();
//       videoRef.current.srcObject = null;
//     }
 
//     setCameraStarted(false);
//   };
//   useEffect(() => {
//     startScanner();
//     return () => stopScanner();
//   }, []);
 
//   const retryScanner = async () => {
//     setError(null);
//     setScannedData(null);
//     setIsProcessing(false);
 
//     stopScanner();
 
//     // ⏳ small delay for iOS (VERY IMPORTANT)
//     setTimeout(() => {
//       startScanner();
//     }, 500);
//   };
 
//   return (
//     <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-9999 p-4">
//       <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
//         <div className="bg-blue-600 text-white p-4 flex justify-between">
//           <div className="flex items-center gap-2">
//             <FaQrcode />
//             <span>Scan QR</span>
//           </div>
//           <button
//             onClick={() => {
//               stopScanner();
//               onClose();
//             }}
//           >
//             <FaTimes />
//           </button>
//         </div>
 
//         <div className="p-4">
//           {error && (
//             <div className="text-red-500 mb-3">
//               {error}
//               <button onClick={retryScanner}>Retry</button>
//             </div>
//           )}
 
//           {/* ✅ ADD HERE */}
//           <div className="flex gap-2 mb-3">
//             <button
//               onClick={() => setScanType("board")}
//               className={`flex-1 p-2 rounded ${scanType === "board" ? "bg-green-600 text-white" : "bg-gray-200"
//                 }`}
//             >
//               Boarding
//             </button>
 
//             <button
//               onClick={() => setScanType("drop")}
//               className={`flex-1 p-2 rounded ${scanType === "drop" ? "bg-blue-600 text-white" : "bg-gray-200"
//                 }`}
//             >
//               Drop
//             </button>
//           </div>
 
//           {/* 👇 existing scanner */}
//           <div className="relative bg-black rounded-xl h-[300px] overflow-hidden">
//             <video
//               ref={videoRef}
//               autoPlay
//               playsInline
//               muted
//               className="w-full h-full object-cover"
//             />
 
//             {!cameraStarted && (
//               <div className="absolute inset-0 flex items-center justify-center text-white">
//                 <FaSpinner className="animate-spin" />
//               </div>
//             )}
 
//             {isProcessing && (
//               <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
//                 Processing...
//               </div>
//             )}
//           </div>
 
//           {scannedData && (
//             <div className="mt-3 text-green-600">
//               <FaCheckCircle /> {scannedData.message}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
 
// export default QRScannerComponent;
 
 import React, { useState, useEffect, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import {
  FaQrcode,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaSpinner,
} from 'react-icons/fa';
import {
  BrowserMultiFormatReader,
  NotFoundException,
  DecodeHintType,
  BarcodeFormat,
} from '@zxing/library';

interface QRScannerComponentProps {
  onClose: () => void;
  onScanSuccess?: (data: any) => void;
  tripId?: string;
  token?: string; // Keep as prop but will also check from Preferences
}

// Helper function to get token from Preferences
const getToken = async (): Promise<string | null> => {
  try {
    const { value } = await Preferences.get({ key: 'access_token' });
    return value || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

const QRScannerComponent: React.FC<QRScannerComponentProps> = ({
  onClose,
  onScanSuccess,
  tripId: propTripId,
  token: propToken,
}) => {
  const [scannedData, setScannedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [token, setToken] = useState<string | null>(propToken || null);
  const [tripId, setTripId] = useState<string | null>(propTripId || null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(true);

  // Load token from Preferences if not provided as prop
  useEffect(() => {
    const loadToken = async () => {
      if (!propToken) {
        const accessToken = await getToken();
        setToken(accessToken);
      }
    };
    loadToken();
  }, [propToken]);

  // 📍 Location
  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => resolve({ lat: 0, lng: 0 }),
        { enableHighAccuracy: true }
      );
    });
  };

  const [scanType, setScanType] = useState<"board" | "drop">("board");

  // 🔁 Process Scan
  const processScan = async (qrToken: string) => {
    const activeToken = token || propToken;
    const activeTripId = tripId || propTripId;
    
    if (!activeTripId || !activeToken || isProcessing) {
      setError("Missing trip ID or authentication token");
      return;
    }

    setIsProcessing(true);
    stopScanner();

    try {
      const { lat, lng } = await getCurrentLocation();

      const res = await fetch(
        `https://be.shuttleapp.transev.site/driver/scan/${activeTripId}/scan`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qr_token: qrToken,
            lat,
            lng,
            scan_type: scanType, // ✅ REQUIRED
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || 'Scan failed');

      setScannedData(data);
      onScanSuccess?.(data);

      setTimeout(() => onClose(), 2500);
    } catch (err: any) {
      setError(
        typeof err.message === "string"
          ? err.message
          : JSON.stringify(err.message)
      );
      setIsProcessing(false);

      setTimeout(() => {
        setError(null);
        startScanner();
      }, 2000);
    }
  };

  const startScanner = async () => {
    try {
      // 🔥 IMPORTANT: STOP PREVIOUS FIRST
      stopScanner();

      if (!videoRef.current) return;

      scanningRef.current = true;

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);

      const reader = new BrowserMultiFormatReader(hints);
      readerRef.current = reader;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" }, // ✅ FIXED FOR iOS
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;

      await videoRef.current.play();

      setCameraStarted(true);

      // ✅ START SCAN LOOP
      const scanLoop = async () => {
        if (!scanningRef.current || !videoRef.current || !readerRef.current) return;

        try {
          const result = await readerRef.current.decodeFromVideoElement(
            videoRef.current
          );

          if (result && !isProcessing) {
            processScan(result.getText());
            return;
          }
        } catch (err) {
          if (!(err instanceof NotFoundException)) {
            console.error(err);
          }
        }

        requestAnimationFrame(scanLoop);
      };

      scanLoop();

    } catch (err: any) {
      console.error(err);

      // 🔥 iOS specific fallback message
      if (err.name === "AbortError") {
        setError("Camera interrupted. Please retry.");
      } else if (err.name === "NotAllowedError") {
        setError("Camera permission denied.");
      } else {
        setError("Camera error: " + err.message);
      }
    }
  };

  const stopScanner = () => {
    scanningRef.current = false;

    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setCameraStarted(false);
  };

  useEffect(() => {
    startScanner();
    return () => stopScanner();
  }, []);

  const retryScanner = async () => {
    setError(null);
    setScannedData(null);
    setIsProcessing(false);

    stopScanner();

    // ⏳ small delay for iOS (VERY IMPORTANT)
    setTimeout(() => {
      startScanner();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-9999 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 text-white p-4 flex justify-between">
          <div className="flex items-center gap-2">
            <FaQrcode />
            <span>Scan QR</span>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="hover:opacity-80 transition"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle />
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={retryScanner}
                className="text-sm font-semibold underline hover:no-underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Scan Type Selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setScanType("board")}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                scanType === "board"
                  ? "bg-green-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🚌 Boarding
            </button>

            <button
              onClick={() => setScanType("drop")}
              className={`flex-1 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                scanType === "drop"
                  ? "bg-blue-600 text-white shadow-lg transform scale-105"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              🏁 Drop
            </button>
          </div>

          {/* Scanner View */}
          <div className="relative bg-black rounded-xl h-[300px] overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Scanner Frame Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-white/30 rounded-xl"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500 rounded-lg shadow-lg">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
              </div>
            </div>

            {!cameraStarted && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <FaSpinner className="animate-spin text-white text-3xl" />
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <div className="text-center">
                  <FaSpinner className="animate-spin text-white text-3xl mx-auto mb-2" />
                  <p className="text-white text-sm">Processing scan...</p>
                </div>
              </div>
            )}
          </div>

          {/* Success Message */}
          {scannedData && (
            <div className="mt-4 bg-green-50 text-green-600 p-3 rounded-lg flex items-center gap-2">
              <FaCheckCircle className="text-green-600" />
              <span className="text-sm font-medium">{scannedData.message || "Scan successful!"}</span>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Position the QR code within the frame to scan
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Current mode: <span className="font-semibold">{scanType === "board" ? "Boarding" : "Drop-off"}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerComponent;