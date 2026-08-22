import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Dumbbell,
  Apple,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Split,
  Eye,
  Sliders,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GlowAudit, UserProfile } from '../types';

interface BeforeAfterStudioProps {
  profile: UserProfile;
  beforeImage: string | null;
  afterImage: string | null;
  onSaveBeforeImage: (dataUrl: string) => void;
  onSaveAfterImage: (dataUrl: string) => void;
  audits: GlowAudit[];
  onSaveAudit: (audit: GlowAudit) => void;
  onApplyPostGlowProtocol: (protocol: GlowAudit['postGlowProtocol']) => void;
}

export const BeforeAfterStudio: React.FC<BeforeAfterStudioProps> = ({
  profile,
  beforeImage,
  afterImage,
  onSaveBeforeImage,
  onSaveAfterImage,
  audits,
  onSaveAudit,
  onApplyPostGlowProtocol,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isComparingSplit, setIsComparingSplit] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'compare' | 'audit' | 'protocol'>('compare');

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<'before' | 'after'>('before');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileTargetRef = useRef<'before' | 'after'>('before');

  const currentAudit = audits[0] || null;

  // Camera Start
  const startCamera = async (target: 'before' | 'after') => {
    setCameraTarget(target);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      alert('Camera access denied or unavailable. You can use the upload photo option instead.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        if (cameraTarget === 'before') {
          onSaveBeforeImage(dataUrl);
        } else {
          onSaveAfterImage(dataUrl);
        }
      }
      // Stop tracks
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (fileTargetRef.current === 'before') {
          onSaveBeforeImage(result);
        } else {
          onSaveAfterImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = (target: 'before' | 'after') => {
    fileTargetRef.current = target;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Run AI Glow Audit via backend API
  const runAiGlowAudit = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await fetch('/api/analyze-glow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: beforeImage || undefined,
          mimeType: 'image/jpeg',
          profile: {
            gender: profile.gender,
            age: profile.age,
            height: profile.height,
            weight: profile.weight,
            primaryGoals: profile.primaryGoals,
            concerns: profile.concerns,
          },
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to complete glow analysis');
      }

      const newAudit: GlowAudit = {
        id: `audit-${Date.now()}`,
        auditDate: new Date().toISOString().split('T')[0],
        beforeImage: beforeImage || undefined,
        afterImage: afterImage || undefined,
        glowScore: data.data.glowScore || 78,
        potentialScore: data.data.potentialScore || 96,
        faceAnalysis: data.data.faceAnalysis,
        bodyAnalysis: data.data.bodyAnalysis,
        keyStrengths: data.data.keyStrengths || [],
        focusAreas: data.data.focusAreas || [],
        postGlowProtocol: data.data.postGlowProtocol,
      };

      onSaveAudit(newAudit);
      setActiveTab('audit');
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Audit error:', err);
      setAnalysisError(err.message || 'Audit encountered an error. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Camera Modal Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl p-4 flex flex-col items-center space-y-4">
            <div className="w-full flex justify-between items-center text-stone-200">
              <span className="text-sm font-bold flex items-center gap-1.5 text-amber-300">
                <Camera className="w-4 h-4" />
                Capture {cameraTarget === 'before' ? 'Before Photo' : 'After Photo'}
              </span>
              <button
                onClick={stopCamera}
                className="text-stone-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700"
              >
                Cancel
              </button>
            </div>

            <div className="relative w-full aspect-square bg-stone-950 rounded-xl overflow-hidden border border-stone-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover mirror"
              />
              {/* Overlay alignment guides */}
              <div className="absolute inset-0 border-2 border-dashed border-amber-400/30 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-44 h-56 rounded-full border border-amber-400/40" />
              </div>
            </div>

            <p className="text-xs text-stone-400 text-center">
              Align your face and collarbone within the guide for optimal jawline & posture assessment.
            </p>

            <button
              onClick={capturePhoto}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              Take Snapshot
            </button>
          </div>
        </div>
      )}

      {/* Header Studio Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Aesthetic Audit & Comparison
              </span>
              <span className="text-xs text-stone-400">
                AI Face Harmony • Posture Alignment • Transformation Studio
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Before & After Appearance Studio
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl">
              Take a baseline before photo to assess your facial symmetry, jawline contour, skin clarity, and cervical posture. Generate an actionable post-glow roadmap tailored to your body.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="run-ai-glow-audit-btn"
              onClick={runAiGlowAudit}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 active:scale-95 text-stone-950 font-bold text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Glow Aesthetics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Glow Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mode switcher tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-stone-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'compare'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Split className="w-4 h-4" />
            <span>Side-by-Side & Split Slider</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>AI Appearance Audit & Scores</span>
          </button>
          <button
            onClick={() => setActiveTab('protocol')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'protocol'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Post-Glow Protocol Blueprint</span>
          </button>
        </div>
      </div>

      {analysisError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Tab 1: Compare View (Split slider / Dual Photos) */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          {/* Photo Management Cards: Before & After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before Photo Card */}
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-stone-800 text-stone-300 border border-stone-700">
                    Day 1 Baseline
                  </span>
                  <h3 className="text-base font-bold text-stone-100">BEFORE Photo</h3>
                </div>
                {beforeImage && (
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Ready
                  </span>
                )}
              </div>

              {/* Photo Display / Upload Zone */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center group">
                {beforeImage ? (
                  <img
                    src={beforeImage}
                    alt="Before Baseline"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-amber-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-stone-300">
                      No Before Photo Yet
                    </p>
                    <p className="text-[11px] text-stone-400 max-w-xs">
                      Take or upload a clear, front-facing photo in natural lighting.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="take-before-camera-btn"
                  onClick={() => startCamera('before')}
                  className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 text-xs font-semibold border border-stone-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Use Camera</span>
                </button>
                <button
                  id="upload-before-file-btn"
                  onClick={() => triggerFileUpload('before')}
                  className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 text-xs font-semibold border border-stone-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-400" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* After Photo Card */}
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Day 30 Progress
                  </span>
                  <h3 className="text-base font-bold text-stone-100">AFTER / Transformation</h3>
                </div>
                {afterImage && (
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Glow Captured
                  </span>
                )}
              </div>

              {/* Photo Display / Upload Zone */}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-stone-950 border border-stone-800 flex items-center justify-center group">
                {afterImage ? (
                  <img
                    src={afterImage}
                    alt="After Transformation"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-rose-400">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-stone-300">
                      Upload Your Post-Glow Photo
                    </p>
                    <p className="text-[11px] text-stone-400 max-w-xs">
                      Update weekly or at the end of your 30-day program to compare improvements.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  id="take-after-camera-btn"
                  onClick={() => startCamera('after')}
                  className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 text-xs font-semibold border border-stone-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Use Camera</span>
                </button>
                <button
                  id="upload-after-file-btn"
                  onClick={() => triggerFileUpload('after')}
                  className="flex-1 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 text-xs font-semibold border border-stone-700 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-400" />
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Split Comparison Slider (When both or either exists) */}
          {(beforeImage || afterImage) && (
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Interactive Before & After Comparison Slider</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Drag the slider left and right to inspect jawline contour, neck alignment, and skin radiance.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsComparingSplit(!isComparingSplit)}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-semibold text-stone-300 border border-stone-700"
                  >
                    {isComparingSplit ? 'Side-by-Side View' : 'Split Slider View'}
                  </button>
                </div>
              </div>

              {isComparingSplit ? (
                /* Interactive Split Slider */
                <div className="relative w-full max-w-2xl mx-auto aspect-square rounded-2xl overflow-hidden border-2 border-stone-800 select-none shadow-2xl bg-stone-950">
                  {/* Before (Left/Underneath) */}
                  <img
                    src={beforeImage || afterImage || ''}
                    alt="Before Baseline"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold text-stone-200 border border-stone-700">
                    BEFORE Baseline
                  </div>

                  {/* After (Right/Overlay with Clip Path) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
                  >
                    <img
                      src={afterImage || beforeImage || ''}
                      alt="After Glow"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-amber-500/80 backdrop-blur-md text-[11px] font-bold text-stone-950 border border-amber-300">
                      AFTER Post-Glow
                    </div>
                  </div>

                  {/* Slider Divider Bar */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-lg cursor-ew-resize z-30"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shadow-xl font-bold text-xs border-2 border-white">
                      ↔
                    </div>
                  </div>

                  {/* Range input for scrubbing */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPosition}
                    onChange={(e) => setSliderPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
                    aria-label="Comparison slider"
                  />
                </div>
              ) : (
                /* Side-by-Side Dual View */
                <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      Before (Baseline)
                    </span>
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-950 border border-stone-800">
                      <img
                        src={beforeImage || afterImage || ''}
                        alt="Before"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      After (Post-Glow)
                    </span>
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-950 border border-amber-500/30">
                      <img
                        src={afterImage || beforeImage || ''}
                        alt="After"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: AI Appearance Audit & Scores */}
      {activeTab === 'audit' && currentAudit && (
        <div className="space-y-6">
          {/* Score Hero Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Glow Score */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Current Glow Index
                </span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="py-4 text-center">
                <span className="text-5xl font-serif font-extrabold text-stone-100">
                  {currentAudit.glowScore}
                </span>
                <span className="text-sm font-semibold text-stone-400"> / 100</span>
                <p className="text-xs text-amber-300/80 mt-1 font-medium">
                  Strong Aesthetic Baseline
                </p>
              </div>
              <div className="text-[11px] text-stone-400 text-center border-t border-stone-800/80 pt-2">
                Evaluated across facial balance, skin health, & cervical posture
              </div>
            </div>

            {/* Potential Score */}
            <div className="rounded-2xl bg-gradient-to-br from-rose-950/40 via-stone-900 to-stone-900 border border-rose-500/30 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  30-Day Potential
                </span>
                <Zap className="w-4 h-4 text-rose-400" />
              </div>
              <div className="py-4 text-center">
                <span className="text-5xl font-serif font-extrabold text-rose-200">
                  {currentAudit.potentialScore}
                </span>
                <span className="text-sm font-semibold text-stone-400"> / 100</span>
                <p className="text-xs text-rose-300/80 mt-1 font-medium">
                  +18pt Transformation Target
                </p>
              </div>
              <div className="text-[11px] text-stone-400 text-center border-t border-stone-800/80 pt-2">
                Achievable via posture resets, jawline drainage & nutrition
              </div>
            </div>

            {/* Profile Fit */}
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Assessment Profile
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="space-y-1.5 py-2">
                <div className="text-sm font-semibold text-stone-200">
                  {profile?.age || 26} Years • {(profile?.gender || 'all').toUpperCase()}
                </div>
                <div className="text-xs text-stone-400">
                  Weight: {profile?.weight || 70} kg • Height: {profile?.height || 175} cm
                </div>
                <div className="text-xs text-amber-300/90 font-medium">
                  Goals: {(profile?.primaryGoals || []).slice(0, 2).join(', ') || 'Glow & Vitality'}
                </div>
              </div>
              <div className="text-[11px] text-stone-400 border-t border-stone-800/80 pt-2">
                Audit Date: {currentAudit?.auditDate || 'Today'}
              </div>
            </div>
          </div>

          {/* Strengths & Improvement Focus Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-serif font-bold text-base border-b border-stone-800 pb-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Identified Natural Strengths</span>
              </div>
              <ul className="space-y-2.5">
                {(currentAudit?.keyStrengths || []).map((strength, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-stone-200 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Focus Improvement Areas Card */}
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-base border-b border-stone-800 pb-3">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>High-Impact Improvement Areas</span>
              </div>
              <ul className="space-y-2.5">
                {(currentAudit?.focusAreas || []).map((area, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-stone-200 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Deep Breakdown: Face Harmony & Body Posture */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Face Analysis Card */}
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-base border-b border-stone-800 pb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Facial Harmony & Skin Analysis</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-stone-300">Jawline Definition:</span>
                  <p className="text-stone-400 mt-0.5">{currentAudit?.faceAnalysis?.jawlineDefinition || 'Good potential for sharpening'}</p>
                </div>
                <div>
                  <span className="font-bold text-stone-300">Skin Clarity & Tone:</span>
                  <p className="text-stone-400 mt-0.5">{currentAudit?.faceAnalysis?.skinClarity || 'Healthy baseline radiance'}</p>
                </div>
                <div>
                  <span className="font-bold text-stone-300">Eye Freshness & Periorbital:</span>
                  <p className="text-stone-400 mt-0.5">{currentAudit?.faceAnalysis?.eyeVitality || 'Clear and alert'}</p>
                </div>
                <div>
                  <span className="font-bold text-stone-300">Facial Symmetry & Bone Structure:</span>
                  <p className="text-stone-400 mt-0.5">{currentAudit?.faceAnalysis?.facialSymmetry || 'Balanced facial proportions'}</p>
                </div>

                <div className="pt-2 border-t border-stone-800 space-y-1.5">
                  <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                    Recommended Face Sculpting Tips:
                  </span>
                  {(currentAudit?.faceAnalysis?.keyFaceTips || []).map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-stone-300">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Body & Posture Analysis Card */}
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-300 font-serif font-bold text-base border-b border-stone-800 pb-3">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                <span>Body Silhouette & Posture Analysis</span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-stone-300">Spinal Alignment:</span>
                  <p className="text-stone-400 mt-0.5">{currentAudit?.bodyAnalysis?.postureAlignment || 'Mild thoracic flexion'}</p>
                </div>
                <div>
                  <span className="font-bold text-stone-300">Composition & Proportions:</span>
                  <p className="text-stone-400 mt-0.5">{currentAudit?.bodyAnalysis?.compositionEstimate || 'Athletic potential'}</p>
                </div>
                <div>
                  <span className="font-bold text-stone-300">Neck & Shoulder Tension:</span>
                  <p className="text-stone-400 mt-0.5">{currentAudit?.bodyAnalysis?.neckShoulderTension || 'Elevated upper trapezius'}</p>
                </div>

                <div className="pt-2 border-t border-stone-800 space-y-1.5">
                  <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider">
                    Recommended Postural & Kinetic Exercises:
                  </span>
                  {(currentAudit?.bodyAnalysis?.keyBodyTips || []).map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-stone-300">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Post-Glow Protocol Blueprint */}
      {activeTab === 'protocol' && currentAudit && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-100">
                  Custom Post-Glow Program Blueprint
                </h3>
                <p className="text-xs text-stone-400">
                  Separate holistic schedules for food, achievements, exercise, and mental wellness.
                </p>
              </div>
              <button
                id="apply-protocol-btn"
                onClick={() => onApplyPostGlowProtocol(currentAudit.postGlowProtocol)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-400/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>Synchronize to Daily Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Food & Caloric Schedule */}
              <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <Apple className="w-4 h-4" />
                  <span>Food & Calorie Nutrition Protocol</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {currentAudit.postGlowProtocol.nutritionSummary}
                </p>
              </div>

              {/* 2. Exercise & Posture Schedule */}
              <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Dumbbell className="w-4 h-4" />
                  <span>Exercise & Silhouette Program</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {currentAudit.postGlowProtocol.workoutSummary}
                </p>
              </div>

              {/* 3. Facial Care & Ice Protocol */}
              <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Facial Aesthetics & Skincare Schedule</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {currentAudit.postGlowProtocol.faceCareSummary}
                </p>
              </div>

              {/* 4. Mental Health & Achievement Schedule */}
              <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <BookOpen className="w-4 h-4" />
                  <span>10-Min Mental Health & Achievement Journal</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {currentAudit.postGlowProtocol.mindSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
