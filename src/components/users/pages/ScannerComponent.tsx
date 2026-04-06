// // QRScannerComponent.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import { FaQrcode, FaCheckCircle, FaExclamationTriangle, FaTimes, FaCamera, FaSpinner } from 'react-icons/fa';
// import { BrowserMultiFormatReader } from '@zxing/browser';

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
//   token 
// }) => {
//   const [scannedData, setScannedData] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [scanning, setScanning] = useState(true);
//   const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isCameraReady, setIsCameraReady] = useState(false);
  
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const scannerRef = useRef<any>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   // Check if running on HTTPS or localhost
//   const isSecureContext = () => {
//     return window.isSecureContext || 
//            window.location.hostname === 'localhost' || 
//            window.location.hostname === '127.0.0.1';
//   };

//   // Get current location
//   const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation not supported"));
//       } else {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             resolve({
//               lat: position.coords.latitude,
//               lng: position.coords.longitude,
//             });
//           },
//           (err) => reject(err),
//           { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//       }
//     });
//   };

//   // Process scanned QR code
//   const processScan = async (qrToken: string) => {
//     if (!tripId || !token) {
//       setError("Trip or authentication information missing");
//       return;
//     }

//     setIsProcessing(true);
//     setScanning(false);
    
//     try {
//       const { lat, lng } = await getCurrentLocation();
      
//       console.log("📍 Scanning QR Code:", qrToken);
//       console.log("📍 Current Location:", { lat, lng });
//       console.log("📍 Trip ID:", tripId);

//       const requestBody = {
//         qr_token: qrToken,
//         lat: lat,
//         lng: lng
//       };

//       const response = await fetch(
//         `https://be.shuttleapp.transev.site/driver/scan/${tripId}/scan`,
//         {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(requestBody),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || data.message || "Scan failed");
//       }

//       setScannedData(data);
      
//       if (onScanSuccess) {
//         onScanSuccess(data);
//       }
      
//       setTimeout(() => {
//         onClose();
//       }, 3000);
      
//     } catch (err: any) {
//       console.error("Scan error:", err);
//       setError(err.message || "Scan failed");
//       setScanning(true);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Initialize camera and scanner
//   const initCamera = async () => {
//     if (!videoRef.current) {
//       setError("Video element not found");
//       return;
//     }

//     // Check for HTTPS
//     if (!isSecureContext()) {
//       setError("Camera access requires HTTPS. Please use HTTPS protocol.");
//       setCameraPermission(false);
//       return;
//     }

//     // Check if mediaDevices is available
//     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//       setError("Your browser does not support camera access. Please use a modern browser.");
//       setCameraPermission(false);
//       return;
//     }

//     try {
//       // Request camera permission with specific constraints
//       const constraints = {
//         video: {
//           facingMode: 'environment', // Use back camera on mobile
//           width: { ideal: 1280 },
//           height: { ideal: 720 }
//         }
//       };
      
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       streamRef.current = stream;
      
//       // Attach stream to video element
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.setAttribute('playsinline', 'true');
        
//         // Wait for video to be ready
//         await new Promise((resolve) => {
//           if (videoRef.current) {
//             videoRef.current.onloadedmetadata = () => {
//               videoRef.current?.play();
//               resolve(true);
//             };
//           } else {
//             resolve(true);
//           }
//         });
        
//         setIsCameraReady(true);
//         setCameraPermission(true);
        
//         // Start scanner after camera is ready
//         startScanner();
//       }
      
//     } catch (err: any) {
//       console.error("Camera error:", err);
//       setCameraPermission(false);
      
//       if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
//         setError("Camera permission denied. Please allow camera access and refresh.");
//       } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
//         setError("No camera found on this device.");
//       } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
//         setError("Camera is already in use by another application.");
//       } else if (err.name === 'OverconstrainedError') {
//         setError("Camera constraints cannot be satisfied. Please try a different camera.");
//       } else {
//         setError(`Camera error: ${err.message || 'Unknown error'}`);
//       }
//     }
//   };

//   // Start barcode scanner
//   const startScanner = () => {
//     if (!videoRef.current || !isCameraReady) {
//       return;
//     }

//     try {
//       const reader = new BrowserMultiFormatReader();
//       scannerRef.current = reader;
      
//       // Use the video element for decoding
//       reader.decodeFromVideoElement(videoRef.current, (result, err) => {
//         if (result && scanning && !isProcessing) {
//           const scannedText = result.getText();
//           console.log("📱 Scanned:", scannedText);
          
//           // Stop scanner and camera
//           stopScanner();
          
//           // Process the scanned QR code
//           processScan(scannedText);
//         }
//         if (err && !result && err.name !== "NotFoundException") {
//           console.error("Scanner error:", err);
//         }
//       }).catch((err: any) => {
//         console.error("Failed to start decoder:", err);
//         setError("Failed to start scanner. Please try again.");
//       });
      
//     } catch (err: any) {
//       console.error("Scanner initialization error:", err);
//       setError(err.message || "Failed to initialize scanner");
//     }
//   };

//   // Stop scanner and release camera
//   const stopScanner = () => {
//     if (scannerRef.current) {
//       try {
//         scannerRef.current.reset();
//         scannerRef.current = null;
//       } catch (err) {
//         console.error("Error resetting scanner:", err);
//       }
//     }
    
//     if (streamRef.current) {
//       try {
//         const tracks = streamRef.current.getTracks();
//         tracks.forEach(track => track.stop());
//         streamRef.current = null;
//       } catch (err) {
//         console.error("Error stopping camera stream:", err);
//       }
//     }
    
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
    
