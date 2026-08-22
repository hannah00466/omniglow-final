import {
  UserProfile,
  MasterGlowPlan,
  FullReading,
  AchievementLog,
  Recipe,
  GlowAudit,
  SleepLog,
  MoodLog,
  GratitudeEntry,
} from '../types';
import {
  DEFAULT_USER_PROFILE,
  DEFAULT_MASTER_PLAN,
  DEFAULT_READINGS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_SAMPLE_RECIPES,
  INITIAL_SAMPLE_AUDIT,
} from './defaults';

const STORAGE_KEYS = {
  PROFILE: 'lumina_glow_profile_v1',
  PLAN: 'lumina_glow_master_plan_v1',
  READINGS: 'lumina_glow_readings_v1',
  ACHIEVEMENTS: 'lumina_glow_achievements_v1',
  RECIPES: 'lumina_glow_recipes_v1',
  AUDITS: 'lumina_glow_audits_v1',
  BEFORE_IMG: 'lumina_glow_before_img_v1',
  AFTER_IMG: 'lumina_glow_after_img_v1',
  WATER_INTAKE: 'lumina_glow_water_intake_v1',
  LOGGED_MEALS_TODAY: 'lumina_glow_logged_meals_v1',
  SLEEP_LOGS: 'lumina_glow_sleep_logs_v1',
  MOOD_LOGS: 'lumina_glow_mood_logs_v1',
  GRATITUDE_ENTRIES: 'lumina_glow_gratitude_v1',
};

const DEFAULT_SLEEP_LOGS: SleepLog[] = [
  {
    id: 's-log-1',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    hoursSlept: 7.5,
    quality: 'good',
    bedtime: '23:30',
    wakeTime: '07:00',
    notes: 'Felt relaxed after reading and drinking chamomile.',
  },
  {
    id: 's-log-2',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    hoursSlept: 8.0,
    quality: 'excellent',
    bedtime: '23:15',
    wakeTime: '07:15',
    notes: 'Pitch black room with eye mask. Deep, uninterrupted sleep.',
  },
];

const DEFAULT_MOOD_LOGS: MoodLog[] = [
  {
    id: 'm-log-1',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    mood: 'calm',
    note: 'Centered and focused after 4-7-8 breathing practice.',
  },
];

const DEFAULT_GRATITUDE_ENTRIES: GratitudeEntry[] = [
  {
    id: 'g-1',
    date: new Date().toISOString().split('T')[0],
    text: 'Grateful for morning sunlight, calm breathing, and time to nourish my body.',
  },
];

