import React, { useState, useEffect, useRef } from 'react';
import TinderCard from 'react-tinder-card';
import SwipeButtons from './SwipeButtons';
import BottomSheet from './BottomSheet';

export default function SwipeDeck({ recipes = [], onSwipe, onEnd }) {
  const [currentIndex, setCurrentIndex] = useState(recipes.length - 1);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState(null);

  // keep refs in case you want programmatic swipes later
  const childRefs = useRef(recipes.map(() => React.createRef()));

  // reset index when recipes change
  useEffect(() => {
    setCurrentIndex(recipes.length - 1);
  }, [recipes]);

  // notify when deck is empty
  useEffect(() => {
    if (currentIndex < 0 && onEnd) onEnd();
  }, [currentIndex, onEnd]);

  // detect desktop vs mobile
  useEffect(() => {
    const updateSize = () => setIsDesktop(window.innerWidth >= 768);
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);


  const swiped = (direction, recipe, index) => {
    // if user swipes up, just open details
    if (direction === 'up') {
      setDetailRecipe(recipe);
      setShowDetails(true);
      return;
    }
    // otherwise close any open details
    setShowDetails(false);
    setDetailRecipe(null);

    // left/right = dislike/like
    const liked = direction === 'right';
    onSwipe(recipe, liked);
    setCurrentIndex(index - 1);
  };

  const outOfFrame = (title) => {
    console.log(`${title} left the screen`);
  };

  if (!recipes.length) {
    return <p className="text-center p-4">No recipes found.</p>;
  }
  if (currentIndex < 0) {
    return <p className="text-center p-4">No more recipes!</p>;
  }

  const r = recipes[currentIndex];

  // extract & truncate summary
  const summaryText = r.summary
    ? r.summary.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  const sentences = summaryText.match(/[^.!?]+[.!?]+/g) || [];
  const shortSummary =
    sentences.length > 2 ? sentences.slice(0, 2).join(' ') : summaryText;

  // pull out nutrients
  const caloriesMatch = summaryText.match(/(\d+)\s*calories?/i);
  const proteinMatch = summaryText.match(/(\d+)\s*g(?:ram)?s?\s*of protein/i);
  const fatMatch = summaryText.match(/(\d+)\s*g(?:ram)?s?\s*of fat/i);
  const nutrientsList = [];
  if (caloriesMatch) nutrientsList.push(`Calories: ${caloriesMatch[1]}`);
  if (proteinMatch) nutrientsList.push(`Protein: ${proteinMatch[1]}g`);
  if (fatMatch) nutrientsList.push(`Fat: ${fatMatch[1]}g`);

  return (
    <div
      className="relative w-full max-w-[350px] mx-auto overflow-visible flex items-center justify-center"
      style={{ touchAction: 'pan-x' }}
    >
      {/* Details panel */}
      {showDetails && detailRecipe && (
        <BottomSheet isOpen={showDetails} onClose={() => setShowDetails(false)}>
          <h3 className="text-2xl font-semibold p-4">{detailRecipe.title}</h3>
          <ul className="p-4 list-disc list-inside space-y-1">
            {detailRecipe.extendedIngredients?.map((ing, i) => (
              <li key={i}>{ing.original}</li>
            ))}
          </ul>
          <div className="p-4 space-y-2">
            {detailRecipe.steps?.map((step, i) => (
              <p key={i}>{step}</p>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* Swipeable card */}
      <TinderCard
        ref={childRefs.current[currentIndex]}
        key={r.id}
        onSwipe={(dir) => swiped(dir, r, currentIndex)}
        onCardLeftScreen={() => outOfFrame(r.title)}
        preventSwipe={['down']}            
        className="w-full rounded-xl bg-white shadow-card transition-transform duration-300 ease-out cursor-grab"
        style={{ touchAction: 'auto', perspective: '1000px' }}
      >
        <div
          onClick={() => {
            setDetailRecipe(r);
            setShowDetails(true);
          }}
          className="relative z-20 flex w-full h-full flex-col justify-start p-4 rounded-xl bg-white shadow-lg"
        >
          <h3 className="text-2xl font-semibold mb-3">{r.title}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDetailRecipe(r);
              setShowDetails(true);
            }}
            aria-label="Show details"
            className="absolute top-3 right-3 p-2 bg-gray-200 rounded-full text-gray-600 text-xl"
          >
            ℹ️
          </button>
          <img
            src={r.image}
            alt={r.title}
            className="w-full h-44 object-cover rounded-md mb-2"
          />
          {shortSummary && (
            <p className="text-base text-neutral-dark mb-2 line-clamp-2">
              {shortSummary}
            </p>
          )}
          {nutrientsList.length > 0 && (
            <>
              <p className="font-bold mt-2">Nutrients:</p>
              <ul className="text-sm text-neutral-dark mt-1 pl-5 list-disc">
                {nutrientsList.map((nutrient, i) => (
                  <li key={i}>{nutrient}</li>
                ))}
              </ul>
            </>
          )}
          {r.extendedIngredients?.length > 0 && (
            <>
              <p className="font-bold mt-2 mb-1">Key Ingredients:</p>
              <ul className="text-xs text-neutral-dark pl-5 mb-0">
                {r.extendedIngredients.slice(0, 3).map((ing, i) => (
                  <li key={i}>{ing.original}</li>
                ))}
                {r.extendedIngredients.length > 3 && <li>...and more</li>}
              </ul>
            </>
          )}
        </div>
      </TinderCard>

      {/* Desktop buttons under deck */}
      {isDesktop && (
        <div className="absolute bottom-[-70px] w-full flex justify-around">
          <SwipeButtons
            onDislike={() => swiped('left', recipes[currentIndex], currentIndex)}
            onLike={() => swiped('right', recipes[currentIndex], currentIndex)}
            onMore={() => {
              setDetailRecipe(recipes[currentIndex]);
              setShowDetails(true);
            }}
          />
        </div>
      )}
    </div>
  );
}