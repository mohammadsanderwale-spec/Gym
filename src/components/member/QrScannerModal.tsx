import React, { useState, useRef, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import {
  QrCode,
  Scan,
  CheckCircle2,
  AlertTriangle,
  X,
  Zap,
  Clock,
  Sparkles,
  Camera,
  VideoOff,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QrScannerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    activeMember,
    currentQrSession,
    processQrCheckIn,
    setCurrentRole,
  } = useGym();

  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    duplicate?: boolean;
    expired?: boolean;
  } | null>(null);

  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera when closing
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported on this device/browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera request error:', err);
      setCameraError(
        err.message || 'Camera permission denied or camera device unavailable.'
      );
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen || !activeMember) return null;

  const handleSimulateScan = (tokenToUse?: string) => {
    const token = tokenToUse || currentQrSession.token;
    const res = processQrCheckIn(activeMember.id, token);
    setScanResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px] font-bold uppercase tracking-wider mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>SCREEN 2: GATE QR CHECK-IN</span>
          </div>
          <h3 className="text-lg font-black text-white">Member Gate Check-In</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Checking in as <strong className="text-amber-300">{activeMember.name}</strong> ({activeMember.phone})
          </p>
        </div>

        {/* Viewfinder Graphic / Real Camera Feed */}
        <div className="relative w-full max-w-[280px] h-64 mx-auto bg-zinc-950 rounded-2xl border-2 border-zinc-800 flex flex-col items-center justify-center p-4 overflow-hidden shadow-inner">
          {/* Animated scanning laser line */}
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-lg shadow-amber-400 animate-pulse z-10" style={{ top: '48%' }} />

          {/* Corner marks */}
          <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-amber-400 z-10"></div>
          <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-amber-400 z-10"></div>
          <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-amber-400 z-10"></div>
          <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-amber-400 z-10"></div>

          {/* Real video feed or simulated radar */}
          {isCameraActive ? (
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="text-center space-y-2 z-0">
              <QrCode className="w-20 h-20 text-zinc-600 mx-auto" />
              <div className="text-[11px] font-mono text-amber-300 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-700">
                Live Gate Token: {currentQrSession.token}
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center justify-center space-x-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Rotates every 30s ({currentQrSession.expiresInSeconds}s left)</span>
              </div>
            </div>
          )}
        </div>

        {/* Camera toggle error */}
        {cameraError && (
          <p className="text-[11px] text-amber-400 text-center mt-2">
            {cameraError} You can still use the 1-Tap Entrance Scan below!
          </p>
        )}

        {/* Scan outcome alerts */}
        {scanResult && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start space-x-2.5 ${
              scanResult.success
                ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200'
                : scanResult.duplicate
                ? 'bg-amber-950/40 border-amber-500/80 text-amber-200'
                : 'bg-red-950/40 border-red-500/80 text-red-200'
            }`}
          >
            {scanResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-bold text-sm">{scanResult.success ? 'Attendance Verified!' : 'Check-in Notice'}</div>
              <div className="text-xs mt-0.5 leading-relaxed">{scanResult.message}</div>
            </div>
          </div>
        )}

        {/* Step-by-Step Explanation Banner */}
        <div className="mt-4 p-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-xs text-zinc-300 space-y-1.5">
          <div className="font-bold text-white flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>How QR Check-In Works:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400">
            <li>Customer walks up to gym entrance gate/turnstile.</li>
            <li>Customer taps <strong>&quot;Gate QR Check-In&quot;</strong> and scans the tablet display.</li>
            <li>System verifies active pass &amp; duplicate cooldown (5 min) &rarr; updates streak &amp; awards confetti!</li>
          </ol>
        </div>

        {/* Interactive Action Controls */}
        <div className="mt-4 space-y-2">
          {/* Main 1-Tap Entrance Scan */}
          <button
            onClick={() => handleSimulateScan(currentQrSession.token)}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <Scan className="w-4 h-4 text-zinc-950" />
            <span>1-Tap Scan Live Gate Code ({currentQrSession.token})</span>
          </button>

          {/* Device Camera toggle & Gate Terminal switch */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {isCameraActive ? (
              <button
                onClick={stopCamera}
                className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center space-x-1.5 transition"
              >
                <VideoOff className="w-3.5 h-3.5" />
                <span>Turn Camera Off</span>
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl flex items-center justify-center space-x-1.5 transition"
              >
                <Camera className="w-3.5 h-3.5 text-emerald-400" />
                <span>Use Phone Camera</span>
              </button>
            )}

            <button
              onClick={() => {
                stopCamera();
                onClose();
                setCurrentRole('gate');
              }}
              className="py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl flex items-center justify-center space-x-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>View Gate Display</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 pt-1 text-[11px]">
            <button
              onClick={() => handleSimulateScan('EXPIRED-QR-SESSION-000')}
              className="flex-1 py-1.5 bg-zinc-950 border border-zinc-800 text-zinc-500 hover:text-zinc-300 rounded-lg transition"
            >
              Test Expired QR Token
            </button>
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
