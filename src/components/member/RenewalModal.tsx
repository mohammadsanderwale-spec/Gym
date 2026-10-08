import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { Plan } from '../../types';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  X,
  FileText,
  AlertCircle,
  Loader2,
  Download,
  Share2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RenewalModal: React.FC = () => {
  const {
    activeMember,
    activeMembership,
    plans,
    processMembershipRenewal,
    payments,
    settings,
  } = useGym();

  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-3m');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [renewalSuccess, setRenewalSuccess] = useState<{
    receiptNumber: string;
    newExpiryDate: string;
  } | null>(null);

  if (!activeMember || !activeMembership) return null;

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];
  const gstAmount = Number((selectedPlan.discountPrice * 0.18).toFixed(2));
  const totalPayable = selectedPlan.discountPrice; // Inclusive of GST in standard gym pricing

  const handlePayAndRenew = async () => {
    setIsProcessing(true);
    try {
      const result = await processMembershipRenewal(
        activeMember.id,
        selectedPlan.id,
        paymentMethod
      );
      if (result.success) {
        setRenewalSuccess({
          receiptNumber: result.receiptNumber,
          newExpiryDate: result.newExpiryDate,
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-zinc-950 px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/30 uppercase tracking-wider font-bold">
                SCREEN 3: AUTO RENEWAL
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Renew Membership • {activeMember.name}
            </h3>
          </div>
          <button
            onClick={() => {
              setRenewalSuccess(null);
            }}
            className="p-1 rounded text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
          {renewalSuccess ? (
            /* Success & Invoice Screen */
            <div className="bg-gradient-to-b from-zinc-950 to-zinc-900 border border-emerald-500/40 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">Payment Verified &amp; Membership Extended!</h4>
                <p className="text-xs text-zinc-400 mt-1">
                  Provider status confirmed. New validity date is{' '}
                  <strong className="text-emerald-300 font-mono">{renewalSuccess.newExpiryDate}</strong>.
                </p>
              </div>

              {/* Tax Invoice Box */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-left font-mono text-xs space-y-2">
                <div className="flex justify-between text-zinc-400 border-b border-zinc-800 pb-2">
                  <span>Receipt No:</span>
                  <span className="text-white font-bold">{renewalSuccess.receiptNumber}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Gym:</span>
                  <span className="text-zinc-200">{settings.gymName}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>GSTIN:</span>
                  <span className="text-zinc-200">{settings.gstNumber}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Member:</span>
                  <span className="text-zinc-200">{activeMember.name} ({activeMember.phone})</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Plan Activated:</span>
                  <span className="text-amber-300">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-zinc-400 border-t border-zinc-800 pt-2 font-bold text-white">
                  <span>Total Amount Paid:</span>
                  <span className="text-emerald-400 text-sm">₹{totalPayable.toLocaleString('en-IN')} (Incl. 18% GST)</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download GST Receipt</span>
                </button>
              </div>
            </div>
          ) : (
            /* Plan Selection & Checkout */
            <>
              {/* Current Status Banner */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400">Current Plan:</span>
                  <div className="font-bold text-white text-sm">{activeMembership.planName}</div>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400">Current Expiry:</span>
                  <div className="font-mono text-amber-300 font-bold">{activeMembership.expiryDate}</div>
                </div>
              </div>

              {/* Plan Choice Cards (3, 6, 12 months) */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                  Choose Renewal Plan (With Exclusive Continuation Savings):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plans.map((p) => {
                    const isSelected = p.id === selectedPlanId;
                    const savings = p.basePrice - p.discountPrice;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPlanId(p.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                            : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        {savings > 0 && (
                          <span className="absolute top-2.5 right-2.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                            Save ₹{savings}
                          </span>
                        )}
                        <div>
                          <div className="font-bold text-white text-sm">{p.name}</div>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {p.durationMonths} Month{p.durationMonths > 1 ? 's' : ''} Unlimited Access
                          </div>
                          <div className="mt-2 flex items-baseline space-x-2">
                            <span className="text-lg font-black text-amber-400 font-mono">
                              ₹{p.discountPrice.toLocaleString('en-IN')}
                            </span>
                            {savings > 0 && (
                              <span className="text-xs text-zinc-500 line-through font-mono">
                                ₹{p.basePrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <ul className="mt-3 space-y-1 text-[11px] text-zinc-300 border-t border-zinc-800/80 pt-2">
                          {p.benefits.slice(0, 2).map((b, i) => (
                            <li key={i} className="flex items-center space-x-1.5">
                              <span className="w-1 h-1 rounded-full bg-amber-400"></span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                  Select Payment Action:
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {[
                    { id: 'UPI', label: 'Instant UPI (GPay / PhonePe / Paytm)' },
                    { id: 'Card', label: 'Credit / Debit Card' },
                    { id: 'NetBanking', label: 'NetBanking / IMPS' },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        paymentMethod === m.id
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-bold'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust & Refund Policy per Blueprint Page 8 */}
              <div className="p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-[11px] text-zinc-400 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Payment Integrity:</strong> Real payment provider webhook verifies transaction before extending membership. Zero duplicate charges. 14-day medical freeze allowance included.
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePayAndRenew}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black rounded-xl text-sm shadow-xl shadow-amber-500/20 transition active:scale-98 flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Verifying Provider Status...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay ₹{totalPayable.toLocaleString('en-IN')} &amp; Activate Renewal</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
