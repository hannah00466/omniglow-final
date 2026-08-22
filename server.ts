import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Lazy initialization of Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 1. Analyze Appearance & Generate Glow Audit (Face, Body, Posture, Strengths, Areas for Improvement)
app.post("/api/analyze-glow", async (req, res) => {
  try {
    const { imageBase64, mimeType, profile } = req.body;
    const ai = getGeminiClient();

    const prompt = `
You are an expert aesthetic consultant, dermatological advisor, biomechanics posture specialist, and holistic glow-up coach.
Analyze this user's profile and photo to provide a scientifically grounded, constructive, and uplifting Glow-Up Assessment.

User Profile:
- Gender: ${profile?.gender || "Not specified"}
- Age: ${profile?.age || "25"}
- Height: ${profile?.height || "175"} cm
- Weight: ${profile?.weight || "70"} kg
- Primary Goals: ${profile?.primaryGoals?.join(", ") || "Face definition, posture, skin clarity, lean physique"}
- Current Concerns: ${profile?.concerns || "None specified"}

Evaluate carefully across:
1. Facial Aesthetics & Harmony (Jawline definition, skin radiance/tone, eye freshness, cheekbone symmetry, puffiness/lymphatic drainage cues).
2. Posture & Body Composition (Forward head posture, shoulder alignment, neck angle, core engagement, overall vitality).
3. Glow Score (1 to 100 benchmark score based on current baseline with high potential for transformation).
4. Key Strengths (3-4 genuinely positive baseline attributes).
5. Focus Improvement Areas (3-4 high-impact areas that will transform their appearance).
6. Post-Glow Recommendations tailored for their gender, age, height, and weight:
   - Body & Workout focus
   - Facial sculpt & skincare focus
   - Nutrition & metabolic hydration focus
   - Mental mindset focus

Return ONLY valid JSON matching this exact structure:
{
  "glowScore": 76,
  "potentialScore": 96,
  "faceAnalysis": {
    "jawlineDefinition": "Moderate definition with slight fluid retention under submental area",
    "skinClarity": "Good natural undertone with mild dehydration and uneven texture",
    "eyeVitality": "Alert, slight dark circles suggesting need for sleep hygiene and lymphatic drainage",
    "facialSymmetry": "High natural symmetry; zygomatic arch responds well to gua sha and face yoga",
    "keyFaceTips": [
      "Morning ice dip or cold spoon compress for 2 minutes to reduce morning puffiness",
      "Tongue posture (mewing) against palate to enhance jawline structure naturally",
      "Hydration protocol with electrolytes to boost dermis plumpness and natural glow"
    ]
  },
  "bodyAnalysis": {
    "postureAlignment": "Mild forward head tilt (5-8 degrees) and slightly rounded scapula",
    "compositionEstimate": "Healthy baseline; posture correction and targeted resistance will immediately elevate silhouette",
    "neckShoulderTension": "Visible trapezius tightness from desk/screen time",
    "keyBodyTips": [
      "Daily wall angels and chin tucks (3 sets of 10) to realign cervical spine",
      "Upper back hypertrophy (face pulls, rear delt flys) to naturally open chest",
      "Core bracing during walking to naturally enhance pelvic alignment"
    ]
  },
  "keyStrengths": [
    "Well-proportioned bone structure",
    "Vibrant natural eye contour",
    "High aesthetic upside potential with consistent hydration and posture resets"
  ],
  "focusAreas": [
    "Submental fluid reduction & jawline sharpening",
    "Cervical spine & scapular posture correction",
    "Skin barrier radiance & antioxidant intake",
    "Stress hormone (cortisol) downregulation via 10-min evening breathwork"
  ],
  "postGlowProtocol": {
    "nutritionSummary": "Target high protein (1.6g/kg) with anti-inflammatory polyphenols and 3L mineralized water.",
    "workoutSummary": "3x weekly resistance training with strict posture supersets and 8,000 daily steps.",
    "faceCareSummary": "AM Ice & Hyaluronic Acid + PM Retinoid/Peptide & 5-min lymphatic Gua Sha.",
    "mindSummary": "10-min morning strategic reading + evening achievement journaling to lower cortisol."
  }
}
`;

    let parts: any[] = [];
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: mimeType || "image/jpeg",
          data: cleanBase64,
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const resultText = response.text || "{}";
    const parsed = JSON.parse(resultText);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/analyze-glow:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to analyze glow" });
  }
});

