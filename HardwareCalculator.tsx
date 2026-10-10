import React, { useState } from 'react';
import { Cpu, HardDrive, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, Layers } from 'lucide-react';

export const HardwareCalculator: React.FC = () => {
  const [contextTokens, setContextTokens] = useState<number>(2048);

  // Dynamic RAM calculation based on context window for Gemma 3
  // Base Windows: 2.5 GB
  // Gemma 3 weights (gemma3.gguf Q4): ~0.85 GB
  // KV Cache: ~0.10 GB per 1024 tokens
  // PySide6 GUI + Overhead: 0.12 GB
  const kvCacheGb = (contextTokens / 1024) * 0.10;
  const modelRamGb = 0.85 + kvCacheGb;
  const osRamGb = 2.5;
  const appRamGb = 0.15;
  const totalEstimatedRamGb = +(osRamGb + modelRamGb + appRamGb).toFixed(2);
  const isRamSafe = totalEstimatedRamGb <= 5.2;

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-6xl mx-auto p-4 md:p-6 gap-6 overflow-y-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-purple-400" />
          <span>6 GB RAM සහ 6 GB USB මතක අයවැය කැල්කියුලේටරය (Hardware Budget)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-sinhala">
          සාමාන්‍ය 6 GB RAM පරිගණකයක Windows මෙහෙයුම් පද්ධතිය බිඳ නොවැටී සුමටව ධාවනය වන බව තහවුරු කරන ඉංජිනේරු ගණනය කිරීම්.
        </p>
      </div>

      {/* Grid: RAM Budget & USB Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Box 1: 6 GB RAM Allocation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span>පරිගණකයේ RAM පරිභෝජනය (Total 6.0 GB)</span>
            </h3>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-mono-code font-bold ${
                isRamSafe
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {isRamSafe ? '✓ ආරක්ෂිතයි (SAFE)' : '⚠️ අවදානම් (RISK)'}
            </span>
          </div>

          {/* Visual RAM Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-code">
              <span className="text-slate-400">ඇස්තමේන්තුගත භාවිතය:</span>
              <span className={isRamSafe ? 'text-sky-400 font-bold' : 'text-rose-400 font-bold'}>
                {totalEstimatedRamGb} GB / 6.00 GB
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800">
              <div
                className="bg-slate-600 h-full"
                style={{ width: `${(osRamGb / 6.0) * 100}%` }}
                title="Windows OS: 2.5 GB"
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${(modelRamGb / 6.0) * 100}%` }}
                title={`Gemma 2 2B + KV Cache: ${modelRamGb.toFixed(2)} GB`}
              />
              <div
                className="bg-sky-500 h-full"
                style={{ width: `${(appRamGb / 6.0) * 100}%` }}
                title="NENAPIYUMA App: 0.15 GB"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-code">
              <span>0 GB</span>
              <span>ඉතිරි මතකය (Free Cushion): {(6.0 - totalEstimatedRamGb).toFixed(2)} GB</span>
              <span>6.0 GB</span>
            </div>
          </div>

          {/* Context Window Slider */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-sinhala">සන්දර්භ දිග (Context Window):</span>
              <span className="font-mono-code text-amber-400 font-bold">{contextTokens} Tokens</span>
            </div>
            <input
              type="range"
              min="512"
              max="4096"
              step="512"
              value={contextTokens}
              onChange={(e) => setContextTokens(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 font-sinhala">
              *6 GB RAM සඳහා <strong>2048 Tokens</strong> නිර්දේශ කෙරේ. මෙය RAM භාවිතය 4.5 GB සීමාවේ රඳවා තබයි.
            </p>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-1.5 text-xs font-mono-code text-slate-300">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>• Windows 10/11 මූලික මෙහෙයුම් පද්ධතිය:</span>
              <span className="text-slate-400">2.50 GB</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>• Gemma 2 2B Q4_K_M GGUF බර:</span>
              <span className="text-amber-400">1.62 GB</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>• KV Cache ({contextTokens} tokens):</span>
              <span className="text-amber-300">{kvCacheGb.toFixed(2)} GB</span>
            </div>
            <div className="flex justify-between py-1">
              <span>• PySide6 & ClamAV මතකය:</span>
              <span className="text-sky-400">0.15 GB</span>
            </div>
          </div>
        </div>

        {/* Box 2: 6 GB USB Flash Storage Allocation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>USB ධාවකයේ ඉඩ බෙදීයාම (Total 6.0 GB USB)</span>
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded font-mono-code font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
              3.82 GB නිදහස් (FREE)
            </span>
          </div>

          {/* Visual Storage Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono-code">
              <span className="text-slate-400">භාවිතා වන මුළු ඉඩ:</span>
              <span className="text-emerald-400 font-bold">1.42 GB / 6.00 GB (24%)</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex border border-slate-800">
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${(0.85 / 6.0) * 100}%` }}
                title="Gemma 3 GGUF (gemma3.gguf): 850 MB"
              />
              <div
                className="bg-sky-500 h-full"
                style={{ width: `${(0.28 / 6.0) * 100}%` }}
                title="ClamAV & Signatures: 280 MB"
              />
              <div
                className="bg-purple-500 h-full"
                style={{ width: `${(0.085 / 6.0) * 100}%` }}
                title="NENAPIYUMA.exe: 85 MB"
              />
              <div
                className="bg-slate-700 h-full"
                style={{ width: `${(0.2 / 6.0) * 100}%` }}
                title="Quarantine & SQLite: 200 MB"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono-code">
              <span>0 GB</span>
              <span>පරිශීලකයාගේ වෙනත් ගොනු සඳහා 4.58 GB (76%) නිදහස්ව ඇත</span>
              <span>6.0 GB</span>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-1.5 text-xs font-mono-code text-slate-300 pt-2">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>• Gemma 3 GGUF (gemma3.gguf):</span>
              <span className="text-amber-400">850 MB (~0.85 GB)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>• ClamAV එන්ජිම & Offline Signatures:</span>
              <span className="text-sky-400">280 MB</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>• NENAPIYUMA.exe & Portable Python:</span>
              <span className="text-purple-400">85 MB</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>• SQLite දත්ත ගබඩාව & Quarantine Reserve:</span>
              <span className="text-slate-400">200 MB</span>
            </div>
            <div className="flex justify-between py-1 text-emerald-400 font-bold">
              <span>• ඉතිරි නිදහස් ඉඩ (Free User Storage):</span>
              <span>4.58 GB (76%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Sinhala Visual Setup Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span>පියවරෙන් පියවර සරල භාවිත උපදෙස් (Sinhala Step-by-Step Manual)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono-code">
              1
            </span>
            <div className="font-bold text-white font-sinhala">බාගත කිරීම</div>
            <p className="text-slate-400 font-sinhala leading-relaxed text-[11px]">
              GitHub Releases පිටුවෙන් සම්පූර්ණ NENAPIYUMA ZIP ගොනුව බාගත කරගන්න.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono-code">
              2
            </span>
            <div className="font-bold text-white font-sinhala">Extract කිරීම</div>
            <p className="text-slate-400 font-sinhala leading-relaxed text-[11px]">
              ZIP එක මත Right-click කර Extract All තෝරා ෆෝල්ඩරය දිගහරින්න.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono-code">
              3
            </span>
            <div className="font-bold text-white font-sinhala">USB එකට පිටපත්</div>
            <p className="text-slate-400 font-sinhala leading-relaxed text-[11px]">
              ෆෝල්ඩරය 6 GB හෝ ඊට වැඩි ඕනෑම USB Flash Drive එකකට Copy කරන්න.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono-code">
              4
            </span>
            <div className="font-bold text-white font-sinhala">NENAPIYUMA.exe</div>
            <p className="text-slate-400 font-sinhala leading-relaxed text-[11px]">
              USB එක ඇතුළේ ඇති NENAPIYUMA.exe මත double-click කර විවෘත කරන්න.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono-code">
              5
            </span>
            <div className="font-bold text-emerald-400 font-sinhala">නොබැඳි සංවාදය</div>
            <p className="text-slate-400 font-sinhala leading-relaxed text-[11px]">
              Gemma 2 ආකෘතිය ස්වයංක්‍රීයව පූරණය වී සංවාදයට සූදානම් වේ!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
