/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GymProvider, useGym } from './context/GymContext';
import { Header } from './components/Header';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { MemberDashboard } from './components/member/MemberDashboard';
import { FrontDeskTerminal } from './components/desk/FrontDeskTerminal';
import { GateTerminalView } from './components/gate/GateTerminalView';
import { FailureStateSandbox } from './components/qa/FailureStateSandbox';
import { GeminiChatbotModal } from './components/ai/GeminiChatbotModal';
import { GeminiImageAnalyzerModal } from './components/ai/GeminiImageAnalyzerModal';

const AppContent: React.FC = () => {
  const { currentRole } = useGym();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {currentRole === 'owner' && <OwnerDashboard />}
        {currentRole === 'member' && <MemberDashboard />}
        {currentRole === 'desk' && <FrontDeskTerminal />}
        {currentRole === 'gate' && <GateTerminalView />}
        {currentRole === 'qa' && <FailureStateSandbox />}
      </main>

      {/* Global AI Modals */}
      <GeminiChatbotModal />
      <GeminiImageAnalyzerModal />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-xs text-zinc-600">
        <p>
          IronForge Fitness &amp; Strength Club • Sector 14, Gurugram • Powered by Gym App Blueprint
        </p>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GymProvider>
      <AppContent />
    </GymProvider>
  );
}
