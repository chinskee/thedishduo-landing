import OpenAI from 'openai';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.OPENAI_API_KEY || !process.env.UNSPLASH_ACCESS_KEY) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Missing required environment variables' });
  }

  const { ingredients = '', allergies = '', preferences = '', maxTime = '', diet = '', theme = '' } = req.body;

  const pantry = ingredients.split(',').map(i => i.trim()).filter(Boolean);
  const allergyList = allergies.split(',').map(i => i.trim()).filter(Boolean);
  const prefs = preferences.trim();
  const maxCookTime = maxTime.trim();
  const dietPref = diet.trim();
  const mealThemes = Array.isArray(theme) ? theme.join(', ') : theme;

  const ingredientsHash = crypto.createHash('md5').update(JSON.stringify(pantry.sort())).digest('hex');

  try {
    const { data: cached, error: cachedError } = await supabase
      .from('recipes')
      .select('*')
      .eq('ingredients_hash', ingredientsHash)
      .limit(5);

    if (cached && cached.length === 5) {
      return res.status(200).json({ recipes: cached });
    }
  } catch (err) {
    console.error('Supabase cache lookup failed:', err);
  }

  const prompt = `
You are a helpful and realistic recipe assistant. Based on the following inputs, generate exactly 5 different recipes in valid JSON array format. Do NOT include any extra text before or after the JSON:

Ingredients available: ${pantry.join(', ')}
Allergies: ${allergyList.join(', ')}
Dietary requirements: ${dietPref}
Meal theme preferences: ${mealThemes}
User preferences: ${prefs}
Maximum cooking time: ${maxCookTime}
Number of servings: 1

Guidelines:
- You may use any combination of the available ingredients, but not all are required.
- It's okay to include realistic pantry staples (e.g., oil, salt, spices, garlic, stock) even if not listed.
- Use common sense and culinary experience — suggest balanced, flavorful meals that could be made by a home cook. If a user only lists eggs and onions, don’t create “egg and onion soup” — instead suggest a more plausible dinner, like a frittata with a side salad, or use those ingredients as components of a larger, realistic recipe.
- Ensure each recipe sounds appealing and realistic given typical home ingredients.
- Only suggest evening-style meals — avoid breakfast, dessert, or snack ideas like cakes or smoothies.
- Write the recipes in the confident tone and precise, flavorful style of a top chef (e.g., Gordon Ramsay or Jamie Oliver).
- Each recipe must be a JSON object with:
  - title (string)
  - ingredients (array of { name, amount (number), unit (string) })
  - readyInMinutes (number)
  - Include specific temperatures (e.g., "Bake at 180°C") and approximate timing in each step (e.g., "Simmer for 10 minutes").
  - instructions (string): Write this as clearly numbered, short steps. Include precise actions, temperatures, and estimated times per step when relevant (e.g., "Step 1: Preheat oven to 200°C (400°F). Step 2: Bake for 25 minutes.")
- Ensure all ingredient values are valid JSON. 'amount' should be a number (e.g., 1, 0.5, 2), and 'unit' should be a string (e.g., "cup", "g", ""). Avoid expressions like "1 cup" or "1/2 tsp" directly in the amount field — split them into proper amount and unit fields.
`;

  console.log('Received request body:', req.body);

  let json;
  try {
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-0125',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    console.log('OpenAI response received');

    json = aiResponse.choices?.[0]?.message?.content;
    if (!json) throw new Error('No content in OpenAI response');

    console.log('AI raw output:', json);
    json = json.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();

  } catch (err) {
    console.error('Error calling OpenAI:', err);
    return res.status(500).json({ error: 'OpenAI call failed', details: err.message });
  }

  let recipes;
  try {
    recipes = JSON.parse(json);
    console.log('Parsed recipes:', recipes);
  } catch (err) {
    console.error('JSON parsing failed:', err);
    return res.status(500).json({ error: 'Invalid JSON from AI', raw: json, details: err.message });
  }

  try {
    const enhancedRecipes = await Promise.all(
      recipes.map(async (recipe) => {
        let imageUrl = null;
        try {
          imageUrl = await fetchWithTimeout(fetchUnsplashImage(recipe.title), 3000);
        } catch (err) {
          console.warn(`Image fetch skipped for "${recipe.title}"`);
        }
        return {
          ...recipe,
          image_url: imageUrl,
        };
      })
    );

    try {
      for (const recipe of enhancedRecipes) {
        await supabase.from('recipes').insert({
          title: recipe.title,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          ready_in_minutes: recipe.readyInMinutes,
          image_url: recipe.image_url || null,
          ingredients_hash: ingredientsHash
        });
      }
    } catch (err) {
      console.error('Failed to cache recipes in Supabase:', err);
    }

    return res.status(200).json({ recipes: enhancedRecipes });
  } catch (err) {
    console.error('Error generating recipes:', err);
    return res.status(500).json({ error: 'Failed to generate recipes', details: err.message });
  }
}

// Helper to fetch with timeout
function fetchWithTimeout(promise, timeout = 3000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Image fetch timed out')), timeout)
    ),
  ]);
}

// Helper to fetch Unsplash image
async function fetchUnsplashImage(query) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: { Authorization: `Client-ID ${accessKey}` }
    });
    const data = await res.json();
    return data.results?.[0]?.urls?.regular || null;
  } catch (err) {
    console.error('Unsplash image fetch failed:', err);
    return null;
  }
}