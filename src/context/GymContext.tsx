import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserRole,
  Member,
  Plan,
  Membership,
  AttendanceRecord,
  StreakInfo,
  NoShowCase,
  FollowUpOutcome,
  AddOnItem,
  AddOnOrder,
  PaymentRecord,
  GymSettings,
  AuditLog,
} from '../types';
import {
  initialGymSettings,
  initialPlans,
  initialMembers,
  initialMemberships,
  initialNoShowCases,
  initialStreaks,
  initialAttendance,
  initialAddOnItems,
  initialOrders,
  initialPayments,
  initialAuditLogs,
} from '../data/mockData';
import confetti from 'canvas-confetti';

interface QrSession {
  token: string;
  generatedAt: number; // timestamp ms
  expiresInSeconds: number; // 30s countdown
}

interface GymContextType {
  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeMemberId: string;
  setActiveMemberId: (id: string) => void;
  activeMember: Member | undefined;
  activeMembership: Membership | undefined;
  activeStreak: StreakInfo | undefined;

  // Master Data
  settings: GymSettings;
  updateSettings: (newSettings: Partial<GymSettings>) => void;
  members: Member[];
  plans: Plan[];
  memberships: Membership[];
  attendance: AttendanceRecord[];
  streaks: Record<string, StreakInfo>;
  noShowCases: NoShowCase[];
  addOnItems: AddOnItem[];
  addOnOrders: AddOnOrder[];
  payments: PaymentRecord[];
  auditLogs: AuditLog[];

  // Gate & QR Attendance
  currentQrSession: QrSession;
  refreshQrSession: () => void;
  processQrCheckIn: (
    memberId: string,
    qrToken: string
  ) => { success: boolean; message: string; duplicate?: boolean; expired?: boolean };
  processAssistedCheckIn: (
    memberId: string,
    reason: string,
    staffName: string
  ) => { success: boolean; message: string };

  // Red List & Follow-ups
  recordFollowUpOutcome: (
    caseId: string,
    outcome: FollowUpOutcome,
    notes: string,
    nextActionDate?: string,
    staff?: string
  ) => void;
  runDailyNoShowScan: () => { newCasesAdded: number; totalOpen: number };

  // Renewals & Payments
  processMembershipRenewal: (
    memberId: string,
    planId: string,
    paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'CashAtDesk'
  ) => Promise<{ success: boolean; receiptNumber: string; newExpiryDate: string; message: string }>;

  // Add-ons
  purchaseAddOn: (
    memberId: string,
    addOnId: string,
    paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'CashAtDesk'
  ) => Promise<{ success: boolean; orderId: string; message: string }>;
  logPtSessionUsage: (orderId: string) => { success: boolean; remaining: number; message: string };

  // Sandbox & Recovery Actions
  resetAllDataToDefault: () => void;
  simulateFailedPayment: () => void;
  toggleMemberPause: (memberId: string, pauseReason?: string) => void;

  // Modals for AI
  isAiChatOpen: boolean;
  setIsAiChatOpen: (open: boolean) => void;
  isAiImageAnalyzerOpen: boolean;
  setIsAiImageAnalyzerOpen: (open: boolean) => void;
  aiAnalyzerPreset?: 'meal' | 'workout_form';
  setAiAnalyzerPreset: (preset: 'meal' | 'workout_form') => void;
}

const GymContext = createContext<GymContextType | null>(null);

