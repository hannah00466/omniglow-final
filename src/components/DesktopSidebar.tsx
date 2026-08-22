import React from 'react';
import {
  Home,
  Moon,
  Apple,
  Droplets,
  Activity,
  Brain,
  Crown,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { MainSectionTab } from './Header';
import { UserProfile } from '../types';
import { getTranslation } from '../utils/translations';
import { getTrialStatus } from '../utils/trialTracker';

interface DesktopSidebarProps {
  activeTab: MainSectionTab;
  setActiveTab: (tab: MainSectionTab) => void;
  profile: UserProfile;
  onOpenTrialModal: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenTrialModal,
}) => {
  const lang = profile.language || 'en';
  const isRtl = lang === 'ar';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);
  const trialStatus = getTrialStatus(profile);

  const navSections: {
    id: MainSectionTab;
    label: string;
    labelAr: string;
    description: string;
    descriptionAr: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
    hotkey: string;
    colorClass: string;
  }[] = [
    {
      id: 'home',
      label: 'Home Sanctuary',
      labelAr: 'الرئيسية والملاذ',
      description: 'Daily overview & rituals',
      descriptionAr: 'نظرة عامة والطقوس اليومية',
      icon: Home,
      hotkey: '1',
      colorClass: 'text-amber-400',
    },
    {
      id: 'sleep',
      label: 'Sleep & Circadian',
      labelAr: 'النوم والإيقاع الحيوي',
      description: 'Rest & melatonin rhythm',
      descriptionAr: 'الراحة وإفراز الميلاتونين',
      icon: Moon,
      hotkey: '2',
      colorClass: 'text-indigo-400',
    },
    {
      id: 'food',
      label: 'Food & Nutrition',
      labelAr: 'الغذاء والتغذية',
      description: 'Anti-inflammatory meals',
      descriptionAr: 'أطعمة مضادة للالتهاب',
      icon: Apple,
      hotkey: '3',
      colorClass: 'text-emerald-400',
    },
    {
      id: 'hydration',
      label: 'Hydration Tracker',
      labelAr: 'سجل شرب الماء',
      description: 'Cellular radiance',
      descriptionAr: 'ترطيب ونضارة الخلايا',
      icon: Droplets,
      badge: isRtl ? 'مجاني' : 'Free',
      hotkey: '4',
      colorClass: 'text-cyan-400',
    },
    {
      id: 'body',
      label: 'Body & Movement',
      labelAr: 'الجسد والحركة',
      description: 'Posture, neck & kinetics',
      descriptionAr: 'استقامة القوام والرقبة',
      icon: Activity,
      hotkey: '5',
      colorClass: 'text-rose-400',
    },
    {
      id: 'mind',
      label: 'Mind & Serenity',
      labelAr: 'العقل والسكينة',
      description: 'Breathwork & reflection',
      descriptionAr: 'تمارين التنفس والتأمل',
      icon: Brain,
      hotkey: '6',
      colorClass: 'text-purple-400',
    },
    {
      id: 'premium',
      label: 'OmniGlow Pro',
      labelAr: 'أومني جلو برو',
      description: 'Full aesthetic analytics',
      descriptionAr: 'تحليل الملامح المتقدم',
      icon: Crown,
      badge: '$7/mo',
      hotkey: '7',
      colorClass: 'text-amber-300',
    },
  ];

  return (
    <aside
      aria-label="Desktop Navigation Sidebar"
      className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 py-4 pe-4 space-y-5 select-none"
    >
      {/* Navigation List */}
      <nav className="space-y-1.5 bg-stone-900/60 p-2.5 rounded-3xl border border-stone-850 shadow-lg backdrop-blur-sm">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-stone-400">
          {isRtl ? 'أقسام الملاذ' : 'Sanctuary Pillars'}
        </div>

        {navSections.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group text-left rtl:text-right ${
                isActive
                  ? 'bg-stone-100 text-stone-950 font-bold shadow-md ring-1 ring-stone-300/40'
                  : 'text-stone-300 hover:text-stone-100 hover:bg-stone-850/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2 rounded-xl transition-transform group-hover:scale-105 shrink-0 ${
                    isActive
                      ? 'bg-stone-950 text-amber-400'
                      : 'bg-stone-950/80 border border-stone-800 text-stone-400 group-hover:text-stone-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : item.colorClass}`} />
                </div>
                <div className="truncate">
                  <div
                    className={`text-xs truncate ${
                      isActive ? 'text-stone-950 font-bold' : 'text-stone-200 font-semibold'
                    }`}
                  >
                    {isRtl ? item.labelAr : item.label}
                  </div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-stone-600 font-medium' : 'text-stone-400'
                    }`}
                  >
                    {isRtl ? item.descriptionAr : item.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ms-2">
                {item.badge && !isActive && (
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
                    {item.badge}
                  </span>
                )}
                <kbd
                  className={`text-[9px] font-mono px-1 py-0.5 rounded opacity-50 group-hover:opacity-100 hidden lg:inline-block ${
                    isActive ? 'bg-stone-300 text-stone-950' : 'bg-stone-950 text-stone-400 border border-stone-800'
                  }`}
                >
                  {item.hotkey}
                </kbd>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Pro Membership / Trial Banner */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/30 space-y-2.5 shadow-md">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
          {trialStatus.isSubscribed ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isRtl ? 'عضوية أومني جلو برو مفعلة' : 'OmniGlow Pro Active'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>
                {isRtl
                  ? `فترة تجريبية مجانية (اليوم ${trialStatus.currentDay}/7)`
                  : `Free Trial (Day ${trialStatus.currentDay} of 7)`}
              </span>
            </>
          )}
        </div>
        <p className="text-[11px] text-stone-400 leading-relaxed">
          {trialStatus.isSubscribed
            ? isRtl
              ? 'تمتع بالوصول غير المحدود لجميع ميزات التحليل والمزامنة السحابية.'
              : 'Unlimited access unlocked for all analytics, circadian timing & cross-device sync.'
            : isRtl
            ? `متبقي ${trialStatus.daysRemaining} أيام على الفترة التجريبية المجانية لجميع ميزات التطبيق.`
            : `${trialStatus.daysRemaining} days remaining of unrestricted access across all sanctuary pillars.`}
        </p>
        <button
          type="button"
          onClick={onOpenTrialModal}
          className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>
            {trialStatus.isSubscribed
              ? isRtl
                ? 'إدارة الاشتراك'
                : 'Manage Membership'
              : isRtl
              ? 'ترقية إلى برو ($7/شهر)'
              : 'Upgrade to Pro ($7/mo)'}
          </span>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>
      </div>
    </aside>
  );
};
