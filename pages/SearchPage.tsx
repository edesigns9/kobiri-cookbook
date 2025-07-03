import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import RecipeCard from '../components/RecipeCard';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import BackButton from '../components/BackButton';
import { searchRecipes, getRecipesByCategory } from '../services/spoonacularService';
import { getAllKobiriRecipes } from '../services/userRecipeService';
import type { RecipeSummary } from '../types';

const loadingMessages = [
  "Searching our curated recipe collection...",
  "Exploring global recipe databases...",
  "Looking for the tastiest results...",
  "Sorting the recipes by deliciousness...",
  "Just a moment, finding your next favorite meal...",
];

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('c') || '';
  
  const [results, setResults] = useState<RecipeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    const performSearch = async () => {
      setIsLoading(true);
      setError(null);
      setResults([]);
      
      try {
        let finalResults: RecipeSummary[] = [];
        if (category) {
            finalResults = await getRecipesByCategory(category);
        } else if (query) {
            const allCuratedRecipes = await getAllKobiriRecipes();
             // Filter local curated recipes for text search
            const curatedResults = allCuratedRecipes
              .filter(recipe => recipe.name.toLowerCase().includes(query.toLowerCase()))
              .map(recipe => ({
                id: recipe.id,
                title: recipe.name,
                image: recipe.imageUrl,
                source: 'KOBIRI',
                isCurated: recipe.isCurated,
                category: recipe.category,
              } as RecipeSummary));

            const globalResults = await searchRecipes(query);
            finalResults = [...curatedResults, ...globalResults];
        }
        setResults(finalResults);

      } catch (err: any) {
        const message = err.message || "Failed to perform search.";
        setError(message);
        toast.error("Search Failed", { description: message });
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (query || category) {
      performSearch();
    } else {
      setResults([]);
      setError(null);
      setIsLoading(false);
    }
  }, [query, category]);

  const getPageTitle = () => {
      if (category) return `Category: ${category}`;
      if (query) return `Results for "${query}"`;
      return 'Search Results';
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
        <p className="text-muted-foreground mb-6">
          {category ? `Showing all recipes in the ${category} category.` : 'Search for something new or browse the results below.'}
        </p>
        <SearchBar initialQuery={query} />
      </section>

      <section>
        {isLoading && (
          <div className="text-center p-8">
            <Spinner />
            <p className="text-lg text-muted-foreground mt-4 font-semibold animate-pulse">
              {loadingMessage}
            </p>
          </div>
        )}
        
        {!isLoading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(recipe => (
              <RecipeCard key={`${recipe.source}-${recipe.id}`} recipe={recipe} />
            ))}
          </div>
        )}

        {!isLoading && !error && results.length === 0 && (query || category) && (
            <p className="text-center text-muted-foreground py-10">No recipes found. Try a different search!</p>
        )}

        {!isLoading && error && (
           <div className="text-center py-10">
                <p className="text-destructive font-semibold">Oops! Something went wrong.</p>
                <p className="text-muted-foreground mt-2">{error}</p>
            </div>
        )}
      </section>
    </div>
  );
};

export default SearchPage;