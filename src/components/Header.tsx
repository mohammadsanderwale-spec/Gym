import React from 'react';
import { useGym } from '../context/GymContext';
import { UserRole } from '../types';
import {
  Dumbbell,
  Users,
  ShieldCheck,
  QrCode,
  RotateCcw,
  Sparkles,
  Camera,
  Bot,
  UserCheck,
  Layers,
  ChevronDown,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    members,
    activeMemberId,
    setActiveMemberId,
    activeMember,
    activeMembership,
    setIsAiChatOpen,
    setIsAiImageAnalyzerOpen,
    resetAllDataToDefault,
    currentQrSession,
  } = useGym();

  const roles: Array<{ id: UserRole; label: string; icon: React.ReactNode; badge?: string }> = [
    { id: 'owner', label: 'Owner & Manager', icon: <Users className="w-4 h-4" /> },
    { id: 'member', label: 'Member App', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'desk', label: 'Front Desk', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'gate', label: 'Gate Terminal', icon: <QrCode className="w-4 h-4" />, badge: `${currentQrSession.expiresInSeconds}s` },
    { id: 'qa', label: 'QA Sandbox', icon: <Layers className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
      {/* Top micro-bar */}
      <div className="bg-gradient-to-r from-amber-600/30 via-red-600/20 to-zinc-950 px-4 py-1 text-xs flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center space-x-2">
          <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase">
            ROY DIGITAL STUDIO
          </span>
          <span className="text-zinc-300 font-medium hidden sm:inline">
            REAL BUSINESS APP SYSTEM • GYM APP BLUEPRINT
          </span>
          <span className="text-zinc-400 text-[11px] hidden md:inline">
            (Silent churn ko early pakdo • Renewal time par collect karo)
          </span>
        </div>

        <div className="flex items-center space-x-3 text-[11px]">
          <button
            onClick={resetAllDataToDefault}
            title="Reset simulation data to default initial state"
            className="flex items-center space-x-1 text-zinc-400 hover:text-amber-400 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Mock Data</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-zinc-950 font-black">
            <Dumbbell className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">IRONFORGE</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                FITNESS
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 -mt-0.5 font-mono">Sector 14 • Gurugram</p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          {roles.map((r) => {
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setCurrentRole(r.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {r.icon}
                <span className="hidden md:inline">{r.label}</span>
                {r.badge && (
                  <span
                    className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                      isActive ? 'bg-zinc-950 text-amber-300' : 'bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    {r.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* AI Action Buttons & Active Member Selector */}
        <div className="flex items-center space-x-2">
          {/* Member Selector (when in Member view or Testing) */}
          {currentRole === 'member' && (
            <div className="relative flex items-center bg-zinc-900 border border-zinc-700/80 rounded-lg px-2 py-1 text-xs">
              <span className="text-zinc-400 mr-1 hidden sm:inline">Viewing:</span>
              <select
                value={activeMemberId}
                onChange={(e) => setActiveMemberId(e.target.value)}
                className="bg-transparent text-amber-300 font-semibold focus:outline-none cursor-pointer pr-4"
              >
                {members.slice(0, 15).map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-900 text-zinc-100">
                    {m.name} ({m.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* AI Chatbot button */}
          <button
            onClick={() => setIsAiChatOpen(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Gemini AI Coach</span>
          </button>

          {/* AI Image Analyzer button */}
          <button
            onClick={() => setIsAiImageAnalyzerOpen(true)}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AI Photo Scan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