//     setIsCameraReady(false);
//   };

//   // Initialize on mount
//   useEffect(() => {
//     initCamera();
    
//     return () => {
//       stopScanner();
//     };
//   }, []);

//   // Retry scanner
//   const retryScanner = () => {
//     setError(null);
//     setCameraPermission(null);
//     setScanning(true);
//     setIsCameraReady(false);
//     stopScanner();
//     initCamera();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn">
//       <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-slideUp">
        
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
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
//             onClick={onClose}
//             className="text-white/80 hover:text-white transition-all hover:bg-white/10 rounded-full p-2"
//           >
//             <FaTimes className="text-xl" />
//           </button>
//         </div>
        
//         {/* Content */}
//         <div className="p-6">
          
//           {/* Error Message */}
//           {error && (
//             <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3">
//               <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
//                 <FaExclamationTriangle className="text-red-500 text-sm" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-red-700 text-sm font-medium">{error}</p>
//                 <button
//                   onClick={retryScanner}
//                   className="mt-2 text-red-600 text-xs font-semibold hover:text-red-700"
//                 >
//                   Try Again →
//                 </button>
//               </div>
//             </div>
//           )}
          
//           {/* Scanner Container */}
//           {!error && (
//             <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black">
//               {/* Video Element */}
//               <video
//                 ref={videoRef}
//                 className="w-full h-[400px] object-cover"
//                 playsInline
//                 muted
//                 autoPlay
//               />
              
//               {/* Loading Overlay */}
//               {cameraPermission === null && (
//                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
//                   <div className="text-center">
//                     <FaSpinner className="text-white text-4xl animate-spin mx-auto mb-3" />
//                     <p className="text-white text-sm">Requesting camera access...</p>
//                   </div>
//                 </div>
//               )}
              
//               {/* No Camera Permission */}
//               {cameraPermission === false && (
//                 <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
//                   <div className="text-center p-6">
//                     <FaCamera className="text-gray-400 text-5xl mx-auto mb-3" />
//                     <p className="text-white text-sm mb-2">Camera access required</p>
//                     <p className="text-gray-400 text-xs mb-4">Please allow camera access to scan QR codes</p>
//                     <button
//                       onClick={retryScanner}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all"
//                     >
//                       Grant Permission
//                     </button>
//                   </div>
//                 </div>
//               )}
              
//               {/* Scanner Overlay - Only show when scanning */}
//               {scanning && cameraPermission === true && !isProcessing && isCameraReady && (
//                 <div className="absolute inset-0 pointer-events-none">
//                   {/* Darkened edges */}
//                   <div className="absolute inset-0 bg-black/50">
//                     {/* Clear center frame */}
//                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-transparent">
//                       {/* Frame borders */}
//                       <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-500 rounded-tl-2xl"></div>
//                       <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-500 rounded-tr-2xl"></div>
//                       <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-500 rounded-bl-2xl"></div>
//                       <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-500 rounded-br-2xl"></div>
//                     </div>
//                   </div>
                  
//                   {/* Scanning Line Animation */}
//                   <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scanLine"></div>
//                 </div>
//               )}
              
//               {/* Processing Overlay */}
//               {isProcessing && (
//                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
//                   <div className="text-center">
//                     <FaSpinner className="text-white text-4xl animate-spin mx-auto mb-3" />
//                     <p className="text-white text-sm font-medium">Processing QR Code...</p>
//                     <p className="text-gray-300 text-xs mt-1">Please wait</p>
//                   </div>
//                 </div>
//               )}
              
//               {/* Instruction Text */}
//               {scanning && cameraPermission === true && !isProcessing && isCameraReady && (
//                 <div className="absolute bottom-4 left-4 right-4 text-center">
//                   <div className="bg-black/60 backdrop-blur-sm rounded-full py-2 px-4 inline-block mx-auto">
//                     <p className="text-white text-xs flex items-center gap-2">
//                       <FaQrcode className="text-green-400" />
//                       Position QR code within the frame
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
          
//           {/* Scanned Data Card - Success */}
//           {scannedData && !error && (
//             <div className="mt-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 animate-slideUp">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="bg-green-100 p-2 rounded-full">
//                   <FaCheckCircle className="text-green-600 text-xl" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-green-800">Scan Successful!</h3>
//                   <p className="text-green-600 text-xs">Passenger verified</p>
//                 </div>
//               </div>
              
//               <div className="space-y-2 text-sm">
//                 {scannedData.passenger && (
//                   <div className="flex justify-between items-center border-b border-green-200 pb-2">
//                     <span className="text-gray-600">Passenger Name:</span>
//                     <span className="font-semibold text-gray-800">{scannedData.passenger.name || "N/A"}</span>
//                   </div>
//                 )}
//                 {scannedData.booking_id && (
//                   <div className="flex justify-between items-center border-b border-green-200 pb-2">
//                     <span className="text-gray-600">Booking ID:</span>
//                     <span className="font-mono text-sm text-gray-800">{scannedData.booking_id}</span>
//                   </div>
//                 )}
//                 {scannedData.status && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Status:</span>
//                     <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
//                       {scannedData.status}
//                     </span>
//                   </div>
//                 )}
//               </div>
              
//               <div className="mt-4 text-center">
//                 <p className="text-green-600 text-xs animate-pulse">
//                   Closing in 3 seconds...
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <style>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
        
//         @keyframes slideUp {
//           from {
//             transform: translateY(50px);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }
        
//         @keyframes scanLine {
//           0% {
//             top: 0%;
//           }
//           100% {
//             top: 100%;
//           }
//         }
        
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
        
//         .animate-slideUp {
//           animation: slideUp 0.3s ease-out;
//         }
        
