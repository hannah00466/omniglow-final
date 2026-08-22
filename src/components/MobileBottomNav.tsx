import React from 'react';
import {
  Home,
  Moon,
  Apple,
  Droplets,
  Activity,
  Brain,
  Crown,
} from 'lucide-react';
import { MainSectionTab } from './Header';
import { SupportedLanguage } from '../utils/translations';

interface MobileBottomNavProps {
  activeTab: MainSectionTab;
  setActiveTab: (tab: MainSectionTab) => void;
  language?: SupportedLanguage;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  language = 'en',
}) => {
  const isRtl = language === 'ar';

  const navItems: {
    id: MainSectionTab;
    label: string;
    labelAr: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'home', label: 'Home', labelAr: 'الرئيسية', icon: Home },
    { id: 'sleep', label: 'Sleep', labelAr: 'النوم', icon: Moon },
    { id: 'food', label: 'Food', labelAr: 'الغذاء', icon: Apple },
    { id: 'hydration', label: 'Hydrate', labelAr: 'الماء', icon: Droplets },
    { id: 'body', label: 'Body', labelAr: 'الجسد', icon: Activity },
    { id: 'mind', label: 'Mind', labelAr: 'العقل', icon: Brain },
    { id: 'premium', label: 'Pro', labelAr: 'برو', icon: Crown },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-xl border-t border-stone-850 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-inset-bottom"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom))' }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const displayLabel = isRtl ? item.labelAr : item.label;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer min-w-[44px] min-h-[44px] ${
              isActive
                ? 'text-amber-300 font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg transition-transform ${
                isActive ? 'bg-amber-500/20 scale-110' : ''
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-stone-400'}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
              {displayLabel}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
