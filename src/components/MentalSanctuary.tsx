import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Award,
  Sparkles,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Plus,
  Flame,
  Zap,
  Tag,
  Dumbbell,
  Apple,
  RefreshCw,
  AlertCircle,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FullReading, AchievementLog, UserProfile } from '../types';

interface MentalSanctuaryProps {
  profile: UserProfile;
  readings: FullReading[];
  onSaveReadings: (readings: FullReading[]) => void;
  achievements: AchievementLog[];
  onSaveAchievements: (achievements: AchievementLog[]) => void;
  onAddXp: (xp: number) => void;
}

export const MentalSanctuary: React.FC<MentalSanctuaryProps> = ({
  profile,
  readings,
  onSaveReadings,
  achievements,
  onSaveAchievements,
  onAddXp,
}) => {
  const [activeTab, setActiveTab] = useState<'reading' | 'achievements'>('reading');
  const [selectedReadingIndex, setSelectedReadingIndex] = useState<number>(0);

  // 10-Min Timer state
  const [timerSeconds, setTimerSeconds] = useState<number>(600); // 10 minutes = 600s
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  // New Achievement Form state
  const [isLogWinOpen, setIsLogWinOpen] = useState<boolean>(false);
  const [winTitle, setWinTitle] = useState<string>('');
  const [winCategory, setWinCategory] = useState<'body' | 'face' | 'mind' | 'nutrition'>('mind');
  const [winNote, setWinNote] = useState<string>('');

  // AI Reading Generator state
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isGeneratingReading, setIsGeneratingReading] = useState<boolean>(false);
  const [genError, setGenError] = useState<string | null>(null);

  const currentReading = (readings && readings[selectedReadingIndex]) || (readings && readings[0]) || {
    id: 'r-fallback',
    dayNumber: 1,
    topic: 'Mental Sovereignty',
    title: 'Cortisol Management & The Unclenched Face',
    keyInsight: 'Facial tension mirrors internal rumination. Relax the jaw and the thoughts follow.',
    estimatedReadMinutes: 10,
    sections: [
      {
        heading: 'The Biology of Posture & Presence',
        content: 'When we consciously relax the tongue from the roof of the mouth and unknit the brow, sympathetic nervous tone drops instantly.',
      },
    ],
    actionableTakeaways: [
      'Take 3 deep nasal diaphragmatic breaths.',
      'Unclench your masseter jaw muscles.',
      'Maintain an upright cervical spine without military stiffness.',
    ],
    reflectionPrompt: 'Where in your daily routine do you notice involuntary tension accumulating?',
    completed: false,
  };

  // Timer logic
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsTimerRunning(false);
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(600);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Complete reading
  const handleCompleteReading = () => {
    const updated = readings.map((r, i) =>
      i === selectedReadingIndex ? { ...r, completed: true } : r
    );
    onSaveReadings(updated);
    onAddXp(75);

    // Auto add achievement to Book of Achievements
    const newAch: AchievementLog = {
      id: `ach-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: `Finished 10-Min Reading: ${currentReading.title}`,
      category: 'mind',
      note: `Gained insight: ${currentReading.keyInsight}`,
      xpEarned: 75,
    };
    onSaveAchievements([newAch, ...achievements]);

    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#818cf8', '#fbbf24', '#f43f5e'],
    });
  };

  // Log custom win
  const handleLogAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winTitle.trim()) return;

    const newAch: AchievementLog = {
      id: `ach-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: winTitle.trim(),
      category: winCategory,
      note: winNote.trim() || undefined,
      xpEarned: 50,
    };

    onSaveAchievements([newAch, ...achievements]);
    onAddXp(50);
    setWinTitle('');
    setWinNote('');
    setIsLogWinOpen(false);

    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  // Generate new AI reading
  const generateAiReading = async () => {
    if (!customTopic.trim()) return;
    setIsGeneratingReading(true);
    setGenError(null);

    try {
      const response = await fetch('/api/generate-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopic.trim(),
          dayNumber: readings.length + 1,
          userProfile: {
            gender: profile.gender,
            age: profile.age,
            primaryGoals: profile.primaryGoals,
          },
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate reading');
      }

      const newReading: FullReading = {
        ...data.data,
        completed: false,
      };

      onSaveReadings([newReading, ...readings]);
      setSelectedReadingIndex(0);
      setCustomTopic('');
      setTimerSeconds(600);
      setIsTimerRunning(false);

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      console.error('Error generating reading:', err);
      setGenError(err.message || 'Could not generate reading');
    } finally {
      setIsGeneratingReading(false);
    }
  };

  const getCategoryIcon = (category: AchievementLog['category']) => {
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

  const getCategoryBadge = (category: AchievementLog['category']) => {
    switch (category) {
      case 'body':
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
      case 'face':
        return 'bg-amber-950/40 text-amber-300 border-amber-800/40';
      case 'nutrition':
        return 'bg-rose-950/40 text-rose-300 border-rose-800/40';
      case 'mind':
        return 'bg-indigo-950/40 text-indigo-300 border-indigo-800/40';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Mental Sovereignty & Dopamine Reset
              </span>
              <span className="text-xs text-stone-400">
                10-Minute Daily Reading • Book of Achievements
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Mind & Achievement Sanctuary
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl">
              An unclouded mind and parasympathetic ease directly reduce facial muscle tension and lower skin-aging cortisol. Complete your 10-minute daily reading and document your compounding victories in your Book of Achievements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="open-log-win-modal-btn"
              onClick={() => setIsLogWinOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-stone-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Victory in Achievement Book</span>
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-stone-800/80">
          <button
            onClick={() => setActiveTab('reading')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reading'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>10-Minute Reading Room ({readings.length} Chapters)</span>
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'achievements'
                ? 'bg-amber-400 text-stone-950 shadow-md font-bold'
                : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Book of Achievements ({achievements.length} Wins)</span>
          </button>
        </div>
      </div>

      {genError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{genError}</span>
        </div>
      )}

      {/* Log Win Modal */}
      {isLogWinOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-lg">
                <Award className="w-5 h-5" />
                <span>Log Victory into Book of Achievements</span>
              </div>
              <button
                onClick={() => setIsLogWinOpen(false)}
                className="text-stone-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-stone-800"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleLogAchievement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-300">
                  Achievement Title:
                </label>
                <input
                  type="text"
                  required
                  value={winTitle}
                  onChange={(e) => setWinTitle(e.target.value)}
                  placeholder="e.g. Crushed 45-min posture workout & drank 3L water..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-850 border border-stone-700 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-300">Category:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['body', 'face', 'mind', 'nutrition'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setWinCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        winCategory === cat
                          ? 'bg-amber-400 text-stone-950 border-amber-300'
                          : 'bg-stone-850 text-stone-400 border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-300">
                  Personal Reflection / Glow Note (Optional):
                </label>
                <textarea
                  rows={3}
                  value={winNote}
                  onChange={(e) => setWinNote(e.target.value)}
                  placeholder="How did this victory make you feel? What habit was unlocked?"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-850 border border-stone-700 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-400/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Save Achievement & Claim +50 XP</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 1: 10-Minute Reading Room */}
      {activeTab === 'reading' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (4/12): Reading List & Generator */}
          <div className="lg:col-span-4 space-y-5">
            {/* 10-Min Focus Timer Widget */}
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4 text-center">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 10-Min Focus Sanctuary
                </span>
                <span>{timerSeconds === 0 ? 'Completed!' : 'In Progress'}</span>
              </div>

              <div className="text-4xl font-mono font-extrabold text-stone-100 tracking-wider">
                {formatTime(timerSeconds)}
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  id="toggle-reading-timer-btn"
                  onClick={toggleTimer}
                  className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                    isTimerRunning
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20'
                  }`}
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-3.5 h-3.5" /> Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" /> Start 10-Min Reading
                    </>
                  )}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white border border-stone-700"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* AI Reading Generator */}
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Custom 10-Min Chapter</span>
              </div>
              <p className="text-xs text-stone-400">
                Generate deep readings on charisma, stoicism, cortisol management, or facial relaxation.
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Unclenching Facial Tension & Eye Poise..."
                  className="w-full px-3 py-2 rounded-xl bg-stone-850 border border-stone-700 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  id="generate-ai-reading-btn"
                  onClick={generateAiReading}
                  disabled={isGeneratingReading || !customTopic.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  {isGeneratingReading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Writing 10-Min Chapter...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Chapter</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Reading Chapters Library */}
            <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 border-b border-stone-800 pb-2">
                Reading Library ({readings.length})
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {readings.map((reading, idx) => {
                  const isSelected = selectedReadingIndex === idx;
                  return (
                    <button
                      key={reading.id || idx}
                      id={`reading-chapter-${idx}`}
                      onClick={() => {
                        setSelectedReadingIndex(idx);
                        setTimerSeconds(600);
                        setIsTimerRunning(false);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-indigo-950/70 border-indigo-500/50 text-white shadow-sm ring-1 ring-indigo-400/40'
                          : 'bg-stone-850/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                          Chapter {idx + 1}
                        </span>
                        {reading.completed && (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Read
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-stone-200 mt-1 line-clamp-1">
                        {reading.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (8/12): Reading Reader Document */}
          <div className="lg:col-span-8 space-y-5">
            <div className="rounded-2xl bg-stone-900/95 border border-stone-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* Header Info */}
              <div className="space-y-2 border-b border-stone-800 pb-5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {currentReading.topic}
                  </span>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    {currentReading.estimatedReadMinutes} Minutes Reading
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 leading-tight">
                  {currentReading.title}
                </h2>
              </div>

              {/* Key Insight Highlight Callout */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-stone-850 to-stone-850 border border-indigo-500/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Key Paradigm Shift
                </span>
                <p className="text-xs sm:text-sm font-serif italic text-stone-200 leading-relaxed">
                  &ldquo;{currentReading.keyInsight}&rdquo;
                </p>
              </div>

              {/* Reading Sections */}
              <div className="space-y-6 text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
                {currentReading.sections?.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-sm sm:text-base font-serif font-bold text-amber-200">
                      {sec.heading}
                    </h3>
                    <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                      {sec.content}
                    </p>
                  </div>
                ))}
              </div>

              {/* Actionable Takeaways */}
              <div className="p-4 rounded-xl bg-stone-850 border border-stone-800 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Actionable Glow Takeaways for Today:
                </span>
                <ul className="space-y-1.5 text-xs text-stone-300">
                  {currentReading.actionableTakeaways?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reflection Prompt */}
              {currentReading.reflectionPrompt && (
                <div className="p-4 rounded-xl bg-stone-850/60 border border-stone-800 text-xs text-stone-300 space-y-1">
                  <span className="font-bold text-stone-200">Journal Reflection:</span>
                  <p className="italic text-stone-400">{currentReading.reflectionPrompt}</p>
                </div>
              )}

              {/* Mark Completed Button */}
              <div className="pt-4 border-t border-stone-800 flex justify-between items-center">
                <span className="text-xs text-stone-400">
                  Earn +75 XP and record win in your Book of Achievements
                </span>
                <button
                  id="mark-reading-completed-btn"
                  onClick={handleCompleteReading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 text-stone-950 font-bold text-xs shadow-md shadow-emerald-400/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark 10-Min Reading Completed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Book of Achievements */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Milestone Badges & Trophy Showcase */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/30 p-4 text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-stone-100">Glow Veteran</div>
              <p className="text-[10px] text-stone-400">{profile.glowStreak} Day Streak</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 via-stone-900 to-stone-900 border border-emerald-500/30 p-4 text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-stone-100">Posture Sovereign</div>
              <p className="text-[10px] text-stone-400">Cervical Spine Aligned</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-stone-900 to-stone-900 border border-indigo-500/30 p-4 text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-stone-100">Mindset Scholar</div>
              <p className="text-[10px] text-stone-400">10-Min Reading Master</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-rose-950/40 via-stone-900 to-stone-900 border border-rose-500/30 p-4 text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-stone-100">Lumina Master</div>
              <p className="text-[10px] text-stone-400">{profile.totalXp} XP Accumulated</p>
            </div>
          </div>

          {/* Book of Achievements Feed */}
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 font-serif font-bold text-stone-100 text-lg">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Book of Daily Victories & Milestones</span>
              </div>
              <button
                id="log-new-win-in-feed-btn"
                onClick={() => setIsLogWinOpen(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log New Victory</span>
              </button>
            </div>

            {achievements.length === 0 ? (
              <div className="py-12 text-center text-stone-500 text-xs">
                No achievements recorded yet. Click &quot;Log Victory&quot; to begin your Book of Achievements.
              </div>
            ) : (
              <div className="space-y-3">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className="p-4 rounded-xl bg-stone-850 border border-stone-800 hover:border-stone-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 mt-0.5">
                        {getCategoryIcon(ach.category)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${getCategoryBadge(
                              ach.category
                            )}`}
                          >
                            {ach.category}
                          </span>
                          <span className="text-xs text-stone-400 font-mono">
                            {ach.date}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-stone-100">{ach.title}</h4>
                        {ach.note && (
                          <p className="text-xs text-stone-400 leading-relaxed">
                            {ach.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="self-end sm:self-center px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>+{ach.xpEarned} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