const STORAGE_KEY = 'ironforge_gym_app_state_v1';

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Top-level navigation role
  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [activeMemberId, setActiveMemberId] = useState<string>('mem-107'); // Kabir Malhotra (Expiring in 5 days, strong streak)

  // AI Modal States
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);
  const [isAiImageAnalyzerOpen, setIsAiImageAnalyzerOpen] = useState<boolean>(false);
  const [aiAnalyzerPreset, setAiAnalyzerPreset] = useState<'meal' | 'workout_form'>('meal');

  // Application Data States
  const [settings, setSettings] = useState<GymSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_settings');
      return saved ? JSON.parse(saved) : initialGymSettings;
    } catch {
      return initialGymSettings;
    }
  });

  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_members');
      return saved ? JSON.parse(saved) : initialMembers;
    } catch {
      return initialMembers;
    }
  });

  const [plans] = useState<Plan[]>(initialPlans);

  const [memberships, setMemberships] = useState<Membership[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_memberships');
      return saved ? JSON.parse(saved) : initialMemberships;
    } catch {
      return initialMemberships;
    }
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_attendance');
      return saved ? JSON.parse(saved) : initialAttendance;
    } catch {
      return initialAttendance;
    }
  });

  const [streaks, setStreaks] = useState<Record<string, StreakInfo>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_streaks');
      return saved ? JSON.parse(saved) : initialStreaks;
    } catch {
      return initialStreaks;
    }
  });

  const [noShowCases, setNoShowCases] = useState<NoShowCase[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_noshowcases');
      return saved ? JSON.parse(saved) : initialNoShowCases;
    } catch {
      return initialNoShowCases;
    }
  });

  const [addOnItems, setAddOnItems] = useState<AddOnItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_addons');
      return saved ? JSON.parse(saved) : initialAddOnItems;
    } catch {
      return initialAddOnItems;
    }
  });

  const [addOnOrders, setAddOnOrders] = useState<AddOnOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_orders');
      return saved ? JSON.parse(saved) : initialOrders;
    } catch {
      return initialOrders;
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_payments');
      return saved ? JSON.parse(saved) : initialPayments;
    } catch {
      return initialPayments;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + '_audit');
      return saved ? JSON.parse(saved) : initialAuditLogs;
    } catch {
      return initialAuditLogs;
    }
  });

  // Persist state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY + '_settings', JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEY + '_members', JSON.stringify(members));
      localStorage.setItem(STORAGE_KEY + '_memberships', JSON.stringify(memberships));
      localStorage.setItem(STORAGE_KEY + '_attendance', JSON.stringify(attendance));
      localStorage.setItem(STORAGE_KEY + '_streaks', JSON.stringify(streaks));
      localStorage.setItem(STORAGE_KEY + '_noshowcases', JSON.stringify(noShowCases));
      localStorage.setItem(STORAGE_KEY + '_addons', JSON.stringify(addOnItems));
      localStorage.setItem(STORAGE_KEY + '_orders', JSON.stringify(addOnOrders));
      localStorage.setItem(STORAGE_KEY + '_payments', JSON.stringify(payments));
      localStorage.setItem(STORAGE_KEY + '_audit', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [settings, members, memberships, attendance, streaks, noShowCases, addOnItems, addOnOrders, payments, auditLogs]);

  // Dynamic Rotating Gate QR Session (rotates every 30s)
  const [currentQrSession, setCurrentQrSession] = useState<QrSession>({
    token: `GATE-QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    generatedAt: Date.now(),
    expiresInSeconds: 30,
  });

  const refreshQrSession = useCallback(() => {
    setCurrentQrSession({
      token: `GATE-QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      generatedAt: Date.now(),
      expiresInSeconds: 30,
    });
  }, []);

  // Timer countdown for QR rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQrSession((prev) => {
        if (prev.expiresInSeconds <= 1) {
          return {
            token: `GATE-QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            generatedAt: Date.now(),
            expiresInSeconds: 30,
          };
        }
        return {
          ...prev,
          expiresInSeconds: prev.expiresInSeconds - 1,
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Active Member Lookup
  const activeMember = useMemo(() => {
    return members.find((m) => m.id === activeMemberId) || members[0];
  }, [members, activeMemberId]);

  const activeMembership = useMemo(() => {
    return memberships.find((m) => m.memberId === activeMemberId);
  }, [memberships, activeMemberId]);

  const activeStreak = useMemo(() => {
    return (
      streaks[activeMemberId] || {
        memberId: activeMemberId,
        ruleType: 'weekly_goal',
        weeklyTarget: 4,
        weeklyCompleted: 0,
        currentStreakDays: 0,
        bestStreakDays: 5,
        lastVisitDate: '',
        restDaysAllowed: 2,
        isPaused: false,
      }
    );
  }, [streaks, activeMemberId]);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<GymSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Process Gate QR Check-In
  const processQrCheckIn = useCallback(
    (memberId: string, qrToken: string) => {
      const member = members.find((m) => m.id === memberId);
      if (!member) {
        return { success: false, message: 'Member record not found.' };
      }

      const membership = memberships.find((m) => m.memberId === memberId);
      if (!membership) {
        return { success: false, message: 'No gym membership registered for this member.' };
      }

      // 1. Check frozen/paused state
      if (member.status === 'paused' || membership.status === 'frozen') {
        return {
          success: false,
          message: `Check-in blocked: Membership is paused (${membership.freezeReason || 'Approved Break'}). Please unfreeze at desk.`,
        };
      }

      // 2. Check expired state
      const expiry = new Date(membership.expiryDate).getTime();
      const today = new Date().setHours(0, 0, 0, 0);
      if (membership.status === 'expired' || expiry < today) {
        return {
          success: false,
          expired: true,
          message: `Check-in blocked: Membership expired on ${membership.expiryDate}. Please renew to continue workouts.`,
        };
      }

      // 3. Verify QR session freshness (cannot use expired token older than 60s)
      const tokenAgeMs = Date.now() - currentQrSession.generatedAt;
      if (qrToken !== currentQrSession.token && tokenAgeMs > 60000) {
        return {
          success: false,
          message: 'Invalid or expired QR session. Please scan the current rotating gate code.',
        };
      }

      // 4. Duplicate scan cooldown check (default 5 minutes)
      const fiveMinutesAgo = Date.now() - settings.qrCooldownMinutes * 60 * 1000;
      const recentCheckIn = attendance.find(
        (a) => a.memberId === memberId && new Date(a.checkInTime).getTime() > fiveMinutesAgo
      );

      if (recentCheckIn) {
        const checkInFormatted = new Date(recentCheckIn.checkInTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        return {
          success: false,
          duplicate: true,
          message: `Already checked in at ${checkInFormatted}. Duplicate scans blocked for ${settings.qrCooldownMinutes} mins to prevent accidental double-taps.`,
        };
      }

      // SUCCESS: Record attendance
      const nowIso = new Date().toISOString();
      const newAttendanceRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        memberPhone: member.phone,
        checkInTime: nowIso,
        source: 'qr_scan',
        qrSessionId: currentQrSession.token,
      };

      setAttendance((prev) => [newAttendanceRecord, ...prev]);

      // Update Member Streak
      setStreaks((prev) => {
        const current = prev[memberId] || {
          memberId,
          ruleType: 'weekly_goal',
          weeklyTarget: 4,
          weeklyCompleted: 0,
          currentStreakDays: 0,
          bestStreakDays: 0,
          lastVisitDate: '',
          restDaysAllowed: 2,
          isPaused: false,
        };

        const todayStr = new Date().toISOString().split('T')[0];
        const isNewDay = current.lastVisitDate !== todayStr;
        const newStreakDays = isNewDay ? current.currentStreakDays + 1 : current.currentStreakDays;
        const newBest = Math.max(newStreakDays, current.bestStreakDays);
        const newWeekly = isNewDay ? Math.min(current.weeklyTarget, current.weeklyCompleted + 1) : current.weeklyCompleted;

        return {
          ...prev,
          [memberId]: {
            ...current,
            currentStreakDays: newStreakDays,
            bestStreakDays: newBest,
            weeklyCompleted: newWeekly,
            lastVisitDate: todayStr,
          },
        };
      });

      // AUTO-RESOLVE: Check if member was on No-Show Red List. If yes, mark 'returned'
      setNoShowCases((prev) =>
        prev.map((c) => {
          if (c.memberId === memberId && (c.status === 'open' || c.status === 'contacted' || c.status === 'follow_up_due')) {
            return {
              ...c,
              status: 'returned',
              lastOutcome: 'will_return',
              lastOutcomeNote: 'Member returned to gym via gate QR check-in!',
              daysAbsent: 0,
            };
          }
          return c;
        })
      );

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#059669', '#F59E0B'],
      });

      return {
        success: true,
        message: `Welcome, ${member.name}! Check-in recorded at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Keep up the consistency!`,
      };
    },
    [members, memberships, currentQrSession, settings.qrCooldownMinutes, attendance]
  );

  // Assisted Desk Check-In (Requires Staff Actor & Mandatory Reason)
  const processAssistedCheckIn = useCallback(
    (memberId: string, reason: string, staffName: string) => {
      const member = members.find((m) => m.id === memberId);
      if (!member) {
        return { success: false, message: 'Member not found.' };
      }

      if (!reason || reason.trim().length === 0) {
        return { success: false, message: 'Mandatory reason is required for assisted desk check-in.' };
      }

      const nowIso = new Date().toISOString();
      const newRecord: AttendanceRecord = {
        id: `att-assisted-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        memberPhone: member.phone,
        checkInTime: nowIso,
        source: 'assisted_desk',
        staffActor: staffName || 'Simran Kaur (Desk)',
        correctionReason: reason,
      };

      setAttendance((prev) => [newRecord, ...prev]);

      // Audit Log Stamp
      const newAudit: AuditLog = {
        id: `aud-${Date.now()}`,
        actor: staffName || 'Simran Kaur (Desk)',
        action: 'Assisted Check-in',
        recordType: 'attendance',
        recordId: newRecord.id,
        summary: `Assisted check-in completed for ${member.name}. Reason: ${reason}`,
        timestamp: nowIso,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      // Update streaks
      setStreaks((prev) => {
        const current = prev[memberId] || {
          memberId,
          ruleType: 'weekly_goal',
          weeklyTarget: 4,
          weeklyCompleted: 0,
          currentStreakDays: 0,
          bestStreakDays: 0,
          lastVisitDate: '',
          restDaysAllowed: 2,
          isPaused: false,
        };
        const todayStr = new Date().toISOString().split('T')[0];
        const isNewDay = current.lastVisitDate !== todayStr;
        return {
          ...prev,
          [memberId]: {
            ...current,
            currentStreakDays: isNewDay ? current.currentStreakDays + 1 : current.currentStreakDays,
            bestStreakDays: Math.max(current.currentStreakDays + 1, current.bestStreakDays),
            weeklyCompleted: isNewDay ? Math.min(current.weeklyTarget, current.weeklyCompleted + 1) : current.weeklyCompleted,
            lastVisitDate: todayStr,
          },
        };
      });

      // Auto-resolve any open no-show case
      setNoShowCases((prev) =>
        prev.map((c) => {
          if (c.memberId === memberId && (c.status === 'open' || c.status === 'contacted' || c.status === 'follow_up_due')) {
            return {
              ...c,
              status: 'returned',
              lastOutcome: 'will_return',
              lastOutcomeNote: `Returned via assisted desk check-in (${reason})`,
              daysAbsent: 0,
            };
          }
          return c;
        })
      );

      return {
        success: true,
        message: `Assisted check-in verified for ${member.name}. Audited by ${staffName}.`,
      };
    },
    [members]
  );

  // Record Follow-Up Outcome on Red List
  const recordFollowUpOutcome = useCallback(
    (caseId: string, outcome: FollowUpOutcome, notes: string, nextActionDate?: string, staff?: string) => {
      const nowIso = new Date().toISOString();
      setNoShowCases((prev) =>
        prev.map((c) => {
          if (c.id === caseId) {
            let newStatus: NoShowCase['status'] = 'contacted';
            if (outcome === 'will_return') newStatus = 'follow_up_due';
            if (outcome === 'cancelled') newStatus = 'closed';

            return {
              ...c,
              lastOutcome: outcome,
              lastOutcomeNote: notes,
              lastContactedAt: nowIso,
              nextActionDate: nextActionDate || c.nextActionDate,
              status: newStatus,
              ownerOrStaff: staff || c.ownerOrStaff,
            };
          }
          return c;
        })
      );

      // Audit log entry
      const targetCase = noShowCases.find((c) => c.id === caseId);
      const newAudit: AuditLog = {
        id: `aud-${Date.now()}`,
        actor: staff || 'Karan Roy (Owner)',
        action: 'Follow-up Outcome Recorded',
        recordType: 'followup',
        recordId: caseId,
        summary: `Recorded outcome '${outcome}' for ${targetCase?.memberName || 'Member'}. Notes: ${notes}`,
        timestamp: nowIso,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    },
    [noShowCases]
  );

  // Run Daily No-Show Scan Automation
  const runDailyNoShowScan = useCallback(() => {
    const today = new Date().getTime();
    let newCasesCount = 0;

    setNoShowCases((prevCases) => {
      const updated = [...prevCases];

      members.forEach((member) => {
        // Exclude paused, frozen, expired, or cancelled
        if (member.status === 'paused' || member.status === 'expired' || member.status === 'cancelled') {
          return;
        }

        const membership = memberships.find((m) => m.memberId === member.id);
        if (!membership || membership.status !== 'active') return;

        // Find last check-in date
        const memberLogs = attendance.filter((a) => a.memberId === member.id);
        const lastCheckIn = memberLogs.length > 0
          ? new Date(memberLogs[0].checkInTime).getTime()
          : new Date(member.joinDate).getTime();

        const daysAbsent = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));

        if (daysAbsent >= settings.noShowThresholdDays) {
          // Check if case already open
          const existing = updated.find(
            (c) => c.memberId === member.id && (c.status === 'open' || c.status === 'contacted' || c.status === 'follow_up_due')
          );

          if (!existing) {
            newCasesCount++;
            updated.push({
              id: `nsc-${Date.now()}-${member.id}`,
              memberId: member.id,
              memberName: member.name,
              memberPhone: member.phone,
              planName: membership.planName,
              expiryDate: membership.expiryDate,
              thresholdDate: new Date().toISOString().split('T')[0],
              daysAbsent,
              assignedTrainerName: member.assignedTrainerName,
              status: 'open',
              ownerOrStaff: 'Simran Kaur (Desk)',
            });
          } else {
            // Update days absent
            existing.daysAbsent = daysAbsent;
          }
        }
      });

      return updated;
    });

    // Record audit
    const newAudit: AuditLog = {
      id: `aud-${Date.now()}`,
      actor: 'System Automation',
      action: 'Daily No-Show Scan Triggered',
      recordType: 'attendance',
      recordId: 'scan-run',
      summary: `Inactivity scan completed with ${settings.noShowThresholdDays}-day threshold. ${newCasesCount} new cases opened.`,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    return {
      newCasesAdded: newCasesCount,
      totalOpen: noShowCases.filter((c) => c.status === 'open' || c.status === 'follow_up_due').length + newCasesCount,
    };
  }, [members, memberships, attendance, settings.noShowThresholdDays, noShowCases]);

  // Process Membership Renewal
  const processMembershipRenewal = useCallback(
    async (
      memberId: string,
      planId: string,
      paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'CashAtDesk'
    ) => {
      const member = members.find((m) => m.id === memberId);
      const plan = plans.find((p) => p.id === planId);
      const currentMembership = memberships.find((m) => m.memberId === memberId);

      if (!member || !plan || !currentMembership) {
        return { success: false, receiptNumber: '', newExpiryDate: '', message: 'Member or Plan not found.' };
      }

      // Calculate new expiry date: extend from current expiry date if future, else from today
      const currentExpiryDate = new Date(currentMembership.expiryDate);
      const baseDate = currentExpiryDate > new Date() ? currentExpiryDate : new Date();
      const newExpiry = new Date(baseDate);
      newExpiry.setMonth(newExpiry.getMonth() + plan.durationMonths);
      const newExpiryStr = newExpiry.toISOString().split('T')[0];

      // Simulated Payment Verification
      const receiptNumber = `IF-RCP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const providerRef = `rzp_test_${Math.random().toString(36).substring(2, 10)}`;
      const taxAmount = Number((plan.discountPrice * 0.18).toFixed(2));
      const nowIso = new Date().toISOString();

      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        orderId: `rnw-${Date.now()}`,
        memberId: member.id,
        memberName: member.name,
        itemType: 'membership_renewal',
        itemTitle: `${plan.name} Renewal`,
        providerReference: providerRef,
        amount: plan.discountPrice,
        taxAmount,
        status: 'paid',
        paymentMethod,
        verifiedAt: nowIso,
        createdAt: nowIso,
        receiptNumber,
      };

      setPayments((prev) => [newPayment, ...prev]);

      // Extend membership record
      setMemberships((prev) =>
        prev.map((m) => {
          if (m.memberId === memberId) {
            return {
              ...m,
              planId: plan.id,
              planName: plan.name,
              expiryDate: newExpiryStr,
              status: 'active',
              renewalSource: currentRole === 'member' ? 'member_app' : 'front_desk',
            };
          }
          return m;
        })
      );

      // Audit Log
      const newAudit: AuditLog = {
        id: `aud-${Date.now()}`,
        actor: currentRole === 'member' ? `${member.name} (Self)` : 'Simran Kaur (Desk)',
        action: 'Membership Renewed & Payment Verified',
        recordType: 'membership',
        recordId: newPayment.id,
        summary: `Extended ${member.name}'s membership by ${plan.durationMonths} months to ${newExpiryStr}. Amount: ₹${plan.discountPrice} via ${paymentMethod}.`,
        timestamp: nowIso,
      };
      setAuditLogs((prev) => [newAudit, ...prev]);

      // Confetti Celebration
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
      });

      return {
        success: true,
        receiptNumber,
        newExpiryDate: newExpiryStr,
        message: `Payment of ₹${plan.discountPrice} verified! Membership extended till ${newExpiryStr}.`,
      };
    },
    [members, plans, memberships, currentRole]
  );

  // Add-on Purchase
  const purchaseAddOn = useCallback(
    async (
      memberId: string,
      addOnId: string,
      paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'CashAtDesk'
    ) => {
      const member = members.find((m) => m.id === memberId);
      const item = addOnItems.find((i) => i.id === addOnId);

      if (!member || !item) {
        return { success: false, orderId: '', message: 'Member or Item not found' };
      }

      // Check stock for supplements
      if (item.type === 'supplements' && item.stock !== undefined && item.stock <= 0) {
        return { success: false, orderId: '', message: 'Product is currently out of stock.' };
      }

      const nowIso = new Date().toISOString();
      const orderId = `ord-${Date.now()}`;
      const providerRef = `rzp_addon_${Math.random().toString(36).substring(2, 10)}`;
      const receiptNumber = `IF-RCP-ADD-${Math.floor(1000 + Math.random() * 9000)}`;

      // Deduct inventory if supplement
      if (item.type === 'supplements' && item.stock !== undefined) {
        setAddOnItems((prev) =>
          prev.map((i) => (i.id === addOnId ? { ...i, stock: Math.max(0, (i.stock || 1) - 1) } : i))
        );
      }

      // Create AddOnOrder
      const newOrder: AddOnOrder = {
        id: orderId,
        memberId: member.id,
        memberName: member.name,
        addOnId: item.id,
        addOnTitle: item.title,
        type: item.type,
        trainerOrNutritionist: item.trainerOrNutritionist,
        totalQuantityOrSessions: item.totalSessions || 1,
        usedQuantityOrSessions: item.type === 'supplements' ? 1 : 0,
        amount: item.price,
        status: item.type === 'supplements' ? 'completed' : 'active',
        orderedAt: nowIso,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };
      setAddOnOrders((prev) => [newOrder, ...prev]);

      // Create Payment Record
      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        orderId,
        memberId: member.id,
        memberName: member.name,
        itemType: 'addon',
        itemTitle: item.title,
        providerReference: providerRef,
        amount: item.price,
        taxAmount: Number((item.price * 0.18).toFixed(2)),
        status: 'paid',
        paymentMethod,
        verifiedAt: nowIso,
        createdAt: nowIso,
        receiptNumber,
      };
      setPayments((prev) => [newPayment, ...prev]);

      // Audit Log
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          actor: `${member.name} (Member)`,
          action: 'Add-on Purchased',
          recordType: 'addon',
          recordId: orderId,
          summary: `Purchased ${item.title} for ₹${item.price} via ${paymentMethod}.`,
          timestamp: nowIso,
        },
        ...prev,
      ]);

      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

      return {
        success: true,
        orderId,
        message: `Order confirmed for ${item.title}! Receipt ${receiptNumber} generated.`,
      };
    },
    [members, addOnItems]
  );

  // Log PT Session Usage (deduct session, ensure no negative count)
  const logPtSessionUsage = useCallback(
    (orderId: string) => {
      const order = addOnOrders.find((o) => o.id === orderId);
      if (!order) return { success: false, remaining: 0, message: 'Order not found' };

      if (order.usedQuantityOrSessions >= order.totalQuantityOrSessions) {
        return { success: false, remaining: 0, message: 'All personal training sessions in this package have been used.' };
      }

      const updatedUsed = order.usedQuantityOrSessions + 1;
      const remaining = order.totalQuantityOrSessions - updatedUsed;
      const isCompleted = remaining === 0;

      setAddOnOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, usedQuantityOrSessions: updatedUsed, status: isCompleted ? 'completed' : 'active' }
            : o
        )
      );

      // Audit Log
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          actor: order.trainerOrNutritionist || 'Assigned Coach',
          action: 'PT Session Conducted',
          recordType: 'addon',
          recordId: orderId,
          summary: `Deducted 1 PT session for ${order.memberName}. Remaining: ${remaining}/${order.totalQuantityOrSessions}.`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);

      return {
        success: true,
        remaining,
        message: `1 PT Session logged! ${remaining} sessions remaining in this pack.`,
      };
    },
    [addOnOrders]
  );

  // Toggle Member Pause / Freeze
  const toggleMemberPause = useCallback(
    (memberId: string, pauseReason?: string) => {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === memberId) {
            const nextStatus = m.status === 'paused' ? 'active' : 'paused';
            return { ...m, status: nextStatus };
          }
          return m;
        })
      );

      setMemberships((prev) =>
        prev.map((m) => {
          if (m.memberId === memberId) {
            const isCurrentlyFrozen = m.status === 'frozen';
            return {
              ...m,
              status: isCurrentlyFrozen ? 'active' : 'frozen',
              freezeReason: isCurrentlyFrozen ? undefined : pauseReason || 'Travel / Medical Pause approved by management',
            };
          }
          return m;
        })
      );

      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          actor: 'Management',
          action: 'Membership Pause Status Changed',
          recordType: 'membership',
          recordId: memberId,
          summary: `Membership status toggled. Reason: ${pauseReason || 'Standard Freeze'}`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    []
  );

  // Simulate Failed Payment for QA Testing
  const simulateFailedPayment = useCallback(() => {
    const failedPayment: PaymentRecord = {
      id: `pay-fail-${Date.now()}`,
      orderId: `fail-${Date.now()}`,
      memberId: activeMemberId,
      memberName: activeMember?.name || 'Member',
      itemType: 'membership_renewal',
      itemTitle: '3-Month Quarterly Renewal (Declined by Bank)',
      providerReference: `rzp_err_${Math.random().toString(36).substring(2, 8)}`,
      amount: 3999,
      taxAmount: 719.82,
      status: 'failed',
      paymentMethod: 'UPI',
      createdAt: new Date().toISOString(),
      receiptNumber: 'N/A - FAILED',
    };
    setPayments((prev) => [failedPayment, ...prev]);
  }, [activeMemberId, activeMember]);

  // Reset to Default Mock State
  const resetAllDataToDefault = useCallback(() => {
    localStorage.clear();
    setSettings(initialGymSettings);
    setMembers(initialMembers);
    setMemberships(initialMemberships);
    setAttendance(initialAttendance);
    setStreaks(initialStreaks);
    setNoShowCases(initialNoShowCases);
    setAddOnItems(initialAddOnItems);
    setAddOnOrders(initialOrders);
    setPayments(initialPayments);
    setAuditLogs(initialAuditLogs);
    setActiveMemberId('mem-107');
  }, []);

  return (
    <GymContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeMemberId,
        setActiveMemberId,
        activeMember,
        activeMembership,
        activeStreak,
        settings,
        updateSettings,
        members,
        plans,
        memberships,
        attendance,
        streaks,
        noShowCases,
        addOnItems,
        addOnOrders,
        payments,
        auditLogs,
        currentQrSession,
        refreshQrSession,
        processQrCheckIn,
        processAssistedCheckIn,
        recordFollowUpOutcome,
        runDailyNoShowScan,
        processMembershipRenewal,
        purchaseAddOn,
        logPtSessionUsage,
        resetAllDataToDefault,
        simulateFailedPayment,
        toggleMemberPause,
        isAiChatOpen,
        setIsAiChatOpen,
        isAiImageAnalyzerOpen,
        setIsAiImageAnalyzerOpen,
        aiAnalyzerPreset,
        setAiAnalyzerPreset,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
