import { useRouter } from 'next/router'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Layout from '../../components/Layout'
import BottomNav from '../../components/BottomNav'
import { Disclosure } from '@headlessui/react'

export default function RecipeDetail() {
  const router = useRouter()
  const { id } = router.query
  const [recipe, setRecipe] = useState(null)
  const [servings, setServings] = useState(1)
  const [nutrition, setNutrition] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = useMemo(() => {
    // Prefer steps stored in the DB
    if (Array.isArray(recipe?.steps) && recipe.steps.length > 0) {
      return recipe.steps;
    }
    const instr = recipe?.instructions || '';
    // Try to extract <li> elements
    const liMatches = Array.from(instr.matchAll(/<li>(.*?)<\/li>/g), m => m[1].trim());
    if (liMatches.length) {
      return liMatches;
    }
    // Fallback: split on headings like "Step 1"
    return instr
      .replace(/Step\s*\d+[:.-]?\s*/gi, '|STEP|')
      .split('|STEP|')
      .map(s => s.trim())
      .filter(Boolean);
  }, [recipe?.steps, recipe?.instructions]);

  // Normalize ingredients array (Supabase JSONB can be strings or objects)
  const ingredientsList = Array.isArray(recipe?.ingredients)
    ? recipe.ingredients
    : JSON.parse(recipe?.ingredients || '[]');

  const [isEditing, setIsEditing] = useState(false);
  const [customIngredients, setCustomIngredients] = useState([]);
  const [newIngredientInput, setNewIngredientInput] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [tweakedRecipe, setTweakedRecipe] = useState(null);

  useEffect(() => {
    if (recipe) {
      setCustomIngredients(ingredientsList);
      setCustomInstructions(steps.join('\n'));
    }
  }, [recipe, ingredientsList, steps]);

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        const { data, error } = await supabase
          .from('liked_recipes')
          .select('*')
          .eq('id', id)
          .single()
        if (error) console.error(error)
        else setRecipe(data)
      }

      fetchRecipe()
    }
  }, [id])

  useEffect(() => {
    const fetchNutrition = async () => {
      if (recipe) {
        const totalIngredients = ingredientsList.map(item => {
          if (typeof item === 'string') {
            return { name: item };
          }
          return { amount: item.amount, unit: item.unit, name: item.name };
        });
        const response = await fetch('/api/nutrition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ingredients: totalIngredients,
            servings: 1
          }),
        })
        const data = await response.json()
        if (!data.error) setNutrition(data)
        else console.error(data.error)
      }
    }

    fetchNutrition()
  }, [recipe, servings])

  const handleTweakRecipe = async () => {
    try {
      const response = await fetch('/api/customise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: recipe.title,
          customIngredients,
          customInstructions
        }),
      });
      const data = await response.json();
      if (data.error) {
        console.error('Customise API error:', data.error);
      } else {
        setTweakedRecipe(data);
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Unexpected error:', e);
    }
  };

  if (!recipe) return <Layout><p className="p-4">Loading...</p></Layout>

  return (
    <Layout>
      <div className="mt-24 p-4 max-w-xl mx-auto bg-white shadow rounded space-y-4">
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold mb-1">{recipe.title}</h1>
          <p className="text-gray-600 mb-2">Ready in {recipe.readyinminutes} min</p>
          {recipe.summary && (
            <p className="text-gray-700 mb-2">{recipe.summary}</p>
          )}
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full rounded mb-4"
          />
        </div>

        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full text-left px-4 py-2 bg-gray-100 rounded">
                <span className="font-medium">Ingredients</span>
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 py-2">
                <div className="mb-2">
                  <label htmlFor="servings" className="text-sm text-gray-600 mr-2">Servings:</label>
                  <input
                    id="servings"
                    type="number"
                    min="1"
                    value={servings}
                    onChange={(e) => setServings(Number(e.target.value))}
                    className="w-16 border rounded px-2 py-1 text-sm"
                  />
                </div>
                <ul className="list-disc pl-5">
                  {ingredientsList.map((item, i) => (
                    <li key={i}>
                      {typeof item === 'string'
                        ? item
                        : `${item.amount * servings} ${item.unit} ${item.name}`}
                    </li>
                  ))}
                </ul>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full text-left px-4 py-2 bg-gray-100 rounded">
                <span className="font-medium">Instructions</span>
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 py-2">
                {steps.map((step, idx) => (
                  <div key={idx} className="mb-2">
                    <p className="font-semibold">Step {idx + 1}</p>
                    <p className="text-gray-700 text-sm">{step}</p>
                  </div>
                ))}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <Disclosure>
          {({ open }) => (
            <>
              <Disclosure.Button className="w-full text-left px-4 py-2 bg-gray-100 rounded">
                <span className="font-medium">Nutrition</span>
              </Disclosure.Button>
              <Disclosure.Panel className="px-4 py-2">
                {nutrition && nutrition.calories ? (
                  <ul className="list-disc pl-5">
                    <li>Calories: {Math.round(parseFloat(nutrition.calories))} kcal</li>
                    <li>Protein: {Math.round(parseFloat(nutrition.protein))}g</li>
                    <li>Fat: {Math.round(parseFloat(nutrition.fat))}g</li>
                    <li>Carbs: {Math.round(parseFloat(nutrition.carbs))}g</li>
                  </ul>
                ) : (
                  <p>Loading nutrition info...</p>
                )}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
        {tweakedRecipe && (
          <div className="pt-4 border-t">
            <h2 className="text-xl font-semibold mb-2">Tweaked Recipe</h2>
            <h3 className="text-lg font-semibold">{tweakedRecipe.title}</h3>
            <h4 className="mt-2 font-semibold">Ingredients</h4>
            <ul className="list-disc pl-5">
              {tweakedRecipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
            <h4 className="mt-4 font-semibold">Instructions</h4>
            <ol className="list-decimal list-inside space-y-2">
              {tweakedRecipe.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        )}
        {/* Customize Recipe Section */}
        <div className="pt-4 border-t">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-full text-left px-4 py-2 bg-primary text-white rounded mb-2"
          >
            {isEditing ? 'Cancel' : 'Customize Recipe'}
          </button>
          {isEditing && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Edit Ingredients</h2>
              <ul className="list-disc pl-5 space-y-1">
                {customIngredients.map((ing, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span>{typeof ing === 'string' ? ing : `${ing.amount} ${ing.unit} ${ing.name}`}</span>
                    <button
                      onClick={() =>
                        setCustomIngredients(prev => prev.filter((_, i) => i !== idx))
                      }
                      className="text-red-500 text-sm"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newIngredientInput}
                  onChange={e => setNewIngredientInput(e.target.value)}
                  placeholder="Add new ingredient"
                  className="flex-1 border rounded px-2 py-1"
                />
                <button
                  onClick={() => {
                    if (newIngredientInput.trim()) {
                      setCustomIngredients(prev => [...prev, newIngredientInput.trim()]);
                      setNewIngredientInput('');
                    }
                  }}
                  className="px-3 py-1 bg-primary text-white rounded"
                >
                  Add
                </button>
              </div>
              <h2 className="text-xl font-semibold">Edit Instructions</h2>
              <textarea
                rows={6}
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value)}
                className="w-full border rounded p-2"
              />
              <button
                onClick={handleTweakRecipe}
                className="w-full px-4 py-2 bg-accent text-white rounded"
              >
                Generate Tweaked Recipe
              </button>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </Layout>
  )
}