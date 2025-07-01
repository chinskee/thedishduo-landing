let uniqueIdCounter = 1;
import { chatCompletion } from '../../lib/openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Unsplash image fetcher for each recipe
async function fetchUnsplashImage(query) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn('Unsplash access key is not set');
    return { url: null, downloadLocation: null, photographerName: null, photographerProfileUrl: null };
  }
  try {
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${accessKey}&per_page=1`
    );
    const data = await response.json();
    if (data && data.results && data.results.length > 0) {
      const photo = data.results[0];
      return {
        url: photo.urls.small,
        downloadLocation: photo.links.download_location,
        photographerName: photo.user.name,
        photographerProfileUrl: photo.user.links.html,
      };
    }
    return { url: null, downloadLocation: null, photographerName: null, photographerProfileUrl: null };
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return { url: null, downloadLocation: null, photographerName: null, photographerProfileUrl: null };
  }
}

// Normalize recipe to match liked recipes DB
function normalizeRecipe(recipe, unsplashData) {
  let id = recipe.id;
  if (!id) {
    id = `openai_${(recipe.title || '').replace(/\s+/g, '_').toLowerCase()}_${uniqueIdCounter++}`;
  }
  // Some fields may be missing, so set defaults
  const {
    url,
    downloadLocation,
    photographerName,
    photographerProfileUrl
  } = unsplashData || {};
  return {
    id,
    title: recipe.title || '',
    extendedIngredients: Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map(i => ({
          name: i.name || '',
          amount: i.amount || 0,
          unit: i.unit || '',
          original: i.original || `${i.amount || ''} ${i.unit || ''} ${i.name || ''}`.trim(),
        }))
      : [],
    readyInMinutes: recipe.readyInMinutes || 0,
    instructions: recipe.instructions || '',
    summary: recipe.summary || '',
    image: url || recipe.image_url || '',
    unsplashDownloadLink: downloadLocation || null,
    photographerName: photographerName || null,
    photographerProfileUrl: photographerProfileUrl || null,
    analyzedInstructions: [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    nutrition: null, // OpenAI can't provide reliable nutrition
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let { ingredients, intolerances, diet, cuisine, mealType, maxCookingTime } = req.body;

  // Clean up input for prompt
  const promptIngredients = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients || '';
  const promptDiet = Array.isArray(diet) ? diet.join(', ') : diet || '';
  const promptCuisine = Array.isArray(cuisine) ? cuisine.join(', ') : cuisine || '';
  const promptMealType = Array.isArray(mealType) ? mealType.join(', ') : mealType || '';

  try {
    // Build GPT prompt
    const prompt = `
You are a professional chef assistant. 
Generate 3 realistic, high-quality recipes using these settings:
- Ingredients: ${promptIngredients}
${promptDiet ? '- Diet: ' + promptDiet : ''}
${promptCuisine ? '- Cuisine: ' + promptCuisine : ''}
${promptMealType ? '- Meal Type: ' + promptMealType : ''}
${maxCookingTime ? '- Max cooking time: ' + maxCookingTime + ' minutes' : ''}
For each recipe, output these fields as an array:
- title (string)
- ingredients (array of objects: name, amount, unit)
- readyInMinutes (number)
- instructions (string, with clear steps)
- summary (string)
- image_url (string, can be blank)
- steps (array of strings describing each step)
Example format:
[
  {
    "title": "Lemon Herb Chicken",
    "ingredients": [{"name": "chicken breast", "amount": 2, "unit": "pieces"}],
    "readyInMinutes": 30,
    "instructions": "Step 1: ..., Step 2: ...",
    "summary": "A tasty lemony chicken dish.",
    "image_url": "",
    "steps": ["Step 1: ...", "Step 2: ..."]
  }
]
Respond only with the JSON array.`;

    // Call GPT
    const text = await chatCompletion(prompt);

    let recipes;
    try {
      let jsonText = text.trim();
      // Remove code fences if present
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      const match = jsonText.match(/(\[.*\])/s);
      if (match) jsonText = match[1];
      // Remove trailing commas
      jsonText = jsonText.replace(/,(\s*[\]}])/g, '$1');
      // Convert fractional numbers (e.g., 1/4) to decimals
      jsonText = jsonText.replace(/"amount"\s*:\s*(\d+)\/(\d+)/g, (_, num, den) => {
        const val = Number(num) / Number(den);
        return `"amount": ${val}`;
      });
      recipes = JSON.parse(jsonText);
      if (!Array.isArray(recipes)) throw new Error('Expected an array');
    } catch (e) {
      console.error('Failed to parse GPT recipes:', e, text);
      return res.status(500).json({ error: 'Failed to parse GPT recipes', raw: text });
    }

    // For each recipe, fetch an Unsplash image for the title
    const results = await Promise.all(
      recipes.map(async r => {
        const unsplashData = await fetchUnsplashImage(r.title || r.name || '');
        return normalizeRecipe(r, unsplashData);
      })
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error('GPT API error:', error);
    return res.status(500).json({ error: 'Something went wrong generating recipes' });
  }
}