import React, { useState } from 'react';
import {
  Activity,
  Play,
  CheckCircle2,
  Clock,
  Flame,
  Dumbbell,
  Shield,
  Sparkles,
  ChevronRight,
  Info,
  Layers,
  Heart,
} from 'lucide-react';
import { UserProfile, MasterGlowPlan, WorkoutRoutine, DayPlan } from '../types';
import { getTranslation } from '../utils/translations';

interface BodyDashboardProps {
  profile: UserProfile;
  masterPlan: MasterGlowPlan;
  onStartWorkout: (workout: WorkoutRoutine) => void;
  selectedDayIndex: number;
  setSelectedDayIndex: (index: number) => void;
}

export const BodyDashboard: React.FC<BodyDashboardProps> = ({
  profile,
  masterPlan,
  onStartWorkout,
  selectedDayIndex,
  setSelectedDayIndex,
}) => {
  const lang = profile.language || 'en';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);

  const safeWeeklyPlan = masterPlan.weeklyPlan || [];
  const currentDay: DayPlan | undefined = safeWeeklyPlan[selectedDayIndex] || safeWeeklyPlan[0];
  const workout = currentDay?.workout;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-950/70 border border-amber-800/40 text-amber-300 text-xs font-medium">
            <Activity className="w-3.5 h-3.5" />
            <span>{t('bodyTab')} • Movement & Posture</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-100">{t('bodyTitle')}</h1>
          <p className="text-sm text-stone-400 max-w-2xl">{t('bodySubtitle')}</p>
        </div>

        {workout && !workout.isRestDay && (
          <button
            onClick={() => onStartWorkout(workout)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all shadow-lg shadow-amber-400/10 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>{t('startWorkoutBtn')}</span>
          </button>
        )}
      </div>

      {/* 7-Day Clean Kinetic Timeline Selector */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-serif font-bold text-stone-200">{t('weeklyMovementPlan')}</span>
          <span className="text-[11px] text-stone-400">Select day to view focus</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {safeWeeklyPlan.map((d, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={d.dayNumber || idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400/60 text-amber-200'
                    : 'bg-stone-950/60 border-stone-850 text-stone-400 hover:border-stone-750'
                }`}
              >
                <span className="text-[10px] uppercase font-mono block text-stone-400">
                  {d.dayName?.slice(0, 3)}
                </span>
                <span className="text-xs font-bold block mt-0.5">D{d.dayNumber}</span>
                <span className="text-[9px] block truncate mt-1 text-stone-400">
                  {d.workout?.isRestDay ? 'Rest' : `${d.workout?.durationMinutes || 30}m`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Routine Overview for Selected Day */}
      {workout && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Workout Card (8 cols) */}
          <div className="lg:col-span-8 p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-stone-800/80 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300">
                    Day {currentDay?.dayNumber} • {currentDay?.dayName}
                  </span>
                  <span className="text-xs text-amber-300 font-mono">
                    {workout.focusArea || currentDay?.focus}
                  </span>
                </div>
                <h2 className="text-xl font-serif font-bold text-stone-100">{workout.title}</h2>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase">Duration</span>
                  <p className="text-sm font-mono font-bold text-stone-200">{workout.durationMinutes} min</p>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 uppercase">Est. Energy</span>
                  <p className="text-sm font-mono font-bold text-amber-300">~{workout.caloriesBurned} kcal</p>
                </div>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>{t('exercises')} ({workout.exercises?.length || 0})</span>
                <span>Focus: Form & Breath Control</span>
              </div>

              <div className="space-y-2.5">
                {workout.exercises?.map((ex, idx) => (
                  <div
                    key={`${ex.name}-${idx}`}
                    className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-850 flex items-start justify-between gap-3 hover:border-stone-800 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-stone-850 border border-stone-800 text-[11px] font-mono font-bold text-stone-400 flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h4 className="text-xs font-bold text-stone-200">{ex.name}</h4>
                        {ex.category && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-stone-850 text-stone-400">
                            {ex.category.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 pl-7 leading-relaxed">{ex.formTip}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-stone-200 block">
                        {ex.sets} sets × {ex.reps}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {ex.restSeconds}s rest
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!workout.isRestDay && (
              <button
                onClick={() => onStartWorkout(workout)}
                className="w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-stone-950" />
                <span>Launch Interactive Movement Player</span>
              </button>
            )}
          </div>

          {/* Right Column: Mindful Posture & Wellness Philosophy (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Posture & Alignment Box */}
            <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
              <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{t('postureTipTitle')}</span>
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                {t('postureTip')}
              </p>
            </div>

            {/* Non-Pressuring Philosophy */}
            <div className="p-5 rounded-2xl bg-stone-900/90 border border-stone-800 space-y-3">
              <div className="flex items-center gap-2 text-stone-200 text-xs font-semibold">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Consistency Over Intensity</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Our approach prioritizes longevity, joint health, and steady daily movement. Even 15 minutes of mindful posture alignment and gentle mobility creates profound lasting wellbeing.
              </p>
            </div>

            {/* Facial & Neck Kinetics Snippet */}
            {currentDay?.faceRoutine && (
              <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
                <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Face & Neck Kinetics</span>
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-850">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Morning Activation</span>
                    <p className="text-stone-300 text-[11px] mt-0.5">{currentDay.faceRoutine.morning}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-850">
                    <span className="text-[10px] text-stone-400 uppercase font-semibold">Evening Decompression</span>
                    <p className="text-stone-300 text-[11px] mt-0.5">{currentDay.faceRoutine.evening}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
