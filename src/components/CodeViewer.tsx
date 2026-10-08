import React, { useState } from 'react';
import { PYTHON_FILES } from '../data/defaultPersonnel';
import { Copy, Check, FileCode, Download } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<string>("main.py");
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = PYTHON_FILES.find(f => f.name === selectedFileName) || PYTHON_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0e131f] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* File Navigation Header */}
      <div className="bg-[#0b0e17] px-5 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          {PYTHON_FILES.map((file) => {
            const isSelected = file.name === selectedFileName;
            return (
              <button
                key={file.name}
                onClick={() => setSelectedFileName(file.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-2 transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-800 text-cyan-400 font-medium border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{file.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadSingle}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="truncate">{activeFile.description}</span>
        <span className="text-[11px] font-mono text-slate-500 uppercase">{activeFile.language}</span>
      </div>

      {/* Code Text */}
      <div className="p-5 bg-slate-950 overflow-x-auto max-h-[520px] text-xs font-mono leading-relaxed text-slate-300 select-text">
        <pre>
          <code>
            {activeFile.content.split('\n').map((line, idx) => (
              <div key={idx} className="table-row hover:bg-slate-900/40">
                <span className="table-cell select-none pr-5 text-right text-slate-600 font-mono text-[11px] w-8">
                  {idx + 1}
                </span>
                <span className="table-cell whitespace-pre font-mono">
                  {colorizeLine(line, activeFile.language)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

function colorizeLine(line: string, language: string): React.ReactNode {
  if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
    return <span className="text-slate-500">{line}</span>;
  }
  if (line.trim().startsWith('"""') || line.trim().endsWith('"""') || line.trim().startsWith("'''")) {
    return <span className="text-emerald-400/80">{line}</span>;
  }
  if (line.includes('def ') || line.includes('class ')) {
    return <span className="text-cyan-300 font-medium">{line}</span>;
  }
  if (line.includes('import ') || line.includes('from ')) {
    return <span className="text-purple-400">{line}</span>;
  }
  if (language === 'json') {
    return <span className="text-slate-200">{line}</span>;
  }
  return line;
}
