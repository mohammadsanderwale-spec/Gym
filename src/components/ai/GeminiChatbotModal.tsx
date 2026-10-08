import React, { useState, useRef, useEffect } from 'react';
import { useGym } from '../../context/GymContext';
import { Bot, Send, User, Sparkles, X, Loader2, Zap, Brain, MessageSquare } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const GeminiChatbotModal: React.FC = () => {
  const { isAiChatOpen, setIsAiChatOpen, activeMember, currentRole, noShowCases } = useGym();

  // Role persona selection
  const [selectedRole, setSelectedRole] = useState<'gym-advisor' | 'diet-coach' | 'support-bot'>(
    currentRole === 'owner' ? 'gym-advisor' : 'diet-coach'
  );

  // Model selection (gemini-3.1-pro-preview, gemini-3.5-flash, gemini-3.1-flash-lite)
  const [selectedModel, setSelectedModel] = useState<'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite'>(
    'gemini-3.5-flash'
  );

  // Multi-turn message history per role
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({
    'gym-advisor': [
      {
        role: 'model',
        content:
          "Namaste! Main IronForge Gym ka Retention & Business Advisor hoon. " +
          "Aaj aapke paas 6 members Red List (10+ din se absent) par hain. " +
          "Aap mujhse pooch sakte hain: high-converting WhatsApp message draft karwana, fee objection handle karna, ya monthly renewal collection strategy banana.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    'diet-coach': [
      {
        role: 'model',
        content:
          "Hello! Main IronForge Certified Fitness & Nutrition Coach hoon. " +
          "Bataiye aapka fitness goal kya hai? Desi high-protein diet (Paneer, Soya, Eggs, Whey), workout split, ya fat-loss recovery ke baare mein baat karein?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    'support-bot': [
      {
        role: 'model',
        content:
          "Welcome to IronForge Member Care! Hum gym timings (6 AM - 10 PM), QR check-in guidelines, membership pause rules aur trainer bookings mein aapki help kar sakte hain.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentRoleMessages = messages[selectedRole] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isAiChatOpen) {
      scrollToBottom();
    }
  }, [messages, isAiChatOpen, selectedRole]);

  if (!isAiChatOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update history immediately
    const updatedHistory = [...currentRoleMessages, userMsg];
    setMessages((prev) => ({
      ...prev,
      [selectedRole]: updatedHistory,
    }));
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build server request payload
      const payloadMessages = updatedHistory.map((m) => ({
        role: m.role,
        text: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          role: selectedRole,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      const replyContent = data.text || 'I received your message and am processing your gym request.';

      const botMsg: ChatMessage = {
        role: 'model',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => ({
        ...prev,
        [selectedRole]: [...updatedHistory, botMsg],
      }));
    } catch (err: any) {
      const errMsg: ChatMessage = {
        role: 'model',
        content:
          'Error connecting to Gemini service: ' +
          (err?.message || 'Server error. Please ensure GEMINI_API_KEY is configured.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => ({
        ...prev,
        [selectedRole]: [...updatedHistory, errMsg],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Quick suggestions based on role
  const quickPrompts = {
    'gym-advisor': [
      'Draft WhatsApp message for Aman Verma (absent 14 days, timing issue)',
      'How to explain why 3-month renewal is better than 1-month to a member?',
      'How to calculate silent churn loss for 10 members in a ₹1500/month gym?',
    ],
    'diet-coach': [
      'Give me a 130g protein vegetarian Indian daily meal plan for gym hypertrophy',
      'What should I eat 45 mins before heavy barbell squats?',
      'Is taking 5g Creatine Monohydrate safe daily with Indian food?',
    ],
    'support-bot': [
      'Can I freeze my membership if I am going out of city for 2 weeks?',
      'How does the rotating gate QR code check-in work?',
      'What are the gym peak hours and off-peak discounts?',
    ],
  }[selectedRole];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl h-[88vh] max-h-[720px] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">Gemini Multi-Turn Gym AI</h3>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono border border-indigo-500/30">
                  {selectedModel}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Context-aware coaching &amp; retention intelligence for Indian gym operations
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAiChatOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona & Model Selection Row */}
        <div className="bg-zinc-950/60 px-4 py-2 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Persona selector */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => setSelectedRole('gym-advisor')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedRole === 'gym-advisor'
                  ? 'bg-amber-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Retention Advisor
            </button>
            <button
              onClick={() => setSelectedRole('diet-coach')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedRole === 'diet-coach'
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Diet &amp; Workout Coach
            </button>
            <button
              onClick={() => setSelectedRole('support-bot')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedRole === 'support-bot'
                  ? 'bg-indigo-500 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Desk Support
            </button>
          </div>

          {/* Model picker */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-zinc-400">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-zinc-900 text-zinc-200 border border-zinc-700 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500"
            >
              <option value="gemini-3.5-flash">gemini-3.5-flash (General)</option>
              <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Tasks)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Chat Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-900/50">
          {currentRoleMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    isUser
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-indigo-400 border border-zinc-700'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isUser
                      ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-none'
                      : 'bg-zinc-800/90 text-zinc-100 border border-zinc-700/70 rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                  <div
                    className={`text-[10px] mt-1 text-right font-mono ${
                      isUser ? 'text-zinc-900/70' : 'text-zinc-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-2 text-xs text-zinc-400 py-2 px-1">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Gemini is generating response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-1.5 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider shrink-0">Quick:</span>
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              disabled={isLoading}
              className="text-[11px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white px-2 py-1 rounded-md border border-zinc-800 whitespace-nowrap shrink-0 transition"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                selectedRole === 'gym-advisor'
                  ? 'Ask about silent churn, retention messages, renewal collections...'
                  : selectedRole === 'diet-coach'
                  ? 'Ask about Indian diet, protein targets, exercise splits...'
                  : 'Ask about gym timings, pause rules, assisted check-in...'
              }
              disabled={isLoading}
              className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white p-2.5 rounded-xl transition shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
