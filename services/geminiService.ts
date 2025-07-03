import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { toast } from 'sonner';
import type { Recipe, RecipeSummary, RecipeIngredient, RecipeInstruction } from '../types';

// This helper function centralizes API key checking and client initialization.
// It's called by each service function, deferring initialization until it's actually needed.
function getAiClient(): GoogleGenAI | null {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("API Key exists:", !!apiKey); // Debug: Check if API key exists
  if (!apiKey) {
    const message = "The Kọbiri AI service is not configured. Please check the setup.";
    console.error("Gemini API key is missing from environment variables.");
    toast.error("Kọbiri Service Unavailable", { description: message });
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Mock response for generateRecipesFromIngredients
const mockRecipes: RecipeSummary[] = [
  {
    id: 'mock-recipe-1',
    title: 'Mock Jollof Rice',
    image: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Jollof+Rice',
    source: 'AI',
    isCurated: false,
    recipe: {
      id: 'mock-recipe-1',
      name: 'Mock Jollof Rice',
      description: 'A delicious West African rice dish cooked in a flavorful tomato sauce.',
      imageUrl: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Jollof+Rice',
      prepTime: '20 mins',
      cookTime: '45 mins',
      servings: '4',
      difficulty: 'Medium',
      source: 'AI',
      isCurated: false,
      category: 'AI Generated',
      ingredients: [
        { name: 'Long grain rice', amount: '2 cups' },
        { name: 'Tomatoes', amount: '4 medium' },
        { name: 'Onions', amount: '2 medium' },
        { name: 'Bell pepper', amount: '1 large' },
        { name: 'Vegetable oil', amount: '1/4 cup' },
        { name: 'Chicken stock', amount: '2 cups' },
        { name: 'Curry powder', amount: '1 tbsp' },
        { name: 'Thyme', amount: '1 tsp' },
        { name: 'Bay leaves', amount: '2' }
      ],
      instructions: [
        { step: 1, description: 'Blend tomatoes, bell pepper, and one onion until smooth.' },
        { step: 2, description: 'Heat oil in a large pot and sauté the remaining chopped onion until translucent.' },
        { step: 3, description: 'Add the tomato mixture and cook for 10-15 minutes until reduced.' },
        { step: 4, description: 'Add curry powder, thyme, bay leaves, and season with salt.' },
        { step: 5, description: 'Wash rice thoroughly and add to the pot, stirring to coat with sauce.' },
        { step: 6, description: 'Add chicken stock, cover tightly, and cook on low heat for 30 minutes.' },
        { step: 7, description: 'Fluff with a fork and serve hot.' }
      ]
    }
  },
  {
    id: 'mock-recipe-2',
    title: 'Mock Egusi Soup',
    image: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Egusi+Soup',
    source: 'AI',
    isCurated: false,
    recipe: {
      id: 'mock-recipe-2',
      name: 'Mock Egusi Soup',
      description: 'A rich and nutritious Nigerian soup made with ground melon seeds.',
      imageUrl: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Egusi+Soup',
      prepTime: '25 mins',
      cookTime: '1 hour',
      servings: '6',
      difficulty: 'Medium',
      source: 'AI',
      isCurated: false,
      category: 'AI Generated',
      ingredients: [
        { name: 'Egusi (ground melon seeds)', amount: '2 cups' },
        { name: 'Spinach or bitter leaf', amount: '4 cups, chopped' },
        { name: 'Palm oil', amount: '1/3 cup' },
        { name: 'Onions', amount: '1 large' },
        { name: 'Tomatoes', amount: '3 medium' },
        { name: 'Scotch bonnet pepper', amount: '1-2' },
        { name: 'Beef or fish', amount: '500g' },
        { name: 'Stock cubes', amount: '2' },
        { name: 'Salt', amount: 'to taste' }
      ],
      instructions: [
        { step: 1, description: 'Season and cook meat or fish until tender. Reserve the stock.' },
        { step: 2, description: 'Blend tomatoes, pepper, and onion into a smooth paste.' },
        { step: 3, description: 'Heat palm oil in a pot and add the blended mixture. Cook for 10 minutes.' },
        { step: 4, description: 'Mix egusi with a little water to form a paste and add to the pot.' },
        { step: 5, description: 'Add meat stock, stock cubes, and salt. Simmer for 15 minutes.' },
        { step: 6, description: 'Add cooked meat/fish and simmer for another 10 minutes.' },
        { step: 7, description: 'Stir in the chopped vegetables and cook for 5-10 minutes.' },
        { step: 8, description: 'Serve hot with fufu, pounded yam, or rice.' }
      ]
    }
  },
  {
    id: 'mock-recipe-3',
    title: 'Mock Chicken Stir Fry',
    image: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Chicken+Stir+Fry',
    source: 'AI',
    isCurated: false,
    recipe: {
      id: 'mock-recipe-3',
      name: 'Mock Chicken Stir Fry',
      description: 'A quick and easy stir fry with chicken and vegetables.',
      imageUrl: 'https://placehold.co/600x400/F59E0B/FFFFFF?text=Chicken+Stir+Fry',
      prepTime: '15 mins',
      cookTime: '10 mins',
      servings: '2',
      difficulty: 'Easy',
      source: 'AI',
      isCurated: false,
      category: 'AI Generated',
      ingredients: [
        { name: 'Chicken breast', amount: '2, sliced' },
        { name: 'Bell peppers', amount: '2, sliced' },
        { name: 'Broccoli', amount: '1 cup, florets' },
        { name: 'Carrots', amount: '1, julienned' },
        { name: 'Soy sauce', amount: '3 tbsp' },
        { name: 'Garlic', amount: '3 cloves, minced' },
        { name: 'Ginger', amount: '1 tbsp, grated' },
        { name: 'Vegetable oil', amount: '2 tbsp' },
        { name: 'Sesame oil', amount: '1 tsp' }
      ],
      instructions: [
        { step: 1, description: 'Heat vegetable oil in a wok or large frying pan over high heat.' },
        { step: 2, description: 'Add chicken pieces and stir-fry until no longer pink, about 3-4 minutes.' },
        { step: 3, description: 'Add garlic and ginger, stir-fry for 30 seconds until fragrant.' },
        { step: 4, description: 'Add all vegetables and stir-fry for 3-4 minutes until crisp-tender.' },
        { step: 5, description: 'Add soy sauce and toss to coat everything evenly.' },
        { step: 6, description: 'Drizzle with sesame oil, give a final toss, and serve hot.' }
      ]
    }
  }
];

export async function generateRecipesFromIngredients(ingredients: string): Promise<RecipeSummary[]> {
  const ai = getAiClient();
  if (!ai) {
    throw new Error("Kọbiri AI service is not available.");
  }
  
  // Use the model name that was working before
  const model = "gemini-2.5-pro";
  console.log("Using model:", model); // Debug: Log which model we're using
  const prompt = `You are a creative and expert chef. Based on the following ingredients: "${ingredients}", generate 3 unique and delicious recipe ideas. For each recipe, provide a unique 'id' (like 'ai-recipe-1'), a 'name', a brief 'description', an estimated 'prepTime', 'cookTime', 'servings', a detailed list of 'ingredients' (with name and amount), and step-by-step 'instructions'. The response MUST be a valid JSON array of objects. Do not include any text outside of the JSON array. The JSON structure for each recipe object should be: { "id": string, "name": string, "description": string, "prepTime": string, "cookTime": string, "servings": string, "ingredients": [{ "name": string, "amount": string }], "instructions": [{ "step": number, "description": string }] }`;

  try {
    console.log("Sending request to Gemini API..."); // Debug: Log before API call
    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    console.log("Received response from Gemini API"); // Debug: Log after API call

    const responseText = response.text;
    if (!responseText) {
        throw new Error("Received an empty response from the AI.");
    }
    let jsonStr = responseText.trim();
    
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const generatedRecipes: Omit<Recipe, 'imageUrl' | 'source'>[] = JSON.parse(jsonStr);

    return generatedRecipes.map(r => {
        let formattedName = r.name.replace(/\s/g, '+');
        if (r.name.length > 20) {
            const words = r.name.split(' ');
            if (words.length > 2) {
                const midPoint = Math.floor(words.length / 2);
                const line1 = words.slice(0, midPoint).join(' ');
                const line2 = words.slice(midPoint).join(' ');
                formattedName = `${line1.replace(/\s/g, '+')}%0A${line2.replace(/\s/g, '+')}`;
            }
        }
        
        const placeholderImageUrl = `https://placehold.co/600x400/F59E0B/FFFFFF?text=${formattedName}`;

        const fullRecipe: Recipe = {
            ...r,
            imageUrl: placeholderImageUrl,
            source: 'AI',
            difficulty: 'Medium',
            isCurated: false,
            category: 'AI Generated',
        };

        return {
            id: r.id,
            title: r.name,
            image: fullRecipe.imageUrl,
            source: 'AI',
            isCurated: false,
            recipe: fullRecipe,
        };
    });
  } catch (error) {
    console.error("Error generating recipes from Gemini:", error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    const message = "The Kọbiri AI Chef could not generate recipes right now. Please try again.";
    toast.error("Kọbiri Chef Error", { description: message });
    
    // Return mock recipes as a fallback
    return mockRecipes;
  }
}

export async function getCookingAssistantResponse(recipeName: string, currentStep: string, question: string): Promise<string> {
    const ai = getAiClient();
    if (!ai) {
        throw new Error("Kọbiri AI assistant is not available.");
    }

    const model = "gemini-2.5-pro";
    console.log("Using model for assistant:", model);
    const systemInstruction = "You are an expert, friendly, and encouraging cooking assistant named Kọbiri Chef. You are helping a user cook a dish. Your answers must be concise, helpful, directly related to the cooking question, and under 50 words. Be encouraging and patient. Do not start your response with phrases like 'Of course!' or 'Great question!'. Get straight to the answer.";
    const contents = `Context: The user is making "${recipeName}". They are on the step: "${currentStep}". The user's question is: "${question}".`;

    try {
        console.log("Sending assistant request to Gemini API...");
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 0 }
            },
        });
        console.log("Received assistant response from Gemini API");
        
        const responseText = response.text;
        if (!responseText) {
            throw new Error("Received an empty response from the AI assistant.");
        }
        return responseText;
    } catch (error) {
        console.error("Error getting assistant response from Gemini:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        const message = "The Kọbiri Chef Assistant could not answer. Please try again.";
        toast.error("Kọbiri Chef Error", { description: message });
        throw new Error(message);
    }
}

