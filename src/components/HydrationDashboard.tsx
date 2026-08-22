import React, { useState } from 'react';
import {
  Droplets,
  Plus,
  Minus,
  Clock,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Info,
  Calendar,
  Bell,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, HydrationEntry, DayHydrationRecord, calculateEstimatedDailyHydration } from '../types';
import { getTranslation } from '../utils/translations';

interface HydrationDashboardProps {
  profile: UserProfile;
  waterMlToday: number;
  hydrationLogs: HydrationEntry[];
  weekHistory: DayHydrationRecord[];
  onLogWater: (amountMl: number, type: HydrationEntry['type']) => void;
  onUndoWater: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  onAddXp: (xp: number) => void;
}

export const HydrationDashboard: React.FC<HydrationDashboardProps> = ({
  profile,
  waterMlToday,
  hydrationLogs,
  weekHistory,
  onLogWater,
  onUndoWater,
  onSaveProfile,
  onAddXp,
}) => {
  const lang = profile.language || 'en';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);

  const [customMl, setCustomMl] = useState<number>(250);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [reminderActive, setReminderActive] = useState<boolean>(true);

  // Personalized target based on Age, Sex, Height
  const hydrationCalculation = calculateEstimatedDailyHydration(
    profile.age || 25,
    profile.gender || 'female',
    profile.height || 170,
    profile.weight
  );

  const targetMl = profile.customWaterGoalMl || hydrationCalculation.recommendedMl;
  const progressPercent = Math.min(100, Math.round((waterMlToday / targetMl) * 100));
  const glassesConsumed = (waterMlToday / 250).toFixed(1);
  const targetGlasses = Math.round(targetMl / 250);

  const quickButtons = [
    { label: '+150 ml', sub: 'Cup', amount: 150, type: 'cup' as const },
    { label: '+250 ml', sub: 'Glass', amount: 250, type: 'glass' as const },
    { label: '+500 ml', sub: 'Bottle', amount: 500, type: 'bottle' as const },
    { label: '+750 ml', sub: 'Flask', amount: 750, type: 'flask' as const },
  ];

  const handleQuickAdd = (amount: number, type: HydrationEntry['type']) => {
    onLogWater(amount, type);
    onAddXp(10);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customMl > 0) {
      onLogWater(customMl, 'custom');
      onAddXp(10);
      setShowCustomInput(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner - 100% Free Feature */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/40 text-cyan-300 text-xs font-medium">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hydration Sanctuary • Free Lifetime Feature</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
            Daily Hydration Balance
          </h1>
          <p className="text-sm text-stone-400 max-w-2xl">
            Personalized fluid target estimated from your biometrics. Drink steadily through the daylight hours.
          </p>
        </div>

        {/* Status Chip */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-stone-950/80 border border-stone-800 px-4 py-3 rounded-xl">
          <Droplets className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="text-xs text-stone-400 font-medium">Estimated Daily Target</div>
            <div className="text-lg font-mono font-bold text-cyan-300">
              {targetMl} ml <span className="text-xs text-stone-400 font-normal">({targetGlasses} glasses)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hydration Progress Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Progress Visualizer & Quick Log (7 cols) */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-semibold text-lg text-stone-100">Today's Fluid Intake</h2>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-900/50 px-2.5 py-1 rounded-lg">
              {progressPercent}% of Daily Target
            </div>
          </div>

          {/* Clean Progress Meter */}
          <div className="relative p-6 rounded-xl bg-stone-950 border border-stone-800/80 overflow-hidden flex flex-col items-center justify-center text-center">
            {/* Ambient Water Hue */}
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/30 via-transparent to-transparent pointer-events-none" />
            
            <div className="text-4xl sm:text-5xl font-mono font-bold text-stone-100 mb-1">
              {waterMlToday}{' '}
              <span className="text-xl sm:text-2xl text-stone-400 font-light">/ {targetMl} ml</span>
            </div>
            <p className="text-xs text-stone-400 font-medium mb-4">
              ~{glassesConsumed} of {targetGlasses} standard 250ml glasses consumed today
            </p>

            {/* Linear Segmented Bar */}
            <div className="w-full max-w-md h-3.5 bg-stone-800/80 rounded-full overflow-hidden p-0.5 border border-stone-700/60">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-teal-300 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Log Buttons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span>Quick Log Amounts</span>
              {waterMlToday > 0 && (
                <button
                  onClick={onUndoWater}
                  className="text-stone-400 hover:text-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Minus className="w-3 h-3" /> Undo last entry
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickButtons.map((btn) => (
                <button
                  key={btn.amount}
                  onClick={() => handleQuickAdd(btn.amount, btn.type)}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-cyan-500/50 hover:bg-stone-850 active:scale-95 transition-all text-center cursor-pointer group"
                >
                  <Droplets className="w-4 h-4 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-stone-100 font-mono">{btn.label}</span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider">{btn.sub}</span>
                </button>
              ))}
            </div>

            {/* Custom Amount Form Toggle */}
            {!showCustomInput ? (
              <button
                onClick={() => setShowCustomInput(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-stone-700 hover:border-stone-500 text-stone-300 text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Log Custom Fluid Amount
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="flex gap-2 p-3 bg-stone-950 rounded-xl border border-stone-800">
                <input
                  type="number"
                  min="50"
                  max="2000"
                  step="50"
                  value={customMl}
                  onChange={(e) => setCustomMl(Number(e.target.value))}
                  placeholder="e.g. 350 ml"
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="px-3 py-1.5 bg-stone-800 text-stone-300 rounded-lg text-xs hover:bg-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right: Personalized Formula & Reminders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Personalized Biometric Target Calculation Card */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3.5">
            <div className="flex items-center gap-2 text-stone-100 font-semibold text-sm">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Personalized Estimation Formula</span>
            </div>
            
            <p className="text-xs text-stone-300 leading-relaxed">
              Your hydration goal is calculated based on your biometrics:
            </p>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Age:</span>
                <span className="text-stone-200 font-medium">{profile.age || 25} years</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Sex:</span>
                <span className="text-stone-200 font-medium capitalize">{profile.gender || 'female'}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Height:</span>
                <span className="text-stone-200 font-medium">{profile.height || 170} cm</span>
              </div>
              <div className="pt-2 border-t border-stone-800 flex justify-between font-mono font-semibold text-cyan-300">
                <span>Target Intake:</span>
                <span>{targetMl} ml / day</span>
              </div>
            </div>

            {/* Non-Medical Disclaimer Box */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-200/90 leading-relaxed">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Non-Medical Estimation:</strong> This calculation is an educational estimate for daily general wellness. Adjust for high heat, intense exercise, illness, or medical advice from your physician.
              </span>
            </div>
          </div>

          {/* Basic Reminders Schedule */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-100 font-semibold text-sm">
                <Bell className="w-4 h-4 text-cyan-400" />
                <span>Hydration Reminders</span>
              </div>
              <button
                onClick={() => setReminderActive(!reminderActive)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium cursor-pointer transition-colors ${
                  reminderActive
                    ? 'bg-cyan-950 border-cyan-700/50 text-cyan-300'
                    : 'bg-stone-800 border-stone-700 text-stone-400'
                }`}
              >
                {reminderActive ? 'Active' : 'Muted'}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" /> 08:00 AM • Morning Kickstart
                </span>
                <span className="text-cyan-400 font-mono">500 ml</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" /> 12:30 PM • Mid-Day Refresh
                </span>
                <span className="text-cyan-400 font-mono">500 ml</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" /> 04:30 PM • Afternoon Vitality
                </span>
                <span className="text-cyan-400 font-mono">500 ml</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-300">
                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" /> 07:30 PM • Evening Gentle Sip
                </span>
                <span className="text-cyan-400 font-mono">250 ml</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily & Weekly History Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Log Timeline */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-semibold text-stone-100 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Today's Log History
            </h3>
            <span className="text-xs text-stone-400">{hydrationLogs.length} entries</span>
          </div>

          {hydrationLogs.length === 0 ? (
            <div className="text-center py-6 text-xs text-stone-400 bg-stone-950 rounded-xl border border-stone-800/60">
              No entries logged today yet. Tap a quick log button above to start.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {hydrationLogs.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950 border border-stone-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-stone-300 font-medium capitalize">{item.type}</span>
                    <span className="text-stone-400 text-[11px]">({item.timestamp})</span>
                  </div>
                  <span className="font-mono font-bold text-cyan-300">+{item.amountMl} ml</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 7-Day Weekly Consistency History */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-semibold text-stone-100 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> 7-Day Consistency
            </h3>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" /> Steady Routine
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {weekHistory.map((day, idx) => {
              const heightPct = Math.min(100, Math.max(15, day.percentage));
              const isMet = day.percentage >= 90;
              return (
                <div key={day.date || idx} className="flex flex-col items-center gap-2">
                  <div className="text-[10px] font-mono text-stone-400">
                    {Math.round(day.totalMl / 1000 * 10) / 10}L
                  </div>
                  <div className="w-full h-24 bg-stone-950 rounded-lg p-1 border border-stone-800 flex flex-col justify-end">
                    <div
                      className={`w-full rounded transition-all duration-300 ${
                        isMet ? 'bg-cyan-400' : 'bg-cyan-600/60'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx % 7]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
