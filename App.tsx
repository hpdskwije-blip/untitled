/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ChatPlayground } from './components/ChatPlayground';
import { UsbGuardSandbox } from './components/UsbGuardSandbox';
import { RepoExplorer } from './components/RepoExplorer';
import { PackageExporter } from './components/PackageExporter';
import { HardwareCalculator } from './components/HardwareCalculator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'usb-guard' | 'repo' | 'export' | 'budget'>('chat');
  const [ramUsageGb] = useState<number>(4.27);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Global Instant Download Notification Banner (No GitHub Needed) */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold">
            READY TO RUN
          </span>
          <span className="font-sinhala text-sm">
            ඔබ GitHub වෙත යාමට හෝ කිසිවක් Run කිරීමට අවශ්‍ය නැත! සම්පූර්ණ Windows EXE + සිංහල AI පැකේජය සකසා ඇත.
          </span>
        </div>

        <a
          href="/NENAPIYUMA-AI-USB-Windows.zip"
          download="NENAPIYUMA-AI-USB-Windows.zip"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs transition-all shadow-sm hover:scale-105 shrink-0"
        >
          <span>📥 NENAPIYUMA-AI-USB-Windows.zip දැන්ම බාගත කරන්න</span>
        </a>
      </div>

      {/* 3-Zone Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ramUsageGb={ramUsageGb}
      />

      {/* Main View Area */}
      <main className="flex-1 min-h-0">
        {activeTab === 'chat' && <ChatPlayground ramUsageGb={ramUsageGb} />}
        {activeTab === 'usb-guard' && <UsbGuardSandbox />}
        {activeTab === 'repo' && <RepoExplorer />}
        {activeTab === 'export' && <PackageExporter />}
        {activeTab === 'budget' && <HardwareCalculator />}
      </main>
    </div>
  );
}
