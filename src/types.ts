import { SupportedLanguage } from './utils/translations';

export type Gender = 'female' | 'male' | 'non-binary';

export interface HydrationEntry {
  id: string;
  timestamp: string;
  amountMl: number;
  type?: 'cup' | 'glass' | 'bottle' | 'flask' | 'custom' | 'quick';
  source?: 'cup' | 'glass' | 'bottle' | 'flask' | 'custom' | 'quick';
}

export interface DayHydrationRecord {
  date: string;
  totalMl: number;
  targetMl: number;
  percentage: number;
}

export interface SleepProfile {
  currentBedtime: string; // e.g. "01:00"
  targetBedtime: string;  // e.g. "22:30"
  wakeTime: string;       // e.g. "06:30"
  screenFreeMinutes: number; // e.g. 45
  gradualStepIndex: number; // 0, 1, 2...
  windDownCompletedToday?: boolean;
}

export interface SleepLog {
  id: string;
  date: string;
  hoursSlept: number;
  quality: 'excellent' | 'good' | 'fair' | 'restless';
  bedtime?: string;
  wakeTime?: string;
  notes?: string;
}

export interface MoodLog {
  id: string;
  timestamp: string;
  mood: 'calm' | 'grateful' | 'energetic' | 'reflective' | 'anxious' | 'tired';
  note?: string;
}

export interface GratitudeEntry {
  id: string;
  date: string;
  text: string;
}

export interface SmartReminder {
  id: string;
  title: string;
  category: 'water' | 'sleep' | 'food' | 'body' | 'mind' | 'routine';
  time: string;
  enabled: boolean;
  repeat: 'daily' | 'weekdays' | 'interval';
  soundStyle: 'soft_chime' | 'zen_bell' | 'gentle_pulse' | 'silent';
}

export interface UserSubscription {
  tier: 'free' | 'trial' | 'standard' | 'premium';
  trialStartDate: string; // ISO String
  trialDays: number; // 7-day free trial
  billingCycle: 'monthly';
  hasStandardPlan: boolean; // $7 / month recurring
  hasPremiumAddon: boolean; // +$4 / month recurring
  monthlyTotal: number; // e.g. 7, 4, or 11
  activeTheme: 'obsidian' | 'champagne' | 'sage' | 'midnight';
  notificationSound: 'soft_chime' | 'zen_bell' | 'gentle_pulse';
}

export interface SyncedDevice {
  id: string;
  name: string;
  platform: 'android' | 'ios' | 'windows' | 'mac' | 'web';
  lastActive: string;
  ipLocation?: string;
  isCurrent: boolean;
}

export interface UserAccount {
  accountId: string;
  email: string;
  name: string;
  syncPairCode: string; // e.g. "729-418"
  lastSyncedAt: string;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'pending';
  pairedDevices: SyncedDevice[];
  cloudBackupEnabled: boolean;
}

export interface FaceProfilePhotos {
  frontal?: string; // Data URL or Image string
  leftJawline?: string;
  rightJawline?: string;
}

export interface UserProfile {
  language: SupportedLanguage;
  gender: Gender;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  weightUnit: 'kg' | 'lbs';
  heightUnit: 'cm' | 'ft';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  activitySchedulePreference: string; // e.g. '07:30 AM' or '06:00 PM'
  primaryGoals: string[];
  dietaryPreference: string;
  concerns: string;
  avatarUrl?: string;
  facePhotos?: FaceProfilePhotos;
  onboardingCompleted?: boolean;
  goalCommitted?: boolean;
  glowStreak: number;
  totalXp: number;
  glowLevel?: number;
  themeMode?: 'dark' | 'light';
  waterGlassesToday?: number;
  waterMlToday?: number;
  customWaterGoalMl?: number;
  sleepProfile?: SleepProfile;
  subscription?: UserSubscription;
  reminders?: SmartReminder[];
  account?: UserAccount;
}

