import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCookbook } from '../hooks/useCookbook';
import RecipeListSection from '../components/RecipeListSection';
import BackButton from '../components/BackButton';
import { Button } from '../components/ui/button';
import { PlusCircle } from 'lucide-react';
import Spinner from '../components/Spinner';
import type { RecipeSummary } from '../types';
import { useTitle } from '../hooks/useTitle';

const loadingMessages = [
  "Opening your personal cookbook...",
  "Finding your saved recipes...",
  "Dusting off your recipe cards...",
  "Getting your creations ready...",
  "Organizing your culinary collection...",
];

const CookbookPage: React.FC = () => {
  useTitle('My Cookbook');
  const { isLoggedIn } = useAuth();
  const { isLoading, error, userCreations, favoriteRecipes } = useCookbook();
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isLoading) {
      let messageIndex = 0;
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

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
      <div className="flex justify-center items-center h-64 flex-col">
        <Spinner />
        <p className="text-lg text-muted-foreground mt-4 font-semibold animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-16">{error}</div>;
  }

  const userCreationsSummary: RecipeSummary[] = userCreations.map(r => ({
    id: r.id,
    title: r.name,
    image: r.imageUrl,
    source: 'KOBIRI',
    isCurated: false,
    recipe: r,
  }));

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
          {`You have ${favoriteRecipes.length} saved recipe(s) and ${userCreations.length} creation(s).`}
        </p>
      </section>

      <RecipeListSection
        title="My Saved Recipes"
        recipes={favoriteRecipes}
        emptyState={
          <>
            <p className="text-muted-foreground">You haven't saved any recipes yet.</p>
            <p className="text-sm text-muted-foreground mt-2">Explore recipes and click the heart icon to save them here.</p>
          </>
        }
      />

      <div className="mt-12">
        <RecipeListSection
          title="My Creations"
          recipes={userCreationsSummary}
          emptyState={
            <>
              <p className="text-muted-foreground">You haven't created any recipes yet.</p>
              <Button variant="link" asChild><Link to="/add-recipe">Create your first recipe now!</Link></Button>
            </>
          }
        />
      </div>
    </div>
  );
};

export default CookbookPage;
