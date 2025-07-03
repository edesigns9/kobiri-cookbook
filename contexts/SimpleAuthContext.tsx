import React, { createContext, useState, useContext } from 'react';
import { toast } from 'sonner';

// Simplified types
export interface User {
  id: string;
  email: string;
}

export interface FavoriteRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  source: 'KOBIRI' | 'THEMEALDB' | 'AI';
  title: string;
  image: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  favorites: FavoriteRecipe[];
  isLoggedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  toggleFavorite: (recipe: { id: string, title: string, image: string, source: 'KOBIRI' | 'THEMEALDB' | 'AI' }) => void;
  isFavorite: (recipeId: string | number, source: 'KOBIRI' | 'THEMEALDB' | 'AI') => boolean;
}

export const SimpleAuthContext = createContext<AuthContextType | undefined>(undefined);

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simplified auth methods
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login
      const mockUser = { id: '123', email };
      setUser(mockUser);
      toast.success('Welcome back!');
      
      // Load mock favorites
      setFavorites([
        {
          id: '1',
          user_id: '123',
          recipe_id: '1',
          source: 'KOBIRI',
          title: 'Jollof Rice',
          image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
        }
      ]);
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setFavorites([]);
    toast.success('You have been logged out');
  };

  const isFavorite = (recipeId: string | number, source: 'KOBIRI' | 'THEMEALDB' | 'AI') => {
    const compositeId = `${source}-${recipeId}`;
    return favorites.some(fav => `${fav.source}-${fav.recipe_id}` === compositeId);
  };

  const toggleFavorite = async (recipe: { id: string, title: string, image: string, source: 'KOBIRI' | 'THEMEALDB' | 'AI' }) => {
    if (!user) {
      toast.error('Please log in to save recipes.');
      return;
    }

    const compositeId = `${recipe.source}-${recipe.id}`;
    const existingFavorite = favorites.find(fav => `${fav.source}-${fav.recipe_id}` === compositeId);

    if (existingFavorite) {
      // Remove from favorites
      setFavorites(prev => prev.filter(f => f.id !== existingFavorite.id));
      toast.success(`Removed "${recipe.title}" from your cookbook.`);
    } else {
      // Add to favorites
      const newFavorite: FavoriteRecipe = {
        id: `fav-${Date.now()}`,
        user_id: user.id,
        recipe_id: recipe.id,
        source: recipe.source,
        title: recipe.title,
        image: recipe.image,
      };
      setFavorites(prev => [...prev, newFavorite]);
      toast.success(`Added "${recipe.title}" to your cookbook.`);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    favorites,
    signIn,
    signOut,
    toggleFavorite,
    isFavorite,
    isLoggedIn: !!user, 
  };

  return <SimpleAuthContext.Provider value={value}>{children}</SimpleAuthContext.Provider>;
};

// Custom hook to use the auth context
export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}; 