import React, { useState } from 'react';
import {
  Dumbbell,
  Clock,
  Flame,
  Play,
  Filter,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react';
import { MasterGlowPlan, WorkoutRoutine, UserProfile } from '../types';

interface WorkoutPlannerProps {
  masterPlan: MasterGlowPlan;
  profile: UserProfile;
  onStartWorkout: (workout: WorkoutRoutine) => void;
  selectedDayIndex: number;
  setSelectedDayIndex: (idx: number) => void;
}

export const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({
  masterPlan,
  profile,
  onStartWorkout,
  selectedDayIndex = 0,
  setSelectedDayIndex,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const weeklyPlan = masterPlan?.weeklyPlan || [];
  const currentDay = weeklyPlan[selectedDayIndex] || weeklyPlan[0] || {
    dayNumber: 1,
    dayName: 'Monday',
    focus: 'Posture & Silhouette',
    workout: {
      id: 'w-default',
      title: 'Aesthetic Posture & Core Foundation',
      scheduledTime: '07:30 AM',
      durationMinutes: 45,
      caloriesBurned: 320,
      exercises: [],
    },
    faceRoutine: { morning: '', evening: '' },
    readingSnippet: { title: '', summary: '', bookCategory: '' },
    dailySchedule: [],
  };
  const workout = currentDay.workout || {
    id: 'w-fallback',
    title: 'Daily Kinetic Movement',
    scheduledTime: '07:30 AM',
    durationMinutes: 40,
    caloriesBurned: 280,
    exercises: [],
  };

  const filteredExercises = (workout.exercises || []).filter((ex) => {
    if (filterCategory === 'all') return true;
    return ex.category === filterCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Aesthetic Kinetics & Posture
              </span>
              <span className="text-xs text-stone-400">
                Personalized for {profile?.age || 26}y {profile?.gender || 'All'} • {profile?.fitnessLevel || 'intermediate'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Customized Workout & Silhouette Program
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl">
              Targeted resistance training, cervical spine realignment, face & neck toning, and metabolic conditioning programmed at specific days and times.
            </p>
          </div>

          <button
            id="start-workout-session-btn"
            onClick={() => onStartWorkout(workout)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 active:scale-95 text-stone-950 font-bold text-sm shadow-lg shadow-emerald-400/20 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>Launch Live Workout Player</span>
          </button>
        </div>

        {/* 7-Day Week Selector Bar */}
        <div className="mt-6 pt-4 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {weeklyPlan.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <button
                key={day.dayName || idx}
                id={`workout-day-${idx}`}
                onClick={() => setSelectedDayIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-stone-100 shadow-md ring-1 ring-emerald-400/40'
                    : 'bg-stone-850/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                    Day {day.dayNumber}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {day.workout?.scheduledTime || '07:30 AM'}
                  </span>
                </div>
                <div className="text-xs font-bold text-stone-200 mt-1 truncate">
                  {day.dayName}
                </div>
                <div className="text-[11px] text-stone-400 truncate mt-0.5">
                  {day.workout?.title || 'Workout'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Workout Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Exercise Cards & Filters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                <span>{workout.title}</span>
              </h2>
              <p className="text-xs text-stone-400">
                Scheduled at {workout.scheduledTime} • {workout.durationMinutes} Minutes • ~{workout.caloriesBurned} kcal
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-3.5 h-3.5 text-stone-400 mr-1 hidden sm:block" />
              {[
                { id: 'all', label: 'All' },
                { id: 'strength', label: 'Strength' },
                { id: 'posture', label: 'Posture' },
                { id: 'face_neck', label: 'Face & Neck' },
                { id: 'mobility', label: 'Mobility' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterCategory(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    filterCategory === f.id
                      ? 'bg-stone-100 text-stone-950 font-bold shadow-sm'
                      : 'bg-stone-850 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise List */}
          <div className="space-y-3">
            {filteredExercises.map((ex, i) => (
              <div
                key={i}
                id={`exercise-item-${i}`}
                className="p-4 rounded-xl bg-stone-900/90 border border-stone-800 hover:border-stone-700 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-100">{ex.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mt-0.5">
                        <span>{ex.sets} Sets</span>
                        <span>•</span>
                        <span>{ex.reps}</span>
                        <span>•</span>
                        <span className="text-stone-400">{ex.restSeconds}s Rest</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                    {ex.category || 'strength'}
                  </span>
                </div>

                {/* Form & Aesthetic Cue */}
                <div className="p-2.5 rounded-lg bg-stone-850 border border-stone-800/60 text-xs text-stone-300 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 font-semibold">Aesthetic Cue: </strong>
                    <span className="text-stone-300">{ex.formTip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Workout Overview & Metrics */}
        <div className="space-y-5">
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4">
            <h3 className="text-base font-serif font-bold text-stone-100 border-b border-stone-800 pb-3">
              Session Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-stone-800/60">
                <span className="text-stone-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" /> Scheduled Time
                </span>
                <span className="font-bold text-stone-200 font-mono">
                  {workout.scheduledTime}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-stone-800/60">
                <span className="text-stone-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-400" /> Day & Focus
                </span>
                <span className="font-bold text-stone-200">
                  {currentDay.dayName} • {currentDay.focus}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-stone-800/60">
                <span className="text-stone-400 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" /> Caloric Burn
                </span>
                <span className="font-bold text-rose-400 font-mono">
                  ~{workout.caloriesBurned} kcal
                </span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-stone-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-400" /> Total Exercises
                </span>
                <span className="font-bold text-stone-200 font-mono">
                  {(workout.exercises || []).length} Movements
                </span>
              </div>
            </div>

            <button
              id="start-live-workout-side-btn"
              onClick={() => onStartWorkout(workout)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-stone-950 font-bold text-xs shadow-md shadow-emerald-400/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>Launch Live Workout Player</span>
            </button>
          </div>

          {/* Aesthetic Benefit Tip */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-950/30 via-stone-900 to-stone-900 border border-emerald-500/30 p-5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-300 font-serif font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>The Silhouette Principle</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              Targeted upper-back retraction and lateral deltoid development visually slim the waistline and sharpen the jawline through involuntary spinal lengthening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