export async function enhanceInstruction(recipeName: string, instruction: string): Promise<string> {
    const ai = getAiClient();
    if (!ai) {
        throw new Error("Kọbiri AI assistant is not available.");
    }

    const model = "gemini-2.5-pro";
    console.log("Using model for enhancing instruction:", model);
    const systemInstruction = "You are an expert, world-class chef named Kọbiri Chef. Your role is to help a home cook by clarifying a specific instruction from a recipe. You are patient, detailed, and encouraging. Your explanations should be easy for a beginner to understand. Use formatting like bullet points or numbered lists if it helps break down the step.";
    const contents = `I am cooking "${recipeName}". I need help with this step: "${instruction}". Please enhance this instruction for me. Break it down into more manageable parts, explain any tricky techniques, and offer tips for success. Do not just repeat the instruction.`;

    try {
        console.log("Sending enhance instruction request to Gemini API...");
        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        console.log("Received enhance instruction response from Gemini API");
        
        const responseText = response.text;
        if (!responseText) {
            throw new Error("Received an empty response from the AI when enhancing instructions.");
        }
        return responseText;
    } catch (error) {
        console.error("Error enhancing instruction from Gemini:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        const message = "The Kọbiri Chef could not enhance the instruction right now. Please try again.";
        toast.error("Kọbiri Chef Error", { description: message });
        throw new Error(message);
    }
}

export async function estimateRecipeTimes(
    recipeName: string, 
    ingredients: RecipeIngredient[], 
    instructions: RecipeInstruction[]
): Promise<{ prepTime: string, cookTime: string }> {
    const ai = getAiClient();
    if (!ai) {
        throw new Error("Kọbiri AI service is not available.");
    }

    const model = "gemini-2.5-pro";
    console.log("Using model for time estimation:", model);
    const ingredientsString = ingredients.map(ing => `${ing.amount} ${ing.name}`).join(', ');
    const instructionsString = instructions.map(inst => `Step ${inst.step}: ${inst.description}`).join(' ');
    
    const prompt = `You are a professional chef. Estimate the preparation time and cooking time for this recipe:
    
Recipe Name: ${recipeName}
Ingredients: ${ingredientsString}
Instructions: ${instructionsString}

Return ONLY a JSON object with two properties: "prepTime" and "cookTime". 
Both should be strings with time estimates like "15 mins", "1 hour", "1 hour 30 mins", etc.
Do not include any text outside of the JSON object.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.3,
                thinkingConfig: { thinkingBudget: 0 }
            },
        });

        const responseText = response.text;
        if (!responseText) {
            throw new Error("Received an empty response from the AI when estimating time.");
        }
        
        let jsonStr = responseText.trim();
        // Handle potential code fences in the response
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const timeEstimates = JSON.parse(jsonStr);
        return {
            prepTime: timeEstimates.prepTime,
            cookTime: timeEstimates.cookTime
        };
    } catch (error) {
        console.error("Error estimating recipe times from Gemini:", error);
        // Provide reasonable defaults
        return {
            prepTime: "20 mins",
            cookTime: "30 mins"
        };
    }
}

export async function organizeShoppingList(itemNames: string[]): Promise<Record<string, string[]>> {
    const ai = getAiClient();
    if (!ai) {
        throw new Error("Kọbiri AI service is not available.");
    }

    const model = "gemini-2.5-pro";
    console.log("Using model for shopping list organization:", model);
    
    const prompt = `You are a helpful shopping assistant. Organize this list of food items into logical categories like "Produce", "Dairy", "Meat", "Grains", "Spices", etc. Return ONLY a JSON object where each key is a category and each value is an array of items belonging to that category. Items: ${itemNames.join(', ')}`;

    try {
        console.log("Sending shopping list organization request to Gemini API...");
        const response: GenerateContentResponse = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.1,
                thinkingConfig: { thinkingBudget: 0 }
            },
        });

        const responseText = response.text;
        if (!responseText) {
            throw new Error("Received an empty response from the AI when organizing shopping list.");
        }
        
        let jsonStr = responseText.trim();
        // Handle potential code fences in the response
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error organizing shopping list from Gemini:", error);
        // Provide a fallback categorization
        return {
            "Uncategorized": itemNames
        };
    }
}