export const storage = {
  loadProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!data) return DEFAULT_USER_PROFILE;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_USER_PROFILE,
        ...parsed,
        primaryGoals: parsed.primaryGoals || DEFAULT_USER_PROFILE.primaryGoals,
        concerns: parsed.concerns || DEFAULT_USER_PROFILE.concerns,
      };
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  },
  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  loadMasterPlan(): MasterGlowPlan {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAN);
      if (!data) return DEFAULT_MASTER_PLAN;
      const parsed = JSON.parse(data);
      if (!parsed || !Array.isArray(parsed.weeklyPlan) || parsed.weeklyPlan.length === 0) {
        return DEFAULT_MASTER_PLAN;
      }
      return {
        ...DEFAULT_MASTER_PLAN,
        ...parsed,
        weeklyPlan: parsed.weeklyPlan.map((d: any, idx: number) => {
          const defaultDay = DEFAULT_MASTER_PLAN.weeklyPlan[idx] || DEFAULT_MASTER_PLAN.weeklyPlan[0];
          return {
            ...defaultDay,
            ...d,
            workout: {
              ...defaultDay.workout,
              ...(d.workout || {}),
              exercises: d.workout?.exercises || defaultDay.workout.exercises || [],
            },
            dailySchedule: Array.isArray(d.dailySchedule) && d.dailySchedule.length > 0
              ? d.dailySchedule
              : defaultDay.dailySchedule,
            faceRoutine: {
              ...defaultDay.faceRoutine,
              ...(d.faceRoutine || {}),
            },
            readingSnippet: {
              ...defaultDay.readingSnippet,
              ...(d.readingSnippet || {}),
            },
          };
        }),
      };
    } catch {
      return DEFAULT_MASTER_PLAN;
    }
  },
  saveMasterPlan(plan: MasterGlowPlan): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(plan));
    } catch (e) {
      console.error('Failed to save plan', e);
    }
  },

  loadReadings(): FullReading[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.READINGS);
      return data ? JSON.parse(data) : DEFAULT_READINGS;
    } catch {
      return DEFAULT_READINGS;
    }
  },
  saveReadings(readings: FullReading[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.READINGS, JSON.stringify(readings));
    } catch (e) {
      console.error('Failed to save readings', e);
    }
  },

  loadAchievements(): AchievementLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return data ? JSON.parse(data) : INITIAL_ACHIEVEMENTS;
    } catch {
      return INITIAL_ACHIEVEMENTS;
    }
  },
  saveAchievements(achievements: AchievementLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (e) {
      console.error('Failed to save achievements', e);
    }
  },

  loadRecipes(): Recipe[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
      return data ? JSON.parse(data) : INITIAL_SAMPLE_RECIPES;
    } catch {
      return INITIAL_SAMPLE_RECIPES;
    }
  },
  saveRecipes(recipes: Recipe[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    } catch (e) {
      console.error('Failed to save recipes', e);
    }
  },

  loadAudits(): GlowAudit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDITS);
      return data ? JSON.parse(data) : [INITIAL_SAMPLE_AUDIT];
    } catch {
      return [INITIAL_SAMPLE_AUDIT];
    }
  },
  saveAudits(audits: GlowAudit[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
    } catch (e) {
      console.error('Failed to save audits', e);
    }
  },

  loadBeforeImage(): string | null {
    return localStorage.getItem(STORAGE_KEYS.BEFORE_IMG);
  },
  saveBeforeImage(dataUrl: string): void {
    localStorage.setItem(STORAGE_KEYS.BEFORE_IMG, dataUrl);
  },

  loadAfterImage(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AFTER_IMG);
  },
  saveAfterImage(dataUrl: string): void {
    localStorage.setItem(STORAGE_KEYS.AFTER_IMG, dataUrl);
  },

  loadWaterIntake(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WATER_INTAKE);
      return data ? Number(data) : 1250;
    } catch {
      return 1250;
    }
  },
  saveWaterIntake(ml: number): void {
    localStorage.setItem(STORAGE_KEYS.WATER_INTAKE, ml.toString());
  },

  loadHydrationLogs(): import('../types').HydrationEntry[] {
    try {
      const data = localStorage.getItem('lumina_glow_hydration_entries_v1');
      if (data) return JSON.parse(data);
      return [
        { id: 'h-1', timestamp: '08:15', amountMl: 500, type: 'bottle' },
        { id: 'h-2', timestamp: '11:30', amountMl: 250, type: 'glass' },
        { id: 'h-3', timestamp: '14:20', amountMl: 500, type: 'bottle' },
      ];
    } catch {
      return [];
    }
  },
  saveHydrationLogs(logs: import('../types').HydrationEntry[]): void {
    try {
      localStorage.setItem('lumina_glow_hydration_entries_v1', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save hydration logs', e);
    }
  },

  loadHydrationWeekHistory(): import('../types').DayHydrationRecord[] {
    try {
      const data = localStorage.getItem('lumina_glow_hydration_history_v1');
      if (data) return JSON.parse(data);
      return [
        { date: 'Mon', totalMl: 2250, targetMl: 2400, percentage: 94 },
        { date: 'Tue', totalMl: 2500, targetMl: 2400, percentage: 100 },
        { date: 'Wed', totalMl: 2100, targetMl: 2400, percentage: 87 },
        { date: 'Thu', totalMl: 2400, targetMl: 2400, percentage: 100 },
        { date: 'Fri', totalMl: 2350, targetMl: 2400, percentage: 98 },
        { date: 'Sat', totalMl: 2600, targetMl: 2400, percentage: 100 },
        { date: 'Sun', totalMl: 2250, targetMl: 2400, percentage: 94 },
      ];
    } catch {
      return [];
    }
  },
  saveHydrationWeekHistory(records: import('../types').DayHydrationRecord[]): void {
    try {
      localStorage.setItem('lumina_glow_hydration_history_v1', JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save hydration week history', e);
    }
  },

  loadLoggedMeals(): Recipe[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGGED_MEALS_TODAY);
      return data ? JSON.parse(data) : [INITIAL_SAMPLE_RECIPES[0]];
    } catch {
      return [INITIAL_SAMPLE_RECIPES[0]];
    }
  },
  saveLoggedMeals(meals: Recipe[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGGED_MEALS_TODAY, JSON.stringify(meals));
  },

  loadSleepLogs(): SleepLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SLEEP_LOGS);
      return data ? JSON.parse(data) : DEFAULT_SLEEP_LOGS;
    } catch {
      return DEFAULT_SLEEP_LOGS;
    }
  },
  saveSleepLogs(logs: SleepLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SLEEP_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save sleep logs', e);
    }
  },

  loadMoodLogs(): MoodLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOOD_LOGS);
      return data ? JSON.parse(data) : DEFAULT_MOOD_LOGS;
    } catch {
      return DEFAULT_MOOD_LOGS;
    }
  },
  saveMoodLogs(logs: MoodLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MOOD_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save mood logs', e);
    }
  },

  loadGratitudeEntries(): GratitudeEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GRATITUDE_ENTRIES);
      return data ? JSON.parse(data) : DEFAULT_GRATITUDE_ENTRIES;
    } catch {
      return DEFAULT_GRATITUDE_ENTRIES;
    }
  },
  saveGratitudeEntries(entries: GratitudeEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GRATITUDE_ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save gratitude entries', e);
    }
  },
};

export const Storage = storage;
