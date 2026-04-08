// import React, { useState, useEffect, useRef } from 'react';
// import { FaQrcode, FaCheckCircle, FaExclamationTriangle, FaTimes, FaSpinner } from 'react-icons/fa';
// // import { Html5Qrcode } from 'html5-qrcode';
// import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
// interface QRScannerComponentProps {
//   onClose: () => void;
//   onScanSuccess?: (data: any) => void;
//   tripId?: string;
//   token?: string;
// }

// const QRScannerComponent: React.FC<QRScannerComponentProps> = ({ onClose, onScanSuccess, tripId, token }) => {
//   const [scannedData, setScannedData] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isScannerReady, setIsScannerReady] = useState(false);
//   const scannerRef = useRef<Html5Qrcode | null>(null);
//   const isMountedRef = useRef(true);
//   const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation not supported"));
//       } else {
//         navigator.geolocation.getCurrentPosition(
//           (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
//           (err) => reject(err),
//           { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//       }
//     });
//   };

//   const processScan = async (qrToken: string) => {
//     if (!tripId || !token) {
//       setError("Trip or authentication information missing");
//       return;
//     }

//     if (isProcessing) return;
    
//     setIsProcessing(true);
//     console.log("🔄 Raw QR Data:", qrToken);
//     console.log("📝 QR Data Type:", typeof qrToken);
//     console.log("📏 QR Data Length:", qrToken.length);

//     try {
//       // Get current location
//       const { lat, lng } = await getCurrentLocation();
//       console.log("📍 Current Location:", { lat, lng });

//       // DON'T try to parse JSON - send the QR data as-is
//       // Your QR code contains plain text or booking reference
//       let finalToken = qrToken.trim();
      
//       // Remove any URL encoding if present
//       try {
//         finalToken = decodeURIComponent(finalToken);
//       } catch (e) {
//         // Not URL encoded, use as is
//       }
      
//       console.log("📤 Sending token to API:", finalToken);

//       const requestBody = { qr_token: finalToken, lat, lng };
//       console.log("📦 Request Body:", requestBody);

//       const response = await fetch(`https://be.shuttleapp.transev.site/driver/scan/${tripId}/scan`, {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(requestBody),
//       });

//       const data = await response.json();
//       console.log("📡 API Response:", data);
      
//       if (!response.ok) {
//         // Show more detailed error
//         const errorMsg = data.detail || data.message || data.error || "Scan failed";
//         console.error("API Error Details:", data);
//         throw new Error(errorMsg);
//       }

//       console.log("✅ API Success:", data);
//       setScannedData(data);
//       if (onScanSuccess) onScanSuccess(data);

//       // Stop scanner after successful scan
//       if (scannerRef.current) {
//         try {
//           await scannerRef.current.stop();
//           await scannerRef.current.clear();
//           console.log("Scanner stopped after successful scan");
//         } catch (err) {
//           console.error("Error stopping scanner:", err);
//         }
//       }

//       // Auto close after 3 seconds on success
//       setTimeout(() => {
//         if (isMountedRef.current) {
//           onClose();
//         }
//       }, 3000);
      
//     } catch (err: any) {
//       console.error("Process scan error:", err);
//       setError(err.message || "Scan failed. Please try again.");
      
//       // Restart scanner after error
//       setTimeout(async () => {
//         if (isMountedRef.current && !scannedData) {
//           setError(null);
//           setIsProcessing(false);
//           await restartScanner();
//         }
//       }, 3000);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const stopAndClearScanner = async () => {
//     if (scannerRef.current) {
//       const scanner = scannerRef.current;
//       scannerRef.current = null;
      
//       try {
//         await scanner.stop();
//         await scanner.clear();
//         console.log("Scanner stopped and cleared successfully");
//       } catch (err) {
//         console.error("Error stopping/clearing scanner:", err);
//       }
//     }
//   };

//   const restartScanner = async () => {
//     await stopAndClearScanner();
//     setIsScannerReady(false);
    
//     setTimeout(() => {
//       if (isMountedRef.current) {
//         startScanner();
//       }
//     }, 500);
//   };

