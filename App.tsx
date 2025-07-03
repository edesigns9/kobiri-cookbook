import React from 'react';
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

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/recipe/:source/:id" element={<RecipeDetailPage />} />
          <Route path="/cookbook" element={<CookbookPage />} />
          <Route path="/market-list" element={<MarketListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ai-chef" element={<AIChefPage />} />
          <Route path="/add-recipe" element={<AddRecipePage />} />
        </Routes>
      </main>
      
      <footer className="w-full text-center py-4 text-muted-foreground text-sm">
        <p>Kọbiri - Your Global Cookbook</p>
      </footer>
      <Toaster />
    </div>
  );
}

export default App;