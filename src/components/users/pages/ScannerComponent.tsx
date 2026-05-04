import React, { useState, useEffect, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import {
  FaQrcode,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaSpinner,
  FaSyncAlt,
} from 'react-icons/fa';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface QRScannerComponentProps {
  onClose: () => void;
  onScanSuccess?: (data: any) => void;
  tripId?: string;
  token?: string;
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
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
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

  // Get current location
  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: 0, lng: 0 });
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: 0, lng: 0 }),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const [scanType, setScanType] = useState<"board" | "drop">("board");

  // Process scan with backend
  const processScan = async (qrToken: string) => {
    const activeToken = token || propToken;
    const activeTripId = tripId || propTripId;
    
    if (!activeTripId || !activeToken || isProcessing) {
      setError("Missing trip ID or authentication token");
      return;
    }

    setIsProcessing(true);
    
    // Stop scanner while processing
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
    }

    try {
      const { lat, lng } = await getCurrentLocation();

      const response = await fetch(
        `https://be.shuttleapp.transev.site/driver/scan/${activeTripId}/scan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            qr_token: qrToken,
            lat,
            lng,
            scan_type: scanType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Scan failed');
      }

      setScannedData(data);
      
      // Call success callback
      if (onScanSuccess) {
        onScanSuccess(data);
      }

      // Auto close after successful scan
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err: any) {
      console.error("Scan error:", err);
      setError(err.message || "Scan failed. Please try again.");
      setIsProcessing(false);
      
      // Restart scanner after error
      setTimeout(() => {
        setError(null);
        startScanner();
      }, 2000);
    }
  };

  const startScanner = async () => {
    try {
      // Stop existing scanner
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      setCameraStarted(false);
      setError(null);

      // Create scanner element
      const scannerElementId = "qr-reader";
      let element = document.getElementById(scannerElementId);
      if (!element) {
        const div = document.createElement('div');
        div.id = scannerElementId;
        div.style.width = '100%';
        div.style.height = '100%';
        document.getElementById('scanner-container')?.appendChild(div);
        element = div;
      }

      // Initialize scanner
      const html5QrCode = new Html5Qrcode(scannerElementId);
      scannerRef.current = html5QrCode;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      };

      await html5QrCode.start(
        { facingMode: cameraFacing },
        config,
        (decodedText) => {
          if (!isProcessing && decodedText && scanningRef.current) {
            processScan(decodedText);
          }
        },
        (errorMessage) => {
          // Ignore scanning errors - just log for debugging
          if (errorMessage && !errorMessage.includes('NotFoundException')) {
            console.debug("Scanning...", errorMessage);
          }
        }
      );

      setCameraStarted(true);

    } catch (err: any) {
      console.error("Camera error:", err);
      
      let errorMessage = "Unable to access camera. ";
      if (err.name === "NotAllowedError") {
        errorMessage += "Please grant camera permission.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No camera found on this device.";
      } else if (err.name === "NotReadableError") {
        errorMessage += "Camera is already in use by another application.";
      } else {
        errorMessage += err.message || "Please check your camera settings.";
      }
      
      setError(errorMessage);
      setCameraStarted(false);
    }
  };

  const stopScanner = async () => {
    scanningRef.current = false;
    
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    
    setCameraStarted(false);
  };

  const switchCamera = async () => {
    const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(newFacing);
    await stopScanner();
    setTimeout(() => {
      startScanner();
    }, 500);
  };

  const retryScanner = async () => {
    setError(null);
    setScannedData(null);
    setIsProcessing(false);
    scanningRef.current = true;
    await stopScanner();
    setTimeout(() => {
      startScanner();
    }, 500);
  };

  useEffect(() => {
    startScanner();
    
    return () => {
      stopScanner();
    };
  }, [cameraFacing]);

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FaQrcode className="text-xl" />
            <span className="font-semibold">Scan QR Code</span>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="hover:opacity-80 transition p-1 rounded-full hover:bg-white/20"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-3 flex items-center justify-between border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle />
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={retryScanner}
                className="text-sm font-semibold underline hover:no-underline flex items-center gap-1"
              >
                <FaSyncAlt className="text-xs" />
                Retry
              </button>
            </div>
          )}

          {/* Scan Type Selector */}
          <div className="flex gap-2 mb-4">
           <button
  onClick={() => setScanType("board")}
  style={{
    flex: 1,
    height: '48px',
    padding: '0 16px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    backgroundColor: scanType === "board" ? '#10B981' : (document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'),
    color: scanType === "board" ? '#FFFFFF' : (document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#4B5563'),
    boxShadow: scanType === "board" ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
    transform: scanType === "board" ? 'scale(1.02)' : 'scale(1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
  }}
  onMouseEnter={(e) => {
    if (scanType !== "board") {
      e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4B5563' : '#D1D5DB';
    }
  }}
  onMouseLeave={(e) => {
    if (scanType !== "board") {
      e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB';
    }
  }}
>
  <span style={{ fontSize: '16px' }}>🚌</span>
  Boarding
</button>

           <button
  onClick={() => setScanType("drop")}
  style={{
    flex: 1,
    height: '48px',
    padding: '0 16px',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    backgroundColor: scanType === "drop" ? '#3B82F6' : (document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'),
    color: scanType === "drop" ? '#FFFFFF' : (document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#4B5563'),
    boxShadow: scanType === "drop" ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
    transform: scanType === "drop" ? 'scale(1.02)' : 'scale(1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
  }}
  onMouseEnter={(e) => {
    if (scanType !== "drop") {
      e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#4B5563' : '#D1D5DB';
    }
  }}
  onMouseLeave={(e) => {
    if (scanType !== "drop") {
      e.currentTarget.style.backgroundColor = document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB';
    }
  }}
>
  <span style={{ fontSize: '16px' }}>🏁</span>
  Drop
</button>
</div>

          {/* Camera Switch Button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={switchCamera}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              title="Switch Camera"
            >
              <FaSyncAlt className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Scanner View */}
          <div className="relative bg-black rounded-xl h-87.5 overflow-hidden">
            <div id="scanner-container" className="w-full h-full"></div>

            {/* Scanner Frame Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 border-2 border-blue-500 rounded-2xl shadow-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-blue-500 rounded-tl-2xl"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-blue-500 rounded-tr-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-blue-500 rounded-bl-2xl"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-blue-500 rounded-br-2xl"></div>
                </div>
              </div>
              {/* Scanning line animation */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-0.5 bg-blue-500 animate-scan"></div>
            </div>

            {!cameraStarted && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center">
                  <FaSpinner className="animate-spin text-white text-4xl mx-auto mb-3" />
                  <p className="text-white text-sm">Starting camera...</p>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="text-center">
                  <FaSpinner className="animate-spin text-white text-4xl mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">Verifying passenger...</p>
                  <p className="text-white/70 text-xs mt-1">Please wait</p>
                </div>
              </div>
            )}
          </div>

          {/* Success Message */}
          {scannedData && (
            <div className="mt-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg flex items-center gap-2 border border-green-200 dark:border-green-800">
              <FaCheckCircle className="text-green-600 dark:text-green-400 text-lg" />
              <div>
                <p className="text-sm font-semibold">Success!</p>
                <p className="text-xs">
                  {scannedData.message || "Passenger verified successfully!"}
                  {scannedData.distance_meters && (
                    <span className="block text-xs mt-1">
                      📍 Distance: {scannedData.distance_meters.toFixed(2)} meters
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Position the QR code within the frame to scan
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Current mode: <span className="font-semibold text-blue-600 dark:text-blue-400">
                {scanType === "board" ? "Boarding" : "Drop-off"}
              </span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              📍 Location will be captured automatically for verification
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              ⚡ Must be within {scanType === "board" ? "pickup" : "dropoff"} stop radius
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% {
            transform: translate(-50%, -50%) translateY(-120px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(120px);
          }
          100% {
            transform: translate(-50%, -50%) translateY(-120px);
          }
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        
        .border-t-3 {
          border-top-width: 3px;
        }
        
        .border-l-3 {
          border-left-width: 3px;
        }
        
        .border-r-3 {
          border-right-width: 3px;
        }
        
        .border-b-3 {
          border-bottom-width: 3px;
        }
      `}</style>
    </div>
  );
};

export default QRScannerComponent;