//         .animate-scanLine {
//           animation: scanLine 2s linear infinite;
//         }
        
//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }
        
//         .animate-pulse {
//           animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
        
//         @keyframes spin {
//           from {
//             transform: rotate(0deg);
//           }
//           to {
//             transform: rotate(360deg);
//           }
//         }
        
//         @keyframes pulse {
//           0%, 100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0.5;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default QRScannerComponent;

// QRScannerComponent.tsx

// import React, { useState, useEffect, useRef } from 'react';
// import { FaQrcode, FaCheckCircle, FaExclamationTriangle, FaTimes, FaCamera, FaSpinner } from 'react-icons/fa';
// import { BrowserMultiFormatReader } from '@zxing/browser';

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
//   token 
// }) => {
//   const [scannedData, setScannedData] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [scanning, setScanning] = useState(true);
//   const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isCameraReady, setIsCameraReady] = useState(false);
  
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const scannerRef = useRef<any>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   // HTTPS চেকিং বাদ দেওয়া হয়েছে - সবসময় true রিটার্ন করবে
//   const isSecureContext = () => {
//     // লোকাল ডেভেলপমেন্টের জন্য সবসময় true রিটার্ন করুন
//     return true;
//   };

//   // Get current location
//   const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation not supported"));
//       } else {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             resolve({
//               lat: position.coords.latitude,
//               lng: position.coords.longitude,
//             });
//           },
//           (err) => reject(err),
//           { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         );
//       }
//     });
//   };

//   // Process scanned QR code
//   const processScan = async (qrToken: string) => {
//     if (!tripId || !token) {
//       setError("Trip or authentication information missing");
//       return;
//     }

//     setIsProcessing(true);
//     setScanning(false);
    
//     try {
//       const { lat, lng } = await getCurrentLocation();
      
//       console.log("📍 Scanning QR Code:", qrToken);
//       console.log("📍 Current Location:", { lat, lng });
//       console.log("📍 Trip ID:", tripId);

//       const requestBody = {
//         qr_token: qrToken,
//         lat: lat,
//         lng: lng
//       };

//       const response = await fetch(
//         `https://be.shuttleapp.transev.site/driver/scan/${tripId}/scan`,
//         {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(requestBody),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || data.message || "Scan failed");
//       }

//       setScannedData(data);
      
//       if (onScanSuccess) {
//         onScanSuccess(data);
//       }
      
//       setTimeout(() => {
//         onClose();
//       }, 3000);
      
//     } catch (err: any) {
//       console.error("Scan error:", err);
//       setError(err.message || "Scan failed");
//       setScanning(true);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Initialize camera and scanner
//   const initCamera = async () => {
//     if (!videoRef.current) {
//       setError("Video element not found");
//       return;
//     }

//     // HTTPS চেকিং বাদ দেওয়া হয়েছে - মন্তব্য করে রাখা হলো
//     // if (!isSecureContext()) {
//     //   setError("Camera access requires HTTPS. Please use HTTPS or localhost.");
//     //   setCameraPermission(false);
//     //   return;
//     // }

//     // Check if mediaDevices is available
//     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//       setError("Your browser does not support camera access. Please use a modern browser.");
//       setCameraPermission(false);
//       return;
//     }

//     try {
//       // Request camera permission with specific constraints
//       const constraints = {
//         video: {
//           facingMode: 'environment', // Use back camera on mobile
//           width: { ideal: 1280 },
//           height: { ideal: 720 }
//         }
//       };
      
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       streamRef.current = stream;
      
//       // Attach stream to video element
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.setAttribute('playsinline', 'true');
        
//         // Wait for video to be ready
//         await new Promise((resolve) => {
//           if (videoRef.current) {
//             videoRef.current.onloadedmetadata = () => {
//               videoRef.current?.play();
//               resolve(true);
//             };
//           } else {
//             resolve(true);
//           }
//         });
        
//         setIsCameraReady(true);
//         setCameraPermission(true);
        
//         // Start scanner after camera is ready
//         startScanner();
//       }
      
//     } catch (err: any) {
//       console.error("Camera error:", err);
//       setCameraPermission(false);
      
//       if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
//         setError("Camera permission denied. Please allow camera access and refresh.");
//       } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
//         setError("No camera found on this device.");
//       } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
//         setError("Camera is already in use by another application.");
//       } else {
//         setError(`Camera error: ${err.message || 'Unknown error'}`);
//       }
//     }
//   };

//   // Start barcode scanner
//   const startScanner = () => {
//     if (!videoRef.current || !isCameraReady) {
//       return;
//     }

//     try {
//       const reader = new BrowserMultiFormatReader();
//       scannerRef.current = reader;
      
//       // Use the video element for decoding
//       reader.decodeFromVideoElement(videoRef.current, (result, err) => {
//         if (result && scanning && !isProcessing) {
//           const scannedText = result.getText();
//           console.log("📱 Scanned:", scannedText);
          
//           // Stop scanner and camera
//           stopScanner();
          
//           // Process the scanned QR code
//           processScan(scannedText);
//         }
//         if (err && !result && err.name !== "NotFoundException") {
//           console.error("Scanner error:", err);
//         }
//       }).catch((err: any) => {
//         console.error("Failed to start decoder:", err);
//         setError("Failed to start scanner. Please try again.");
//       });
      
//     } catch (err: any) {
//       console.error("Scanner initialization error:", err);
//       setError(err.message || "Failed to initialize scanner");
//     }
//   };

