import React, { useState } from 'react';
import {
  User,
  Sparkles,
  X,
  Scale,
  Ruler,
  Clock,
  ShieldAlert,
  Moon,
  Sun,
  Palette,
  Globe,
  Check,
  Camera,
  RotateCcw,
  Crown,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, MasterGlowPlan } from '../types';
import { LuminaLogo } from './LuminaLogo';
import { getTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from '../utils/translations';
import { getTrialStatus } from '../utils/trialTracker';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onPlanGenerated: (plan: MasterGlowPlan) => void;
}

const GOAL_OPTIONS = [
  'Restorative Deep Sleep & Circadian Alignment',
  'Postural Spine Alignment (Reverse Tech Neck)',
  'Glass Skin Radiance & Hydration',
  'Toned Body Silhouette & Lean Muscle',
  'Mental Calm & Emotional Balance',
  'Lymphatic Facial Drainage & Depuffing',
  'Core Strength & Posture Sovereignty',
  'Metabolic Energy & Clean Nutrition',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onPlanGenerated,
}) => {
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(profile.themeMode || 'dark');
  const [language, setLanguage] = useState<SupportedLanguage>(profile.language || 'en');
  const [gender, setGender] = useState<UserProfile['gender']>(profile.gender);
  const [age, setAge] = useState<number>(profile.age);
  const [weight, setWeight] = useState<number>(profile.weight);
  const [height, setHeight] = useState<number>(profile.height);
  const [fitnessLevel, setFitnessLevel] = useState<UserProfile['fitnessLevel']>(profile.fitnessLevel);
  const [currentBedtime, setCurrentBedtime] = useState<string>(
    profile.sleepProfile?.currentBedtime || '00:30'
  );
  const [targetBedtime, setTargetBedtime] = useState<string>(
    profile.sleepProfile?.targetBedtime || '22:30'
  );
  const [wakeTime, setWakeTime] = useState<string>(
    profile.sleepProfile?.wakeTime || '06:30'
  );
  const [screenFreeMinutes, setScreenFreeMinutes] = useState<number>(
    profile.sleepProfile?.screenFreeMinutes || 45
  );
  const [dietaryPreference, setDietaryPreference] = useState<string>(
    profile.dietaryPreference || 'Anti-Inflammatory High Protein'
  );
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile.primaryGoals || []);
  const [concerns, setConcerns] = useState<string>(profile.concerns || '');
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = (key: string, params?: Record<string, string | number>) => getTranslation(language, key, params);

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSelectTheme = (mode: 'dark' | 'light') => {
    setThemeMode(mode);
    const updated = { ...profile, themeMode: mode };
    onSaveProfile(updated);
  };

  const handleSaveOnly = () => {
    const updated: UserProfile = {
      ...profile,
      themeMode,
      language,
      gender,
      age,
      weight,
      height,
      fitnessLevel,
      dietaryPreference,
      primaryGoals: selectedGoals,
      concerns,
      sleepProfile: {
        currentBedtime,
        targetBedtime,
        wakeTime,
        screenFreeMinutes,
        gradualStepIndex: profile.sleepProfile?.gradualStepIndex || 1,
        windDownCompletedToday: profile.sleepProfile?.windDownCompletedToday || false,
      },
    };
    onSaveProfile(updated);
    onClose();
  };

  const handleRegenerateMasterPlan = async () => {
    setIsRegenerating(true);
    setErrorMsg(null);

    const updatedProfile: UserProfile = {
      ...profile,
      themeMode,
      language,
      gender,
      age,
      weight,
      height,
      fitnessLevel,
      dietaryPreference,
      primaryGoals: selectedGoals,
      concerns,
      sleepProfile: {
        currentBedtime,
        targetBedtime,
        wakeTime,
        screenFreeMinutes,
        gradualStepIndex: profile.sleepProfile?.gradualStepIndex || 1,
        windDownCompletedToday: profile.sleepProfile?.windDownCompletedToday || false,
      },
    };

    onSaveProfile(updatedProfile);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updatedProfile }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate plan');
      }

      onPlanGenerated(data.data);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onClose();
    } catch (err: any) {
      console.error('Plan generation error:', err);
      setErrorMsg(err.message || 'Could not generate plan');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <LuminaLogo size="sm" />
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-100">
                {t('profileTitle')}
              </h2>
              <p className="text-xs text-stone-400">
                {t('profileSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-5 text-xs">
          {/* Membership & 7-Day Free Trial Status */}
          {(() => {
            const trialStatus = getTrialStatus(profile);
            return (
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>{trialStatus.isSubscribed ? 'OmniGlow Pro Membership' : '7-Day Free Trial Status'}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                    {trialStatus.isSubscribed
                      ? 'Subscribed ($7/mo)'
                      : trialStatus.isExpired
                      ? 'Day 7 (Trial Ended)'
                      : `Day ${trialStatus.currentDay} of 7`}
                  </span>
                </div>

                <p className="text-[11px] text-stone-300 leading-relaxed">
                  {trialStatus.isSubscribed
                    ? 'Active standard subscription. Full unlimited access to all pillars and cloud synchronizations.'
                    : `Your trial began on onboarding completion. Unrestricted access from Day 1 to Day 6. ${
                        trialStatus.isExpired
                          ? 'Trial period has concluded.'
                          : `${trialStatus.daysRemaining} days remaining.`
                      }`}
                </p>

                {/* Quick Simulation Trigger for testing Day 1 vs Day 7 */}
                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <span className="text-[10px] text-stone-400 font-mono">Test Trial Gate Simulator:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...profile,
                          subscription: {
                            tier: 'trial' as const,
                            trialStartDate: new Date().toISOString(),
                            trialDays: 7,
                            billingCycle: 'monthly' as const,
                            hasStandardPlan: false,
                            hasPremiumAddon: false,
                            monthlyTotal: 0,
                            activeTheme: 'obsidian' as const,
                            notificationSound: 'soft_chime' as const,
                          },
                        };
                        onSaveProfile(updated);
                      }}
                      className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      Set Day 1 (Active)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Set trial start date 7 days ago
                        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 - 1000).toISOString();
                        const updated = {
                          ...profile,
                          subscription: {
                            tier: 'trial' as const,
                            trialStartDate: sevenDaysAgo,
                            trialDays: 7,
                            billingCycle: 'monthly' as const,
                            hasStandardPlan: false,
                            hasPremiumAddon: false,
                            monthlyTotal: 0,
                            activeTheme: 'obsidian' as const,
                            notificationSound: 'soft_chime' as const,
                          },
                        };
                        onSaveProfile(updated);
                        onClose();
                      }}
                      className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono transition-colors cursor-pointer font-bold"
                    >
                      Simulate Day 7 (Paywall Gate)
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Theme & Appearance Selector */}
          <div className="space-y-1.5 p-3.5 rounded-xl bg-stone-950/80 border border-stone-800">
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-stone-200 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-amber-400" />
                <span>Sanctuary Theme & Appearance:</span>
              </label>
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                {themeMode === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Dark Theme Option */}
              <button
                type="button"
                onClick={() => handleSelectTheme('dark')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  themeMode === 'dark'
                    ? 'bg-stone-900 text-stone-100 border-amber-500/60 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-stone-950/60 text-stone-400 border-stone-850 hover:text-stone-200 hover:border-stone-750'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-black border border-stone-800 flex items-center justify-center shrink-0">
                    <Moon className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-100">Dark Sanctuary</div>
                    <div className="text-[10px] text-stone-400">Deep Obsidian & Gold</div>
                  </div>
                </div>
                {themeMode === 'dark' && (
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                )}
              </button>

              {/* Light Theme Option */}
              <button
                type="button"
                onClick={() => handleSelectTheme('light')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                  themeMode === 'light'
                    ? 'bg-stone-100 text-stone-950 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                    : 'bg-stone-950/60 text-stone-400 border-stone-850 hover:text-stone-200 hover:border-stone-750'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center shrink-0">
                    <Sun className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">Light Sanctuary</div>
                    <div className="text-[10px] text-stone-500">Crisp Ivory & White</div>
                  </div>
                </div>
                {themeMode === 'light' && (
                  <Check className="w-4 h-4 text-amber-600 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Face Profile Photos Showcase */}
          <div className="space-y-2 p-3.5 rounded-xl bg-stone-950/80 border border-stone-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>3-Angle Face Profile Photos:</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  const updated = { ...profile, onboardingCompleted: false };
                  onSaveProfile(updated);
                  onClose();
                }}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retake Onboarding</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 text-center">
                <div className="aspect-[3/4] rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center overflow-hidden">
                  {profile.facePhotos?.frontal ? (
                    <img
                      src={profile.facePhotos.frontal}
                      alt="Frontal"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-stone-500">No photo</span>
                  )}
                </div>
                <span className="text-[10px] text-stone-400">Frontal View</span>
              </div>

              <div className="space-y-1 text-center">
                <div className="aspect-[3/4] rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center overflow-hidden">
                  {profile.facePhotos?.leftJawline ? (
                    <img
                      src={profile.facePhotos.leftJawline}
                      alt="Left Jawline"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-stone-500">No photo</span>
                  )}
                </div>
                <span className="text-[10px] text-stone-400">Left Jawline</span>
              </div>

              <div className="space-y-1 text-center">
                <div className="aspect-[3/4] rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center overflow-hidden">
                  {profile.facePhotos?.rightJawline ? (
                    <img
                      src={profile.facePhotos.rightJawline}
                      alt="Right Jawline"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-stone-500">No photo</span>
                  )}
                </div>
                <span className="text-[10px] text-stone-400">Right Jawline</span>
              </div>
            </div>
          </div>

          {/* Language Selector Grid */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('language')}:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  type="button"
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    language === l.code
                      ? 'bg-stone-100 text-stone-950 border-stone-100 font-bold'
                      : 'bg-stone-950/60 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <div className="text-xs font-semibold">{l.nativeName}</div>
                  <div className="text-[10px] opacity-70">{l.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Gender Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-stone-200">{t('gender')}:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'female', label: 'Women Glow', sub: 'Hormonal balance & tone' },
                { id: 'male', label: 'Men Glow', sub: 'V-taper & posture sovereignty' },
                { id: 'non-binary', label: 'Neutral', sub: 'Custom vitality & calm' },
              ].map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGender(g.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    gender === g.id
                      ? 'bg-stone-100 text-stone-950 border-stone-100 font-bold'
                      : 'bg-stone-950/60 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <div className="text-xs font-bold">{g.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{g.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Age, Weight, Height Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Age */}
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
              <div className="flex justify-between items-center text-stone-300 font-bold">
                <span>{t('age')}</span>
                <span className="text-indigo-400 font-mono text-sm">{age} yrs</span>
              </div>
              <input
                type="range"
                min="16"
                max="80"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            {/* Weight (kg) */}
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
              <div className="flex justify-between items-center text-stone-300 font-bold">
                <span className="flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-stone-400" /> {t('weight')}
                </span>
                <span className="text-emerald-400 font-mono text-sm">{weight} kg</span>
              </div>
              <input
                type="range"
                min="40"
                max="150"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Height (cm) */}
            <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-1.5">
              <div className="flex justify-between items-center text-stone-300 font-bold">
                <span className="flex items-center gap-1">
                  <Ruler className="w-3.5 h-3.5 text-stone-400" /> {t('height')}
                </span>
                <span className="text-amber-400 font-mono text-sm">{height} cm</span>
              </div>
              <input
                type="range"
                min="130"
                max="215"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Sleep Calibration Configuration */}
          <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-850 space-y-3">
            <div className="flex items-center gap-2 font-bold text-stone-200">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sleep Schedule Calibration:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-stone-400">Current Bedtime</label>
                <input
                  type="time"
                  value={currentBedtime}
                  onChange={(e) => setCurrentBedtime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-750 text-stone-100 font-mono text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-stone-400">Target Bedtime</label>
                <input
                  type="time"
                  value={targetBedtime}
                  onChange={(e) => setTargetBedtime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-750 text-indigo-300 font-mono text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-stone-400">Wake-up Time</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-750 text-amber-300 font-mono text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Primary Wellness Goals */}
          <div className="space-y-2">
            <label className="font-bold text-stone-200">Focus Pillars & Goals:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-stone-800 text-stone-100 border-stone-600 font-medium'
                        : 'bg-stone-950/60 text-stone-400 border-stone-850 hover:text-stone-300 hover:border-stone-750'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-stone-700 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-800">
          <button
            type="button"
            onClick={handleSaveOnly}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-all cursor-pointer"
          >
            {t('save')}
          </button>

          <button
            type="button"
            onClick={handleRegenerateMasterPlan}
            disabled={isRegenerating}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isRegenerating ? 'Recalibrating Schedule...' : 'Recalibrate Master Plan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
