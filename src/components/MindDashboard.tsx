import React, { useState, useEffect } from 'react';
import {
  Brain,
  Wind,
  BookOpen,
  Award,
  Smile,
  Heart,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Plus,
  Send,
  Coffee,
  Info,
} from 'lucide-react';
import { UserProfile, FullReading, AchievementLog, MoodLog, GratitudeEntry } from '../types';
import { getTranslation } from '../utils/translations';

interface MindDashboardProps {
  profile: UserProfile;
  readings: FullReading[];
  achievements: AchievementLog[];
  moodLogs: MoodLog[];
  gratitudeEntries: GratitudeEntry[];
  onSaveReadings: (readings: FullReading[]) => void;
  onSaveAchievements: (achievements: AchievementLog[]) => void;
  onSaveMoodLogs: (moodLogs: MoodLog[]) => void;
  onSaveGratitudeEntries: (entries: GratitudeEntry[]) => void;
  onAddXp: (xp: number) => void;
}

export const MindDashboard: React.FC<MindDashboardProps> = ({
  profile,
  readings,
  achievements,
  moodLogs,
  gratitudeEntries,
  onSaveReadings,
  onSaveAchievements,
  onSaveMoodLogs,
  onSaveGratitudeEntries,
  onAddXp,
}) => {
  const lang = profile.language || 'en';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);

  // Active reading
  const activeReading = readings[0] || {
    id: 'r-1',
    title: 'The Nervous System & Facial Tension: The Key to Natural Poise',
    topic: 'Nervous System Regulation',
    estimatedReadMinutes: 10,
    sections: [
      {
        heading: '1. Unconscious Facial Clenching',
        content: 'When we navigate screen-heavy environments, our masseter muscles clench and breathing becomes shallow. Releasing facial tension directly signals safety to the amygdala.',
      },
      {
        heading: '2. The Vagus Nerve Connection',
        content: 'Engaging deep nasal diaphragmatic breathing stimulates the parasympathetic nervous system, lowering cortisol and allowing natural recovery.',
      },
    ],
    actionableTakeaways: [
      'Rest your tongue flat against the roof of your mouth.',
      'Drop your shoulders gently away from your ears.',
      'Take 5 slow, unhurried breaths before checking messages.',
    ],
    reflectionPrompt: 'Where in your face or body do you habitually hold stress, and how can you create ease there today?',
    completed: false,
  };

  // Breathing pacer state
  const [breathingTechnique, setBreathingTechnique] = useState<'box' | 'relax' | 'sigh'>('box');
  const [isBreathingActive, setIsBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState<number>(4);

  // Gratitude entry input
  const [journalText, setJournalText] = useState<string>('');
  const [newVictoryTitle, setNewVictoryTitle] = useState<string>('');
  const [showAddVictory, setShowAddVictory] = useState<boolean>(false);

  // Breathing loop
  useEffect(() => {
    let timer: any = null;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            // Transition phases based on technique
            if (breathingTechnique === 'box') {
              // 4 - 4 - 4 - 4
              if (breathPhase === 'inhale') { setBreathPhase('hold'); return 4; }
              if (breathPhase === 'hold') { setBreathPhase('exhale'); return 4; }
              if (breathPhase === 'exhale') { setBreathPhase('holdEmpty'); return 4; }
              if (breathPhase === 'holdEmpty') { setBreathPhase('inhale'); return 4; }
            } else if (breathingTechnique === 'relax') {
              // 4 - 7 - 8
              if (breathPhase === 'inhale') { setBreathPhase('hold'); return 7; }
              if (breathPhase === 'hold') { setBreathPhase('exhale'); return 8; }
              if (breathPhase === 'exhale') { setBreathPhase('inhale'); return 4; }
            } else if (breathingTechnique === 'sigh') {
              // Double inhale 3s, long exhale 6s
              if (breathPhase === 'inhale') { setBreathPhase('exhale'); return 6; }
              if (breathPhase === 'exhale') { setBreathPhase('inhale'); return 3; }
            }
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, breathPhase, breathingTechnique]);

  const handleStartBreathing = (technique: 'box' | 'relax' | 'sigh') => {
    setBreathingTechnique(technique);
    setBreathPhase('inhale');
    setBreathSeconds(technique === 'sigh' ? 3 : 4);
    setIsBreathingActive(true);
  };

  const handleStopBreathing = () => {
    setIsBreathingActive(false);
    onAddXp(35);
  };

  const handleLogMood = (mood: MoodLog['mood']) => {
    const newLog: MoodLog = {
      id: `m-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mood,
    };
    onSaveMoodLogs([newLog, ...moodLogs]);
    onAddXp(20);
  };

  const handleSaveGratitude = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    const newEntry: GratitudeEntry = {
      id: `g-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      text: journalText.trim(),
    };
    onSaveGratitudeEntries([newEntry, ...gratitudeEntries]);
    onAddXp(30);
    setJournalText('');
  };

  const handleAddCustomVictory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVictoryTitle.trim()) return;
    const newAch: AchievementLog = {
      id: `ach-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: newVictoryTitle.trim(),
      category: 'mind',
      xpEarned: 25,
    };
    onSaveAchievements([newAch, ...achievements]);
    onAddXp(25);
    setNewVictoryTitle('');
    setShowAddVictory(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-950/70 border border-violet-800/40 text-violet-300 text-xs font-medium">
            <Brain className="w-3.5 h-3.5" />
            <span>{t('mindTab')} • Mental Calm</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-100">{t('mindTitle')}</h1>
          <p className="text-sm text-stone-400 max-w-2xl">{t('mindSubtitle')}</p>
        </div>
      </div>

      {/* Mood Awareness Check-in */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            {t('moodCheckin')}
          </span>
          {moodLogs[0] && (
            <span className="text-xs text-stone-400">
              Last check-in: <strong className="capitalize text-stone-300">{moodLogs[0].mood}</strong> at {moodLogs[0].timestamp}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {[
            { id: 'calm', label: t('moodCalm'), color: 'text-sky-300', bg: 'hover:border-sky-500/50' },
            { id: 'grateful', label: t('moodGrateful'), color: 'text-amber-300', bg: 'hover:border-amber-500/50' },
            { id: 'energetic', label: t('moodEnergetic'), color: 'text-emerald-300', bg: 'hover:border-emerald-500/50' },
            { id: 'reflective', label: t('moodReflective'), color: 'text-violet-300', bg: 'hover:border-violet-500/50' },
            { id: 'anxious', label: t('moodAnxious'), color: 'text-rose-300', bg: 'hover:border-rose-500/50' },
            { id: 'tired', label: t('moodTired'), color: 'text-stone-400', bg: 'hover:border-stone-600' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleLogMood(m.id as MoodLog['mood'])}
              className={`p-3 rounded-xl bg-stone-950/70 border border-stone-850 text-center transition-all cursor-pointer ${m.bg}`}
            >
              <Smile className={`w-5 h-5 mx-auto mb-1.5 ${m.color}`} />
              <span className="text-xs font-medium text-stone-200 block truncate">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Guided Breathwork & Pacer Studio */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
              <Wind className="w-4 h-4 text-sky-400" />
              <span>{t('breathworkTitle')}</span>
            </h3>
            <p className="text-xs text-stone-400">
              Regulate your autonomic nervous system and soothe mental chatter.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'box', label: 'Box (4-4-4-4)' },
              { id: 'relax', label: '4-7-8 Relax' },
              { id: 'sigh', label: 'Physio Sigh' },
            ].map((tech) => (
              <button
                key={tech.id}
                onClick={() => handleStartBreathing(tech.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  breathingTechnique === tech.id && isBreathingActive
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                    : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                {tech.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Breathing Interactive Visual Circle */}
        <div className="p-8 rounded-xl bg-stone-950 border border-stone-850 flex flex-col items-center justify-center space-y-4 text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <div
              className={`absolute inset-0 rounded-full border-2 border-sky-400/40 transition-all duration-1000 ${
                isBreathingActive && breathPhase === 'inhale' ? 'scale-110 bg-sky-500/15' :
                isBreathingActive && breathPhase === 'hold' ? 'scale-110 bg-indigo-500/20' :
                isBreathingActive && breathPhase === 'exhale' ? 'scale-90 bg-sky-500/5' : 'scale-100 bg-stone-900'
              }`}
            />
            <div className="relative z-10 flex flex-col items-center">
              <span className="font-mono text-3xl font-bold text-stone-100">
                {isBreathingActive ? breathSeconds : '4'}
              </span>
              <span className="text-xs font-medium text-sky-300 uppercase tracking-widest mt-0.5">
                {isBreathingActive ? (
                  breathPhase === 'inhale' ? t('inhale') :
                  breathPhase === 'hold' ? t('hold') :
                  breathPhase === 'exhale' ? t('exhale') : 'Hold'
                ) : 'Ready'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isBreathingActive ? (
              <button
                onClick={() => handleStartBreathing(breathingTechnique)}
                className="px-6 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-950 text-xs font-bold transition-all cursor-pointer"
              >
                {t('startBreathing')}
              </button>
            ) : (
              <button
                onClick={handleStopBreathing}
                className="px-6 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-all cursor-pointer"
              >
                {t('stopBreathing')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 10-Minute Daily Reading & Reflection */}
      <div className="p-6 rounded-2xl bg-stone-900 border border-stone-800 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {t('dailyReadingTitle')}
            </span>
            <h3 className="text-lg font-serif font-bold text-stone-100">{activeReading.title}</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 font-mono shrink-0">
            {activeReading.estimatedReadMinutes} min read
          </span>
        </div>

        <div className="space-y-3 text-xs text-stone-300 leading-relaxed">
          {activeReading.sections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="font-semibold text-stone-200">{sec.heading}</h4>
              <p className="text-stone-400">{sec.content}</p>
            </div>
          ))}
        </div>

        {/* Reflection & Gratitude Prompt Form */}
        <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-850 space-y-3">
          <div className="space-y-0.5">
            <span className="text-xs font-serif font-bold text-amber-300 block">
              {t('reflectionPrompt')}:
            </span>
            <p className="text-xs text-stone-400 italic">
              &quot;{activeReading.reflectionPrompt}&quot;
            </p>
          </div>

          <form onSubmit={handleSaveGratitude} className="space-y-2.5">
            <textarea
              rows={2}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder={t('journalPlaceholder')}
              className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-100 text-xs focus:outline-none focus:border-violet-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>{t('saveReflection')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Book of Daily Victories & Saved Thoughts */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{t('victoryLogTitle')} ({achievements.length})</span>
          </h3>
          <button
            onClick={() => setShowAddVictory(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('addVictory')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {achievements.slice(0, 6).map((ach) => (
            <div
              key={ach.id}
              className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-850 flex items-start justify-between gap-2"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] text-stone-500 block font-mono">{ach.date}</span>
                <h4 className="text-xs font-bold text-stone-200">{ach.title}</h4>
                {ach.note && (
                  <p className="text-[11px] text-stone-400 line-clamp-2">{ach.note}</p>
                )}
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0">
                +{ach.xpEarned} XP
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Victory Modal */}
      {showAddVictory && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{t('addVictory')}</span>
              </h3>
              <button
                onClick={() => setShowAddVictory(false)}
                className="text-stone-400 hover:text-stone-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomVictory} className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Victory Title</label>
                <input
                  type="text"
                  required
                  value={newVictoryTitle}
                  onChange={(e) => setNewVictoryTitle(e.target.value)}
                  placeholder="e.g. Completed 10-min meditation without checking phone"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddVictory(false)}
                  className="px-4 py-1.5 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold cursor-pointer"
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