//   // Stop scanner and release camera
//   const stopScanner = () => {
//     if (scannerRef.current) {
//       try {
//         scannerRef.current.reset();
//         scannerRef.current = null;
//       } catch (err) {
//         console.error("Error resetting scanner:", err);
//       }
//     }
    
//     if (streamRef.current) {
//       try {
//         const tracks = streamRef.current.getTracks();
//         tracks.forEach(track => track.stop());
//         streamRef.current = null;
//       } catch (err) {
//         console.error("Error stopping camera stream:", err);
//       }
//     }
    
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
    
//     setIsCameraReady(false);
//   };

//   // Initialize on mount
//   useEffect(() => {
//     // Small delay to ensure video element is ready
//     const timer = setTimeout(() => {
//       initCamera();
//     }, 500);
    
//     return () => {
//       clearTimeout(timer);
//       stopScanner();
//     };
//   }, []);

//   // Retry scanner
//   const retryScanner = () => {
//     setError(null);
//     setCameraPermission(null);
//     setScanning(true);
//     setIsCameraReady(false);
//     stopScanner();
//     initCamera();
//   };

//   return (
//     <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn">
//       <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-slideUp">
        
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
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
//             onClick={onClose}
//             className="text-white/80 hover:text-white transition-all hover:bg-white/10 rounded-full p-2"
//           >
//             <FaTimes className="text-xl" />
//           </button>
//         </div>
        
//         {/* Content */}
//         <div className="p-6">
          
//           {/* Error Message */}
//           {error && (
//             <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3">
//               <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
//                 <FaExclamationTriangle className="text-red-500 text-sm" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-red-700 text-sm font-medium">{error}</p>
//                 <button
//                   onClick={retryScanner}
//                   className="mt-2 text-red-600 text-xs font-semibold hover:text-red-700"
//                 >
//                   Try Again →
//                 </button>
//               </div>
//             </div>
//           )}
          
//           {/* Scanner Container */}
//           {!error && (
//             <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black">
//               {/* Video Element */}
//               <video
//                 ref={videoRef}
//                 className="w-full h-[400px] object-cover"
//                 playsInline
//                 muted
//                 autoPlay
//               />
              
//               {/* Loading Overlay */}
//               {cameraPermission === null && (
//                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
//                   <div className="text-center">
//                     <FaSpinner className="text-white text-4xl animate-spin mx-auto mb-3" />
//                     <p className="text-white text-sm">Requesting camera access...</p>
//                   </div>
//                 </div>
//               )}
              
//               {/* No Camera Permission */}
//               {cameraPermission === false && (
//                 <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
//                   <div className="text-center p-6">
//                     <FaCamera className="text-gray-400 text-5xl mx-auto mb-3" />
//                     <p className="text-white text-sm mb-2">Camera access required</p>
//                     <p className="text-gray-400 text-xs mb-4">Please allow camera access to scan QR codes</p>
//                     <button
//                       onClick={retryScanner}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all"
//                     >
//                       Grant Permission
//                     </button>
//                   </div>
//                 </div>
//               )}
              
//               {/* Scanner Overlay - Only show when scanning */}
//               {scanning && cameraPermission === true && !isProcessing && isCameraReady && (
//                 <div className="absolute inset-0 pointer-events-none">
//                   {/* Darkened edges */}
//                   <div className="absolute inset-0 bg-black/50">
//                     {/* Clear center frame */}
//                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-transparent">
//                       {/* Frame borders */}
//                       <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-500 rounded-tl-2xl"></div>
//                       <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-500 rounded-tr-2xl"></div>
//                       <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-500 rounded-bl-2xl"></div>
//                       <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-500 rounded-br-2xl"></div>
//                     </div>
//                   </div>
                  
//                   {/* Scanning Line Animation */}
//                   <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scanLine"></div>
//                 </div>
//               )}
              
//               {/* Processing Overlay */}
//               {isProcessing && (
//                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
//                   <div className="text-center">
//                     <FaSpinner className="text-white text-4xl animate-spin mx-auto mb-3" />
//                     <p className="text-white text-sm font-medium">Processing QR Code...</p>
//                     <p className="text-gray-300 text-xs mt-1">Please wait</p>
//                   </div>
//                 </div>
//               )}
              
//               {/* Instruction Text */}
//               {scanning && cameraPermission === true && !isProcessing && isCameraReady && (
//                 <div className="absolute bottom-4 left-4 right-4 text-center">
//                   <div className="bg-black/60 backdrop-blur-sm rounded-full py-2 px-4 inline-block mx-auto">
//                     <p className="text-white text-xs flex items-center gap-2">
//                       <FaQrcode className="text-green-400" />
//                       Position QR code within the frame
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
          
//           {/* Scanned Data Card - Success */}
//           {scannedData && !error && (
//             <div className="mt-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 animate-slideUp">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="bg-green-100 p-2 rounded-full">
//                   <FaCheckCircle className="text-green-600 text-xl" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-green-800">Scan Successful!</h3>
//                   <p className="text-green-600 text-xs">Passenger verified</p>
//                 </div>
//               </div>
              
//               <div className="space-y-2 text-sm">
//                 {scannedData.passenger && (
//                   <div className="flex justify-between items-center border-b border-green-200 pb-2">
//                     <span className="text-gray-600">Passenger Name:</span>
//                     <span className="font-semibold text-gray-800">{scannedData.passenger.name || "N/A"}</span>
//                   </div>
//                 )}
//                 {scannedData.booking_id && (
//                   <div className="flex justify-between items-center border-b border-green-200 pb-2">
//                     <span className="text-gray-600">Booking ID:</span>
//                     <span className="font-mono text-sm text-gray-800">{scannedData.booking_id}</span>
//                   </div>
//                 )}
//                 {scannedData.status && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Status:</span>
//                     <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
//                       {scannedData.status}
//                     </span>
//                   </div>
//                 )}
//               </div>
              
