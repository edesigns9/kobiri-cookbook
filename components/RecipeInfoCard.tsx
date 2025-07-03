import React from 'react';
import { Card } from './ui/card';
import type { Recipe } from '../types';

interface RecipeInfoCardProps {
  recipe: Recipe;
  isEstimating: boolean;
}

const RecipeInfoCard: React.FC<RecipeInfoCardProps> = ({ recipe, isEstimating }) => {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="font-bold">{isEstimating && (!recipe.prepTime || recipe.prepTime === 'N/A') ? '...' : recipe.prepTime || 'N/A'}</p>
          <p className="text-sm text-muted-foreground">Prep Time</p>
        </div>
        <div>
          <p className="font-bold">{isEstimating && (!recipe.cookTime || recipe.cookTime === 'N/A') ? '...' : recipe.cookTime || 'N/A'}</p>
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
  );
};

export default RecipeInfoCard; 