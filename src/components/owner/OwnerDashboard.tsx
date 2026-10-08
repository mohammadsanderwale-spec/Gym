import React, { useState, useMemo } from 'react';
import { useGym } from '../../context/GymContext';
import { NoShowCase, FollowUpOutcome, Member } from '../../types';
import {
  Users,
  AlertOctagon,
  CalendarCheck,
  CreditCard,
  ShoppingBag,
  Phone,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Play,
  FileText,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Dumbbell,
  ShieldAlert,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const {
    members,
    memberships,
    attendance,
    noShowCases,
    recordFollowUpOutcome,
    runDailyNoShowScan,
    payments,
    addOnOrders,
    addOnItems,
    logPtSessionUsage,
    settings,
  } = useGym();

  // Active view tab in Owner Dashboard
  const [activeTab, setActiveTab] = useState<'red_list' | 'renewals' | 'addons' | 'summary' | 'templates'>('red_list');

  // Red List Filters: 'all' | '10-14' | '15-21' | '22+' | 'expiring'
  const [redListFilter, setRedListFilter] = useState<'all' | '10-14' | '15-21' | '22+' | 'expiring'>('all');

  // Modal for Mark Follow-up Outcome
  const [selectedCaseForOutcome, setSelectedCaseForOutcome] = useState<NoShowCase | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<FollowUpOutcome>('will_return');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [nextActionDate, setNextActionDate] = useState(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [staffActorName, setStaffActorName] = useState('Karan Roy (Owner)');

  // Notification / Copy toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Top Cards Metrics (Page 14 Blueprint)
  const stats = useMemo(() => {
    const activeMembersCount = members.filter((m) => m.status === 'active').length;

    // Today's check-ins
    const todayStr = new Date().toISOString().split('T')[0];
    const todayCheckIns = attendance.filter((a) => a.checkInTime.startsWith(todayStr)).length;

    // 7-day active members
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const sevenDayActiveMembers = new Set(
      attendance
        .filter((a) => new Date(a.checkInTime).getTime() >= sevenDaysAgo)
        .map((a) => a.memberId)
    ).size;

    // Open no-show cases
    const openNoShowCases = noShowCases.filter((c) => c.status === 'open' || c.status === 'follow_up_due').length;

    // Members returned after follow-up
    const returnedMembers = noShowCases.filter((c) => c.status === 'returned').length;

    // Renewals due in 7 days
    const nowTime = new Date().getTime();
    const sevenDaysFuture = nowTime + 7 * 24 * 60 * 60 * 1000;
    const renewalsDue7Days = memberships.filter((m) => {
      const exp = new Date(m.expiryDate).getTime();
      return exp >= nowTime && exp <= sevenDaysFuture && m.status === 'active';
    }).length;

    // Renewal amount collected
    const renewalAmountCollected = payments
      .filter((p) => p.itemType === 'membership_renewal' && p.status === 'paid')
      .reduce((acc, curr) => acc + curr.amount, 0);

    // Add-on revenue this month
    const addOnRevenue = payments
      .filter((p) => p.itemType === 'addon' && p.status === 'paid')
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      activeMembersCount,
      todayCheckIns,
      sevenDayActiveMembers,
      openNoShowCases,
      returnedMembers,
      renewalsDue7Days,
      renewalAmountCollected,
      addOnRevenue,
    };
  }, [members, memberships, attendance, noShowCases, payments]);

  // Filtered Red List Cases
  const filteredCases = useMemo(() => {
    return noShowCases.filter((c) => {
      // Exclude cases for members currently paused or expired
      const member = members.find((m) => m.id === c.memberId);
      if (member?.status === 'paused' || member?.status === 'expired') return false;

      if (redListFilter === '10-14') {
        return c.daysAbsent >= 10 && c.daysAbsent <= 14;
      }
      if (redListFilter === '15-21') {
        return c.daysAbsent >= 15 && c.daysAbsent <= 21;
      }
      if (redListFilter === '22+') {
        return c.daysAbsent >= 22;
      }
      if (redListFilter === 'expiring') {
        const exp = new Date(c.expiryDate).getTime();
        const weekAway = Date.now() + 7 * 24 * 60 * 60 * 1000;
        return exp <= weekAway;
      }
      return true;
    });
  }, [noShowCases, redListFilter, members]);

  // Helper to open pre-filled WhatsApp message
  const handleOpenWhatsApp = (c: NoShowCase) => {
    const text =
      `Hi ${c.memberName}, aapka last gym check-in ${c.thresholdDate} ko tha (${c.daysAbsent} din pehle). ` +
      `Sab theek hai? Agar gym timing change, membership pause ya trainer guidance chahiye toh reply karein. - IronForge Gym Team`;
    const cleanPhone = c.memberPhone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    showToast(`WhatsApp draft opened for ${c.memberName}`);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Message copied to clipboard!');
  };

  // Submit outcome dialog
  const handleSubmitOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseForOutcome) return;

    recordFollowUpOutcome(
      selectedCaseForOutcome.id,
      outcomeStatus,
      outcomeNotes,
      nextActionDate,
      staffActorName
    );

    setSelectedCaseForOutcome(null);
    setOutcomeNotes('');
    showToast(`Follow-up outcome recorded as "${outcomeStatus.replace('_', ' ').toUpperCase()}".`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-zinc-950 px-4 py-2 rounded-xl font-bold shadow-2xl flex items-center space-x-2 text-xs animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Silent Churn Manifesto & Daily Scan trigger */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold rounded uppercase tracking-wider">
              SCREEN 1 &amp; OWNER COMMAND CENTER
            </span>
            <span className="text-xs text-zinc-400 font-mono">Rule: {settings.noShowThresholdDays}+ Days Inactive</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white mt-1">
            Silent Churn Prevention &amp; Retention Loop
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl mt-0.5">
            Member 10-15 din absent rehta hai, staff notice nahi karta aur mentally gym chhod chuka hota hai.
            Yeh daily queue owner ko call action deta hai taaki renewal time par fee collect ho.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              const res = runDailyNoShowScan();
              showToast(`Scan complete: ${res.newCasesAdded} new cases found, ${res.totalOpen} total in queue.`);
            }}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-zinc-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-amber-500/20 transition active:scale-95"
          >
            <Play className="w-4 h-4 text-zinc-950" />
            <span>Run Morning Inactivity Scan</span>
          </button>
        </div>
      </div>

      {/* 8 Action KPI Cards (Page 14 Blueprint) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl">
          <span className="text-[11px] text-zinc-400 font-medium block">Active Members</span>
          <div className="text-xl font-black text-white mt-0.5">{stats.activeMembersCount}</div>
          <span className="text-[10px] text-emerald-400 flex items-center mt-0.5">
            <TrendingUp className="w-3 h-3 mr-0.5" /> Enrolled
          </span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl">
          <span className="text-[11px] text-zinc-400 font-medium block">Today Check-ins</span>
          <div className="text-xl font-black text-amber-400 mt-0.5">{stats.todayCheckIns}</div>
          <span className="text-[10px] text-zinc-500 mt-0.5 block">Gate QR + Desk</span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl">
          <span className="text-[11px] text-zinc-400 font-medium block">7-Day Active</span>
          <div className="text-xl font-black text-white mt-0.5">{stats.sevenDayActiveMembers}</div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">
            {Math.round((stats.sevenDayActiveMembers / (stats.activeMembersCount || 1)) * 100)}% Activity
          </span>
        </div>

        <div className="bg-zinc-900/90 border border-red-900/40 bg-red-950/10 p-3 rounded-xl">
          <span className="text-[11px] text-red-300 font-medium block">Open Red List</span>
          <div className="text-xl font-black text-red-400 mt-0.5">{stats.openNoShowCases}</div>
          <span className="text-[10px] text-red-400 font-semibold mt-0.5 block">Action Required</span>
        </div>

        <div className="bg-zinc-900/90 border border-emerald-900/40 bg-emerald-950/10 p-3 rounded-xl">
          <span className="text-[11px] text-emerald-300 font-medium block">Returned Members</span>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{stats.returnedMembers}</div>
          <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">Churn Recovered</span>
        </div>

        <div className="bg-zinc-900/90 border border-amber-900/40 p-3 rounded-xl">
          <span className="text-[11px] text-amber-300 font-medium block">Renewals (7d)</span>
          <div className="text-xl font-black text-amber-300 mt-0.5">{stats.renewalsDue7Days}</div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">Expiring soon</span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl">
          <span className="text-[11px] text-zinc-400 font-medium block">Renewals Collected</span>
          <div className="text-xl font-black text-white mt-0.5">₹{stats.renewalAmountCollected.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Verified</span>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-3 rounded-xl">
          <span className="text-[11px] text-zinc-400 font-medium block">Add-on Revenue</span>
          <div className="text-xl font-black text-amber-400 mt-0.5">₹{stats.addOnRevenue.toLocaleString('en-IN')}</div>
          <span className="text-[10px] text-zinc-400 mt-0.5 block">PT + Supps</span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-2 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('red_list')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'red_list'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Screen 1: No-show Red List ({filteredCases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('renewals')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'renewals'
              ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Screen 3: Auto-Renewal Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('addons')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'addons'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Screen 4: Add-on Earnings &amp; PT</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'summary'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Daily Owner Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center space-x-2 ${
            activeTab === 'templates'
              ? 'bg-indigo-600 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Hinglish Message Templates</span>
        </button>
      </div>

      {/* TAB 1: SCREEN 1 - NO-SHOW RED LIST */}
      {activeTab === 'red_list' && (
        <div className="space-y-4">
          {/* Filters & Guidance */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span className="font-semibold text-zinc-300">Filter Inactivity:</span>
              <button
                onClick={() => setRedListFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  redListFilter === 'all' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All (10+ Days)
              </button>
              <button
                onClick={() => setRedListFilter('10-14')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  redListFilter === '10-14' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                10–14 Days
              </button>
              <button
                onClick={() => setRedListFilter('15-21')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  redListFilter === '15-21' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                15–21 Days
              </button>
              <button
                onClick={() => setRedListFilter('22+')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  redListFilter === '22+' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                22+ Days (High Risk)
              </button>
              <button
                onClick={() => setRedListFilter('expiring')}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  redListFilter === 'expiring' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Expiring Soon
              </button>
            </div>

            <div className="text-zinc-400 text-[11px] flex items-center space-x-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Paused &amp; Frozen memberships are safely excluded from Red List.</span>
            </div>
          </div>

          {/* Red List Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 font-semibold uppercase tracking-wider border-b border-zinc-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-3">Plan &amp; Expiry</th>
                    <th className="py-3 px-3 text-center">Absent Days</th>
                    <th className="py-3 px-3">Trainer</th>
                    <th className="py-3 px-4">Last Follow-up / Outcome</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80">
                  {filteredCases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-500">
                        No members matching this filter. All active members are training regularly!
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map((c) => {
                      const isHighRisk = c.daysAbsent >= 20;
                      const isReturned = c.status === 'returned';

                      return (
                        <tr
                          key={c.id}
                          className={`hover:bg-zinc-800/40 transition ${
                            isReturned ? 'bg-emerald-950/10' : isHighRisk ? 'bg-red-950/10' : ''
                          }`}
                        >
                          {/* Member */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-zinc-800 text-amber-400 font-bold flex items-center justify-center border border-zinc-700 shrink-0">
                                {c.memberName.split(' ').map((n) => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm flex items-center space-x-1.5">
                                  <span>{c.memberName}</span>
                                  {isReturned && (
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold border border-emerald-500/30">
                                      Returned
                                    </span>
                                  )}
                                </div>
                                <div className="text-zinc-400 font-mono text-[11px]">{c.memberPhone}</div>
                              </div>
                            </div>
                          </td>

                          {/* Plan */}
                          <td className="py-3.5 px-3">
                            <div className="font-medium text-zinc-200">{c.planName}</div>
                            <div className="text-[11px] text-zinc-500">Expires: {c.expiryDate}</div>
                          </td>

                          {/* Absent Days */}
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`inline-block font-extrabold px-2.5 py-1 rounded-full text-xs font-mono ${
                                isReturned
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : isHighRisk
                                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {isReturned ? 'Active' : `${c.daysAbsent} Days`}
                            </span>
                          </td>

                          {/* Trainer */}
                          <td className="py-3.5 px-3">
                            <span className="text-zinc-300">{c.assignedTrainerName || 'Unassigned'}</span>
                          </td>

                          {/* Last Follow-up Outcome */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {c.lastOutcome ? (
                              <div>
                                <div className="flex items-center space-x-1.5">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                      c.lastOutcome === 'will_return'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : c.lastOutcome === 'injured'
                                        ? 'bg-red-500/20 text-red-300'
                                        : c.lastOutcome === 'travelling'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : c.lastOutcome === 'timing_issue'
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'bg-zinc-800 text-zinc-300'
                                    }`}
                                  >
                                    {c.lastOutcome.replace('_', ' ')}
                                  </span>
                                  {c.nextActionDate && (
                                    <span className="text-[10px] text-zinc-500">
                                      Next: {c.nextActionDate}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400 mt-1 truncate">
                                  {c.lastOutcomeNote || 'Outcome noted'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-zinc-500 text-[11px] italic">No call logged yet today</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Direct Call */}
                              <a
                                href={`tel:${c.memberPhone}`}
                                title="Direct Phone Call"
                                className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                              >
                                <Phone className="w-3.5 h-3.5" />
                              </a>

                              {/* WhatsApp with template */}
                              <button
                                onClick={() => handleOpenWhatsApp(c)}
                                title="Send WhatsApp Message Template"
                                className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>

                              {/* Mark Outcome Modal Trigger */}
                              <button
                                onClick={() => {
                                  setSelectedCaseForOutcome(c);
                                  setOutcomeStatus(c.lastOutcome || 'will_return');
                                  setOutcomeNotes(c.lastOutcomeNote || '');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition shadow-sm shadow-amber-500/20"
                              >
                                Mark Outcome
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCREEN 3 - AUTO-RENEWAL PIPELINE */}
      {activeTab === 'renewals' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-white mb-1">
              Screen 3: Renewal Pipeline &amp; Expected Collections
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Expiry ke baad manual chasing ke bajay member ko 7 din pehle clear renewal options aur payment action milta hai.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider border-b border-zinc-800 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-3">Current Plan</th>
                    <th className="py-3 px-3">Expiry Date</th>
                    <th className="py-3 px-3">Days Remaining</th>
                    <th className="py-3 px-3">Recommended Renewal</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {memberships
                    .filter((m) => m.status === 'active')
                    .map((m) => {
                      const member = members.find((mem) => mem.id === m.memberId);
                      const expTime = new Date(m.expiryDate).getTime();
                      const daysLeft = Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24));
                      const isUrgent = daysLeft <= 7;

                      return (
                        <tr key={m.id} className={isUrgent ? 'bg-amber-950/20' : ''}>
                          <td className="py-3 px-4 font-bold text-white">
                            {member?.name || 'Member'}
                            <div className="text-[11px] font-normal text-zinc-400 font-mono">{member?.phone}</div>
                          </td>
                          <td className="py-3 px-3 text-zinc-300">{m.planName}</td>
                          <td className="py-3 px-3 font-mono text-zinc-300">{m.expiryDate}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                                daysLeft <= 3
                                  ? 'bg-red-500/20 text-red-300'
                                  : daysLeft <= 7
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'text-zinc-400'
                              }`}
                            >
                              {daysLeft > 0 ? `${daysLeft} days` : 'Expires today'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-zinc-300">
                            3-Month Pack (Save ₹800 • ₹3,999)
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                const cleanPhone = (member?.phone || '').replace(/[^0-9]/g, '');
                                const text =
                                  `Hi ${member?.name}, aapki ${m.planName} membership ${m.expiryDate} ko expire ho rahi hai. ` +
                                  `Special renewal offer: 3-Month Plan @ ₹3,999 (Save ₹800). Floor locker + free body scan included. Pay online ya reception par karein. - IronForge Gym`;
                                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs transition"
                            >
                              Send Renewal WhatsApp
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCREEN 4 - ADD-ONS & PERSONAL TRAINING */}
      {activeTab === 'addons' && (
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Screen 4: Add-on Earnings &amp; PT Package Utilization
                </h3>
                <p className="text-xs text-zinc-400">
                  Track Personal Training sessions conducted, nutrition consults booked, and sealed supplement inventory.
                </p>
              </div>
            </div>

            {/* Active PT Packages Table */}
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              Active Member PT Packages
            </h4>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 text-zinc-400 uppercase tracking-wider border-b border-zinc-800 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-4">Member</th>
                    <th className="py-2.5 px-3">PT Package</th>
                    <th className="py-2.5 px-3">Assigned Coach</th>
                    <th className="py-2.5 px-3 text-center">Sessions Used</th>
                    <th className="py-2.5 px-3">Valid Till</th>
                    <th className="py-2.5 px-4 text-right">Log Conducted Session</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {addOnOrders.map((o) => {
                    const remaining = o.totalQuantityOrSessions - o.usedQuantityOrSessions;
                    return (
                      <tr key={o.id}>
                        <td className="py-3 px-4 font-bold text-white">{o.memberName}</td>
                        <td className="py-3 px-3 text-zinc-300">{o.addOnTitle}</td>
                        <td className="py-3 px-3 text-amber-300 font-medium">{o.trainerOrNutritionist || 'Coach'}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          {o.usedQuantityOrSessions} / {o.totalQuantityOrSessions}
                          <span className="text-[10px] text-zinc-500 block">({remaining} left)</span>
                        </td>
                        <td className="py-3 px-3 text-zinc-400 font-mono">{o.expiryDate}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              const res = logPtSessionUsage(o.id);
                              showToast(res.message);
                            }}
                            disabled={remaining <= 0}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-white font-bold rounded-lg text-xs transition"
                          >
                            +1 Session Conducted
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Inventory Status */}
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              Genuine Gym Supplement Inventory
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addOnItems
                .filter((i) => i.type === 'supplements')
                .map((item) => (
                  <div key={item.id} className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-xs">{item.title}</div>
                      <div className="text-[11px] text-zinc-400">{item.subtitle}</div>
                      <div className="text-xs font-mono text-emerald-400 font-bold mt-1">₹{item.price} (with GST invoice)</div>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-1 bg-zinc-800 text-zinc-200 rounded-lg text-xs font-mono font-bold">
                        Stock: {item.stock ?? 'In Stock'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DAILY OWNER SUMMARY (AUTOMATION E) */}
      {activeTab === 'summary' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">Daily Owner Closing Summary</h3>
              <p className="text-xs text-zinc-400">
                Automated evening WhatsApp report for Gym Owner Karan Roy
              </p>
            </div>
            <button
              onClick={() => {
                const text =
                  `*IRONFORGE GYM DAILY CLOSING REPORT*\n` +
                  `Date: ${new Date().toLocaleDateString('en-IN')}\n\n` +
                  `• Today Check-ins: ${stats.todayCheckIns}\n` +
                  `• Open Red-List Cases: ${stats.openNoShowCases} members (10+ days)\n` +
                  `• Members Returned: ${stats.returnedMembers}\n` +
                  `• Renewals Expiring (7d): ${stats.renewalsDue7Days}\n` +
                  `• Total Fees Collected: ₹${(stats.renewalAmountCollected + stats.addOnRevenue).toLocaleString('en-IN')}\n\n` +
                  `Report generated by Gym App Blueprint System.`;
                navigator.clipboard.writeText(text);
                showToast('Daily summary copied!');
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy WhatsApp Report</span>
            </button>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 font-mono text-xs text-zinc-300 space-y-2 whitespace-pre-line leading-relaxed">
            {`📋 *IRONFORGE FITNESS - SECTOR 14 GURUGRAM*
📅 ${new Date().toDateString()} (Closing Audit)

1. TOTAL CHECK-INS TODAY: ${stats.todayCheckIns}
   • Gate QR Scans: ${attendance.filter((a) => a.source === 'qr_scan').length}
   • Assisted Front-Desk: ${attendance.filter((a) => a.source === 'assisted_desk').length}

2. SILENT CHURN STATUS (10+ DAYS INACTIVE):
   • Open Cases: ${stats.openNoShowCases} members
   • Churn Recovered / Returned: ${stats.returnedMembers} members

3. CASH FLOW & REVENUE COLLECTED:
   • Membership Renewals: ₹${stats.renewalAmountCollected.toLocaleString('en-IN')}
   • Add-on & PT Earnings: ₹${stats.addOnRevenue.toLocaleString('en-IN')}
   • Total Verified Revenue: ₹${(stats.renewalAmountCollected + stats.addOnRevenue).toLocaleString('en-IN')}

4. CRITICAL ACTION FOR TOMORROW:
   • Contact 6 high-risk members on Red List
   • Collect payment for 5 members expiring this week`}
          </div>
        </div>
      )}

      {/* TAB 5: HINGLISH MESSAGE TEMPLATES (Page 16 Blueprint) */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: '1. No-show Care Message',
              purpose: 'Sent when member is absent for 10+ days (not aggressive, caring tone)',
              template: 'Hi {{name}}, aapka last gym check-in {{last_visit}} ko tha. Sab theek hai? Agar timing change, approved pause ya trainer guidance chahiye toh yahan reply karein: {{support_link}}',
            },
            {
              title: '2. Renewal Reminder (7 Days Before)',
              purpose: 'Sent 7 days before membership expiry to encourage timely renewal',
              template: 'Hi {{name}}, aapki {{plan}} membership {{expiry_date}} ko expire hogi. Exclusive continuation plans and final payable amount yahan review karein: {{renewal_link}}',
            },
            {
              title: '3. Payment Success & Verified Invoice',
              purpose: 'Sent immediately after payment verification',
              template: '₹{{amount}} payment received successfully. Aapki IronForge membership {{new_expiry}} tak active kar di gayi hai. GST Tax Invoice: {{receipt_link}}',
            },
            {
              title: '4. Fair Streak Celebration',
              purpose: 'Sent when weekly goal completed (planned visits done)',
              template: 'Great discipline, {{name}}! Aapne is week {{completed}}/{{target}} planned workout visits complete kar liye hain. Next planned visit: {{next_visit}}. Keep crushing it!',
            },
            {
              title: '5. Personal Training Session Reminder',
              purpose: 'Sent 2 hours before scheduled 1-on-1 coach session',
              template: 'Aapka PT session aaj {{time}} par Coach {{trainer}} ke saath booked hai. Reschedule ya confirm karne ke liye: {{session_link}}',
            },
            {
              title: '6. Payment Failed Assistance',
              purpose: 'Sent when bank declines payment without spamming',
              template: 'Payment complete nahi ho paya. Agar aapka amount bank se debit hua ho toh 10 mins wait karein. Retry: {{payment_link}} | Reception Helpline: +91 98765 43210',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">{item.title}</h4>
                <p className="text-[11px] text-zinc-400 mb-2">{item.purpose}</p>
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 font-mono text-xs text-amber-200/90 leading-relaxed">
                  {item.template}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => handleCopyMessage(item.template)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Template</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MARK OUTCOME MODAL (Mandatory status: Will return, Injured, Travelling, Timing issue, Unhappy, No response, Cancelled) */}
      {selectedCaseForOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">
                  Record Follow-Up Outcome
                </h3>
                <p className="text-xs text-zinc-400">
                  Member: <strong className="text-amber-300">{selectedCaseForOutcome.memberName}</strong> ({selectedCaseForOutcome.daysAbsent} days absent)
                </p>
              </div>
              <button
                onClick={() => setSelectedCaseForOutcome(null)}
                className="text-zinc-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOutcome} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">
                  Mandatory Outcome Selection:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'will_return', label: 'Will Return (Promise to restart)' },
                    { id: 'injured', label: 'Injured / Medical Spasm' },
                    { id: 'travelling', label: 'Travelling / Out of Town' },
                    { id: 'timing_issue', label: 'Timing / Shift Issue' },
                    { id: 'unhappy', label: 'Unhappy with Gym / Crowd' },
                    { id: 'no_response', label: 'No Response / Call Not Picked' },
                    { id: 'cancelled', label: 'Cancelled / Shifted City' },
                  ].map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setOutcomeStatus(st.id as FollowUpOutcome)}
                      className={`p-2 rounded-lg border text-left transition ${
                        outcomeStatus === st.id
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-zinc-300 block mb-1">
                  Call Notes / Solution Offered:
                </label>
                <textarea
                  rows={3}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  placeholder="e.g. Member had seasonal flu; offered morning off-peak slot; suggested Coach Vikram rehabilitation session."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Next Follow-up Action Date:
                  </label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1">
                    Staff Actor:
                  </label>
                  <select
                    value={staffActorName}
                    onChange={(e) => setStaffActorName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Karan Roy (Owner)">Karan Roy (Owner)</option>
                    <option value="Simran Kaur (Desk)">Simran Kaur (Desk)</option>
                    <option value="Coach Vikram">Coach Vikram (Trainer)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedCaseForOutcome(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Save Outcome &amp; Update History
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
