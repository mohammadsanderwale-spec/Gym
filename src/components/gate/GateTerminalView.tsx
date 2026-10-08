import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import {
  QrCode,
  RotateCw,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const GateTerminalView: React.FC = () => {
  const {
    currentQrSession,
    refreshQrSession,
    attendance,
    members,
    processQrCheckIn,
  } = useGym();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCheckInNotice, setLastCheckInNotice] = useState<string | null>(null);

  // Today's attendance ticker
  const todayStr = new Date().toISOString().split('T')[0];
  const todayList = attendance.filter((a) => a.checkInTime.startsWith(todayStr));

  const handleQuickGateTap = (memberId: string) => {
    const res = processQrCheckIn(memberId, currentQrSession.token);
    setLastCheckInNotice(res.message);
    setTimeout(() => setLastCheckInNotice(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Terminal Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              LIVE ENTRANCE TERMINAL • IRONFORGE GATE 1
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Tablet placed at reception turnstile for member self check-in
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white transition flex items-center space-x-1"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-[11px] hidden sm:inline">Chime {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={refreshQrSession}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Force Rotate QR</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Display (Screen 2: Anti-screenshot Rotating QR) */}
      <div className="bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
        {/* Anti-screenshot Watermark */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-zinc-700 select-none">
          SECURE GATE PROTOCOL • TIMESTAMPS RECORDED
        </div>
        <div className="absolute top-3 right-4 text-[10px] font-mono text-zinc-700 select-none">
          {new Date().toLocaleTimeString()}
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Scan To Check-In
          </h2>
          <p className="text-xs text-zinc-400">
            Open the IronForge Member App on your phone and point camera at this QR code
          </p>

          {/* Big QR Code Container */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto bg-white p-4 rounded-3xl shadow-2xl flex flex-col items-center justify-center border-4 border-amber-400/80">
            {/* Real SVG QR pattern emulation */}
            <svg
              className="w-full h-full text-zinc-950"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Outer boundary marker top-left */}
              <rect x="5" y="5" width="26" height="26" fill="black" rx="3" />
              <rect x="9" y="9" width="18" height="18" fill="white" />
              <rect x="13" y="13" width="10" height="10" fill="black" />

              {/* Outer boundary marker top-right */}
              <rect x="69" y="5" width="26" height="26" fill="black" rx="3" />
              <rect x="73" y="9" width="18" height="18" fill="white" />
              <rect x="77" y="13" width="10" height="10" fill="black" />

              {/* Outer boundary marker bottom-left */}
              <rect x="5" y="69" width="26" height="26" fill="black" rx="3" />
              <rect x="9" y="73" width="18" height="18" fill="white" />
              <rect x="13" y="77" width="10" height="10" fill="black" />

              {/* Data matrix dots */}
              <rect x="36" y="8" width="6" height="6" fill="black" />
              <rect x="46" y="12" width="6" height="6" fill="black" />
              <rect x="56" y="8" width="6" height="6" fill="black" />
              <rect x="36" y="24" width="6" height="6" fill="black" />
              <rect x="46" y="28" width="6" height="6" fill="black" />
              <rect x="56" y="24" width="6" height="6" fill="black" />

              <rect x="10" y="40" width="8" height="8" fill="black" />
              <rect x="22" y="44" width="6" height="6" fill="black" />
              <rect x="34" y="40" width="8" height="8" fill="black" />
              <rect x="46" y="44" width="8" height="8" fill="black" />
              <rect x="58" y="40" width="8" height="8" fill="black" />
              <rect x="70" y="44" width="8" height="8" fill="black" />
              <rect x="82" y="40" width="8" height="8" fill="black" />

              <rect x="14" y="54" width="6" height="6" fill="black" />
              <rect x="26" y="58" width="6" height="6" fill="black" />
              <rect x="38" y="54" width="6" height="6" fill="black" />
              <rect x="50" y="58" width="6" height="6" fill="black" />
              <rect x="62" y="54" width="6" height="6" fill="black" />
              <rect x="74" y="58" width="6" height="6" fill="black" />

              <rect x="36" y="72" width="8" height="8" fill="black" />
              <rect x="48" y="76" width="6" height="6" fill="black" />
              <rect x="60" y="72" width="8" height="8" fill="black" />
              <rect x="72" y="76" width="6" height="6" fill="black" />
              <rect x="84" y="72" width="8" height="8" fill="black" />
            </svg>

            {/* Center IronForge Gym Icon */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 bg-amber-500 rounded-xl border-2 border-white flex items-center justify-center font-black text-zinc-950 text-xs shadow-lg">
                IF
              </div>
            </div>
          </div>

          {/* Session Token & Countdown Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 px-2">
              <span className="text-amber-400 font-bold">{currentQrSession.token}</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Rotates in {currentQrSession.expiresInSeconds}s</span>
              </span>
            </div>

            {/* Countdown progress bar */}
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-1000"
                style={{ width: `${(currentQrSession.expiresInSeconds / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Live Check-in notice popup */}
          {lastCheckInNotice && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 rounded-xl text-xs font-semibold animate-in zoom-in-95">
              {lastCheckInNotice}
            </div>
          )}

          {/* Quick simulator buttons for testing check-in from terminal */}
          <div className="pt-4 border-t border-zinc-800">
            <span className="text-[11px] text-zinc-500 block mb-2">
              Simulate Member Tap at Gate:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {members.slice(0, 5).map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleQuickGateTap(m.id)}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition"
                >
                  Tap: {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Check-In Ticker */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-xs sm:text-sm">
              Today&apos;s Live Turnstile Check-Ins ({todayList.length})
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Real-time gate audit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {todayList.slice(0, 9).map((item) => (
            <div
              key={item.id}
              className="p-2.5 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs"
            >
              <div>
                <div className="font-bold text-white">{item.memberName}</div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  {item.source === 'qr_scan' ? 'Gate QR Code' : 'Desk Assisted'}
                </div>
              </div>
              <span className="font-mono text-amber-300 font-bold">
                {new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
