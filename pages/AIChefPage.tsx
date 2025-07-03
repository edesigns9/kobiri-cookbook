import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import Spinner from '../components/Spinner';
import RecipeCard from '../components/RecipeCard';
import { generateRecipesFromIngredients } from '../services/geminiService';
import type { RecipeSummary } from '../types';
import { Wand2 } from 'lucide-react';
import { useTitle } from '../hooks/useTitle';

const loadingMessages = [
  "Sending your ingredients to the Kọbiri Chef...",
  "Our chef is whisking up some creative ideas...",
  "Thinking of tasty flavor combinations...",
  "Crafting unique recipes just for you...",
  "Almost there, just plating your recipes...",
];

const AIChefPage: React.FC = () => {
  useTitle('Kọbiri Chef');
  const { isLoggedIn } = useAuth();
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingMessage(loadingMessages[0]); // Reset to the first message on new load
      let messageIndex = 0;
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 3000); // Change message every 3 seconds
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoading]);

  const generateRecipes = useCallback(async (ingredientList: string) => {
    if (!ingredientList.trim()) {
      setError('Please enter some ingredients.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipes([]);
    setIngredients(ingredientList); // Sync textarea with the action

    try {
      const generatedRecipes = await generateRecipesFromIngredients(ingredientList);
      setRecipes(generatedRecipes);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while generating recipes.');
    } finally {
      setIsLoading(false);
    }
  }, []);


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateRecipes(ingredients);
  };
  
  const handleExampleClick = (ingredientList: string) => {
    generateRecipes(ingredientList);
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center py-16">
        <Wand2 className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-bold mb-4">Kọbiri Chef</h1>
        <p className="text-muted-foreground mb-6">Please log in to use the Kọbiri Chef feature.</p>
        <Button asChild>
          <Link to="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center">
        <Wand2 className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold">Kọbiri Chef</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
          Got random ingredients? Let our Kọbiri Chef whip up a recipe for you!
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>What's in Your Fridge?</CardTitle>
          <CardDescription>
            List the ingredients you have on hand, separated by commas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <Textarea
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., chicken breast, tomatoes, onion, garlic, rice..."
              rows={4}
              className="text-base"
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Generating...' : 'Generate Recipes'}
              </Button>
              
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => handleExampleClick('chicken breast, rice, broccoli')}>Chicken & Rice</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleExampleClick('pasta, tomatoes, garlic, basil')}>Tomato Pasta</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => handleExampleClick('eggs, spinach, feta cheese')}>Quick Omelette</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="text-center p-8">
          <Spinner />
          <p className="text-lg text-muted-foreground mt-4 font-semibold animate-pulse">
            {loadingMessage}
          </p>
        </div>
      )}

      {error && (
        <div className="text-center text-destructive font-semibold">
          <p>Error: {error}</p>
        </div>
      )}

      {recipes.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Here are some ideas for you:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AIChefPage;
