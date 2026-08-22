import React, { useState, useEffect } from 'react';
import {
  Moon,
  Sun,
  ShieldAlert,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Eye,
  VolumeX,
  Thermometer,
  CalendarCheck,
  ChevronRight,
  TrendingUp,
  Info,
  Play,
  RotateCcw,
  Coffee,
  BookOpen,
  Wind,
  Plus,
} from 'lucide-react';
import { UserProfile, SleepProfile, SleepLog } from '../types';
import { getTranslation, SupportedLanguage } from '../utils/translations';

interface SleepDashboardProps {
  profile: UserProfile;
  sleepLogs: SleepLog[];
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onSaveSleepLogs: (updatedLogs: SleepLog[]) => void;
  onAddXp: (xp: number) => void;
}

export const SleepDashboard: React.FC<SleepDashboardProps> = ({
  profile,
  sleepLogs,
  onSaveProfile,
  onSaveSleepLogs,
  onAddXp,
}) => {
  const lang = profile.language || 'en';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);

  // Sleep profile defaults
  const sleepProfile: SleepProfile = profile.sleepProfile || {
    currentBedtime: '00:30',
    targetBedtime: '22:30',
    wakeTime: '06:30',
    screenFreeMinutes: 45,
    gradualStepIndex: 1,
    windDownCompletedToday: false,
  };

  // Age-based recommendation calculation
  const getAgeSleepRecommendation = (age: number) => {
    if (age < 18) return { min: 8, max: 10, recommended: 9, label: '8 – 10' };
    if (age >= 65) return { min: 7, max: 8, recommended: 7.5, label: '7 – 8' };
    return { min: 7, max: 9, recommended: 8, label: '7 – 9' };
  };
  const sleepRec = getAgeSleepRecommendation(profile.age || 25);

  // Wind-down timer state
  const [isWindDownActive, setIsWindDownActive] = useState<boolean>(false);
  const [windDownSecondsLeft, setWindDownSecondsLeft] = useState<number>(30 * 60);
  const [eveningRoutines, setEveningRoutines] = useState({
    warmWash: false,
    herbalTea: false,
    reading: false,
    breathing: false,
  });

  // Log Sleep Form
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [logHours, setLogHours] = useState<number>(7.5);
  const [logQuality, setLogQuality] = useState<'excellent' | 'good' | 'fair' | 'restless'>('good');
  const [logNote, setLogNote] = useState<string>('');
  const [justLogged, setJustLogged] = useState<boolean>(false);

  // Gradual shift calculation
  const parseTimeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const minutesToTimeStr = (totalMinutes: number) => {
    let normalized = totalMinutes % 1440;
    if (normalized < 0) normalized += 1440;
    const h = Math.floor(normalized / 60);
    const m = normalized % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Generate gradual steps
  const currentMinutes = parseTimeToMinutes(sleepProfile.currentBedtime);
  const targetMinutes = parseTimeToMinutes(sleepProfile.targetBedtime);
  
  // Calculate difference moving earlier (e.g. 00:30 (30m) down to 22:30 (1350m))
  let diffMinutes = currentMinutes - targetMinutes;
  if (diffMinutes < 0) diffMinutes += 1440;
  
  const stepInterval = 15;
  const totalSteps = Math.max(1, Math.ceil(diffMinutes / stepInterval));
  const currentStep = Math.min(sleepProfile.gradualStepIndex, totalSteps);
  const currentShiftMinutes = currentMinutes - currentStep * stepInterval;
  const currentShiftTimeStr = minutesToTimeStr(currentShiftMinutes);

  // Wind-down timer tick
  useEffect(() => {
    let interval: any = null;
    if (isWindDownActive && windDownSecondsLeft > 0) {
      interval = setInterval(() => {
        setWindDownSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsWindDownActive(false);
            onAddXp(50);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWindDownActive, windDownSecondsLeft]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAdvanceStep = () => {
    const nextStep = Math.min(totalSteps, currentStep + 1);
    const updated: UserProfile = {
      ...profile,
      sleepProfile: {
        ...sleepProfile,
        gradualStepIndex: nextStep,
      },
    };
    onSaveProfile(updated);
    onAddXp(30);
  };

  const handleSaveSleepLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: SleepLog = {
      id: `sleep-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      hoursSlept: logHours,
      quality: logQuality,
      notes: logNote.trim() || undefined,
    };
    onSaveSleepLogs([newLog, ...sleepLogs]);
    onAddXp(40);
    setShowLogModal(false);
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 3500);
    setLogNote('');
  };

  const toggleRoutine = (key: keyof typeof eveningRoutines) => {
    const updated = { ...eveningRoutines, [key]: !eveningRoutines[key] };
    setEveningRoutines(updated);
    if (!eveningRoutines[key]) {
      onAddXp(15);
    }
  };

  const averageSleepHours = sleepLogs.length
    ? (sleepLogs.slice(0, 7).reduce((acc, l) => acc + l.hoursSlept, 0) / Math.min(sleepLogs.length, 7)).toFixed(1)
    : sleepRec.recommended.toString();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-950/70 border border-indigo-800/40 text-indigo-300 text-xs font-medium">
            <Moon className="w-3.5 h-3.5" />
            <span>{t('sleepTab')} • Circadian Rhythm</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-100">{t('sleepTitle')}</h1>
          <p className="text-sm text-stone-400 max-w-2xl">{t('sleepSubtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>{t('logSleepBtn')}</span>
          </button>
        </div>
      </div>

      {justLogged && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('sleepLoggedSuccess')}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recommended & Schedule Planner (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Age-Based Recommended Card */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {t('recommendedDuration')}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-mono">
                Age: {profile.age || 24}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-serif font-bold text-stone-100">
                {sleepRec.label}
              </span>
              <span className="text-sm text-stone-400">hours / night</span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              {t('ageBasedRecommendation', { age: profile.age || 24, hours: sleepRec.label })}
            </p>

            <div className="pt-3 border-t border-stone-800/80 grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-850">
                <span className="text-[10px] text-stone-400 uppercase">{t('currentBedtime')}</span>
                <p className="text-sm font-mono font-bold text-stone-200 mt-0.5">{sleepProfile.currentBedtime}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-850">
                <span className="text-[10px] text-stone-400 uppercase">{t('targetBedtime')}</span>
                <p className="text-sm font-mono font-bold text-indigo-300 mt-0.5">{sleepProfile.targetBedtime}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-850">
                <span className="text-[10px] text-stone-400 uppercase">{t('wakeTime')}</span>
                <p className="text-sm font-mono font-bold text-amber-300 mt-0.5">{sleepProfile.wakeTime}</p>
              </div>
            </div>
          </div>

          {/* Gradual Bedtime Adjustment System for Night Owls */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span>{t('gradualAdjustmentTitle')}</span>
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {t('gradualAdjustmentDesc')}
                </p>
              </div>
            </div>

            {/* Step Progress Bar */}
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-850 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">
                  {t('currentAdjustmentStep')}: <strong className="text-stone-100 font-mono text-sm">{currentShiftTimeStr}</strong>
                </span>
                <span className="text-stone-400 font-mono">
                  Step {currentStep} of {totalSteps}
                </span>
              </div>

              {/* Visual Step Dots / Bar */}
              <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-amber-300 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((currentStep / totalSteps) * 100))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                <span>Start: {sleepProfile.currentBedtime}</span>
                <span>Target: {sleepProfile.targetBedtime}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-stone-400">
                Ready for the next 15-min shift earlier?
              </p>
              <button
                onClick={handleAdvanceStep}
                disabled={currentStep >= totalSteps}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentStep >= totalSteps
                    ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                }`}
              >
                {currentStep >= totalSteps ? 'Goal Reached' : 'Advance 15 Min'}
              </button>
            </div>
          </div>

          {/* Screen-Free Wind-Down Interactive Zone */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t('screenFreeTitle')}</span>
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-md bg-stone-800 text-amber-300 font-mono">
                {sleepProfile.screenFreeMinutes} min target
              </span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed">
              {t('screenFreeDesc')}
            </p>

            {/* Timer visual box */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-850 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center font-mono text-lg font-bold text-amber-200">
                  {formatTimer(windDownSecondsLeft)}
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-200 block">
                    {isWindDownActive ? t('windDownActive') : 'Ready for Wind-Down'}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    Dim lights & put phone in sleep mode
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWindDownActive(!isWindDownActive)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isWindDownActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-stone-100 text-stone-950 hover:bg-stone-200'
                  }`}
                >
                  {isWindDownActive ? 'Pause Session' : t('startWindDown')}
                </button>
                {windDownSecondsLeft !== 30 * 60 && (
                  <button
                    onClick={() => {
                      setIsWindDownActive(false);
                      setWindDownSecondsLeft(30 * 60);
                    }}
                    className="p-2 rounded-xl bg-stone-850 text-stone-400 hover:text-stone-200 border border-stone-800 cursor-pointer"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Environment, Routines & Science (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Science of Melatonin & Circadian Biology */}
          <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
              <Info className="w-4 h-4" />
              <span>{t('melatoninScienceTitle')}</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t('melatoninScienceDesc')}
            </p>
          </div>

          {/* Restful Sleep Environment Checklist */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
            <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>{t('sleepEnvironmentTitle')}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-850 space-y-1">
                <div className="font-semibold text-stone-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  {t('envDarkness')}
                </div>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  {t('envDarknessTip')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-850 space-y-1">
                <div className="font-semibold text-stone-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
                  {t('envQuiet')}
                </div>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  {t('envQuietTip')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-850 space-y-1">
                <div className="font-semibold text-stone-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  {t('envCoolTemp')}
                </div>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  {t('envCoolTip')}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-850 space-y-1">
                <div className="font-semibold text-stone-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                  {t('envConsistent')}
                </div>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  {t('envConsistentTip')}
                </p>
              </div>
            </div>
          </div>

          {/* Gentle Evening Relaxation Checklist */}
          <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{t('relaxRoutineTitle')}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => toggleRoutine('warmWash')}
                className="w-full p-2.5 rounded-xl bg-stone-950/60 border border-stone-850 flex items-center justify-between text-left hover:border-stone-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-stone-200">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('routineWarmWash')}</span>
                </div>
                {eveningRoutines.warmWash ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-600" />
                )}
              </button>

              <button
                onClick={() => toggleRoutine('herbalTea')}
                className="w-full p-2.5 rounded-xl bg-stone-950/60 border border-stone-850 flex items-center justify-between text-left hover:border-stone-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-stone-200">
                  <Coffee className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t('routineHerbalTea')}</span>
                </div>
                {eveningRoutines.herbalTea ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-600" />
                )}
              </button>

              <button
                onClick={() => toggleRoutine('reading')}
                className="w-full p-2.5 rounded-xl bg-stone-950/60 border border-stone-850 flex items-center justify-between text-left hover:border-stone-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-stone-200">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t('routineReading')}</span>
                </div>
                {eveningRoutines.reading ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-600" />
                )}
              </button>

              <button
                onClick={() => toggleRoutine('breathing')}
                className="w-full p-2.5 rounded-xl bg-stone-950/60 border border-stone-850 flex items-center justify-between text-left hover:border-stone-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-stone-200">
                  <Wind className="w-3.5 h-3.5 text-sky-400" />
                  <span>{t('routineBreathing')}</span>
                </div>
                {eveningRoutines.breathing ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Log History Summary */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-400" />
            <span>Recent Sleep History</span>
          </h3>
          <span className="text-xs text-stone-400">
            7-Day Avg: <strong className="text-stone-200 font-mono">{averageSleepHours} hrs</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {sleepLogs.slice(0, 4).map((log) => (
            <div key={log.id} className="p-3 rounded-xl bg-stone-950/80 border border-stone-850 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>{log.date}</span>
                <span className={`capitalize font-semibold ${
                  log.quality === 'excellent' ? 'text-emerald-400' :
                  log.quality === 'good' ? 'text-indigo-300' :
                  log.quality === 'fair' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {log.quality}
                </span>
              </div>
              <div className="text-lg font-serif font-bold text-stone-100">
                {log.hoursSlept} <span className="text-xs font-normal text-stone-400">hrs</span>
              </div>
              {log.notes && (
                <p className="text-[11px] text-stone-400 truncate">{log.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Health Guidance & Medical Disclaimer */}
      <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-850 flex items-start gap-3 text-stone-400 text-xs">
        <ShieldAlert className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-stone-300 block">{t('medicalDisclaimerTitle')}</span>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            {t('medicalDisclaimerText')}
          </p>
        </div>
      </div>

      {/* Log Sleep Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>{t('sleepLogTitle')}</span>
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-stone-400 hover:text-stone-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSleepLog} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">{t('hoursSlept')}: {logHours}h</label>
                <input
                  type="range"
                  min="4"
                  max="12"
                  step="0.5"
                  value={logHours}
                  onChange={(e) => setLogHours(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>4 hrs</span>
                  <span>8 hrs</span>
                  <span>12 hrs</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">{t('sleepQuality')}</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['excellent', 'good', 'fair', 'restless'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setLogQuality(q)}
                      className={`py-2 rounded-xl capitalize font-semibold border transition-all cursor-pointer ${
                        logQuality === q
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                          : 'bg-stone-800 border-stone-700 text-stone-400'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Notes (Optional)</label>
                <input
                  type="text"
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  placeholder="e.g. Woke up refreshed, used sleep mask"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