//   // const startScanner = async () => {
//   //   try {
//   //     // Clear any existing scanner
//   //     if (scannerRef.current) {
//   //       await stopAndClearScanner();
//   //     }

//   //     // Check if element exists
//   //     const element = document.getElementById("qr-reader-container");
//   //     if (!element) {
//   //       throw new Error("Scanner container not found");
//   //     }

//   //     // Create new scanner
//   //     const scanner = new Html5Qrcode("qr-reader-container");
//   //     scannerRef.current = scanner;
      
//   //     const config = {
//   //       fps: 10,
//   //       qrbox: { width: 300, height: 300 },
//   //       aspectRatio: 1.0,
//   //       disableFlip: false,
//   //     };
      
//   //     console.log("Starting scanner with config:", config);
      
//   //     await scanner.start(
//   //       { facingMode: "environment" },
//   //       config,
//   //       (decodedText) => {
//   //         console.log("🎯 QR Code detected - Raw value:", decodedText);
//   //         console.log("🎯 QR Code type:", typeof decodedText);
          
//   //         // Clear any existing timeout
//   //         if (scanTimeoutRef.current) {
//   //           clearTimeout(scanTimeoutRef.current);
//   //         }
          
//   //         // Process scan immediately
//   //         if (!isProcessing && !scannedData && scannerRef.current) {
//   //           // Stop scanner immediately when QR is detected
//   //           const currentScanner = scannerRef.current;
//   //           if (currentScanner) {
//   //             currentScanner.stop().then(() => {
//   //               console.log("Scanner stopped after detection");
//   //             }).catch((err: Error) => {
//   //               console.error("Error stopping scanner:", err);
//   //             });
//   //           }
//   //           processScan(decodedText);
//   //         }
//   //       },
//   //       (errorMessage) => {
//   //         // Only log serious errors, ignore NotFoundException
//   //         if (errorMessage && 
//   //             !errorMessage.includes("NotFoundException") && 
//   //             !errorMessage.includes("No MultiFormat Readers") &&
//   //             !errorMessage.includes("Unable to query device")) {
//   //           console.warn("Scanner warning:", errorMessage);
//   //         }
//   //       }
//   //     );
      
//   //     setIsScannerReady(true);
//   //     console.log("✅ Scanner started successfully - Ready to scan!");
      
//   //   } catch (err: any) {
//   //     console.error("Failed to start scanner:", err);
//   //     setError("Camera error: " + (err.message || "Could not start camera. Please check permissions and ensure you're using HTTPS."));
//   //     setIsScannerReady(false);
//   //   }
//   // };
//   const startScanner = async () => {
//   try {
//     // Clear any existing scanner
//     if (scannerRef.current) {
//       await stopAndClearScanner();
//     }

//     // Check if element exists
//     const element = document.getElementById("qr-reader-container");
//     if (!element) {
//       throw new Error("Scanner container not found");
//     }

//     // Create new scanner
//     const scanner = new Html5Qrcode("qr-reader-container", {
//       verbose: false,
//       formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
//       useBarCodeDetectorIfSupported: true,
//     });
//     scannerRef.current = scanner;
    
//     const config = {
//       fps: 12,
//       disableFlip: false,
//       videoConstraints: {
//         facingMode: { ideal: "environment" },
//         width: { ideal: 1920 },
//         height: { ideal: 1080 },
//       },
//     };
    
//     console.log("Starting scanner with config:", config);
    
//     await scanner.start(
//       { facingMode: "environment" },
//       config,
//       (decodedText) => {
//         console.log("🎯 QR Code detected - Raw value:", decodedText);
//         console.log("🎯 QR Code type:", typeof decodedText);
        
//         // Clear any existing timeout
//         if (scanTimeoutRef.current) {
//           clearTimeout(scanTimeoutRef.current);
//         }
        
//         // Process scan immediately
//         if (!isProcessing && !scannedData && scannerRef.current) {
//           // Stop scanner immediately when QR is detected
//           const currentScanner = scannerRef.current;
//           if (currentScanner) {
//             currentScanner.stop().then(() => {
//               console.log("Scanner stopped after detection");
//             }).catch((err: Error) => {
//               console.error("Error stopping scanner:", err);
//             });
//           }
//           processScan(decodedText);
//         }
//       },
//       (errorMessage) => {
//         // Only log serious errors, ignore NotFoundException
//         if (
//           errorMessage &&
//           !errorMessage.includes("NotFoundException") &&
//           !errorMessage.includes("No MultiFormat Readers") &&
//           !errorMessage.includes("Unable to query device")
//         ) {
//           console.warn("Scanner warning:", errorMessage);
//         }
//       }
//     );
    
