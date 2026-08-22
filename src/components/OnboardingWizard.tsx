import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  User,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Moon,
  Sun,
  Flame,
  Globe,
  Trash2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserProfile, FaceProfilePhotos } from '../types';
import { LuminaLogo } from './LuminaLogo';
import { SUPPORTED_LANGUAGES, SupportedLanguage, getTranslation } from '../utils/translations';

interface OnboardingWizardProps {
  initialProfile: UserProfile;
  onComplete: (completedProfile: UserProfile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  initialProfile,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Profile Form States
  const [language, setLanguage] = useState<SupportedLanguage>(initialProfile.language || 'en');
  const lang = language;
  const isRtl = language === 'ar';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);

  // Step 1: Face Profile Photos
  const [facePhotos, setFacePhotos] = useState<FaceProfilePhotos>(
    initialProfile.facePhotos || {
      frontal: '',
      leftJawline: '',
      rightJawline: '',
    }
  );

  // Step 2: Biometrics
  const [age, setAge] = useState<number>(initialProfile.age || 24);
  const [gender, setGender] = useState<UserProfile['gender']>(initialProfile.gender || 'female');
  const [height, setHeight] = useState<number>(initialProfile.height || 168);
  const [weight, setWeight] = useState<number>(initialProfile.weight || 60);
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>(initialProfile.heightUnit || 'cm');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(initialProfile.weightUnit || 'kg');

  // Step 3: Circadian Rhythms
  const [wakeTime, setWakeTime] = useState<string>(
    initialProfile.sleepProfile?.wakeTime || '06:30'
  );
  const [targetBedtime, setTargetBedtime] = useState<string>(
    initialProfile.sleepProfile?.targetBedtime || '22:30'
  );

