import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Dumbbell,
  Sparkles,
  Flame,
  Clock,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkoutRoutine } from '../types';

interface ActiveWorkoutModalProps {
  workout: WorkoutRoutine | null;
  onClose: () => void;
  onFinishWorkout: (workout: WorkoutRoutine) => void;
}

export const ActiveWorkoutModal: React.FC<ActiveWorkoutModalProps> = ({
  workout,
  onClose,
  onFinishWorkout,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [completedExercises, setCompletedExercises] = useState<number[]>([]);
  const [restSeconds, setRestSeconds] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const restTimerRef = useRef<any>(null);

  if (!workout) return null;

  const currentExercise = workout.exercises[currentExerciseIndex] || workout.exercises[0];

  // Rest Timer countdown
  useEffect(() => {
    if (isResting && restSeconds > 0) {
      restTimerRef.current = setInterval(() => {
        setRestSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(restTimerRef.current);
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    }
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [isResting, restSeconds]);

  const startRestTimer = (seconds: number) => {
    setRestSeconds(seconds);
    setIsResting(true);
  };

  const toggleCompleteExercise = (index: number) => {
    if (completedExercises.includes(index)) {
      setCompletedExercises(completedExercises.filter((i) => i !== index));
    } else {
      setCompletedExercises([...completedExercises, index]);
      // Start rest timer automatically
      const nextRest = workout.exercises[index]?.restSeconds || 60;
      startRestTimer(nextRest);
      // Auto advance to next if possible
      if (index < workout.exercises.length - 1) {
        setCurrentExerciseIndex(index + 1);
      }
    }
  };

  const handleFinish = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#10b981', '#fbbf24', '#f43f5e', '#38bdf8'],
    });
    onFinishWorkout(workout);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-800/50">
                  Live Workout Player
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  {completedExercises.length} / {workout.exercises.length} Done
                </span>
              </div>
              <h2 className="text-lg font-serif font-bold text-stone-100 mt-0.5">
                {workout.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Rest Timer Banner */}
        {isResting && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 via-stone-850 to-stone-900 border border-emerald-500/40 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-emerald-400 animate-spin" />
              <div>
                <span className="text-xs font-bold text-emerald-300">Resting Interval</span>
                <p className="text-[11px] text-stone-400">Deep nasal breathing & posture reset</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-mono font-extrabold text-stone-100">
                {restSeconds}s
              </span>
              <button
                onClick={() => setIsResting(false)}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Current Active Movement Highlight */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-850 to-stone-900 border border-stone-750 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Current Movement ({currentExerciseIndex + 1} of {workout.exercises.length})
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
              {currentExercise.category || 'strength'}
            </span>
          </div>

          <h3 className="text-xl font-serif font-bold text-stone-100">
            {currentExercise.name}
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400">Target Sets</span>
              <div className="text-base font-bold text-stone-100 font-mono mt-0.5">
                {currentExercise.sets} Sets
              </div>
            </div>
            <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400">Reps / Duration</span>
              <div className="text-base font-bold text-amber-300 font-mono mt-0.5">
                {currentExercise.reps}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400">Target Rest</span>
              <div className="text-base font-bold text-stone-100 font-mono mt-0.5">
                {currentExercise.restSeconds}s
              </div>
            </div>
          </div>

          {/* Form & Aesthetic Cue */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-stone-200 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-semibold">Aesthetic Cue: </strong>
              <span className="text-stone-300">{currentExercise.formTip}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => toggleCompleteExercise(currentExerciseIndex)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                completedExercises.includes(currentExerciseIndex)
                  ? 'bg-emerald-500 text-stone-950'
                  : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-stone-950 shadow-lg shadow-emerald-400/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {completedExercises.includes(currentExerciseIndex)
                  ? 'Completed (Click to Undo)'
                  : 'Mark Movement Completed & Rest'}
              </span>
            </button>
            <button
              onClick={() => startRestTimer(currentExercise.restSeconds || 60)}
              className="px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 text-xs font-bold border border-stone-700"
            >
              Start {currentExercise.restSeconds}s Rest
            </button>
          </div>
        </div>

        {/* All Exercises Checklist */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Session Exercises Checklist:
          </h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {workout.exercises.map((ex, idx) => {
              const isDone = completedExercises.includes(idx);
              const isCurrent = currentExerciseIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentExerciseIndex(idx)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-stone-800 border-amber-400/50 text-stone-100 font-bold'
                      : isDone
                      ? 'bg-stone-900/40 border-stone-800/60 text-stone-400'
                      : 'bg-stone-850/70 border-stone-800 text-stone-300 hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompleteExercise(idx);
                      }}
                      className="text-stone-400 hover:text-emerald-400"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-stone-600" />
                      )}
                    </button>
                    <span className={isDone ? 'line-through text-stone-500' : ''}>
                      {ex.name} ({ex.sets} × {ex.reps})
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {ex.restSeconds}s rest
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Finish & Claim XP */}
        <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>~{workout.caloriesBurned} kcal burned</span>
          </div>
          <button
            id="complete-full-workout-btn"
            onClick={handleFinish}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-400/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" />
            <span>Finish Workout & Claim +100 XP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