//     setIsScannerReady(true);
//     console.log("✅ Scanner started successfully - Ready to scan!");
    
//   } catch (err: any) {
//     console.error("Failed to start scanner:", err);
//     setError("Camera error: " + (err.message || "Could not start camera. Please check permissions and ensure you're using HTTPS."));
//     setIsScannerReady(false);
//   }
// };

//   useEffect(() => {
//     isMountedRef.current = true;
    
//     // Small delay to ensure DOM is ready
//     const timer = setTimeout(() => {
//       if (isMountedRef.current) {
//         startScanner();
//       }
//     }, 500);
    
//     return () => {
//       isMountedRef.current = false;
//       clearTimeout(timer);
//       if (scanTimeoutRef.current) {
//         clearTimeout(scanTimeoutRef.current);
//       }
//       // Cleanup scanner
//       (async () => {
//         if (scannerRef.current) {
//           const scanner = scannerRef.current;
//           scannerRef.current = null;
//           try {
//             await scanner.stop();
//             await scanner.clear();
//             console.log("Cleanup: Scanner stopped and cleared");
//           } catch (err) {
//             console.error("Cleanup error:", err);
//           }
//         }
//       })();
//     };
//   }, []);

//   const retryScanner = async () => {
//     setError(null);
//     setScannedData(null);
//     setIsProcessing(false);
//     await restartScanner();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-9999 p-4">
//       <div className="bg-linear-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden">
//         {/* Header */}
//         <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <div className="bg-white/20 p-2 rounded-xl">
//               <FaQrcode className="text-white text-2xl" />
//             </div>
//             <div>
//               <h2 className="text-xl font-bold text-white">Scan QR Code</h2>
//               <p className="text-blue-100 text-xs">Position QR code within the frame</p>
//             </div>
//           </div>
//           <button 
//             onClick={async () => {
//               await stopAndClearScanner();
//               onClose();
//             }} 
//             className="text-white/80 hover:text-white transition-all hover:bg-white/10 rounded-full p-2"
//             disabled={isProcessing}
//           >
//             <FaTimes className="text-xl" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Error Message */}
//           {error && (
//             <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl animate-slideUp">
//               <div className="flex items-start gap-3">
//                 <div className="bg-red-100 p-2 rounded-full shrink-0">
//                   <FaExclamationTriangle className="text-red-500 text-sm" />
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-red-700 text-sm font-medium whitespace-pre-line">{error}</p>
//                   <button 
//                     onClick={retryScanner} 
//                     className="mt-2 text-red-600 text-xs font-semibold hover:text-red-700 transition-colors"
//                   >
//                     Try Again →
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Scanner Container */}
//           <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black" style={{ minHeight: '400px' }}>
//             <div 
//               id="qr-reader-container" 
//               style={{ width: '100%', minHeight: '400px' }}
//             ></div>

//             {/* Scanner Frame Overlay */}
//             {!error && !scannedData && !isProcessing && isScannerReady && (
//               <div className="absolute inset-0 pointer-events-none">
//                 <div className="absolute inset-0 bg-black/50">
//                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
//                     {/* Corner borders */}
//                     <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-500 rounded-tl-2xl"></div>
//                     <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-500 rounded-tr-2xl"></div>
//                     <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-500 rounded-bl-2xl"></div>
//                     <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-500 rounded-br-2xl"></div>
//                   </div>
//                 </div>
//                 {/* Scanning line animation */}
//                 <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-green-500 to-transparent animate-scanLine"></div>
//               </div>
//             )}

//             {/* Processing Overlay */}
//             {isProcessing && (
//               <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
//                 <div className="text-center">
//                   <FaSpinner className="text-white text-4xl animate-spin mx-auto mb-3" />
//                   <p className="text-white text-sm font-medium">Verifying passenger...</p>
//                 </div>
//               </div>
//             )}

