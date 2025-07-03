import React from 'react';
import { Link } from 'react-router-dom';
import type { RecipeSummary } from '../types';
import SaveButton from './SaveButton';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface RecipeCardProps {
  recipe: RecipeSummary;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  // Convert source to lowercase for URL path
  const sourceForUrl = recipe.source.toLowerCase();
  
  // Create the detail URL using the source and ID
  const detailUrl = `/recipe/${sourceForUrl}/${encodeURIComponent(recipe.id)}`;
  
  // Pass additional data through the link state to avoid API calls when possible
  // If we have full recipe data, pass it for any source type
  // For all recipes, pass title and image to show a minimal view if details can't be loaded
  const linkState = {
    title: recipe.title,
    image: recipe.image,
    ...(recipe.recipe ? { recipe: recipe.recipe } : {})
  };

  return (
    <Card className="overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 ease-in-out group w-full">
      <div className="relative">
        <Link to={detailUrl} state={linkState}>
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
        </Link>
        <div className="absolute top-2 right-2">
            <SaveButton recipe={recipe} />
        </div>
        {recipe.isCurated && (
            <div className="absolute top-2 left-2 z-10">
                <Badge variant="secondary">Kọbiri Curated</Badge>
            </div>
        )}
      </div>
      <CardContent className="p-4">
        {recipe.category && <p className="text-xs font-semibold text-primary uppercase tracking-wide">{recipe.category}</p>}
        <Link to={detailUrl} state={linkState}>
            <h3 className="text-lg font-bold mt-1 text-card-foreground group-hover:text-primary transition-colors line-clamp-2">{recipe.title}</h3>
        </Link>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;