import React, { useRef, useState, useEffect } from 'react';
import {
  Camera, CameraOff, Volume2, VolumeX, ShieldCheck, ShieldAlert,
  UserPlus, Eye, Sliders, UserX, CheckCircle, AlertCircle
} from 'lucide-react';
import { PersonCredential } from '../types';
import { sounds } from '../utils/audio';
import {
  extractFaceVector, calculateCosineSimilarity, extractVectorFromImageUrl
} from '../utils/faceMatcher';

interface WebcamHUDProps {
  personnel: PersonCredential[];
  onEnrollNew: (capturedImage?: string, capturedVector?: number[]) => void;
}

interface EnrolleeScore {
  person: PersonCredential;
  score: number;
  isMatch: boolean;
}

export const WebcamHUD: React.FC<WebcamHUDProps> = ({ personnel, onEnrollNew }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [feedMode, setFeedMode] = useState<'simulator' | 'webcam'>('simulator');
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [simulatedSubjectId, setSimulatedSubjectId] = useState<string>('auto');

  const [threshold, setThreshold] = useState<number>(0.74);
  const [liveScores, setLiveScores] = useState<EnrolleeScore[]>([]);
  const [bestMatch, setBestMatch] = useState<PersonCredential | null>(null);
  const [bestScore, setBestScore] = useState<number>(0);
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);

  const simTargetRef = useRef({ x: 260, y: 120, vx: 0.7, vy: 0.5 });
  const vectorsMapRef = useRef<Map<string, Float32Array>>(new Map());
  const lastExtractedFaceCropRef = useRef<string | null>(null);
  const lastExtractedVectorRef = useRef<number[] | null>(null);

  // Pre-load biometric vectors
  useEffect(() => {
    let isCancelled = false;
    const loadVectors = async () => {
      for (const p of personnel) {
        if (vectorsMapRef.current.has(p.id)) continue;
        if (p.biometricVector && p.biometricVector.length === 256) {
          vectorsMapRef.current.set(p.id, new Float32Array(p.biometricVector));
        } else if (p.image) {
          try {
            const vec = await extractVectorFromImageUrl(p.image);
            if (!isCancelled) {
              vectorsMapRef.current.set(p.id, vec);
            }
          } catch {
            // Safe fallback
          }
        }
      }
    };
    loadVectors();
    return () => { isCancelled = true; };
  }, [personnel]);

  // Start hardware webcam
  const startWebcam = async () => {
    setStreamError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access not supported in this browser context.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsWebcamActive(true);
        setFeedMode('webcam');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Camera access was denied";
      setStreamError(msg);
      setFeedMode('simulator');
      setIsWebcamActive(false);
    }
  };

  const stopWebcam = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsWebcamActive(false);
    setFeedMode('simulator');
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.setMuted(nextMuted);
  };

  const takeSnapshot = () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
      setLastSnapshot(dataUrl);
      sounds.playScan();
    } catch {
      // Safe fallback
    }
  };

  const handleEnrollCurrentFace = () => {
    if (lastExtractedFaceCropRef.current && lastExtractedVectorRef.current) {
      onEnrollNew(lastExtractedFaceCropRef.current, lastExtractedVectorRef.current);
    } else if (feedMode === 'webcam' && videoRef.current && videoRef.current.videoWidth) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 320;
      tempCanvas.height = 320;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        const vw = videoRef.current.videoWidth;
        const vh = videoRef.current.videoHeight;
        const s = Math.min(vw, vh) * 0.6;
        ctx.drawImage(videoRef.current, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, 320, 320);
        const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.92);
        const vec = Array.from(extractFaceVector(tempCanvas, 0, 0, 320, 320));
        onEnrollNew(dataUrl, vec);
      }
    } else {
      onEnrollNew();
    }
  };

  // Main high-precision render loop
  useEffect(() => {
    let animId: number;
    let lastComparisonTime = 0;
    let prevMatchedId: string | null = null;

    const hasNativeFaceDetector = typeof window !== 'undefined' && 'FaceDetector' in window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const faceDetector = hasNativeFaceDetector ? new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 }) : null;

    const render = async () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const now = performance.now();

      let faceX = 0, faceY = 0, faceW = 240, faceH = 300;
      let isFaceLocked = false;

      // 1. Draw Viewport Background
      if (feedMode === 'webcam' && isWebcamActive && video && video.readyState >= 2 && video.videoWidth > 0) {
        ctx.drawImage(video, 0, 0, width, height);

        if (faceDetector) {
          try {
            const faces = await faceDetector.detect(video);
            if (faces && faces.length > 0) {
              const f = faces[0].boundingBox;
              const scaleX = width / video.videoWidth;
              const scaleY = height / video.videoHeight;
              faceX = f.x * scaleX;
              faceY = f.y * scaleY;
              faceW = f.width * scaleX;
              faceH = f.height * scaleY;
              isFaceLocked = true;
            }
          } catch {
            // Fallback
          }
        }

        if (!isFaceLocked) {
          faceW = Math.min(260, width * 0.28);
          faceH = faceW * 1.25;
          faceX = (width - faceW) / 2;
          faceY = (height - faceH) / 2 - 20;
          isFaceLocked = true;
        }
      } else {
        // High-end minimalist dark studio feed
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(0, 0, width, height);

        // Subtle precision grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 48) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y < height; y += 48) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }

        // Center crosshair
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.moveTo(width / 2 - 20, height / 2); ctx.lineTo(width / 2 + 20, height / 2);
        ctx.moveTo(width / 2, height / 2 - 20); ctx.lineTo(width / 2, height / 2 + 20);
        ctx.stroke();

        // Simulator target motion
        const sim = simTargetRef.current;
        sim.x += sim.vx;
        sim.y += sim.vy;
        if (sim.x < 120 || sim.x > width - 420) sim.vx *= -1;
        if (sim.y < 80 || sim.y > height - 360) sim.vy *= -1;

        faceX = sim.x;
        faceY = sim.y;
        faceW = 230;
        faceH = 280;
        isFaceLocked = true;

        // Elegant geometric silhouette
        const hx = faceX + faceW / 2;
        const hy = faceY + faceH / 2;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.beginPath();
        ctx.arc(hx, hy - 30, 62, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(hx, hy + 85, 95, 65, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Feature Vector Extraction & Comparison
      if (isFaceLocked && now - lastComparisonTime > 100) {
        lastComparisonTime = now;

        const liveSource = (feedMode === 'webcam' && isWebcamActive && video && video.readyState >= 2) ? video : canvas;
        const liveVec = extractFaceVector(liveSource, Math.max(0, faceX), Math.max(0, faceY), faceW, faceH);

        // Cache face snapshot for enrollment
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = 180;
        cropCanvas.height = 180;
        const cCtx = cropCanvas.getContext('2d');
        if (cCtx) {
          cCtx.drawImage(liveSource, Math.max(0, faceX), Math.max(0, faceY), faceW, faceH, 0, 0, 180, 180);
          lastExtractedFaceCropRef.current = cropCanvas.toDataURL('image/jpeg', 0.9);
          lastExtractedVectorRef.current = Array.from(liveVec);
        }

        let highestSim = 0;
        let matchedPerson: PersonCredential | null = null;
        const scores: EnrolleeScore[] = [];

        if (feedMode === 'simulator') {
          if (simulatedSubjectId === 'unknown') {
            highestSim = 0.44;
            matchedPerson = null;
            for (const p of personnel) {
              scores.push({ person: p, score: 0.35 + Math.random() * 0.08, isMatch: false });
            }
          } else {
            const target = (simulatedSubjectId === 'auto')
              ? personnel[0]
              : (personnel.find(p => p.id === simulatedSubjectId) || personnel[0]);

            if (target) {
              highestSim = 0.89 + Math.sin(now / 600) * 0.03;
              matchedPerson = highestSim >= threshold ? target : null;
              for (const p of personnel) {
                if (p.id === target.id) {
                  scores.push({ person: p, score: highestSim, isMatch: highestSim >= threshold });
                } else {
                  scores.push({ person: p, score: 0.36 + Math.random() * 0.08, isMatch: false });
                }
              }
            }
          }
        } else {
          for (const person of personnel) {
            let pVec = vectorsMapRef.current.get(person.id);
            if (!pVec && person.biometricVector) {
              pVec = new Float32Array(person.biometricVector);
              vectorsMapRef.current.set(person.id, pVec);
            }
            if (pVec) {
              const sim = calculateCosineSimilarity(liveVec, pVec);
              const isMatch = sim >= threshold;
              scores.push({ person, score: sim, isMatch });
              if (sim > highestSim) {
                highestSim = sim;
                if (isMatch) matchedPerson = person;
              }
            }
          }
        }

        scores.sort((a, b) => b.score - a.score);
        setLiveScores(scores);
        setBestMatch(matchedPerson);
        setBestScore(highestSim);

        const matchKey = matchedPerson ? matchedPerson.id : 'unknown';
        if (matchKey !== prevMatchedId) {
          prevMatchedId = matchKey;
          if (matchedPerson) {
            if (matchedPerson.status === 'AUTHORIZED') sounds.playGranted();
            else sounds.playDenied();
          } else {
            sounds.playDenied();
          }
        }
      }

      // 3. Draw Clean Viewfinder Brackets
      if (isFaceLocked) {
        const isRecognized = bestMatch !== null;
        const isAuth = isRecognized && bestMatch?.status === 'AUTHORIZED';

        let strokeColor = '#10b981'; // Refined Emerald
        if (!isRecognized) {
          strokeColor = '#f43f5e'; // Refined Rose
        } else if (!isAuth) {
          strokeColor = '#f59e0b'; // Amber
        }

        // Clean hairline face frame
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(faceX, faceY, faceW, faceH);

        // Precise optical corner marks
        const cl = 18;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        // Top-left
        ctx.moveTo(faceX, faceY + cl); ctx.lineTo(faceX, faceY); ctx.lineTo(faceX + cl, faceY);
        // Top-right
        ctx.moveTo(faceX + faceW - cl, faceY); ctx.lineTo(faceX + faceW, faceY); ctx.lineTo(faceX + faceW, faceY + cl);
        // Bottom-left
        ctx.moveTo(faceX, faceY + faceH - cl); ctx.lineTo(faceX, faceY + faceH); ctx.lineTo(faceX + cl, faceY + faceH);
        // Bottom-right
        ctx.moveTo(faceX + faceW - cl, faceY + faceH); ctx.lineTo(faceX + faceW, faceY + faceH); ctx.lineTo(faceX + faceW, faceY + faceH - cl);
        ctx.stroke();

        // Subtle floating ID tag directly above or beside the face
        const tagText = isRecognized && bestMatch ? bestMatch.name : 'Unrecognized Subject';
        const tagSub = isRecognized && bestMatch
          ? `${bestMatch.badge_id} · ${(bestScore * 100).toFixed(1)}% match`
          : 'Access Restricted';

        ctx.font = '600 13px ui-sans-serif, system-ui, sans-serif';
        const textMetrics = ctx.measureText(tagText);
        const tagW = Math.max(160, textMetrics.width + 48);
        const tagH = 44;

        let tagX = faceX;
        let tagY = faceY - tagH - 12;
        if (tagY < 16) {
          tagY = faceY + faceH + 12;
        }

        // Glass badge backdrop
        ctx.fillStyle = 'rgba(15, 20, 30, 0.92)';
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, tagH, 8);
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, tagH, 8);
        ctx.stroke();

        // Status indicator dot
        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(tagX + 16, tagY + 22, 4, 0, Math.PI * 2);
        ctx.fill();

        // Primary text
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
        ctx.fillText(tagText, tagX + 28, tagY + 18);

        // Subtext
        ctx.fillStyle = '#94a3b8';
        ctx.font = '400 11px ui-monospace, monospace';
        ctx.fillText(tagSub, tagX + 28, tagY + 34);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [feedMode, isWebcamActive, personnel, simulatedSubjectId, threshold]);

  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Studio Optical Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-[#0e131f] border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
            {/* Viewport Action Header */}
            <div className="px-5 py-3.5 bg-[#0b0e17] border-b border-slate-800/80 flex items-center justify-between gap-3">
              {/* Segmented Mode Control */}
              <div className="flex items-center p-1 bg-slate-900/90 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => {
                    if (isWebcamActive) stopWebcam();
                    setFeedMode('simulator');
                  }}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                    feedMode === 'simulator'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Interactive Test Feed
                </button>
                <button
                  onClick={() => {
                    if (!isWebcamActive) startWebcam();
                    else setFeedMode('webcam');
                  }}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
                    feedMode === 'webcam'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Hardware Webcam</span>
                </button>
              </div>

              {/* Functional Controls */}
              <div className="flex items-center space-x-2">
                {feedMode === 'simulator' && (
                  <select
                    value={simulatedSubjectId}
                    onChange={(e) => setSimulatedSubjectId(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="auto">Auto (Alex Mercer)</option>
                    {personnel.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.status})
                      </option>
                    ))}
                    <option value="unknown">Unregistered Visitor</option>
                  </select>
                )}

                <button
                  onClick={toggleMute}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={takeSnapshot}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title="Capture Frame Snapshot"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  onClick={handleEnrollCurrentFace}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Enroll Face</span>
                </button>
              </div>
            </div>

            {/* Video Canvas Container */}
            <div className="relative aspect-video bg-[#090b10] flex items-center justify-center overflow-hidden">
              <video ref={videoRef} playsInline muted autoPlay className="hidden" />
              <canvas ref={canvasRef} width={1280} height={720} className="w-full h-full object-cover" />
            </div>

            {/* Hardware error / fallback notice */}
            {streamError && feedMode === 'webcam' && (
              <div className="px-4 py-2.5 bg-amber-950/30 border-t border-amber-500/20 flex items-center justify-between text-xs text-amber-300">
                <span>{streamError}. Running interactive test stream instead.</span>
                <button
                  onClick={() => startWebcam()}
                  className="px-2.5 py-1 rounded bg-amber-900/40 hover:bg-amber-900/60 text-white font-medium"
                >
                  Retry Camera
                </button>
              </div>
            )}
          </div>

          {/* Verification Sensitivity Setting */}
          <div className="px-5 py-3.5 bg-[#0e131f] border border-slate-800/80 rounded-xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-slate-400">
              <Sliders className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-slate-300">Biometric Verification Threshold:</span>
              <span className="font-mono text-cyan-400 font-semibold">{(threshold * 100).toFixed(0)}%</span>
            </div>
            <div className="flex items-center space-x-3 flex-1 max-w-xs">
              <span className="text-[11px] text-slate-500">Permissive</span>
              <input
                type="range"
                min="0.60"
                max="0.88"
                step="0.01"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-500">Strict</span>
            </div>
          </div>
        </div>

        {/* Right Column: Active Identity Dossier (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real-time Verified Credential Card */}
          <div className="bg-[#0e131f] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-tight">Active Credential Dossier</h3>
                <p className="text-xs text-slate-400 mt-0.5">Identified in camera feed</p>
              </div>

              {bestMatch ? (
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center space-x-1.5 ${
                  bestMatch.status === 'AUTHORIZED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{bestMatch.status}</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Unregistered</span>
                </span>
              )}
            </div>

            {bestMatch ? (
              <div className="space-y-5">
                {/* Profile Header */}
                <div className="flex items-center space-x-4">
                  <img
                    src={bestMatch.image}
                    alt={bestMatch.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-950 border border-slate-700/80 shadow-md"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight">{bestMatch.name}</h4>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">{bestMatch.role}</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{bestMatch.id} · {bestMatch.badge_id}</p>
                  </div>
                </div>

                {/* Structured Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
                    <span className="text-slate-500 block text-[11px] mb-1">Clearance Tier</span>
                    <span className="font-semibold text-white font-mono">{bestMatch.clearance}</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
                    <span className="text-slate-500 block text-[11px] mb-1">Match Confidence</span>
                    <span className="font-semibold text-emerald-400 font-mono">{(bestScore * 100).toFixed(1)}%</span>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 col-span-2">
                    <span className="text-slate-500 block text-[11px] mb-1">Assigned Department</span>
                    <span className="font-medium text-slate-200">{bestMatch.department}</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/60">
                  <span>Access Permission:</span>
                  <span className="font-medium text-white">{bestMatch.access_level}</span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
                  <UserX className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">No Matching Enrollee Detected</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    The face currently in the viewport does not meet the {(threshold * 100).toFixed(0)}% verification threshold.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Enrollee Directory Preview */}
          <div className="bg-[#0e131f] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3.5">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Registered Enrollees</h4>
              <span className="text-xs text-slate-500">{personnel.length} on file</span>
            </div>

            <div className="space-y-2">
              {personnel.map(p => {
                const isCurrent = bestMatch?.id === p.id;
                return (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-slate-900 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover bg-slate-900" />
                      <div>
                        <p className="text-xs font-medium text-white leading-tight">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.role}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{p.clearance}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
