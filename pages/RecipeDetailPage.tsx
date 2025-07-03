import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMarketList } from '../hooks/useMarketList';
import { useRecipeDetail } from '../hooks/useRecipeDetail';
import RecipeDetailSkeleton from '../components/RecipeDetailSkeleton';
import SaveButton from '../components/SaveButton';
import BackButton from '../components/BackButton';
import GuidedCookingModal from '../components/GuidedCookingModal';
import RecipeInfoCard from '../components/RecipeInfoCard';
import IngredientsList from '../components/IngredientsList';
import InstructionsList from '../components/InstructionsList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Mic, ShoppingCart } from 'lucide-react';
import { useTitle } from '../hooks/useTitle';

const RecipeDetailPage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const { addRecipeIngredientsToList, isRecipeOnList } = useMarketList();
  const { recipe, isLoading, isEstimating, error } = useRecipeDetail();
  const [isGuidedCooking, setIsGuidedCooking] = React.useState(false);

  useTitle(recipe ? recipe.name : 'Recipe Detail');

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

  if (!recipe) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Recipe details could not be loaded.</p>
        <BackButton />
      </div>
    );
  }
  
  const recipeSummary = {
    id: recipe.id,
    title: recipe.name,
    image: recipe.imageUrl,
    source: recipe.source,
  };

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
                <RecipeInfoCard recipe={recipe} isEstimating={isEstimating} />
                {isLoggedIn && (
                  <Button onClick={handleAddToList} disabled={isOnMarketList} className="w-full" size="lg">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isOnMarketList ? 'Ingredients on List' : 'Add to Market List'}
                  </Button>
                )}
              </div>
              <div className="lg:col-span-2 space-y-8">
                <IngredientsList ingredients={recipe.ingredients} />
                <InstructionsList recipeName={recipe.name} instructions={recipe.instructions} />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
          <h3 className="text-xl font-semibold">Ready to cook?</h3>
          <p className="text-muted-foreground text-center sm:text-left">Try our hands-free, voice-guided cooking mode!</p>
          <Button onClick={() => setIsGuidedCooking(true)} disabled={!isSpeechApiSupported} size="lg">
            <Mic className="w-5 h-5 mr-2" />
            Start Guided Cooking
          </Button>
        </div>
        {!isSpeechApiSupported && <p className="text-xs text-center text-muted-foreground mt-2">Your browser does not support the speech API for guided cooking.</p>}
      </div>
      {isGuidedCooking && recipe && (
        <GuidedCookingModal
          recipe={recipe}
          onClose={() => setIsGuidedCooking(false)}
        />
      )}
    </>
  );
};

export default RecipeDetailPage;
