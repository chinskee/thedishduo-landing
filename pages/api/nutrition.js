export default async function handler(req, res) {
    console.log('🧪 Incoming request to /api/nutrition');
  
    if (req.method !== 'POST') {
      console.log('❌ Invalid method');
      return res.status(405).json({ error: 'Only POST requests allowed' });
    }
  
    const { ingredients, servings } = req.body;
    console.log('📦 Payload received:', { ingredients, servings });
  
    if (!ingredients || !Array.isArray(ingredients)) {
      console.log('❌ Missing or invalid ingredients array');
      return res.status(400).json({ error: 'Missing or invalid ingredients array' });
    }
  
    try {
      if (!process.env.SPOONACULAR_API_KEY) {
        return res.status(500).json({ error: 'Missing Spoonacular API key in environment variables' });
      }
      const response = await fetch(
        `https://api.spoonacular.com/recipes/analyze?includeNutrition=true&apiKey=${process.env.SPOONACULAR_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: "Recipe",
            servings: servings || 1,
            ingredients: ingredients.map(i => `${i.amount} ${i.unit} ${i.name}`),
            instructions: "Stir and cook as desired" // placeholder, can be updated if UI supports this
          }),
        }
      );
  
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response received from Spoonacular:', {
          url: "https://api.spoonacular.com/recipes/analyzeIngredients",
          response: text
        });
        return res.status(500).json({ error: 'Unexpected non-JSON response from Spoonacular. Check API key and parameters.' });
      }
      const data = await response.json();
      console.log('📥 Spoonacular response:', data);
  
      if (data.status === 'failure') {
        return res.status(400).json({ error: data.message || 'Spoonacular API error' });
      }
  
      const nutrients = data?.nutrition?.nutrients || data?.nutritionEstimates || [];

      // Remove per-serving scaling if previously done on frontend
      // Spoonacular already returns per-serving nutrition based on the 'servings' sent
      const summary = {
        calories: `${Math.round(nutrients.find(n => n.name === 'Calories')?.amount || 0)} kcal`,
        protein: `${Math.round(nutrients.find(n => n.name === 'Protein')?.amount || 0)}g`,
        fat: `${Math.round(nutrients.find(n => n.name === 'Fat')?.amount || 0)}g`,
        carbs: `${Math.round(nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0)}g`,
      };

      if (Array.isArray(nutrients) && nutrients.length > 0) {
        console.log('✅ Summary:', summary);
        return res.status(200).json(summary);
      } else {
        console.log('❌ No nutrients array found in Spoonacular response');
        return res.status(400).json({ error: 'No nutritional data found in response. Check API limits or formatting.' });
      }
    } catch (err) {
      console.error('🔥 Error during fetch:', err);
      return res.status(500).json({ error: 'Server error fetching analyzed recipe nutrition' });
    }
  }