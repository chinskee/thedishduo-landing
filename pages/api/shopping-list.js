// pages/api/shopping-list.js
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function handler(req, res) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;

  if (!user) return res.status(401).json({ error: 'Not authenticated' });

  const { data: recipes, error } = await supabase
    .from('liked_recipes')
    .select('extendedIngredients, ingredients')
    .eq('user_id', user.id)
    .not('ingredients', 'is', null);

  if (error) {
    return res.status(500).json({ error: 'Database error', details: error.message });
  }

  if (!recipes || recipes.length === 0) {
    return res.status(404).json({ error: 'No liked recipes found' });
  }

  const allIngredients = recipes.flatMap(r => {
    // Use structured extendedIngredients if available
    if (Array.isArray(r.extendedIngredients) && r.extendedIngredients.length) {
      return r.extendedIngredients.map(i => ({
        name: i.name || i.original,
        amount: i.amount || 0,
        unit: i.unit || '',
      }));
    }
    // Fallback to simple ingredients array of strings
    return (r.ingredients || []).map(str => ({
      name: str,
      amount: 1,
      unit: '',
    }));
  });
  const merged = {};

  for (const item of allIngredients) {
    const key = `${item.name.toLowerCase()}|${item.unit}`;
    if (!merged[key]) merged[key] = { ...item };
    else merged[key].amount += item.amount;
  }

  const shoppingList = Object.values(merged);
  return res.status(200).json({ shoppingList });
}