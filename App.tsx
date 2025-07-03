import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import CookbookPage from './pages/CookbookPage';
import LoginPage from './pages/LoginPage';
import AIChefPage from './pages/AIChefPage';
import AddRecipePage from './pages/AddRecipePage';
import MarketListPage from './pages/MarketListPage';
import { testSupabaseConnection } from './lib/debug';

function App() {
  useEffect(() => {
    // Run Supabase connection test on startup
    testSupabaseConnection().then(success => {
      console.log('Supabase connection test completed. Success:', success);
    });
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/recipe/:source/:id" element={<RecipeDetailPage />} />
          <Route path="/cookbook" element={<CookbookPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ai-chef" element={<AIChefPage />} />
          <Route path="/add-recipe" element={<AddRecipePage />} />
          <Route path="/market-list" element={<MarketListPage />} />
        </Routes>
      </main>
      <footer className="bg-gray-100 dark:bg-gray-800 py-4 px-4 mt-8">
        <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Kọbiri - Your Global Cookbook</p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}

export default App;