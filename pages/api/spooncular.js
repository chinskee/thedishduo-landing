
// In-memory caches without external dependencies
const recipeCache = new Map();
const userHistory = new Map();
let uniqueIdCounter = 1;

async function fetchUnsplashImage(query) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn('Unsplash access key is not set');
    return null;
  }
  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&client_id=${accessKey}&per_page=1`);
    const data = await response.json();
    if (data && data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return null;
  }
}

// Normalize a recipe object to a consistent structure
function normalizeRecipe(recipe) {
  let id = recipe.id;
  if (!id) {
    // Use title + random + counter for uniqueness
    id = `openai_${(recipe.title || '').replace(/\s+/g, '_').toLowerCase()}_${uniqueIdCounter++}`;
  }
  // Some fields may be missing from OpenAI or Spoonacular, so set defaults
  return {
    id,
    title: recipe.title || '',
    extendedIngredients: (() => {
      if (Array.isArray(recipe.extendedIngredients) && recipe.extendedIngredients.length > 0) {
        return recipe.extendedIngredients.map(i => ({
          name: i.name || '',
          amount: i.amount || 0,
          unit: i.unit || '',
          original: i.original || '',
        }));
      }
      if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
        return recipe.ingredients.map(i => ({
          name: i.name || '',
          amount: i.amount || 0,
          unit: i.unit || '',
          original: i.original || `${i.amount || ''} ${i.unit || ''} ${i.name || ''}`.trim(),
        }));
      }
      return [];
    })(),
    readyInMinutes: recipe.readyInMinutes || 0,
    instructions: recipe.instructions || '',
    summary: recipe.summary || '',
    image: recipe.image || recipe.image_url || '',
    analyzedInstructions: Array.isArray(recipe.analyzedInstructions)
      ? recipe.analyzedInstructions.map(instr => ({
          name: instr.name || '',
          steps: Array.isArray(instr.steps)
            ? instr.steps.map(step => ({
                number: step.number || 0,
                step: step.step || '',
              }))
            : [],
        }))
      : [],
    steps: Array.isArray(recipe.steps) ? recipe.steps : [],
    nutrition: recipe.nutrition || null, // <-- add this line to include nutrients
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Use a static userId since auth is disabled
  const userId = 'anonymous';

  let { ingredients, intolerances, diet, cuisine, mealType, maxCookingTime } = req.body

  // Build cache key from filters
  const filtersKey = JSON.stringify({ ingredients, intolerances, diet, cuisine, mealType, maxCookingTime });

  if (cuisine && typeof cuisine === 'string') {
    cuisine = cuisine.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (mealType && typeof mealType === 'string') {
    mealType = mealType.split(',').map(s => s.trim()).filter(Boolean);
  }


  if (ingredients && typeof ingredients === 'string') {
    ingredients = ingredients.split(',').map(i => i.trim()).filter(Boolean);
  } else if (ingredients && !Array.isArray(ingredients)) {
    return res.status(400).json({ error: 'Ingredients must be an array if provided' });
  }

  try {
    const apiKey = process.env.SPOONACULAR_API_KEY
    const baseUrl = 'https://api.spoonacular.com/recipes/complexSearch'

    const offset = 0;

    const queryParams = {
      apiKey,
      number: '10',
      instructionsRequired: 'true',
      addRecipeInformation: 'true',
      ignorePantry: true,
      ...(Array.isArray(ingredients) && ingredients.length > 0
        ? { includeIngredients: ingredients.join(',') }
        : {}),
      ...(Array.isArray(intolerances) && intolerances.length > 0
        ? { intolerances: intolerances.join(',') }
        : {}),
      ...(Array.isArray(diet) && diet.length > 0
        ? { diet: diet.join(',') }
        : {}),
      ...(Array.isArray(cuisine) && cuisine.length > 0 ? { cuisine: cuisine.join(',') } : {}),
      ...(Array.isArray(mealType) && mealType.length > 0
        ? { type: mealType.join(',') }
        : {}),
      ...(maxCookingTime ? { maxReadyTime: maxCookingTime.toString() } : {}),
      sort: 'random',
      offset,
      addRecipeNutrition: 'true',
      addRecipeInstructions: 'true',
    };

    const query = new URLSearchParams(queryParams);

    // Log the queryParams and the full URL being called
    console.log('Spoonacular queryParams:', queryParams);
    console.log('Spoonacular request URL:', `${baseUrl}?${query.toString()}`);

    const response = await fetch(`${baseUrl}?${query.toString()}`)
    const data = await response.json();
    // Roughly estimate token/request count for Spoonacular (query string length)
    const spoonacularTokenEstimate = (query.toString().length / 4).toFixed(1);
    console.log('Spoonacular API raw response:', JSON.stringify(data, null, 2));
    console.log(`Spoonacular request token estimate: ~${spoonacularTokenEstimate} tokens`);

    // Start with the raw results
    let recipesWithDetails = data.results;

    // If any recipe came back without ingredients, do a single bulk info fetch
    const needBulkInfo = Array.isArray(recipesWithDetails) &&
      recipesWithDetails.some(
        r => !Array.isArray(r.extendedIngredients) || r.extendedIngredients.length === 0
      );
    if (needBulkInfo) {
      console.log('Fetching full ingredient lists via informationBulk…');
      const ids = recipesWithDetails.map(r => r.id).join(',');
      const infoUrl = `https://api.spoonacular.com/recipes/informationBulk?apiKey=${apiKey}&ids=${ids}&includeNutrition=true`;
      const infoRes = await fetch(infoUrl);
      recipesWithDetails = await infoRes.json();
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data.message || 'Failed to fetch recipes' })
    }

    function countMatchingIngredients(recipeIngredients, userIngredients) {
      if (!recipeIngredients || !userIngredients) return 0;
      const lowerUserIngredients = userIngredients.map(i => i.toLowerCase());
      return recipeIngredients.reduce((count, ingredient) => {
        const name = (ingredient.name || ingredient.original || '').toLowerCase();
        return lowerUserIngredients.some(ui => name.includes(ui)) ? count + 1 : count;
      }, 0);
    }

    let filtered;
    if (Array.isArray(ingredients) && ingredients.length > 0) {
      // Only filter by ingredients when user provided some
      filtered = recipesWithDetails.filter(recipe => {
        const matchCount = countMatchingIngredients(recipe.extendedIngredients, ingredients);
        return matchCount > 0;
      });
      // Sort by descending match count
      filtered.sort((a, b) => {
        const aCount = countMatchingIngredients(a.extendedIngredients, ingredients);
        const bCount = countMatchingIngredients(b.extendedIngredients, ingredients);
        return bCount - aCount;
      });
    } else {
      // No ingredients filter — return all results
      filtered = recipesWithDetails;
    }

    function extractInstructionText(recipe) {
      if (!recipe.analyzedInstructions || recipe.analyzedInstructions.length === 0) return [];
      const stepsText = [];
      recipe.analyzedInstructions.forEach(group => {
        group.steps.forEach(step => {
          stepsText.push(`Step ${step.number}: ${step.step}`);
        });
      });
      return stepsText;
    }

    // Build final results using existing analyzedInstructions
    const results = filtered
      .filter(r => typeof r.id === 'number' && r.id > 0)
      .map(r => {
        // Clean summary
        const htmlSummary = r.summary || '';
        const summary = htmlSummary
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim() || r.title || '';
        // Use pre-fetched analyzedInstructions for steps
        const steps = extractInstructionText(r);
        return { ...r, summary, steps };
      });

    // Normalize recipes
    const normalized = results.map(normalizeRecipe);
    console.log('Returning sanitized recipes:', normalized);

    // Caching recipes per filtersKey
    let allRecipes = recipeCache.get(filtersKey);
    if (!allRecipes) {
      console.log('🔄 Fetching recipes from Spoonacular…');
      recipeCache.set(filtersKey, normalized);
      allRecipes = normalized;
    } else {
      console.log('📦 Returning cached recipes');
    }

    // Per-user de-duplication
    const historyKey = `${userId}:${filtersKey}`;
    let shownIds = userHistory.get(historyKey) || [];
    const unseen = allRecipes.filter(r => !shownIds.includes(r.id));
    const toShow = unseen.length > 0 ? unseen : allRecipes;
    // Update history
    const newlyShown = toShow.map(r => r.id);
    userHistory.set(historyKey, [...shownIds, ...newlyShown]);

    return res.status(200).json(toShow);
  } catch (error) {
    console.error('Spoonacular API error:', error);
    // On error fallback removed, return error response instead
    return res.status(500).json({ error: 'Failed to fetch recipes from Spoonacular' });
  }
}