//               <div className="mt-4 text-center">
//                 <p className="text-green-600 text-xs animate-pulse">
//                   Closing in 3 seconds...
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <style>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//           }
//           to {
//             opacity: 1;
//           }
//         }
        
//         @keyframes slideUp {
//           from {
//             transform: translateY(50px);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }
        
//         @keyframes scanLine {
//           0% {
//             top: 0%;
//           }
//           100% {
//             top: 100%;
//           }
//         }
        
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
        
//         .animate-slideUp {
//           animation: slideUp 0.3s ease-out;
//         }
        
//         .animate-scanLine {
//           animation: scanLine 2s linear infinite;
//         }
        
//         .animate-spin {
//           animation: spin 1s linear infinite;
//         }
        
//         .animate-pulse {
//           animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
        
//         @keyframes spin {
//           from {
//             transform: rotate(0deg);
//           }
//           to {
//             transform: rotate(360deg);
//           }
//         }
        
//         @keyframes pulse {
//           0%, 100% {
//             opacity: 1;
//           }
//           50% {
//             opacity: 0.5;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default QRScannerComponent;

// QRScannerComponent.tsx
// import React, { useState, useEffect, useRef } from 'react';
// import { FaQrcode, FaCheckCircle, FaExclamationTriangle, FaTimes, FaCamera, FaSpinner } from 'react-icons/fa';
// import { BrowserMultiFormatReader } from '@zxing/browser';

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
//   token 
// }) => {
//   const [scannedData, setScannedData] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [scanning, setScanning] = useState(true);
//   const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isCameraReady, setIsCameraReady] = useState(false);
  
//   const videoRef = useRef<HTMLVideoElement | null>(null);
//   const scannerRef = useRef<any>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//  const isCameraContextAllowed = () => {
//   return (
//     window.isSecureContext ||
//     window.location.hostname === 'localhost' ||
//     window.location.hostname === '127.0.0.1'
//   );
// };

//   const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error("Geolocation not supported"));
//       } else {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
//           },
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

//     setIsProcessing(true);
//     setScanning(false);
    
//     try {
//       const { lat, lng } = await getCurrentLocation();

//       const requestBody = { qr_token: qrToken, lat, lng };
//       const response = await fetch(
//         `https://be.shuttleapp.transev.site/driver/scan/${tripId}/scan`,
//         {
//           method: "POST",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(requestBody),
//         }
//       );

//       const data = await response.json();
//       if (!response.ok) throw new Error(data.detail || data.message || "Scan failed");

//       setScannedData(data);
//       if (onScanSuccess) onScanSuccess(data);

//       setTimeout(() => onClose(), 3000);
//     } catch (err: any) {
//       setError(err.message || "Scan failed");
//       setScanning(true);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const initCamera = async () => {
//     if (!videoRef.current) return setError("Video element not found");

//     // Only allow HTTPS or localhost - ডেভেলপমেন্টে বাইপাস
//    if (!isCameraContextAllowed()) {
//   setError("Camera access requires HTTPS or localhost. Open this page on HTTPS.");
//   setCameraPermission(false);
//   return;
// }

//    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//   setError(
//     "Camera API is unavailable in this page context. " +
//     "This usually means the page is not running on HTTPS/localhost, " +
//     "or it is embedded in a restricted frame/webview."
//   );
//   setCameraPermission(false);
//   return;
// }

//     try {
     
//       const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
//       const constraints = { 
//         video: { 
//           facingMode: isMobile ? 'environment' : 'user', 
//           width: { ideal: 1280 }, 
//           height: { ideal: 720 } 
//         } 
//       };
      
//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       streamRef.current = stream;
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         videoRef.current.setAttribute('playsinline', 'true');
        
//         await new Promise((resolve) => {
//           if (videoRef.current) {
//             videoRef.current.onloadedmetadata = () => { 
//               videoRef.current?.play(); 
//               resolve(true); 
//             };
//           } else {
//             resolve(true);
//           }
//         });
        
//         setIsCameraReady(true);
//         setCameraPermission(true);
//         startScanner();
//       }
//     } catch (err: any) {
//       console.error("Camera error:", err);
//       setCameraPermission(false);
      
//       if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
//         setError("Camera permission denied. Please allow camera access and try again.");
//       } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
//         setError("No camera found on this device.");
//       } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
//         setError("Camera is already in use by another application.");
//       } else if (err.name === 'OverconstrainedError') {
//         // facingMode এরর হলে ভিন্ন কনস্ট্রেইন্ট দিয়ে চেষ্টা
//         try {
//           const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
//           streamRef.current = fallbackStream;
//           if (videoRef.current) {
//             videoRef.current.srcObject = fallbackStream;
//             videoRef.current.setAttribute('playsinline', 'true');
//             await new Promise((resolve) => {
//               if (videoRef.current) {
//                 videoRef.current.onloadedmetadata = () => { 
//                   videoRef.current?.play(); 
//                   resolve(true); 
//                 };
//               } else {
//                 resolve(true);
//               }
//             });
//             setIsCameraReady(true);
//             setCameraPermission(true);
//             startScanner();
//             return;
//           }
//         } catch (fallbackErr) {
//           setError("Camera error: Unable to access camera with default settings.");
//         }
//       } else {
//         setError(`Camera error: ${err.message || 'Unknown error'}`);
//       }
//     }
//   };

