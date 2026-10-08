export type UserRole = 'member' | 'owner' | 'desk' | 'gate' | 'qa';

export type MemberStatus = 'active' | 'paused' | 'expired' | 'cancelled' | 'blocked';
export type MembershipStatus = 'pending' | 'active' | 'frozen' | 'expired' | 'cancelled';
export type NoShowCaseStatus = 'open' | 'contacted' | 'follow_up_due' | 'returned' | 'closed';
export type FollowUpOutcome =
  | 'will_return'
  | 'injured'
  | 'travelling'
  | 'timing_issue'
  | 'unhappy'
  | 'no_response'
  | 'cancelled';

export type PaymentStatus = 'created' | 'pending' | 'paid' | 'failed' | 'refunded' | 'reversed';
export type AddOnType = 'personal_training' | 'diet_plan' | 'supplements';
export type AddOnOrderStatus = 'pending' | 'paid' | 'active' | 'completed' | 'cancelled' | 'refunded';

export interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  basePrice: number;
  discountPrice: number;
  benefits: string[];
  active: boolean;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  photoUrl?: string;
  joinDate: string;
  status: MemberStatus;
  assignedTrainerId?: string;
  assignedTrainerName?: string;
  emergencyContact?: string;
  riskState: 'normal' | 'at_risk' | 'churned';
  communicationConsent: {
    serviceNotifications: boolean;
    promotionalMarketing: boolean;
  };
}

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  status: MembershipStatus;
  freezeStartDate?: string;
  freezeEndDate?: string;
  freezeReason?: string;
  renewalSource?: 'member_app' | 'front_desk' | 'auto_renewal';
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  checkInTime: string; // ISO string
  source: 'qr_scan' | 'assisted_desk' | 'offline_sync';
  qrSessionId?: string;
  correctionReason?: string;
  staffActor?: string;
}

export interface StreakInfo {
  memberId: string;
  ruleType: 'planned_visits' | 'weekly_goal' | 'daily_calendar';
  weeklyTarget: number; // e.g. 4 visits per week
  weeklyCompleted: number; // e.g. 3
  currentStreakDays: number; // e.g. 18 days
  bestStreakDays: number;
  lastVisitDate: string;
  restDaysAllowed: number; // e.g. 2 rest days/week without breaking streak
  isPaused: boolean;
}

export interface NoShowCase {
  id: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  planName: string;
  expiryDate: string;
  thresholdDate: string;
  daysAbsent: number;
  assignedTrainerName?: string;
  status: NoShowCaseStatus;
  lastOutcome?: FollowUpOutcome;
  lastOutcomeNote?: string;
  lastContactedAt?: string;
  nextActionDate?: string;
  ownerOrStaff: string;
}

export interface FollowUpLog {
  id: string;
  caseId: string;
  memberId: string;
  channel: 'whatsapp' | 'phone_call' | 'in_person' | 'sms';
  outcome: FollowUpOutcome;
  notes: string;
  staff: string;
  timestamp: string;
  nextActionDate?: string;
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  memberId: string;
  memberName: string;
  itemType: 'membership_renewal' | 'addon';
  itemTitle: string;
  providerReference: string;
  amount: number;
  taxAmount: number;
  status: PaymentStatus;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'CashAtDesk';
  verifiedAt?: string;
  createdAt: string;
  receiptNumber: string;
}

export interface AddOnItem {
  id: string;
  type: AddOnType;
  title: string;
  subtitle: string;
  price: number;
  duration?: string;
  totalSessions?: number;
  trainerOrNutritionist?: string;
  qualification?: string;
  stock?: number;
  inStock: boolean;
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string;
}

export interface AddOnOrder {
  id: string;
  memberId: string;
  memberName: string;
  addOnId: string;
  addOnTitle: string;
  type: AddOnType;
  trainerOrNutritionist?: string;
  totalQuantityOrSessions: number;
  usedQuantityOrSessions: number;
  amount: number;
  status: AddOnOrderStatus;
  orderedAt: string;
  expiryDate: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  recordType: 'attendance' | 'membership' | 'payment' | 'followup' | 'addon';
  recordId: string;
  summary: string;
  timestamp: string;
}

export interface GymSettings {
  gymName: string;
  city: string;
  address: string;
  phone: string;
  gstNumber: string;
  noShowThresholdDays: number;
  renewalWindowDays: number;
  qrCooldownMinutes: number;
  operatingHours: string;
}
