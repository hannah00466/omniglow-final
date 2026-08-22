import React from 'react';
import {
  Moon,
  Apple,
  Droplets,
  Activity,
  Brain,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Clock,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { UserProfile, MasterGlowPlan, Recipe, SleepLog } from '../types';
import { getTranslation } from '../utils/translations';
import { getTrialStatus } from '../utils/trialTracker';
import { MainSectionTab } from './Header';

interface HomeOverviewProps {
  profile: UserProfile;
  masterPlan: MasterGlowPlan;
  waterMlToday: number;
  targetWaterMl: number;
  loggedMeals: Recipe[];
  latestSleepLog?: SleepLog;
  onNavigateTab: (tab: MainSectionTab) => void;
  onOpenTrialModal: () => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  profile,
  masterPlan,
  waterMlToday,
  targetWaterMl,
  loggedMeals,
  latestSleepLog,
  onNavigateTab,
  onOpenTrialModal,
}) => {
  const lang = profile.language || 'en';
  const isRtl = lang === 'ar';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);
  const trialStatus = getTrialStatus(profile);

  const caloriesConsumed = loggedMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
  const targetCalories = masterPlan.targetCalories || 2100;
  const hydrationPct = Math.min(100, Math.round((waterMlToday / targetWaterMl) * 100));

  const sleepHours = latestSleepLog ? latestSleepLog.hoursSlept : (profile.sleepProfile ? 7.5 : 8);
  const targetSleep = 8;

  // Daily Intention
  const dailyIntention = {
    quote: isRtl
      ? "العافية الحقيقية تنبع من خطوات يومية بسيطة، متسقة، وتناغم هادئ مع إيقاعك الحيوي."
      : "True wellness is found in small, consistent acts of self-care and quiet rhythms.",
  };

  const pillars = [
    {
      id: 'sleep' as MainSectionTab,
      name: isRtl ? 'ملاذ النوم' : 'Sleep Sanctuary',
      icon: Moon,
      color: 'text-indigo-400',
      bg: 'bg-indigo-950/40 border-indigo-800/40',
      value: isRtl ? `${sleepHours} س` : `${sleepHours}h`,
      label: isRtl ? `الهدف ${targetSleep}.0 س راحة` : `Target ${targetSleep}.0h rest`,
      progress: Math.min(100, Math.round((sleepHours / targetSleep) * 100)),
      sub: isRtl ? 'توافق الإيقاع الحيوي' : 'Gradual rhythm alignment',
    },
    {
      id: 'food' as MainSectionTab,
      name: isRtl ? 'التغذية والوجبات' : 'Nourishment',
      icon: Apple,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/40 border-emerald-800/40',
      value: isRtl ? `${caloriesConsumed} سعرة` : `${caloriesConsumed} kcal`,
      label: isRtl ? `الهدف ${targetCalories} سعرة` : `Goal ${targetCalories} kcal`,
      progress: Math.min(100, Math.round((caloriesConsumed / targetCalories) * 100)),
      sub: isRtl ? `تم تسجيل ${loggedMeals.length} وجبة` : `${loggedMeals.length} balanced meals logged`,
    },
    {
      id: 'hydration' as MainSectionTab,
      name: isRtl ? 'الترطيب وشرب الماء' : 'Hydration',
      icon: Droplets,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/40 border-cyan-800/40',
      value: isRtl ? `${waterMlToday} مل` : `${waterMlToday} ml`,
      label: isRtl ? `الهدف ${targetWaterMl} مل` : `Goal ${targetWaterMl} ml`,
      progress: hydrationPct,
      sub: isRtl ? 'تتبع مجاني دائم' : 'Free Lifetime Tracking',
    },
    {
      id: 'body' as MainSectionTab,
      name: isRtl ? 'الجسد والقوام' : 'Body & Movement',
      icon: Activity,
      color: 'text-amber-400',
      bg: 'bg-amber-950/40 border-amber-800/40',
      value: isRtl ? 'الجلسة اليومية' : 'Daily Session',
      label: isRtl ? 'استقامة القوام والمرونة' : 'Posture & Mobility',
      progress: 75,
      sub: isRtl ? 'روتين مخصص للملامح والقوام' : 'Gentle restorative routine',
    },
    {
      id: 'mind' as MainSectionTab,
      name: isRtl ? 'العقل والتنفس' : 'Mind & Breath',
      icon: Brain,
      color: 'text-rose-400',
      bg: 'bg-rose-950/40 border-rose-800/40',
      value: isRtl ? 'مزاج هادئ' : 'Serene Mood',
      label: isRtl ? 'تنفس الصندوق ٤-٤-٤-٤' : 'Box Breathing 4-4-4-4',
      progress: 85,
      sub: isRtl ? 'تأمل واستقرار ذهني' : '10-min reflection & calm',
    },
  ];

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6 max-w-5xl mx-auto">
      {/* Top Greeting & Daily Intention Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 border border-stone-800 p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-left rtl:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-700/40 text-amber-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isRtl ? 'إيقاع ملاذك اليومي' : "Today's Sanctuary Rhythm"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              {isRtl ? 'أهلاً بك في ملاذك اليومي' : 'Welcome to your daily sanctuary'}
            </h1>
            <p className="text-sm text-stone-300 italic font-serif leading-relaxed">
              "{dailyIntention.quote}"
            </p>
          </div>

          {/* Quick Streak & Trial Card */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <div className="bg-stone-950/80 border border-stone-800 px-4 py-3 rounded-xl flex items-center gap-3">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div className="text-left rtl:text-right">
                <div className="text-xs text-stone-400 font-medium">{isRtl ? 'أيام متتالية' : 'Day Streak'}</div>
                <div className="text-sm font-bold text-stone-100 font-mono">
                  {isRtl ? `${profile.glowStreak || 1} أيام نشطة` : `${profile.glowStreak || 1} Days Active`}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenTrialModal}
              className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-left rtl:text-right transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                {trialStatus.isSubscribed ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Crown className="w-4 h-4 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                )}
                <div>
                  <div className="text-xs font-bold text-amber-200">
                    {trialStatus.isSubscribed
                      ? isRtl
                        ? 'عضوية أومني جلو برو'
                        : 'OmniGlow Pro'
                      : isRtl
                      ? `اليوم ${trialStatus.currentDay} من 7 (فترة تجريبية)`
                      : `Trial Day ${trialStatus.currentDay} of 7`}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    {trialStatus.isSubscribed
                      ? isRtl
                        ? 'الوصول الكامل مفعل'
                        : 'Full Access Unlocked'
                      : isRtl
                      ? `متبقي ${trialStatus.daysRemaining} أيام مجانية`
                      : `${trialStatus.daysRemaining} days remaining`}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Distinct Pillar Overview Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-serif font-semibold text-stone-100">
            {isRtl ? 'تقدم الركائز اليومية' : "Today's Pillar Progress"}
          </h2>
          <span className="text-xs text-stone-400">
            {isRtl ? 'انقر على أي ركيزة للانتقال' : 'Select any section to focus'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                onClick={() => onNavigateTab(pillar.id)}
                className="bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl p-5 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 text-left rtl:text-right">
                    <div className={`p-2.5 rounded-xl border ${pillar.bg}`}>
                      <Icon className={`w-5 h-5 ${pillar.color}`} />
                    </div>
                    <div>
                      <h3 className="font-serif font-semibold text-stone-100 text-sm group-hover:text-amber-200 transition-colors">
                        {pillar.name}
                      </h3>
                      <p className="text-[11px] text-stone-400">{pillar.sub}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-stone-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 rtl:rotate-180 transition-all shrink-0" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-mono font-bold text-stone-200 text-base">{pillar.value}</span>
                    <span className="text-stone-400 text-[11px]">{pillar.label}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                    <div
                      className="h-full bg-stone-300 group-hover:bg-amber-300 rounded-full transition-all duration-500"
                      style={{ width: `${pillar.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Routine Highlights: Morning -> Afternoon -> Evening */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-semibold text-stone-100 text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{isRtl ? 'التدفق المتوازن لليوم' : "Today's Balanced Flow"}</span>
          </h2>
          <span className="text-xs text-stone-400">
            {isRtl ? 'تسلسل يومي متكامل' : 'Restorative Daily Sequence'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-950 border border-stone-800/80 rounded-xl p-4 space-y-2 text-left rtl:text-right">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-200">{isRtl ? 'تدفق الصباح' : 'Morning Flow'}</span>
              <span className="text-[11px] font-mono text-cyan-400">07:00 – 09:00</span>
            </div>
            <ul className="text-xs text-stone-400 space-y-1">
              <li className="flex items-center gap-1.5 text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{isRtl ? 'شرب 500 مل ماء لإنعاش الجسم' : '500ml Hydration kickstart'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                <span>{isRtl ? '15 دقيقة تمارين استقامة وقوام' : '15-min Posture mobility'}</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-950 border border-stone-800/80 rounded-xl p-4 space-y-2 text-left rtl:text-right">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-200">{isRtl ? 'حيوية منتصف اليوم' : 'Afternoon Vitality'}</span>
              <span className="text-[11px] font-mono text-emerald-400">12:30 – 14:00</span>
            </div>
            <ul className="text-xs text-stone-400 space-y-1">
              <li className="flex items-center gap-1.5 text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{isRtl ? 'وجبة متوازنة غنية بالعناصر الطبيعية' : 'Balanced whole nourishment'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                <span>{isRtl ? 'تجديد الترطيب اليومي' : 'Mid-day hydration refill'}</span>
              </li>
            </ul>
          </div>

          <div className="bg-stone-950 border border-stone-800/80 rounded-xl p-4 space-y-2 text-left rtl:text-right">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-200">{isRtl ? 'ملاذ المساء' : 'Evening Sanctuary'}</span>
              <span className="text-[11px] font-mono text-indigo-400">21:30 – 22:30</span>
            </div>
            <ul className="text-xs text-stone-400 space-y-1">
              <li className="flex items-center gap-1.5 text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{isRtl ? 'وقت خالٍ من الشاشات للاسترخاء' : 'Screen-free wind-down'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-stone-600 shrink-0" />
                <span>{isRtl ? 'تمرين تنفس ٤-٧-٨ الهادئ' : '4-7-8 Soothing breathwork'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