//   const startScanner = () => {
//   if (!videoRef.current) return;
//     try {
//       const reader = new BrowserMultiFormatReader();
//       scannerRef.current = reader;
      
//       reader.decodeFromVideoElement(videoRef.current, (result, err) => {
//         if (result && scanning && !isProcessing) {
//           stopScanner();
//           processScan(result.getText());
//         }
//         if (err && !result && err.name !== "NotFoundException") {
//           console.error("Scanner error:", err);
//         }
//       }).catch((err) => {
//         console.error("Failed to start scanner:", err);
//         setError("Failed to start scanner. Please try again.");
//       });
//     } catch (err: any) {
//       console.error("Scanner initialization error:", err);
//       setError(err.message || "Scanner initialization failed");
//     }
//   };

//   const stopScanner = () => {
//     if (scannerRef.current) {
//       try {
//         scannerRef.current.reset();
//       } catch (err) {
//         console.error("Error resetting scanner:", err);
//       }
//       scannerRef.current = null;
//     }

//     if (streamRef.current) {
//       try {
//         streamRef.current.getTracks().forEach(track => track.stop());
//       } catch (err) {
//         console.error("Error stopping tracks:", err);
//       }
//       streamRef.current = null;
//     }

//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
    
//     setIsCameraReady(false);
//   };

//   useEffect(() => {
//     const timer = setTimeout(initCamera, 500);
//     return () => { 
//       clearTimeout(timer); 
//       stopScanner(); 
//     };
//   }, []);

//   const retryScanner = () => {
//     setError(null);
//     setCameraPermission(null);
//     setScanning(true);
//     setIsCameraReady(false);
//     setScannedData(null);
//     stopScanner();
//     setTimeout(initCamera, 500);
//   };
// useEffect(() => {
//   if (isCameraReady && scanning && !isProcessing && !error) {
//     startScanner();
//   }
// }, [isCameraReady, scanning, isProcessing, error]);
//   return (
//     <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-9999 p-4 animate-fadeIn">
//       <div className="bg-linear-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-slideUp">
        
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
//             onClick={onClose}
//             className="text-white/80 hover:text-white transition-all hover:bg-white/10 rounded-full p-2"
//           >
//             <FaTimes className="text-xl" />
//           </button>
//         </div>
        
//         {/* Content */}
//         <div className="p-6">
          
//           {/* Error Message */}
//           {error && (
//             <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3">
//               <div className="bg-red-100 p-2 rounded-full shrink-0">
//                 <FaExclamationTriangle className="text-red-500 text-sm" />
//               </div>
//               <div className="flex-1">
//                 <p className="text-red-700 text-sm font-medium whitespace-pre-line">{error}</p>
//                 <button
//                   onClick={retryScanner}
//                   className="mt-2 text-red-600 text-xs font-semibold hover:text-red-700"
//                 >
//                   Try Again →
//                 </button>
//               </div>
//             </div>
//           )}
          
//           {/* Scanner Container */}
//           {!error && (
//             <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black">
//               {/* Video Element */}
//               <video
//                 ref={videoRef}
//                 className="w-full h-[400px] object-cover"
//                 playsInline
//                 muted
//                 autoPlay
//               />
              
//               {/* Loading Overlay */}
//               {cameraPermission === null && (
//                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
//                   <div className="text-center">
//                     <FaSpinner className="text-white text-4xl animate-spin mx-auto mb-3" />
//                     <p className="text-white text-sm">Requesting camera access...</p>
//                   </div>
//                 </div>
//               )}
              
//               {/* No Camera Permission */}
//               {cameraPermission === false && (
//                 <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
//                   <div className="text-center p-6">
//                     <FaCamera className="text-gray-400 text-5xl mx-auto mb-3" />
//                     <p className="text-white text-sm mb-2">Camera access required</p>
//                     <p className="text-gray-400 text-xs mb-4">Please allow camera access to scan QR codes</p>
//                     <button
//                       onClick={retryScanner}
//                       className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all"
//                     >
//                       Grant Permission
//                     </button>
//                   </div>
//                 </div>
//               )}
              
//               {/* Scanner Overlay */}
//               {scanning && cameraPermission === true && !isProcessing && isCameraReady && (
//                 <div className="absolute inset-0 pointer-events-none">
//                   <div className="absolute inset-0 bg-black/50">
//                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-transparent">
//                       <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-500 rounded-tl-2xl"></div>
//                       <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-500 rounded-tr-2xl"></div>
//                       <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-500 rounded-bl-2xl"></div>
//                       <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-500 rounded-br-2xl"></div>
//                     </div>
//                   </div>
//                   <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scanLine"></div>
//                 </div>
//               )}
              
//               {/* Processing Overlay */}
//               {isProcessing && (
//                 <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
//                   <div className="text-center">
//                     <FaSpinner className="text-white text-4xl animate-spin mx-auto mb-3" />
//                     <p className="text-white text-sm font-medium">Processing QR Code...</p>
//                     <p className="text-gray-300 text-xs mt-1">Please wait</p>
//                   </div>
//                 </div>
//               )}
              
//               {/* Instruction Text */}
//               {scanning && cameraPermission === true && !isProcessing && isCameraReady && (
//                 <div className="absolute bottom-4 left-4 right-4 text-center">
//                   <div className="bg-black/60 backdrop-blur-sm rounded-full py-2 px-4 inline-block mx-auto">
//                     <p className="text-white text-xs flex items-center gap-2">
//                       <FaQrcode className="text-green-400" />
//                       Position QR code within the frame
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
          
