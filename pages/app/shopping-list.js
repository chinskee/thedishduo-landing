import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

export default function ShoppingList() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [ingredients, setIngredients] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    if (session) {
      fetchSavedIngredients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchSavedIngredients = async () => {
    const { data, error } = await supabase
      .from('liked_recipes')
      .select('ingredients');

    if (error) {
      console.error('Error fetching recipes:', error);
      return;
    }

    // Flatten and normalize ingredients: support both string entries and objects
    const allIngredients = data.flatMap((recipe) => recipe.ingredients || []);

    // Normalize each entry to an object with name, amount, unit
    const normalized = allIngredients
      .map((ing) => {
        if (typeof ing === 'string') {
          return { name: ing, amount: 1, unit: '' };
        }
        // assume object with name, amount, unit properties
        return ing;
      })
      .filter((ing) => ing && typeof ing.name === 'string');

    // Group by lowercase name, summing amounts
    const grouped = {};
    normalized.forEach(({ name, amount, unit }) => {
      const key = name.toLowerCase();
      if (!grouped[key]) {
        grouped[key] = { name, amount, unit };
      } else {
        grouped[key].amount += amount;
      }
    });

    setIngredients(Object.values(grouped));
    setCheckedItems({});
  };

  return (
    <div className="pt-32 p-4">
      <h1 className="text-2xl font-bold mb-4">🛒 Shopping List</h1>
      {ingredients.length === 0 ? (
        <p>No ingredients found.</p>
      ) : (
        <ul className="space-y-2">
          {ingredients.map((item, index) => (
            <li
              key={index}
              className={`bg-white rounded-xl shadow-card p-3 flex justify-between items-center ${checkedItems[index] ? 'line-through text-gray-400' : ''}`}
            >
              <input
                type="checkbox"
                checked={checkedItems[index] || false}
                onChange={() =>
                  setCheckedItems((prev) => ({
                    ...prev,
                    [index]: !prev[index],
                  }))
                }
                className="mr-3"
              />
              <span className="flex-1 capitalize">{item.name}</span>
              <span className="text-gray-600">
                {item.amount} {item.unit}
              </span>
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => setCheckedItems({})}
        className="mt-4 bg-gray-200 hover:bg-gray-300 text-sm text-gray-800 px-4 py-2 rounded"
      >
        Reset List
      </button>
    </div>
  );
}