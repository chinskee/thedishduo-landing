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
    // Edamam Recipe Search
    const appId = process.env.EDAMAM_APP_ID;
    const appKey = process.env.EDAMAM_APP_KEY;
    const edBase = 'https://api.edamam.com/api/recipes/v2';
    // Build a non-empty q parameter: prefer ingredients, then cuisine, then mealType, then diet
    const searchQuery =
      Array.isArray(ingredients) && ingredients.length > 0
        ? ingredients.join(',')
        : Array.isArray(cuisine) && cuisine.length > 0
          ? cuisine.join(',')
          : Array.isArray(mealType) && mealType.length > 0
            ? mealType.join(',')
            : Array.isArray(diet) && diet.length > 0
              ? diet.join(',')
              : '';
    // Ensure q is never empty: default to generic 'recipe'
    const safeQuery = searchQuery.trim() === '' ? 'recipe' : searchQuery;
    const edParams = new URLSearchParams({
      type: 'public',
      q: safeQuery,
      app_id: appId,
      app_key: appKey,
      ...(Array.isArray(diet) && diet.length > 0 ? { diet: diet.join(',') } : {}),
      ...(Array.isArray(cuisine) && cuisine.length > 0 ? { cuisineType: cuisine.join(',') } : {}),
      ...(Array.isArray(mealType) && mealType.length > 0 ? { mealType: mealType.join(',') } : {}),
    });
    console.log('Edamam request URL:', `${edBase}?${edParams.toString()}`);
    const resEd = await fetch(`${edBase}?${edParams.toString()}`, {
      headers: {
        'Edamam-Account-User': userId
      }
    });
    if (!resEd.ok) {
      return res.status(resEd.status).json({ error: 'Failed to fetch recipes from Edamam' });
    }
    const edData = await resEd.json();
    // Extract recipe objects
    const recipesWithDetails = Array.isArray(edData.hits)
      ? edData.hits.map(hit => hit.recipe)
      : [];
    // Map to your normalized shape
    const normalized = recipesWithDetails.map(r => ({
      id: (r.uri.split('#recipe_')[1] || r.uri),
      title: r.label || '',
      image: r.image || '',
      image_url: r.image || '',
      extendedIngredients: Array.isArray(r.ingredients)
        ? r.ingredients.map(i => ({
            name: i.food || '',
            amount: i.weight || 0,
            unit: 'g',
            original: i.text || '',
          }))
        : [],
      readyInMinutes: r.totalTime || 0,
      instructions: '',        // Edamam does not supply instructions
      summary: r.source || '',
      steps: Array.isArray(r.ingredientLines) ? r.ingredientLines : [],
      analyzedInstructions: [], // No analyzed instructions from Edamam
      nutrition: r.totalNutrients || null,
    }));
    console.log('Returning sanitized recipes:', normalized);

    // Caching recipes per filtersKey
    let allRecipes = recipeCache.get(filtersKey);
    if (!allRecipes) {
      console.log('🔄 Fetching recipes from Edamam…');
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
    console.error('Edamam API error:', error);
    return res.status(500).json({ error: 'Failed to fetch recipes from Edamam' });
  }
}