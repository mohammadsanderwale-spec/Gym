import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { QrScannerModal } from './QrScannerModal';
import { RenewalModal } from './RenewalModal';
import { AddonMarketplace } from './AddonMarketplace';
import {
  QrCode,
  Flame,
  Calendar,
  CreditCard,
  ShoppingBag,
  Sparkles,
  Camera,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const MemberDashboard: React.FC = () => {
  const {
    activeMember,
    activeMembership,
    activeStreak,
    attendance,
    currentQrSession,
    setIsAiChatOpen,
    setIsAiImageAnalyzerOpen,
    setAiAnalyzerPreset,
  } = useGym();

  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'addons' | 'history'>('home');

  if (!activeMember || !activeMembership) return null;

  const safeStreak = activeStreak || {
    currentStreakDays: 0,
    bestStreakDays: 0,
    weeklyCompleted: 0,
    weeklyTarget: 4,
  };

  // Calculate days until expiry
  const expiryTime = new Date(activeMembership.expiryDate).getTime();
  const daysUntilExpiry = Math.ceil((expiryTime - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysUntilExpiry <= 7;

  // Member's attendance history
  const memberAttendance = attendance.filter((a) => a.memberId === activeMember.id);

  return (
    <div className="space-y-6">
      {/* Qr Scanner & Renewal Modals */}
      <QrScannerModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      {isRenewalModalOpen && <RenewalModal />}

      {/* Member Profile Hero Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-2xl shadow-xl shadow-amber-500/20 shrink-0">
              {activeMember.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{activeMember.name}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    activeMember.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : activeMember.status === 'paused'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {activeMember.status}
                </span>
              </div>
              <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>{activeMember.phone}</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">{activeMembership.planName}</span>
                <span>•</span>
                <span>Assigned: {activeMember.assignedTrainerName || 'Floor Trainer'}</span>
              </div>
            </div>
          </div>

          {/* Gate QR Scan Main CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center space-x-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black px-6 py-3.5 rounded-2xl shadow-xl shadow-amber-500/25 transition active:scale-95 text-sm"
            >
              <QrCode className="w-5 h-5 text-zinc-950" />
              <span>Gate QR Check-In</span>
            </button>

            {isExpiringSoon && (
              <button
                onClick={() => setIsRenewalModalOpen(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold px-4 py-3.5 rounded-2xl shadow-xl shadow-red-600/20 text-xs transition active:scale-95 animate-pulse"
              >
                <CreditCard className="w-4 h-4" />
                <span>Renew (Expires in {daysUntilExpiry}d)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'home'
              ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Habit &amp; Streak (Screen 2)</span>
        </button>

        <button
          onClick={() => setActiveTab('addons')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'addons'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Add-on Store &amp; PT (Screen 4)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'history'
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Attendance Log ({memberAttendance.length})</span>
        </button>
      </div>

      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* Streak & Renewal 2-Col Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SCREEN 2: 18-DAY FAIR STREAK CARD (From Blueprint Page 1 & 5 Reel mockup) */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                      <Flame className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                      FAIR STREAK TRACKER
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Rule: Planned Workout Visits
                  </span>
                </div>

                {/* Massive 18-Day Badge */}
                <div className="flex items-baseline space-x-3 my-2">
                  <span className="text-5xl font-black text-white font-mono tracking-tight">
                    {safeStreak.currentStreakDays}
                  </span>
                  <div>
                    <span className="text-lg font-bold text-amber-400 block leading-tight">
                      Day Streak
                    </span>
                    <span className="text-xs text-zinc-400">
                      Personal Best: {safeStreak.bestStreakDays} Days
                    </span>
                  </div>
                </div>

                {/* Weekly Goal Progress */}
                <div className="mt-4 p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium">This Week&apos;s Workout Goal:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {safeStreak.weeklyCompleted} of {safeStreak.weeklyTarget} Sessions
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (safeStreak.weeklyCompleted / (safeStreak.weeklyTarget || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Fair Streak Protection explanation (Blueprint Page 6) */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-start space-x-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Motivation without manipulation:</strong> Planned rest days &amp; approved travel freezes do NOT unfairly break your streak. We celebrate discipline, not burnout.
                </span>
              </div>
            </div>

            {/* SCREEN 3: RENEWAL & EXPIRY PIPELINE CARD */}
            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      MEMBERSHIP EXPIRY STATUS
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                      isExpiringSoon
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {isExpiringSoon ? 'Renewal Window Open' : 'Active'}
                  </span>
                </div>

                <div className="space-y-1.5 my-2">
                  <div className="text-xs text-zinc-400">Valid Through:</div>
                  <div className="text-2xl font-black text-white font-mono">
                    {activeMembership.expiryDate}
                  </div>
                  <div className="text-xs font-medium text-amber-300">
                    {daysUntilExpiry > 0 ? `${daysUntilExpiry} Days Remaining` : 'Expired Today'}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 text-xs text-zinc-300 space-y-1">
                  <div className="font-semibold text-white">Recommended Continuation:</div>
                  <div className="text-zinc-400 text-[11px]">
                    3-Month Quarterly Pack @ ₹3,999 (Save ₹800). Includes free locker &amp; diet consult.
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80">
                <button
                  onClick={() => setIsRenewalModalOpen(true)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Review Renewal Options &amp; Save ₹800</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI ASSISTANCE CARDS (Gemini 3.1 Pro Preview & Multiturn Coach) */}
          <div className="bg-gradient-to-r from-indigo-950/40 via-zinc-900 to-purple-950/40 border border-indigo-900/50 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    IronForge Gemini AI Fitness Intelligence
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Multiturn Indian Gym Coach &amp; Gemini 3.1 Pro Vision analyzer
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => {
                  setAiAnalyzerPreset('meal');
                  setIsAiImageAnalyzerOpen(true);
                }}
                className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl text-left transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">Scan Meal Photo</div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Upload Indian thali to calculate protein, carbs &amp; macros with gemini-3.1-pro-preview
                </p>
              </button>

              <button
                onClick={() => {
                  setAiAnalyzerPreset('workout_form');
                  setIsAiImageAnalyzerOpen(true);
                }}
                className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-amber-500/50 rounded-2xl text-left transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">Check Workout Form</div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Deadlift, squat posture &amp; biomechanics feedback by Gemini Pro Vision
                </p>
              </button>

              <button
                onClick={() => setIsAiChatOpen(true)}
                className="p-4 bg-zinc-900/90 hover:bg-zinc-800/90 border border-zinc-800 hover:border-indigo-500/50 rounded-2xl text-left transition group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">Chat with AI Coach</div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Multi-turn diet suggestions, desi protein sources &amp; training questions
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'addons' && <AddonMarketplace />}

      {activeTab === 'history' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold text-white text-base mb-3">Attendance History</h3>
          <div className="space-y-2">
            {memberAttendance.length === 0 ? (
              <p className="text-xs text-zinc-500">No attendance logs found yet.</p>
            ) : (
              memberAttendance.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-zinc-200">
                        {new Date(log.checkInTime).toLocaleDateString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Method:{' '}
                        {log.source === 'qr_scan'
                          ? 'Gate QR Scan'
                          : `Front Desk Assisted (${log.correctionReason || 'Manual'})`}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono text-zinc-400">
                    {new Date(log.checkInTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
