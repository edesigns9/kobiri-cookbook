import React from 'react';
import { useAuth } from '../hooks/useAuth';
import type { RecipeSummary } from '../types';
import { Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

interface SaveButtonProps {
  recipe: RecipeSummary;
}

const SaveButton: React.FC<SaveButtonProps> = ({ recipe }) => {
  const { user, toggleFavorite, isFavorite } = useAuth();
  
  if (!user) {
    return null; // Don't show the button if not logged in
  }

  const saved = isFavorite(recipe.id, recipe.source);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(recipe);
  };

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size="icon"
      title={saved ? 'Remove from Cookbook' : 'Save to Cookbook'}
      className="rounded-full bg-background/80 hover:bg-background"
    >
      <Bookmark className={cn(
          "w-5 h-5 transition-colors",
          saved ? 'text-secondary fill-secondary' : 'text-foreground'
      )} />
    </Button>
  );
};

export default SaveButton;