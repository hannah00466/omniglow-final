import React, { useState } from 'react';
import {
  Utensils,
  Droplets,
  Plus,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Trash2,
  Apple,
  Salad,
  Info,
} from 'lucide-react';
import { UserProfile, MasterGlowPlan, Recipe } from '../types';
import { getTranslation } from '../utils/translations';

interface FoodDashboardProps {
  profile: UserProfile;
  masterPlan: MasterGlowPlan;
  recipes: Recipe[];
  loggedMeals: Recipe[];
  onLogMeal: (recipe: Recipe) => void;
  onRemoveLoggedMeal: (mealId: string) => void;
  onDrinkWater: (amountMl: number) => void;
  onAddXp: (xp: number) => void;
}

export const FoodDashboard: React.FC<FoodDashboardProps> = ({
  profile,
  masterPlan,
  recipes,
  loggedMeals,
  onLogMeal,
  onRemoveLoggedMeal,
  onDrinkWater,
  onAddXp,
}) => {
  const lang = profile.language || 'en';
  const t = (key: string, params?: Record<string, string | number>) => getTranslation(lang, key, params);

  // Form State for quick meal log
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [mealCalories, setMealCalories] = useState<number>(450);
  const [mealProtein, setMealProtein] = useState<number>(30);
  const [showAddMealForm, setShowAddMealForm] = useState(false);

  // Calculate totals
  const totalCaloriesConsumed = loggedMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
  const totalProteinConsumed = loggedMeals.reduce((acc, m) => acc + (m.proteinGrams || 0), 0);
  const targetCalories = masterPlan.targetCalories || 2150;
  const targetProtein = masterPlan.proteinGrams || 135;
  const remainingCalories = Math.max(0, targetCalories - totalCaloriesConsumed);

  // Water tracking
  const waterGlasses = profile.waterGlassesToday || 4;
  const targetGlasses = 8;
  const waterMl = waterGlasses * 250;

  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim()) return;

    const newMeal: Recipe = {
      id: `meal-${Date.now()}`,
      name: mealName.trim(),
      mealType,
      prepTimeMinutes: 15,
      calories: mealCalories,
      proteinGrams: mealProtein,
      carbsGrams: 35,
      fatGrams: 15,
      usedIngredients: ['Balanced whole foods'],
      pantryAdditions: [],
      instructions: ['Enjoy mindfully and chew thoroughly.'],
      glowBenefit: 'Clean metabolic nourishment & cell recovery',
      boredomBusterTip: 'Garnish with fresh herbs and cold-pressed extra virgin olive oil.',
      loggedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onLogMeal(newMeal);
    setMealName('');
    setShowAddMealForm(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-stone-900 border border-stone-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/40 text-emerald-300 text-xs font-medium">
            <Apple className="w-3.5 h-3.5" />
            <span>{t('foodTab')} • Whole Nutrition</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-stone-100">{t('foodTitle')}</h1>
          <p className="text-sm text-stone-400 max-w-2xl">{t('foodSubtitle')}</p>
        </div>

        <button
          onClick={() => setShowAddMealForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>{t('logMeal')}</span>
        </button>
      </div>

      {/* Overview Energy & Water Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calorie Budget Card */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              {t('targetCalories')}
            </span>
            <span className="text-xs font-mono font-semibold text-stone-300">
              {totalCaloriesConsumed} / {targetCalories} kcal
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((totalCaloriesConsumed / targetCalories) * 100))}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-2">
            <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-850">
              <span className="text-[10px] text-stone-400 uppercase">{t('remaining')}</span>
              <p className="text-sm font-mono font-bold text-stone-100 mt-0.5">{remainingCalories} kcal</p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-850">
              <span className="text-[10px] text-stone-400 uppercase">{t('protein')}</span>
              <p className="text-sm font-mono font-bold text-emerald-300 mt-0.5">{totalProteinConsumed}g / {targetProtein}g</p>
            </div>
            <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-850">
              <span className="text-[10px] text-stone-400 uppercase">Status</span>
              <p className="text-sm font-mono font-bold text-amber-300 mt-0.5">
                {totalCaloriesConsumed <= targetCalories ? 'On Track' : 'Goal Met'}
              </p>
            </div>
          </div>
        </div>

        {/* Water Intake Tracker Card */}
        <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              {t('waterIntake')}
            </span>
            <span className="text-xs font-mono font-semibold text-sky-300">
              {waterMl} ml ({waterGlasses} / {targetGlasses} glasses)
            </span>
          </div>

          {/* Glasses Visual */}
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: targetGlasses }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx >= waterGlasses) {
                    onDrinkWater(250);
                  }
                }}
                className={`h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  idx < waterGlasses
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                    : 'bg-stone-950/80 border-stone-800 text-stone-600 hover:border-stone-700'
                }`}
                title={`Glass ${idx + 1}`}
              >
                <Droplets className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-stone-400">Target: 2.0L Daily Hydration</span>
            <button
              onClick={() => onDrinkWater(250)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold cursor-pointer transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('drinkWater')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Habit of the Day Tip */}
      <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-850 flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-stone-200 block">{t('eatingHabitTipTitle')}</span>
          <p className="text-stone-400 text-[11px] leading-relaxed">{t('eatingHabitTip')}</p>
        </div>
      </div>

      {/* Meals Logged Today */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span>{t('mealsToday')} ({loggedMeals.length})</span>
          </h3>
          <span className="text-xs text-stone-400 font-mono">
            {totalCaloriesConsumed} kcal total
          </span>
        </div>

        {loggedMeals.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">
            No meals logged yet today. Click &quot;{t('logMeal')}&quot; or pick a suggested recipe below.
          </p>
        ) : (
          <div className="space-y-2.5">
            {loggedMeals.map((meal, idx) => (
              <div
                key={`${meal.id}-${idx}`}
                className="p-3 rounded-xl bg-stone-950/70 border border-stone-850 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-200">{meal.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-850 text-stone-400">
                      {meal.mealType}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 flex items-center gap-3">
                    <span>{meal.calories} kcal</span>
                    <span>•</span>
                    <span>{meal.proteinGrams}g protein</span>
                    {meal.loggedAt && (
                      <>
                        <span>•</span>
                        <span>Logged at {meal.loggedAt}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveLoggedMeal(meal.id)}
                  className="p-1.5 rounded-lg text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Balanced Meal Ideas & Pantry Suggestions */}
      <div className="p-5 rounded-2xl bg-stone-900 border border-stone-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
            <Salad className="w-4 h-4 text-emerald-400" />
            <span>{t('healthyRecipes')}</span>
          </h3>
          <span className="text-xs text-stone-400">Nutrient-dense inspirations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recipes.slice(0, 3).map((recipe) => (
            <div
              key={recipe.id}
              className="p-4 rounded-xl bg-stone-950/80 border border-stone-850 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-semibold text-emerald-400">{recipe.mealType}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTimeMinutes}m
                  </span>
                </div>
                <h4 className="text-sm font-serif font-bold text-stone-100">{recipe.name}</h4>
                <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                  {recipe.glowBenefit}
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-stone-300">
                  <span>{recipe.calories} kcal</span>
                  <span>•</span>
                  <span>{recipe.proteinGrams}g P</span>
                </div>
              </div>

              <button
                onClick={() => onLogMeal(recipe)}
                className="w-full py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-750 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                <span>Log This Meal</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Meal Modal */}
      {showAddMealForm && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
                <Apple className="w-4 h-4 text-emerald-400" />
                <span>{t('logMeal')}</span>
              </h3>
              <button
                onClick={() => setShowAddMealForm(false)}
                className="text-stone-400 hover:text-stone-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomMeal} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">{t('mealName')}</label>
                <input
                  type="text"
                  required
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g. Avocado Toast with Poached Eggs"
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Meal Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMealType(type)}
                      className={`py-2 rounded-xl font-semibold border transition-all cursor-pointer ${
                        mealType === type
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                          : 'bg-stone-800 border-stone-700 text-stone-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-stone-300 font-medium">{t('mealCalories')}</label>
                  <input
                    type="number"
                    min="50"
                    max="2000"
                    value={mealCalories}
                    onChange={(e) => setMealCalories(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-stone-300 font-medium">{t('mealProtein')}</label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={mealProtein}
                    onChange={(e) => setMealProtein(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddMealForm(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                >
                  {t('addMealBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
