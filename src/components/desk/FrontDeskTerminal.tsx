import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import {
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Clock,
  UserX,
  CreditCard,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';

export const FrontDeskTerminal: React.FC = () => {
  const {
    members,
    memberships,
    processAssistedCheckIn,
    toggleMemberPause,
    auditLogs,
  } = useGym();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [assistedReason, setAssistedReason] = useState('Forgot phone at home');
  const [customReason, setCustomReason] = useState('');
  const [staffName, setStaffName] = useState('Simran Kaur (Desk)');
  const [actionNotice, setActionNotice] = useState<{ success: boolean; message: string } | null>(null);

  // Filter members by query
  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery)
  );

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const selectedMembership = memberships.find((m) => m.memberId === selectedMemberId);

  const handleAssistedCheckIn = () => {
    if (!selectedMemberId) return;
    const finalReason = assistedReason === 'Other' ? customReason : assistedReason;

    const res = processAssistedCheckIn(selectedMemberId, finalReason, staffName);
    setActionNotice(res);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleTogglePause = () => {
    if (!selectedMemberId) return;
    toggleMemberPause(selectedMemberId, 'Office relocation / medical rest');
    setActionNotice({
      success: true,
      message: `Membership status updated for ${selectedMember?.name}. Audit log recorded.`,
    });
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              FRONT-DESK RECEPTION CONSOLE
            </span>
            <span className="text-xs text-zinc-400 font-mono">Operator: {staffName}</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white mt-1">
            Assisted Member Check-In &amp; Verification
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Journey D: Member forgot phone or camera broke? Front desk completes verified check-in with mandatory reason and immutable audit log.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-zinc-400">Staff Actor:</span>
          <select
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            className="bg-zinc-950 text-amber-300 font-semibold border border-zinc-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="Simran Kaur (Desk)">Simran Kaur (Desk)</option>
            <option value="Karan Roy (Owner)">Karan Roy (Owner)</option>
            <option value="Coach Vikram">Coach Vikram</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Search & Assisted Check-in Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Col 1: Member Lookup */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col h-[520px]">
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member name or phone..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredMembers.map((m) => {
              const isSelected = m.id === selectedMemberId;
              const mshp = memberships.find((mem) => mem.memberId === m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMemberId(m.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition text-xs ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 text-white'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{m.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        m.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : m.status === 'paused'
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{m.phone}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{mshp?.planName}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2: Assisted Action Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between">
          {selectedMember && selectedMembership ? (
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono uppercase">
                  Selected Member
                </span>
                <h3 className="text-lg font-black text-white mt-1">{selectedMember.name}</h3>
                <div className="text-zinc-400 font-mono">{selectedMember.phone}</div>
              </div>

              {/* Membership details */}
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Plan:</span>
                  <span className="text-zinc-200">{selectedMembership.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Expiry Date:</span>
                  <span className="text-amber-300 font-bold">{selectedMembership.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status:</span>
                  <span className="text-emerald-400 uppercase font-bold">{selectedMembership.status}</span>
                </div>
              </div>

              {/* Mandatory reason for assisted check-in */}
              <div>
                <label className="font-semibold text-zinc-300 block mb-1">
                  Mandatory Check-in Reason (Required for Audit):
                </label>
                <select
                  value={assistedReason}
                  onChange={(e) => setAssistedReason(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="Forgot phone at home">Forgot phone at home</option>
                  <option value="Phone battery dead">Phone battery dead</option>
                  <option value="Camera lens cracked/unusable">Camera lens cracked/unusable</option>
                  <option value="Turnstile sensor glitch">Turnstile sensor glitch</option>
                  <option value="Guest accompanied pass">Guest accompanied pass</option>
                  <option value="Other">Other (Custom reason)</option>
                </select>

                {assistedReason === 'Other' && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter specific audit reason..."
                    className="w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                )}
              </div>

              {/* Notice Banner */}
              {actionNotice && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                    actionNotice.success
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                      : 'bg-red-950/40 border-red-500 text-red-200'
                  }`}
                >
                  {actionNotice.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  )}
                  <span>{actionNotice.message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAssistedCheckIn}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center space-x-2"
                >
                  <UserCheck className="w-4 h-4 text-zinc-950" />
                  <span>Grant Assisted Check-in (Stamp with {staffName})</span>
                </button>

                <button
                  onClick={handleTogglePause}
                  className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5"
                >
                  {selectedMember.status === 'paused' ? (
                    <>
                      <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Unpause / Resume Membership</span>
                    </>
                  ) : (
                    <>
                      <PauseCircle className="w-3.5 h-3.5 text-blue-400" />
                      <span>Approve Travel / Medical Pause</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-zinc-500 text-xs py-10">
              Select a member on the left to perform assisted check-in
            </div>
          )}
        </div>

        {/* Col 3: Live Audit Log Stream */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col h-[520px]">
          <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-zinc-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Immutable Reception Audit Log
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">{log.action}</span>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-zinc-300 text-[11px] leading-relaxed">{log.summary}</div>
                <div className="text-[10px] text-zinc-500 font-mono pt-0.5">Actor: {log.actor}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
