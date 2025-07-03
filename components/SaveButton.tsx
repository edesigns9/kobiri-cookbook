import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { RecipeSummary } from '../types';
import { Bookmark } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface SaveButtonProps {
  recipe: RecipeSummary;
}

const SaveButton: React.FC<SaveButtonProps> = ({ recipe }) => {
  const { user, toggleFavorite, isFavorite } = useAuth();
  
  // Debug: Log recipe and user data when component renders
  useEffect(() => {
    console.log('SaveButton mounted for recipe:', recipe);
    console.log('User authenticated:', !!user);
  }, [recipe, user]);
  
  if (!user) {
    return null; // Don't show the button if not logged in
  }

  const saved = isFavorite(recipe.id, recipe.source);
  console.log(`Recipe ${recipe.id} saved status:`, saved);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Save button clicked for recipe:', recipe);
    try {
      toggleFavorite(recipe);
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      toast.error('Error saving recipe. See console for details.');
    }
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