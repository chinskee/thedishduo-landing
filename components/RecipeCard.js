import React from 'react';

export default function SavedRecipes({ recipes }) {
  return (
    <div>
      {recipes.map((recipe) => {
        const parsedIngredients = React.useMemo(() => {
          try {
            return Array.isArray(recipe.ingredients)
              ? recipe.ingredients
              : JSON.parse(recipe.ingredients || '[]');
          } catch {
            return [];
          }
        }, [recipe.ingredients]);

        return (
          <div key={recipe.id} className="max-w-sm bg-white rounded-xl shadow-card overflow-hidden">
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="p-4">
              <h2 className="text-2xl font-bold text-neutralDark mb-4">{recipe.title}</h2>
              <p className="text-neutralDark mb-4">Ready in {recipe.readyInMinutes} minutes</p>

              <h3 className="text-xl font-semibold text-neutralDark mb-2">Ingredients:</h3>
              <ul className="list-disc list-inside mb-4 text-base leading-relaxed">
                {parsedIngredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-neutralDark mb-2">Instructions:</h3>
              <div
                className="text-base text-neutralDark leading-relaxed space-y-2"
                dangerouslySetInnerHTML={{ __html: recipe.instructions || '' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