// Calculate estimated daily water target based on Age, Sex, Height, and Weight
export function calculateEstimatedDailyHydration(
  age: number,
  gender: Gender,
  heightCm: number,
  weightKg?: number
): {
  recommendedMl: number;
  glassesCount: number;
  explanation: string;
} {
  const estimatedMassKg = weightKg && weightKg >= 35 ? weightKg : Math.max(45, (heightCm - 100) * 0.9);
  
  let multiplier = 33;
  if (gender === 'male') multiplier = 35;
  else if (gender === 'female') multiplier = 31;
  else multiplier = 33;

  // Age factor
  let ageFactor = 1.0;
  if (age < 18) ageFactor = 1.05;
  else if (age > 60) ageFactor = 0.95;

  const rawMl = estimatedMassKg * multiplier * ageFactor;
  // Round to nearest 50ml, clamped gracefully between 1800 and 3800 ml
  const recommendedMl = Math.min(3800, Math.max(1800, Math.round(rawMl / 50) * 50));
  const glassesCount = Math.round(recommendedMl / 250);

  const explanation = `${gender.charAt(0).toUpperCase() + gender.slice(1)}, ${age}y, ${heightCm}cm (~${Math.round(estimatedMassKg)}kg metabolic estimate)`;

  return {
    recommendedMl,
    glassesCount,
    explanation,
  };
}

export interface ExerciseItem {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  formTip: string;
  category?: 'strength' | 'posture' | 'mobility' | 'cardio' | 'face_neck';
}

export interface WorkoutRoutine {
  title: string;
  scheduledTime: string;
  durationMinutes: number;
  caloriesBurned: number;
  isRestDay: boolean;
  focusArea?: string;
  exercises: ExerciseItem[];
}

export interface FaceRoutine {
  morning: string;
  evening: string;
}

export interface ScheduleEvent {
  time: string;
  category: 'body' | 'face' | 'nutrition' | 'mind';
  title: string;
  description: string;
  duration: number; // minutes
  completed?: boolean;
}

export interface ReadingSnippet {
  title: string;
  category: string;
  readTime: string;
  summary: string;
}

export interface DayPlan {
  dayNumber: number;
  dayName: string;
  focus: string;
  workout: WorkoutRoutine;
  faceRoutine: FaceRoutine;
  dailySchedule: ScheduleEvent[];
  readingSnippet: ReadingSnippet;
  dailyAchievementGoals: string[];
}

export interface MasterGlowPlan {
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  weeklyPlan: DayPlan[];
}

export interface Recipe {
  id: string;
  name: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  prepTimeMinutes: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  usedIngredients: string[];
  pantryAdditions: string[];
  instructions: string[];
  glowBenefit: string;
  boredomBusterTip: string;
  loggedAt?: string;
}

export interface FullReading {
  id: string;
  dayNumber: number;
  title: string;
  topic: string;
  estimatedReadMinutes: number;
  keyInsight: string;
  sections: {
    heading: string;
    content: string;
  }[];
  actionableTakeaways: string[];
  reflectionPrompt: string;
  completed?: boolean;
}

export interface AchievementLog {
  id: string;
  date: string;
  title: string;
  category: 'body' | 'face' | 'mind' | 'nutrition';
  note?: string;
  xpEarned: number;
  iconName?: string;
}

export interface GlowAudit {
  id: string;
  auditDate: string;
  beforeImage?: string;
  afterImage?: string;
  glowScore: number;
  potentialScore: number;
  faceAnalysis: {
    jawlineDefinition: string;
    skinClarity: string;
    eyeVitality: string;
    facialSymmetry: string;
    keyFaceTips: string[];
  };
  bodyAnalysis: {
    postureAlignment: string;
    compositionEstimate: string;
    neckShoulderTension: string;
    keyBodyTips: string[];
  };
  keyStrengths: string[];
  focusAreas: string[];
  postGlowProtocol: {
    nutritionSummary: string;
    workoutSummary: string;
    faceCareSummary: string;
    mindSummary: string;
  };
}
