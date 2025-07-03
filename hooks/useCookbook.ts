import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { Recipe, RecipeSummary } from '../types';
import { getAllKobiriRecipes } from '../services/userRecipeService';
import { CURATED_RECIPES } from '../constants';

export function useCookbook() {
  const { user, favorites, isLoggedIn } = useAuth();
  const [userCreations, setUserCreations] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!isLoggedIn || !user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const allKobiriRecipes = await getAllKobiriRecipes(user);
        const kobiriRecipeMap = new Map<string, Recipe>();
        allKobiriRecipes.forEach(recipe => {
          kobiriRecipeMap.set(String(recipe.id), recipe);
        });

        const processedFavorites: RecipeSummary[] = [];
        const seenRecipeIds = new Set<string>();

        favorites.forEach(fav => {
          const uniqueId = `${fav.source}-${fav.recipe_id}`;
          if (seenRecipeIds.has(uniqueId)) return;

          let recipeSummary: RecipeSummary | null = null;

          if (fav.source === 'KOBIRI') {
            const recipe = kobiriRecipeMap.get(fav.recipe_id);
            if (recipe) {
              recipeSummary = {
                id: fav.recipe_id,
                title: recipe.name,
                image: recipe.imageUrl,
                source: 'KOBIRI',
                category: recipe.category,
                recipe: recipe,
              };
            }
          } else {
            recipeSummary = {
              id: fav.recipe_id,
              title: fav.title,
              image: fav.image,
              source: fav.source,
            };
          }
          
          if (recipeSummary) {
            processedFavorites.push(recipeSummary);
            seenRecipeIds.add(uniqueId);
          }
        });

        const created = allKobiriRecipes.filter(r => !CURATED_RECIPES.some(cr => cr.id === r.id));
        setUserCreations(created);
        setFavoriteRecipes(processedFavorites);

      } catch (err) {
        setError("Failed to load your cookbook. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [user, favorites, isLoggedIn]);

  return { isLoading, error, userCreations, favoriteRecipes };
} 