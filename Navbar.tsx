import React from 'react';
import { Shield, MessageSquare, FolderCode, Download, Cpu, HardDrive } from 'lucide-react';

interface NavbarProps {
  activeTab: 'chat' | 'usb-guard' | 'repo' | 'export' | 'budget';
  setActiveTab: (tab: 'chat' | 'usb-guard' | 'repo' | 'export' | 'budget') => void;
  ramUsageGb: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, ramUsageGb }) => {
  return (
    <header className="flex items-center justify-between gap-6 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-sm">
          N
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            නැනපියුම <span className="text-amber-400">NENAPIYUMA</span> AI USB
          </span>
          <span className="text-[10px] text-slate-400">Windows Portable · 6GB RAM & USB Target</span>
        </div>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800/80">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'chat'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span>සිංහල AI Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('usb-guard')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'usb-guard'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          <span>USB Guard ආරක්ෂාව</span>
        </button>

        <button
          onClick={() => setActiveTab('repo')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'repo'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderCode className="w-3.5 h-3.5 text-emerald-400" />
          <span>කේත ගොනු (Repo)</span>
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'export'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>1-Click ZIP Release</span>
        </button>

        <button
          onClick={() => setActiveTab('budget')}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'budget'
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5 text-purple-400" />
          <span>මතක අයවැය & මාර්ගෝපදේශ</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action & Hardware Status */}
      <div className="flex items-center gap-3 shrink-0 text-xs">
        <a
          href="/NENAPIYUMA-AI-USB.zip"
          download="NENAPIYUMA-AI-USB.zip"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ZIP බාගත කරන්න</span>
        </a>

        <div className="flex items-center gap-1.5 text-emerald-400 font-mono-code bg-emerald-950/40 border border-emerald-900/60 px-2.5 py-1 rounded-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Offline (Air-Gapped)</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-1.5 text-slate-400 font-mono-code bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span>RAM: {ramUsageGb.toFixed(1)} / 6.0 GB</span>
        </div>
      </div>
    </header>
  );
};
