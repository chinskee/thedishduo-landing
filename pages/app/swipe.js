import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import SwipeDeck from '../../components/SwipeDeck';

export default function SwipePage() {
  const [recipes, setRecipes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const supabase = useSupabaseClient();
  const session = useSession();

  const wrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '8 0vh',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: 'env(safe-area-inset-bottom)', // mobile safe-area
    boxSizing: 'border-box',
  };

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem('fetchedRecipes') ||
        localStorage.getItem('recipeResults');

      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.recipes) && parsed.recipes.length > 0) {
          setRecipes(parsed.recipes);
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          setRecipes(parsed);
        } else {
          console.warn('Fetched recipes are empty or malformed', parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load recipes from localStorage', error);
    }
  }, []);

  const handleLikeFromSwipe = async (recipe) => {
    if (!recipe || !recipe.title) return;

    if (!session) return;

    await fetch('/api/save-liked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: recipe.title,
        image_url: recipe.image || recipe.image_url,
        readyinminutes: recipe.readyinminutes ?? recipe.readyInMinutes ?? 0,
        instructions:
          recipe.instructions ||
          recipe.summary ||
          'No instructions provided.',
        ingredients:
          recipe.ingredients?.length > 0
            ? recipe.ingredients
            : recipe.extendedIngredients?.map((i) => i.original || i.name).filter(Boolean) || [],
        extendedIngredients: recipe.extendedIngredients || [],
        analyzedInstructions: recipe.analyzedInstructions || [],
        summary: recipe.summary || '',
        user_id: session.user.id
      })
    });

    setCurrentIndex((prev) => prev + 1);
  };

  const handleSkipFromSwipe = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  let content;
  if (!session) {
    content = <p className="text-center p-4">Loading session...</p>;
  } else if (!recipes.length) {
    content = <p className="text-center p-4">No recipes found. Please return to the home page and try again.</p>;
  } else if (currentIndex >= recipes.length) {
    content = <p className="text-center p-4">No more recipes! 🎉</p>;
  } else {
    content = (
      <SwipeDeck
        recipes={recipes}
        currentIndex={currentIndex}
        onSwipe={(recipe, liked) => {
          console.log(`Swiped ${liked ? 'right' : 'left'}: ${recipe.title}`);
          if (liked) handleLikeFromSwipe(recipe);
          else handleSkipFromSwipe();
        }}
        onEnd={() => console.log('No more recipes to swipe')}
        bottomOffset={40}
      />
    );
  }

  return (
    <div style={wrapperStyle}>
      {content}
    </div>
  );
}