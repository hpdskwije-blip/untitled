import React, { useState } from 'react';
import { Shield, HardDrive, RefreshCw, AlertTriangle, CheckCircle, Lock, Trash2, RotateCcw, FileText, Check, Search } from 'lucide-react';
import { DriveInfo, ScanFinding, QuarantineRecord, IntegrityRecord } from '../types';

export const UsbGuardSandbox: React.FC = () => {
  const [drives, setDrives] = useState<DriveInfo[]>([
    {
      letter: 'E:',
      name: 'Kingston DataTraveler (NENAPIYUMA Target)',
      totalGb: 6.0,
      freeGb: 3.82,
      type: 'removable'
    },
    {
      letter: 'F:',
      name: 'SanDisk Extreme SSD',
      totalGb: 2000.0,
      freeGb: 1420.0,
      type: 'removable'
    },
    {
      letter: 'C:',
      name: 'Windows System Disk (NVMe)',
      totalGb: 512.0,
      freeGb: 198.0,
      type: 'fixed'
    }
  ]);

  const [selectedDrive, setSelectedDrive] = useState<string>('E:');
  const [activeTab, setActiveTab] = useState<'scan' | 'quarantine' | 'integrity'>('scan');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scannedFilesCount, setScannedFilesCount] = useState<number>(0);
  const [currentScanningFile, setCurrentScanningFile] = useState<string>('');
  
  const [findings, setFindings] = useState<ScanFinding[]>([
    {
      id: 'threat-1',
      filePath: 'E:\\autorun.inf',
      threatName: 'USB.Autorun.SuspiciousExecutor',
      severity: 'HIGH',
      type: 'heuristic',
      details: 'Contains open=malware.exe directive aiming to execute on drive insertion',
      quarantined: false
    },
    {
      id: 'threat-2',
      filePath: 'E:\\Documents_Tax_Invoice.pdf.exe',
      threatName: 'USB.Heuristic.DoubleExtension',
      severity: 'CRITICAL',
      type: 'heuristic',
      details: 'Disguised executable posing as a PDF invoice document',
      quarantined: false
    },
    {
      id: 'threat-3',
      filePath: 'E:\\eicar_test_sample.com',
      threatName: 'EICAR-Standard-Antivirus-Test',
      severity: 'TEST',
      type: 'signature',
      details: 'Antivirus verification test payload matching ClamAV signature database',
      quarantined: false
    }
  ]);

  const [quarantineVault, setQuarantineVault] = useState<QuarantineRecord[]>([
    {
      id: 'quar-7821-ab90',
      originalPath: 'E:\\Recycle.Bin\\setup_worm.vbs',
      vaultPath: 'E:\\.nenapiyuma\\quarantine\\quar-7821-ab90.vir',
      threatName: 'VBS.Houdini.Worm.Dropper',
      sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      fileSizeBytes: 14208,
      quarantinedAt: '2026-10-10 09:12:40 UTC',
      isRestored: false
    }
  ]);

  const [integrityList, setIntegrityList] = useState<IntegrityRecord[]>([
    {
      file: 'NENAPIYUMA.exe',
      expectedHash: 'd41d8cd98f00b204e9800998ecf8427e998ecf8427e998ecf8427e998ecf8427',
      actualHash: 'd41d8cd98f00b204e9800998ecf8427e998ecf8427e998ecf8427e998ecf8427',
      status: 'VERIFIED'
    },
    {
      file: 'models/gemma3.gguf',
      expectedHash: '893c52e1f40d11be552145b41097ff8b9706316fae9a5ef8c82823a3118a1a11',
      actualHash: '893c52e1f40d11be552145b41097ff8b9706316fae9a5ef8c82823a3118a1a11',
      status: 'VERIFIED'
    },
    {
      file: 'tools/clamav/clamscan.exe',
      expectedHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      actualHash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      status: 'VERIFIED'
    }
  ]);

  const handleStartScan = (mode: 'quick' | 'deep') => {
    setIsScanning(true);
    setScanProgress(0);
    setScannedFilesCount(0);

    const fileList = [
      `${selectedDrive}\\autorun.inf`,
      `${selectedDrive}\\NENAPIYUMA.exe`,
      `${selectedDrive}\\models\\gemma3.gguf`,
      `${selectedDrive}\\tools\\clamav\\clamscan.exe`,
      `${selectedDrive}\\tools\\clamav\\database\\main.cvd`,
      `${selectedDrive}\\Documents_Tax_Invoice.pdf.exe`,
      `${selectedDrive}\\Study_Notes_2026.docx`,
      `${selectedDrive}\\Presentation_Slides.pptx`,
      `${selectedDrive}\\eicar_test_sample.com`,
      `${selectedDrive}\\config\\settings.json`
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setCurrentScanningFile(fileList[current % fileList.length]);
      setScannedFilesCount(current * 8);
      const progress = Math.min(100, Math.floor((current / 12) * 100));
      setScanProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setCurrentScanningFile('ස්කෑන් කිරීම සාර්ථකව අවසන්. (Scan completed successfully)');
      }
    }, 180);
  };

  const handleQuarantine = (finding: ScanFinding) => {
    const id = `quar-${Math.random().toString(36).substring(2, 9)}`;
    const record: QuarantineRecord = {
      id,
      originalPath: finding.filePath,
      vaultPath: `${selectedDrive}\\.nenapiyuma\\quarantine\\${id}.vir`,
      threatName: finding.threatName,
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      fileSizeBytes: 2048,
      quarantinedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      isRestored: false
    };

    setQuarantineVault((prev) => [record, ...prev]);
    setFindings((prev) =>
      prev.map((f) => (f.id === finding.id ? { ...f, quarantined: true } : f))
    );
  };

  const handleRestore = (id: string) => {
    setQuarantineVault((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isRestored: true } : r))
    );
  };

  const handleDeleteQuarantine = (id: string) => {
    if (confirm('මෙම නිරෝධායන ගොනුව ස්ථිරවම මකා දැමීමට ඔබට විශ්වාසද?')) {
      setQuarantineVault((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-6xl mx-auto p-4 md:p-6 gap-5 overflow-y-auto">
      {/* Top Banner: Connected Drive Selector & Engine Status */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-950 border border-sky-800/80 flex items-center justify-center text-sky-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>NENAPIYUMA USB Guard</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/50">
                  ClamAV Portable & Heuristics
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                නොබැඳි වෛරස් ස්කෑන් එන්ජිම · USB Autorun, Double Extension සහ Worms හඳුනාගැනීම
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 whitespace-nowrap">ඉලක්ක ධාවකය (Drive):</label>
            <select
              value={selectedDrive}
              onChange={(e) => setSelectedDrive(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 px-3 py-2 outline-none focus:border-sky-500 font-mono-code"
            >
              {drives.map((d) => (
                <option key={d.letter} value={d.letter}>
                  {d.letter} ({d.name}) — {d.freeGb} GB නිදහස් / {d.totalGb} GB
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Engine Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>ClamAV එන්ජිම: <strong>1.3.1 Portable Ready</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>දත්ත ගබඩාව: <strong>main.cvd + daily.cvd</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>Quarantine සුරක්ෂිතාගාරය: <strong>XOR PE Scrambled</strong></span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'scan'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>ස්කෑන් පරීක්ෂාව (Malware Scanner)</span>
        </button>

        <button
          onClick={() => setActiveTab('quarantine')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'quarantine'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>නිරෝධායන සුරක්ෂිතාගාරය (Quarantine Vault)</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded-full">
            {quarantineVault.filter((q) => !q.isRestored).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('integrity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'integrity'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>මෘදුකාංග අඛණ්ඩතාව (File Integrity SHA-256)</span>
        </button>
      </div>

      {/* Tab 1: Scanner View */}
      {activeTab === 'scan' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <button
                disabled={isScanning}
                onClick={() => handleStartScan('quick')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>ඉක්මන් ස්කෑන් (Quick Scan)</span>
              </button>

              <button
                disabled={isScanning}
                onClick={() => handleStartScan('deep')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium transition-colors"
              >
                <span>සම්පූර්ණ ස්කෑන් (Deep Scan)</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 font-mono-code">
              ගොනු {scannedFilesCount} ක් පරීක්ෂා කරන ලදී
            </div>
          </div>

          {/* Scan Progress Telemetry */}
          {isScanning && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sky-300 font-sinhala">ස්කෑන් කරමින් පවතී...</span>
                <span className="font-mono-code text-sky-400">{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-sky-500 h-full transition-all duration-150"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="text-[11px] font-mono-code text-slate-400 truncate">
                {currentScanningFile}
              </div>
            </div>
          )}

          {/* Findings Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                හඳුනාගත් තර්ජන (Threat Findings)
              </span>
              <span className="text-xs text-slate-400 font-mono-code">
                {findings.filter((f) => !f.quarantined).length} සක්‍රීය තර්ජන
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono-code ${
                          finding.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/60'
                            : finding.severity === 'HIGH'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                            : 'bg-sky-950 text-sky-400 border border-sky-800/60'
                        }`}
                      >
                        {finding.severity}
                      </span>
                      <span className="text-sm font-semibold text-white font-mono-code">
                        {finding.threatName}
                      </span>
                    </div>

                    <p className="text-xs font-mono-code text-slate-300">
                      {finding.filePath}
                    </p>
                    <p className="text-xs text-slate-400 font-sinhala">
                      {finding.details}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {finding.quarantined ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-3 py-1.5 rounded-lg">
                        <Check className="w-3.5 h-3.5" />
                        <span>නිරෝධායනය කරන ලදී</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleQuarantine(finding)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-rose-200 bg-rose-900/60 hover:bg-rose-800/80 border border-rose-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>නිරෝධායනය (Quarantine)</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quarantine Vault */}
      {activeTab === 'quarantine' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-5">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>නිරෝධායන සුරක්ෂිතාගාරය (.nenapiyuma/quarantine)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              මෙම ගොනු XOR බයිට් මඟින් Scramble කර ඇති බැවින් Windows Explorer හෝ Double-click මඟින් කිසිසේත් ධාවනය කළ නොහැක.
            </p>
          </div>

          <div className="space-y-3">
            {quarantineVault.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 font-mono-code">
                      {item.threatName}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono-code">
                      ({item.fileSizeBytes} bytes)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono-code">
                    {item.quarantinedAt}
                  </span>
                </div>

                <div className="text-xs font-mono-code text-slate-300">
                  <span className="text-slate-400">මුල් පිහිටීම (Original): </span>
                  {item.originalPath}
                </div>

                <div className="text-xs font-mono-code text-slate-400 truncate">
                  <span className="text-slate-400">SHA-256: </span>
                  {item.sha256}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                  {item.isRestored ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> මුල් තැනට නැවත පිහිටුවන ලදී (Restored)
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleRestore(item.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>නැවත පිහිටුවන්න (Restore)</span>
                      </button>

                      <button
                        onClick={() => handleDeleteQuarantine(item.id)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-rose-950 hover:bg-rose-900 text-xs text-rose-300 border border-rose-800/60 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>ස්ථිරවම මකන්න (Delete)</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Integrity Audit */}
      {activeTab === 'integrity' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>මූලික ගොනු හා Gemma ආකෘතියේ අඛණ්ඩතා පරීක්ෂාව (SHA-256 Catalog)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              USB ධාවකය වෙනත් පරිගණකයකට සම්බන්ධ කළ විට NENAPIYUMA.exe හෝ Gemma ආකෘතියට අනවසර වෙනස්කම් (tampering) සිදුවී ඇත්දැයි ක්ෂණිකව සත්‍යාපනය කෙරේ.
            </p>
          </div>

          <div className="space-y-3">
            {integrityList.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-white font-mono-code">{item.file}</div>
                  <div className="font-mono-code text-[11px] text-slate-400 mt-0.5 truncate max-w-xl">
                    SHA-256: {item.actualHash}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-emerald-400 font-mono-code bg-emerald-950/40 border border-emerald-900 px-2.5 py-1 rounded">
                    <Check className="w-3 h-3" />
                    <span>VERIFIED INTACT</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