//             {/* Scanner Initializing */}
//             {!isScannerReady && !error && !scannedData && (
//               <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
//                 <div className="text-center">
//                   <FaSpinner className="text-white text-3xl animate-spin mx-auto mb-2" />
//                   <p className="text-white text-sm">Initializing camera...</p>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Success Message */}
//           {scannedData && !error && (
//             <div className="mt-5 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 animate-slideUp">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="bg-green-100 p-2 rounded-full">
//                   <FaCheckCircle className="text-green-600 text-xl" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-green-800">Passenger Verified!</h3>
//                   <p className="text-green-600 text-xs">QR code validated successfully</p>
//                 </div>
//               </div>
//               {scannedData.passenger && (
//                 <div className="mt-2 pt-2 border-t border-green-200 space-y-1">
//                   <p className="text-sm text-green-700">
//                     <span className="font-semibold">Passenger:</span> {scannedData.passenger.name || "N/A"}
//                   </p>
//                   <p className="text-sm text-green-700">
//                     <span className="font-semibold">Booking ID:</span> {scannedData.booking_id || "N/A"}
//                   </p>
//                   {scannedData.seat_number && (
//                     <p className="text-sm text-green-700">
//                       <span className="font-semibold">Seat:</span> {scannedData.seat_number}
//                     </p>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Instructions */}
//           {!error && !scannedData && !isProcessing && isScannerReady && (
//             <div className="mt-4 text-center">
//               <p className="text-gray-500 text-xs">
//                 Align the QR code within the green frame to scan
//               </p>
//               <p className="text-gray-400 text-xs mt-1">
//                 Make sure the QR code is well-lit and clear
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       <style>{`
//         @keyframes scanLine { 
//           0% { top: 0%; } 
//           100% { top: 100%; } 
//         }
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes slideUp {
//           from { transform: translateY(20px); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         .animate-scanLine { 
//           animation: scanLine 2s linear infinite; 
//         }
//         .animate-spin { 
//           animation: spin 1s linear infinite; 
//         }
//         .animate-slideUp { 
//           animation: slideUp 0.3s ease-out; 
//         }
        
//         /* Custom styles for QR scanner */
//         #qr-reader-container {
//           position: relative;
//         }
//         #qr-reader-container video {
//           width: 100%;
//           height: auto;
//           object-fit: cover;
//         }
//         #qr-reader-container region {
//           border: 2px solid #10b981 !important;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default QRScannerComponent;

import React, { useState, useEffect, useRef } from 'react';
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
  token?: string;
}
 
const QRScannerComponent: React.FC<QRScannerComponentProps> = ({
  onClose,
  onScanSuccess,
  tripId,
  token,
}) => {
  const [scannedData, setScannedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
 
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(true);
 
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
    if (!tripId || !token || isProcessing) return;
 
    setIsProcessing(true);
    stopScanner();
 
    try {
      const { lat, lng } = await getCurrentLocation();
 
      const res = await fetch(
        `https://be.shuttleapp.transev.site/driver/scan/${tripId}/scan`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
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
          >
            <FaTimes />
          </button>
        </div>
 
        <div className="p-4">
          {error && (
            <div className="text-red-500 mb-3">
              {error}
              <button onClick={retryScanner}>Retry</button>
            </div>
          )}
 
          {/* ✅ ADD HERE */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setScanType("board")}
              className={`flex-1 p-2 rounded ${scanType === "board" ? "bg-green-600 text-white" : "bg-gray-200"
                }`}
            >
              Boarding
            </button>
 
            <button
              onClick={() => setScanType("drop")}
              className={`flex-1 p-2 rounded ${scanType === "drop" ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
            >
              Drop
            </button>
          </div>
 
          {/* 👇 existing scanner */}
          <div className="relative bg-black rounded-xl h-[300px] overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
 
            {!cameraStarted && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <FaSpinner className="animate-spin" />
              </div>
            )}
 
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white">
                Processing...
              </div>
            )}
          </div>
 
          {scannedData && (
            <div className="mt-3 text-green-600">
              <FaCheckCircle /> {scannedData.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default QRScannerComponent;
 
 