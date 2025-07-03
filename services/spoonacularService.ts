// IMPORTANT: This service now connects to TheMealDB API (www.themealdb.com)
// despite the filename. This was done to resolve API key issues with Spoonacular.
import type { Recipe, RecipeSummary, RecipeIngredient, RecipeInstruction, Category } from '../types';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Fallback data for when the API is unavailable
const FALLBACK_CATEGORIES: Category[] = [
  { id: '1', name: 'Beef', thumbnail: 'https://www.themealdb.com/images/category/beef.png', description: 'Beef dishes' },
  { id: '2', name: 'Chicken', thumbnail: 'https://www.themealdb.com/images/category/chicken.png', description: 'Chicken dishes' },
  { id: '3', name: 'Dessert', thumbnail: 'https://www.themealdb.com/images/category/dessert.png', description: 'Desserts' },
  { id: '4', name: 'Pasta', thumbnail: 'https://www.themealdb.com/images/category/pasta.png', description: 'Pasta dishes' },
  { id: '5', name: 'Seafood', thumbnail: 'https://www.themealdb.com/images/category/seafood.png', description: 'Seafood dishes' }
];

const FALLBACK_RECIPES: RecipeSummary[] = [
  { id: '52874', title: 'Beef and Mustard Pie', image: 'https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg', source: 'THEMEALDB' },
  { id: '52878', title: 'Beef and Oyster Pie', image: 'https://www.themealdb.com/images/media/meals/wrssvt1511556563.jpg', source: 'THEMEALDB' },
  { id: '52997', title: 'Beef Dumpling Stew', image: 'https://www.themealdb.com/images/media/meals/uyqrrv1511553350.jpg', source: 'THEMEALDB' },
  { id: '52904', title: 'Beef Bourguignon', image: 'https://www.themealdb.com/images/media/meals/vtqxtu1511784197.jpg', source: 'THEMEALDB' }
];

// Fallback recipes by category
const FALLBACK_RECIPES_BY_CATEGORY: Record<string, RecipeSummary[]> = {
  'Beef': [
    { id: '52874', title: 'Beef and Mustard Pie', image: 'https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg', source: 'THEMEALDB' },
    { id: '52878', title: 'Beef and Oyster Pie', image: 'https://www.themealdb.com/images/media/meals/wrssvt1511556563.jpg', source: 'THEMEALDB' },
    { id: '52997', title: 'Beef Dumpling Stew', image: 'https://www.themealdb.com/images/media/meals/uyqrrv1511553350.jpg', source: 'THEMEALDB' }
  ],
  'Chicken': [
    { id: '52940', title: 'Brown Stew Chicken', image: 'https://www.themealdb.com/images/media/meals/sypxpx1515365095.jpg', source: 'THEMEALDB' },
    { id: '52846', title: 'Chicken & mushroom Hotpot', image: 'https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg', source: 'THEMEALDB' }
  ],
  'Dessert': [
    { id: '52893', title: 'Apple & Blackberry Crumble', image: 'https://www.themealdb.com/images/media/meals/xvsurr1511719182.jpg', source: 'THEMEALDB' },
    { id: '52768', title: 'Apple Frangipan Tart', image: 'https://www.themealdb.com/images/media/meals/wxywrq1468235067.jpg', source: 'THEMEALDB' }
  ],
  'Pasta': [
    { id: '52835', title: 'Fettucine alfredo', image: 'https://www.themealdb.com/images/media/meals/uquqtu1511178042.jpg', source: 'THEMEALDB' },
    { id: '52829', title: 'Grilled Mac and Cheese Sandwich', image: 'https://www.themealdb.com/images/media/meals/xutquv1505330523.jpg', source: 'THEMEALDB' }
  ],
  'Seafood': [
    { id: '52959', title: 'Baked salmon with fennel & tomatoes', image: 'https://www.themealdb.com/images/media/meals/1548772327.jpg', source: 'THEMEALDB' },
    { id: '52819', title: 'Cajun spiced fish tacos', image: 'https://www.themealdb.com/images/media/meals/uvuyxu1503067369.jpg', source: 'THEMEALDB' }
  ]
};

