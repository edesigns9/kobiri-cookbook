import React from 'react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import type { RecipeIngredient } from '../types';

interface IngredientsListProps {
  ingredients: RecipeIngredient[];
}

const IngredientsList: React.FC<IngredientsListProps> = ({ ingredients }) => {
  if (!ingredients || ingredients.length === 0) {
    return <p className="text-muted-foreground">No ingredients listed.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">Ingredients</h2>
      <ul className="space-y-3">
        {ingredients.map((ing, index) => (
          <li key={index} className="flex items-center">
            <Checkbox id={`ing-${index}`} className="peer" />
            <Label htmlFor={`ing-${index}`} className="ml-3 font-medium transition-colors peer-data-[state=checked]:line-through peer-data-[state=checked]:text-muted-foreground">
              {ing.amount} {ing.name}
            </Label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IngredientsList; 