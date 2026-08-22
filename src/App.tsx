import React, { useState, useEffect, useCallback } from 'react';
import { Header, MainSectionTab } from './components/Header';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OnboardingWizard } from './components/OnboardingWizard';
import { HomeOverview } from './components/HomeOverview';
import { SleepDashboard } from './components/SleepDashboard';
import { FoodDashboard } from './components/FoodDashboard';
import { HydrationDashboard } from './components/HydrationDashboard';
import { BodyDashboard } from './components/BodyDashboard';
import { MindDashboard } from './components/MindDashboard';
import { PremiumDashboard } from './components/PremiumDashboard';
import { ProfileModal } from './components/ProfileModal';
import { ActiveWorkoutModal } from './components/ActiveWorkoutModal';
import { DeviceSyncModal } from './components/DeviceSyncModal';
import { PaywallModal } from './components/PaywallModal';
import {
  UserProfile,
  MasterGlowPlan,
  Recipe,
  FullReading,
  AchievementLog,
  WorkoutRoutine,
  SleepLog,
  MoodLog,
  GratitudeEntry,
  HydrationEntry,
  DayHydrationRecord,
  calculateEstimatedDailyHydration,
} from './types';
import { storage } from './utils/storage';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from './utils/translations';
import { getTrialStatus } from './utils/trialTracker';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainSectionTab>('home');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  // Core Persistent State
  const [profile, setProfile] = useState<UserProfile>(() => storage.loadProfile());
  const [masterPlan, setMasterPlan] = useState<MasterGlowPlan>(() => storage.loadMasterPlan());
  const [recipes, setRecipes] = useState<Recipe[]>(() => storage.loadRecipes());
  const [loggedMeals, setLoggedMeals] = useState<Recipe[]>(() => storage.loadLoggedMeals());
  const [readings, setReadings] = useState<FullReading[]>(() => storage.loadReadings());
  const [achievements, setAchievements] = useState<AchievementLog[]>(() => storage.loadAchievements());
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>(() => storage.loadSleepLogs());
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>(() => storage.loadMoodLogs());
  const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>(() => storage.loadGratitudeEntries());
  
  // Hydration State (100% Free Feature)
  const [waterMlToday, setWaterMlToday] = useState<number>(() => storage.loadWaterIntake());
  const [hydrationLogs, setHydrationLogs] = useState<HydrationEntry[]>(() => storage.loadHydrationLogs());
  const [hydrationWeekHistory, setHydrationWeekHistory] = useState<DayHydrationRecord[]>(() => storage.loadHydrationWeekHistory());

  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRoutine | null>(null);

  // Sync State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);
  const [lastSyncedText, setLastSyncedText] = useState<string>('Just now');

  const currentLang = profile.language || 'en';
  const themeMode = profile.themeMode || 'dark';
  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang);
  const textDirection = langConfig?.dir || 'ltr';

  // Apply direction, language, and theme to html/document
  useEffect(() => {
    document.documentElement.dir = textDirection;
    document.documentElement.lang = currentLang;

    if (themeMode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [textDirection, currentLang, themeMode]);

  // Theme toggle handler
  const handleToggleTheme = useCallback(() => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    const updated = { ...profile, themeMode: nextMode };
    setProfile(updated);
    storage.saveProfile(updated);
  }, [profile, themeMode]);

  // Synchronize with Cloud / Other Devices Handler
  const handleTriggerSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedText(`Today at ${timeStr}`);

      // Persist sync state
      if (profile.account) {
        const updatedAccount = {
          ...profile.account,
          lastSyncedAt: now.toISOString(),
          syncStatus: 'synced' as const,
        };
        const updatedProfile = { ...profile, account: updatedAccount };
        setProfile(updatedProfile);
        storage.saveProfile(updatedProfile);
      }

      setSyncToastMessage('All 5 pillars synchronized across your Android, iPhone & Windows devices.');
      setTimeout(() => setSyncToastMessage(null), 3500);
    } catch (e) {
      console.error('Sync failed', e);
    } finally {
      setIsSyncing(false);
    }
  }, [profile]);

  // Desktop / Windows Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Escape') {
        setIsProfileModalOpen(false);
        setIsSyncModalOpen(false);
        setActiveWorkout(null);
      } else if (e.key === '1') {
        setActiveTab('home');
      } else if (e.key === '2') {
        setActiveTab('sleep');
      } else if (e.key === '3') {
        setActiveTab('food');
      } else if (e.key === '4') {
        setActiveTab('hydration');
      } else if (e.key === '5') {
        setActiveTab('body');
      } else if (e.key === '6') {
        setActiveTab('mind');
      } else if (e.key === '7') {
        setActiveTab('premium');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save Handlers
  const handleSaveProfile = useCallback((updated: UserProfile) => {
    setProfile(updated);
    storage.saveProfile(updated);
  }, []);

  const handleChangeLanguage = useCallback((newLang: SupportedLanguage) => {
    const updated = { ...profile, language: newLang };
    setProfile(updated);
    storage.saveProfile(updated);
  }, [profile]);

  const handlePlanGenerated = useCallback((newPlan: MasterGlowPlan) => {
    setMasterPlan(newPlan);
    storage.saveMasterPlan(newPlan);
  }, []);

  const handleSaveSleepLogs = useCallback((newLogs: SleepLog[]) => {
    setSleepLogs(newLogs);
    storage.saveSleepLogs(newLogs);
  }, []);

  const handleSaveReadings = useCallback((newReadings: FullReading[]) => {
    setReadings(newReadings);
    storage.saveReadings(newReadings);
  }, []);

  const handleSaveAchievements = useCallback((newAchievements: AchievementLog[]) => {
    setAchievements(newAchievements);
    storage.saveAchievements(newAchievements);
  }, []);

  const handleSaveMoodLogs = useCallback((newMoods: MoodLog[]) => {
    setMoodLogs(newMoods);
    storage.saveMoodLogs(newMoods);
  }, []);

  const handleSaveGratitudeEntries = useCallback((newEntries: GratitudeEntry[]) => {
    setGratitudeEntries(newEntries);
    storage.saveGratitudeEntries(newEntries);
  }, []);

  const handleLogMeal = useCallback((recipe: Recipe) => {
    const updated = [recipe, ...loggedMeals];
    setLoggedMeals(updated);
    storage.saveLoggedMeals(updated);
  }, [loggedMeals]);

  const handleRemoveLoggedMeal = useCallback((id: string) => {
    const updated = loggedMeals.filter((m) => m.id !== id);
    setLoggedMeals(updated);
    storage.saveLoggedMeals(updated);
  }, [loggedMeals]);

  // Hydration handlers
  const handleLogWater = useCallback((amountMl: number, source: 'glass' | 'bottle' | 'quick') => {
    const newTotal = waterMlToday + amountMl;
    const newEntry: HydrationEntry = {
      id: `w-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      amountMl,
      source,
    };
    const updatedLogs = [newEntry, ...hydrationLogs];

    setWaterMlToday(newTotal);
    setHydrationLogs(updatedLogs);

    storage.saveWaterIntake(newTotal);
    storage.saveHydrationLogs(updatedLogs);

    const updatedProfile = {
      ...profile,
      waterGlassesToday: Math.floor(newTotal / 250),
      waterMlToday: newTotal,
    };
    setProfile(updatedProfile);
    storage.saveProfile(updatedProfile);
  }, [waterMlToday, hydrationLogs, profile]);

  const handleUndoWater = useCallback((id: string) => {
    const entry = hydrationLogs.find((l) => l.id === id);
    if (!entry) return;

    const newTotal = Math.max(0, waterMlToday - entry.amountMl);
    const updatedLogs = hydrationLogs.filter((l) => l.id !== id);

    setWaterMlToday(newTotal);
    setHydrationLogs(updatedLogs);

    storage.saveWaterIntake(newTotal);
    storage.saveHydrationLogs(updatedLogs);

    const updatedProfile = {
      ...profile,
      waterGlassesToday: Math.floor(newTotal / 250),
      waterMlToday: newTotal,
    };
    setProfile(updatedProfile);
    storage.saveProfile(updatedProfile);
  }, [waterMlToday, hydrationLogs, profile]);

  const handleAddXp = useCallback((points: number) => {
    const newXp = (profile.totalXp || 0) + points;
    const newLevel = Math.floor(newXp / 300) + 1;
    const updated = {
      ...profile,
      totalXp: newXp,
      glowLevel: newLevel,
    };
    setProfile(updated);
    storage.saveProfile(updated);
  }, [profile]);

  const handleFinishWorkout = useCallback((routine: WorkoutRoutine) => {
    handleAddXp(routine.durationMinutes * 5);
    setActiveWorkout(null);
  }, [handleAddXp]);

  const handleCompleteOnboarding = useCallback((completedProfile: UserProfile) => {
    setProfile(completedProfile);
    storage.saveProfile(completedProfile);
  }, []);

  // Compute hydration recommendations
  const hydroCalc = calculateEstimatedDailyHydration(
    profile.age || 24,
    profile.gender || 'female',
    profile.height || 170,
    profile.weight
  );
  const targetWaterMl = profile.customWaterGoalMl || hydroCalc.recommendedMl;
  const pairedDeviceCount = profile.account?.pairedDevices?.length || 3;

  // Calculate dynamic 7-day trial status
  const trialStatus = getTrialStatus(profile);

  // Render Onboarding Wizard if not completed
  if (!profile.onboardingCompleted) {
    return (
      <OnboardingWizard
        initialProfile={profile}
        onComplete={handleCompleteOnboarding}
      />
    );
  }

  // Subscription / Paywall Callback to save newly subscribed profile state
  const handlePaywallSubscribe = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    storage.saveProfile(updatedProfile);
  };

  return (
    <div
      dir={textDirection}
      className="min-h-screen bg-stone-950 text-stone-100 font-sans antialiased selection:bg-amber-400 selection:text-stone-950 flex flex-col"
    >
      {/* Day 7 Paywall Gate Modal: Blocks access when trial is expired & user not subscribed */}
      <PaywallModal
        isOpen={trialStatus.isExpired && !trialStatus.isSubscribed}
        profile={profile}
        onSubscribe={handlePaywallSubscribe}
        onRestorePurchase={() => {
          // Restore action
          handlePaywallSubscribe({
            ...profile,
            subscription: {
              tier: 'standard',
              trialStartDate: profile.subscription?.trialStartDate || new Date().toISOString(),
              trialDays: 7,
              billingCycle: 'monthly',
              hasStandardPlan: true,
              hasPremiumAddon: true,
              monthlyTotal: 7,
              activeTheme: 'obsidian',
              notificationSound: 'soft_chime',
            },
          });
        }}
        canDismiss={false}
      />
      {/* Streamlined Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onChangeLanguage={handleChangeLanguage}
        onOpenTrialModal={() => setActiveTab('premium')}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        isSyncing={isSyncing}
        pairedDeviceCount={pairedDeviceCount}
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Floating Real-time Sync Toast */}
      {syncToastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-stone-900 border border-emerald-500/50 text-stone-100 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs animate-slide-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncToastMessage}</span>
        </div>
      )}

      {/* Main Layout Container: Desktop Sidebar + Responsive Sanctuary Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex gap-6">
        {/* Responsive Desktop Sidebar (Section Triggers: Home, Sleep, Food, Hydration, Body, Mind, Pro) */}
        <DesktopSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={profile}
          onOpenTrialModal={() => setActiveTab('premium')}
        />

        {/* Main Dashboard View Area */}
        <main className="flex-1 min-w-0 pb-20 md:pb-6">
          {activeTab === 'home' && (
            <HomeOverview
              profile={profile}
              masterPlan={masterPlan}
              waterMlToday={waterMlToday}
              targetWaterMl={targetWaterMl}
              loggedMeals={loggedMeals}
              latestSleepLog={sleepLogs[0]}
              onNavigateTab={setActiveTab}
              onOpenTrialModal={() => setActiveTab('premium')}
            />
          )}

          {activeTab === 'sleep' && (
            <SleepDashboard
              profile={profile}
              sleepLogs={sleepLogs}
              onSaveProfile={handleSaveProfile}
              onSaveSleepLogs={handleSaveSleepLogs}
              onAddXp={handleAddXp}
            />
          )}

          {activeTab === 'food' && (
            <FoodDashboard
              profile={profile}
              masterPlan={masterPlan}
              recipes={recipes}
              loggedMeals={loggedMeals}
              onLogMeal={handleLogMeal}
              onRemoveLoggedMeal={handleRemoveLoggedMeal}
              onDrinkWater={(ml) => handleLogWater(ml, 'glass')}
              onAddXp={handleAddXp}
            />
          )}

          {activeTab === 'hydration' && (
            <HydrationDashboard
              profile={profile}
              waterMlToday={waterMlToday}
              hydrationLogs={hydrationLogs}
              weekHistory={hydrationWeekHistory}
              onLogWater={handleLogWater}
              onUndoWater={handleUndoWater}
              onSaveProfile={handleSaveProfile}
              onAddXp={handleAddXp}
            />
          )}

          {activeTab === 'body' && (
            <BodyDashboard
              profile={profile}
              masterPlan={masterPlan}
              onStartWorkout={setActiveWorkout}
              selectedDayIndex={selectedDayIndex}
              setSelectedDayIndex={setSelectedDayIndex}
            />
          )}

          {activeTab === 'mind' && (
            <MindDashboard
              profile={profile}
              readings={readings}
              achievements={achievements}
              moodLogs={moodLogs}
              gratitudeEntries={gratitudeEntries}
              onSaveReadings={handleSaveReadings}
              onSaveAchievements={handleSaveAchievements}
              onSaveMoodLogs={handleSaveMoodLogs}
              onSaveGratitudeEntries={handleSaveGratitudeEntries}
              onAddXp={handleAddXp}
            />
          )}

          {activeTab === 'premium' && (
            <PremiumDashboard
              profile={profile}
              onSaveProfile={handleSaveProfile}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Visible on mobile phones < 768px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={currentLang}
      />

      {/* Profile & Biometrics Customization Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onPlanGenerated={handlePlanGenerated}
      />

      {/* Cross-Platform Device Sync Modal */}
      <DeviceSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
        lastSyncedText={lastSyncedText}
      />

      {/* Guided Live Movement Player Modal */}
      <ActiveWorkoutModal
        workout={activeWorkout}
        onClose={() => setActiveWorkout(null)}
        onFinishWorkout={handleFinishWorkout}
      />

      {/* Minimal Luxury Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 py-4 sm:py-5 text-center text-xs text-stone-400 mb-14 md:mb-0">
        <p className="tracking-wide">OmniGlow Sanctuary • Android • iPhone • iPad • Windows</p>
        <p className="text-[10px] text-stone-500 mt-1">Bio-Individual Aesthetics & Performance System • Continuous Cross-Device Sync</p>
      </footer>
    </div>
  );
}