// Fallback African recipes
const FALLBACK_AFRICAN_RECIPES: RecipeSummary[] = [
  { 
    id: '52950', 
    title: 'Ayam Percik', 
    image: 'https://www.themealdb.com/images/media/meals/020z181619788503.jpg', 
    source: 'THEMEALDB',
    isCurated: true,
    category: 'Moroccan'
  },
  { 
    id: '52952', 
    title: 'Beef and Oyster Pie', 
    image: 'https://www.themealdb.com/images/media/meals/wrssvt1511556563.jpg', 
    source: 'THEMEALDB',
    isCurated: true,
    category: 'Nigerian' 
  },
  { 
    id: '52963', 
    title: 'Shakshuka', 
    image: 'https://www.themealdb.com/images/media/meals/g373701551450225.jpg', 
    source: 'THEMEALDB',
    isCurated: true,
    category: 'Egyptian'
  },
  { 
    id: '52964', 
    title: 'Kafteji', 
    image: 'https://www.themealdb.com/images/media/meals/1bsv1q1560459826.jpg', 
    source: 'THEMEALDB',
    isCurated: true,
    category: 'Tunisian'
  }
];

// Fallback recipe details
const FALLBACK_RECIPE_DETAILS: Recipe = {
  id: '52874',
  name: 'Beef and Mustard Pie',
  description: 'A delicious Beef dish from British cuisine.',
  imageUrl: 'https://www.themealdb.com/images/media/meals/sytuqu1511553755.jpg',
  prepTime: '30 mins',
  cookTime: '1 hour 45 mins',
  servings: '4',
  difficulty: 'Medium',
  isCurated: false,
  category: 'Beef',
  ingredients: [
    { name: 'Beef', amount: '1kg' },
    { name: 'Mustard', amount: '2 tbsp' },
    { name: 'Butter', amount: '30g' },
    { name: 'Onion', amount: '1 large' },
    { name: 'Carrots', amount: '2' },
    { name: 'Bay Leaf', amount: '2' }
  ],
  instructions: [
    { step: 1, description: 'Preheat the oven to 150C/300F/Gas 2.' },
    { step: 2, description: 'Toss the beef and flour together in a bowl with salt and black pepper.' },
    { step: 3, description: 'Heat the oil and butter in a large casserole and fry the beef until browned on all sides.' },
    { step: 4, description: 'Add the onions, carrots and bay leaves, and cook for 5 minutes.' },
    { step: 5, description: 'Add the mustard and stir to combine.' }
  ],
  source: 'THEMEALDB'
};

const transformMealToRecipeSummary = (meal: any): RecipeSummary => {
  return {
    id: meal.idMeal,
    title: meal.strMeal,
    image: meal.strMealThumb,
    source: 'THEMEALDB',
  };
};

const transformMealToRecipeDetails = (meal: any): Recipe => {
    const ingredients: RecipeIngredient[] = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            ingredients.push({ name: ingredient, amount: measure || '' });
        }
    }

    const instructions: RecipeInstruction[] = (meal.strInstructions || '')
        .split(/\r?\n/)
        .filter((line: string) => line && line.trim() !== '')
        .map((line: string, index: number) => ({
            step: index + 1,
            description: line.trim(),
        }));

    return {
        id: meal.idMeal,
        name: meal.strMeal,
        description: `A delicious ${meal.strCategory} dish from ${meal.strArea} cuisine.`,
        imageUrl: meal.strMealThumb,
        prepTime: 'N/A',
        cookTime: 'N/A',
        servings: '1',
        difficulty: 'Medium',
        isCurated: false,
        category: meal.strCategory,
        ingredients,
        instructions,
        source: 'THEMEALDB',
    };
};

export async function getAfricanRecipes(): Promise<RecipeSummary[]> {
    // List of African cuisines available as "Areas" in TheMealDB API
    const africanCuisines = ['Nigerian', 'Moroccan', 'Kenyan', 'Egyptian', 'Tunisian'];
    let finalRecipes: RecipeSummary[] = [];

    try {
        const promises = africanCuisines.map(async (cuisine) => {
            const url = `${BASE_URL}/filter.php?a=${encodeURIComponent(cuisine)}`;
            const response = await fetch(url);
            if (!response.ok) return [];
            const data = await response.json();
            if (data.meals && data.meals.length > 0) {
                // Take up to 4 meals from each cuisine to get a good mix
                return data.meals.slice(0, 4).map((meal: any) => ({
                    ...transformMealToRecipeSummary(meal),
                    isCurated: true,
                    category: cuisine,
                }));
            }
            return [];
        });

        const results = await Promise.all(promises);
        results.forEach(recipes => {
            if (recipes) {
                finalRecipes.push(...recipes);
            }
        });

        // If we didn't get any recipes, throw an error to trigger the fallback
        if (finalRecipes.length === 0) {
            throw new Error("No African recipes found from API");
        }

        // Shuffle for variety on each load
        return finalRecipes.sort(() => 0.5 - Math.random());
    } catch (error) {
        console.error("Error fetching African recipes:", error);
        // Return fallback African recipes
        console.log("Using fallback African recipes due to API error");
        return FALLBACK_AFRICAN_RECIPES;
    }
}

