import React, { useState, useCallback, useEffect } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Common ingredient suggestions
const defaultIngredients = [
  'Chicken', 'Beef', 'Pork', 'Onion', 'Garlic',
  'Tomato', 'Potato', 'Carrot', 'Mushroom', 'Rice',
  'Pasta', 'Bell pepper', 'Broccoli', 'Cheese', 'Egg'
];

export default function InputField({ formData = {}, setFormData = () => {
  console.warn("setFormData is not provided to InputField");
} }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Wizard step state
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Initialize chips from formData.ingredients
  const initialChips = Array.isArray(formData.ingredients)
    ? formData.ingredients
    : typeof formData.ingredients === 'string'
      ? formData.ingredients.split(',').map(i => i.trim()).filter(Boolean)
      : [];

  const [chips, setChips] = useState(initialChips);
  const [ingredientInput, setIngredientInput] = useState('');

  // Sync chips to parent formData
  useEffect(() => {
    setFormData(prev => ({ ...prev, ingredients: chips }));
  }, [chips, setFormData]);

  const handleChange = (e) => {
    const { name, value, multiple, options } = e.target;
    if (multiple) {
      const selectedValues = Array.from(options).filter(option => option.selected).map(option => option.value);
      setFormData((prev) => ({ ...prev, [name]: selectedValues }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/spooncular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 🔥 ensures Supabase auth cookie is sent
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      console.log('Recipes:', data);
      localStorage.setItem('recipeResults', JSON.stringify(data));
      window.location.href = '/app/swipe';
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  return (
    <>
      {loading && <LoadingSpinner />}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-card space-y-6 max-w-md mx-auto">
      <div className="text-neutralDark font-medium text-center mb-4">
        Step {step} of {totalSteps}
      </div>

      {step === 1 && (
        <section style={{ marginBottom: '24px' }}>
          <h4 className="text-2xl font-semibold leading-tight text-neutralDark mb-2">Ingredients</h4>
          <div className="mt-1 flex flex-wrap items-center gap-2 border border-gray-300 rounded-md p-2">
            {chips.map((chip, index) => (
              <div key={index} className="flex items-center bg-neutralLight rounded-full px-3 py-1">
                <span className="text-base text-neutralDark">{chip}</span>
                <button
                  type="button"
                  onClick={() => setChips(prev => prev.filter((_, i) => i !== index))}
                  className="ml-1 text-gray-500 hover:text-gray-700 text-sm"
                  aria-label={`Remove ${chip}`}
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="text"
              value={ingredientInput}
              onChange={e => setIngredientInput(e.target.value)}
              list="ingredient-list"
              onKeyDown={e => {
                if ((e.key === 'Enter' || e.key === ',') && ingredientInput.trim()) {
                  e.preventDefault();
                  setChips(prev => [...prev, ingredientInput.trim()]);
                  setIngredientInput('');
                }
              }}
              placeholder="Add ingredient..."
              className="flex-1 min-w-[100px] p-1 outline-none"
            />
            <button
              type="button"
              onClick={() => {
                if (ingredientInput.trim()) {
                  setChips(prev => [...prev, ingredientInput.trim()]);
                  setIngredientInput('');
                }
              }}
              className="ml-2 px-3 py-1 bg-primary text-white rounded-full text-sm"
              aria-label="Add ingredient"
            >
              +
            </button>
          </div>
          <datalist id="ingredient-list">
            {defaultIngredients.map((item, idx) => (
              <option key={idx} value={item} />
            ))}
          </datalist>
        </section>
      )}

      {step === 2 && (
        <section style={{ marginBottom: '24px' }}>
          <h4 className="text-2xl font-semibold leading-tight text-neutralDark mb-2">Preferences</h4>
          <label className="block text-sm font-medium text-gray-700" htmlFor="diet">
            Dietary Preferences (optional):
            <select
              id="diet"
              name="diet"
              multiple
              value={formData?.diet || []}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="gluten-free">Gluten-Free</option>
              <option value="dairy-free">Dairy-Free</option>
              <option value="keto">Keto</option>
              <option value="paleo">Paleo</option>
              <option value="halal">Halal</option>
              <option value="kosher">Kosher</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700" htmlFor="maxCookingTime">
            Max Cooking Time (optional):
            <input
              type="number"
              id="maxCookingTime"
              name="maxCookingTime"
              value={formData?.maxCookingTime || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </label>

          <label className="block text-sm font-medium text-gray-700" htmlFor="cuisine">
            Cuisines (optional):
            <select
              id="cuisine"
              name="cuisine"
              multiple
              value={formData?.cuisine || []}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="African">African</option>
              <option value="American">American</option>
              <option value="British">British</option>
              <option value="Cajun">Cajun</option>
              <option value="Caribbean">Caribbean</option>
              <option value="Chinese">Chinese</option>
              <option value="Eastern European">Eastern European</option>
              <option value="European">European</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Greek">Greek</option>
              <option value="Indian">Indian</option>
              <option value="Irish">Irish</option>
              <option value="Italian">Italian</option>
              <option value="Japanese">Japanese</option>
              <option value="Jewish">Jewish</option>
              <option value="Korean">Korean</option>
              <option value="Latin American">Latin American</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Mexican">Mexican</option>
              <option value="Middle Eastern">Middle Eastern</option>
              <option value="Nordic">Nordic</option>
              <option value="Southern">Southern</option>
              <option value="Spanish">Spanish</option>
              <option value="Thai">Thai</option>
              <option value="Vietnamese">Vietnamese</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-gray-700" htmlFor="mealType">
            Meal Types (optional):
            <select
              id="mealType"
              name="mealType"
              multiple
              value={formData?.mealType || []}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="main course">Main Course</option>
              <option value="side dish">Side Dish</option>
              <option value="appetizer">Appetizer</option>
              <option value="salad">Salad</option>
              <option value="bread">Bread</option>
              <option value="breakfast">Breakfast</option>
              <option value="soup">Soup</option>
              <option value="beverage">Beverage</option>
              <option value="sauce">Sauce</option>
              <option value="marinade">Marinade</option>
              <option value="fingerfood">Fingerfood</option>
              <option value="snack">Snack</option>
              <option value="drink">Drink</option>
              <option value="dessert">Dessert</option>
            </select>
          </label>
        </section>
      )}

      {step === 3 && (
        <section style={{ marginBottom: '24px' }}>
          <h4 className="text-2xl font-semibold leading-tight text-neutralDark mb-2">Review & Search</h4>
          <p className="text-sm"><strong>Ingredients:</strong> {chips.join(', ')}</p>
          <p className="text-sm"><strong>Dietary Preferences:</strong> {(formData.diet || []).join(', ') || 'None'}</p>
          <p className="text-sm"><strong>Cuisines:</strong> {(formData.cuisine || []).join(', ') || 'Any'}</p>
          <p className="text-sm"><strong>Meal Types:</strong> {(formData.mealType || []).join(', ') || 'Any'}</p>
        </section>
      )}

      <div className="flex justify-between space-x-4">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(prev => prev - 1)}
            className="flex-1 border border-gray-300 py-2 rounded-xl text-base font-medium"
          >
            ← Back
          </button>
        )}
        {step < totalSteps && (
          <button
            type="button"
            onClick={() => setStep(prev => prev + 1)}
            className="flex-1 bg-primary text-white py-2 rounded-xl text-base font-medium hover:opacity-90"
          >
            Next →
          </button>
        )}
        {step === totalSteps && (
          <button
            type="submit"
            className="flex-1 bg-primary text-white py-2 rounded-xl text-base font-medium hover:opacity-90"
            disabled={loading}
          >
            {loading ? 'Searching...' : '🔍 Search Recipes'}
          </button>
        )}
      </div>
      {/* Optionally, keep error display below the wizard controls */}
      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </form>
    </>
  );
}
