import { supabase } from './supabase';

// This function tests the Supabase connection and table existence
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test connection by checking if we can access the tables
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Supabase key set:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    // Test if the favorites table exists and is accessible
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('favorites')
      .select('count')
      .limit(1);
    console.log('Favorites table check:', { data: favoritesData, error: favoritesError });
    
    // Test if the recipes table exists and is accessible
    const { data: recipesData, error: recipesError } = await supabase
      .from('recipes')
      .select('count')
      .limit(1);
    console.log('Recipes table check:', { data: recipesData, error: recipesError });
    
    // Test if we can get Supabase auth settings
    const { data: authSettings, error: authError } = await supabase.auth.getSession();
    console.log('Auth settings check:', { session: !!authSettings.session, error: authError });
    
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
} 