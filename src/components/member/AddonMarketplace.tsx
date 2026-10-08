import React, { useState } from 'react';
import { useGym } from '../../context/GymContext';
import { AddOnItem } from '../../types';
import {
  ShoppingBag,
  Dumbbell,
  Utensils,
  ShieldCheck,
  Check,
  Sparkles,
  HelpCircle,
  CreditCard,
  X,
  Loader2,
} from 'lucide-react';

export const AddonMarketplace: React.FC = () => {
  const {
    addOnItems,
    activeMember,
    purchaseAddOn,
    setIsAiChatOpen,
    setIsAiImageAnalyzerOpen,
    setAiAnalyzerPreset,
  } = useGym();

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'personal_training' | 'diet_plan' | 'supplements'>('all');
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<AddOnItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  const filteredItems = addOnItems.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.type === selectedCategory;
  });

  const handleConfirmPurchase = async () => {
    if (!selectedItemForPurchase || !activeMember) return;
    setIsProcessing(true);
    try {
      const res = await purchaseAddOn(
        activeMember.id,
        selectedItemForPurchase.id,
        paymentMethod
      );
      if (res.success) {
        setPurchaseSuccess(res.message);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Pills */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3 text-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All Services & Products' },
          { id: 'personal_training', label: '1-on-1 Personal Training (PT)' },
          { id: 'diet_plan', label: 'Certified Indian Diet Nutrition' },
          { id: 'supplements', label: 'Authentic Supplements' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
              selectedCategory === tab.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trust Notice (Page 9 Blueprint: Never pre-selected, transparent inclusions) */}
      <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            <strong>IronForge Trust Policy:</strong> Add-ons are 100% optional and never auto-billed. Every supplement includes verified batch number &amp; GST tax invoice.
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex flex-col justify-between shadow-xl transition"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.type === 'personal_training'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : item.type === 'diet_plan'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {item.type.replace('_', ' ')}
                  </span>
                  {item.duration && (
                    <span className="text-[11px] font-mono text-zinc-400">{item.duration}</span>
                  )}
                  {item.stock !== undefined && (
                    <span className="text-[11px] font-mono text-zinc-400">
                      {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
                    </span>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white">{item.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{item.subtitle}</p>

                {item.trainerOrNutritionist && (
                  <div className="mt-3 p-2.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs">
                    <div className="font-semibold text-zinc-200">{item.trainerOrNutritionist}</div>
                    <div className="text-[11px] text-zinc-400">{item.qualification}</div>
                  </div>
                )}

                {/* Inclusions */}
                <div className="mt-3 space-y-1 text-xs text-zinc-300">
                  {item.inclusions.map((inc, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500 block">Price (Incl. Tax)</span>
                  <div className="text-lg font-black text-white font-mono">
                    ₹{item.price.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (item.type === 'diet_plan') {
                        setAiAnalyzerPreset('meal');
                        setIsAiImageAnalyzerOpen(true);
                      } else {
                        setIsAiChatOpen(true);
                      }
                    }}
                    title="Ask AI Coach a question before buying"
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs transition"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedItemForPurchase(item);
                      setPurchaseSuccess(null);
                    }}
                    disabled={item.stock !== undefined && item.stock <= 0}
                    className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-30 text-white font-bold rounded-xl text-xs transition shadow-md shadow-purple-600/20 active:scale-95"
                  >
                    Buy Plan
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Purchase Modal */}
      {selectedItemForPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div>
                <h3 className="font-bold text-white text-base">Confirm Add-on Purchase</h3>
                <p className="text-xs text-zinc-400">
                  Member: <strong className="text-amber-300">{activeMember?.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedItemForPurchase(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {purchaseSuccess ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base">Purchase Successful!</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{purchaseSuccess}</p>
                <button
                  onClick={() => setSelectedItemForPurchase(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1">
                  <div className="font-bold text-white text-sm">{selectedItemForPurchase.title}</div>
                  <div className="text-zinc-400">{selectedItemForPurchase.subtitle}</div>
                  <div className="text-sm font-mono text-purple-400 font-bold pt-1">
                    Total: ₹{selectedItemForPurchase.price.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-zinc-300 block mb-1.5">
                    Payment Method:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['UPI', 'Card', 'NetBanking'].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setPaymentMethod(m as any)}
                        className={`p-2 rounded-lg border text-center transition ${
                          paymentMethod === m
                            ? 'border-purple-500 bg-purple-500/20 text-purple-300 font-bold'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => setSelectedItemForPurchase(null)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    disabled={isProcessing}
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 flex items-center space-x-1.5"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    <span>Pay ₹{selectedItemForPurchase.price}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