  // Step 4: Goal Commitment
  const [isCommitted, setIsCommitted] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Hidden File Input refs
  const frontalInputRef = useRef<HTMLInputElement>(null);
  const leftJawInputRef = useRef<HTMLInputElement>(null);
  const rightJawInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: keyof FaceProfilePhotos
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFacePhotos((prev) => ({
          ...prev,
          [type]: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhoto = (type: keyof FaceProfilePhotos) => {
    setFacePhotos((prev) => ({
      ...prev,
      [type]: '',
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleFinishOnboarding = () => {
    setIsSubmitting(true);

    const completedProfile: UserProfile = {
      ...initialProfile,
      language,
      age: Number(age) || 24,
      gender,
      height: Number(height) || 168,
      weight: Number(weight) || 60,
      heightUnit,
      weightUnit,
      facePhotos,
      onboardingCompleted: true,
      goalCommitted: isCommitted,
      subscription: initialProfile.subscription || {
        tier: 'trial',
        trialStartDate: new Date().toISOString(),
        trialDays: 7,
        billingCycle: 'monthly',
        hasStandardPlan: false,
        hasPremiumAddon: false,
        monthlyTotal: 0,
        activeTheme: 'obsidian',
        notificationSound: 'soft_chime',
      },
      sleepProfile: {
        currentBedtime: initialProfile.sleepProfile?.currentBedtime || '00:30',
        targetBedtime,
        wakeTime,
        screenFreeMinutes: 45,
        gradualStepIndex: 1,
        windDownCompletedToday: false,
      },
    };

    setTimeout(() => {
      onComplete(completedProfile);
    }, 600);
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans"
    >
      {/* Top Header Bar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6 border-b border-stone-850">
        <div className="flex items-center gap-3">
          <LuminaLogo size="sm" showWordmark={true} />
        </div>

        <div className="flex items-center gap-3">
          {/* Language Picker in Onboarding */}
          <div className="relative flex items-center bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-300">
            <Globe className="w-3.5 h-3.5 text-stone-400 mr-1.5 shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer pr-1 font-medium"
              aria-label="Select Language"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-stone-900 text-stone-200">
                  {l.nativeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8">
        {/* Step Indicator Progress Bar */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
            <span className="uppercase tracking-widest text-amber-300 font-semibold">
              {isRtl ? `الخطوة ${currentStep} من 4` : `Step ${currentStep} of 4`}
            </span>
            <span>
              {currentStep === 1 && (isRtl ? 'التقاط صور الوجه' : 'Face Profile Capture')}
              {currentStep === 2 && (isRtl ? 'القياسات الحيوية' : 'Biometrics & Body')}
              {currentStep === 3 && (isRtl ? 'الإيقاع الحيوي والنوم' : 'Circadian Rhythms')}
              {currentStep === 4 && (isRtl ? 'الالتزام بالهدف' : 'Goal Commitment')}
            </span>
          </div>

          <div className="w-full h-1.5 bg-stone-900 rounded-full overflow-hidden flex">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-full flex-1 transition-all duration-500 ${
                  step <= currentStep ? 'bg-amber-400' : 'bg-stone-900'
                } ${step !== 4 ? (isRtl ? 'border-l' : 'border-r') + ' border-stone-950' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Wizard Card Body */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* STEP 1: FACE PROFILE CAPTURE */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <Camera className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'تحليل ملامح الوجه' : 'Aesthetic Baseline'}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-100">
                  {isRtl ? 'التقاط صور الوجه الثلاث' : 'Step 1: Face Profile Capture'}
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  {isRtl
                    ? 'يرجى تقديم 3 صور للمساعدة في تخصيص تمارين ملامح الوجه واستقامة الرقبة وتتبع التطور: المنظر الأمامي، خط الفك الأيسر، وخط الفك الأيمن.'
                    : 'Upload or capture 3 angles to customize your jawline posture, facial lymphatic exercises, and track aesthetic progression: Frontal View, Left Jawline, and Right Jawline.'}
                </p>
              </div>

              {/* 3 Photo Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* 1. Frontal View */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-300 block text-center">
                    {isRtl ? '١. المنظر الأمامي' : '1. Frontal View'}
                  </span>
                  <div
                    onClick={() => frontalInputRef.current?.click()}
                    className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-3 text-center overflow-hidden group ${
                      facePhotos.frontal
                        ? 'border-amber-500/60 bg-stone-950'
                        : 'border-stone-800 bg-stone-950/60 hover:border-amber-500/40 hover:bg-stone-950'
                    }`}
                  >
                    <input
                      ref={frontalInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'frontal')}
                    />
                    {facePhotos.frontal ? (
                      <>
                        <img
                          src={facePhotos.frontal}
                          alt="Frontal face"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearPhoto('frontal');
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-black transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-[11px] text-stone-300 font-medium">
                          {isRtl ? 'رفع أو التقاط' : 'Frontal Face'}
                        </div>
                        <div className="text-[9px] text-stone-400">
                          {isRtl ? 'صورة أمامية مباشرة' : 'Direct front angle'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Left Jawline */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-300 block text-center">
                    {isRtl ? '٢. خط الفك الأيسر' : '2. Left Jawline'}
                  </span>
                  <div
                    onClick={() => leftJawInputRef.current?.click()}
                    className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-3 text-center overflow-hidden group ${
                      facePhotos.leftJawline
                        ? 'border-amber-500/60 bg-stone-950'
                        : 'border-stone-800 bg-stone-950/60 hover:border-amber-500/40 hover:bg-stone-950'
                    }`}
                  >
                    <input
                      ref={leftJawInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'leftJawline')}
                    />
                    {facePhotos.leftJawline ? (
                      <>
                        <img
                          src={facePhotos.leftJawline}
                          alt="Left Jawline"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearPhoto('leftJawline');
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-black transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-[11px] text-stone-300 font-medium">
                          {isRtl ? 'رفع أو التقاط' : 'Left Jawline'}
                        </div>
                        <div className="text-[9px] text-stone-400">
                          {isRtl ? 'زاوية 45 درجة لليسار' : '45° side profile'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Right Jawline */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-300 block text-center">
                    {isRtl ? '٣. خط الفك الأيمن' : '3. Right Jawline'}
                  </span>
                  <div
                    onClick={() => rightJawInputRef.current?.click()}
                    className={`relative aspect-[3/4] rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-3 text-center overflow-hidden group ${
                      facePhotos.rightJawline
                        ? 'border-amber-500/60 bg-stone-950'
                        : 'border-stone-800 bg-stone-950/60 hover:border-amber-500/40 hover:bg-stone-950'
                    }`}
                  >
                    <input
                      ref={rightJawInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'rightJawline')}
                    />
                    {facePhotos.rightJawline ? (
                      <>
                        <img
                          src={facePhotos.rightJawline}
                          alt="Right Jawline"
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClearPhoto('rightJawline');
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-rose-400 hover:bg-black transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <Camera className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-[11px] text-stone-300 font-medium">
                          {isRtl ? 'رفع أو التقاط' : 'Right Jawline'}
                        </div>
                        <div className="text-[9px] text-stone-400">
                          {isRtl ? 'زاوية 45 درجة لليمين' : '45° side profile'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isRtl
                    ? 'الخصوصية التامة: يتم تخزين صورك بأمان على جهازك ولا تتم مشاركتها أبداً مع أطراف ثالثة.'
                    : 'Privacy guaranteed: Your photos are encrypted locally on your device for aesthetic symmetry comparisons.'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: BIOMETRICS & BODY */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <User className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'القياسات الحيوية' : 'Personal Health Metrics'}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-100">
                  {isRtl ? 'الخطوة ٢: القياسات الحيوية' : 'Step 2: Biometrics & Body'}
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  {isRtl
                    ? 'أدخل بيانات العمر، الجنس، الطول، والوزن لحساب الاحتياج اليومي للترطيب بدقة والسعرات المناسبة.'
                    : 'Provide your core biometric stats for precise hydration targets, metabolic expenditure, and personalized kinetic volume.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">
                    {isRtl ? 'الجنس البيولوجي' : 'Gender'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'female' as const, label: isRtl ? 'أنثى' : 'Female' },
                      { id: 'male' as const, label: isRtl ? 'ذكر' : 'Male' },
                      { id: 'non-binary' as const, label: isRtl ? 'آخر' : 'Other' },
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGender(g.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all cursor-pointer text-center ${
                          gender === g.id
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-300">
                    {isRtl ? 'العمر (بالسنوات)' : 'Age (Years)'}
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(Math.max(12, Math.min(100, Number(e.target.value))))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Height */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-300">
                      {isRtl ? 'الطول' : 'Height'}
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setHeightUnit('cm')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          heightUnit === 'cm' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-500'
                        }`}
                      >
                        cm
                      </button>
                      <span className="text-stone-600">|</span>
                      <button
                        type="button"
                        onClick={() => setHeightUnit('ft')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          heightUnit === 'ft' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-500'
                        }`}
                      >
                        ft
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-300">
                      {isRtl ? 'الوزن' : 'Weight'}
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setWeightUnit('kg')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          weightUnit === 'kg' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-500'
                        }`}
                      >
                        kg
                      </button>
                      <span className="text-stone-600">|</span>
                      <button
                        type="button"
                        onClick={() => setWeightUnit('lbs')}
                        className={`px-1.5 py-0.5 rounded cursor-pointer ${
                          weightUnit === 'lbs' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-stone-500'
                        }`}
                      >
                        lbs
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2 text-stone-100 text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CIRCADIAN RHYTHMS */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <Moon className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'التناغم البيولوجي' : 'Circadian Alignment'}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-100">
                  {isRtl ? 'الخطوة ٣: الإيقاع الحيوي والنوم' : 'Step 3: Circadian Rhythms'}
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
                  {isRtl
                    ? 'حدد وقت الاستيقاظ ووقت النوم المستهدف لبرمجة روتين الاسترخاء المسائي الخالي من الشاشات وضبط هرمون الميلاتونين.'
                    : 'Configure your wake-up time and ideal bedtime to orchestrate screen-free wind-down prompts and progressive circadian adjustment.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Wake-Up Time */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <Sun className="w-4 h-4" />
                    <span>{isRtl ? 'وقت الاستيقاظ اليومي' : 'Wake-Up Time'}</span>
                  </div>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm font-mono text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                  <div className="text-[10px] text-stone-400">
                    {isRtl ? 'يحفز طاقة الصباح وترطيب الجسم' : 'Triggers morning hydration & mobility cues'}
                  </div>
                </div>

                {/* Target Bedtime */}
                <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                    <Moon className="w-4 h-4" />
                    <span>{isRtl ? 'وقت النوم المستهدف' : 'Target Bedtime'}</span>
                  </div>
                  <input
                    type="time"
                    value={targetBedtime}
                    onChange={(e) => setTargetBedtime(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm font-mono text-stone-100 focus:outline-none focus:border-indigo-400"
                  />
                  <div className="text-[10px] text-stone-400">
                    {isRtl ? 'يبدأ روتين الاسترخاء قبل النوم بـ 45 دقيقة' : 'Wind-down activates 45 mins prior'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION SCREEN */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in text-left rtl:text-right">
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mx-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isRtl ? 'تم إعداد الملف بنجاح' : 'Setup Complete & Ready'}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 max-w-lg mx-auto">
                  {isRtl ? 'تأكيد إعداد ملاذك اليومي' : 'Confirmation & Routine Activation'}
                </h1>
                <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
                  {isRtl
                    ? 'تم تهيئة وتخصيص جميع الركائز البيولوجية بناءً على قياساتك وصورك وجدول نومك.'
                    : 'Your bio-individual aesthetic protocols, circadian timers, and kinetic posture targets have been calibrated.'}
                </p>
              </div>

              {/* Confirmation Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Face Photos Confirmed */}
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'صور الوجه الثلاث' : '3 Face Photos'}</span>
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {['frontal', 'leftJawline', 'rightJawline'].map((k) => {
                      const hasPhoto = !!facePhotos[k as keyof FaceProfilePhotos];
                      return (
                        <div
                          key={k}
                          className={`w-7 h-9 rounded-lg border flex items-center justify-center overflow-hidden ${
                            hasPhoto ? 'border-amber-500/60 bg-stone-900' : 'border-stone-800 bg-stone-950'
                          }`}
                        >
                          {hasPhoto ? (
                            <img
                              src={facePhotos[k as keyof FaceProfilePhotos]}
                              alt={k}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera className="w-3 h-3 text-stone-600" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-stone-400">
                    {facePhotos.frontal && facePhotos.leftJawline && facePhotos.rightJawline
                      ? isRtl ? '٣ زوايا مكتملة' : '3 angles recorded'
                      : isRtl ? 'زوايا محددة' : 'Angles established'}
                  </p>
                </div>

                {/* 2. Biometrics Confirmed */}
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'القياسات الحيوية' : 'Biometrics'}</span>
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xs font-mono text-stone-200">
                    {age} {isRtl ? 'سنة' : 'yrs'} • {gender === 'male' ? (isRtl ? 'ذكر' : 'Male') : (isRtl ? 'أنثى' : 'Female')}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono">
                    {height} {heightUnit} • {weight} {weightUnit}
                  </div>
                </div>

                {/* 3. Sleep & Circadian */}
                <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'جدول النوم' : 'Sleep Schedule'}</span>
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xs font-mono text-stone-200">
                    {isRtl ? 'استيقاظ: ' : 'Wake: '}
                    <span className="text-amber-300 font-bold">{wakeTime}</span>
                  </div>
                  <div className="text-[10px] font-mono text-stone-400">
                    {isRtl ? 'نوم: ' : 'Bed: '}
                    <span className="text-indigo-300 font-bold">{targetBedtime}</span>
                  </div>
                </div>
              </div>

              {/* 7-Day Free Trial Unlocked Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-200">
                      {isRtl ? 'فترة تجريبية مجانية لمدة 7 أيام مفعّلة' : '7-Day Free Trial Activated (Day 1 of 7)'}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {isRtl
                        ? 'وصول غير محدود لجميع الركائز الخمس والميزات حتى اليوم السادس.'
                        : 'Unrestricted access to all sanctuary pillars and coaching tools for Days 1 to 6.'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  {isRtl ? 'مجاناً 100%' : '100% Free'}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-850 gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 text-stone-300 text-xs font-semibold transition-all cursor-pointer"
              >
                {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{isRtl ? 'السابق' : 'Previous'}</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-bold transition-all shadow-lg cursor-pointer ml-auto rtl:ml-0 rtl:mr-auto"
              >
                <span>{isRtl ? 'المتابعة' : 'Next Step'}</span>
                {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              /* Step 4 Single "Start My Routine" Button */
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinishOnboarding}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-stone-950 text-xs font-bold transition-all shadow-xl hover:scale-[1.02] cursor-pointer ml-auto rtl:ml-0 rtl:mr-auto"
              >
                <Sparkles className="w-4 h-4 text-stone-950 shrink-0" />
                <span className="font-serif tracking-wide text-sm font-bold">
                  {isSubmitting
                    ? isRtl
                      ? 'جاري إعداد الملاذ...'
                      : 'Preparing Sanctuary...'
                    : isRtl
                    ? 'ابدأ روتيني اليومي'
                    : 'Start My Routine'}
                </span>
                {isRtl ? <ChevronLeft className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subtle Footer info */}
      <div className="text-center text-[11px] text-stone-500 font-mono">
        OmniGlow Sanctuary • Bio-Individual Aesthetics & Performance System
      </div>
    </div>
  );
};