export async function getCategories(): Promise<Category[]> {
    const url = `${BASE_URL}/categories.php`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok`);
        }
        const data = await response.json();
        // Add a check to ensure data.categories exists before mapping
        return data.categories ? data.categories.map((cat: any) => ({
            id: cat.idCategory,
            name: cat.strCategory,
            thumbnail: cat.strCategoryThumb,
            description: cat.strCategoryDescription,
        })) : [];
    } catch (error) {
        console.error("Error fetching categories:", error);
        // Return fallback categories instead of throwing an error
        console.log("Using fallback categories due to API error");
        return FALLBACK_CATEGORIES;
    }
}

export async function getRecipesByCategory(category: string): Promise<RecipeSummary[]> {
    const url = `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok`);
        }
        const data = await response.json();
        return data.meals ? data.meals.map(transformMealToRecipeSummary) : [];
    } catch (error) {
        console.error("Error fetching recipes by category:", error);
        // Return fallback recipes for this category if available
        if (FALLBACK_RECIPES_BY_CATEGORY[category]) {
            console.log(`Using fallback recipes for category ${category} due to API error`);
            return FALLBACK_RECIPES_BY_CATEGORY[category];
        }
        // If no specific fallback for this category, return generic fallback recipes
        console.log("Using generic fallback recipes due to API error");
        return FALLBACK_RECIPES;
    }
}

export async function searchRecipes(query: string): Promise<RecipeSummary[]> {
    const url = `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok`);
        }
        const data = await response.json();
        return data.meals ? data.meals.map(transformMealToRecipeSummary) : [];
    } catch (error) {
        console.error("Error searching recipes:", error);
        // Return filtered fallback recipes that might match the query
        const fallbackResults = FALLBACK_RECIPES.filter(recipe => 
            recipe.title.toLowerCase().includes(query.toLowerCase())
        );
        console.log("Using fallback search results due to API error");
        return fallbackResults.length > 0 ? fallbackResults : [];
    }
}

export async function getRandomRecipes(): Promise<RecipeSummary[]> {
    const recipePromises = Array.from({ length: 8 }, () => fetch(`${BASE_URL}/random.php`));
    try {
        const responses = await Promise.all(recipePromises);
        const failed = responses.filter(r => !r.ok);
        if (failed.length > 0) {
            throw new Error(`Failed to fetch ${failed.length} random recipes.`);
        }
        
        const jsonData = await Promise.all(responses.map(res => res.json()));
        const uniqueMeals = new Map();
        jsonData.forEach(data => {
            if (data.meals && data.meals[0]) {
                 uniqueMeals.set(data.meals[0].idMeal, data.meals[0]);
            }
        });

        return Array.from(uniqueMeals.values()).map(transformMealToRecipeSummary);
    } catch (error) {
        console.error("Error fetching random recipes:", error);
        // Return fallback recipes instead of throwing an error
        console.log("Using fallback recipes due to API error");
        return FALLBACK_RECIPES;
    }
}

export async function getRecipeDetails(recipeId: string): Promise<Recipe | null> {
    const url = `${BASE_URL}/lookup.php?i=${recipeId}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok`);
        }
        const data = await response.json();
        if (data.meals && data.meals.length > 0) {
            return transformMealToRecipeDetails(data.meals[0]);
        }
        return null;
    } catch (error) {
        console.error(`Error fetching recipe details for ID ${recipeId}:`, error);
        // If the requested recipe ID matches our fallback recipe, return it
        if (recipeId === FALLBACK_RECIPE_DETAILS.id) {
            console.log("Using fallback recipe details due to API error");
            return FALLBACK_RECIPE_DETAILS;
        }
        // Otherwise return null
        return null;
    }
}