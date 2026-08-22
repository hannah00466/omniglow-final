import React from 'react';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Droplets,
  Dumbbell,
  BookOpen,
  Apple,
  Award,
  ChevronRight,
  Flame,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DayPlan, MasterGlowPlan, UserProfile, ScheduleEvent } from '../types';

interface ScheduleDashboardProps {
  dayPlan: DayPlan;
  masterPlan: MasterGlowPlan;
  profile: UserProfile;
  waterIntakeMl: number;
  onAddWater: (amountMl: number) => void;
  onToggleScheduleEvent: (eventIndex: number) => void;
  onStartWorkout: (workout: DayPlan['workout']) => void;
  onOpenReading: () => void;
  onOpenAchievements: () => void;
  onOpenFridgeChef: () => void;
  onOpenBeforeAfter: () => void;
  caloriesConsumedToday: number;
}

export const ScheduleDashboard: React.FC<ScheduleDashboardProps> = ({
  dayPlan,
  masterPlan,
  profile,
  waterIntakeMl,
  onAddWater,
  onToggleScheduleEvent,
  onStartWorkout,
  onOpenReading,
  onOpenAchievements,
  onOpenFridgeChef,
  onOpenBeforeAfter,
  caloriesConsumedToday,
}) => {
  const dailySchedule = dayPlan?.dailySchedule || [];
  const completedCount = dailySchedule.filter((e) => e.completed).length;
  const totalCount = dailySchedule.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const targetWaterMl = Math.round((masterPlan?.waterLiters || 2.5) * 1000);
  const waterPercent = Math.min(100, Math.round((waterIntakeMl / targetWaterMl) * 100));

  const calorieTarget = masterPlan?.targetCalories || 1850;
  const caloriePercent = Math.min(100, Math.round((caloriesConsumedToday / calorieTarget) * 100));

  const getCategoryIcon = (category: ScheduleEvent['category']) => {
    switch (category) {
      case 'body':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'face':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'nutrition':
        return <Apple className="w-4 h-4 text-rose-400" />;
      case 'mind':
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
    }
  };

  const getCategoryBg = (category: ScheduleEvent['category']) => {
    switch (category) {
      case 'body':
        return 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300';
      case 'face':
        return 'bg-amber-950/40 border-amber-800/40 text-amber-300';
      case 'nutrition':
        return 'bg-rose-950/40 border-rose-800/40 text-rose-300';
      case 'mind':
        return 'bg-indigo-950/40 border-indigo-800/40 text-indigo-300';
    }
  };

  const handleCelebrateCompletion = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#f43f5e', '#38bdf8', '#34d399'],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Day Focus Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-5 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400 text-stone-950 shadow-sm">
                Day {dayPlan?.dayNumber || 1} • {dayPlan?.dayName || 'Day 1'}
              </span>
              <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Custom Schedule for {profile?.age || 26}y {profile?.gender || 'All'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 tracking-tight">
              {dayPlan?.focus || 'Holistic Glow Protocol'}
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl">
              Targeted body biomechanics, morning facial sculpting, calorie-optimized nourishment, and 10 minutes of mental mastery.
            </p>
          </div>

          {/* Quick Action Highlights */}
          <div className="flex flex-wrap items-center gap-3">
            {dayPlan?.workout && (
              <button
                id="start-today-workout-btn"
                onClick={() => onStartWorkout(dayPlan.workout)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Start {dayPlan.workout?.durationMinutes || 45}m Workout</span>
              </button>
            )}
            <button
              id="open-10m-reading-hero-btn"
              onClick={onOpenReading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-200 border border-stone-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>10-Min Reading</span>
            </button>
          </div>
        </div>

        {/* Daily Progress Gauge */}
        <div className="mt-6 pt-5 border-t border-stone-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-stone-300">Daily Glow Completion</span>
              <span className="text-amber-400">
                {completedCount} of {totalCount} Completed ({progressPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          {progressPercent === 100 && (
            <button
              onClick={handleCelebrateCompletion}
              className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 animate-bounce"
            >
              <Sparkles className="w-4 h-4" /> All Habits Completed!
            </button>
          )}
        </div>
      </div>

      {/* 3 Metric Mini Dashboards: Water, Calories, Appearance Check */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Hydration & Glow Water */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-200">Glow Hydration</h3>
                <p className="text-xs text-stone-400">Dermal plumpness & flush</p>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-400 px-2 py-1 rounded-md bg-sky-950/60 border border-sky-800/50">
              {waterPercent}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-stone-300 font-medium">
              <span>{waterIntakeMl} ml</span>
              <span className="text-stone-400">Goal: {targetWaterMl} ml</span>
            </div>
            <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-300 transition-all duration-300 rounded-full"
                style={{ width: `${waterPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              id="add-water-250-btn"
              onClick={() => onAddWater(250)}
              className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-sky-950/70 hover:text-sky-300 border border-stone-700 hover:border-sky-500/40 text-stone-300 transition-all active:scale-95"
            >
              +250 ml Glass
            </button>
            <button
              id="add-water-500-btn"
              onClick={() => onAddWater(500)}
              className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-sky-950/70 hover:text-sky-300 border border-stone-700 hover:border-sky-500/40 text-stone-300 transition-all active:scale-95"
            >
              +500 ml Bottle
            </button>
          </div>
        </div>

        {/* 2. Calorie & Fridge Chef Quick Card */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-200">Daily Calorie Target</h3>
                <p className="text-xs text-stone-400">
                  {profile.dietaryPreference || 'Clean Anti-inflammatory'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-400 px-2 py-1 rounded-md bg-rose-950/60 border border-rose-800/50">
              {caloriesConsumedToday} / {calorieTarget} kcal
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-stone-300 font-medium">
              <span>{caloriePercent}% Target Fuel</span>
              <span className="text-stone-400">
                Protein: ~{masterPlan.proteinGrams}g
              </span>
            </div>
            <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300 rounded-full"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
          </div>

          <button
            id="quick-fridge-chef-btn"
            onClick={onOpenFridgeChef}
            className="w-full py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-rose-950/70 hover:text-rose-300 border border-stone-700 hover:border-rose-500/40 text-stone-200 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Apple className="w-3.5 h-3.5 text-rose-400" />
            <span>Open Fridge Chef & Log Meals</span>
          </button>
        </div>

        {/* 3. Before & After Appearance Quick Card */}
        <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-200">Appearance Audit</h3>
                <p className="text-xs text-stone-400">Face & Posture comparison</p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-300 px-2 py-1 rounded-md bg-amber-950/60 border border-amber-800/50">
              Active Protocol
            </span>
          </div>

          <p className="text-xs text-stone-300 line-clamp-2">
            Track structural facial changes, jawline sharpening, skin glow, and cervical posture over 30 days.
          </p>

          <button
            id="quick-before-after-btn"
            onClick={onOpenBeforeAfter}
            className="w-full py-1.5 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-amber-950/70 hover:text-amber-300 border border-stone-700 hover:border-amber-500/40 text-stone-200 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>Before & After Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Grid: Detailed Time-Blocked Schedule (Left) + Face Routine & Reading Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3 width): Time-Blocked Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Today&apos;s Time-Blocked Schedule</span>
            </h2>
            <span className="text-xs text-stone-400">
              Click circle to mark completed
            </span>
          </div>

          <div className="space-y-3">
            {(dayPlan?.dailySchedule || []).map((event, idx) => {
              const isCompleted = !!event.completed;
              return (
                <div
                  key={`${event.time}-${event.title}-${idx}`}
                  id={`schedule-item-${idx}`}
                  onClick={() => onToggleScheduleEvent(idx)}
                  className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    isCompleted
                      ? 'bg-stone-900/40 border-stone-800/60 opacity-75'
                      : 'bg-stone-900/90 border-stone-800 hover:border-stone-700 hover:shadow-md'
                  }`}
                >
                  {/* Completion Toggle */}
                  <div className="pt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                    )}
                  </div>

                  {/* Time badge */}
                  <div className="min-w-[70px]">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {event.time}
                    </span>
                    <div className="text-[10px] text-stone-400">
                      {event.duration} mins
                    </div>
                  </div>

                  {/* Category Pill & Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getCategoryBg(
                          event.category
                        )}`}
                      >
                        {getCategoryIcon(event.category)}
                        {event.category}
                      </span>
                      <h4
                        className={`text-sm font-semibold transition-colors ${
                          isCompleted ? 'line-through text-stone-400' : 'text-stone-100'
                        }`}
                      >
                        {event.title}
                      </h4>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1/3 width): Face Routine, 10-Min Reading & Achievements Card */}
        <div className="space-y-5">
          {/* Face Aesthetics & Skincare Focus Card */}
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-base border-b border-stone-800 pb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Facial Aesthetics & Skincare</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                  Morning Sculpt & Ice
                </span>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {dayPlan?.faceRoutine?.morning || 'Ice water splash, jade roller or gua sha upward sculpting strokes with hyaluronic serum.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  Evening Release & Repair
                </span>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {dayPlan?.faceRoutine?.evening || 'Double cleanse, retinol or barrier cream application, and masseter muscle release.'}
                </p>
              </div>
            </div>
          </div>

          {/* 10-Minute Daily Reading Highlight */}
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-indigo-300 font-serif font-bold text-base">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>10-Min Reading Sanctuary</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/40">
                10 mins
              </span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-stone-100">
                {dayPlan?.readingSnippet?.title || 'Cortisol, Posture & Presence'}
              </h4>
              <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed">
                {dayPlan?.readingSnippet?.summary || 'How parasympathetic activation smoothens facial tension and elevates physical poise.'}
              </p>
            </div>

            <button
              id="read-10m-sanctuary-btn"
              onClick={onOpenReading}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              Start 10-Minute Chapter
            </button>
          </div>

          {/* Book of Achievements Callout */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-base">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Book of Achievements</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Cement your transformation by recording your daily physical, aesthetic, and mental wins.
            </p>
            <button
              id="log-win-quick-btn"
              onClick={onOpenAchievements}
              className="w-full py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Log Today&apos;s Victory (+50 XP)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