//           {/* Scanned Data Card - Success */}
//           {scannedData && !error && (
//             <div className="mt-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 animate-slideUp">
//               <div className="flex items-center gap-3 mb-3">
//                 <div className="bg-green-100 p-2 rounded-full">
//                   <FaCheckCircle className="text-green-600 text-xl" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-green-800">Scan Successful!</h3>
//                   <p className="text-green-600 text-xs">Passenger verified</p>
//                 </div>
//               </div>
              
//               <div className="space-y-2 text-sm">
//                 {scannedData.passenger && (
//                   <div className="flex justify-between items-center border-b border-green-200 pb-2">
//                     <span className="text-gray-600">Passenger Name:</span>
//                     <span className="font-semibold text-gray-800">{scannedData.passenger.name || "N/A"}</span>
//                   </div>
//                 )}
//                 {scannedData.booking_id && (
//                   <div className="flex justify-between items-center border-b border-green-200 pb-2">
//                     <span className="text-gray-600">Booking ID:</span>
//                     <span className="font-mono text-sm text-gray-800">{scannedData.booking_id}</span>
//                   </div>
//                 )}
//                 {scannedData.status && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600">Status:</span>
//                     <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
//                       {scannedData.status}
//                     </span>
//                   </div>
//                 )}
//               </div>
              
//               <div className="mt-4 text-center">
//                 <p className="text-green-600 text-xs animate-pulse">
//                   Closing in 3 seconds...
//                 </p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
        
//         @keyframes slideUp {
//           from {
//             transform: translateY(50px);
//             opacity: 0;
//           }
//           to {
//             transform: translateY(0);
//             opacity: 1;
//           }
//         }
        
//         @keyframes scanLine {
//           0% { top: 0%; }
//           100% { top: 100%; }
//         }
        
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
        
//         @keyframes pulse {
//           0%, 100% { opacity: 1; }
//           50% { opacity: 0.5; }
//         }
        
//         .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
//         .animate-slideUp { animation: slideUp 0.3s ease-out; }
//         .animate-scanLine { animation: scanLine 2s linear infinite; }
//         .animate-spin { animation: spin 1s linear infinite; }
//         .animate-pulse { animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
//       `}</style>
//     </div>
//   );
// };

// export default QRScannerComponent;

