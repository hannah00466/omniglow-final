import { UserProfile, UserSubscription } from '../types';

export interface TrialStatus {
  isExpired: boolean;
  daysUsed: number;
  currentDay: number;
  daysRemaining: number;
  isSubscribed: boolean;
  tier: UserSubscription['tier'];
}

/**
 * Calculates the current trial status based on the user's profile and trial start date.
 * - Day 1 to Day 6: Full unrestricted access.
 * - Day 7 and beyond: Paywall gate triggers unless the user has an active standard/premium subscription.
 */
export function getTrialStatus(profile: UserProfile): TrialStatus {
  const sub = profile.subscription;
  
  // If user has subscribed or unlocked via purchase
  if (sub?.hasStandardPlan || sub?.hasPremiumAddon || sub?.tier === 'standard' || sub?.tier === 'premium') {
    return {
      isExpired: false,
      daysUsed: 7,
      currentDay: 7,
      daysRemaining: 0,
      isSubscribed: true,
      tier: sub.tier,
    };
  }

  // Determine start date
  const startDateStr = sub?.trialStartDate || profile.account?.lastSyncedAt;
  const startTime = startDateStr ? new Date(startDateStr).getTime() : Date.now();
  const now = Date.now();
  
  // Calculate elapsed days (1-indexed: Day 1 starts immediately, Day 2 after 24h, etc.)
  const elapsedMs = Math.max(0, now - startTime);
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysElapsed = Math.floor(elapsedMs / msPerDay);
  const currentDay = Math.min(daysElapsed + 1, 8); // e.g. Day 1, Day 2 ... Day 7+
  
  // Day 1 to Day 6 = Free trial active
  // Day 7 and beyond = Expired / Paywall gate
  const isExpired = currentDay >= 7;
  const daysRemaining = Math.max(0, 7 - currentDay);

  return {
    isExpired,
    daysUsed: Math.min(currentDay, 7),
    currentDay,
    daysRemaining,
    isSubscribed: false,
    tier: 'trial',
  };
}