// 2. AI Fridge Chef: Create customized, calorie-counted meals from fridge ingredients
app.post("/api/fridge-chef", async (req, res) => {
  try {
    const { ingredients, mealType, targetCalories, userProfile } = req.body;
    const ai = getGeminiClient();

    const prompt = `
You are a culinary nutritionist and aesthetic chef specializing in vibrant, delicious, high-nutrient meals that enhance skin radiance, muscle tone, and metabolism while preventing food boredom.

Input Ingredients Available in Fridge/Pantry:
${ingredients ? ingredients.join(", ") : "Eggs, Spinach, Olive Oil, Oats, Greek Yogurt, Berries, Chicken Breast"}

Target Meal Type: ${mealType || "Dinner"}
Target Calorie Window: ${targetCalories || "450-550"} kcal
User Details:
- Gender: ${userProfile?.gender || "Unspecified"}
- Goal: ${userProfile?.primaryGoals?.join(", ") || "Glow up, lean muscle, radiant skin"}
- Dietary preference: ${userProfile?.dietaryPreference || "Flexible high-protein"}

Create 3 distinct, delicious, creative meal recipes utilizing primarily the available fridge ingredients (plus basic pantry staples like spices, salt, oil, water).
Ensure each recipe has calculated accurate calories, protein, carbs, fats, cooking steps, and specific glow benefits (e.g., skin elasticity, collagen, sustained energy).

Return ONLY valid JSON with this structure:
{
  "recipes": [
    {
      "id": "recipe-1",
      "name": "Zesty Spinach & Herbed Egg Scramble with Avocado Toast",
      "mealType": "Breakfast",
      "prepTimeMinutes": 10,
      "calories": 420,
      "proteinGrams": 26,
      "carbsGrams": 22,
      "fatGrams": 24,
      "usedIngredients": ["Eggs", "Spinach", "Whole grain bread", "Olive oil"],
      "pantryAdditions": ["Crushed red pepper", "Sea salt", "Black pepper", "Lemon juice"],
      "instructions": [
        "Whisk 3 eggs with a pinch of sea salt and black pepper.",
        "Heat 1 tsp olive oil in a skillet on medium heat; gently sauté spinach until wilted.",
        "Pour eggs and softly scramble for 90 seconds until creamy.",
        "Serve on toasted whole grain slice with a spritz of lemon juice."
      ],
      "glowBenefit": "Lutein in spinach and choline in eggs protect skin cells and boost collagen formation.",
      "boredomBusterTip": "Add a pinch of smoked paprika and lime zest to transform ordinary scrambled eggs into a gourmet cafe dish."
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed.recipes || [] });
  } catch (error: any) {
    console.error("Error in /api/fridge-chef:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate fridge recipe" });
  }
});

// 3. AI Post-Glow Program Generator: Body, Face, Food, Mental Health & Exercise schedule
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { profile } = req.body;
    const ai = getGeminiClient();

    const weightKg = Number(profile.weight) || 70;
    const heightCm = Number(profile.height) || 175;
    const age = Number(profile.age) || 25;
    const gender = profile.gender || "female";

    // Standard Harris-Benedict BMR
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += gender === "male" ? 5 : -161;
    const tdee = Math.round(bmr * 1.45);
    const targetCalories = Math.round(tdee * 0.9); // slight clean deficit or maintenance

    const prompt = `
You are a premier fitness scientist, aesthetic dermatologist, and performance psychologist.
Create a comprehensive, 7-day master Post-Glow Program with exact times, workouts, skincare & face yoga routines, calorie macro targets, and mental wellness activities.

User Profile:
- Gender: ${gender}
- Age: ${age}
- Height: ${heightCm} cm
- Weight: ${weightKg} kg
- Estimated BMR: ${Math.round(bmr)} kcal, TDEE: ${tdee} kcal, Suggested Target: ${targetCalories} kcal
- Primary Glow Goals: ${profile.primaryGoals?.join(", ") || "Jawline sculpting, posture correction, glowing skin, lean muscle tone, mental focus"}
- Preferred Workout Time: ${profile.activitySchedulePreference || "Morning 07:30 AM"}

Generate a detailed 7-Day structured routine. For each day include:
1. Day Name (e.g. Monday, Tuesday...)
2. Theme / Focus (e.g., "Upper Body Sculpt & Jawline Symmetry", "Glute/Leg Power & Skin Hydration Recharge", "Core Posture & Mindset Deep-Work")
3. Daily Schedule Items with exact timestamp (e.g. "07:00 AM", "07:30 AM", "12:30 PM", "08:00 PM"):
   - Category: "body" | "face" | "nutrition" | "mind"
   - Title & description
   - Duration in minutes
4. Specific Workout Plan for that day (if active workout day or active recovery):
   - Workout Name
   - Target Time (e.g., "07:30 AM")
   - Estimated Calories Burned
   - Exercises list with: Name, Sets, Reps, Rest, Key aesthetic cue (e.g., "Focus on lat retraction to widen back and taper waist")
5. Face & Skincare routine for morning and evening (e.g. Lymphatic drain, Face yoga cheek lifters, Gua sha jaw sweep, Ice immersion, Retinoid/hydration).
6. 10-Minute Daily Reading Topic and key mental glow habit.
7. Daily Caloric & Macro Targets (Calories, Protein in grams, Carbs in grams, Fats in grams, Water in liters).

Return ONLY valid JSON matching this schema:
{
  "targetCalories": ${targetCalories},
  "proteinGrams": ${Math.round(weightKg * 1.8)},
  "carbsGrams": ${Math.round((targetCalories * 0.4) / 4)},
  "fatGrams": ${Math.round((targetCalories * 0.25) / 9)},
  "waterLiters": 3.0,
  "weeklyPlan": [
    {
      "dayNumber": 1,
      "dayName": "Monday",
      "focus": "Jawline Definition & Upper Body Posture Reset",
      "workout": {
        "title": "V-Taper Silhouette & Cervical Spine Alignment",
        "scheduledTime": "07:30 AM",
        "durationMinutes": 45,
        "caloriesBurned": 320,
        "isRestDay": false,
        "exercises": [
          { "name": "Face Pulls with External Rotation", "sets": 4, "reps": "15 reps", "restSeconds": 60, "formTip": "Pull high to forehead and pinch rear delts to reverse tech neck" },
          { "name": "Dumbbell Lateral Raises", "sets": 4, "reps": "12-15 reps", "restSeconds": 60, "formTip": "Lead with elbows for shoulder cap roundness" },
          { "name": "Incline Dumbbell Chest Press", "sets": 3, "reps": "10-12 reps", "restSeconds": 75, "formTip": "Arch upper thoracic slightly, opening up ribcage" },
          { "name": "Chin Tucks & Wall Angels", "sets": 3, "reps": "12 slow reps", "restSeconds": 45, "formTip": "Press neck flat against wall for instant postural lengthening" }
        ]
      },
      "faceRoutine": {
        "morning": "30-sec ice bowl dip + 3-min Gua Sha upward jawline strokes + Vitamin C serum & SPF 50",
        "evening": "Double cleanse + 4-min pterygoid jaw release & cheekbone sculpting + Niacinamide moisturizer"
      },
      "dailySchedule": [
        { "time": "07:00 AM", "category": "face", "title": "Ice Dip & Face Sculpt", "description": "De-puff facial tissues and activate circulation", "duration": 10 },
        { "time": "07:30 AM", "category": "body", "title": "Upper Body & Posture Workout", "description": "V-taper aesthetic lifting and cervical posture correction", "duration": 45 },
        { "time": "08:45 AM", "category": "nutrition", "title": "Glow Protein Breakfast", "description": "High-protein meal with omega-3s and antioxidant berries", "duration": 20 },
        { "time": "01:00 PM", "category": "nutrition", "title": "Metabolic Lunch & 1L Water", "description": "Lean protein with fibrous greens and anti-inflammatory dressing", "duration": 30 },
        { "time": "05:30 PM", "category": "mind", "title": "10-Minute Daily Reading Sanctuary", "description": "Read chapter on Mental Frame & Magnetism + take notes", "duration": 10 },
        { "time": "07:30 PM", "category": "nutrition", "title": "Collagen Synthesis Dinner", "description": "Light, easily digestible protein and slow carbs for restful sleep", "duration": 30 },
        { "time": "09:30 PM", "category": "mind", "title": "Achievement Book Entry & Sleep Winddown", "description": "Record 3 wins of the day and power down screens", "duration": 15 }
      ],
      "readingSnippet": {
        "title": "The Architecture of Personal Magnetism",
        "category": "Confidence & Presence",
        "readTime": "10 min",
        "summary": "How posture, eye calmness, and physical alignment subconsciously communicate high status and inner peace."
      },
      "dailyAchievementGoals": [
        "Completed 45-min posture & lift session",
        "Hit 3.0L water target with electrolytes",
        "Performed morning jawline sculpt & cold plunge",
        "Completed 10 minutes of mental glow reading",
        "Stayed within target calorie and protein window"
      ]
    }
  ]
}
Ensure all 7 days (Monday through Sunday) are fully articulated with rich, practical, diverse workouts (including lower body glute/quad shaping, cardio conditioning, mobility/face relaxation, full body aesthetics).
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/generate-plan:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate glow plan" });
  }
});

