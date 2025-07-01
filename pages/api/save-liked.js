import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' })
  }

  const supabase = createPagesServerClient({ req, res })

  let {
    title,
    image_url,
    image,
    ingredients,
    extendedIngredients,
    analyzedInstructions,
    readyinminutes,
    readyInMinutes,
    instructions,
    summary,
    user_id,
    steps,
    photographerName,
    photographerProfileUrl,
    photographer_name,
    photographer_profile_url,
  } = req.body

  // Normalize fields
  image_url = image_url || image || 'https://via.placeholder.com/300x200.png?text=No+Image';
  readyinminutes = readyinminutes || readyInMinutes || null

  // Fallback for instructions
  if (!instructions) {
    if (summary) {
      instructions = summary
    } else if (Array.isArray(analyzedInstructions) && analyzedInstructions.length > 0) {
      instructions = analyzedInstructions[0].steps
        .map((s, i) => `${i + 1}. ${s.step}`)
        .join(' ')
    } else if (Array.isArray(req.body.analyzedInstructions) && req.body.analyzedInstructions.length > 0) {
      instructions = req.body.analyzedInstructions[0].steps
        .map((s, i) => `${i + 1}. ${s.step}`)
        .join(' ');
    } else if (req.body.instructions) {
      instructions = req.body.instructions
    }
  }

  if (!instructions && req.body.analyzedInstructions) {
    const parsedSteps = req.body.analyzedInstructions.flatMap((instr) =>
      (instr.steps || []).map((s, i) => `${i + 1}. ${s.step}`)
    );
    if (parsedSteps.length > 0) {
      instructions = parsedSteps.join(' ');
    }
  }

  // Normalize ingredients
  if (!ingredients || ingredients.length === 0) {
    if (Array.isArray(extendedIngredients) && extendedIngredients.length > 0) {
      ingredients = extendedIngredients.map((ing) => ing.original || ing.name || '').filter(Boolean)
    } else if (Array.isArray(req.body.extendedIngredients) && req.body.extendedIngredients.length > 0) {
      ingredients = req.body.extendedIngredients.map((ing) => ing.original || ing.name || '').filter(Boolean)
    } else if (Array.isArray(req.body.ingredients) && req.body.ingredients.length > 0) {
      ingredients = req.body.ingredients.map((i) => (typeof i === 'string' ? i : i.name || i.original || '')).filter(Boolean)
    } else if (typeof req.body.ingredients === 'string' && req.body.ingredients.trim() !== '') {
      ingredients = req.body.ingredients.split(',').map((i) => i.trim()).filter(Boolean)
    } else if (
      Array.isArray(analyzedInstructions) &&
      analyzedInstructions.length > 0 &&
      Array.isArray(analyzedInstructions[0].steps)
    ) {
      ingredients = analyzedInstructions[0].steps
        .flatMap((s) => s.ingredients || [])
        .map((ing) => ing.name || '')
        .filter(Boolean)
    } else if (Array.isArray(req.body.analyzedInstructions) && req.body.analyzedInstructions.length > 0) {
      ingredients = req.body.analyzedInstructions
        .flatMap((instr) =>
          (instr.steps || []).flatMap((step) =>
            (step.ingredients || []).map((ing) => ing.name || '').filter(Boolean)
          )
        );
    }
  }

  // Normalize steps JSONB
  if (!Array.isArray(steps) || steps.length === 0) {
    if (Array.isArray(analyzedInstructions) && analyzedInstructions.length > 0) {
      steps = analyzedInstructions[0].steps.map(s => s.step);
    } else if (instructions) {
      // fallback: split instructions text into sentences
      steps = instructions
        .split(/(?<=[.?!])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 5);
    } else {
      steps = [];
    }
  }

  // Normalize photographer attribution fields
  photographerName = photographerName || photographer_name || null;
  photographerProfileUrl = photographerProfileUrl || photographer_profile_url || null;

  if ((!instructions || instructions.trim() === '') && summary) {
    instructions = summary;
  }

  if ((!ingredients || ingredients.length === 0) && typeof summary === 'string') {
    ingredients = summary
      .split(/[,.;]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 3); // Filter out short noise words
  }

  if (!user_id || !title || !image_url || !ingredients || !readyinminutes || !instructions) {
    console.warn('Missing field:', {
      user_id,
      title,
      image_url,
      ingredients,
      readyinminutes,
      instructions
    });
    console.warn('Full request body:', req.body);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { error: insertError } = await supabase.from('liked_recipes').insert([
    {
      title,
      image_url,
      ingredients,
      readyinminutes,
      instructions,
      steps,
      user_id,
      photographer_name: photographerName || null,
      photographer_profile_url: photographerProfileUrl || null,
    }
  ])

  if (insertError) {
    console.error(insertError)
    return res.status(500).json({ error: 'Failed to insert into database' })
  }

  return res.status(200).json({ message: 'Recipe saved successfully!' })
}