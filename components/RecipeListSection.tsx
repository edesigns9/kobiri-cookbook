import React from 'react';
import RecipeCard from './RecipeCard';
import type { RecipeSummary } from '../types';

interface RecipeListSectionProps {
  title: string;
  recipes: RecipeSummary[];
  emptyState: React.ReactNode;
}

const RecipeListSection: React.FC<RecipeListSectionProps> = ({ title, recipes, emptyState }) => {
  return (
    <section>
      <h2 className="text-2xl font-semibold border-b pb-2 mb-6">{title}</h2>
      {recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recipes.map(recipe => (
            <RecipeCard key={`${recipe.source}-${recipe.id}`} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {emptyState}
        </div>
      )}
    </section>
  );
};

export default RecipeListSection; 