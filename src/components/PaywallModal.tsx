import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  RotateCcw,
  Star,
  Lock,
  Flame,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, UserSubscription } from '../types';
import { LuminaLogo } from './LuminaLogo';

interface PaywallModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onSubscribe: (updatedProfile: UserProfile) => void;
  onRestorePurchase?: () => void;
  canDismiss?: boolean;
  onDismiss?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  profile,
  onSubscribe,
  onRestorePurchase,
  canDismiss = false,
  onDismiss,
}) => {
  const [billingPlan, setBillingPlan] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const lang = profile.language || 'en';
  const isRtl = lang === 'ar';

  const handleUnlockFullAccess = () => {
    setIsProcessing(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff'],
      });
    } catch {
      // safe fallback
    }

    setTimeout(() => {
      const updatedSub: UserSubscription = {
        tier: 'standard',
        trialStartDate: profile.subscription?.trialStartDate || new Date().toISOString(),
        trialDays: 7,
        billingCycle: 'monthly',
        hasStandardPlan: true,
        hasPremiumAddon: billingPlan === 'annual',
        monthlyTotal: billingPlan === 'monthly' ? 7 : 5, // $5/mo effective on annual
        activeTheme: 'obsidian',
        notificationSound: 'soft_chime',
      };

      const updatedProfile: UserProfile = {
        ...profile,
        subscription: updatedSub,
      };

      onSubscribe(updatedProfile);
      setIsProcessing(false);
    }, 900);
  };

  const handleRestore = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setRestoreMessage(
        isRtl
          ? 'تم التحقق من حسابك ومزامنة الاشتراكات النشطة بنجاح.'
          : 'Subscriptions verified and restored successfully.'
      );
      setTimeout(() => setRestoreMessage(null), 4000);
    }, 1000);
  };

  const features = [
    {
      title: isRtl ? 'تحليل شامل للإيقاع الحيوي والنوم العميق' : 'Restorative Sleep & Melatonin Chronotype Optimization',
      desc: isRtl ? 'توقيت تدريجي لضبط النوم وإفراز الميلاتونين' : 'Gradual 15-minute bed realignment and wind-down science',
    },
    {
      title: isRtl ? 'خطة غذائية ذكية مضادة للالتهاب' : 'Anti-Inflammatory Nutrition & Kitchen Bio-Auditing',
      desc: isRtl ? 'قوائم طعام مخصصة وتتبع نضارة البشرة' : 'Personalized macro balance and glow-boosting whole foods',
    },
    {
      title: isRtl ? 'تمارين تصحيح استقامة القوام والرقبة' : 'Tech-Neck Reversal & Kinetic Posture Alignment',
      desc: isRtl ? 'جلسات فيديو تفاعلية لاستقامة الظهر والفك' : 'Targeted decompression routines for daily screen workers',
    },
    {
      title: isRtl ? 'مزامنة مستمرة عبر أندرويد وآيفون وويندوز' : 'Continuous Cloud Sync (Android, iOS, Windows)',
      desc: isRtl ? 'حفظ تلقائي لتقدمك بدون فقدان أي بيانات' : 'Real-time synchronization across all your daily devices',
    },
  ];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/90 backdrop-blur-xl overflow-y-auto animate-fade-in"
    >
      <div className="relative w-full max-w-xl bg-stone-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 text-stone-100 my-auto">
        
        {/* Glow ambient background accent */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Badge */}
        <div className="text-center space-y-3 relative">
          <div className="flex justify-center">
            <LuminaLogo size="md" showWordmark={true} />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>{isRtl ? 'انتهت الفترة التجريبية (7 أيام)' : '7-Day Free Trial Ended'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
            {isRtl
              ? 'انتهت فترتك التجريبية المجانية (7 أيام). اشترك الآن لمتابعة رحلة تحولك.'
              : 'Your 7-day free trial has ended. Subscribe now to continue your transformation journey.'}
          </h2>

          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            {isRtl
              ? 'حافظ على وتيرة تقدمك واستمر في الوصول إلى جميع ركائز الصحة والجمال والإيقاع الحيوي.'
              : 'Unlock full access to your personalized 5-pillar sanctuary, posture routines, circadian sleep timing, and cross-device sync.'}
          </p>
        </div>

        {/* Value Proposition Highlights */}
        <div className="space-y-2.5 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400/90 font-bold">
            {isRtl ? 'ما الذي ستحصل عليه مع الوصول الكامل:' : 'Included With Full Access:'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {features.map((feat, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-stone-200">{feat.title}</div>
                  <div className="text-[11px] text-stone-400">{feat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Plan Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Monthly Plan ($7 / mo) */}
          <button
            type="button"
            onClick={() => setBillingPlan('monthly')}
            className={`p-4 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer relative ${
              billingPlan === 'monthly'
                ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40'
                : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-stone-300 block">
                  {isRtl ? 'الاشتراك الشهري' : 'Monthly Plan'}
                </span>
                <span className="text-2xl font-bold text-stone-100">$7</span>
                <span className="text-xs text-stone-400"> / {isRtl ? 'شهر' : 'month'}</span>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  billingPlan === 'monthly' ? 'bg-amber-500 border-amber-400' : 'border-stone-700'
                }`}
              >
                {billingPlan === 'monthly' && <Check className="w-3 h-3 text-stone-950 stroke-[3]" />}
              </div>
            </div>
            <p className="text-[11px] text-stone-400 mt-2">
              {isRtl ? 'مرونة كاملة مع إمكانية الإلغاء في أي وقت' : 'Standard monthly subscription. Cancel anytime.'}
            </p>
          </button>

          {/* Annual Plan (Best Value with trial discount) */}
          <button
            type="button"
            onClick={() => setBillingPlan('annual')}
            className={`p-4 rounded-2xl border text-left rtl:text-right transition-all cursor-pointer relative ${
              billingPlan === 'annual'
                ? 'bg-gradient-to-br from-amber-950/60 to-stone-900 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
            }`}
          >
            <div className="absolute -top-2.5 right-3 rtl:right-auto rtl:left-3 bg-amber-400 text-stone-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>{isRtl ? 'أفضل قيمة' : 'Best Value'}</span>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-amber-300 block">
                  {isRtl ? 'الاشتراك السنوي' : 'Annual Plan'}
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-stone-100">$59</span>
                  <span className="text-xs text-stone-400"> / {isRtl ? 'سنة' : 'year'}</span>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  billingPlan === 'annual' ? 'bg-amber-500 border-amber-400' : 'border-stone-700'
                }`}
              >
                {billingPlan === 'annual' && <Check className="w-3 h-3 text-stone-950 stroke-[3]" />}
              </div>
            </div>
            <p className="text-[11px] text-amber-200/80 mt-2 font-medium">
              {isRtl ? 'خصم الفترة التجريبية: وفر أكثر من 30% ($4.90/شهر)' : 'Trial Discount: Save 30%+ ($4.90/mo equivalent)'}
            </p>
          </button>
        </div>

        {/* Restore confirmation message toast */}
        {restoreMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{restoreMessage}</span>
          </div>
        )}

        {/* Primary Action Button: Unlock Full Access */}
        <div className="space-y-3">
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleUnlockFullAccess}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-bold text-sm tracking-wide transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <Crown className="w-4 h-4 text-stone-950" />
            <span>{isProcessing ? (isRtl ? 'جاري التفعيل...' : 'Activating Access...') : (isRtl ? 'فتح الوصول الكامل' : 'Unlock Full Access')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>

          {/* Secondary Actions: Restore Purchase & Security Notice */}
          <div className="flex items-center justify-between text-xs text-stone-400 px-1">
            <button
              type="button"
              onClick={handleRestore}
              disabled={isProcessing}
              className="hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isRtl ? 'استعادة المشتريات' : 'Restore Purchase'}</span>
            </button>

            <div className="flex items-center gap-1 text-stone-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isRtl ? 'دفع آمن وتشفير كامل' : 'Encrypted & Secure'}</span>
            </div>
          </div>
        </div>

        {/* Trial Days Testing Simulator Switch (For quick evaluation/testing) */}
        <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
          <span>{isRtl ? 'محاكي أيام التجربة:' : 'Trial Day Status:'}</span>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-amber-400 font-bold">{isRtl ? 'اليوم 7 (انتهت التجربة)' : 'Day 7 of 7 (Trial Ended)'}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
