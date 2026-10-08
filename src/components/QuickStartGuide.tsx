import React from 'react';
import { Terminal, Download, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

interface QuickStartGuideProps {
  onDownloadZip: () => void;
  isGeneratingZip: boolean;
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ onDownloadZip, isGeneratingZip }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="bg-[#0e131f] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-semibold text-white mb-4">
              1
            </div>
            <h4 className="text-base font-semibold text-white tracking-tight mb-1.5">Download Project Package</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Acquire the complete standalone Python package containing OpenCV webcam drivers, preloaded photos, and metadata.
            </p>

            <button
              onClick={onDownloadZip}
              disabled={isGeneratingZip}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGeneratingZip ? 'Packaging Files...' : 'Download Project (.zip)'}</span>
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/60 font-mono text-[11px] text-slate-400">
            Archive size: ~26 KB
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-[#0e131f] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-semibold text-white mb-4">
              2
            </div>
            <h4 className="text-base font-semibold text-white tracking-tight mb-1.5">Environment Setup</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Create an isolated Python virtual environment and install the required vision dependencies.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 space-y-1.5">
              <p className="text-slate-500 text-[10px]">macOS / Linux</p>
              <p className="text-cyan-300">python3 -m venv venv</p>
              <p className="text-cyan-300">source venv/bin/activate</p>
              <p className="text-emerald-400">pip install -r requirements.txt</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
            For Windows: Run <code className="text-slate-200">venv\Scripts\activate</code>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-[#0e131f] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-semibold text-white mb-4">
              3
            </div>
            <h4 className="text-base font-semibold text-white tracking-tight mb-1.5">Launch Optical Recognition</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Execute the primary recognition script to open your hardware camera stream with live bounding boxes.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Primary Deep-Learning:</span>
                <code className="text-emerald-400">python main.py</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Zero-Compiler OpenCV:</span>
                <code className="text-cyan-300">python recognizer_lightweight.py</code>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Enrollment Wizard:</span>
                <code className="text-amber-400">python enroll_person.py</code>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
            Hotkeys: <code className="text-slate-200">q</code> to quit, <code className="text-slate-200">s</code> for snapshot
          </div>
        </div>
      </div>
    </div>
  );
};