import React, { useState, useEffect, useRef } from 'react';
import { FaQrcode, FaCheckCircle, FaExclamationTriangle, FaTimes, FaCamera, FaSpinner } from 'react-icons/fa';
import { BrowserMultiFormatReader } from '@zxing/browser';

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
  token 
}) => {
  const [scannedData, setScannedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);


  const isCameraContextAllowed = (): boolean => {
    return (
      window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '192.168.0.106:8100'
    );
  };

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude });
          },
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    });
  };

  const processScan = async (qrToken: string) => {
    if (!tripId || !token) {
      setError("Trip or authentication information missing");
      return;
    }

    setIsProcessing(true);
    setScanning(false);
    
    try {
      const { lat, lng } = await getCurrentLocation();

      const requestBody = { qr_token: qrToken, lat, lng };
      const response = await fetch(
        `https://be.shuttleapp.transev.site/driver/scan/${tripId}/scan`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || "Scan failed");

      setScannedData(data);
      if (onScanSuccess) onScanSuccess(data);

      setTimeout(() => onClose(), 3000);
    } catch (err: any) {
      console.error("Process scan error:", err);
      setError(err.message || "Scan failed");
      setScanning(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const initCamera = async () => {
    if (!videoRef.current) {
      setError("Video element not found");
      return;
    }

    // Only allow HTTPS or localhost
    if (!isCameraContextAllowed()) {
      setError(
        "⚠️ Camera access requires HTTPS or localhost.\n\n" +
        `Current URL: ${window.location.href}\n\n` +
        "Please use:\n" +
        "• https://your-domain.com\n" +
        "• http://localhost:8100\n" +
        "• http://127.0.0.1:8100\n" +
        "• http://192.168.0.106:8100\n");
      setCameraPermission(false);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        "❌ Camera API is unavailable in this page context.\n\n" +
        "This usually means:\n" +
        "• Page is not running on HTTPS/localhost\n" +
        "• Page is embedded in a restricted frame/webview\n" +
        "• Browser permissions are blocked\n\n" +
        `Current URL: ${window.location.href}\n` +
        `Secure Context: ${window.isSecureContext}`
      );
      setCameraPermission(false);
      return;
    }

    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      const constraints = { 
        video: { 
          facingMode: isMobile ? 'environment' : 'user', 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        } 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => { 
              videoRef.current?.play().catch(e => console.log("Play error:", e));
              resolve(true); 
            };
          } else {
            resolve(true);
          }
        });
        
        setIsCameraReady(true);
        setCameraPermission(true);
      }
    } catch (err: any) {
      console.error("Camera error:", err);
      setCameraPermission(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError(
          "📷 Camera permission denied.\n\n" +
          "Please allow camera access:\n" +
          "• Click the camera icon in address bar\n" +
          "• Check browser settings\n" +
          "• Refresh and try again"
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError("No camera found on this device.");
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError("Camera is already in use by another application.");
      } else if (err.name === 'OverconstrainedError') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            videoRef.current.setAttribute('playsinline', 'true');
            await new Promise((resolve) => {
              if (videoRef.current) {
                videoRef.current.onloadedmetadata = () => { 
                  videoRef.current?.play().catch(e => console.log("Play error:", e));
                  resolve(true); 
                };
              } else {
                resolve(true);
              }
            });
            setIsCameraReady(true);
            setCameraPermission(true);
            return;
          }
        } catch (fallbackErr) {
          setError("Camera error: Unable to access camera with default settings.");
        }
      } else {
        setError(`Camera error: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const startScanner = () => {
    if (!videoRef.current) {
      console.log("Video ref not ready");
      return;
    }
    
    if (scannerRef.current) {
      console.log("Scanner already running");
      return;
    }
    
    try {
      const reader = new BrowserMultiFormatReader();
      scannerRef.current = reader;
      
      reader.decodeFromVideoElement(videoRef.current, (result, err) => {
        if (result && scanning && !isProcessing) {
          console.log("QR Code detected:", result.getText());
          stopScanner();
          processScan(result.getText());
        }
        if (err && !result && err.name !== "NotFoundException") {
          console.error("Scanner error:", err);
        }
      }).catch((err) => {
        console.error("Failed to start decoder:", err);
        setError("Failed to start scanner. Please try again.");
        scannerRef.current = null;
      });
    } catch (err: any) {
      console.error("Scanner initialization error:", err);
      setError(err.message || "Scanner initialization failed");
      scannerRef.current = null;
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.reset();
      } catch (err) {
        console.error("Error resetting scanner:", err);
      }
      scannerRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error("Error stopping tracks:", err);
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraReady(false);
  };

  useEffect(() => {
    if (isCameraReady && scanning && !isProcessing && !error && !scannerRef.current) {
      console.log("Starting scanner - camera ready");
      const timer = setTimeout(() => {
        startScanner();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCameraReady, scanning, isProcessing, error]);

  useEffect(() => {
    console.log("Initializing camera...");
    const timer = setTimeout(initCamera, 500);
    return () => { 
      clearTimeout(timer); 
      stopScanner(); 
    };
  }, []);

  const retryScanner = () => {
    console.log("Retrying scanner...");
    setError(null);
    setCameraPermission(null);
    setScanning(true);
    setIsCameraReady(false);
    setScannedData(null);
    stopScanner();
    setTimeout(initCamera, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-9999 p-4 animate-fadeIn">
      <div className="bg-linear-to-br from-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-slideUp">
        
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-500 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <FaQrcode className="text-white text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Scan QR Code</h2>
              <p className="text-blue-100 text-xs">Position QR code within the frame</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-all hover:bg-white/10 rounded-full p-2"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          
          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="bg-red-100 p-2 rounded-full shrink-0">
                  <FaExclamationTriangle className="text-red-500 text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-red-700 text-sm font-medium whitespace-pre-line">{error}</p>
                  <button
                    onClick={retryScanner}
                    className="mt-2 text-red-600 text-xs font-semibold hover:text-red-700"
                  >
                    Try Again →
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Scanner Container */}
          {!error && (
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black">
              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full h-[400px] object-cover"
                playsInline
                muted
                autoPlay
              />
              
              {/* Loading Overlay */}
              {cameraPermission === null && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <FaSpinner className="text-white text-4xl animate-spin mx-auto mb-3" />
                    <p className="text-white text-sm">Requesting camera access...</p>
                  </div>
                </div>
              )}
              
              {/* No Camera Permission */}
              {cameraPermission === false && (
                <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
                  <div className="text-center p-6">
                    <FaCamera className="text-gray-400 text-5xl mx-auto mb-3" />
                    <p className="text-white text-sm mb-2">Camera access required</p>
                    <p className="text-gray-400 text-xs mb-4">Please allow camera access to scan QR codes</p>
                    <button
                      onClick={retryScanner}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all"
                    >
                      Grant Permission
                    </button>
                  </div>
                </div>
              )}
              
              {/* Scanner Overlay */}
              {scanning && cameraPermission === true && !isProcessing && isCameraReady && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-black/50">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-transparent">
                      <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-green-500 rounded-tl-2xl"></div>
                      <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-green-500 rounded-tr-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-green-500 rounded-bl-2xl"></div>
                      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-green-500 rounded-br-2xl"></div>
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-green-500 to-transparent animate-scanLine"></div>
                </div>
              )}
              
              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <FaSpinner className="text-white text-4xl animate-spin mx-auto mb-3" />
                    <p className="text-white text-sm font-medium">Processing QR Code...</p>
                    <p className="text-gray-300 text-xs mt-1">Please wait</p>
                  </div>
                </div>
              )}
              
              {/* Instruction Text */}
              {scanning && cameraPermission === true && !isProcessing && isCameraReady && (
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <div className="bg-black/60 backdrop-blur-sm rounded-full py-2 px-4 inline-block mx-auto">
                    <p className="text-white text-xs flex items-center gap-2">
                      <FaQrcode className="text-green-400" />
                      Position QR code within the frame
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Scanned Data Card - Success */}
          {scannedData && !error && (
            <div className="mt-5 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 animate-slideUp">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <FaCheckCircle className="text-green-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800">Scan Successful!</h3>
                  <p className="text-green-600 text-xs">Passenger verified</p>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                {scannedData.passenger && (
                  <div className="flex justify-between items-center border-b border-green-200 pb-2">
                    <span className="text-gray-600">Passenger Name:</span>
                    <span className="font-semibold text-gray-800">{scannedData.passenger.name || "N/A"}</span>
                  </div>
                )}
                {scannedData.booking_id && (
                  <div className="flex justify-between items-center border-b border-green-200 pb-2">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-mono text-sm text-gray-800">{scannedData.booking_id}</span>
                  </div>
                )}
                {scannedData.status && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold">
                      {scannedData.status}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-green-600 text-xs animate-pulse">
                  Closing in 3 seconds...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes scanLine {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-scanLine { animation: scanLine 2s linear infinite; }
        .animate-spin { animation: spin 1s linear infinite; }
        .animate-pulse { animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};

export default QRScannerComponent;