import React from 'react';
import {
  User,
  Globe,
  Flame,
  RefreshCw,
  Sun,
  Moon,
  Crown,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';
import { LuminaLogo } from './LuminaLogo';
import { getTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from '../utils/translations';
import { getTrialStatus } from '../utils/trialTracker';

export type MainSectionTab = 'home' | 'sleep' | 'food' | 'hydration' | 'body' | 'mind' | 'premium';

interface HeaderProps {
  activeTab: MainSectionTab;
  setActiveTab: (tab: MainSectionTab) => void;
  profile: UserProfile;
  onOpenProfile: () => void;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onOpenTrialModal: () => void;
  onOpenSyncModal: () => void;
  isSyncing: boolean;
  pairedDeviceCount?: number;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenProfile,
  onChangeLanguage,
  onOpenTrialModal,
  onOpenSyncModal,
  isSyncing,
  pairedDeviceCount = 3,
  themeMode = 'dark',
  onToggleTheme,
}) => {
  const lang = profile.language || 'en';
  const isRtl = lang === 'ar';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);
  const trialStatus = getTrialStatus(profile);

  return (
    <header className="sticky top-0 z-30 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Streamlined, Decluttered Navigation Header */}
        <div className="flex items-center justify-between py-3 gap-2">
          {/* Essential Branding / Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <LuminaLogo size="sm" showWordmark={true} />
          </div>

          {/* Essential Profile & Utility Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative flex items-center bg-stone-900 border border-stone-800 rounded-xl px-2 py-1.5 text-xs text-stone-300 hover:border-stone-700 transition-colors">
              <Globe className="w-3.5 h-3.5 text-stone-400 mr-1.5 shrink-0" />
              <select
                value={lang}
                onChange={(e) => onChangeLanguage(e.target.value as SupportedLanguage)}
                className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer pr-1 font-medium max-w-[80px] sm:max-w-none truncate"
                aria-label="Language selection"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-stone-900 text-stone-200">
                    {l.nativeName}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="flex items-center justify-center p-2 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-stone-100 text-xs transition-all cursor-pointer shadow-sm group"
                title={themeMode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle theme mode"
              >
                {themeMode === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
                )}
              </button>
            )}

            {/* Cross-Device Sync Indicator Pill */}
            <button
              onClick={onOpenSyncModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-stone-100 text-xs font-medium transition-all cursor-pointer group"
              title="Cross-Platform Device Synchronization (Android, iOS, Windows)"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  isSyncing ? 'animate-spin text-amber-400' : 'text-emerald-400 group-hover:rotate-180 transition-transform duration-500'
                }`}
              />
              <span className="font-mono text-[11px]">
                {isSyncing ? (isRtl ? 'جاري المزامنة...' : 'Syncing...') : `${pairedDeviceCount} ${isRtl ? 'أجهزة' : 'Devices'}`}
              </span>
            </button>

            {/* Trial Status Pill (Day 1-6 or Pro) */}
            <button
              onClick={onOpenTrialModal}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                trialStatus.isSubscribed
                  ? 'bg-amber-950/50 border-amber-500/40 text-amber-300 hover:bg-amber-900/50'
                  : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-300 hover:text-amber-300'
              }`}
              title="7-Day Free Trial & Membership"
            >
              {trialStatus.isSubscribed ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-[11px]">{isRtl ? 'برو' : 'Pro'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono text-[11px]">
                    {isRtl ? `اليوم ${trialStatus.currentDay}/7` : `Day ${trialStatus.currentDay}/7`}
                  </span>
                </>
              )}
            </button>

            {/* Streak Badge */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-900 border border-amber-500/30 text-amber-300 text-xs font-semibold"
              title="Daily Active Streak"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{profile.glowStreak || 1}d</span>
            </div>

            {/* Profile Trigger Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-850 text-stone-200 border border-stone-800 hover:border-amber-500/40 text-xs font-semibold transition-all cursor-pointer shadow-sm group"
              title="User Profile & Biometrics"
            >
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium text-xs text-stone-200">
                {isRtl ? 'الملف الشخصي' : 'Profile'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