// 4. AI 10-Minute Reading Generator: Curated Mental Health & Aesthetic Habits
app.post("/api/generate-reading", async (req, res) => {
  try {
    const { topic, userProfile, dayNumber } = req.body;
    const ai = getGeminiClient();

    const prompt = `
You are an author and mentor specializing in self-actualization, physical aesthetics, Stoic psychology, and personal transformation.
Generate an engaging, profound, high-value 10-minute daily reading module for a user on their Glow-Up journey.

Topic Focus: ${topic || "The Psychology of Radiance & Subconscious Self-Image"}
Day: ${dayNumber || 1}
User Details:
- Gender: ${userProfile?.gender || "All"}
- Age: ${userProfile?.age || 25}
- Goals: ${userProfile?.primaryGoals?.join(", ") || "Confidence, aesthetic physical glow, stress reduction"}

The reading should take approximately 10 minutes to read attentively (about 700-900 words) with structured sections:
1. Compelling Title & Subtitle
2. Key Paradigm Shift (The big insight)
3. 3 Practical Sections / Core Pillars with illustrative metaphors and scientific/historical depth
4. 3 Actionable Glow Takeaways (Checklist items for today)
5. Daily Journal Reflection Prompt for their "Book of Achievements"

Return ONLY valid JSON matching this schema:
{
  "id": "reading-${Date.now()}",
  "dayNumber": ${dayNumber || 1},
  "title": "The Psychology of Radiance: Aligning Internal State with Physical Presence",
  "topic": "${topic || "Mental Health & Magnetism"}",
  "estimatedReadMinutes": 10,
  "keyInsight": "Your outer glow is the somatic reflection of your autonomic nervous system and how you hold space inside your body.",
  "sections": [
    {
      "heading": "1. The Cortisol-Collagen Axis",
      "content": "When your nervous system is trapped in chronic low-grade fight-or-flight, elevated cortisol directly degrades skin collagen, promotes submental fluid retention, and causes unconscious furrowing of facial muscles. The first step to a physical glow is resetting the vagus nerve through deep nasal breathing and postural relaxation."
    },
    {
      "heading": "2. Sovereign Posture and Facial Ease",
      "content": "Observe how confident, relaxed individuals hold their jaw and shoulders. Their face is unburdened by chronic tension; the tongue rests naturally on the palate, the neck is elongated, and the gaze is steady. Physical beauty is largely the absence of unnecessary tension."
    },
    {
      "heading": "3. The Compounding Law of Daily Wins",
      "content": "True glow is earned through micro-commitments kept to yourself. When you log your achievement, drink your water, and train with intention, your brain releases dopamine that reflects in your eyes as genuine vitality."
    }
  ],
  "actionableTakeaways": [
    "Perform 5 slow nasal exhales to reset facial muscle tension right now.",
    "Rest your tongue against the roof of your mouth with teeth lightly parted.",
    "Log your first win in your Book of Achievements before sleep."
  ],
  "reflectionPrompt": "What is one area in your life where letting go of physical or mental tension would immediately elevate how you look and feel?"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/generate-reading:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate reading" });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Lumina Glow Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
