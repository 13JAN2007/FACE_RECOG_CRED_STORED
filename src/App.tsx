/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, CheckCircle2 } from 'lucide-react';
import { INITIAL_PERSONNEL } from './data/defaultPersonnel';
import { PersonCredential } from './types';
import { WebcamHUD } from './components/WebcamHUD';
import { PersonnelManager } from './components/PersonnelManager';
import { CodeViewer } from './components/CodeViewer';
import { QuickStartGuide } from './components/QuickStartGuide';
import { generateProjectZip, downloadBlob } from './utils/zipGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'camera' | 'personnel' | 'code' | 'guide'>('camera');
  const [personnel, setPersonnel] = useState<PersonCredential[]>(INITIAL_PERSONNEL);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [capturedImageForEnroll, setCapturedImageForEnroll] = useState<string | undefined>(undefined);
  const [capturedVectorForEnroll, setCapturedVectorForEnroll] = useState<number[] | undefined>(undefined);
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<boolean>(false);

  const handleAddPerson = (newPerson: PersonCredential) => {
    setPersonnel(prev => [newPerson, ...prev]);
  };

  const handleDeletePerson = (id: string) => {
    setPersonnel(prev => prev.filter(p => p.id !== id));
  };

  const handleOpenEnrollWithSnapshot = (capturedImg?: string, capturedVec?: number[]) => {
    setCapturedImageForEnroll(capturedImg);
    setCapturedVectorForEnroll(capturedVec);
    setIsEnrollModalOpen(true);
  };

  const handleDownloadZip = async () => {
    setIsGeneratingZip(true);
    try {
      const isCustomized = personnel.length !== INITIAL_PERSONNEL.length || personnel.some(p => p.image.startsWith('data:image/'));

      if (!isCustomized) {
        const a = document.createElement('a');
        a.href = '/face_recognition_system.zip';
        a.download = 'face_recognition_system.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const blob = await generateProjectZip(personnel);
        downloadBlob(blob, 'face_recognition_system.zip');
      }

      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 4000);
    } catch {
      window.location.href = '/face_recognition_system.zip';
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Bar Contract (One-row, 3-zone architecture) */}
      <header className="border-b border-slate-800/80 bg-[#090c15]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); setActiveTab('camera'); }}
            className="text-base font-bold tracking-tight text-white flex items-center space-x-2.5 shrink-0"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Sentinel Vision</span>
          </a>

          {/* Zone 2: Navigation Links (Text with subtle active underline) */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium">
            <button
              onClick={() => setActiveTab('camera')}
              className={`py-2 transition-colors cursor-pointer ${
                activeTab === 'camera'
                  ? 'text-white border-b-2 border-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Recognition
            </button>

            <button
              onClick={() => setActiveTab('personnel')}
              className={`py-2 transition-colors cursor-pointer ${
                activeTab === 'personnel'
                  ? 'text-white border-b-2 border-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Enrolled Profiles ({personnel.length})
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`py-2 transition-colors cursor-pointer ${
                activeTab === 'code'
                  ? 'text-white border-b-2 border-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Python Codebase
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`py-2 transition-colors cursor-pointer ${
                activeTab === 'guide'
                  ? 'text-white border-b-2 border-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Setup Guide
            </button>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadZip}
              disabled={isGeneratingZip}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium flex items-center space-x-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingZip ? 'Packaging...' : 'Download Python Package (.zip)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-6">
        {activeTab === 'camera' && (
          <WebcamHUD
            personnel={personnel}
            onEnrollNew={handleOpenEnrollWithSnapshot}
          />
        )}

        {activeTab === 'personnel' && (
          <PersonnelManager
            personnel={personnel}
            onAddPerson={handleAddPerson}
            onDeletePerson={handleDeletePerson}
            isEnrollModalOpen={isEnrollModalOpen}
            setIsEnrollModalOpen={setIsEnrollModalOpen}
            presetCapturedImage={capturedImageForEnroll}
            presetCapturedVector={capturedVectorForEnroll}
          />
        )}

        {activeTab === 'code' && (
          <CodeViewer />
        )}

        {activeTab === 'guide' && (
          <QuickStartGuide
            onDownloadZip={handleDownloadZip}
            isGeneratingZip={isGeneratingZip}
          />
        )}
      </main>

      {/* Download Success Toast */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0e131f] border border-emerald-500/80 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white">Python Archive Downloaded</p>
            <p className="text-[11px] text-slate-400">Extract face_recognition_system.zip and run python main.py.</p>
          </div>
        </div>
      )}

      {/* Quiet Footer */}
      <footer className="border-t border-slate-900 bg-[#080a11] py-5 px-6 text-center text-xs text-slate-500">
        <span>Sentinel Biometric Vision System</span>
        <span className="mx-2">·</span>
        <span>Standalone Python OpenCV & DeepFace Framework</span>
      </footer>
    </div>
  );
}
