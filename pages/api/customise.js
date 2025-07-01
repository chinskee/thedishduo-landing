import { chatCompletion } from '../../lib/openai';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { title, customIngredients, customInstructions } = req.body;

  if (!title || !customIngredients || !customInstructions) {
    res.status(400).json({ error: "Missing parameters" });
    return;
  }

  const prompt = `
You are a recipe assistant. Use exactly the ingredients provided; do not introduce or omit any.

Given the recipe title: "${title}", ingredients: ${JSON.stringify(customIngredients)}, and instructions: ${customInstructions},
Ensure you only include the provided ingredients in the output; do not re-add removed items.

Generate a tweaked recipe JSON with the following structure:
{
  "title": string,
  "ingredients": [string],
  "steps": [string]
}
Only respond with the JSON object.
`;

  try {
    const aiOutput = await chatCompletion(prompt);
    // Strip markdown code fences if present
    let jsonString = aiOutput.trim();
    jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonString);
    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate tweaked recipe" });
  }
}