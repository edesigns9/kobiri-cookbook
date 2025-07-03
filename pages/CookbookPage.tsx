import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RecipeCard from '../components/RecipeCard';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Recipe, RecipeSummary } from '../types';
import { getAllKobiriRecipes } from '../services/userRecipeService';
import Spinner from '../components/Spinner';
import { CURATED_RECIPES } from '../constants';

const CookbookPage: React.FC = () => {
  const { user, favorites, isLoggedIn } = useAuth();
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<RecipeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!isLoggedIn) {
        // When logged out, there are no user-created recipes to show.
        // We can just show favorites from TheMealDB which might be in the auth context state.
        const themealdbFavorites = favorites.filter(fav => fav.source === 'THEMEALDB');
        setFavoriteRecipes(themealdbFavorites);
        setIsLoading(false);
        return;
      }
      
      // This part runs only for logged-in users
      setIsLoading(true);
      setError(null);
      
      try {
        // 1. Fetch all user-created recipes from Supabase and static curated recipes.
        const kobiriRecipes = await getAllKobiriRecipes(user);
        
        // 2. Determine which of the user's favorites are from KOBIRI source.
        const kobiriRecipeIds = new Set(kobiriRecipes.map(r => r.id));
        const favoriteKobiriSummaries = favorites
          .filter(fav => fav.source === 'KOBIRI' && kobiriRecipeIds.has(String(fav.recipe_id)))
          .map(fav => ({
            id: String(fav.recipe_id),
            title: fav.title,
            image: fav.image,
            source: fav.source,
          }));

        // 3. Get all other favorites (e.g., from THEMEALDB or AI).
        const otherFavoriteSummaries = favorites.filter(fav => fav.source !== 'KOBIRI');
        
        // 4. Set the state for the page to render.
        const userCreatedRecipes = kobiriRecipes.filter(r => !CURATED_RECIPES.some(cr => cr.id === r.id));
        setAllRecipes(userCreatedRecipes);
        setFavoriteRecipes([...favoriteKobiriSummaries, ...otherFavoriteSummaries]);

      } catch (err) {
        setError("Failed to load your cookbook. Please try again.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    // We depend on both `user` and `favorites` state to render the full cookbook.
    if (isLoggedIn) {
      fetchRecipes();
    } else {
      setIsLoading(false); // Not logged in, nothing to fetch.
    }

  }, [user, favorites, isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4">Log in to see your Cookbook</h1>
        <p className="text-muted-foreground mb-6">Your personal collection of saved and created recipes awaits.</p>
        <Button asChild>
          <Link to="/login">Log In / Sign Up</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-16">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <BackButton />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">My Cookbook</h1>
          <Button asChild>
            <Link to="/add-recipe">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add New Recipe
            </Link>
          </Button>
        </div>
        <p className="text-muted-foreground">
          {favorites.length > 0
            ? `You have ${favorites.length} saved recipe(s).`
            : "Your cookbook is empty. Start exploring and save some recipes!"}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold border-b pb-2 mb-6">My Saved Recipes</h2>
        {favoriteRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favoriteRecipes.map(recipe => (
              <RecipeCard key={`${recipe.source}-${recipe.id}`} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-muted-foreground">You haven't saved any recipes yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Explore recipes and click the heart icon to save them here.</p>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-6">My Creations</h2>
        {allRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allRecipes.map(recipe => (
              <RecipeCard key={`kobiri-${recipe.id}`} recipe={{...recipe, title: recipe.name, image: recipe.imageUrl, isCurated: true, source: 'KOBIRI'}} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-muted-foreground">You haven't created any recipes yet.</p>
            <Button variant="link" asChild><Link to="/add-recipe">Create your first recipe now!</Link></Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default CookbookPage;
