import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  Sparkles,
  Bell,
  Moon,
  TrendingUp,
  Sliders,
  Palette,
  Volume2,
  Calendar,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  HelpCircle,
  CreditCard,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';
import { UserProfile, SmartReminder, UserSubscription } from '../types';
import { getTranslation } from '../utils/translations';

interface PremiumDashboardProps {
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
}

export const PremiumDashboard: React.FC<PremiumDashboardProps> = ({
  profile,
  onSaveProfile,
}) => {
  const lang = profile.language || 'en';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);

  const subscription: UserSubscription = profile.subscription || {
    tier: 'trial',
    trialStartDate: new Date().toISOString(),
    trialDays: 7,
    billingCycle: 'monthly',
    hasStandardPlan: true,
    hasPremiumAddon: true,
    monthlyTotal: 11,
    activeTheme: 'obsidian',
    notificationSound: 'soft_chime',
  };

  const [activeTheme, setActiveTheme] = useState(subscription.activeTheme || 'obsidian');
  const [activeSound, setActiveSound] = useState(subscription.notificationSound || 'soft_chime');
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'addon' | 'bundle'>('bundle');
  const [subscribedMessage, setSubscribedMessage] = useState<string | null>(null);

  // Smart Reminders State
  const defaultReminders: SmartReminder[] = [
    { id: 'r-water', title: 'Hydration Refresh', category: 'water', time: '09:00', enabled: true, repeat: 'interval', soundStyle: 'soft_chime' },
    { id: 'r-food', title: 'Mindful Whole Lunch', category: 'food', time: '13:00', enabled: true, repeat: 'daily', soundStyle: 'soft_chime' },
    { id: 'r-body', title: 'Posture & Mobility Break', category: 'body', time: '16:30', enabled: true, repeat: 'daily', soundStyle: 'zen_bell' },
    { id: 'r-winddown', title: 'Screen-Free Wind-Down', category: 'sleep', time: '21:45', enabled: true, repeat: 'daily', soundStyle: 'gentle_pulse' },
    { id: 'r-sleep', title: 'Target Bedtime Rest', category: 'sleep', time: '22:30', enabled: true, repeat: 'daily', soundStyle: 'soft_chime' },
    { id: 'r-mind', title: 'Evening Gratitude & Reflection', category: 'mind', time: '21:15', enabled: true, repeat: 'daily', soundStyle: 'zen_bell' },
  ];

  const [reminders, setReminders] = useState<SmartReminder[]>(profile.reminders || defaultReminders);

  const handleToggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setReminders(updated);
    onSaveProfile({ ...profile, reminders: updated });
  };

  const handleTimeChange = (id: string, newTime: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, time: newTime } : r));
    setReminders(updated);
    onSaveProfile({ ...profile, reminders: updated });
  };

  const handleSoundChange = (id: string, sound: SmartReminder['soundStyle']) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, soundStyle: sound } : r));
    setReminders(updated);
    onSaveProfile({ ...profile, reminders: updated });
  };

  const handleApplyTheme = (theme: UserSubscription['activeTheme']) => {
    setActiveTheme(theme);
    const updatedSub: UserSubscription = { ...subscription, activeTheme: theme };
    onSaveProfile({ ...profile, subscription: updatedSub });
  };

  const handleApplySound = (sound: UserSubscription['notificationSound']) => {
    setActiveSound(sound);
    const updatedSub: UserSubscription = { ...subscription, notificationSound: sound };
    onSaveProfile({ ...profile, subscription: updatedSub });
  };

  const handleSelectPlan = (plan: 'standard' | 'addon' | 'bundle') => {
    const monthlyPrice = plan === 'standard' ? 7 : plan === 'addon' ? 4 : 11;
    const planName = plan === 'standard' ? 'Standard Plan ($7 / month)' : plan === 'addon' ? 'Premium Add-on (+$4 / month)' : 'All-Inclusive Bundle ($11 / month)';
    
    const updatedSub: UserSubscription = {
      ...subscription,
      tier: 'premium',
      billingCycle: 'monthly',
      hasStandardPlan: plan === 'standard' || plan === 'bundle',
      hasPremiumAddon: plan === 'addon' || plan === 'bundle',
      monthlyTotal: monthlyPrice,
    };
    onSaveProfile({ ...profile, subscription: updatedSub });
    setSubscribedMessage(`7-Day Free Trial activated for ${planName}. Renews at $${monthlyPrice}/month after trial.`);
    setTimeout(() => setSubscribedMessage(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 7-Day Trial Hero Banner */}
      <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/60 border border-amber-600/40 text-amber-200 text-xs font-semibold">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>7-Day Free Trial Included</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
            Lumina Sanctuary Premium
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Experience complete unrestricted access to Smart Reminders, Gradual Sleep Realignment, Consistency Analytics, and Luxury Customization on all your Android, iOS, and Windows devices during your 7-day free trial.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 self-start md:self-auto shrink-0">
          <div className="flex items-center gap-3 bg-stone-950/90 border border-stone-800 px-4 py-3 rounded-xl">
            <Calendar className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Current Status</div>
              <div className="text-sm font-bold text-amber-200">7-Day Free Trial Active</div>
            </div>
          </div>
          <div className="text-[11px] text-stone-400 text-center md:text-right font-mono">
            Renews monthly after trial • Cancel anytime
          </div>
        </div>
      </div>

      {subscribedMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs sm:text-sm flex items-center gap-3 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{subscribedMessage}</span>
        </div>
      )}

      {/* Transparent Monthly Subscription Pricing Cards */}
      <div className="space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-100">
            Simple Monthly Subscriptions
          </h2>
          <p className="text-xs text-stone-400 max-w-lg mx-auto">
            Every plan starts with a <strong>7-Day Free Trial</strong>. After 7 days, your subscription renews automatically every month. Cancel anytime with zero fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Standard Plan $7 / month */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 hover:border-stone-700 transition-all shadow-md">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-semibold mb-1">
                    Core Sanctuary
                  </div>
                  <h3 className="font-serif font-bold text-xl text-stone-100">Standard Plan</h3>
                  <p className="text-xs text-stone-400">Essential structured guidance & tracking</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold text-stone-100">$7</div>
                  <div className="text-[11px] font-medium text-amber-300/90">/ month</div>
                </div>
              </div>

              {/* Free Trial Pill */}
              <div className="px-3 py-1.5 rounded-lg bg-stone-950 border border-stone-800 text-[11px] text-stone-300 flex items-center justify-between font-mono">
                <span>Free Trial Period:</span>
                <span className="font-bold text-emerald-400">7 Days Free ($0.00)</span>
              </div>

              <div className="border-t border-stone-800 pt-3">
                <div className="text-xs font-semibold text-stone-200 mb-2">Included in Standard ($7 / mo):</div>
                <ul className="space-y-2.5 text-xs text-stone-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Full Circadian Bedtime Realignment Plan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>7-Day Kinetic Posture & Mobility Workouts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Daily Meal Logging & Balanced Macro Insights</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Box Breathing & Evening Reflection Journal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Continuous Android, iPhone & Windows Sync</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-800/80">
              <button
                onClick={() => handleSelectPlan('standard')}
                className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-100 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border border-stone-700 hover:border-amber-500/40"
              >
                <span>Start 7-Day Free Trial ($7 / month)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="text-[10px] text-center text-stone-500 font-mono">
                Renews at $7/month after 7-day trial • Cancel anytime
              </div>
            </div>
          </div>

          {/* Card 2: Premium Add-on (+$4 / month) / Complete Bundle ($11 / month) */}
          <div className="bg-stone-900 border-2 border-amber-500/60 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-[10px] font-bold px-3.5 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
              All-Inclusive
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold mb-1">
                    Standard + Premium
                  </div>
                  <h3 className="font-serif font-bold text-xl text-stone-100">Sanctuary Bundle</h3>
                  <p className="text-xs text-amber-200/80">Standard ($7/mo) + Premium Add-on (+$4/mo)</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono font-bold text-amber-300">$11</div>
                  <div className="text-[11px] font-medium text-amber-400">/ month total</div>
                </div>
              </div>

              {/* Free Trial Pill */}
              <div className="px-3 py-1.5 rounded-lg bg-stone-950 border border-amber-500/30 text-[11px] text-stone-200 flex items-center justify-between font-mono">
                <span>Free Trial Period:</span>
                <span className="font-bold text-emerald-400">7 Days Free ($0.00)</span>
              </div>

              <div className="border-t border-stone-800 pt-3">
                <div className="text-xs font-semibold text-amber-200 mb-2">Everything in Standard plus Premium Add-on (+$4 / mo):</div>
                <ul className="space-y-2.5 text-xs text-stone-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Smart Multi-Category Reminders</strong> (Water, Meals, Sleep)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Advanced Consistency & Trend Analytics</strong> (Weekly & Monthly)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Combined Daily Routine Master Flow</strong> (Morning/Afternoon/Night)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Luxury Sanctuary Aesthetic Themes</strong> & Zen Sound Chimes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>Instant Cross-Device Priority Sync</strong> (Phone, Tablet, Desktop)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-stone-800/80">
              <button
                onClick={() => handleSelectPlan('bundle')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-stone-950" />
                <span>Start 7-Day Free Trial ($11 / month total)</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-950" />
              </button>
              <div className="text-[10px] text-center text-stone-400 font-mono">
                Renews at $11/month after 7-day trial • Includes Standard + Add-on
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Breakdown & Terms Transparency Box */}
      <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
        <div className="flex items-center gap-2 text-stone-200 font-semibold text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Subscription Transparency & Billing Guarantee</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-stone-400">
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-850 space-y-1">
            <div className="font-semibold text-stone-300">1. 7-Day Free Trial</div>
            <p className="leading-relaxed">Full access for 7 days at $0.00. No upfront charge during your trial period.</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-850 space-y-1">
            <div className="font-semibold text-stone-300">2. Monthly Renewal</div>
            <p className="leading-relaxed">After 7 days, renews at $7/month for Standard, or $11/month for the All-Inclusive bundle.</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-850 space-y-1">
            <div className="font-semibold text-stone-300">3. Cancel Anytime</div>
            <p className="leading-relaxed">Easily pause or cancel your recurring subscription anytime from your profile with one click.</p>
          </div>
        </div>
      </div>

      {/* Feature 1: Smart Reminders System */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-4">
          <div className="space-y-0.5">
            <h3 className="font-serif font-bold text-base text-stone-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" /> Smart Routine Reminders
            </h3>
            <p className="text-xs text-stone-400">
              Gentle prompts across your phone, tablet, and desktop for hydration, meals, wind-down, and sleep routines.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-950 border border-amber-700/50 text-amber-300 self-start sm:self-auto">
            Custom Times & Chimes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {reminders.map((r) => (
            <div
              key={r.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                r.enabled
                  ? 'bg-stone-950 border-stone-700/80 text-stone-100'
                  : 'bg-stone-950/50 border-stone-850 text-stone-500'
              }`}
            >
              <div className="space-y-1">
                <div className="text-xs font-semibold">{r.title}</div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={r.time}
                    onChange={(e) => handleTimeChange(r.id, e.target.value)}
                    className="bg-stone-900 border border-stone-700 text-stone-200 rounded px-1.5 py-0.5 text-[11px] font-mono focus:outline-none focus:border-amber-400"
                  />
                  <select
                    value={r.soundStyle}
                    onChange={(e) => handleSoundChange(r.id, e.target.value as SmartReminder['soundStyle'])}
                    className="bg-stone-900 border border-stone-700 text-stone-300 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                  >
                    <option value="soft_chime">Soft Chime</option>
                    <option value="zen_bell">Zen Bell</option>
                    <option value="gentle_pulse">Gentle Pulse</option>
                    <option value="silent">Silent Glow</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => handleToggleReminder(r.id)}
                className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 cursor-pointer shrink-0 ${
                  r.enabled ? 'bg-amber-500' : 'bg-stone-850 border border-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-stone-950 shadow-sm transition-transform ${
                    r.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Feature 2: Personalized Sleep Plan Realignment */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-base text-stone-100 flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" /> Personalized Gradual Sleep Plan
          </h3>
          <p className="text-xs text-stone-400">
            For users who sleep late (e.g. 1:00 AM), we gently move your target bedtime earlier in steady 15-minute milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-stone-950 border border-indigo-900/40 space-y-1">
            <div className="text-[10px] text-indigo-400 uppercase font-semibold">Stage 1 (Days 1–3)</div>
            <div className="text-sm font-mono font-bold text-stone-200">12:45 AM</div>
            <div className="text-[11px] text-stone-400">Gentle 15-min shift</div>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-indigo-900/40 space-y-1">
            <div className="text-[10px] text-indigo-400 uppercase font-semibold">Stage 2 (Days 4–7)</div>
            <div className="text-sm font-mono font-bold text-stone-200">12:30 AM</div>
            <div className="text-[11px] text-stone-400">Wind-down begins 21:45</div>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-indigo-900/40 space-y-1">
            <div className="text-[10px] text-indigo-400 uppercase font-semibold">Stage 3 (Days 8–11)</div>
            <div className="text-sm font-mono font-bold text-stone-200">12:00 AM</div>
            <div className="text-[11px] text-stone-400">Dimmed amber lighting</div>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-500/40 space-y-1">
            <div className="text-[10px] text-amber-300 uppercase font-semibold">Target Goal</div>
            <div className="text-sm font-mono font-bold text-amber-200">11:00 PM</div>
            <div className="text-[11px] text-stone-400">8.0 hrs restorative rest</div>
          </div>
        </div>
      </div>

      {/* Feature 3: Advanced Progress & Consistency Insights */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-serif font-bold text-base text-stone-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Advanced Consistency & Trends
            </h3>
            <p className="text-xs text-stone-400">Weekly and monthly metrics across all five pillars.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-1">
            <div className="text-[11px] text-stone-400">Sleep Consistency</div>
            <div className="text-lg font-mono font-bold text-indigo-300">92%</div>
            <div className="text-[10px] text-emerald-400">+5% vs last week</div>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-1">
            <div className="text-[11px] text-stone-400">Hydration Rate</div>
            <div className="text-lg font-mono font-bold text-cyan-300">88%</div>
            <div className="text-[10px] text-cyan-400">2,350 ml avg</div>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-1">
            <div className="text-[11px] text-stone-400">Movement Days</div>
            <div className="text-lg font-mono font-bold text-amber-300">6 / 7</div>
            <div className="text-[10px] text-amber-400">Posture & mobility</div>
          </div>
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-center space-y-1">
            <div className="text-[11px] text-stone-400">Calm Score</div>
            <div className="text-lg font-mono font-bold text-rose-300">8.4 / 10</div>
            <div className="text-[10px] text-rose-400">Mindful breathwork</div>
          </div>
        </div>
      </div>

      {/* Feature 4: Premium Aesthetic Customization */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-base text-stone-100 flex items-center gap-2">
            <Palette className="w-4 h-4 text-amber-400" /> Premium Sanctuary Themes
          </h3>
          <p className="text-xs text-stone-400">Choose your quiet luxury aesthetic atmosphere.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'obsidian' as const, name: 'Obsidian Noir', color: 'bg-stone-950 border-amber-500/40 text-amber-200' },
            { id: 'champagne' as const, name: 'Champagne Pearl', color: 'bg-stone-900 border-stone-600 text-stone-100' },
            { id: 'sage' as const, name: 'Sage Botanical', color: 'bg-emerald-950/80 border-emerald-700/50 text-emerald-200' },
            { id: 'midnight' as const, name: 'Midnight Indigo', color: 'bg-indigo-950/80 border-indigo-700/50 text-indigo-200' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleApplyTheme(theme.id)}
              className={`p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${theme.color} ${
                activeTheme === theme.id ? 'ring-2 ring-amber-400 shadow-md' : 'opacity-80 hover:opacity-100'
              }`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
