import React, { useState } from 'react';
import {
  Refrigerator,
  Sparkles,
  Plus,
  X,
  Flame,
  ChefHat,
  Clock,
  Apple,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Tag,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe, UserProfile, MasterGlowPlan } from '../types';
import { COMMON_FRIDGE_ITEMS } from '../utils/defaults';

interface FridgeChefCalorieHubProps {
  profile: UserProfile;
  masterPlan: MasterGlowPlan;
  recipes: Recipe[];
  onSaveRecipes: (recipes: Recipe[]) => void;
  loggedMeals: Recipe[];
  onLogMeal: (recipe: Recipe) => void;
  onRemoveLoggedMeal: (mealId: string) => void;
}

export const FridgeChefCalorieHub: React.FC<FridgeChefCalorieHubProps> = ({
  profile,
  masterPlan,
  recipes,
  onSaveRecipes,
  loggedMeals,
  onLogMeal,
  onRemoveLoggedMeal,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    'Eggs',
    'Spinach',
    'Greek Yogurt',
    'Blueberries',
    'Olive Oil',
    'Chicken Breast',
  ]);
  const [customIngredientInput, setCustomIngredientInput] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Dinner');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calorie calculations
  const safeLoggedMeals = loggedMeals || [];
  const safeRecipes = recipes || [];
  const totalCaloriesConsumed = safeLoggedMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
  const totalProteinConsumed = safeLoggedMeals.reduce((acc, m) => acc + (m.proteinGrams || 0), 0);
  const totalCarbsConsumed = safeLoggedMeals.reduce((acc, m) => acc + (m.carbsGrams || 0), 0);
  const totalFatConsumed = safeLoggedMeals.reduce((acc, m) => acc + (m.fatGrams || 0), 0);

  const targetCalories = masterPlan?.targetCalories || 1850;
  const remainingCalories = Math.max(0, targetCalories - totalCaloriesConsumed);
  const caloriePercent = Math.min(100, Math.round((totalCaloriesConsumed / (targetCalories || 1850)) * 100));

  const toggleIngredient = (item: string) => {
    if (selectedIngredients.includes(item)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== item));
    } else {
      setSelectedIngredients([...selectedIngredients, item]);
    }
  };

  const addCustomIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (customIngredientInput.trim()) {
      const formatted = customIngredientInput.trim();
      if (!selectedIngredients.includes(formatted)) {
        setSelectedIngredients([...selectedIngredients, formatted]);
      }
      setCustomIngredientInput('');
    }
  };

  const generateFridgeMeals = async () => {
    if (selectedIngredients.length === 0) {
      setErrorMsg('Please select or add at least one ingredient from your fridge/pantry.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const targetWindow =
        selectedMealType === 'Breakfast'
          ? '350-450'
          : selectedMealType === 'Lunch'
          ? '450-600'
          : selectedMealType === 'Dinner'
          ? '450-600'
          : '200-300';

      const response = await fetch('/api/fridge-chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          mealType: selectedMealType,
          targetCalories: targetWindow,
          userProfile: {
            gender: profile.gender,
            primaryGoals: profile.primaryGoals,
            dietaryPreference: profile.dietaryPreference,
          },
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate recipes');
      }

      const generatedRecipes: Recipe[] = data.data.map((r: any, idx: number) => ({
        ...r,
        id: `recipe-gen-${Date.now()}-${idx}`,
      }));

      onSaveRecipes([...generatedRecipes, ...recipes]);
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err: any) {
      console.error('Error generating fridge recipe:', err);
      setErrorMsg(err.message || 'Could not generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogMeal = (recipe: Recipe) => {
    onLogMeal(recipe);
    confetti({
      particleCount: 50,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#f43f5e', '#fbbf24', '#34d399'],
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-stone-800 p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Culinary Nutrition & Fridge Chef
              </span>
              <span className="text-xs text-stone-400">
                Calorie & Macro Precision • Anti-Boredom Meals
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100">
              Smart Fridge Chef & Calorie Hub
            </h1>
            <p className="text-sm text-stone-300 max-w-2xl">
              Tell the AI what ingredients you already have in your fridge. It calculates exact calories, balances your macros, and designs gourmet, anti-boredom recipes that nourish skin and muscle tone.
            </p>
          </div>

          <button
            id="generate-fridge-recipes-hero-btn"
            onClick={generateFridgeMeals}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-400 hover:from-rose-400 hover:to-amber-300 active:scale-95 text-stone-950 font-bold text-sm shadow-lg shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Crafting Gourmet Recipes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Meals from Fridge</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Calorie & Macro Budget Tracker */}
      <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>Today&apos;s Caloric & Macro Budget</span>
            </h3>
            <p className="text-xs text-stone-400">
              Target calculated for {profile.weight}kg, {profile.height}cm, {profile.age}y {profile.gender}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="text-stone-300">
              Consumed: <strong className="text-rose-400">{totalCaloriesConsumed}</strong> kcal
            </span>
            <span className="text-stone-300">
              Remaining: <strong className="text-emerald-400">{remainingCalories}</strong> kcal
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-stone-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-rose-600 transition-all duration-300 rounded-full"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-stone-400 font-mono">
            <span>0 kcal</span>
            <span>Target: {targetCalories} kcal</span>
          </div>
        </div>

        {/* 3 Macro Cards: Protein, Carbs, Fats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-400">Protein</span>
            <div className="text-lg font-bold text-stone-100 font-mono mt-0.5">
              {totalProteinConsumed}g
            </div>
            <span className="text-[10px] text-stone-400">Goal: ~{masterPlan.proteinGrams}g</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 text-center">
            <span className="text-[10px] uppercase font-bold text-sky-400">Carbs</span>
            <div className="text-lg font-bold text-stone-100 font-mono mt-0.5">
              {totalCarbsConsumed}g
            </div>
            <span className="text-[10px] text-stone-400">Goal: ~{masterPlan.carbsGrams}g</span>
          </div>

          <div className="p-3 rounded-xl bg-stone-850 border border-stone-800 text-center">
            <span className="text-[10px] uppercase font-bold text-rose-400">Healthy Fats</span>
            <div className="text-lg font-bold text-stone-100 font-mono mt-0.5">
              {totalFatConsumed}g
            </div>
            <span className="text-[10px] text-stone-400">Goal: ~{masterPlan.fatGrams}g</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Fridge Ingredient Picker (Left) & Recipes / Logged Meals (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5/12): Fridge & Pantry Selector */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
                <Refrigerator className="w-4 h-4 text-rose-400" />
                <span>What&apos;s in Your Fridge?</span>
              </h3>
              <span className="text-xs text-amber-400 font-semibold">
                {selectedIngredients.length} Selected
              </span>
            </div>

            {/* Meal Type Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">
                Target Meal Creation:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedMealType === type
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom ingredient input */}
            <form onSubmit={addCustomIngredient} className="flex gap-2">
              <input
                type="text"
                value={customIngredientInput}
                onChange={(e) => setCustomIngredientInput(e.target.value)}
                placeholder="Type custom ingredient (e.g. Kimchi, Tofu)..."
                className="flex-1 px-3 py-2 rounded-xl bg-stone-850 border border-stone-700 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-amber-300 border border-stone-700 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>

            {/* Ingredients Chips Selector */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-400">
                Click items you currently have available:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto pr-1">
                {COMMON_FRIDGE_ITEMS.map((item) => {
                  const isSelected = selectedIngredients.includes(item);
                  return (
                    <button
                      key={item}
                      id={`fridge-item-${item.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => toggleIngredient(item)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 shadow-sm font-bold'
                          : 'bg-stone-850 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
                      }`}
                    >
                      <span>{item}</span>
                      {isSelected && <CheckCircle className="w-3 h-3 text-stone-950" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              id="generate-fridge-recipes-btn"
              onClick={generateFridgeMeals}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-400 hover:from-rose-400 text-stone-950 font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Creative Recipes...</span>
                </>
              ) : (
                <>
                  <ChefHat className="w-4 h-4" />
                  <span>Generate 3 Gourmet {selectedMealType} Recipes</span>
                </>
              )}
            </button>
          </div>

          {/* Today's Logged Meals */}
          <div className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2">
              <h3 className="text-sm font-serif font-bold text-stone-100 flex items-center gap-2">
                <Apple className="w-4 h-4 text-emerald-400" />
                <span>Logged Meals Today ({safeLoggedMeals.length})</span>
              </h3>
              <span className="text-xs font-mono font-bold text-rose-400">
                {totalCaloriesConsumed} kcal
              </span>
            </div>

            {safeLoggedMeals.length === 0 ? (
              <p className="text-xs text-stone-500 py-3 text-center">
                No meals logged yet today. Click &quot;Log Meal&quot; on any recipe.
              </p>
            ) : (
              <div className="space-y-2">
                {safeLoggedMeals.map((meal, idx) => (
                  <div
                    key={`${meal.id}-${idx}`}
                    className="p-2.5 rounded-xl bg-stone-850 border border-stone-800 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-200 line-clamp-1">
                        {meal.name}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        {meal.calories} kcal • {meal.proteinGrams}g P • {meal.carbsGrams}g C • {meal.fatGrams}g F
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveLoggedMeal(meal.id)}
                      className="p-1 rounded-md text-stone-500 hover:text-rose-400 hover:bg-stone-800 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7/12): Recipe Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-stone-100 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-400" />
              <span>Gourmet Fridge Recipes</span>
            </h2>
            <span className="text-xs text-stone-400">
              {safeRecipes.length} Custom Creations Available
            </span>
          </div>

          <div className="space-y-4">
            {safeRecipes.map((recipe, idx) => (
              <div
                key={recipe.id || idx}
                id={`recipe-card-${idx}`}
                className="rounded-2xl bg-stone-900/90 border border-stone-800 p-5 space-y-4 hover:border-stone-700 transition-all shadow-md"
              >
                {/* Title & Calorie Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {recipe.mealType}
                      </span>
                      <span className="text-xs text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {recipe.prepTimeMinutes} mins prep
                      </span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-stone-100">
                      {recipe.name}
                    </h3>
                  </div>

                  {/* Calorie & Macro Pill */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-850 border border-stone-700 text-xs font-mono font-bold">
                    <span className="text-rose-400">{recipe.calories} kcal</span>
                    <span className="text-stone-500">|</span>
                    <span className="text-amber-300">{recipe.proteinGrams}g P</span>
                  </div>
                </div>

                {/* Used Fridge Ingredients */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] font-bold text-stone-400 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-400" /> Ingredients:
                  </span>
                  {recipe.usedIngredients?.map((ing, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-800 text-stone-300 border border-stone-700"
                    >
                      {ing}
                    </span>
                  ))}
                  {recipe.pantryAdditions?.map((pantry, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md text-[11px] text-stone-400 bg-stone-850/60 border border-stone-800"
                    >
                      +{pantry}
                    </span>
                  ))}
                </div>

                {/* Cooking Instructions */}
                <div className="space-y-1.5 text-xs text-stone-300">
                  <span className="font-bold text-stone-200">Preparation Steps:</span>
                  <ol className="list-decimal list-inside space-y-1 pl-1 leading-relaxed text-stone-300">
                    {recipe.instructions?.map((step, sIdx) => (
                      <li key={sIdx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Glow Benefit & Anti-Boredom Callout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-stone-300 space-y-0.5">
                    <span className="font-bold text-amber-400 text-[10px] uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Glow Benefit
                    </span>
                    <p className="text-[11px] text-stone-300 leading-snug">
                      {recipe.glowBenefit}
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-stone-300 space-y-0.5">
                    <span className="font-bold text-rose-400 text-[10px] uppercase flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Boredom Buster Tip
                    </span>
                    <p className="text-[11px] text-stone-300 leading-snug">
                      {recipe.boredomBusterTip}
                    </p>
                  </div>
                </div>

                {/* Log Meal Action */}
                <div className="pt-2 border-t border-stone-800 flex justify-end">
                  <button
                    id={`log-meal-btn-${idx}`}
                    onClick={() => handleLogMeal(recipe)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-100 text-xs font-bold border border-stone-700 hover:border-rose-500/40 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-400" />
                    <span>Log to Today&apos;s Calories (+{recipe.calories} kcal)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
