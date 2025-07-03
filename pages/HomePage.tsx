import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import SearchBar from '../components/SearchBar';
import RecipeCard from '../components/RecipeCard';
import { Card } from '../components/ui/card';
import Spinner from '../components/Spinner';
import { Button } from '../components/ui/button';
import { getAfricanRecipes, getRandomRecipes, getCategories } from '../services/spoonacularService';
import { getAllKobiriRecipes } from '../services/userRecipeService';
import type { RecipeSummary, Category } from '../types';

const loadingMessages = [
  "Gathering today's featured recipes...",
  "Fetching fresh ideas from our kitchen...",
  "Setting the table for you...",
  "Exploring delicious new categories...",
  "Uncovering hidden culinary gems...",
];

const HomePage: React.FC = () => {
  const [curatedRecipes, setCuratedRecipes] = useState<RecipeSummary[]>([]);
  const [discoverRecipes, setDiscoverRecipes] = useState<RecipeSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      let messageIndex = 0;
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2500);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get local Kobiri recipes first, as they don't depend on external APIs
        const localKobiriRecipes = await getAllKobiriRecipes();
        const localRecipeSummaries = localKobiriRecipes.map(recipe => ({
          id: recipe.id,
          title: recipe.name,
          image: recipe.imageUrl,
          source: recipe.source,
          isCurated: recipe.isCurated,
          category: recipe.category,
        }));

        // Set these immediately so the user sees something
        setCuratedRecipes(localRecipeSummaries);

        // Now try to fetch the external API data
        try {
          const [apiAfricanRecipes, trending, fetchedCategories] = await Promise.all([
              getAfricanRecipes(),
              getRandomRecipes(),
              getCategories(),
          ]);

          // Combine local recipes (static + user) with API-fetched African recipes
          const combinedCuratedMap = new Map<string | number, RecipeSummary>();
          
          // Prioritize local recipes by adding them to the map first
          localRecipeSummaries.forEach(recipe => combinedCuratedMap.set(recipe.id, recipe));
          
          // Add API recipes, avoiding any duplicates by ID
          apiAfricanRecipes.forEach(recipe => {
              if (!combinedCuratedMap.has(recipe.id)) {
                  combinedCuratedMap.set(recipe.id, recipe);
              }
          });

          setCuratedRecipes(Array.from(combinedCuratedMap.values()));
          setDiscoverRecipes(trending);
          setCategories(fetchedCategories);
        } catch (apiErr) {
          console.error("Error fetching from external APIs:", apiErr);
          toast.error("Some recipes could not be loaded", { 
            description: "We're showing you local recipes while we try to reconnect." 
          });
        }

      } catch (err: any) {
        const message = err.message || 'Failed to load initial data.';
        setError(message);
        toast.error("Could Not Load Page", { description: message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleLoadMore = async () => {
    setIsLoadMoreLoading(true);
    try {
      const newRecipes = await getRandomRecipes();
      // Filter out any potential duplicates before adding
      const uniqueNewRecipes = newRecipes.filter(
        (newRecipe) => !discoverRecipes.some((existingRecipe) => existingRecipe.id === newRecipe.id)
      );
      setDiscoverRecipes(prev => [...prev, ...uniqueNewRecipes]);
    } catch (err: any) {
      const message = err.message || 'Failed to load more recipes. Please try again.';
      toast.error("Could Not Load More", { description: message });
      console.error("Failed to load more recipes", err);
    } finally {
      setIsLoadMoreLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <section className="text-center py-8 md:py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Find your next favorite dish
        </h1>
        <p className="text-md md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          From authentic African classics to trending global cuisine, your culinary adventure starts here.
        </p>
        <SearchBar />
      </section>

      {isLoading && (
        <div className="text-center p-8">
          <Spinner />
          <p className="text-lg text-muted-foreground mt-4 font-semibold animate-pulse">
            {loadingMessage}
          </p>
        </div>
      )}

      {error && !isLoading && (
        <div className="text-center py-10">
            <p className="text-destructive font-semibold">
            Oops! Could not load recipes.
            </p>
            <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      )}

      {!isLoading && curatedRecipes.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Kọbiri Curated Recipes</h2>
          <div className="flex overflow-x-auto space-x-6 pb-4 -mx-2 px-2 hide-scrollbar">
            {curatedRecipes.map(recipe => (
              <div key={`${recipe.source}-${recipe.id}`} className="flex-shrink-0 w-64 sm:w-72">
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>
        </section>
      )}

      {!isLoading && !error && (
        <>
          {categories.length > 0 && (
            <section>
                <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {categories.map(category => (
                        <Link key={category.id} to={`/search?c=${category.name}`} className="group">
                            <Card className="overflow-hidden text-center transform hover:-translate-y-1 transition-transform duration-300 ease-in-out">
                                <img src={category.thumbnail} alt={category.name} className="w-full h-24 object-cover"/>
                                <div className="p-2">
                                    <p className="font-semibold text-sm group-hover:text-primary">{category.name}</p>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>
          )}

          {discoverRecipes.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Discover New Recipes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {discoverRecipes.map(recipe => (
                  <RecipeCard key={`${recipe.source}-${recipe.id}`} recipe={recipe} />
                ))}
              </div>
              <div className="text-center mt-8">
                <Button onClick={handleLoadMore} disabled={isLoadMoreLoading}>
                  {isLoadMoreLoading ? 'Loading...' : 'Load More Recipes'}
                </Button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;