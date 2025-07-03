import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import type { Recipe } from '../types';
import { getRecipeDetails } from '../services/spoonacularService';
import { getKobiriRecipeById } from '../services/userRecipeService';
import { estimateRecipeTimes } from '../services/geminiService';

export function useRecipeDetail() {
  const { source, id } = useParams<{ source: string; id: string }>();
  const location = useLocation();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError("Recipe ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setIsEstimating(false);

      try {
        if (location.state?.recipe) {
          setRecipe(location.state.recipe);
          return;
        }

        const normalizedSource = source?.toUpperCase();
        let fetchedRecipe: Recipe | null = null;

        if (normalizedSource === 'KOBIRI') {
          fetchedRecipe = await getKobiriRecipeById(id);
        } else if (normalizedSource === 'THEMEALDB') {
          fetchedRecipe = await getRecipeDetails(id);
        }

        if (fetchedRecipe) {
          setRecipe(fetchedRecipe);
          if (fetchedRecipe.source !== 'KOBIRI' && (!fetchedRecipe.prepTime || fetchedRecipe.prepTime === 'N/A')) {
            setIsEstimating(true);
            try {
              const times = await estimateRecipeTimes(fetchedRecipe.name, fetchedRecipe.ingredients, fetchedRecipe.instructions);
              setRecipe(prev => prev ? { ...prev, prepTime: times.prepTime, cookTime: times.cookTime } : null);
            } catch (e) {
              console.error("Could not estimate times:", e);
            } finally {
              setIsEstimating(false);
            }
          }
        } else if (location.state?.title) {
          const minimalRecipe: Recipe = {
            id: id,
            name: location.state.title,
            description: "Recipe details could not be loaded.",
            imageUrl: location.state.image || "https://placehold.co/600x400/F59E0B/FFFFFF?text=Recipe+Not+Found",
            ingredients: [],
            instructions: [],
            prepTime: "N/A",
            cookTime: "N/A",
            servings: "N/A",
            difficulty: "Medium",
            source: (normalizedSource as any) || 'THEMEALDB',
            isCurated: false,
            category: "Unknown"
          };
          setRecipe(minimalRecipe);
          toast.error("Could Not Load Full Recipe Details", { description: "We'll show you the basic information we have." });
        } else {
          setError("Recipe not found. It may have been deleted or is temporarily unavailable.");
        }
      } catch (err: any) {
        const message = err.message || 'Failed to load recipe details.';
        setError(message);
        toast.error("Could Not Load Recipe", { description: message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [source, id, location.state]);

  return { recipe, isLoading, isEstimating, error };
} 