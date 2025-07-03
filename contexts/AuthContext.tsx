import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { FavoriteRecipe, RecipeSummary } from '../types';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  favorites: FavoriteRecipe[];
  isLoggedIn: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<{ error: AuthError | null }>;
  toggleFavorite: (recipe: RecipeSummary) => void;
  isFavorite: (recipeId: string | number, source: 'KOBIRI' | 'THEMEALDB' | 'AI') => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async (userId: string): Promise<void> => {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Could not load your cookbook.');
      setFavorites([]);
    } else {
      setFavorites(data || []);
    }
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            throw error;
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchFavorites(session.user.id);
        }
      } catch (err: any) {
          console.error("Error getting session:", err);
          setError("Could not connect to the authentication service. Please check your Supabase credentials in the .env.local file and refresh.");
          toast.error("Authentication Error", { description: "Failed to connect to the server." });
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (_event === 'SIGNED_IN' && session?.user) {
          await fetchFavorites(session.user.id);
        }
        if (_event === 'SIGNED_OUT') {
          setFavorites([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchFavorites]);

  const signUp = (email: string, password: string) => supabase.auth.signUp({ email, password });
  const signInWithPassword = (email: string, password: string) => supabase.auth.signInWithPassword({ email, password });
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };
  const signOut = () => supabase.auth.signOut();

  const isFavorite = useCallback((recipeId: string | number, source: 'KOBIRI' | 'THEMEALDB' | 'AI') => {
    const compositeId = `${source}-${recipeId}`;
    return favorites.some(fav => `${fav.source}-${fav.recipe_id}` === compositeId);
  }, [favorites]);

  const toggleFavorite = useCallback(async (recipe: RecipeSummary): Promise<void> => {
    if (!user) {
      toast.error('Please log in to save recipes.');
      return;
    }

    const compositeId = `${recipe.source}-${recipe.id}`;
    const existingFavorite = favorites.find(fav => `${fav.source}-${fav.recipe_id}` === compositeId);

    if (existingFavorite) {
      // Remove from favorites
      const { error } = await supabase.from('favorites').delete().eq('id', existingFavorite.id);
      if (error) {
        toast.error('Could not remove from cookbook.');
        console.error('Error removing favorite:', error);
      } else {
        setFavorites(prev => prev.filter(f => f.id !== existingFavorite.id));
        toast.success(`Removed "${recipe.title}" from your cookbook.`);
      }
    } else {
      // Add to favorites
      const newFavorite = {
        user_id: user.id,
        recipe_id: String(recipe.id),
        source: recipe.source,
        title: recipe.title,
        image: recipe.image,
      };
      const { data, error } = await supabase.from('favorites').insert([newFavorite]).select().single();
      if (error) {
        toast.error('Could not save to cookbook.');
        console.error('Error adding favorite:', error);
      } else {
        setFavorites(prev => [...prev, data]);
        toast.success(`Added "${recipe.title}" to your cookbook.`);
      }
    }
  }, [user, favorites]);

  const value: AuthContextType = {
    session,
    user,
    isLoading,
    favorites,
    signUp,
    signInWithPassword,
    signInWithGoogle,
    signOut,
    toggleFavorite,
    isFavorite,
    isLoggedIn: !!user, 
  };
  
  if (error) {
      return (
          <div className="flex items-center justify-center h-screen">
              <div className="text-center p-8 bg-destructive/10 border border-destructive/50 rounded-lg max-w-md mx-4">
                  <h1 className="text-xl font-bold text-destructive">Application Error</h1>
                  <p className="mt-2 text-destructive/90">{error}</p>
              </div>
          </div>
      );
  }

  return <AuthContext.Provider value={value}>{!isLoading && children}</AuthContext.Provider>;
};
