import type { Recipe, RecipeIngredient, RecipeInstruction } from '../types';
import { CURATED_RECIPES } from '../constants';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Generates a placeholder image URL from placehold.co based on the recipe name.
 * @param name The name of the recipe.
 * @returns A URL for a placeholder image.
 */
function generatePlaceholderImage(name: string): string {
    let formattedName = name.replace(/\s/g, '+');
    if (name.length > 20) {
        const words = name.split(' ');
        if (words.length > 2) {
            const midPoint = Math.floor(words.length / 2);
            const line1 = words.slice(0, midPoint).join(' ');
            const line2 = words.slice(midPoint).join(' ');
            formattedName = `${line1.replace(/\s/g, '+')}%0A${line2.replace(/\s/g, '+')}`;
        }
    }
    return `https://placehold.co/600x400/F59E0B/FFFFFF?text=${formattedName}`;
}

/**
 * Transforms a recipe from the database (with JSONB fields) into the app's Recipe type.
 * @param dbRecipe The raw recipe object from Supabase.
 * @returns A Recipe object with parsed ingredients and instructions.
 */
function transformDbRecipeToAppRecipe(dbRecipe: any): Recipe {
    return {
        ...dbRecipe,
        id: dbRecipe.id,
        ingredients: (dbRecipe.ingredients || []) as RecipeIngredient[],
        instructions: (dbRecipe.instructions || []) as RecipeInstruction[],
        source: 'KOBIRI',
        isCurated: true, // User recipes are considered "curated" for their own cookbook
    };
}

// Local storage key for user recipes
const USER_RECIPES_KEY = 'kobiri_user_recipes';

/**
 * Gets user recipes from localStorage
 */
function getUserRecipesFromStorage(): Recipe[] {
    try {
        const storedRecipes = localStorage.getItem(USER_RECIPES_KEY);
        return storedRecipes ? JSON.parse(storedRecipes) : [];
    } catch (error) {
        console.error("Failed to get recipes from localStorage", error);
        return [];
    }
}

/**
 * Saves user recipes to localStorage
 */
function saveUserRecipesToStorage(recipes: Recipe[]): void {
    try {
        localStorage.setItem(USER_RECIPES_KEY, JSON.stringify(recipes));
    } catch (error) {
        console.error("Failed to save recipes to localStorage", error);
    }
}

/**
 * Retrieves user-added recipes from localStorage or Supabase 'recipes' table.
 * @param user The authenticated Supabase user.
 * @returns An array of Recipe objects.
 */
export async function getUserRecipes(user: User): Promise<Recipe[]> {
    // First try to get from localStorage
    const localRecipes = getUserRecipesFromStorage();
    if (localRecipes.length > 0) {
        return localRecipes;
    }
    
    // If no local recipes and Supabase is available, try to get from Supabase
    try {
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Failed to fetch user recipes from Supabase", error);
            return [];
        }

        const recipes = data.map(transformDbRecipeToAppRecipe);
        // Save to localStorage for next time
        saveUserRecipesToStorage(recipes);
        return recipes;
    } catch (error) {
        console.error("Error fetching from Supabase, using localStorage only", error);
        return localRecipes;
    }
}

/**
 * Adds a new user-created recipe to localStorage and attempts to add to Supabase if available.
 * @param data The recipe data from the form.
 * @param user The authenticated Supabase user.
 * @returns The newly created Recipe object with generated fields.
 */
export async function addUserRecipe(data: Omit<Recipe, 'id' | 'source' | 'imageUrl' | 'isCurated'>, user: User): Promise<Recipe> {
    const newRecipe: Recipe = {
        ...data,
        id: `local-${Date.now()}`,
        imageUrl: generatePlaceholderImage(data.name),
        source: 'KOBIRI',
        isCurated: true,
        difficulty: data.difficulty || 'Medium',
    };
    
    // Save to localStorage
    const existingRecipes = getUserRecipesFromStorage();
    const updatedRecipes = [newRecipe, ...existingRecipes];
    saveUserRecipesToStorage(updatedRecipes);
    
    // Try to save to Supabase if available
    try {
        const newRecipePayload = {
            ...data,
            user_id: user.id,
            source: 'KOBIRI',
            image_url: newRecipe.imageUrl,
            difficulty: data.difficulty || 'Medium',
            ingredients: data.ingredients,
            instructions: data.instructions,
        };

        const { data: savedRecipe, error } = await supabase
            .from('recipes')
            .insert(newRecipePayload)
            .select()
            .single();

        if (!error && savedRecipe) {
            const transformedRecipe = transformDbRecipeToAppRecipe(savedRecipe);
            // Update localStorage with the Supabase ID
            const updatedRecipesWithId = existingRecipes.map(r => 
                r.id === newRecipe.id ? transformedRecipe : r
            );
            saveUserRecipesToStorage(updatedRecipesWithId);
            return transformedRecipe;
        }
    } catch (error) {
        console.error("Failed to add user recipe to Supabase, using localStorage only", error);
    }
    
    return newRecipe;
}

/**
 * Retrieves all "Kọbiri" source recipes, both static curated and user-added from localStorage or Supabase.
 * @param user The authenticated Supabase user, or null if logged out.
 * @returns A combined array of Recipe objects.
 */
export async function getAllKobiriRecipes(user: User | null = null): Promise<Recipe[]> {
    try {
        // If user is logged in, try to get their recipes
        const userRecipes = user ? await getUserRecipes(user) : getUserRecipesFromStorage();
        // Return user recipes first so they appear at the start of the list
        return [...userRecipes, ...CURATED_RECIPES];
    } catch (error) {
        console.error("Error fetching all Kobiri recipes:", error);
        // Always ensure we return at least the curated recipes
        return CURATED_RECIPES;
    }
}

/**
 * Finds a single "Kọbiri" recipe by its ID.
 * It first checks the static curated list, then checks localStorage, then Supabase.
 * @param id The ID of the recipe to find.
 * @returns The found Recipe object or null.
 */
export async function getKobiriRecipeById(id: string): Promise<Recipe | null> {
    // First, check the static, curated list.
    const curatedRecipe = CURATED_RECIPES.find(r => r.id === id);
    if (curatedRecipe) {
        return curatedRecipe;
    }

    // Next, check localStorage
    const localRecipes = getUserRecipesFromStorage();
    const localRecipe = localRecipes.find(r => r.id === id);
    if (localRecipe) {
        return localRecipe;
    }

    // If not found locally, try Supabase
    try {
        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.log(`Could not find user recipe with id ${id}:`, error.message);
            return null;
        }

        return data ? transformDbRecipeToAppRecipe(data) : null;
    } catch (error) {
        console.error("Error fetching from Supabase", error);
        return null;
    }
}
