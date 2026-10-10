import React, { useState } from 'react';
import { FolderCode, FileText, Copy, Check, Download, Code, Layers } from 'lucide-react';
import { PROJECT_FILES } from '../data/projectFiles';
import { ProjectFile } from '../types';

export const RepoExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'සියලු ගොනු (All)' },
    { id: 'core', label: 'Core / Main' },
    { id: 'ai', label: 'AI Inference' },
    { id: 'security', label: 'Security & USB' },
    { id: 'workflow', label: 'GitHub Actions' },
    { id: 'scripts', label: 'Build Scripts' },
    { id: 'config', label: 'Config' },
    { id: 'docs', label: 'Documentation' }
  ];

  const filteredFiles = PROJECT_FILES.filter(
    (f) => selectedCategory === 'all' || f.category === selectedCategory
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.path.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-7xl mx-auto p-4 md:p-6 gap-4 overflow-hidden">
      {/* Category Pills & Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-mono-code">
          {filteredFiles.length} ගොනු (Files in Repository)
        </div>
      </div>

      {/* Main Split Layout: File Tree on left, Code Viewer on right */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Left Sidebar: File List */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-xl overflow-y-auto p-2 space-y-1">
          {filteredFiles.map((file) => (
            <button
              key={file.path}
              onClick={() => setSelectedFile(file)}
              className={`w-full text-left p-3 rounded-lg transition-all flex flex-col gap-1 ${
                selectedFile.path === file.path
                  ? 'bg-slate-800 border border-amber-500/40 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-mono-code font-semibold truncate text-slate-200">
                  {file.path.replace('NENAPIYUMA-AI-USB/', '')}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 line-clamp-1">
                {file.description}
              </span>
            </button>
          ))}
        </div>

        {/* Right Panel: Code Viewer */}
        <div className="md:col-span-8 bg-slate-950 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/80 shrink-0">
            <div className="flex items-center gap-2 font-mono-code text-xs text-white">
              <span className="text-amber-400 font-semibold">{selectedFile.path}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">පිටපත් විය</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadFile}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>බාගත කරන්න</span>
              </button>
            </div>
          </div>

          {/* Code Content Area with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono-code text-xs text-slate-200 leading-relaxed bg-[#0b0f19]">
            <pre className="whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
