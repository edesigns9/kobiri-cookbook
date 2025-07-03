import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { getRecipeDetails } from '../services/spoonacularService';
import { estimateRecipeTimes, enhanceInstruction } from '../services/geminiService';
import { getKobiriRecipeById } from '../services/userRecipeService';
import { useAuth } from '../hooks/useAuth';
import { useMarketList } from '../hooks/useMarketList';
import type { Recipe } from '../types';
import RecipeDetailSkeleton from '../components/RecipeDetailSkeleton';
import SaveButton from '../components/SaveButton';
import BackButton from '../components/BackButton';
import GuidedCookingModal from '../components/GuidedCookingModal';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Mic, Sparkles, Loader2, ShoppingCart } from 'lucide-react';

const RecipeDetailPage: React.FC = () => {
  const { source, id } = useParams<{ source: string; id: string }>();
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const { addRecipeIngredientsToList, isRecipeOnList } = useMarketList();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEstimating, setIsEstimating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGuidedCooking, setIsGuidedCooking] = useState(false);

  // State for instruction enhancement
  const [enhancedInstructions, setEnhancedInstructions] = useState<Record<number, string>>({});
  const [enhancingStep, setEnhancingStep] = useState<number | null>(null);
  const [openEnhancements, setOpenEnhancements] = useState<Record<number, boolean>>({});

  const isSpeechApiSupported = useMemo(() => {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition) && !!window.speechSynthesis;
  }, []);

  const isOnMarketList = useMemo(() => {
    return recipe ? isRecipeOnList(recipe.name) : false;
  }, [recipe, isRecipeOnList]);

  const handleAddToList = () => {
      if (recipe) {
          addRecipeIngredientsToList(recipe);
      }
  };

  const handleToggleEnhancement = useCallback(async (step: number, description: string) => {
    if (!recipe || enhancingStep === step) return;

    // If instruction is already fetched, just toggle its visibility
    if (enhancedInstructions[step]) {
      setOpenEnhancements(prev => ({ ...prev, [step]: !prev[step] }));
      return;
    }

    // Fetch for the first time
    setEnhancingStep(step);
    try {
      const enhancedText = await enhanceInstruction(recipe.name, description);
      setEnhancedInstructions(prev => ({ ...prev, [step]: enhancedText }));
      setOpenEnhancements(prev => ({ ...prev, [step]: true })); // Show it automatically
    } catch (error: any) {
      toast.error("Enhancement Failed", { description: error.message || "Could not get enhanced instructions." });
    } finally {
      setEnhancingStep(null);
    }
  }, [recipe, enhancingStep, enhancedInstructions]);


  useEffect(() => {
    const fetchRecipe = async () => {
        if (!id) {
            setError("Recipe ID is missing.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        
        // Reset enhancement states
        setEnhancedInstructions({});
        setOpenEnhancements({});
        setEnhancingStep(null);
        setIsEstimating(false);

        try {
            // First check if we have the recipe in location state
            if (location.state?.recipe) {
                console.log("Loading recipe from location state:", location.state.recipe);
                setRecipe(location.state.recipe);
                setIsLoading(false);
                return;
            }
            
            // Otherwise fetch based on source
            let fetchedRecipe = null;
            const normalizedSource = source?.toUpperCase();
            
            console.log(`Fetching recipe with id: ${id} from source: ${normalizedSource}`);
            
            if (normalizedSource === 'KOBIRI') {
                fetchedRecipe = await getKobiriRecipeById(id);
                console.log("Fetched Kobiri recipe:", fetchedRecipe);
            } else if (normalizedSource === 'THEMEALDB') {
                fetchedRecipe = await getRecipeDetails(id);
                console.log("Fetched TheMealDB recipe:", fetchedRecipe);
            }

            if (fetchedRecipe) {
                setRecipe(fetchedRecipe);
                
                // Try to estimate times for non-Kobiri recipes
                if (fetchedRecipe.source !== 'KOBIRI' && (!fetchedRecipe.prepTime || fetchedRecipe.prepTime === 'N/A')) {
                    setIsEstimating(true);
                    try {
                        const times = await estimateRecipeTimes(
                            fetchedRecipe.name,
                            fetchedRecipe.ingredients,
                            fetchedRecipe.instructions
                        );
                        setRecipe(prev => prev ? {...prev, prepTime: times.prepTime, cookTime: times.cookTime} : null);
                    } catch (e) {
                        console.error("Could not estimate times:", e);
                    } finally {
                        setIsEstimating(false);
                    }
                }
            } else if (location.state?.title) {
                // Create a minimal recipe with the information we have
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
                toast.error("Could Not Load Full Recipe Details", { 
                    description: "We'll show you the basic information we have." 
                });
            } else {
                setError("Recipe not found. It may have been deleted or is temporarily unavailable.");
            }
        } catch (err: any) {
            const message = err.message || 'Failed to load recipe details.';
            setError(message);
            toast.error("Could Not Load Recipe", { description: message });
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    fetchRecipe();
  }, [source, id, location.state]);

  if (isLoading) return <RecipeDetailSkeleton />;
  if (error) {
    return (
        <div className="text-center py-10">
          <p className="text-destructive font-semibold text-lg">Oops! Something went wrong.</p>
          <p className="text-muted-foreground mt-2">{error}</p>
          <div className="mt-6">
            <BackButton />
          </div>
        </div>
    );
  }
  if (!recipe) return <p className="text-center text-muted-foreground py-10">Recipe details could not be loaded.</p>;

  const recipeSummary = {
      id: recipe.id,
      title: recipe.name,
      image: recipe.imageUrl,
      source: recipe.source,
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        <Card>
          <CardHeader className="flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                  {recipe.category && <Badge variant="secondary" className="mb-2">{recipe.category}</Badge>}
                  <CardTitle className="text-3xl sm:text-4xl font-extrabold">{recipe.name}</CardTitle>
                  <p className="mt-4 text-lg text-muted-foreground">{recipe.description}</p>
              </div>
              <div className="flex-shrink-0">
                  <SaveButton recipe={recipeSummary} />
              </div>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <img src={recipe.imageUrl} alt={recipe.name} className="w-full rounded-lg shadow-md aspect-[4/3] object-cover" />
                  <Card className="p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                          <p className="font-bold">{isEstimating && (!recipe.prepTime || recipe.prepTime === 'N/A') ? 'Estimating...' : recipe.prepTime || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">Prep Time</p>
                      </div>
                      <div>
                          <p className="font-bold">{isEstimating && (!recipe.cookTime || recipe.cookTime === 'N/A') ? 'Estimating...' : recipe.cookTime || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">Cook Time</p>
                      </div>
                      <div>
                          <p className="font-bold">{recipe.servings || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">Servings</p>
                      </div>
                      </div>
                      <div className="text-center mt-4 border-t pt-4">
                          <p className="font-bold">{recipe.difficulty || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">Difficulty</p>
                      </div>
                  </Card>
                   {isLoggedIn && (
                        <Button onClick={handleAddToList} disabled={isOnMarketList} className="w-full" size="lg">
                            <ShoppingCart className="w-5 h-5 mr-2" />
                            {isOnMarketList ? 'Ingredients on List' : 'Add to Market List'}
                        </Button>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">Ingredients</h2>
                    <ul className="space-y-3">
                      {recipe.ingredients.map((ing, index) => (
                        <li key={index} className="flex items-center">
                          <Checkbox id={`ing-${index}`} className="peer" />
                          <Label htmlFor={`ing-${index}`} className="ml-3 font-medium transition-colors peer-data-[state=checked]:line-through peer-data-[state=checked]:text-muted-foreground">{ing.amount} {ing.name}</Label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                      <h2 className="text-2xl font-bold border-b-2 border-primary pb-2">Instructions</h2>
                      {isSpeechApiSupported && recipe.instructions && recipe.instructions.length > 0 && (
                        <Button variant="outline" onClick={() => setIsGuidedCooking(true)} className="flex-shrink-0 w-full sm:w-auto">
                          <Mic className="w-4 h-4 mr-2" />
                          Start Guided Cooking
                        </Button>
                      )}
                    </div>
                    <ol className="space-y-6">
                      {recipe.instructions.map(inst => {
                        const isEnhanced = !!enhancedInstructions[inst.step];
                        const isEnhancementOpen = !!openEnhancements[inst.step];

                        return (
                          <li key={inst.step} className="flex items-start gap-4">
                            <span className="flex-shrink-0 grid place-items-center bg-primary text-primary-foreground font-bold w-8 h-8 rounded-full">{inst.step}</span>
                            <div className="flex-grow pt-1">
                                <p>{inst.description}</p>
                                <div className="mt-2">
                                    {enhancingStep === inst.step ? (
                                        <div className="flex items-center text-sm text-primary p-1">
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            <span>Enhancing...</span>
                                        </div>
                                    ) : (
                                      <>
                                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 px-2 py-1 h-auto" onClick={() => handleToggleEnhancement(inst.step, inst.description)}>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            <span>{isEnhanced ? (isEnhancementOpen ? 'Hide Details' : 'Show Details') : 'Enhance'}</span>
                                        </Button>
                                        {isEnhanced && isEnhancementOpen && (
                                          <div className="p-3 mt-2 border-l-4 border-secondary bg-secondary/10 rounded-r-md space-y-2">
                                              <p className="font-semibold text-secondary">Kọbiri Chef's Tips:</p>
                                              <p className="text-muted-foreground whitespace-pre-line text-sm">
                                                  {enhancedInstructions[inst.step]}
                                              </p>
                                          </div>
                                        )}
                                      </>
                                    )}
                                </div>
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
      {isGuidedCooking && recipe && <GuidedCookingModal recipe={recipe} onClose={() => setIsGuidedCooking(false)} />}
    </>
  );
};

export default RecipeDetailPage;
